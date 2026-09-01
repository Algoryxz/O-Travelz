"""Authoritative Traveller Essentials & Local Services domain engine."""
from __future__ import annotations

import json
import math
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.schemas.service import (
    DestinationSafetyContract,
    NearbyServiceResultContract,
    NearbyServicesGroupedResponse,
    NearbyServicesListResponse,
    ServiceCategoryType,
    ServiceRecordContract,
)

ODISHA_LAT_MIN = 17.8
ODISHA_LAT_MAX = 22.6
ODISHA_LON_MIN = 81.4
ODISHA_LON_MAX = 87.5


def is_valid_coordinate(lat: Any, lon: Any) -> bool:
    """Validate that lat/lon are numeric and within Odisha geographic bounds."""
    if lat is None or lon is None:
        return False
    try:
        n_lat = float(lat)
        n_lon = float(lon)
        if math.isnan(n_lat) or math.isnan(n_lon) or math.isinf(n_lat) or math.isinf(n_lon):
            return False
        if abs(n_lat) < 1e-6 and abs(n_lon) < 1e-6:
            return False
        return (ODISHA_LAT_MIN <= n_lat <= ODISHA_LAT_MAX) and (ODISHA_LON_MIN <= n_lon <= ODISHA_LON_MAX)
    except (ValueError, TypeError):
        return False


