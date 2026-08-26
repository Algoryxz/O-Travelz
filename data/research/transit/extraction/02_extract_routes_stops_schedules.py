#!/usr/bin/env python3
"""
O-TRAVELZ Transit Data Ingestion — Phases 3–7
===============================================
Extract routes, stops, stop sequences, schedules, and fares from
the raw text and table outputs of Phase 1-2.

Outputs (all in data/research/transit/extraction/):
  - routes_extracted.json
  - stops_extracted.json
  - route_stops_extracted.json
  - schedules_extracted.json
  - fares_extracted.json
"""

import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

SCRIPT_DIR = Path(__file__).resolve().parent
RAW_TEXT_DIR = SCRIPT_DIR / "raw_text"

# ─── Document metadata ──────────────────────────────────────────────
DOCUMENTS = {
    "CR_SCHEDULE": {
        "filename": "6129b717-fd3d-46e4-84f4-3609fa7121b7_07-New-Schedule-CR--w.e.f-21.08.2026.pdf",
        "operator": "CRUT",
        "network": "AMA Bus",
        "region": "Capital Region",
        "cities": ["Bhubaneswar", "Cuttack", "Puri", "Khordha", "Jatani"],
        "effective_date": "2026-08-21",
        "doc_type": "schedule",
    },
    "RKL_SCHEDULE": {
        "filename": "3c8bec83-b7ab-4042-bb94-ff4adf6b511a_RKL---Schedule-w.e.f.11.04.26--New-.pdf",
        "operator": "CRUT",
        "network": "AMA Bus",
        "region": "Rourkela",
        "cities": ["Rourkela"],
        "effective_date": "2026-04-11",
        "doc_type": "schedule",
    },
    "RKL_ROUTES": {
        "filename": "01dd4cef-b9c3-4a5a-8b3d-00a80578469d_Rourkela-Updated-Route-w.e.f-11.04.26.pdf",
        "operator": "CRUT",
        "network": "AMA Bus",
        "region": "Rourkela",
        "cities": ["Rourkela"],
        "effective_date": "2026-04-11",
        "doc_type": "route_details",
    },
    "BRM_SCHEDULE": {
        "filename": "2ec5da99-3b73-4e1a-88f5-de6ebbbba32b_06-Brahmapur-Schedule-wef-01.06.26.pdf",
        "operator": "CRUT",
        "network": "AMA Bus",
        "region": "Berhampur",
        "cities": ["Berhampur"],
        "effective_date": "2026-06-01",
        "doc_type": "schedule",
    },
    "BRM_STOPPAGES": {
        "filename": "15f6873f-e2b0-4c96-a329-600699454bad_Updated-Berhampur-Detailed-stoppages-24april2026.pdf",
        "operator": "CRUT",
        "network": "AMA Bus",
        "region": "Berhampur",
        "cities": ["Berhampur"],
        "effective_date": "2026-04-24",
        "doc_type": "stop_list",
    },
    "SBP_SCHEDULE": {
        "filename": "8d3f76fe-9637-44d3-8801-e4c08aaab7e9_Ama-Bus-Sambalpur-Schedule---w.e.f.01.07-2026.pdf",
        "operator": "CRUT",
        "network": "AMA Bus",
        "region": "Sambalpur",
        "cities": ["Sambalpur", "Jharsuguda"],
        "effective_date": "2026-07-01",
        "doc_type": "schedule",
    },
    "SBP_STOPPAGES": {
        "filename": "a3817262-412a-4538-97c0-4453f9e0ebd1_Sambalpur-Ama-Bus-Stoppage-Details-5-7-2026.pdf",
        "operator": "CRUT",
        "network": "AMA Bus",
        "region": "Sambalpur",
        "cities": ["Sambalpur", "Jharsuguda"],
        "effective_date": "2026-07-05",
        "doc_type": "stop_list",
    },
    "KJR_STOPPAGES": {
        "filename": "cca2228e-e268-4655-9aa6-6807b770bce8_Keonjhar-Detailed-Stoppages.pdf",
        "operator": "CRUT",
        "network": "AMA Bus",
        "region": "Keonjhar",
        "cities": ["Keonjhar"],
        "effective_date": None,
        "doc_type": "stop_list",
    },
    "MOBUS_NETWORK": {
        "filename": "Latest_MO_BUS_Full_Network_Final_English_2_For_Odia_and_English_compressed.pdf",
        "operator": "CRUT",
        "network": "Mo Bus",
        "region": "Capital Region",
        "cities": ["Bhubaneswar", "Cuttack", "Puri"],
        "effective_date": None,
        "doc_type": "network_map",
    },
}


