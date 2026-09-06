#!/usr/bin/env python3
"""
scripts/fetch_osm_transit_nodes.py — Retrieve real OSM bus stop nodes and platforms in Odisha bounding box.
"""

import urllib.request
import json
from pathlib import Path

OUT_FILE = Path("data/transport/staging/ama_bus/osm_odisha_transit_nodes.json")
OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

query = """
[out:json][timeout:45];
(
  node["highway"="bus_stop"](17.5,81.0,23.0,88.0);
  node["public_transport"="platform"](17.5,81.0,23.0,88.0);
  node["amenity"="bus_station"](17.5,81.0,23.0,88.0);
  node["public_transport"="station"](17.5,81.0,23.0,88.0);
);
out body;
"""

endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
]

headers = {"User-Agent": "OTravelz-Transit-Resolver/1.0 (smarakpadhi58@gmail.com)"}

success = False
for ep in endpoints:
    print(f"Attempting query to {ep}...")
    try:
        req = urllib.request.Request(ep, data=query.encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            elements = data.get("elements", [])
            print(f"Success from {ep}! Total OSM transit elements in Odisha: {len(elements)}")
            if len(elements) > 0:
                with open(OUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(elements, f, ensure_ascii=False)
                print(f"Saved {len(elements)} real OSM transit nodes to {OUT_FILE}")
                success = True
                break
    except Exception as exc:
        print(f"Endpoint {ep} failed: {exc}")

if not success:
    print("Warning: Overpass query failed on all endpoints. Checking local file or fallback.")
