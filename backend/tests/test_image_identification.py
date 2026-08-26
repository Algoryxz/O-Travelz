"""Tests for AI Image Identification and Visual Landmark Discovery endpoint."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from app.db.session import get_db
from app.main import app


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = lambda: None
    yield TestClient(app)
    app.dependency_overrides.pop(get_db, None)



def test_identify_place_konark_landmark(client):
    """Test identifying Konark Sun Temple from photo/filename hints."""
    payload = {
        "file_name": "IMG_2026_konark_sun_temple_chariot_wheel.jpg",
        "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    }
    res = client.post("/ai/identify-place", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["query_type"] == "image"
    assert data["status"] == "success"
    assert data["top_match"] is not None
    assert "Konark" in data["top_match"]["name"]
    assert data["top_match"]["confidence"] >= 0.75
    assert data["top_match"]["confidence_tier"] == "Likely Match"
    assert "13th-century Kalinga chariot wheel" in data["top_match"]["reason"]


def test_identify_place_puri_jagannath(client):
    """Test identifying Puri Shree Jagannath Temple."""
    payload = {
        "file_name": "puri_jagannath_temple_grand_road.jpg",
        "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    }
    res = client.post("/ai/identify-place", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["query_type"] == "image"
    assert data["top_match"] is not None
    assert "Jagannath" in data["top_match"]["name"]
    assert data["top_match"]["district"] == "Puri"
    assert data["top_match"]["confidence_tier"] in ("Likely Match", "Possible Match")


def test_identify_place_uncertain_fallback(client):
    """Test fallback when image does not have obvious landmark signatures."""
    payload = {
        "file_name": "random_unlabeled_vacation_photo.jpg",
        "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    }
    res = client.post("/ai/identify-place", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["query_type"] == "image"
    assert len(data["candidates"]) > 0
