"""
The AI agent / orchestrator (Person 1 side of VOYAGE).

This module is the "brain": given a guest query and their TripContext, it
decides what's needed (retrieval? clarification? a full itinerary?), pulls
grounded candidates from the local Goa knowledge base, and produces a
response. The LLM is used only for phrasing -- it never chooses which
places to recommend; that is always decided by retrieval.py in code.

RETRIEVE -> REASON -> VALIDATE -> RESPOND
- RETRIEVE : retrieval.HybridRetriever (BM25 + semantic + RRF)
- REASON   : intent classification + slot planning below
- VALIDATE : `recommendations` is always built from retrieved Documents,
             never parsed out of LLM text, so it cannot contain invented
             places. The LLM is instructed to reference only the supplied
             candidates.
- RESPOND  : llm_client.generate_message produces the natural-language text
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Optional

from ..schemas import AgentResponse, TripContext
from . import llm_client
from .actions import ADD_ITINERARY_ITEM
from .retrieval import HybridRetriever, RetrievalResponse, get_retriever

VIBE_KEYWORDS = [
    "quiet", "local", "authentic", "lively", "romantic", "family",
    "budget", "cultural", "scenic", "adventurous", "trendy", "indoor",
    "outdoor", "beachfront", "nightlife",
]

CATEGORY_KEYWORDS = {
    "restaurant": ["dinner", "lunch", "breakfast", "eat", "food", "restaurant", "cafe", "coffee"],
    "activity": ["do", "activity", "adventure", "water sport", "kayak", "tour", "workshop"],
    "attraction": ["see", "visit", "attraction", "fort", "museum", "church", "sightseeing"],
    "transport": ["taxi", "bus", "scooter", "bike", "transport", "get around", "ferry"],
}

PLAN_KEYWORDS = ["plan", "itinerary", "day trip", "schedule", "days in", "full trip"]
MODIFY_KEYWORDS = ["instead", "more", "less", "different", "change", "adjust", "another"]

LOW_CONFIDENCE_MESSAGE = (
    "I couldn't find a strong local match for that yet. Could you tell me a "
    "bit more -- for example the type of place, or roughly which area?"
)


def classify_intent(query: str) -> str:
    q = query.lower()
    if any(kw in q for kw in PLAN_KEYWORDS):
        return "plan"
    if any(kw in q for kw in MODIFY_KEYWORDS):
        return "modify"
    return "ask"


def _infer_category(query: str) -> Optional[str]:
    q = query.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            return category
    return None


def _extract_vibe_terms(query: str, guest_preferences: list) -> list[str]:
    q = query.lower()
    found = [v for v in VIBE_KEYWORDS if v in q]
    # Fold in guest preferences too (light personalization signal).
    for pref in guest_preferences or []:
        pref_l = str(pref).lower()
        if pref_l in VIBE_KEYWORDS and pref_l not in found:
            found.append(pref_l)
    return found


def _doc_to_recommendation(doc, extra: Optional[dict] = None) -> dict:
    rec = {
        "name": doc.name,
        "category": doc.category,
        "area": doc.area,
        "tags": doc.tags,
        "price": doc.price,
        "description": doc.description,
    }
    if extra:
        rec.update(extra)
    return rec


def _build_ask_response(
    query: str, trip_context: TripContext, retriever: HybridRetriever
) -> AgentResponse:
    category = _infer_category(query)
    vibe_terms = _extract_vibe_terms(query, trip_context.guest.preferences)
    augmented_query = " ".join([query] + vibe_terms)

    retrieval = retriever.search(
        augmented_query,
        top_k=3,
        filters={
            "area": trip_context.property.location.split(",")[0],
            "category": category,
            # "area" docs are neighborhood descriptors, not recommendable
            # places -- never surface them as a direct recommendation.
            "exclude_categories": {"area"},
        },
    )

    if retrieval.is_low_confidence:
        return AgentResponse(
            message=LOW_CONFIDENCE_MESSAGE,
            recommendations=[],
            action=None,
            needs_confirmation=False,
        )

    recommendations = [_doc_to_recommendation(r.document) for r in retrieval.results]
    candidate_lines = "\n".join(
        f"- {r.document.name} ({r.document.area}): {r.document.description}"
        for r in retrieval.results
    )

    system_prompt = (
        "You are VOYAGE, a warm and concise trip concierge for a guest staying "
        "at a Wayzyy property. Only recommend places from the candidate list "
        "given to you -- never invent a place. Keep the reply to 2-3 sentences."
    )
    user_prompt = (
        f"Guest is staying at {trip_context.property.name}, {trip_context.property.location}.\n"
        f"Guest asked: \"{query}\"\n\n"
        f"Candidates (recommend only from this list):\n{candidate_lines}\n\n"
        "Write a short, friendly reply mentioning these options."
    )

    message = llm_client.generate_message(system_prompt, user_prompt)
    if message == user_prompt:
        # Offline fallback path (no live LLM configured): build a clean
        # deterministic sentence instead of dumping the raw prompt.
        names = ", ".join(r.document.name for r in retrieval.results)
        message = f"Here are a few options near {trip_context.property.location}: {names}."

    return AgentResponse(
        message=message,
        recommendations=recommendations,
        action=None,
        needs_confirmation=False,
    )


def _trip_duration_days(trip_context: TripContext) -> int:
    delta = (trip_context.booking.check_out - trip_context.booking.check_in).days
    return max(1, min(delta, 5))


def _build_plan_response(
    query: str, trip_context: TripContext, retriever: HybridRetriever
) -> AgentResponse:
    num_days = _trip_duration_days(trip_context)
    area = trip_context.property.location.split(",")[0]
    vibe_terms = _extract_vibe_terms(query, trip_context.guest.preferences)
    vibe_query = " ".join(vibe_terms) if vibe_terms else "recommended"

    slots = [
        ("morning", "activity"),
        ("lunch", "restaurant"),
        ("afternoon", "attraction"),
        ("evening", "restaurant"),
    ]

    used_ids: set[str] = set()
    itinerary: list[dict] = []
    current_date = trip_context.booking.check_in

    for day_num in range(1, num_days + 1):
        for slot_name, category in slots:
            retrieval = retriever.search(
                f"{vibe_query} {slot_name}",
                top_k=1,
                filters={"area": area, "category": category, "exclude_ids": used_ids},
            )
            if retrieval.results:
                doc = retrieval.results[0].document
                used_ids.add(doc.id)
                itinerary.append(
                    _doc_to_recommendation(
                        doc,
                        extra={
                            "day": day_num,
                            "date": str(current_date),
                            "slot": slot_name,
                        },
                    )
                )
        current_date = current_date + timedelta(days=1)

    if not itinerary:
        return AgentResponse(
            message=LOW_CONFIDENCE_MESSAGE,
            recommendations=[],
            action=None,
            needs_confirmation=False,
        )

    summary_lines = "\n".join(
        f"Day {item['day']} {item['slot']}: {item['name']} ({item['area']})"
        for item in itinerary
    )

    system_prompt = (
        "You are VOYAGE, a trip concierge. Summarize the given day-by-day "
        "itinerary warmly and briefly (3-4 sentences). Only mention places "
        "from the itinerary provided -- never invent one."
    )
    user_prompt = (
        f"Guest is staying at {trip_context.property.name}, {trip_context.property.location} "
        f"for {num_days} day(s).\nGuest asked: \"{query}\"\n\n"
        f"Proposed itinerary:\n{summary_lines}\n\n"
        "Summarize this itinerary and ask if they'd like to confirm it."
    )

    message = llm_client.generate_message(system_prompt, user_prompt)
    if message == user_prompt:
        message = (
            f"Here's a {num_days}-day plan for your stay at {trip_context.property.name}:\n"
            f"{summary_lines}\nWould you like me to confirm this itinerary?"
        )

    return AgentResponse(
        message=message,
        recommendations=itinerary,
        action=ADD_ITINERARY_ITEM,
        needs_confirmation=True,
    )


def run_agent(query: str, trip_context: TripContext) -> AgentResponse:
    """Main entry point matching the contract expected by services/agent_client.py.

    Never raises: any unexpected internal error degrades to a safe, honest
    response rather than propagating a 500 up through the API.
    """

    try:
        retriever = get_retriever()
        intent = classify_intent(query)

        if intent == "plan":
            return _build_plan_response(query, trip_context, retriever)

        # "modify" is handled the same retrieval-grounded way as "ask" --
        # the vibe terms extracted from the modification phrase (e.g.
        # "more adventurous") reweight the query, and trip context still
        # anchors the location/area filter.
        return _build_ask_response(query, trip_context, retriever)

    except Exception:
        return AgentResponse(
            message=(
                "Sorry, I ran into an issue finding that for you -- "
                "could you try rephrasing your question?"
            ),
            recommendations=[],
            action=None,
            needs_confirmation=False,
        )
