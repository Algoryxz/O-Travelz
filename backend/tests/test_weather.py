"""Tests for weather service, adapter, normalization, and API routes."""
from __future__ import annotations

import json
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.weather import WeatherResponse
from app.services.weather.adapter import OpenMeteoWeatherAdapter, _wmo_code_to_condition
from app.services.weather.service import WeatherService, HUB_COORDINATES

client = TestClient(app)

SAMPLE_OPEN_METEO_RESPONSE = {
    "latitude": 20.2961,
    "longitude": 85.8245,
    "timezone": "Asia/Kolkata",
    "current": {
        "time": "2026-08-20T12:00",
        "temperature_2m": 29.5,
        "relative_humidity_2m": 78,
        "apparent_temperature": 34.2,
        "precipitation": 0.0,
        "weather_code": 1,
        "is_day": 1,
        "wind_speed_10m": 12.5,
        "wind_direction_10m": 180,
        "wind_gusts_10m": 18.0,
        "cloud_cover": 25,
    },
    "daily": {
        "time": ["2026-08-20", "2026-08-21", "2026-08-22"],
        "temperature_2m_max": [31.0, 30.5, 29.8],
        "temperature_2m_min": [25.0, 24.5, 24.0],
        "apparent_temperature_max": [35.0, 34.0, 33.0],
        "apparent_temperature_min": [27.0, 26.0, 25.0],
        "sunrise": ["2026-08-20T05:30", "2026-08-21T05:30", "2026-08-22T05:31"],
        "sunset": ["2026-08-20T18:15", "2026-08-21T18:14", "2026-08-22T18:13"],
        "weather_code": [1, 61, 0],
        "precipitation_probability_max": [20, 80, 10],
        "precipitation_sum": [0.0, 12.4, 0.0],
        "wind_speed_10m_max": [15.0, 22.0, 12.0],
    },
}


def test_wmo_code_mapping():
    cond, adv = _wmo_code_to_condition(0)
    assert cond == "Clear sky"
    assert "Ideal conditions" in adv

    cond, adv = _wmo_code_to_condition(1)
    assert cond == "Mainly clear"

    cond, adv = _wmo_code_to_condition(61)
    assert cond == "Slight rain"
    assert "umbrella" in adv

    cond, adv = _wmo_code_to_condition(65)
    assert cond == "Heavy rain"

    cond, adv = _wmo_code_to_condition(95)
    assert cond == "Thunderstorm"
    assert "sheltered" in adv

    cond, adv = _wmo_code_to_condition(96)
    assert cond == "Thunderstorm with hail"


def test_open_meteo_adapter_success():
    adapter = OpenMeteoWeatherAdapter()

    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.read.return_value = json.dumps(SAMPLE_OPEN_METEO_RESPONSE).encode("utf-8")
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        res = adapter.fetch_weather(lat=20.2961, lon=85.8245, location_name="Bhubaneswar")

        assert isinstance(res, WeatherResponse)
        assert res.location_name == "Bhubaneswar"
        assert res.current.status == "available"
        assert res.current.temperature_c == 29.5
        assert res.current.condition == "Mainly clear"
        assert res.current.is_day == 1
        assert res.current.humidity_pct == 78
        assert res.current.apparent_temperature_c == 34.2
        assert res.current.wind_speed_kmh == 12.5
        assert res.current.wind_direction_deg == 180
        assert res.current.cloud_cover_pct == 25
        assert res.current.timezone == "Asia/Kolkata"
        assert len(res.forecast_daily) == 3
        assert res.forecast_daily[1].condition == "Slight rain"
        assert res.forecast_daily[1].apparent_temperature_max_c == 34.0


def test_open_meteo_adapter_timeout_fallback():
    adapter = OpenMeteoWeatherAdapter()

    with patch("urllib.request.urlopen", side_effect=TimeoutError("Connection timed out")):
        res = adapter.fetch_weather(lat=20.2961, lon=85.8245, location_name="Bhubaneswar")

        assert res.current.status == "unavailable"
        assert res.current.condition == "Unavailable"
        assert res.current.temperature_c is None
        assert "temporarily unavailable" in res.current.advice
        assert "timed out" in (res.current.error_reason or "")


def test_open_meteo_adapter_http_error():
    adapter = OpenMeteoWeatherAdapter()

    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_response = MagicMock()
        mock_response.status = 503
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        res = adapter.fetch_weather(lat=20.2961, lon=85.8245, location_name="Bhubaneswar")

        assert res.current.status == "unavailable"
        assert res.current.temperature_c is None


