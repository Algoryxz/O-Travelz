# O-TRAVELZ — PHASE 3B TRANSIT × FOOD CORRIDOR INTELLIGENCE REPORT

**Date:** 2026-08-24  
**Status:** COMPLETE & VERIFIED  
**Phase:** 3B (Corridor Food Spatial Discovery & Stitch Waypoint Integration)  
**Safety Scope:** PROTECTED LOCAL/DEV ONLY — ZERO PRODUCTION TOUCHED  

---

## 1. Executive Summary

Phase 3B implements the spatial intelligence layer linking transit routes with nearby verified food establishments and cultural culinary hubs.

- **Deterministic Endpoint:** Exposes `GET /transport/corridor-food` taking a transit `route_id` and optional dietary/cuisine/category filters.
- **Geometric Proximity Engine:** Implements local equirectangular point-to-segment projection across all verified coordinate stops along the route.
- **Zero Coordinate Fabrication:** Routes with unresolved stops between verified terminals do not guess intermediate road geometry; unresolved stops remain null.
- **Explicit Detour Classification:** Categorizes candidates into `ON_ROUTE` ($\le 300\text{m}$), `SHORT_DETOUR` ($>300\text{m}$ and $\le 2.5\text{km}$), and `LONG_DETOUR` ($>2.5\text{km}$ and $\le 8\text{km}$). Candidates beyond $8\text{km}$ are discarded.
- **Stitch Waypoint Integration:** `StitchJourneyCard` seamlessly renders an optional Food Waypoint step in the vertical journey timeline; `StitchMapPage` plots verified food pins (`🍴`) along active transit routes.

---

## 2. API Request & Response Contract

### Request:
```http
GET /transport/corridor-food?route_id=6440c31d-b582-4aa7-920f-b258671ebae5&max_distance_m=5000&dietary_tag=vegetarian&limit=5
```

### Response:
```json
{
  "route_id": "6440c31d-b582-4aa7-920f-b258671ebae5",
  "route_number": "12",
  "route_name": "Master Canteen to Biju Patnaik Airport",
  "corridor_geometry_info": {
    "verified_coordinate_stops": 4,
    "total_route_stops": 10,
    "verified_segment_count": 3,
    "unresolved_gap_count": 6,
    "geometry_status": "partial"
  },
  "total_candidates": 1,
  "candidates": [
    {
      "place_id": "902d25fe-ba5f-4029-9e8c-cc084e604753",
      "research_id": "food_khurda_003",
      "name": "Bapuji Nagar Food & Tiffin Corridor",
      "district": "Khordha",
      "locality": "Bapuji Nagar, Janpath Commercial Corridor",
      "latitude": 20.2647,
      "longitude": 85.8365,
      "food_category": "street_food_market",
      "cuisine": "Odia Street Food & Tiffin",
      "dietary_tags": ["vegetarian", "snacks", "street_food"],
      "speciality_dishes": ["Chhena Mudki", "Bara Ghuguni", "Cuttack Gupchup"],
      "price_tier": "budget",
      "rating": 4.5,
      "rating_count": 320,
      "rating_source": "Google Business Verified (Audit: 2026-08-24)",
      "distance_from_corridor_m": 220.4,
      "estimated_detour_minutes": 0,
      "corridor_status": "ON_ROUTE",
      "match_reasons": ["on_route", "dietary_match:vegetarian", "verified_source"],
      "source": "OTDC Street Food Register & Smart City Culinary Directory",
      "verification_status": "VERIFIED"
    }
  ]
}
```

---

## 3. Mathematical & Algorithmic Methodology

### Point-to-Segment Projection:
For each food place $P = (\text{lat}_p, \text{lon}_p)$ and route segment $AB$ with verified coordinates $A = (\text{lat}_a, \text{lon}_a)$ and $B = (\text{lat}_b, \text{lon}_b)$:
1. Calculate local midpoint $\text{lat}_{mid} = \frac{\text{lat}_a + \text{lat}_b}{2}$.
2. Project to local Cartesian space:
   $$dx = (\text{lon}_b - \text{lon}_a) \times 111320.0 \times \cos(\text{lat}_{mid})$$
   $$dy = (\text{lat}_b - \text{lat}_a) \times 110540.0$$
3. Project point $P$ onto segment $AB$:
   $$t = \frac{\vec{AP} \cdot \vec{AB}}{|\vec{AB}|^2}, \quad t_{clamped} = \max(0, \min(1, t))$$
4. Compute perpendicular distance:
   $$\text{dist} = |\vec{AP} - t_{clamped} \vec{AB}|$$

### Detour Time Approximation:
- **Disclaimer:** *"This is corridor proximity intelligence, not live road-network navigation."*
- $D_{extra} = 2 \times d_{corridor}$ (assuming deviation and return).
- Conservative urban speed $= 30\text{ km/h} = 500\text{ m/min}$.
- Estimated Detour:
  - `ON_ROUTE` ($d \le 300\text{m}$): **0 minutes**.
  - `SHORT_DETOUR` / `LONG_DETOUR`: $\lceil D_{extra} / 500 \rceil + 5\text{ min (service buffer)}$.

---

## 4. Test Suite Verification Summary

| Suite | Items Run | Passed | Failed | Status |
|---|---|---|---|---|
| **Backend Pytest** (`backend/tests/`) | 800 | 798 (2 deselected) | 0 | **ALL PASSING** |
| **Transit Extraction Invariants** (`04_tests.py`) | 2,586 | 2,586 | 0 | **ALL PASSING** |
| **Frontend Vitest** (`frontend/tests/`) | 401 (46 test files) | 401 | 0 | **ALL PASSING** |
| **Frontend Production Build** (`npm run build`) | Vite bundle | Clean (1.66s) | 0 | **ALL PASSING** |

---

## 5. Transport Graph Invariants (Protected Baseline)

- **Transport Providers:** **3**
- **Routes:** **154** (154/154 ordered stop sequences preserved)
- **Stops:** **1,430** (41 verified geocoded, 1,389 preserved as null)
- **Route-Stop Links:** **1,487**
- **Scheduled Trip Groups:** **302**
- **Scheduled Departures:** **5,553**
- **Bhubaneswar Railway Station Serving Routes:** **30**
