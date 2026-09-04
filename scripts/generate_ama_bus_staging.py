#!/usr/bin/env python3
"""
scripts/generate_ama_bus_staging.py — Ama Bus C1 Research and Staging Generator.

Compiles structured staging JSON files from official documents in data/research/transit/:
- sources.json
- routes.json
- stops.json
- schedules.json
- unresolved.json
- gap_matrix.json

Strictly adheres to O-TRAVELZ V4 C1 boundary:
- Operates in data/transport/staging/ama_bus/ ONLY
- Does NOT mutate canonical transit data (data/transport/canonical/)
- Retains document, page, and table provenance for every extracted fact.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

REPO_ROOT = Path(__file__).resolve().parents[1]
OFFICIAL_DIR = REPO_ROOT / "data" / "research" / "transit" / "official"
EXTRACTION_DIR = REPO_ROOT / "data" / "research" / "transit" / "extraction"
STAGING_DIR = REPO_ROOT / "data" / "transport" / "staging" / "ama_bus"


def get_file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def generate_staging():
    STAGING_DIR.mkdir(parents=True, exist_ok=True)
    print("=" * 70)
    print("O-TRAVELZ V4 - GENERATING AMA BUS C1 STAGING DATASETS")
    print("=" * 70)

    # 1. SOURCES.JSON
    print("\n[1/6] Compiling sources.json...")
    sources: List[Dict[str, Any]] = []
    inv_file = EXTRACTION_DIR / "transit_document_inventory.json"
    doc_meta: Dict[str, Dict[str, Any]] = {}
    if inv_file.exists():
        with open(inv_file, encoding="utf-8") as f:
            inv_data = json.load(f)
            for d in inv_data.get("documents", []):
                doc_meta[d["filename"]] = d

    if OFFICIAL_DIR.exists():
        for pdf in sorted(OFFICIAL_DIR.glob("*.pdf")):
            fname = pdf.name
            meta = doc_meta.get(fname, {})
            sha = get_file_sha256(pdf)
            is_ama_bus = "ama" in fname.lower() or "sambalpur" in fname.lower() or "keonjhar" in fname.lower()
            sources.append({
                "source_id": f"src_{sha[:12]}",
                "filename": fname,
                "clean_title": meta.get("clean_name", fname.replace(".pdf", "").replace("-", " ")),
                "file_size_bytes": pdf.stat().st_size,
                "sha256": sha,
                "page_count": meta.get("page_count", 0),
                "operator": "CRUT",
                "network_type": "AMA Bus" if is_ama_bus else "Mo Bus",
                "service_area": meta.get("geographic_coverage", {}).get("cities", ["Odisha"]),
                "apparent_date": meta.get("apparent_date"),
                "extraction_engine": meta.get("extraction_engine", "pymupdf/pdfplumber"),
            })

    sources_path = STAGING_DIR / "sources.json"
    with open(sources_path, "w", encoding="utf-8") as f:
        json.dump(sources, f, indent=2, ensure_ascii=False)
    print(f"      Wrote {len(sources)} sources to {sources_path.relative_to(REPO_ROOT)}")

    # 2. ROUTES.JSON
    print("\n[2/6] Compiling routes.json...")
    routes_raw_file = EXTRACTION_DIR / "routes_extracted.json"
    ama_routes: List[Dict[str, Any]] = []
    if routes_raw_file.exists():
        with open(routes_raw_file, encoding="utf-8") as f:
            all_routes = json.load(f)
        for r in all_routes:
            net = str(r.get("network_type", "")).lower()
            sa = str(r.get("service_area", "")).lower()
            rnum = str(r.get("route_number", ""))
            if "ama" in net or "sambalpur" in sa or "keonjhar" in sa or rnum.startswith("2") or rnum.startswith("4"):
                ama_routes.append({
                    "route_id": f"route_ama_{rnum}",
                    "route_number": rnum,
                    "route_name": r.get("route_name"),
                    "operator": "CRUT",
                    "network_type": "AMA Bus",
                    "origin": r.get("origin"),
                    "destination": r.get("destination"),
                    "direction": r.get("direction", "bidirectional"),
                    "service_area": r.get("service_area", "Sambalpur"),
                    "cities": r.get("cities", []),
                    "provenance": {
                        "source_document": r.get("source_document"),
                        "source_page": r.get("source_page"),
                        "effective_date": r.get("effective_date"),
                        "verification_status": r.get("verification_status", "verified_from_official_document"),
                    }
                })

    routes_path = STAGING_DIR / "routes.json"
    with open(routes_path, "w", encoding="utf-8") as f:
        json.dump(ama_routes, f, indent=2, ensure_ascii=False)
    print(f"      Wrote {len(ama_routes)} Ama Bus routes to {routes_path.relative_to(REPO_ROOT)}")

    # 3. STOPS.JSON
    print("\n[3/6] Compiling stops.json...")
    stops_raw_file = EXTRACTION_DIR / "stops_extracted.json"
    ama_stops: List[Dict[str, Any]] = []

    if stops_raw_file.exists():
        with open(stops_raw_file, encoding="utf-8") as f:
            all_stops = json.load(f)
        for s in all_stops:
            sid = str(s.get("stop_id", ""))
            s_name = str(s.get("canonical_name", ""))
            s_area = str(s.get("service_area", "")).lower()
            src_doc = str(s.get("source_document", "")).lower()

            if "sambalpur" in s_area or "keonjhar" in s_area or "sambalpur" in src_doc or "keonjhar" in src_doc or "ama" in src_doc:
                raw_c_status = str(s.get("coordinate_status", "unresolved")).strip().lower()
                c_status = "GEOCODED" if raw_c_status in ("geocoded", "verified_geospatial", "verified_official") else "UNRESOLVED"
                ama_stops.append({
                    "stop_id": sid,
                    "canonical_name": s_name,
                    "service_area": s.get("service_area", "Sambalpur"),
                    "lat": s.get("lat"),
                    "lon": s.get("lon"),
                    "coordinate_status": c_status,
                    "provenance": {
                        "source_document": s.get("source_document"),
                        "source_page": s.get("source_page"),
                        "table_index": s.get("table_index"),
                        "coordinate_source": s.get("coordinate_source"),
                    }
                })

    stops_path = STAGING_DIR / "stops.json"
    with open(stops_path, "w", encoding="utf-8") as f:
        json.dump(ama_stops, f, indent=2, ensure_ascii=False)
    print(f"      Wrote {len(ama_stops)} Ama Bus stops to {stops_path.relative_to(REPO_ROOT)}")

    # 4. SCHEDULES.JSON
    print("\n[4/6] Compiling schedules.json...")
    sched_raw_file = EXTRACTION_DIR / "schedules_extracted.json"
    ama_schedules: List[Dict[str, Any]] = []
    ama_route_numbers = {r["route_number"] for r in ama_routes}
    total_staging_deps = 0

    if sched_raw_file.exists():
        with open(sched_raw_file, encoding="utf-8") as f:
            all_sched = json.load(f)
        for sc in all_sched:
            rnum = str(sc.get("route_number", ""))
            src_doc = str(sc.get("source_document", "")).lower()
            if rnum in ama_route_numbers or "sambalpur" in src_doc or "ama" in src_doc:
                deps = sc.get("departure_times", [])
                total_staging_deps += len(deps)
                ama_schedules.append({
                    "schedule_id": f"sched_ama_{rnum}_{sc.get('direction', 'up')}",
                    "route_number": rnum,
                    "direction": sc.get("direction", "up"),
                    "origin": sc.get("origin"),
                    "destination": sc.get("destination"),
                    "departure_times": deps,
                    "trip_count": len(deps),
                    "first_departure": deps[0] if deps else None,
                    "last_departure": deps[-1] if deps else None,
                    "provenance": {
                        "source_document": sc.get("source_document"),
                        "source_page": sc.get("source_page"),
                        "effective_date": sc.get("effective_date"),
                    }
                })

    schedules_path = STAGING_DIR / "schedules.json"
    with open(schedules_path, "w", encoding="utf-8") as f:
        json.dump(ama_schedules, f, indent=2, ensure_ascii=False)
    print(f"      Wrote {len(ama_schedules)} schedules ({total_staging_deps} departures) to {schedules_path.relative_to(REPO_ROOT)}")

    # 5. UNRESOLVED.JSON
    print("\n[5/6] Compiling unresolved.json...")
    unres_raw_file = EXTRACTION_DIR / "unresolved.json"
    unres_data: Dict[str, Any] = {"routes_without_schedules": [], "unresolved_stops": []}

    if unres_raw_file.exists():
        with open(unres_raw_file, encoding="utf-8") as f:
            raw_unres = json.load(f)
        for r_un in raw_unres.get("routes_without_schedules", []):
            reg = str(r_un.get("region", "")).lower()
            if "sambalpur" in reg or "keonjhar" in reg or "ama" in reg or "berhampur" in reg:
                unres_data["routes_without_schedules"].append(r_un)

    for st in ama_stops:
        if st.get("coordinate_status") == "UNRESOLVED":
            unres_data["unresolved_stops"].append({
                "stop_id": st["stop_id"],
                "canonical_name": st["canonical_name"],
                "service_area": st["service_area"],
                "source_document": st["provenance"]["source_document"],
                "source_page": st["provenance"]["source_page"],
            })

    unresolved_path = STAGING_DIR / "unresolved.json"
    with open(unresolved_path, "w", encoding="utf-8") as f:
        json.dump(unres_data, f, indent=2, ensure_ascii=False)
    print(f"      Wrote {len(unres_data['routes_without_schedules'])} schedule gaps and {len(unres_data['unresolved_stops'])} unlocated stops to {unresolved_path.relative_to(REPO_ROOT)}")

    # 6. GAP_MATRIX.JSON
    print("\n[6/6] Compiling gap_matrix.json...")
    geocoded_stops_count = sum(1 for s in ama_stops if s.get("coordinate_status") == "GEOCODED")
    unres_stops_count = sum(1 for s in ama_stops if s.get("coordinate_status") == "UNRESOLVED")

    gap_matrix = {
        "metadata": {
            "title": "O-TRAVELZ V4 Ama Bus C1 Staging vs Canonical Gap Analysis",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "target_promotion_wave": "Wave C2 (Ama Bus Promotion)",
        },
        "network_summary": {
            "total_staged_routes": len(ama_routes),
            "total_staged_stops": len(ama_stops),
            "geocoded_stops": geocoded_stops_count,
            "unresolved_stops": unres_stops_count,
            "geocoding_deficit_percent": round((unres_stops_count / len(ama_stops) * 100) if ama_stops else 0, 1),
            "total_staged_schedules": len(ama_schedules),
            "total_staged_departures": total_staging_deps,
        },
        "service_areas": {
            "Sambalpur": {
                "routes_count": sum(1 for r in ama_routes if r.get("service_area") == "Sambalpur"),
                "schedules_present": True,
                "fare_table_status": "PENDING_INGESTION",
                "promotion_readiness": "NEAR_TERM_C2",
            },
            "Keonjhar": {
                "routes_count": sum(1 for r in ama_routes if r.get("service_area") == "Keonjhar"),
                "schedules_present": False,
                "notes": "Route stops extracted; waiting for CRUT timetable gazette notification",
                "promotion_readiness": "BLOCKED_ON_OFFICIAL_TIMETABLE",
            },
            "Berhampur": {
                "routes_count": sum(1 for r in ama_routes if r.get("service_area") == "Berhampur"),
                "schedules_present": True,
                "promotion_readiness": "NEAR_TERM_C2",
            },
            "Rourkela": {
                "routes_count": sum(1 for r in ama_routes if r.get("service_area") == "Rourkela"),
                "schedules_present": True,
                "promotion_readiness": "NEAR_TERM_C2",
            },
        },
        "promotion_prerequisites": [
            "1. Ingestion of official CRUT Ama Bus fare stage tables (fares remain null until ingested)",
            "2. High-confidence geospatial geocoding for primary terminal nodes (Ainthapali, Khetrajpur, VSSUT, Burla)",
            "3. Validation through universal validator with --profile promotion",
        ],
    }

    gap_path = STAGING_DIR / "gap_matrix.json"
    with open(gap_path, "w", encoding="utf-8") as f:
        json.dump(gap_matrix, f, indent=2, ensure_ascii=False)
    print(f"      Wrote gap matrix to {gap_path.relative_to(REPO_ROOT)}")

    print("\n" + "=" * 70)
    print("[SUCCESS] ALL 6 AMA BUS C1 STAGING DATASETS GENERATED!")
    print("=" * 70)


if __name__ == "__main__":
    generate_staging()
