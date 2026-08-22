"""Tests for Whole-Odisha Search Service, Knowledge Retrieval, and Geospatial Data Access."""
from __future__ import annotations

import json
from pathlib import Path
from typing import List
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.data.odisha_districts import ODISHA_DISTRICTS
from app.db.session import get_db
from app.main import app
from app.models.category import Category
from app.models.place import Place
from app.models.interest import Interest, PlaceInterest
from app.services.search import (
    CompactKnowledgeRecord,
    SearchQueryParams,
    SearchService,
    calculate_place_score,
    extract_search_intent,
    get_alias_expansions,
    normalize_text,
    rank_candidates,
    tokenize,
)


class MockPoint:
    def __init__(self, lat: float, lon: float):
        self.y = lat
        self.x = lon


class MockPlacesDB:
    """In-memory mock database seeded from active data/places JSON files."""

    def __init__(self):
        data_dir = Path(__file__).resolve().parents[2] / "data" / "places"
        with open(data_dir / "categories.json", encoding="utf-8") as f:
            cat_data = json.load(f)
        with open(data_dir / "interests.json", encoding="utf-8") as f:
            int_data = json.load(f)
        with open(data_dir / "places.json", encoding="utf-8") as f:
            place_data = json.load(f)

        self.categories = {}
        for c in cat_data:
            cat_id = uuid4()
            cat = Category(id=cat_id, name=c["name"], description=c.get("description", ""))
            self.categories[c["name"]] = cat
            self.categories[str(cat_id)] = cat

        self.interests = {}
        for i in int_data:
            int_id = uuid4()
            interest = Interest(id=int_id, name=i["name"], description=i.get("description", ""))
            self.interests[i["name"]] = interest

        self.places = []
        for p in place_data:
            cat = self.categories.get(p["category"])
            place_id = uuid4()
            mock_loc = MockPoint(p["lat"], p["lon"])
            place = Place(
                id=place_id,
                name=p["name"],
                district=p.get("district"),
                category_id=cat.id if cat else uuid4(),
                description=p.get("description"),
                avg_visit_minutes=p.get("avg_visit_minutes", 60),
                price_tier=p.get("price_tier", "moderate"),
                source=p.get("source", "verified_curated"),
                verified_at="2026-08-19T00:00:00Z",
                verification_status=p.get("verification_status", "verified"),
                contact_phone=p.get("contact_phone"),
                emergency_phone=p.get("emergency_phone"),
                address=p.get("address"),
            )
            place.location = mock_loc
            place.lat = p["lat"]
            place.lon = p["lon"]
            place.research_id = p.get("id") or p.get("research_id", p["name"])
            
            # Attach interests
            place.interest_associations = []
            for int_name in p.get("interests", []):
                if int_name in self.interests:
                    assoc = PlaceInterest(
                        place_id=place_id,
                        interest_id=self.interests[int_name].id,
                    )
                    assoc.interest = self.interests[int_name]
                    place.interest_associations.append(assoc)

            self.places.append((place, cat or Category(id=place.category_id, name=p["category"])))

    def query(self, *models):
        return MockSearchQuery(self.places)


class MockSearchQuery:
    def __init__(self, items: List[tuple[Place, Category]]):
        self.items = items

    def join(self, *args, **kwargs):
        return self

    def options(self, *args, **kwargs):
        return self

    def filter(self, *criteria):
        filtered = self.items
        for crit in criteria:
            crit_str = str(crit).lower()
            if hasattr(crit, "left") and hasattr(crit, "right"):
                col_name = getattr(crit.left, "name", None)
                val = getattr(crit.right, "value", None)
                if col_name == "district":
                    val_clean = str(val).strip("%").lower() if val else ""
                    filtered = [(p, c) for p, c in filtered if getattr(p, "district", "") and val_clean == getattr(p, "district", "").lower()]
                elif col_name == "name" and "categories" in crit_str:
                    val_clean = str(val).strip("%").lower() if val else ""
                    filtered = [(p, c) for p, c in filtered if c and val_clean == c.name.lower()]
                elif col_name == "verification_status":
                    val_clean = str(val).strip("%").lower() if val else ""
                    filtered = [(p, c) for p, c in filtered if getattr(p, "verification_status", "") and val_clean == getattr(p, "verification_status", "").lower()]
            elif "categories.name" in crit_str:
                try:
                    val = str(crit.right.value).strip("%").lower()
                    filtered = [(p, c) for p, c in filtered if c and val == c.name.lower()]
                except Exception:
                    pass
            elif "places.district" in crit_str:
                try:
                    val = str(crit.right.value).strip("%").lower()
                    filtered = [(p, c) for p, c in filtered if getattr(p, "district", "") and val == getattr(p, "district", "").lower()]
                except Exception:
                    pass
            elif "place_interests" in crit_str or "interests" in crit_str:
                try:
                    val = str(crit.element.clauses[1].right.value).strip("%").lower()
                    filtered = [
                        (p, c) for p, c in filtered
                        if any(
                            getattr(assoc, "interest", None)
                            and getattr(assoc.interest, "name", "").lower() == val
                            for assoc in getattr(p, "interest_associations", [])
                        )
                    ]
                except Exception:
                    pass
        return MockSearchQuery(filtered)

    def all(self):
        return self.items


