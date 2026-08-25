"""Authoritative places discovery HTTP boundary."""
from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.category import Category
from app.models.place import Place
from app.models.interest import Interest, PlaceInterest
from app.schemas.image import PlaceImageResponse
from app.core.regions import get_region_for_place
from app.services.search.search_models import SearchQueryParams
from app.services.search.search_service import SearchService

router = APIRouter()


class PlaceDetailResponse(BaseModel):
    id: str
    research_id: Optional[str] = None
    name: str
    category: str
    description: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    district: Optional[str] = None
    region: Optional[str] = None
    avg_visit_minutes: Optional[int] = None
    price_tier: Optional[str] = None
    rating: Optional[float] = None
    rating_count: Optional[int] = None
    rating_source: Optional[str] = None
    opening_hours_source: Optional[str] = None
    interests: List[str] = []
    source: Optional[str] = None
    source_url: Optional[str] = None
    verified_at: Optional[str] = None
    verification_status: Optional[str] = None
    contact_phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    address: Optional[str] = None
    cuisine: Optional[str] = None
    dietary_tags: Optional[List[str]] = None
    speciality_dishes: Optional[List[str]] = None
    highway_corridor: Optional[str] = None
    food_category: Optional[str] = None
    images: List[PlaceImageResponse] = []


def _extract_interests(place: Place) -> List[str]:
    interests = [
        assoc.interest.name
        for assoc in getattr(place, "interest_associations", [])
        if getattr(assoc, "interest", None) and getattr(assoc.interest, "name", None)
    ]
    if not interests and hasattr(place, "interests") and isinstance(place.interests, list):
        return sorted(place.interests)
    return sorted(interests)


def _to_place_detail_response(place: Place, cat_name: str) -> PlaceDetailResponse:
    lat = getattr(place, "lat", None)
    lon = getattr(place, "lon", None)
    if lat is None or lon is None:
        if place.location is not None:
            try:
                from geoalchemy2.shape import to_shape
                point = to_shape(place.location)
                lat = point.y
                lon = point.x
            except Exception:
                pass
            if (lat is None or lon is None) and hasattr(place.location, "y") and hasattr(place.location, "x"):
                lat = place.location.y
                lon = place.location.x

    image_responses = []
    try:
        if hasattr(place, "images") and place.images:
            image_responses = [PlaceImageResponse.model_validate(img) for img in place.images]
    except Exception:
        image_responses = []

    place_region = get_region_for_place(place.district, place.research_id or str(place.id))

    return PlaceDetailResponse(
        id=str(place.id),
        research_id=place.research_id,
        name=place.name,
        category=cat_name,
        description=place.description,
        lat=lat,
        lon=lon,
        district=place.district,
        region=place_region,
        avg_visit_minutes=place.avg_visit_minutes,
        price_tier=place.price_tier,
        rating=getattr(place, "rating", None),
        rating_count=getattr(place, "rating_count", None),
        rating_source=getattr(place, "rating_source", None),
        opening_hours_source=getattr(place, "opening_hours_source", None),
        interests=_extract_interests(place),
        source=place.source,
        source_url=getattr(place, "source_url", None),
        verified_at=str(place.verified_at) if place.verified_at else None,
        verification_status=getattr(place, "verification_status", None),
        contact_phone=getattr(place, "contact_phone", None),
        emergency_phone=getattr(place, "emergency_phone", None),
        address=getattr(place, "address", None),
        cuisine=getattr(place, "cuisine", None),
        dietary_tags=getattr(place, "dietary_tags", None),
        speciality_dishes=getattr(place, "speciality_dishes", None),
        highway_corridor=getattr(place, "highway_corridor", None),
        food_category=getattr(place, "food_category", None),
        images=image_responses,
    )


@router.get("", response_model=List[PlaceDetailResponse])
def list_places(
    response: Response,
    search: Optional[str] = Query(None, description="Search across names, descriptions, districts, categories, and aliases"),
    category: Optional[str] = Query(None, description="Filter by canonical category"),
    interest: Optional[str] = Query(None, description="Filter by canonical interest"),
    district: Optional[str] = Query(None, description="Filter by administrative district"),
    region: Optional[str] = Query(None, description="Filter by canonical travel region"),
    verification_status: Optional[str] = Query(None, description="Filter by verification status"),
    is_medical: Optional[bool] = Query(None, description="Filter medical & emergency facilities"),
    is_transit: Optional[bool] = Query(None, description="Filter transit hubs"),
    near_lat: Optional[float] = Query(None, ge=17.0, le=23.5, description="Reference latitude for proximity search"),
    near_lon: Optional[float] = Query(None, ge=81.0, le=88.0, description="Reference longitude for proximity search"),
    radius_km: Optional[float] = Query(None, gt=0, le=500.0, description="Proximity search radius in kilometers"),
    limit: int = Query(200, ge=1, le=200, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    db: Session = Depends(get_db),
) -> List[PlaceDetailResponse]:
    """List and search verified Odisha places from authoritative database."""
    params = SearchQueryParams(
        search=search,
        district=district,
        region=region,
        category=category,
        interest=interest,
        verification_status=verification_status,
        is_medical=is_medical,
        is_transit=is_transit,
        near_lat=near_lat,
        near_lon=near_lon,
        radius_km=radius_km,
        limit=limit,
        offset=offset,
    )

    candidates, total_count = SearchService.search_places(db, params)
    response.headers["X-Total-Count"] = str(total_count)
    response.headers["X-Limit"] = str(limit)
    response.headers["X-Offset"] = str(offset)

    return [_to_place_detail_response(c.place, c.category_name) for c in candidates]



@router.get("/suggestions", response_model=List[dict])
def get_search_suggestions(
    query: str = Query(..., min_length=1, max_length=100, description="Search query prefix or typo string"),
    limit: int = Query(5, ge=1, le=10, description="Maximum suggestions to return"),
    db: Session = Depends(get_db),
) -> List[dict]:
    """Retrieve canonical destination suggestions and typo corrections."""
    from app.services.search.search_correction import SearchCorrectionService
    suggestions = SearchCorrectionService.generate_suggestions(query, db=db, limit=limit)
    return [s.model_dump() for s in suggestions]



@router.get("/{place_id}", response_model=PlaceDetailResponse)
def get_place(
    place_id: str,
    db: Session = Depends(get_db),
) -> PlaceDetailResponse:

    """Retrieve authoritative details for a specific verified place."""
    import uuid

    is_valid_uuid = False
    try:
        uuid.UUID(str(place_id))
        is_valid_uuid = True
    except (ValueError, AttributeError, TypeError):
        is_valid_uuid = False

    record = None
    if is_valid_uuid:
        query = (
            db.query(Place, Category)
            .join(Category, Place.category_id == Category.id)
            .filter(Place.id == place_id)
        )
        if hasattr(query, "options"):
            try:
                query = query.options(joinedload(Place.interest_associations).joinedload(PlaceInterest.interest))
            except Exception:
                pass
        record = query.first()

    if not record:
        # Also try matching by research_id if given
        query_res = (
            db.query(Place, Category)
            .join(Category, Place.category_id == Category.id)
            .filter(Place.research_id == place_id)
        )
        if hasattr(query_res, "options"):
            try:
                query_res = query_res.options(joinedload(Place.interest_associations).joinedload(PlaceInterest.interest))
            except Exception:
                pass
        record = query_res.first()

    if not record:
        raise HTTPException(status_code=404, detail="Place not found")

    place, cat = record
    return _to_place_detail_response(place, cat.name)
