"""
Wave A2 Comprehensive Test Suite: Universal Canonical Data Quality & Promotion Gate.
Tests all 7 validation domains, profiles, synthetic fixtures, and repository-backed regressions.
"""
import pytest
from pathlib import Path

from app.validation import codes
from app.validation.models import ValidationProfile, ValidationReport, ValidationSeverity
from app.validation.runner import UniversalValidator
from app.validation.domains import (
    validate_identity,
    validate_localization,
    validate_provenance,
    validate_geospatial,
    validate_relationships,
    validate_media_asset,
    validate_entity_media,
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