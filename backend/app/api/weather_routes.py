"""Weather API routes for O-Travelz."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.weather import WeatherResponse
from app.services.weather.service import WeatherService

router = APIRouter()
_service = WeatherService()


@router.get("/current", response_model=WeatherResponse)
def get_current_weather(
    lat: float | None = Query(None, description="Latitude in EPSG:4326"),
    lon: float | None = Query(None, description="Longitude in EPSG:4326"),
    location_name: str | None = Query(None, description="Location name, e.g. Bhubaneswar"),
) -> WeatherResponse:
    """Get current weather observation for a location."""
    return _service.get_weather_for_location(
        lat=lat,
        lon=lon,
        location_name=location_name,
    )


@router.get("/forecast", response_model=WeatherResponse)
def get_weather_forecast(
    lat: float | None = Query(None, description="Latitude in EPSG:4326"),
    lon: float | None = Query(None, description="Longitude in EPSG:4326"),
    location_name: str | None = Query(None, description="Location name, e.g. Bhubaneswar"),
) -> WeatherResponse:
    """Get weather forecast for a location."""
    return _service.get_weather_for_location(
        lat=lat,
        lon=lon,
        location_name=location_name,
    )
