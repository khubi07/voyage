from .services.weather import get_weather
from .services.event_detector import detect_weather_event


weather = get_weather(
    latitude=15.543,
    longitude=73.755,
)

event = detect_weather_event(weather)

print("Detected event:", event)
