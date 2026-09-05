"""
backend/tests/test_wave_a3a_b1_statewide_expansion.py — Wave A3a & B1 Test Suite.

Verifies:
1. Canonical Places Odia Localization Staging (204 total, 25 verified READY, 179 MISSING, 0 fabricated).
2. Statewide Dataset Inventory Before Report (24 datasets audited, 204 canonical + 1212 raw staged).
3. 17 Orthogonal Unified Entity Types compliance.
4. Candidate Compilation Invariants (1198 unique, 1179 high confidence, 14 deduplicated, 3 conflicts).
5. Identity Crosswalk & Classification Ledger.
6. Promotion Readiness Matrix & First Batch Recommendations.
7. Geo Quality & Odisha Bounding Box Enforcement.
8. Media Coverage Gap Matrix for Staged Candidates.
9. Relationship Graph Seeds (491 candidate edges).
"""
import json
from pathlib import Path
import pytest

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent

LOC_STAGING_PATH = WORKSPACE_ROOT / "data" / "localization" / "staging" / "places_localized_names.json"
STAGING_ENTITIES_DIR = WORKSPACE_ROOT / "data" / "staging" / "statewide_entities"
ENTITIES_PATH = STAGING_ENTITIES_DIR / "entities.json"
SOURCES_PATH = STAGING_ENTITIES_DIR / "sources.json"
DUPLICATES_PATH = STAGING_ENTITIES_DIR / "duplicates.json"
CONFLICTS_PATH = STAGING_ENTITIES_DIR / "conflicts.json"
PROMOTION_CANDIDATES_PATH = STAGING_ENTITIES_DIR / "promotion_candidates.json"
REJECTED_PATH = STAGING_ENTITIES_DIR / "rejected_candidates.json"
GAP_MATRIX_PATH = STAGING_ENTITIES_DIR / "gap_matrix.json"
RELATIONSHIPS_PATH = STAGING_ENTITIES_DIR / "relationships.json"

REP_INVENTORY = WORKSPACE_ROOT / "reports" / "statewide_entity_inventory_before.json"
REP_CROSSWALK = WORKSPACE_ROOT / "reports" / "statewide_entity_identity_crosswalk.json"
REP_READINESS = WORKSPACE_ROOT / "reports" / "statewide_entity_promotion_readiness.json"
REP_MEDIA_GAP = WORKSPACE_ROOT / "reports" / "statewide_media_gap_matrix.json"

ODISHA_LAT_MIN = 17.78
ODISHA_LAT_MAX = 22.57
ODISHA_LON_MIN = 81.37
ODISHA_LON_MAX = 87.50

UNIFIED_ENTITY_TYPES = {
    "ATTRACTION",
    "HERITAGE_SITE",
    "RELIGIOUS_SITE",
    "NATURAL_SITE",
    "FOOD_PLACE",
    "RESTAURANT",
    "HOTEL",
    "HOSPITAL",
    "POLICE_STATION",
    "FIRE_STATION",
    "ATM",
    "BANK",
    "FUEL_STATION",
    "TRANSIT_HUB",
    "MARKET",
    "CRAFT_CLUSTER",
    "PUBLIC_SERVICE",
}


# ==============================================================================
# PHASE 1 & 2: LOCALIZATION AUDIT & ODIA IDENTITY STAGING
# ==============================================================================

