"""Weather service orchestrating provider queries and location resolution."""
from __future__ import annotations

from app.schemas.weather import WeatherResponse
from app.services.weather.adapter import OpenMeteoWeatherAdapter, WeatherAdapter

# Authoritative coordinates for popular Odisha hubs & regions
HUB_COORDINATES: dict[str, tuple[float, float]] = {
    "bhubaneswar": (20.2961, 85.8245),
    "puri": (19.8135, 85.8312),
    "konark": (19.8876, 86.0945),
    "cuttack": (20.4625, 85.8828),
    "chilika": (19.7083, 85.3206),
    "sambalpur": (21.4669, 83.9812),
    "koraput": (18.8135, 82.7117),
    "rourkela": (22.2604, 84.8536),
    "daringbadi": (19.9080, 84.1350),
    "chandipur": (21.4667, 87.0167),
    "gopalpur": (19.2600, 84.9100),
    "balasore": (21.4934, 86.9135),
    "mayurbhanj": (21.9300, 86.7200),
}


class WeatherService:
    """Weather service orchestrating provider calls."""

    def __init__(self, adapter: WeatherAdapter | None = None) -> None:
        self.adapter = adapter or OpenMeteoWeatherAdapter()

    def get_weather_for_location(
        self,
        lat: float | None = None,
        lon: float | None = None,
        location_name: str | None = None,
    ) -> WeatherResponse:
        """Resolve coordinates if needed and fetch weather from the provider."""
        resolved_name = location_name or "Bhubaneswar"
        resolved_lat = lat
        resolved_lon = lon

        if resolved_lat is None or resolved_lon is None:
            clean_key = resolved_name.lower().strip()
            # Find matching hub key
            matched = False
            for hub_key, coords in HUB_COORDINATES.items():
                if hub_key in clean_key:
                    resolved_lat, resolved_lon = coords
                    matched = True
                    break
            if not matched:
                # Default to central Odisha hub (Bhubaneswar)
                resolved_lat, resolved_lon = HUB_COORDINATES["bhubaneswar"]

        return self.adapter.fetch_weather(
            lat=resolved_lat,
            lon=resolved_lon,
            location_name=resolved_name,
        )
