"""
Deterministic Snap-to-Road and Geometry Assembly Engine for Phase 6A.

Assembles route geometry payload strictly according to verified stop coordinates,
road corridor intelligence, and geometry readiness classification:
- EXACT: All stop sequence endpoints are verified (returns exact coordinate path).
- CORRIDOR: Arterial highways and anchor junctions identified (returns corridor intelligence, no fake line).
- PARTIAL: Only verified anchor stop coordinates returned.
- NONE: No coordinates or route line generated (returns empty geometry).

PROHIBITIONS:
- Never generates straight-line interpolation across unverified stops.
- Never fabricates coordinates or intermediate waypoints.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from geoalchemy2.shape import to_shape
from sqlalchemy.orm import Session

from app.models.transport import Route, RouteStop, Stop
from app.models.transit_intelligence import RouteIntelligence, RouteCorridorIntelligence, StopIntelligence


@dataclass
class RouteGeometryPayload:
    route_id: str
    route_number: str
    geometry_status: str  # EXACT, CORRIDOR, PARTIAL, NONE
    confidence: str
    is_geometry_available: bool
    coordinates: List[Tuple[float, float]]  # List of [lon, lat] or [lat, lon]
    corridors: List[Dict[str, Any]]
    anchor_stops: List[Dict[str, Any]]
    notes: Optional[str] = None


class DeterministicGeometryEngine:
    """Evaluates and builds deterministic geometry payloads for transit routes."""

    def __init__(self, session: Session):
        self.session = session

    def get_route_geometry(self, route_id: UUID | str) -> Optional[RouteGeometryPayload]:
        """Produce the deterministic geometry payload for a route without fabrication."""
        if isinstance(route_id, str):
            try:
                r_uuid = UUID(route_id)
            except ValueError:
                return None
        else:
            r_uuid = route_id

        route = self.session.query(Route).filter(Route.id == r_uuid).first()
        if not route:
            return None

        # Load RouteIntelligence if available
        ri = (
            self.session.query(RouteIntelligence)
            .filter(
                (RouteIntelligence.route_id == route.id)
                | (RouteIntelligence.route_number == route.name)
            )
            .first()
        )

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
        total_stops = len(route_stops)
        geocoded_count = 0

        for rs, s in route_stops:
            lat, lon = None, None
            if s.location is not None:
                try:
                    shape = to_shape(s.location)
                    lon, lat = float(shape.x), float(shape.y)
                except Exception:
                    pass

            is_verified = (lat is not None and lon is not None and s.coordinate_status in ("official", "geocoded", "osm_verified"))
            if is_verified:
                geocoded_count += 1
                verified_coords.append((round(lat, 6), round(lon, 6)))
                anchor_stops.append({
                    "stop_id": str(s.id),
                    "name": s.name,
                    "sequence_order": rs.sequence_order,
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "status": "verified",
                })
            else:
                anchor_stops.append({
                    "stop_id": str(s.id),
                    "name": s.name,
                    "sequence_order": rs.sequence_order,
                    "latitude": None,
                    "longitude": None,
                    "status": "unresolved",
                })

        # Determine geometry status
        if ri and ri.geometry_status:
            geo_status = ri.geometry_status
            confidence = ri.overall_confidence
        else:
            if total_stops > 2 and geocoded_count == total_stops:
                geo_status = "EXACT"
                confidence = "CONFIRMED"
            elif geocoded_count >= 2:
                geo_status = "CORRIDOR"
                confidence = "CONFIRMED"
            elif geocoded_count == 1:
                geo_status = "PARTIAL"
                confidence = "SUPPORTED"
            else:
                geo_status = "NONE"
                confidence = "SUPPORTED"

        # Load corridor records
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

        # Apply strict coordinate inclusion rule
        if geo_status == "EXACT":
            final_coords = verified_coords
            is_avail = len(final_coords) > 0
            notes = "Full verified sequence geometry available."
        elif geo_status == "CORRIDOR":
            # For CORRIDOR, do NOT emit straight line coordinates that mislead users
            final_coords = []
            is_avail = False
            notes = "Route alignment established along arterial corridor. Individual stop sequence coordinates unresolved."
        elif geo_status == "PARTIAL":
            # Emit only verified anchor points
            final_coords = verified_coords
            is_avail = False
            notes = "Partial stop coordinates verified. Intermediate geometry incomplete."
        else:
            final_coords = []
            is_avail = False
            notes = "No geographic coordinates available for this route."

        return RouteGeometryPayload(
            route_id=str(route.id),
            route_number=route.name,
            geometry_status=geo_status,
            confidence=confidence,
            is_geometry_available=is_avail,
            coordinates=final_coords,
            corridors=corridors,
            anchor_stops=anchor_stops,
            notes=notes,
        )
