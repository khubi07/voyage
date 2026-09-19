from datetime import date
from typing import cast

from ..database import SessionLocal
from ..models import Trip
from .context_manager import get_trip_context
from .event_detector import detect_weather_event
from .itinerary_event import find_weather_affected_items
from .notification import NotificationService
from .proactive import handle_proactive_event
from .weather import get_weather


def run_weather_job():
    """Check upcoming trips and proactively handle weather events."""
    db = SessionLocal()
    notification_service = NotificationService()

    try:
        trips = (
            db.query(Trip)
            .filter(Trip.status == "UPCOMING")
            .all()
        )

        for trip in trips:
            property_data = trip.booking.property

            # Skip properties without coordinates.
            if (
                property_data.latitude is None
                or property_data.longitude is None
            ):
                continue

            weather = get_weather(
                latitude=property_data.latitude,
                longitude=property_data.longitude,
            )

            event = detect_weather_event(weather)
            print(f"[WEATHER JOB] Event detected: {event}")
            if not event:
                continue

            affected_items = find_weather_affected_items(
                db=db,
                trip_id=cast(int, trip.id),
                event=event,
                target_date=date.today(),
            )
            print(
                f"[WEATHER JOB] Affected items: "
                f"{[item.title for item in affected_items]}"
            )

            if not affected_items:
                continue

            # Build the complete context once for this trip.
            trip_context = get_trip_context(
                db=db,
                trip_id=cast(int, trip.id),
            )
            print("[WEATHER JOB] Trip context built")

            for item in affected_items:
                # Convert the SQLAlchemy itinerary item into the
                # schema object expected by the proactive agent.
                affected_item = next(
                    (
                        context_item
                        for context_item in trip_context.itinerary
                        if context_item.item_id == item.id
                    ),
                    None,
                )

                if affected_item is None:
                    print(f"[WEATHER JOB] Context item not found: {item.id}")
                    continue

                print(
                    f"[WEATHER JOB] Calling proactive agent for: "
                    f"{affected_item.title}"
                )

                response = handle_proactive_event(
                    event_type=event,
                    affected_item=affected_item,
                    trip_context=trip_context,
                )
                print("[WEATHER JOB] Proactive agent returned")

                notification_service.send(
                    recipient=trip.guest.phone,
                    message=response.message,
                )

    finally:
        db.close()