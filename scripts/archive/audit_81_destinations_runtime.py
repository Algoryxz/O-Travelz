import json
import hashlib
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent

# Read places.json
with open(root / "data" / "places" / "places.json", "r", encoding="utf-8") as f:
    places = json.load(f)

# Read imageService.ts PLACE_IMAGE_MANIFEST
with open(root / "frontend" / "src" / "utils" / "imageService.ts", "r", encoding="utf-8") as f:
    code = f.read()

# Extract PLACE_IMAGE_MANIFEST entries
import re
pattern = re.compile(r'^\s*"([^"]+)":\s*(\[\s*\{.*?\n\s*\}\s*\]),?', re.MULTILINE | re.DOTALL)
manifest = {}
for m in pattern.finditer(code):
    k = m.group(1)
    v = json.loads(m.group(2))
    manifest[k] = v

print(f"Total entries in PLACE_IMAGE_MANIFEST: {len(manifest)}")

audit_results = []
all_hashes = {}
cross_leakage = []
semantic_mismatches = []
broken_images = []
fallback_count = 0
authentic_count = 0

for p in places:
    pid = p["id"]
    pname = p["name"]
    cat = p["category"]

    # Resolution by ID first, then by name
    imgs = manifest.get(pid) or manifest.get(pname)
    if not imgs:
        print(f"CRITICAL: No manifest entry for {pid} ({pname})")
        broken_images.append(pid)
        continue

    primary = imgs[0]
    src = primary["src"]
    is_fallback = primary.get("isFallback", False)

    if is_fallback or "data:image/svg+xml" in src:
        fallback_count += 1
        asset_type = "FALLBACK_SVG"
        hash_val = "SVG_FALLBACK"
        dims = "VECTOR"
    else:
        authentic_count += 1
        asset_type = "AUTHENTIC_WEBP"
        # Check actual file on disk
        clean_src = src.replace("/static/images/", "")
        local_path = root / "data" / "images" / clean_src
        if not local_path.is_file():
            print(f"BROKEN FILE: {local_path} for {pid}")
            broken_images.append(pid)
            hash_val = "MISSING"
            dims = "MISSING"
        else:
            raw_bytes = local_path.read_bytes()
            hash_val = hashlib.sha256(raw_bytes).hexdigest()[:12]
            with Image.open(local_path) as im:
                dims = f"{im.width}x{im.height}"

            # Check cross-destination hash collisions
            if hash_val in all_hashes:
                other_pid, other_name = all_hashes[hash_val]
                if other_pid != pid:
                    print(f"CROSS LEAKAGE: Hash {hash_val} shared between {pid} ({pname}) and {other_pid} ({other_name})")
                    cross_leakage.append((pid, other_pid, hash_val))
            else:
                all_hashes[hash_val] = (pid, pname)

    # Check for Lingaraj / Konark leakage
    if pid != "place_bbsr_001" and "place_bbsr_001" in src:
        print(f"LINGARAJ LEAKAGE: {pid} resolves to {src}")
        semantic_mismatches.append((pid, "Lingaraj leakage"))
    if pid != "place_konark_001" and "place_konark_001" in src:
        print(f"KONARK LEAKAGE: {pid} resolves to {src}")
        semantic_mismatches.append((pid, "Konark leakage"))
    if "14877b098df9" in src:
        print(f"CUTTACK CHANDI BHOGA LEAKAGE: {pid} resolves to {src}")
        semantic_mismatches.append((pid, "Bhoga sweets leakage"))

    audit_results.append({
        "place_id": pid,
        "name": pname,
        "category": cat,
        "resolved_url": src,
        "hash": hash_val,
        "dimensions": dims,
        "type": asset_type,
        "status": "PASS" if not broken_images and not is_fallback else "FAIL"
    })

print("\n--- 81 DESTINATIONS AUDIT SUMMARY ---")
print(f"Total audited: {len(audit_results)}/81")
print(f"Authentic photography: {authentic_count}")
print(f"Fallbacks: {fallback_count}")
print(f"Cross-destination hash collisions: {len(cross_leakage)}")
print(f"Semantic mismatches: {len(semantic_mismatches)}")
print(f"Broken images: {len(broken_images)}")

# Write to docs/81_DESTINATIONS_IMAGE_IDENTITY_AUDIT.json
audit_json_path = root / "docs" / "81_DESTINATIONS_IMAGE_IDENTITY_AUDIT.json"
with open(audit_json_path, "w", encoding="utf-8") as f:
    json.dump({
        "generated_at": "2026-08-21T15:48:00Z",
        "total_destinations": len(audit_results),
        "authentic_count": authentic_count,
        "fallback_count": fallback_count,
        "cross_leakage_count": len(cross_leakage),
        "semantic_mismatches_count": len(semantic_mismatches),
        "broken_images_count": len(broken_images),
        "audit_verdict": "PRODUCTION_READY" if authentic_count == 81 and fallback_count == 0 and len(cross_leakage) == 0 and len(semantic_mismatches) == 0 and len(broken_images) == 0 else "NOT_READY",
        "destinations": audit_results
    }, f, indent=2)

print(f"Saved audit JSON: {audit_json_path}")
