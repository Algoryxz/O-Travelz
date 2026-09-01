#!/usr/bin/env python3
"""Audit semantic identity and duplicate sources across all 50 destinations and frontend mappings."""
import json
from collections import Counter
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent.parent
    manifest = json.loads((root / "data" / "images" / "sources" / "manifest.json").read_text(encoding="utf-8"))

    print(f"Total manifest entries: {len(manifest)}")
    sources = [x.get("source_url") for x in manifest]
    files = [x.get("wikimedia_file") for x in manifest]
    hashes = [x.get("content_sha256") for x in manifest]

    dup_sources = [k for k, v in Counter(sources).items() if v > 1]
    dup_files = [k for k, v in Counter(files).items() if v > 1]
    dup_hashes = [k for k, v in Counter(hashes).items() if v > 1]

    print(f"Duplicate source URLs: {dup_sources}")
    print(f"Duplicate wikimedia files: {dup_files}")
    print(f"Duplicate content sha256: {dup_hashes}")
    print("\n--- ALL 50 MANIFEST ENTRIES ---")
    for idx, x in enumerate(manifest):
        print(f"[{idx+1:02d}] {x['place_id']}: {x['place_name']}")
        print(f"     File: {x.get('wikimedia_file')}")
        print(f"     Creator: {x.get('creator')} | License: {x.get('license')}")
        print(f"     Hash: {x.get('asset_hash')}")

if __name__ == "__main__":
    main()
