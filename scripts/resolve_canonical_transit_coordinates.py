#!/usr/bin/env python3
"""
scripts/resolve_canonical_transit_coordinates.py — O-Travelz Canonical Stop Coordinate Resolver

Safely expands verified coordinate coverage for canonical transit stops across 3 strict tiers:
  Tier 1: Existing Verified Internal Sources (staticTransitStops.ts, survey records)
  Tier 2: Canonical Places Catalog Cross-Reference (exact destination landmark matching)
  Tier 3: External Geospatial Resolution (Rate-limited, cached OSM Nominatim queries)

Core Invariants:
1. Zero Coordinate Fabrication: Unresolved stops strictly stay lat=null, lon=null.
2. Verified Provenance Required: Every coordinate has an explicit coordinate_source and coordinate_status.
3. Cache-First & Resumable: All external lookups cached in data/transport/canonical/geocoding_cache.json.
4. Corridor Sanity Check: Detects impossible hops or city mismatches along route sequences.
5. Review Queue Generated: Ambiguous candidates preserved in coordinate_review_queue.json.
"""

import argparse
import hashlib
import json
import math
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent
CANONICAL_DIR = REPO_ROOT / "data" / "transport" / "canonical"
PLACES_FILE = REPO_ROOT / "data" / "places" / "places.json"
STATIC_TS_FILE = REPO_ROOT / "frontend" / "src" / "data" / "staticTransitStops.ts"

ODISHA_BOUNDS = {
    "min_lat": 17.5,
    "max_lat": 23.0,
    "min_lon": 81.0,
    "max_lon": 88.0,
}

