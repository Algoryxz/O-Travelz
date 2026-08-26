# O-TRAVELZ — PHASE 3C: MULTIMODAL JOURNEY PLANNING REPORT
## Schedule-Aware Multimodal Transit × Food Orchestration

> **STATUS: LOCAL/DEV ONLY — NO PRODUCTION CHANGES**
> **AUTHORITATIVE TRANSIT BASELINE & TRANSPORT GRAPH 100% PRESERVED**

---

## 1. Executive Summary & Statement of Principles

Phase 3C establishes the first reliable, schedule-aware multimodal journey planning contract for O-TRAVELZ without relying on third-party commercial routing engines (e.g. Google Maps, Mapbox, OSRM).

> [!IMPORTANT]
> **Phase 3C is schedule-aware journey orchestration, not live road navigation.**
> It orchestrates verified first-party transit stops, graph sequences, scheduled timetable groups, and Phase 3B corridor food discovery.

---

## 2. Journey Architecture

```
📍 ORIGIN (GPS / Point)
   │
   ▼
🚶 WALK TO TRANSIT (Nearby verified stop within max_walking_distance_m)
   │
   ▼
🚌 BOARD TRANSIT (Official Stop with sequence order & schedule)
   │
   ▼
🚌 TRANSIT LEG (Deterministic stop sequence traversal)
   │
   ▼
🍴 OPTIONAL FOOD WAYPOINT (Phase 3B verified corridor detour / on-route candidate)
   │
   ▼
🚌 CONTINUE TRANSIT (Alighting at verified stop near destination)
   │
   ▼
🚶 WALK TO DESTINATION
   │
   ▼
🏁 DESTINATION (Place / Stop / GPS Point)
```

---

## 3. Request & Response Contracts

### Endpoint
`POST /transport/plan-journey`

### Request Schema
```json
{
  "origin_lat": 20.2675,
  "origin_lon": 85.8441,
  "destination_lat": 20.2520,
  "destination_lon": 85.8178,
  "destination_place_id": null,
  "destination_stop_id": null,
  "max_walking_distance_m": 2500.0,
  "include_food": true,
  "food_category": "street_food_market",
  "dietary_tag": "vegetarian",
  "cuisine": "Odia Street Food & Tiffin",
  "max_food_detour_m": 2500.0
}
```

### Example Successful Response (`SUCCESS`)
```json
{
  "journey_id": "89eb9863-7186-4f4c-81b3-a1c13d80ea4d",
  "status": "SUCCESS",
  "origin": {
    "latitude": 20.2675,
    "longitude": 85.8441,
    "resolved_name": "Origin GPS Point"
  },
  "destination": {
    "latitude": 20.252,
    "longitude": 85.8178,
    "resolved_name": "Destination Point"
  },
  "walking_legs": [
    {
      "leg_type": "walk_to_transit",
      "from_name": "Origin",
      "to_name": "BHUBANESWAR RAILWAY STATION",
      "distance_m": 150,
      "estimated_duration_mins": 2
    },
    {
      "leg_type": "walk_to_destination",
      "from_name": "BIJU PATNAIK INTERNATIONAL AIRPORT",
      "to_name": "Destination Point",
      "distance_m": 200,
      "estimated_duration_mins": 3
    }
  ],
  "transit_legs": [
    {
      "route_id": "673f886f-40e1-432d-94bb-4e94f1c9df03",
      "route_number": "12",
      "route_name": "Master Canteen - Airport",
      "service_area": "Capital Region",
      "boarding_stop_id": "...",
      "boarding_stop_name": "BHUBANESWAR RAILWAY STATION",
      "boarding_sequence": 1,
      "alighting_stop_id": "...",
      "alighting_stop_name": "BIJU PATNAIK INTERNATIONAL AIRPORT",
      "alighting_sequence": 6,
      "stop_count": 5,
      "scheduled_departures": ["06:30", "07:00", "07:30", "08:00", "08:30"],
      "estimated_transit_mins": 15
    }
  ],
  "food_waypoint": {
    "place_id": "c16bb5f7-fba2-40ae-bf36-f00e008a287a",
    "research_id": "food_khurda_003",
    "name": "Bapuji Nagar Food and Tiffin Corridor",
    "food_category": "street_food_market",
    "cuisine": "Odia Street Food & Tiffin",
    "speciality_dishes": ["Chhena Mudki", "Bara Ghuguni"],
    "dietary_tags": ["vegetarian", "snacks"],
    "corridor_status": "ON_ROUTE",
    "distance_from_corridor_m": 220.0,
    "estimated_detour_minutes": 0,
    "rating": 4.5,
    "rating_source": "Google Business Verified",
    "source": "OTDC Street Food Register",
    "verification_status": "VERIFIED"
  },
  "total_estimated_duration_minutes": 20,
  "warnings": [
    "Transit route geometry partially verified (4/10 stops geocoded)."
  ]
}
```

### Transparent Status Failures & Fallbacks
- `NO_VERIFIED_BOARDING_STOP`: Origin has no verified stops within `max_walking_distance_m`. Unresolved stops are never used as spatial boarding points.
- `DESTINATION_UNREACHABLE`: Destination cannot be resolved or has no reachable stops within walking distance.
- `NO_TRANSIT_PATH`: No valid direct transit route connects the boarding and alighting candidate stops.
- `FOOD_UNAVAILABLE`: Journey succeeds with `status = SUCCESS`, `food_waypoint = null`, and an informational warning.

---

## 4. Origin & Destination Resolution Invariants

1. **Zero Unresolved Stop Boarding**:
   - `Stop.location` MUST be non-null.
   - `Stop.coordinate_status` MUST be in `['official', 'verified', 'geocoded']`.
   - 1,389 unresolved stops remain strictly excluded from spatial distance calculations.
2. **Canonical Place Linking**:
   - Destination can be passed as `destination_place_id`.
   - Destination coordinates are extracted directly from the verified canonical `Place.location`.
3. **Graph Sequence Invariants**:
   - Boarding stop sequence MUST be strictly less than alighting stop sequence: `boarding_sequence < alighting_sequence`.

---

## 5. Test Verification Matrix

| Test Suite | File | Tests Passed | Status |
|:---|:---|:---:|:---:|
| Multimodal Journey Tests | `backend/tests/test_multimodal_journey.py` | 7 / 7 | ✅ GREEN |
| Full Backend Pytest Suite | `backend/tests/` | 805 / 805 | ✅ GREEN |
| Transit Extraction Invariants | `data/research/transit/extraction/04_tests.py` | 2,586 / 2,586 | ✅ GREEN |
| Full Frontend Vitest Suite | `frontend/tests/` | 403 / 403 (47 files) | ✅ GREEN |
| Frontend Production Build | `npm run build` | Built in 1.93s | ✅ GREEN |

---

## 6. Transport Graph Baseline Preservation

- **Transport Providers**: **3** (CRUT, etc.)
- **Routes**: **154** (154/154 with valid ordered sequence graphs)
- **Stops**: **1,430** (41 high-confidence geocoded, 1,389 preserved as unresolved nulls)
- **Route-Stop Sequence Links**: **1,487**
- **Schedule Groups**: **302**
- **Departures**: **5,553**
- **Bhubaneswar Railway Station Serving Routes**: **30**
- **Fabricated Coordinates**: **0**
- **Database Migrations Added**: **0** (Pure API orchestration layer)
