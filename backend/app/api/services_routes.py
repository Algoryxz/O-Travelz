"""Authoritative Traveller Essentials & Local Services HTTP Endpoints."""
from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.schemas.service import (
    DestinationSafetyContract,
    NearbyServicesGroupedResponse,
    NearbyServicesListResponse,
    ServiceCategoryType,
)
from app.services.essentials.service import EssentialsService

router = APIRouter()


@router.get(
    "/nearby",
    response_model=NearbyServicesListResponse,
    summary="Search verified nearby traveller services by GPS coordinates",
)
def get_nearby_services(
    lat: float = Query(..., ge=17.8, le=22.6, description="WGS84 Latitude inside Odisha bounds"),
    lon: float = Query(..., ge=81.4, le=87.5, description="WGS84 Longitude inside Odisha bounds"),
    category: Optional[ServiceCategoryType] = Query(None, description="Category filter"),
    subcategory: Optional[str] = Query(None, description="Specific subcategory filter"),
    radius_km: float = Query(5.0, ge=0.5, le=100.0, description="Initial search radius in km"),
    max_radius_km: float = Query(50.0, ge=1.0, le=200.0, description="Maximum radius expansion limit in km"),
    limit: int = Query(20, ge=1, le=100, description="Max results count"),
) -> NearbyServicesListResponse:
    """Find verified nearby healthcare, police, hotels, restaurants, fuel, transit, or ATMs."""
    return EssentialsService.search_nearby_services(
        lat=lat,
        lon=lon,
        category=category,
        subcategory=subcategory,
        requested_radius_km=radius_km,
        max_radius_km=max_radius_km,
        limit=limit,
    )


@router.get(
    "/safety/{destination_id}",
    response_model=DestinationSafetyContract,
    summary="Get verified safety profile, emergency helplines, and local advisories for a destination",
)
def get_destination_safety(destination_id: str) -> DestinationSafetyContract:
    """Retrieve verified emergency numbers and destination-specific safety advisories."""
    advisory = EssentialsService.get_destination_safety(destination_id)
    if not advisory:
        raise HTTPException(
            status_code=404,
            detail=f"Safety advisory for destination '{destination_id}' not found.",
        )
    return advisory


@router.get(
    "/for-destination",
    response_model=NearbyServicesGroupedResponse,
    summary="Comprehensive discovery of all essential services and safety for a destination",
)
def get_services_for_destination(
    lat: float = Query(..., ge=17.8, le=22.6, description="WGS84 Latitude"),
    lon: float = Query(..., ge=81.4, le=87.5, description="WGS84 Longitude"),
    destination_id: Optional[str] = Query(None, description="Canonical destination ID"),
    destination_name: Optional[str] = Query(None, description="Destination name"),
    radius_km: float = Query(10.0, ge=1.0, le=50.0, description="Search radius in km"),
) -> NearbyServicesGroupedResponse:
    """Returns grouped healthcare, police, accommodation, dining, fuel, transit, ATMs, and safety."""
    return EssentialsService.get_nearby_services_for_destination(
        lat=lat,
        lon=lon,
        destination_id=destination_id,
        destination_name=destination_name,
        default_radius_km=radius_km,
    )
