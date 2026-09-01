"""
NVIDIA NIM Phase 6A Research Pilot Runner.

Executes grounded route intelligence research for pilot routes (F1, 10, 50, 200, 302)
using NVIDIA NIM (meta/llama-3.1-70b-instruct) via NVIDIAProviderAdapter.

Strict Invariants:
1. Exact preservation of authoritative route, stop, and sequence identities.
2. Zero fabricated coordinates, zero invented stops, zero forbidden geometry payloads.
3. Every claim backed by valid evidence citations from evidence_registry.json.
4. Comprehensive pre-write validation before accepting model output.
5. Checkpointing/resumability support with failure quarantine.
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Add backend directory to sys.path
ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.ai.adapter import NVIDIAProviderAdapter
from app.ai.contracts import ChatMessage, ChatRole
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("nvidia_pilot")

EXTRACTION_DIR = ROOT_DIR / "data" / "research" / "transit" / "extraction"
PHASE_6A_DIR = ROOT_DIR / "data" / "research" / "transit" / "phase_6a"
PILOT_DIR = PHASE_6A_DIR / "pilot"
FAILURES_DIR = PILOT_DIR / "failures"

PILOT_ROUTES = ["F1", "10", "50", "200", "302"]

FORBIDDEN_GEOMETRY_KEYS = frozenset({
    "geometry",
    "geojson",
    "coordinates_linestring",
    "linestring",
    "LineString",
    "MultiLineString",
    "polyline",
    "wkt_geometry",
})


def load_authoritative_data():
    """Load authoritative extraction data and evidence registry."""
    with open(EXTRACTION_DIR / "routes_extracted.json", "r", encoding="utf-8") as f:
        routes = json.load(f)
    with open(EXTRACTION_DIR / "route_stops_extracted.json", "r", encoding="utf-8") as f:
        route_stops = json.load(f)
    with open(EXTRACTION_DIR / "stops_extracted.json", "r", encoding="utf-8") as f:
        stops = json.load(f)
    with open(PHASE_6A_DIR / "evidence_registry.json", "r", encoding="utf-8") as f:
        evidence_reg = json.load(f)

    citations_list = evidence_reg.get("evidence") or evidence_reg.get("citations") or []
    evidence_ids = {e["evidence_id"]: e for e in citations_list if "evidence_id" in e}
    stops_by_name = {s["canonical_name"].upper().strip(): s for s in stops}

    return routes, route_stops, stops_by_name, evidence_ids


def build_system_prompt(evidence_ids: Dict[str, Any]) -> str:
    """Build immutable research system prompt enforcing Phase 6A criteria."""
    citations_summary = "\n".join([
        f"- {eid}: {e.get('source')} ({e.get('source_type')}, reliability: {e.get('reliability')})"
        for eid, e in evidence_ids.items()
    ])

    return f"""You are researching O-TRAVELZ Odisha public transit intelligence.

The authoritative route and stop identities supplied to you are immutable.

Rules:
1. Never alter route_number.
2. Never alter canonical stop_id.
3. Never alter canonical stop_name.
4. Never alter sequence_order.
5. Never invent a stop.
6. Never invent a coordinate.
7. Distinguish official information from secondary research and inference.
8. Every factual claim must cite an evidence_id from the allowable list.
9. Coordinates require coordinate_provenance ("geocoded" or "official_source") and evidence.
10. If a stop has null coordinates, keep resolved_latitude=null, resolved_longitude=null, coordinate_provenance=null.
11. Do not generate GeoJSON, polylines, or route geometry coordinates.
12. Corridors must list road_names, major_junctions, landmarks, status ("VERIFIED_GEOGRAPHY"), geometry_eligible (false), confidence ("CONFIRMED"), and evidence.
13. Output MUST be ONLY valid JSON matching this exact structure:

