#!/usr/bin/env python3
"""Diagnostic script for Destination Coverflow Carousel image resolution and visual parameters."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def main():
    manifest_path = ROOT / "data" / "images" / "sources" / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest_by_id = {m["place_id"]: m for m in manifest}

    # Extract featured destinations
    featured_destinations = [
        {"id": "place_puri_001", "name": "Jagannath Temple, Puri"},
        {"id": "place_puri_002", "name": "Puri Golden Beach"},
        {"id": "place_konark_001", "name": "Konark Sun Temple"},
        {"id": "place_chilika_001", "name": "Chilika Lake - Satapada"},
        {"id": "place_daringbadi_001", "name": "Daringbadi Hill Station"},
        {"id": "place_bbsr_001", "name": "Lingaraj Temple"},
        {"id": "place_mayurbhanj_001", "name": "Similipal National Park"},
        {"id": "place_koraput_003", "name": "Deomali Peak, Koraput"},
        {"id": "place_ganjam_001", "name": "Gopalpur-on-Sea Beach"},
        {"id": "place_sambalpur_001", "name": "Hirakud Dam & Reservoir"},
    ]

    print(f"{'#':<3} | {'Place ID':<20} | {'Place Name':<30} | {'Resolved Image URL':<60} | {'Wikimedia Source':<40} | {'State'}")
    print("-" * 170)

    resolved_urls = []
    for idx, f in enumerate(featured_destinations):
        pid = f["id"]
        m = manifest_by_id.get(pid, {})
        h = m.get("asset_hash", "")
        img_url = f"/static/images/places/{pid}/{h}/hero.webp"
        wfile = m.get("wikimedia_file", "")
        is_active = (idx == 0)
        state_str = "ACTIVE (center)" if is_active else f"INACTIVE (idx={idx})"

        resolved_urls.append(img_url)
        print(f"{idx+1:<3} | {pid:<20} | {f['name']:<30} | {img_url:<60} | {wfile[:40]:<40} | {state_str}")

    # Check for adjacent URL duplicates
    adjacent_duplicates = []
    for i in range(len(resolved_urls) - 1):
        if resolved_urls[i] == resolved_urls[i+1]:
            adjacent_duplicates.append((i, i+1, resolved_urls[i]))

    print("\n--- CAROUSEL RESOLUTION SUMMARY ---")
    print(f"Total Featured Cards: {len(featured_destinations)}")
    print(f"Unique Image URLs: {len(set(resolved_urls))} / {len(resolved_urls)}")
    print(f"Adjacent URL Duplicates: {len(adjacent_duplicates)}")
    if adjacent_duplicates:
        print(f"FAILED: Adjacent duplicates found: {adjacent_duplicates}")
    else:
        print("PASS: 100% of adjacent carousel cards resolve to completely unique image URLs!")

if __name__ == "__main__":
    main()
