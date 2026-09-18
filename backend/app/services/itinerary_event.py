from datetime import date

from sqlalchemy.orm import Session

from ..models import ItineraryItem


OUTDOOR_CATEGORIES = {
    "beach",
    "trek",
    "hiking",
    "sightseeing",
    "water_activity",
}


def find_weather_affected_items(
    db: Session,
    trip_id: int,
    event: str,
    target_date: date,
) -> list[ItineraryItem]:
    """Find itinerary activities that may be affected by a weather event."""

    if event != "RAIN_EXPECTED":
        return []

    items = (
        db.query(ItineraryItem)
        .filter(
            ItineraryItem.trip_id == trip_id,
            ItineraryItem.date == target_date,
            ItineraryItem.status == "ACTIVE",
        )
        .all()
    )

    return [
        item
        for item in items
        if isinstance(item.category, str)
        and item.category.lower() in OUTDOOR_CATEGORIES
    ]