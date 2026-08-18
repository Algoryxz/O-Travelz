from uuid import UUID, uuid4

import pytest
from pydantic import ValidationError

from app.geospatial.projection import project_map
from app.db.base import Base  # noqa: F401
from app.schemas.map_projection import (
    ApprovedFeatureGeometry,
    AuthorizedCanonicalRef,
    CanonicalRef,
    LineStringGeometry,
    MapProjectionRequest,
    PointGeometry,
    RequestedHopContext,
)
from app.schemas.transport import DataTier
from app.models.place import Place
from app.models.transport import Route, Stop


def _ref(entity: str, identifier: str) -> CanonicalRef:
    return CanonicalRef(entity=entity, id=identifier)


def _place_record(identifier: UUID | None = None) -> Place:
    return Place(
        id=identifier or uuid4(),
        name="Approved test place",
        category_id=uuid4(),
        source="approved backend test fixture",
    )


def _stop_record(identifier: UUID | None = None) -> Stop:
    return Stop(
        id=identifier or uuid4(),
        provider_id=uuid4(),
        name="Approved test stop",
        canonical_stop_id="provider-only-id",
    )


def _route_record(identifier: UUID | None = None) -> Route:
    return Route(
        id=identifier or uuid4(),
        provider_id=uuid4(),
        name="Approved test route",
    )


def _approved(
    record: Place | Stop | Route,
    geometry=None,
    unavailable_reason=None,
) -> ApprovedFeatureGeometry:
    return ApprovedFeatureGeometry(
        authorized_ref=AuthorizedCanonicalRef.from_backend_record(record),
        geometry=geometry,
        unavailable_reason=unavailable_reason,
    )


def _place_point(identifier: UUID | None = None) -> ApprovedFeatureGeometry:
    return ApprovedFeatureGeometry(
        authorized_ref=AuthorizedCanonicalRef.from_backend_record(_place_record(identifier)),
        geometry=PointGeometry(type="Point", coordinates=[85.833611, 20.238333]),
    )


def test_verified_place_point_is_emitted_with_place_id():
    approved = _place_point()
    place_ref = approved.authorized_ref.canonical_ref
    response = project_map(
        MapProjectionRequest(
            requested_features=[place_ref],
            approved_features=[approved],
        )
    )

    assert response.features[0].feature_type == "place"
    assert response.features[0].canonical_ref == place_ref
    assert response.features[0].geometry_status == "available"
    assert response.features[0].geometry.model_dump(mode="json") == {
        "type": "Point",
        "coordinates": [85.833611, 20.238333],
    }


def test_null_place_geometry_is_a_valid_unavailable_feature():
    record = _place_record()
    place_ref = AuthorizedCanonicalRef.from_backend_record(record).canonical_ref
    response = project_map(
        MapProjectionRequest(
            requested_features=[place_ref],
            approved_features=[
                _approved(record, unavailable_reason="coordinate_unverified")
            ],
        )
    )

    feature = response.features[0]
    assert feature.geometry_status == "unavailable"
    assert feature.geometry is None
    assert feature.unavailable_reason == "coordinate_unverified"


def test_stop_identity_is_database_id_and_not_provider_canonical_id():
    record = _stop_record()
    stop_ref = AuthorizedCanonicalRef.from_backend_record(record).canonical_ref
    response = project_map(
        MapProjectionRequest(
            requested_features=[stop_ref],
            approved_features=[
                _approved(record, unavailable_reason="coordinate_unverified")
            ],
        )
    )
    assert response.features[0].canonical_ref.id == str(record.id)
    assert response.features[0].canonical_ref.id != record.canonical_stop_id

    with pytest.raises(ValidationError):
        ApprovedFeatureGeometry(
            canonical_stop_id="provider-only-id",
            geometry=None,
            unavailable_reason="identity_unresolved",
        )


