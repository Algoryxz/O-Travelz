# O-Travelz Phase 11 Step 5 — Whole-Odisha Search, Knowledge Retrieval & Data-Access Layer Report

**Author**: Systems, AI Grounding & Geospatial Core Team (Smarak)  
**Date**: August 22, 2026  
**Status**: COMPLETE — PASS  

---

## 1. Executive Summary

Phase 11 Step 5 implemented the production **Search & Structured Knowledge Retrieval Layer** across the 161-place, 30-district canonical Odisha knowledge base.

This layer replaces naive SQL substring querying with an 8-tier deterministic relevance ranker, verified local alias resolution (e.g. `BBI`, `BBS`, `Silver City`, `Jagannath Dham`), domain separation between tourist attractions, emergency healthcare (`hospital`), and transit hubs (`transit_hub`), geospatial proximity filtering (`near_lat`, `near_lon`, `radius_km`), pagination metadata (`X-Total-Count`), and an AI-ready structured knowledge retrieval interface.

---

## 2. Architecture & Service Design

The search and knowledge access layer is modularized under `backend/app/services/search/`:

```
backend/app/services/search/
├── __init__.py               # Public module exports
├── search_models.py          # SearchQueryParams, ScoredPlaceCandidate, CompactKnowledgeRecord, SearchPageResponse
├── search_normalizer.py      # Text normalization, stop-word removal, intent extraction, verified alias registry
├── search_ranker.py          # 8-tier deterministic scoring formula and candidate sorter
└── search_service.py         # SearchService engine, PostGIS proximity calculation, AI retrieval facade
```

### Key Architectural Invariants:
1. **Deterministic Scoring**: Zero non-deterministic random scoring or ungrounded generative hallucinations. All ranking scores derive mathematically from exact name matching, alias match, prefix match, token overlap, category/district match, and description relevance.
2. **Medical & Transit Isolation**: Queries for general leisure destinations (e.g. "things to do in Cuttack") do not return hospitals or transit hubs. Medical facilities and transit hubs only activate when explicitly requested (`is_medical=True`, `is_transit=True`) or when search queries contain explicit healthcare or transit terms.
3. **Location Privacy**: Ephemeral query-time coordinates (`near_lat`, `near_lon`) are never saved in database tables or sent to third-party endpoints.

---

## 3. Search Ranking Algorithm & Scoring Formula

Relevance scores are calculated deterministically across 8 weighted tiers:

$$\text{Score} = w_{\text{exact\_name}} \cdot 100 + w_{\text{alias}} \cdot 85 + w_{\text{prefix}} \cdot 70 + w_{\text{token}} \cdot 50 + w_{\text{category/district}} \cdot 35 + w_{\text{desc}} \cdot 15 + w_{\text{addr}} \cdot 10 + \text{Boost}_{\text{filters}} + \text{Boost}_{\text{proximity}}$$

### Scoring Tiers:
| Tier | Criteria | Weight | Match Reason Tag |
| :---: | :--- | :---: | :--- |
| **Tier 1** | Exact case-insensitive match on `Place.name` | **100.0** | `exact_name_match` |
| **Tier 2** | Verified alias / transport acronym match (`BBI`, `BBS`, `Silver City`) | **85.0** | `verified_alias_match` |
| **Tier 3** | Prefix match on `Place.name` | **70.0** | `name_prefix_match` |
| **Tier 4** | Word token overlap fraction in `Place.name` | **50.0 $\times \frac{N_{\text{matched}}}{N_{\text{query}}}$** | `name_token_match(m/n)` |
| **Tier 5** | Exact category, thematic interest, or district match | **35.0** | `category_match` / `district_match` |
| **Tier 6** | Substring / token match in `Place.description` | **15.0** | `description_match` |
| **Tier 7** | Substring match in `Place.address` | **10.0** | `address_match` |
| **Filter Boost** | Explicit active filter matching district/category/interest | **+20.0 per filter** | `exact_filter_*` |
| **Proximity Boost** | Great-circle distance proximity boost ($\le 100\text{km}$) | **$\max(0, 30 - 0.3 \cdot d_{\text{km}})$** | `proximity(Xkm)` |

---

## 4. Upgraded API Contracts (`GET /places`)

`GET /places` maintains **100% backward compatibility** with existing clients while exposing rich search and pagination parameters:

