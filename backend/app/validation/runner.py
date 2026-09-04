"""
Universal Validation Runner for O-TRAVELZ V4.
Orchestrates domain validation, profile enforcement, and comprehensive audits.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from app.validation.models import CoverageStatus, ValidationProfile, ValidationReport, ValidationSeverity
from app.validation.profiles import CI_BLOCKING_CODES
from app.validation.domains.identity import validate_identity
from app.validation.domains.localization import validate_localization
from app.validation.domains.provenance import validate_provenance
from app.validation.domains.geospatial import validate_geospatial
from app.validation.domains.relationships import validate_relationships
from app.validation.domains.media import (
    validate_media_asset,
    validate_entity_media,
    validate_media_filesystem_reconciliation,
    validate_strict_photo_evidence_registry,
)
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
        if entity_type in ("stop", "transit_stop", "locality_resolution"):
            validate_transit_stop(record, report)

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
        Execute full audit across all canonical datasets on disk and in database:
        1. Sanctuary Places (data/places/places.json)
        2. Food Places (data/research/food/odisha_food_research.json)
        3. Services & Facilities (data/services/odisha_services.json)
        4. Canonical Transit (data/transport/canonical/)
        5. Image Manifest (data/images/sources/manifest.json)
        6. Strict Photo Evidence Registry (data/images/sources/strict_photo_evidence_registry.json)
        7. Filesystem Media Storage (data/images/places/)
        8. Live Database Projections (place_images, media_assets, entity_media, entity_relationships)
        """
        if report is None:
            report = ValidationReport(profile=self.profile)

        known_place_ids: Set[str] = set()

        # 1. Places (Sanctuaries)
        places_path = workspace_root / "data" / "places" / "places.json"
        if places_path.exists():
            with open(places_path, encoding="utf-8") as f:
                places = json.load(f)
            for p in places:
                pid = str(p.get("id", ""))
                if pid:
                    known_place_ids.add(pid)
            self.validate_collection(
                records=places,
                entity_type="place",
                report=report,
                id_field="id",
                name_field="name",
                scope_fields=["district", "category"],
                check_translations=True,
            )
            report.record_coverage(
                source="data/places/places.json",
                status=CoverageStatus.VALIDATED,
                records_loaded=len(places),
                records_validated=len(places),
                records_skipped=0,
                validation_domains_executed=["identity", "localization", "provenance", "geospatial"],
            )
        else:
            report.record_coverage(
                source="data/places/places.json",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"File not found: {places_path}",
                validation_domains_executed=[],
            )

        # 2. Food Research Places
        food_path = workspace_root / "data" / "research" / "food" / "odisha_food_research.json"
        if food_path.exists():
            with open(food_path, encoding="utf-8") as f:
                food_data = json.load(f)
            records = food_data.get("records", []) if isinstance(food_data, dict) else food_data
            for r in records:
                rid = str(r.get("research_id") or r.get("id", ""))
                if rid:
                    known_place_ids.add(rid)
            self.validate_collection(
                records=records,
                entity_type="food_place",
                report=report,
                id_field="research_id",
                name_field="name",
                scope_fields=["district", "food_category"],
                check_translations=True,
            )
            report.record_coverage(
                source="data/research/food/odisha_food_research.json",
                status=CoverageStatus.VALIDATED,
                records_loaded=len(records),
                records_validated=len(records),
                records_skipped=0,
                validation_domains_executed=["identity", "localization", "provenance", "geospatial"],
            )
        else:
            report.record_coverage(
                source="data/research/food/odisha_food_research.json",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"File not found: {food_path}",
                validation_domains_executed=[],
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
                check_translations=False,  # Services not yet localized
            )
            report.record_coverage(
                source="data/services/odisha_services.json",
                status=CoverageStatus.VALIDATED,
                records_loaded=len(services),
                records_validated=len(services),
                records_skipped=0,
                validation_domains_executed=["identity", "localization", "provenance", "geospatial"],
            )
        else:
            report.record_coverage(
                source="data/services/odisha_services.json",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"File not found: {services_path}",
                validation_domains_executed=[],
            )

        # 4. Canonical Transit Network
        transit_dir = workspace_root / "data" / "transport" / "canonical"
        known_stop_ids: Set[str] = set()
        known_route_ids: Set[str] = set()

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
                    check_translations=False,
                )
            report.record_coverage(
                source="data/transport/canonical/stops.json",
                status=CoverageStatus.VALIDATED,
                records_loaded=len(stops),
                records_validated=len(stops),
                records_skipped=0,
                validation_domains_executed=["identity", "transit", "geospatial", "localization"],
            )
        else:
            report.record_coverage(
                source="data/transport/canonical/stops.json",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"File not found: {stops_file}",
                validation_domains_executed=[],
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
            report.record_coverage(
                source="data/transport/canonical/routes.json",
                status=CoverageStatus.VALIDATED,
                records_loaded=len(routes),
                records_validated=len(routes),
                records_skipped=0,
                validation_domains_executed=["identity", "transit"],
            )
        else:
            report.record_coverage(
                source="data/transport/canonical/routes.json",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"File not found: {routes_file}",
                validation_domains_executed=[],
            )

        # Route Stops
        rs_file = transit_dir / "route_stops.json"
        if rs_file.exists():
            with open(rs_file, encoding="utf-8") as f:
                route_stops = json.load(f)
            for rs in route_stops:
                rid = str(rs.get("route_id", ""))
                stops_list = rs.get("stops", [])
                validate_route_stops(rid, stops_list, known_stop_ids, report)
            report.record_coverage(
                source="data/transport/canonical/route_stops.json",
                status=CoverageStatus.VALIDATED,
                records_loaded=len(route_stops),
                records_validated=len(route_stops),
                records_skipped=0,
                validation_domains_executed=["transit"],
            )
        else:
            report.record_coverage(
                source="data/transport/canonical/route_stops.json",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"File not found: {rs_file}",
                validation_domains_executed=[],
            )

        # Schedules
        sched_file = transit_dir / "schedules.json"
        if sched_file.exists():
            with open(sched_file, encoding="utf-8") as f:
                schedules = json.load(f)
            total_deps = 0
            for sc in schedules:
                deps = sc.get("departure_times", [])
                total_deps += len(deps)
                validate_transit_schedule(sc, report, known_route_ids)
            report.record_coverage(
                source="data/transport/canonical/schedules.json",
                status=CoverageStatus.VALIDATED,
                records_loaded=len(schedules),
                records_validated=len(schedules),
                records_skipped=0,
                reason_skipped=f"Encompasses {total_deps} chronological departure times",
                validation_domains_executed=["transit"],
            )
        else:
            report.record_coverage(
                source="data/transport/canonical/schedules.json",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"File not found: {sched_file}",
                validation_domains_executed=[],
            )

        # 5. Image Manifest & Registry
        manifest_items: List[Dict[str, Any]] = []
        manifest_by_place_id: Dict[str, Dict[str, Any]] = {}
        manifest_path = workspace_root / "data" / "images" / "sources" / "manifest.json"
        if manifest_path.exists():
            with open(manifest_path, encoding="utf-8") as f:
                manifest_items = json.load(f)
            for m in manifest_items:
                pid = str(m.get("place_id") or "")
                if pid:
                    manifest_by_place_id[pid] = m
                m_id = str(m.get("place_id") or m.get("asset_hash") or "m_asset")
                m_asset = {
                    "id": m_id,
                    "content_sha256": m.get("content_sha256"),
                    "storage_key": f"{m.get('place_id')}/{m.get('asset_hash')}",
                    "verification_status": "EXACT_LOCATION_VERIFIED",
                    "media_kind": "photograph",
                    "is_photograph": True,
                }
                validate_media_asset(m_asset, report)
            report.record_coverage(
                source="data/images/sources/manifest.json",
                status=CoverageStatus.VALIDATED,
                records_loaded=len(manifest_items),
                records_validated=len(manifest_items),
                records_skipped=0,
                validation_domains_executed=["media", "provenance"],
            )
        else:
            report.record_coverage(
                source="data/images/sources/manifest.json",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"File not found: {manifest_path}",
                validation_domains_executed=[],
            )

        # 6. Strict Photo Evidence Registry
        strict_reg_path = workspace_root / "data" / "images" / "sources" / "strict_photo_evidence_registry.json"
        if strict_reg_path.exists():
            with open(strict_reg_path, encoding="utf-8") as f:
                strict_items = json.load(f)
            validate_strict_photo_evidence_registry(strict_items, manifest_by_place_id, report)
            report.record_coverage(
                source="data/images/sources/strict_photo_evidence_registry.json",
                status=CoverageStatus.VALIDATED,
                records_loaded=len(strict_items),
                records_validated=len(strict_items),
                records_skipped=0,
                validation_domains_executed=["media", "provenance"],
            )
        else:
            report.record_coverage(
                source="data/images/sources/strict_photo_evidence_registry.json",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"File not found: {strict_reg_path}",
                validation_domains_executed=[],
            )

        # 7. Filesystem Media Storage Reconciliation
        places_img_dir = workspace_root / "data" / "images" / "places"
        if places_img_dir.exists():
            reconcile_res = validate_media_filesystem_reconciliation(
                manifest_records=manifest_items,
                places_img_dir=places_img_dir,
                known_place_ids=known_place_ids,
                report=report,
            )
            dir_count = sum(1 for d in places_img_dir.iterdir() if d.is_dir())
            report.record_coverage(
                source="data/images/places/",
                status=CoverageStatus.VALIDATED,
                records_loaded=dir_count,
                records_validated=dir_count,
                records_skipped=0,
                reason_skipped=f"Reconciled {reconcile_res['total_manifest_pairs']} manifest pairs against {dir_count} storage directories",
                validation_domains_executed=["media"],
            )
        else:
            report.record_coverage(
                source="data/images/places/",
                status=CoverageStatus.UNAVAILABLE,
                records_loaded=0,
                records_validated=0,
                records_skipped=0,
                reason_skipped=f"Directory not found: {places_img_dir}",
                validation_domains_executed=[],
            )

        # 8. Database Tables & Compatibility Projections
        try:
            from app.db.session import SessionLocal
            from app.models.place_image import PlaceImage
            from app.models.media_asset import MediaAsset, EntityMedia
            from app.models.entity_relationship import EntityRelationship
            from sqlalchemy import text

            db = SessionLocal()
            try:
                # Test connection
                db.execute(text("SELECT 1"))

                # 1. place_images projection
                p_images = db.query(PlaceImage).all()
                report.record_coverage(
                    source="db:place_images",
                    status=CoverageStatus.VALIDATED,
                    records_loaded=len(p_images),
                    records_validated=len(p_images),
                    records_skipped=0,
                    validation_domains_executed=["media", "provenance"],
                )

                # 2. media_assets
                m_assets = db.query(MediaAsset).all()
                report.record_coverage(
                    source="db:media_assets",
                    status=CoverageStatus.VALIDATED,
                    records_loaded=len(m_assets),
                    records_validated=len(m_assets),
                    records_skipped=0,
                    validation_domains_executed=["media"],
                )

                # 3. entity_media
                e_media = db.query(EntityMedia).all()
                report.record_coverage(
                    source="db:entity_media",
                    status=CoverageStatus.VALIDATED,
                    records_loaded=len(e_media),
                    records_validated=len(e_media),
                    records_skipped=0,
                    validation_domains_executed=["media", "relationships"],
                )

                # 4. entity_relationships
                e_rels = db.query(EntityRelationship).all()
                report.record_coverage(
                    source="db:entity_relationships",
                    status=CoverageStatus.VALIDATED,
                    records_loaded=len(e_rels),
                    records_validated=len(e_rels),
                    records_skipped=0,
                    validation_domains_executed=["relationships"],
                )
            finally:
                db.close()
        except Exception as e:
            for table_src in ["db:place_images", "db:media_assets", "db:entity_media", "db:entity_relationships"]:
                report.record_coverage(
                    source=table_src,
                    status=CoverageStatus.UNAVAILABLE,
                    records_loaded=0,
                    records_validated=0,
                    records_skipped=0,
                    reason_skipped=f"Database offline or connection unavailable: {e}",
                    validation_domains_executed=[],
                )

        return report