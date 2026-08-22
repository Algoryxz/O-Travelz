"""Focused unit tests for SearchRanker with Multilingual Inputs (Phase 12 Step 2C)."""
from __future__ import annotations

import pytest

from app.services.search.search_models import ScoredPlaceCandidate
from app.services.search.search_normalizer import get_alias_expansions
from app.services.search.search_ranker import calculate_place_score, rank_candidates


class DummyInterest:
    def __init__(self, name: str):
        self.name = name


class DummyAssociation:
    def __init__(self, interest_name: str):
        self.interest = DummyInterest(interest_name)


class DummyPlace:
    def __init__(
        self,
        name: str,
        category: str = "temple",
        district: str = "Puri",
        description: str = "",
        address: str = "",
        interests: list[str] | None = None,
    ):
        self.name = name
        self.category = category
        self.district = district
        self.description = description
        self.address = address
        self.interest_associations = [DummyAssociation(i) for i in (interests or [])]


# ==============================================================================
# 1. English Score Preservation & Tier Verification
# ==============================================================================

def test_english_ranking_scores_preserved():
    """Verify that exact score values for canonical English cases remain 100% identical."""
    p_exact = DummyPlace("Jagannath Temple, Puri", "temple", "Puri", "", "Grand Road, Puri", ["spirituality", "heritage"])
    p_prefix = DummyPlace("Jagannath Temple Kitchen", "temple", "Puri", "", "Puri", ["spirituality"])
    p_token = DummyPlace("Gundicha Temple", "temple", "Puri", "", "Puri", ["spirituality"])

    # 1. Exact Name Match (Tier 1: 100.0)
    score_exact, reasons_exact = calculate_place_score(p_exact, "temple", "Jagannath Temple, Puri")
    assert score_exact == 100.0
    assert "exact_name_match" in reasons_exact

    # 2. Prefix Match (Tier 3: 70.0)
    score_prefix, reasons_prefix = calculate_place_score(p_prefix, "temple", "Jagannath Temple")
    assert score_prefix == 70.0
    assert "name_prefix_match" in reasons_prefix

    # 3. Token Match in Name (Tier 4: 50.0 * 1/2 = 25.0)
    score_token, reasons_token = calculate_place_score(p_token, "temple", "Gundicha Kitchen")
    assert score_token == 25.0
    assert any("name_token_match" in r for r in reasons_token)

    # 4. Filter Bonuses (+20 each for district, category, interest)
    score_filters, reasons_filters = calculate_place_score(
        p_exact,
        "temple",
        query_text=None,
        filter_district="Puri",
        filter_category="temple",
        filter_interest="heritage",
    )
    # 10.0 baseline + 20.0 + 20.0 + 20.0 = 70.0
    assert score_filters == 70.0
    assert "exact_filter_district" in reasons_filters
    assert "exact_filter_category" in reasons_filters
    assert "exact_filter_interest" in reasons_filters


# ==============================================================================
# 2. Multilingual Alias Scoring
# ==============================================================================

def test_odia_alias_scores_tier2():
    """Verify Odia alias 'ରୂପା ସହର' expands to Cuttack/Barabati Fort and scores Tier 2 (+85.0)."""
    p_barabati = DummyPlace("Barabati Fort", "monument", "Cuttack", "Historic fort", "Cuttack", ["heritage"])
    alias_targets = get_alias_expansions("ରୂପା ସହର")
    assert "Barabati Fort" in alias_targets

    score, reasons = calculate_place_score(
        place=p_barabati,
        category_name="monument",
        query_text="ରୂପା ସହର",
        alias_targets=alias_targets,
    )
    assert score == 85.0
    assert "verified_alias_match" in reasons


def test_hindi_alias_scores_tier2():
    """Verify Hindi alias 'चांदी का शहर' expands to Cuttack/Barabati Fort and scores Tier 2 (+85.0)."""
    p_barabati = DummyPlace("Barabati Fort", "monument", "Cuttack", "Historic fort", "Cuttack", ["heritage"])
    alias_targets = get_alias_expansions("चांदी का शहर")
    assert "Barabati Fort" in alias_targets

    score, reasons = calculate_place_score(
        place=p_barabati,
        category_name="monument",
        query_text="चांदी का शहर",
        alias_targets=alias_targets,
    )
    assert score == 85.0
    assert "verified_alias_match" in reasons