### Supported Query Parameters:
- `search` *(str, optional)*: Free-text search query across names, descriptions, districts, and aliases.
- `district` *(str, optional)*: Filter by any of the 30 administrative districts of Odisha.
- `region` *(str, optional)*: Filter by canonical travel region.
- `category` *(str, optional)*: Filter by physical place category (16 categories).
- `interest` *(str, optional)*: Filter by thematic traveler interest (12 interests).
- `verification_status` *(str, optional)*: Filter by verification status (`verified`).
- `is_medical` *(bool, optional)*: Filter medical and emergency healthcare facilities.
- `is_transit` *(bool, optional)*: Filter airports, railway junctions, and ISBTs.
- `near_lat` / `near_lon` *(float, optional)*: WGS84 coordinates for proximity ranking.
- `radius_km` *(float, optional)*: Proximity bounding radius (default $\infty$, max 500km).
- `limit` *(int, default 200, max 200)*: Result slice size.
- `offset` *(int, default 0)*: Result offset for pagination.

### Response Headers:
- `X-Total-Count`: Total number of matching records in the dataset before pagination.
- `X-Limit`: Active page limit.
- `X-Offset`: Active page offset.

---

## 5. Structured AI Knowledge Retrieval Interface

The future AI assistant, multi-agent planner, and conversational chatbot consume data through typed abstractions in `SearchService`, avoiding direct database dependency:

```python
# General structured search
records = SearchService.retrieve_places(db, query="Konark Sun Temple", limit=5)

# District-bounded discovery
records = SearchService.retrieve_by_district(db, district="Koraput", limit=20)

# Category-bounded discovery
records = SearchService.retrieve_by_category(db, category="waterfall", district="Keonjhar", limit=10)

# Thematic interest discovery
records = SearchService.retrieve_by_interest(db, interest="heritage", limit=15)

# Dedicated emergency healthcare retrieval
records = SearchService.retrieve_medical(db, district="Khordha", limit=5)

# Multimodal transit hub retrieval
records = SearchService.retrieve_transit(db, district="Sambalpur", limit=5)

# Location-aware proximity retrieval
records = SearchService.retrieve_near_location(db, lat=20.2961, lon=85.8245, radius_km=25.0, limit=10)
```

Each method returns a list of `CompactKnowledgeRecord` objects with clean fields (`id`, `name`, `district`, `region`, `category`, `description`, `interests`, `lat`, `lon`, `address`, `verification_status`, `source`, `is_medical`, `is_transit`, `contact_phone`, `emergency_phone`, `distance_km`).

---

## 6. Frontend Search & Discovery Enhancements

1. **`usePlaceSearch` Hook (`frontend/src/store/usePlaces.ts`)**:
   - Implements 200ms debouncing on query input to eliminate network thrashing.
   - Handles loading states, empty states, and errors with automatic fallback to bundled seed data.
2. **`ApiClient.listPlaces` (`frontend/src/api/client.ts`)**:
   - Fully serializes all 12 query parameters (`search`, `category`, `interest`, `district`, `region`, `is_medical`, `is_transit`, `near_lat`, `near_lon`, `radius_km`, `limit`, `offset`).
3. **`DestinationsPage.tsx`**:
   - Integrated search input with instant clear button, category filters, theme filters, region pills, and empty-state guidance.

---

## 7. Performance & Quality Gate Results

| Test Suite / Quality Gate | Target | Result | Status |
| :--- | :--- | :---: | :---: |
| **Data Quality Auditor** | `python scripts/audit_data_quality.py` | **0 FAIL, 0 WARNING** | **PASS** |
| **Backend Pytest** | `pytest backend/tests` (381 tests) | **379 passed, 2 deselected** | **PASS** |
| **Search Service Tests** | `pytest backend/tests/test_search_service.py` | **17 passed** | **PASS** |
| **Frontend Vitest** | `npm --prefix frontend test -- --run` (35 files) | **295 passed, 5 skipped** | **PASS** |
| **Frontend Search Test** | `vitest run tests/destinations_search_flow.test.tsx` | **5 passed** | **PASS** |
| **Frontend Production Build** | `npm --prefix frontend run build` | **Clean build in 9.68s** | **PASS** |
| **Python Syntax Check** | `python -m compileall backend scripts` | **0 errors** | **PASS** |
| **Git Diff Whitespace Check** | `git diff --check` | **0 whitespace errors** | **PASS** |
| **System Diagnostics** | `powershell -File .\doctor.ps1` | **11 / 11 PASS (`RESULT: READY`)** | **PASS** |

---

## 8. Known Limitations & Next Steps

- **Full-Text / Trigram Indexing**: The current deterministic search engine handles the 161-place dataset in under 5ms per query. For scaling beyond 10,000 places, PostgreSQL `pg_trgm` GIN indexes can be provisioned.
- **Multilingual Tokenization**: Queries are currently processed in Latin script (English / transliterated Odia). Multilingual Odia script (ଓଡ଼ିଆ) search can be attached to `SearchNormalizer` in Phase 12.
- **Recommended Next Phase**: **Phase 11 Step 6 — Grounded Odisha AI Assistant & Multilingual Retrieval Integration**.
