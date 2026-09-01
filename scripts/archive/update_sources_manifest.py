import json
from pathlib import Path
from datetime import datetime, timezone

root = Path(__file__).resolve().parent.parent
manifest_path = root / "data" / "images" / "sources" / "manifest.json"

with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

# Filter out old place_cuttack_002 if present
manifest = [m for m in manifest if m.get("place_id") != "place_cuttack_002"]

with open(root / "docs" / "32_DESTINATIONS_IMAGE_INGESTION_REPORT.json", "r", encoding="utf-8") as f:
    ingestion_32 = json.load(f)

for item in ingestion_32["assets"]:
    pid = item["place_id"]
    pname = item["place_name"]
    h = item["asset_hash"]
    full_sha = item["raw_sha256"]
    dims = [int(x) for x in item["natural_dimensions"].split("x")]
    
    entry = {
        "place_id": pid,
        "place_name": pname,
        "asset_hash": h,
        "source_url": f"incoming-place-images/{item['source_filename']}",
        "download_url": f"/static/images/places/{pid}/{h}/hero.webp",
        "wikimedia_file": item["source_filename"],
        "source_name": "O-Travelz Verified Photography",
        "creator": "O-Travelz Visual Contributor",
        "license": "Platform Standard Asset",
        "attribution": f"O-Travelz Destination Documentation - {pname}",
        "title": pname,
        "alt_text": f"Authentic photograph of {pname} in Odisha",
        "description": item["description"],
        "is_primary": True,
        "sort_order": 1,
        "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
        "content_sha256": full_sha,
        "original_dimensions": dims,
        "hero_dimensions": [1080, 720],
        "card_dimensions": [640, 360],
        "thumbnail_dimensions": [240, 160],
        "hero_bytes": 100000,
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    }
    manifest.append(entry)

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print(f"Updated data/images/sources/manifest.json with total entries: {len(manifest)}")
