"""
backend/tests/test_wave_c3_staging.py — Wave C3 Five-Region Ama Bus Staging Verification.

Verifies:
1. C3A Identity Closure across 939 candidates in Capital Region, Rourkela, and Berhampur.
2. Keonjhar DHH coordinate repair proposal (hosp_north_013).
3. Five-region stops coverage, stable IDs, and zero coordinate fabrication.
4. Five-region route-stop sequences (1,491/1,491 resolved links).
5. Five-region locality resolution contract against validation domain.
6. C3 Gap matrix accounting integrity across all 5 operational regions.
7. Promotion readiness evaluation and zero automatic canonical mutation invariant.
"""
import json
import math
import subprocess
from pathlib import Path
from typing import Any, Dict, List

import pytest

from app.validation import codes
from app.validation.domains.transit import validate_transit_stop
from app.validation.models import ValidationProfile, ValidationReport, ValidationSeverity

REPO_ROOT = Path(__file__).resolve().parents[2]
STAGING_DIR = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus"
CANONICAL_DIR = REPO_ROOT / "data" / "transport" / "canonical"

REGIONAL_ANCHORS = {
    "CAPITAL_REGION": {"lat": 20.2961, "lon": 85.8245, "max_km": 95.0},
    "ROURKELA": {"lat": 22.2604, "lon": 84.8536, "max_km": 75.0},
    "SAMBALPUR": {"lat": 21.4669, "lon": 83.9812, "max_km": 80.0},
    "BERHAMPUR": {"lat": 19.3150, "lon": 84.7941, "max_km": 65.0},
    "KEONJHAR": {"lat": 21.6289, "lon": 85.5817, "max_km": 75.0},
}


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# -----------------------------------------------------------------------------
# 1. C3A Identity Closure Tests
# -----------------------------------------------------------------------------
def test_c3a_identity_closure_dataset():
    identity_file = STAGING_DIR / "c3_identity_resolution.json"
    assert identity_file.exists(), "c3_identity_resolution.json must exist"

    with open(identity_file, encoding="utf-8") as fh:
        data = json.load(fh)

    assert data.get("total_candidates") == 939
    resolutions = data.get("resolutions", [])
    assert len(resolutions) == 939

    status_counts = data.get("identity_status_summary", {})
    assert status_counts.get("VERIFIED_UNIQUE") == 929
    assert status_counts.get("VERIFIED_ALIAS_OF_EXISTING") == 5
    assert status_counts.get("VERIFIED_DISTINCT_SAME_NAME") == 2
    assert status_counts.get("AMBIGUOUS_REQUIRES_REVIEW") == 3
    assert sum(status_counts.values()) == 939

    regions = set(r["region"] for r in resolutions)
    assert regions == {"CAPITAL_REGION", "ROURKELA", "BERHAMPUR"}

    # Validate individual record structure
    for r in resolutions:
        assert r.get("candidate_key", "").startswith("cand_crut_")
        assert bool(r.get("canonical_candidate_name"))
        assert isinstance(r.get("published_names"), list) and len(r["published_names"]) > 0
        assert r.get("identity_status") in {
            "VERIFIED_UNIQUE",
            "VERIFIED_ALIAS_OF_EXISTING",
            "VERIFIED_DISTINCT_SAME_NAME",
            "AMBIGUOUS_REQUIRES_REVIEW",
        }
        assert r.get("confidence") in {"HIGH", "LOW"}
        assert isinstance(r.get("evidence"), list)


# -----------------------------------------------------------------------------
# 2. Keonjhar DHH Repair Proposal Tests
# -----------------------------------------------------------------------------
def test_keonjhar_dhh_repair_proposal():
    repair_file = STAGING_DIR / "coordinate_corrections_proposed.json"
    assert repair_file.exists(), "coordinate_corrections_proposed.json must exist"

    with open(repair_file, encoding="utf-8") as fh:
        corrections = json.load(fh)

    assert len(corrections) >= 1
    dhh = next((c for c in corrections if c["stop_id"] == "stop_crut_keonjhar_district_hospital"), None)
    assert dhh is not None, "stop_crut_keonjhar_district_hospital correction must be present"

    # Verify old bad Puri conflation coordinate
    assert dhh["old_lat"] == 19.8167
    assert dhh["old_lon"] == 85.8333

    # Verify proposed official Keonjhar coordinate
    assert dhh["proposed_lat"] == 21.6285
    assert dhh["proposed_lon"] == 85.5820
    assert dhh["new_provenance"] == "official_district_portal_gis"
    assert dhh["verification_status"] == "VERIFIED_OFFICIAL"
    assert dhh["review_status"] == "PROPOSED_REPAIR"

    # Verify distance to Keonjhar anchor is within 1 km (0.05 km)
    dist = dhh["distance_to_anchor_km"]
    assert dist <= 1.0, f"Proposed DHH distance {dist} km exceeds 1 km tolerance"


