from .database import Base, engine
from .models import Guest, Property, Booking, Trip, ItineraryItem

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")