import json
import os
import shutil
import sys
import time

def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dist_static_dir = os.path.join(repo_root, "frontend/dist/static/images")
    generated_dir = os.path.join(repo_root, "frontend/generated")
    os.makedirs(generated_dir, exist_ok=True)

    print("[Projection Compiler] Loading canonical sources...")
    manifest_path = os.path.join(repo_root, "data/images/sources/manifest.json")
    category_manifest_path = os.path.join(repo_root, "data/images/sources/category_manifest.json")
    rejected_path = os.path.join(repo_root, "data/images/sources/rejected_candidates.json")
    publishability_path = os.path.join(repo_root, "data/images/sources/publishability_report.json")

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    with open(category_manifest_path, "r", encoding="utf-8") as f:
        categories = json.load(f)

    rejected_ids = set()
    if os.path.exists(rejected_path):
        with open(rejected_path, "r", encoding="utf-8") as f:
            for r in json.load(f):
                rid = r.get("research_id") or r.get("place_id")
                if rid:
                    rejected_ids.add(rid)

    pub_decisions = {}
    if os.path.exists(publishability_path):
        with open(publishability_path, "r", encoding="utf-8") as f:
            for d in json.load(f).get("decisions", []):
                pub_decisions[d.get("place_id")] = d

    # Preferred public variants for production serving:
    # hero, card, thumbnail. (NEVER original.webp!)
    PUBLIC_VARIANTS = ["hero.webp", "card.webp", "thumbnail.webp"]

    public_manifest = {
        "generated_at": os.environ.get("VITE_BUILD_TIME") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "compiler": "build_public_media_projection.py",
        "rules": {
            "allowed_variants": PUBLIC_VARIANTS,
            "excluded_variants": ["original.webp"],
            "verification_requirement": "EXACT_LOCATION_VERIFIED or VERIFIED_AUTHENTIC_PHOTOGRAPHY",
            "rejected_policy": "NEVER_PUBLISH"
        },
        "places": {},
        "categories": {}
    }

    files_to_copy = []
    total_original_bytes_saved = 0

    # 1. Process place media
    for item in manifest:
        place_id = item["place_id"]
        asset_hash = item.get("asset_hash")
        v_status = item.get("verification_status", "")

        # Skip rejected
        if place_id in rejected_ids:
            continue

        # Check classification
        d = pub_decisions.get(place_id, {})
        classification = d.get("classification")
        if classification == "RELATED_LOCATION_ONLY":
            # RELATED_LOCATION cannot be public HERO/CARD
            continue

        if v_status not in ["VERIFIED_AUTHENTIC_PHOTOGRAPHY", "EXACT_LOCATION_VERIFIED"] and classification != "EXACT_LOCATION_VERIFIED":
            continue

        src_place_dir = os.path.join(repo_root, f"data/images/places/{place_id}/{asset_hash}")
        if not os.path.exists(src_place_dir):
            print(f"[Projection Compiler] Warning: source directory missing for {place_id}/{asset_hash}")
            continue

        dest_place_dir = os.path.join(dist_static_dir, f"places/{place_id}/{asset_hash}")

        place_entry = {
            "place_name": item.get("place_name"),
            "asset_hash": asset_hash,
            "title": item.get("title"),
            "alt_text": item.get("alt_text"),
            "creator": item.get("creator"),
            "license": item.get("license"),
            "attribution": item.get("attribution"),
            "variants": {}
        }

        # Check for original.webp to track bytes saved
        orig_file = os.path.join(src_place_dir, "original.webp")
        if os.path.exists(orig_file):
            total_original_bytes_saved += os.path.getsize(orig_file)

        for v in PUBLIC_VARIANTS:
            src_f = os.path.join(src_place_dir, v)
            if os.path.exists(src_f):
                dest_f = os.path.join(dest_place_dir, v)
                files_to_copy.append((src_f, dest_f))
                v_name = v.replace(".webp", "")
                place_entry["variants"][v_name] = {
                    "path": f"/static/images/places/{place_id}/{asset_hash}/{v}",
                    "size_bytes": os.path.getsize(src_f)
                }

        public_manifest["places"][place_id] = place_entry

    # 2. Process category media
    for cat in categories:
        cat_id = cat["category_id"]
        asset_hash = cat["asset_hash"]
        src_cat_dir = os.path.join(repo_root, f"data/images/categories/{cat_id}/{asset_hash}")
        dest_cat_dir = os.path.join(dist_static_dir, f"categories/{cat_id}/{asset_hash}")

        # Check for original.webp to track bytes saved
        orig_file = os.path.join(src_cat_dir, "original.webp")
        if os.path.exists(orig_file):
            total_original_bytes_saved += os.path.getsize(orig_file)

        cat_entry = {
            "category_key": cat.get("category_key"),
            "asset_hash": asset_hash,
            "title": cat.get("title"),
            "variants": {}
        }

        for v in PUBLIC_VARIANTS:
            src_f = os.path.join(src_cat_dir, v)
            if os.path.exists(src_f):
                dest_f = os.path.join(dest_cat_dir, v)
                files_to_copy.append((src_f, dest_f))
                v_name = v.replace(".webp", "")
                cat_entry["variants"][v_name] = {
                    "path": f"/static/images/categories/{cat_id}/{asset_hash}/{v}",
                    "size_bytes": os.path.getsize(src_f)
                }

        public_manifest["categories"][cat_id] = cat_entry

    # Save publicMediaManifest.json
    manifest_out = os.path.join(generated_dir, "publicMediaManifest.json")
    with open(manifest_out, "w", encoding="utf-8") as f:
        json.dump(public_manifest, f, indent=2)
    print(f"[Projection Compiler] Wrote public manifest with {len(public_manifest['places'])} places, {len(public_manifest['categories'])} categories -> {manifest_out}")

    # Copy files into dist if dist exists
    dist_dir = os.path.join(repo_root, "frontend/dist")
    if os.path.exists(dist_dir):
        # Clean existing static/images directory in dist to guarantee no stale original.webp remain
        if os.path.exists(dist_static_dir):
            shutil.rmtree(dist_static_dir)

        copied_count = 0
        copied_bytes = 0
        for src_f, dest_f in files_to_copy:
            os.makedirs(os.path.dirname(dest_f), exist_ok=True)
            shutil.copy2(src_f, dest_f)
            copied_count += 1
            copied_bytes += os.path.getsize(dest_f)

        print(f"[Projection Compiler] Deployed {copied_count} public variant files ({round(copied_bytes / (1024*1024), 2)} MB) to {dist_static_dir}")
        print(f"[Projection Compiler] Successfully eliminated {round(total_original_bytes_saved / (1024*1024), 2)} MB of unneeded original.webp sources!")
    else:
        print("[Projection Compiler] Dist directory does not exist yet. Manifest generated; run after vite build.")

if __name__ == "__main__":
    main()
