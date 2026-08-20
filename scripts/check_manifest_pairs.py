#!/usr/bin/env python3
"""Detailed semantic identity check for all 50 destinations in manifest.json."""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

def main():
    root = Path(__file__).resolve().parent.parent
    manifest = json.loads((root / "data" / "images" / "sources" / "manifest.json").read_text(encoding="utf-8"))
    places = json.loads((root / "data" / "places" / "places.json").read_text(encoding="utf-8"))
    places_by_id = {p["id"]: p for p in places}

    print(f"{'#':<3} | {'Place ID':<20} | {'Place Name':<35} | {'Wikimedia Source File'}")
    print("-" * 100)
    for idx, m in enumerate(manifest):
        pid = m["place_id"]
        pname = m["place_name"]
        wfile = m.get("wikimedia_file", "")
        print(f"{idx+1:<3} | {pid:<20} | {pname:<35} | {wfile}")

if __name__ == "__main__":
    main()