def test_route_identity_is_database_id_and_geometry_is_a_route_line():
    record = _route_record()
    route_ref = AuthorizedCanonicalRef.from_backend_record(record).canonical_ref
    response = project_map(
        MapProjectionRequest(
            requested_features=[route_ref],
            approved_features=[
                _approved(
                    record,
                    geometry=LineStringGeometry(
                        type="LineString", coordinates=[[85.1, 20.1], [85.2, 20.2]]
                    ),
                )
            ],
        )
    )
    assert response.features[0].feature_type == "route_line"
    assert response.features[0].canonical_ref.id == str(record.id)


def test_transport_route_text_stays_display_only():
    response = project_map(
        MapProjectionRequest(
            requested_hops=[
                RequestedHopContext(
                    day_number=1,
                    hop={
                        "from_sequence": 0,
                        "to_sequence": 1,
                        "mode": "provider",
                        "legs": [
                            {
                                "mode": "provider",
                                "detail": "Existing transport instruction",
                                "provider": "contract-fixture-provider",
                                "route": "Route 12",
                            }
                        ],
                        "data_tier": "scheduled",
                    },
                )
            ]
        )
    )
    leg = response.relationships[0].legs[0]
    assert leg.route == "Route 12"
    assert leg.route_ref is None
    assert leg.stop_refs == []


def test_hop_and_legs_are_ordered_relationship_status_data_only():
    response = project_map(
        MapProjectionRequest(
            requested_hops=[
                RequestedHopContext(
                    day_number=1,
                    hop={
                        "from_sequence": 0,
                        "to_sequence": 1,
                        "mode": "walk+provider+walk",
                        "reason": "Existing hop reason",
                        "legs": [
                            {"mode": "walk", "detail": "first"},
                            {"mode": "provider", "detail": "second", "route": "display-only"},
                            {"mode": "walk", "detail": "third"},
                        ],
                        "data_tier": "static",
                    },
                )
            ]
        )
    )

    relationship = response.relationships[0]
    assert relationship.relationship_type == "itinerary_hop"
    assert relationship.hop_ref.from_sequence == 0
    assert relationship.hop_ref.to_sequence == 1
    assert relationship.mode == "walk+provider+walk"
    assert relationship.data_tier is DataTier.STATIC
    assert relationship.reason == "Existing hop reason"
    assert [leg.detail for leg in relationship.legs] == ["first", "second", "third"]
    assert all(leg.geometry is None for leg in relationship.legs)
    assert all(leg.geometry_status == "unavailable" for leg in relationship.legs)
    assert [leg.unavailable_reason for leg in relationship.legs] == [
        "source_missing",
        "provider_geometry_unavailable",
        "source_missing",
    ]
    assert response.features == []
    assert "feature_id" not in response.model_dump(mode="json")
    assert "leg_index" not in response.model_dump(mode="json")


def test_route_stop_relationship_is_not_created_without_explicit_approved_binding():
    response = project_map(MapProjectionRequest())
    assert response.relationships == []
    assert all(item.get("relationship_type") != "route_stop" for item in response.model_dump(mode="json")["relationships"])

    with pytest.raises(ValidationError):
        MapProjectionRequest(route_stops=[{"route_id": "r", "stop_id": "s", "sequence_order": 1}])


def test_supplied_linestring_preserves_order():
    line = LineStringGeometry(
        type="LineString",
        coordinates=[[85.1, 20.1], [85.2, 20.2], [85.3, 20.3]],
    )
    assert line.coordinates == [(85.1, 20.1), (85.2, 20.2), (85.3, 20.3)]


@pytest.mark.parametrize(
    "geometry",
    [
        {"type": "Point", "coordinates": [85.0, None]},
        {"type": "Point", "coordinates": ["85.0", 20.0]},
        {"type": "Point", "coordinates": [True, 20.0]},
        {"type": "Point", "coordinates": [float("nan"), 20.0]},
        {"type": "Point", "coordinates": [85.0, float("inf")]},
        {"type": "Point", "coordinates": [180.1, 20.0]},
        {"type": "Point", "coordinates": [85.0, 90.1]},
        {"type": "LineString", "coordinates": [[85.0, 20.0]]},
        {"type": "LineString", "coordinates": [[85.0, 20.0], [181.0, 20.0]]},
    ],
)
def test_malformed_or_invalid_geometry_is_rejected(geometry):
    with pytest.raises(ValidationError):
        if geometry["type"] == "Point":
            PointGeometry.model_validate(geometry)
        else:
            LineStringGeometry.model_validate(geometry)


