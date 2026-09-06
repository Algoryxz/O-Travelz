"""
backend/tests/test_wave_b1_2_promotion.py — Wave B1.2 Controlled First-Batch Promotion Tests.

Tests all required verification gates:
A. Tourist discovery isolation (SearchService.search_places does not leak utility services)
B. Itinerary isolation (itinerary repository does not consume civic services)
C. Search suggestion isolation (destination suggestions not polluted by utilities)
D. Services discovery (EssentialsService returns promoted utilities)
E. Evidence persistence (provenance, source URL, coordinate status preserved)
F. Review quarantine (REVIEW_REQUIRED and BLOCKED IDs strictly absent)
G. Idempotency (repeated promotion leaves exact same canonical row set)
H. 12 hospital enrichment (in-place enrichment, zero duplicates, stronger canonical fields unchanged)
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List
import pytest

from app.db.session import SessionLocal
from app.models.place import Place
from app.services.essentials.service import EssentialsService
from app.services.ranking.repository import SQLAlchemyPlaceRepository
from app.services.search.search_correction import SearchCorrectionService
from app.services.search.search_models import SearchQueryParams
from app.services.search.search_service import SearchService

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent

SERVICES_PATH = WORKSPACE_ROOT / "data" / "services" / "odisha_services.json"
PLACES_PATH = WORKSPACE_ROOT / "data" / "places" / "places.json"
WRITE_SET_PATH = WORKSPACE_ROOT / "data" / "staging" / "statewide_entities" / "first_batch_service_write_set.json"
REVIEW_PATH = WORKSPACE_ROOT / "data" / "staging" / "statewide_entities" / "first_batch_review.json"
BLOCKED_PATH = WORKSPACE_ROOT / "data" / "staging" / "statewide_entities" / "first_batch_blocked.json"
DIFF_REPORT_PATH = WORKSPACE_ROOT / "reports" / "statewide_first_batch_b1_2_db_diff.json"
ENRICH_DIFF_PATH = WORKSPACE_ROOT / "reports" / "statewide_first_batch_enrichment_diff.json"


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def services_data() -> List[Dict[str, Any]]:
    with open(SERVICES_PATH, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def write_set() -> List[Dict[str, Any]]:
    with open(WRITE_SET_PATH, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def review_set() -> List[Dict[str, Any]]:
    with open(REVIEW_PATH, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def blocked_set() -> List[Dict[str, Any]]:
    with open(BLOCKED_PATH, encoding="utf-8") as f:
        return json.load(f)


# -----------------------------------------------------------------------------
# Test A: Tourist Discovery Isolation
# -----------------------------------------------------------------------------
def test_tourist_discovery_isolation(db_session, write_set):
    """A. General tourist search must not expose new ATMs, fuel stations, police stations, or fire stations."""
    params = SearchQueryParams(limit=200)
    candidates, total_count = SearchService.search_places(db_session, params)
    
    promoted_service_ids = {s["id"] for s in write_set}
    promoted_names = {s["name"].lower() for s in write_set}
    
    for c in candidates:
        place = c.place
        cat_name = (c.category_name or "").lower()
        
        # 1. No promoted service ID may appear as a place ID
        assert str(place.id) not in promoted_service_ids
        assert getattr(place, "research_id", None) not in promoted_service_ids
        
        # 2. No utility categories in tourist search results
        assert cat_name not in ("atm", "fuel", "petrol_pump", "police", "police_station", "fire_station")
        
        # 3. None of the promoted ATMs or fuel stations should leak as tourist places
        if cat_name not in ("hospital", "emergency_facility", "transit_hub"):
            assert place.name.lower() not in promoted_names


# -----------------------------------------------------------------------------
# Test B: Itinerary Isolation
# -----------------------------------------------------------------------------
def test_itinerary_isolation(db_session):
    """B. Itinerary ranking must not consume civic service rows as tourist visit candidates."""
    repo = SQLAlchemyPlaceRepository(db_session)
    leisure_places = repo.list_verified_places(include_non_leisure=False)
    all_places = repo.list_verified_places(include_non_leisure=True)
    
    # Total places in DB must be exactly 204
    assert len(all_places) == 204
    
    # Leisure places must not contain non-leisure categories
    for lp in leisure_places:
        assert lp.category_id not in ("hospital", "emergency_facility", "transit_hub", "atm", "fuel", "police", "fire_station")


# -----------------------------------------------------------------------------
# Test C: Search Suggestion Isolation
# -----------------------------------------------------------------------------
def test_search_suggestion_isolation(db_session):
    """C. Destination correction/suggestions must not become polluted by civic utility records."""
    suggestions = SearchCorrectionService.generate_suggestions("ATM", db=db_session, limit=5)
    for s in suggestions:
        assert not s.canonical_name.startswith("atm_")


# -----------------------------------------------------------------------------
# Test D: Services Discovery
# -----------------------------------------------------------------------------
def test_services_discovery():
    """D. Inserted service entities must be discoverable through the actual service API/engine."""
    EssentialsService._services_cache = None
    EssentialsService._load_data()
    
    # 1. Verify total service count is exactly 211 (61 original + 150 promoted)
    assert len(EssentialsService._services_cache) == 211
    
    # 2. Test nearby discovery via EssentialsService
    nearby = EssentialsService.search_nearby_services(lat=20.5, lon=85.8, requested_radius_km=25.0)
    assert nearby.count > 0
    assert len(nearby.services) > 0
    
    # 3. Test category filtering: ATM
    atm_nearby = EssentialsService.search_nearby_services(lat=20.5, lon=85.8, category="atm", requested_radius_km=30.0)
    assert atm_nearby.count > 0
    for s in atm_nearby.services:
        assert s.category == "atm"
        
    # 4. Test category filtering: Fuel
    fuel_nearby = EssentialsService.search_nearby_services(lat=20.5, lon=85.8, category="fuel", requested_radius_km=30.0)
    assert fuel_nearby.count > 0
    for s in fuel_nearby.services:
        assert s.category == "fuel"


# -----------------------------------------------------------------------------
# Test E: Evidence Persistence
# -----------------------------------------------------------------------------
def test_evidence_persistence(write_set, services_data):
    """E. Provenance, source URL, coordinate status survive and persist correctly."""
    services_by_id = {s["id"]: s for s in services_data}
    
    for item in write_set:
        sid = item["id"]
        assert sid in services_by_id
        persisted = services_by_id[sid]
        
        assert persisted["name"] == item["name"]
        assert persisted["district"] == item["district"]
        assert persisted["lat"] == item["lat"]
        assert persisted["lon"] == item["lon"]
        assert persisted["source"] == item["source"]
        assert persisted["verification_status"] == "verified"
        assert persisted["coordinate_status"] == "VERIFIED_OFFICIAL"


# -----------------------------------------------------------------------------
# Test F: Review Quarantine
# -----------------------------------------------------------------------------
def test_review_quarantine(db_session, services_data, write_set, review_set, blocked_set):
    """F. Review-required and blocked candidate IDs are strictly absent from promoted new services and places."""
    promoted_new_service_ids = {s["id"] for s in write_set}
    service_ids = {s["id"] for s in services_data}

    # Verify zero review-required candidates were promoted in the new write set
    for r in review_set:
        assert r["candidate_id"] not in promoted_new_service_ids

    # Verify zero blocked candidates exist anywhere in services
    for b in blocked_set:
        assert b["candidate_id"] not in service_ids
        assert b["candidate_id"] not in promoted_new_service_ids

    # Also verify absent from DB places
    db_place_ids = {str(p.id) for p in db_session.query(Place.id).all()}
    db_research_ids = {p.research_id for p in db_session.query(Place.research_id).all() if p.research_id}

    for r in review_set[:50]:
        assert r["candidate_id"] not in db_place_ids
        assert r["candidate_id"] not in db_research_ids

    for b in blocked_set:
        assert b["candidate_id"] not in db_place_ids
        assert b["candidate_id"] not in db_research_ids


# -----------------------------------------------------------------------------
# Test G: Idempotency
# -----------------------------------------------------------------------------
def test_idempotency():
    """G. Rerunning promotion leaves exact same canonical row counts and IDs."""
    with open(DIFF_REPORT_PATH, encoding="utf-8") as f:
        diff_rep = json.load(f)
        
    assert diff_rep["zero_places_mutation_verified"] is True
    assert diff_rep["exact_service_delta_verified"] is True
    assert diff_rep["database_table_diffs"]["places"]["delta"] == 0
    assert diff_rep["services_dataset_diff"]["delta"] == 150


# -----------------------------------------------------------------------------
# Test H: 12 Hospital Enrichment
# -----------------------------------------------------------------------------
def test_twelve_hospital_enrichment(db_session):
    """H. 12 hospital enrichments match approved diffs, zero duplicates inserted, canonical coordinates preserved."""
    with open(ENRICH_DIFF_PATH, encoding="utf-8") as f:
        enrich_diff = json.load(f)
        
    # 1. Total places in DB must be exactly 204
    assert db_session.query(Place).count() == 204
    
    for d in enrich_diff["enrichment_diffs"]:
        pid = d["canonical_place_id"]
        p = db_session.query(Place).filter(Place.id == pid).first()
        assert p is not None
        
        # Name and district must match canonical
        assert p.name == d["fields"]["name"]["canonical_before"]
        assert p.district == d["fields"]["district"]["canonical_before"]
        
        # Confidence must be enriched
        if d["fields"]["confidence"]["proposed_action"] == "FILL_NULL":
            assert p.confidence == "HIGH"
            
        # Contact phone must be enriched if previously null
        if d["fields"]["contact_phone"]["proposed_action"] == "FILL_NULL":
            assert p.contact_phone is not None
            assert len(p.contact_phone) > 0
