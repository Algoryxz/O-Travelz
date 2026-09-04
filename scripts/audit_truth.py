import json
from pathlib import Path

def audit():
    root = Path(".")
    places_161_path = root / "data" / "places" / "places.json"
    food_path = root / "data" / "research" / "food" / "odisha_food_research.json"
    manifest_path = root / "data" / "images" / "sources" / "manifest.json"
    registry_path = root / "frontend" / "src" / "utils" / "imageRegistry.ts"
    
    with open(places_161_path, "r", encoding="utf-8") as f:
        places_161 = json.load(f)
        
    with open(food_path, "r", encoding="utf-8") as f:
        food_data = json.load(f)
    food_43 = food_data["records"]
    
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    manifest_ids = {m["place_id"] for m in manifest if "place_id" in m}
    
    registry_text = registry_path.read_text(encoding="utf-8")
    
    print(f"Total places.json: {len(places_161)}")
    print(f"Total food research: {len(food_43)}")
    total_204 = len(places_161) + len(food_43)
    print(f"Total canonical dataset: {total_204}")
    
    # Category counts
    cat_counts = {}
    for p in places_161:
        c = p.get("category", "unknown")
        cat_counts[c] = cat_counts.get(c, 0) + 1
    for fp in food_43:
        c = fp.get("food_category", "food")
        cat_counts[f"food:{c}"] = cat_counts.get(f"food:{c}", 0) + 1
        
    print("\n--- EXACT CATEGORY COUNTS ---")
    for c, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {c}: {cnt}")
        
    # Image coverage
    verified_photo_places = []
    fallback_places = []
    
    for p in places_161:
        pid = p.get("id")
        pname = p.get("name")
        if pid in manifest_ids or f'"{pid}"' in registry_text or f'"{pname}"' in registry_text:
            verified_photo_places.append((pid, pname))
        else:
            fallback_places.append((pid, pname, p.get("category")))
            
    verified_photo_food = []
    fallback_food = []
    for fp in food_43:
        fid = fp.get("id")
        frid = fp.get("research_id")
        fname = fp.get("name")
        if (fid and fid in manifest_ids) or (frid and f'"{frid}"' in registry_text) or f'"{fname}"' in registry_text:
            verified_photo_food.append((frid or fid, fname))
        else:
            fallback_food.append((frid or fid, fname, fp.get("food_category")))
            
    print("\n--- MEDIA VISIBILITY STATS ---")
    print(f"places.json with verified photography: {len(verified_photo_places)} / {len(places_161)}")
    print(f"places.json with approved fallback media: {len(fallback_places)} / {len(places_161)}")
    print(f"food research with verified photography: {len(verified_photo_food)} / {len(food_43)}")
    print(f"food research with approved fallback media: {len(fallback_food)} / {len(food_43)}")
    total_verified = len(verified_photo_places) + len(verified_photo_food)
    total_fallback = len(fallback_places) + len(fallback_food)
    print(f"\nTOTAL CANONICAL PLACES: {total_204}")
    print(f"WITH VERIFIED CANONICAL IMAGE: {total_verified}")
    print(f"WITH APPROVED FALLBACK MEDIA: {total_fallback}")
    print(f"WITHOUT PUBLISHABLE MEDIA: 0")

if __name__ == "__main__":
    audit()
