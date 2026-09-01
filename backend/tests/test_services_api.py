"""HTTP Integration tests for services API routes."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_get_nearby_services():
    response = client.get("/api/v1/services/nearby?lat=20.5056&lon=85.8267&category=healthcare")
    assert response.status_code == 200
    data = response.json()
    assert "services" in data
    assert data["count"] >= 1
    assert data["distance_semantics"] == "straight_line_haversine"
    assert data["services"][0]["category"] == "healthcare"

def test_api_get_safety_advisory():
    response = client.get("/api/v1/services/safety/round2_east_018")
    assert response.status_code == 200
    data = response.json()
    assert data["destination_id"] == "round2_east_018"
    assert "emergency_contacts" in data
    assert len(data["emergency_contacts"]) >= 1

def test_api_get_safety_advisory_not_found():
    response = client.get("/api/v1/services/safety/non_existent_destination_999")
    assert response.status_code == 404

def test_api_get_services_for_destination():
    response = client.get("/api/v1/services/for-destination?lat=20.5056&lon=85.8267&destination_id=round2_east_018")
    assert response.status_code == 200
    data = response.json()
    assert "healthcare" in data
    assert "police" in data
    assert "safety_advisory" in data
    assert data["safety_advisory"]["destination_id"] == "round2_east_018"

def test_api_nearby_invalid_coordinates():
    response = client.get("/api/v1/services/nearby?lat=10.0&lon=50.0")
    assert response.status_code == 422 # Validation error from Query(ge=17.8)
