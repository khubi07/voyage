from datetime import date, timedelta

from sqlalchemy.orm import Session

from ..models import Trip
from .notification import NotificationService

def check_checkin_reminders(db: Session):
    """
    Find trips with check-in tomorrow and prepare a reminder.

    Notification delivery will be added later.
    """

    tomorrow = date.today() + timedelta(days=1)
    notification_service = NotificationService()
    trips = (
        db.query(Trip)
        .filter(
            Trip.status == "UPCOMING",
            Trip.booking.has(check_in=tomorrow),
        )
        .all()
    )

    for trip in trips:
        guest = trip.guest
        property_data = trip.booking.property

        message = (
            f"Hi {guest.name}! Your stay at "
            f"{property_data.name} begins tomorrow at "
            f"{property_data.check_in_time.strftime('%I:%M %p')}."
        )

        notification_service.send(
    recipient=guest.phone,
    message=message,
)