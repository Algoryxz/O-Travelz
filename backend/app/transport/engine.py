"""
Transit Query Engine and Geospatial Stop Resolution Service.

Implements:
- Nearest stop discovery via PostGIS geography distance or Haversine fallback.
- Walking estimate calculations based on standard pedestrian transit pace (~4.8 km/h = 80 m/min).
- Route-stop graph queries and serving routes aggregation.
- Transport map contract generation for frontend rendering.
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from geoalchemy2 import Geography, Geometry
from geoalchemy2.shape import to_shape
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.transport import (
    DataTier,
    Route,
    RouteStop,
    ScheduledTripGroup,
    Stop,
    TransportProvider,
)


REGION_CITY_MAP = {
    "capital region": {"bhubaneswar", "cuttack", "puri", "khordha", "jatani", "pipili"},
    "rourkela": {"rourkela", "sundargarh"},
    "sambalpur": {"sambalpur", "jharsuguda", "burla", "hirakud"},
    "berhampur": {"berhampur", "brahmapur", "ganjam", "chhatrapur"},
    "keonjhar": {"keonjhar", "kendujhar"},
}


def matches_region_filter(target: str | None, requested_region: str) -> bool:
    if not target or not requested_region:
        return True
    req = requested_region.lower().strip()
    tgt = target.lower().strip()
    if req in tgt or tgt in req:
        return True
    if req in REGION_CITY_MAP and tgt in REGION_CITY_MAP[req]:
        return True
    return False


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in meters between two lat/lon points."""
    r = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def walking_time_minutes(distance_meters: float, walking_speed_m_per_min: float = 80.0) -> int:
    """Calculate walking estimate in minutes (80m/min ~ 4.8 km/h)."""
    return max(1, math.ceil(distance_meters / walking_speed_m_per_min))


