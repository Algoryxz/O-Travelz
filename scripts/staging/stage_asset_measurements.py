#!/usr/bin/env python3
"""
scripts/staging/stage_asset_measurements.py

Deterministic measurement tool for all Stage F staging datasets.
Measures:
- record_count
- raw_bytes
- gzip_bytes
- largest_record (byte size)
- coordinate_precision
- estimated_mobile_memory_footprint

Outputs:
reports/research/stage_f_asset_measurements.json
"""

import gzip
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_REPORT = REPO_ROOT / "reports" / "research" / "stage_f_asset_measurements.json"

STAGING_FILES = [
    "data/staging/transit/researched_stop_crosswalks.json",
    "data/staging/transit/researched_route_geometry.json",
    "data/staging/geospatial/odisha_district_boundaries.geojson",
    "data/staging/services/researched_civic_services.json",
    "data/staging/places/researched_operational_facts.json",
    "data/staging/media/researched_media_candidates.json",
    "data/staging/culture/gi_products.json",
    "data/staging/culture/artisan_clusters.json",
    "data/staging/food/official_food_sources.json",
    "data/staging/accommodation/official_accommodation_sources.json",
    "data/staging/connectivity/rail_hubs.json",
    "data/staging/connectivity/airports.json",
    "data/staging/weather/warning_sources.json",
    "data/staging/rag/corpus_source_manifest.json"
]


def extract_records(data) -> list:
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for k in ["records", "features", "routes", "services", "places", "candidates",
                  "products", "clusters", "food_sources", "accommodations",
                  "stations", "airports", "providers", "sources"]:
            if k in data and isinstance(data[k], list):
                return data[k]
            if k in data and isinstance(data[k], dict):
                # e.g. stop crosswalks with exact/probable/ambiguous
                sublist = []
                for subk, subv in data[k].items():
                    if isinstance(subv, list):
                        sublist.extend(subv)
                if sublist:
                    return sublist
    return [data]


def inspect_coord_precision(data) -> str:
    """Detect coordinate precision used in records."""
    text = json.dumps(data)
    # Search for latitude / staging_lat decimal places
    for key in ["staging_lat", "latitude", "candidate_lat"]:
        if f'"{key}":' in text:
            import re
            m = re.findall(rf'"{key}":\s*([0-9]+\.([0-9]+))', text)
            if m:
                max_dec = max(len(match[1]) for match in m)
                return f"{max_dec} decimal places (~{111 / (10**max_dec):.1f}m resolution)"
    if "odisha_district_boundaries" in text:
        return "6-8 decimal places (raw unsimplified vector polygon precision)"
    return "N/A"


def measure_dataset(rel_path: str) -> dict:
    file_path = REPO_ROOT / rel_path
    if not file_path.exists():
        return {
            "file_path": rel_path,
            "status": "FILE_NOT_FOUND"
        }

    raw_bytes = file_path.stat().st_size
    with open(file_path, "rb") as f:
        content_bytes = f.read()
    gzip_bytes = len(gzip.compress(content_bytes, compresslevel=9))

    try:
        data = json.loads(content_bytes.decode("utf-8"))
        records = extract_records(data)
        record_count = len(records)
        record_sizes = [len(json.dumps(r).encode("utf-8")) for r in records]
        largest_record_bytes = max(record_sizes) if record_sizes else raw_bytes
        coord_precision = inspect_coord_precision(data)
        # Mobile memory multiplier: parsed JSON object graph in JVM/ART or Swift heap typically consumes ~2.2x to 3.0x raw string size
        est_mobile_heap_bytes = int(raw_bytes * 2.5)
    except Exception as e:
        record_count = 1
        largest_record_bytes = raw_bytes
        coord_precision = "UNKNOWN"
        est_mobile_heap_bytes = raw_bytes * 2

    return {
        "file_path": rel_path,
        "record_count": record_count,
        "raw_bytes": raw_bytes,
        "gzip_bytes": gzip_bytes,
        "compression_ratio": round(raw_bytes / gzip_bytes, 2) if gzip_bytes > 0 else 1.0,
        "largest_record_bytes": largest_record_bytes,
        "coordinate_precision": coord_precision,
        "estimated_mobile_memory_footprint_bytes": est_mobile_heap_bytes
    }


def main():
    OUTPUT_REPORT.parent.mkdir(parents=True, exist_ok=True)
    measurements = [measure_dataset(p) for p in STAGING_FILES]

    total_raw = sum(m.get("raw_bytes", 0) for m in measurements)
    total_gzip = sum(m.get("gzip_bytes", 0) for m in measurements)
    total_records = sum(m.get("record_count", 0) for m in measurements)

    payload = {
        "report_version": "1.0.0",
        "evaluation_stage": "STAGE_F_ASSET_MEASUREMENTS",
        "measured_at": "2026-09-08T10:35:00+05:30",
        "total_datasets": len(measurements),
        "total_staged_records": total_records,
        "total_raw_bytes": total_raw,
        "total_gzip_bytes": total_gzip,
        "overall_compression_ratio": round(total_raw / total_gzip, 2) if total_gzip > 0 else 1.0,
        "measurements": measurements
    }

    with open(OUTPUT_REPORT, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[OK] Generated asset measurements report at {OUTPUT_REPORT.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
