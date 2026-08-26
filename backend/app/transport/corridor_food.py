"""
Transit Route Corridor Food Intelligence Service.

Computes deterministic point-to-segment distances between verified transit
route stops and canonical Place food records. Classifies detour impacts,
filters by dietary tags, and performs deterministic explainable ranking.
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from typing import Any, List, Optional
from uuid import UUID

from geoalchemy2.shape import to_shape
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.place import Place
from app.models.transport import Route, RouteStop, Stop

# Detour classification thresholds in meters
ON_ROUTE_THRESHOLD_M = 300.0
SHORT_DETOUR_THRESHOLD_M = 2500.0
LONG_DETOUR_THRESHOLD_M = 8000.0

# Conservative urban/suburban road travel speed estimate (~30 km/h = 500 m/min)
DEFAULT_ROAD_SPEED_M_PER_MIN = 500.0
SERVICE_BUFFER_MINUTES = 5


def point_to_segment_distance_meters(
    p_lat: float,
    p_lon: float,
    a_lat: float,
    a_lon: float,
    b_lat: float,
    b_lon: float,
) -> tuple[float, float]:
    """
    Compute perpendicular distance from point P to line segment AB in meters
    using a local equirectangular projection tangent plane.
    Returns: (distance_meters, t_projection) where t is clamped to [0, 1].
    """
    lat_mid = math.radians((a_lat + b_lat) / 2.0)
    meters_per_deg_lat = 110540.0
    meters_per_deg_lon = 111320.0 * math.cos(lat_mid)

    # Convert coordinates to local Cartesian (origin at A)
    ab_x = (b_lon - a_lon) * meters_per_deg_lon
    ab_y = (b_lat - a_lat) * meters_per_deg_lat

    ap_x = (p_lon - a_lon) * meters_per_deg_lon
    ap_y = (p_lat - a_lat) * meters_per_deg_lat

    ab_len_sq = ab_x * ab_x + ab_y * ab_y
    if ab_len_sq <= 1e-6:
        # A and B are the same point
        dist = math.sqrt(ap_x * ap_x + ap_y * ap_y)
        return dist, 0.0

    t = (ap_x * ab_x + ap_y * ab_y) / ab_len_sq
    t_clamped = max(0.0, min(1.0, t))

    proj_x = t_clamped * ab_x
    proj_y = t_clamped * ab_y

    dx = ap_x - proj_x
    dy = ap_y - proj_y
    dist = math.sqrt(dx * dx + dy * dy)
    return dist, t_clamped


def classify_detour(distance_m: float) -> str:
    """Classify detour status based on deterministic corridor distance thresholds."""
    if distance_m <= ON_ROUTE_THRESHOLD_M:
        return "ON_ROUTE"
    elif distance_m <= SHORT_DETOUR_THRESHOLD_M:
        return "SHORT_DETOUR"
    elif distance_m <= LONG_DETOUR_THRESHOLD_M:
        return "LONG_DETOUR"
    return "OUT_OF_CORRIDOR"


def calculate_estimated_detour_minutes(distance_m: float, corridor_status: str) -> int:
    """
    Approximate travel-time impact (minutes) for deviating from transit corridor.
    For ON_ROUTE (<= 300m), estimated detour impact is 0 minutes.
    For other statuses: Extra detour distance = 2 * distance_m at 30 km/h + 5 min buffer.
    """
    if corridor_status == "ON_ROUTE":
        return 0
    extra_distance_m = 2.0 * distance_m
    travel_mins = math.ceil(extra_distance_m / DEFAULT_ROAD_SPEED_M_PER_MIN)
    return int(travel_mins + SERVICE_BUFFER_MINUTES)


@dataclass
class CorridorGeometryInfo:
    verified_coordinate_stops: int
    total_route_stops: int
    verified_segment_count: int
    unresolved_gap_count: int
    geometry_status: str  # "verified" | "partial" | "geometry_unavailable"

    def to_dict(self) -> dict[str, Any]:
        return {
            "verified_coordinate_stops": self.verified_coordinate_stops,
            "total_route_stops": self.total_route_stops,
            "verified_segment_count": self.verified_segment_count,
            "unresolved_gap_count": self.unresolved_gap_count,
            "geometry_status": self.geometry_status,
        }


@dataclass
class CorridorFoodCandidate:
    place_id: str
    research_id: str
    name: str
    district: Optional[str]
    locality: Optional[str]
    latitude: float
    longitude: float
    food_category: Optional[str]
    cuisine: Optional[str]
    dietary_tags: List[str]
    speciality_dishes: List[str]
    price_tier: Optional[str]
    rating: Optional[float]
    rating_count: Optional[int]
    rating_source: Optional[str]
    distance_from_corridor_m: float
    estimated_detour_minutes: int
    corridor_status: str  # "ON_ROUTE" | "SHORT_DETOUR" | "LONG_DETOUR"
    match_reasons: List[str]
    source: str
    verification_status: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "place_id": self.place_id,
            "research_id": self.research_id,
            "name": self.name,
            "district": self.district,
            "locality": self.locality,
            "latitude": round(self.latitude, 6),
            "longitude": round(self.longitude, 6),
            "food_category": self.food_category,
            "cuisine": self.cuisine,
            "dietary_tags": self.dietary_tags or [],
            "speciality_dishes": self.speciality_dishes or [],
            "price_tier": self.price_tier,
            "rating": self.rating,
            "rating_count": self.rating_count,
            "rating_source": self.rating_source,
            "distance_from_corridor_m": round(self.distance_from_corridor_m, 1),
            "estimated_detour_minutes": self.estimated_detour_minutes,
            "corridor_status": self.corridor_status,
            "match_reasons": self.match_reasons,
            "source": self.source,
            "verification_status": self.verification_status,
        }


def resolve_route_entity(session: Session, route_identifier: str) -> Optional[Route]:
    """
    Safely resolves a Route database model from various identifier representations:
    1. UUID primary key (if valid UUID)
    2. Exact route_code (e.g. 'capital-region-10', 'rt_10')
    3. Exact route name (e.g. '10', '28', '13')
    4. Exact route_name (e.g. 'Bhubaneswar Airport ⇄ Nandankanan')
    5. Normalized public aliases (e.g. 'rt_10' -> '10', 'route_10' -> '10', 'route-10' -> '10')
    6. Canonical slug (e.g. 'capital-region-10', 'rt_10')
    """
    if not route_identifier or not isinstance(route_identifier, str):
        return None

    clean = route_identifier.strip()
    if not clean:
        return None

    # 1. UUID primary key
    try:
        r_uuid = UUID(clean)
        r = session.query(Route).filter(Route.id == r_uuid).first()
        if r:
            return r
    except ValueError:
        pass

    # 2. Exact route_code, name, or route_name
    r = session.query(Route).filter(
        or_(
            Route.route_code == clean,
            Route.name == clean,
            Route.route_name == clean,
        )
    ).first()
    if r:
        return r

    # 3. Normalized public aliases
    lower = clean.lower()
    if lower.startswith("rt_"):
        code_num = lower[3:].strip()
    elif lower.startswith("route_"):
        code_num = lower[6:].strip()
    elif lower.startswith("route-"):
        code_num = lower[6:].strip()
    else:
        code_num = lower

    r = session.query(Route).filter(
        or_(
            Route.name == code_num,
            Route.name == code_num.upper(),
            Route.name == f"0{code_num}",
            Route.route_code == code_num,
            Route.route_code == f"capital-region-{code_num}",
            Route.route_code == f"rt_{code_num}",
            Route.route_code.ilike(f"%-{code_num}"),
        )
    ).first()
    return r


class CorridorFoodService:
    def __init__(self, session: Session):
        self.session = session

    def find_corridor_food(
        self,
        route_id: str,
        max_distance_m: float = LONG_DETOUR_THRESHOLD_M,
        food_category: Optional[str] = None,
        dietary_tag: Optional[str] = None,
        cuisine: Optional[str] = None,
        limit: int = 10,
    ) -> dict[str, Any]:
        """
        Discover verified food places along an existing transit route's verified coordinate corridor.
        Never fabricates coordinates or geometry. Accepts UUIDs or public route identifiers (e.g. 'rt_10').
        """
        route = resolve_route_entity(self.session, route_id)
        if not route:
            raise LookupError(f"Route with ID '{route_id}' not found")

        # 1. Fetch ordered route stops
        route_stops = (
            self.session.query(RouteStop, Stop)
            .join(Stop, RouteStop.stop_id == Stop.id)
            .filter(RouteStop.route_id == route.id)
            .order_by(RouteStop.sequence_order)
            .all()
        )

        total_stops = len(route_stops)
        verified_coords: list[tuple[float, float, int, str]] = []  # (lat, lon, seq, name)
        unresolved_count = 0

        for rs, stop in route_stops:
            if stop.location is not None and stop.coordinate_status in ("official", "verified", "geocoded"):
                try:
                    shape = to_shape(stop.location)
                    verified_coords.append((shape.y, shape.x, rs.sequence_order, stop.name))
                except Exception:
                    unresolved_count += 1
            else:
                unresolved_count += 1

        verified_count = len(verified_coords)

        # Determine geometry status
        if verified_count < 2:
            geometry_status = "geometry_unavailable"
            geometry_info = CorridorGeometryInfo(
                verified_coordinate_stops=verified_count,
                total_route_stops=total_stops,
                verified_segment_count=0,
                unresolved_gap_count=unresolved_count,
                geometry_status=geometry_status,
            )
            return {
                "route_id": str(route.id),
                "route_number": route.name,
                "route_name": route.route_name,
                "corridor_geometry_info": geometry_info.to_dict(),
                "total_candidates": 0,
                "candidates": [],
            }

        geometry_status = "verified" if unresolved_count == 0 else "partial"
        segment_count = verified_count - 1

        geometry_info = CorridorGeometryInfo(
            verified_coordinate_stops=verified_count,
            total_route_stops=total_stops,
            verified_segment_count=segment_count,
            unresolved_gap_count=unresolved_count,
            geometry_status=geometry_status,
        )

        # 2. Build corridor segments
        segments = []
        for i in range(len(verified_coords) - 1):
            a_lat, a_lon, _, _ = verified_coords[i]
            b_lat, b_lon, _, _ = verified_coords[i + 1]
            segments.append((a_lat, a_lon, b_lat, b_lon))

        # 3. Query candidate food places with non-null locations
        query = self.session.query(Place).filter(
            Place.location.isnot(None),
            Place.food_category.isnot(None),
        )

        if food_category:
            query = query.filter(Place.food_category == food_category)

        if cuisine:
            query = query.filter(Place.cuisine.ilike(f"%{cuisine}%"))

        candidate_places = query.all()

        evaluated_candidates: list[CorridorFoodCandidate] = []
        effective_max_dist = min(max_distance_m, LONG_DETOUR_THRESHOLD_M)

        for p in candidate_places:
            try:
                shape = to_shape(p.location)
                p_lon, p_lat = shape.x, shape.y
            except Exception:
                continue

            # Check dietary tag filter if requested
            p_dietary = p.dietary_tags if isinstance(p.dietary_tags, list) else []
            if dietary_tag and dietary_tag not in p_dietary:
                continue

            # Compute minimum perpendicular distance across all verified segments
            min_dist = float("inf")
            for a_lat, a_lon, b_lat, b_lon in segments:
                dist, _ = point_to_segment_distance_meters(p_lat, p_lon, a_lat, a_lon, b_lat, b_lon)
                if dist < min_dist:
                    min_dist = dist

            if min_dist > effective_max_dist:
                continue

            status = classify_detour(min_dist)
            if status == "OUT_OF_CORRIDOR":
                continue

            detour_mins = calculate_estimated_detour_minutes(min_dist, status)

            # Build explainable match reasons
            reasons = []
            if status == "ON_ROUTE":
                reasons.append("on_route")
            elif status == "SHORT_DETOUR":
                reasons.append("short_detour")
            elif status == "LONG_DETOUR":
                reasons.append("long_detour")

            if dietary_tag and dietary_tag in p_dietary:
                reasons.append(f"dietary_match:{dietary_tag}")
            if cuisine and p.cuisine and cuisine.lower() in p.cuisine.lower():
                reasons.append("cuisine_match")
            if p.verification_status == "VERIFIED":
                reasons.append("verified_source")

            specialities = p.speciality_dishes if isinstance(p.speciality_dishes, list) else []

            evaluated_candidates.append(
                CorridorFoodCandidate(
                    place_id=str(p.id),
                    research_id=p.research_id or str(p.id),
                    name=p.name,
                    district=p.district,
                    locality=p.address or p.district,
                    latitude=p_lat,
                    longitude=p_lon,
                    food_category=p.food_category,
                    cuisine=p.cuisine,
                    dietary_tags=p_dietary,
                    speciality_dishes=specialities,
                    price_tier=p.price_tier,
                    rating=p.rating,
                    rating_count=p.rating_count,
                    rating_source=p.rating_source,
                    distance_from_corridor_m=min_dist,
                    estimated_detour_minutes=detour_mins,
                    corridor_status=status,
                    match_reasons=reasons,
                    source=p.source or "Odisha Food Research",
                    verification_status=p.verification_status or "VERIFIED",
                )
            )

        # 4. Deterministic ranking:
        # Priority:
        # 1. corridor_status rank (ON_ROUTE = 0, SHORT_DETOUR = 1, LONG_DETOUR = 2)
        # 2. distance_from_corridor_m (ascending)
        # 3. rating (descending, None treated as 0 for sorting only without falsifying data)
        # 4. research_id (lexicographic tie-breaker)
        status_rank_map = {"ON_ROUTE": 0, "SHORT_DETOUR": 1, "LONG_DETOUR": 2}

        evaluated_candidates.sort(
            key=lambda c: (
                status_rank_map.get(c.corridor_status, 99),
                c.distance_from_corridor_m,
                -(c.rating or 0.0),
                c.research_id,
            )
        )

        limited_candidates = evaluated_candidates[:limit]

        return {
            "route_id": str(route.id),
            "route_number": route.name,
            "route_name": route.route_name,
            "corridor_geometry_info": geometry_info.to_dict(),
            "total_candidates": len(limited_candidates),
            "candidates": [c.to_dict() for c in limited_candidates],
        }