# -----------------------------------------------------------------------------
# 3. Five-Region Stops Universe Tests
# -----------------------------------------------------------------------------
def test_five_region_stops_coverage_and_quality():
    stops_file = STAGING_DIR / "five_region_stops.json"
    assert stops_file.exists(), "five_region_stops.json must exist"

    with open(stops_file, encoding="utf-8") as fh:
        stops = json.load(fh)

    assert len(stops) == 1421

    seen_ids = set()
    for s in stops:
        sid = s.get("stop_id", "")
        assert sid.startswith("stop_crut_"), f"Invalid stop ID format: {sid}"
        assert sid not in seen_ids, f"Duplicate stop ID: {sid}"
        seen_ids.add(sid)

        assert bool(s.get("canonical_name"))
        assert s.get("operator") == "CRUT"
        assert s.get("network") in {"AMA Bus", "Mo Bus"}

        coord_status = s.get("coordinate_status")
        assert coord_status in {"VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL", "UNRESOLVED"}

        # Coordinate presence contract
        lat, lon = s.get("lat"), s.get("lon")
        if coord_status == "UNRESOLVED":
            assert lat is None and lon is None
        else:
            assert isinstance(lat, (int, float)) and isinstance(lon, (int, float))
            # Coordinate must be inside Odisha bounding box
            assert 17.5 <= lat <= 23.0
            assert 81.0 <= lon <= 88.0

    # Verify Keonjhar DHH is repaired in staging stops
    stg_dhh = next((s for s in stops if s["stop_id"] == "stop_crut_keonjhar_district_hospital"), None)
    assert stg_dhh is not None
    assert stg_dhh["lat"] == 21.6285
    assert stg_dhh["lon"] == 85.5820
    assert stg_dhh["coordinate_status"] == "VERIFIED_OFFICIAL"


# -----------------------------------------------------------------------------
# 4. Five-Region Route-Stop Linkage Tests
# -----------------------------------------------------------------------------
def test_five_region_route_stops_linkage():
    rs_file = STAGING_DIR / "five_region_route_stops.json"
    stops_file = STAGING_DIR / "five_region_stops.json"
    assert rs_file.exists(), "five_region_route_stops.json must exist"

    with open(rs_file, encoding="utf-8") as fh:
        sequences = json.load(fh)
    with open(stops_file, encoding="utf-8") as fh:
        stops = json.load(fh)

    stop_ids = {s["stop_id"] for s in stops}

    assert len(sequences) == 159
    total_links = 0
    resolved_links = 0

    for seq in sequences:
        assert seq.get("sequence_id", "").startswith("rt_crut_")
        assert bool(seq.get("route_id"))
        assert bool(seq.get("route_number"))
        assert seq.get("direction") in {"forward", "backward"}

        seq_stops = seq.get("stops", [])
        assert len(seq_stops) > 0
        seen_pos = set()

        for st in seq_stops:
            total_links += 1
            pos = st.get("sequence")
            assert pos is not None and pos not in seen_pos and pos > 0
            seen_pos.add(pos)

            sid = st.get("stop_id")
            assert bool(sid)
            if sid in stop_ids:
                resolved_links += 1
                assert st.get("resolution_status") == "RESOLVED_LOGICAL"
            else:
                assert st.get("resolution_status") == "AMBIGUOUS_REQUIRES_REVIEW"

    assert total_links == 1491
    assert resolved_links == 1491, f"Expected 100% resolved links, got {resolved_links}/{total_links}"


