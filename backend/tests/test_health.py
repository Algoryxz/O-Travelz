from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "O-Travelz API"
    assert data["status"] == "running"
    assert "git_sha" in data
    assert data["alembic_version"] == "0020_transit_ride_observations"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("ok", "degraded")
    assert "git_sha" in data
    assert len(data["git_sha"]) == 40
    assert data["alembic_version"] == "0020_transit_ride_observations"
    assert data["database"] in ("connected", "disconnected")

