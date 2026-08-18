"""Conservative deterministic verified-place ranking."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Sequence

from app.schemas.common import PlanningConstraints
from app.services.ranking.repository import VerifiedPlace


def normalize_identifier(value: str) -> str:
    """Normalize identifiers without fuzzy or semantic matching."""

    return value.strip().casefold()


@dataclass(frozen=True, slots=True)
class RankedPlace:
    place: VerifiedPlace
    relevance: int


class RankingService:
    """Rank candidates using only approved category relevance and tie-breaks."""

    def rank(
        self,
        constraints: PlanningConstraints,
        candidates: Iterable[VerifiedPlace],
    ) -> tuple[RankedPlace, ...]:
        interests = {
            normalize_identifier(interest)
            for interest in constraints.interests
            if normalize_identifier(interest)
        }
        ranked = [
            RankedPlace(
                place=candidate,
                relevance=(
                    1
                    if interests and normalize_identifier(candidate.category_id) in interests
                    else 0
                ),
            )
            for candidate in candidates
        ]
        return tuple(sorted(ranked, key=self._sort_key))

    @staticmethod
    def _sort_key(candidate: RankedPlace) -> tuple[int, str, str, int, str, str]:
        place = candidate.place
        # Missing research IDs sort after present IDs; UUID remains the final key.
        research_missing = int(place.research_id is None)
        return (
            -candidate.relevance,
            place.category_id,
            place.name,
            research_missing,
            place.research_id or "",
            place.database_id,
        )


def rank_places(
    constraints: PlanningConstraints,
    candidates: Sequence[VerifiedPlace],
) -> tuple[RankedPlace, ...]:
    return RankingService().rank(constraints, candidates)
