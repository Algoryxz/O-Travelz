import httpx
import json

client = httpx.Client(timeout=10.0)
places = client.get('https://otravelz-backend.onrender.com/places?limit=50').json()
places_with_img = [p for p in places if p.get('images')]
print(f'Total places with images in first 50: {len(places_with_img)}')
if places_with_img:
    for p in places_with_img[:3]:
        p_id = p.get('id')
        p_name = p.get('name')
        print(f"\n--- {p_name} (id: {p_id}) ---")
        detail = client.get(f'https://otravelz-backend.onrender.com/places/{p_id}').json()
        print('List image shape:', json.dumps(p.get('images'), indent=2))
        print('Detail image shape:', json.dumps(detail.get('images'), indent=2))
