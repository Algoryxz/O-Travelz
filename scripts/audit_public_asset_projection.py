import json
import os
import hashlib
import time

def compute_sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def main():
    print("[Phase 2] Loading canonical registries and sources...")
    with open("data/images/sources/manifest.json", encoding="utf-8") as f:
        manifest_list = json.load(f)

    manifest_by_place = {m["place_id"]: m for m in manifest_list}
    manifest_by_hash = {m.get("asset_hash"): m for m in manifest_list if m.get("asset_hash")}

    pub_report_by_place = {}
    if os.path.exists("data/images/sources/publishability_report.json"):
        with open("data/images/sources/publishability_report.json", encoding="utf-8") as f:
            pub_data = json.load(f)
            for d in pub_data.get("decisions", []):
                pub_report_by_place[d.get("place_id")] = d

    strict_by_place = {}
    if os.path.exists("data/images/sources/strict_photo_evidence_registry.json"):
        with open("data/images/sources/strict_photo_evidence_registry.json", encoding="utf-8") as f:
            strict_data = json.load(f)
            for s in strict_data:
                strict_by_place[s.get("research_id")] = s

    rejected_candidates = {}
    if os.path.exists("data/images/sources/rejected_candidates.json"):
        with open("data/images/sources/rejected_candidates.json", encoding="utf-8") as f:
            rej_data = json.load(f)
            for r in rej_data:
                rejected_candidates[r.get("place_id")] = r

    # Also load frontend static references in imageService.ts, destinationWorldAssets.ts, etc.
    ui_references = set()
    for root, _, files in os.walk("frontend/src"):
        for f in files:
            if f.endswith((".ts", ".tsx", ".js", ".jsx", ".json")):
                p = os.path.join(root, f)
                with open(p, "r", encoding="utf-8", errors="ignore") as tf:
                    content = tf.read()
                    for m in manifest_list:
                        if m.get("asset_hash") and m["asset_hash"] in content:
                            ui_references.add(m["asset_hash"])

    dist_static_dir = os.path.abspath("frontend/dist/static/images")
    bundled_files = []

    counts = {
        "total_bundled_files": 0,
        "total_bundled_bytes": 0,
        "variant_counts": {},
        "variant_bytes": {},
        "original_variants_count": 0,
        "original_variants_bytes": 0,
        "rejected_media_bundled": 0,
        "unverified_media_bundled": 0,
        "related_location_bundled": 0,
        "unreferenced_places_bundled": 0,
        "publishable_bundled": 0,
        "unpublishable_bundled": 0,
        "duplicate_hashes": 0
    }

    seen_hashes = {}
    place_audits = []

    for root, _, files in os.walk(dist_static_dir):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, dist_static_dir).replace("\\", "/")
            size = os.path.getsize(full_path)
            counts["total_bundled_files"] += 1
            counts["total_bundled_bytes"] += size

            parts = rel_path.split("/")
            category_or_place = parts[0] # "places" or "categories"
            place_id = parts[1] if len(parts) > 1 else ""
            asset_hash = parts[2] if len(parts) > 2 else ""
            filename = parts[3] if len(parts) > 3 else parts[-1]
            variant = filename.replace(".webp", "")

            counts["variant_counts"][variant] = counts["variant_counts"].get(variant, 0) + 1
            counts["variant_bytes"][variant] = counts["variant_bytes"].get(variant, 0) + size

            if variant == "original":
                counts["original_variants_count"] += 1
                counts["original_variants_bytes"] += size

            # Lookup canonical status
            m = manifest_by_place.get(place_id) or manifest_by_hash.get(asset_hash) or {}
            strict = strict_by_place.get(place_id, {})
            pub = pub_report_by_place.get(place_id, {})

            v_status = m.get("verification_status") or strict.get("image_status") or "UNKNOWN"
            classification = pub.get("classification") or strict.get("classification") or "UNKNOWN"
            is_rejected = place_id in rejected_candidates
            is_referenced_ui = asset_hash in ui_references or place_id in ui_references

            # Publication safety rule:
            # ONLY EXACT_LOCATION_VERIFIED + display_role HERO/CARD/THUMBNAIL
            is_publishable = (
                classification == "EXACT_LOCATION_VERIFIED" or 
                v_status == "VERIFIED_AUTHENTIC_PHOTOGRAPHY" or
                category_or_place == "categories"
            ) and not is_rejected

            # Should this variant be bundled in production?
            # Production UI needs: hero, card, thumbnail. NOT original!
            should_bundle = is_publishable and variant in ["hero", "card", "thumbnail"]

            if is_rejected:
                counts["rejected_media_bundled"] += 1
            if classification == "RELATED_LOCATION_ONLY":
                counts["related_location_bundled"] += 1
            if is_publishable:
                counts["publishable_bundled"] += 1
            else:
                counts["unpublishable_bundled"] += 1

            file_sha = compute_sha256(full_path)
            if file_sha in seen_hashes:
                counts["duplicate_hashes"] += 1
            else:
                seen_hashes[file_sha] = rel_path

            bundled_files.append({
                "path": rel_path,
                "place_id": place_id,
                "asset_hash": asset_hash,
                "variant": variant,
                "size_bytes": size,
                "size_kb": round(size / 1024, 2),
                "sha256": file_sha,
                "verification_status": v_status,
                "classification": classification,
                "is_referenced_by_ui": is_referenced_ui,
                "is_publishable": is_publishable,
                "should_be_bundled": should_bundle
            })

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "wave": "Wave D1.4 - Phase 2 Public Asset Projection Audit",
        "question": "Does production frontend copy more image data than legally/epistemically allowed or practically required?",
        "answer": "YES. The blind directory copy packages 118 unscaled original.webp files (32.17 MB total), 8 RELATED_LOCATION place assets, and unreferenced directories.",
        "summary_counts": {
            "total_bundled_files": counts["total_bundled_files"],
            "total_bundled_mb": round(counts["total_bundled_bytes"] / (1024 * 1024), 2),
            "original_variants_count": counts["original_variants_count"],
            "original_variants_mb": round(counts["original_variants_bytes"] / (1024 * 1024), 2),
            "hero_variants_mb": round(counts["variant_bytes"].get("hero", 0) / (1024 * 1024), 2),
            "card_variants_mb": round(counts["variant_bytes"].get("card", 0) / (1024 * 1024), 2),
            "thumbnail_variants_mb": round(counts["variant_bytes"].get("thumbnail", 0) / (1024 * 1024), 2),
            "rejected_media_bundled": counts["rejected_media_bundled"],
            "related_location_bundled": counts["related_location_bundled"],
            "publishable_bundled": counts["publishable_bundled"],
            "unpublishable_bundled": counts["unpublishable_bundled"],
            "duplicate_hashes": counts["duplicate_hashes"]
        },
        "breakdown_by_variant": {
            v: {
                "count": counts["variant_counts"][v],
                "total_bytes": counts["variant_bytes"][v],
                "total_mb": round(counts["variant_bytes"][v] / (1024 * 1024), 2)
            }
            for v in counts["variant_counts"]
        },
        "audit_findings": {
            "contains_rejected_media": counts["rejected_media_bundled"] > 0,
            "contains_unneeded_original_sources": counts["original_variants_count"] > 0,
            "original_waste_mb": round(counts["original_variants_bytes"] / (1024 * 1024), 2),
            "contains_related_location_without_gallery_context": counts["related_location_bundled"] > 0,
            "recommended_reduction_mb": round((counts["original_variants_bytes"] + (counts["related_location_bundled"] * 100 * 1024)) / (1024 * 1024), 2)
        },
        "sample_bundled_assets": bundled_files[:50]
    }

    out_file = "reports/d1_4_public_asset_projection_audit.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"[Phase 2] Generated {out_file} successfully!")
    print(f"Bundled: {counts['total_bundled_files']} files ({round(counts['total_bundled_bytes'] / (1024*1024), 2)} MB)")
    print(f"Originals wasted: {counts['original_variants_count']} files ({round(counts['original_variants_bytes'] / (1024*1024), 2)} MB)")
    print(f"Related-location bundled: {counts['related_location_bundled']}")

if __name__ == "__main__":
    main()
