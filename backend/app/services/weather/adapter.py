"""Weather provider adapter isolating external APIs from the core domain."""
from __future__ import annotations

import os
import urllib.request
import urllib.error
import json
from datetime import datetime, timezone
from typing import Protocol

from app.schemas.weather import (
    WeatherObservation,
    DailyForecastItem,
    WeatherResponse,
)


def _wmo_code_to_condition(code: int) -> tuple[str, str]:
    """Map WMO weather codes to normalized condition string and traveler advice."""
    if code == 0:
        return "Clear", "Ideal conditions for sightseeing and outdoor exploration."
    if code in (1, 2):
        return "Mostly Clear", "Pleasant weather; great for heritage walks."
    if code == 3:
        return "Overcast", "Overcast skies; comfortable for outdoor and temple visits."
    if code in (45, 48):
        return "Foggy", "Misty morning; allow extra transit time."
    if code in (51, 53, 55):
        return "Drizzle", "Light drizzle; keep an umbrella handy."
    if code in (61, 63):
        return "Rain", "Moderate rain; carry rain gear and favor indoor detours."
    if code == 65:
        return "Heavy Rain", "Heavy downpour; prioritize covered temples and museums."
    if code in (80, 81, 82):
        return "Rain Showers", "Passing rain showers; plan flexible transit stops."
    if code in (95, 96, 99):
        return "Thunderstorm", "Thunderstorms expected; stay in safe sheltered areas."
    return "Partly Cloudy", "Good travel conditions throughout the day."


class WeatherAdapter(Protocol):
    """Protocol for weather provider adapters."""

    def fetch_weather(
        self,
        lat: float,
        lon: float,
        location_name: str,
    ) -> WeatherResponse:
        ...


class OpenMeteoWeatherAdapter:
    """Production Open-Meteo weather adapter."""

    def __init__(
        self,
        base_url: str | None = None,
        timeout_seconds: float = 3.5,
    ) -> None:
        self.base_url = (
            base_url
            or os.environ.get("WEATHER_BASE_URL")
            or "https://api.open-meteo.com/v1/forecast"
        )
        self.provider_name = os.environ.get("WEATHER_PROVIDER", "Open-Meteo")
        self.timeout_seconds = timeout_seconds

    def fetch_weather(
        self,
        lat: float,
        lon: float,
        location_name: str,
    ) -> WeatherResponse:
        """Fetch real-time weather from Open-Meteo with graceful error handling."""
        now_iso = datetime.now(timezone.utc).isoformat()

        url = (
            f"{self.base_url}?"
            f"latitude={lat:.4f}&longitude={lon:.4f}&"
            f"current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&"
            f"daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&"
            f"timezone=auto"
        )

        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "O-Travelz-Backend/1.0"},
            )
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as response:
                if response.status != 200:
                    return self._fallback_unavailable(
                        lat=lat,
                        lon=lon,
                        location_name=location_name,
                        error_reason=f"Provider HTTP status {response.status}",
                        timestamp=now_iso,
                    )
                data = json.loads(response.read().decode("utf-8"))
                return self._parse_open_meteo_response(
                    data=data,
                    lat=lat,
                    lon=lon,
                    location_name=location_name,
                    timestamp=now_iso,
                )
        except Exception as err:
            return self._fallback_unavailable(
                lat=lat,
                lon=lon,
                location_name=location_name,
                error_reason=str(err),
                timestamp=now_iso,
            )

    def _parse_open_meteo_response(
        self,
        data: dict,
        lat: float,
        lon: float,
        location_name: str,
        timestamp: str,
    ) -> WeatherResponse:
        current_data = data.get("current", {})
        temp = float(current_data.get("temperature_2m", 28.0)) if current_data.get("temperature_2m") is not None else None
        apparent_temp = current_data.get("apparent_temperature")
        weather_code = int(current_data.get("weather_code", 0))
        humidity = current_data.get("relative_humidity_2m")
        precip = current_data.get("precipitation")
        wind_speed = current_data.get("wind_speed_10m")
        is_day_raw = current_data.get("is_day")
        is_day_val = int(is_day_raw) if is_day_raw is not None else 1

        condition, advice = _wmo_code_to_condition(weather_code)

        observation = WeatherObservation(
            location_name=location_name,
            lat=lat,
            lon=lon,
            observed_at=current_data.get("time", timestamp),
            temperature_c=temp,
            apparent_temperature_c=float(apparent_temp) if apparent_temp is not None else None,
            condition=condition,
            condition_code=weather_code,
            is_day=is_day_val,
            humidity_pct=int(humidity) if humidity is not None else None,
            precipitation_probability_pct=None,
            precipitation_mm=float(precip) if precip is not None else None,
            wind_speed_kmh=float(wind_speed) if wind_speed is not None else None,
            advice=advice,
            provider=self.provider_name,
            freshness_timestamp=timestamp,
            status="available",
            error_reason=None,
        )

        daily_items: list[DailyForecastItem] = []
        daily_data = data.get("daily", {})
        dates = daily_data.get("time", [])
        max_temps = daily_data.get("temperature_2m_max", [])
        min_temps = daily_data.get("temperature_2m_min", [])
        daily_codes = daily_data.get("weather_code", [])
        daily_precip_prob = daily_data.get("precipitation_probability_max", [])
        daily_precip_sum = daily_data.get("precipitation_sum", [])

        default_temp = temp if temp is not None else 28.0
        for i in range(min(len(dates), 7)):
            d_code = int(daily_codes[i]) if i < len(daily_codes) else 0
            d_cond, _ = _wmo_code_to_condition(d_code)
            daily_items.append(
                DailyForecastItem(
                    date=dates[i],
                    temperature_max_c=float(max_temps[i]) if i < len(max_temps) else default_temp,
                    temperature_min_c=float(min_temps[i]) if i < len(min_temps) else default_temp - 5,
                    condition=d_cond,
                    condition_code=d_code,
                    precipitation_probability_pct=int(daily_precip_prob[i]) if i < len(daily_precip_prob) and daily_precip_prob[i] is not None else None,
                    precipitation_sum_mm=float(daily_precip_sum[i]) if i < len(daily_precip_sum) and daily_precip_sum[i] is not None else None,
                )
            )

        return WeatherResponse(
            location_name=location_name,
            current=observation,
            forecast_daily=daily_items,
        )

    def _fallback_unavailable(
        self,
        lat: float,
        lon: float,
        location_name: str,
        error_reason: str,
        timestamp: str,
    ) -> WeatherResponse:
        observation = WeatherObservation(
            location_name=location_name,
            lat=lat,
            lon=lon,
            observed_at=timestamp,
            temperature_c=None,
            apparent_temperature_c=None,
            condition="Unavailable",
            condition_code=None,
            is_day=None,
            humidity_pct=None,
            precipitation_probability_pct=None,
            precipitation_mm=None,
            wind_speed_kmh=None,
            advice="Weather data is temporarily unavailable. Check local forecasts before traveling.",
            provider=self.provider_name,
            freshness_timestamp=timestamp,
            status="unavailable",
            error_reason=error_reason,
        )
        return WeatherResponse(
            location_name=location_name,
            current=observation,
            forecast_daily=[],
        )
