#!/usr/bin/env python3
"""
scripts/generate_transit_c5_baseline.py — Generate Phase 0 Forensic Baseline Report for Wave C5.
"""

import json
import hashlib
import re
from pathlib import Path
from collections import Counter, defaultdict

REPO_ROOT = Path(__file__).resolve().parent.parent
CANONICAL = REPO_ROOT / "data" / "transport" / "canonical"
REPORTS = REPO_ROOT / "reports"
REPORTS.mkdir(parents=True, exist_ok=True)

files = ["routes.json", "stops.json", "route_stops.json", "schedules.json", "network.json"]
hashes = {f: hashlib.sha256((CANONICAL / f).read_bytes()).hexdigest() for f in files}

routes = json.load(open(CANONICAL / "routes.json", encoding="utf-8"))
stops = json.load(open(CANONICAL / "stops.json", encoding="utf-8"))
route_stops = json.load(open(CANONICAL / "route_stops.json", encoding="utf-8"))
schedules = json.load(open(CANONICAL / "schedules.json", encoding="utf-8"))
network = json.load(open(CANONICAL / "network.json", encoding="utf-8"))

stop_map = {s["stop_id"]: s for s in stops}
geocoded_ids = {s["stop_id"] for s in stops if s.get("lat") is not None and s.get("lon") is not None}

def get_region(s):
    city = (s.get("city") or "").upper()
    dist = (s.get("district") or "").upper()
    if city in ["BHUBANESWAR", "CUTTACK", "PURI", "KHORDHA"] or dist in ["KHORDHA", "CUTTACK", "PURI"]:
        return "CAPITAL_REGION"
    if city == "ROURKELA" or dist == "SUNDARGARH":
        return "ROURKELA"
    if city == "SAMBALPUR" or dist == "SAMBALPUR":
        return "SAMBALPUR"
    if city == "BERHAMPUR" or dist == "GANJAM":
        return "BERHAMPUR"
    if city == "KEONJHAR" or dist == "KEONJHAR":
        return "KEONJHAR"
    return "OTHER"

# Region breakdown
region_counts_all = Counter(get_region(s) for s in stops)
region_counts_geo = Counter(get_region(s) for s in stops if s["stop_id"] in geocoded_ids)
region_counts_unres = Counter(get_region(s) for s in stops if s["stop_id"] not in geocoded_ids)

regional_coverage = {}
for r, total in region_counts_all.items():
    geo = region_counts_geo.get(r, 0)
    unres = region_counts_unres.get(r, 0)
    regional_coverage[r] = {
        "total_stops": total,
        "geocoded_stops": geo,
        "unresolved_stops": unres,
        "geocoded_pct": round(geo / total * 100, 2),
    }

# Sequence topology mapping
stop_occurrences = defaultdict(list)
sequence_map = {}
for rs in route_stops:
    seq_id = rs.get("sequence_id") or f"{rs['route_id']}_{rs.get('direction', 'forward')}"
    seq = rs.get("stops", [])
    sequence_map[seq_id] = seq
    for idx, item in enumerate(seq):
        sid = item.get("stop_id")
        if sid:
            stop_occurrences[sid].append({
                "sequence_id": seq_id,
                "route_id": rs["route_id"],
                "direction": rs.get("direction", "forward"),
                "seq_order": item.get("sequence_order", idx + 1),
                "idx": idx
            })

