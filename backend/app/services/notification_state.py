_notified_events: set[str] = set()


def has_been_notified(event_key: str) -> bool:
    return event_key in _notified_events


def mark_as_notified(event_key: str) -> None:
    _notified_events.add(event_key)