def calculate_haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometers using the Haversine formula."""
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return r * c


def format_distance(dist_km: float) -> str:
    """Human readable distance formatting."""
    if dist_km < 1.0:
        return f"{round(dist_km * 1000)} m away"
    if dist_km < 10.0:
        return f"{dist_km:.1f} km away"
    return f"{round(dist_km)} km away"


def calculate_drive_time_minutes(dist_km: float) -> int:
    """Estimated driving time in minutes with a 1.25x road winding factor."""
    if dist_km <= 0:
        return 0
    road_dist = dist_km * 1.25
    speed = 55.0 if dist_km > 30 else 38.0
    return max(2, round((road_dist / speed) * 60))


def calculate_walk_time_minutes(dist_km: float) -> int:
    """Estimated walking time in minutes based on standard 4.8 km/h."""
    if dist_km <= 0:
        return 0
    return max(1, round((dist_km / 4.8) * 60))


class EssentialsService:
    """Authoritative backend service for local amenities, health, police, and safety."""

    _services_cache: Optional[List[Dict[str, Any]]] = None
    _safety_cache: Optional[List[Dict[str, Any]]] = None

    @classmethod
    def _get_data_dir(cls) -> Path:
        # Resolve repo root relative to backend
        current = Path(__file__).resolve()
        for parent in current.parents:
            if (parent / "data" / "services").exists():
                return parent / "data" / "services"
        # Fallback to current working directory
        return Path("data/services").resolve()

    @classmethod
    def _load_data(cls) -> None:
        if cls._services_cache is not None and cls._safety_cache is not None:
            return

        data_dir = cls._get_data_dir()
        services_path = data_dir / "odisha_services.json"
        safety_path = data_dir / "destination_safety_advisories.json"

        if services_path.exists():
            with open(services_path, "r", encoding="utf-8") as f:
                cls._services_cache = json.load(f)
        else:
            cls._services_cache = []

        if safety_path.exists():
            with open(safety_path, "r", encoding="utf-8") as f:
                cls._safety_cache = json.load(f)
        else:
            cls._safety_cache = []

    @classmethod
    def search_nearby_services(
        cls,
        lat: float,
        lon: float,
        category: Optional[ServiceCategoryType] = None,
        subcategory: Optional[str] = None,
        requested_radius_km: float = 5.0,
        max_radius_km: float = 50.0,
        min_results: int = 1,
        limit: int = 20,
    ) -> NearbyServicesListResponse:
        """Search nearby services around coordinates with progressive radius expansion."""
        cls._load_data()

        if not is_valid_coordinate(lat, lon):
            return NearbyServicesListResponse(
                query_lat=lat,
                query_lon=lon,
                category=category,
                requested_radius_km=requested_radius_km,
                active_radius_km=requested_radius_km,
                is_expanded=False,
                count=0,
                distance_semantics="straight_line_haversine",
                services=[],
            )

        # 1. Filter by category & subcategory
        candidates = []
        for s in (cls._services_cache or []):
            if not is_valid_coordinate(s.get("lat"), s.get("lon")):
                continue
            if category and s.get("category") != category:
                continue
            if subcategory and s.get("subcategory") != subcategory:
                continue
            candidates.append(s)

        # 2. Compute Haversine distances
        with_distances: List[NearbyServiceResultContract] = []
        for c in candidates:
            dist = calculate_haversine_km(lat, lon, c["lat"], c["lon"])
            res = NearbyServiceResultContract(
                **c,
                distance_km=round(dist, 2),
                distance_formatted=format_distance(dist),
                distance_semantics="straight_line_haversine",
                estimated_drive_minutes=calculate_drive_time_minutes(dist),
                estimated_walk_minutes=calculate_walk_time_minutes(dist),
            )
            with_distances.append(res)

        # 3. Sort nearest-first
        with_distances.sort(key=lambda x: x.distance_km)

        # 4. Progressive radius expansion
        expansion_steps = [requested_radius_km, 10.0, 25.0, max_radius_km]
        unique_steps = sorted(list(set(r for r in expansion_steps if r >= requested_radius_km)))

        active_radius = requested_radius_km
        for step in unique_steps:
            count_in_step = sum(1 for item in with_distances if item.distance_km <= step)
            if count_in_step >= min_results:
                active_radius = step
                break
        else:
            if unique_steps:
                active_radius = unique_steps[-1]

        in_radius = [item for item in with_distances if item.distance_km <= active_radius]
        final_slice = in_radius[:limit]

        return NearbyServicesListResponse(
            query_lat=lat,
            query_lon=lon,
            category=category,
            requested_radius_km=requested_radius_km,
            active_radius_km=active_radius,
            is_expanded=active_radius > requested_radius_km,
            count=len(final_slice),
            distance_semantics="straight_line_haversine",
            services=final_slice,
        )

    @classmethod
    def get_destination_safety(
        cls, destination_id_or_name: str
    ) -> Optional[DestinationSafetyContract]:
        """Retrieve verified safety profile and emergency helplines for a destination."""
        cls._load_data()
        if not destination_id_or_name:
            return None

        normalized = destination_id_or_name.lower().strip()
        for adv in (cls._safety_cache or []):
            did = adv.get("destination_id", "").lower().strip()
            dname = adv.get("destination_name", "").lower().strip()
            if did == normalized or dname == normalized or normalized in dname or dname in normalized:
                return DestinationSafetyContract(**adv)
        return None

    @classmethod
    def get_nearby_services_for_destination(
        cls,
        lat: float,
        lon: float,
        destination_id: Optional[str] = None,
        destination_name: Optional[str] = None,
        default_radius_km: float = 10.0,
        max_radius_km: float = 50.0,
    ) -> NearbyServicesGroupedResponse:
        """Grouped discovery of all essential service categories plus safety advisories."""
        healthcare = cls.search_nearby_services(
            lat, lon, category="healthcare", requested_radius_km=default_radius_km, max_radius_km=max_radius_km, limit=5
        ).services

        police = cls.search_nearby_services(
            lat, lon, category="police", requested_radius_km=default_radius_km, max_radius_km=max_radius_km, limit=5
        ).services

        hotels = cls.search_nearby_services(
            lat, lon, category="hotel", requested_radius_km=default_radius_km, max_radius_km=max_radius_km, limit=5
        ).services

        restaurants = cls.search_nearby_services(
            lat, lon, category="restaurant", requested_radius_km=default_radius_km, max_radius_km=max_radius_km, limit=5
        ).services

        fuel = cls.search_nearby_services(
            lat, lon, category="fuel", requested_radius_km=default_radius_km, max_radius_km=max_radius_km, limit=5
        ).services

        transit = cls.search_nearby_services(
            lat, lon, category="transit", requested_radius_km=default_radius_km, max_radius_km=max_radius_km, limit=5
        ).services

        atms = cls.search_nearby_services(
            lat, lon, category="atm", requested_radius_km=default_radius_km, max_radius_km=max_radius_km, limit=5
        ).services

        total_count = (
            len(healthcare) + len(police) + len(hotels) + len(restaurants) + len(fuel) + len(transit) + len(atms)
        )

        all_results = healthcare + police + hotels + restaurants + fuel + transit + atms
        max_distance = max([s.distance_km for s in all_results] + [default_radius_km])
        is_expanded_any = any(s.distance_km > default_radius_km for s in all_results)

        safety_advisory = None
        if destination_id:
            safety_advisory = cls.get_destination_safety(destination_id)
        if not safety_advisory and destination_name:
            safety_advisory = cls.get_destination_safety(destination_name)

        return NearbyServicesGroupedResponse(
            destination_id=destination_id,
            destination_name=destination_name,
            query_lat=lat,
            query_lon=lon,
            requested_radius_km=default_radius_km,
            active_radius_km=round(max_distance, 1),
            is_expanded=is_expanded_any,
            total_services_count=total_count,
            distance_semantics="straight_line_haversine",
            healthcare=healthcare,
            police=police,
            hotels=hotels,
            restaurants=restaurants,
            fuel=fuel,
            transit=transit,
            atms=atms,
            safety_advisory=safety_advisory,
        )
