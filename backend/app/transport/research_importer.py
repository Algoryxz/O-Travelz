"""
Idempotent Transit Research Intelligence Normalization Importer for Phase 6A.

Imports verified research artifacts from data/research/transit/phase_6a/ into the
normalized transit intelligence relational layer without mutating or overwriting
existing authoritative production tables (routes, stops, route_stops).
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.transport import Route, Stop, TransportProvider
from app.models.transit_intelligence import (
    EvidenceCitation,
    RouteIntelligence,
    RouteCorridorIntelligence,
    StopIntelligence,
    StopAlias,
    UnresolvedStopRegistry,
)


@dataclass
class ImportReport:
    evidence_count: int
    routes_count: int
    stops_count: int
    corridors_count: int
    aliases_count: int
    unresolved_count: int
    is_idempotent: bool = False


class TransitIntelligenceImporter:
    """Imports Phase 6A research intelligence JSON artifacts into normalized tables."""

    def __init__(self, session: Session, research_dir: Optional[Path] = None):
        self.session = session
        if research_dir is None:
            self.research_dir = (
                Path(__file__).resolve().parents[3]
                / "data"
                / "research"
                / "transit"
                / "phase_6a"
            )
        else:
            self.research_dir = research_dir

    def import_all(self) -> ImportReport:
        """Run the complete idempotent intelligence import pipeline."""
        if not self.research_dir.exists():
            raise FileNotFoundError(f"Research directory not found: {self.research_dir}")

        # 1. Load Authoritative Production Lookups (read-only)
        routes_by_num: Dict[str, Route] = {}
        for r in self.session.query(Route).all():
            if r.name:
                routes_by_num[r.name.strip()] = r
            if r.route_code:
                routes_by_num[r.route_code.strip()] = r

        stops_by_name: Dict[str, Stop] = {}
        for s in self.session.query(Stop).all():
            if s.name:
                stops_by_name[s.name.upper().strip()] = s

        # 2. Import Evidence Registry
        ev_count = self._import_evidence_registry()

        # 3. Import Regional Routes and Corridors
        r_count, c_count, s_count = self._import_regional_routes(routes_by_num, stops_by_name)

        # 4. Import Stop Aliases & Global Analysis
        a_count = self._import_global_analysis()

        # 5. Import Unresolved Stops Registry
        u_count = self._import_unresolved_stops(stops_by_name)

        self.session.commit()

        return ImportReport(
            evidence_count=ev_count,
            routes_count=r_count,
            stops_count=s_count,
            corridors_count=c_count,
            aliases_count=a_count,
            unresolved_count=u_count,
        )

    def _import_evidence_registry(self) -> int:
        ev_file = self.research_dir / "evidence_registry.json"
        if not ev_file.exists():
            return 0

        with open(ev_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        evidence_items = data.get("evidence", [])
        count = 0

        for item in evidence_items:
            ev_id = item["evidence_id"]
            existing = (
                self.session.query(EvidenceCitation)
                .filter(EvidenceCitation.evidence_id == ev_id)
                .first()
            )

            accessed_at = None
            if item.get("accessed_at"):
                try:
                    accessed_at = datetime.fromisoformat(item["accessed_at"].replace("Z", "+00:00"))
                except Exception:
                    accessed_at = None

            if existing:
                existing.source = item["source"]
                existing.source_type = item["source_type"]
                existing.document = item.get("document")
                existing.page = item.get("page")
                existing.url = item.get("url")
                existing.claim = item.get("claim")
                existing.reliability = item["reliability"]
                existing.accessed_at = accessed_at
                existing.notes = item.get("notes")
            else:
                new_ev = EvidenceCitation(
                    evidence_id=ev_id,
                    source=item["source"],
                    source_type=item["source_type"],
                    document=item.get("document"),
                    page=item.get("page"),
                    url=item.get("url"),
                    claim=item.get("claim"),
                    reliability=item["reliability"],
                    accessed_at=accessed_at,
                    notes=item.get("notes"),
                )
                self.session.add(new_ev)
            count += 1

        self.session.flush()
        return count

    def _import_regional_routes(
        self, routes_by_num: Dict[str, Route], stops_by_name: Dict[str, Stop]
    ) -> Tuple[int, int, int]:
        regional_files = [
            "capital_region.json",
            "rourkela.json",
            "berhampur.json",
            "sambalpur.json",
            "keonjhar.json",
        ]

        total_routes = 0
        total_corridors = 0
        total_stops = 0

        for r_file in regional_files:
            file_path = self.research_dir / r_file
            if not file_path.exists():
                continue

            with open(file_path, "r", encoding="utf-8") as f:
                doc = json.load(f)

            region = doc.get("region", "Capital Region")
            for r in doc.get("routes", []):
                rn = str(r["route_number"]).strip()
                rc = r.get("route_code")
                prod_route = routes_by_num.get(rn) or (routes_by_num.get(rc) if rc else None)

                # Upsert RouteIntelligence
                existing_ri = (
                    self.session.query(RouteIntelligence)
                    .filter(
                        RouteIntelligence.route_number == rn,
                        RouteIntelligence.region == region,
                    )
                    .first()
                )

                if existing_ri:
                    ri = existing_ri
                    ri.route_id = prod_route.id if prod_route else None
                    ri.route_code = rc
                    ri.origin = r["origin"]
                    ri.destination = r["destination"]
                    ri.via = r.get("via")
                    ri.direction = r.get("direction", "bidirectional")
                    ri.overall_confidence = r["overall_confidence"]
                    ri.geometry_status = r["geometry_status"]
                    ri.has_detailed_stops = r.get("has_detailed_stops", False)
                    ri.stop_count_database = r.get("stop_count_database", len(r.get("stops", [])))
                    ri.stop_count_research = r.get("stop_count_research", len(r.get("stops", [])))
                    ri.route_level_evidence = r.get("route_level_evidence", [])
                    ri.conflicts = r.get("conflicts", [])
                    ri.notes = r.get("notes")
                    # Clear existing corridors for clean idempotent re-insertion
                    self.session.query(RouteCorridorIntelligence).filter(
                        RouteCorridorIntelligence.route_intelligence_id == ri.id
                    ).delete(synchronize_session=False)
                else:
                    ri = RouteIntelligence(
                        route_id=prod_route.id if prod_route else None,
                        route_number=rn,
                        route_code=rc,
                        region=region,
                        origin=r["origin"],
                        destination=r["destination"],
                        via=r.get("via"),
                        direction=r.get("direction", "bidirectional"),
                        overall_confidence=r["overall_confidence"],
                        geometry_status=r["geometry_status"],
                        has_detailed_stops=r.get("has_detailed_stops", False),
                        stop_count_database=r.get("stop_count_database", len(r.get("stops", []))),
                        stop_count_research=r.get("stop_count_research", len(r.get("stops", []))),
                        route_level_evidence=r.get("route_level_evidence", []),
                        conflicts=r.get("conflicts", []),
                        notes=r.get("notes"),
                    )
                    self.session.add(ri)
                    self.session.flush()

                total_routes += 1

                # Import Corridors
                for c in r.get("corridors", []):
                    corridor_record = RouteCorridorIntelligence(
                        route_intelligence_id=ri.id,
                        sequence=c.get("sequence", 1),
                        from_label=c.get("from_label"),
                        to_label=c.get("to_label"),
                        road_names=c.get("road_names", []),
                        major_junctions=c.get("major_junctions", []),
                        landmarks=c.get("landmarks", []),
                        status=c.get("status", "STRONGLY_INFERRED"),
                        confidence=c.get("confidence", "CONFIRMED"),
                        evidence=c.get("evidence", []),
                        notes=c.get("notes"),
                    )
                    self.session.add(corridor_record)
                    total_corridors += 1

                # Import Stops
                # Delete existing stop intelligence for this route to prevent duplicates
                self.session.query(StopIntelligence).filter(
                    StopIntelligence.route_number == rn
                ).delete(synchronize_session=False)

                for s in r.get("stops", []):
                    s_name = s.get("stop_name", "").strip()
                    norm_s_name = s_name.upper()
                    prod_stop = stops_by_name.get(norm_s_name)

                    si = StopIntelligence(
                        stop_id=prod_stop.id if prod_stop else None,
                        stop_name=s_name,
                        normalized_name=s.get("normalized_name"),
                        route_number=rn,
                        route_context=s.get("route_context"),
                        sequence_order=s.get("sequence_order", 1),
                        geographic_status=s.get("geographic_status", "unresolved"),
                        resolved_latitude=s.get("resolved_latitude"),
                        resolved_longitude=s.get("resolved_longitude"),
                        coordinate_provenance=s.get("coordinate_provenance"),
                        road=s.get("road"),
                        locality=s.get("locality"),
                        landmark=s.get("landmark"),
                        city=s.get("city"),
                        district=s.get("district"),
                        confidence=s.get("confidence", "SUPPORTED"),
                        evidence=s.get("evidence", []),
                        notes=s.get("notes"),
                    )
                    self.session.add(si)
                    total_stops += 1

        self.session.flush()
        return total_routes, total_corridors, total_stops

    def _import_global_analysis(self) -> int:
        ga_file = self.research_dir / "global_analysis.json"
        if not ga_file.exists():
            return 0

        with open(ga_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        aliases = data.get("stop_aliases", [])
        count = 0

        for a in aliases:
            p_name = a["primary_name"].strip()
            a_name = a["alias_name"].strip()
            existing = (
                self.session.query(StopAlias)
                .filter(StopAlias.primary_name == p_name, StopAlias.alias_name == a_name)
                .first()
            )

            if existing:
                existing.city = a.get("city")
                existing.alias_type = a.get("alias_type", "naming_variant")
                existing.confidence = a.get("confidence", "CONFIRMED")
                existing.evidence_id = a.get("evidence_id")
                existing.notes = a.get("notes")
            else:
                new_alias = StopAlias(
                    primary_name=p_name,
                    alias_name=a_name,
                    city=a.get("city"),
                    alias_type=a.get("alias_type", "naming_variant"),
                    confidence=a.get("confidence", "CONFIRMED"),
                    evidence_id=a.get("evidence_id"),
                    notes=a.get("notes"),
                )
                self.session.add(new_alias)
            count += 1

        self.session.flush()
        return count

    def _import_unresolved_stops(self, stops_by_name: Dict[str, Stop]) -> int:
        us_file = self.research_dir / "unresolved_stops.json"
        if not us_file.exists():
            return 0

        with open(us_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        unres_list = data.get("unresolved_stops", [])
        count = 0

        for u in unres_list:
            s_name = u["stop_name"].strip()
            existing = (
                self.session.query(UnresolvedStopRegistry)
                .filter(UnresolvedStopRegistry.stop_name == s_name)
                .first()
            )

            if existing:
                existing.canonical_stop_id = u.get("stop_id")
                existing.city = u.get("city")
                existing.district = u.get("district")
                existing.geographic_status = u.get("geographic_status", "unresolved")
                existing.reason_unresolved = u.get("reason_unresolved")
                existing.query_attempted = u.get("query_attempted")
                existing.potential_corridor = u.get("potential_corridor")
                existing.serving_routes = u.get("serving_routes", [])
            else:
                new_unres = UnresolvedStopRegistry(
                    canonical_stop_id=u.get("stop_id"),
                    stop_name=s_name,
                    city=u.get("city"),
                    district=u.get("district"),
                    geographic_status=u.get("geographic_status", "unresolved"),
                    reason_unresolved=u.get("reason_unresolved"),
                    query_attempted=u.get("query_attempted"),
                    potential_corridor=u.get("potential_corridor"),
                    serving_routes=u.get("serving_routes", []),
                )
                self.session.add(new_unres)
            count += 1

        self.session.flush()
        return count
