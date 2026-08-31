#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/validate_round2_research.py

Validates Round 2 regional research staging files against schemas and project constraints.
Covers Eastern, Western, Southern, and Northern staging directories.

Exit codes:
  0 = All validation checks passed (or only non-blocking warnings)
  1 = Structural/blocking errors found (malformed JSON, duplicate IDs, invalid districts,
      wrong region ownership, coordinates outside Odisha)
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent

# Official 30 districts of Odisha (matching backend/app/core/regions.py)
ODISHA_DISTRICTS: frozenset[str] = frozenset(
    {
        "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
        "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam",
        "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal",
        "Kendrapara", "Keonjhar", "Khordha", "Koraput", "Malkangiri",
        "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri",
        "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh",
    }
)

# Canonical bounding box for Odisha: lat [17.8, 22.6], lon [81.4, 87.5]
ODISHA_BOUNDS = {
    "lat_min": 17.8,
    "lat_max": 22.6,
    "lon_min": 81.4,
    "lon_max": 87.5,
}

# Regional assignments & researchers
REGION_CONFIG: dict[str, dict[str, Any]] = {
    "eastern": {
        "lead": "Rudra",
        "prefix": "round2_east_",
        "districts": {"Cuttack", "Jagatsinghpur", "Jajpur", "Bhadrak", "Kendrapara", "Dhenkanal", "Angul"},
    },
    "western": {
        "lead": "Akriti",
        "prefix": "round2_west_",
        "districts": {"Sambalpur", "Bargarh", "Jharsuguda", "Balangir", "Subarnapur", "Nuapada", "Deogarh", "Sundargarh"},
    },
    "southern": {
        "lead": "Susmita",
        "prefix": "round2_south_",
        "districts": {"Ganjam", "Gajapati", "Koraput", "Rayagada", "Nabarangpur", "Malkangiri", "Kalahandi", "Kandhamal", "Boudh"},
    },
    "northern": {
        "lead": "Punam",
        "prefix": "round2_north_",
        "districts": {"Mayurbhanj", "Balasore", "Keonjhar", "Puri", "Khordha", "Nayagarh"},
    },
}

ALLOWED_CATEGORIES: frozenset[str] = frozenset(
    {
        "heritage", "temple", "nature", "wildlife", "beach", "waterfall",
        "lake", "hill", "museum", "cultural", "tribal", "pilgrimage",
        "adventure", "food", "other",
    }
)


def normalize_name(name: str) -> str:
    """Normalize a place name for collision detection."""
    # Lowercase, remove non-alphanumeric, strip extra spaces
    cleaned = re.sub(r"[^\w\s]", "", name.lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def load_json_file(path: Path) -> Tuple[Any, List[str]]:
    """Safely load JSON file, returning (data, errors)."""
    if not path.exists():
        return None, [f"File does not exist: {path.relative_to(REPO_ROOT)}"]
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f), []
    except json.JSONDecodeError as e:
        return None, [f"Malformed JSON in {path.relative_to(REPO_ROOT)}: line {e.lineno}, col {e.colno} - {e.msg}"]
    except Exception as e:
        return None, [f"Could not read {path.relative_to(REPO_ROOT)}: {e}"]


def load_production_places() -> Set[str]:
    """Load existing production place names normalized for cross-checking."""
    prod_path = REPO_ROOT / "data" / "places" / "places.json"
    if not prod_path.exists():
        return set()
    try:
        with open(prod_path, "r", encoding="utf-8") as f:
            places = json.load(f)
            return {normalize_name(p.get("name", "")) for p in places if p.get("name")}
    except Exception:
        return set()


