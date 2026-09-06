"""
Deterministic Snap-to-Road and Geometry Assembly Engine for Phase 6A & Wave C5.2.

Assembles route geometry payload strictly according to verified stop coordinates,
road corridor intelligence, and geometry readiness classification:
- RENDERABLE_EXACT: Full verified stop sequence geometry (returns exact coordinate path).
- RENDERABLE_ROAD_FOLLOWING: Continuous surveyed road way geometry available.
- ANCHOR_ONLY: Discrete verified/candidate anchor stops available; polyline suppressed to prevent straight lines.
- CORRIDOR_ONLY: Arterial corridor intelligence identified without verified anchor coordinates.
- UNAVAILABLE: No coordinates or route line generated.

PROHIBITIONS:
- Never generates straight-line interpolation across unverified stops.
- Never fabricates coordinates or intermediate waypoints.
- Never upgrades stop coordinate status based on route geometry confidence.
- Candidate stops never participate in first-mile walking.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from geoalchemy2.shape import to_shape
from sqlalchemy.orm import Session

from app.models.transport import Route, RouteStop, Stop
from app.models.transit_intelligence import RouteIntelligence, RouteCorridorIntelligence

logger = logging.getLogger(__name__)

# Regional bounding boxes for Odisha transit service regions (WGS84)
REGION_BOUNDS: Dict[str, Dict[str, float]] = {
    "Capital Region": {"lat_min": 19.5, "lat_max": 20.8, "lon_min": 85.3, "lon_max": 86.4},
    "Rourkela": {"lat_min": 21.9, "lat_max": 22.6, "lon_min": 84.5, "lon_max": 85.3},
    "Sambalpur": {"lat_min": 21.1, "lat_max": 21.8, "lon_min": 83.6, "lon_max": 84.5},
    "Berhampur": {"lat_min": 19.0, "lat_max": 19.7, "lon_min": 84.5, "lon_max": 85.3},
    "Keonjhar": {"lat_min": 21.2, "lat_max": 22.3, "lon_min": 85.2, "lon_max": 86.1},
}

DEFAULT_ODISHA_BOUNDS = {"lat_min": 17.5, "lat_max": 23.0, "lon_min": 81.0, "lon_max": 87.5}


def is_coordinate_in_region(lat: float, lon: float, region: Optional[str]) -> bool:
    """Validate whether coordinate falls within the route's designated service region."""
    bounds = REGION_BOUNDS.get(region) if region else None
    if not bounds:
        bounds = DEFAULT_ODISHA_BOUNDS
    return bounds["lat_min"] <= lat <= bounds["lat_max"] and bounds["lon_min"] <= lon <= bounds["lon_max"]


# In-memory cached staging datasets for Wave C5.2
_C5_STAGING_LOADED: bool = False
_C5_ROUTE_GEOS_BY_NUM: Dict[str, Dict[str, Any]] = {}
_C5_ROUTE_GEOS_BY_ID: Dict[str, Dict[str, Any]] = {}
_C5_STOPS_BY_CANONICAL_ID: Dict[str, Dict[str, Any]] = {}
_C5_STOPS_BY_NAME: Dict[str, Dict[str, Any]] = {}


def _load_c5_staging_data() -> None:
    """Loads and indexes C5 staging geometry and stop resolution files once per process."""
    global _C5_STAGING_LOADED, _C5_ROUTE_GEOS_BY_NUM, _C5_ROUTE_GEOS_BY_ID, _C5_STOPS_BY_CANONICAL_ID, _C5_STOPS_BY_NAME
    if _C5_STAGING_LOADED:
        return

    repo_root = Path(__file__).resolve().parent.parent.parent.parent
    geo_path = repo_root / "data" / "transport" / "staging" / "ama_bus" / "c5_route_geometry.json"
    stop_path = repo_root / "data" / "transport" / "staging" / "ama_bus" / "c5_stop_resolution.json"

    if geo_path.exists():
        try:
            with open(geo_path, "r", encoding="utf-8") as f:
                geos = json.load(f)
            for g in geos:
                r_num = str(g.get("route_number", "")).strip()
                r_id = str(g.get("route_id", "")).strip()
                if r_num:
                    _C5_ROUTE_GEOS_BY_NUM[r_num] = g
                if r_id:
                    _C5_ROUTE_GEOS_BY_ID[r_id] = g
        except Exception as e:
            logger.warning(f"Failed to load c5_route_geometry.json: {e}")

    if stop_path.exists():
        try:
            with open(stop_path, "r", encoding="utf-8") as f:
                stops = json.load(f)
            for s in stops:
                s_id = s.get("stop_id")
                if s_id:
                    _C5_STOPS_BY_CANONICAL_ID[s_id] = s
                c_name = s.get("canonical_name")
                if c_name:
                    _C5_STOPS_BY_NAME[c_name.lower().strip()] = s
        except Exception as e:
            logger.warning(f"Failed to load c5_stop_resolution.json: {e}")

    _C5_STAGING_LOADED = True


