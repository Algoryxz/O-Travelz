"""
Stage G1 — Mobile Offline Staging Validator
Validates all Stage G1 output files for completeness, schema compliance,
and hard invariant enforcement.
Exits non-zero on any failure.
"""

import hashlib
import json
import os
import sys
from typing import Any

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

REQUIRED_MOBILE_FILES = [
    "data/staging/mobile/transit_offline_candidates.json",
    "data/staging/mobile/civic_offline_candidates.json",
    "data/staging/mobile/culture_offline_candidates.json",
    "data/staging/mobile/connectivity_offline_candidates.json",
    "data/staging/mobile/mutable_fact_cache_policy.json",
    "data/staging/mobile/mobile_offline_manifest.json",
    "data/staging/mobile/ATTRIBUTION.json",
]

REQUIRED_GEOMETRY_VARIANTS = [
    "data/staging/geospatial/odisha_district_boundaries_full.geojson",
    "data/staging/geospatial/odisha_district_boundaries_low.geojson",
    "data/staging/geospatial/odisha_district_boundaries_medium.geojson",
    "data/staging/geospatial/odisha_district_boundaries_high.geojson",
]

REQUIRED_REPORTS = [
    "reports/research/stage_g1_packaging_decision.json",
    "reports/research/stage_g1_district_geometry_variants.json",
    "reports/research/stage_g1_media_packaging_analysis.json",
    "reports/research/stage_g1_baseline_bundle_measurement.json",
    "reports/research/stage_g1_format_decision.json",
    "reports/research/stage_g1_reproducibility.json",
]

CANONICAL_PROTECTED = [
    "data/transport/canonical/stops.json",
    "data/transport/canonical/routes.json",
]

MOBILE_PRODUCTION_PROTECTED = [
    "mobile/android/",
    "mobile/ios/",
    "mobile/shared/",
]

MANIFEST_REQUIRED_KEYS = [
    "dataset_id", "schema_version", "stage", "generated_at", "git_head",
    "canonical_mutations", "production_db_mutations", "mobile_production_mutations",
    "datasets", "summary",
]

MANIFEST_DATASET_REQUIRED_KEYS = [
    "name", "file", "record_count", "raw_bytes", "compressed_bytes",
    "content_sha256", "generated_from", "truth_class", "freshness_class",
    "license", "attribution_required", "mobile_packaging_class",
]

ATTRIBUTION_REQUIRED_KEYS = [
    "dataset_name", "license", "attribution_text",
    "redistribution_assessment", "mobile_packaging_class",
]

errors: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)
    print(f"  ERROR: {msg}")


def warn(msg: str) -> None:
    warnings.append(msg)
    print(f"  WARN:  {msg}")