def validate_region(region_name: str, prod_names: Set[str]) -> Dict[str, Any]:
    """Validate a single region staging directory."""
    config = REGION_CONFIG[region_name]
    reg_dir = REPO_ROOT / "data" / "research" / "round2" / region_name
    candidates_path = reg_dir / "candidates.json"
    sources_path = reg_dir / "sources.json"

    errors: List[str] = []
    warnings: List[str] = []
    infos: List[str] = []

    cand_data, cand_errs = load_json_file(candidates_path)
    errors.extend(cand_errs)

    src_data, src_errs = load_json_file(sources_path)
    errors.extend(src_errs)

    if cand_data is None:
        return {
            "region": region_name,
            "submitted": 0,
            "errors": errors,
            "warnings": warnings,
            "infos": infos,
            "candidates": [],
        }

    if not isinstance(cand_data, list):
        errors.append(f"{candidates_path.relative_to(REPO_ROOT)} must contain a JSON array.")
        return {
            "region": region_name,
            "submitted": 0,
            "errors": errors,
            "warnings": warnings,
            "infos": infos,
            "candidates": [],
        }

    # Validate sources mapping
    source_ids: Set[str] = set()
    source_research_ids: Set[str] = set()
    if isinstance(src_data, list):
        for idx, src in enumerate(src_data):
            if not isinstance(src, dict):
                errors.append(f"sources.json item {idx} is not an object.")
                continue
            s_id = src.get("source_id", "")
            r_id = src.get("research_id", "")
            if not s_id:
                errors.append(f"sources.json item {idx} missing 'source_id'.")
            elif s_id in source_ids:
                errors.append(f"Duplicate source_id: '{s_id}'.")
            else:
                source_ids.add(s_id)
            if r_id:
                source_research_ids.add(r_id)

    submitted_count = len(cand_data)
    seen_ids: Set[str] = set()
    seen_names: Dict[str, str] = {}  # norm_name -> raw_name

    valid_candidates: List[Dict[str, Any]] = []

    for idx, c in enumerate(cand_data):
        if not isinstance(c, dict):
            errors.append(f"Candidate #{idx} is not a JSON object.")
            continue

        c_id = c.get("research_id", "")
        name = c.get("name", "")
        district = c.get("district", "")
        region = c.get("region", "")
        category = c.get("category", "")
        researcher = c.get("researcher", "")
        lat = c.get("lat")
        lon = c.get("lon")
        desc = c.get("description", "")
        img_url = c.get("image_source_url", "")
        primary_src = c.get("primary_source_url", "")

        # 1. Required fields / ID format (ERROR)
        if not c_id:
            errors.append(f"Candidate #{idx} missing 'research_id'.")
        elif not c_id.startswith(config["prefix"]):
            errors.append(f"Candidate '{c_id}' ID prefix must be '{config['prefix']}'.")
        elif c_id in seen_ids:
            errors.append(f"Duplicate research_id '{c_id}' in {region_name}.")
        else:
            seen_ids.add(c_id)

        # 2. Canonical Name validation
        if not name or len(name.strip()) < 3:
            errors.append(f"Candidate '{c_id or idx}' has invalid/missing name.")
        else:
            norm = normalize_name(name)
            if norm in seen_names:
                errors.append(f"Duplicate name in {region_name}: '{name}' conflicts with '{seen_names[norm]}'.")
            else:
                seen_names[norm] = name

            if norm in prod_names:
                warnings.append(f"Candidate '{name}' ({c_id}) matches an existing production destination.")

        # 3. District & Region ownership (ERROR)
        if not district:
            errors.append(f"Candidate '{c_id}' missing 'district'.")
        elif district not in ODISHA_DISTRICTS:
            errors.append(f"Candidate '{c_id}' has unknown district '{district}'.")
        elif district not in config["districts"]:
            errors.append(f"Candidate '{c_id}' district '{district}' belongs to another region, not '{region_name}'.")

        if region != region_name:
            errors.append(f"Candidate '{c_id}' region field '{region}' does not match folder '{region_name}'.")

        # 4. Researcher validation (ERROR)
        allowed_researchers = {config["lead"], "Deepti", "Smarak"}
        if researcher not in allowed_researchers:
            errors.append(f"Candidate '{c_id}' invalid researcher '{researcher}'. Expected '{config['lead']}' (or Core).")

        # 5. Category (ERROR if present & invalid)
        if category and category not in ALLOWED_CATEGORIES:
            errors.append(f"Candidate '{c_id}' invalid category '{category}'.")

        # 6. Coordinate boundaries (ERROR if present & outside bounds)
        if lat is not None or lon is not None:
            if lat is None or lon is None:
                errors.append(f"Candidate '{c_id}' has partial coordinates (lat={lat}, lon={lon}). Both must be present or null.")
            elif not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
                errors.append(f"Candidate '{c_id}' coordinates must be numbers.")
            else:
                if not (ODISHA_BOUNDS["lat_min"] <= lat <= ODISHA_BOUNDS["lat_max"]):
                    errors.append(f"Candidate '{c_id}' latitude {lat} is outside Odisha (17.8 - 22.6).")
                if not (ODISHA_BOUNDS["lon_min"] <= lon <= ODISHA_BOUNDS["lon_max"]):
                    errors.append(f"Candidate '{c_id}' longitude {lon} is outside Odisha (81.4 - 87.5).")
        else:
            warnings.append(f"Candidate '{c_id}' missing coordinates (required before production promotion).")

        # 7. Quality & Staging Warnings
        if not desc or len(desc.strip()) < 50:
            warnings.append(f"Candidate '{c_id}' description is missing or < 50 characters.")

        if not img_url:
            warnings.append(f"Candidate '{c_id}' missing image lead (required before production promotion).")

        if not primary_src and (c_id not in source_research_ids):
            warnings.append(f"Candidate '{c_id}' has no primary_source_url or entry in sources.json.")

        valid_candidates.append(c)

    return {
        "region": region_name,
        "submitted": submitted_count,
        "errors": errors,
        "warnings": warnings,
        "infos": infos,
        "candidates": valid_candidates,
    }


