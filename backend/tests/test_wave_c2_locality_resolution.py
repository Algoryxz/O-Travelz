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


# =========================================================================
# WAVE C2.1 TESTS — LOCALITY ACCOUNTING & FIVE-REGION GAP CLOSURE
# =========================================================================

DISCREPANCY_FILE = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus" / "coordinate_overlap_discrepancy.json"
REGIONAL_COVERAGE_FILE = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus" / "regional_stop_coverage.json"


def test_coordinate_overlap_discrepancy_accounting():
    assert DISCREPANCY_FILE.exists(), f"Missing {DISCREPANCY_FILE}"
    with open(DISCREPANCY_FILE, encoding="utf-8") as f:
        records = json.load(f)

    # 1. Total candidate overlap links evaluated MUST be 43
    assert len(records) == 43

    # 2. Included in C2 resolutions MUST be exactly 40
    included = [r for r in records if r["included_in_c2"]]
    assert len(included) == 40
    for r in included:
        assert r["exclusion_reason"] is None
        assert r["lat"] is not None
        assert r["lon"] is not None
        assert r["coordinate_status"] in {
            "VERIFIED_OFFICIAL",
            "VERIFIED_GEOSPATIAL",
            "EXTRACTION_OFFICIAL_RECOVERY",
            "EXTRACTION_PUBLIC_GEOSPATIAL",
        }

    # 3. Excluded records MUST be exactly 3 with explicit forensic reasons
    excluded = [r for r in records if not r["included_in_c2"]]
    assert len(excluded) == 3
    excluded_names = {r["staging_name"] for r in excluded}
    assert excluded_names == {"AINTHAPALI BUS TERMINAL", "PADIABAHAL", "KHETRAJPUR RLY. STATION"}

    for r in excluded:
        assert r["exclusion_reason"] is not None and len(r["exclusion_reason"]) > 20
        assert r["match_method"] in {"RAW_EXTRACTION_OVERLAP", "CANONICAL_ALIAS_MATCH"}


def test_five_region_stop_universe_coverage():
    assert REGIONAL_COVERAGE_FILE.exists(), f"Missing {REGIONAL_COVERAGE_FILE}"
    with open(REGIONAL_COVERAGE_FILE, encoding="utf-8") as f:
        data = json.load(f)

    net = data["network_totals"]
    assert net["total_regions"] == 5
    assert net["total_source_documents"] == 9
    assert net["total_staged_routes"] == 153
    assert net["total_extracted_stops"] == 1430
    assert net["total_staged_stops"] == 481
    assert net["total_missing_staging_stops"] == 949
    assert net["total_coordinate_resolved_stops"] == 40
    assert net["total_locality_only_stops"] == 441

    # Regional breakdown assertions
    reg_map = {r["region"]: r for r in data["regions"]}
    assert set(reg_map.keys()) == {
        "CAPITAL_REGION",
        "ROURKELA",
        "SAMBALPUR",
        "BERHAMPUR",
        "KEONJHAR",
    }

    assert reg_map["CAPITAL_REGION"]["staged_routes_count"] == 95
    assert reg_map["CAPITAL_REGION"]["extracted_stops_count"] == 362
    assert reg_map["CAPITAL_REGION"]["staging_stops_count"] == 0
    assert reg_map["CAPITAL_REGION"]["missing_staging_stops_count"] == 362

    assert reg_map["ROURKELA"]["staged_routes_count"] == 25
    assert reg_map["ROURKELA"]["extracted_stops_count"] == 294
    assert reg_map["ROURKELA"]["staging_stops_count"] == 0
    assert reg_map["ROURKELA"]["missing_staging_stops_count"] == 294

    assert reg_map["SAMBALPUR"]["staged_routes_count"] == 17
    assert reg_map["SAMBALPUR"]["extracted_stops_count"] == 374
    assert reg_map["SAMBALPUR"]["staging_stops_count"] == 374
    assert reg_map["SAMBALPUR"]["coordinate_resolved_count"] == 33
    assert reg_map["SAMBALPUR"]["locality_only_count"] == 341
    assert reg_map["SAMBALPUR"]["missing_staging_stops_count"] == 0

    assert reg_map["BERHAMPUR"]["staged_routes_count"] == 10
    assert reg_map["BERHAMPUR"]["extracted_stops_count"] == 293
    assert reg_map["BERHAMPUR"]["staging_stops_count"] == 0
    assert reg_map["BERHAMPUR"]["missing_staging_stops_count"] == 293

    assert reg_map["KEONJHAR"]["staged_routes_count"] == 6
    assert reg_map["KEONJHAR"]["extracted_stops_count"] == 107
    assert reg_map["KEONJHAR"]["staging_stops_count"] == 107
    assert reg_map["KEONJHAR"]["coordinate_resolved_count"] == 7
    assert reg_map["KEONJHAR"]["locality_only_count"] == 100
    assert reg_map["KEONJHAR"]["missing_staging_stops_count"] == 0


def test_explicit_region_resolver():
    import sys
    sys.path.insert(0, str(REPO_ROOT))
    from scripts.enrich_ama_bus_localities import resolve_region

    assert resolve_region("Sambalpur Service Area") == "SAMBALPUR"
    assert resolve_region("Keonjhar Urban") == "KEONJHAR"
    assert resolve_region("Rourkela Steel City") == "ROURKELA"
    assert resolve_region("Berhampur Silk City") == "BERHAMPUR"
    assert resolve_region("Brahmapur") == "BERHAMPUR"
    assert resolve_region("Bhubaneswar Smart City") == "CAPITAL_REGION"
    assert resolve_region("Cuttack Silver City") == "CAPITAL_REGION"
    assert resolve_region("Puri Coastal") == "CAPITAL_REGION"
    assert resolve_region("Capital Region Transit") == "CAPITAL_REGION"

    # UNKNOWN MUST remain UNKNOWN without guessing
    assert resolve_region("Kolkata") == "UNKNOWN"
    assert resolve_region("Hyderabad") == "UNKNOWN"
    assert resolve_region(None, None, None) == "UNKNOWN"
    assert resolve_region("", "", "") == "UNKNOWN"

