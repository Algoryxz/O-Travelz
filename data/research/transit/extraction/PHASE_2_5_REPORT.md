# O-TRAVELZ — Transit Phase 2.5 Master Report
## Transport Graph & Geospatial Coverage Resolution

**Generated**: 2026-08-24
**Source Directory**: `data/research/transit/official/`
**Target Tables**: `routes`, `stops`, `route_stops`, `scheduled_trip_groups`, `transport_providers`
**Status**: **Phase 2.5 Graph & Geospatial Resolution Verified — Ready for Review**

---

## 1. DATABASE GRAPH RESOLUTION

### Root Cause Analysis of Phase 2 Issue
1. **Stoppage Document Loop Gap**: Stoppage parser in `02_extract_routes_stops_schedules.py` checked `if current_route is None` before setting route numbers. Once the first route was assigned, subsequent route headers were bypassed, clustering all stops in Berhampur, Sambalpur, Keonjhar, and Rourkela onto a single route per file.
2. **Missing Sequence Links for Termini/Via Routes**: Capital Region routes defined in schedule tables were not expanded into sequence links (`origin` -> `via stops` -> `destination`), leaving Bhubaneswar Railway Station with 0 serving routes in the graph.

### Fix Implemented
- **Page-by-Page Stoppage Parsing**: Dedicated route association per page for Berhampur (Routes 300-307), Sambalpur (Routes 201-215), and Keonjhar (Routes 400-405).
- **Comprehensive Route-Stop Sequence Graph**: All 154 routes now have full sequence ordering from origin through intermediate via landmarks to destination.
- **Foreign Key Alignment**: `RouteStop.route_id -> Route.id` and `RouteStop.stop_id -> Stop.id` validated across all 1,487 links.

### Graph Verification Metrics
| Entity / Metric | Count / Status | Notes |
|---|---|---|
| **Total Routes in DB** | **154** | 100% of routes have verified stop sequence graph |
| **Total Stops in DB** | **1,430** | Canonical stops across 5 regions |
| **Total Route-Stop Links in DB** | **1,487** | Deterministic sequence ordering (1..N) |
| **Routes with Valid Stop Sequences** | **154 / 154 (100%)** | All 154 routes connect to ordered stops |
| **Routes Serving BBSR Railway Station** | **30 routes** | Routes DD1, 09, 11, 12, 14, 16, 20, 21, 22A, 23, 27, 28, 30, 31, 32, 33, 34, 35, 36, 38, 39, 50, 70, 82, etc. |

---

## 2. GEOSPATIAL RESOLUTION & COVERAGE

### Coordinate Source Breakdown
| Status / Category | Count | Source / Policy |
|---|---|---|
| **Official Coordinates** | 0 | Source PDF schedules contain diagrammatic timetables without raw GPS |
| **Geocoded Coordinates** | **43** | Verified priority hubs and canonical destinations matched with high confidence |
| **- from Canonical Places** | **28** | Cross-referenced against 161 verified repository places (e.g. AIIMS, Airport, Lingaraj, Nandankanan, Barabati, Konark) |
| **- from OSM Nominatim** | **15** | Bounding-box validated city hub coordinates |
| **Ambiguous / Review Queue** | **1,387** | Stored in `data/research/transit/extraction/geocoding_review.json` for human inspection |
| **Unresolved Coordinates** | **1,387** | Marked strictly as `coordinate_status: 'unresolved'`, `location = None` (zero fake coordinates) |

---

## 3. API ENDPOINTS & GRAPH TRAVERSAL VERIFICATION

### A. Nearby Stop Discovery: `GET /transport/stops/nearby`
**Query**: `GET /transport/stops/nearby?lat=20.2667&lon=85.8436&radius_m=3000&limit=1`
```json
[
  {
    "stop_id": "e633a3b6-b0e6-409f-a418-f80384e30f6a",
    "name": "BHUBANESWAR RAILWAY STATION",
    "published_name": "Bhubaneswar Railway Station",
    "canonical_stop_id": "stop-bhubaneswar-bhubaneswar-railway-station-6d3e8ade",
    "city": "Bhubaneswar",
    "latitude": 20.266777,
    "longitude": 85.843559,
    "coordinate_status": "geocoded",
    "distance_m": 9.6,
    "walking_estimate_mins": 1,
    "routes_serving_stop": [
      {
        "route_id": "26a84cc2-2519-4929-a44c-1f50c2b190c2",
        "route_number": "DD1",
        "route_name": "Bhubaneswar Railway Station – Shree Mandira Parking, Puri (Via",
        "sequence_order": 1,
        "service_area": "Capital Region",
        "origin": "Bhubaneswar Railway Station",
        "destination": "Shree Mandira Parking, Puri"
      },
      {
        "route_id": "d046f4eb-88a2-4a00-ab64-500b4676579a",
        "route_number": "09",
        "route_name": "Bhubaneswar Railway Station - Patia (via Niladri Vihar)",
        "sequence_order": 1,
        "service_area": "Capital Region",
        "origin": "Bhubaneswar Railway Station",
        "destination": "Patia"
      }
    ],
    "region": "Bhubaneswar"
  }
]
```

### B. Transport Map Contract: `GET /transport/map`
**Query**: `GET /transport/map?region=Capital Region`
- **Total Routes**: 96 routes (100% expose `stops_count > 0` and full stop sequence)
- **Total Stops**: 362 stops
- **Unresolved stops handling**: Preserved in sequence with `coordinate_status: "unresolved"` and `latitude: null`.

### C. Route Details: `GET /transport/routes/{route_id}`
- Exposes full ordered stops list, sequence numbers, and departure timetable schedules.

---

## 4. TEST SUITE VALIDATION

```
============================================================
ALL TEST SUITES PASSED
============================================================
1. Phase 2.5 Integration Suite (test_official_transit_import.py): 18 passed, 0 failed
2. Extraction Invariant Suite (04_tests.py): 2,586 passed, 0 failed
3. Full Backend Suite (pytest backend/tests/): 788 passed, 0 failed (2 deselected)
4. Frontend Test Suite (vitest): 395 passed, 0 failed (44 test files)
5. Frontend Production Build (npm run build): Built cleanly in 1.88s with 0 errors
```

---

## 5. SAFETY BOUNDARIES OBSERVED
- ❌ **No production database modification or migration performed.**
- ❌ **No Stitch UI redesign or Copilot UI modifications executed.**
- ❌ **Zero coordinates fabricated.**
- ❌ **Ambiguous and unresolved stops preserved with explicit status.**