def load_raw_text(doc_key: str) -> str:
    """Load raw text for a document."""
    doc = DOCUMENTS[doc_key]
    stem = Path(doc["filename"]).stem
    txt_file = RAW_TEXT_DIR / f"{stem}.txt"
    if txt_file.exists():
        return txt_file.read_text(encoding="utf-8")
    return ""


def load_tables(doc_key: str) -> list:
    """Load extracted tables for a document."""
    doc = DOCUMENTS[doc_key]
    stem = Path(doc["filename"]).stem
    table_file = RAW_TEXT_DIR / f"{stem}_tables.json"
    if table_file.exists():
        with open(table_file, encoding="utf-8") as f:
            return json.load(f)
    return []


def parse_time_string(time_str: str) -> list[dict]:
    """Parse a time string like '06:00(AC) 06:25 07:10(AC)' into structured times."""
    # Match patterns like HH:MM, HH:MM(AC), HH:MMS (S suffix = special)
    pattern = r'(\d{1,2}:\d{2})\s*(\(AC\))?(\s*S)?'
    times = []
    for m in re.finditer(pattern, time_str):
        time_val = m.group(1)
        is_ac = bool(m.group(2))
        is_special = bool(m.group(3) and 'S' in m.group(3))
        times.append({
            "time": time_val,
            "ac": is_ac,
            "special": is_special,
        })
    return times


def normalize_stop_name(name: str) -> str:
    """Normalize a stop name for deduplication."""
    name = name.strip()
    # Remove trailing numbers that indicate direction variants (e.g., "CITY COLLEGE 1")
    name = re.sub(r'\s+\d+$', '', name)
    # Normalize whitespace
    name = re.sub(r'\s+', ' ', name)
    return name.upper().strip()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 3: EXTRACT ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def extract_routes_from_schedule_text(text: str, doc_key: str) -> list[dict]:
    """Extract routes from schedule-format documents (CR, RKL, BRM, SBP)."""
    doc = DOCUMENTS[doc_key]
    routes = []

    # Pattern 1: "Route – F1: Origin - Destination (via ...)"
    # Pattern 2: "Route -200 [Origin - Destination]"
    # Pattern 3: "Route 08: Origin – Destination (via ...)"
    patterns = [
        # Standard format: Route -/– NUM: name
        r'Route\s*[-–]?\s*(\w+(?:\s*\w+)?)\s*[:]\s*(.+?)(?=\n)',
        # Square bracket format: Route -NUM [name]
        r'Route\s*[-–]?\s*(\w+)\s*\[(.+?)\]',
    ]

    seen_routes = set()
    for pattern in patterns:
        for m in re.finditer(pattern, text):
            route_num = m.group(1).strip()
            route_name = m.group(2).strip()

            # Clean route number
            route_num = re.sub(r'\s+', '', route_num)

            if route_num in seen_routes:
                continue
            seen_routes.add(route_num)

            # Parse origin/destination from route name
            # Patterns: "A - B (via C)" or "A – B"
            route_clean = route_name.replace('\n', ' ').strip()
            parts = re.split(r'\s*[-–—]\s*', route_clean, maxsplit=1)
            origin = parts[0].strip() if len(parts) > 0 else None
            rest = parts[1].strip() if len(parts) > 1 else None

            destination = None
            via = None
            if rest:
                via_match = re.search(r'\((?:via|Via|VIA)\s*[-–]?\s*(.+?)\)\s*$', rest)
                if via_match:
                    via = via_match.group(1).strip()
                    destination = rest[:via_match.start()].strip()
                else:
                    # Check for via at the end without parens
                    via_match2 = re.search(r'\s+(?:via|Via|VIA)\s*[-–]?\s*(.+)$', rest)
                    if via_match2:
                        via = via_match2.group(1).strip()
                        destination = rest[:via_match2.start()].strip()
                    else:
                        destination = rest

            # Remove trailing parentheses/punctuation from destination
            if destination:
                destination = re.sub(r'\s*\(.*$', '', destination).strip()
                destination = destination.rstrip(',').strip()

            # Find source page
            source_page = None
            pos = m.start()
            page_markers = [(pm.start(), int(pm.group(1))) for pm in re.finditer(r'--- PAGE (\d+) ---', text)]
            for marker_pos, page_num in reversed(page_markers):
                if marker_pos <= pos:
                    source_page = page_num
                    break

            routes.append({
                "route_number": route_num,
                "route_name": route_clean,
                "operator": doc["operator"],
                "network_type": doc["network"],
                "origin": origin,
                "destination": destination,
                "via": via,
                "direction": "bidirectional",
                "service_area": doc["region"],
                "cities": doc["cities"],
                "source_document": doc["filename"],
                "source_page": source_page,
                "effective_date": doc["effective_date"],
                "verification_status": "verified_from_official_document",
            })

    return routes