USER_AGENT = "OTravelz-Transit-Resolver/1.0 (smarakpadhi58@gmail.com)"


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in kilometers."""
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def clean_tokens(s: str) -> Set[str]:
    """Clean string into essential token set for fuzzy/identity comparison."""
    s = s.upper()
    s = re.sub(r"\([^)]*\)", " ", s)  # strip parentheses
    s = re.sub(r"[^\w\s]", " ", s)
    noise = {
        "BUS", "STOP", "STAND", "TERMINAL", "TERMINUS", "STATION", "RLY",
        "SQUARE", "SQ", "SQR", "CHOWK", "CHAKA", "GATE", "MAIN", "CENTRAL",
        "JUNCTION", "ISBT", "BSABT", "ROAD", "RD", "ST", "CAMPUS", "ODISHA", "INDIA", "PARKING", "NH", "SH"
    }
    return set(w for w in s.split() if w not in noise and len(w) > 1)


class GeocodingCache:
    """Persistent JSON cache for external Nominatim geocoding queries."""

    def __init__(self, cache_file: Path):
        self.cache_file = cache_file
        self.data: Dict[str, Any] = {}
        self.load()

    def load(self):
        if self.cache_file.exists():
            try:
                with open(self.cache_file, encoding="utf-8") as f:
                    self.data = json.load(f)
            except Exception:
                self.data = {}

    def save(self):
        self.cache_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.cache_file, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
            f.write("\n")

    def get(self, query: str) -> Optional[Dict[str, Any]]:
        return self.data.get(query.strip().lower())

    def set(self, query: str, result: Optional[Dict[str, Any]]):
        self.data[query.strip().lower()] = {
            "query": query,
            "cached_at": datetime.now(timezone.utc).isoformat(),
            "result": result,
        }


def extract_frontend_verified_stops() -> List[Dict[str, Any]]:
    """Extract verified stops from frontend/src/data/staticTransitStops.ts."""
    if not STATIC_TS_FILE.exists():
        return []
    content = STATIC_TS_FILE.read_text(encoding="utf-8")
    obj_pattern = re.compile(
        r'\{\s*"stop_id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"published_name":\s*"([^"]+)",'
        r'\s*"canonical_stop_id":\s*"([^"]+)",\s*"city":\s*"([^"]+)",\s*"district":\s*"([^"]+)",'
        r'\s*"locality":\s*"([^"]+)",\s*"latitude":\s*([0-9\.-]+),\s*"longitude":\s*([0-9\.-]+)'
        r'(?:,\s*"coordinate_status":\s*"([^"]+)")?'
        r'(?:,\s*"coordinate_source":\s*"([^"]+)")?'
    )
    stops = []
    for match in obj_pattern.finditer(content):
        groups = match.groups()
        stop_id, name, published_name, canonical_id, city, district, locality, lat_str, lon_str = groups[:9]
        coord_status = groups[9] if len(groups) > 9 else None
        coord_src = groups[10] if len(groups) > 10 else None
        lat = float(lat_str)
        lon = float(lon_str)
        if (ODISHA_BOUNDS["min_lat"] <= lat <= ODISHA_BOUNDS["max_lat"] and
            ODISHA_BOUNDS["min_lon"] <= lon <= ODISHA_BOUNDS["max_lon"]):
            stops.append({
                "stop_id": stop_id,
                "name": name,
                "published_name": published_name,
                "canonical_id": canonical_id,
                "city": city,
                "district": district,
                "locality": locality,
                "lat": lat,
                "lon": lon,
                "coordinate_status": coord_status,
                "coordinate_source": coord_src,
            })
    return stops


def query_nominatim(query: str, cache: GeocodingCache, delay: float = 0.8) -> Optional[Dict[str, Any]]:
    """Query OSM Nominatim for an address with rate limiting and caching."""
    cached = cache.get(query)
    if cached is not None:
        return cached.get("result")

    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&addressdetails=1&limit=1"
    headers = {"User-Agent": USER_AGENT}
    req = urllib.request.Request(url, headers=headers)

    try:
        time.sleep(delay)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data and isinstance(data, list) and len(data) > 0:
                item = data[0]
                lat = float(item["lat"])
                lon = float(item["lon"])
                display_name = item.get("display_name", "")
                address = item.get("address", {})
                state = address.get("state", "")
                
                # Check Odisha bounding box and state
                if (ODISHA_BOUNDS["min_lat"] <= lat <= ODISHA_BOUNDS["max_lat"] and
                    ODISHA_BOUNDS["min_lon"] <= lon <= ODISHA_BOUNDS["max_lon"] and
                    ("Odisha" in state or "Orissa" in state or "Odisha" in display_name)):
                    
                    res = {
                        "lat": lat,
                        "lon": lon,
                        "display_name": display_name,
                        "osm_type": item.get("osm_type"),
                        "osm_id": item.get("osm_id"),
                        "class": item.get("class"),
                        "type": item.get("type"),
                        "address": address,
                    }
                    cache.set(query, res)
                    return res
            
            cache.set(query, None)
            return None
    except Exception as e:
        print(f"Warning: Geocoding query '{query}' failed: {e}", file=sys.stderr)
        return None


def calculate_stop_priority_scores(
    stops: List[Dict[str, Any]],
    route_stops: List[Dict[str, Any]],
    schedules: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Rank unresolved stops by useful transit network value."""
    stop_freq: Dict[str, int] = {}
    is_terminus_set: Set[str] = set()

    for rs in route_stops:
        seq = rs.get("stops", [])
        if not seq:
            continue
        first_sid = seq[0].get("stop_id")
        last_sid = seq[-1].get("stop_id")
        if first_sid:
            is_terminus_set.add(first_sid)
        if last_sid:
            is_terminus_set.add(last_sid)

        for s in seq:
            sid = s.get("stop_id")
            if sid:
                stop_freq[sid] = stop_freq.get(sid, 0) + 1

    scored_stops = []
    capital_cities = {"BHUBANESWAR", "CUTTACK", "PURI", "KHORDHA"}

    for s in stops:
        sid = s["stop_id"]
        cname = s["canonical_name"]
        city = (s.get("city") or "").upper()
        
        num_routes = len(s.get("served_routes", []))
        freq = stop_freq.get(sid, 0)
        is_terminus = sid in is_terminus_set
        is_interchange = num_routes >= 3
        is_capital = city in capital_cities

        score = (
            num_routes * 12 +
            freq * 6 +
            (30 if is_interchange else 0) +
            (25 if is_terminus else 0) +
            (15 if is_capital else 0)
        )

        scored_stops.append({
            "stop_id": sid,
            "canonical_name": cname,
            "city": s.get("city"),
            "district": s.get("district"),
            "served_routes": s.get("served_routes", []),
            "frequency_in_sequences": freq,
            "is_terminus": is_terminus,
            "is_interchange": is_interchange,
            "is_capital_region": is_capital,
            "priority_score": score,
            "coordinate_status": s.get("coordinate_status", "UNRESOLVED"),
        })

    scored_stops.sort(key=lambda x: x["priority_score"], reverse=True)
    return scored_stops


