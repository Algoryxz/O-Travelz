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
    # In PROMOTION profile, exactly 1 blocking error is expected: the known Keonjhar DHH coordinate mismatch
    assert len(errors) == 1, f"Expected exactly 1 promotion error, got {len(errors)}: {[e.message for e in errors]}"
    assert errors[0].code == codes.TRN_COORDINATE_SERVICE_AREA_MISMATCH
    assert errors[0].entity_id == "stop_crut_keonjhar_district_hospital"

    # In AUDIT profile, this issue is a non-blocking WARNING and total errors must be 0
    audit_report = ValidationReport(profile=ValidationProfile.AUDIT)
    for r in records:
        validate_transit_stop(r, audit_report)
    audit_errors = [i for i in audit_report.issues if i.severity == ValidationSeverity.ERROR]
    assert len(audit_errors) == 0


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
    assert net["total_extracted_records"] == 1430
    assert net["total_distinct_published_names"] == 1417
    assert net["total_staged_stops"] == 481
    assert net["missing_extracted_records"] == 949
    assert net["missing_distinct_published_names"] == 944
    assert net["missing_region_stop_candidates"] == 939
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
    assert reg_map["CAPITAL_REGION"]["extracted_records_count"] == 362
    assert reg_map["CAPITAL_REGION"]["distinct_published_names_count"] == 358
    assert reg_map["CAPITAL_REGION"]["staging_stops_count"] == 0
    assert reg_map["CAPITAL_REGION"]["missing_extracted_records"] == 362
    assert reg_map["CAPITAL_REGION"]["missing_distinct_published_names"] == 358

    assert reg_map["ROURKELA"]["staged_routes_count"] == 25
    assert reg_map["ROURKELA"]["extracted_records_count"] == 294
    assert reg_map["ROURKELA"]["distinct_published_names_count"] == 294
    assert reg_map["ROURKELA"]["staging_stops_count"] == 0
    assert reg_map["ROURKELA"]["missing_extracted_records"] == 294
    assert reg_map["ROURKELA"]["missing_distinct_published_names"] == 294

    assert reg_map["SAMBALPUR"]["staged_routes_count"] == 17
    assert reg_map["SAMBALPUR"]["extracted_records_count"] == 374
    assert reg_map["SAMBALPUR"]["staging_stops_count"] == 374
    assert reg_map["SAMBALPUR"]["coordinate_resolved_count"] == 33
    assert reg_map["SAMBALPUR"]["locality_only_count"] == 341
    assert reg_map["SAMBALPUR"]["missing_extracted_records"] == 0

    assert reg_map["BERHAMPUR"]["staged_routes_count"] == 10
    assert reg_map["BERHAMPUR"]["extracted_records_count"] == 293
    assert reg_map["BERHAMPUR"]["distinct_published_names_count"] == 292
    assert reg_map["BERHAMPUR"]["staging_stops_count"] == 0
    assert reg_map["BERHAMPUR"]["missing_extracted_records"] == 293
    assert reg_map["BERHAMPUR"]["missing_distinct_published_names"] == 292

    assert reg_map["KEONJHAR"]["staged_routes_count"] == 6
    assert reg_map["KEONJHAR"]["extracted_records_count"] == 107
    assert reg_map["KEONJHAR"]["staging_stops_count"] == 107
    assert reg_map["KEONJHAR"]["coordinate_resolved_count"] == 7
    assert reg_map["KEONJHAR"]["locality_only_count"] == 100
    assert reg_map["KEONJHAR"]["missing_extracted_records"] == 0


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


# =========================================================================
# WAVE C2.2 TESTS — REGIONAL GEO CONSISTENCY & C3 PRE-PROMOTION GATE
# =========================================================================

REGIONAL_DISCREPANCIES_FILE = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus" / "regional_coordinate_discrepancies.json"
MISSING_CANDIDATES_FILE = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus" / "missing_region_stop_candidates.json"
C3_READINESS_FILE = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus" / "c3_readiness.json"


