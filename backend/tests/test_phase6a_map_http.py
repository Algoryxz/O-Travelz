from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from geoalchemy2 import WKTElement
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import get_db
from app.main import app
from app.models.place import Place
from app.models.transport import Route, Stop


class FakeSession:
    def __init__(self, records=()):
        self.records = {(type(record), record.id): record for record in records}
        self.calls = []

    def get(self, model, identifier):
        self.calls.append((model, identifier))
        return self.records.get((model, identifier))


def _place(identifier=None, location=None):
    return Place(
        id=identifier or uuid4(),
        name="HTTP test place",
        category_id=uuid4(),
        source="backend test fixture",
        location=location,
        verified_at=None,
    )


def _stop(identifier=None, location=None):
    return Stop(
        id=identifier or uuid4(),
        provider_id=uuid4(),
        name="HTTP test stop",
        canonical_stop_id="provider-only-id",
        location=location,
    )


def _route(identifier=None, geometry=None):
    return Route(
        id=identifier or uuid4(),
        provider_id=uuid4(),
        name="HTTP test route",
        geometry=geometry,
    )


def _post(payload, records=()):
    return _post_with_session(payload, FakeSession(records))


def _post_with_session(payload, session):
    def override_db():
        yield session

    app.dependency_overrides[get_db] = override_db
    try:
        response = TestClient(app).post("/map/v1/projection", json=payload)
    finally:
        app.dependency_overrides.clear()
    return response, session


def _feature(entity, identifier):
    return {"entity": entity, "id": str(identifier)}


def test_map_projection_endpoint_exists_and_accepts_typed_place_stop_route_ids():
    place = _place(location=WKTElement("POINT(85.81 20.29)", srid=4326))
    stop = _stop(location=WKTElement("POINT(85.82 20.30)", srid=4326))
    route = _route(
        geometry=WKTElement("LINESTRING(85.80 20.28, 85.83 20.31)", srid=4326)
    )

    response, session = _post(
        {
            "requested_features": [
                _feature("place", place.id),
                _feature("stop", stop.id),
                _feature("route", route.id),
            ]
        },
        [place, stop, route],
    )

    assert response.status_code == 200
    body = response.json()
    assert body["requested_features"] == [
        _feature("place", place.id),
        _feature("stop", stop.id),
        _feature("route", route.id),
    ]
    assert [item["feature_type"] for item in body["features"]] == [
        "place",
        "stop",
        "route_line",
    ]
    assert body["relationships"] == []
    assert body["unavailable_items"] == []
    assert {(model.__name__, identifier) for model, identifier in session.calls} == {
        ("Place", place.id),
        ("Stop", stop.id),
        ("Route", route.id),
    }


@pytest.mark.parametrize("entity", ["stop", "route"])
def test_typed_uuid_binding_does_not_cross_entity_namespaces(entity):
    place = _place(location=WKTElement("POINT(85.81 20.29)", srid=4326))
    response, _ = _post({"requested_features": [_feature(entity, place.id)]}, [place])

    assert response.status_code == 200
    assert response.json()["features"] == []
    assert response.json()["unavailable_items"] == [
        {
            "item_type": "feature",
            "ref": _feature(entity, place.id),
            "unavailable_reason": "identity_unresolved",
        }
    ]