{{
  "route_id": "route-F1",
  "route_number": "F1",
  "route_code": "ROUTE-F1",
  "provider_id": "crut-capital-region",
  "provider_name": "Capital Region Urban Transport (CRUT)",
  "region": "Capital Region",
  "origin": "Damana Square",
  "destination": "KIIT Square",
  "via": null,
  "direction": "bidirectional",
  "overall_confidence": "CONFIRMED",
  "geometry_status": "EXACT",
  "has_detailed_stops": true,
  "stop_count_database": 2,
  "stop_count_research": 2,
  "stops": [
    {{
      "stop_id": "stop-capital-region-f1-1",
      "stop_name": "Damana Square",
      "sequence_order": 1,
      "geographic_status": "verified",
      "resolved_latitude": 20.3297,
      "resolved_longitude": 85.8189,
      "coordinate_provenance": "geocoded",
      "confidence": "CONFIRMED",
      "evidence": ["EV-CRUT-CR-SCHED-2026", "EV-OSM-TRANSIT-GRAPH-2026"]
    }}
  ],
  "corridors": [
    {{
      "sequence": 1,
      "from_stop_id": "stop-capital-region-f1-1",
      "to_stop_id": "stop-capital-region-f1-2",
      "from_label": "Damana Square",
      "to_label": "KIIT Square",
      "road_names": ["Nandankanan Road", "Infocity Avenue"],
      "major_junctions": ["Damana Square", "KIIT Square"],
      "landmarks": ["KIIT University", "Infocity"],
      "status": "VERIFIED_GEOGRAPHY",
      "geometry_eligible": false,
      "confidence": "CONFIRMED",
      "evidence": ["EV-CRUT-CR-SCHED-2026", "EV-OSM-TRANSIT-GRAPH-2026"]
    }}
  ],
  "route_level_evidence": ["EV-CRUT-CR-SCHED-2026", "EV-OSM-TRANSIT-GRAPH-2026"],
  "conflicts": []
}}

Allowable Evidence Citations:
{citations_summary}
"""


def get_canonical_stop_id(region: str, rn: str, seq: int, s_name: str, canonical_stop: Dict[str, Any]) -> str:
    if canonical_stop.get("id"):
        return canonical_stop["id"]
    clean_region = region.lower().replace(" ", "-")
    return f"stop-{clean_region}-{rn.lower()}-{seq}"


def build_user_prompt(route: Dict[str, Any], route_stops: List[Dict[str, Any]], stops_by_name: Dict[str, Any]) -> str:
    """Build user prompt with authoritative route info and stop sequence."""
    rn = route["route_number"]
    region = route.get("service_area") or "Capital Region"
    stops_input = []

    primary_ev = "EV-CRUT-CR-SCHED-2026"
    if region == "Berhampur":
        primary_ev = "EV-AMA-BERHAMPUR-STOP-2026"
    elif region == "Rourkela":
        primary_ev = "EV-AMA-ROURKELA-STOP-2026"
    elif region == "Sambalpur":
        primary_ev = "EV-AMA-SAMBALPUR-STOP-2026"
    elif region == "Keonjhar":
        primary_ev = "EV-AMA-KEONJHAR-STOP-2026"

    for rs in route_stops:
        s_name = rs.get("stop_name", "Unknown Stop")
        seq = int(rs.get("sequence_order", 1))
        canonical_stop = stops_by_name.get(s_name.upper().strip(), {})
        sid = rs.get("stop_id") or get_canonical_stop_id(region, rn, seq, s_name, canonical_stop)
        rs["stop_id"] = sid

        stops_input.append({
            "stop_id": sid,
            "stop_name": s_name,
            "sequence_order": seq,
            "canonical_lat": canonical_stop.get("latitude"),
            "canonical_lon": canonical_stop.get("longitude"),
            "coordinate_status": canonical_stop.get("coordinate_status", "unresolved"),
        })

    return f"""Please perform grounded transit intelligence research for the following authoritative route:

ROUTE METADATA (IMMUTABLE):
- Route Number: {rn}
- Route ID: {route.get('id', 'route-' + rn)}
- Origin: {route.get('origin')}
- Destination: {route.get('destination')}
- Via: {route.get('via')}
- Region: {region}
- Provider ID: {route.get('provider_id')}
- Provider Name: {route.get('provider_name', 'Capital Region Urban Transport (CRUT)')}

AUTHORITATIVE STOP SEQUENCE (IMMUTABLE):
{json.dumps(stops_input, separators=(',', ':'))}

