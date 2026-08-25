# O-Travelz Phase 11 Step 5 — Production Search & Destination Discovery Report

**Author**: Systems, AI Grounding & Geospatial Core Team (Smarak)  
**Date**: August 22, 2026  
**Status**: COMPLETE — ALL QUALITY GATES GREEN  

---

## 1. Executive Summary

Phase 11 Step 5 built the scalable **Search, Knowledge Retrieval, and Destination Discovery Foundation** over the expanded 161-place, 30-district canonical Odisha knowledge base.

This layer replaces unranked SQL `ILIKE` substring lookups with a deterministic 8-tier relevance scoring algorithm, verified local alias/acronym expansion (`BBI`, `BBS`, `JRG`, `Silver City`, `Jagannath Dham`), domain separation between tourist attractions, emergency medical institutions (`hospital`), and multimodal transit hubs (`transit_hub`), geospatial proximity filtering (`near_lat`, `near_lon`, `radius_km`), pagination metadata (`X-Total-Count`), and an AI-ready structured knowledge retrieval interface.

---

## 2. What Was Inspected

1. **Backend Subsystem**:
   - `backend/app/api/places_routes.py`: Previous unranked alphabetical ordering and missing domain separation parameters.
   - `backend/app/models/place.py`: Table schema, indexes (`ix_places_district`, `ix_places_name`, `ix_places_category_id`, `ix_places_verification_status`), and `location` Geography column.
   - `backend/app/services/ranking/repository.py`: Invariant `NON_LEISURE_CATEGORIES = frozenset({"hospital", "emergency_facility", "transit_hub"})`.
   - `backend/app/ai/`: `RuleBasedModelAdapter`, `orchestrator.py`, and `grounding.py` for future AI retrieval integration.
2. **Frontend Subsystem**:
   - `frontend/src/pages/DestinationsPage.tsx` & `frontend/src/store/usePlaces.ts`: Previous client-side array filtering and missing server-side debounced search.
   - `frontend/src/api/client.ts` & `frontend/src/types/api.ts`: Parameter serialization for `listPlaces`.
   - `frontend/src/components/nav/TopNav.tsx` & `MobileDrawer.tsx`: Removed historical "All Destinations Index (81)" labels.
3. **Data & Quality Foundation**:
   - `data/places/places.json`: 161 canonical places across all 30 districts.
   - `scripts/audit_data_quality.py`: Enforces 0 FAIL, 0 WARNING data contract.

---

## 3. What Was Changed & Why

| Component | File Changed / Created | Purpose & Rationale |
| :--- | :--- | :--- |
| **Search Models** | `backend/app/services/search/search_models.py` | Typed contracts for query parameters (`SearchQueryParams`), candidate scoring (`ScoredPlaceCandidate`), compact AI knowledge records (`CompactKnowledgeRecord`), and pagination. |
| **Search Normalizer** | `backend/app/services/search/search_normalizer.py` | Normalizes text, removes stop words, extracts intent (district, category, interest, medical, transit), and maps verified local aliases/acronyms. |
| **Search Ranker** | `backend/app/services/search/search_ranker.py` | Implements 8-tier deterministic scoring formula, filter bonuses, proximity boosts, and tie-breaking. |
| **Search Service** | `backend/app/services/search/search_service.py` | Production search engine with PostGIS proximity calculation, domain separation, and AI retrieval facade. |
| **Search Module Hub** | `backend/app/services/search/__init__.py` | Clean module exports for backend consumers. |
| **API Route Upgrade** | `backend/app/api/places_routes.py` | Upgraded `GET /places` to delegate to `SearchService`, supporting all 12 query parameters and returning `X-Total-Count` headers while maintaining 100% backward compatibility. |
| **API Client Types** | `frontend/src/types/api.ts` | Expanded `PlaceListParams` to include `interest`, `verification_status`, `is_medical`, `is_transit`, `near_lat`, `near_lon`, `radius_km`, `limit`, `offset`. |
| **API Client** | `frontend/src/api/client.ts` | Updated `listPlaces` to serialize all query parameters. |
| **Places Store & Search Hook**| `frontend/src/store/usePlaces.ts` | Added `usePlaceSearch` hook with 200ms input debouncing, loading, empty state, and offline seed fallback. |
| **Navigation Labels** | `TopNav.tsx`, `MobileDrawer.tsx` | Removed hardcoded "(81)" label from "All Destinations Index". |
| **Backend Test Suite** | `backend/tests/test_search_service.py` | 17 new tests covering exact match, partial match, aliases, 30-district discovery, medical/transit separation, pagination, proximity, and AI retrieval. |
| **Frontend Test Suite** | `frontend/tests/destinations_search_flow.test.tsx` | 5 new tests verifying search input rendering, empty state, filter reset, and parameter serialization. |

---

## 4. API & Contracts Changed

### Endpoint: `GET /places`
- **Backward Compatibility**: Fully preserved. Existing callers without query parameters receive the canonical list of places.
- **Query Parameters Supported**:
  - `search` (str)
  - `district` (str)
  - `region` (str)
  - `category` (str)
  - `interest` (str)
  - `verification_status` (str)
  - `is_medical` (bool)
  - `is_transit` (bool)
  - `near_lat` (float, 17.0–23.5)
  - `near_lon` (float, 81.0–88.0)
  - `radius_km` (float, >0)
  - `limit` (int, 1–200, default 200)
  - `offset` (int, $\ge 0$, default 0)
