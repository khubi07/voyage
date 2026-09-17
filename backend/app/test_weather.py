from .services.weather import get_weather


weather = get_weather(
    latitude=15.543,
    longitude=73.755,
)

print(weather)