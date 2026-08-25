import json
from pathlib import Path

import pytest

from app.geospatial.validation import (
    GeometryValidationError,
    validate_coordinate,
    validate_linestring,
    validate_optional_coordinate,
)
from app.schemas.transport import DataTier, TransportHopContract


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "geospatial_cases.json"


@pytest.fixture(scope="module")
def geospatial_cases():
    return json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))


def test_known_verified_place_uses_longitude_as_x(geospatial_cases):
    point = geospatial_cases["known_place_point"]
    assert point["source_status"] == "verified"
    assert validate_coordinate(point["lon"], point["lat"]) == (85.833611, 20.238333)


def test_null_place_and_stop_geometry_stays_unknown(geospatial_cases):
    for key in ("missing_place_point", "missing_stop_point"):
        point = geospatial_cases[key]
        assert validate_optional_coordinate(point["lon"], point["lat"]) is None


def test_missing_route_geometry_does_not_create_a_line(geospatial_cases):
    assert geospatial_cases["missing_route_geometry"]["geometry"] is None
    assert validate_linestring(None) is None


def test_supplied_linestring_is_validated_without_reordering():
    supplied = ((85.1, 20.1), (85.2, 20.2))
    assert validate_linestring(supplied) == supplied


@pytest.mark.parametrize(
    ("longitude", "latitude"),
    [
        (180.1, 20.0),
        (85.0, 90.1),
        (float("nan"), 20.0),
        (85.0, float("inf")),
        ("85.0", 20.0),
        (False, 20.0),
    ],
)
def test_invalid_coordinates_are_rejected(longitude, latitude):
    with pytest.raises(GeometryValidationError):
        validate_coordinate(longitude, latitude)


def test_partial_null_coordinate_is_rejected():
    with pytest.raises(GeometryValidationError, match="provided together"):
        validate_optional_coordinate(85.0, None)


def test_linestring_needs_two_positions_and_valid_positions():
    with pytest.raises(GeometryValidationError, match="at least two"):
        validate_linestring(((85.0, 20.0),))
    with pytest.raises(GeometryValidationError, match="position 1"):
        validate_linestring(((85.0, 20.0), (181.0, 20.0)))


def test_synthetic_multimodal_fixture_preserves_order_provider_and_static_tier(
    geospatial_cases,
):
    hop = TransportHopContract.model_validate(
        geospatial_cases["synthetic_multimodal_hop"]["contract"]
    )
    assert [leg.mode for leg in hop.legs] == ["walk", "provider", "walk"]
    assert hop.legs[1].provider == "contract-fixture-provider"
    assert hop.legs[1].route == "contract-fixture-route"
    assert hop.data_tier.value == "static"


def test_unavailable_fixture_preserves_explicit_reason(geospatial_cases):
    hop = TransportHopContract.model_validate(
        geospatial_cases["synthetic_unavailable_hop"]["contract"]
    )
    assert hop.mode == "unavailable"
    assert hop.data_tier is DataTier.UNKNOWN
    assert hop.reason
