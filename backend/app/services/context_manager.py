from sqlalchemy.orm import Session
from typing import cast

from ..models import Trip
from ..schemas import (
    TripContext,
    GuestContext,
    BookingContext,
    PropertyContext,
    ItineraryItemContext,
)


def get_trip_context(db: Session, trip_id: int) -> TripContext:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise ValueError("Trip not found")

    booking = trip.booking
    guest = trip.guest
    property_data = booking.property

    itinerary = [
        ItineraryItemContext(
            item_id=item.id,
            date=item.date,
            start_time=item.start_time,
            end_time=item.end_time,
            title=item.title,
            location=item.location,
            category=item.category,
            status=item.status,
        )
        for item in trip.itinerary_items
    ]

    return TripContext(
        trip_id=cast(int, trip.id),

        guest=GuestContext(
            guest_id=guest.id,
            name=guest.name,
            preferences=guest.preferences or [],
        ),

        booking=BookingContext(
            booking_id=booking.id,
            check_in=booking.check_in,
            check_out=booking.check_out,
            number_of_guests=booking.number_of_guests,
        ),

        property=PropertyContext(
            property_id=property_data.id,
            name=property_data.name,
            location=property_data.location,
            latitude=property_data.latitude,
            longitude=property_data.longitude,
            check_in_time=property_data.check_in_time,
            check_out_time=property_data.check_out_time,
            parking_info=property_data.parking_info,
        ),

        itinerary=itinerary,
    )