from datetime import date, time
from pydantic import BaseModel


class GuestContext(BaseModel):
    guest_id: int
    name: str
    preferences: list


class BookingContext(BaseModel):
    booking_id: int
    check_in: date
    check_out: date
    number_of_guests: int


class PropertyContext(BaseModel):
    property_id: int
    name: str
    location: str
    latitude: float | None
    longitude: float | None
    check_in_time: time
    check_out_time: time
    parking_info: str | None


class ItineraryItemContext(BaseModel):
    item_id: int
    date: date
    start_time: time | None
    end_time: time | None
    title: str
    location: str
    category: str | None
    status: str


class TripContext(BaseModel):
    trip_id: int
    guest: GuestContext
    booking: BookingContext
    property: PropertyContext
    itinerary: list[ItineraryItemContext]

class ChatRequest(BaseModel): #what our backend receives
    trip_id: int
    query: str


class AgentResponse(BaseModel): #what agent returns:
    message: str
    recommendations: list = []
    action: str | None = None
    needs_confirmation: bool = False