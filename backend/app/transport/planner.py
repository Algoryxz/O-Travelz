"""
Multimodal Journey Planning Engine for Odisha Transit.

Orchestrates:
📍 Origin -> 🚶 Walk -> 🚌 Board Transit -> 🚌 Transit Leg [-> 🔄 Transfer Hub -> 🚌 Transit Leg 2] -> 🍴 Optional Food Waypoint -> 🏁 Destination

Strict Principles:
- Uses verified transport graph and sequence order
- Supports direct routes (0 transfers) and 1-transfer routes through Canonical Hubs
- Deterministic schedule-aware departure selection and transfer timing validation
- Never fabricates coordinates, ratings, schedules, or road geometry
- Clean fallback when boarding stops, paths, or food candidates are unavailable
"""
from __future__ import annotations

import json
import math
import uuid
from dataclasses import dataclass, field
from typing import Any, List, Optional
from uuid import UUID

from geoalchemy2 import Geography
from geoalchemy2.shape import to_shape
from sqlalchemy import func
from sqlalchemy.orm import Session


from app.models.place import Place
from app.models.transport import Route, RouteStop, ScheduledTripGroup, Stop
from app.transport.corridor_food import CorridorFoodService
from app.transport.engine import haversine_distance_meters, walking_time_minutes
from app.transport.hubs import expand_stops_with_canonical_hubs, get_canonical_hub_for_stop, CANONICAL_HUBS, _is_valid_uuid

# Default assumptions & constants
DEFAULT_WALKING_SPEED_M_PER_MIN = 80.0  # 4.8 km/h
DEFAULT_MINS_PER_TRANSIT_STOP = 3  # Average headway/inter-stop duration
DEFAULT_TRANSFER_BUFFER_MINS = 10  # Minimum buffer required for safe transfer at interchange hubs


def parse_time_to_minutes(time_str: Optional[str]) -> Optional[int]:
    """Parse 'HH:MM' or 'H:MM' string into minutes from midnight (0..1439)."""
    if not time_str or not isinstance(time_str, str):
        return None
    time_str = time_str.strip()
    parts = time_str.split(":")
    if len(parts) != 2:
        return None
    try:
        hours = int(parts[0])
        mins = int(parts[1])
        if 0 <= hours <= 23 and 0 <= mins <= 59:
            return hours * 60 + mins
        return None
    except ValueError:
        return None


def format_minutes_to_time(total_minutes: Optional[int]) -> Optional[str]:
    """Format minutes from midnight (0..1439+) to 'HH:MM' string."""
    if total_minutes is None:
        return None
    norm_mins = total_minutes % (24 * 60)
    hours = norm_mins // 60
    mins = norm_mins % 60
    return f"{hours:02d}:{mins:02d}"


def find_next_departure_minutes(departures: list[str], min_time_mins: int) -> Optional[int]:
    """Find the earliest scheduled departure at or after min_time_mins."""
    valid_deps: list[int] = []
    for d_str in departures:
        d_mins = parse_time_to_minutes(d_str)
        if d_mins is not None and d_mins >= min_time_mins:
            valid_deps.append(d_mins)
    if valid_deps:
        return min(valid_deps)
    return None


@dataclass
class WalkingLeg:
    leg_type: str = "walk"  # "walk_to_transit" | "transfer_walk" | "walk_to_destination"
    from_name: str = ""
    to_name: str = ""
    distance_m: int = 0
    estimated_duration_mins: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "leg_type": self.leg_type,
            "from_name": self.from_name,
            "to_name": self.to_name,
            "distance_m": self.distance_m,
            "estimated_duration_mins": self.estimated_duration_mins,
        }


