#!/usr/bin/env python3
"""
scripts/staging/stage_intercity_connectivity.py

Deterministic staging ETL for static intercity connectivity assets:
- data/staging/connectivity/rail_hubs.json
- data/staging/connectivity/airports.json

Strict Invariants:
- STATIC CONNECTIVITY ONLY.
- Zero live tracking claims: no live train schedules, real-time flight radar,
  delays, platform numbers, or gate assignments.
- canonical_promotion_allowed = false across all records.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CROSSWALKS_PATH = REPO_ROOT / "research" / "mobile-v4-data" / "IDENTITY_CROSSWALKS.json"
RAIL_OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "connectivity" / "rail_hubs.json"
AIRPORT_OUTPUT_PATH = REPO_ROOT / "data" / "staging" / "connectivity" / "airports.json"

PROVENANCE_RAIL = {
    "source_id": "SRC_ECOR_INDIAN_RAILWAYS",
    "claim_id": "CLM_INTERCITY_RAIL_AND_AVIATION_012",
    "source_title": "East Coast Railway & South Eastern Railway Timetables",
    "source_url": "https://eastcoastrail.indianrailways.gov.in",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T10:15:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "SLOW_CHANGING",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_STAGING"
}

PROVENANCE_AIRPORT = {
    "source_id": "SRC_AAI_AIRPORTS",
    "claim_id": "CLM_INTERCITY_RAIL_AND_AVIATION_012",
    "source_title": "Airports Authority of India Operational Flight Information & UDAN RCS",
    "source_url": "https://www.aai.aero",
    "source_tier": "TIER_A_OFFICIAL_PRIMARY",
    "retrieved_at": "2026-09-08T10:15:00+05:30",
    "effective_date": "2026-09-08",
    "freshness_class": "SLOW_CHANGING",
    "licensing_status": "STATUTORY_PUBLIC_RECORD",
    "review_verdict": "ACCEPT_STAGING"
}


def stage_connectivity():
    with open(CROSSWALKS_PATH, "r", encoding="utf-8") as f:
        cw_data = json.load(f)

    rail_junctions = cw_data.get("rail_junction_crosswalks", [])
    airports = cw_data.get("airport_crosswalks", [])

    RAIL_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    AIRPORT_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # 1. Rail Hubs
    rail_sorted = sorted(rail_junctions, key=lambda r: r["station_code"])
    rail_records = []
    for r in rail_sorted:
        rail_records.append({
            "station_code": r["station_code"],
            "station_name": r["station_name"],
            "railway_division": r["division"],
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "connectivity_role": r["role"],
            "live_tracking_supported": False,
            "platform_assignment_supported": False,
            "canonical_promotion_allowed": False,
            "provenance": PROVENANCE_RAIL
        })

    rail_payload = {
        "dataset": "rail_hubs",
        "version": "1.0.0",
        "schema_compliance": "STAGE_F_CONNECTIVITY_STAGING",
        "total_stations": len(rail_records),
        "invariants": [
            "Static connectivity hub topology only; zero live tracking claims.",
            "Platform assignments and real-time train delays strictly unsupported.",
            "canonical_promotion_allowed = false across all records."
        ],
        "stations": rail_records
    }

    with open(RAIL_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(rail_payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged {len(rail_records)} rail hubs to {RAIL_OUTPUT_PATH.relative_to(REPO_ROOT)}")

    # 2. Airports
    airport_sorted = sorted(airports, key=lambda a: a["iata_code"])
    airport_records = []
    for a in airport_sorted:
        airport_records.append({
            "iata_code": a["iata_code"],
            "icao_code": a["icao_code"],
            "airport_name": a["airport_name"],
            "city": a["city"],
            "district": a["district"],
            "latitude": a["latitude"],
            "longitude": a["longitude"],
            "operator": a["operator"],
            "feeder_transit": a["feeder_transit"],
            "live_radar_supported": False,
            "gate_assignment_supported": False,
            "canonical_promotion_allowed": False,
            "provenance": PROVENANCE_AIRPORT
        })

    airport_payload = {
        "dataset": "airports",
        "version": "1.0.0",
        "schema_compliance": "STAGE_F_CONNECTIVITY_STAGING",
        "total_airports": len(airport_records),
        "invariants": [
            "Static airport facility coordinates and verified public feeder transit links.",
            "Live flight radar, gate allocations, and flight status strictly unsupported.",
            "canonical_promotion_allowed = false across all records."
        ],
        "airports": airport_records
    }

    with open(AIRPORT_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(airport_payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Staged {len(airport_records)} airports to {AIRPORT_OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    stage_connectivity()
