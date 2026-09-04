"""
Deterministic and Idempotent Transit Importer for Official Odisha Transit Data.

Imports routes, stops, stop-sequences, and schedules from:
`data/research/transit/extraction/` into PostgreSQL via SQLAlchemy models.
Preserves complete provenance, coordinates status, and sequence ordering.
"""
from __future__ import annotations

import json
import logging
import re
import uuid
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session

from app.models.transport import (
    DataTier,
    Route,
    RouteStop,
    ScheduledTripGroup,
    Stop,
    TransportProvider,
    TransportProviderSource,
)

logger = logging.getLogger(__name__)

DEFAULT_EXTRACTION_DIR = Path(__file__).resolve().parents[3] / "data" / "research" / "transit" / "extraction"


@dataclass(frozen=True)
class ImportSummary:
    providers_upserted: int
    routes_upserted: int
    stops_upserted: int
    route_stops_upserted: int
    schedules_upserted: int
    total_trips_imported: int
    official_coords_count: int
    geocoded_coords_count: int
    ambiguous_coords_count: int
    unresolved_coords_count: int


def _slugify(text: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', text.lower()).strip('-')
    return slug[:80] or "unknown"


def _parse_date(val: Any) -> date | None:
    if not val:
        return None
    if isinstance(val, date):
        return val
    try:
        # Check formats like "21.08.2026", "2026-08-21", "11.04.26"
        val_str = str(val).strip()
        for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%d.%m.%y", "%d/%m/%Y"):
            try:
                return datetime.strptime(val_str, fmt).date()
            except ValueError:
                pass
    except Exception:
        pass
    return None


class OfficialTransitImporter:
    def __init__(self, session: Session, extraction_dir: Path | None = None):
        self.session = session
        self.extraction_dir = extraction_dir or DEFAULT_EXTRACTION_DIR

    def _load_json(self, filename: str) -> Any:
        path = self.extraction_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Extraction file not found: {path}")
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    def run_import(self) -> ImportSummary:
        """Run full deterministic idempotent import."""
        routes_data = self._load_json("routes_extracted.json")
        stops_data = self._load_json("stops_extracted.json")

        # Prefer authoritative canonical route_stops.json if present
        canonical_rs_file = Path(__file__).resolve().parents[3] / "data" / "transport" / "canonical" / "route_stops.json"
        if canonical_rs_file.exists():
            with open(canonical_rs_file, encoding="utf-8") as f:
                can_groups = json.load(f)
            route_stops_data = []
            for g in can_groups:
                r_num = str(g.get("route_number") or g.get("route_id")).strip()
                direction = str(g.get("direction") or g.get("sequence_id") or "forward")
                seq_id = g.get("sequence_id")
                for s in g.get("stops", []):
                    route_stops_data.append({
                        "route_number": r_num,
                        "stop_name": s.get("raw_stop_name") or s.get("canonical_name") or s.get("stop_name"),
                        "sequence_order": s.get("sequence") or s.get("sequence_order", 1),
                        "direction": direction,
                        "sequence_id": seq_id,
                        "stop_id": s.get("stop_id"),
                    })
        else:
            route_stops_data = self._load_json("route_stops_extracted.json")
        schedules_data = self._load_json("schedules_extracted.json")

        geocoding_results = {}
        try:
            geo_rep = self._load_json("stop_geocoding_report.json")
            for res in geo_rep.get("results", []):
                if res.get("status") == "geocoded" and res.get("latitude") and res.get("longitude"):
                    geocoding_results[res["stop_name"]] = res
        except Exception:
            pass

        # 1. Transport Providers
        providers = self._import_providers()

        # 2. Stops
        stops_by_canonical, stop_stats = self._import_stops(stops_data, providers, geocoding_results)

        # 3. Routes
        routes_by_key = self._import_routes(routes_data, providers)

        # 4. RouteStops (Sequences)
        route_stops_count = self._import_route_stops(route_stops_data, routes_by_key, stops_by_canonical)

        # 5. Schedules (Trip Groups)
        schedules_count, total_trips = self._import_schedules(schedules_data, routes_by_key)

        self.session.commit()

        return ImportSummary(
            providers_upserted=len(providers),
            routes_upserted=len(routes_by_key),
            stops_upserted=len(stops_by_canonical),
            route_stops_upserted=route_stops_count,
            schedules_upserted=schedules_count,
            total_trips_imported=total_trips,
            official_coords_count=stop_stats["official"],
            geocoded_coords_count=stop_stats["geocoded"],
            ambiguous_coords_count=stop_stats["ambiguous"],
            unresolved_coords_count=stop_stats["unresolved"],
        )

    def _import_providers(self) -> dict[str, TransportProvider]:
        """Seed / upsert transport providers."""
        providers_spec = [
            ("CRUT / Mo Bus", "bus", DataTier.SCHEDULED, "Capital Region Urban Transport - Mo Bus and Ama Bus networks"),
            ("AMA Bus", "bus", DataTier.SCHEDULED, "AMA Bus regional operations across Odisha districts"),
            ("Mo E-Ride", "paratransit", DataTier.SCHEDULED, "CRUT electric feeder paratransit in Bhubaneswar"),
        ]

        provider_map: dict[str, TransportProvider] = {}
        for name, mode, tier, notes in providers_spec:
            existing = self.session.query(TransportProvider).filter_by(name=name).first()
            if existing is None:
                existing = TransportProvider(
                    id=uuid.uuid4(),
                    name=name,
                    mode=mode,
                    data_tier=tier,
                    notes_on_verification=notes,
                )
                self.session.add(existing)
                self.session.flush()
            else:
                existing.mode = mode
                existing.data_tier = tier
                existing.notes_on_verification = notes
            provider_map[name] = existing

        # Alias lookup
        provider_map["CRUT"] = provider_map["CRUT / Mo Bus"]
        provider_map["Mo Bus"] = provider_map["CRUT / Mo Bus"]
        return provider_map

    def _import_stops(
        self,
        stops_data: list[dict[str, Any]],
        providers: dict[str, TransportProvider],
        geocoding_results: dict[str, dict[str, Any]],
    ) -> tuple[dict[str, Stop], dict[str, int]]:
        """Idempotently upsert all stops with provenance and coordinate status."""
        stops_by_name: dict[str, Stop] = {}
        default_provider = providers["CRUT / Mo Bus"]

        stats = {"official": 0, "geocoded": 0, "ambiguous": 0, "unresolved": 0}

        for s in stops_data:
            canonical = s["canonical_name"].upper().strip()
            published = s.get("published_name") or canonical
            city = s.get("city")
            district = s.get("district")
            source_doc = s.get("source_document", "official_transit_docs")
            source_page = str(s.get("source_page", "1"))

            # Determine coordinates
            coord_status = s.get("coordinate_status", "unresolved")
            lat = s.get("latitude")
            lon = s.get("longitude")
            geo_info = None

            # Check geocoded results if not officially provided
            if (lat is None or lon is None) and canonical in geocoding_results:
                gres = geocoding_results[canonical]
                lat = gres["latitude"]
                lon = gres["longitude"]
                coord_status = "geocoded"
                geo_info = gres

            location_geom = None
            if lat is not None and lon is not None and coord_status in ("official", "geocoded"):
                location_geom = WKTElement(f"POINT({lon} {lat})", srid=4326)
                stats[coord_status] = stats.get(coord_status, 0) + 1
            else:
                coord_status = "unresolved"
                stats["unresolved"] += 1

            provider_name = s.get("operator") or "CRUT"
            provider = providers.get(provider_name, default_provider)

            name_hash = uuid.uuid5(uuid.NAMESPACE_DNS, canonical).hex[:8]
            canonical_stop_id = f"stop-{_slugify(city or 'odisha')}-{_slugify(canonical)[:50]}-{name_hash}"
            research_id = f"res-stop-{_slugify(canonical)[:50]}-{name_hash}"

            notes_payload = {
                "city": city,
                "district": district,
                "locality": s.get("locality"),
                "terminal_status": s.get("terminal_status"),
                "source_page": source_page,
                "extraction_method": s.get("extraction_method", "text_extraction"),
                "coordinate_source": s.get("coordinate_source"),
                "geocoding_confidence": s.get("geocoding_confidence"),
                "matched_place_name": s.get("matched_place_name"),
                "geocoding_meta": geo_info,
            }

            # Lookup existing by provider_id + canonical_stop_id or name
            existing = self.session.query(Stop).filter(
                Stop.provider_id == provider.id,
                Stop.name == canonical,
            ).first()

            if existing is None:
                existing = Stop(
                    id=uuid.uuid4(),
                    provider_id=provider.id,
                    name=canonical,
                    published_name=published,
                    canonical_stop_id=canonical_stop_id,
                    research_id=research_id,
                    location=location_geom,
                    coordinate_status=coord_status,
                    reconciliation_status="verified",
                    source=source_doc,
                    effective_date=_parse_date(s.get("effective_date")),
                    verified_at=datetime.now(timezone.utc),
                    notes=json.dumps(notes_payload),
                )
                self.session.add(existing)
            else:
                existing.published_name = published
                existing.location = location_geom
                existing.coordinate_status = coord_status
                existing.source = source_doc
                existing.notes = json.dumps(notes_payload)

            stops_by_name[canonical] = existing

        self.session.flush()
        return stops_by_name, stats

    def _import_routes(
        self,
        routes_data: list[dict[str, Any]],
        providers: dict[str, TransportProvider],
    ) -> dict[tuple[str, str], Route]:
        """Idempotently upsert all 154 verified routes."""
        routes_by_key: dict[tuple[str, str], Route] = {}
        default_provider = providers["CRUT / Mo Bus"]

        for r in routes_data:
            route_num = str(r["route_number"]).strip()
            service_area = r.get("service_area", "Capital Region")
            route_name = r.get("route_name", f"Route {route_num}")
            source_doc = r.get("source_document", "official_transit_docs")
            source_page = str(r.get("source_page", "1"))
            eff_date = _parse_date(r.get("effective_date"))

            provider_name = r.get("network_type") or r.get("operator") or "CRUT"
            provider = providers.get(provider_name, default_provider)

            route_code = f"{_slugify(service_area)}-{_slugify(route_num)}"

            notes_payload = {
                "service_area": service_area,
                "origin": r.get("origin"),
                "destination": r.get("destination"),
                "via": r.get("via"),
                "cities": r.get("cities", []),
                "direction": r.get("direction", "bidirectional"),
                "verification_status": r.get("verification_status", "verified_from_official_document"),
                "extraction_method": r.get("extraction_method", "text_extraction"),
                "confidence": "high",
            }

            existing = self.session.query(Route).filter(
                Route.provider_id == provider.id,
                Route.route_code == route_code,
            ).first()

            if existing is None:
                existing = Route(
                    id=uuid.uuid4(),
                    provider_id=provider.id,
                    name=route_num,
                    route_code=route_code,
                    route_name=route_name,
                    source=source_doc,
                    source_page=source_page,
                    effective_date=eff_date,
                    verified_at=datetime.now(timezone.utc),
                    notes=json.dumps(notes_payload),
                )
                self.session.add(existing)
            else:
                existing.name = route_num
                existing.route_name = route_name
                existing.source = source_doc
                existing.source_page = source_page
                existing.effective_date = eff_date
                existing.notes = json.dumps(notes_payload)

            # Store by (service_area, route_num) and by route_num
            routes_by_key[(service_area, route_num)] = existing
            routes_by_key[(route_num, "")] = existing

        self.session.flush()
        return routes_by_key

    def _import_route_stops(
        self,
        route_stops_data: list[dict[str, Any]],
        routes_by_key: dict[tuple[str, str], Route],
        stops_by_canonical: dict[str, Stop],
    ) -> int:
        """Idempotently upsert route-stop sequence relationships."""
        # Clear existing route_stops for the imported routes to ensure sequence updates are atomic
        route_ids = {r.id for r in routes_by_key.values()}
        self.session.query(RouteStop).filter(RouteStop.route_id.in_(route_ids)).delete(synchronize_session=False)

        count = 0
        seen_links = set()

        for rs in route_stops_data:
            route_num = str(rs["route_number"]).strip()
            stop_name = (rs.get("stop_name") or "").upper().strip()
            seq_order = int(rs.get("sequence_order", 1))
            direction = str(rs.get("direction") or rs.get("sequence_id") or "forward")

            route = routes_by_key.get((route_num, ""))
            stop = stops_by_canonical.get(stop_name)
            if stop is None and rs.get("stop_id"):
                stop = self.session.query(Stop).filter(
                    (Stop.canonical_stop_id == rs["stop_id"]) | (Stop.research_id == rs["stop_id"])
                ).first()

            if route is not None and stop is not None:
                link_key = (route.id, stop.id, seq_order, direction)
                if link_key not in seen_links:
                    seen_links.add(link_key)
                    route_stop_row = RouteStop(
                        id=uuid.uuid4(),
                        route_id=route.id,
                        stop_id=stop.id,
                        sequence_order=seq_order,
                    )
                    self.session.add(route_stop_row)
                    count += 1

        self.session.flush()
        return count

    def _import_schedules(
        self,
        schedules_data: list[dict[str, Any]],
        routes_by_key: dict[tuple[str, str], Route],
    ) -> tuple[int, int]:
        """Idempotently upsert schedule groups and departures."""
        count = 0
        total_trips = 0

        for sched in schedules_data:
            route_num = str(sched["route_number"]).strip()
            terminus = sched.get("terminus", "Terminus")
            times = sched.get("departure_times", [])
            source_doc = sched.get("source_document", "official_schedule")
            source_page = str(sched.get("source_page", "1"))
            eff_date = _parse_date(sched.get("effective_date"))

            route = routes_by_key.get((route_num, ""))
            if route is None:
                continue

            group_label = f"Terminus: {terminus[:50]}"
            total_trips += len(times)

            notes_payload = {
                "total_trips": len(times),
                "ac_services": sched.get("ac_services", []),
                "terminus": terminus,
            }

            existing = self.session.query(ScheduledTripGroup).filter(
                ScheduledTripGroup.route_id == route.id,
                ScheduledTripGroup.group_label == group_label,
                ScheduledTripGroup.source == source_doc,
            ).first()

            if existing is None:
                existing = ScheduledTripGroup(
                    id=uuid.uuid4(),
                    route_id=route.id,
                    group_label=group_label,
                    source=source_doc,
                    source_page=source_page,
                    effective_date=eff_date,
                    data_tier=DataTier.SCHEDULED,
                    verified_at=datetime.now(timezone.utc),
                    departure_times_source_order_raw=times,
                    departure_times_source_order=times,
                    departure_times_chronological=sorted(times),
                    notes=json.dumps(notes_payload),
                )
                self.session.add(existing)
            else:
                existing.source_page = source_page
                existing.effective_date = eff_date
                existing.departure_times_source_order_raw = times
                existing.departure_times_source_order = times
                existing.departure_times_chronological = sorted(times)
                existing.notes = json.dumps(notes_payload)

            count += 1

        self.session.flush()
        return count, total_trips
