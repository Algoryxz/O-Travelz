"""
Wave A2 Comprehensive Test Suite: Universal Canonical Data Quality & Promotion Gate.
Tests all 7 validation domains, profiles, synthetic fixtures, and repository-backed regressions.
"""
import pytest
from pathlib import Path

from app.validation import codes
from app.validation.models import CoverageStatus, ValidationProfile, ValidationReport, ValidationSeverity
from app.validation.runner import UniversalValidator
from app.validation.domains import (
    validate_identity,
    validate_localization,
    validate_provenance,
    validate_geospatial,
    validate_relationships,
    validate_media_asset,
    validate_entity_media,
    validate_media_filesystem_reconciliation,
    validate_transit_stop,
    validate_transit_route,
    validate_route_stops,
    validate_transit_schedule,
    is_service_day_sorted,
)
from app.validation.fixtures import (
    SYNTHETIC_SACRED_PLACE,
    SYNTHETIC_HERITAGE_PLACE,
    SYNTHETIC_NATURAL_PLACE,
    SYNTHETIC_FOOD_PLACE,
    SYNTHETIC_HOSPITAL_FACILITY,
    SYNTHETIC_TRANSIT_HUB,
    SYNTHETIC_EXTERNAL_STATION,
    SYNTHETIC_UNRESOLVED_STOP,
    SYNTHETIC_OVERNIGHT_SCHEDULE,
    SYNTHETIC_DEFECT_FIXTURES,
    REPO_SAMPLE_KONARK,
    REPO_SAMPLE_SERVICE_SCB,
    REPO_SAMPLE_GEOCODED_STOP,
    REPO_SAMPLE_UNRESOLVED_STOP,
)


# =============================================================================
# 1. SYNTHETIC FIXTURES VALIDATION (FIXTURE SET A)
# =============================================================================

def test_synthetic_sacred_place_passes():
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validator = UniversalValidator(profile=ValidationProfile.PROMOTION)
    validator.validate_entity(SYNTHETIC_SACRED_PLACE, "place", report)

    assert report.summary.errors == 0
    assert report.is_passing() is True


def test_synthetic_heritage_place_passes():
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validator = UniversalValidator(profile=ValidationProfile.PROMOTION)
    validator.validate_entity(SYNTHETIC_HERITAGE_PLACE, "place", report)

    assert report.summary.errors == 0
    assert report.is_passing() is True


def test_synthetic_natural_place_partial_localization_warns_only():
    """Natural place fixture has Odia but lacks Hindi: triggers WARNING, zero ERRORs."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validator = UniversalValidator(profile=ValidationProfile.PROMOTION)
    validator.validate_entity(SYNTHETIC_NATURAL_PLACE, "place", report)

    assert report.summary.errors == 0
    assert report.summary.warnings >= 1
    assert any(i.code == codes.LOC_HINDI_ABSENT for i in report.issues)
    assert report.is_passing() is True  # Promotion profile permits advisory warnings


def test_synthetic_food_place_passes():
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validator = UniversalValidator(profile=ValidationProfile.PROMOTION)
    validator.validate_entity(SYNTHETIC_FOOD_PLACE, "place", report)

    assert report.summary.errors == 0


def test_synthetic_facility_passes():
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validator = UniversalValidator(profile=ValidationProfile.PROMOTION)
    validator.validate_entity(SYNTHETIC_HOSPITAL_FACILITY, "service_facility", report, check_translations=False)

    assert report.summary.errors == 0


def test_synthetic_transit_hub_passes():
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validator = UniversalValidator(profile=ValidationProfile.PROMOTION)
    validator.validate_entity(SYNTHETIC_TRANSIT_HUB, "transit_hub", report)

    assert report.summary.errors == 0


def test_synthetic_unresolved_stop_null_coords_passes():
    """Unresolved stops must have null coordinates; non-null is blocked."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validate_transit_stop(SYNTHETIC_UNRESOLVED_STOP, report)
    validate_geospatial(SYNTHETIC_UNRESOLVED_STOP, "transit_stop", report)

    assert report.summary.errors == 0
    assert report.is_passing() is True


