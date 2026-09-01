import httpx

client = httpx.Client(timeout=10.0)
r = client.get("https://otravelz-backend.onrender.com/places/konark-sun-temple")
print("GET /places/konark-sun-temple status:", r.status_code)
print("Response body:", r.text)

# Search for konark
r_search = client.get("https://otravelz-backend.onrender.com/places?search=konark")
print("Search konark places:", len(r_search.json()))
for p in r_search.json():
    print(f"Name: {p.get('name')}, ID: {p.get('id')}, Research ID: {p.get('research_id')}")
