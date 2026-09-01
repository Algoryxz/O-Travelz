# O-Travelz Phase 11 Step 5 — Search, Knowledge Retrieval & Data-Access Discovery Audit

**Author**: Systems & Data Architecture Team (Smarak)  
**Date**: August 22, 2026  
**Status**: AUDIT COMPLETE  

---

## 1. Executive Overview

This audit establishes the technical baseline of search, knowledge retrieval, and data access across the O-Travelz repository following the successful expansion of the canonical knowledge base to **161 records across all 30 districts of Odisha** in Step 4.

The objective of Phase 11 Step 5 is to design and implement a production-grade, deterministic **Search & Knowledge Retrieval Service** that powers:
1. Destination & Attraction Discovery in the web application.
2. Filtered geospatial map rendering.
3. Structured, hallucination-free grounding for the upcoming Odisha AI assistant.
4. Multimodal starting hub and emergency medical lookup.
5. Location-aware proximity queries without storing or leaking client GPS coordinates.

---

## 2. Current Architecture & Capability Inspection

### 2.1 Backend HTTP Boundary (`backend/app/api/places_routes.py`)
- **Current State**: `GET /places` performs simple SQL filtering:
  - `Category.name.ilike(category)`
  - `Place.district.ilike(district)`
  - `Place.interest_associations.any(...)`
  - `Place.name.ilike("%term%") | Place.description.ilike("%term%")`
- **Limitations**:
  - **No Relevance Ranking**: Returns results strictly ordered alphabetically by `Place.name.asc()`. Exact name matches ("Puri") are placed below "Balighai Beach, Puri".
  - **No Alias / Alternate Name Resolution**: Searching "BBS", "BBI", "Silver City", "Temple City", or "Jagannath Dham" fails to match unless explicitly present in the description.
  - **No Pagination or Limit Controls**: Always loads the full result set into memory, creating performance risks when scaling to 10,000+ records.
  - **No Domain Separation Parameters**: Does not provide `is_medical` or `is_transit` query parameters, forcing callers to inspect categories manually.
  - **No Geospatial Proximity Search**: Cannot query "places near (lat, lon) within radius X km".

### 2.2 Database Layer & Schema (`backend/app/models/place.py`)
- **Indexes Present**:
  - `ix_places_district` (B-Tree on `district`)
  - `ix_places_name` (B-Tree on `name`)
  - `ix_places_category_id` (B-Tree on `category_id`)
  - `ix_places_verification_status` (B-Tree on `verification_status`)
- **PostGIS Support**: `Place.location` is a `Geography(geometry_type="POINT", srid=4326)`. Spatial indexing and `ST_DWithin` / `ST_Distance` functions are supported by PostGIS 3.4.
- **Search Term / Alias Schema Opportunity**: Places currently lack a structured `search_terms` / `aliases` column. Adding a lightweight, verified alias mapping (e.g. `Bhubaneswar` $\to$ `Bhubaneswar, Smart City, Ekamra Kshetra, BBS`, `BBI` $\to$ `Biju Patnaik International Airport`) will boost retrieval accuracy without fabricating travel data.

### 2.3 Frontend Discovery Layer (`frontend/src/components/home/DestinationsPage.tsx` & `usePlaces.ts`)
- **Current State**:
  - `usePlaces()` fetches all records via `api.listPlaces()` on mount, storing them in state with a bundled JSON fallback (`FALLBACK_EXTENDED_PLACES`).
  - `DestinationsPage.tsx` performs pure client-side array filtering across region, category, interest, and search string.
- **Limitations**:
  - Does not leverage server-side search relevance, tokenization, or geospatial indexing.
  - Medical facilities and transit hubs appear alongside leisure tourist attractions in the general catalog unless filtered.
  - Missing server-side debounced search and pagination for large result sets.

### 2.4 AI Grounding Layer (`backend/app/ai/`)
- **Current State**: `RuleBasedModelAdapter` currently parses hardcoded intent and builds itineraries via `ItineraryPlanner` or transit hops via `TransportService`.
- **Limitation**: The AI layer has no structured data retrieval tool/service. It cannot invoke `search_places`, `retrieve_by_district`, `retrieve_medical`, or `retrieve_near_location` through a clean, typed abstraction. Direct raw database queries from AI tools would violate architectural layering.

---

## 3. Search Quality & Deterministic Ranking Strategy

To replace naive substring matching with a robust, predictable search engine, the new `SearchService` will implement an 8-tier deterministic scoring formula:

$$\text{Score} = w_{\text{exact\_name}} \cdot 100 + w_{\text{alias\_match}} \cdot 85 + w_{\text{prefix\_name}} \cdot 70 + w_{\text{token\_name}} \cdot 50 + w_{\text{cat\_int\_dist}} \cdot 35 + w_{\text{desc}} \cdot 15 + w_{\text{addr}} \cdot 10$$