INSTRUCTIONS:
1. Keep every stop_id, stop_name, and sequence_order EXACTLY as provided.
2. For each stop, emit compact JSON: {{"stop_id": "...", "stop_name": "...", "sequence_order": N, "geographic_status": "unresolved", "resolved_latitude": null, "resolved_longitude": null, "coordinate_provenance": null, "confidence": "CONFIRMED", "evidence": ["{primary_ev}"]}}. (If canonical_lat is not null, use verified latitude/longitude and coordinate_provenance="geocoded").
3. Identify arterial highway corridors, road names (e.g. NH-16, NH-59, SH-17, Janpath), major junctions, and landmarks for the corridor segment.
4. Cite allowable evidence IDs (e.g. {primary_ev}, EV-OSM-TRANSIT-GRAPH-2026).
5. Output ONLY the raw JSON object conforming to RouteIntelligence.
"""


def validate_model_output(
    parsed: Dict[str, Any],
    expected_route: Dict[str, Any],
    expected_stops: List[Dict[str, Any]],
    stops_by_name: Dict[str, Any],
    evidence_ids: Dict[str, Any],
) -> Tuple[bool, List[str]]:
    """Strict pre-write validation gate."""
    errors = []

    # 1. Top-level required fields
    required_keys = [
        "route_id", "route_number", "route_code", "provider_id", "provider_name",
        "region", "origin", "destination", "overall_confidence", "geometry_status",
        "has_detailed_stops", "stop_count_database", "stop_count_research",
        "stops", "corridors", "route_level_evidence", "conflicts",
    ]
    for k in required_keys:
        if k not in parsed:
            errors.append(f"Missing required top-level field: '{k}'")

    # 2. Forbidden geometry keys
    for k in FORBIDDEN_GEOMETRY_KEYS:
        if k in parsed:
            errors.append(f"Forbidden geometry key present: '{k}'")

    # 3. Route number match
    if parsed.get("route_number") != expected_route["route_number"]:
        errors.append(f"Route number mismatch: expected {expected_route['route_number']}, got {parsed.get('route_number')}")

    # 4. Overall confidence & geometry_status enums
    if parsed.get("overall_confidence") not in ("CONFIRMED", "SUPPORTED", "INFERRED", "UNKNOWN"):
        errors.append(f"Invalid overall_confidence: {parsed.get('overall_confidence')}")
    if parsed.get("geometry_status") not in ("EXACT", "CORRIDOR", "PARTIAL", "NONE"):
        errors.append(f"Invalid geometry_status: {parsed.get('geometry_status')}")

    # 5. Evidence citations in route_level_evidence
    for ev in parsed.get("route_level_evidence", []):
        if ev not in evidence_ids:
            errors.append(f"Unknown evidence_id cited in route_level_evidence: '{ev}'")

    # 6. Stop sequence integrity
    stops = parsed.get("stops", [])
    if len(stops) != len(expected_stops):
        errors.append(f"Stop count mismatch: expected {len(expected_stops)}, got {len(stops)}")

    expected_stops_sorted = sorted(expected_stops, key=lambda x: x.get("sequence_order", 0))
    for idx, (act, exp) in enumerate(zip(stops, expected_stops_sorted)):
        if act.get("stop_id") != exp.get("stop_id"):
            errors.append(f"Stop {idx+1} stop_id mismatch: expected '{exp.get('stop_id')}', got '{act.get('stop_id')}'")
        if act.get("sequence_order") != exp.get("sequence_order"):
            errors.append(f"Stop {idx+1} sequence mismatch: expected {exp.get('sequence_order')}, got {act.get('sequence_order')}")

        # Geographic coordinates range & provenance check
        lat = act.get("resolved_latitude")
        lon = act.get("resolved_longitude")
        prov = act.get("coordinate_provenance")

        if lat is not None or lon is not None:
            if lat is None or lon is None:
                errors.append(f"Partial coordinates at stop {act.get('stop_id')}")
            else:
                if not (17.5 <= lat <= 22.8 and 81.2 <= lon <= 87.6):
                    errors.append(f"Coordinates out of Odisha bounds at stop {act.get('stop_id')}: ({lat}, {lon})")
                if not prov:
                    errors.append(f"Coordinates missing coordinate_provenance at stop {act.get('stop_id')}")
                if not act.get("evidence"):
                    errors.append(f"Coordinates missing evidence citation at stop {act.get('stop_id')}")

        # Check stop evidence IDs
        for ev in act.get("evidence", []):
            if ev not in evidence_ids:
                errors.append(f"Unknown evidence_id cited at stop {act.get('stop_id')}: '{ev}'")

    # 7. Corridors validation
    corridors = parsed.get("corridors", [])
    if not corridors:
        errors.append("Route must contain at least 1 corridor segment")

    for c_idx, c in enumerate(corridors):
        if not c.get("road_names"):
            errors.append(f"Corridor {c_idx+1} missing road_names")
        if not c.get("evidence"):
            errors.append(f"Corridor {c_idx+1} missing evidence citations")
        for ev in c.get("evidence", []):
            if ev not in evidence_ids:
                errors.append(f"Corridor {c_idx+1} unknown evidence_id: '{ev}'")

    return len(errors) == 0, errors


def parse_json_from_response(raw_text: str) -> Dict[str, Any]:
    """Extract JSON object from LLM response text safely and fast."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n", "", text)
        text = re.sub(r"\n```$", "", text)
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise


