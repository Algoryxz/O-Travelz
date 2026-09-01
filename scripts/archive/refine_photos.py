#!/usr/bin/env python3
"""Refine specific destination photos for highest visual quality and destination identity."""
import io
import json
import hashlib
import sys
from pathlib import Path
import httpx
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

TARGETED_REPLACEMENTS = {
    "place_daringbadi_001": {
        "query": "Daringbadi Pine Forest, Odisha.jpg",
        "fallback_query": "Daringbadi pine forest",
    },
    "place_sambalpur_001": {
        "query": "Hirakud Dam from Gandhi Minar.jpg",
        "fallback_query": "Hirakud Dam Sambalpur",
    },
    "place_chilika_002": {
        "query": "Kalijai Temple 1.JPG",
        "fallback_query": "Kalijai temple Chilika",
    },
    "place_bbsr_010": {
        "query": "Ekamra haat Bhubaneswar Odisha.JPG",
        "fallback_query": "Ekamra Haat Bhubaneswar",
    },
    "place_puri_004": {
        "query": "Swargadwar Beach Puri",
        "fallback_query": "Swargadwar Beach, Puri",
    }
}

def main():
    root = Path(__file__).resolve().parent.parent
    manifest_path = root / "data" / "images" / "sources" / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    headers = {
        "User-Agent": "OTravelz-Destination-Ingestion/1.0 (https://o-travelz.com; dev@o-travelz.com) python-httpx/0.27.2",
    }

    with httpx.Client(headers=headers, follow_redirects=True) as client:
        for idx, m in enumerate(manifest):
            pid = m["place_id"]
            if pid in TARGETED_REPLACEMENTS:
                spec = TARGETED_REPLACEMENTS[pid]
                print(f"Searching improved photo for {pid} ({m['place_name']})...")
                url = "https://commons.wikimedia.org/w/api.php"
                params = {
                    "action": "query",
                    "generator": "search",
                    "gsrsearch": spec["query"],
                    "gsrnamespace": "6",
                    "gsrlimit": "5",
                    "prop": "imageinfo",
                    "iiprop": "url|size|mime|extmetadata",
                    "iiurlwidth": "1280",
                    "format": "json",
                }
                r = client.get(url, params=params, timeout=20.0)
                pages = r.json().get("query", {}).get("pages", {})
                if not pages:
                    params["gsrsearch"] = spec["fallback_query"]
                    r = client.get(url, params=params, timeout=20.0)
                    pages = r.json().get("query", {}).get("pages", {})

                for page_id, page in pages.items():
                    info = page.get("imageinfo", [{}])[0]
                    mime = info.get("mime", "")
                    if mime in ("image/jpeg", "image/png"):
                        t = page.get("title", "")
                        if any(bad in t.lower() for bad in [".svg", ".pdf", "icon", "map"]):
                            continue
                        print(f"  Found: {t} for {pid}")
                        break

if __name__ == "__main__":
    main()