def test_synthetic_external_station_outside_odisha_passes():
    """External transport nodes (e.g. Howrah) are domain-exempt from Odisha bounds."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validate_geospatial(SYNTHETIC_EXTERNAL_STATION, "railway_connection", report)

    assert report.summary.errors == 0
    assert report.is_passing() is True


# =============================================================================
# 2. DOMAIN-SPECIFIC CORRECTION TESTS
# =============================================================================

def test_overnight_timetable_service_day_progression():
    """Correction #4: 23:40 -> 00:15 -> 00:50 must be valid; 10:30 -> 09:15 must fail."""
    # Legitimate overnight service
    assert is_service_day_sorted(["23:40", "00:15", "00:50"]) is True
    assert is_service_day_sorted(["05:30", "12:00", "18:45", "23:55"]) is True

    # Genuine backwards timetable
    assert is_service_day_sorted(["10:30", "09:15"]) is False
    assert is_service_day_sorted(["23:40", "00:15", "23:50"]) is False

    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validate_transit_schedule(SYNTHETIC_OVERNIGHT_SCHEDULE, report)
    assert report.summary.errors == 0


def test_domain_aware_geospatial_validation():
    """Correction #2: Odisha native out of bounds is ERROR, external node is NOT."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)

    # 1. Native temple in Mumbai -> ERROR
    native_out = {"id": "mumbai_temple", "name": "Temple", "lat": 18.92, "lon": 72.83, "district": "Puri"}
    validate_geospatial(native_out, "place", report)
    assert any(i.code == codes.GEO_OUT_OF_EXPECTED_REGION for i in report.issues)

    # 2. External railway node in Kolkata -> PASS
    ext_node = {"id": "kolkata_stn", "name": "Kolkata Stn", "lat": 22.58, "lon": 88.34, "is_external": True}
    validate_geospatial(ext_node, "railway_connection", report)
    assert not any(i.code == codes.GEO_OUT_OF_EXPECTED_REGION and i.entity_id == "kolkata_stn" for i in report.issues)


def test_split_transit_truth_rules():
    """Correction #3: Split transit truth rules (provenance vs live telemetry)."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)

    # 1. Coordinate without provenance
    fake_stop = {
        "stop_id": "fake_s1",
        "lat": 20.29,
        "lon": 85.82,
        "coordinate_status": "VERIFIED_OFFICIAL",
        "coordinate_source": "REQUIRED",  # Placeholder -> ERROR
    }
    validate_transit_stop(fake_stop, report)
    assert any(i.code == codes.TRN_COORDINATE_WITHOUT_PROVENANCE for i in report.issues)

    # 2. Live claim without telemetry
    fake_route = {
        "route_id": "fake_r1",
        "data_tier": "live",
        # telemetry_source missing
    }
    validate_transit_route(fake_route, report)
    assert any(i.code == codes.TRN_LIVE_CLAIM_WITHOUT_REALTIME_SOURCE for i in report.issues)


def test_localized_name_fallback_semantics():
    """Correction #5: canonical_name display fallback prevents error even if localized_names.en missing."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)

    # Record has display name 'Lingaraj Temple' and Odia script, but NO localized_names.en
    rec = {
        "id": "lingaraj_001",
        "name": "Lingaraj Temple",
        "localized_names": {"or": "ଲିଙ୍ଗରାଜ ମନ୍ଦିର"},
    }
    validate_localization(rec, "place", report)
    # Must NOT trigger LOC_MISSING_CANONICAL_EN because record['name'] serves as canonical fallback
    assert not any(i.code == codes.LOC_MISSING_CANONICAL_EN for i in report.issues)

    # Missing both 'name' and 'localized_names.en' MUST trigger error
    bad_rec = {"id": "no_name_001"}
    validate_localization(bad_rec, "place", report)
    assert any(i.code == codes.LOC_MISSING_CANONICAL_EN for i in report.issues)


def test_technical_vector_media_rule():
    """Correction #6: Technical vector permitted in UI (even hero); violation is claiming photography."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)

    # 1. Vector used as hero without claiming photo -> PASS
    valid_vector = {
        "id": "vec_001",
        "content_sha256": "a" * 64,
        "storage_key": "places/p1/plan.svg",
        "verification_status": "TECHNICAL_VECTOR",
        "media_kind": "vector",
        "is_photograph": False,
    }
    validate_media_asset(valid_vector, report)
    assert not any(i.code == codes.MED_TECHNICAL_AS_PHOTO for i in report.issues)

    # 2. Vector claiming to be authentic photograph -> ERROR
    bad_vector = {
        "id": "vec_002",
        "content_sha256": "b" * 64,
        "storage_key": "places/p1/sketch.svg",
        "verification_status": "TECHNICAL_VECTOR",
        "is_photograph": True,  # Fraudulent photo claim!
    }
    validate_media_asset(bad_vector, report)
    assert any(i.code == codes.MED_TECHNICAL_AS_PHOTO for i in report.issues)


