"""Location and Geocoding API Routes for O-Travelz."""
from __future__ import annotations

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

from app.services.location.geocoding import reverse_geocode_coordinates

router = APIRouter()


class ReverseGeocodeResponse(BaseModel):
    locality: str
    neighborhood: Optional[str] = None
    city: str
    district: Optional[str] = None
    state: str = "Odisha"
    country: str = "India"
    lat: float
    lon: float
    is_exact: bool = False


@router.get("/reverse-geocode", response_model=ReverseGeocodeResponse)
@router.get("/current", response_model=ReverseGeocodeResponse)
def reverse_geocode(
    lat: float = Query(20.2667, description="Latitude coordinate"),
    lon: float = Query(85.8436, description="Longitude coordinate"),
) -> ReverseGeocodeResponse:
    """Reverse geocode coordinates into a human-readable locality."""
    res = reverse_geocode_coordinates(lat, lon)
    return ReverseGeocodeResponse(**res)
