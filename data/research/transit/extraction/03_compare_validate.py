#!/usr/bin/env python3
"""
O-TRAVELZ Transit Data Ingestion — Phases 8–12
================================================
Phase 8:  Compare extracted data against existing database/JSON
Phase 9:  Detect version/document conflicts
Phase 10: Canonical stop deduplication analysis
Phase 11: Coordinate status audit
Phase 12: Geographic normalization

Outputs:
  - conflicts.json
  - unresolved.json
  - db_comparison.json
  - deduplication_candidates.json
"""

import json
import re
from pathlib import Path
from collections import defaultdict, Counter

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "transport" / "static"

# ─── Load extraction outputs ────────────────────────────────────────
def load_json(filename: str):
    filepath = SCRIPT_DIR / filename
    if filepath.exists():
        with open(filepath, encoding="utf-8") as f:
            return json.load(f)
    return []


def load_existing_data():
    """Load existing transport data from data/transport/static/"""
    existing = {
        "ama_bus": None,
        "ama_bus_schedule": None,
        "ama_e_ride": None,
        "ama_e_ride_schedule": None,
    }
    for key in existing:
        filepath = DATA_DIR / f"{key}.json"
        if filepath.exists():
            with open(filepath, encoding="utf-8") as f:
                existing[key] = json.load(f)
    return existing