# =============================================================================
# 3. DEFECT FIXTURES COVERAGE
# =============================================================================

@pytest.mark.parametrize("defect_case", SYNTHETIC_DEFECT_FIXTURES)
def test_synthetic_defect_triggers_expected_code(defect_case):
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    validator = UniversalValidator(profile=ValidationProfile.PROMOTION)
    rec = defect_case["record"]
    ent_type = defect_case["entity_type"]
    expected_code = defect_case["defect"]

    if ent_type == "place":
        validator.validate_entity(rec, ent_type, report)
    elif ent_type == "stop":
        validate_geospatial(rec, ent_type, report)
        validate_transit_stop(rec, report)
    elif ent_type == "media_asset":
        validate_media_asset(rec, report)
    elif ent_type == "route":
        validate_transit_route(rec, report)
    elif ent_type == "schedule":
        validate_transit_schedule(rec, report)

    matching = [i for i in report.issues if i.code == expected_code]
    assert len(matching) > 0, f"Expected issue code '{expected_code}' not found in report issues: {[i.code for i in report.issues]}"


# =============================================================================
# 4. REPOSITORY-BACKED SAMPLES (FIXTURE SET B)
# =============================================================================

def test_repo_sample_konark():
    report = ValidationReport(profile=ValidationProfile.AUDIT)
    validator = UniversalValidator(profile=ValidationProfile.AUDIT)
    validator.validate_entity(REPO_SAMPLE_KONARK, "place", report, check_translations=False)

    assert report.summary.errors == 0


def test_repo_sample_scb():
    report = ValidationReport(profile=ValidationProfile.AUDIT)
    validator = UniversalValidator(profile=ValidationProfile.AUDIT)
    validator.validate_entity(REPO_SAMPLE_SERVICE_SCB, "service_facility", report, check_translations=False)

    assert report.summary.errors == 0


def test_repo_sample_geocoded_stop():
    report = ValidationReport(profile=ValidationProfile.AUDIT)
    validate_transit_stop(REPO_SAMPLE_GEOCODED_STOP, report)
    validate_geospatial(REPO_SAMPLE_GEOCODED_STOP, "transit_stop", report)

    assert report.summary.errors == 0


def test_repo_sample_unresolved_stop():
    report = ValidationReport(profile=ValidationProfile.AUDIT)
    validate_transit_stop(REPO_SAMPLE_UNRESOLVED_STOP, report)
    validate_geospatial(REPO_SAMPLE_UNRESOLVED_STOP, "transit_stop", report)

    assert report.summary.errors == 0


# =============================================================================
# 5. VALIDATION PROFILES & EXIT CONTRACTS
# =============================================================================

def test_profile_audit_does_not_block_by_default():
    report = ValidationReport(profile=ValidationProfile.AUDIT)
    report.add_issue(
        code=codes.LOC_ODIA_ABSENT,
        severity=ValidationSeverity.WARNING,
        domain="localization",
        entity_type="place",
        message="Odia absent",
    )
    # In AUDIT profile, is_passing() is True by default
    assert report.is_passing() is True


def test_profile_promotion_blocks_on_error():
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    report.add_issue(
        code=codes.GEO_OUT_OF_WGS84,
        severity=ValidationSeverity.ERROR,
        domain="geospatial",
        entity_type="place",
        message="Bad coords",
    )
    assert report.is_passing() is False


def test_report_json_serialization():
    report = ValidationReport(profile=ValidationProfile.AUDIT)
    report.add_issue(
        code=codes.LOC_ODIA_ABSENT,
        severity=ValidationSeverity.WARNING,
        domain="localization",
        entity_type="place",
        entity_id="p101",
        field="localized_names",
        message="Missing Odia translation",
        evidence={"sample": "data"},
    )
    json_dict = report.to_json_dict()

    assert json_dict["schema_version"] == "1.0.0"
    assert json_dict["profile"] == "AUDIT"
    assert json_dict["summary"]["warnings"] == 1
    assert len(json_dict["issues"]) == 1
    assert json_dict["issues"][0]["code"] == codes.LOC_ODIA_ABSENT
    assert json_dict["issues"][0]["entity_id"] == "p101"


