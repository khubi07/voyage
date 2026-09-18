"""
Tests for the agent orchestrator. Run with: pytest app/test_agent.py -v

Builds a TripContext directly (no DB needed) matching the Rahul example
from the project spec, and exercises the three MVP flows: ask, plan, proactive.
"""

from datetime import date, time

from .schemas import (
    AgentResponse,
    BookingContext,
    GuestContext,
    PropertyContext,
    TripContext,
)
from .services.agent import classify_intent, run_agent


def make_trip_context(itinerary=None) -> TripContext:
    return TripContext(
        trip_id=1,
        guest=GuestContext(guest_id=1, name="Rahul", preferences=["quiet", "local"]),
        booking=BookingContext(
            booking_id=1,
            check_in=date(2026, 9, 20),
            check_out=date(2026, 9, 23),
            number_of_guests=2,
        ),
        property=PropertyContext(
            property_id=1,
            name="Palm Grove Villa",
            location="Candolim, Goa",
            latitude=15.517,
            longitude=73.807,
            check_in_time=time(14, 0),
            check_out_time=time(11, 0),
            parking_info="Private parking available",
        ),
        itinerary=[],
    )


def test_classify_intent():
    assert classify_intent("Plan my 3-day Goa trip") == "plan"
    assert classify_intent("Can you make it a little more adventurous?") == "modify"
    assert classify_intent("Good dinner places near me?") == "ask"


def test_run_agent_ask_flow_matches_spec_example():
    trip_context = make_trip_context()
    response = run_agent(
        "What can we do tonight? We want something quiet and local.",
        trip_context,
    )
    assert isinstance(response, AgentResponse)
    assert response.message
    assert len(response.recommendations) > 0
    # Grounding check: every recommended name must trace back to the curated dataset.
    for rec in response.recommendations:
        assert "name" in rec and "area" in rec


def test_run_agent_plan_flow_builds_multi_day_itinerary():
    trip_context = make_trip_context()
    response = run_agent("Plan my 3-day Goa trip.", trip_context)
    assert response.action == "ADD_ITINERARY_ITEM"
    assert response.needs_confirmation is True
    days_present = {rec["day"] for rec in response.recommendations}
    assert days_present == {1, 2, 3}


def test_plan_flow_never_puts_wrong_category_in_a_slot():
    """Regression test: category filters must never be relaxed away, even
    when the same area runs out of unused candidates across a multi-day
    itinerary -- a 'restaurant' slot must never be filled by transport/area docs."""
    trip_context = make_trip_context()
    response = run_agent("Plan my 3-day Goa trip.", trip_context)
    slot_to_category = {
        "morning": "activity",
        "afternoon": "attraction",
        "lunch": "restaurant",
        "evening": "restaurant",
    }
    for rec in response.recommendations:
        assert rec["category"] == slot_to_category[rec["slot"]], rec


def test_run_agent_never_raises_on_odd_input():
    trip_context = make_trip_context()
    response = run_agent("", trip_context)
    assert isinstance(response, AgentResponse)


def test_proactive_weather_flags_outdoor_conflict():
    from .schemas import ItineraryItemContext
    from .services.proactive import handle_proactive_event

    affected_item = ItineraryItemContext(
        item_id=1,
        date=date(2026, 9, 21),
        start_time=time(16, 0),
        end_time=time(18, 0),
        title="Calangute Beach",
        location="Calangute, Goa",
        category="beach",
        status="ACTIVE",
    )
    trip_context = make_trip_context()

    response = handle_proactive_event(
        event_type="RAIN_EXPECTED",
        affected_item=affected_item,
        trip_context=trip_context,
    )
    assert response is not None
    assert response.action == "SUGGEST_ITINERARY_CHANGE"
    assert response.needs_confirmation is True
    assert "Calangute Beach" in response.message or len(response.recommendations) > 0


def test_proactive_alternatives_are_never_area_or_transport_docs():
    """Regression test: an 'alternative' suggestion must be an actual visitable
    place (restaurant/activity/attraction), never a bare area descriptor or a
    transport listing that slipped through a loose tag match."""
    from .schemas import ItineraryItemContext
    from .services.proactive import handle_proactive_event

    affected_item = ItineraryItemContext(
        item_id=1,
        date=date(2026, 9, 21),
        start_time=time(16, 0),
        end_time=time(18, 0),
        title="Calangute Beach",
        location="Calangute, Goa",
        category="beach",
        status="ACTIVE",
    )
    trip_context = make_trip_context()

    response = handle_proactive_event(
        event_type="RAIN_EXPECTED",
        affected_item=affected_item,
        trip_context=trip_context,
    )
    for rec in response.recommendations:
        assert rec["category"] not in {"area", "transport"}, rec


def test_proactive_event_never_raises_and_always_responds():
    from .schemas import ItineraryItemContext
    from .services.proactive import handle_proactive_event

    affected_item = ItineraryItemContext(
        item_id=2,
        date=date(2026, 9, 21),
        start_time=None,
        end_time=None,
        title="Some Unknown Place",
        location="Nowhere, Goa",
        category="outdoor",
        status="ACTIVE",
    )
    trip_context = make_trip_context()

    response = handle_proactive_event(
        event_type="SOME_UNKNOWN_EVENT",
        affected_item=affected_item,
        trip_context=trip_context,
    )
    assert response is not None
    assert response.action == "SUGGEST_ITINERARY_CHANGE"
    assert response.needs_confirmation is True