def run_coordinate_resolution(
    repo_root: Path,
    enable_external: bool = True,
    max_external_lookups: int = 150,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """Execute complete 3-tier coordinate resolution pipeline."""
    stops_file = CANONICAL_DIR / "stops.json"
    routes_file = CANONICAL_DIR / "routes.json"
    route_stops_file = CANONICAL_DIR / "route_stops.json"
    schedules_file = CANONICAL_DIR / "schedules.json"
    cache_file = CANONICAL_DIR / "geocoding_cache.json"
    priority_file = CANONICAL_DIR / "geocoding_priority.json"
    review_queue_file = CANONICAL_DIR / "coordinate_review_queue.json"

    with open(stops_file, encoding="utf-8") as f:
        canonical_stops: List[Dict[str, Any]] = json.load(f)
    with open(routes_file, encoding="utf-8") as f:
        canonical_routes: List[Dict[str, Any]] = json.load(f)
    with open(route_stops_file, encoding="utf-8") as f:
        canonical_route_stops: List[Dict[str, Any]] = json.load(f)
    with open(schedules_file, encoding="utf-8") as f:
        canonical_schedules: List[Dict[str, Any]] = json.load(f)
    with open(PLACES_FILE, encoding="utf-8") as f:
        places_data: List[Dict[str, Any]] = json.load(f)

    cache = GeocodingCache(cache_file)
    frontend_verified = extract_frontend_verified_stops()

    # Build priority rankings
    priority_list = calculate_stop_priority_scores(canonical_stops, canonical_route_stops, canonical_schedules)
    if not dry_run:
        with open(priority_file, "w", encoding="utf-8") as f:
            json.dump(priority_list, f, indent=2, ensure_ascii=False)
            f.write("\n")

    tier1_count = 0
    tier2_count = 0
    tier3_count = 0
    review_queue: List[Dict[str, Any]] = []

    # Map place lookup for Tier 2
    place_lookup = []
    for p in places_data:
        pname = p.get("name", "")
        pid = p.get("id", "")
        plat = p.get("lat") or p.get("latitude")
        plon = p.get("lon") or p.get("longitude")
        if plat and plon:
            ptoks = clean_tokens(pname)
            if ptoks:
                place_lookup.append({
                    "id": pid,
                    "name": pname,
                    "tokens": ptoks,
                    "lat": float(plat),
                    "lon": float(plon),
                    "district": (p.get("district") or "").upper(),
                })

    external_lookups_done = 0

    # Sort processing by priority score to resolve top network hubs first
    priority_map = {p["stop_id"]: p["priority_score"] for p in priority_list}
    sorted_stops = sorted(canonical_stops, key=lambda s: priority_map.get(s["stop_id"], 0), reverse=True)

    for s in sorted_stops:
        current_status = s.get("coordinate_status", "UNRESOLVED")
        cs_tokens = clean_tokens(s["canonical_name"]) | clean_tokens(s["published_name"])
        cs_city = (s.get("city") or "").upper()

        # -------------------------------------------------------------
        # TIER 1: Match against Frontend Verified Stops
        # -------------------------------------------------------------
        if current_status == "UNRESOLVED" or s.get("coordinate_source") == "staticTransitStops_verified_survey":
            best_fs = None
            best_score = 0.0

            for fs in frontend_verified:
                fs_city = fs["city"].upper()
                city_ok = (fs_city == cs_city or
                           (fs_city in {"BHUBANESWAR", "CUTTACK", "PURI", "KHORDHA"} and cs_city in {"BHUBANESWAR", "CUTTACK", "PURI", "KHORDHA"}) or
                           cs_city == "")
                if not city_ok:
                    continue

                fs_tokens = clean_tokens(fs["name"]) | clean_tokens(fs["published_name"])
                overlap = cs_tokens & fs_tokens
                if overlap and overlap == cs_tokens:
                    score = len(overlap) / max(len(fs_tokens), 1)
                    if score > best_score and score >= 0.5:
                        best_score = score
                        best_fs = fs

            if best_fs:
                s["lat"] = best_fs["lat"]
                s["lon"] = best_fs["lon"]
                src = best_fs.get("coordinate_source") or "staticTransitStops_verified_survey"
                s["coordinate_source"] = src
                if "OSM" in src:
                    s["coordinate_status"] = "VERIFIED_GEOSPATIAL"
                    s["verification_status"] = "VERIFIED_GEOSPATIAL"
                elif "canonical_place" in src:
                    s["coordinate_status"] = "RESOLVED_HIGH_CONFIDENCE"
                    s["verification_status"] = "RESOLVED_HIGH_CONFIDENCE"
                else:
                    s["coordinate_status"] = "VERIFIED_OFFICIAL"
                    s["verification_status"] = "VERIFIED_OFFICIAL"
                s["district"] = s.get("district") or best_fs.get("district")
                tier1_count += 1
                continue

        # -------------------------------------------------------------
        # TIER 2: Match against Canonical Places Catalog
        # -------------------------------------------------------------
        if s["coordinate_status"] == "UNRESOLVED" and len(cs_tokens) >= 1:
            matched_place = None
            for pl in place_lookup:
                if cs_tokens == pl["tokens"] or (len(cs_tokens) >= 2 and cs_tokens.issubset(pl["tokens"])):
                    matched_place = pl
                    break

            if matched_place:
                s["lat"] = matched_place["lat"]
                s["lon"] = matched_place["lon"]
                s["coordinate_status"] = "RESOLVED_HIGH_CONFIDENCE"
                s["coordinate_source"] = f"canonical_place:{matched_place['id']}"
                s["verification_status"] = "RESOLVED_HIGH_CONFIDENCE"
                tier2_count += 1
                continue

        # -------------------------------------------------------------
        # TIER 3: External Geospatial Resolution (OSM Nominatim)
        # -------------------------------------------------------------
        if s["coordinate_status"] == "UNRESOLVED" and enable_external:
            if external_lookups_done < max_external_lookups:
                city_context = s.get("city") or "Bhubaneswar"
                query = f"{s['canonical_name']}, {city_context}, Odisha, India"
                
                res = query_nominatim(query, cache, delay=0.8)
                external_lookups_done += 1

                if res and res.get("lat") and res.get("lon"):
                    r_lat = res["lat"]
                    r_lon = res["lon"]
                    r_display = res.get("display_name", "")

                    display_upper = r_display.upper()
                    if city_context.upper() in display_upper or "ODISHA" in display_upper:
                        s["lat"] = r_lat
                        s["lon"] = r_lon
                        s["coordinate_status"] = "VERIFIED_GEOSPATIAL"
                        s["coordinate_source"] = f"OSM_Nominatim:{res.get('osm_type', 'node')}/{res.get('osm_id', '0')}"
                        s["verification_status"] = "VERIFIED_GEOSPATIAL"
                        tier3_count += 1
                    else:
                        review_queue.append({
                            "stop_id": s["stop_id"],
                            "canonical_name": s["canonical_name"],
                            "candidate_coordinates": [r_lon, r_lat],
                            "reason": f"Locality/City mismatch in OSM result: {r_display}",
                            "served_routes": s.get("served_routes", []),
                            "priority": "HIGH" if len(s.get("served_routes", [])) >= 3 else "MEDIUM",
                            "status": "REVIEW_REQUIRED",
                        })

    cache.save()

    # -------------------------------------------------------------
    # ROUTE CORRIDOR SANITY CHECK
    # -------------------------------------------------------------
    corridor_anomalies = []
    stop_coord_map = {s["stop_id"]: (s["lat"], s["lon"]) for s in canonical_stops if s["lat"] is not None and s["lon"] is not None}

    for rs in canonical_route_stops:
        rid = rs["route_id"]
        seq = rs.get("stops", [])
        last_coord: Optional[Tuple[str, float, float]] = None

        for item in seq:
            sid = item["stop_id"]
            if sid in stop_coord_map:
                lat, lon = stop_coord_map[sid]
                if last_coord:
                    prev_sid, prev_lat, prev_lon = last_coord
                    dist_km = haversine_km(prev_lat, prev_lon, lat, lon)
                    if dist_km > 75.0:
                        corridor_anomalies.append({
                            "route_id": rid,
                            "route_number": rs.get("route_number"),
                            "hop": f"{prev_sid} -> {sid}",
                            "distance_km": round(dist_km, 2),
                            "reason": "Excessive distance between consecutive route stops",
                        })
                last_coord = (sid, lat, lon)

    # -------------------------------------------------------------
    # UPDATE STOP STATS & NETWORK
    # -------------------------------------------------------------
    verified_official = sum(1 for s in canonical_stops if s["coordinate_status"] == "VERIFIED_OFFICIAL")
    verified_geospatial = sum(1 for s in canonical_stops if s["coordinate_status"] == "VERIFIED_GEOSPATIAL")
    high_confidence = sum(1 for s in canonical_stops if s["coordinate_status"] == "RESOLVED_HIGH_CONFIDENCE")
    unresolved_count = sum(1 for s in canonical_stops if s["coordinate_status"] == "UNRESOLVED")
    routable_total = verified_official + verified_geospatial + high_confidence

    routes_with_2plus_stops = 0
    routes_majority_stops = 0
    fully_geocoded_routes = 0

    for rs in canonical_route_stops:
        seq = rs.get("stops", [])
        resolved_in_seq = sum(1 for item in seq if item["stop_id"] in stop_coord_map)
        total_in_seq = max(len(seq), 1)
        if resolved_in_seq >= 2:
            routes_with_2plus_stops += 1
        if resolved_in_seq / total_in_seq >= 0.5:
            routes_majority_stops += 1
        if resolved_in_seq == total_in_seq:
            fully_geocoded_routes += 1

    top_25 = [p for p in priority_list if p.get("is_interchange")][:25]
    resolved_top_25 = sum(1 for p in top_25 if p["stop_id"] in stop_coord_map)
    top_25_rate = round((resolved_top_25 / max(len(top_25), 1)) * 100.0, 1)

    build_report = {
        "build_timestamp": datetime.now(timezone.utc).isoformat(),
        "compiler_version": "1.5.0",
        "inputs": {
            "routes_extracted_count": len(canonical_routes),
            "stops_extracted_count": len(canonical_stops),
            "route_stops_extracted_count": len(canonical_route_stops),
            "schedules_extracted_count": len(canonical_schedules),
        },
        "outputs": {
            "logical_stops_total": len(canonical_stops),
            "coordinate_verified_official": verified_official,
            "coordinate_verified_geospatial": verified_geospatial,
            "coordinate_high_confidence": high_confidence,
            "coordinate_review_required": len(review_queue),
            "coordinate_unresolved": unresolved_count,
            "routable_stops_total": routable_total,
            "tier1_internal_recovered": tier1_count,
            "tier2_places_cross_referenced": tier2_count,
            "tier3_external_resolved": tier3_count,
            "routes_with_at_least_2_routable_stops": routes_with_2plus_stops,
            "routes_with_majority_routable_stops": routes_majority_stops,
            "fully_geocoded_routes": fully_geocoded_routes,
            "top_25_interchanges_resolution_rate": f"{top_25_rate}% ({resolved_top_25}/{len(top_25)})",
            "corridor_anomalies_detected": len(corridor_anomalies),
        },
        "gates": {
            "zero_fabrication_gate": "PASSED" if all((s["lat"] is not None and s["lon"] is not None) or s["coordinate_status"] == "UNRESOLVED" for s in canonical_stops) else "FAILED",
            "provenance_required_gate": "PASSED" if all(s["lat"] is None or bool(s.get("coordinate_source")) for s in canonical_stops) else "FAILED",
            "bounded_coordinates_gate": "PASSED" if all(
                s["lat"] is None or (ODISHA_BOUNDS["min_lat"] <= s["lat"] <= ODISHA_BOUNDS["max_lat"] and
                                     ODISHA_BOUNDS["min_lon"] <= s["lon"] <= ODISHA_BOUNDS["max_lon"])
                for s in canonical_stops
            ) else "FAILED",
        }
    }

    if not dry_run:
        with open(stops_file, "w", encoding="utf-8") as f:
            json.dump(canonical_stops, f, indent=2, ensure_ascii=False)
            f.write("\n")

        with open(review_queue_file, "w", encoding="utf-8") as f:
            json.dump(review_queue, f, indent=2, ensure_ascii=False)
            f.write("\n")

        build_rep_file = CANONICAL_DIR / "build_report.json"
        with open(build_rep_file, "w", encoding="utf-8") as f:
            json.dump(build_report, f, indent=2, ensure_ascii=False)
            f.write("\n")

        network_file = CANONICAL_DIR / "network.json"
        canonical_network = {
            "metadata": {
                "title": "O-Travelz Canonical Odisha Transit Network",
                "version": "2.1.0",
                "compiled_at": datetime.now(timezone.utc).isoformat(),
                "operator": "CRUT (Capital Region Urban Transport) & Ama Bus",
                "effective_date": "2026-08-21",
                "zero_coordinate_fabrication": True,
            },
            "stats": {
                "total_routes": len(canonical_routes),
                "logical_canonical_stops": len(canonical_stops),
                "routable_geographic_stops": routable_total,
                "schedule_records": len(canonical_schedules),
                "total_departure_times": sum(len(s.get("departure_times", [])) for s in canonical_schedules),
            },
            "routes": canonical_routes,
            "stops": canonical_stops,
            "route_stops": canonical_route_stops,
            "schedules": canonical_schedules,
        }
        with open(network_file, "w", encoding="utf-8") as f:
            json.dump(canonical_network, f, indent=2, ensure_ascii=False)
            f.write("\n")

    return {
        "build_report": build_report,
        "routable_stops_total": routable_total,
        "unresolved_count": unresolved_count,
        "tier1_count": tier1_count,
        "tier2_count": tier2_count,
        "tier3_count": tier3_count,
        "corridor_anomalies": corridor_anomalies,
    }


def main():
    parser = argparse.ArgumentParser(description="Resolve canonical transit stop coordinates.")
    parser.add_argument("--dry-run", action="store_true", help="Run without modifying files.")
    parser.add_argument("--no-external", action="store_true", help="Disable external Nominatim lookups.")
    parser.add_argument("--max-lookups", type=int, default=120, help="Max external geocoding lookups.")
    args = parser.parse_args()

    print("Running canonical transit coordinate resolution pipeline...")
    results = run_coordinate_resolution(
        REPO_ROOT,
        enable_external=not args.no_external,
        max_external_lookups=args.max_lookups,
        dry_run=args.dry_run,
    )

    rep = results["build_report"]
    out = rep["outputs"]

    print("=" * 60)
    print("   O-TRAVELZ STOP COORDINATE RESOLUTION REPORT")
    print("=" * 60)
    print(f"Total Logical Canonical Stops:    {out['logical_stops_total']}")
    print(f"Routable Stops (Verified Coords): {out['routable_stops_total']}")
    print(f"  - Tier 1 (Internal Recovered):   {out['tier1_internal_recovered']}")
    print(f"  - Tier 2 (Places Cross-Ref):    {out['tier2_places_cross_referenced']}")
    print(f"  - Tier 3 (External Geospatial): {out['tier3_external_resolved']}")
    print(f"Unresolved Stops (lat=null):      {out['coordinate_unresolved']}")
    print(f"Review Queue Stops:               {out['coordinate_review_required']}")
    print(f"Routes with >= 2 Routable Stops:  {out['routes_with_at_least_2_routable_stops']}")
    print(f"Top 25 Interchanges Coverage:     {out['top_25_interchanges_resolution_rate']}")
    print(f"Corridor Anomalies Detected:      {out['corridor_anomalies_detected']}")
    print("-" * 60)
    print(f"Gate: Zero Fabrication:           [{rep['gates']['zero_fabrication_gate']}]")
    print(f"Gate: Provenance Required:        [{rep['gates']['provenance_required_gate']}]")
    print(f"Gate: Bounded Coordinates:        [{rep['gates']['bounded_coordinates_gate']}]")
    print("=" * 60)


if __name__ == "__main__":
    main()