# =============================================================================
# 6. COMPREHENSIVE WAVE A2.1 REGRESSION TESTS (REQUIREMENT 3)
# =============================================================================

def test_media_regression_suite(tmp_path):
    """Proves detection of all 6 MEDIA regression conditions."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)

    # 1. Technical vector falsely labelled photograph
    vec_asset = {
        "id": "m_vec_fraud",
        "content_sha256": "c" * 64,
        "storage_key": "places/p1/arch.svg",
        "verification_status": "TECHNICAL_VECTOR",
        "is_photograph": True,  # Falsely claimed!
    }
    validate_media_asset(vec_asset, report)
    assert any(i.code == codes.MED_TECHNICAL_AS_PHOTO for i in report.issues)

    # 2. Orphan association
    assoc_orphan = [
        {"id": "assoc_1", "entity_type": "place", "entity_id": "p_real", "media_asset_id": "m_nonexistent", "association_type": "primary"}
    ]
    validate_entity_media(assoc_orphan, media_assets_by_id={}, report=report, known_entity_ids={"p_real"})
    assert any(i.code == codes.MED_ORPHAN_ASSOCIATION for i in report.issues)

    # 3. Rejected public asset
    m_rejected = {
        "id": "m_rej",
        "content_sha256": "d" * 64,
        "storage_key": "places/p1/bad.jpg",
        "verification_status": "REJECTED",
    }
    assoc_rejected = [
        {"id": "assoc_2", "entity_type": "place", "entity_id": "p_real", "media_asset_id": "m_rej", "association_type": "primary"}
    ]
    validate_entity_media(assoc_rejected, media_assets_by_id={"m_rej": m_rejected}, report=report, known_entity_ids={"p_real"})
    assert any(i.code == codes.MED_REJECTED_PUBLIC for i in report.issues)

    # 4. Cross-entity semantic reuse
    m_reused = {
        "id": "m_shared",
        "content_sha256": "e" * 64,
        "storage_key": "places/p1/shared.jpg",
        "verification_status": "EXACT_LOCATION_VERIFIED",
    }
    assoc_reused = [
        {"id": "assoc_3a", "entity_type": "place", "entity_id": "place_A", "media_asset_id": "m_shared", "association_type": "primary"},
        {"id": "assoc_3b", "entity_type": "place", "entity_id": "place_B", "media_asset_id": "m_shared", "association_type": "primary"},
    ]
    validate_entity_media(assoc_reused, media_assets_by_id={"m_shared": m_reused}, report=report, known_entity_ids={"place_A", "place_B"})
    assert any(i.code == codes.MED_CROSS_ENTITY_REUSE for i in report.issues)

    # 5. Missing file and 6. Orphan filesystem asset
    img_root = tmp_path / "images" / "places"
    img_root.mkdir(parents=True)
    # Create orphan directory on disk not belonging to any known place
    orphan_dir = img_root / "place_unknown_999"
    orphan_dir.mkdir()

    manifest_missing = [
        {"place_id": "place_A", "asset_hash": "hash123"}  # Does not exist on disk!
    ]
    validate_media_filesystem_reconciliation(
        manifest_records=manifest_missing,
        places_img_dir=img_root,
        known_place_ids={"place_A"},
        report=report,
    )
    assert any(i.code == codes.MED_MISSING_FILE for i in report.issues)
    assert any(i.code == codes.MED_ORPHAN_STORAGE_ASSET for i in report.issues)


def test_transit_regression_suite():
    """Proves detection of all 7 TRANSIT regression conditions."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)

    # 1. Unresolved stop with coordinates -> ERROR
    unres_with_coords = {
        "stop_id": "stop_unres_err",
        "canonical_name": "Err Stop",
        "coordinate_status": "UNRESOLVED",
        "lat": 20.29,
        "lon": 85.82,
    }
    validate_geospatial(unres_with_coords, "transit_stop", report)
    assert any(i.code == codes.GEO_UNRESOLVED_NON_NULL for i in report.issues)

    # 2. Coordinate without provenance -> ERROR
    stop_no_prov = {
        "stop_id": "stop_no_prov",
        "canonical_name": "No Prov",
        "coordinate_status": "VERIFIED_OFFICIAL",
        "lat": 20.29,
        "lon": 85.82,
        "coordinate_source": None,
    }
    validate_transit_stop(stop_no_prov, report)
    assert any(i.code == codes.TRN_COORDINATE_WITHOUT_PROVENANCE for i in report.issues)

    # 3. Unknown route-stop -> ERROR
    # 4. Duplicate sequence -> ERROR
    route_stop_items = [
        {"sequence": 1, "stop_id": "stop_known_1"},
        {"sequence": 1, "stop_id": "stop_ghost_999"},  # Duplicate sequence 1 + unknown stop!
    ]
    validate_route_stops("r_test", route_stop_items, known_stop_ids={"stop_known_1"}, report=report)
    assert any(i.code == codes.TRN_DUPLICATE_SEQUENCE for i in report.issues)
    assert any(i.code == codes.TRN_UNKNOWN_STOP for i in report.issues)

    # 5. Valid overnight schedule -> PASS
    assert is_service_day_sorted(["23:40", "00:15", "00:50"]) is True

    # 6. Invalid overnight schedule -> ERROR
    assert is_service_day_sorted(["23:40", "21:10"]) is False
    validate_transit_schedule({"schedule_id": "s_bad", "route_id": "r_test", "departure_times": ["23:40", "21:10"]}, report)
    assert any(i.code == codes.TRN_SCHEDULE_NOT_SORTED for i in report.issues)

    # 7. LIVE claim without realtime telemetry -> ERROR
    live_route = {"route_id": "r_live_fake", "route_number": "111", "data_tier": "live", "live_telemetry_source": None}
    validate_transit_route(live_route, report)
    assert any(i.code == codes.TRN_LIVE_CLAIM_WITHOUT_REALTIME_SOURCE for i in report.issues)


