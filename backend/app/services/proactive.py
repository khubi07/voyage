"""
Event-driven proactive assistance (Phase 7 in the project spec).

Integration contract with the backend (Khubi):
- The backend detects meaningful events (e.g. checking the weather API,
  deciding a change is significant) and identifies which itinerary item is
  affected. That is backend responsibility -- listed explicitly under
  "Weather Event Detection" in the infra/agent split.
- This module receives an already-identified event + affected itinerary
  item and is responsible only for the agent-side reasoning: why it
  matters, what alternatives fit the guest's preferences, and whether the
  suggested change needs guest confirmation.

This is intentionally a separate entry point from run_agent(): it is not
triggered by a guest message, but by the backend's scheduler/event layer.
It reuses the same retrieval engine and LLM client so the "brain" stays in
one place.
"""

from __future__ import annotations

from typing import Optional

from ..schemas import AgentResponse, ItineraryItemContext, TripContext
from . import llm_client
from .actions import SUGGEST_ITINERARY_CHANGE
from .retrieval import get_retriever

# Maps a backend-generated event type to the kind of alternative we should
# look for. Unknown event types fall back to "indoor" as a safe default.
EVENT_ALTERNATIVE_TAG = {
    "RAIN_EXPECTED": "indoor",
}

EVENT_DESCRIPTIONS = {
    "RAIN_EXPECTED": "rain is expected",
}


def _format_time_range(item: ItineraryItemContext) -> str:
    if item.start_time and item.end_time:
        return f"{item.start_time.strftime('%H:%M')}–{item.end_time.strftime('%H:%M')}"
    return ""


def handle_proactive_event(
    event_type: str,
    affected_item: ItineraryItemContext,
    trip_context: TripContext,
) -> AgentResponse:
    """Main entry point for backend-triggered proactive events.

    The backend has already decided this event is worth surfacing and which
    itinerary item it affects -- this function only handles the reasoning:
    retrieve grounded alternatives, personalize using guest preferences, and
    produce a response the notification layer can send as-is.

    Never raises: degrades to a safe, honest response on internal errors.
    """

    try:
        retriever = get_retriever()
        area = trip_context.property.location.split(",")[0]
        alt_tag = EVENT_ALTERNATIVE_TAG.get(event_type, "indoor")

        vibe_terms = [
            str(p) for p in (trip_context.guest.preferences or [])
        ]
        query_text = f"{alt_tag} alternative {' '.join(vibe_terms)}".strip()

        # Don't suggest the very place being rained out as its own "alternative"
        # if it happens to exist in our dataset under the same name.
        exclude_ids = {
            doc.id for doc in retriever.documents
            if doc.name.lower() == affected_item.title.lower()
        }

        retrieval = retriever.search(
            query_text,
            top_k=2,
            filters={
                "area": area,
                "tag": alt_tag,
                "exclude_ids": exclude_ids,
                # "alternatives" must be actual visitable places, not area
                # descriptors or transport listings.
                "exclude_categories": {"area", "transport"},
            },
        )

        recommendations = [
            {
                "name": r.document.name,
                "category": r.document.category,
                "area": r.document.area,
                "tags": r.document.tags,
                "description": r.document.description,
            }
            for r in retrieval.results
        ]

        event_desc = EVENT_DESCRIPTIONS.get(event_type, event_type.replace("_", " ").lower())
        time_range = _format_time_range(affected_item)
        time_note = f" ({time_range})" if time_range else ""

        if recommendations:
            alt_lines = "\n".join(f"- {r['name']} ({r['area']})" for r in recommendations)
            alt_intro = "Here are a couple of nearby alternatives."
        else:
            alt_lines = ""
            alt_intro = "I couldn't find a great alternative nearby yet, but wanted to give you a heads-up."

        system_prompt = (
            "You are VOYAGE, a proactive trip concierge. Write a short, friendly "
            "heads-up message (2-3 sentences) about a plan-affecting event. Only "
            "mention alternatives from the list given -- never invent one. "
            "End by asking if the guest wants the plan updated."
        )
        user_prompt = (
            f"Event: {event_desc}, affecting the guest's planned "
            f"'{affected_item.title}'{time_note} at {affected_item.location} "
            f"on {affected_item.date}.\n"
            f"Guest preferences: {', '.join(vibe_terms) if vibe_terms else 'none on file'}.\n"
            f"{alt_intro}\n{alt_lines}\n\n"
            "Write the proactive message."
        )

        message = llm_client.generate_message(system_prompt, user_prompt)
        if message == user_prompt:
            names = ", ".join(r["name"] for r in recommendations) or "no direct alternative found"
            message = (
                f"Heads up! {event_desc.capitalize()} during your "
                f"'{affected_item.title}' plan{time_note}. {alt_intro} {names}. "
                "Would you like me to update your itinerary?"
            )

        return AgentResponse(
            message=message,
            recommendations=recommendations,
            action=SUGGEST_ITINERARY_CHANGE,
            needs_confirmation=True,
        )

    except Exception:
        return AgentResponse(
            message=(
                f"Heads up -- there's a change ({event_type}) that may affect your "
                f"'{affected_item.title}' plan. I couldn't pull alternatives right "
                "now, but wanted to flag it."
            ),
            recommendations=[],
            action=SUGGEST_ITINERARY_CHANGE,
            needs_confirmation=True,
        )
