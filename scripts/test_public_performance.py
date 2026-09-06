"""
O-TRAVELZ V4 — Wave D1.2 Public Performance Sanity Runner
Measures cold vs warm latencies against public frontend and backend gateway.
"""

import json
import os
import time
import urllib.request
from datetime import datetime, timezone

PUBLIC_FRONTEND = "https://algoryxz.github.io/O-Travelz/"
PUBLIC_BACKEND = "https://9109f508361c7c.lhr.life"
REPORT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "d1_2_public_performance.json")

ENDPOINTS = [
    {
        "name": "frontend_root_html",
        "url": PUBLIC_FRONTEND,
        "method": "GET",
        "expected_status": 200,
        "max_warm_latency_ms": 3000
    },
    {
        "name": "backend_health",
        "url": f"{PUBLIC_BACKEND}/health",
        "method": "GET",
        "expected_status": 200,
        "max_warm_latency_ms": 1500
    },
    {
        "name": "backend_places_catalog",
        "url": f"{PUBLIC_BACKEND}/places?limit=10",
        "method": "GET",
        "expected_status": 200,
        "max_warm_latency_ms": 2000
    },
    {
        "name": "backend_weather_current",
        "url": f"{PUBLIC_BACKEND}/weather/current?lat=20.2961&lon=85.8245",
        "method": "GET",
        "expected_status": 200,
        "max_warm_latency_ms": 2500
    },
    {
        "name": "backend_transport_routes",
        "url": f"{PUBLIC_BACKEND}/api/transport/routes?limit=5",
        "method": "GET",
        "expected_status": 200,
        "max_warm_latency_ms": 2000
    },
    {
        "name": "backend_transport_geometry",
        "url": f"{PUBLIC_BACKEND}/api/transport/routes/10/geometry",
        "method": "GET",
        "expected_status": 200,
        "max_warm_latency_ms": 2000
    },
    {
        "name": "backend_services_nearby",
        "url": f"{PUBLIC_BACKEND}/api/v1/services/nearby?lat=20.2961&lon=85.8245&radius_km=5",
        "method": "GET",
        "expected_status": 200,
        "max_warm_latency_ms": 2000
    },
    {
        "name": "backend_ai_converse",
        "url": f"{PUBLIC_BACKEND}/ai/converse",
        "method": "POST",
        "payload": json.dumps({"messages": [{"role": "user", "content": "Hello"}]}).encode(),
        "headers": {"Content-Type": "application/json"},
        "expected_status": 200,
        "max_warm_latency_ms": 3500
    }
]

def measure_url(ep, is_warm=False):
    url = ep["url"]
    headers = ep.get("headers", {})
    headers["User-Agent"] = "O-Travelz-Performance-Probe/1.0"
    payload = ep.get("payload")
    req = urllib.request.Request(url, data=payload, headers=headers, method=ep.get("method", "GET"))

    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
            return {
                "status_code": resp.status,
                "bytes": len(data),
                "elapsed_ms": elapsed_ms,
                "success": resp.status == ep["expected_status"]
            }
    except Exception as e:
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
        return {
            "status_code": getattr(e, "code", 500),
            "bytes": 0,
            "elapsed_ms": elapsed_ms,
            "error": str(e),
            "success": False
        }

def run_performance_sanity():
    print("Executing Public Performance Sanity Measurement...")
    results = {
        "wave": "D1.2",
        "phase": "14_public_performance_sanity",
        "measured_at": datetime.now(timezone.utc).isoformat(),
        "frontend_origin": PUBLIC_FRONTEND,
        "backend_gateway": PUBLIC_BACKEND,
        "measurements": []
    }

    total_pass = True

    for ep in ENDPOINTS:
        print(f"Measuring {ep['name']}...")
        # Cold run
        cold = measure_url(ep, is_warm=False)
        time.sleep(0.3)
        # Warm runs (3 samples)
        warm_samples = []
        for _ in range(3):
            warm_samples.append(measure_url(ep, is_warm=True))
            time.sleep(0.2)
        
        warm_latencies = [s["elapsed_ms"] for s in warm_samples if s["success"]]
        avg_warm = round(sum(warm_latencies) / len(warm_latencies), 2) if warm_latencies else None
        min_warm = min(warm_latencies) if warm_latencies else None
        
        passed = cold["success"] and len(warm_latencies) == 3
        if not passed:
            total_pass = False

        record = {
            "endpoint": ep["name"],
            "url": ep["url"],
            "method": ep["method"],
            "cold_latency_ms": cold["elapsed_ms"],
            "cold_status": cold["status_code"],
            "warm_latencies_ms": warm_latencies,
            "avg_warm_latency_ms": avg_warm,
            "min_warm_latency_ms": min_warm,
            "pass": passed
        }
        results["measurements"].append(record)
        print(f"  Cold: {cold['elapsed_ms']}ms | Avg Warm: {avg_warm}ms | Pass: {passed}")

    results["all_endpoints_healthy"] = total_pass
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved performance report to {REPORT_PATH}")
    return results

if __name__ == "__main__":
    run_performance_sanity()