def test_provenance_regression_suite():
    """Proves detection of all 3 PROVENANCE regression conditions."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)

    # 1. Official claim without evidence -> ERROR
    unsourced_official = {
        "id": "p_unsourced",
        "name": "State Palace",
        "source": "TODO",
        "verification_status": "VERIFIED_OFFICIAL",
    }
    validate_provenance(unsourced_official, "place", report)
    assert any(i.code == codes.PRV_OFFICIAL_UNVERIFIED for i in report.issues)

    # 2. Invalid verification status -> ERROR
    bad_status = {
        "id": "p_bad_status",
        "name": "Bad Status",
        "source": "survey",
        "verification_status": "TOTALLY_LEGIT_100",
    }
    validate_provenance(bad_status, "place", report)
    assert any(i.code == codes.PRV_INVALID_STATUS for i in report.issues)

    # 3. Future verification date -> ERROR
    future_date = {
        "id": "p_future",
        "name": "Time Traveler",
        "source": "survey",
        "verification_status": "VERIFIED",
        "verified_at": "2099-01-01T00:00:00Z",
    }
    validate_provenance(future_date, "place", report)
    assert any(i.code == codes.PRV_FUTURE_VERIFICATION_DATE for i in report.issues)


def test_geospatial_regression_suite():
    """Proves detection of all 4 GEOSPATIAL regression conditions."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)

    # 1. Reversed coordinates (lat/lon swapped) -> ERROR
    swapped = {"id": "p_swap", "name": "Swapped", "lat": 85.83, "lon": 20.29, "source": "survey"}
    validate_geospatial(swapped, "place", report)
    assert any(i.code == codes.GEO_LAT_LON_SWAP for i in report.issues)

    # 2. Invalid WGS84 coordinates -> ERROR
    bad_wgs = {"id": "p_bad_wgs", "name": "Out of World", "lat": -95.0, "lon": 200.0, "source": "survey"}
    validate_geospatial(bad_wgs, "place", report)
    assert any(i.code == codes.GEO_OUT_OF_WGS84 for i in report.issues)

    # 3. Legitimate external intercity transport node -> PASS (zero errors)
    ext_stn = {"id": "howrah_jxn", "name": "Howrah Junction", "lat": 22.5830, "lon": 88.3426, "is_external": True}
    report_ext = ValidationReport(profile=ValidationProfile.PROMOTION)
    validate_geospatial(ext_stn, "railway_connection", report_ext)
    assert not any(i.code == codes.GEO_OUT_OF_EXPECTED_REGION for i in report_ext.issues)

    # 4. Invalid Odisha-native place outside expected region -> ERROR
    native_outside = {"id": "puri_temple_delhi", "name": "Odisha Temple in Delhi", "lat": 28.6139, "lon": 77.2090, "district": "Puri"}
    validate_geospatial(native_outside, "place", report)
    assert any(i.code == codes.GEO_OUT_OF_EXPECTED_REGION for i in report.issues)


