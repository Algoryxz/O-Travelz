import json
import os
import re
from collections import defaultdict

ODISHA_30_DISTRICTS = [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak",
    "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati",
    "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi",
    "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput",
    "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada",
    "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
]

# 1. Load places.json
places_path = os.path.join("data", "places", "places.json")
with open(places_path, "r", encoding="utf-8") as f:
    places = json.load(f)

# 2. Extract essentials from odishaEssentials.ts
essentials_path = os.path.join("frontend", "src", "data", "odishaEssentials.ts")
with open(essentials_path, "r", encoding="utf-8") as f:
    essentials_text = f.read()

# Let's extract items block by block
pattern = re.compile(
    r'\{\s*id:\s*["\']([^"\']+)["\'],\s*name:\s*["\']([^"\']+)["\'],\s*category:\s*["\']([^"\']+)["\'],\s*district:\s*["\']([^"\']+)["\'],\s*locality:\s*["\']([^"\']+)["\'],\s*address:\s*["\']([^"\']+)["\'],\s*lat:\s*([0-9.]+),\s*lon:\s*([0-9.]+),(.*?)\}',
    re.DOTALL
)

essentials = []
for match in pattern.finditer(essentials_text):
    item_id, name, cat, district, locality, addr, lat, lon, rest = match.groups()
    
    # Parse rest fields
    rating_match = re.search(r'rating:\s*([0-9.]+)', rest)
    rating_count_match = re.search(r'ratingCount:\s*([0-9]+)', rest)
    rating_source_match = re.search(r'ratingSource:\s*["\']([^"\']+)["\']', rest)
    hours_match = re.search(r'openingHours:\s*["\']([^"\']+)["\']', rest)
    is24x7_match = re.search(r'is24x7:\s*(true|false)', rest)
    phone_match = re.search(r'phone:\s*["\']([^"\']+)["\']', rest)
    emergency_phone_match = re.search(r'emergencyPhone:\s*["\']([^"\']+)["\']', rest)
    cuisine_match = re.search(r'cuisine:\s*["\']([^"\']+)["\']', rest)
    data_source_match = re.search(r'dataSource:\s*["\']([^"\']+)["\']', rest)
    source_url_match = re.search(r'sourceUrl:\s*["\']([^"\']+)["\']', rest)
    last_verified_match = re.search(r'lastVerified:\s*["\']([^"\']+)["\']', rest)
    
    essentials.append({
        "id": item_id,
        "name": name,
        "category": cat,
        "district": district,
        "locality": locality,
        "address": addr,
        "lat": float(lat),
        "lon": float(lon),
        "rating": float(rating_match.group(1)) if rating_match else None,
        "ratingCount": int(rating_count_match.group(1)) if rating_count_match else None,
        "ratingSource": rating_source_match.group(1) if rating_source_match else None,
        "openingHours": hours_match.group(1) if hours_match else None,
        "is24x7": is24x7_match.group(1) == 'true' if is24x7_match else False,
        "phone": phone_match.group(1) if phone_match else None,
        "emergencyPhone": emergency_phone_match.group(1) if emergency_phone_match else None,
        "cuisine": cuisine_match.group(1) if cuisine_match else None,
        "dataSource": data_source_match.group(1) if data_source_match else None,
        "sourceUrl": source_url_match.group(1) if source_url_match else None,
        "lastVerified": last_verified_match.group(1) if last_verified_match else None,
    })

# 3. Extract transit stops
transit_path = os.path.join("frontend", "src", "data", "staticTransitStops.ts")
with open(transit_path, "r", encoding="utf-8") as f:
    transit_text = f.read()

stop_pattern = re.compile(
    r'\{\s*stop_id:\s*["\']([^"\']+)["\'],\s*name:\s*["\']([^"\']+)["\'],\s*stop_type:\s*["\']([^"\']+)["\'],\s*district:\s*["\']([^"\']+)["\'],\s*city:\s*["\']([^"\']+)["\'],\s*locality:\s*["\']([^"\']+)["\'],\s*latitude:\s*([0-9.]+),\s*longitude:\s*([0-9.]+),\s*agency:\s*["\']([^"\']+)["\'],(.*?)\}',
    re.DOTALL
)