def extract_all_routes() -> list[dict]:
    """Extract routes from all schedule documents."""
    all_routes = []

    # CR Schedule (biggest document)
    cr_text = load_raw_text("CR_SCHEDULE")
    cr_routes = extract_routes_from_schedule_text(cr_text, "CR_SCHEDULE")
    print(f"  CR Schedule: {len(cr_routes)} routes")
    all_routes.extend(cr_routes)

    # Rourkela Schedule
    rkl_text = load_raw_text("RKL_SCHEDULE")
    rkl_routes = extract_routes_from_schedule_text(rkl_text, "RKL_SCHEDULE")
    print(f"  RKL Schedule: {len(rkl_routes)} routes")
    all_routes.extend(rkl_routes)

    # Brahmapur Schedule
    brm_text = load_raw_text("BRM_SCHEDULE")
    brm_routes = extract_routes_from_schedule_text(brm_text, "BRM_SCHEDULE")
    print(f"  BRM Schedule: {len(brm_routes)} routes")
    all_routes.extend(brm_routes)

    # Sambalpur Schedule
    sbp_text = load_raw_text("SBP_SCHEDULE")
    sbp_routes = extract_routes_from_schedule_text(sbp_text, "SBP_SCHEDULE")
    print(f"  SBP Schedule: {len(sbp_routes)} routes")
    all_routes.extend(sbp_routes)

    # Also extract from stoppage documents (Berhampur, Sambalpur, Keonjhar, Rourkela)
    for doc_key in ["BRM_STOPPAGES", "SBP_STOPPAGES", "KJR_STOPPAGES", "RKL_ROUTES"]:
        text = load_raw_text(doc_key)
        if not text:
            continue

        doc = DOCUMENTS[doc_key]

        # Look for route numbers in stoppage docs
        # Pattern: "ROUTE NO.\n300" or "ROUTE NO. 300" or "Route-200"
        route_nums_found = set()
        for m in re.finditer(r'ROUTE\s+NO\.?\s*\n?\s*(\d+)', text, re.IGNORECASE):
            route_nums_found.add(m.group(1))

        # Also check for Route -NUM [name] pattern
        for m in re.finditer(r'Route\s*[-–]?\s*(\d+)\s*\[(.+?)\]', text):
            route_nums_found.add(m.group(1))

        # Check which of these are truly new
        existing_nums = {r["route_number"] for r in all_routes}
        new_nums = route_nums_found - existing_nums
        if new_nums:
            print(f"  {doc_key}: {len(new_nums)} additional route numbers: {sorted(new_nums)}")
            for num in sorted(new_nums):
                all_routes.append({
                    "route_number": num,
                    "route_name": None,
                    "operator": doc["operator"],
                    "network_type": doc["network"],
                    "origin": None,
                    "destination": None,
                    "via": None,
                    "direction": None,
                    "service_area": doc["region"],
                    "cities": doc["cities"],
                    "source_document": doc["filename"],
                    "source_page": None,
                    "effective_date": doc["effective_date"],
                    "verification_status": "partial_from_stoppage_document",
                })

    return all_routes


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 4 & 5: EXTRACT STOPS AND STOP SEQUENCES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def extract_stops_from_stoppage_doc(doc_key: str) -> tuple[list[dict], list[dict]]:
    """Extract stops and route-stop sequences from a stoppage document."""
    text = load_raw_text(doc_key)
    tables = load_tables(doc_key)
    doc = DOCUMENTS[doc_key]

    stops = []
    route_stops = []
    stop_names_seen = set()

    # Extract from raw text: look for consecutive lines of stop names
    # In stoppage docs, stops are listed sequentially between route markers
    current_route = None
    current_sequence = []
    current_page = 1

    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue

        # Page marker
        page_match = re.match(r'--- PAGE (\d+) ---', line)
        if page_match:
            current_page = int(page_match.group(1))
            continue

        # Route marker
        route_match = re.match(r'ROUTE\s+NO\.?\s*$', line, re.IGNORECASE)
        if route_match:
            # Next line should be the route number
            continue

        route_num_match = re.match(r'^(\d{3,4})$', line)
        if route_num_match and current_route is None:
            # Save previous sequence
            current_route = route_num_match.group(1)
            current_sequence = []
            continue

        # Route header with name (e.g., "Route -200 [...]")
        route_header = re.match(r'Route\s*[-–]?\s*(\d+)\s*\[(.+?)\]', line)
        if route_header:
            current_route = route_header.group(1)
            current_sequence = []
            continue

        # Check if this is a stop name (all caps, possibly with dots/numbers)
        # Stop names in these docs are typically ALL CAPS
        if (re.match(r'^[A-Z][A-Z\s\.\-\(\)0-9,/]+$', line)
            and len(line) > 2
            and 'SOURCE:' not in line
            and 'EXTRACTED WITH:' not in line
            and 'PAGES:' not in line
            and 'ROUTE NO' not in line.upper()
            and '===' not in line):

            stop_name = line.strip()
            # Skip if it looks like a route description, not a stop
            if re.match(r'^\(Via', stop_name):
                continue

            normalized = normalize_stop_name(stop_name)

            if normalized not in stop_names_seen:
                stop_names_seen.add(normalized)
                stops.append({
                    "canonical_name": normalized,
                    "published_name": stop_name,
                    "locality": None,
                    "city": doc["cities"][0] if doc["cities"] else None,
                    "district": None,
                    "operator": doc["operator"],
                    "network": doc["network"],
                    "source_document": doc["filename"],
                    "source_page": current_page,
                    "terminal_status": None,
                    "coordinate_status": "unresolved",
                    "verification_status": "verified_from_official_document",
                })

            if current_route:
                seq = len(current_sequence) + 1
                current_sequence.append(normalized)
                route_stops.append({
                    "route_number": current_route,
                    "stop_name": normalized,
                    "sequence_order": seq,
                    "direction": "forward",
                    "source_document": doc["filename"],
                    "source_page": current_page,
                    "verification_status": "verified_from_official_document",
                })

    return stops, route_stops