@pytest.fixture(autouse=True)
def override_database():
    mock_db = MockPlacesDB()

    def _get_db_override():
        yield mock_db

    app.dependency_overrides[get_db] = _get_db_override
    yield mock_db
    app.dependency_overrides.clear()


client = TestClient(app)


# ==============================================================================
# 1. Normalization, Intent Extraction & Alias Tests
# ==============================================================================

def test_text_normalization():
    assert normalize_text("  Puri Beach,   Odisha! ") == "puri beach odisha"
    assert normalize_text("AIIMS-Bhubaneswar") == "aiims bhubaneswar"
    assert normalize_text(None) == ""


def test_tokenize_removes_stop_words():
    tokens = tokenize("Best temples to visit in Puri and around Odisha")
    assert "puri" in tokens
    assert "temples" in tokens
    assert "in" not in tokens
    assert "to" not in tokens
    assert "and" not in tokens


def test_intent_extraction_for_destinations_and_districts():
    norm, dist, cat, interest, is_med, is_trans = extract_search_intent("temples near Puri")
    assert dist == "Puri"
    assert cat == "temple"
    assert is_med is None

    norm, dist, cat, interest, is_med, is_trans = extract_search_intent("wildlife sanctuary in Mayurbhanj")
    assert dist == "Mayurbhanj"
    assert cat == "wildlife"

    norm, dist, cat, interest, is_med, is_trans = extract_search_intent("hospital in Cuttack")
    assert dist == "Cuttack"
    assert is_med is True

    norm, dist, cat, interest, is_med, is_trans = extract_search_intent("airports near Bhubaneswar")
    assert dist == "Khordha" or "bhubaneswar" in norm
    assert is_trans is True


def test_verified_alias_expansion():
    bbi_targets = get_alias_expansions("BBI")
    assert any("Biju Patnaik International Airport" in t for t in bbi_targets)

    silver_city_targets = get_alias_expansions("Silver City")
    assert "Cuttack" in silver_city_targets

    kashmir_targets = get_alias_expansions("Kashmir of Odisha")
    assert "Daringbadi Hill Station" in kashmir_targets


# ==============================================================================
# 2. Ranking Algorithm & Deterministic Scoring Tests
# ==============================================================================

def test_deterministic_scoring_tiers():
    class DummyPlace:
        def __init__(self, name, desc="", district="", address=""):
            self.name = name
            self.description = desc
            self.district = district
            self.address = address
            self.interest_associations = []

    p_exact = DummyPlace("Puri Beach", "Golden coastal beach", "Puri")
    p_prefix = DummyPlace("Puri Beach Walkway", "Scenic promenade along coast", "Puri")
    p_desc = DummyPlace("Golden Sand Resort", "Located close to Puri beach", "Khordha")

    # Evaluate all candidates against the same query 'Puri Beach'
    query = "Puri Beach"
    score_exact, _ = calculate_place_score(p_exact, "beach", query)
    score_prefix, _ = calculate_place_score(p_prefix, "beach", query)
    score_desc, _ = calculate_place_score(p_desc, "beach", query)

    assert score_exact > score_prefix
    assert score_prefix > score_desc



# ==============================================================================
# 3. Search Service Domain Separation & Filtering Tests
# ==============================================================================

def test_search_places_exact_name(override_database):
    params = SearchQueryParams(search="Jagannath Temple, Puri")
    candidates, count = SearchService.search_places(override_database, params)
    assert count >= 1
    assert candidates[0].place.name == "Jagannath Temple, Puri"
    assert candidates[0].score >= 100.0


