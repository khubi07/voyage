_notified_events: set[str] = set()
_notifications: dict[int, list[dict]] = {}


def has_been_notified(event_key: str) -> bool:
    return event_key in _notified_events


def mark_as_notified(event_key: str) -> None:
    _notified_events.add(event_key)


def add_notification(trip_id: int, message: str) -> None:
    _notifications.setdefault(trip_id, []).append(
        {
            "message": message,
            "read": False,
        }
    )


def get_notifications(trip_id: int) -> list[dict]:
    return _notifications.get(trip_id, [])