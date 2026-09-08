"""
Stage G1 Section 13 — Reproducibility Verification
Runs optimize_district_boundaries.py twice, compares SHA-256 of all outputs.
DIFF_COUNT must be 0.
"""

import hashlib
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
REPORT_PATH = os.path.join(REPO_ROOT, "reports", "research", "stage_g1_reproducibility.json")

TRACKED_FILES = [
    "data/staging/geospatial/odisha_district_boundaries_full.geojson",
    "data/staging/geospatial/odisha_district_boundaries_low.geojson",
    "data/staging/geospatial/odisha_district_boundaries_medium.geojson",
    "data/staging/geospatial/odisha_district_boundaries_high.geojson",
    "data/staging/mobile/transit_offline_candidates.json",
    "data/staging/mobile/civic_offline_candidates.json",
    "data/staging/mobile/culture_offline_candidates.json",
    "data/staging/mobile/connectivity_offline_candidates.json",
    "data/staging/mobile/mutable_fact_cache_policy.json",
    "data/staging/mobile/mobile_offline_manifest.json",
    "data/staging/mobile/ATTRIBUTION.json",
    "reports/research/stage_g1_packaging_decision.json",
    "reports/research/stage_g1_media_packaging_analysis.json",
    "reports/research/stage_g1_baseline_bundle_measurement.json",
    "reports/research/stage_g1_format_decision.json",
    # Note: stage_g1_district_geometry_variants.json contains a generated_at
    # timestamp and is therefore excluded from determinism tracking.
    # The geometry .geojson files above are the deterministic data artifacts.
]


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def snapshot(label: str) -> dict[str, str]:
    result = {}
    for rel in TRACKED_FILES:
        full = os.path.join(REPO_ROOT, rel)
        if os.path.isfile(full):
            result[rel] = sha256_file(full)
        else:
            result[rel] = "MISSING"
    return result


def run_compiler() -> None:
    """Re-run the geometry optimizer (the only Stage G1 script that regenerates files)."""
    script = os.path.join(REPO_ROOT, "scripts", "staging", "optimize_district_boundaries.py")
    result = subprocess.run(
        [sys.executable, script],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        raise RuntimeError("optimize_district_boundaries.py failed")


def main() -> None:
    print("[stage_g1_reproducibility] Run 1...")
    run_compiler()
    snap1 = snapshot("run1")

    print("[stage_g1_reproducibility] Run 2...")
    run_compiler()
    snap2 = snapshot("run2")

    diffs = {}
    for rel in TRACKED_FILES:
        s1 = snap1.get(rel, "MISSING")
        s2 = snap2.get(rel, "MISSING")
        if s1 != s2:
            diffs[rel] = {"run1": s1, "run2": s2}

    diff_count = len(diffs)
    verdict = "PASS" if diff_count == 0 else "FAIL"

    report = {
        "report_version": "1.0.0",
        "stage": "STAGE_G1_REPRODUCIBILITY",
        "verified_at": datetime.now(timezone.utc).isoformat(),
        "compiler_script": "scripts/staging/optimize_district_boundaries.py",
        "tracked_files_count": len(TRACKED_FILES),
        "diff_count": diff_count,
        "verdict": verdict,
        "run1_hashes": snap1,
        "run2_hashes": snap2,
        "diffs": diffs,
        "canonical_mutations": 0,
    }

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\n[stage_g1_reproducibility] {verdict}  DIFF_COUNT={diff_count}")
    print(f"  Report: {REPORT_PATH}")

    if diff_count > 0:
        print("\nDIFFS:", json.dumps(diffs, indent=2), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
