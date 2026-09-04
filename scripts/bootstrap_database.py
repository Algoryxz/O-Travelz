#!/usr/bin/env python3
"""
Canonical Authoritative Database Bootstrap and Invariant Verification Script.

Sequentially and idempotently loads:
1. 161 Canonical Sanctuary Places, 12 Categories, 12 Interests (data/places/)
2. 43 Verified Food Research Places (data/research/food/odisha_food_research.json)
3. 3 Transport Providers, 154 Routes, 1,430 Stops, 1,487 Links, 302 Schedules (data/research/transit/extraction/)
4. 50 Canonical PlaceImage records (data/images/sources/manifest.json)

Verifies all database invariants and exits with code 0 on success, or non-zero on failure.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = WORKSPACE_ROOT / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.category import Category
from app.models.interest import Interest
from app.models.place import Place
from app.models.place_image import PlaceImage
from app.models.transport import (
    TransportProvider,
    Route,
    Stop,
    RouteStop,
    ScheduledTripGroup,
)


def bootstrap_database() -> int:
    print("=" * 70)
    print("O-TRAVELZ AUTHORITATIVE DATABASE BOOTSTRAP & INVARIANT VERIFICATION")
    print("=" * 70)

    db: Session = SessionLocal()
    try:
        # ---------------------------------------------------------------------
        # 1. Import Canonical Places, Categories & Interests (161 places)
        # ---------------------------------------------------------------------
        print("\n[1/4] Importing canonical places, categories, and interests...")
        from scripts.import_places import (
            load_categories,
            load_interests,
            load_places,
            import_records,
        )

        cats = load_categories()
        ints = load_interests()
        pls = load_places()

        place_import_res = import_records(db, cats, pls, interests=ints)
        db.commit()
        print(
            f"      Canonical places import complete: "
            f"{place_import_res.categories_created} categories, "
            f"{place_import_res.interests_created} interests, "
            f"{place_import_res.places_created} places created."
        )

        # ---------------------------------------------------------------------
        # 2. Import Verified Food Research Places (43 food places -> 204 total)
        # ---------------------------------------------------------------------
        print("\n[2/4] Importing verified food research dataset...")
        from scripts.import_food_research import import_food_research
        food_res = import_food_research(dry_run=False)
        print(
            f"      Food places import complete: "
            f"{food_res.get('inserted', 0)} inserted, {food_res.get('updated', 0)} updated."
        )

        # ---------------------------------------------------------------------
        # 3. Import Official Odisha Transit Network & Intelligence Layer
        # ---------------------------------------------------------------------
        print("\n[3/5] Importing official Odisha transit network...")
        from app.transport.importer import OfficialTransitImporter
        transit_importer = OfficialTransitImporter(db)
        transit_summary = transit_importer.run_import()
        print(
            f"      Transit import complete: "
            f"{transit_summary.providers_upserted} providers, "
            f"{transit_summary.routes_upserted} routes, "
            f"{transit_summary.stops_upserted} stops, "
            f"{transit_summary.route_stops_upserted} route-stops, "
            f"{transit_summary.schedules_upserted} schedule groups."
        )

        # Synchronize authoritative canonical stops coordinates and locality contracts
        print("\n[3b/5] Synchronizing authoritative canonical transit stops into database...")
        from scripts.promote_ama_bus_c3_to_canonical import sync_canonical_stops_to_database
        sync_result = sync_canonical_stops_to_database(db)
        print(
            f"      Canonical stops synchronized: "
            f"{sync_result['updated']} stops updated "
            f"({sync_result['geocoded']} geocoded, {sync_result['unresolved']} unresolved)."
        )

        print("\n[4/5] Importing Phase 6A transit intelligence research layer...")
        from app.transport.research_importer import TransitIntelligenceImporter
        intel_importer = TransitIntelligenceImporter(db)
        intel_report = intel_importer.import_all()
        print(
            f"      Transit intelligence import complete: "
            f"{intel_report.routes_count} routes, "
            f"{intel_report.corridors_count} corridors, "
            f"{intel_report.stops_count} stop records, "
            f"{intel_report.evidence_count} citations."
        )

        # ---------------------------------------------------------------------
        # 4. Synchronize Place Images (50 canonical records from manifest)
        # ---------------------------------------------------------------------
        print("\n[5/5] Synchronizing database PlaceImage records...")
        manifest_path = WORKSPACE_ROOT / "data" / "images" / "sources" / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        img_count = 0
        for m in manifest:
            pid = m["place_id"]
            place = db.query(Place).filter(Place.research_id == pid).first()
            if not place:
                place = db.query(Place).filter(Place.name.ilike(m["place_name"].strip())).first()
            if place:
                img = db.query(PlaceImage).filter(PlaceImage.place_id == place.id).first()
                if not img:
                    img = PlaceImage(place_id=place.id)
                    db.add(img)
                img.storage_key = f"{pid}/{m['asset_hash']}"
                img.url = f"/static/images/places/{pid}/{m['asset_hash']}/hero.webp"
                img.card_url = f"/static/images/places/{pid}/{m['asset_hash']}/card.webp"
                img.thumbnail_url = f"/static/images/places/{pid}/{m['asset_hash']}/thumbnail.webp"
                img.content_sha256 = m["content_sha256"]
                img.source_name = m["source_name"]
                img.source_url = m["source_url"]
                img.creator = m["creator"]
                img.license = m["license"]
                img.attribution = m["attribution"]
                img.title = m["title"]
                img.alt_text = m["alt_text"]
                img.is_primary = True
                img_count += 1
        db.commit()
        print(f"      PlaceImage sync complete: {img_count} images mapped.")

        # ---------------------------------------------------------------------
        # 5. Strict Forensic Invariant Verification
        # ---------------------------------------------------------------------
        print("\n" + "=" * 70)
        print("VERIFYING AUTHORITATIVE DATABASE INVARIANTS")
        print("=" * 70)

        total_places = db.query(Place).count()
        total_categories = db.query(Category).count()
        total_interests = db.query(Interest).count()
        total_providers = db.query(TransportProvider).count()
        total_routes = db.query(Route).count()
        total_stops = db.query(Stop).count()
        geocoded_stops = db.query(Stop).filter(Stop.location.isnot(None)).count()
        unresolved_stops = db.query(Stop).filter(Stop.location.is_(None)).count()
        total_route_stops = db.query(RouteStop).count()
        total_schedules = db.query(ScheduledTripGroup).count()

        all_groups = db.query(ScheduledTripGroup).all()
        total_departures = sum(len(g.departure_times_chronological or []) for g in all_groups)
        total_images = db.query(PlaceImage).count()

        from app.models.transit_intelligence import (
            EvidenceCitation,
            RouteIntelligence,
            RouteCorridorIntelligence,
            StopIntelligence,
        )
        total_route_intel = db.query(RouteIntelligence).count()
        total_corridor_intel = db.query(RouteCorridorIntelligence).count()
        total_stop_intel = db.query(StopIntelligence).count()
        total_evidence = db.query(EvidenceCitation).count()
        exact_routes = db.query(RouteIntelligence).filter(RouteIntelligence.geometry_status == "EXACT").count()

        # Authoritative canonical expectations from build report & route_stops (C4E / C4.1)
        build_rep_path = WORKSPACE_ROOT / "data" / "transport" / "canonical" / "build_report.json"
        build_rep = json.loads(build_rep_path.read_text(encoding="utf-8")) if build_rep_path.exists() else {}
        expected_geocoded = build_rep.get("outputs", {}).get("routable_stops_total", 173)
        expected_unresolved = build_rep.get("outputs", {}).get("coordinate_unresolved", 1257)

        can_rs_path = WORKSPACE_ROOT / "data" / "transport" / "canonical" / "route_stops.json"
        if can_rs_path.exists():
            with open(can_rs_path, encoding="utf-8") as fh:
                can_rs_groups = json.load(fh)
            expected_route_stops = sum(len(g.get("stops", [])) for g in can_rs_groups)
        else:
            expected_route_stops = 1491

        print(f"  Places:             {total_places:<6} (Expected: 204 = 161 sanctuaries + 43 food)")
        print(f"  Categories:         {total_categories:<6} (Expected: >= 19)")
        print(f"  Interests:          {total_interests:<6} (Expected: 12)")
        print(f"  Providers:          {total_providers:<6} (Expected: 3)")
        print(f"  Routes:             {total_routes:<6} (Expected: 154)")
        print(f"  Stops:              {total_stops:<6} (Expected: 1,430)")
        print(f"  Geocoded Stops:     {geocoded_stops:<6} (Expected: {expected_geocoded})")
        print(f"  Unresolved Stops:   {unresolved_stops:<6} (Expected: {expected_unresolved})")
        print(f"  Route-Stops:        {total_route_stops:<6} (Expected: {expected_route_stops})")
        print(f"  Schedule Groups:    {total_schedules:<6} (Expected: 302)")
        print(f"  Departures:         {total_departures:<6} (Expected: 5,553)")
        print(f"  Place Images:       {total_images:<6} (Expected: >= 50)")
        print(f"  Route Intelligence: {total_route_intel:<6} (Expected: 154)")
        print(f"  Corridors:          {total_corridor_intel:<6} (Expected: 154)")
        print(f"  Stop Intelligence:  {total_stop_intel:<6} (Expected: 1487)")
        print(f"  Evidence Citations: {total_evidence:<6} (Expected: >= 10)")
        print(f"  EXACT Routes:       {exact_routes:<6} (Expected: >= 1)")

        # Invariant Assertions
        assert total_places == 204, f"FAIL: Expected 204 places, found {total_places}"
        assert total_categories >= 19, f"FAIL: Expected >= 19 categories, found {total_categories}"
        assert total_interests == 12, f"FAIL: Expected 12 interests, found {total_interests}"
        assert total_providers == 3, f"FAIL: Expected 3 providers, found {total_providers}"
        assert total_routes == 154, f"FAIL: Expected 154 routes, found {total_routes}"
        assert total_stops == 1430, f"FAIL: Expected 1430 stops, found {total_stops}"
        assert geocoded_stops == expected_geocoded, f"FAIL: Expected {expected_geocoded} geocoded stops, found {geocoded_stops}"
        assert unresolved_stops == expected_unresolved, f"FAIL: Expected {expected_unresolved} unresolved stops, found {unresolved_stops}"
        assert total_route_stops == expected_route_stops, f"FAIL: Expected {expected_route_stops} route stops, found {total_route_stops}"
        assert total_schedules == 302, f"FAIL: Expected 302 schedule groups, found {total_schedules}"
        assert total_departures == 5553, f"FAIL: Expected 5553 departures, found {total_departures}"
        assert total_images >= 50, f"FAIL: Expected >= 50 place images, found {total_images}"
        assert total_route_intel == 154, f"FAIL: Expected 154 route intelligence records, found {total_route_intel}"
        assert total_corridor_intel == 154, f"FAIL: Expected 154 corridors, found {total_corridor_intel}"
        assert total_stop_intel == 1487, f"FAIL: Expected 1487 stop intelligence records, found {total_stop_intel}"
        assert total_evidence >= 10, f"FAIL: Expected >= 10 evidence citations, found {total_evidence}"
        assert exact_routes >= 1, f"FAIL: Expected >= 1 EXACT route, found {exact_routes}"

        # Hard Parity Gate: DB RouteStop count == flattened canonical RouteStop count
        assert total_route_stops == expected_route_stops, (
            f"PARITY GATE FAILURE: DB RouteStop count ({total_route_stops}) != "
            f"flattened canonical count ({expected_route_stops})"
        )

        print("\n[SUCCESS] ALL AUTHORITATIVE DATABASE INVARIANTS VERIFIED!")
        print("=" * 70)
        return 0

    except Exception as exc:
        db.rollback()
        print(f"\n[FATAL ERROR] Bootstrap failed: {exc}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(bootstrap_database())
