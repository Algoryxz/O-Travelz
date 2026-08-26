"""
Deterministic test fixture generator for Phase 6A Validator testing.

Produces unmistakably synthetic test fixture bundles that demonstrate schema
and structural validation rules without being mistakable for real research.

Fixtures created:
  tests/fixtures/phase_6a/valid_minimal/
  tests/fixtures/phase_6a/invalid_missing_route/
  tests/fixtures/phase_6a/invalid_duplicate_route/
  tests/fixtures/phase_6a/invalid_coordinate/
  tests/fixtures/phase_6a/invalid_coordinate_without_evidence/
  tests/fixtures/phase_6a/invalid_confirmed_without_high_evidence/
  tests/fixtures/phase_6a/invalid_missing_corridor_evidence/
  tests/fixtures/phase_6a/invalid_sequence_conflict/
  tests/fixtures/phase_6a/invalid_sequence_mutation/
  tests/fixtures/phase_6a/invalid_unknown_stop/
  tests/fixtures/phase_6a/invalid_missing_stop/
  tests/fixtures/phase_6a/invalid_geometry_payload/
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

ROOT_DIR = Path(__file__).resolve().parents[1]
EXTRACTION_DIR = ROOT_DIR / "data" / "research" / "transit" / "extraction"
FIXTURES_DIR = ROOT_DIR / "tests" / "fixtures" / "phase_6a"


def load_extraction():
    with open(EXTRACTION_DIR / "routes_extracted.json", "r", encoding="utf-8") as f:
        routes = json.load(f)
    with open(EXTRACTION_DIR / "stops_extracted.json", "r", encoding="utf-8") as f:
        stops = json.load(f)
    with open(EXTRACTION_DIR / "route_stops_extracted.json", "r", encoding="utf-8") as f:
        route_stops = json.load(f)
    return routes, stops, route_stops


def build_synthetic_minimal_dataset():
    routes_ext, stops_ext, route_stops_ext = load_extraction()

    # 1. Synthetic Evidence Registry (Unmistakably synthetic markers)
    evidence_items = [
        {
            "evidence_id": "SYNTHETIC-EV-OFFICIAL-HIGH-01",
            "source": "Synthetic Official Schedule Doc [NON-AUTHORITATIVE TEST FIXTURE]",
            "source_type": "OFFICIAL_DOCUMENT",
            "document": "synthetic_official_schedule.pdf",
            "page": "1",
            "url": None,
            "claim": "[SYNTHETIC TEST CLAIM] High reliability evidence for schema validation test",
            "reliability": "HIGH",
            "accessed_at": "2026-08-24T00:00:00Z",
            "notes": "SYNTHETIC FIXTURE EVIDENCE - DO NOT USE FOR TRANSIT ROUTING",
        },
        {
            "evidence_id": "SYNTHETIC-EV-RESEARCH-LOW-02",
            "source": "Synthetic Blog Reference [NON-AUTHORITATIVE TEST FIXTURE]",
            "source_type": "RESEARCH",
            "document": None,
            "page": None,
            "url": "https://synthetic-fixture.invalid/test",
            "claim": "[SYNTHETIC TEST CLAIM] Low reliability claim for confidence gating tests",
            "reliability": "LOW",
            "accessed_at": "2026-08-24T00:00:00Z",
            "notes": "SYNTHETIC FIXTURE EVIDENCE - DO NOT USE FOR TRANSIT ROUTING",
        },
    ]

    evidence_registry_doc = {
        "project": "O-TRAVELZ",
        "phase": "6A",
        "is_synthetic_test_fixture": True,
        "notes": "SYNTHETIC FIXTURE ONLY - NOT AUTHORITATIVE RESEARCH",
        "total_evidence_items": len(evidence_items),
        "evidence": evidence_items,
    }

    # Map stops by canonical name
    stops_by_canonical = {}
    for s in stops_ext:
        cn = s["canonical_name"].upper().strip()
        stops_by_canonical[cn] = s

    # Deduplicate raw route_stops to match 1,487 unique links
    rs_by_route = {}
    seen_links = set()
    for rs in route_stops_ext:
        rn = str(rs["route_number"]).strip()
        s_name = rs["stop_name"].upper().strip()
        seq = int(rs.get("sequence_order", 1))
        key = (rn, s_name, seq)
        if key not in seen_links:
            seen_links.add(key)
            rs_by_route.setdefault(rn, []).append((seq, s_name))

    region_file_map = {
        "Capital Region": "capital_region.json",
        "Rourkela": "rourkela.json",
        "Berhampur": "berhampur.json",
        "Sambalpur": "sambalpur.json",
        "Keonjhar": "keonjhar.json",
    }

    regional_docs = {
        r: {
            "region": r,
            "provider_id": "prov-crut-synthetic",
            "provider_name": "CRUT / Mo Bus [SYNTHETIC TEST PROVIDER]",
            "is_synthetic_test_fixture": True,
            "notes": "SYNTHETIC FIXTURE ONLY - NOT AUTHORITATIVE RESEARCH",
            "route_count": 0,
            "routes": [],
        }
        for r in region_file_map
    }

    index_routes = []
    regional_dist = {r: 0 for r in region_file_map}

    for r in routes_ext:
        rn = str(r["route_number"]).strip()
        region = r.get("service_area", "Capital Region")
        if region not in regional_docs:
            region = "Capital Region"

        file_name = region_file_map[region]

        # Build stops preserving exact database sequence
        raw_rs = rs_by_route.get(rn, [])
        stops_list = []
        for seq, s_name in raw_rs:
            s_meta = stops_by_canonical.get(s_name, {})
            # Coordinates are nullable in research contract; synthetic fixture leaves them null or dummy geocoded with synthetic evidence
            stops_list.append({
                "stop_id": f"stop-syn-{rn}-{seq}",
                "stop_name": s_name,
                "normalized_name": s_name.title(),
                "route_context": f"[SYNTHETIC_ROUTE_CONTEXT_{rn}]",
                "sequence_order": seq,
                "geographic_status": "unresolved",
                "resolved_latitude": None,
                "resolved_longitude": None,
                "coordinate_provenance": None,
                "road": None,
                "locality": "[SYNTHETIC_TEST_LOCALITY]",
                "landmark": "[SYNTHETIC_TEST_LANDMARK]",
                "city": s_meta.get("city") or region,
                "district": s_meta.get("district") or region,
                "confidence": "SUPPORTED",
                "evidence": ["SYNTHETIC-EV-OFFICIAL-HIGH-01"],
                "notes": "[SYNTHETIC_TEST_STOP_RECORD]",
            })

        origin_str = r.get("origin") or (stops_list[0]["stop_name"] if stops_list else "Synthetic Origin")
        dest_str = r.get("destination") or (stops_list[-1]["stop_name"] if stops_list else "Synthetic Destination")

        corridors_list = [
            {
                "sequence": 1,
                "from_stop_id": stops_list[0]["stop_id"] if stops_list else None,
                "to_stop_id": stops_list[-1]["stop_id"] if stops_list else None,
                "from_label": origin_str,
                "to_label": dest_str,
                "road_names": ["[SYNTHETIC_TEST_CORRIDOR_ROAD]"],
                "major_junctions": ["[SYNTHETIC_TEST_JUNCTION]"],
                "landmarks": ["[SYNTHETIC_TEST_LANDMARK]"],
                "status": "VERIFIED_GEOGRAPHY",
                "geometry_eligible": False,
                "confidence": "CONFIRMED",
                "evidence": ["SYNTHETIC-EV-OFFICIAL-HIGH-01"],
                "notes": "[SYNTHETIC_TEST_CORRIDOR_DATA]",
            }
        ]

        route_record = {
            "route_id": f"route-syn-uuid-{rn}",
            "route_number": rn,
            "route_code": f"{region.lower().replace(' ', '-')}-{rn}",
            "provider_id": "prov-crut-synthetic",
            "provider_name": "CRUT / Mo Bus [SYNTHETIC TEST PROVIDER]",
            "region": region,
            "origin": origin_str,
            "destination": dest_str,
            "via": r.get("via"),
            "direction": "bidirectional",
            "overall_confidence": "CONFIRMED",
            "geometry_status": "NONE",
            "has_detailed_stops": (len(stops_list) > 5),
            "stop_count_database": len(stops_list),
            "stop_count_research": len(stops_list),
            "stops": stops_list,
            "corridors": corridors_list,
            "route_level_evidence": ["SYNTHETIC-EV-OFFICIAL-HIGH-01"],
            "conflicts": [],
            "notes": {"is_synthetic_test_fixture": True, "do_not_use_for_routing": True},
        }

        regional_docs[region]["routes"].append(route_record)
        regional_docs[region]["route_count"] += 1
        regional_dist[region] += 1

        index_routes.append({
            "route_id": route_record["route_id"],
            "route_number": rn,
            "route_code": route_record["route_code"],
            "region": region,
            "file_path": file_name,
            "origin": origin_str,
            "destination": dest_str,
            "via": r.get("via"),
            "overall_confidence": "CONFIRMED",
            "geometry_status": "NONE",
            "stop_count": len(stops_list),
        })

    route_index_doc = {
        "project": "O-TRAVELZ",
        "phase": "6A",
        "baseline_commit": "e1e9fdf",
        "is_synthetic_test_fixture": True,
        "notes": "SYNTHETIC FIXTURE ONLY - NOT AUTHORITATIVE RESEARCH",
        "total_routes": len(index_routes),
        "regional_distribution": regional_dist,
        "routes": index_routes,
    }

    global_analysis_doc = {
        "project": "O-TRAVELZ",
        "phase": "6A",
        "baseline_commit": "e1e9fdf",
        "is_synthetic_test_fixture": True,
        "notes": "SYNTHETIC FIXTURE ONLY - NOT AUTHORITATIVE RESEARCH",
        "total_routes_analyzed": 154,
        "shared_corridors": [
            {
                "corridor_name": "[SYNTHETIC_TEST_CORRIDOR]",
                "roads": ["[SYNTHETIC_ROAD]"],
                "routes_serving": ["10", "11"],
                "frequency_rank": 1,
                "key_junctions": ["[SYNTHETIC_JUNCTION]"],
                "notes": "[SYNTHETIC_CORRIDOR_ANALYSIS]",
            }
        ],
        "transfer_hubs": [
            {
                "hub_key": "SYNTHETIC_TEST_HUB",
                "hub_name": "[SYNTHETIC_TRANSFER_HUB]",
                "city": "Bhubaneswar",
                "district": "Khordha",
                "representative_stop_name": "BHUBANESWAR RAILWAY STATION",
                "representative_lat": None,
                "representative_lon": None,
                "member_stop_names": ["BHUBANESWAR RAILWAY STATION"],
                "routes_intersecting": ["10", "11"],
            }
        ],
        "stop_aliases": [],
        "conflicts": [],
        "geometry_readiness_summary": {
            "EXACT": 0,
            "CORRIDOR": 0,
            "PARTIAL": 0,
            "NONE": 154,
        },
    }

    unresolved_stops_doc = {
        "project": "O-TRAVELZ",
        "phase": "6A",
        "is_synthetic_test_fixture": True,
        "notes": "SYNTHETIC FIXTURE ONLY - NOT AUTHORITATIVE RESEARCH",
        "total_unresolved": 1389,
        "unresolved_stops": [
            {
                "stop_id": "stop-syn-unres-001",
                "stop_name": "DUDUMA COLONY",
                "city": "Berhampur",
                "district": "Ganjam",
                "geographic_status": "unresolved",
                "reason_unresolved": "[SYNTHETIC TEST REASON] Synthetic fixture placeholder entry",
                "query_attempted": "[SYNTHETIC_QUERY]",
                "potential_corridor": "[SYNTHETIC_CORRIDOR]",
                "serving_routes": ["300"],
            }
        ],
    }

    return {
        "evidence_registry.json": evidence_registry_doc,
        "route_index.json": route_index_doc,
        "global_analysis.json": global_analysis_doc,
        "unresolved_stops.json": unresolved_stops_doc,
        "capital_region.json": regional_docs["Capital Region"],
        "rourkela.json": regional_docs["Rourkela"],
        "berhampur.json": regional_docs["Berhampur"],
        "sambalpur.json": regional_docs["Sambalpur"],
        "keonjhar.json": regional_docs["Keonjhar"],
    }


def write_fixture_bundle(target_dir: Path, files: Dict[str, Any]):
    target_dir.mkdir(parents=True, exist_ok=True)
    for fname, data in files.items():
        with open(target_dir / fname, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)


def generate_all_fixtures():
    base_bundle = build_synthetic_minimal_dataset()

    # 1. valid_minimal
    valid_dir = FIXTURES_DIR / "valid_minimal"
    write_fixture_bundle(valid_dir, base_bundle)
    print(f"Generated {valid_dir}")

    # 2. invalid_missing_route (drop route F1)
    missing_dir = FIXTURES_DIR / "invalid_missing_route"
    missing_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    missing_bundle["route_index.json"]["routes"] = [r for r in missing_bundle["route_index.json"]["routes"] if r["route_number"] != "F1"]
    missing_bundle["route_index.json"]["total_routes"] = len(missing_bundle["route_index.json"]["routes"])
    missing_bundle["capital_region.json"]["routes"] = [r for r in missing_bundle["capital_region.json"]["routes"] if r["route_number"] != "F1"]
    missing_bundle["capital_region.json"]["route_count"] = len(missing_bundle["capital_region.json"]["routes"])
    write_fixture_bundle(missing_dir, missing_bundle)
    print(f"Generated {missing_dir}")

    # 3. invalid_duplicate_route
    dup_dir = FIXTURES_DIR / "invalid_duplicate_route"
    dup_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    dup_route = json.loads(json.dumps(dup_bundle["capital_region.json"]["routes"][0]))
    dup_bundle["capital_region.json"]["routes"].append(dup_route)
    write_fixture_bundle(dup_dir, dup_bundle)
    print(f"Generated {dup_dir}")

    # 4. invalid_coordinate (latitude > 90)
    coord_dir = FIXTURES_DIR / "invalid_coordinate"
    coord_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    coord_bundle["capital_region.json"]["routes"][0]["stops"][0]["resolved_latitude"] = 195.45
    coord_bundle["capital_region.json"]["routes"][0]["stops"][0]["resolved_longitude"] = 85.82
    coord_bundle["capital_region.json"]["routes"][0]["stops"][0]["coordinate_provenance"] = "geocoded"
    coord_bundle["capital_region.json"]["routes"][0]["stops"][0]["evidence"] = ["SYNTHETIC-EV-OFFICIAL-HIGH-01"]
    write_fixture_bundle(coord_dir, coord_bundle)
    print(f"Generated {coord_dir}")

    # 5. invalid_coordinate_without_evidence
    coord_no_ev_dir = FIXTURES_DIR / "invalid_coordinate_without_evidence"
    coord_no_ev_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    coord_no_ev_bundle["capital_region.json"]["routes"][0]["stops"][0]["resolved_latitude"] = 20.25
    coord_no_ev_bundle["capital_region.json"]["routes"][0]["stops"][0]["resolved_longitude"] = 85.82
    coord_no_ev_bundle["capital_region.json"]["routes"][0]["stops"][0]["coordinate_provenance"] = "geocoded"
    coord_no_ev_bundle["capital_region.json"]["routes"][0]["stops"][0]["evidence"] = []
    write_fixture_bundle(coord_no_ev_dir, coord_no_ev_bundle)
    print(f"Generated {coord_no_ev_dir}")

    # 6. invalid_confirmed_without_high_evidence
    low_ev_dir = FIXTURES_DIR / "invalid_confirmed_without_high_evidence"
    low_ev_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    low_ev_bundle["capital_region.json"]["routes"][0]["overall_confidence"] = "CONFIRMED"
    low_ev_bundle["capital_region.json"]["routes"][0]["route_level_evidence"] = ["SYNTHETIC-EV-RESEARCH-LOW-02"]
    write_fixture_bundle(low_ev_dir, low_ev_bundle)
    print(f"Generated {low_ev_dir}")

    # 7. invalid_missing_corridor_evidence
    corridor_no_ev_dir = FIXTURES_DIR / "invalid_missing_corridor_evidence"
    corridor_no_ev_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    corridor_no_ev_bundle["capital_region.json"]["routes"][0]["corridors"][0]["evidence"] = []
    write_fixture_bundle(corridor_no_ev_dir, corridor_no_ev_bundle)
    print(f"Generated {corridor_no_ev_dir}")

    # 8. invalid_sequence_conflict (non-positive / inverted seq order without conflict)
    seq_conflict_dir = FIXTURES_DIR / "invalid_sequence_conflict"
    seq_conflict_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    if len(seq_conflict_bundle["capital_region.json"]["routes"][0]["stops"]) >= 2:
        seq_conflict_bundle["capital_region.json"]["routes"][0]["stops"][1]["sequence_order"] = 1
    write_fixture_bundle(seq_conflict_dir, seq_conflict_bundle)
    print(f"Generated {seq_conflict_dir}")

    # 9. invalid_sequence_mutation (Database: A=1, B=2, C=3; Research: A=1, C=2, B=3 without conflict)
    seq_mut_dir = FIXTURES_DIR / "invalid_sequence_mutation"
    seq_mut_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    # Find a route with >= 3 stops (e.g. Route 32: Baramunda BSABT -> Master Canteen -> Lingaraj Temple)
    for route in seq_mut_bundle["capital_region.json"]["routes"]:
        if len(route["stops"]) >= 3:
            # Swap stop 1 and stop 2 names
            s1_name = route["stops"][1]["stop_name"]
            s2_name = route["stops"][2]["stop_name"]
            route["stops"][1]["stop_name"] = s2_name
            route["stops"][2]["stop_name"] = s1_name
            break
    write_fixture_bundle(seq_mut_dir, seq_mut_bundle)
    print(f"Generated {seq_mut_dir}")

    # 10. invalid_unknown_stop (Stop not in 1,430 canonical stops inventory)
    unknown_stop_dir = FIXTURES_DIR / "invalid_unknown_stop"
    unknown_stop_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    unknown_stop_bundle["capital_region.json"]["routes"][0]["stops"][0]["stop_name"] = "NONEXISTENT_UNREGISTERED_STOP_NAME_123"
    write_fixture_bundle(unknown_stop_dir, unknown_stop_bundle)
    print(f"Generated {unknown_stop_dir}")

    # 11. invalid_missing_stop (Database stops omitted without conflict)
    missing_stop_dir = FIXTURES_DIR / "invalid_missing_stop"
    missing_stop_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    for route in missing_stop_bundle["capital_region.json"]["routes"]:
        if len(route["stops"]) >= 2:
            # Drop one stop from research without conflict
            route["stops"] = route["stops"][:1]
            break
    write_fixture_bundle(missing_stop_dir, missing_stop_bundle)
    print(f"Generated {missing_stop_dir}")

    # 12. invalid_geometry_payload (injects forbidden GeoJSON linestring)
    geom_dir = FIXTURES_DIR / "invalid_geometry_payload"
    geom_bundle = {k: json.loads(json.dumps(v)) for k, v in base_bundle.items()}
    geom_bundle["capital_region.json"]["routes"][0]["geometry"] = {
        "type": "LineString",
        "coordinates": [[85.81, 20.25], [85.83, 20.27]],
    }
    write_fixture_bundle(geom_dir, geom_bundle)
    print(f"Generated {geom_dir}")


if __name__ == "__main__":
    generate_all_fixtures()