class TransitEngine:
    def __init__(self, session: Session):
        self.session = session

    def find_nearby_stops(
        self,
        latitude: float,
        longitude: float,
        radius_meters: float = 2000.0,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """
        Find stops within radius_meters of (latitude, longitude), sorted by distance.
        Uses native PostGIS ST_DWithin and ST_Distance with batch serving routes loading.
        Includes routes serving each stop and walking estimate.
        """
        bind = self.session.get_bind()
        is_postgres = bind.dialect.name == "postgresql"

        stops_with_dist: list[tuple[Stop, float, float, float]] = []  # (stop, dist, lat, lon)

        if is_postgres:
            point_geom = func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)
            point_geog = func.cast(point_geom, Geography)

            query = (
                self.session.query(
                    Stop,
                    func.ST_Distance(Stop.location, point_geog).label("distance_m"),
                    func.ST_Y(func.cast(Stop.location, Geometry)).label("lat"),
                    func.ST_X(func.cast(Stop.location, Geometry)).label("lon"),
                )
                .filter(
                    Stop.location.isnot(None),
                    Stop.coordinate_status.in_(["official", "geocoded"]),
                    func.ST_DWithin(Stop.location, point_geog, radius_meters),
                )
                .order_by("distance_m")
                .limit(limit)
            )

            for stop, dist, stop_lat, stop_lon in query.all():
                stops_with_dist.append((stop, float(dist), float(stop_lat), float(stop_lon)))
        else:
            stops = self.session.query(Stop).filter(
                Stop.location.isnot(None),
                Stop.coordinate_status.in_(["official", "geocoded"]),
            ).all()

            for stop in stops:
                try:
                    shape = to_shape(stop.location)
                    stop_lon, stop_lat = shape.x, shape.y
                except Exception:
                    continue

                dist = haversine_distance_meters(latitude, longitude, stop_lat, stop_lon)
                if dist <= radius_meters:
                    stops_with_dist.append((stop, dist, stop_lat, stop_lon))

            stops_with_dist.sort(key=lambda item: item[1])
            stops_with_dist = stops_with_dist[:limit]

        if not stops_with_dist:
            # Fallback to CanonicalTransitRepository in-memory index
            try:
                from app.transport.canonical_repository import get_canonical_transit_repository
                repo = get_canonical_transit_repository()
                routable_nearby = repo.find_nearest_routable_stops(latitude, longitude, radius_meters, limit)
                res = []
                for s, dist in routable_nearby:
                    routes_serving = [
                        {
                            "route_id": r.route_id,
                            "route_number": r.route_number,
                            "route_name": r.route_name,
                            "service_area": r.region,
                            "origin": r.origin_name,
                            "destination": r.destination_name,
                        }
                        for r in repo.get_routes_for_stop(s.stop_id)
                    ]
                    if not routes_serving:
                        continue
                    res.append({
                        "stop_id": s.stop_id,
                        "name": s.canonical_name,
                        "published_name": s.published_name,
                        "canonical_stop_id": s.stop_id,
                        "city": s.city,
                        "district": s.district,
                        "locality": s.locality,
                        "latitude": round(s.lat, 6) if s.lat is not None else None,
                        "longitude": round(s.lon, 6) if s.lon is not None else None,
                        "coordinate_status": s.coordinate_status.lower(),
                        "distance_m": round(dist, 1),
                        "walking_estimate_mins": walking_time_minutes(dist),
                        "routes_serving_stop": routes_serving,
                        "region": s.city or "Odisha",
                    })
                return res
            except Exception:
                return []

        # Batch load serving routes for all matching stop IDs in a single query (N+1 query elimination)
        stop_ids = [s[0].id for s in stops_with_dist]
        routes_query = (
            self.session.query(RouteStop.stop_id, Route, RouteStop.sequence_order)
            .join(Route, RouteStop.route_id == Route.id)
            .filter(RouteStop.stop_id.in_(stop_ids))
            .all()
        )

        routes_by_stop: dict[UUID, list[dict[str, Any]]] = {}
        for s_id, route, seq in routes_query:
            notes = {}
            if route.notes:
                try:
                    notes = json.loads(route.notes)
                except Exception:
                    pass
            routes_by_stop.setdefault(s_id, []).append({
                "route_id": str(route.id),
                "route_number": route.name,
                "route_name": route.route_name,
                "sequence_order": seq,
                "service_area": notes.get("service_area"),
                "origin": notes.get("origin"),
                "destination": notes.get("destination"),
            })

        results = []
        for stop, dist, stop_lat, stop_lon in stops_with_dist:
            stop_notes = {}
            if stop.notes:
                try:
                    stop_notes = json.loads(stop.notes)
                except Exception:
                    pass

            serving_routes = routes_by_stop.get(stop.id, [])
            if not serving_routes:
                continue

            results.append({
                "stop_id": str(stop.id),
                "name": stop.name,
                "published_name": stop.published_name or stop.name,
                "canonical_stop_id": stop.canonical_stop_id,
                "city": stop_notes.get("city"),
                "district": stop_notes.get("district"),
                "locality": stop_notes.get("locality"),
                "latitude": round(stop_lat, 6),
                "longitude": round(stop_lon, 6),
                "coordinate_status": stop.coordinate_status,
                "distance_m": round(dist, 1),
                "walking_estimate_mins": walking_time_minutes(dist),
                "routes_serving_stop": serving_routes,
                "region": stop_notes.get("city") or "Odisha",
            })

        return results


    def get_transport_map_data(self, region: str | None = None) -> dict[str, Any]:
        """
        Generate map data bundle for frontend transit visualization.
        """
        routes_query = self.session.query(Route)
        routes = routes_query.all()
        # Load RouteIntelligence lookups in batch
        from app.models.transit_intelligence import RouteIntelligence, RouteCorridorIntelligence

        ri_by_num: dict[str, RouteIntelligence] = {}
        for ri in self.session.query(RouteIntelligence).all():
            ri_by_num[ri.route_number] = ri

        # Map routes with ordered stops and intelligence
        map_routes = []
        for r in routes:
            notes = {}
            if r.notes:
                try:
                    notes = json.loads(r.notes)
                except Exception:
                    pass
            route_region = notes.get("service_area")
            if region and not matches_region_filter(route_region, region):
                continue

            ri = ri_by_num.get(r.name)

            route_stops = (
                self.session.query(RouteStop, Stop)
                .join(Stop, RouteStop.stop_id == Stop.id)
                .filter(RouteStop.route_id == r.id)
                .order_by(RouteStop.sequence_order)
                .all()
            )

            stops_list = []
            verified_coords = []
            for rs, s in route_stops:
                lat, lon = None, None
                if s.location is not None:
                    try:
                        shape = to_shape(s.location)
                        lon, lat = shape.x, shape.y
                    except Exception:
                        pass

                if lat is not None and lon is not None:
                    verified_coords.append([round(lat, 6), round(lon, 6)])

                stops_list.append({
                    "stop_id": str(s.id),
                    "stop_name": s.name,
                    "published_name": s.published_name,
                    "sequence_order": rs.sequence_order,
                    "latitude": round(lat, 6) if lat is not None else None,
                    "longitude": round(lon, 6) if lon is not None else None,
                    "coordinate_status": s.coordinate_status or "unresolved",
                })

            geo_status = ri.geometry_status if ri else ("EXACT" if len(stops_list) > 2 and len(verified_coords) == len(stops_list) else "NONE")
            confidence = ri.overall_confidence if ri else "SUPPORTED"

            corridors_list = []
            if ri and ri.corridors:
                for c in ri.corridors:
                    corridors_list.append({
                        "sequence": c.sequence,
                        "from_label": c.from_label,
                        "to_label": c.to_label,
                        "road_names": c.road_names,
                        "major_junctions": c.major_junctions,
                        "landmarks": c.landmarks,
                        "status": c.status,
                    })

            map_routes.append({
                "route_id": str(r.id),
                "route_number": r.name,
                "route_name": r.route_name,
                "region": route_region,
                "origin": notes.get("origin"),
                "destination": notes.get("destination"),
                "via": notes.get("via"),
                "geometry_status": geo_status,
                "overall_confidence": confidence,
                "is_geometry_available": (geo_status == "EXACT"),
                "verified_coordinates": verified_coords if geo_status == "EXACT" else [],
                "corridors": corridors_list,
                "stops_count": len(stops_list),
                "stops": stops_list,
            })

        # All geocoded stops for map markers
        all_stops = self.session.query(Stop).all()
        map_stops = []
        for s in all_stops:
            lat, lon = None, None
            if s.location is not None:
                try:
                    shape = to_shape(s.location)
                    lon, lat = shape.x, shape.y
                except Exception:
                    pass

            s_notes = {}
            if s.notes:
                try:
                    s_notes = json.loads(s.notes)
                except Exception:
                    pass

            s_city = s_notes.get("city")
            if region and not matches_region_filter(s_city, region):
                continue

            map_stops.append({
                "stop_id": str(s.id),
                "name": s.name,
                "published_name": s.published_name or s.name,
                "city": s_city,
                "latitude": round(lat, 6) if lat is not None else None,
                "longitude": round(lon, 6) if lon is not None else None,
                "coordinate_status": s.coordinate_status or "unresolved",
            })

        return {
            "total_routes": len(map_routes),
            "total_stops": len(map_stops),
            "routes": map_routes,
            "stops": map_stops,
        }

    def list_routes(
        self,
        region: str | None = None,
        query: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> dict[str, Any]:
        """List routes with filtering and pagination."""
        q = self.session.query(Route)
        if query:
            q = q.filter(or_(
                Route.name.ilike(f"%{query}%"),
                Route.route_name.ilike(f"%{query}%"),
            ))

        all_routes = q.all()
        filtered = []
        for r in all_routes:
            notes = {}
            if r.notes:
                try:
                    notes = json.loads(r.notes)
                except Exception:
                    pass
            route_region = notes.get("service_area")
            if region and route_region and region.lower() not in route_region.lower():
                continue

            filtered.append({
                "route_id": str(r.id),
                "route_number": r.name,
                "route_name": r.route_name,
                "region": route_region,
                "origin": notes.get("origin"),
                "destination": notes.get("destination"),
                "via": notes.get("via"),
                "source_document": r.source,
            })

        total = len(filtered)
        if total == 0:
            # Fallback to canonical repository
            try:
                from app.transport.canonical_repository import get_canonical_transit_repository
                repo = get_canonical_transit_repository()
                c_routes = repo.list_routes(region=region, query=query)
                c_list = [
                    {
                        "route_id": r.route_id,
                        "route_number": r.route_number,
                        "route_name": r.route_name,
                        "region": r.region,
                        "origin": r.origin_name,
                        "destination": r.destination_name,
                        "via": "",
                        "source_document": f"CRUT Canonical {r.region} Schedule",
                    }
                    for r in c_routes
                ]
                return {
                    "total": len(c_list),
                    "limit": limit,
                    "offset": offset,
                    "routes": c_list[offset:offset + limit],
                }
            except Exception:
                pass

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "routes": filtered[offset:offset + limit],
        }

    def get_route_detail(self, route_id: str) -> dict[str, Any] | None:
        """Get full details of a route, its sequence of stops, and its schedules."""
        route = None
        try:
            r_uuid = UUID(route_id)
            route = self.session.query(Route).filter(Route.id == r_uuid).first()
        except ValueError:
            route = None

        if route is None:
            # Fallback to canonical repository
            try:
                from app.transport.canonical_repository import get_canonical_transit_repository
                repo = get_canonical_transit_repository()
                c_route = repo.get_route(route_id)
                if not c_route:
                    return None

                seqs = repo.get_sequences_for_route(c_route.route_id)
                stops_list = []
                if seqs:
                    for item in seqs[0].stops:
                        st = repo.get_stop(item.stop_id)
                        stops_list.append({
                            "stop_id": item.stop_id,
                            "name": st.canonical_name if st else item.stop_name,
                            "sequence_order": item.sequence,
                            "latitude": round(st.lat, 6) if (st and st.lat is not None) else None,
                            "longitude": round(st.lon, 6) if (st and st.lon is not None) else None,
                            "coordinate_status": st.coordinate_status.lower() if st else "unresolved",
                        })

                schedules = repo.get_schedules_for_route(c_route.route_id)
                sched_list = [
                    {
                        "schedule_id": sc.schedule_id,
                        "group_label": f"{sc.start_point} to {sc.end_point}",
                        "terminus": sc.end_point,
                        "total_trips": len(sc.departure_times),
                        "departure_times": sc.departure_times,
                        "source_document": "CRUT Official Timetable PDF",
                        "effective_date": "2026-08-21",
                    }
                    for sc in schedules
                ]

                return {
                    "route_id": c_route.route_id,
                    "route_number": c_route.route_number,
                    "route_name": c_route.route_name,
                    "region": c_route.region,
                    "origin": c_route.origin_name,
                    "destination": c_route.destination_name,
                    "via": "",
                    "geometry_status": "NONE",
                    "overall_confidence": "SUPPORTED",
                    "is_geometry_available": False,
                    "corridors": [],
                    "source_document": "CRUT Official Timetable PDF",
                    "effective_date": "2026-08-21",
                    "stops": stops_list,
                    "schedules": sched_list,
                }
            except Exception:
                return None

        notes = {}
        if route.notes:
            try:
                notes = json.loads(route.notes)
            except Exception:
                pass

        # Load stops
        route_stops = (
            self.session.query(RouteStop, Stop)
            .join(Stop, RouteStop.stop_id == Stop.id)
            .filter(RouteStop.route_id == route.id)
            .order_by(RouteStop.sequence_order)
            .all()
        )

        stops = []
        for rs, s in route_stops:
            lat, lon = None, None
            if s.location is not None:
                try:
                    shape = to_shape(s.location)
                    lon, lat = shape.x, shape.y
                except Exception:
                    pass

            stops.append({
                "stop_id": str(s.id),
                "name": s.name,
                "sequence_order": rs.sequence_order,
                "latitude": round(lat, 6) if lat is not None else None,
                "longitude": round(lon, 6) if lon is not None else None,
                "coordinate_status": s.coordinate_status,
            })

        # Load schedules
        schedules = (
            self.session.query(ScheduledTripGroup)
            .filter(ScheduledTripGroup.route_id == route.id)
            .all()
        )

        sched_list = []
        for sc in schedules:
            sc_notes = {}
            if sc.notes:
                try:
                    sc_notes = json.loads(sc.notes)
                except Exception:
                    pass
            sched_list.append({
                "schedule_id": str(sc.id),
                "group_label": sc.group_label,
                "terminus": sc_notes.get("terminus"),
                "total_trips": sc_notes.get("total_trips", len(sc.departure_times_source_order or [])),
                "departure_times": sc.departure_times_chronological or sc.departure_times_source_order or [],
                "source_document": sc.source,
                "effective_date": sc.effective_date.isoformat() if sc.effective_date else None,
            })

        # Load geometry and corridor intelligence
        from app.transport.geometry_engine import DeterministicGeometryEngine

        geo_engine = DeterministicGeometryEngine(self.session)
        geo_payload = geo_engine.get_route_geometry(route.id)

        return {
            "route_id": str(route.id),
            "route_number": route.name,
            "route_name": route.route_name,
            "region": notes.get("service_area"),
            "origin": notes.get("origin"),
            "destination": notes.get("destination"),
            "via": notes.get("via"),
            "geometry_status": geo_payload.geometry_status if geo_payload else "NONE",
            "overall_confidence": geo_payload.confidence if geo_payload else "SUPPORTED",
            "is_geometry_available": geo_payload.is_geometry_available if geo_payload else False,
            "corridors": geo_payload.corridors if geo_payload else [],
            "source_document": route.source,
            "effective_date": route.effective_date.isoformat() if route.effective_date else None,
            "stops": stops,
            "schedules": sched_list,
        }
