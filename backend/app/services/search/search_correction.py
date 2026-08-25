"""Search Correction and Typo Suggestion Service.

Generates deterministic spelling corrections and search suggestions from authoritative
canonical place records, districts, and multilingual aliases without fabricating destinations.
"""
from __future__ import annotations

import unicodedata
from difflib import SequenceMatcher
from typing import Any, List, Optional, Sequence, Set, Tuple
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.regions import ODISHA_DISTRICTS
from app.data.multilingual_taxonomy import (
    CATEGORY_TAXONOMY,
    DISTRICT_TAXONOMY,
    INTEREST_TAXONOMY,
    MULTILINGUAL_ALIASES,
)
from app.models.place import Place
from app.services.ranking.repository import NON_LEISURE_CATEGORIES
from app.services.search.search_normalizer import normalize_text


class SearchSuggestion(BaseModel):
    """Canonical search suggestion / typo correction candidate."""
    text: str
    canonical_name: str
    match_type: str  # "exact", "alias", "typo_correction", "prefix", "district"
    confidence: float


def _levenshtein_similarity(s1: str, s2: str) -> float:
    """Compute normalized sequence similarity ratio between 0.0 and 1.0."""
    return SequenceMatcher(None, s1.lower(), s2.lower()).ratio()


class SearchCorrectionService:
    """Authoritative candidate correction engine."""

    # Static catalog of canonical entities for fast sub-millisecond lookup
    _CANONICAL_TARGETS: List[Tuple[str, str, str]] = []  # (normalized_key, display_name, target_type)

    @classmethod
    def _initialize_targets(cls, db: Optional[Session] = None) -> List[Tuple[str, str, str]]:
        targets: List[Tuple[str, str, str]] = []

        # 1. Add all 30 districts
        for d in ODISHA_DISTRICTS:
            norm_d = normalize_text(d)
            targets.append((norm_d, d, "district"))

        # 2. Add major Odisha city hubs & prominent destinations
        major_hubs = [
            "Puri", "Bhubaneswar", "Konark", "Cuttack", "Sambalpur", "Rourkela",
            "Berhampur", "Balasore", "Baripada", "Koraput", "Daringbadi",
            "Gopalpur", "Paradip", "Chandipur", "Keonjhar", "Jeypore", "Angul",
            "Jharsuguda", "Bhadrak", "Bargarh", "Rayagada", "Dhenkanal",
        ]
        for hub in major_hubs:
            targets.append((normalize_text(hub), hub, "hub"))

        # 3. Add verified multilingual aliases
        for alias_key, expansions in MULTILINGUAL_ALIASES.items():
            norm_k = normalize_text(alias_key)
            for exp in expansions:
                targets.append((norm_k, exp, "alias"))

        # 4. Add places from database if session is provided
        if db is not None:
            try:
                places = db.query(Place.name, Place.category_id).all()
                for p_name, cat_id in places:
                    if cat_id in (14, 15, 16):  # Non-leisure (hospital, emergency, transit_hub)
                        continue
                    norm_p = normalize_text(p_name)
                    targets.append((norm_p, p_name, "place"))
            except Exception:
                pass

        # Static fallback list of major destinations if DB is empty/unavailable
        if not any(t[2] == "place" for t in targets):
            major_places = [
                "Jagannath Temple", "Konark Sun Temple", "Lingaraj Temple",
                "Chilika Lake", "Puri Beach", "Dhauli Shanti Stupa",
                "Similipal National Park", "Udayagiri and Khandagiri Caves",
                "Nandankanan Zoological Park", "Daringbadi", "Chandipur Beach",
                "Barehipani Falls", "Joranda Falls", "Debrigarh Wildlife Sanctuary",
                "Bhitarkanika National Park", "Hirakud Dam", "Tara Tarini Temple",
            ]
            for p in major_places:
                targets.append((normalize_text(p), p, "place"))

        return targets


    @classmethod
    def generate_suggestions(
        cls,
        query: str,
        db: Optional[Session] = None,
        limit: int = 5,
        min_confidence: float = 0.65,
    ) -> List[SearchSuggestion]:
        """
        Generate ranked suggestions/corrections for a user search query.
        """
        if not query or not query.strip():
            return []

        norm_query = normalize_text(query)
        if len(norm_query) < 2:
            return []

        targets = cls._initialize_targets(db)
        candidates: List[SearchSuggestion] = []
        seen_names: Set[str] = set()

        for norm_target, display_name, target_type in targets:
            if display_name in seen_names:
                continue

            # Check exact match
            if norm_query == norm_target:
                candidates.append(
                    SearchSuggestion(
                        text=display_name,
                        canonical_name=display_name,
                        match_type="exact",
                        confidence=1.0,
                    )
                )
                seen_names.add(display_name)
                continue

            # Check prefix match
            if norm_target.startswith(norm_query) and len(norm_query) >= 3:
                candidates.append(
                    SearchSuggestion(
                        text=display_name,
                        canonical_name=display_name,
                        match_type="prefix",
                        confidence=0.9,
                    )
                )
                seen_names.add(display_name)
                continue

            # Direct similarity
            sim = _levenshtein_similarity(norm_query, norm_target)

            # Sub-token similarity if multi-word target
            if " " in norm_target:
                tokens = norm_target.split()
                token_sims = [_levenshtein_similarity(norm_query, t) for t in tokens]
                max_tok_sim = max(token_sims) if token_sims else 0.0
                if max_tok_sim > sim:
                    sim = max_tok_sim * 0.90  # Subtoken match score

            # Give a boost to concise hub/district matches over long place names
            if target_type in ("hub", "district") and sim >= min_confidence:
                sim = min(0.99, sim * 1.1)

            if sim >= min_confidence:
                candidates.append(
                    SearchSuggestion(
                        text=display_name,
                        canonical_name=display_name,
                        match_type="typo_correction",
                        confidence=round(sim, 2),
                    )
                )
                seen_names.add(display_name)

        # Sort by confidence descending, then shorter name ascending, then alphabetical
        candidates.sort(key=lambda s: (-s.confidence, len(s.text), s.text))
        return candidates[:limit]


    @classmethod
    def resolve_corrected_query(
        cls,
        query: str,
        db: Optional[Session] = None,
    ) -> Optional[str]:
        """
        If a query has a high-confidence typo match (confidence >= 0.80), return the canonical name.
        """
        suggestions = cls.generate_suggestions(query, db=db, limit=1, min_confidence=0.80)
        if suggestions and suggestions[0].confidence >= 0.80:
            return suggestions[0].canonical_name
        return None
