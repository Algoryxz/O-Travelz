#!/usr/bin/env python3
"""Ingest dedicated category photography for Medical Help, ATMs, Hangout & Chill with full provenance."""
import io
import json
import hashlib
import re
import sys
from pathlib import Path
import httpx
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent

CATEGORY_SOURCES = [
    {
        "category_id": "cat_medical_help",
        "category_key": "medical help",
        "aliases": ["medical help", "hospitals"],
        "title": "Hospitals & Medical Services",
        "alt_text": "AIIMS Bhubaneswar modern hospital and medical emergency healthcare campus in Odisha",
        "wikimedia_file": "File:AIIMS Bhubaneswar, Odisha.jpg",
        "fallback_query": "AIIMS Bhubaneswar",
    },
    {
        "category_id": "cat_atms",
        "category_key": "atms",
        "aliases": ["atms", "banking"],
        "title": "Banking & ATM Services",
        "alt_text": "State Bank 24/7 ATM cash dispenser kiosk and banking service in India",
        "wikimedia_file": "File:State Bank of India ATM, Khankul.jpg",
        "fallback_query": "State Bank ATM",
    },
    {
        "category_id": "cat_hangout_chill",
        "category_key": "hangout & chill",
        "aliases": ["hangout & chill", "cafes"],
        "title": "Cafes, Lounges & Social Spaces",
        "alt_text": "Traditional tea stall, open-air café lounge and social hangout in Odisha",
        "wikimedia_file": "File:Village Tea Stall - Sasapasi - Dhenkanal 2018-01-25 9733.JPG",
        "fallback_query": "Tea stall Odisha",
    },
]

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
    headers = {
        "User-Agent": "OTravelz-Category-Ingestion/1.0 (https://o-travelz.com; dev@o-travelz.com) python-httpx/0.27.2",
    }

    category_manifest_entries = []

    with httpx.Client(headers=headers, follow_redirects=True) as client:
        for cat in CATEGORY_SOURCES:
            cid = cat["category_id"]
            wfile = cat["wikimedia_file"]
            print(f"Fetching {wfile} for category {cid}...")

            url = "https://commons.wikimedia.org/w/api.php"
            params = {
                "action": "query",
                "titles": wfile,
                "prop": "imageinfo",
                "iiprop": "url|size|mime|extmetadata",
                "format": "json",
            }
            r = client.get(url, params=params, timeout=20.0)
            pages = r.json().get("query", {}).get("pages", {})
            if not pages or "-1" in pages:
                # Search fallback
                params = {
                    "action": "query",
                    "generator": "search",
                    "gsrsearch": cat["fallback_query"],
                    "gsrnamespace": "6",
                    "gsrlimit": "1",
                    "prop": "imageinfo",
                    "iiprop": "url|size|mime|extmetadata",
                    "format": "json",
                }
                r = client.get(url, params=params, timeout=20.0)
                pages = r.json().get("query", {}).get("pages", {})

            page = next(iter(pages.values()))
            info = page.get("imageinfo", [{}])[0]
            meta = info.get("extmetadata", {})
            img_url = info.get("url")

            print(f"  Downloading image: {img_url}")
            img_resp = client.get(img_url, timeout=40.0)
            raw_bytes = img_resp.content

            content_sha256 = hashlib.sha256(raw_bytes).hexdigest()
            asset_hash = content_sha256[:12]

            img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")

            out_dir = ROOT / "data" / "images" / "categories" / cid / asset_hash
            out_dir.mkdir(parents=True, exist_ok=True)

            img.save(out_dir / "original.webp", "WEBP", quality=90)
            hero = cover_crop(img, 1080, 720)
            hero.save(out_dir / "hero.webp", "WEBP", quality=88)
            card = cover_crop(img, 640, 360)
            card.save(out_dir / "card.webp", "WEBP", quality=85)
            thumb = cover_crop(img, 240, 160)
            thumb.save(out_dir / "thumbnail.webp", "WEBP", quality=80)

            creator = clean_meta_val(meta.get("Artist", {}).get("value", "Wikimedia Commons Contributor"))
            license_name = clean_meta_val(meta.get("LicenseShortName", {}).get("value", "CC BY-SA 4.0"))

            entry = {
                "category_id": cid,
                "category_key": cat["category_key"],
                "aliases": cat["aliases"],
                "title": cat["title"],
                "alt_text": cat["alt_text"],
                "asset_hash": asset_hash,
                "content_sha256": content_sha256,
                "source_url": img_url,
                "wikimedia_file": page.get("title", wfile),
                "creator": creator,
                "license": license_name,
                "attribution": f"Photo by {creator} via Wikimedia Commons, licensed under {license_name}",
                "card_path": f"/static/images/categories/{cid}/{asset_hash}/card.webp",
                "hero_path": f"/static/images/categories/{cid}/{asset_hash}/hero.webp",
            }
            category_manifest_entries.append(entry)
            print(f"  Ingested category {cid} ({asset_hash})")

    cat_manifest_path = ROOT / "data" / "images" / "sources" / "category_manifest.json"
    cat_manifest_path.write_text(json.dumps(category_manifest_entries, indent=2), encoding="utf-8")
    print(f"Saved category manifest to {cat_manifest_path}")

if __name__ == "__main__":
    main()
