from datetime import date, time

from .database import SessionLocal
from .models import Guest, Property, Booking, Trip, ItineraryItem


db = SessionLocal()

guest = Guest(
    name="Rahul",
    phone="+919999999999",
    preferences=["vegetarian", "quiet places"],
)

property = Property(
    name="Palm Grove Villa",
    location="Candolim, Goa",
    latitude=15.517,
    longitude=73.807,
    check_in_time=time(14, 0),
    check_out_time=time(11, 0),
    parking_info="Private parking available",
)

db.add_all([guest, property])
db.commit()

booking = Booking(
    booking_reference="B001",
    guest_id=guest.id,
    property_id=property.id,
    check_in=date(2026, 9, 20),
    check_out=date(2026, 9, 23),
    number_of_guests=2,
)

db.add(booking)
db.commit()

trip = Trip(
    trip_reference="T001",
    guest_id=guest.id,
    booking_id=booking.id,
    status="UPCOMING",
)

db.add(trip)
db.commit()

item = ItineraryItem(
    trip_id=trip.id,
    date=date(2026, 9, 21),
    start_time=time(10, 0),
    end_time=time(13, 0),
    title="Baga Beach",
    location="Baga, Goa",
    category="beach",
    status="ACTIVE",
)

db.add(item)
db.commit()

db.close()

print("Sample data inserted successfully!")