GENERIC_PATTERNS = {
    "BUS_STAND": [r"\bBUS\s*(?:STAND|STOP|TERMINAL|TERMINUS)\b", r"\bISBT\b", r"\bBSABT\b"],
    "POLICE_STATION": [r"\bPOLICE\s*STATION\b", r"\bPS\b", r"\bTHANA\b", r"\bPOLICE\s*OUTPOST\b"],
    "HOSPITAL": [r"\bHOSPITAL\b", r"\bDHH\b", r"\bCHC\b", r"\bPHC\b", r"\bSDH\b", r"\bMEDICAL\b", r"\bHEALTH\s*CENTRE\b"],
    "RAILWAY_STATION": [r"\bRAILWAY\s*STATION\b", r"\bRLY\s*ST(?:ATIO)?N\b", r"\bSTATION\b", r"\bRAILWAY\s*GATE\b"],
    "CHHAK_SQUARE": [r"\bCHH?A[AK]\b", r"\bCHOWK\b", r"\bSQUARE\b", r"\bSQ\b", r"\bSQR\b", r"\bJUNCTION\b", r"\bCROSSING\b"],
    "BYPASS": [r"\bBYPASS\b", r"\bBY\s*PASS\b", r"\bRING\s*ROAD\b"],
    "MARKET": [r"\bMARKET\b", r"\bBAZAA?R\b", r"\bHA?AT\b"],
    "TEMPLE": [r"\bTEMPLE\b", r"\bMANDIR\b"],
    "COLLEGE_SCHOOL": [r"\bCOLLEGE\b", r"\bSCHOOL\b", r"\bUNIVERSITY\b", r"\bCAMPUS\b", r"\bINSTITUTE\b"],
    "PETROL_PUMP": [r"\bPETROL\s*PUMP\b", r"\bFILLING\s*STATION\b", r"\bFUEL\b"],
    "CIVIC_OFFICE": [r"\bBLOCK\s*OFFICE\b", r"\bTEHSIL\b", r"\bCOLLECTORATE\b", r"\bCOURT\b", r"\bPANCHAYAT\b"],
}

def classify_generic(name):
    name_u = name.upper()
    for cat, pats in GENERIC_PATTERNS.items():
        for p in pats:
            if re.search(p, name_u):
                return cat
    return None

cache_path = CANONICAL / "geocoding_cache.json"
cache = json.load(open(cache_path, encoding="utf-8")) if cache_path.exists() else {}
pos_queries = {k.lower(): v["result"] for k, v in cache.items() if v.get("result") is not None}

unresolved_analysis = []
two_sided_count = 0
one_sided_count = 0
no_anchor_count = 0
generic_unres_count = 0

for s in stops:
    sid = s["stop_id"]
    if sid in geocoded_ids:
        continue

    name = s["canonical_name"]
    pub_name = s.get("published_name") or name
    region = get_region(s)
    district = s.get("district") or "UNKNOWN"
    city = s.get("city") or "UNKNOWN"
    served_routes = s.get("served_routes", [])
    occs = stop_occurrences.get(sid, [])

    predecessors = []
    successors = []
    has_2_sided = False
    has_1_sided = False

    for occ in occs:
        seq_id = occ["sequence_id"]
        rid = occ["route_id"]
        idx = occ["idx"]
        seq = sequence_map.get(seq_id, [])

        pred = None
        for i in range(idx - 1, -1, -1):
            psid = seq[i].get("stop_id")
            if psid in geocoded_ids:
                pred = {
                    "route_id": rid,
                    "stop_id": psid,
                    "name": stop_map[psid]["canonical_name"],
                    "lat": stop_map[psid]["lat"],
                    "lon": stop_map[psid]["lon"],
                    "distance_hops": idx - i,
                }
                break

        succ = None
        for i in range(idx + 1, len(seq)):
            nsid = seq[i].get("stop_id")
            if nsid in geocoded_ids:
                succ = {
                    "route_id": rid,
                    "stop_id": nsid,
                    "name": stop_map[nsid]["canonical_name"],
                    "lat": stop_map[nsid]["lat"],
                    "lon": stop_map[nsid]["lon"],
                    "distance_hops": i - idx,
                }
                break

        if pred and succ:
            has_2_sided = True
        elif pred or succ:
            has_1_sided = True

        if pred:
            predecessors.append(pred)
        if succ:
            successors.append(succ)

    if has_2_sided:
        two_sided_count += 1
        anchor_category = "TWO_SIDED_ANCHORS"
    elif has_1_sided:
        one_sided_count += 1
        anchor_category = "ONE_SIDED_ANCHOR"
    else:
        no_anchor_count += 1
        anchor_category = "NO_ANCHORS"

    gcat = classify_generic(name) or classify_generic(pub_name)
    if gcat:
        generic_unres_count += 1

    q = f"{name.lower()}, {city.lower()}, odisha, india"
    cached_cand = pos_queries.get(q)

    unresolved_analysis.append({
        "stop_id": sid,
        "canonical_name": name,
        "published_name": pub_name,
        "region": region,
        "city": city,
        "district": district,
        "served_routes_count": len(served_routes),
        "served_routes": served_routes,
        "sequence_occurrences_count": len(occs),
        "anchor_category": anchor_category,
        "has_two_sided_anchors": has_2_sided,
        "has_one_sided_anchor": has_1_sided,
        "has_no_anchors": not (has_2_sided or has_1_sided),
        "locality_known": bool(city != "UNKNOWN" or district != "UNKNOWN"),
        "generic_classification": {
            "is_generic": bool(gcat),
            "generic_type": gcat,
        },
        "existing_candidate_in_cache": bool(cached_cand),
        "sample_predecessor": predecessors[0] if predecessors else None,
        "sample_successor": successors[0] if successors else None,
    })