def load_json(rel: str) -> Any:
    full = os.path.join(REPO_ROOT, rel)
    try:
        with open(full, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        err(f"Missing file: {rel}")
        return None
    except json.JSONDecodeError as e:
        err(f"Invalid JSON in {rel}: {e}")
        return None


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def check_file_exists(rel: str) -> bool:
    full = os.path.join(REPO_ROOT, rel)
    if not os.path.isfile(full):
        err(f"Required file missing: {rel}")
        return False
    return True


def check_required_files() -> None:
    print("\n[1] Checking required output files...")
    for f in REQUIRED_MOBILE_FILES + REQUIRED_GEOMETRY_VARIANTS + REQUIRED_REPORTS:
        check_file_exists(f)


def check_protected_files() -> None:
    print("\n[2] Checking canonical protection...")
    for rel in CANONICAL_PROTECTED:
        full = os.path.join(REPO_ROOT, rel)
        if not os.path.isfile(full):
            warn(f"Canonical file not found (expected to exist): {rel}")


def check_manifest() -> None:
    print("\n[3] Validating mobile_offline_manifest.json...")
    manifest = load_json("data/staging/mobile/mobile_offline_manifest.json")
    if manifest is None:
        return

    for key in MANIFEST_REQUIRED_KEYS:
        if key not in manifest:
            err(f"manifest missing key: {key}")

    if manifest.get("canonical_mutations", -1) != 0:
        err("manifest.canonical_mutations must be 0")
    if manifest.get("production_db_mutations", -1) != 0:
        err("manifest.production_db_mutations must be 0")
    if manifest.get("mobile_production_mutations", -1) != 0:
        err("manifest.mobile_production_mutations must be 0")

    datasets = manifest.get("datasets", [])
    for ds in datasets:
        for key in MANIFEST_DATASET_REQUIRED_KEYS:
            if key not in ds:
                err(f"manifest dataset '{ds.get('name', '?')}' missing key: {key}")

        # Verify SHA-256 matches actual file
        rel_file = ds.get("file", "")
        full_file = os.path.join(REPO_ROOT, rel_file)
        if os.path.isfile(full_file):
            actual_sha = sha256_file(full_file)
            declared_sha = ds.get("content_sha256", "")
            if actual_sha != declared_sha:
                err(f"SHA-256 mismatch for {rel_file}: declared={declared_sha[:12]}... actual={actual_sha[:12]}...")
        else:
            warn(f"manifest file not found on disk: {rel_file}")

        # BASE_BUNDLE_CANDIDATE must have attribution_required = true
        if ds.get("mobile_packaging_class") == "BASE_BUNDLE_CANDIDATE":
            if not ds.get("attribution_required", False):
                err(f"BASE_BUNDLE_CANDIDATE '{ds.get('name')}' must have attribution_required = true")


def check_attribution() -> None:
    print("\n[4] Validating ATTRIBUTION.json...")
    attr = load_json("data/staging/mobile/ATTRIBUTION.json")
    if attr is None:
        return

    if attr.get("canonical_mutations", -1) != 0:
        err("ATTRIBUTION.json canonical_mutations must be 0")

    for entry in attr.get("attributions", []):
        for key in ATTRIBUTION_REQUIRED_KEYS:
            if key not in entry:
                err(f"ATTRIBUTION entry '{entry.get('dataset_name', '?')}' missing key: {key}")
        if not entry.get("attribution_text", "").strip():
            err(f"ATTRIBUTION entry '{entry.get('dataset_name', '?')}' has empty attribution_text")


def check_transit_offline() -> None:
    print("\n[5] Validating transit_offline_candidates.json...")
    t = load_json("data/staging/mobile/transit_offline_candidates.json")
    if t is None:
        return

    if t.get("canonical_mutations", -1) != 0:
        err("transit_offline_candidates canonical_mutations must be 0")

    # PROBABLE records must not be presented as navigation-grade
    ref = t.get("reference_only_records", {})
    constraints = ref.get("mobile_constraints", [])
    found_nav_constraint = any("navigation" in c.lower() or "walking" in c.lower() for c in constraints)
    if not found_nav_constraint:
        warn("transit_offline_candidates: PROBABLE records should have explicit walking-distance constraint")


def check_civic_offline() -> None:
    print("\n[6] Validating civic_offline_candidates.json...")
    c = load_json("data/staging/mobile/civic_offline_candidates.json")
    if c is None:
        return

    if c.get("canonical_mutations", -1) != 0:
        err("civic_offline_candidates canonical_mutations must be 0")

    null_rule = c.get("null_inference_rule", "")
    if "null" not in null_rule.lower() and "unknown" not in null_rule.lower():
        err("civic_offline_candidates: null_inference_rule must explicitly state null/unknown handling")

    # 24_hour must not be inferred false from absence
    invariants = c.get("hard_invariants", [])
    has_24h_rule = any("24_hour" in i for i in invariants)
    if not has_24h_rule:
        err("civic_offline_candidates: hard_invariants must include 24_hour null-inference rule")


def check_cache_policy() -> None:
    print("\n[7] Validating mutable_fact_cache_policy.json...")
    p = load_json("data/staging/mobile/mutable_fact_cache_policy.json")
    if p is None:
        return

    if p.get("canonical_mutations", -1) != 0:
        err("mutable_fact_cache_policy canonical_mutations must be 0")

    for field in p.get("field_policies", []):
        fc = field.get("freshness_class", "")
        if fc == "REALTIME":
            if field.get("offline_display_allowed", True):
                err(f"REALTIME field '{field.get('field')}' must have offline_display_allowed = false")
            if field.get("stale_display_allowed", True):
                err(f"REALTIME field '{field.get('field')}' must have stale_display_allowed = false")


def check_reproducibility() -> None:
    print("\n[8] Checking reproducibility report...")
    rep = load_json("reports/research/stage_g1_reproducibility.json")
    if rep is None:
        return

    if rep.get("diff_count", -1) != 0:
        err(f"Reproducibility DIFF_COUNT = {rep.get('diff_count')} (must be 0)")
    if rep.get("verdict") != "PASS":
        err(f"Reproducibility verdict = {rep.get('verdict')} (must be PASS)")
    if rep.get("canonical_mutations", -1) != 0:
        err("reproducibility report canonical_mutations must be 0")


def check_geometry_variants() -> None:
    print("\n[9] Checking district geometry variants...")
    rep = load_json("reports/research/stage_g1_district_geometry_variants.json")
    if rep is None:
        return

    variants = rep.get("variants", [])
    passing = [v for v in variants if v.get("integrity_pass") and v.get("non_degenerate_districts", 0) >= 30]
    if len(passing) == 0:
        err("No geometry variants passed district integrity check (need >= 30 non-degenerate districts)")

    selected = rep.get("selected_variant")
    if not selected:
        err("No selected_variant in geometry variants report")

    if rep.get("canonical_mutations", -1) != 0:
        err("geometry variants report canonical_mutations must be 0")


def main() -> None:
    print("=" * 60)
    print("STAGE G1 MOBILE OFFLINE STAGING VALIDATOR")
    print("=" * 60)

    check_required_files()
    check_protected_files()
    check_manifest()
    check_attribution()
    check_transit_offline()
    check_civic_offline()
    check_cache_policy()
    check_reproducibility()
    check_geometry_variants()

    print("\n" + "=" * 60)
    if errors:
        print(f"FAIL — {len(errors)} error(s), {len(warnings)} warning(s)")
        for e in errors:
            print(f"  [ERROR] {e}")
        sys.exit(1)
    else:
        if warnings:
            print(f"PASS (with {len(warnings)} warning(s))")
            for w in warnings:
                print(f"  [WARN] {w}")
        else:
            print("PASS — all Stage G1 invariants satisfied")
        print("=" * 60)
        sys.exit(0)


if __name__ == "__main__":
    main()
