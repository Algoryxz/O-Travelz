"""Tests for Digital Heritage 3D Reconstruction API Routes and Provenance Contracts."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_all_heritage_scenes() -> None:
    """Verify catalog returns all 6 canonical high-priority Odisha heritage reconstructions."""
    response = client.get("/api/v1/heritage/scenes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 6

    ids = [scene["id"] for scene in data]
    assert "konark-sun-temple" in ids
    assert "puri-jagannath-temple" in ids
    assert "dhauli-shanti-stupa" in ids
    assert "lingaraj-temple" in ids
    assert "udayagiri-khandagiri-caves" in ids
    assert "barabati-fort" in ids


def test_get_konark_scene_detail() -> None:
    """Verify Konark Sun Temple returns detailed real 3D reconstruction and hotspots."""
    response = client.get("/api/v1/heritage/scenes/konark-sun-temple")
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == "konark-sun-temple"
    assert data["scene_type"] == "REAL_3D_RECONSTRUCTION"
    assert data["status"] == "AVAILABLE"
    assert len(data["hotspots"]) >= 4
    assert len(data["sources"]) >= 2

    # Check 24-spoke wheel hotspot
    hotspot_ids = [h["id"] for h in data["hotspots"]]
    assert "konark_wheel" in hotspot_ids
    assert "konark_jagamohana" in hotspot_ids


def test_get_heritage_hotspots_and_sources() -> None:
    """Verify standalone sub-endpoints for hotspots, asset, and sources."""
    # Hotspots
    res_hotspots = client.get("/api/v1/heritage/scenes/dhauli-shanti-stupa/hotspots")
    assert res_hotspots.status_code == 200
    assert len(res_hotspots.json()) >= 3

    # Asset
    res_asset = client.get("/api/v1/heritage/scenes/dhauli-shanti-stupa/asset")
    assert res_asset.status_code == 200
    assert res_asset.json()["point_count"] == 280000

    # Sources
    res_sources = client.get("/api/v1/heritage/scenes/dhauli-shanti-stupa/sources")
    assert res_sources.status_code == 200
    assert len(res_sources.json()) >= 1


def test_heritage_scene_not_found() -> None:
    """Verify non-existent scene returns 404."""
    response = client.get("/api/v1/heritage/scenes/non-existent-monument")
    assert response.status_code == 404