def test_odia_jagannath_dham_alias():
    """Verify Odia alias 'ଜଗନ୍ନାଥ ଧାମ' expands to Jagannath Temple, Puri and scores Tier 2 (+85.0)."""
    p_jagannath = DummyPlace("Jagannath Temple, Puri", "temple", "Puri", "Grand temple", "Puri", ["spirituality"])
    alias_targets = get_alias_expansions("ଜଗନ୍ନାଥ ଧାମ")
    assert any("Jagannath Temple" in t for t in alias_targets)

    score, reasons = calculate_place_score(
        place=p_jagannath,
        category_name="temple",
        query_text="ଜଗନ୍ନାଥ ଧାମ",
        alias_targets=alias_targets,
    )
    assert score == 85.0
    assert "verified_alias_match" in reasons


# ==============================================================================
# 3. Canonical Filter Scoring from Resolved Odia/Hindi Intent
# ==============================================================================

def test_resolved_multilingual_filters_contribute_canonical_bonuses():
    """Verify resolved canonical district/category/interest from Odia/Hindi contribute exact filter bonuses."""
    p = DummyPlace("Konark Sun Temple", "monument", "Puri", "13th century UNESCO site", "Konark, Puri", ["heritage", "architecture"])

    # Simulating SearchService resolving Odia params: district='ପୁରୀ' -> 'Puri', category='ସ୍ମାରକୀ' -> 'monument'
    score, reasons = calculate_place_score(
        place=p,
        category_name="monument",
        query_text=None,
        filter_district="Puri",  # resolved from 'ପୁରୀ'
        filter_category="monument",  # resolved from 'ସ୍ମାରକୀ'
        filter_interest="heritage",  # resolved from 'ଐତିହ୍ୟ'
    )
    assert score == 70.0  # 10 baseline + 20 + 20 + 20
    assert "exact_filter_district" in reasons
    assert "exact_filter_category" in reasons
    assert "exact_filter_interest" in reasons


# ==============================================================================
# 4. Unknown Multilingual Query Invariant
# ==============================================================================

def test_unknown_multilingual_query_scores_zero():
    """Unknown Odia/Hindi query without matching alias or filter must score 0.0."""
    p = DummyPlace("Lingaraj Temple", "temple", "Khordha", "11th century temple", "Bhubaneswar", ["spirituality"])

    score_odia, reasons_odia = calculate_place_score(
        place=p,
        category_name="temple",
        query_text="କୌଣସି ଅଜ୍ଞାତ ଶବ୍ଦ",
        alias_targets=[],
    )
    assert score_odia == 0.0
    assert len(reasons_odia) == 0

    score_hi, reasons_hi = calculate_place_score(
        place=p,
        category_name="temple",
        query_text="कोई अज्ञात शब्द",
        alias_targets=[],
    )
    assert score_hi == 0.0
    assert len(reasons_hi) == 0


# ==============================================================================
# 5. Deterministic Tie-Breaking
# ==============================================================================

def test_deterministic_candidate_ranking_order():
    """Verify ranking sorts by (-score, distance_km, name) deterministically."""
    p1 = DummyPlace("Alpha Temple")
    p2 = DummyPlace("Beta Temple")
    p3 = DummyPlace("Gamma Temple")

    # Candidates with different scores
    c1 = ScoredPlaceCandidate(place=p1, score=50.0, match_reasons=["token"], category_name="temple", distance_km=5.0)
    c2 = ScoredPlaceCandidate(place=p2, score=85.0, match_reasons=["alias"], category_name="temple", distance_km=10.0)
    c3 = ScoredPlaceCandidate(place=p3, score=85.0, match_reasons=["alias"], category_name="temple", distance_km=2.0)

    ranked = rank_candidates([c1, c2, c3])
    # c3 has score 85.0, distance 2.0 -> 1st
    # c2 has score 85.0, distance 10.0 -> 2nd
    # c1 has score 50.0, distance 5.0 -> 3rd
    assert [c.place.name for c in ranked] == ["Gamma Temple", "Beta Temple", "Alpha Temple"]

    # Tie-breaker on identical score and distance: alphabetical name
    c_alpha = ScoredPlaceCandidate(place=p1, score=70.0, match_reasons=["prefix"], category_name="temple", distance_km=5.0)
    c_beta = ScoredPlaceCandidate(place=p2, score=70.0, match_reasons=["prefix"], category_name="temple", distance_km=5.0)
    ranked_ties = rank_candidates([c_beta, c_alpha])
    assert [c.place.name for c in ranked_ties] == ["Alpha Temple", "Beta Temple"]
