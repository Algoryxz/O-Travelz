"""Weather contracts for O-Travelz."""
from __future__ import annotations

from typing import Literal
from pydantic import ConfigDict, Field

from app.schemas.common import ContractModel


class WeatherObservation(ContractModel):
    """Normalized weather observation for a geographic location."""

    location_name: str
    lat: float
    lon: float
    observed_at: str
    temperature_c: float | None = None
    apparent_temperature_c: float | None = None
    condition: str
    condition_code: int | None = None
    is_day: int | None = Field(default=1, description="1 if daytime, 0 if nighttime according to local solar position")
    humidity_pct: int | None = None
    precipitation_probability_pct: int | None = None
    precipitation_mm: float | None = None
    wind_speed_kmh: float | None = None
    wind_direction_deg: float | None = None
    wind_gusts_kmh: float | None = None
    cloud_cover_pct: int | None = None
    timezone: str | None = None
    advice: str | None = None
    provider: str = "Open-Meteo"
    freshness_timestamp: str
    status: Literal["available", "unavailable"] = "available"
    error_reason: str | None = None


class DailyForecastItem(ContractModel):
    """Daily forecast summary item."""

    date: str
    temperature_max_c: float
    temperature_min_c: float
    apparent_temperature_max_c: float | None = None
    apparent_temperature_min_c: float | None = None
    condition: str
    condition_code: int | None = None
    precipitation_probability_pct: int | None = None
    precipitation_sum_mm: float | None = None
    sunrise: str | None = None
    sunset: str | None = None
    wind_speed_max_kmh: float | None = None


class WeatherResponse(ContractModel):
    """Weather API response containing current observation and optional daily forecast."""

    location_name: str
    current: WeatherObservation
    forecast_daily: list[DailyForecastItem] = Field(default_factory=list)
