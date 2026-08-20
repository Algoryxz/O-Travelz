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
    "current": {
        "time": "2026-08-20T12:00",
        "temperature_2m": 29.5,
        "relative_humidity_2m": 78,
        "apparent_temperature": 34.2,
        "precipitation": 0.0,
        "weather_code": 1,
        "wind_speed_10m": 12.5,
    },
    "daily": {
        "time": ["2026-08-20", "2026-08-21", "2026-08-22"],
        "temperature_2m_max": [31.0, 30.5, 29.8],
        "temperature_2m_min": [25.0, 24.5, 24.0],
        "weather_code": [1, 61, 0],
        "precipitation_probability_max": [20, 80, 10],
        "precipitation_sum": [0.0, 12.4, 0.0],
    },
}


def test_wmo_code_mapping():
    cond, adv = _wmo_code_to_condition(0)
    assert cond == "Clear"
    assert "Ideal conditions" in adv

    cond, adv = _wmo_code_to_condition(61)
    assert cond == "Rain"
    assert "rain gear" in adv

    cond, adv = _wmo_code_to_condition(95)
    assert cond == "Thunderstorm"
    assert "sheltered" in adv


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
        assert res.current.condition == "Mostly Clear"
        assert res.current.humidity_pct == 78
        assert res.current.apparent_temperature_c == 34.2
        assert res.current.wind_speed_kmh == 12.5
        assert len(res.forecast_daily) == 3
        assert res.forecast_daily[1].condition == "Rain"


def test_open_meteo_adapter_timeout_fallback():
    adapter = OpenMeteoWeatherAdapter()

    with patch("urllib.request.urlopen", side_effect=TimeoutError("Connection timed out")):
        res = adapter.fetch_weather(lat=20.2961, lon=85.8245, location_name="Bhubaneswar")

        assert res.current.status == "unavailable"
        assert res.current.condition == "Unavailable"
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
            "condition": "Clear",
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
                "condition": "Mostly Clear",
                "humidity_pct": 70,
                "wind_speed_kmh": 10.0,
                "advice": "Pleasant weather; great for heritage walks.",
                "provider": "Open-Meteo",
                "freshness_timestamp": "2026-08-20T12:00:00Z",
                "status": "available",
            },
            forecast_daily=[],
        ),
    ):
        res_curr = client.get("/weather/current?location_name=Bhubaneswar")
        assert res_curr.status_code == 200
        data_curr = res_curr.json()
        assert data_curr["location_name"] == "Bhubaneswar"
        assert data_curr["current"]["temperature_c"] == 30.0
        assert data_curr["current"]["condition"] == "Mostly Clear"

        res_fore = client.get("/weather/forecast?lat=20.2961&lon=85.8245")
        assert res_fore.status_code == 200
        data_fore = res_fore.json()
        assert data_fore["current"]["status"] == "available"