def test_crs_ambiguous_geometry_and_raw_provenance_are_rejected():
    with pytest.raises(ValidationError):
        PointGeometry.model_validate(
            {"type": "Point", "coordinates": [85.0, 20.0], "crs": "EPSG:3857"}
        )
    with pytest.raises(ValidationError):
        ApprovedFeatureGeometry(
            canonical_ref=_ref("place", "place-1"),
            geometry=None,
            unavailable_reason="source_missing",
            source="BhubaneswarOne",
        )


def test_null_geometry_is_not_replaced_by_placeholder_centroid_endpoint_or_geocode():
    record = _route_record()
    route_ref = AuthorizedCanonicalRef.from_backend_record(record).canonical_ref
    response = project_map(
        MapProjectionRequest(
            requested_features=[route_ref],
            approved_features=[_approved(record, unavailable_reason="source_missing")],
        )
    )
    feature = response.features[0]
    assert feature.geometry is None
    assert feature.geometry_status == "unavailable"


def test_every_requested_feature_is_covered_once():
    approved = _place_point()
    requested = [approved.authorized_ref.canonical_ref, _ref("stop", "missing")]
    response = project_map(
        MapProjectionRequest(
            requested_features=requested,
            approved_features=[approved],
        )
    )
    covered = [
        (item.canonical_ref.entity, item.canonical_ref.id) for item in response.features
    ] + [
        (item.ref.entity, item.ref.id)
        for item in response.unavailable_items
        if item.item_type == "feature"
    ]
    assert covered == [
        ("place", approved.authorized_ref.canonical_ref.id),
        ("stop", "missing"),
    ]


def test_name_gis_id_endpoint_and_stop_order_inputs_are_not_promoted():
    request = MapProjectionRequest(
        requested_features=[
            _ref("stop", "bqs_jb"),
            _ref("stop", "objectid_1"),
            _ref("stop", "BHUBANESWAR RLY. STN."),
            _ref("route", "Route 12"),
            _ref("stop", "endpoint-match"),
            _ref("stop", "source-row-1"),
        ]
    )
    response = project_map(request)
    assert response.features == []
    assert len(response.unavailable_items) == len(request.requested_features)
    assert all(item.unavailable_reason == "identity_unresolved" for item in response.unavailable_items)


@pytest.mark.parametrize(
    ("entity", "identifier"),
    [
        ("stop", "bqs_jb"),
        ("stop", "objectid"),
        ("stop", "objectid_1"),
        ("stop", "slno"),
        ("stop", "BHUBANESWAR RLY. STN."),
        ("route", "Route 12"),
        ("stop", "arbitrary-provider-identifier"),
    ],
)
def test_forbidden_purported_approved_identifiers_cannot_be_promoted(
    entity: str, identifier: str
):
    ref = _ref(entity, identifier)
    geometry = (
        PointGeometry(type="Point", coordinates=[85.0, 20.0])
        if entity == "stop"
        else LineStringGeometry(type="LineString", coordinates=[[85.0, 20.0], [85.1, 20.1]])
    )

    with pytest.raises(ValidationError):
        ApprovedFeatureGeometry(canonical_ref=ref, geometry=geometry)

    response = project_map(MapProjectionRequest(requested_features=[ref]))
    assert response.features == []
    assert len(response.unavailable_items) == 1
    assert response.unavailable_items[0].unavailable_reason == "identity_unresolved"


def test_projection_is_deterministic_and_exposes_no_provenance_fields():
    approved = _place_point()
    request = MapProjectionRequest(
        requested_features=[approved.authorized_ref.canonical_ref],
        approved_features=[approved],
    )
    first = project_map(request).model_dump(mode="json")
    second = project_map(request).model_dump(mode="json")
    assert first == second
    assert set(first) == {"requested_features", "features", "relationships", "unavailable_items"}
    assert set(first["features"][0]) == {
        "feature_type",
        "canonical_ref",
        "geometry_status",
        "geometry",
        "unavailable_reason",
    }