def test_weather_service_hub_resolution():
    mock_adapter = MagicMock()
    mock_adapter.fetch_weather.return_value = WeatherResponse(
        location_name="Puri",
        current={
            "location_name": "Puri",
            "lat": 19.8135,
            "lon": 85.8312,
            "observed_at": "2026-08-20T12:00:00Z",
            "temperature_c": 28.0,
            "condition": "Clear sky",
            "is_day": 1,
            "freshness_timestamp": "2026-08-20T12:00:00Z",
            "status": "available",
        },
        forecast_daily=[],
    )

    service = WeatherService(adapter=mock_adapter)
    res = service.get_weather_for_location(location_name="Puri")

    mock_adapter.fetch_weather.assert_called_once_with(
        lat=HUB_COORDINATES["puri"][0],
        lon=HUB_COORDINATES["puri"][1],
        location_name="Puri",
    )
    assert res.location_name == "Puri"


def test_weather_api_endpoints():
    with patch.object(
        WeatherService,
        "get_weather_for_location",
        return_value=WeatherResponse(
            location_name="Bhubaneswar",
            current={
                "location_name": "Bhubaneswar",
                "lat": 20.2961,
                "lon": 85.8245,
                "observed_at": "2026-08-20T12:00:00Z",
                "temperature_c": 30.0,
                "apparent_temperature_c": 33.0,
                "condition": "Mainly clear",
                "is_day": 0,
                "humidity_pct": 70,
                "wind_speed_kmh": 10.0,
                "timezone": "Asia/Kolkata",
                "advice": "Pleasant weather; great for heritage walks.",
                "provider": "Open-Meteo",
                "freshness_timestamp": "2026-08-20T12:00:00Z",
                "status": "available",
            },
            forecast_daily=[],
        ),
    ):
        # 1. Test ?location_name=Bhubaneswar
        res_curr_loc = client.get("/weather/current?location_name=Bhubaneswar")
        assert res_curr_loc.status_code == 200
        data_curr_loc = res_curr_loc.json()
        assert data_curr_loc["location_name"] == "Bhubaneswar"
        assert data_curr_loc["current"]["temperature_c"] == 30.0
        assert data_curr_loc["current"]["condition"] == "Mainly clear"
        assert data_curr_loc["current"]["is_day"] == 0

        # 2. Test ?hub=Bhubaneswar
        res_curr_hub = client.get("/weather/current?hub=Bhubaneswar")
        assert res_curr_hub.status_code == 200
        data_curr_hub = res_curr_hub.json()
        assert data_curr_hub["location_name"] == "Bhubaneswar"
        assert data_curr_hub["current"]["temperature_c"] == 30.0

        # 3. Test /weather/forecast?hub=Bhubaneswar
        res_fore_hub = client.get("/weather/forecast?hub=Bhubaneswar")
        assert res_fore_hub.status_code == 200
        data_fore_hub = res_fore_hub.json()
        assert data_fore_hub["current"]["status"] == "available"


def test_open_meteo_adapter_is_day_night():
    """Verify adapter correctly extracts is_day=0 (night) and is_day=1 (day)."""
    adapter = OpenMeteoWeatherAdapter()

    night_data = {
        **SAMPLE_OPEN_METEO_RESPONSE,
        "current": {
            **SAMPLE_OPEN_METEO_RESPONSE["current"],
            "weather_code": 0,
            "is_day": 0,
            "temperature_2m": 26.0,
        },
    }

    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.read.return_value = json.dumps(night_data).encode("utf-8")
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        res = adapter.fetch_weather(lat=20.2961, lon=85.8245, location_name="Bhubaneswar")
        assert res.current.is_day == 0
        assert res.current.condition == "Clear sky"
        assert res.current.temperature_c == 26.0


def test_weather_unavailable_does_not_return_fake_temp():
    """Verify unavailable status returns temperature_c=None instead of fake 0.0 or 28.0."""
    adapter = OpenMeteoWeatherAdapter()

    with patch("urllib.request.urlopen", side_effect=Exception("Network failure")):
        res = adapter.fetch_weather(lat=20.2961, lon=85.8245, location_name="Bhubaneswar")
        assert res.current.status == "unavailable"
        assert res.current.temperature_c is None
        assert res.current.is_day is None
