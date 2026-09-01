# O-Travelz — Phase 11 Step 1 Audit & Discovery
**Whole-Codebase Learning, Capability Audit & Data Foundation Discovery**

**Date**: August 22, 2026  
**Auditor**: Lead Systems & Core Engineer (Smarak)  
**Status**: Comprehensive Baseline Discovery Complete  

---

## A. Current System Architecture

O-Travelz is currently organized as a decoupled, deterministic, three-tier architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│             Frontend SPA (React 18 + TypeScript + Vite)                │
│  ├── Navigation & URL Sync (#discover, #destinations, #map, #plan,     │
│  │   #saved, #privacy, #terms, #contact)                               │
│  ├── Discover Hub & Curated Detours (OdishaHero, HomeSections)         │
│  ├── Destinations Catalog (Search, 13 Categories, 12 Themes, Filters)  │
│  ├── Interactive Map Canvas (Code-Split Leaflet Bundle, PostGIS pins)  │
│  ├── Plan Trip (Deterministic Itinerary Form & Grounded AI Copilot)    │
│  ├── Cumulative Transit Timeline (Arrivals, Departures, Stop Durations)│
│  ├── Live Weather Widget (Open-Meteo Normalization & Advice)           │
│  ├── Saved Places & Trip History (Persistent LocalStorage Archive)     │
│  └── DPDP Act 2023 Consent Gate & Legal Pages                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Typed JSON / REST HTTP
┌───────────────────────────────────▼────────────────────────────────────┐
│                         FastAPI Backend (Python 3.12)                  │
│  ├── GET /health (Liveness Health Check)                               │
│  ├── GET /places & GET /places/{id} (Places Discovery & Details)       │
│  ├── POST /itinerary/plan (Deterministic Ranking & Sequencing Engine)  │
│  ├── POST /ai/plan (Grounded Intent Parsing & Tool Orchestrator)       │
│  ├── POST /map/v1/projection (PostGIS Feature & Hop Geometry)          │
│  ├── POST /transport/hop (Multimodal Transport Router)                 │
│  ├── GET /weather/current & /weather/forecast (Open-Meteo Adapter)    │
│  └── GET /static/images/* & /api/v1/images/* (WebP Image Proxy)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQLAlchemy 2.0 + GeoAlchemy2
┌───────────────────────────────────▼────────────────────────────────────┐
│                    PostgreSQL 16 + PostGIS 3.4                         │
│  ├── places (81 Canonical Places, WGS84 Point Geometry, Districts)     │
│  ├── categories (13 Physical Categories)                               │
│  ├── interests (12 Normalized Traveler Themes)                         │
│  ├── place_interests (206 M:N Associations)                            │
│  ├── place_images (50 Synchronized WebP Photography Records)           │
│  └── transport_stops, transport_routes, transport_fares                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## B. Actual Current Metrics

These metrics were measured directly from the active PostgreSQL 16 + PostGIS database container (`infra-db-1`) and authoritative data files (`data/places/*.json`):

| Metric | Measured Value | Implementation Status |
| :--- | :--- | :--- |
| **Total Canonical Places** | **81** | `data/places/places.json` |
| **Districts Represented in Data** | **13** / 30 | 17 districts have 0 canonical destinations |
| **Physical Categories** | **13** | `data/places/categories.json` |
| **Traveler Interests (Themes)** | **12** | `data/places/interests.json` |
| **Place-Interest (M:N) Associations** | **206** | `place_interests` table / JSON |
| **Places with Valid WGS84 Coordinates** | **81** / 81 (100%) | Verified `POINT(lon lat)` SRID 4326 |
| **Places with Ratings** | **0** / 81 (0%) | No ratings stored |
| **Places with Rating Source** | **0** / 81 (0%) | No rating source stored |
| **Places with Opening Hours** | **0** / 81 (0%) | All `opening_hours` are null |
| **Places with Opening Hours Source** | **0** / 81 (0%) | No hours source stored |
| **Places with Provenance (source)** | **81** / 81 (100%) | ASI, Odisha Tourism, UNESCO, district portals |
| **Medical Facilities** | **0** / 81 (0%) | Zero hospitals / emergency facilities |
| **Transit Hubs (as canonical places)** | **0** / 81 (0%) | Zero airports / railway stations in places |
| **Synchronized Place Images** | **50** / 81 | Verified WebP assets on disk |
| **Backend Test Suite Pass Rate** | **336 passed / 2 deselected** | `pytest backend/tests` (23.02s) |
| **Frontend Test Suite Pass Rate** | **290 passed / 5 skipped** | `vitest run` (5.88s) |
| **System Diagnostics Doctor** | **11 / 11 PASS** | `.\doctor.ps1` (`RESULT: READY`) |

---

## C. Capability Matrix (34 Dimensions)

| # | Capability | Classification | Affected Files | Root Cause / Status | Complexity | Regression Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Destination discovery** | **WORKING** | `DestinationsPage.tsx`, `usePlaces.ts`, `places_routes.py` | Full client-side catalog + backend API loading | Low | Low |
| 2 | **Destination search** | **PARTIALLY WORKING** | `DestinationsPage.tsx`, `places_routes.py` | Client-side filter on in-memory array; backend search is simple ILIKE `%term%` on name/desc without typo-tolerance or ranking | Medium | Low |
| 3 | **District filtering** | **WORKING** | `DestinationsPage.tsx`, `regionUtils.ts`, `places_routes.py` | Works across the 13 populated districts; 17 districts return empty | Low | Low |
| 4 | **Category filtering** | **WORKING** | `DestinationsPage.tsx`, `categories.json` | Exact category match across 13 physical categories | Low | Low |
| 5 | **Interest filtering** | **WORKING** | `DestinationsPage.tsx`, `interests.json` | Exact match against M:N place interests | Low | Low |
| 6 | **Interactive Map** | **WORKING** | `MapView.tsx`, `MapDrawer.tsx`, `map_routes.py` | Leaflet lazy-loaded bundle with PostGIS projection | Medium | Medium |
| 7 | **Map markers** | **WORKING** | `MapView.tsx`, `map_projection.py` | PostGIS lat/lon rendered with category color icons | Low | Low |
| 8 | **Map location updates** | **WORKING** | `MapView.tsx`, `useGeolocation.ts` | Bounding box auto-pans when pins change | Low | Low |
| 9 | **Live location** | **WORKING** | `TopNav.tsx`, `useGeolocation.ts`, `LocationPermissionModal.tsx` | 4 states (`granted`, `denied`, `loading`, `not_granted`), client-only | Low | Low |
| 10 | **Location permission** | **WORKING** | `LocationPermissionModal.tsx` | 2-step DPDP-compliant modal before browser prompt | Low | Low |
| 11 | **Location disable/off** | **WORKING** | `useGeolocation.ts` | Reset state clears position without persistence | Low | Low |
| 12 | **User-selected city** | **PARTIALLY WORKING** | `TopNav.tsx`, `ItineraryPlannerPage.tsx` | Hardcoded 8 hubs dropdown; defaults to Bhubaneswar; no custom district selection | Low | Low |
| 13 | **Weather** | **WORKING** | `adapter.py`, `WeatherCard.tsx`, `useWeather.ts` | Open-Meteo real-time weather with day/night adaptive theme | Low | Low |
| 14 | **Itinerary planning** | **WORKING** | `ConstraintForm.tsx`, `engine.py`, `generator.py` | Deterministic ranking, max 3 stops/day, transport-aware | Medium | High |
| 15 | **Fair trip planning** | **WORKING** | `service.py` (ranking) | Exact interest relevance + stable tie-breaking | Low | Medium |
| 16 | **Schedule optimization**| **WORKING** | `timelineService.ts` | Cumulative timeline calculation (arrival, duration, departure) | Low | Low |
| 17 | **Transit** | **PARTIALLY WORKING** | `TransportHopCard.tsx`, `service.py` | Displays walking/road/bus hops; transit details are inline; some users report navigation jumping to map | Medium | Medium |
| 18 | **Medical facilities** | **MISSING** | `data/places/`, `places_routes.py` | 0 medical records in dataset; no specialized emergency schema | Medium | Low |
| 19 | **Image system** | **WORKING** | `imageService.ts`, `imageAdapter.ts`, `image_routes.py` | WebP proxy + 1-to-1 place mapping + vector category fallback | Low | Low |
| 20 | **Ratings** | **MISSING** | `places.json`, `Place.py` | 0 ratings stored; schema has no rating columns | Low | Low |
| 21 | **Opening hours** | **MISSING** | `places.json`, `Place.py` | Field exists in DB as JSON but 100% records have `null` | Low | Low |
| 22 | **Crowd information** | **MISSING** | N/A | Not modeled or verified in dataset | High | Low |
| 23 | **Saved places** | **WORKING** | `useSavedPlaces.ts`, `SavedPlacesPage.tsx` | LocalStorage persistence with defensive fallback | Low | Low |
| 24 | **AI copilot** | **WORKING** | `orchestrator.py`, `grounding.py`, `model.py` | `RuleBasedModelAdapter` enforces deterministic tools; zero hallucination | Medium | High |
| 25 | **AI search** | **MISSING** | `ai/tools/`, `places_routes.py` | AI only parses intent to planning tools, cannot search knowledge base dynamically | High | Medium |
| 26 | **AI itinerary generation**| **WORKING** | `orchestrator.py`, `ai_routes.py` | Calls deterministic `POST /itinerary/plan` under the hood | Medium | Medium |
| 27 | **Multilingual AI** | **MISSING** | `model.py` | English-only keyword regex; no Odia/Hindi parsing | High | Medium |
| 28 | **Terms/Privacy consent**| **WORKING** | `TermsConsentGate.tsx`, `useTermsConsent.ts` | First-launch blocking modal (`CURRENT_TERMS_VERSION`) | Low | Low |
| 29 | **Grievance/contact** | **PARTIALLY WORKING** | `ContactGrievancePage.tsx` | UI is complete, but submission is mock/client-side only | Low | Low |
| 30 | **Performance** | **WORKING** | `vite.config.ts`, `places_routes.py` | Leaflet code-split; backend queries fast for 81 places | Medium | Low |
| 31 | **Mobile UX** | **WORKING** | `MobileDrawer.tsx`, `FloatingNavigationDock.tsx` | Responsive drawer + touch dock navigation | Low | Low |
| 32 | **Accessibility** | **WORKING** | `TopNav.tsx`, `WeatherCard.tsx` | High-contrast dark tokens, ARIA labels, semantic markup | Low | Low |
| 33 | **Error handling** | **WORKING** | `ErrorAlert.tsx`, `places_routes.py` | Typed error responses and truthful empty/fallback states | Low | Low |
| 34 | **Production deployment** | **WORKING** | `docs/DEPLOYMENT.md`, `Dockerfile` | Render/Docker containerized specification ready | Low | Low |

---

## D. Whole-Odisha Data Coverage Matrix (30 Districts)

| # | District | Travel Region | Current Places Count | Current Data Status | Key Destination Gaps to Fill in Phase 11 |
|---|---|---|:---:|---|---|
| 1 | **Angul** | Cuttack & Mahanadi | **0** | **MISSING** | Satkosia Gorge Sanctuary, Tikarpada, Rengali Dam |
| 2 | **Balangir** | Sambalpur & Western Odisha | **0** | **MISSING** | Harishankar Temple & Falls, Ranipur Jharial 64 Yogini |
| 3 | **Balasore** | Northern Odisha & Wildlife | **1** | Sparse | Chandipur Beach (Present); Gaps: Talasari Beach, Panchalingeswar |
| 4 | **Bargarh** | Sambalpur & Western Odisha | **1** | Sparse | Debrigarh (Present); Gaps: Nrusinghanath Temple, Gandhamardan |
| 5 | **Bhadrak** | Northern Odisha & Wildlife | **0** | **MISSING** | Akhandalamani Temple (Aradi), Dhamra Port, Chandbali |
| 6 | **Boudh** | Kandhamal & Southern Hills | **0** | **MISSING** | Boudh Buddhist Statues, Rameswar Temple |
| 7 | **Cuttack** | Cuttack & Mahanadi | **6** | Moderate | Barabati Fort, Cuttack Chandi, Netaji Museum, Maritime Museum |
| 8 | **Deogarh** | Sambalpur & Western Odisha | **0** | **MISSING** | Pradhanpat Waterfall, Kailash Palace |
| 9 | **Dhenkanal** | Cuttack & Mahanadi | **0** | **MISSING** | Kapilash Temple & Sanctuary, Joranda Gadis (Mahima Dharma) |
| 10 | **Gajapati** | Chilika & Southern Coast | **0** | **MISSING** | Mahendragiri Peak, Khasada Waterfall, Gandahati Falls |
| 11 | **Ganjam** | Chilika & Southern Coast | **2** | Sparse | Gopalpur Beach, Tampara Lake; Gaps: Tara Tarini Temple, Budhakhol |
| 12 | **Jagatsinghpur** | Cuttack & Mahanadi | **0** | **MISSING** | Maa Sarala Temple (Jhankad), Paradip Sea Beach & Port |
| 13 | **Jajpur** | Cuttack & Mahanadi | **0** | **MISSING** | Biraja Temple (Shakti Peetha), Ratnagiri & Udayagiri Buddhist Ruins |
| 14 | **Jharsuguda** | Sambalpur & Western Odisha | **0** | **MISSING** | Koilighugar Waterfall, Bikramkhol Rock Art, Jharsuguda Airport |
| 15 | **Kalahandi** | Koraput & Tribal Highlands | **0** | **MISSING** | Phurlijharan Waterfall, Asurgarh Fort, Gudahandi Caves |
| 16 | **Kandhamal** | Kandhamal & Southern Hills | **4** | Moderate | Daringbadi, Coffee Gardens, Midubanda Falls, Belghar Camp |
| 17 | **Kendrapara** | Northern Odisha & Wildlife | **1** | Sparse | Bhitarkanika National Park; Gaps: Baladevjew Temple |
| 18 | **Keonjhar** | Northern Odisha & Wildlife | **0** | **MISSING** | Sanaghagara Falls, Badaghagara Falls, Khandadhar Keonjhar, Gonasika |
| 19 | **Khordha** | Bhubaneswar & Central | **39** | Dense | Lingaraj, Mukteswar, Dhauli, Khandagiri, Museum, Nandankanan |
| 20 | **Koraput** | Koraput & Tribal Highlands | **5** | Moderate | Gupteswar Cave, Duduma Falls, Deomali Peak, Tribal Museum, Kolab |
| 21 | **Malkangiri** | Koraput & Tribal Highlands | **0** | **MISSING** | Balimela Dam, Satiguda Dam, Bonda Hills Heritage |
| 22 | **Mayurbhanj** | Northern Odisha & Wildlife | **2** | Sparse | Similipal National Park, Barehipani & Joranda Falls; Gaps: Khiching |
| 23 | **Nabarangpur** | Koraput & Tribal Highlands | **0** | **MISSING** | Shahid Minar Papadahandi, Chandandhara Waterfall |
| 24 | **Nayagarh** | Bhubaneswar & Central | **0** | **MISSING** | Kantilo Nilamadhaba Temple, Sarankul Ladubaba Temple |
| 25 | **Nuapada** | Sambalpur & Western Odisha | **0** | **MISSING** | Patora Dam (Yogeswar Temple), Maraguda Valley Ruins |
| 26 | **Puri** | Puri & Coastal / Konark | **13** | Dense | Jagannath Temple, Golden Beach, Swargadwar, Konark, Chilika Satapada |
| 27 | **Rayagada** | Koraput & Tribal Highlands | **1** | Sparse | Maa Majhigouri Temple; Gaps: Chatikona Falls, Hanging Bridge |
| 28 | **Sambalpur** | Sambalpur & Western Odisha | **3** | Moderate | Samaleswari Temple, Hirakud Dam, Huma Leaning Temple |
| 29 | **Subarnapur** | Sambalpur & Western Odisha | **0** | **MISSING** | Sureswari Temple, Patali Srikhetra, Subarnameru Temple |
| 30 | **Sundargarh** | Rourkela & Sundargarh | **3** | Moderate | Hanuman Vatika, Mandira Dam, Khandadhar Falls Sundargarh |

---

## E. Data Model Gaps

### What We Have
- `Place`: `id` (UUID), `research_id` (string), `name` (string), `category_id` (FK), `location` (`Geography(Point, 4326)`), `description` (string), `opening_hours` (JSON), `avg_visit_minutes` (int), `price_tier` (string), `source` (string), `verified_at` (datetime), `source_provenance_note` (string), `coordinate_verification` (string), `coordinate_audit_status` (string), `audit_status` (string), `district` (string).
- `Category`: `id`, `name`, `display_name`, `description`.
- `Interest`: `id`, `name`, `display_name`, `description`.
- `PlaceInterest`: `id`, `place_id` (FK), `interest_id` (FK).
- `PlaceImage`: `id`, `place_id` (FK), `storage_key`, `url`, `image_type`, `sort_order`, `caption`, `is_primary`.

### What We Need (Schema Additions in Migration `0008`)
1. **Rating & Feedback**: `rating` (`Float`, nullable), `rating_count` (`Integer`, nullable), `rating_source` (`String`, nullable).
2. **Operational Hours Provenance**: `opening_hours_source` (`String`, nullable).
3. **Structured Provenance**: `source_url` (`String`, nullable), `verification_status` (`String`, nullable: `VERIFIED`, `UNVERIFIED`, `UNAVAILABLE`).
4. **Emergency & Medical Metadata**: `contact_phone` (`String`, nullable), `emergency_phone` (`String`, nullable), `address` (`String`, nullable).
5. **Physical Categories Expansion**: Add `hospital`, `emergency_facility`, `transit_hub` to `categories.json`.

### What Should Be Optional
- Ratings, opening hours, contact phones must be nullable so unverified data is never fabricated.
- If a hospital's emergency helpline is unknown, it remains `null` rather than a fake generic number.

### What Should Be Normalized
- Categories (1:N) and Interests (M:N) remain properly normalized.
- Districts are validated against the authoritative 30-district set (`ODISHA_DISTRICTS`).
- Regions are deterministically derived via `get_region_for_place(district, place_id)`.

### What Should NOT Be Stored
- Live GPS user tracks (privacy guarantee under DPDP Act 2023).
- Ephemeral crowd levels without official sensor integration.

---

## F. Search Architecture Findings

### Complete Path Trace
1. **User Input**: Traveler types `"Daringbadi"` or `"Temple"` or `"Waterfall"` in `DestinationsPage` search input.
2. **Frontend State**: `searchQuery` state in `DestinationsPage.tsx` filters `places` in memory (instant responsive filter across `name`, `description`, `region`, `category`, `interests`).
3. **API Client**: `apiClient.listPlaces({ search, district, category, interest, region })` calls `GET /places?...`.
4. **Backend Route**: `backend/app/api/places_routes.py` constructs SQLAlchemy query with `.filter(Place.name.ilike(f"%{term}%") | Place.description.ilike(f"%{term}%"))`.
5. **Database Query**: Executed against PostgreSQL `places` table with `joinedload` on category and interest associations.
6. **Response Serialization**: Pydantic `PlaceDetailResponse` list returned with 200 OK.
7. **UI Render**: `DestinationsPage` updates rendered destination cards.

### Deficiencies Identified
- Backend search currently only matches `name` and `description`; does not search `district`, `address`, or multi-word token combinations.
- No database index on `places.district` or `places.name` in PostgreSQL schema.
- No pagination parameters (`limit`, `offset`) on `GET /places`, meaning if places grow to 500+, the entire collection is returned.

---

## G. Map + Transit Findings

### Investigation of "Transit shouldn't take us to map"
- **Current Behavior**: In `ItineraryPlannerPage.tsx`, transport hops are rendered inline as `TransportHopCard` inside each day section. However, clicking `"Explore on Map"` from `PlaceDetailsModal` or certain header actions switched the primary application tab from `#plan` to `#map`.
- **Finding**: Users expect transit details (walking directions, bus numbers, estimated duration) to remain **inline inside the itinerary timeline** without violently navigating away to the map canvas unless explicitly opening a split/drawer view.
- **Recommendation**: Keep transit information fully self-contained inside `TransportHopCard` and `TransitTimeline`. Map view remains an auxiliary projection rather than a forced redirect.

---

## H. Weather Findings

### Investigation of "Midnight rendered as Sunny"
- **Root Cause Analysis**:
  1. Open-Meteo provides `current.is_day` (1 for day, 0 for night).
  2. In `backend/app/services/weather/adapter.py`, `is_day_val = int(is_day_raw) if is_day_raw is not None else 1`. If the API returned `None` or in fallback mode, it defaulted to `1` (Day).
  3. In `frontend/src/components/weather/WeatherCard.tsx`, `const isDay = currentObs?.is_day === 0 ? false : true;`. If `is_day` was null or undefined in offline/fallback state, `isDay` evaluated to `true`, picking the daytime "Clear & Sunny" theme instead of "Clear Night".
  4. In `frontend/src/utils/weatherNormalizer.ts`, daytime clear defaults to `"Clear & Sunny"` and `AnimatedSun`.
- **Verdict**: Provider (Open-Meteo) itself is accurate and sufficient. The issue was purely defensive fallback handling when `is_day` is null or when the local client time is night but the fallback defaulted to day.
- **Resolution**: Use local traveler timestamp (`new Date().getHours() < 6 || >= 18`) as fallback when `is_day` is unavailable from provider.

---

## I. AI Architecture Findings

### Current State
- `RuleBasedModelAdapter` in `backend/app/ai/model.py` parses user messages using strict regular expressions to extract `days`, `interests`, `start`, `dates`.
- It invokes approved deterministic tools (`build_itinerary`) which call `services.itinerary.service.plan_itinerary`.
- Grounding context quarantine ensures zero LLM hallucinations: the AI explanation only contains claims returned by the deterministic tool.

### Future Architecture for Whole-Odisha AI + Search + Chatbot
```
User Prompt
    │
    ▼
AI Orchestrator (Intent Classifier & Entity Extractor)
    │
    ├── Direct Place Search / Knowledge Q&A ──► Odisha Knowledge Base / Places API
    ├── Weather Query ────────────────────────► Weather Service
    ├── Transit / Distance Query ─────────────► Transport Graph Router
    └── Multi-Day Trip Planning ──────────────► Deterministic Itinerary Engine
    │
    ▼
Grounded Context Formatter & Explanation Renderer
    │
    ▼
Strictly Verified AI Response
```
- **Model Provider Integration**: Architecture is designed with provider-neutral `ModelAdapter` protocol, allowing seamless swapping between `RuleBasedModelAdapter`, Azure OpenAI, Google Gemini, or local LLMs without modifying core business logic.

---

## J. Live Location Findings

- **Privacy Invariants**: Coordinates are **never** stored in the database, cookies, or backend server logs.
- **Current Flow**:
  1. Header shows persistent status control with 4 states (`Enable Location`, `Finding your location…`, `LIVE Location · Hub`, `Location Blocked`).
  2. Clicking trigger opens `LocationPermissionModal` explaining why location is requested under DPDP Act 2023.
  3. User clicking `"Allow Access"` triggers `navigator.geolocation.getCurrentPosition`.
  4. Browser coordinates resolve closest Odisha hub for local weather and itinerary starting point.
  5. User can disable location at any time, returning to manual hub selection.

---

## K. City Selection Findings

### Current Traces of Default "Bhubaneswar"
1. `TopNav.tsx`: Default `selectedLocation = "Bhubaneswar"`.
2. `ConstraintForm.tsx`: Default start origin = `"Bhubaneswar"`.
3. `useWeather.ts`: Default location = `"Bhubaneswar"`.
4. `usePlaces.ts`: Region fallback defaults to `"Bhubaneswar & Central"`.
5. `places_routes.py`: Fallback region = `"Bhubaneswar & Central"`.

### Recommended Clean State Model
- Implement a centralized `TravelerLocationContext`:
  - `mode`: `"manual_hub"` | `"manual_district"` | `"live_geolocation"` | `"none"`
  - `selectedHub`: string (e.g. "Puri", "Sambalpur", "Koraput", "Bhubaneswar")
  - `selectedDistrict`: string (any of the 30 districts)
  - `coordinates`: `{ lat, lon }` (ephemeral client state only)

---

## L. Medical + Transit Findings

### Medical Data Architecture
- **Distinction**: Medical facilities must **not** be ranked as leisure tourist attractions.
- **Classification**:
  - Entity types: `hospital`, `government_hospital`, `medical_college`, `emergency_facility`, `diagnostic_center`.
  - Verification Status: Explicitly marked `VERIFIED`, `UNVERIFIED`, or `UNAVAILABLE`.
  - Must include: `emergency_phone`, `contact_phone`, `address`, `district`, `coordinates`.
- **Top Medical Institutions to Ingest**:
  - AIIMS Bhubaneswar, SCB Medical College Cuttack, MKCG Medical College Berhampur, VIMSAR Burla (Sambalpur), Capital Hospital Bhubaneswar, Ispat General Hospital (IGH) Rourkela, District Headquarter Hospitals (DHH) across all 30 districts.

### Transit Hubs Architecture
- **Classification**: `transit_hub` category with subtypes: `airport`, `railway_station`, `bus_terminal` (ISBT).
- **Top Transit Hubs to Ingest**:
  - Biju Patnaik International Airport (Bhubaneswar), Veer Surendra Sai Airport (Jharsuguda), Rourkela Airport.
  - Bhubaneswar Railway Station, Cuttack Junction, Puri Railway Station, Berhampur Railway Station, Sambalpur Junction, Rourkela Junction, Balasore Station, Koraput Station.
  - Baramunda ISBT (Bhubaneswar), Badambadi Bus Stand (Cuttack).

---

## M. Brand / Algoryxz Audit

### Current Brand Elements
- **App Name**: O-Travelz (`safe • secure • smart`).
- **Footer**: `Crafted by Algoryxz for travelers across Odisha`.
- **Legal & Privacy**: `Data Protection / Grievance Officer: Punam & Algoryxz Team`.
- **Recommended Additions**:
  - Add subtle "Powered by Algoryxz Intelligent Travel Systems" in `SettingsModal` / About tab and footer metadata without intrusive advertising.

---

## N. Legal & Grievance Findings

- **DPDP Act 2023 Compliance**: Consent gate is locked to `CURRENT_TERMS_VERSION = "2026-08-21-v1"`.
- **Contact Channel**: Email `grievance@o-travelz.in` is listed on privacy and grievance pages.
- **Form Submission**: `ContactGrievancePage` currently sets client-side `submitted: true`. In production, this can be linked to a webhook or logged safely.

---

## O. Performance Findings

- **Bundle Code-Splitting**: Verified in Vite build — `leaflet-vendor` (149 kB), `places-catalog` (253 kB), and `MapView` (34 kB) are code-split and loaded only when requested.
- **Database Scaling**: With 81 places, sequential scans take < 2ms. When dataset expands to 200+ places across 30 districts:
  - Add B-Tree indexes on `places(district)`, `places(category_id)`, `places(name)`.
  - Add pagination (`limit`, `offset`) to `GET /places`.

---

## P. Production Deployment Findings

- **Build Pipeline**: Verified clean `npm --prefix frontend run build` (9.48s) and `python -m compileall backend scripts` (0 errors).
- **Infrastructure**: Containerized Docker and Render specifications in `docs/DEPLOYMENT.md` are completely valid and verified.
- **Environment**: Backend binds to `$PORT` or 8000; CORS parses comma-separated origins; zero secrets committed.

---

## Q. Prioritized Backlog

### P0 — Core Data & Knowledge Foundation (Phase 11 Target)
1. **Schema Migration `0008`**: Add optional `rating`, `rating_source`, `opening_hours_source`, `source_url`, `verification_status`, `contact_phone`, `emergency_phone`, `address`, and indexes on `district` and `name`.
2. **Whole-Odisha Dataset Expansion**: Expand `data/places/places.json` to cover **all 30 districts** with 160+ verified records (tourist, spiritual, nature, waterfalls, beaches, heritage).
3. **Medical Facilities Ingestion**: Add verified Tier-1 hospitals, medical colleges, and DHH facilities with authentic emergency numbers across Odisha.
4. **Transit Hubs Ingestion**: Add major airports, railway stations, and ISBT terminals with WGS84 coordinates.
5. **Data Quality Framework**: Reusable audit script `scripts/audit_data_quality.py` and test suite `test_data_quality_framework.py`.
6. **Search & API Enhancement**: Multi-field query search (name, district, category, theme, description) and backward-compatible pagination on `GET /places`.

### P1 — UI & Scalability Enhancements
1. **Dynamic Frontend Region & Hub Scaling**: Update `TopNav` hub selector and `DestinationsPage` filters to support all 30 districts dynamically.
2. **Weather Night Fallback**: Fix midnight fallback handling when `is_day` is null.
3. **Transit Inline Focus**: Ensure transit hop interactions remain inside the itinerary view without jumping to map.

### P2 — Future Expansion (Phase 12+)
1. **Multilingual AI Intent Parsing** (Odia, Hindi).
2. **External Model Provider Integration** (Azure OpenAI / Gemini via `ModelAdapter`).
3. **Automated Grievance Webhook Backend Handler**.

---

## R. Recommended Phase Sequence

```
┌────────────────────────────────────────────────────────┐
│ Phase 11 Step 1 (COMPLETED)                            │
│ Whole-Codebase Learning, Audit & Discovery Report      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 11 Step 2 (NEXT)                                 │
│ Database Schema Migration 0008 + Model Enhancements    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 11 Step 3                                        │
│ Reusable Data Quality & Validation Framework Tooling   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 11 Step 4                                        │
│ 30-District Odisha Dataset + Medical + Transit Ingest  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 11 Step 5                                        │
│ Search Layer & Discovery API Scalability Upgrades      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 11 Step 6                                        │
│ Full-Stack Test, Build & Quality Gate Verification     │
└────────────────────────────────────────────────────────┘
```
