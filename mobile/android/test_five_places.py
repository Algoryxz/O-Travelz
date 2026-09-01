import httpx
import json

client = httpx.Client(timeout=10.0)
sample_ids = [
    ("Konark Sun Temple", "9b27a5dd-1d0a-5844-9fe3-d721289202c0"),
    ("Ainthapali Food Corridor", "b06872d2-103f-4ff3-83b8-8173f78c3ded"),
    ("Ananta Vasudeva Temple", "cb5cfba0-f0c4-5801-af66-266d78b3d051"),
    ("Barabati Fort", "a1b8bcb2-1e04-53ea-ac45-9bcd28e5f794"),
    ("Barehipani Falls", "0f2c65d8-cbd5-5597-b357-2205cbe71a52")
]

for name, pid in sample_ids:
    r = client.get(f"https://otravelz-backend.onrender.com/places/{pid}")
    print(f"[{r.status_code}] {name} ({pid}) - {r.json().get('name')}")