def test_canonical_places_odia_localization_staging_exists():
    """Verify places_localized_names.json exists and contains exactly 204 places."""
    assert LOC_STAGING_PATH.exists(), f"Missing {LOC_STAGING_PATH}"
    with open(LOC_STAGING_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)

    assert len(records) == 204, f"Expected 204 places, got {len(records)}"

    ready_count = sum(1 for r in records if r["status"] == "READY")
    missing_count = sum(1 for r in records if r["status"] == "MISSING")

    # Exactly 25 verified cultural heritage sites
    assert ready_count == 25, f"Expected 25 READY records, got {ready_count}"
    assert missing_count == 179, f"Expected 179 MISSING records, got {missing_count}"

    # Zero fabricated Hindi
    for r in records:
        assert r["localized_names"]["hi"] is None, f"Fabricated Hindi in {r['entity_id']}"
        assert r["localized_names"]["en"] == r["canonical_name"]

    # Verify Konark, Jagannath, Lingaraj native names
    by_id = {r["entity_id"]: r for r in records}
    assert by_id["place_konark_001"]["localized_names"]["or"] == "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର"
    assert by_id["place_puri_001"]["localized_names"]["or"] == "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର"
    assert by_id["place_bbsr_001"]["localized_names"]["or"] == "ଲିଙ୍ଗରାଜ ମନ୍ଦିର"
    assert by_id["place_bbsr_006"]["localized_names"]["or"] == "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ"
    assert by_id["place_mayurbhanj_001"]["localized_names"]["or"] == "ଶିମିଳିପାଳ ଜାତୀୟ ଉଦ୍ୟାନ"


# ==============================================================================
# PHASE 3: STATEWIDE DATASET INVENTORY
# ==============================================================================

def test_statewide_dataset_inventory_report():
    """Verify reports/statewide_entity_inventory_before.json audits all 24 datasets."""
    assert REP_INVENTORY.exists(), f"Missing {REP_INVENTORY}"
    with open(REP_INVENTORY, "r", encoding="utf-8") as f:
        inv = json.load(f)

    summary = inv["summary"]
    assert summary["total_canonical_records"] == 204
    assert summary["total_staged_raw_records"] == 1212
    assert summary["total_datasets_audited"] == 24

    datasets = {d["source_path"]: d for d in summary["datasets"]}
    assert "data/places/places.json" in datasets
    assert "data/research/food/odisha_food_research.json" in datasets
    assert "data/services/odisha_services.json" in datasets
    assert "data/health/hospitals_northern_odisha.json" in datasets
    assert "data/health/hospitals_western_odisha.json" in datasets


# ==============================================================================
# PHASE 4 & 5: STATEWIDE CANDIDATE COMPILER ARTIFACTS
# ==============================================================================

def test_staging_candidate_artifacts_exist():
    """Verify all 8 staging statewide candidate artifacts exist."""
    assert ENTITIES_PATH.exists()
    assert SOURCES_PATH.exists()
    assert DUPLICATES_PATH.exists()
    assert CONFLICTS_PATH.exists()
    assert PROMOTION_CANDIDATES_PATH.exists()
    assert REJECTED_PATH.exists()
    assert GAP_MATRIX_PATH.exists()
    assert RELATIONSHIPS_PATH.exists()

    with open(ENTITIES_PATH, "r", encoding="utf-8") as f:
        entities = json.load(f)
    assert len(entities) == 1198, f"Expected 1198 deduplicated entities, got {len(entities)}"

    # All candidate records must have valid orthogonal entity_type
    for e in entities:
        assert e["entity_type"] in UNIFIED_ENTITY_TYPES, f"Invalid entity_type: {e['entity_type']}"
        assert e["candidate_id"], f"Missing candidate_id: {e}"
        assert e["canonical_name"], f"Missing canonical_name: {e}"


def test_deduplication_and_duplicate_ledger():
    """Verify reports/duplicates.json documents within-dataset and mirror-dataset collapses."""
    with open(DUPLICATES_PATH, "r", encoding="utf-8") as f:
        dupes = json.load(f)
    assert len(dupes) == 14, f"Expected 14 deduplicated duplicates, got {len(dupes)}"


# ==============================================================================
# PHASE 6: IDENTITY DEDUPLICATION & CROSSWALK
# ==============================================================================

def test_identity_crosswalk_report():
    """Verify reports/statewide_entity_identity_crosswalk.json classifications."""
    assert REP_CROSSWALK.exists()
    with open(REP_CROSSWALK, "r", encoding="utf-8") as f:
        cw = json.load(f)

    summary = cw["summary"]
    assert summary["total_raw_records"] == 1212
    assert summary["unique_entities"] == 1198
    assert summary["duplicates_collapsed"] == 14
    assert summary["conflicts_detected"] == 3


