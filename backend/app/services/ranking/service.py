"""Conservative deterministic verified-place ranking."""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Iterable, Sequence

from app.schemas.common import PlanningConstraints
from app.services.ranking.repository import VerifiedPlace


def normalize_identifier(value: str) -> str:
    """Normalize identifiers without fuzzy or semantic matching."""
    return value.strip().casefold()


def _haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return r * c


@dataclass(frozen=True, slots=True)
class RankedPlace:
    place: VerifiedPlace
    relevance: int
    proximity_tier: int = 0
    distance_km: float = 0.0


class RankingService:
    """Rank candidates using approved interest, start proximity, and deterministic tie-breaks."""

    def rank(
        self,
        constraints: PlanningConstraints,
        candidates: Iterable[VerifiedPlace],
        start: VerifiedPlace | None = None,
    ) -> tuple[RankedPlace, ...]:
        requested_interests = {
            normalize_identifier(interest)
            for interest in constraints.interests
            if normalize_identifier(interest)
        }
        ranked = []
        for candidate in candidates:
            relevance = self._calculate_relevance(candidate, requested_interests)
            tier, dist = self._calculate_proximity(candidate, start)
            ranked.append(
                RankedPlace(
                    place=candidate,
                    relevance=relevance,
                    proximity_tier=tier,
                    distance_km=dist,
                )
            )
        return tuple(sorted(ranked, key=self._sort_key))

    @staticmethod
    def _calculate_proximity(
        candidate: VerifiedPlace, start: VerifiedPlace | None
    ) -> tuple[int, float]:
        if start is None or start.coordinate is None:
            return 0, 0.0
        if candidate.coordinate is None:
            return 3, 9999.0
        dist = _haversine_distance_km(
            start.coordinate.latitude,
            start.coordinate.longitude,
            candidate.coordinate.latitude,
            candidate.coordinate.longitude,
        )
        if dist <= 45.0:
            tier = 0
        elif dist <= 95.0:
            tier = 1
        else:
            tier = 2
        return tier, round(dist, 2)

    @staticmethod
    def _calculate_relevance(candidate: VerifiedPlace, requested_interests: set[str]) -> int:
        if not requested_interests:
            return 0
        candidate_interests = {
            normalize_identifier(i) for i in candidate.interests if normalize_identifier(i)
        }
        # Exact matching only: count number of exact matched interests
        interest_matches = len(requested_interests & candidate_interests)
        # Backwards-compatible exact category match if category name is in requested_interests
        cat_match = 1 if normalize_identifier(candidate.category_id) in requested_interests else 0
        return interest_matches + cat_match

    @staticmethod
    def _sort_key(candidate: RankedPlace) -> tuple[int, int, float, str, str, int, str, str]:
        place = candidate.place
        # Missing research IDs sort after present IDs; UUID remains the final key.
        research_missing = int(place.research_id is None)
        return (
            candidate.proximity_tier,
            -candidate.relevance,
            candidate.distance_km,
            place.category_id,
            place.name,
            research_missing,
            place.research_id or "",
            place.database_id,
        )


def rank_places(
    constraints: PlanningConstraints,
    candidates: Sequence[VerifiedPlace],
    start: VerifiedPlace | None = None,
) -> tuple[RankedPlace, ...]:
    return RankingService().rank(constraints, candidates, start=start)