def test_regional_geo_consistency_keonjhar_valid(empty_report):
    stop = {
        "stop_id": "stop_crut_keonjhar_bus_stand",
        "canonical_name": "OLD BUS STAND",
        "service_area": "Keonjhar",
        "lat": 21.6289,
        "lon": 85.5817,
        "coordinate_status": "VERIFIED_GEOSPATIAL",
        "coordinate_source": "osm_survey",
        "locality": {
            "city": "Keonjhar",
            "district": "Keonjhar",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": "official_pdf",
        "evidence": [{"source_document": "Keonjhar.pdf", "page": 1}],
    }
    validate_transit_stop(stop, empty_report)
    errors = [i for i in empty_report.issues if i.severity == ValidationSeverity.ERROR]
    assert len(errors) == 0


def test_regional_geo_consistency_keonjhar_puri_mismatch_error(empty_report):
    # Keonjhar stop with Puri coordinate (19.8167, 85.8333) is 203.2 km away
    stop = {
        "stop_id": "stop_crut_keonjhar_district_hospital",
        "canonical_name": "DISTRICT HOSPITAL",
        "service_area": "Keonjhar",
        "lat": 19.8167,
        "lon": 85.8333,
        "coordinate_status": "VERIFIED_OFFICIAL",
        "coordinate_source": "staticTransitStops_verified_survey",
        "locality": {
            "city": "Keonjhar",
            "district": "Keonjhar",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": "official_pdf",
        "evidence": [{"source_document": "Keonjhar.pdf", "page": 1}],
    }
    # In PROMOTION profile: MUST trigger ERROR
    validate_transit_stop(stop, empty_report)
    promotion_errors = [
        i for i in empty_report.issues
        if i.code == codes.TRN_COORDINATE_SERVICE_AREA_MISMATCH and i.severity == ValidationSeverity.ERROR
    ]
    assert len(promotion_errors) == 1
    assert "203.2 km" in promotion_errors[0].message
    assert promotion_errors[0].evidence["region"] == "KEONJHAR"

    # In AUDIT profile: MUST trigger WARNING (non-breaking audit)
    audit_report = ValidationReport(profile=ValidationProfile.AUDIT)
    validate_transit_stop(stop, audit_report)
    audit_warnings = [
        i for i in audit_report.issues
        if i.code == codes.TRN_COORDINATE_SERVICE_AREA_MISMATCH and i.severity == ValidationSeverity.WARNING
    ]
    assert len(audit_warnings) == 1


def test_regional_geo_consistency_sambalpur_valid(empty_report):
    stop = {
        "stop_id": "stop_crut_sambalpur_khetrajpur",
        "canonical_name": "KHETRAJPUR",
        "service_area": "Sambalpur",
        "lat": 21.4880,
        "lon": 83.9660,
        "coordinate_status": "VERIFIED_GEOSPATIAL",
        "coordinate_source": "osm_survey",
        "locality": {
            "city": "Sambalpur",
            "district": "Sambalpur",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": "official_pdf",
        "evidence": [{"source_document": "Sambalpur.pdf", "page": 1}],
    }
    validate_transit_stop(stop, empty_report)
    mismatches = [i for i in empty_report.issues if i.code == codes.TRN_COORDINATE_SERVICE_AREA_MISMATCH]
    assert len(mismatches) == 0


def test_regional_geo_consistency_capital_region_valid(empty_report):
    stop = {
        "stop_id": "stop_crut_bhubaneswar_master_canteen",
        "canonical_name": "MASTER CANTEEN",
        "service_area": "Capital Region",
        "lat": 20.2667,
        "lon": 85.8398,
        "coordinate_status": "VERIFIED_OFFICIAL",
        "coordinate_source": "staticTransitStops_verified_survey",
        "locality": {
            "city": "Bhubaneswar",
            "district": "Khordha",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": "official_pdf",
        "evidence": [{"source_document": "MoBus.pdf", "page": 1}],
    }
    validate_transit_stop(stop, empty_report)
    mismatches = [i for i in empty_report.issues if i.code == codes.TRN_COORDINATE_SERVICE_AREA_MISMATCH]
    assert len(mismatches) == 0


def test_regional_geo_consistency_unknown_region_review_required(empty_report):
    stop = {
        "stop_id": "stop_unmapped_city_01",
        "canonical_name": "UNKNOWN LOCATION STOP",
        "service_area": "Other Region",
        "city": "Unknown City",
        "lat": 20.0,
        "lon": 84.0,
        "coordinate_status": "VERIFIED_GEOSPATIAL",
        "coordinate_source": "osm_survey",
        "locality": {
            "city": "Unknown City",
            "district": "Unknown District",
            "state": "Odisha",
            "country": "India",
        },
        "locality_status": "OFFICIAL_SERVICE_AREA",
        "locality_source": "official_pdf",
        "evidence": [{"source_document": "Other.pdf", "page": 1}],
    }
    validate_transit_stop(stop, empty_report)
    info_issues = [
        i for i in empty_report.issues
        if i.code == codes.TRN_COORDINATE_SERVICE_AREA_MISMATCH and i.severity == ValidationSeverity.INFO
    ]
    assert len(info_issues) == 1
    assert "manual review required" in info_issues[0].message


def test_regional_coordinate_discrepancies_artifact():
    assert REGIONAL_DISCREPANCIES_FILE.exists(), f"Missing {REGIONAL_DISCREPANCIES_FILE}"
    with open(REGIONAL_DISCREPANCIES_FILE, encoding="utf-8") as f:
        discrepancies = json.load(f)

    # Exactly 40 exact coordinates audited
    assert len(discrepancies) == 40

    passes = [d for d in discrepancies if d["review_status"] == "PASS"]
    fails = [d for d in discrepancies if d["review_status"] == "FAIL"]
    reviews = [d for d in discrepancies if d["review_status"] == "REVIEW_REQUIRED"]

    assert len(passes) == 39
    assert len(fails) == 1
    assert len(reviews) == 0

    # Verify the exact red flag investigation payload
    fail = fails[0]
    assert fail["stop_id"] == "stop_crut_keonjhar_district_hospital"
    assert fail["canonical_name"] == "DISTRICT HOSPITAL"
    assert fail["service_region"] == "KEONJHAR"
    assert fail["lat"] == 19.8167
    assert fail["lon"] == 85.8333
    assert fail["regional_consistency"] == "INCONSISTENT"
    assert fail["distance_to_region_anchor_km"] == 203.2
    assert "investigation" in fail
    inv = fail["investigation"]
    assert inv["canonical_stop_id"] == "stop_crut_keonjhar_district_hospital"
    assert inv["classification"] == "WRONG_ENTITY_MATCH"
    assert inv["collision_type"] == "DUPLICATE_NAME_COLLISION"
    assert "Grand Road, Puri" in inv["detailed_explanation"]


def test_missing_region_stop_candidates_artifact():
    assert MISSING_CANDIDATES_FILE.exists(), f"Missing {MISSING_CANDIDATES_FILE}"
    with open(MISSING_CANDIDATES_FILE, encoding="utf-8") as f:
        data = json.load(f)

    meta = data["metadata"]
    assert meta["un_ingested_extraction_records"] == 949
    assert meta["distinct_published_names"] == 944
    assert meta["normalized_candidate_count"] == 939

    reg_sum = data["regional_summary"]
    assert reg_sum["CAPITAL_REGION"]["extraction_records"] == 362
    assert reg_sum["CAPITAL_REGION"]["distinct_published_names"] == 358
    assert reg_sum["CAPITAL_REGION"]["normalized_candidates"] == 355

    assert reg_sum["ROURKELA"]["extraction_records"] == 294
    assert reg_sum["ROURKELA"]["distinct_published_names"] == 294
    assert reg_sum["ROURKELA"]["normalized_candidates"] == 294

    assert reg_sum["BERHAMPUR"]["extraction_records"] == 293
    assert reg_sum["BERHAMPUR"]["distinct_published_names"] == 292
    assert reg_sum["BERHAMPUR"]["normalized_candidates"] == 290

    # Ensure all candidate identity statuses are valid and accounted for
    candidates = data["candidates"]
    assert len(candidates) == 939
    valid_statuses = {"UNIQUE_CANDIDATE", "POSSIBLE_ALIAS", "NAME_COLLISION", "AMBIGUOUS"}
    for c in candidates:
        assert c["identity_status"] in valid_statuses
        assert len(c["published_spellings"]) >= 1
        assert c["extraction_occurrences"] >= 1
        assert "candidate_id" in c and c["candidate_id"].startswith("cand_crut_")


def test_c3_readiness_artifact():
    assert C3_READINESS_FILE.exists(), f"Missing {C3_READINESS_FILE}"
    with open(C3_READINESS_FILE, encoding="utf-8") as f:
        r = json.load(f)

    assert r["five_region_routes_complete"] is True
    assert r["five_region_stop_extraction_complete"] is True
    assert r["distinct_stop_identity_candidates"] == 939
    assert r["coordinate_consistency_failures"] == 1
    assert r["coordinate_consistency_reviews"] == 0
    assert r["coordinate_exact_passes"] == 39
    assert r["canonical_mutation_ready"] is False
    assert r["gate_status"] == "BLOCKED"
    assert len(r["blocking_reasons"]) >= 3


def test_duplicate_rows_do_not_create_multiple_physical_ids():
    assert MISSING_CANDIDATES_FILE.exists()
    with open(MISSING_CANDIDATES_FILE, encoding="utf-8") as f:
        data = json.load(f)

    # In Berhampur, 'POLICE STATION,' had duplicate extracted rows
    # In Capital Region, 'CUTTACK NETAJI BUS TERMINUS (CNBT)' had duplicate rows
    # Ensure each candidate has exactly one unique candidate_id
    candidate_ids = [c["candidate_id"] for c in data["candidates"]]
    assert len(candidate_ids) == len(set(candidate_ids)), "Duplicate candidate IDs found!"
    assert len(candidate_ids) == 939


