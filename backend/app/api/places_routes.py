"""Authoritative places discovery HTTP boundary."""
from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category
from app.models.place import Place

router = APIRouter()


class PlaceDetailResponse(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    avg_visit_minutes: Optional[int] = None
    price_tier: Optional[str] = None
    source: Optional[str] = None
    verified_at: Optional[str] = None


@router.get("", response_model=List[PlaceDetailResponse])
def list_places(
    category: Optional[str] = Query(None, description="Filter by canonical category"),
    search: Optional[str] = Query(None, description="Search by place name or description"),
    db: Session = Depends(get_db),
) -> List[PlaceDetailResponse]:
    """List verified Odisha places from authoritative database."""
    query = (
        db.query(Place, Category)
        .join(Category, Place.category_id == Category.id)
        .filter(Place.verified_at.isnot(None))
    )

    if category:
        query = query.filter(Category.name.ilike(category.strip()))

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(Place.name.ilike(term) | Place.description.ilike(term))

    results = query.order_by(Place.name.asc()).all()

    places: List[PlaceDetailResponse] = []
    for place, cat in results:
        lat = None
        lon = None
        if place.location is not None:
            try:
                from geoalchemy2.shape import to_shape

                point = to_shape(place.location)
                lat = point.y
                lon = point.x
            except Exception:
                pass

        places.append(
            PlaceDetailResponse(
                id=str(place.id),
                name=place.name,
                category=cat.name,
                description=place.description,
                lat=lat,
                lon=lon,
                avg_visit_minutes=place.avg_visit_minutes,
                price_tier=place.price_tier,
                source=place.source,
                verified_at=str(place.verified_at) if place.verified_at else None,
            )
        )

    return places


@router.get("/{place_id}", response_model=PlaceDetailResponse)
def get_place(
    place_id: str,
    db: Session = Depends(get_db),
) -> PlaceDetailResponse:
    """Retrieve authoritative details for a specific verified place."""
    record = (
        db.query(Place, Category)
        .join(Category, Place.category_id == Category.id)
        .filter(Place.id == place_id)
        .first()
    )

    if not record:
        # Also try matching by research_id if given
        record = (
            db.query(Place, Category)
            .join(Category, Place.category_id == Category.id)
            .filter(Place.research_id == place_id)
            .first()
        )

    if not record:
        raise HTTPException(status_code=404, detail="Place not found")

    place, cat = record
    lat = None
    lon = None
    if place.location is not None:
        try:
            from geoalchemy2.shape import to_shape

            point = to_shape(place.location)
            lat = point.y
            lon = point.x
        except Exception:
            pass

    return PlaceDetailResponse(
        id=str(place.id),
        name=place.name,
        category=cat.name,
        description=place.description,
        lat=lat,
        lon=lon,
        avg_visit_minutes=place.avg_visit_minutes,
        price_tier=place.price_tier,
        source=place.source,
        verified_at=str(place.verified_at) if place.verified_at else None,
    )