def test_relationships_regression_suite():
    """Proves detection of RELATIONSHIPS conditions (orphan, self-loop, duplicate, nullable confidence)."""
    report = ValidationReport(profile=ValidationProfile.PROMOTION)

    known_ids = {"place_1", "place_2"}

    # 1. Orphan target -> ERROR
    orphan_rel = [
        {"id": "r1", "source_entity_type": "place", "source_entity_id": "place_1", "target_entity_type": "place", "target_entity_id": "place_999", "relationship_type": "nearest_transit_stop"}
    ]
    validate_relationships(orphan_rel, report, known_entity_ids=known_ids)
    assert any(i.code == codes.REL_ORPHAN_REFERENCE for i in report.issues)

    # 2. Self-loop -> ERROR
    self_rel = [
        {"id": "r2", "source_entity_type": "place", "source_entity_id": "place_1", "target_entity_type": "place", "target_entity_id": "place_1", "relationship_type": "nearest_transit_stop"}
    ]
    validate_relationships(self_rel, report, known_entity_ids=known_ids)
    assert any(i.code == codes.REL_SELF_LOOP for i in report.issues)

    # 3. Duplicate edge -> ERROR
    dup_rel = [
        {"id": "r3a", "source_entity_type": "place", "source_entity_id": "place_1", "target_entity_type": "place", "target_entity_id": "place_2", "relationship_type": "nearest_transit_stop"},
        {"id": "r3b", "source_entity_type": "place", "source_entity_id": "place_1", "target_entity_type": "place", "target_entity_id": "place_2", "relationship_type": "nearest_transit_stop"},
    ]
    validate_relationships(dup_rel, report, known_entity_ids=known_ids)
    assert any(i.code == codes.REL_DUPLICATE_EDGE for i in report.issues)

    # 4. Nullable confidence valid case -> PASS without ERROR
    valid_null_conf = [
        {"id": "r4", "source_entity_type": "place", "source_entity_id": "place_1", "target_entity_type": "place", "target_entity_id": "place_2", "relationship_type": "nearest_transit_stop", "confidence": None}
    ]
    report_null = ValidationReport(profile=ValidationProfile.PROMOTION)
    validate_relationships(valid_null_conf, report_null, known_entity_ids=known_ids)
    assert report_null.summary.errors == 0
    assert report_null.is_passing() is True


def test_coverage_accounting_contract():
    """Proves explicit coverage tracking supports all statuses and formats correctly."""
    report = ValidationReport(profile=ValidationProfile.AUDIT)

    report.record_coverage(
        source="data/places/places.json",
        status=CoverageStatus.VALIDATED,
        records_loaded=161,
        records_validated=161,
        records_skipped=0,
        validation_domains_executed=["identity", "localization"],
    )
    report.record_coverage(
        source="data/future_dataset.json",
        status=CoverageStatus.UNAVAILABLE,
        records_loaded=0,
        records_validated=0,
        records_skipped=0,
        reason_skipped="File does not exist yet",
    )
    report.record_coverage(
        source="data/archive_deprecated.json",
        status=CoverageStatus.SKIPPED_WITH_REASON,
        records_loaded=50,
        records_validated=0,
        records_skipped=50,
        reason_skipped="Deprecated legacy file; not promoted to V4",
    )

    summary_text = report.format_terminal_summary()
    assert "SOURCE COVERAGE ACCOUNTING:" in summary_text
    assert "VALIDATED" in summary_text
    assert "UNAVAILABLE" in summary_text
    assert "SKIPPED_WITH_REASON" in summary_text

    json_dict = report.to_json_dict()
    assert "coverage" in json_dict
    assert len(json_dict["coverage"]) == 3
    assert json_dict["coverage"][0]["status"] == "VALIDATED"
    assert json_dict["coverage"][1]["status"] == "UNAVAILABLE"