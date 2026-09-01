# O-Travelz — Western Odisha Master Research & Data Handoff

**Handoff Date:** 2026-09-01  
**Lead Researcher:** Akriti (Western Odisha Region Lead)  
**Target Repository:** `https://github.com/Algoryxz/O-Travelz.git`  
**Current Branch:** `main`  

---

## 1. Executive Summary

The Western Odisha research, dataset build, geospatial relationship calculation, frontend map integration, and data validation phase for O-Travelz has reached **100% completion** and is ready for final production handoff.

All 730 canonical POI and transport records, 2,670 Haversine proximity relationships, 1,077 nearest-facility links, 21 Round-2 candidate staging records, and frontend map components are audited, evidence-backed, and verified.

---

## 2. Regional Scope

The Western Odisha research scope encompasses 8 underrepresented districts:

1. **Sambalpur** (Major urban hub & Hirakud Dam)
2. **Bargarh** (Handloom & Dhanu Yatra circuit)
3. **Jharsuguda** (Industrial & rail corridor)
4. **Balangir** (Historical & eco-tourism circuit)
5. **Subarnapur** (Weaving & river confluence circuit)
6. **Nuapada** (Prehistoric rock art & wildlife sanctuaries)
7. **Deogarh** (Waterfalls & heritage sanctuaries)
8. **Sundargarh** (Rourkela Steel Township & Vedvyas confluence)

---

## 3. Canonical Dataset Inventory

All canonical datasets live under `data/` and `frontend/src/data/`. They pass 100% schema validation, zero duplicate IDs, and zero unverified WGS84 coordinates.

| Category | Record Count | Schema Path | WGS84 Coordinates | Evidence Tier | Status |
|---|---:|---|---|---|---|
| **Tourist Places** | 161 | `data/places/places.json` | 161 Valid (0 Null) | Tier 1 Curated | **VERIFIED** |
| **Hotels & Accommodations** | 78 | `data/accommodation/hotels_western_odisha.json` | 78 Valid (0 Null) | Tier 1 Official | **VERIFIED** |
| **Restaurants & Dining** | 88 | `data/dining/restaurants_western_odisha.json` | 88 Valid (0 Null) | Tier 1 Researched | **VERIFIED** |
| **Police Stations & Safety** | 71 | `data/safety/police_stations_western_odisha.json` | 71 Valid (0 Null) | Tier 1 Govt Registry | **VERIFIED** |
| **ATMs & Cash Access** | 112 | `data/finance/atms_western_odisha.json` | 112 Valid (0 Null) | Tier 1 Bank Registry | **VERIFIED** |
| **Petrol Pumps & Fuel** | 98 | `data/fuel/petrol_pumps_western_odisha.json` | 98 Valid (0 Null) | Tier 1 Fuel Corp | **VERIFIED** |
| **Hospitals & Healthcare** | 76 | `data/health/hospitals_western_odisha.json` | 76 Valid (0 Null) | Tier 1 Health Registry | **VERIFIED** |
| **Verified Transport Stops** | 46 | `frontend/src/data/staticTransitStops.ts` | 46 Valid (0 Null) | Official Transit Agency | **VERIFIED** |
| **TOTAL CANONICAL POIS** | **730** | -- | **730 / 730 (100%)** | **100% Tier 1** | **HANDOFF READY** |

---

## 4. Round 2 Research Staging

* **Staging Directory:** [`data/research/round2/western/`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/data/research/round2/western)
* **Candidates File:** [`data/research/round2/western/candidates.json`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/data/research/round2/western/candidates.json) (21 candidates across all 8 districts)
* **Sources File:** [`data/research/round2/western/sources.json`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/data/research/round2/western/sources.json) (63 primary and secondary source URLs)
* **District Distribution:** Nuapada (3), Bargarh (3), Subarnapur (3), Balangir (3), Jharsuguda (3), Deogarh (2), Sambalpur (2), Sundargarh (2).
* **Validation Status:** Clean pass via `scripts/validate_round2_research.py` (0 errors, 0 warnings).

---

## 5. Geospatial Proximity Layer

* **Canonical Relationship Dataset:** [`data/geospatial/poi_relationships_western_odisha.json`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/data/geospatial/poi_relationships_western_odisha.json)
* **Total Derived Relationships:** 2,670 Haversine proximity relationships ($R = 6371.0088 \text{ km}$)
* **Total Nearest Links:** 1,077 nearest facility links
* **Data Quality:** 0 duplicate relationships, 0 self relationships, 0 negative/invalid distances, 0 dangling IDs.

---

## 6. Frontend Service & Map Components

