class NotificationService:
    """Handles delivery of notifications to guests."""

    def send(self, recipient: str, message: str):
        """Send a notification to the given recipient."""

        # Temporary implementation for local development.
        print(f"[NOTIFICATION] To: {recipient}")
        print(f"[NOTIFICATION] {message}")