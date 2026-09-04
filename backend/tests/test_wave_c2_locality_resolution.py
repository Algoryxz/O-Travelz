"""
Unit & Integration Tests for Wave C2: Ama Bus Geo + Locality Resolution Pipeline.

Verifies:
1. TRN_LOCALITY_WITHOUT_PROVENANCE
2. TRN_LOCALITY_INVALID_STATE
3. TRN_LOCALITY_EXACT_PIN_WITHOUT_COORDINATE
4. TRN_FIRST_MILE_ON_LOCALITY_ONLY
5. TRN_BIGDATACLOUD_WITHOUT_INPUT_COORDINATE
6. Decoupled coordinate vs locality truth contract
7. Staged locality_resolution.json dataset schema & validity
"""
import json
from pathlib import Path
import pytest

from app.validation import codes
from app.validation.models import ValidationProfile, ValidationReport, ValidationSeverity
from app.validation.domains.transit import validate_transit_stop

REPO_ROOT = Path(__file__).resolve().parents[2]
LOCALITY_RESOLUTION_FILE = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus" / "locality_resolution.json"


@pytest.fixture
def empty_report():
    return ValidationReport(profile=ValidationProfile.PROMOTION)


def test_trn_locality_without_provenance(empty_report):
    stop = {
        "stop_id": "stop_test_01",
        "canonical_name": "TEST STOP",
        "locality": {
            "city": "Sambalpur",
            "district": "Sambalpur",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": None,  # Missing source
    }
    validate_transit_stop(stop, empty_report)
    assert any(i.code == codes.TRN_LOCALITY_WITHOUT_PROVENANCE for i in empty_report.issues)


def test_trn_locality_invalid_state(empty_report):
    stop = {
        "stop_id": "stop_test_02",
        "canonical_name": "TEST STOP",
        "locality": {
            "city": "Unknown",
            "district": "Unknown",
            "state": "California",  # Invalid state for Odisha transit
            "country": "USA",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": "test_doc",
        "evidence": [{"source_document": "test.pdf", "page": 1}],
    }
    validate_transit_stop(stop, empty_report)
    assert any(i.code == codes.TRN_LOCALITY_INVALID_STATE for i in empty_report.issues)


def test_trn_locality_exact_pin_without_coordinate(empty_report):
    stop = {
        "stop_id": "stop_test_03",
        "canonical_name": "UNMAPPED CHOWK",
        "coordinate": {
            "lat": None,
            "lon": None,
            "status": "UNRESOLVED",
            "source": None,
        },
        "locality": {
            "city": "Sambalpur",
            "district": "Sambalpur",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": "official_pdf",
        "evidence": [{"source_document": "sambalpur.pdf", "page": 1}],
        "map_behavior": {
            "render_exact_marker": True,  # ILLEGAL: claiming exact pin on unlocated stop
        },
    }
    validate_transit_stop(stop, empty_report)
    assert any(i.code == codes.TRN_LOCALITY_EXACT_PIN_WITHOUT_COORDINATE for i in empty_report.issues)


def test_trn_first_mile_on_locality_only(empty_report):
    stop = {
        "stop_id": "stop_test_04",
        "canonical_name": "VILLAGE STOP",
        "lat": None,
        "lon": None,
        "coordinate_status": "UNRESOLVED",
        "locality": {
            "city": "Keonjhar",
            "district": "Keonjhar",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": "official_pdf",
        "evidence": [{"source_document": "keonjhar.pdf", "page": 1}],
        "map_behavior": {
            "render_exact_marker": False,
            "participates_in_first_mile": True,  # ILLEGAL: first-mile distance without coordinates
        },
    }
    validate_transit_stop(stop, empty_report)
    assert any(i.code == codes.TRN_FIRST_MILE_ON_LOCALITY_ONLY for i in empty_report.issues)


def test_trn_bigdatacloud_without_input_coordinate(empty_report):
    stop = {
        "stop_id": "stop_test_05",
        "canonical_name": "GHOST BDC STOP",
        "lat": None,
        "lon": None,
        "coordinate_status": "UNRESOLVED",
        "locality": {
            "city": "Sambalpur",
            "district": "Sambalpur",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "VERIFIED_LOCALITY",
        "locality_source": "bigdatacloud_reverse_geocode",  # ILLEGAL: BDC claimed without coordinates
        "evidence": [],
    }
    validate_transit_stop(stop, empty_report)
    assert any(i.code == codes.TRN_BIGDATACLOUD_WITHOUT_INPUT_COORDINATE for i in empty_report.issues)


def test_valid_locality_stop_passes(empty_report):
    stop = {
        "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
        "canonical_name": "AINTHAPALI CHOWK",
        "coordinate": {
            "lat": None,
            "lon": None,
            "status": "UNRESOLVED",
            "source": None,
        },
        "locality": {
            "locality": None,
            "city": "Sambalpur",
            "district": "Sambalpur",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": "official_schedule_pdf",
        "locality_confidence": "HIGH",
        "map_behavior": {
            "render_exact_marker": False,
            "participates_in_first_mile": False,
            "display_notice": "Location not precisely mapped",
            "service_area_label": "Service area: Sambalpur",
        },
        "topology_behavior": {
            "participates_in_route_sequence": True,
        },
        "evidence": [
            {
                "source_document": "Sambalpur-Ama-Bus-Stoppage-Details-5-7-2026.pdf",
                "page": 1,
            }
        ],
    }
    validate_transit_stop(stop, empty_report)
    errors = [i for i in empty_report.issues if i.severity == ValidationSeverity.ERROR]
    assert len(errors) == 0


def test_staged_locality_resolution_dataset():
    assert LOCALITY_RESOLUTION_FILE.exists(), f"Missing {LOCALITY_RESOLUTION_FILE}"
    with open(LOCALITY_RESOLUTION_FILE, encoding="utf-8") as f:
        records = json.load(f)

    assert len(records) == 481

    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    for r in records:
        validate_transit_stop(r, report)
        # Verify schema invariants
        assert "stop_id" in r and r["stop_id"]
        assert "canonical_name" in r and r["canonical_name"]
        assert "coordinate" in r
        assert r["coordinate"]["status"] in {"VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL", "UNRESOLVED"}
        assert "locality" in r
        assert r["locality_status"] in {"VERIFIED_LOCALITY", "OFFICIAL_SERVICE_AREA", "ROUTE_CONTEXT_ONLY", "UNRESOLVED"}
        assert "map_behavior" in r
        assert "topology_behavior" in r

    errors = [i for i in report.issues if i.severity == ValidationSeverity.ERROR]
    assert len(errors) == 0, f"Found {len(errors)} validation errors in locality_resolution.json: {[e.message for e in errors[:5]]}"