# ==============================================================================
# PHASE 7: GEO QUALITY & ODISHA BOUNDING BOX
# ==============================================================================

def test_geo_quality_and_bounding_box():
    """Verify all high confidence promotable candidates fall strictly within Odisha."""
    with open(PROMOTION_CANDIDATES_PATH, "r", encoding="utf-8") as f:
        candidates = json.load(f)

    high_conf = [c for c in candidates if c.get("promotion_tier") == "HIGH_CONFIDENCE_PROMOTABLE"]
    assert len(high_conf) == 1179, f"Expected 1179 high confidence candidates, got {len(high_conf)}"

    for c in high_conf:
        lat = c["latitude"]
        lon = c["longitude"]
        assert lat is not None and lon is not None, f"Null coords in {c['candidate_id']}"
        assert ODISHA_LAT_MIN <= lat <= ODISHA_LAT_MAX, f"Lat {lat} out of Odisha bounds for {c['candidate_id']}"
        assert ODISHA_LON_MIN <= lon <= ODISHA_LON_MAX, f"Lon {lon} out of Odisha bounds for {c['candidate_id']}"
        assert c["coordinate_status"] == "VERIFIED_GEOSPATIAL"


# ==============================================================================
# PHASE 8 & 9: PROMOTION READINESS MATRIX & FIRST BATCH SELECTION
# ==============================================================================

def test_promotion_readiness_matrix_and_first_batch():
    """Verify reports/statewide_entity_promotion_readiness.json category readiness."""
    assert REP_READINESS.exists()
    with open(REP_READINESS, "r", encoding="utf-8") as f:
        readiness = json.load(f)

    summary = readiness["summary"]
    assert summary["total_candidates"] == 1198
    assert summary["high_confidence_promotable"] == 1179
    assert summary["review_required"] == 19

    categories = summary["categories"]
    assert "HOSPITAL" in categories
    assert "POLICE_STATION" in categories
    assert "FIRE_STATION" in categories
    assert "ATM" in categories
    assert "FUEL_STATION" in categories

    # Verify hospital, police, fire, atm, fuel are recommended for first promotion batch
    assert categories["HOSPITAL"]["recommended_for_first_batch"] is True
    assert categories["POLICE_STATION"]["recommended_for_first_batch"] is True
    assert categories["FIRE_STATION"]["recommended_for_first_batch"] is True
    assert categories["ATM"]["recommended_for_first_batch"] is True
    assert categories["FUEL_STATION"]["recommended_for_first_batch"] is True


# ==============================================================================
# PHASE 11: MEDIA GAP MATRIX
# ==============================================================================

def test_media_gap_matrix_report():
    """Verify reports/statewide_media_gap_matrix.json correctly audits candidate media."""
    assert REP_MEDIA_GAP.exists()
    with open(REP_MEDIA_GAP, "r", encoding="utf-8") as f:
        media_gap = json.load(f)

    summary = media_gap["summary"]
    assert summary["total_candidates"] == 1198
    assert summary["no_media"] == 1198
    assert summary["media_coverage_pct"] == 0.0


# ==============================================================================
# PHASE 12: RELATIONSHIP GRAPH SEEDS
# ==============================================================================

def test_relationship_graph_seeds():
    """Verify data/staging/statewide_entities/relationships.json contains valid candidate edges."""
    assert RELATIONSHIPS_PATH.exists()
    with open(RELATIONSHIPS_PATH, "r", encoding="utf-8") as f:
        edges = json.load(f)

    assert len(edges) == 491, f"Expected 491 candidate relationship edges, got {len(edges)}"

    rel_types = set(e["relationship_type"] for e in edges)
    assert "NEAREST_POLICE_STATION_TO" in rel_types
    assert "NEAREST_HOSPITAL_TO" in rel_types
    assert "NEAR" in rel_types

    for e in edges:
        assert e["id"]
        assert e["source_entity_id"]
        assert e["target_entity_id"]
        assert e["relationship_type"]
        assert e["confidence"] in ("VERIFIED", "HIGH", "MEDIUM")
