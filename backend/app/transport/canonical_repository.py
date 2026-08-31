"""
backend/app/transport/canonical_repository.py — Authoritative In-Memory Repository for Canonical Transit Data

Loads and indexes all 5 canonical transit datasets:
  1. data/transport/canonical/stops.json (1,430 logical stops, 83 coordinate-bearing)
  2. data/transport/canonical/routes.json (154 routes)
  3. data/transport/canonical/route_stops.json (164 ordered sequence lists)
  4. data/transport/canonical/schedules.json (302 schedules, 5,549 departures)
  5. data/transport/canonical/aliases.json (2,924 registered aliases)

Strict Invariants:
- Zero Coordinate Fabrication: Unresolved stops remain lat=null, lon=null and are EXCLUDED from spatial searches.
- Spatial graph operates only on verified routable stops (83 stops).
- Logical graph operates across all 154 routes and 1,430 stops for route sequence and schedule reasoning.
- Single load at startup: O(1) indexed lookups without re-reading or reparsing JSON files.
"""

from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple


REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
CANONICAL_DIR = REPO_ROOT / "data" / "transport" / "canonical"

DEFAULT_WALKING_SPEED_M_PER_MIN = 80.0  # ~4.8 km/h
DEFAULT_MINS_PER_BUS_STOP = 2.5  # Standard urban transit inter-stop travel time


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in meters."""
    r = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def parse_time_to_minutes(time_str: Optional[str]) -> Optional[int]:
    """Convert 'HH:MM' string to minutes from midnight (0..1439)."""
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
    """Convert minutes from midnight (0..1439+) to 'HH:MM' string."""
    if total_minutes is None:
        return None
    norm_mins = total_minutes % (24 * 60)
    hours = norm_mins // 60
    mins = norm_mins % 60
    return f"{hours:02d}:{mins:02d}"


@dataclass(frozen=True)
class CanonicalStop:
    stop_id: str
    canonical_name: str
    published_name: str
    city: Optional[str] = None
    district: Optional[str] = None
    locality: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    coordinate_status: str = "UNRESOLVED"
    coordinate_source: Optional[str] = None
    served_routes: List[str] = field(default_factory=list)

    @property
    def is_routable(self) -> bool:
        return self.lat is not None and self.lon is not None and self.coordinate_status in {
            "VERIFIED_OFFICIAL", "VERIFIED_GEOSPATIAL", "RESOLVED_HIGH_CONFIDENCE"
        }


@dataclass(frozen=True)
class CanonicalRoute:
    route_id: str
    route_number: str
    route_name: str
    origin_name: str
    destination_name: str
    direction: Optional[str] = None
    service_type: str = "REGULAR"
    region: str = "Capital Region"
    operator: str = "CRUT"
    is_active: bool = True


@dataclass(frozen=True)
class SequenceStopItem:
    sequence: int
    stop_id: str
    stop_name: str


@dataclass(frozen=True)
class RouteStopSequence:
    sequence_id: str
    route_id: str
    route_number: str
    direction: Optional[str]
    stops: List[SequenceStopItem]


@dataclass(frozen=True)
class CanonicalSchedule:
    schedule_id: str
    route_id: str
    route_number: str
    direction: Optional[str]
    start_point: str
    end_point: str
    departure_times: List[str]
    service_type: str = "REGULAR"


@dataclass(frozen=True)
class DirectTransitOption:
    route: CanonicalRoute
    sequence_id: str
    direction: Optional[str]
    from_stop: CanonicalStop
    to_stop: CanonicalStop
    from_sequence: int
    to_sequence: int
    intermediate_stops: List[SequenceStopItem]
    stop_count: int
    estimated_transit_minutes: int
    next_departure_time: Optional[str]
    data_tier: str  # "scheduled" or "static"
    fare: Optional[float] = None  # Always None (zero fabrication)


@dataclass(frozen=True)
class TransferTransitOption:
    leg1: DirectTransitOption
    leg2: DirectTransitOption
    transfer_stop: CanonicalStop
    total_transit_minutes: int
    transfer_buffer_minutes: int
    data_tier: str


class CanonicalTransitRepository:
    """Authoritative in-memory repository holding the verified canonical transit network."""

    _instance: Optional[CanonicalTransitRepository] = None

    def __init__(self, canonical_dir: Optional[Path] = None):
        self.canonical_dir = canonical_dir or CANONICAL_DIR
        self.stops_by_id: Dict[str, CanonicalStop] = {}
        self.routes_by_id: Dict[str, CanonicalRoute] = {}
        self.routes_by_number: Dict[str, List[CanonicalRoute]] = {}
        self.aliases_to_stop_id: Dict[str, str] = {}
        self.sequences_by_route_id: Dict[str, List[RouteStopSequence]] = {}
        self.schedules_by_route_id: Dict[str, List[CanonicalSchedule]] = {}
        self.routes_by_stop_id: Dict[str, Set[str]] = {}
        self.routable_stops: List[CanonicalStop] = []

        self._load()

    @classmethod
    def get_instance(cls, canonical_dir: Optional[Path] = None) -> CanonicalTransitRepository:
        if cls._instance is None:
            cls._instance = cls(canonical_dir)
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        cls._instance = None

    def _load(self) -> None:
        """Load all canonical JSON datasets into typed, indexed in-memory structures."""
        stops_file = self.canonical_dir / "stops.json"
        routes_file = self.canonical_dir / "routes.json"
        route_stops_file = self.canonical_dir / "route_stops.json"
        schedules_file = self.canonical_dir / "schedules.json"
        aliases_file = self.canonical_dir / "aliases.json"

        if not stops_file.exists() or not routes_file.exists():
            raise FileNotFoundError(
                f"Canonical transit files missing from {self.canonical_dir}. Run compiler first."
            )

        # 1. Load Stops
        with open(stops_file, encoding="utf-8") as f:
            stops_raw = json.load(f)
        for s in stops_raw:
            stop = CanonicalStop(
                stop_id=s["stop_id"],
                canonical_name=s["canonical_name"],
                published_name=s.get("published_name", s["canonical_name"]),
                city=s.get("city"),
                district=s.get("district"),
                locality=s.get("locality"),
                lat=s.get("lat"),
                lon=s.get("lon"),
                coordinate_status=s.get("coordinate_status", "UNRESOLVED"),
                coordinate_source=s.get("coordinate_source"),
                served_routes=s.get("served_routes", []),
            )
            self.stops_by_id[stop.stop_id] = stop
            if stop.is_routable:
                self.routable_stops.append(stop)

        # 2. Load Routes
        with open(routes_file, encoding="utf-8") as f:
            routes_raw = json.load(f)
        for r in routes_raw:
            route = CanonicalRoute(
                route_id=r["route_id"],
                route_number=r["route_number"],
                route_name=r.get("route_name", f"Route {r['route_number']}"),
                origin_name=r.get("origin_name", ""),
                destination_name=r.get("destination_name", ""),
                direction=r.get("direction"),
                service_type=r.get("service_type", "REGULAR"),
                region=r.get("region", "Capital Region"),
                operator=r.get("operator", "CRUT"),
                is_active=r.get("is_active", True),
            )
            self.routes_by_id[route.route_id] = route
            self.routes_by_number.setdefault(route.route_number.upper(), []).append(route)

        # 3. Load Aliases
        if aliases_file.exists():
            with open(aliases_file, encoding="utf-8") as f:
                self.aliases_to_stop_id = json.load(f)

        # 4. Load Route Stops (Sequences)
        if route_stops_file.exists():
            with open(route_stops_file, encoding="utf-8") as f:
                route_stops_raw = json.load(f)
            for rs in route_stops_raw:
                seq_stops = [
                    SequenceStopItem(
                        sequence=item["sequence"],
                        stop_id=item["stop_id"],
                        stop_name=item.get("stop_name", ""),
                    )
                    for item in rs.get("stops", [])
                ]
                seq = RouteStopSequence(
                    sequence_id=rs.get("sequence_id", rs["route_id"]),
                    route_id=rs["route_id"],
                    route_number=rs.get("route_number", ""),
                    direction=rs.get("direction"),
                    stops=seq_stops,
                )
                self.sequences_by_route_id.setdefault(rs["route_id"], []).append(seq)
                for s_item in seq_stops:
                    self.routes_by_stop_id.setdefault(s_item.stop_id, set()).add(rs["route_id"])

        # 5. Load Schedules
        if schedules_file.exists():
            with open(schedules_file, encoding="utf-8") as f:
                schedules_raw = json.load(f)
            for sc in schedules_raw:
                sched = CanonicalSchedule(
                    schedule_id=sc["schedule_id"],
                    route_id=sc["route_id"],
                    route_number=sc.get("route_number", ""),
                    direction=sc.get("direction"),
                    start_point=sc.get("start_point", ""),
                    end_point=sc.get("end_point", ""),
                    departure_times=sc.get("departure_times", []),
                    service_type=sc.get("service_type", "REGULAR"),
                )
                self.schedules_by_route_id.setdefault(sc["route_id"], []).append(sched)

    # -------------------------------------------------------------
    # LOOKUP METHODS
    # -------------------------------------------------------------

    def get_stop(self, identifier: str) -> Optional[CanonicalStop]:
        """Lookup a stop by stop_id or normalized alias."""
        if not identifier:
            return None
        # Direct ID lookup
        if identifier in self.stops_by_id:
            return self.stops_by_id[identifier]
        # Alias lookup
        norm = identifier.strip().upper()
        if norm in self.aliases_to_stop_id:
            target_id = self.aliases_to_stop_id[norm]
            return self.stops_by_id.get(target_id)
        # Search by exact canonical name
        for s in self.stops_by_id.values():
            if s.canonical_name.upper() == norm or s.published_name.upper() == norm:
                return s
        return None

    def get_route(self, route_id_or_number: str) -> Optional[CanonicalRoute]:
        """Lookup route by route_id or route_number."""
        if not route_id_or_number:
            return None
        if route_id_or_number in self.routes_by_id:
            return self.routes_by_id[route_id_or_number]
        r_num = route_id_or_number.strip().upper()
        if r_num in self.routes_by_number:
            return self.routes_by_number[r_num][0]
        return None

    def list_routes(self, region: Optional[str] = None, query: Optional[str] = None) -> List[CanonicalRoute]:
        """List canonical routes with optional filtering."""
        routes = list(self.routes_by_id.values())
        if region:
            routes = [r for r in routes if r.region.lower() == region.lower()]
        if query:
            q = query.strip().lower()
            routes = [
                r for r in routes
                if q in r.route_number.lower() or q in r.route_name.lower() or q in r.origin_name.lower() or q in r.destination_name.lower()
            ]
        return routes

    def get_routes_for_stop(self, stop_id: str) -> List[CanonicalRoute]:
        """Return all canonical routes that serve this stop."""
        route_ids = self.routes_by_stop_id.get(stop_id, set())
        return [self.routes_by_id[rid] for rid in route_ids if rid in self.routes_by_id]

    def get_sequences_for_route(self, route_id: str) -> List[RouteStopSequence]:
        """Get directional stop sequences for a route."""
        return self.sequences_by_route_id.get(route_id, [])

    def get_schedules_for_route(self, route_id: str) -> List[CanonicalSchedule]:
        """Get published schedule records for a route."""
        return self.schedules_by_route_id.get(route_id, [])

    # -------------------------------------------------------------
    # SPATIAL ACCESS QUERIES (Routable Stops ONLY)
    # -------------------------------------------------------------

    def find_nearest_routable_stops(
        self,
        lat: float,
        lon: float,
        radius_meters: float = 3000.0,
        limit: int = 5,
    ) -> List[Tuple[CanonicalStop, float]]:
        """
        Find closest verified coordinate-bearing stops within radius_meters.
        STRICT INVARIANT: Unresolved stops are never returned.
        """
        results: List[Tuple[CanonicalStop, float]] = []
        for stop in self.routable_stops:
            dist = haversine_distance_meters(lat, lon, stop.lat, stop.lon)
            if dist <= radius_meters:
                results.append((stop, dist))

        results.sort(key=lambda x: x[1])
        return results[:limit]

    # -------------------------------------------------------------
    # LOGICAL ROUTING & PATHFINDING
    # -------------------------------------------------------------

    def find_direct_connections(
        self,
        from_stop_id: str,
        to_stop_id: str,
        departure_time_mins: Optional[int] = None,
    ) -> List[DirectTransitOption]:
        """
        Find all direct route sequences connecting from_stop_id to to_stop_id in forward direction.
        Both from_stop and to_stop must exist in the network.
        Intermediate stops can be unresolved logical stops.
        """
        from_stop = self.get_stop(from_stop_id)
        to_stop = self.get_stop(to_stop_id)
        if not from_stop or not to_stop:
            return []

        options: List[DirectTransitOption] = []

        # Check all route sequences
        for route_id, seq_list in self.sequences_by_route_id.items():
            route = self.routes_by_id.get(route_id)
            if not route:
                continue

            for seq in seq_list:
                stop_ids_in_seq = [s.stop_id for s in seq.stops]
                if from_stop.stop_id in stop_ids_in_seq and to_stop.stop_id in stop_ids_in_seq:
                    from_idx = stop_ids_in_seq.index(from_stop.stop_id)
                    to_idx = stop_ids_in_seq.index(to_stop.stop_id)

                    # Forward travel only
                    if from_idx < to_idx:
                        intermediate = seq.stops[from_idx:to_idx + 1]
                        stop_count = to_idx - from_idx
                        transit_mins = max(int(stop_count * DEFAULT_MINS_PER_BUS_STOP), 5)

                        # Find schedule if available
                        schedules = self.schedules_by_route_id.get(route_id, [])
                        next_dep: Optional[str] = None
                        data_tier = "static"

                        if schedules:
                            all_deps: List[str] = []
                            for sc in schedules:
                                all_deps.extend(sc.departure_times)
                            if all_deps:
                                data_tier = "scheduled"
                                if departure_time_mins is not None:
                                    valid_deps = [
                                        d for d in all_deps
                                        if parse_time_to_minutes(d) is not None and parse_time_to_minutes(d) >= departure_time_mins
                                    ]
                                    if valid_deps:
                                        next_dep = min(valid_deps, key=lambda x: parse_time_to_minutes(x))
                                else:
                                    next_dep = all_deps[0]

                        options.append(
                            DirectTransitOption(
                                route=route,
                                sequence_id=seq.sequence_id,
                                direction=seq.direction,
                                from_stop=from_stop,
                                to_stop=to_stop,
                                from_sequence=seq.stops[from_idx].sequence,
                                to_sequence=seq.stops[to_idx].sequence,
                                intermediate_stops=intermediate,
                                stop_count=stop_count,
                                estimated_transit_minutes=transit_mins,
                                next_departure_time=next_dep,
                                data_tier=data_tier,
                                fare=None,  # Zero fabrication
                            )
                        )

        options.sort(key=lambda x: (x.estimated_transit_minutes, x.route.route_number))
        return options

    def find_1transfer_connections(
        self,
        from_stop_id: str,
        to_stop_id: str,
        departure_time_mins: Optional[int] = None,
        max_results: int = 5,
    ) -> List[TransferTransitOption]:
        """
        Find 1-transfer connections through a common interchange stop.
        Prefers transfers at verified routable hubs.
        """
        from_stop = self.get_stop(from_stop_id)
        to_stop = self.get_stop(to_stop_id)
        if not from_stop or not to_stop:
            return []

        from_routes = self.routes_by_stop_id.get(from_stop.stop_id, set())
        to_routes = self.routes_by_stop_id.get(to_stop.stop_id, set())

        # Collect candidate intermediate stops reachable from from_stop
        first_leg_stops: Dict[str, List[DirectTransitOption]] = {}
        for r_id in from_routes:
            for seq in self.sequences_by_route_id.get(r_id, []):
                s_ids = [s.stop_id for s in seq.stops]
                if from_stop.stop_id in s_ids:
                    f_idx = s_ids.index(from_stop.stop_id)
                    for mid_idx in range(f_idx + 1, len(seq.stops)):
                        mid_id = s_ids[mid_idx]
                        # Only consider interchange stops that connect to a route serving destination
                        if mid_id != to_stop.stop_id and (self.routes_by_stop_id.get(mid_id, set()) & to_routes):
                            conns = self.find_direct_connections(from_stop.stop_id, mid_id, departure_time_mins)
                            if conns:
                                first_leg_stops.setdefault(mid_id, []).extend(conns)

        transfer_options: List[TransferTransitOption] = []

        for mid_stop_id, leg1_list in first_leg_stops.items():
            mid_stop = self.get_stop(mid_stop_id)
            if not mid_stop:
                continue

            for leg1 in leg1_list[:2]:
                arrival_at_mid = (
                    (parse_time_to_minutes(leg1.next_departure_time) or 480) + leg1.estimated_transit_minutes
                    if leg1.next_departure_time
                    else None
                )
                min_leg2_dep = (arrival_at_mid + 10) if arrival_at_mid else None

                leg2_conns = self.find_direct_connections(mid_stop_id, to_stop.stop_id, min_leg2_dep)
                if leg2_conns:
                    leg2 = leg2_conns[0]
                    total_time = leg1.estimated_transit_minutes + 10 + leg2.estimated_transit_minutes
                    combined_tier = "scheduled" if (leg1.data_tier == "scheduled" and leg2.data_tier == "scheduled") else "static"

                    transfer_options.append(
                        TransferTransitOption(
                            leg1=leg1,
                            leg2=leg2,
                            transfer_stop=mid_stop,
                            total_transit_minutes=total_time,
                            transfer_buffer_minutes=10,
                            data_tier=combined_tier,
                        )
                    )

        transfer_options.sort(key=lambda x: (x.total_transit_minutes, not x.transfer_stop.is_routable))
        return transfer_options[:max_results]


def get_canonical_transit_repository() -> CanonicalTransitRepository:
    """Convenience getter for the canonical transit repository singleton."""
    return CanonicalTransitRepository.get_instance()
