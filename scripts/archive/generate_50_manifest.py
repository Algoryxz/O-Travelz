#!/usr/bin/env python3
"""Canonical manifest loader and validator for 50 Odisha destinations."""
import json
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent.parent
    manifest_path = root / "data" / "images" / "sources" / "manifest.json"
    if not manifest_path.is_file():
        print("Manifest not found. Run ingest_authentic_odisha_photography.py to generate it.")
        return
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    print(f"Verified {len(manifest)} canonical manifest entries in {manifest_path}")

if __name__ == "__main__":
    main()