@pytest.mark.parametrize(
    "identifier",
    ["not-a-uuid", "bqs_jb", "slno", "objectid_1", "BHUBANESWAR RLY. STN.", "Route 12"],
)
def test_malformed_or_alternate_identifier_is_422_before_resolution(identifier):
    response, session = _post(
        {"requested_features": [{"entity": "stop", "id": identifier}]}
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert session.calls == []


def test_generic_provider_identifier_is_rejected_before_resolution():
    response, session = _post(
        {"requested_features": [{"entity": "stop", "id": "provider-stop-001"}]}
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert session.calls == []


def test_valid_nonexistent_typed_uuid_has_explicit_unavailable_coverage():
    identifier = uuid4()
    response, _ = _post({"requested_features": [_feature("place", identifier)]})

    assert response.status_code == 200
    assert response.json()["features"] == []
    assert response.json()["unavailable_items"][0]["unavailable_reason"] == "identity_unresolved"


def test_duplicate_typed_uuid_requests_are_rejected_before_resolution():
    identifier = uuid4()
    response, session = _post(
        {
            "requested_features": [
                _feature("place", identifier),
                _feature("place", identifier),
            ]
        }
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert session.calls == []


def test_authorized_null_geometry_is_successful_and_unavailable():
    place = _place(location=None)
    response, _ = _post({"requested_features": [_feature("place", place.id)]}, [place])

    assert response.status_code == 200
    assert response.json()["features"] == [
        {
            "feature_type": "place",
            "canonical_ref": _feature("place", place.id),
            "geometry_status": "unavailable",
            "geometry": None,
            "unavailable_reason": "coordinate_unverified",
        }
    ]


def test_invalid_backend_geometry_returns_structured_422():
    place = _place(location=WKTElement("POINT(185.0 20.29)", srid=4326))
    response, _ = _post({"requested_features": [_feature("place", place.id)]}, [place])

    assert response.status_code == 422
    assert response.json()["error"] == {
        "code": "invalid_geometry",
        "message": "Backend geometry is not valid WGS84 geometry",
        "field": "place.geometry",
    }


@pytest.mark.parametrize("srid", [None, -1])
def test_crs_ambiguous_backend_geometry_is_rejected(srid):
    place = _place(location=WKTElement("POINT(85.81 20.29)", srid=srid))
    response, _ = _post({"requested_features": [_feature("place", place.id)]}, [place])

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_geometry"


def test_invalid_backend_linestring_is_rejected():
    route = _route(geometry=WKTElement("LINESTRING(85.81 20.29)", srid=4326))
    response, _ = _post({"requested_features": [_feature("route", route.id)]}, [route])

    assert response.status_code == 422
    assert response.json()["error"] == {
        "code": "invalid_geometry",
        "message": "Backend geometry is not valid WGS84 geometry",
        "field": "route.geometry",
    }


@pytest.mark.parametrize("coordinate", ["nan", "inf", "-inf"])
def test_non_finite_backend_coordinates_are_rejected(coordinate):
    place = _place(location=WKTElement(f"POINT({coordinate} 20.29)", srid=4326))
    response, _ = _post({"requested_features": [_feature("place", place.id)]}, [place])

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_geometry"


def test_boolean_backend_coordinates_are_rejected():
    place = _place(location=WKTElement("POINT(True 20.29)", srid=4326))
    response, _ = _post({"requested_features": [_feature("place", place.id)]}, [place])

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_geometry"


def test_string_backend_coordinates_are_rejected():
    place = _place(location=WKTElement('POINT("85.81" 20.29)', srid=4326))
    response, _ = _post({"requested_features": [_feature("place", place.id)]}, [place])

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_geometry"


def test_partial_backend_coordinates_are_rejected():
    place = _place(location=WKTElement("POINT(85.81)", srid=4326))
    response, _ = _post({"requested_features": [_feature("place", place.id)]}, [place])

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_geometry"


@pytest.mark.parametrize(
    "extra",
    [
        {"geometry": {"type": "Point", "coordinates": [85.0, 20.0]}},
        {"approved_features": []},
        {"canonical_ref": {"entity": "place", "id": str(uuid4())}},
        {"source": "BhubaneswarOne"},
        {"canonical_stop_id": "provider-only-id"},
        {"itinerary_id": str(uuid4())},
    ],
)
def test_client_supplied_geometry_authority_identity_provenance_or_persistence_is_rejected(extra):
    place = _place(location=WKTElement("POINT(85.81 20.29)", srid=4326))
    payload = {"requested_features": [_feature("place", place.id)], **extra}
    response, session = _post(payload, [place])

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert session.calls == []


@pytest.mark.parametrize("field", ["requested_hops", "legs", "route_stops", "relationships"])
def test_client_hop_leg_relationship_or_routestop_context_is_rejected(field):
    payload = {
        "requested_features": [{"entity": "place", "id": str(uuid4())}],
        field: [],
    }
    response, session = _post(payload)

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "unsupported_relationship"
    assert session.calls == []


def test_route_display_identity_and_routestop_are_not_exposed():
    route = _route()
    response, _ = _post({"requested_features": [_feature("route", route.id)]}, [route])

    assert response.status_code == 200
    body = response.json()
    assert body["relationships"] == []
    assert all("route_ref" not in item for item in body["features"])
    assert "RouteStop" not in str(body)
    assert "provider-only-id" not in str(body)


def test_response_exposes_no_detailed_provenance_or_internal_authorization():
    place = _place(location=WKTElement("POINT(85.81 20.29)", srid=4326))
    response, _ = _post({"requested_features": [_feature("place", place.id)]}, [place])

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"requested_features", "features", "relationships", "unavailable_items"}
    assert "authorized_ref" not in str(body)
    assert "source" not in str(body)
    assert "research_id" not in str(body)
    assert "canonical_stop_id" not in str(body)
    assert "objectid" not in str(body)


def test_repeated_http_response_is_deterministic():
    place = _place(location=WKTElement("POINT(85.81 20.29)", srid=4326))
    payload = {"requested_features": [_feature("place", place.id)]}

    first, _ = _post(payload, [place])
    second, _ = _post(payload, [place])

    assert first.status_code == second.status_code == 200
    assert first.json() == second.json()


def test_empty_feature_set_uses_accepted_structured_error():
    response, session = _post({"requested_features": []})

    assert response.status_code == 422
    assert response.json()["error"] == {
        "code": "empty_requested_feature_set",
        "message": "requested_features must contain at least one feature",
        "field": "requested_features",
    }
    assert session.calls == []


def test_internal_projection_failure_uses_structured_500(monkeypatch):
    def fail(_request):
        raise RuntimeError("unexpected projection failure")

    monkeypatch.setattr("app.geospatial.http_adapter.project_map", fail)
    response, _ = _post({"requested_features": [{"entity": "place", "id": str(uuid4())}]})

    assert response.status_code == 500
    assert response.json()["error"] == {
        "code": "internal_projection_error",
        "message": "Map projection failed",
        "field": None,
    }


class FailingLookupSession:
    def __init__(self):
        self.calls = []

    def get(self, model, identifier):
        self.calls.append((model, identifier))
        raise SQLAlchemyError("lookup failed")


def test_expected_lookup_failure_uses_structured_500():
    session = FailingLookupSession()
    response, _ = _post_with_session(
        {"requested_features": [{"entity": "place", "id": str(uuid4())}]},
        session,
    )

    assert response.status_code == 500
    assert response.json()["error"] == {
        "code": "internal_projection_error",
        "message": "Map projection failed",
        "field": None,
    }
    assert len(session.calls) == 1