- **Response Headers**:
  - `X-Total-Count`: Total unpaginated matching records.
  - `X-Limit`: Active page size limit.
  - `X-Offset`: Active page offset.

---

## 5. Search Behavior & Deterministic Ranking Rules

$$\text{Score} = w_{\text{exact\_name}} \cdot 100 + w_{\text{alias}} \cdot 85 + w_{\text{prefix}} \cdot 70 + w_{\text{token}} \cdot 50 + w_{\text{cat/dist}} \cdot 35 + w_{\text{desc}} \cdot 15 + w_{\text{addr}} \cdot 10 + \text{Boost}_{\text{filters}} + \text{Boost}_{\text{proximity}}$$

### Deterministic Priority Tiers:
1. **Tier 1 (100.0)**: Exact case-insensitive match on `Place.name`.
2. **Tier 2 (85.0)**: Verified alias / transport acronym match (`BBI`, `BBS`, `Silver City`, `Jagannath Dham`).
3. **Tier 3 (70.0)**: Prefix match on `Place.name`.
4. **Tier 4 (50.0)**: Word token overlap fraction in `Place.name`.
5. **Tier 5 (35.0)**: Category, thematic interest, or district match.
6. **Tier 6 (15.0)**: Substring / token match in `Place.description`.
7. **Tier 7 (10.0)**: Substring match in `Place.address`.
8. **Filter Boost (+20.0 per filter)** & **Proximity Boost ($\max(0, 30 - 0.3 \cdot d_{\text{km}})$)**.

### Sorting & Tie-Breaking:
1. `score` descending
2. `distance_km` ascending (if location proximity search is active)
3. `name` ascending alphabetical (stable tie-breaker)

---

## 6. Medical & Transit Domain Separation

- **Leisure Discovery**: General searches (`search="Cuttack"` or `category="temple"`) strictly exclude `hospital`, `emergency_facility`, and `transit_hub`.
- **Explicit Healthcare Lookup**: Queries targeting medical facilities (`is_medical=True` or containing "hospital", "medical", "doctor") retrieve apex medical colleges and district hospitals.
- **Explicit Transit Lookup**: Queries targeting transport hubs (`is_transit=True` or containing "airport", "railway station", "bus terminal") retrieve airports, railway junctions, and ISBTs.

---

## 7. AI-Ready Structured Knowledge Retrieval Layer

The AI assistant layer queries structured abstractions in `SearchService`:
- `SearchService.retrieve_places(db, query, district, category, interest, limit)`
- `SearchService.retrieve_by_district(db, district, limit)`
- `SearchService.retrieve_by_category(db, category, district, limit)`
- `SearchService.retrieve_by_interest(db, interest, district, limit)`
- `SearchService.retrieve_medical(db, district, limit)`
- `SearchService.retrieve_transit(db, district, limit)`
- `SearchService.retrieve_near_location(db, lat, lon, radius_km, limit)`

Each returns `CompactKnowledgeRecord` instances containing clean, unpolluted data.

---

## 8. Exact Commands & Verification Results

| Quality Gate | Exact Command | Execution Result |
| :--- | :--- | :---: |
| **Data Quality Audit** | `python scripts/audit_data_quality.py` | **PASS (0 FAIL, 0 WARNING, 30/30 districts)** |
| **Backend Search Unit Tests** | `pytest backend/tests/test_search_service.py` | **17 passed** |
| **Full Backend Test Suite** | `pytest backend/tests` | **379 passed, 2 deselected (100% PASS)** |
| **Frontend Vitest Suite** | `npm --prefix frontend test -- --run` | **295 passed, 5 skipped (100% PASS)** |
| **Frontend Search Tests** | `vitest run tests/destinations_search_flow.test.tsx` | **5 passed** |
| **Frontend Production Build** | `npm --prefix frontend run build` | **Clean build in 9.68s** |
| **Python Syntax Check** | `python -m compileall backend scripts` | **0 syntax errors** |
| **Git Diff Whitespace Check** | `git diff --check` | **0 whitespace errors** |
| **System Diagnostics** | `powershell -File .\doctor.ps1` | **11 / 11 PASS (`RESULT: READY`)** |

---

## 9. Known Limitations

- **Odia Script (ଓଡ଼ିଆ) Tokenization**: Search normalizer currently processes Latin transliteration; native Odia script Unicode tokenization is scheduled for Phase 12 multilingual integration.
- **PostgreSQL Full-Text GIN Indexing**: Current in-memory candidate scoring completes in $<5\text{ms}$ on 161 records; `pg_trgm` GIN indexing can be enabled when scaling past 10,000 places.

---

## 10. Next Recommended Step

**Phase 11 Step 6 — Grounded Odisha AI Assistant & Multilingual Retrieval Integration**:
- Wire the AI assistant tools (`backend/app/ai/tools/`) to consume `SearchService.retrieve_*` rather than static tuples.
- Expand conversational grounding to support natural-language travel queries across all 30 districts.
