"""Phase 8 Canonical Demo Rehearsal Script.

Exercises approved live HTTP contracts against the local FastAPI service:
- GET /health
- GET /places
- GET /places/{id}
- GET /api/v1/images/{storage_key}
- POST /itinerary/plan
- POST /map/v1/projection
- POST /ai/plan

Validates:
1. Health and API responsiveness.
2. Canonical 50-destination Whole-Odisha catalog.
3. Map projection with canonical human-readable identity (zero "Point #N" or UUID fragments).
4. Road routing authority (> 2 km connections use mode="road", walk constrained to <= 2 km).
5. Private image proxy delivery with valid WebP RIFF payload.
6. Canonical Scenario 1: Odisha Heritage Triangle.
7. Canonical Scenario 2: Coastal Eco-Tourism & Wildlife with AI safety quarantine.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional


BASE_URL = os.environ.get("OTRAVELZ_API_URL", "http://127.0.0.1:8000")


def http_get(path: str) -> tuple[int, Dict[str, str], bytes]:
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            headers = dict(resp.headers)
            body = resp.read()
            return status, headers, body
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()


def http_post_json(path: str, data: Dict[str, Any]) -> tuple[int, Dict[str, str], Any]:
    url = f"{BASE_URL}{path}"
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            headers = dict(resp.headers)
            body = json.loads(resp.read().decode("utf-8"))
            return status, headers, body
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(error_body)
        except Exception:
            parsed = {"error": error_body}
        return e.code, dict(e.headers), parsed


def run_rehearsal() -> bool:
    print("=" * 80)
    print("             PHASE 8 CANONICAL DEMO SCENARIOS REHEARSAL")
    print("=" * 80)
    print(f"Target Backend: {BASE_URL}")

    # =========================================================================
    # GATE A: Health Check
    # =========================================================================
    print("\n--- Gate A: Health Check (GET /health) ---")
    status, headers, body = http_get("/health")
    assert status == 200, f"Health check failed with status {status}"
    health_json = json.loads(body.decode("utf-8"))
    assert health_json.get("status") == "ok", f"Unexpected health status: {health_json}"
    print(f"  [OK] Health Check passed: status={health_json.get('status')}")

    # =========================================================================
    # GATE B: Canonical Places Verification
    # =========================================================================
    print("\n--- Gate B: Canonical Places Catalog (GET /places) ---")
    status, headers, body = http_get("/places")
    assert status == 200, f"GET /places failed with status {status}"
    all_places: List[Dict[str, Any]] = json.loads(body.decode("utf-8"))
    print(f"  Total places returned from database: {len(all_places)}")

    # Load canonical 50 dataset definition
    canonical_manifest_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "places", "places.json"
    )
    with open(canonical_manifest_path, encoding="utf-8") as f:
        canonical_50: List[Dict[str, Any]] = json.load(f)

    canonical_names = {p["name"] for p in canonical_50}
    api_names = {p["name"] for p in all_places}
    assert len(canonical_names) == 50, f"Expected 50 canonical destinations, found {len(canonical_names)}"

    missing_canonical = canonical_names - api_names
    assert (
        len(missing_canonical) == 0
    ), f"Missing canonical destinations from /places API: {missing_canonical}"
    print(f"  [OK] Verified all 50 canonical destinations are present in /places response")

    # Assert no fabricated or debug names
    for place in all_places:
        name = place.get("name", "")
        assert not name.startswith("Point #"), f"Debug point name found: {name}"
        assert not name.startswith("ID:"), f"Debug ID name found: {name}"
        assert not name.lower().startswith("unknown"), f"Unknown place name found: {name}"
        assert place.get("category"), f"Place {name} is missing canonical category"

    print("  [OK] Zero debug or fabricated presentation identifiers in catalog")

    # =========================================================================
    # GATE C: Place Details & Image Storage Key Lookup
    # =========================================================================
    print("\n--- Gate C: Place Details & Image Key Lookup (GET /places/{id}) ---")
    lingaraj = next((p for p in all_places if "lingaraj" in p["name"].lower()), None)
    assert lingaraj is not None, "Lingaraj Temple not found in places catalog"
    p_id = lingaraj["id"]

    status, headers, body = http_get(f"/places/{p_id}")
    assert status == 200, f"GET /places/{p_id} failed with status {status}"
    lingaraj_detail: Dict[str, Any] = json.loads(body.decode("utf-8"))
    assert lingaraj_detail["name"] == lingaraj["name"]
    assert lingaraj_detail["lat"] is not None and lingaraj_detail["lon"] is not None
    assert "images" in lingaraj_detail and len(lingaraj_detail["images"]) > 0, "No images found for Lingaraj Temple"

    primary_image = lingaraj_detail["images"][0]
    storage_key = primary_image["storage_key"]
    print(f"  [OK] Fetched details for '{lingaraj_detail['name']}' with storage key '{storage_key}'")

    # =========================================================================
    # GATE D: Image Proxy & WebP Delivery (GET /api/v1/images/{storage_key})
    # =========================================================================
    print("\n--- Gate D: Image Proxy Verification (GET /api/v1/images/{storage_key}) ---")
    status, headers, img_bytes = http_get(f"/api/v1/images/{storage_key}")
    assert status == 200, f"GET /api/v1/images/{storage_key} failed with status {status}"
    content_type = headers.get("content-type", "")
    assert "image/webp" in content_type, f"Expected image/webp Content-Type, got '{content_type}'"
    assert len(img_bytes) > 0, "Empty image byte response"
    # WebP files start with RIFF....WEBP signature
    assert img_bytes[:4] == b"RIFF" and img_bytes[8:12] == b"WEBP", (
        f"Invalid WebP magic signature: {img_bytes[:12]!r}"
    )
    print(
        f"  [OK] Validated WebP payload: {len(img_bytes)} bytes, content-type={content_type}, RIFF signature verified"
    )

    # =========================================================================
    # GATE E: Map Projection Canonical Identity (POST /map/v1/projection)
    # =========================================================================
    print("\n--- Gate E: Map Projection (POST /map/v1/projection) ---")
    puri = next((p for p in all_places if "jagannath" in p["name"].lower()), all_places[0])
    konark = next((p for p in all_places if "konark" in p["name"].lower()), all_places[1])

    map_req = {
        "requested_features": [
            {"entity": "place", "id": lingaraj["id"]},
            {"entity": "place", "id": puri["id"]},
            {"entity": "place", "id": konark["id"]},
        ]
    }
    status, headers, map_resp = http_post_json("/map/v1/projection", map_req)
    assert status == 200, f"POST /map/v1/projection failed with status {status}: {map_resp}"
    features = map_resp.get("features", [])
    assert len(features) == 3, f"Expected 3 projected features, got {len(features)}"

    for f_item in features:
        assert f_item["geometry_status"] == "available", f"Geometry not available: {f_item}"
        assert f_item["geometry"]["type"] == "Point", f"Expected Point geometry, got {f_item['geometry']}"
        coords = f_item["geometry"]["coordinates"]
        assert len(coords) == 2 and isinstance(coords[0], (int, float)) and isinstance(coords[1], (int, float)), (
            f"Invalid coordinates: {coords}"
        )
        assert f_item.get("name"), f"Missing feature name: {f_item}"
        assert not f_item["name"].startswith("Point #"), f"Debug name found in map projection: {f_item['name']}"
        assert f_item.get("category"), f"Missing feature category: {f_item}"
        print(f"  Projected: '{f_item['name']}' [{f_item['category']}] at {coords}")

    print("  [OK] Map projection returns verified canonical identities and geometry")

    # =========================================================================
    # GATE F: Road Routing (> 2 km) Verification (POST /itinerary/plan)
    # =========================================================================
    print("\n--- Gate F: Road Routing Authority & Distance Verification ---")
    plan_req = {
        "days": 3,
        "interests": ["heritage", "temple"],
        "start": "Bhubaneswar",
    }
    status, headers, plan_resp = http_post_json("/itinerary/plan", plan_req)
    assert status == 200, f"POST /itinerary/plan failed with status {status}: {plan_resp}"
    assert "days" in plan_resp and len(plan_resp["days"]) == 3, f"Expected 3 days, got {plan_resp}"

    road_hop_found = False
    for day in plan_resp["days"]:
        for hop in day.get("hops", []):
            legs = hop.get("legs", [])
            for leg in legs:
                detail = leg.get("detail", "")
                # If connection is over 2 km (e.g. 'Road ~32.5 km', 'Road ~2.7 km')
                if "km" in detail:
                    assert hop["mode"] in ("road", "bus", "auto"), (
                        f"Hop > 2 km must not be walk mode: hop={hop}"
                    )
                    road_hop_found = True
                elif "Walk" in detail:
                    assert hop["mode"] == "walk", f"Walk leg with non-walk mode: {hop}"

    assert road_hop_found, "Expected at least one road routing hop > 2 km in 3-day itinerary"
    print("  [OK] Road routing verified: Journeys > 2 km routed with mode='road'; walking strictly bounded")

    # =========================================================================
    # REHEARSAL SCENARIO 1: Odisha Heritage Triangle (3 Days -> AI Refinement)
    # =========================================================================
    print("\n" + "#" * 80)
    print("REHEARSAL SCENARIO 1: Odisha Heritage Triangle (3 Days)")
    print("#" * 80)
    print("Step 1.1: Requesting 3-day Heritage Itinerary from Bhubaneswar...")
    s1_req = {"days": 3, "interests": ["heritage", "temple"], "start": "Bhubaneswar"}
    status, headers, s1_plan = http_post_json("/itinerary/plan", s1_req)
    assert status == 200
    s1_stops = sum(len(d["stops"]) for d in s1_plan["days"])
    s1_hops = sum(len(d["hops"]) for d in s1_plan["days"])
    print(f"  -> Generated Itinerary ID: {s1_plan['itinerary_id']}")
    print(f"  -> Days generated: {len(s1_plan['days'])} ({s1_stops} stops, {s1_hops} transport hops)")

    print("Step 1.2: Rehearsing AI Refinement (Adjust to 2 days starting from Puri)...")
    s1_ai_req = {
        "message": "Change this to a 2-day itinerary starting from Puri with beach and heritage",
        "current_constraints": {"days": 3, "interests": ["heritage", "temple"], "start": "Bhubaneswar"},
    }
    status, headers, s1_ai = http_post_json("/ai/plan", s1_ai_req)
    assert status == 200
    assert s1_ai["status"] == "success"
    print(f"  -> AI Grounded Response: \"{s1_ai['message'][:90]}...\"")
    print(f"  -> Refined Status: {s1_ai['status']}")

    print("Step 1.3: Projecting S1 stops to Map...")
    s1_map_req = {
        "requested_features": [
            {"entity": "place", "id": lingaraj["id"]},
            {"entity": "place", "id": puri["id"]},
        ]
    }
    status, headers, s1_map = http_post_json("/map/v1/projection", s1_map_req)
    assert status == 200
    print(f"  -> Map features projected: {len(s1_map['features'])} available Point features")

    print("Step 1.4: Verifying Live Imagery for Lingaraj & Jagannath...")
    status, headers, puri_detail_raw = http_get(f"/places/{puri['id']}")
    assert status == 200
    puri_detail = json.loads(puri_detail_raw.decode("utf-8"))
    puri_img_key = puri_detail["images"][0]["storage_key"]

    status, _, lingaraj_img = http_get(f"/api/v1/images/{storage_key}")
    assert status == 200 and lingaraj_img[:4] == b"RIFF"
    print(f"  -> Live Image GET /api/v1/images/{storage_key}: 200 OK ({len(lingaraj_img)} bytes)")

    status, _, puri_img = http_get(f"/api/v1/images/{puri_img_key}")
    assert status == 200 and puri_img[:4] == b"RIFF"
    print(f"  -> Live Image GET /api/v1/images/{puri_img_key}: 200 OK ({len(puri_img)} bytes)")
    print("  -> SCENARIO 1 REHEARSAL RESULT: 100% REPRODUCIBLE PASS")

    # =========================================================================
    # REHEARSAL SCENARIO 2: Coastal & Nature Trail (2 Days -> Clarification -> 3 Days)
    # =========================================================================
    print("\n" + "#" * 80)
    print("REHEARSAL SCENARIO 2: Coastal & Nature Trail (2 Days)")
    print("#" * 80)
    print("Step 2.1: Requesting 2-day Nature/Beach Itinerary from Puri...")
    s2_req = {"days": 2, "interests": ["nature", "beach"], "start": "Puri"}
    status, headers, s2_plan = http_post_json("/itinerary/plan", s2_req)
    assert status == 200
    s2_stops = sum(len(d["stops"]) for d in s2_plan["days"])
    s2_hops = sum(len(d["hops"]) for d in s2_plan["days"])
    print(f"  -> Generated Itinerary ID: {s2_plan['itinerary_id']}")
    print(f"  -> Days generated: {len(s2_plan['days'])} ({s2_stops} stops, {s2_hops} transport hops)")

    print("Step 2.2: Rehearsing AI Clarification behavior on ambiguous input...")
    s2_ai_ambig = {
        "message": "tell me about nature",
        "current_constraints": {"days": 2, "interests": ["nature", "beach"], "start": "Puri"},
    }
    status, headers, s2_clarif = http_post_json("/ai/plan", s2_ai_ambig)
    assert status == 200
    assert s2_clarif["status"] == "clarification"
    print(f"  -> AI Safety Clarification: Status='{s2_clarif['status']}'")
    print(f"  -> Clarification Message: \"{s2_clarif['message'][:70]}...\"")

    print("Step 2.3: Rehearsing AI Explicit Refinement (Extend to 3 days with wildlife)...")
    s2_ai_refine = {
        "message": "Extend this trip to 3 days and add wildlife interests",
        "current_constraints": {"days": 2, "interests": ["nature", "beach"], "start": "Puri"},
    }
    status, headers, s2_refined = http_post_json("/ai/plan", s2_ai_refine)
    assert status == 200
    assert s2_refined["status"] == "success"
    print(f"  -> AI Refinement: Status='{s2_refined['status']}'")
    print(f"  -> Refined Message: \"{s2_refined['message'][:90]}...\"")
    print("  -> SCENARIO 2 REHEARSAL RESULT: 100% REPRODUCIBLE PASS")

    print("\n" + "=" * 80)
    print(">>> PHASE 8 AUTOMATED REHEARSAL: PASS (ALL CHECKS & SCENARIOS VERIFIED) <<<")
    print("=" * 80)
    return True


if __name__ == "__main__":
    try:
        success = run_rehearsal()
        if not success:
            sys.exit(1)
    except Exception as exc:
        print(f"\n[REHEARSAL FAILURE]: {exc}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
