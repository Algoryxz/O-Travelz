#!/usr/bin/env python3
"""
scripts/fetch_osm_place_nodes.py — Retrieve real OSM place/settlement nodes (suburbs, neighbourhoods, villages, towns) in Odisha.
"""

import urllib.request
import json
from pathlib import Path

OUT_FILE = Path("data/transport/staging/ama_bus/osm_odisha_place_nodes.json")
OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

query = """
[out:json][timeout:60];
(
  node["place"="suburb"](17.5,81.0,23.0,88.0);
  node["place"="neighbourhood"](17.5,81.0,23.0,88.0);
  node["place"="town"](17.5,81.0,23.0,88.0);
  node["place"="village"](17.5,81.0,23.0,88.0);
  node["place"="locality"](17.5,81.0,23.0,88.0);
);
out body;
"""

endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
]

headers = {"User-Agent": "OTravelz-Transit-Resolver/1.0 (smarakpadhi58@gmail.com)"}

for ep in endpoints:
    print(f"Querying {ep}...")
    try:
        req = urllib.request.Request(ep, data=query.encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            elements = data.get("elements", [])
            print(f"Success from {ep}! Total OSM place elements: {len(elements)}")
            if len(elements) > 0:
                with open(OUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(elements, f, ensure_ascii=False)
                print(f"Saved {len(elements)} OSM place nodes to {OUT_FILE}")
                break
    except Exception as exc:
        print(f"Failed {ep}: {exc}")
