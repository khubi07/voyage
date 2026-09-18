from datetime import date

from .database import SessionLocal
from .services.itinerary_event import find_weather_affected_items


db = SessionLocal()

affected_items = find_weather_affected_items(
    db=db,
    trip_id=1,
    event="RAIN_EXPECTED",
    target_date=date(2026, 9, 21),
)

for item in affected_items:
    print(
        f"Affected activity: {item.title} "
        f"({item.category})"
    )

db.close()