# -----------------------------------------------------------------------------
# 5. Locality Resolution Contract Tests
# -----------------------------------------------------------------------------
def test_five_region_locality_resolution_validation():
    loc_file = STAGING_DIR / "five_region_locality_resolution.json"
    assert loc_file.exists(), "five_region_locality_resolution.json must exist"

    with open(loc_file, encoding="utf-8") as fh:
        loc_stops = json.load(fh)

    assert len(loc_stops) == 1421

    # Run validation domain on a representative sample of records across all regions
    report = ValidationReport(profile=ValidationProfile.PROMOTION)
    for s in loc_stops:
        validate_transit_stop(s, report)

    # In promotion profile, there must be ZERO errors
    errors = [i for i in report.issues if i.severity == ValidationSeverity.ERROR]
    assert len(errors) == 0, f"Validation errors found: {[e.message for e in errors[:5]]}"

    # Verify map behavior truth decoupling
    for s in loc_stops:
        has_coord = s.get("lat") is not None and s.get("lon") is not None
        map_b = s.get("map_behavior", {})
        assert map_b.get("render_exact_marker") is has_coord
        assert map_b.get("participates_in_first_mile") is has_coord


# -----------------------------------------------------------------------------
# 6. C3 Gap Matrix Accounting Tests
# -----------------------------------------------------------------------------
def test_c3_gap_matrix_accounting():
    matrix_file = STAGING_DIR / "c3_gap_matrix.json"
    assert matrix_file.exists(), "c3_gap_matrix.json must exist"

    with open(matrix_file, encoding="utf-8") as fh:
        matrix = json.load(fh)

    assert matrix["total_extracted_records"] == 1430
    assert matrix["distinct_published_names"] == 1417
    assert matrix["resolved_physical_identities"] == 1421
    assert matrix["aliases_collapsed"] == 5
    assert matrix["same_name_distinct_entities"] == 2
    assert matrix["ambiguous_unresolved_entities"] == 3

    assert matrix["exact_verified_coordinates"] + matrix["locality_only_stops"] == 1421
    assert matrix["route_context_only_stops"] == 0
    assert matrix["fully_unresolved_stops"] == 0
    assert matrix["total_route_stop_links"] == 1491
    assert matrix["resolved_route_stop_links"] == 1491

    breakdown = matrix.get("regional_breakdown", {})
    assert len(breakdown) == 5
    assert set(breakdown.keys()) == {
        "CAPITAL_REGION",
        "ROURKELA",
        "SAMBALPUR",
        "BERHAMPUR",
        "KEONJHAR",
    }
    for reg, stats in breakdown.items():
        assert stats["total_stops"] > 0
        assert stats["fully_unresolved_stops"] == 0


# -----------------------------------------------------------------------------
# 7. Pre-Promotion Readiness & Immutability Invariant Tests
# -----------------------------------------------------------------------------
def test_c3_promotion_readiness():
    ready_file = STAGING_DIR / "c3_promotion_readiness.json"
    assert ready_file.exists(), "c3_promotion_readiness.json must exist"

    with open(ready_file, encoding="utf-8") as fh:
        ready = json.load(fh)

    assert ready["canonical_mutation_ready"] is True
    assert ready["do_not_promote_automatically_rule_honored"] is True

    checklist = ready.get("checklist", {})
    assert checklist["zero_blocking_identity_ambiguities_affecting_route_topology"] is True
    assert checklist["zero_regional_coordinate_fail_items"] is True
    assert checklist["all_stop_ids_stable"] is True
    assert checklist["all_route_stop_references_resolve"] is True
    assert checklist["all_five_regions_represented"] is True
    assert checklist["no_invented_coordinates"] is True
    assert checklist["canonical_validator_would_remain_green"] is True
    assert checklist["schedule_counts_remain_302_5553"] is True


def test_canonical_directory_untouched():
    """Permanent Rule: data/transport/canonical/ MUST stay 100% untouched until Wave C4 promotion."""
    c4_after = REPO_ROOT / "reports" / "transit_c4_after.json"
    if c4_after.exists():
        return
    res = subprocess.run(
        ["git", "diff", "--", "data/transport/canonical/"],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
    )
    assert res.returncode == 0
    assert res.stdout.strip() == "", f"Canonical transit files were mutated! Diff:\n{res.stdout}"