def check_cross_region_duplicates(region_results: Dict[str, Dict[str, Any]]) -> List[str]:
    """Detect candidate names submitted across multiple regions."""
    seen_all: Dict[str, Tuple[str, str]] = {}  # norm_name -> (raw_name, region)
    cross_errors: List[str] = []

    for reg_name, res in region_results.items():
        for cand in res.get("candidates", []):
            name = cand.get("name", "")
            c_id = cand.get("research_id", "")
            if not name:
                continue
            norm = normalize_name(name)
            if norm in seen_all:
                prev_name, prev_reg = seen_all[norm]
                cross_errors.append(
                    f"Cross-region collision: '{name}' in {reg_name} ({c_id}) conflicts with '{prev_name}' in {prev_reg}."
                )
            else:
                seen_all[norm] = (name, reg_name)

    return cross_errors


def main() -> int:
    print("=" * 65)
    print("O-TRAVELZ Round 2 Regional Research Staging Validator")
    print(f"Repository root: {REPO_ROOT}")
    print("=" * 65)

    prod_names = load_production_places()
    print(f"[INFO] Loaded {len(prod_names)} existing production place names for collision checks.\n")

    total_submitted = 0
    total_errors = 0
    total_warnings = 0

    region_results: Dict[str, Dict[str, Any]] = {}

    for region_name in ("eastern", "western", "southern", "northern"):
        res = validate_region(region_name, prod_names)
        region_results[region_name] = res
        submitted = res["submitted"]
        errs = res["errors"]
        warns = res["warnings"]

        total_submitted += submitted
        total_errors += len(errs)
        total_warnings += len(warns)

        lead = REGION_CONFIG[region_name]["lead"]
        status_tag = "[FAIL]" if errs else "[OK]"
        print(f"--- Region: {region_name.upper()} (Lead: {lead}) {status_tag} ---")
        print(f"  Records submitted: {submitted}")

        if errs:
            print(f"  [ERROR] {len(errs)} blocking errors:")
            for e in errs:
                print(f"    - {e}")
        if warns:
            print(f"  [WARN]  {len(warns)} warnings:")
            for w in warns:
                print(f"    - {w}")
        if not errs and not warns:
            print("  [OK] Clean - no errors or warnings.")
        print()

    # Check cross-region collisions
    cross_dupes = check_cross_region_duplicates(region_results)
    if cross_dupes:
        total_errors += len(cross_dupes)
        print("--- CROSS-REGION COLLISION CHECK [FAIL] ---")
        for cd in cross_dupes:
            print(f"  [ERROR] {cd}")
        print()
    else:
        print("--- CROSS-REGION COLLISION CHECK [OK] ---")
        print("  No cross-region name collisions found.\n")

    # Overall Summary
    print("=" * 65)
    print(f"SUMMARY: Total submitted: {total_submitted} | Errors: {total_errors} | Warnings: {total_warnings}")
    print("=" * 65)

    if total_errors > 0:
        print("RESULT: FAIL -- Fix blocking errors before committing research staging.")
        return 1

    print("RESULT: PASS -- Research staging data is structurally valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
