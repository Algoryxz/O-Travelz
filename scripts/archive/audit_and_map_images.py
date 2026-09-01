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

def main():
    reqs = json.loads(REQ_FILE.read_text(encoding="utf-8")) if REQ_FILE.exists() else []
    audits = json.loads(AUDIT_FILE.read_text(encoding="utf-8")) if AUDIT_FILE.exists() else []
    places = json.loads(PLACES_FILE.read_text(encoding="utf-8")) if PLACES_FILE.exists() else []
    foods = json.loads(FOOD_FILE.read_text(encoding="utf-8")) if FOOD_FILE.exists() else []

    req_by_rid = {r["research_id"]: r for r in reqs if isinstance(r, dict) and "research_id" in r}
    audit_by_rid = {a["research_id"]: a for a in audits if isinstance(a, dict) and "research_id" in a}
    food_by_id = {f["id"]: f for f in foods if isinstance(f, dict) and "id" in f}
    
    # Map places by id, research_id, name
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

    print(f"Total files in manual/: {len(all_files)}")

    file_hashes = {}
    duplicate_hashes = []
    results = []

    for filename in all_files:
        fpath = MANUAL_DIR / filename
        stem = Path(filename).stem
        ext = Path(filename).suffix.lower()
        size = fpath.stat().st_size

        with open(fpath, "rb") as f:
            file_bytes = f.read()
            sha256 = hashlib.sha256(file_bytes).hexdigest()

        if sha256 in file_hashes:
            duplicate_hashes.append((filename, file_hashes[sha256]))
        else:
            file_hashes[sha256] = filename

        is_valid_img = False
        dims = (0, 0)
        img_fmt = None
        try:
            with Image.open(fpath) as img:
                dims = img.size
                img_fmt = img.format
                is_valid_img = True
        except Exception as e:
            is_valid_img = False

        detected_rid = None
        place_name = None
        district = None
        category = None
        match_method = None
        status = "READY"

        if stem in req_by_rid:
            detected_rid = stem
            match_method = "exact_research_id"
            place_name = req_by_rid[stem].get("place_name")
            district = req_by_rid[stem].get("district")
            category = req_by_rid[stem].get("category")
        elif stem in audit_by_rid:
            detected_rid = stem
            match_method = "audit_research_id"
            place_name = audit_by_rid[stem].get("place_name")
            district = audit_by_rid[stem].get("district")
            category = audit_by_rid[stem].get("category")
        elif stem in food_by_id:
            detected_rid = stem
            match_method = "canonical_food_id"
            place_name = food_by_id[stem].get("name")
            district = food_by_id[stem].get("district")
            category = "food"
        elif stem in place_by_id:
            detected_rid = stem
            match_method = "canonical_place_id"
            place_name = place_by_id[stem].get("name")
            district = place_by_id[stem].get("district")
            category = place_by_id[stem].get("category")
        else:
            match_method = "unmatched"
            status = "UNMATCHED"

        results.append({
            "filename": filename,
            "detected_research_id": detected_rid,
            "match_method": match_method,
            "place_name": place_name,
            "district": district,
            "category": category,
            "dimensions": dims,
            "format": img_fmt,
            "size_bytes": size,
            "sha256": sha256,
            "is_valid_image": is_valid_img,
            "status": status
        })

    ready_count = sum(1 for r in results if r["status"] == "READY")
    unmatched_count = sum(1 for r in results if r["status"] == "UNMATCHED")

    print(f"Ready matched: {ready_count} / {len(all_files)}")
    print(f"Unmatched: {unmatched_count}")
    print(f"Duplicate file hashes: {len(duplicate_hashes)}")
    if duplicate_hashes:
        for dup in duplicate_hashes:
            print(f"  Duplicate: {dup[0]} has identical bytes to {dup[1]}")

    for r in results:
        if r["status"] == "UNMATCHED":
            print(f"Unmatched file: {r['filename']}")

    # Save mapping report
    report_file = MANUAL_DIR / "image_mapping_report.json"
    report_file.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"\nWrote image mapping report to {report_file}")

if __name__ == "__main__":
    main()
