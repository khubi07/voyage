from datetime import date
from typing import cast

from ..database import SessionLocal
from ..models import Trip
from .weather import get_weather
from .event_detector import detect_weather_event
from .itinerary_event import find_weather_affected_items
from .notification import NotificationService


def run_weather_job():
    """Check upcoming trips for weather conditions affecting itineraries."""

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

            if not event:
                continue

            affected_items = find_weather_affected_items(
                db=db,
                trip_id=cast(int, trip.id),
                event=event,
                target_date=date.today(),
            )

            for item in affected_items:
                message = (
                    f"Weather alert for your trip: "
                    f"rain is expected and may affect "
                    f"your activity '{item.title}'."
                )

                notification_service.send(
                    recipient=trip.guest.phone,
                    message=message,
                )

    finally:
        db.close()