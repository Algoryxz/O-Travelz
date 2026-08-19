"""Unit tests for backend image delivery proxy."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.storage.base import StoredAsset
from app.storage.local import LocalImageStorage


@pytest.fixture
def client_with_mock_image(monkeypatch, tmp_path):
    storage = LocalImageStorage(base_path=str(tmp_path))
    test_key = "places/place_bbsr_001/abc12345/hero.webp"
    webp_data = b"RIFF\x20\x00\x00\x00WEBPVP8X" + b"\x00" * 20
    storage.save_image(test_key, webp_data, content_type="image/webp")

    # Monkeypatch storage factory in image_routes
    from app.api import image_routes
    monkeypatch.setattr(image_routes, "get_image_storage", lambda: storage)

    client = TestClient(app)
    return client, test_key, webp_data


def test_image_proxy_successful_retrieval(client_with_mock_image):
    client, test_key, expected_data = client_with_mock_image
    response = client.get(f"/api/v1/images/{test_key}")

    assert response.status_code == 200
    assert response.headers["Content-Type"] == "image/webp"
    assert "public" in response.headers["Cache-Control"]
    assert "immutable" in response.headers["Cache-Control"]
    assert response.content == expected_data


def test_image_proxy_static_path_alias(client_with_mock_image):
    client, test_key, expected_data = client_with_mock_image
    response = client.get(f"/static/images/{test_key}")

    assert response.status_code == 200
    assert response.headers["Content-Type"] == "image/webp"
    assert response.content == expected_data


def test_image_proxy_missing_blob(client_with_mock_image):
    client, _, _ = client_with_mock_image
    response = client.get("/api/v1/images/places/nonexistent/hero.webp")

    assert response.status_code == 404
    assert response.json()["detail"] == "Image not found"


def test_image_proxy_path_traversal_protection(client_with_mock_image):
    client, _, _ = client_with_mock_image
    # Attempt path traversal
    response = client.get("/api/v1/images/places/../../etc/passwd")

    assert response.status_code in [400, 404]
