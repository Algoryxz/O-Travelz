"""
O-Travelz Automated Metadata Generator
Generates authoritative data/images/manual/metadata.json for all collected images
with distinct authenticity vs provenance semantics.
"""

import json
import os
import hashlib
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
MANUAL_DIR = REPO_ROOT / "data" / "images" / "manual"
METADATA_FILE = MANUAL_DIR / "metadata.json"
MANIFEST_FILE = MANUAL_DIR / "manifest.json"
REQ_FILE = REPO_ROOT / "data" / "images" / "sources" / "manual_image_request.json"
AUDIT_FILE = REPO_ROOT / "data" / "images" / "sources" / "authentic_image_audit.json"
PLACES_FILE = REPO_ROOT / "data" / "places" / "places.json"
FOOD_FILE = REPO_ROOT / "data" / "research" / "food" / "odisha_food_research.json"

SPELLING_ALIASES = {
    "place_bolangir_001": "place_balangir_001",
    "place_bolangir_002": "place_balangir_002",
}

def generate_metadata():
    print("=" * 65)
    print("O-TRAVELZ AUTOMATED METADATA GENERATOR")
    print("=" * 65)

    reqs = json.loads(REQ_FILE.read_text(encoding="utf-8")) if REQ_FILE.exists() else []
    audits = json.loads(AUDIT_FILE.read_text(encoding="utf-8")) if AUDIT_FILE.exists() else []
    places = json.loads(PLACES_FILE.read_text(encoding="utf-8")) if PLACES_FILE.exists() else []
    food_data = json.loads(FOOD_FILE.read_text(encoding="utf-8")) if FOOD_FILE.exists() else {}
    foods = food_data.get("records", []) if isinstance(food_data, dict) else food_data

    req_by_rid = {r["research_id"]: r for r in reqs if isinstance(r, dict) and "research_id" in r}
    audit_by_rid = {a["research_id"]: a for a in audits if isinstance(a, dict) and "research_id" in a}
    food_by_id = {f["research_id"]: f for f in foods if isinstance(f, dict) and "research_id" in f}
    
    place_by_id = {}
    for p in places:
        if isinstance(p, dict):
            if "id" in p:
                place_by_id[p["id"]] = p
            if "research_id" in p:
                place_by_id[p["research_id"]] = p

    all_files = sorted([
        f for f in os.listdir(MANUAL_DIR)
        if (MANUAL_DIR / f).is_file() and f not in ["README.md", "metadata.json", "manifest.json", "image_mapping_report.json"]
    ])

    file_hashes = {}
    metadata_map = {}
    registered_rids = set()

    for filename in all_files:
        fpath = MANUAL_DIR / filename
        stem = Path(filename).stem
        ext = Path(filename).suffix.lower()
        size_bytes = fpath.stat().st_size

        with open(fpath, "rb") as f:
            file_bytes = f.read()
            sha256_hash = hashlib.sha256(file_bytes).hexdigest()

        duplicate_of = None
        if sha256_hash in file_hashes:
            duplicate_of = file_hashes[sha256_hash]
        else:
            file_hashes[sha256_hash] = filename

        width, height = 0, 0
        img_format = None
        try:
            with Image.open(fpath) as img:
                width, height = img.size
                img_format = img.format
        except Exception:
            pass

        canonical_target_id = SPELLING_ALIASES.get(stem, stem)
        detected_rid = None
        place_name = None
        district = None
        category = None
        confidence = "low"
        authenticity_status = "manually_verified"

        if canonical_target_id in req_by_rid:
            detected_rid = canonical_target_id
            confidence = "high"
            authenticity_status = "manually_verified"
            req_item = req_by_rid[canonical_target_id]
            place_name = req_item.get("place_name")
            district = req_item.get("district")
            category = req_item.get("category")
        elif canonical_target_id in place_by_id:
            detected_rid = canonical_target_id
            confidence = "high"
            authenticity_status = "manually_verified"
            p_item = place_by_id[canonical_target_id]
            place_name = p_item.get("name")
            district = p_item.get("district")
            category = p_item.get("category")
        elif canonical_target_id in food_by_id:
            detected_rid = canonical_target_id
            confidence = "high"
            authenticity_status = "manually_verified"
            f_item = food_by_id[canonical_target_id]
            place_name = f_item.get("name")
            district = f_item.get("district")
            category = f_item.get("food_category") or "food"
        elif canonical_target_id in audit_by_rid:
            detected_rid = canonical_target_id
            confidence = "high"
            authenticity_status = "manually_verified"
            a_item = audit_by_rid[canonical_target_id]
            place_name = a_item.get("place_name")
            district = a_item.get("district")
            category = a_item.get("category")
        else:
            # Ambiguous/secondary variant
            parts = stem.split("_")
            detected_rid = stem
            confidence = "medium"
            authenticity_status = "secondary_candidate"
            if len(parts) >= 2:
                district = parts[1].capitalize()
            if stem.startswith("food_"):
                category = "food"
                place_name = f"{district} Regional Culinary Variant ({stem})"
            elif stem.startswith("place_"):
                category = "destination"
                place_name = f"{district} Regional Sanctuary ({stem})"

        # Deduplicate target research ID assignments
        if confidence == "high" and detected_rid in registered_rids:
            confidence = "medium"
            authenticity_status = "duplicate_assignment"
            duplicate_of = duplicate_of or f"existing_assignment_{detected_rid}"

        if confidence == "high":
            registered_rids.add(detected_rid)

        metadata_entry = {
            "research_id": detected_rid,
            "filename": filename,
            "category": category,
            "district": district,
            "place_name": place_name,
            "authenticity_status": authenticity_status,
            "source_type": "user_supplied",
            "provenance_status": "source_details_not_recorded",
            "mapping_confidence": confidence,
            "width": width,
            "height": height,
            "format": img_format,
            "file_size_bytes": size_bytes,
            "sha256": sha256_hash,
            "duplicate_of": duplicate_of,
            "source_url": None,
            "license": None
        }

        metadata_map[stem] = metadata_entry

    METADATA_FILE.write_text(json.dumps(metadata_map, indent=2), encoding="utf-8")
    print(f"Successfully generated metadata for all {len(metadata_map)} files into {METADATA_FILE.relative_to(REPO_ROOT)}")
    print(f"High confidence entries: {sum(1 for v in metadata_map.values() if v['mapping_confidence'] == 'high')}")
    print(f"Medium confidence entries: {sum(1 for v in metadata_map.values() if v['mapping_confidence'] == 'medium')}")
    print(f"Low confidence entries: {sum(1 for v in metadata_map.values() if v['mapping_confidence'] == 'low')}")

if __name__ == "__main__":
    generate_metadata()
