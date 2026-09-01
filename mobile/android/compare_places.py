import httpx
import json

base_url = "https://otravelz-backend.onrender.com"
client = httpx.Client(timeout=10.0)

# 1. Fetch places
r_places = client.get(f"{base_url}/places?limit=5")
print("GET /places status:", r_places.status_code)
places = r_places.json()

if isinstance(places, list) and len(places) > 0:
    for idx, p in enumerate(places[:3]):
        print(f"\n--- Place {idx+1}: {p.get('name')} (id: {p.get('id')}) ---")
        place_id = p.get("id")
        r_detail = client.get(f"{base_url}/places/{place_id}")
        print(f"GET /places/{place_id} status:", r_detail.status_code)
        if r_detail.status_code == 200:
            detail = r_detail.json()
            print("Detail keys:", list(detail.keys()))
            print("Images in detail:", detail.get("images"))
            print("Full Detail JSON:\n", json.dumps(detail, indent=2))
        else:
            print("Error body:", r_detail.text)
