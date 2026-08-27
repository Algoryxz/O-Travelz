import json
import os
import re

# Load places.json
places_path = os.path.join("frontend", "src", "data", "places.json")
with open(places_path, "r", encoding="utf-8") as f:
    places = json.load(f)

# Load staticTransitStops.ts by parsing or running
# Let's parse odishaEssentials.ts and staticTransitStops.ts
essentials_path = os.path.join("frontend", "src", "data", "odishaEssentials.ts")
with open(essentials_path, "r", encoding="utf-8") as f:
    essentials_code = f.read()

transit_path = os.path.join("frontend", "src", "data", "staticTransitStops.ts")
with open(transit_path, "r", encoding="utf-8") as f:
    transit_code = f.read()

print(f"Loaded places.json: {len(places)} destinations")
