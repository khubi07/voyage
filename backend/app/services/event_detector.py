def detect_weather_event(weather: dict) -> str | None:
    """Convert raw weather data into a meaningful application event."""

    daily = weather.get("daily", {})

    rain_probability = daily.get(
        "precipitation_probability_max",
        [0],
    )[0]

    if rain_probability >= 70:
        return "RAIN_EXPECTED"

    return None