### Scoring Priority Hierarchy:
1. **Tier 1: Exact Name Match** (Score: 100) — Case-insensitive exact string match on `Place.name`.
2. **Tier 2: Exact Alias Match** (Score: 85) — Match against verified airport codes (`BBI`, `JRG`), railway codes (`BBS`, `CTC`, `PURI`), or historical titles (`Jagannath Dham`, `Silver City`).
3. **Tier 3: Prefix Match on Name** (Score: 70) — Place name starts with the search query.
4. **Tier 4: Token Match in Name** (Score: 50) — Individual search tokens appear in the place name.
5. **Tier 5: Category / Interest / District Match** (Score: 35) — Search query matches a canonical category, interest, or district name.
6. **Tier 6: Substring Match in Description** (Score: 15) — Search query found in descriptive text.
7. **Tier 7: Address / Location String Match** (Score: 10) — Search query found in address or provenance note.

---

## 4. Medical & Transit Domain Separation Contract

1. **Default Leisure Catalog Mode (`is_medical=False, is_transit=False`)**:
   - Queries like `GET /places?search=Cuttack` or `GET /places?category=waterfall` exclusively return leisure, cultural, nature, and heritage attractions.
   - Non-leisure categories (`hospital`, `emergency_facility`, `transit_hub`) are strictly excluded by default.
2. **Explicit Medical Query Mode (`is_medical=True` or `category=hospital`)**:
   - Queries targeting medical facilities (e.g. `GET /places?search=AIIMS&is_medical=true` or search term `hospital` / `medical`) activate medical facility retrieval.
3. **Explicit Transit Query Mode (`is_transit=True` or `category=transit_hub`)**:
   - Queries targeting transport hubs (e.g. `GET /places?search=Airport&is_transit=true` or search term `airport` / `railway station`) activate transit hub retrieval.

---

## 5. Location-Aware Proximity Retrieval & Privacy

- **Geospatial Proximity**: Supports `near_lat`, `near_lon`, and `radius_km` (default 25km, max 200km) using PostGIS spherical distance calculations.
- **Strict Privacy Invariant**:
  - User live GPS coordinates are **never stored** in the database, **never logged** to server files, and **never sent** to external AI providers.
  - Coordinate inputs are treated as ephemeral query-time parameters only.

---

## 6. Architecture & File Modification Blueprint

### 6.1 Backend Modules to Create:
1. `backend/app/services/search/search_models.py` — Typed search criteria, pagination parameters, and search result schemas.
2. `backend/app/services/search/search_normalizer.py` — Text normalization, punctuation removal, tokenization, and canonical alias mapping.
3. `backend/app/services/search/search_ranker.py` — Deterministic weighted ranking formula and candidate scoring.
4. `backend/app/services/search/search_service.py` — Full-featured Search & Knowledge Retrieval Service with database execution, PostGIS proximity queries, and AI retrieval interfaces.
5. `backend/app/services/search/__init__.py` — Module exports.

### 6.2 Existing Files to Upgrade:
1. `backend/app/api/places_routes.py` — Delegate search and filtering to `SearchService`, support pagination parameters (`limit`, `offset`), and return metadata headers while preserving backward compatibility.
2. `frontend/src/api/contracts.ts` & `frontend/src/types/api.ts` — Expand `PlaceListParams` with `district`, `region`, `interest`, `verification_status`, `is_medical`, `is_transit`, `limit`, `offset`.
3. `frontend/src/api/client.ts` — Update `listPlaces` to pass all query parameters.
4. `frontend/src/components/home/DestinationsPage.tsx` — Integrate debounced search, loading/empty/error indicators, and clean category filtering.
5. `backend/tests/test_search_service.py` — Comprehensive unit test suite covering ranking, filters, aliases, medical/transit isolation, PostGIS proximity, and pagination.
6. `frontend/tests/destinations_search_flow.test.tsx` — Frontend component tests verifying search debounce, error handling, and domain separation.

---

## 7. Quality Gate Checklist for Step 5
- [ ] `scripts/audit_data_quality.py` passes with 0 FAIL, 0 WARNING.
- [ ] `pytest backend/tests` passes all tests with 100% green status.
- [ ] `npm --prefix frontend test -- --run` passes all vitest suites.
- [ ] `npm --prefix frontend run build` builds cleanly without TypeScript or bundler errors.
- [ ] `python -m compileall backend scripts` passes with 0 errors.
- [ ] `git diff --check` passes with 0 whitespace errors.
- [ ] `doctor.ps1` passes 11/11 diagnostics (`RESULT: READY`).
- [ ] Full documentation produced in `docs/PHASE11_STEP5_SEARCH_KNOWLEDGE.md` and ledgers updated.
