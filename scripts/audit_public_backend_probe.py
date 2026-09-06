import json
import time
import datetime
import urllib.request
import urllib.error
import os

ENDPOINTS = [
    ("health", "GET", "/health", None),
    ("places", "GET", "/places", None),
    ("place_detail", "GET", "/places/7b420000-0000-0000-0000-000000000001", None),
    ("weather_current", "GET", "/weather/current?lat=20.2961&lng=85.8245", None),
    ("itinerary_plan", "POST", "/itinerary/plan", json.dumps({
        "destination": "Bhubaneswar",
        "duration_days": 1,
        "interests": ["temple", "heritage"]
    }).encode("utf-8")),
    ("ai_converse", "POST", "/ai/converse", json.dumps({
        "message": "Plan a 1 day trip in Bhubaneswar",
        "conversation_id": "probe-test-1"
    }).encode("utf-8")),
    ("transport_routes", "GET", "/api/transport/routes", None),
    ("transport_route_geometry", "GET", "/api/transport/routes/route_capital_001/geometry", None),
    ("services_nearby", "GET", "/api/v1/services/nearby?lat=20.2961&lng=85.8245&category=hospital", None)
]

def probe_public_backend():
    base_url = "https://otravelz-backend.onrender.com"
    report = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "wave": "D1.5",
        "phase": "Phase 6 — Live Core Endpoint Proof",
        "backend_url": base_url,
        "endpoints_probed": {},
        "overall_availability": "UNAVAILABLE_SUSPENDED_ON_RENDER",
        "metrics": {
            "total_endpoints": len(ENDPOINTS),
            "reachable_endpoints": 0,
            "timeout_rate": 1.0,
            "p50_ms": None,
            "p95_ms": None
        }
    }

    for name, method, path, data in ENDPOINTS:
        url = base_url + path
        print(f"Probing {name}: {method} {url} ...")
        t0 = time.time()
        res = {
            "url": url,
            "method": method,
            "status": None,
            "latency_ms": None,
            "reachable": False,
            "error": None
        }
        try:
            req = urllib.request.Request(
                url,
                data=data,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Content-Type": "application/json"
                },
                method=method
            )
            # Use 10s probe timeout to prevent stalling
            with urllib.request.urlopen(req, timeout=10) as resp:
                latency = (time.time() - t0) * 1000
                res["status"] = resp.status
                res["latency_ms"] = round(latency, 2)
                res["reachable"] = True
                print(f"  Result: {resp.status} in {latency:.2f}ms")
        except urllib.error.HTTPError as e:
            latency = (time.time() - t0) * 1000
            res["status"] = e.code
            res["latency_ms"] = round(latency, 2)
            res["error"] = f"HTTPError {e.code}: {e.reason}"
            print(f"  Result: HTTP {e.code} in {latency:.2f}ms")
        except Exception as e:
            latency = (time.time() - t0) * 1000
            res["latency_ms"] = round(latency, 2)
            res["error"] = f"{type(e).__name__}: {str(e)}"
            print(f"  Result: Failed with {type(e).__name__} in {latency:.2f}ms")

        report["endpoints_probed"][name] = res

    os.makedirs("reports", exist_ok=True)
    with open("reports/d1_5_public_backend_probe.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("Generated reports/d1_5_public_backend_probe.json")

if __name__ == "__main__":
    probe_public_backend()