stops = []
for match in stop_pattern.finditer(transit_text):
    stop_id, name, stop_type, district, city, locality, lat, lon, agency, rest = match.groups()
    stops.append({
        "stop_id": stop_id,
        "name": name,
        "stop_type": stop_type,
        "district": district,
        "city": city,
        "locality": locality,
        "latitude": float(lat),
        "longitude": float(lon),
        "agency": agency,
    })

# 4. Extract routes and schedules
routes_path = os.path.join("data", "transport", "static", "ama_bus.json")
with open(routes_path, "r", encoding="utf-8") as f:
    routes = json.load(f)

schedules_path = os.path.join("data", "transport", "static", "ama_bus_schedule.json")
with open(schedules_path, "r", encoding="utf-8") as f:
    schedules = json.load(f)

print(f"Places: {len(places)}, Essentials: {len(essentials)}, Transit Stops: {len(stops)}, Total Spatial Points: {len(places) + len(essentials) + len(stops)}")

# District Breakdown
district_counts = {d: defaultdict(int) for d in ODISHA_30_DISTRICTS}

for p in places:
    d = p.get("district", "Khordha")
    if d in district_counts:
        district_counts[d]["destinations"] += 1
        if p.get("image") or p.get("imageUrl"):
            district_counts[d]["images"] += 1

for e in essentials:
    d = e["district"]
    if d in district_counts:
        cat = e["category"]
        if cat == "hotel":
            district_counts[d]["hotels"] += 1
        elif cat == "restaurant":
            district_counts[d]["restaurants"] += 1
        elif cat == "hospital":
            district_counts[d]["hospitals"] += 1
        elif cat == "pharmacy":
            district_counts[d]["pharmacies"] += 1
        elif cat == "atm":
            district_counts[d]["atms"] += 1
        elif cat == "petrol":
            district_counts[d]["petrol"] += 1
        elif cat == "police":
            district_counts[d]["police"] += 1

for s in stops:
    d = s["district"]
    if d in district_counts:
        district_counts[d]["transit_stops"] += 1
        if s["stop_type"] == "rail_station":
            district_counts[d]["rail_stations"] += 1
        elif s["stop_type"] == "airport":
            district_counts[d]["airports"] += 1

# Let's print out the exact table
print("| District | Destinations | Hotels | Restaurants | Hospitals | Pharmacies | ATMs | Petrol | Police | Transit Stops | Rail | Airport | Images | Tier |")
print("|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|")

for d in ODISHA_30_DISTRICTS:
    c = district_counts[d]
    tot_cats = sum(1 for k in ["destinations", "hotels", "restaurants", "hospitals", "pharmacies", "atms", "petrol", "police", "transit_stops"] if c[k] > 0)
    
    # Classify Tier: Strong (8-9 cats + destinations >= 4), Moderate (6-7 cats), Limited (1-5 cats)
    if tot_cats >= 8 and c["destinations"] >= 4:
        tier = "**Strong**"
    elif tot_cats >= 7:
        tier = "Moderate"
    else:
        tier = "Limited"
        
    print(f"| {d} | {c['destinations']} | {c['hotels']} | {c['restaurants']} | {c['hospitals']} | {c['pharmacies']} | {c['atms']} | {c['petrol']} | {c['police']} | {c['transit_stops']} | {c['rail_stations']} | {c['airports']} | {c['images']} | {tier} |")

# Category breakdowns
print("\n--- Category Breakdown ---")
cat_breakdown = defaultdict(list)
for e in essentials:
    cat_breakdown[e["category"]].append(e)

for cat, items in cat_breakdown.items():
    print(f"Category: {cat} -> {len(items)} items")
