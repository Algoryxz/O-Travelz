import json
import pathlib
import pytest
from app.main import app

def test_mobile_contract_snapshot_in_sync():
    repo_root = pathlib.Path(__file__).resolve().parent.parent.parent
    snapshot_path = repo_root / "mobile" / "contracts" / "openapi-mobile.json"
    assert snapshot_path.exists(), "Snapshot mobile/contracts/openapi-mobile.json must exist"
    
    snapshot = json.loads(snapshot_path.read_text(encoding="utf-8"))
    current_openapi = app.openapi()
    
    # Core paths must exist in both
    required_paths = [
        "/health",
        "/ready",
        "/places",
        "/places/{place_id}",
        "/weather/current",
        "/ai/converse",
        "/itinerary/plan",
        "/api/transport/routes",
        "/api/transport/routes/{route_id}/geometry",
        "/transport/stops/nearby",
        "/api/v1/services/nearby"
    ]
    for path in required_paths:
        assert path in snapshot["paths"], f"Path {path} missing from committed snapshot"
        assert path in current_openapi["paths"], f"Path {path} missing from current OpenAPI"

def test_mobile_required_endpoints_methods():
    openapi = app.openapi()
    paths = openapi["paths"]
    
    assert "get" in paths["/health"]
    assert "get" in paths["/ready"]
    assert "get" in paths["/places"]
    assert "get" in paths["/places/{place_id}"]
    assert "get" in paths["/weather/current"]
    assert "post" in paths["/ai/converse"]
    assert "post" in paths["/itinerary/plan"]
    assert "get" in paths["/api/transport/routes"]
    assert "get" in paths["/api/transport/routes/{route_id}/geometry"]
    assert "get" in paths["/transport/stops/nearby"]
    assert "get" in paths["/api/v1/services/nearby"]

def test_services_isolation_from_places():
    openapi = app.openapi()
    paths = openapi["paths"]
    
    # Places schema and Services schema must remain completely distinct
    places_get = paths["/places"]["get"]
    services_get = paths["/api/v1/services/nearby"]["get"]
    
    # Ensure tags/endpoints are strictly isolated
    assert "places" in places_get.get("tags", [])
    assert "services" in services_get.get("tags", [])
    assert "places" not in services_get.get("tags", [])