def test_search_places_case_insensitivity(override_database):
    for q in ["lingaraj temple", "LINGARAJ TEMPLE", "Lingaraj", "LiNgArAj"]:
        params = SearchQueryParams(search=q)
        candidates, count = SearchService.search_places(override_database, params)
        assert count >= 1
        assert "Lingaraj Temple" in [c.place.name for c in candidates]


def test_search_places_by_district_all_30_districts(override_database):
    """Verify searching/filtering by every single Odisha district returns valid records."""
    for dist in ODISHA_DISTRICTS:
        params = SearchQueryParams(district=dist, limit=50)
        candidates, count = SearchService.search_places(override_database, params)
        assert count >= 1, f"Expected at least 1 record in district {dist}"
        for c in candidates:
            assert c.place.district == dist


def test_search_medical_facilities_separation(override_database):
    """Verify medical facilities are excluded from leisure queries and returned on explicit medical query."""
    # 1. General search in Cuttack should NOT return SCB Medical College at top
    params_leisure = SearchQueryParams(search="Cuttack")
    candidates_leisure, _ = SearchService.search_places(override_database, params_leisure)
    names_leisure = [c.place.name for c in candidates_leisure]
    assert "SCB Medical College & Hospital, Cuttack" not in names_leisure

    # 2. Explicit medical search in Cuttack MUST return SCB Medical College
    params_med = SearchQueryParams(search="hospital", district="Cuttack", is_medical=True)
    candidates_med, count_med = SearchService.search_places(override_database, params_med)
    assert count_med >= 1
    assert any("SCB Medical" in c.place.name for c in candidates_med)


def test_search_transit_hubs_separation(override_database):
    """Verify transit hubs are excluded from leisure queries and returned on explicit transit query."""
    # 1. General search in Bhubaneswar should NOT return Railway Station by default
    params_leisure = SearchQueryParams(category="temple", district="Khordha")
    candidates_leisure, _ = SearchService.search_places(override_database, params_leisure)
    for c in candidates_leisure:
        assert c.category_name != "transit_hub"

    # 2. Explicit transit search in Khordha MUST return Airport and Railway Station
    params_trans = SearchQueryParams(district="Khordha", is_transit=True)
    candidates_trans, count_trans = SearchService.search_places(override_database, params_trans)
    assert count_trans >= 2
    transit_names = [c.place.name for c in candidates_trans]
    assert any("Airport" in n for n in transit_names)
    assert any("Railway Station" in n for n in transit_names)


def test_search_alias_expansion(override_database):
    """Verify verified airport acronyms and city aliases resolve correctly."""
    # 'BBI' -> Biju Patnaik International Airport
    params_bbi = SearchQueryParams(search="BBI")
    candidates_bbi, count_bbi = SearchService.search_places(override_database, params_bbi)
    assert count_bbi >= 1
    assert any("Biju Patnaik International Airport" in c.place.name for c in candidates_bbi)

    # 'BBS' -> Bhubaneswar Railway Station
    params_bbs = SearchQueryParams(search="BBS")
    candidates_bbs, count_bbs = SearchService.search_places(override_database, params_bbs)
    assert count_bbs >= 1
    assert any("Bhubaneswar Railway Station" in c.place.name for c in candidates_bbs)


def test_search_pagination(override_database):
    """Verify offset and limit pagination behaves deterministically."""
    params_all = SearchQueryParams(limit=100, offset=0)
    candidates_all, total_count = SearchService.search_places(override_database, params_all)
    assert total_count >= 50

    params_page1 = SearchQueryParams(limit=5, offset=0)
    candidates_page1, total_1 = SearchService.search_places(override_database, params_page1)
    assert len(candidates_page1) == 5
    assert total_1 == total_count

    params_page2 = SearchQueryParams(limit=5, offset=5)
    candidates_page2, total_2 = SearchService.search_places(override_database, params_page2)
    assert len(candidates_page2) == 5
    assert total_2 == total_count

    # Page 1 and Page 2 must have distinct items
    p1_ids = {c.place.id for c in candidates_page1}
    p2_ids = {c.place.id for c in candidates_page2}
    assert p1_ids.isdisjoint(p2_ids)


def test_search_location_proximity(override_database):
    """Verify location-aware search calculates distance and boosts closer places."""
    # Reference coordinates: Bhubaneswar (20.2961, 85.8245)
    bbsr_lat, bbsr_lon = 20.2961, 85.8245
    params = SearchQueryParams(
        near_lat=bbsr_lat,
        near_lon=bbsr_lon,
        radius_km=30.0,
        limit=10,
    )
    candidates, count = SearchService.search_places(override_database, params)
    assert count >= 1
    for c in candidates:
        assert c.distance_km is not None
        assert c.distance_km <= 30.0


