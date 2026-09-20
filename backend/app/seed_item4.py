from datetime import date, time

from .database import SessionLocal
from .models import Trip, ItineraryItem


db = SessionLocal()

try:
    trip = db.query(Trip).filter(
        Trip.trip_reference == "T002"
    ).first()

    if not trip:
        raise ValueError("Trip T002 not found")

    item3 = ItineraryItem(
        trip_id=trip.id,
        date=date(2026, 9, 20),
        start_time=time(16, 0),
        end_time=time(18, 0),
        title="Calangute Beach",
        location="Calangute, Goa",
        category="beach",
        status="ACTIVE",
    )

    db.add(item3)
    db.commit()

    print("Itinerary item added successfully.")

finally:
    db.close()