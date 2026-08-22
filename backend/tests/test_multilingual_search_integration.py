"""End-to-End Multilingual Search Integration QA Suite (Phase 12 Step 2D).

Verifies the complete end-to-end pipeline:
  User Query
  → SearchNormalizer (Unicode-safe normalization, multilingual stop-words)
  → Multilingual Intent Resolution (Odia, Hindi, English, aliases)
  → SearchService (Canonical resolution, database filtering, domain separation)
  → SearchRanker (Deterministic 8-tier relevance scoring & tie-breaking)
  → /places HTTP API response & headers
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import List
from urllib.parse import quote
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app
from app.models.category import Category
from app.models.place import Place
from app.models.interest import Interest, PlaceInterest
from app.services.search import (
    CompactKnowledgeRecord,
    SearchQueryParams,
    SearchService,
)


class MockPoint:
    def __init__(self, lat: float, lon: float):
        self.y = lat
        self.x = lon


class MockPlacesDB:
    """In-memory mock database seeded from canonical data/places JSON files."""

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
# 1. Odia & Hindi District Search
# ==============================================================================

def test_odia_district_search():
    """Case 1: Odia query 'ପୁରୀ' returns verified Puri attractions."""
    response = client.get("/places?search=ପୁରୀ")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("Jagannath Temple" in p["name"] for p in data)
    assert all(p["district"] == "Puri" for p in data)


def test_hindi_district_search():
    """Case 2: Hindi query 'पुरी' returns verified Puri attractions."""
    response = client.get("/places?search=पुरी")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("Jagannath Temple" in p["name"] for p in data)
    assert all(p["district"] == "Puri" for p in data)


# ==============================================================================
# 2. Odia & Hindi Category Search
# ==============================================================================

def test_odia_category_search():
    """Case 3: Odia query 'ମନ୍ଦିର' returns temples across Odisha."""
    response = client.get("/places?search=ମନ୍ଦିର&limit=20")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(p["category"] == "temple" for p in data)
    assert any("Lingaraj" in p["name"] or "Jagannath" in p["name"] for p in data)


def test_hindi_category_search():
    """Case 4: Hindi query 'मंदिर' returns temples across Odisha."""
    response = client.get("/places?search=मंदिर&limit=20")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(p["category"] == "temple" for p in data)
    assert any("Lingaraj" in p["name"] or "Jagannath" in p["name"] for p in data)


# ==============================================================================
# 3. Mixed-Language Queries
# ==============================================================================

def test_mixed_language_english_odia_temples_in_puri():
    """Case 5: 'Temples in ପୁରୀ' ranks Puri temples at top with highest relevance score."""
    response = client.get("/places?search=Temples in ପୁରୀ")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    # Top ranked places match both extracted category (temple) and extracted district (Puri)
    assert data[0]["category"] == "temple"
    assert data[0]["district"] == "Puri"
    assert any("Jagannath Temple" in p["name"] for p in data[:3])

    # Hard-filtered query returns exclusively temples in Puri
    resp_filtered = client.get("/places?category=temple&district=ପୁରୀ")
    assert resp_filtered.status_code == 200
    data_filtered = resp_filtered.json()
    assert len(data_filtered) >= 1
    assert all(p["district"] == "Puri" and p["category"] == "temple" for p in data_filtered)


def test_mixed_language_english_hindi_waterfalls_in_mayurbhanj():
    """Case 6: 'Waterfalls in मयूरभंज' ranks Mayurbhanj waterfalls at top with highest relevance score."""
    response = client.get("/places?search=Waterfalls in मयूरभंज")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    # Top ranked places match both extracted category (waterfall) and extracted district (Mayurbhanj)
    assert data[0]["category"] == "waterfall"
    assert data[0]["district"] == "Mayurbhanj"
    assert any("Barehipani" in p["name"] or "Joranda" in p["name"] for p in data)

    # Hard-filtered query returns exclusively waterfalls in Mayurbhanj
    resp_filtered = client.get("/places?category=waterfall&district=मयूरभंज")
    assert resp_filtered.status_code == 200
    data_filtered = resp_filtered.json()
    assert len(data_filtered) >= 1
    assert all(p["district"] == "Mayurbhanj" and p["category"] == "waterfall" for p in data_filtered)


# ==============================================================================
# 4. Odia & Hindi Cultural Aliases
# ==============================================================================

def test_odia_cultural_alias_silver_city():
    """Case 7: Odia alias 'ରୂପା ସହର' expands to Cuttack / Barabati Fort and ranks top."""
    response = client.get("/places?search=ରୂପା ସହର")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    top_place = data[0]
    assert top_place["district"] == "Cuttack"
    assert any("Barabati Fort" in p["name"] for p in data)


def test_hindi_cultural_alias_silver_city():
    """Case 8: Hindi alias 'चांदी का शहर' expands to Cuttack / Barabati Fort and ranks top."""
    response = client.get("/places?search=चांदी का शहर")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    top_place = data[0]
    assert top_place["district"] == "Cuttack"
    assert any("Barabati Fort" in p["name"] for p in data)


# ==============================================================================
# 5. Odia & Hindi Medical Domain Intent
# ==============================================================================

def test_odia_medical_search():
    """Case 9: Odia medical query 'କଟକ ଡାକ୍ତରଖାନା' retrieves and ranks SCB Medical College at top."""
    response = client.get("/places?search=କଟକ ଡାକ୍ତରଖାନା")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("SCB Medical" in p["name"] for p in data)
    # Medical facility ranks above other district entities
    med_candidates = [p for p in data if p["category"] in ("hospital", "emergency_facility")]
    assert len(med_candidates) >= 1
    assert "SCB Medical" in med_candidates[0]["name"]

    # Explicit filtered medical query returns exclusively medical facilities
    resp_med = client.get("/places?is_medical=true&district=କଟକ")
    assert resp_med.status_code == 200
    data_med = resp_med.json()
    assert len(data_med) >= 1
    assert all(p["category"] in ("hospital", "emergency_facility") for p in data_med)


def test_hindi_medical_search():
    """Case 10: Hindi medical query 'कटक अस्पताल' retrieves and ranks SCB Medical College at top."""
    response = client.get("/places?search=कटक अस्पताल")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("SCB Medical" in p["name"] for p in data)
    med_candidates = [p for p in data if p["category"] in ("hospital", "emergency_facility")]
    assert len(med_candidates) >= 1
    assert "SCB Medical" in med_candidates[0]["name"]

    # Explicit filtered medical query returns exclusively medical facilities
    resp_med = client.get("/places?is_medical=true&district=कटक")
    assert resp_med.status_code == 200
    data_med = resp_med.json()
    assert len(data_med) >= 1
    assert all(p["category"] in ("hospital", "emergency_facility") for p in data_med)


# ==============================================================================
# 6. Odia & Hindi Transit Domain Intent
# ==============================================================================

def test_odia_transit_search():
    """Case 11: Odia transit query 'ପୁରୀ ରେଳ ଷ୍ଟେସନ' retrieves and ranks Puri Railway Station."""
    response = client.get("/places?search=ପୁରୀ ରେଳ ଷ୍ଟେସନ")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("Railway Station" in p["name"] for p in data)
    transit_candidates = [p for p in data if p["category"] == "transit_hub"]
    assert len(transit_candidates) >= 1
    assert "Railway Station" in transit_candidates[0]["name"]

    # Explicit filtered transit query returns exclusively transit hubs
    resp_trans = client.get("/places?is_transit=true&district=ପୁରୀ")
    assert resp_trans.status_code == 200
    data_trans = resp_trans.json()
    assert len(data_trans) >= 1
    assert all(p["category"] == "transit_hub" for p in data_trans)


def test_hindi_transit_search():
    """Case 12: Hindi transit query 'पुरी रेलवे स्टेशन' retrieves and ranks Puri Railway Station."""
    response = client.get("/places?search=पुरी रेलवे स्टेशन")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("Railway Station" in p["name"] for p in data)
    transit_candidates = [p for p in data if p["category"] == "transit_hub"]
    assert len(transit_candidates) >= 1
    assert "Railway Station" in transit_candidates[0]["name"]

    # Explicit filtered transit query returns exclusively transit hubs
    resp_trans = client.get("/places?is_transit=true&district=पुरी")
    assert resp_trans.status_code == 200
    data_trans = resp_trans.json()
    assert len(data_trans) >= 1
    assert all(p["category"] == "transit_hub" for p in data_trans)


# ==============================================================================
# 7. Unknown Multilingual Query Safe Zero-Match (Zero Fabrication)
# ==============================================================================

def test_unknown_odia_input_safe_zero_match():
    """Case 13: Unknown Odia input produces 0 matching results (no hallucination)."""
    response = client.get("/places?search=କୌଣସି ଅଜ୍ଞାତ ଶବ୍ଦ")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


def test_unknown_hindi_input_safe_zero_match():
    """Case 14: Unknown Hindi input produces 0 matching results (no hallucination)."""
    response = client.get("/places?search=कोई अज्ञात शब्द")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


# ==============================================================================
# 8. English Search Backward Compatibility & Regression Safety
# ==============================================================================

def test_english_search_regression_safety():
    """Case 15: Canonical English queries retain exact matching places and ranking."""
    # Exact place name
    resp_exact = client.get("/places?search=Lingaraj Temple")
    assert resp_exact.status_code == 200
    assert resp_exact.json()[0]["name"] == "Lingaraj Temple"

    # Acronym expansion
    resp_bbi = client.get("/places?search=BBI")
    assert resp_bbi.status_code == 200
    assert any("Biju Patnaik International Airport" in p["name"] for p in resp_bbi.json())

    # English cultural alias
    resp_silver = client.get("/places?search=Silver City")
    assert resp_silver.status_code == 200
    assert any("Barabati Fort" in p["name"] for p in resp_silver.json())


# ==============================================================================
# 9. Leisure Domain Isolation Invariant
# ==============================================================================

def test_leisure_domain_isolation_odia_and_hindi():
    """Case 16: General leisure queries in Odia and Hindi strictly exclude hospitals and transit."""
    # Odia general query for Cuttack
    resp_or = client.get("/places?search=କଟକ")
    assert resp_or.status_code == 200
    for p in resp_or.json():
        assert p["category"] not in ("hospital", "emergency_facility", "transit_hub")
        assert "SCB Medical" not in p["name"]

    # Hindi general query for Cuttack
    resp_hi = client.get("/places?search=कटक")
    assert resp_hi.status_code == 200
    for p in resp_hi.json():
        assert p["category"] not in ("hospital", "emergency_facility", "transit_hub")
        assert "SCB Medical" not in p["name"]


# ==============================================================================
# 10. Explicit Medical & Transit Knowledge Retrieval Facade
# ==============================================================================

def test_explicit_medical_and_transit_retrieval(override_database):
    """Case 17: AI retrieval facade retrieves appropriate medical and transit records."""
    med_khordha = SearchService.retrieve_medical(override_database, district="Khordha", limit=5)
    assert len(med_khordha) >= 1
    assert any("AIIMS" in r.name or "Capital Hospital" in r.name for r in med_khordha)
    assert all(r.is_medical is True for r in med_khordha)

    trans_puri = SearchService.retrieve_transit(override_database, district="Puri", limit=5)
    assert len(trans_puri) >= 1
    assert any("Puri Railway Station" in r.name for r in trans_puri)
    assert all(r.is_transit is True for r in trans_puri)


# ==============================================================================
# 11. URL-Encoded HTTP Query Parameters
# ==============================================================================

def test_url_encoded_http_query_parameters():
    """Case 18: Percent-encoded Odia & Hindi query parameters decode and filter accurately."""
    # URL-encoded Odia district: 'ପୁରୀ' -> %E0%AC%AA%E0%AC%A3%E0%AC%BF
    encoded_odia_dist = quote("ପୁରୀ")
    resp_odia = client.get(f"/places?district={encoded_odia_dist}&limit=50")
    assert resp_odia.status_code == 200
    assert len(resp_odia.json()) >= 1
    assert all(p["district"] == "Puri" for p in resp_odia.json())

    # URL-encoded Hindi category: 'मंदिर' -> %E0%A4%AE%E0%A4%82%E0%A4%A6%E0%A4%BF%E0%A4%B0
    encoded_hi_cat = quote("मंदिर")
    resp_hi = client.get(f"/places?category={encoded_hi_cat}&limit=50")
    assert resp_hi.status_code == 200
    assert len(resp_hi.json()) >= 1
    assert all(p["category"] == "temple" for p in resp_hi.json())


# ==============================================================================
# 12. Deterministic Search Ordering
# ==============================================================================

def test_multilingual_search_determinism():
    """Case 19: Repeated identical multilingual searches produce identical candidate ordering."""
    query = "Temples in ପୁରୀ"
    resp1 = client.get(f"/places?search={query}&limit=20")
    resp2 = client.get(f"/places?search={query}&limit=20")
    assert resp1.status_code == 200
    assert resp2.status_code == 200

    ids1 = [p["id"] for p in resp1.json()]
    ids2 = [p["id"] for p in resp2.json()]
    assert ids1 == ids2


# ==============================================================================
# 13. Pagination & Total Count Header Invariant
# ==============================================================================

def test_multilingual_search_pagination_and_headers():
    """Case 20: Multilingual queries preserve pagination slices and x-total-count header."""
    resp_all = client.get("/places?search=ମନ୍ଦିର&limit=100&offset=0")
    assert resp_all.status_code == 200
    total_count = int(resp_all.headers["x-total-count"])
    assert total_count >= 5

    # Page 1
    resp_p1 = client.get("/places?search=ମନ୍ଦିର&limit=3&offset=0")
    assert resp_p1.status_code == 200
    assert int(resp_p1.headers["x-total-count"]) == total_count
    assert int(resp_p1.headers["x-limit"]) == 3
    assert int(resp_p1.headers["x-offset"]) == 0
    p1_data = resp_p1.json()
    assert len(p1_data) == 3

    # Page 2
    resp_p2 = client.get("/places?search=ମନ୍ଦିର&limit=3&offset=3")
    assert resp_p2.status_code == 200
    assert int(resp_p2.headers["x-total-count"]) == total_count
    assert int(resp_p2.headers["x-offset"]) == 3
    p2_data = resp_p2.json()
    assert len(p2_data) == 3

    # Disjoint pages
    p1_ids = {p["id"] for p in p1_data}
    p2_ids = {p["id"] for p in p2_data}
    assert p1_ids.isdisjoint(p2_ids)