# ==============================================================================
# 4. AI Knowledge Retrieval Interface Tests
# ==============================================================================

def test_ai_retrieval_compact_record_structure(override_database):
    records = SearchService.retrieve_places(override_database, query="Konark Sun Temple", limit=1)
    assert len(records) == 1
    rec = records[0]
    assert isinstance(rec, CompactKnowledgeRecord)
    assert "Konark Sun Temple" in rec.name
    assert rec.district == "Puri"
    assert rec.region == "Konark & Marine"
    assert rec.lat is not None
    assert rec.lon is not None
    assert rec.is_medical is False
    assert rec.is_transit is False


def test_ai_retrieve_by_district(override_database):
    records = SearchService.retrieve_by_district(override_database, district="Koraput", limit=10)
    assert len(records) >= 1
    for r in records:
        assert r.district == "Koraput"


def test_ai_retrieve_medical_and_transit(override_database):
    med_records = SearchService.retrieve_medical(override_database, district="Khordha", limit=5)
    assert len(med_records) >= 1
    assert any("AIIMS" in r.name or "Capital Hospital" in r.name for r in med_records)
    for r in med_records:
        assert r.is_medical is True

    transit_records = SearchService.retrieve_transit(override_database, district="Sambalpur", limit=5)
    assert len(transit_records) >= 1
    assert any("Sambalpur Junction" in r.name for r in transit_records)
    for r in transit_records:
        assert r.is_transit is True


# ==============================================================================
# 5. HTTP Endpoint Integration & Header Tests
# ==============================================================================

def test_http_places_search_headers():
    response = client.get("/places?search=Puri&limit=5&offset=0")
    assert response.status_code == 200
    assert "x-total-count" in response.headers
    assert "x-limit" in response.headers
    assert "x-offset" in response.headers
    assert int(response.headers["x-limit"]) == 5
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5


# ==============================================================================
# 6. Multilingual Filter Query Parameter Integration Tests
# ==============================================================================

def test_http_places_filter_odia_district():
    """GET /places?district=ପୁରୀ must resolve to Puri and return matching places."""
    response = client.get("/places?district=ପୁରୀ&limit=50")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(p["district"] == "Puri" for p in data)


def test_http_places_filter_hindi_district():
    """GET /places?district=पुरी must resolve to Puri and return matching places."""
    response = client.get("/places?district=पुरी&limit=50")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(p["district"] == "Puri" for p in data)


def test_http_places_filter_odia_category():
    """GET /places?category=ମନ୍ଦିର must resolve to temple and return matching places."""
    response = client.get("/places?category=ମନ୍ଦିର&limit=50")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(p["category"] == "temple" for p in data)


def test_http_places_filter_hindi_category():
    """GET /places?category=मंदिर must resolve to temple and return matching places."""
    response = client.get("/places?category=मंदिर&limit=50")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(p["category"] == "temple" for p in data)


def test_http_places_filter_odia_interest():
    """GET /places?interest=ଐତିହ୍ୟ must resolve to heritage and return matching places."""
    response = client.get("/places?interest=ଐତିହ୍ୟ&limit=50")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_http_places_filter_hindi_interest():
    """GET /places?interest=विरासत must resolve to heritage and return matching places."""
    response = client.get("/places?interest=विरासत&limit=50")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_http_places_filter_english_backward_compatibility():
    """English canonical filters must continue working exactly as before."""
    resp_dist = client.get("/places?district=Puri&limit=50")
    assert resp_dist.status_code == 200
    assert len(resp_dist.json()) >= 1
    assert all(p["district"] == "Puri" for p in resp_dist.json())

    resp_cat = client.get("/places?category=temple&limit=50")
    assert resp_cat.status_code == 200
    assert len(resp_cat.json()) >= 1
    assert all(p["category"] == "temple" for p in resp_cat.json())


def test_http_places_filter_unknown_localized_returns_empty():
    """Unknown/unverified localized filters safely return empty results with 200 status."""
    resp_dist = client.get("/places?district=ଅଜ୍ଞାତଜିଲ୍ଲା&limit=50")
    assert resp_dist.status_code == 200
    assert len(resp_dist.json()) == 0

    resp_cat = client.get("/places?category=अज्ञातश्रेणी&limit=50")
    assert resp_cat.status_code == 200
    assert len(resp_cat.json()) == 0

