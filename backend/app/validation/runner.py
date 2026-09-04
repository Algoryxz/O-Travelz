"""
Universal Validation Runner for O-TRAVELZ V4.
Orchestrates domain validation, profile enforcement, and comprehensive audits.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from app.validation.models import ValidationProfile, ValidationReport, ValidationSeverity
from app.validation.profiles import CI_BLOCKING_CODES
from app.validation.domains.identity import validate_identity
from app.validation.domains.localization import validate_localization
from app.validation.domains.provenance import validate_provenance
from app.validation.domains.geospatial import validate_geospatial
from app.validation.domains.relationships import validate_relationships
from app.validation.domains.media import validate_media_asset, validate_entity_media
from app.validation.domains.transit import (
    validate_transit_stop,
    validate_transit_route,
    validate_route_stops,
    validate_transit_schedule,
)


class UniversalValidator:
    """
    Unified validation orchestrator supporting AUDIT, PROMOTION, and CI profiles.
    """

    def __init__(self, profile: ValidationProfile = ValidationProfile.AUDIT):
        self.profile = profile

    def validate_entity(
        self,
        record: Dict[str, Any],
        entity_type: str,
        report: ValidationReport,
        name_field: str = "name",
        source_field: str = "source",
        lat_field: str = "lat",
        lon_field: str = "lon",
        check_translations: bool = True,
    ) -> None:
        # Check identifier
        rec_id = record.get("id") or record.get("research_id") or record.get("stop_id") or record.get("route_id")
        if not rec_id:
            from app.validation import codes
            report.add_issue(
                code=codes.ID_MISSING_IDENTIFIER,
                severity=ValidationSeverity.ERROR,
                domain="identity",
                entity_type=entity_type,
                message=f"{entity_type} record missing primary identifier",
                evidence={"keys": list(record.keys())},
            )

        validate_localization(
            record=record,
            entity_type=entity_type,
            report=report,
            name_field=name_field,
            check_translations=check_translations,
        )
        validate_provenance(
            record=record,
            entity_type=entity_type,
            report=report,
            source_field=source_field,
        )
        validate_geospatial(
            record=record,
            entity_type=entity_type,
            report=report,
            lat_field=lat_field,
            lon_field=lon_field,
        )

    def validate_collection(
        self,
        records: List[Dict[str, Any]],
        entity_type: str,
        report: ValidationReport,
        id_field: str = "id",
        name_field: str = "name",
        scope_fields: Optional[List[str]] = None,
        check_translations: bool = True,
    ) -> None:
        """Validate a collection of records including identity uniqueness and scoped collisions."""
        validate_identity(
            records=records,
            entity_type=entity_type,
            report=report,
            id_field=id_field,
            name_field=name_field,
            scope_fields=scope_fields,
        )
        for rec in records:
            self.validate_entity(
                record=rec,
                entity_type=entity_type,
                report=report,
                name_field=name_field,
                check_translations=check_translations,
            )

    def audit_canonical_files(
        self,
        workspace_root: Path,
        report: Optional[ValidationReport] = None,
    ) -> ValidationReport:
        """
        Execute full audit across all canonical datasets on disk:
        1. Sanctuary Places (data/places/places.json)
        2. Food Places (data/research/food/odisha_food_research.json)
        3. Services & Facilities (data/services/odisha_services.json)
        4. Canonical Transit (data/transport/canonical/)
        5. Image Manifest (data/images/sources/manifest.json)
        """
        if report is None:
            report = ValidationReport(profile=self.profile)

        # 1. Places (Sanctuaries)
        places_path = workspace_root / "data" / "places" / "places.json"
        if places_path.exists():
            with open(places_path, encoding="utf-8") as f:
                places = json.load(f)
            self.validate_collection(
                records=places,
                entity_type="place",
                report=report,
                id_field="id",
                name_field="name",
                scope_fields=["district", "category"],
                check_translations=True,
            )

        # 2. Food Research Places
        food_path = workspace_root / "data" / "research" / "food" / "odisha_food_research.json"
        if food_path.exists():
            with open(food_path, encoding="utf-8") as f:
                food_data = json.load(f)
            records = food_data.get("records", []) if isinstance(food_data, dict) else food_data
            self.validate_collection(
                records=records,
                entity_type="food_place",
                report=report,
                id_field="research_id",
                name_field="name",
                scope_fields=["district", "food_category"],
                check_translations=True,
            )

        # 3. Services / Facilities
        services_path = workspace_root / "data" / "services" / "odisha_services.json"
        if services_path.exists():
            with open(services_path, encoding="utf-8") as f:
                services = json.load(f)
            self.validate_collection(
                records=services,
                entity_type="service_facility",
                report=report,
                id_field="id",
                name_field="name",
                scope_fields=["district", "category"],
                check_translations=False,  # Services are not yet required to be localized
            )

        # 4. Canonical Transit Network
        transit_dir = workspace_root / "data" / "transport" / "canonical"
        known_stop_ids: Set[str] = set()
        known_route_ids: Set[str] = set()

        if transit_dir.exists():
            # Stops
            stops_file = transit_dir / "stops.json"
            if stops_file.exists():
                with open(stops_file, encoding="utf-8") as f:
                    stops = json.load(f)
                validate_identity(
                    records=stops,
                    entity_type="transit_stop",
                    report=report,
                    id_field="stop_id",
                    name_field="canonical_name",
                )
                for s in stops:
                    sid = str(s.get("stop_id", ""))
                    if sid:
                        known_stop_ids.add(sid)
                    validate_transit_stop(s, report)
                    validate_geospatial(s, "transit_stop", report)
                    validate_localization(
                        record=s,
                        entity_type="transit_stop",
                        report=report,
                        name_field="canonical_name",
                        check_translations=False,  # Transit stops not yet localized
                    )

            # Routes
            routes_file = transit_dir / "routes.json"
            if routes_file.exists():
                with open(routes_file, encoding="utf-8") as f:
                    routes = json.load(f)
                validate_identity(
                    records=routes,
                    entity_type="transit_route",
                    report=report,
                    id_field="route_id",
                    name_field="route_number",
                )
                for r in routes:
                    rid = str(r.get("route_id", ""))
                    if rid:
                        known_route_ids.add(rid)
                    validate_transit_route(r, report)

            # Route Stops
            rs_file = transit_dir / "route_stops.json"
            if rs_file.exists():
                with open(rs_file, encoding="utf-8") as f:
                    route_stops = json.load(f)
                for rs in route_stops:
                    rid = str(rs.get("route_id", ""))
                    stops_list = rs.get("stops", [])
                    validate_route_stops(rid, stops_list, known_stop_ids, report)

            # Schedules
            sched_file = transit_dir / "schedules.json"
            if sched_file.exists():
                with open(sched_file, encoding="utf-8") as f:
                    schedules = json.load(f)
                for sc in schedules:
                    validate_transit_schedule(sc, report, known_route_ids)

        # 5. Image Manifest & Registry
        manifest_path = workspace_root / "data" / "images" / "sources" / "manifest.json"
        if manifest_path.exists():
            with open(manifest_path, encoding="utf-8") as f:
                manifest_items = json.load(f)
            assets_by_id: Dict[str, Dict[str, Any]] = {}
            for m in manifest_items:
                m_id = str(m.get("place_id") or m.get("asset_hash") or "m_asset")
                m_asset = {
                    "id": m_id,
                    "content_sha256": m.get("content_sha256"),
                    "storage_key": f"{m.get('place_id')}/{m.get('asset_hash')}",
                    "verification_status": "EXACT_LOCATION_VERIFIED",
                    "media_kind": "photograph",
                    "is_photograph": True,
                }
                assets_by_id[m_id] = m_asset
                validate_media_asset(m_asset, report)

        return report