def extract_stops_from_schedule_doc(doc_key: str, routes: list[dict]) -> tuple[list[dict], list[dict]]:
    """Extract terminus stops from schedule documents (origin/destination of each route)."""
    doc = DOCUMENTS[doc_key]
    stops = []
    route_stops = []
    stop_names_seen = set()

    for route in routes:
        if route["source_document"] != doc["filename"]:
            continue
        for role, name in [("origin", route.get("origin")), ("destination", route.get("destination"))]:
            if name:
                normalized = normalize_stop_name(name)
                if normalized not in stop_names_seen:
                    stop_names_seen.add(normalized)
                    terminal = "terminal" if role in ("origin", "destination") else None
                    stops.append({
                        "canonical_name": normalized,
                        "published_name": name,
                        "locality": None,
                        "city": route["cities"][0] if route.get("cities") else None,
                        "district": None,
                        "operator": doc["operator"],
                        "network": doc["network"],
                        "source_document": doc["filename"],
                        "source_page": route.get("source_page"),
                        "terminal_status": terminal,
                        "coordinate_status": "unresolved",
                        "verification_status": "verified_from_official_document",
                    })

    return stops, route_stops


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 6: EXTRACT SCHEDULES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def extract_schedules_from_tables(doc_key: str) -> list[dict]:
    """Extract schedule data from table structures."""
    tables = load_tables(doc_key)
    doc = DOCUMENTS[doc_key]
    text = load_raw_text(doc_key)
    schedules = []

    if not tables:
        return schedules

    # In schedule docs, tables have format:
    # Row 0: [terminus_A, "time1 time2 time3..."]
    # Row 1: [terminus_B, "time1 time2 time3..."]

    # First, build a mapping of page -> route from the raw text
    page_to_route = {}
    current_page = 1
    current_route = None

    for line in text.split('\n'):
        page_match = re.match(r'--- PAGE (\d+) ---', line.strip())
        if page_match:
            current_page = int(page_match.group(1))
            continue

        # Match route headers
        route_match = re.match(
            r'(?:Route\s*[-–]?\s*(\w+(?:\s*\w+)?)\s*[:]\s*(.+?)$)|'
            r'(?:Route\s*[-–]?\s*(\w+)\s*\[(.+?)\])',
            line.strip()
        )
        if route_match:
            route_num = (route_match.group(1) or route_match.group(3) or "").strip()
            route_name = (route_match.group(2) or route_match.group(4) or "").strip()
            route_num = re.sub(r'\s+', '', route_num)
            current_route = {
                "number": route_num,
                "name": route_name,
            }
            if current_page not in page_to_route:
                page_to_route[current_page] = []
            page_to_route[current_page].append(current_route)

    # Now process tables
    route_idx = {}  # Track which route each table belongs to
    for table in tables:
        page = table["page"]
        if table["rows"] < 2 or table["cols"] < 2:
            continue

        # Find which route this table belongs to
        routes_on_page = page_to_route.get(page, [])
        # Also check previous page (route header might be on page N, table on page N)
        if not routes_on_page and page - 1 in page_to_route:
            routes_on_page = page_to_route.get(page - 1, [])

        if not routes_on_page:
            continue

        # Use table index to determine which route on the page
        table_idx = table.get("table_index", 0)
        route_info = routes_on_page[min(table_idx, len(routes_on_page) - 1)]

        for row in table["data"]:
            if len(row) < 2 or not row[0] or not row[1]:
                continue

            terminus_name = row[0].replace('\n', ' ').strip()
            time_string = row[1]

            if not time_string or not terminus_name:
                continue

            times = parse_time_string(time_string)
            if not times:
                continue

            departure_times = [t["time"] for t in times]
            ac_flags = [t["ac"] for t in times]

            schedules.append({
                "route_number": route_info["number"],
                "route_name": route_info.get("name"),
                "direction": "from_" + normalize_stop_name(terminus_name)[:30],
                "terminus": terminus_name,
                "departure_times": departure_times,
                "ac_services": ac_flags,
                "total_trips": len(departure_times),
                "first_departure": departure_times[0] if departure_times else None,
                "last_departure": departure_times[-1] if departure_times else None,
                "operating_days": "daily",  # assumed unless stated otherwise
                "effective_date": doc["effective_date"],
                "source_document": doc["filename"],
                "source_page": page,
                "verification_status": "verified_from_official_document",
            })

    return schedules


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 7: FARES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def extract_fares() -> list[dict]:
    """Extract fare information from documents.
    Note: Most schedule documents don't contain explicit fare tables.
    We extract what we can find."""
    fares = []
    for doc_key, doc in DOCUMENTS.items():
        text = load_raw_text(doc_key)
        if not text:
            continue
        # Look for fare-related content
        fare_pattern = r'(?:fare|ticket|price|rs\.?\s*\d+|\₹\s*\d+)'
        if re.search(fare_pattern, text, re.IGNORECASE):
            # Found fare reference — extract context
            for m in re.finditer(r'(?:Rs\.?\s*(\d+)|\₹\s*(\d+))', text):
                amount = m.group(1) or m.group(2)
                if amount:
                    # Find page
                    pos = m.start()
                    source_page = None
                    for pm in re.finditer(r'--- PAGE (\d+) ---', text):
                        if pm.start() <= pos:
                            source_page = int(pm.group(1))
                    fares.append({
                        "operator": doc["operator"],
                        "network": doc["network"],
                        "fare_type": "unknown",
                        "amount": float(amount),
                        "currency": "INR",
                        "source_document": doc["filename"],
                        "source_page": source_page,
                        "effective_date": doc["effective_date"],
                        "verification_status": "needs_review",
                        "context": text[max(0, m.start()-50):m.end()+50].replace('\n', ' ').strip(),
                    })
    return fares


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN EXTRACTION PIPELINE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def main():
    print("=" * 60)
    print("O-TRAVELZ Transit Data Ingestion — Phases 3–7")
    print("=" * 60)

    # ─── Phase 3: Routes ─────────────────────────────────────────
    print("\n--- PHASE 3: ROUTES ---")
    routes = extract_all_routes()
    print(f"Total routes extracted: {len(routes)}")

    # ─── Phase 4 & 5: Stops and Sequences ────────────────────────
    print("\n--- PHASE 4 & 5: STOPS AND SEQUENCES ---")
    all_stops = []
    all_route_stops = []

    # From stoppage documents
    for doc_key in ["BRM_STOPPAGES", "SBP_STOPPAGES", "KJR_STOPPAGES", "RKL_ROUTES"]:
        stops, route_stops = extract_stops_from_stoppage_doc(doc_key)
        print(f"  {doc_key}: {len(stops)} stops, {len(route_stops)} route-stop links")
        all_stops.extend(stops)
        all_route_stops.extend(route_stops)

    # From schedule documents (terminus stops only)
    for doc_key in ["CR_SCHEDULE", "RKL_SCHEDULE", "BRM_SCHEDULE", "SBP_SCHEDULE"]:
        stops, route_stops = extract_stops_from_schedule_doc(doc_key, routes)
        print(f"  {doc_key} (termini): {len(stops)} stops")
        all_stops.extend(stops)
        all_route_stops.extend(route_stops)

    # Deduplicate stops
    seen_canonical = {}
    unique_stops = []
    for stop in all_stops:
        canon = stop["canonical_name"]
        if canon not in seen_canonical:
            seen_canonical[canon] = stop
            unique_stops.append(stop)
        else:
            # Merge info from multiple sources
            existing = seen_canonical[canon]
            if stop.get("terminal_status") and not existing.get("terminal_status"):
                existing["terminal_status"] = stop["terminal_status"]

    print(f"\nTotal unique stops: {len(unique_stops)}")
    print(f"Total route-stop relationships: {len(all_route_stops)}")

    # ─── Phase 6: Schedules ──────────────────────────────────────
    print("\n--- PHASE 6: SCHEDULES ---")
    all_schedules = []
    for doc_key in ["CR_SCHEDULE", "RKL_SCHEDULE", "BRM_SCHEDULE", "SBP_SCHEDULE"]:
        schedules = extract_schedules_from_tables(doc_key)
        print(f"  {doc_key}: {len(schedules)} schedule entries")
        all_schedules.extend(schedules)
    print(f"Total schedule entries: {len(all_schedules)}")

    # ─── Phase 7: Fares ──────────────────────────────────────────
    print("\n--- PHASE 7: FARES ---")
    fares = extract_fares()
    print(f"Total fare records: {len(fares)}")

    # ─── Write outputs ───────────────────────────────────────────
    print("\n--- WRITING OUTPUTS ---")

    def write_json(filename: str, data):
        filepath = SCRIPT_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  Written: {filename} ({len(data) if isinstance(data, list) else 'object'})")

    write_json("routes_extracted.json", routes)
    write_json("stops_extracted.json", unique_stops)
    write_json("route_stops_extracted.json", all_route_stops)
    write_json("schedules_extracted.json", all_schedules)
    write_json("fares_extracted.json", fares)

    # ─── Summary ─────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("EXTRACTION COMPLETE")
    print(f"{'='*60}")

    # Route statistics by region
    region_routes = defaultdict(list)
    for r in routes:
        region_routes[r["service_area"]].append(r["route_number"])

    print("\nRoutes by region:")
    for region, nums in sorted(region_routes.items()):
        print(f"  {region}: {len(nums)} routes")
        if len(nums) <= 10:
            print(f"    {', '.join(sorted(nums))}")

    # Stop statistics by city
    city_stops = defaultdict(int)
    for s in unique_stops:
        city = s.get("city") or "unknown"
        city_stops[city] += 1
    print("\nStops by city:")
    for city, count in sorted(city_stops.items()):
        print(f"  {city}: {count}")

    # Schedule statistics
    sched_routes = set()
    total_trips = 0
    for s in all_schedules:
        sched_routes.add(s["route_number"])
        total_trips += s["total_trips"]
    print(f"\nSchedule coverage:")
    print(f"  Routes with schedules: {len(sched_routes)}")
    print(f"  Total trip entries: {total_trips}")

    return {
        "routes": len(routes),
        "stops": len(unique_stops),
        "route_stops": len(all_route_stops),
        "schedules": len(all_schedules),
        "fares": len(fares),
    }


if __name__ == "__main__":
    main()
