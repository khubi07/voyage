import requests


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_weather(latitude: float, longitude: float) -> dict:
    """Fetch current weather and today's forecast for a location."""

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,precipitation,rain,weather_code",
        "daily": "precipitation_probability_max,weather_code",
        "timezone": "auto",
        "forecast_days": 1,
    }

    response = requests.get(
        OPEN_METEO_URL,
        params=params,
        timeout=10,
    )
    print("REQUEST PARAMS:", params)
    response.raise_for_status()

    return response.json()