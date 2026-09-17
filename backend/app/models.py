from sqlalchemy import Column, Integer, String, Float, Time, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship

from .database import Base


# Guest
class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    preferences = Column(JSON, default=list)


# Property
class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    check_in_time = Column(Time, nullable=False)
    check_out_time = Column(Time, nullable=False)
    parking_info = Column(String, nullable=True)


# Booking
class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String, unique=True, nullable=False)

    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)

    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    number_of_guests = Column(Integer, nullable=False)

    guest = relationship("Guest")
    property = relationship("Property")


# Trip
class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    trip_reference = Column(String, unique=True, nullable=False)

    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)

    status = Column(String, nullable=False, default="UPCOMING")

    guest = relationship("Guest")
    booking = relationship("Booking")
    itinerary_items = relationship(
        "ItineraryItem",
        back_populates="trip",
        cascade="all, delete-orphan"
    )


# ItineraryItem
class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)

    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)

    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)

    title = Column(String, nullable=False)
    location = Column(String, nullable=False)
    category = Column(String, nullable=True)
    status = Column(String, nullable=False, default="ACTIVE")

    trip = relationship("Trip", back_populates="itinerary_items")