@dataclass
class TransitLeg:
    route_id: str
    route_number: str
    route_name: Optional[str]
    service_area: Optional[str]
    boarding_stop_id: str
    boarding_stop_name: str
    boarding_sequence: int
    alighting_stop_id: str
    alighting_stop_name: str
    alighting_sequence: int
    stop_count: int
    scheduled_departures: List[str]
    estimated_transit_mins: int
    selected_departure: Optional[str] = None
    estimated_arrival: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "route_id": self.route_id,
            "route_number": self.route_number,
            "route_name": self.route_name,
            "service_area": self.service_area,
            "boarding_stop_id": self.boarding_stop_id,
            "boarding_stop_name": self.boarding_stop_name,
            "boarding_sequence": self.boarding_sequence,
            "alighting_stop_id": self.alighting_stop_id,
            "alighting_stop_name": self.alighting_stop_name,
            "alighting_sequence": self.alighting_sequence,
            "stop_count": self.stop_count,
            "scheduled_departures": self.scheduled_departures,
            "estimated_transit_mins": self.estimated_transit_mins,
            "selected_departure": self.selected_departure,
            "estimated_arrival": self.estimated_arrival,
        }


@dataclass
class JourneyFoodWaypoint:
    place_id: str
    research_id: str
    name: str
    food_category: Optional[str]
    cuisine: Optional[str]
    speciality_dishes: List[str]
    dietary_tags: List[str]
    corridor_status: str
    distance_from_corridor_m: float
    estimated_detour_minutes: int
    rating: Optional[float]
    rating_source: Optional[str]
    source: str
    verification_status: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "place_id": self.place_id,
            "research_id": self.research_id,
            "name": self.name,
            "food_category": self.food_category,
            "cuisine": self.cuisine,
            "speciality_dishes": self.speciality_dishes,
            "dietary_tags": self.dietary_tags,
            "corridor_status": self.corridor_status,
            "distance_from_corridor_m": round(self.distance_from_corridor_m, 1),
            "estimated_detour_minutes": self.estimated_detour_minutes,
            "rating": self.rating,
            "rating_source": self.rating_source,
            "source": self.source,
            "verification_status": self.verification_status,
        }


@dataclass
class MultimodalJourneyResult:
    journey_id: str
    status: str  # SUCCESS | NO_VERIFIED_BOARDING_STOP | NO_TRANSIT_PATH | DESTINATION_UNREACHABLE
    origin: dict[str, Any]
    destination: dict[str, Any]
    walking_legs: List[WalkingLeg]
    transit_legs: List[TransitLeg]
    food_waypoint: Optional[JourneyFoodWaypoint]
    total_estimated_duration_minutes: int
    warnings: List[str]
    journey_type: str = "direct"  # "direct" | "1_transfer"
    transfer_count: int = 0  # 0 | 1
    transfer_hub: Optional[str] = None
    transfer_wait_minutes: int = 0
    departure_time: Optional[str] = None
    estimated_arrival_time: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "journey_id": self.journey_id,
            "status": self.status,
            "journey_type": self.journey_type,
            "transfer_count": self.transfer_count,
            "transfer_hub": self.transfer_hub,
            "transfer_wait_minutes": self.transfer_wait_minutes,
            "departure_time": self.departure_time,
            "estimated_arrival_time": self.estimated_arrival_time,
            "origin": self.origin,
            "destination": self.destination,
            "walking_legs": [w.to_dict() for w in self.walking_legs],
            "transit_legs": [t.to_dict() for t in self.transit_legs],
            "food_waypoint": self.food_waypoint.to_dict() if self.food_waypoint else None,
            "total_estimated_duration_minutes": self.total_estimated_duration_minutes,
            "warnings": self.warnings,
        }


