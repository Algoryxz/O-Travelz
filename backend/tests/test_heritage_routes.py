"""Tests for Digital Heritage 3D Reconstruction API Routes and Provenance Contracts."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_all_heritage_scenes() -> None:
    """Verify catalog returns exactly the 4 canonical Odisha heritage locations."""
    response = client.get("/api/v1/heritage/scenes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 4

    ids = [scene["id"] for scene in data]
    assert "konark-sun-temple" in ids
    assert "puri-jagannath-temple" in ids
    assert "lingaraj-temple" in ids
    assert "brahmeswara-temple" in ids


def test_get_konark_scene_detail() -> None:
    """Verify Konark Sun Temple returns detailed 3D reconstruction specifications and hotspots."""
    response = client.get("/api/v1/heritage/scenes/konark-sun-temple")
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == "konark-sun-temple"
    assert data["scene_type"] == "REAL_3D_RECONSTRUCTION"
    assert data["status"] == "AVAILABLE"
    assert len(data["hotspots"]) >= 3
    assert len(data["sources"]) >= 2
    assert "dimensions" in data and data["dimensions"] is not None
    assert "materials" in data and data["materials"] is not None

    # Check 24-spoke wheel hotspot
    hotspot_ids = [h["id"] for h in data["hotspots"]]
    assert "konark_wheel" in hotspot_ids
    assert "konark_jagamohana" in hotspot_ids


def test_puri_jagannath_sanctity_rule() -> None:
    """Verify Puri Jagannath Temple adheres to sacred sanctity rule (exterior only)."""
    response = client.get("/api/v1/heritage/scenes/puri-jagannath-temple")
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == "puri-jagannath-temple"
    assert data["scene_type"] == "REAL_3D_RECONSTRUCTION"
    # Ensure notes confirm exterior representation only
    assert "interior" in data["reconstruction_notes"].lower()
    assert "omitted" in data["reconstruction_notes"].lower() or "no interior" in data["reconstruction_notes"].lower()


def test_brahmeswara_alias_support() -> None:
    """Verify Brahmeswara Temple is accessible via canonical and alias IDs."""
    res_canonical = client.get("/api/v1/heritage/scenes/brahmeswara-temple")
    assert res_canonical.status_code == 200
    assert res_canonical.json()["name"] == "Brahmeswara Temple"

    res_alias = client.get("/api/v1/heritage/scenes/bhrameshwar-temple")
    assert res_alias.status_code == 200
    assert res_alias.json()["id"] == "brahmeswara-temple"


def test_get_heritage_hotspots_and_sources() -> None:
    """Verify standalone sub-endpoints for hotspots, asset, and sources."""
    # Hotspots
    res_hotspots = client.get("/api/v1/heritage/scenes/lingaraj-temple/hotspots")
    assert res_hotspots.status_code == 200
    assert len(res_hotspots.json()) >= 2

    # Asset
    res_asset = client.get("/api/v1/heritage/scenes/lingaraj-temple/asset")
    assert res_asset.status_code == 200
    assert res_asset.json()["format"] == "procedural_kalinga_3d_mesh"

    # Sources
    res_sources = client.get("/api/v1/heritage/scenes/lingaraj-temple/sources")
    assert res_sources.status_code == 200
    assert len(res_sources.json()) >= 1


def test_heritage_scene_not_found() -> None:
    """Verify non-existent scene returns 404."""
    response = client.get("/api/v1/heritage/scenes/non-existent-monument")
    assert response.status_code == 404
