"""Tests for OpenAPI contract generation, operation ID stability, and drift validation."""
import json
from pathlib import Path
from app.main import app

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OPENAPI_JSON_PATH = REPO_ROOT / "shared" / "openapi" / "openapi.json"


def test_openapi_generation_and_properties():
    """Verify that app.openapi() returns a valid OpenAPI 3.x schema structure."""
    app.openapi_schema = None
    schema = app.openapi()

    assert isinstance(schema, dict)
    assert schema.get("openapi", "").startswith("3.")
    assert schema.get("info", {}).get("title") == "O-Travelz API"
    assert "paths" in schema
    assert "components" in schema
    assert "schemas" in schema["components"]


def test_openapi_operation_ids_unique_and_present():
    """Verify that every endpoint method has a non-empty, unique operationId."""
    app.openapi_schema = None
    schema = app.openapi()
    paths = schema.get("paths", {})

    op_ids = set()
    for path, path_item in paths.items():
        for method in ["get", "post", "put", "delete", "patch"]:
            if method in path_item:
                op_id = path_item[method].get("operationId")
                assert op_id, f"Missing operationId for {method.upper()} {path}"
                assert op_id not in op_ids, f"Duplicate operationId found: {op_id} at {method.upper()} {path}"
                op_ids.add(op_id)

    assert len(op_ids) >= 70, f"Expected at least 70 unique operation IDs, found {len(op_ids)}"


def test_openapi_core_schemas_present():
    """Verify that canonical domain response and request models are present in schemas."""
    app.openapi_schema = None
    schema = app.openapi()
    schemas = schema.get("components", {}).get("schemas", {})

    expected_models = [
        "WeatherResponse",
        "WeatherObservation",
        "DailyForecastItem",
        "PlaceSummary",
        "PlaceDetailResponse",
        "PlaceImageResponse",
        "ItineraryResponse",
        "ItineraryDayContract",
        "ItineraryStopContract",
        "TransportHopContract",
        "AIResponse",
        "ChatMessage",
        "ChatRole",
        "AIStatus",
        "PlanningConstraints",
        "MapProjectionResponse",
        "MapFeature",
        "PointGeometry",
        "LineStringGeometry",
        "CanonicalRef",
        "CreateShareTripResponse",
        "PublicSharedTripResponse",
        "SyncSavedPlacesResponse",
        "SyncTripsResponse",
    ]

    for model_name in expected_models:
        assert model_name in schemas, f"Core schema '{model_name}' missing from OpenAPI components"


def test_tracked_openapi_snapshot_synchronized():
    """Verify that the tracked shared/openapi/openapi.json matches the backend application."""
    assert OPENAPI_JSON_PATH.exists(), f"Tracked openapi.json missing at {OPENAPI_JSON_PATH}"

    app.openapi_schema = None
    generated_dict = app.openapi()
    generated_str = json.dumps(generated_dict, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    tracked_str = OPENAPI_JSON_PATH.read_text(encoding="utf-8")

    assert tracked_str == generated_str, (
        "Tracked shared/openapi/openapi.json is out of sync with backend FastAPI schema. "
        "Run 'python scripts/generate_openapi.py' to update it."
    )