1. [`frontend/src/services/geospatialRelationshipService.ts`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/frontend/src/services/geospatialRelationshipService.ts): Cached service indexing relationships by `source_id` and resolving target IDs to official names.
2. [`frontend/src/services/westernOdishaMapService.ts`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/frontend/src/services/westernOdishaMapService.ts): Compiles 730 valid WGS84 point features into `MapFeature[]` for Leaflet rendering.
3. [`frontend/src/components/place/NearbyFacilities.tsx`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/frontend/src/components/place/NearbyFacilities.tsx): Reusable React UI component displaying clean traveler-facing details (`Hotel XYZ · 1.4 km · Nearby`).
4. [`frontend/src/components/place/PlaceDetailsModal.tsx`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/frontend/src/components/place/PlaceDetailsModal.tsx): Destination detail modal embedding the nearby facilities container.
5. [`frontend/src/components/map/MapView.tsx`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/frontend/src/components/map/MapView.tsx) & [`MapCanvas.tsx`](file:///c:/Users/akrit/OneDrive/Desktop/O-Travelz/frontend/src/components/map/MapCanvas.tsx): Map canvas rendering 730 POI markers with category color coding.

---

## 7. Validation & Test Suite Status

```text
check_project_context.py ......................... PASS (14/14 context specification files valid)
validate_round2_research.py ...................... PASS (21 candidates clean, 0 errors)
western_odisha_map_integration.test.tsx .......... PASS (Map feature compilation & WGS84 bounds valid)
geospatial_relationship_service.test.tsx ........ PASS (Distance formatting & sorting valid)
```

---

## 8. Truthfulness & Evidence Policy

O-Travelz adheres strictly to empirical truthfulness standards:
- **Zero Coordinate Fabrication:** All 730 POI map markers use surveyed GPS pins or verified town geocodes.
- **Zero Bus Fare Invention:** Per-stage bus fares remain `amount_inr: null` universally.
- **Zero Fake Telemetry:** Transit routes display schedule departure timetables only; no fake "live GPS tracking".

---

## 9. Intentionally Unresolved Items

1. **Bus Fares (`amount_inr: null`):** Kept null because public CRUT fare stage structures are not available in structured digital form.
2. **Rural Transit Stop Coordinates (1,344 stops):** 1,344 stop names extracted from PDF timetables remain `UNRESOLVED` to prevent geocoding hallucinations.
3. **Real-time GPS Telemetry:** No public real-time bus API exists.

---

## 10. Phase 12 Commercial AI Provider Integration

* **Status:** `BLOCKED_BY_COST_POLICY`
* **Note:** Commercial AI provider selection remains blocked pending executive team API key allocation. Deterministic itinerary planning, rule-based constraints, and Ollama/Gemini fallback adapters remain active.

---

## 11. Repository File Map

| Artifact / Component | Path | Description |
|---|---|---|
| **Round-2 Candidates** | `data/research/round2/western/candidates.json` | 21 staged Western candidates |
| **Round-2 Sources** | `data/research/round2/western/sources.json` | 63 verified source URLs |
| **Hotels Dataset** | `data/accommodation/hotels_western_odisha.json` | 78 verified hotel records |
| **Restaurants Dataset** | `data/dining/restaurants_western_odisha.json` | 88 verified restaurant records |
| **Police Stations Dataset** | `data/safety/police_stations_western_odisha.json` | 71 verified police station records |
| **ATMs Dataset** | `data/finance/atms_western_odisha.json` | 112 verified ATM records |
| **Petrol Pumps Dataset** | `data/fuel/petrol_pumps_western_odisha.json` | 98 verified petrol pump records |
| **Hospitals Dataset** | `data/health/hospitals_western_odisha.json` | 76 verified hospital records |
| **Geospatial Layer** | `data/geospatial/poi_relationships_western_odisha.json` | 2,670 Haversine relationships |
| **Geospatial Service** | `frontend/src/services/geospatialRelationshipService.ts` | Nearby relationship lookup service |
| **Map Service** | `frontend/src/services/westernOdishaMapService.ts` | Map feature compilation service |
| **Nearby UI Component** | `frontend/src/components/place/NearbyFacilities.tsx` | Reusable nearby facilities card |

---

## 12. Reproducibility & Validation Commands

To re-run all context and dataset validators:
```powershell
.\.venv\Scripts\python.exe scripts\check_project_context.py
.\.venv\Scripts\python.exe scripts\validate_round2_research.py
```

---

## 13. Git & GitHub Handoff State

* **Target Remote:** `https://github.com/Algoryxz/O-Travelz.git`
* **Current Branch:** `main`
* **Latest Commit:** `5102b7d` (`docs/research: close final pending work audit`)
* **Working-Tree Status:** Clean
