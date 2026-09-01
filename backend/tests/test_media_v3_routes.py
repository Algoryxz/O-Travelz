import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_media_providers_status():
    response = client.get("/api/v1/media/providers/status")
    assert response.status_code == 200
    data = response.json()
    assert "video_provider" in data
    assert "model_3d_provider" in data
    assert "video_status" in data
    assert "model_3d_status" in data


def test_place_media_konark():
    response = client.get("/api/v1/media/places/place_konark_001")
    assert response.status_code == 200
    data = response.json()
    assert data["place_id"] == "place_konark_001"
    assert data["has_3d"] is True
    assert data["has_video"] is True
    assert data["model_3d"] is not None
    assert data["model_3d"]["format"] == "procedural"
    assert data["model_3d"]["procedural_type"] == "konark_wheel"
    assert "Surya Chakra" in data["model_3d"]["name"]
    assert data["video"] is not None
    assert data["video"]["video_url"].startswith("http")
    assert "Konark" in data["video"]["title"]


def test_place_media_puri():
    response = client.get("/api/v1/media/places/place_puri_001")
    assert response.status_code == 200
    data = response.json()
    assert data["place_id"] == "place_puri_001"
    assert data["has_3d"] is True
    assert data["model_3d"]["procedural_type"] == "jagannath_temple"


def test_place_media_generic_fallback():
    response = client.get("/api/v1/media/places/place_random_999?place_name=Sample%20Sanctuary")
    assert response.status_code == 200
    data = response.json()
    assert data["place_id"] == "place_random_999"
    assert data["has_video"] is True


def test_generate_video_preview():
    payload = {
        "place_id": "place_konark_001",
        "place_name": "Konark Sun Temple",
        "duration_seconds": 8,
    }
    response = client.post("/api/v1/media/video/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["completed", "queued", "unavailable"]


def test_generate_3d_model():
    payload = {
        "place_id": "place_konark_001",
        "place_name": "Konark Sun Temple",
        "quality": "standard",
    }
    response = client.post("/api/v1/media/3d/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["completed", "queued", "unavailable"]
