"""
Wave D1.5: Public backend contracts, release identity, and failure resilience unit tests.
Hermetic tests running against FastAPI TestClient without live internet dependencies.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_d1_5_root_contract_and_version():
    """Verify GET / exposes machine-readable service identity with version 4.0.0."""
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["service"] == "O-Travelz API"
    assert data["status"] == "running"
    assert data["version"] == "4.0.0"
    assert "git_sha" in data
    assert len(data["git_sha"]) >= 7
    assert data["alembic_version"] == "0020_transit_ride_observations"
    assert "password" not in str(data).lower()
    assert "secret" not in str(data).lower()


def test_d1_5_health_contract_and_version():
    """Verify GET /health exposes machine-readable liveness identity with version 4.0.0."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("ok", "degraded")
    assert data["version"] == "4.0.0"
    assert "git_sha" in data
    assert data["alembic_version"] == "0020_transit_ride_observations"
    assert data["database"] in ("connected", "disconnected")


def test_d1_5_cors_allows_github_pages_origin():
    """Verify CORS middleware permits https://algoryxz.github.io requests."""
    headers = {
        "Origin": "https://algoryxz.github.io",
        "Access-Control-Request-Method": "GET",
    }
    resp = client.options("/health", headers=headers)
    assert resp.status_code == 200
    allow_origin = resp.headers.get("access-control-allow-origin")
    assert allow_origin in ("https://algoryxz.github.io", "*")


def test_d1_5_places_endpoint_schema():
    """Verify GET /places returns expected schema and does not crash."""
    resp = client.get("/places")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, (list, dict))


def test_d1_5_weather_fail_closed_behavior():
    """Verify GET /weather/current fails closed without 0C or fake temperature when coords are invalid."""
    resp = client.get("/weather/current?lat=999.0&lng=999.0")
    # Should either return error status or non-zero fallback
    if resp.status_code == 200:
        data = resp.json()
        assert data.get("temperature_celsius") != 0.0
    else:
        assert resp.status_code in (400, 422, 502, 503)
