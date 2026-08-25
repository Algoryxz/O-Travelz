"""Deterministic scoring algorithm and candidate ranker for Search & Retrieval."""
from __future__ import annotations

from typing import Any, List, Optional, Set, Tuple
from app.services.search.search_models import ScoredPlaceCandidate
from app.services.search.search_normalizer import (
    get_alias_expansions,
    normalize_text,
    tokenize,
)


def calculate_place_score(
    place: Any,
    category_name: str,
    query_text: Optional[str],
    filter_district: Optional[str] = None,
    filter_category: Optional[str] = None,
    filter_interest: Optional[str] = None,
    alias_targets: Optional[List[str]] = None,
) -> Tuple[float, List[str]]:
    """
    Compute deterministic relevance score for a place against query and active filters.
    Returns (score, match_reasons).
    """
    score = 0.0
    match_reasons: List[str] = []

    place_name_raw = getattr(place, "name", "")
    place_name_norm = normalize_text(place_name_raw)
    place_desc_norm = normalize_text(getattr(place, "description", ""))
    place_district_norm = normalize_text(getattr(place, "district", ""))
    place_address_norm = normalize_text(getattr(place, "address", ""))
    category_norm = normalize_text(category_name)
    
    # Extract place interests
    place_interests_norm: Set[str] = set()
    for assoc in getattr(place, "interest_associations", []):
        interest_obj = getattr(assoc, "interest", None)
        if interest_obj and getattr(interest_obj, "name", None):
            place_interests_norm.add(normalize_text(interest_obj.name))

    query_norm = normalize_text(query_text) if query_text else ""
    query_tokens = tokenize(query_text) if query_text else []

    # 1. Base filter bonuses
    if filter_district and normalize_text(filter_district) == place_district_norm:
        score += 20.0
        match_reasons.append("exact_filter_district")

    if filter_category and normalize_text(filter_category) == category_norm:
        score += 20.0
        match_reasons.append("exact_filter_category")

    if filter_interest and normalize_text(filter_interest) in place_interests_norm:
        score += 20.0
        match_reasons.append("exact_filter_interest")

    # If no free-text query was provided, baseline score with filter bonuses is returned
    if not query_norm:
        return score + 10.0, match_reasons

    # 2. Tier 1: Exact Name Match
    if place_name_norm == query_norm:
        score += 100.0
        match_reasons.append("exact_name_match")

    # 3. Tier 2: Alias / Alternate Name Match
    elif alias_targets and any(
        normalize_text(target) in place_name_norm or place_name_norm in normalize_text(target)
        for target in alias_targets
    ):
        score += 85.0
        match_reasons.append("verified_alias_match")

    # 4. Tier 3: Name Prefix Match
    elif place_name_norm.startswith(query_norm):
        score += 70.0
        match_reasons.append("name_prefix_match")

    # 5. Tier 4: Token Match in Name
    elif query_tokens:
        place_tokens = set(place_name_norm.split())
        matched_tokens = [t for t in query_tokens if t in place_tokens or any(p.startswith(t) for p in place_tokens)]
        if matched_tokens:
            token_fraction = len(matched_tokens) / len(query_tokens)
            score += 50.0 * token_fraction
            match_reasons.append(f"name_token_match({len(matched_tokens)}/{len(query_tokens)})")

    # 6. Tier 5: Category / Thematic Interest / District Substring Match
    if query_norm and (query_norm == category_norm or query_norm in category_norm):
        score += 35.0
        match_reasons.append("category_match")
    elif any(query_norm == interest or query_norm in interest for interest in place_interests_norm):
        score += 35.0
        match_reasons.append("interest_match")
    elif query_norm and (query_norm == place_district_norm or query_norm in place_district_norm):
        score += 35.0
        match_reasons.append("district_match")

    # 7. Tier 6: Description Substring Match
    if query_norm and query_norm in place_desc_norm:
        score += 15.0
        match_reasons.append("description_match")
    elif query_tokens:
        matched_desc_tokens = [t for t in query_tokens if t in place_desc_norm]
        if matched_desc_tokens:
            score += 10.0 * (len(matched_desc_tokens) / len(query_tokens))
            match_reasons.append(f"description_token_match({len(matched_desc_tokens)})")

    # 8. Tier 7: Address / Location String Match
    if query_norm and query_norm in place_address_norm:
        score += 10.0
        match_reasons.append("address_match")

    return score, match_reasons


def rank_candidates(
    candidates: List[ScoredPlaceCandidate],
    is_proximity_search: bool = False,
) -> List[ScoredPlaceCandidate]:
    """
    Sort candidates deterministically:
    If is_proximity_search is True (or distance is computed and no keyword text query):
      1. Distance ascending (nearest first)
      2. Quality / relevance score descending
      3. Place name ascending (tie-breaker)
    Otherwise (keyword / thematic search):
      1. Score descending
      2. Proximity distance ascending (if distance is present)
      3. Alphabetical place name ascending (tie-breaker)
    """
    def sort_key(candidate: ScoredPlaceCandidate):
        dist = candidate.distance_km if candidate.distance_km is not None else float("inf")
        name = getattr(candidate.place, "name", "")
        if is_proximity_search:
            return (0 if candidate.distance_km is not None else 1, dist, -candidate.score, name)
        return (-candidate.score, dist, name)

    return sorted(candidates, key=sort_key)
