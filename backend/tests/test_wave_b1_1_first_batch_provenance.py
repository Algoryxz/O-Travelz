"""
backend/tests/test_wave_b1_1_first_batch_provenance.py — Wave B1.1 Test Suite.

Proves:
1. In-bounds coordinates alone do NOT imply promotion readiness.
2. Project research without traceable upstream evidence is insufficient for READY_NEW.
3. Missing coordinate provenance prevents READY status.
4. Locality/town centroid precision prevents READY status.
5. Generic name alone does not automatically fail if locality/source resolves identity.
6. Ambiguous generic identity does prevent READY status (routes to BLOCKED).
7. Duplicate coordinates create forensic cluster review.
8. Legitimate co-located facilities are not automatically rejected.
9. Canonical exact match routes to READY_FOR_CANONICAL_ENRICHMENT.
10. Canonical alias routes to enrichment, never duplicate NEW insertion.
11. All input records are partitioned exactly once (accounting invariant).
12. READY_NEW records satisfy every required truth dimension.
13. READY_ENRICHMENT records identify their canonical target.
14. No protected database counts have changed.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import pytest

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
STAGING_DIR = WORKSPACE_ROOT / "data" / "staging" / "statewide_entities"
REPORTS_DIR = WORKSPACE_ROOT / "reports"

READY_NEW_PATH = STAGING_DIR / "first_batch_ready_new.json"
READY_ENRICH_PATH = STAGING_DIR / "first_batch_ready_enrichment.json"
REVIEW_PATH = STAGING_DIR / "first_batch_review.json"
BLOCKED_PATH = STAGING_DIR / "first_batch_blocked.json"
CROSSWALK_PATH = STAGING_DIR / "first_batch_identity_crosswalk.json"

CLUSTERS_REP_PATH = REPORTS_DIR / "statewide_first_batch_coordinate_clusters.json"
OVERLAP_REP_PATH = REPORTS_DIR / "statewide_first_batch_canonical_overlap.json"
READINESS_REP_PATH = REPORTS_DIR / "statewide_first_batch_promotion_readiness.json"
DB_BEFORE_PATH = REPORTS_DIR / "statewide_first_batch_db_before.json"


@pytest.fixture(scope="module")
def ready_new():
    with open(READY_NEW_PATH, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def ready_enrichment():
    with open(READY_ENRICH_PATH, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def review_required():
    with open(REVIEW_PATH, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def blocked():
    with open(BLOCKED_PATH, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def clusters():
    with open(CLUSTERS_REP_PATH, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def overlaps():
    with open(OVERLAP_REP_PATH, encoding="utf-8") as f:
        return json.load(f)


def test_all_input_records_partitioned_exactly_once(ready_new, ready_enrichment, review_required, blocked):
    """11. All 790 input records must be partitioned exactly once without any silent skips or duplicates."""
    total = len(ready_new) + len(ready_enrichment) + len(review_required) + len(blocked)
    assert total == 790, f"Expected 790 total partitioned records, got {total}"
    assert len(ready_new) == 189
    assert len(ready_enrichment) == 12
    assert len(review_required) == 577
    assert len(blocked) == 12

    # Verify ID set uniqueness across all partitions
    all_ids = set()
    for subset in (ready_new, ready_enrichment, review_required, blocked):
        ids = set(r["candidate_id"] for r in subset)
        assert not (all_ids & ids), f"Duplicate candidate IDs detected between partitions: {all_ids & ids}"
        all_ids.update(ids)
    assert len(all_ids) == 790


def test_in_bounds_alone_does_not_imply_readiness(ready_new, review_required, blocked):
    """1. Prove that in-bounds coordinates alone do NOT imply readiness."""
    # All candidates in the batch are in-bounds, yet only a fraction are ready_new
    assert len(ready_new) < len(review_required)
    assert len(ready_new) == 189
    assert len(review_required) == 577
    # Ensure there exist in-bounds records that are placed in review_required due to lack of evidence
    for rec in review_required[:10]:
        assert 17.78 <= float(rec["latitude"]) <= 22.57
        assert 81.37 <= float(rec["longitude"]) <= 87.50
        assert "review_reasons" in rec and len(rec["review_reasons"]) > 0


def test_project_research_without_traceable_upstream_evidence_is_insufficient(ready_new, review_required):
    """2. Project research / public geospatial sources without official primary citation cannot be READY_NEW."""
    for rec in ready_new:
        assert rec["source_authority"] in {
            "OFFICIAL_PRIMARY",
            "OFFICIAL_SECONDARY",
            "AUTHORITATIVE_INSTITUTIONAL",
        }, f"Ready new record {rec['candidate_id']} has unacceptable authority: {rec['source_authority']}"

    # Confirm that all 167 OpenStreetMap (OSM) public records were quarantined to review or blocked
    osm_in_ready_new = [r for r in ready_new if "openstreetmap" in (r.get("provenance") or "").lower()]
    assert len(osm_in_ready_new) == 0, "No raw OpenStreetMap records may be promoted to READY_NEW"


def test_missing_coordinate_provenance_prevents_ready(ready_new, review_required):
    """3. Missing coordinate provenance prevents READY status."""
    for rec in ready_new:
        assert rec.get("coordinate_status") == "VERIFIED_OFFICIAL"
        assert rec.get("coordinate_precision") in {"FACILITY_ENTRANCE", "FACILITY_FOOTPRINT", "FACILITY_COMPOUND"}


def test_locality_town_centroid_precision_prevents_ready(ready_new, review_required):
    """4. Locality / town centroid precision prevents READY status."""
    for rec in ready_new:
        assert rec.get("coordinate_precision") not in {"TOWN_CENTROID", "LOCALITY", "STREET_SEGMENT"}

    # Review required must contain all town centroid records
    centroids = [r for r in review_required if r.get("coordinate_precision") in {"TOWN_CENTROID", "LOCALITY"}]
    assert len(centroids) > 0, "Expected town/locality centroids to be captured in review_required"


def test_generic_name_alone_does_not_automatically_fail_if_locality_resolves(ready_new):
    """5. Common / generic names do not automatically fail if locality & context resolves identity."""
    # Records like "Baripada Town Police Station" or "SBI ATM Master Canteen Bhubaneswar" should be accepted
    common_word_records = [
        r for r in ready_new
        if "town" in r["canonical_name"].lower() or "main" in r["canonical_name"].lower() or "sadar" in r["canonical_name"].lower()
    ]
    assert len(common_word_records) > 0
    for r in common_word_records:
        assert r["identity_status"] == "VERIFIED_IDENTITY"


def test_ambiguous_generic_identity_prevents_ready(blocked):
    """6. Ambiguous generic unadorned names (e.g. 'POLICE STATION', 'Indian Oil') are BLOCKED."""
    blocked_names = [b["canonical_name"] for b in blocked]
    assert "POLICE STATION" in blocked_names
    assert "Indian Oil" in blocked_names
    assert "Bharat Petroleum" in blocked_names
    for b in blocked:
        assert "ID_AMBIGUOUS" in " ".join(b.get("blocking_reasons", [])) or "GEO_OUT_OF_ODISHA" in " ".join(b.get("blocking_reasons", []))


def test_duplicate_coordinates_create_forensic_cluster_review(clusters, review_required):
    """7. Duplicate coordinates create forensic cluster review."""
    assert clusters["total_clusters"] == 86
    # Clusters with unrelated facilities across categories must be quarantined
    centroid_clusters = [c for c in clusters["clusters"] if c["classification"] in {"LIKELY_TOWN_CENTROID", "SUSPECTED_CROSS_CATEGORY_REUSE"}]
    assert len(centroid_clusters) > 0
    # Any member of a centroid cluster must not be in ready_new
    cluster_member_ids = set()
    for c in centroid_clusters:
        for ent in c["entities"]:
            cluster_member_ids.add(ent["candidate_id"])

    with open(READY_NEW_PATH, encoding="utf-8") as f:
        rn_ids = set(r["candidate_id"] for r in json.load(f))
    assert not (cluster_member_ids & rn_ids), f"Cluster members leaked into ready_new: {cluster_member_ids & rn_ids}"


def test_legitimate_colocated_facilities_not_automatically_rejected(clusters):
    """8. Legitimate co-located facilities (e.g. ATM on hospital campus) are classified as PLAUSIBLE_COLOCATION."""
    plausible = [c for c in clusters["clusters"] if c["classification"] == "PLAUSIBLE_COLOCATION"]
    assert len(plausible) > 0
    for p in plausible:
        assert "ATM" in p["categories"] and "HOSPITAL" in p["categories"]


def test_canonical_exact_match_routes_to_ready_enrichment(ready_enrichment, ready_new):
    """9. Canonical exact matches route to READY_FOR_CANONICAL_ENRICHMENT and NOT READY_FOR_CANONICAL_NEW."""
    enrich_names = [r["canonical_name"] for r in ready_enrichment]
    assert "SCB Medical College and Hospital" in enrich_names
    assert "All India Institute of Medical Sciences (AIIMS) Bhubaneswar" in enrich_names
    assert "Capital Hospital Bhubaneswar" in enrich_names
    assert "MKCG Medical College & Hospital" in enrich_names
    assert "SLN Medical College & Hospital Koraput" in enrich_names

    rn_names = [r["canonical_name"] for r in ready_new]
    for en in ["SCB Medical College and Hospital", "AIIMS Bhubaneswar", "Capital Hospital Bhubaneswar"]:
        assert en not in rn_names, f"Canonical exact match {en} was incorrectly inserted into ready_new"


def test_canonical_alias_routes_to_enrichment_not_duplicate_new(ready_enrichment, ready_new):
    """10. Canonical aliases (e.g. VIMSAR, IGH, BBMCH, FMMCH, DDMCH) route to enrichment."""
    enrich_names = [r["canonical_name"] for r in ready_enrichment]
    assert any("VIMSAR" in n for n in enrich_names)
    assert any("IGH" in n or "Ispat" in n for n in enrich_names)
    assert any("BBMCH" in n or "Bhima Bhoi" in n for n in enrich_names)
    assert any("FMMCH" in n or "Fakir Mohan" in n for n in enrich_names)
    assert any("DDMCH" in n or "Dharanidhar" in n for n in enrich_names)
    assert any("PRMMCH" in n or "Raghunath Murmu" in n for n in enrich_names)
    assert any("Puri" in n and "Headquarters" in n for n in enrich_names)


def test_ready_new_records_satisfy_every_truth_dimension(ready_new):
    """12. READY_NEW records satisfy every required truth dimension."""
    for r in ready_new:
        assert r["identity_status"] == "VERIFIED_IDENTITY"
        assert r["coordinate_status"] == "VERIFIED_OFFICIAL"
        assert r["coordinate_precision"] in {"FACILITY_ENTRANCE", "FACILITY_FOOTPRINT", "FACILITY_COMPOUND"}
        assert r["source_authority"] in {"OFFICIAL_PRIMARY", "OFFICIAL_SECONDARY", "AUTHORITATIVE_INSTITUTIONAL"}
        assert r["canonical_overlap"] in {"NEW_ENTITY", "COLOCATED_DISTINCT"}
        assert "readiness_rationale" in r and len(r["readiness_rationale"]) > 0


def test_ready_enrichment_records_identify_canonical_target(ready_enrichment):
    """13. READY_ENRICHMENT records identify their canonical target ID and name."""
    assert len(ready_enrichment) == 12
    for r in ready_enrichment:
        assert r["canonical_target_id"] is not None
        assert r["canonical_target_name"] is not None
        assert "enrichment_rationale" in r and len(r["enrichment_rationale"]) > 0


def test_no_protected_database_counts_change():
    """14. Live database counts are identical to the BEFORE snapshot (ZERO canonical mutation)."""
    with open(DB_BEFORE_PATH, encoding="utf-8") as f:
        before = json.load(f)

    from sqlalchemy import create_engine, text
    from dotenv import load_dotenv

    load_dotenv(WORKSPACE_ROOT / "backend" / ".env")
    db_url = os.environ.get("DATABASE_URL")
    assert db_url, "DATABASE_URL not set"

    engine = create_engine(db_url)
    with engine.connect() as conn:
        rev = conn.execute(text("SELECT version_num FROM alembic_version")).scalar()
        places_cnt = conn.execute(text("SELECT count(*) FROM places")).scalar()
        media_assets_cnt = conn.execute(text("SELECT count(*) FROM media_assets")).scalar()
        entity_media_cnt = conn.execute(text("SELECT count(*) FROM entity_media")).scalar()
        place_images_cnt = conn.execute(text("SELECT count(*) FROM place_images")).scalar()
        rel_cnt = conn.execute(text("SELECT count(*) FROM entity_relationships")).scalar()
        routes_cnt = conn.execute(text("SELECT count(*) FROM routes")).scalar()
        stops_cnt = conn.execute(text("SELECT count(*) FROM stops")).scalar()
        route_stops_cnt = conn.execute(text("SELECT count(*) FROM route_stops")).scalar()
        sched_groups_cnt = conn.execute(text("SELECT count(*) FROM scheduled_trip_groups")).scalar()
        rows = conn.execute(text("SELECT departure_times_chronological FROM scheduled_trip_groups")).fetchall()
        total_departures = sum(len(r[0]) for r in rows)

    assert rev == before["alembic_version"]
    assert places_cnt == before["database_counts"]["places"] == 204
    assert media_assets_cnt == before["database_counts"]["media_assets"] == 116
    assert entity_media_cnt == before["database_counts"]["entity_media"] == 70
    assert place_images_cnt == before["database_counts"]["place_images"] == 70
    assert rel_cnt == before["database_counts"]["entity_relationships"] == 0
    assert routes_cnt == before["database_counts"]["routes"] == 154
    assert stops_cnt == before["database_counts"]["stops"] == 1430
    assert route_stops_cnt == before["database_counts"]["route_stops"] == 1491
    assert sched_groups_cnt == before["database_counts"]["schedules"] == 302
    assert total_departures == before["database_counts"]["departures"] == 5553
