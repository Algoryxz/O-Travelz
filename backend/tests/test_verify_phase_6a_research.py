"""
Automated unit & integration test suite for Phase 6A Pre-Research Validation Gate.
Tests all acceptance criteria (AC1 - AC12) against deterministic synthetic test fixtures.
"""
import json
from pathlib import Path
import pytest

from scripts.verify_phase_6a_research import Phase6AResearchValidator

ROOT_DIR = Path(__file__).resolve().parents[2]
FIXTURES_DIR = ROOT_DIR / "tests" / "fixtures" / "phase_6a"
SCHEMA_DIR = ROOT_DIR / "data" / "research" / "transit" / "phase_6a" / "schema"


@pytest.fixture
def validator():
    return Phase6AResearchValidator(base_dir=ROOT_DIR)


def test_schema_files_exist_and_are_valid_json():
    """Verify all 5 formal schema contracts exist and are valid JSON."""
    expected_schemas = [
        "route_index.schema.json",
        "regional_routes.schema.json",
        "global_analysis.schema.json",
        "unresolved_stops.schema.json",
        "evidence_registry.schema.json",
    ]
    for schema_name in expected_schemas:
        schema_path = SCHEMA_DIR / schema_name
        assert schema_path.exists(), f"Missing schema file: {schema_path}"
        with open(schema_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert data.get("$schema") is not None
        assert "properties" in data or "definitions" in data


def test_valid_minimal_synthetic_fixture_passes_all_gates(validator):
    """Verify that the structurally valid synthetic minimal fixture passes all 12 criteria."""
    valid_dir = FIXTURES_DIR / "valid_minimal"
    report = validator.validate_directory(valid_dir)

    assert report.is_valid is True, f"Expected valid, got failures: {[str(f) for f in report.failures]}"
    assert report.total_routes_checked == 154
    assert len(report.failed_criteria) == 0
    assert len(report.passed_criteria) == 12
    assert "AC1" in report.passed_criteria
    assert "AC2" in report.passed_criteria
    assert "AC3" in report.passed_criteria
    assert "AC4" in report.passed_criteria
    assert "AC5" in report.passed_criteria
    assert "AC8" in report.passed_criteria
    assert "AC12" in report.passed_criteria


def test_phase_6a_production_research_artifact_passes_all_gates(validator):
    """Verify that the actual Phase 6A research artifact dataset passes all 12 criteria."""
    research_dir = ROOT_DIR / "data" / "research" / "transit" / "phase_6a"
    report = validator.validate_directory(research_dir)

    assert report.is_valid is True, f"Expected research artifacts to pass, got failures: {[str(f) for f in report.failures]}"
    assert report.total_routes_checked == 154
    assert len(report.failed_criteria) == 0
    assert len(report.passed_criteria) == 12
    assert report.total_corridors_checked == 154
    assert report.total_evidence_items >= 10


def test_missing_route_fails_ac1(validator):
    """Verify AC1 failure when a route is missing from index or regional files."""
    missing_dir = FIXTURES_DIR / "invalid_missing_route"
    report = validator.validate_directory(missing_dir)

    assert report.is_valid is False
    assert "AC1" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC1"}
    assert "MISSING_ROUTES" in failure_codes or "INVALID_ROUTE_COUNT" in failure_codes


def test_duplicate_route_fails_ac1(validator):
    """Verify AC1 failure when duplicate route numbers are present."""
    dup_dir = FIXTURES_DIR / "invalid_duplicate_route"
    report = validator.validate_directory(dup_dir)

    assert report.is_valid is False
    assert "AC1" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC1"}
    assert "DUPLICATE_ROUTE_NUMBER" in failure_codes or "INVALID_ROUTE_COUNT" in failure_codes


def test_invalid_coordinate_fails_ac4(validator):
    """Verify AC4 failure when coordinates are out of geographical range [-90, 90]."""
    coord_dir = FIXTURES_DIR / "invalid_coordinate"
    report = validator.validate_directory(coord_dir)

    assert report.is_valid is False
    assert "AC4" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC4"}
    assert "LATITUDE_OUT_OF_RANGE" in failure_codes


def test_coordinate_without_evidence_fails_ac4(validator):
    """Verify AC4 failure when a coordinate is supplied without an evidence citation."""
    no_ev_dir = FIXTURES_DIR / "invalid_coordinate_without_evidence"
    report = validator.validate_directory(no_ev_dir)

    assert report.is_valid is False
    assert "AC4" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC4"}
    assert "COORDINATE_WITHOUT_EVIDENCE" in failure_codes


def test_confirmed_without_high_evidence_fails_ac5(validator):
    """Verify AC5 failure when CONFIRMED confidence is claimed on LOW reliability evidence."""
    low_ev_dir = FIXTURES_DIR / "invalid_confirmed_without_high_evidence"
    report = validator.validate_directory(low_ev_dir)

    assert report.is_valid is False
    assert "AC5" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC5"}
    assert "CONFIRMED_WITHOUT_HIGH_EVIDENCE" in failure_codes


def test_missing_corridor_evidence_fails_ac9(validator):
    """Verify AC9 failure when a corridor segment does not cite evidence."""
    corridor_dir = FIXTURES_DIR / "invalid_missing_corridor_evidence"
    report = validator.validate_directory(corridor_dir)

    assert report.is_valid is False
    assert "AC9" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC9"}
    assert "CORRIDOR_WITHOUT_EVIDENCE" in failure_codes


def test_undocumented_sequence_conflict_fails_ac3(validator):
    """Verify AC3 failure when stop sequence is inverted or mutated without documented conflict."""
    seq_dir = FIXTURES_DIR / "invalid_sequence_conflict"
    report = validator.validate_directory(seq_dir)

    assert report.is_valid is False
    assert "AC3" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC3"}
    assert "UNDOCUMENTED_SEQUENCE_MUTATION" in failure_codes or "UNDOCUMENTED_SEQUENCE_INVERSION" in failure_codes


def test_undocumented_sequence_mutation_fails_ac3(validator):
    """Verify AC3 failure when stop sequence differs from database order (e.g. A->C->B instead of A->B->C)."""
    seq_mut_dir = FIXTURES_DIR / "invalid_sequence_mutation"
    report = validator.validate_directory(seq_mut_dir)

    assert report.is_valid is False
    assert "AC3" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC3"}
    assert "UNDOCUMENTED_SEQUENCE_MUTATION" in failure_codes


def test_unknown_stop_fails_ac2(validator):
    """Verify AC2 failure when a stop record has a name not in authoritative stop registry."""
    stop_dir = FIXTURES_DIR / "invalid_unknown_stop"
    report = validator.validate_directory(stop_dir)

    assert report.is_valid is False
    assert "AC2" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC2"}
    assert "UNKNOWN_STOP" in failure_codes


def test_missing_database_stop_fails_ac2(validator):
    """Verify AC2 failure when research silently drops a database stop without documented conflict."""
    missing_stop_dir = FIXTURES_DIR / "invalid_missing_stop"
    report = validator.validate_directory(missing_stop_dir)

    assert report.is_valid is False
    assert "AC2" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC2"}
    assert "MISSING_STOP" in failure_codes


def test_forbidden_geometry_payload_fails_ac8(validator):
    """Verify AC8 failure when a research artifact attempts to inject GeoJSON/vector route lines."""
    geom_dir = FIXTURES_DIR / "invalid_geometry_payload"
    report = validator.validate_directory(geom_dir)

    assert report.is_valid is False
    assert "AC8" in report.failed_criteria
    failure_codes = {f.code for f in report.failures if f.criterion == "AC8"}
    assert "FORBIDDEN_GEOMETRY_PAYLOAD" in failure_codes


def test_nonexistent_directory_fails_ac10(validator):
    """Verify AC10 failure on nonexistent target directory."""
    nonexistent = FIXTURES_DIR / "nonexistent_dir_123"
    report = validator.validate_directory(nonexistent)

    assert report.is_valid is False
    assert "AC10" in report.failed_criteria
