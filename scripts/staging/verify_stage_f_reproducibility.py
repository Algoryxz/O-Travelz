#!/usr/bin/env python3
"""
scripts/staging/verify_stage_f_reproducibility.py

Runs every Stage F staging compiler twice, computes cryptographic SHA-256 hashes,
and enforces zero drift: DIFF_COUNT = 0.

Outputs:
reports/research/stage_f_reproducibility.json
"""

import hashlib
import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_REPORT = REPO_ROOT / "reports" / "research" / "stage_f_reproducibility.json"

STAGING_SCRIPTS = [
    "scripts/staging/stage_transit_stop_crosswalks.py",
    "scripts/staging/stage_transit_route_geometry.py",
    "scripts/staging/stage_odisha_district_boundaries.py",
    "scripts/staging/stage_civic_services_research.py",
    "scripts/staging/stage_destination_operational_facts.py",
    "scripts/staging/stage_verified_media_candidates.py",
    "scripts/staging/stage_culture_and_food.py",
    "scripts/staging/stage_accommodation_sources.py",
    "scripts/staging/stage_intercity_connectivity.py",
    "scripts/staging/stage_weather_warning_sources.py",
    "scripts/staging/stage_rag_corpus_manifest.py",
    "scripts/staging/stage_packaging_eligibility.py",
    "scripts/staging/stage_asset_measurements.py"
]

TARGET_ARTIFACTS = [
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
    "data/staging/rag/corpus_source_manifest.json",
    "reports/research/mobile_offline_packaging_candidates.json",
    "reports/research/stage_f_asset_measurements.json"
]


def run_all_compilers():
    for script in STAGING_SCRIPTS:
        script_path = REPO_ROOT / script
        res = subprocess.run([sys.executable, str(script_path)], cwd=REPO_ROOT, capture_output=True, text=True)
        if res.returncode != 0:
            raise RuntimeError(f"Script {script} failed with code {res.returncode}:\n{res.stderr}\n{res.stdout}")


def compute_hashes() -> dict:
    hashes = {}
    for rel_path in TARGET_ARTIFACTS:
        file_path = REPO_ROOT / rel_path
        if not file_path.exists():
            raise FileNotFoundError(f"Expected artifact not found: {rel_path}")
        with open(file_path, "rb") as f:
            h = hashlib.sha256(f.read()).hexdigest()
        hashes[rel_path] = h
    return hashes


def main():
    print("Running Pass 1 of Stage F staging compilers...")
    run_all_compilers()
    pass1_hashes = compute_hashes()

    print("Running Pass 2 of Stage F staging compilers...")
    run_all_compilers()
    pass2_hashes = compute_hashes()

    comparisons = []
    diff_count = 0

    for rel_path in TARGET_ARTIFACTS:
        h1 = pass1_hashes[rel_path]
        h2 = pass2_hashes[rel_path]
        match = (h1 == h2)
        if not match:
            diff_count += 1
        comparisons.append({
            "artifact": rel_path,
            "sha256_pass_1": h1,
            "sha256_pass_2": h2,
            "deterministic_match": match
        })

    payload = {
        "report_version": "1.0.0",
        "stage": "STAGE_F_REPRODUCIBILITY",
        "verified_at": "2026-09-08T10:35:00+05:30",
        "total_artifacts": len(TARGET_ARTIFACTS),
        "diff_count": diff_count,
        "reproducibility_verdict": "PASS" if diff_count == 0 else "FAIL",
        "comparisons": comparisons
    }

    OUTPUT_REPORT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_REPORT, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"\n[RESULT] Stage F Reproducibility: {'PASS (0 diffs)' if diff_count == 0 else f'FAIL ({diff_count} diffs)'}")
    print(f"Report written to {OUTPUT_REPORT.relative_to(REPO_ROOT)}")

    if diff_count != 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