def main():
    print("=" * 60)
    print("O-TRAVELZ Transit Data Ingestion — Phases 8–12")
    print("=" * 60)

    routes = load_json("routes_extracted.json")
    stops = load_json("stops_extracted.json")
    route_stops = load_json("route_stops_extracted.json")
    schedules = load_json("schedules_extracted.json")
    inventory = load_json("transit_document_inventory.json")
    existing = load_existing_data()

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # PHASE 8: EXISTING DATABASE COMPARISON
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n--- PHASE 8: EXISTING DATABASE COMPARISON ---")

    comparison = {
        "matches": [],
        "updates": [],
        "conflicts": [],
        "duplicates": [],
        "new_records": [],
        "existing_only": [],
    }

    # Compare existing Mo Bus / AMA Bus routes
    existing_routes = {}
    if existing["ama_bus"] and "routes" in existing["ama_bus"]:
        for r in existing["ama_bus"]["routes"]:
            route_num = r.get("name", "")
            existing_routes[route_num] = r

    extracted_route_nums = {r["route_number"] for r in routes}

    for route_num, existing_route in existing_routes.items():
        if route_num in extracted_route_nums:
            # Found in both — check for differences
            new_routes = [r for r in routes if r["route_number"] == route_num]
            if new_routes:
                new_route = new_routes[0]
                match_detail = {
                    "route_number": route_num,
                    "existing_name": existing_route.get("route_name"),
                    "new_name": new_route.get("route_name"),
                    "existing_source": existing_route.get("source"),
                    "new_source": new_route.get("source_document"),
                    "status": "match",
                }

                # Check if route name matches
                if existing_route.get("route_name") and new_route.get("route_name"):
                    if existing_route["route_name"].lower() != new_route["route_name"].lower():
                        match_detail["status"] = "updated"
                        match_detail["change_type"] = "route_name_changed"
                        comparison["updates"].append(match_detail)
                    else:
                        comparison["matches"].append(match_detail)
                else:
                    comparison["matches"].append(match_detail)
        else:
            comparison["existing_only"].append({
                "route_number": route_num,
                "existing_name": existing_route.get("route_name"),
                "source": existing_route.get("source"),
                "status": "exists_only_in_current_db",
            })

    # New routes not in existing DB
    for r in routes:
        if r["route_number"] not in existing_routes:
            comparison["new_records"].append({
                "route_number": r["route_number"],
                "route_name": r.get("route_name"),
                "region": r.get("service_area"),
                "source": r.get("source_document"),
                "status": "new_route",
            })

    # Compare existing stops
    existing_stops = set()
    if existing["ama_bus"] and "stops" in existing["ama_bus"]:
        for s in existing["ama_bus"]["stops"]:
            existing_stops.add(s["name"].upper().strip())

    extracted_stop_names = {s["canonical_name"] for s in stops}

    stops_comparison = {
        "existing_stops_count": len(existing_stops),
        "extracted_stops_count": len(extracted_stop_names),
        "matching_stops": len(existing_stops & extracted_stop_names),
        "new_stops": len(extracted_stop_names - existing_stops),
        "existing_only_stops": len(existing_stops - extracted_stop_names),
        "matching_stop_names": sorted(existing_stops & extracted_stop_names),
        "new_stop_names_sample": sorted(list(extracted_stop_names - existing_stops))[:20],
        "existing_only_stop_names": sorted(existing_stops - extracted_stop_names),
    }

    # Compare existing stop sequences (Route 12)
    existing_sequence = {}
    if existing["ama_bus"] and "routes" in existing["ama_bus"]:
        for r in existing["ama_bus"]["routes"]:
            if r.get("stop_sequence"):
                existing_sequence[r["name"]] = [s.upper().strip() for s in r["stop_sequence"]]

    sequence_comparison = {}
    for route_num, existing_seq in existing_sequence.items():
        new_seq_entries = [rs for rs in route_stops if rs["route_number"] == route_num]
        if new_seq_entries:
            new_seq = [rs["stop_name"] for rs in sorted(new_seq_entries, key=lambda x: x["sequence_order"])]
            matching = sum(1 for s in existing_seq if s in new_seq)
            sequence_comparison[route_num] = {
                "existing_stops": len(existing_seq),
                "new_stops": len(new_seq),
                "matching": matching,
                "existing_sequence": existing_seq[:5],
                "new_sequence": new_seq[:5],
                "status": "needs_review" if matching < min(len(existing_seq), len(new_seq)) * 0.5 else "mostly_matching",
            }

    # E-Ride comparison
    e_ride_comparison = None
    if existing["ama_e_ride"]:
        e_ride_routes = existing["ama_e_ride"].get("routes", [])
        e_ride_comparison = {
            "existing_e_ride_routes": len(e_ride_routes),
            "note": "E-Ride data is not in the official PDFs being processed. Existing E-Ride data preserved as-is.",
        }

    comparison["stops_comparison"] = stops_comparison
    comparison["sequence_comparison"] = sequence_comparison
    comparison["e_ride_comparison"] = e_ride_comparison

    print(f"  Route matches: {len(comparison['matches'])}")
    print(f"  Route updates: {len(comparison['updates'])}")
    print(f"  New routes: {len(comparison['new_records'])}")
    print(f"  Existing-only routes: {len(comparison['existing_only'])}")
    print(f"  Stop overlap: {stops_comparison['matching_stops']} matching out of {stops_comparison['existing_stops_count']} existing / {stops_comparison['extracted_stops_count']} extracted")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # PHASE 9: VERSION / DOCUMENT CONFLICTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n--- PHASE 9: DOCUMENT CONFLICTS ---")

    conflicts = []
    unresolved = []

    # Check for routes appearing in multiple documents
    route_sources = defaultdict(list)
    for r in routes:
        route_sources[r["route_number"]].append({
            "source": r["source_document"],
            "effective_date": r["effective_date"],
            "route_name": r["route_name"],
            "region": r["service_area"],
        })

    for route_num, sources in route_sources.items():
        if len(sources) > 1:
            # Multiple sources for same route
            dates = [s["effective_date"] for s in sources if s["effective_date"]]
            unique_dates = set(dates)
            if len(unique_dates) > 1:
                # Different effective dates — potential version conflict
                conflicts.append({
                    "type": "route_version_conflict",
                    "route_number": route_num,
                    "sources": sources,
                    "resolution": "use_latest_effective_date",
                    "confidence": "high" if len(unique_dates) == 2 else "medium",
                })
            elif len(set(s["region"] for s in sources)) > 1:
                # Same route number in different regions — not really a conflict
                pass
            else:
                # Same date, same region, multiple docs — check for name differences
                names = set(s["route_name"] for s in sources if s["route_name"])
                if len(names) > 1:
                    conflicts.append({
                        "type": "route_name_discrepancy",
                        "route_number": route_num,
                        "names": list(names),
                        "sources": sources,
                        "resolution": "UNRESOLVED_CONFLICT",
                        "confidence": "low",
                    })

    # Check for schedule conflicts (same route, different times)
    route_schedules = defaultdict(list)
    for s in schedules:
        key = (s["route_number"], s["terminus"])
        route_schedules[key].append(s)

    for key, sched_list in route_schedules.items():
        if len(sched_list) > 1:
            # Check if they come from different documents
            unique_docs = set(s["source_document"] for s in sched_list)
            if len(unique_docs) > 1:
                conflicts.append({
                    "type": "schedule_conflict",
                    "route_number": key[0],
                    "terminus": key[1],
                    "documents": list(unique_docs),
                    "resolution": "use_latest_effective_date",
                    "confidence": "medium",
                })

    # Check for stoppage vs schedule document conflicts
    # (e.g., Berhampur has both a stoppage doc and a schedule doc)
    stoppage_routes = defaultdict(set)
    schedule_routes_set = defaultdict(set)
    for rs in route_stops:
        stoppage_routes[rs["source_document"]].add(rs["route_number"])
    for s in schedules:
        schedule_routes_set[s["source_document"]].add(s["route_number"])

    # Find cases where route exists in stoppage doc but not in schedule
    for doc, stop_routes in stoppage_routes.items():
        for sched_doc, sched_routes in schedule_routes_set.items():
            # Same region check
            overlap = stop_routes & sched_routes
            missing_from_schedule = stop_routes - sched_routes
            missing_from_stoppages = sched_routes - stop_routes
            if overlap and (missing_from_schedule or missing_from_stoppages):
                # Only report if they're from the same region
                pass  # This is expected — stoppage docs might cover routes not in schedule

    print(f"  Total conflicts found: {len(conflicts)}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # PHASE 10: CANONICAL STOP DEDUPLICATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n--- PHASE 10: STOP DEDUPLICATION ---")

    dedup_candidates = []

    # Group stops by normalized name
    name_groups = defaultdict(list)
    for s in stops:
        name_groups[s["canonical_name"]].append(s)

    # Find potential duplicates by similarity
    all_names = list(name_groups.keys())

    # Simple similarity: check for names that differ only by suffix/abbreviation
    abbreviations = {
        "SQUARE": "SQ",
        "STATION": "STN",
        "RAILWAY": "RLY",
        "HOSPITAL": "HOSP",
        "COLLEGE": "COLL",
        "TEMPLE": "TMPL",
        "NAGAR": "NGR",
        "CHOWK": "CHOWK",
        "CHAKA": "CHAKA",
    }

    # Check for exact duplicates across different cities
    cross_city_candidates = []
    for name, entries in name_groups.items():
        cities = set(e["city"] for e in entries if e.get("city"))
        if len(cities) > 1:
            cross_city_candidates.append({
                "stop_name": name,
                "cities": list(cities),
                "note": "Same stop name appears in multiple cities — likely different physical stops",
                "recommendation": "keep_separate",
            })

    # Check for near-duplicates within same city
    within_city_candidates = []
    city_names = defaultdict(list)
    for name, entries in name_groups.items():
        for e in entries:
            city = e.get("city") or "unknown"
            city_names[city].append(name)

    for city, names in city_names.items():
        names_sorted = sorted(names)
        for i in range(len(names_sorted)):
            for j in range(i + 1, min(i + 5, len(names_sorted))):
                name_a = names_sorted[i]
                name_b = names_sorted[j]
                # Check if one is a substring of another
                if name_a in name_b or name_b in name_a:
                    if name_a != name_b:
                        within_city_candidates.append({
                            "stop_a": name_a,
                            "stop_b": name_b,
                            "city": city,
                            "similarity_type": "substring",
                            "recommendation": "review",
                        })

    # Check for numbered variants (e.g., "CITY COLLEGE BERHAMPUR 1")
    numbered_variants = []
    for name in all_names:
        m = re.match(r'^(.+?)\s+(\d+)$', name)
        if m:
            base = m.group(1)
            if base in name_groups:
                numbered_variants.append({
                    "base_name": base,
                    "variant": name,
                    "note": "Numbered variant — likely a directional/return stop at same location",
                    "recommendation": "keep_separate_if_route_direction_differs",
                })

    dedup_report = {
        "total_unique_canonical_names": len(name_groups),
        "cross_city_same_name": cross_city_candidates,
        "within_city_near_duplicates": within_city_candidates,
        "numbered_variants": numbered_variants,
        "multi_source_stops": [
            {
                "stop_name": name,
                "sources": [e["source_document"] for e in entries],
                "note": "Same stop confirmed across multiple official documents",
            }
            for name, entries in name_groups.items()
            if len(set(e["source_document"] for e in entries)) > 1
        ],
    }

    print(f"  Cross-city same-name stops: {len(cross_city_candidates)}")
    print(f"  Within-city near-duplicates: {len(within_city_candidates)}")
    print(f"  Numbered variants: {len(numbered_variants)}")
    print(f"  Multi-source confirmed stops: {len(dedup_report['multi_source_stops'])}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # PHASE 11: COORDINATE STATUS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n--- PHASE 11: COORDINATES ---")

    coord_status = {
        "total_stops": len(stops),
        "official_coordinates": 0,
        "verified_coordinates": 0,
        "geocoded_coordinates": 0,
        "unresolved_coordinates": 0,
    }

    for s in stops:
        status = s.get("coordinate_status", "unresolved")
        if status == "official":
            coord_status["official_coordinates"] += 1
        elif status == "verified":
            coord_status["verified_coordinates"] += 1
        elif status == "geocoded":
            coord_status["geocoded_coordinates"] += 1
        else:
            coord_status["unresolved_coordinates"] += 1

    print(f"  Official coordinates: {coord_status['official_coordinates']}")
    print(f"  Verified coordinates: {coord_status['verified_coordinates']}")
    print(f"  Geocoded coordinates: {coord_status['geocoded_coordinates']}")
    print(f"  Unresolved (need geocoding): {coord_status['unresolved_coordinates']}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # PHASE 12: GEOGRAPHIC NORMALIZATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n--- PHASE 12: GEOGRAPHIC NORMALIZATION ---")

    geo_coverage = {
        "regions": defaultdict(lambda: {"routes": 0, "stops": 0, "schedules": 0}),
        "cities": defaultdict(lambda: {"stops": 0}),
    }

    for r in routes:
        region = r.get("service_area", "unknown")
        geo_coverage["regions"][region]["routes"] += 1

    for s in stops:
        city = s.get("city", "unknown")
        geo_coverage["cities"][city]["stops"] += 1

    for sc in schedules:
        # Find region from route
        matching_routes = [r for r in routes if r["route_number"] == sc["route_number"]]
        if matching_routes:
            region = matching_routes[0].get("service_area", "unknown")
            geo_coverage["regions"][region]["schedules"] += 1

    # Convert defaultdicts to regular dicts for JSON
    geo_report = {
        "regions": {k: dict(v) for k, v in geo_coverage["regions"].items()},
        "cities": {k: dict(v) for k, v in geo_coverage["cities"].items()},
        "districts_represented": [
            "Khordha", "Cuttack", "Puri", "Sundargarh", "Sambalpur",
            "Jharsuguda", "Ganjam", "Keonjhar",
        ],
        "note": "District assignments are based on known city-district mappings, not from the PDFs directly.",
    }

    print("  Geographic coverage:")
    for region, data in sorted(geo_report["regions"].items()):
        print(f"    {region}: {data['routes']} routes, {data.get('stops', 0)} stops, {data.get('schedules', 0)} schedules")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # BUILD UNRESOLVED LIST
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    # Routes without schedules
    routes_with_schedules = set(s["route_number"] for s in schedules)
    routes_without_schedules = [
        {
            "route_number": r["route_number"],
            "route_name": r.get("route_name"),
            "region": r.get("service_area"),
            "reason": "no_schedule_found_in_official_documents",
        }
        for r in routes
        if r["route_number"] not in routes_with_schedules
    ]

    # Routes without stop sequences
    routes_with_stops = set(rs["route_number"] for rs in route_stops)
    routes_without_stops = [
        {
            "route_number": r["route_number"],
            "route_name": r.get("route_name"),
            "region": r.get("service_area"),
            "reason": "no_detailed_stop_sequence_found",
        }
        for r in routes
        if r["route_number"] not in routes_with_stops
    ]

    # Routes with partial data (schedule but no stops, or vice versa)
    routes_schedule_only = routes_with_schedules - routes_with_stops
    routes_stops_only = routes_with_stops - routes_with_schedules

    unresolved = {
        "routes_without_schedules": routes_without_schedules,
        "routes_without_stop_sequences": routes_without_stops,
        "routes_with_schedule_but_no_stops": sorted(routes_schedule_only),
        "routes_with_stops_but_no_schedule": sorted(routes_stops_only),
        "stops_needing_geocoding": coord_status["unresolved_coordinates"],
        "mobus_network_map_not_extracted": {
            "document": "Latest_MO_BUS_Full_Network_Final_English_2_For_Odia_and_English_compressed.pdf",
            "reason": "Image-based PDF with 0 extractable text. Contains network map. OCR or visual inspection required for route details.",
            "status": "unresolved",
        },
        "rourkela_routes_partial_text": {
            "document": "01dd4cef-b9c3-4a5a-8b3d-00a80578469d_Rourkela-Updated-Route-w.e.f-11.04.26.pdf",
            "reason": "Mixed text/image document. Only 3,971 chars extracted from 28 pages. May contain additional stop details in image form.",
            "status": "partial_extraction",
        },
    }

    # ─── Write outputs ───────────────────────────────────────────
    print("\n--- WRITING OUTPUTS ---")

    def write_json(filename: str, data):
        filepath = SCRIPT_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        print(f"  Written: {filename}")

    write_json("db_comparison.json", comparison)
    write_json("conflicts.json", conflicts)
    write_json("unresolved.json", unresolved)
    write_json("deduplication_candidates.json", dedup_report)
    write_json("coordinate_status.json", coord_status)
    write_json("geographic_coverage.json", geo_report)

    print(f"\n{'='*60}")
    print("PHASES 8–12 COMPLETE")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