# Opportunity matrix
opportunity_matrix = {
    "tier_1_bounded_two_sided_corridor": {
        "count": two_sided_count,
        "pct_of_unresolved": round(two_sided_count / len(unresolved_analysis) * 100, 2),
        "description": "Stops bounded upstream and downstream by trusted geocoded anchors on at least one route sequence.",
    },
    "tier_2_directional_one_sided_corridor": {
        "count": one_sided_count,
        "pct_of_unresolved": round(one_sided_count / len(unresolved_analysis) * 100, 2),
        "description": "Stops with one geocoded anchor (directional extrapolation along route sequence).",
    },
    "tier_3_unanchored_locality_only": {
        "count": no_anchor_count,
        "pct_of_unresolved": round(no_anchor_count / len(unresolved_analysis) * 100, 2),
        "description": "Stops on routes with zero geocoded anchors, resolvable only via external POI / OSM named entities.",
    },
    "generic_name_unresolved": {
        "count": generic_unres_count,
        "pct_of_unresolved": round(generic_unres_count / len(unresolved_analysis) * 100, 2),
        "description": "Unresolved stops with generic names requiring contextual disambiguation.",
    },
}

before_report = {
    "wave": "C5",
    "report_name": "transit_c5_before",
    "git_head_sha": "549fcb5ac6d35cb38a2906b6a2cfc8fc9f8a238b",
    "alembic_revision": "0019_enforce_media_orthogonal_constraints",
    "canonical_file_hashes": hashes,
    "canonical_counts": {
        "routes": len(routes),
        "stops": len(stops),
        "route_stops_links": sum(len(rs.get("stops", [])) for rs in route_stops),
        "route_stops_sequences": len(route_stops),
        "schedules": len(schedules),
        "departures": sum(len(sc.get("departure_times", [])) for sc in schedules),
    },
    "coordinate_status_breakdown": {
        "VERIFIED_OFFICIAL": sum(1 for s in stops if s.get("coordinate_status") == "VERIFIED_OFFICIAL"),
        "VERIFIED_GEOSPATIAL": sum(1 for s in stops if s.get("coordinate_status") == "VERIFIED_GEOSPATIAL"),
        "UNRESOLVED": sum(1 for s in stops if s.get("coordinate_status") == "UNRESOLVED"),
    },
    "regional_coverage": regional_coverage,
    "opportunity_matrix": opportunity_matrix,
    "total_unresolved_audited": len(unresolved_analysis),
    "unresolved_stops": unresolved_analysis,
}

out_file = REPORTS / "transit_c5_before.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(before_report, f, indent=2, ensure_ascii=False)

print(f"Generated {out_file} ({out_file.stat().st_size} bytes).")
print(f"Total stops: {len(stops)}, Geocoded: {len(geocoded_ids)}, Unresolved: {len(unresolved_analysis)}")
print(f"Anchor breakdown: 2-sided={two_sided_count}, 1-sided={one_sided_count}, no-anchor={no_anchor_count}")
