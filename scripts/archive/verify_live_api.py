import urllib.request
import json
import sys

base_vite = "http://localhost:5174"
base_fastapi = "http://127.0.0.1:8000"

print("--- 1. Testing GET /places via Vite proxy ---")
req = urllib.request.urlopen(f"{base_vite}/places")
places = json.loads(req.read().decode())
print(f"Received {len(places)} places via Vite proxy")
assert len(places) >= 50, f"Expected 50+ places, got {len(places)}"

print("\n--- 2. Testing GET /places/{id} for Daringbadi ---")
daringbadi = next((p for p in places if "daringbadi" in p["name"].lower()), None)
assert daringbadi is not None, "Daringbadi not found in places dataset"
p_id = daringbadi["id"]
req = urllib.request.urlopen(f"{base_fastapi}/places/{p_id}")
place_detail = json.loads(req.read().decode())
print(f"Fetched place {place_detail['name']} (lat={place_detail['lat']}, lon={place_detail['lon']})")

print("\n--- 3. Testing POST /itinerary/plan for Daringbadi (Top-level schema) ---")
plan_req_data = json.dumps({
    "days": 2,
    "interests": ["nature", "waterfall"],
    "start": "Daringbadi"
}).encode("utf-8")
req = urllib.request.Request(
    f"{base_fastapi}/itinerary/plan",
    data=plan_req_data,
    headers={"Content-Type": "application/json"}
)
plan_res = json.loads(urllib.request.urlopen(req).read().decode())
print(f"Planned itinerary ID: {plan_res['itinerary_id']} with {len(plan_res['days'])} days from Daringbadi")
for d in plan_res["days"]:
    print(f"  Day {d['day_number']}: {len(d['stops'])} stops, {len(d['hops'])} hops")
    for s in d["stops"]:
        print(f"    Stop {s['sequence']}: {s['place']['name']} ({s['place']['category']})")

print("\n--- 4. Testing POST /itinerary/plan across Whole Odisha (Puri, Konark, Koraput, Sambalpur, Similipal) ---")
for loc in ["Puri", "Konark", "Koraput", "Sambalpur", "Similipal"]:
    req_data = json.dumps({"days": 2, "interests": ["heritage", "nature"], "start": loc}).encode("utf-8")
    r = urllib.request.Request(f"{base_fastapi}/itinerary/plan", data=req_data, headers={"Content-Type": "application/json"})
    res = json.loads(urllib.request.urlopen(r).read().decode())
    print(f"  [OK] {loc} plan generated: {len(res['days'])} days, {len(res['days'][0]['stops'])} stops in Day 1")

print("\n--- 5. Testing POST /ai/plan multi-turn refinements ---")
# Refinement 1
ai_req1 = json.dumps({
    "message": "Make it more nature focused",
    "current_constraints": {"days": 2, "interests": ["nature", "waterfall"], "start": "Daringbadi"}
}).encode("utf-8")
req = urllib.request.Request(f"{base_fastapi}/ai/plan", data=ai_req1, headers={"Content-Type": "application/json"})
ai_res1 = json.loads(urllib.request.urlopen(req).read().decode())
print("  Turn 1 AI Response:", ai_res1["status"], "-", ai_res1["message"][:80])

# Refinement 2
ai_req2 = json.dumps({
    "message": "Add temples",
    "current_constraints": ai_res1.get("changed_constraints") or {"days": 2, "interests": ["nature"], "start": "Daringbadi"}
}).encode("utf-8")
req = urllib.request.Request(f"{base_fastapi}/ai/plan", data=ai_req2, headers={"Content-Type": "application/json"})
ai_res2 = json.loads(urllib.request.urlopen(req).read().decode())
print("  Turn 2 AI Response:", ai_res2["status"], "-", ai_res2["message"][:80])

# Refinement 3
ai_req3 = json.dumps({
    "message": "Make it 3 days",
    "current_constraints": ai_res2.get("changed_constraints") or {"days": 2, "interests": ["nature", "temple"], "start": "Daringbadi"}
}).encode("utf-8")
req = urllib.request.Request(f"{base_fastapi}/ai/plan", data=ai_req3, headers={"Content-Type": "application/json"})
ai_res3 = json.loads(urllib.request.urlopen(req).read().decode())
print("  Turn 3 AI Response:", ai_res3["status"], "-", ai_res3["message"][:80])

print("\n--- 6. Testing POST /map/v1/projection ---")
map_req_data = json.dumps({
    "requested_features": [
        {"entity": "place", "id": p_id},
        {"entity": "place", "id": places[0]["id"]}
    ]
}).encode("utf-8")
req = urllib.request.Request(f"{base_fastapi}/map/v1/projection", data=map_req_data, headers={"Content-Type": "application/json"})
map_res = json.loads(urllib.request.urlopen(req).read().decode())
print(f"Map projection returned {len(map_res['features'])} features")

print("\n=======================================================")
print(">>> ALL END-TO-END HTTP TESTS PASSED WITH ZERO ERRORS! <<<")
print("=======================================================")
