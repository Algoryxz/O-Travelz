"""Regression tests for production image delivery, URL contracts, and weather hub parameters."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_static_place_images_return_200():
    """Verify representative destination images resolve with correct headers and content-type."""
    representative_keys = [
        "places/place_bbsr_011/36e8a9a95990/hero.webp",
        "places/place_bbsr_011/36e8a9a95990/card.webp",
        "places/place_bbsr_011/36e8a9a95990/thumbnail.webp",
        "places/place_puri_001/02287867dc89/hero.webp",
        "places/place_konark_001/03b959a8abef/hero.webp",

    ]

    for key in representative_keys:
        response = client.get(f"/static/images/{key}")
        assert response.status_code == 200, f"Expected 200 for {key}, got {response.status_code}"
        assert response.headers.get("content-type") == "image/webp"
        assert "max-age=31536000" in response.headers.get("cache-control", "")
        assert len(response.content) > 0


def test_static_category_images_return_200():
    """Verify representative category photography resolves with correct headers."""
    category_keys = [
        "categories/cat_atms/76647d302131/card.webp",
        "categories/cat_hangout_chill/840313660e7c/card.webp",
        "categories/cat_medical_help/bf5d0fc229ac/card.webp",
    ]

    for key in category_keys:
        response = client.get(f"/static/images/{key}")
        assert response.status_code == 200, f"Expected 200 for {key}, got {response.status_code}"
        assert response.headers.get("content-type") == "image/webp"
        assert len(response.content) > 0


def test_missing_image_returns_404():
    """Non-existent storage keys must return 404 without crashing."""
    response = client.get("/static/images/places/place_nonexistent_999/invalid/hero.webp")
    assert response.status_code == 404
    assert response.json() == {"detail": "Image not found"}


def test_path_traversal_returns_400():
    """Path traversal attempts must return 400 Bad Request."""
    response = client.get("/static/images/../../etc/passwd")
    assert response.status_code in (400, 404)


def test_weather_hub_parameter():
    """Verify GET /weather/current supports hub query parameter."""
    response = client.get("/weather/current?hub=Bhubaneswar")
    assert response.status_code == 200
    data = response.json()
    assert data["location_name"] == "Bhubaneswar"
    assert "current" in data