def run_pilot(model_name: str = "meta/llama-3.1-8b-instruct", force: bool = False):
    """Run Phase 6A pilot for 5 routes."""
    PILOT_DIR.mkdir(parents=True, exist_ok=True)
    FAILURES_DIR.mkdir(parents=True, exist_ok=True)

    routes, route_stops, stops_by_name, evidence_ids = load_authoritative_data()

    adapter = NVIDIAProviderAdapter(
        model_name=model_name,
        timeout_seconds=30.0,
        max_retries=2,
    )

    system_prompt = build_system_prompt(evidence_ids)

    results_summary = {
        "pilot_run_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model_id": model_name,
        "endpoint": "https://integrate.api.nvidia.com/v1",
        "target_routes": PILOT_ROUTES,
        "successful_routes": [],
        "failed_routes": [],
        "total_evidence_citations_used": set(),
        "total_coordinates_resolved": 0,
        "total_unresolved_stops": 0,
        "confidence_distribution": {},
        "geometry_status_distribution": {},
        "validation_failures": {},
        "latencies_ms": {},
        "retry_counts": {},
    }

    print(f"\n==================================================")
    print(f"O-TRAVELZ — NVIDIA PHASE 6A RESEARCH PILOT")
    print(f"Model:    {model_name}")
    print(f"Routes:   {PILOT_ROUTES}")
    print(f"Output:   {PILOT_DIR}")
    print(f"==================================================\n")

    for rn in PILOT_ROUTES:
        out_file = PILOT_DIR / f"{rn}.json"
        fail_file = FAILURES_DIR / f"{rn}_failed.json"

        if out_file.exists() and not force:
            print(f"[CHECKPOINT] Route {rn} already researched and validated. Skipping (use --force to re-run).")
            with open(out_file, "r", encoding="utf-8") as f:
                res_data = json.load(f)
            results_summary["successful_routes"].append(rn)
            conf = res_data.get("overall_confidence", "UNKNOWN")
            geo = res_data.get("geometry_status", "NONE")
            results_summary["confidence_distribution"][conf] = results_summary["confidence_distribution"].get(conf, 0) + 1
            results_summary["geometry_status_distribution"][geo] = results_summary["geometry_status_distribution"].get(geo, 0) + 1
            continue

        route_matches = [r for r in routes if r["route_number"] == rn]
        if not route_matches:
            print(f"[ERROR] Authoritative route {rn} not found in extraction dataset!")
            results_summary["failed_routes"].append(rn)
            continue

        route = route_matches[0]
        r_stops = [s for s in route_stops if s["route_number"] == rn]
        r_stops_sorted = sorted(r_stops, key=lambda x: x.get("sequence_order", 0))

        user_prompt = build_user_prompt(route, r_stops_sorted, stops_by_name)

        messages = [
            ChatMessage(role=ChatRole.SYSTEM, content=system_prompt),
            ChatMessage(role=ChatRole.USER, content=user_prompt),
        ]

        print(f"--> Researching Route {rn} ({route.get('origin')} -> {route.get('destination')}, {len(r_stops_sorted)} stops)...", flush=True)

        attempts = 0
        max_attempts = 3
        success = False
        last_error = ""

        start_t = time.time()

        while attempts < max_attempts and not success:
            attempts += 1
            try:
                effective_timeout = 90.0 if len(r_stops_sorted) > 20 else 35.0
                effective_tokens = 8192 if len(r_stops_sorted) > 20 else 4096
                response = adapter.generate(messages, temperature=0.1, max_tokens=effective_tokens, timeout_seconds=effective_timeout)
                raw_text = response.content or ""
                print(f"    [ATTEMPT {attempts}] Response received ({len(raw_text)} chars). Parsing and validating...", flush=True)
                parsed = parse_json_from_response(raw_text)

                is_valid, validation_errors = validate_model_output(
                    parsed, route, r_stops_sorted, stops_by_name, evidence_ids
                )

                if is_valid:
                    with open(out_file, "w", encoding="utf-8") as f:
                        json.dump(parsed, f, indent=2, ensure_ascii=False)

                    elapsed_ms = round((time.time() - start_t) * 1000.0, 1)
                    print(f"    [PASSED] Route {rn} valid! Confidence={parsed.get('overall_confidence')}, Geometry={parsed.get('geometry_status')} ({elapsed_ms}ms, attempt {attempts})", flush=True)

                    results_summary["successful_routes"].append(rn)
                    results_summary["latencies_ms"][rn] = elapsed_ms
                    results_summary["retry_counts"][rn] = attempts - 1

                    conf = parsed.get("overall_confidence", "UNKNOWN")
                    geo = parsed.get("geometry_status", "NONE")
                    results_summary["confidence_distribution"][conf] = results_summary["confidence_distribution"].get(conf, 0) + 1
                    results_summary["geometry_status_distribution"][geo] = results_summary["geometry_status_distribution"].get(geo, 0) + 1

                    for ev in parsed.get("route_level_evidence", []):
                        results_summary["total_evidence_citations_used"].add(ev)

                    for st in parsed.get("stops", []):
                        if st.get("resolved_latitude") is not None:
                            results_summary["total_coordinates_resolved"] += 1
                        else:
                            results_summary["total_unresolved_stops"] += 1
                        for ev in st.get("evidence", []):
                            results_summary["total_evidence_citations_used"].add(ev)

                    for c in parsed.get("corridors", []):
                        for ev in c.get("evidence", []):
                            results_summary["total_evidence_citations_used"].add(ev)

                    success = True
                    break
                else:
                    last_error = f"Validation errors on attempt {attempts}: {'; '.join(validation_errors)}"
                    print(f"    [VALIDATION FAILED] Attempt {attempts}: {validation_errors[:2]}", flush=True)
                    messages.append(ChatMessage(role=ChatRole.ASSISTANT, content=raw_text))
                    messages.append(ChatMessage(
                        role=ChatRole.USER,
                        content=f"Your previous response had validation errors:\n" + "\n".join(f"- {e}" for e in validation_errors) + "\nPlease fix these errors and return ONLY valid JSON.",
                    ))

            except Exception as ex:
                last_error = f"Generation error on attempt {attempts}: {str(ex)}"
                print(f"    [EXCEPTION] Attempt {attempts}: {ex}", flush=True)
                time.sleep(1.0)

        if not success:
            print(f"    [FAILED] Route {rn} failed after {max_attempts} attempts.", flush=True)
            results_summary["failed_routes"].append(rn)
            results_summary["validation_failures"][rn] = last_error
            with open(fail_file, "w", encoding="utf-8") as f:
                json.dump({
                    "route_number": rn,
                    "error": last_error,
                    "attempts": attempts,
                }, f, indent=2)

    # Serialize summary
    results_summary["total_evidence_citations_used"] = sorted(list(results_summary["total_evidence_citations_used"]))
    summary_path = PILOT_DIR / "pilot_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(results_summary, f, indent=2)

    print("\n==================================================")
    print("PILOT COMPLETE")
    print(f"Successful: {len(results_summary['successful_routes'])} / {len(PILOT_ROUTES)}")
    print(f"Failed:     {len(results_summary['failed_routes'])} / {len(PILOT_ROUTES)}")
    print(f"Summary:    {summary_path}")
    print("==================================================\n")

    return results_summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run NVIDIA Phase 6A Research Pilot")
    parser.add_argument("--model", default="meta/llama-3.1-8b-instruct", help="NVIDIA hosted model ID")
    parser.add_argument("--force", action="store_true", help="Force re-run even if already completed")
    args = parser.parse_args()

    summary = run_pilot(model_name=args.model, force=args.force)
    sys.exit(0 if len(summary["failed_routes"]) == 0 else 1)
