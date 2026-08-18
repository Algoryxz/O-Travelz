"""Verified-place query boundary for Phase 4 deterministic services."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, Sequence

from app.transport.adapters.walking import Coordinate


@dataclass(frozen=True, slots=True)
class VerifiedPlace:
    """Facts needed by ranking and itinerary eligibility.

    ``category_id`` is the canonical category identifier stored in ``Category.name``;
    ``database_id`` is the persisted UUID used as the final deterministic tie-break.
    """

    database_id: str
    category_id: str
    name: str
    research_id: str | None = None
    coordinate: Coordinate | None = None
    opening_hours: object | None = None
    avg_visit_minutes: int | None = None
    price_tier: str | None = None

    def to_summary(self):
        from app.schemas.common import PlaceSummary

        return PlaceSummary(id=self.database_id, name=self.name, category=self.category_id)


class PlaceRepository(Protocol):
    def list_verified_places(self) -> Sequence[VerifiedPlace]: ...

    def resolve_origin(self, value: str) -> VerifiedPlace | None: ...


def _origin_matches(records: Sequence[VerifiedPlace], value: str) -> VerifiedPlace | None:
    normalized = value.strip()
    if not normalized:
        return None

    for record in records:
        if record.database_id == normalized or record.research_id == normalized:
            return record

    name_matches = [
        record
        for record in records
        if record.name.casefold() == normalized.casefold()
    ]
    if len(name_matches) != 1:
        return None
    return name_matches[0]


class InMemoryPlaceRepository:
    """Deterministic repository used by unit and service tests."""

    def __init__(self, places: Sequence[VerifiedPlace]):
        self._places = tuple(places)

    def list_verified_places(self) -> Sequence[VerifiedPlace]:
        return self._places

    def resolve_origin(self, value: str) -> VerifiedPlace | None:
        return _origin_matches(self._places, value)


class SQLAlchemyPlaceRepository:
    """Read imported verified places without adding inference or geocoding."""

    def __init__(self, session):
        self._session = session

    def list_verified_places(self) -> Sequence[VerifiedPlace]:
        from app.models.category import Category
        from app.models.place import Place

        rows = (
            self._session.query(Place, Category)
            .join(Category, Place.category_id == Category.id)
            .filter(Place.verified_at.isnot(None))
            .all()
        )
        return tuple(self._record(place, category) for place, category in rows)

    def resolve_origin(self, value: str) -> VerifiedPlace | None:
        return _origin_matches(self.list_verified_places(), value)

    @staticmethod
    def _record(place, category) -> VerifiedPlace:
        coordinate = None
        if place.location is not None:
            try:
                from geoalchemy2.shape import to_shape

                point = to_shape(place.location)
                coordinate = Coordinate(point.y, point.x)
            except Exception:
                # An unreadable persisted geometry is not a valid routing origin.
                coordinate = None

        return VerifiedPlace(
            database_id=str(place.id),
            category_id=category.name,
            name=place.name,
            research_id=place.research_id,
            coordinate=coordinate,
            opening_hours=place.opening_hours,
            avg_visit_minutes=place.avg_visit_minutes,
            price_tier=place.price_tier,
        )
