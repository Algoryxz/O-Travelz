"""
O-Travelz Automated Manual Image Ingestion & Manifest Builder
Phase 1-6 Automated Pipeline
"""

import json
import os
import hashlib
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
MANUAL_DIR = REPO_ROOT / "data" / "images" / "manual"
REQ_FILE = REPO_ROOT / "data" / "images" / "sources" / "manual_image_request.json"
AUDIT_FILE = REPO_ROOT / "data" / "images" / "sources" / "authentic_image_audit.json"
PLACES_FILE = REPO_ROOT / "data" / "places" / "places.json"
FOOD_FILE = REPO_ROOT / "data" / "research" / "food" / "odisha_food_research.json"

# Known deterministic aliases (e.g. spelling variation bolangir -> balangir)
SPELLING_ALIASES = {
    "place_bolangir_001": "place_balangir_001",
    "place_bolangir_002": "place_balangir_002",
}

def load_sources():
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

    return req_by_rid, audit_by_rid, food_by_id, place_by_id, reqs

def process_images():
    req_by_rid, audit_by_rid, food_by_id, place_by_id, all_reqs = load_sources()

    all_files = sorted([
        f for f in os.listdir(MANUAL_DIR)
        if (MANUAL_DIR / f).is_file() and f not in ["README.md", "metadata.json", "manifest.json", "image_mapping_report.json"]
    ])

    print("=" * 60)
    print("O-TRAVELZ AUTOMATED MANUAL IMAGE INGESTION & MAPPING")
    print("=" * 60)
    print(f"Total image files discovered in data/images/manual/: {len(all_files)}")
    print(f"Total requested targets in manual_image_request.json: {len(all_reqs)}")

    file_hashes = {}
    duplicate_files = []
    mapping_reports = []
    manifest_entries = []
    registered_rids = set()

    # Pass 1: Prioritize exact matches first so exact filenames take precedence over aliases
    exact_stems = {Path(f).stem for f in all_files}

    for filename in all_files:
        fpath = MANUAL_DIR / filename
        stem = Path(filename).stem
        ext = Path(filename).suffix.lower()
        size_bytes = fpath.stat().st_size

        # 1. Quality & Format checks
        is_supported_ext = ext in [".webp", ".jpg", ".jpeg", ".png", ".avif"]
        is_zero_byte = size_bytes == 0
        is_decodable = False
        width, height = 0, 0
        img_format = None

        with open(fpath, "rb") as f:
            file_bytes = f.read()
            sha256_hash = hashlib.sha256(file_bytes).hexdigest()

        if sha256_hash in file_hashes:
            duplicate_files.append((filename, file_hashes[sha256_hash]))
        else:
            file_hashes[sha256_hash] = filename

        if not is_zero_byte and is_supported_ext:
            try:
                with Image.open(fpath) as img:
                    width, height = img.size
                    img_format = img.format
                    is_decodable = True
            except Exception:
                is_decodable = False

        quality_status = "PASS"
        quality_notes = []
        if not is_supported_ext:
            quality_status = "FAIL"
            quality_notes.append(f"Unsupported extension {ext}")
        elif is_zero_byte or not is_decodable:
            quality_status = "FAIL"
            quality_notes.append("Corrupted or zero-byte image")
        else:
            if width < 640 or height < 360:
                quality_status = "WARNING"
                quality_notes.append(f"Low resolution: {width}x{height}")
            ratio = width / height if height > 0 else 0
            if ratio < 0.8 or ratio > 2.5:
                if quality_status != "FAIL":
                    quality_status = "WARNING"
                quality_notes.append(f"Extreme aspect ratio: {ratio:.2f}:1")

        # 2. Identity Mapping Resolution
        canonical_target_id = SPELLING_ALIASES.get(stem, stem)
        detected_rid = None
        place_name = None
        district = None
        category = None
        match_method = None
        identity_status = "READY"

        if canonical_target_id in req_by_rid:
            detected_rid = canonical_target_id
            match_method = "exact_requested_research_id" if canonical_target_id == stem else "normalized_alias_match"
            req_item = req_by_rid[canonical_target_id]
            place_name = req_item.get("place_name")
            district = req_item.get("district")
            category = req_item.get("category")
        elif canonical_target_id in place_by_id:
            detected_rid = canonical_target_id
            match_method = "canonical_place_catalog_match"
            p_item = place_by_id[canonical_target_id]
            place_name = p_item.get("name")
            district = p_item.get("district")
            category = p_item.get("category")
        elif canonical_target_id in food_by_id:
            detected_rid = canonical_target_id
            match_method = "canonical_food_research_match"
            f_item = food_by_id[canonical_target_id]
            place_name = f_item.get("name")
            district = f_item.get("district")
            category = f_item.get("food_category") or "food"
        elif canonical_target_id in audit_by_rid:
            detected_rid = canonical_target_id
            match_method = "authentic_audit_match"
            a_item = audit_by_rid[canonical_target_id]
            place_name = a_item.get("place_name")
            district = a_item.get("district")
            category = a_item.get("category")
        else:
            match_method = "unmatched"
            identity_status = "UNMATCHED"

        # Check for duplicate target assignment
        if identity_status == "READY":
            if detected_rid in registered_rids:
                identity_status = "DUPLICATE"
                match_method = f"duplicate_assignment_of_{detected_rid}"

        mapping_report = {
            "filename": filename,
            "detected_research_id": detected_rid,
            "match_method": match_method,
            "confidence": "HIGH" if identity_status == "READY" else "LOW",
            "place_name": place_name,
            "district": district,
            "category": category,
            "dimensions": {"width": width, "height": height},
            "format": img_format,
            "size_bytes": size_bytes,
            "sha256": sha256_hash,
            "identity_status": identity_status,
            "quality_status": quality_status,
            "quality_notes": quality_notes,
            "provenance_status": "UNRESOLVED"
        }
        mapping_reports.append(mapping_report)

        if identity_status == "READY" and quality_status != "FAIL":
            registered_rids.add(detected_rid)
            manifest_entry = {
                "filename": filename,
                "research_id": detected_rid,
                "place_name": place_name,
                "district": district,
                "category": category,
                "mapping_method": match_method,
                "metadata_status": "identity_verified",
                "dimensions": {"width": width, "height": height},
                "format": img_format,
                "size_bytes": size_bytes,
                "sha256": sha256_hash,
                "source_url": None,
                "source_type": "manual_collection",
                "provenance_verified": False
            }
            manifest_entries.append(manifest_entry)

    # 3. Write image_mapping_report.json and manifest.json
    mapping_file = MANUAL_DIR / "image_mapping_report.json"
    mapping_file.write_text(json.dumps(mapping_reports, indent=2), encoding="utf-8")

    manifest_data = {
        "metadata": {
            "version": "1.0.0",
            "state": "Odisha",
            "collection_type": "manual_stage",
            "total_images": len(manifest_entries),
            "identity_verified_count": len(manifest_entries),
            "provenance_verified_count": 0,
            "provenance_rule": "Strict non-fabrication: source_url/photographer left null until verified."
        },
        "images": manifest_entries
    }
    manifest_file = MANUAL_DIR / "manifest.json"
    manifest_file.write_text(json.dumps(manifest_data, indent=2), encoding="utf-8")

    print(f"\nWrote mapping report to: {mapping_file}")
    print(f"Wrote bulk manifest to: {manifest_file}")
    print(f"Total images successfully registered in manifest: {len(manifest_entries)} / {len(all_files)}")

    return manifest_entries, mapping_reports, duplicate_files

if __name__ == "__main__":
    process_images()
