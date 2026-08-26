#!/usr/bin/env python3
"""Audit Wikimedia Commons photo matching for all 50 canonical destinations."""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path
import httpx

sys.stdout.reconfigure(encoding='utf-8')

FALLBACK_MAP = {
    "place_daringbadi_004": ["Kandamal Zilla, Odisha", "Daringbari Odisha", "Daringbadi forest", "Kandhamal"],
    "place_sundargarh_003": ["Mandira Dam", "Sankh River Odisha", "Sundargarh Odisha"],
    "place_koraput_005": ["Kolab Dam", "Kolab River", "Koraput landscape", "Koraput"],
    "place_rayagada_001": ["Majhigouri", "Rayagada Odisha", "Rayagada temple", "Rayagada"],
}

def clean_html(text: str) -> str:
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", "", text)
    return " ".join(clean.split()).strip()

def test_matches():
    places = json.loads(Path("data/places/places.json").read_text(encoding="utf-8"))
    headers = {
        "User-Agent": "OTravelz-Destination-Ingestion/1.0 (https://o-travelz.com; dev@o-travelz.com) python-httpx/0.27.2",
    }

    with httpx.Client(headers=headers, follow_redirects=True) as client:
        for idx, p in enumerate(places):
            pid = p["id"]
            pname = p["name"]

            search_candidates = FALLBACK_MAP.get(pid, [
                f"{pname} Odisha",
                pname.split(",")[0] + " Odisha",
                pname.split(",")[0],
                pname.replace("&", "and"),
            ])

            found = False
            for query in search_candidates:
                url = "https://commons.wikimedia.org/w/api.php"
                params = {
                    "action": "query",
                    "generator": "search",
                    "gsrsearch": query,
                    "gsrnamespace": "6",
                    "gsrlimit": "10",
                    "prop": "imageinfo",
                    "iiprop": "url|size|mime|extmetadata",
                    "iiurlwidth": "1280",
                    "format": "json",
                }
                try:
                    r = client.get(url, params=params, timeout=15.0)
                    pages = r.json().get("query", {}).get("pages", {})
                    for page_id, page in pages.items():
                        info = page.get("imageinfo", [{}])[0]
                        mime = info.get("mime", "")
                        if mime in ("image/jpeg", "image/png"):
                            title = page.get("title", "")
                            t_lower = title.lower()
                            if any(bad in t_lower for bad in [".svg", ".pdf", "icon", "logo", "map", "flag", "seal", "symbol", "diagram"]):
                                continue
                            print(f"[{idx+1}/50] OK: {pid} ({pname}) -> {title} (query: '{query}')")
                            found = True
                            break
                    if found:
                        break
                except Exception as e:
                    pass
            if not found:
                print(f"[{idx+1}/50] MISSING: {pid} ({pname})")

if __name__ == "__main__":
    test_matches()