@dataclass
class RouteGeometryPayload:
    route_id: str
    route_number: str
    geometry_status: str  # EXACT, CORRIDOR, PARTIAL, NONE
    route_geometry_confidence: str  # VERIFIED_ROUTE_GEOMETRY, HIGH_CONFIDENCE_ROUTE_GEOMETRY, MEDIUM_CONFIDENCE_ROUTE_GEOMETRY, UNAVAILABLE
    geometry_render_status: str  # RENDERABLE_EXACT, RENDERABLE_ROAD_FOLLOWING, ANCHOR_ONLY, CORRIDOR_ONLY, UNAVAILABLE
    confidence: str  # CONFIRMED, SUPPORTED, UNAVAILABLE
    is_geometry_available: bool
    coordinates: List[Tuple[float, float]]  # List of [lat, lon]
    corridors: List[Dict[str, Any]]
    anchor_stops: List[Dict[str, Any]]
    segments: List[Dict[str, Any]] = field(default_factory=list)
    osm_relations_matched: List[int] = field(default_factory=list)
    suppressed_outliers: List[Dict[str, Any]] = field(default_factory=list)
    notes: Optional[str] = None


class DeterministicGeometryEngine:
    """Evaluates and builds deterministic geometry payloads for transit routes."""

    def __init__(self, session: Session):
        self.session = session
        _load_c5_staging_data()

    def get_route_geometry(self, route_id: UUID | str) -> Optional[RouteGeometryPayload]:
        """Produce the deterministic geometry payload for a route without fabrication."""
        route = None
        if isinstance(route_id, str):
            try:
                r_uuid = UUID(route_id)
                route = self.session.query(Route).filter(Route.id == r_uuid).first()
            except ValueError:
                route = (
                    self.session.query(Route)
                    .filter((Route.name == route_id) | (Route.name == route_id.upper()))
                    .first()
                )
        else:
            route = self.session.query(Route).filter(Route.id == route_id).first()

        if not route:
            return None

        # Parse service area / region
        route_region = None
        if route.notes:
            try:
                r_notes = json.loads(route.notes)
                route_region = r_notes.get("service_area")
            except Exception:
                pass

        # Load RouteIntelligence if available in DB
        ri = (
            self.session.query(RouteIntelligence)
            .filter(
                (RouteIntelligence.route_id == route.id)
                | (RouteIntelligence.route_number == route.name)
            )
            .first()
        )

        # Look up staged C5 route geometry
        c5_geo = _C5_ROUTE_GEOS_BY_NUM.get(route.name) or _C5_ROUTE_GEOS_BY_ID.get(str(route.id))

        # Load ordered stops
        route_stops = (
            self.session.query(RouteStop, Stop)
            .join(Stop, RouteStop.stop_id == Stop.id)
            .filter(RouteStop.route_id == route.id)
            .order_by(RouteStop.sequence_order)
            .all()
        )

        verified_coords: List[Tuple[float, float]] = []
        anchor_stops: List[Dict[str, Any]] = []
        suppressed_outliers: List[Dict[str, Any]] = []
        total_stops = len(route_stops)
        geocoded_count = 0

        for rs, s in route_stops:
            lat, lon = None, None
            coord_status = s.coordinate_status or "unresolved"
            coord_source = s.source

            # 1. Check if DB has verified location
            if s.location is not None:
                try:
                    shape = to_shape(s.location)
                    lon, lat = float(shape.x), float(shape.y)
                except Exception:
                    pass

            is_verified = (
                lat is not None
                and lon is not None
                and coord_status in ("official", "geocoded", "osm_verified", "VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL")
            )

            # 2. Check C5 resolution if DB coordinate is absent
            c5_res = _C5_STOPS_BY_CANONICAL_ID.get(s.canonical_stop_id) or _C5_STOPS_BY_NAME.get(s.name.lower().strip())
            c5_status = c5_res.get("resolution_status") if c5_res else None

            if not is_verified and c5_res:
                c_lat = c5_res.get("candidate_lat") or c5_res.get("existing_lat")
                c_lon = c5_res.get("candidate_lon") or c5_res.get("existing_lon")
                if c_lat is not None and c_lon is not None:
                    lat, lon = float(c_lat), float(c_lon)
                    coord_status = c5_status
                    coord_source = c5_res.get("candidate_source") or "c5_stop_resolution"
                    if c5_status in ("VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL"):
                        is_verified = True

            # 3. Regional Outlier Suppression Check
            if lat is not None and lon is not None:
                if not is_coordinate_in_region(lat, lon, route_region):
                    suppressed_outliers.append({
                        "stop_id": str(s.id),
                        "canonical_stop_id": s.canonical_stop_id,
                        "name": s.name,
                        "sequence_order": rs.sequence_order,
                        "raw_latitude": round(lat, 6),
                        "raw_longitude": round(lon, 6),
                        "region": route_region,
                        "suppression_reason": f"Cross-region outlier coordinate ({round(lat, 4)}, {round(lon, 4)}) outside {route_region or 'Odisha'} bounds.",
                    })
                    lat, lon = None, None
                    coord_status = "LOCALITY_ONLY"
                    coord_source = "suppressed_outlier"
                    is_verified = False

            # 4. Build anchor stop metadata with decoupled epistemic flags
            if is_verified and lat is not None and lon is not None:
                geocoded_count += 1
                verified_coords.append((round(lat, 6), round(lon, 6)))
                anchor_stops.append({
                    "stop_id": str(s.id),
                    "canonical_stop_id": s.canonical_stop_id,
                    "name": s.name,
                    "sequence_order": rs.sequence_order,
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "stop_resolution_status": "VERIFIED_OFFICIAL" if coord_status == "official" else (coord_status.upper() if coord_status else "VERIFIED_GEOSPATIAL"),
                    "render_exact_marker": True,
                    "render_candidate_marker": False,
                    "participates_in_first_mile": True,
                    "coordinate_source": coord_source,
                })
            elif coord_status == "CANDIDATE_HIGH" and lat is not None and lon is not None:
                anchor_stops.append({
                    "stop_id": str(s.id),
                    "canonical_stop_id": s.canonical_stop_id,
                    "name": s.name,
                    "sequence_order": rs.sequence_order,
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "stop_resolution_status": "CANDIDATE_HIGH",
                    "render_exact_marker": False,
                    "render_candidate_marker": True,
                    "participates_in_first_mile": False,
                    "coordinate_source": coord_source,
                })
            else:
                anchor_stops.append({
                    "stop_id": str(s.id),
                    "canonical_stop_id": s.canonical_stop_id,
                    "name": s.name,
                    "sequence_order": rs.sequence_order,
                    "latitude": None,
                    "longitude": None,
                    "stop_resolution_status": (c5_status.upper() if c5_status else (coord_status.upper() if coord_status else "LOCALITY_ONLY")),
                    "render_exact_marker": False,
                    "render_candidate_marker": False,
                    "participates_in_first_mile": False,
                    "coordinate_source": coord_source,
                })

        # Evaluate Route Geometry Confidence
        segments = []
        osm_relations = []
        corridor_roads = []
        if c5_geo:
            segments = c5_geo.get("segments", [])
            osm_relations = c5_geo.get("osm_relations_matched", [])
            corridor_roads = c5_geo.get("corridor_roads", [])

        if any(seg.get("geometry_status") == "VERIFIED_ROUTE_GEOMETRY" for seg in segments) or len(osm_relations) > 0:
            route_geo_conf = "VERIFIED_ROUTE_GEOMETRY"
        elif any(seg.get("geometry_status") == "HIGH_CONFIDENCE_ROUTE_GEOMETRY" for seg in segments):
            route_geo_conf = "HIGH_CONFIDENCE_ROUTE_GEOMETRY"
        elif any(seg.get("geometry_status") == "MEDIUM_CONFIDENCE_ROUTE_GEOMETRY" for seg in segments):
            route_geo_conf = "MEDIUM_CONFIDENCE_ROUTE_GEOMETRY"
        else:
            route_geo_conf = "UNAVAILABLE"

        # Evaluate legacy DB geometry status & overall confidence
        if ri and ri.geometry_status:
            legacy_geo_status = ri.geometry_status
            confidence = ri.overall_confidence
        else:
            if total_stops >= 2 and geocoded_count == total_stops:
                legacy_geo_status = "EXACT"
                confidence = "CONFIRMED"
            elif geocoded_count >= 2:
                legacy_geo_status = "CORRIDOR"
                confidence = "CONFIRMED"
            elif geocoded_count == 1:
                legacy_geo_status = "PARTIAL"
                confidence = "SUPPORTED"
            else:
                legacy_geo_status = "NONE"
                confidence = "SUPPORTED"

        # Determine geometry_render_status & fail-closed coordinate emission
        is_fully_exact = (total_stops >= 2 and geocoded_count == total_stops)
        has_anchor_pins = any(a.get("latitude") is not None for a in anchor_stops)

        if legacy_geo_status == "EXACT" and is_fully_exact:
            render_status = "RENDERABLE_EXACT"
            final_coords = verified_coords
            is_avail = True
            notes = "Full verified sequence geometry available."
        elif has_anchor_pins:
            render_status = "ANCHOR_ONLY"
            final_coords = []  # Fail-closed! Do not connect stops across unresolved gaps!
            is_avail = False
            notes = "Discrete anchor stops available; connecting polyline suppressed across unresolved stops to prevent straight-line distortion."
        elif len(corridor_roads) > 0:
            render_status = "CORRIDOR_ONLY"
            final_coords = []
            is_avail = False
            notes = "Route alignment established along arterial road corridor. Connecting polyline suppressed."
        else:
            render_status = "UNAVAILABLE"
            final_coords = []
            is_avail = False
            notes = "No geographic coordinates or road corridor available for this route."

        # Corridors list
        corridors: List[Dict[str, Any]] = []
        if ri:
            corridor_records = (
                self.session.query(RouteCorridorIntelligence)
                .filter(RouteCorridorIntelligence.route_intelligence_id == ri.id)
                .order_by(RouteCorridorIntelligence.sequence)
                .all()
            )
            for c in corridor_records:
                corridors.append({
                    "sequence": c.sequence,
                    "from_label": c.from_label,
                    "to_label": c.to_label,
                    "road_names": c.road_names,
                    "major_junctions": c.major_junctions,
                    "landmarks": c.landmarks,
                    "status": c.status,
                    "confidence": c.confidence,
                })
        if not corridors and corridor_roads:
            for idx, road in enumerate(corridor_roads):
                corridors.append({
                    "sequence": idx + 1,
                    "road_names": [road],
                    "status": "active",
                    "confidence": "HIGH" if route_geo_conf == "HIGH_CONFIDENCE_ROUTE_GEOMETRY" else "MEDIUM",
                })

        return RouteGeometryPayload(
            route_id=str(route.id),
            route_number=route.name,
            geometry_status=legacy_geo_status,
            route_geometry_confidence=route_geo_conf,
            geometry_render_status=render_status,
            confidence=confidence,
            is_geometry_available=is_avail,
            coordinates=final_coords,
            corridors=corridors,
            anchor_stops=anchor_stops,
            segments=segments,
            osm_relations_matched=osm_relations,
            suppressed_outliers=suppressed_outliers,
            notes=notes,
        )

