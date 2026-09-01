#!/usr/bin/env python3
"""Update and audit semantic destination identity for all 50 destinations and frontend services."""
import io
import json
import hashlib
import sys
import re
from pathlib import Path
import httpx
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent

SPECIFIC_ENHANCEMENTS = {
    "place_sambalpur_001": {
        "search_title": "File:Hirakud Dam Viewpoint, Sambalpur.jpg",
    },
    "place_bbsr_010": {
        "search_title": "File:Ekamra haat Bhubaneswar Odisha.JPG",
    },
}

def fetch_and_process_file(client: httpx.Client, pid: str, wikimedia_file: str):
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "titles": wikimedia_file,
        "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata",
        "format": "json",
    }
    r = client.get(url, params=params, timeout=20.0)
    pages = r.json().get("query", {}).get("pages", {})
    if not pages:
        return None
    page = next(iter(pages.values()))
    info = page.get("imageinfo", [{}])[0]
    meta = info.get("extmetadata", {})

    img_url = info.get("url")
    if not img_url:
        return None

    print(f"Downloading {img_url} for {pid}...")
    img_resp = client.get(img_url, timeout=40.0)
    raw_bytes = img_resp.content
    content_sha256 = hashlib.sha256(raw_bytes).hexdigest()
    asset_hash = content_sha256[:12]

    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")

    out_dir = ROOT / "data" / "images" / "places" / pid / asset_hash
    out_dir.mkdir(parents=True, exist_ok=True)

    # Save original.webp
    img.save(out_dir / "original.webp", "WEBP", quality=90)

    # Save hero.webp (1080x720 cover crop)
    hero = cover_crop(img, 1080, 720)
    hero.save(out_dir / "hero.webp", "WEBP", quality=88)

    # Save card.webp (640x360 cover crop)
    card = cover_crop(img, 640, 360)
    card.save(out_dir / "card.webp", "WEBP", quality=85)

    # Save thumbnail.webp (240x160 cover crop)
    thumb = cover_crop(img, 240, 160)
    thumb.save(out_dir / "thumbnail.webp", "WEBP", quality=80)

    creator = clean_meta_val(meta.get("Artist", {}).get("value", "Wikimedia Commons Contributor"))
    license_name = clean_meta_val(meta.get("LicenseShortName", {}).get("value", "CC BY-SA 4.0"))
    description = clean_meta_val(meta.get("ImageDescription", {}).get("value", wikimedia_file))

    return {
        "asset_hash": asset_hash,
        "content_sha256": content_sha256,
        "wikimedia_file": wikimedia_file,
        "source_url": img_url,
        "creator": creator,
        "license": license_name,
        "attribution": f"Photo by {creator} via Wikimedia Commons, licensed under {license_name}",
        "description": description,
    }

def cover_crop(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    w, h = img.size
    target_ratio = target_w / target_h
    current_ratio = w / h

    if current_ratio > target_ratio:
        new_w = int(h * target_ratio)
        offset = (w - new_w) // 2
        img_cropped = img.crop((offset, 0, offset + new_w, h))
    else:
        new_h = int(w / target_ratio)
        offset = (h - new_h) // 2
        img_cropped = img.crop((0, offset, w, offset + new_h))

    return img_cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)

def clean_meta_val(v: str) -> str:
    if not v:
        return "Unknown"
    v = re.sub(r"<[^>]+>", "", v)
    v = v.replace("\n", " ").strip()
    return v[:120]

def main():
    manifest_path = ROOT / "data" / "images" / "sources" / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    headers = {
        "User-Agent": "OTravelz-Destination-Ingestion/1.0 (https://o-travelz.com; dev@o-travelz.com) python-httpx/0.27.2",
    }

    with httpx.Client(headers=headers, follow_redirects=True) as client:
        for m in manifest:
            pid = m["place_id"]
            if pid in SPECIFIC_ENHANCEMENTS:
                enh = SPECIFIC_ENHANCEMENTS[pid]
                res = fetch_and_process_file(client, pid, enh["search_title"])
                if res:
                    m.update(res)
                    print(f"Updated {pid} with enhanced photo: {enh['search_title']}")

    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("Manifest updated successfully.")

if __name__ == "__main__":
    main()
