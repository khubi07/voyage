from apscheduler.schedulers.background import BackgroundScheduler

from ..database import SessionLocal
from .reminder import check_checkin_reminders


# Create one scheduler instance for the application.
scheduler = BackgroundScheduler()


def run_checkin_job():
    """Create a database session and run the check-in reminder check."""

    db = SessionLocal()

    try:
        check_checkin_reminders(db)
    finally:
        db.close()


def start_scheduler():
    """Start the scheduler and register recurring jobs."""

    if scheduler.running:
        return

    scheduler.add_job(
        run_checkin_job,
        trigger="interval",
        minutes=1,
        id="checkin_reminder",
        replace_existing=True,
    )

    scheduler.start()


def stop_scheduler():
    """Gracefully stop the scheduler."""

    if scheduler.running:
        scheduler.shutdown()