class MultimodalJourneyPlanner:
    def __init__(self, session: Session):
        self.session = session

    def _find_verified_nearby_stops(self, lat: float, lon: float, max_radius_m: float) -> list[tuple[Stop, float]]:
        """Find verified stops with coordinates within max_radius_m, sorted by distance using PostGIS."""
        bind = self.session.get_bind()
        is_postgres = bind.dialect.name == "postgresql"

        if is_postgres:
            point_geom = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)
            point_geog = func.cast(point_geom, Geography)

            query = (
                self.session.query(
                    Stop,
                    func.ST_Distance(Stop.location, point_geog).label("distance_m"),
                )
                .filter(
                    Stop.location.isnot(None),
                    Stop.coordinate_status.in_(["official", "verified", "geocoded"]),
                    func.ST_DWithin(Stop.location, point_geog, max_radius_m),
                )
                .order_by("distance_m")
            )

            return [(stop, float(dist)) for stop, dist in query.all()]
        else:
            stops = self.session.query(Stop).filter(
                Stop.location.isnot(None),
                Stop.coordinate_status.in_(["official", "verified", "geocoded"]),
            ).all()

            results = []
            for stop in stops:
                try:
                    shape = to_shape(stop.location)
                    dist = haversine_distance_meters(lat, lon, shape.y, shape.x)
                    if dist <= max_radius_m:
                        results.append((stop, dist))
                except Exception:
                    continue

            results.sort(key=lambda item: item[1])
            return results


    def _get_route_departures(self, route_id: UUID) -> list[str]:
        """Extract all unique, chronological departure times for a given route."""
        schedules = (
            self.session.query(ScheduledTripGroup)
            .filter(ScheduledTripGroup.route_id == route_id)
            .all()
        )
        departures: list[str] = []
        for sg in schedules:
            if sg.departure_times_chronological:
                deps = sg.departure_times_chronological
                if isinstance(deps, str):
                    try:
                        deps = json.loads(deps)
                    except Exception:
                        deps = []
                if isinstance(deps, list):
                    departures.extend([str(d) for d in deps])
        return sorted(list(set(departures)), key=lambda s: parse_time_to_minutes(s) or 0)

    def plan_journey(
        self,
        origin_lat: float,
        origin_lon: float,
        destination_lat: Optional[float] = None,
        destination_lon: Optional[float] = None,
        destination_place_id: Optional[str] = None,
        destination_stop_id: Optional[str] = None,
        max_walking_distance_m: float = 2500.0,
        include_food: bool = True,
        food_category: Optional[str] = None,
        dietary_tag: Optional[str] = None,
        cuisine: Optional[str] = None,
        max_food_detour_m: float = 2500.0,
        requested_departure_time: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Plan a deterministic multimodal journey from origin to destination.
        Supports direct routes and schedule-aware 1-transfer routes through Canonical Hubs.
        """
        journey_id = str(uuid.uuid4())
        warnings: list[str] = []

        # 1. Resolve Origin
        origin_dict = {
            "latitude": round(origin_lat, 6),
            "longitude": round(origin_lon, 6),
            "resolved_name": "Origin GPS Point",
        }

        verified_b_stops = self._find_verified_nearby_stops(origin_lat, origin_lon, max_walking_distance_m)
        if not verified_b_stops:
            return MultimodalJourneyResult(
                journey_id=journey_id,
                status="NO_VERIFIED_BOARDING_STOP",
                origin=origin_dict,
                destination={"latitude": destination_lat, "longitude": destination_lon},
                walking_legs=[],
                transit_legs=[],
                food_waypoint=None,
                total_estimated_duration_minutes=0,
                warnings=[f"No verified transit stops found within {int(max_walking_distance_m)}m of origin."],
            ).to_dict()

        boarding_stops = expand_stops_with_canonical_hubs(self.session, verified_b_stops)

        # 2. Resolve Destination
        dest_lat, dest_lon = destination_lat, destination_lon
        dest_name = "Destination Point"

        if destination_place_id:
            try:
                p_uuid = UUID(destination_place_id)
                place = self.session.query(Place).filter(Place.id == p_uuid).first()
                if place and place.location is not None:
                    shape = to_shape(place.location)
                    dest_lat, dest_lon = shape.y, shape.x
                    dest_name = place.name
                else:
                    return MultimodalJourneyResult(
                        journey_id=journey_id,
                        status="DESTINATION_UNREACHABLE",
                        origin=origin_dict,
                        destination={"place_id": destination_place_id, "resolved_name": getattr(place, 'name', 'Unknown')},
                        walking_legs=[],
                        transit_legs=[],
                        food_waypoint=None,
                        total_estimated_duration_minutes=0,
                        warnings=["Destination place has unverified or missing coordinates."],
                    ).to_dict()
            except ValueError:
                return MultimodalJourneyResult(
                    journey_id=journey_id,
                    status="DESTINATION_UNREACHABLE",
                    origin=origin_dict,
                    destination={"place_id": destination_place_id},
                    walking_legs=[],
                    transit_legs=[],
                    food_waypoint=None,
                    total_estimated_duration_minutes=0,
                    warnings=["Invalid destination_place_id format."],
                ).to_dict()

        elif destination_stop_id:
            try:
                s_uuid = UUID(destination_stop_id)
                stop = self.session.query(Stop).filter(Stop.id == s_uuid).first()
                if stop and stop.location is not None:
                    shape = to_shape(stop.location)
                    dest_lat, dest_lon = shape.y, shape.x
                    dest_name = stop.name
                else:
                    return MultimodalJourneyResult(
                        journey_id=journey_id,
                        status="DESTINATION_UNREACHABLE",
                        origin=origin_dict,
                        destination={"stop_id": destination_stop_id},
                        walking_legs=[],
                        transit_legs=[],
                        food_waypoint=None,
                        total_estimated_duration_minutes=0,
                        warnings=["Destination stop has unverified coordinates."],
                    ).to_dict()
            except ValueError:
                return MultimodalJourneyResult(
                    journey_id=journey_id,
                    status="DESTINATION_UNREACHABLE",
                    origin=origin_dict,
                    destination={"stop_id": destination_stop_id},
                    walking_legs=[],
                    transit_legs=[],
                    food_waypoint=None,
                    total_estimated_duration_minutes=0,
                    warnings=["Invalid destination_stop_id format."],
                ).to_dict()

        if dest_lat is None or dest_lon is None:
            return MultimodalJourneyResult(
                journey_id=journey_id,
                status="DESTINATION_UNREACHABLE",
                origin=origin_dict,
                destination={},
                walking_legs=[],
                transit_legs=[],
                food_waypoint=None,
                total_estimated_duration_minutes=0,
                warnings=["Destination coordinates not provided or could not be resolved."],
            ).to_dict()

        destination_dict = {
            "latitude": round(dest_lat, 6),
            "longitude": round(dest_lon, 6),
            "resolved_name": dest_name,
        }

        verified_a_stops = self._find_verified_nearby_stops(dest_lat, dest_lon, max_walking_distance_m)
        if not verified_a_stops:
            return MultimodalJourneyResult(
                journey_id=journey_id,
                status="DESTINATION_UNREACHABLE",
                origin=origin_dict,
                destination=destination_dict,
                walking_legs=[],
                transit_legs=[],
                food_waypoint=None,
                total_estimated_duration_minutes=0,
                warnings=[f"No verified transit stops found within {int(max_walking_distance_m)}m of destination."],
            ).to_dict()

        alighting_stops = expand_stops_with_canonical_hubs(self.session, verified_a_stops)

        req_dep_mins = parse_time_to_minutes(requested_departure_time)

        # 3. Path Discovery (Direct Routes + 1-Transfer Routes)
        candidate_journeys: list[dict[str, Any]] = []

        # ---------------------------------------------------------
        # A. Direct Route Discovery (0 Transfers)
        # ---------------------------------------------------------
        for b_stop, b_dist, b_hub in boarding_stops:
            b_route_stops = (
                self.session.query(RouteStop, Route)
                .join(Route, RouteStop.route_id == Route.id)
                .filter(RouteStop.stop_id == b_stop.id)
                .all()
            )

            for a_stop, a_dist, a_hub in alighting_stops:
                if b_stop.id == a_stop.id:
                    continue

                for b_rs, b_route in b_route_stops:
                    a_rs = (
                        self.session.query(RouteStop)
                        .filter(
                            RouteStop.route_id == b_route.id,
                            RouteStop.stop_id == a_stop.id,
                        )
                        .first()
                    )

                    if a_rs and b_rs.sequence_order < a_rs.sequence_order:
                        stop_count = a_rs.sequence_order - b_rs.sequence_order
                        walk_to_stop_mins = walking_time_minutes(b_dist, DEFAULT_WALKING_SPEED_M_PER_MIN)
                        walk_to_dest_mins = walking_time_minutes(a_dist, DEFAULT_WALKING_SPEED_M_PER_MIN)
                        transit_mins = stop_count * DEFAULT_MINS_PER_TRANSIT_STOP

                        departures = self._get_route_departures(b_route.id)

                        min_dep_time = (req_dep_mins + walk_to_stop_mins) if req_dep_mins is not None else None
                        if min_dep_time is not None:
                            dep_mins = find_next_departure_minutes(departures, min_dep_time)
                            if dep_mins is None:
                                # Requested departure time cannot be fulfilled today
                                continue
                        else:
                            dep_mins = find_next_departure_minutes(departures, 0)

                        arr_mins = (dep_mins + transit_mins + walk_to_dest_mins) if dep_mins is not None else None
                        total_duration = walk_to_stop_mins + transit_mins + walk_to_dest_mins

                        candidate_journeys.append({
                            "journey_type": "direct",
                            "transfer_count": 0,
                            "transfer_hub": None,
                            "transfer_wait_mins": 0,
                            "dep_mins": dep_mins,
                            "arr_mins": arr_mins,
                            "total_walk_m": b_dist + a_dist,
                            "total_duration_mins": total_duration,
                            "total_stop_count": stop_count,
                            "legs": [
                                {
                                    "route": b_route,
                                    "boarding_stop": b_stop,
                                    "boarding_sequence": b_rs.sequence_order,
                                    "boarding_dist": b_dist,
                                    "alighting_stop": a_stop,
                                    "alighting_sequence": a_rs.sequence_order,
                                    "alighting_dist": a_dist,
                                    "stop_count": stop_count,
                                    "transit_mins": transit_mins,
                                    "departures": departures,
                                    "selected_departure_mins": dep_mins,
                                    "estimated_arrival_mins": (dep_mins + transit_mins) if dep_mins is not None else None,
                                }
                            ],
                            "walk_to_stop_mins": walk_to_stop_mins,
                            "walk_to_dest_mins": walk_to_dest_mins,
                            "b_stop": b_stop,
                            "a_stop": a_stop,
                            "b_dist": b_dist,
                            "a_dist": a_dist,
                        })

        # ---------------------------------------------------------
        # B. 1-Transfer Route Discovery (via Canonical Hubs)
        # ---------------------------------------------------------
        # Pre-index alighting stop IDs
        alighting_stop_ids = {a_stop.id for a_stop, _, _ in alighting_stops}

        for b_stop, b_dist, b_hub in boarding_stops:
            b_route_stops = (
                self.session.query(RouteStop, Route)
                .join(Route, RouteStop.route_id == Route.id)
                .filter(RouteStop.stop_id == b_stop.id)
                .all()
            )

            for b_rs, b_route in b_route_stops:
                downstream_rs = (
                    self.session.query(RouteStop, Stop)
                    .join(Stop, RouteStop.stop_id == Stop.id)
                    .filter(
                        RouteStop.route_id == b_route.id,
                        RouteStop.sequence_order > b_rs.sequence_order,
                    )
                    .all()
                )

                for t1_rs, t1_stop in downstream_rs:
                    transfer_hub = get_canonical_hub_for_stop(t1_stop)
                    if not transfer_hub:
                        continue

                    # Get member stops of this transfer hub
                    hub_member_stops = (
                        self.session.query(Stop)
                        .filter(
                            (Stop.id.in_([UUID(sid) for sid in transfer_hub.member_stop_ids if _is_valid_uuid(sid)])) |
                            (Stop.name.in_(list(transfer_hub.member_stop_names)))
                        )
                        .all()
                    )
                    hub_stop_ids = [s.id for s in hub_member_stops]

                    # Find distinct connecting routes departing from the transfer hub
                    departing_rs = (
                        self.session.query(RouteStop, Route, Stop)
                        .join(Route, RouteStop.route_id == Route.id)
                        .join(Stop, RouteStop.stop_id == Stop.id)
                        .filter(
                            RouteStop.stop_id.in_(hub_stop_ids),
                            RouteStop.route_id != b_route.id,
                        )
                        .all()
                    )

                    for t2_rs, t2_route, t2_stop in departing_rs:
                        for a_stop, a_dist, a_hub in alighting_stops:
                            if a_stop.id in hub_stop_ids:
                                continue

                            a_rs = (
                                self.session.query(RouteStop)
                                .filter(
                                    RouteStop.route_id == t2_route.id,
                                    RouteStop.stop_id == a_stop.id,
                                    RouteStop.sequence_order > t2_rs.sequence_order,
                                )
                                .first()
                            )

                            if a_rs:
                                stop_count_1 = t1_rs.sequence_order - b_rs.sequence_order
                                stop_count_2 = a_rs.sequence_order - t2_rs.sequence_order
                                walk_to_stop_mins = walking_time_minutes(b_dist, DEFAULT_WALKING_SPEED_M_PER_MIN)
                                walk_to_dest_mins = walking_time_minutes(a_dist, DEFAULT_WALKING_SPEED_M_PER_MIN)
                                dur1 = stop_count_1 * DEFAULT_MINS_PER_TRANSIT_STOP
                                dur2 = stop_count_2 * DEFAULT_MINS_PER_TRANSIT_STOP

                                deps1 = self._get_route_departures(b_route.id)
                                deps2 = self._get_route_departures(t2_route.id)

                                min_dep_1 = (req_dep_mins + walk_to_stop_mins) if req_dep_mins is not None else None
                                if min_dep_1 is not None:
                                    dep1_mins = find_next_departure_minutes(deps1, min_dep_1)
                                    if dep1_mins is None:
                                        continue
                                else:
                                    dep1_mins = find_next_departure_minutes(deps1, 0)

                                if dep1_mins is not None:
                                    arr1_mins = dep1_mins + dur1
                                    min_dep_2 = arr1_mins + DEFAULT_TRANSFER_BUFFER_MINS
                                    dep2_mins = find_next_departure_minutes(deps2, min_dep_2)
                                    if dep2_mins is None and req_dep_mins is not None:
                                        continue
                                    if dep2_mins is not None:
                                        arr2_mins = dep2_mins + dur2
                                        wait_mins = dep2_mins - arr1_mins
                                    else:
                                        arr2_mins = None
                                        wait_mins = DEFAULT_TRANSFER_BUFFER_MINS
                                else:
                                    arr1_mins = None
                                    dep2_mins = find_next_departure_minutes(deps2, 0)
                                    arr2_mins = None
                                    wait_mins = DEFAULT_TRANSFER_BUFFER_MINS

                                total_duration = walk_to_stop_mins + dur1 + wait_mins + dur2 + walk_to_dest_mins
                                arr_mins = (arr2_mins + walk_to_dest_mins) if arr2_mins is not None else None

                                candidate_journeys.append({
                                    "journey_type": "1_transfer",
                                    "transfer_count": 1,
                                    "transfer_hub": transfer_hub.hub_name,
                                    "transfer_wait_mins": wait_mins,
                                    "dep_mins": dep1_mins,
                                    "arr_mins": arr_mins,
                                    "total_walk_m": b_dist + a_dist,
                                    "total_duration_mins": total_duration,
                                    "total_stop_count": stop_count_1 + stop_count_2,
                                    "legs": [
                                        {
                                            "route": b_route,
                                            "boarding_stop": b_stop,
                                            "boarding_sequence": b_rs.sequence_order,
                                            "boarding_dist": b_dist,
                                            "alighting_stop": t1_stop,
                                            "alighting_sequence": t1_rs.sequence_order,
                                            "alighting_dist": 0.0,
                                            "stop_count": stop_count_1,
                                            "transit_mins": dur1,
                                            "departures": deps1,
                                            "selected_departure_mins": dep1_mins,
                                            "estimated_arrival_mins": arr1_mins,
                                        },
                                        {
                                            "route": t2_route,
                                            "boarding_stop": t2_stop,
                                            "boarding_sequence": t2_rs.sequence_order,
                                            "boarding_dist": 0.0,
                                            "alighting_stop": a_stop,
                                            "alighting_sequence": a_rs.sequence_order,
                                            "alighting_dist": a_dist,
                                            "stop_count": stop_count_2,
                                            "transit_mins": dur2,
                                            "departures": deps2,
                                            "selected_departure_mins": dep2_mins,
                                            "estimated_arrival_mins": arr2_mins,
                                        },
                                    ],
                                    "walk_to_stop_mins": walk_to_stop_mins,
                                    "walk_to_dest_mins": walk_to_dest_mins,
                                    "b_stop": b_stop,
                                    "a_stop": a_stop,
                                    "b_dist": b_dist,
                                    "a_dist": a_dist,
                                })

        if not candidate_journeys:
            warn_msg = "No direct or 1-transfer transit route connects the nearby boarding and alighting stops."
            if req_dep_mins is not None:
                warn_msg = f"No scheduled departures available at or after {requested_departure_time} connecting origin and destination."
            return MultimodalJourneyResult(
                journey_id=journey_id,
                status="NO_TRANSIT_PATH",
                origin=origin_dict,
                destination=destination_dict,
                walking_legs=[],
                transit_legs=[],
                food_waypoint=None,
                total_estimated_duration_minutes=0,
                warnings=[warn_msg],
            ).to_dict()

        # Deterministic Ranking:
        # 1. Fewest transfers (direct 0 transfers strictly preferred)
        # 2. Earliest feasible arrival time
        # 3. Lowest total walk distance
        # 4. Lowest total duration
        # 5. Fewest stops
        candidate_journeys.sort(
            key=lambda c: (
                c["transfer_count"],
                c["arr_mins"] if c["arr_mins"] is not None else 999999,
                c["total_walk_m"],
                c["total_duration_mins"],
                c["total_stop_count"],
            )
        )

        best_journey = candidate_journeys[0]

        # 4. Construct Output Legs
        walking_legs = [
            WalkingLeg(
                leg_type="walk_to_transit",
                from_name="Origin",
                to_name=best_journey["b_stop"].name,
                distance_m=int(round(best_journey["b_dist"])),
                estimated_duration_mins=best_journey["walk_to_stop_mins"],
            ),
        ]

        if best_journey["transfer_count"] == 1:
            walking_legs.append(
                WalkingLeg(
                    leg_type="transfer_walk",
                    from_name=best_journey["legs"][0]["alighting_stop"].name,
                    to_name=best_journey["legs"][1]["boarding_stop"].name,
                    distance_m=0,
                    estimated_duration_mins=best_journey["transfer_wait_mins"],
                )
            )

        walking_legs.append(
            WalkingLeg(
                leg_type="walk_to_destination",
                from_name=best_journey["a_stop"].name,
                to_name=dest_name,
                distance_m=int(round(best_journey["a_dist"])),
                estimated_duration_mins=best_journey["walk_to_dest_mins"],
            )
        )

        transit_legs = []
        for leg_info in best_journey["legs"]:
            r_obj = leg_info["route"]
            r_notes = {}
            if r_obj.notes:
                try:
                    r_notes = json.loads(r_obj.notes)
                except Exception:
                    pass

            transit_legs.append(
                TransitLeg(
                    route_id=str(r_obj.id),
                    route_number=r_obj.name,
                    route_name=r_obj.route_name,
                    service_area=r_notes.get("service_area", "Capital Region"),
                    boarding_stop_id=str(leg_info["boarding_stop"].id),
                    boarding_stop_name=leg_info["boarding_stop"].name,
                    boarding_sequence=leg_info["boarding_sequence"],
                    alighting_stop_id=str(leg_info["alighting_stop"].id),
                    alighting_stop_name=leg_info["alighting_stop"].name,
                    alighting_sequence=leg_info["alighting_sequence"],
                    stop_count=leg_info["stop_count"],
                    scheduled_departures=leg_info["departures"][:10],
                    estimated_transit_mins=leg_info["transit_mins"],
                    selected_departure=format_minutes_to_time(leg_info["selected_departure_mins"]),
                    estimated_arrival=format_minutes_to_time(leg_info["estimated_arrival_mins"]),
                )
            )

        # 5. Optional Food Waypoint Discovery along primary corridor
        food_waypoint_obj: Optional[JourneyFoodWaypoint] = None
        food_detour_mins = 0

        if include_food:
            food_service = CorridorFoodService(self.session)
            primary_route_id = best_journey["legs"][0]["route"].id
            try:
                food_res = food_service.find_corridor_food(
                    route_id=str(primary_route_id),
                    max_distance_m=max_food_detour_m,
                    food_category=food_category,
                    dietary_tag=dietary_tag,
                    cuisine=cuisine,
                    limit=5,
                )
                candidates = food_res.get("candidates", [])
                if candidates:
                    top_candidate = candidates[0]
                    food_detour_mins = top_candidate.get("estimated_detour_minutes", 0)
                    food_waypoint_obj = JourneyFoodWaypoint(
                        place_id=top_candidate["place_id"],
                        research_id=top_candidate["research_id"],
                        name=top_candidate["name"],
                        food_category=top_candidate.get("food_category"),
                        cuisine=top_candidate.get("cuisine"),
                        speciality_dishes=top_candidate.get("speciality_dishes", []),
                        dietary_tags=top_candidate.get("dietary_tags", []),
                        corridor_status=top_candidate.get("corridor_status", "ON_ROUTE"),
                        distance_from_corridor_m=top_candidate.get("distance_from_corridor_m", 0.0),
                        estimated_detour_minutes=food_detour_mins,
                        rating=top_candidate.get("rating"),
                        rating_source=top_candidate.get("rating_source"),
                        source=top_candidate.get("source", "Odisha Food Research"),
                        verification_status=top_candidate.get("verification_status", "VERIFIED"),
                    )
                else:
                    warnings.append("No verified food candidates found along this transit corridor.")
            except Exception as exc:
                warnings.append(f"Corridor food discovery skipped: {exc}")

        # Check geometry status across all legs
        for leg_info in best_journey["legs"]:
            r_obj = leg_info["route"]
            total_stops_on_route = (
                self.session.query(RouteStop)
                .filter(RouteStop.route_id == r_obj.id)
                .count()
            )
            verified_stops_on_route = (
                self.session.query(RouteStop)
                .join(Stop, RouteStop.stop_id == Stop.id)
                .filter(
                    RouteStop.route_id == r_obj.id,
                    Stop.location.isnot(None),
                    Stop.coordinate_status.in_(["official", "verified", "geocoded"]),
                )
                .count()
            )

            if verified_stops_on_route < total_stops_on_route:
                warnings.append(f"Route {r_obj.name} geometry partially verified ({verified_stops_on_route}/{total_stops_on_route} stops geocoded).")

        final_total_duration = best_journey["total_duration_mins"] + food_detour_mins

        return MultimodalJourneyResult(
            journey_id=journey_id,
            status="SUCCESS",
            journey_type=best_journey["journey_type"],
            transfer_count=best_journey["transfer_count"],
            transfer_hub=best_journey["transfer_hub"],
            transfer_wait_minutes=best_journey["transfer_wait_mins"],
            departure_time=format_minutes_to_time(best_journey["dep_mins"]),
            estimated_arrival_time=format_minutes_to_time(best_journey["arr_mins"]),
            origin=origin_dict,
            destination=destination_dict,
            walking_legs=walking_legs,
            transit_legs=transit_legs,
            food_waypoint=food_waypoint_obj,
            total_estimated_duration_minutes=final_total_duration,
            warnings=warnings,
        ).to_dict()
