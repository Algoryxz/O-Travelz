# O-Travelz Project Memory

**Status**: Canonical Current-State Ledger (Phase 14 Complete Baseline — Production Readiness Verified)

This is a project-state record, not general AI memory.

---

## 1. Current Release State Summary

- **Date**: August 22, 2026
- **Current Branch**: `main`
- **Current Phase**: **PHASE 14 COMPLETE — PASS (Production Deployment Readiness & Verification — Phase 14 Baseline)**
- **Authentication & Sync Status**: `INFRASTRUCTURE VERIFIED / PRODUCTION READINESS AUDITED / CI AUTOMATED / PWA OFFLINE ACTIVE / PUBLIC DEEP-LINKING ACTIVE / CLIENT-SIDE EXPORT ACTIVE / TIMEZONE-AWARE UTC HARMONIZED / RUNTIME VALIDATED / OFFLINE FIRST PRESERVED` (Production Hardening Complete, Fail-Closed Security Validation, GitHub Actions CI Workflow, Python 3.12, Node 20, PostGIS Service Container, Alembic Migrations Gate, Google OAuth with PKCE, SHA-256 Hashed Sessions, HttpOnly Cookies, Web App Manifest, Lightweight Native Service Worker, App Shell & Image Cache, Strict API Bypass, Public Read-Only Trip Deep-Linking, Native Window Print / PDF Export, Client-Side Markdown Download, Emergency Helplines Integration, Timezone-Aware UTC Datetimes, Deterministic Timestamp Reconciliation, Runtime Payload Structural Validation, Tombstone Propagation, In-Process Rate Limiter, ₹0 Budget Ceiling Enforced)

### Verified Phase 14 Step 6 Components:
- **Production Configuration & Security Audit (`backend/app/core/config.py`, `backend/app/main.py`, `.env.example`)**: Verified `validate_production_security()` with minimum 32-char high-entropy secret enforcement, CORS credential isolation, environment variable documentation, and zero hardcoded secrets.
- **Frontend & Backend Production Readiness Verification**: Verified clean TypeScript & Vite production builds, single Alembic migration head (`0010_shared_trip_snapshots (head)`), 0 migration branches, 0 deprecated `datetime.utcnow()`, 0 `dangerouslySetInnerHTML`, 0 `eval()`, and 100% anonymous offline compatibility.

### Verified Phase 14 Step 5 Components:
- **GitHub Actions CI Workflow (`.github/workflows/ci.yml`)**: Automated pipeline on push/PR to `main` with 3 parallel jobs: `repo-integrity` (git diff formatting checks), `backend-ci` (Python 3.12, pip cache, `postgis:16-3.4` container, compileall, alembic upgrade head, full pytest + auth pytest), and `frontend-ci` (Node 20, npm cache, clean install, full Vitest suite, production Vite build).
- **CI Workflow Test Suite (`backend/tests/test_ci_workflow.py`)**: Unit test validating CI YAML syntax, triggers (`push`/`pull_request` on `main`), runner definitions (`ubuntu-latest`), tool versions (Python 3.12, Node 20), test commands, and absence of deployment steps.

### Verified Phase 14 Step 4 Components:
- **Web App Manifest & Vector Icons (`frontend/public/manifest.webmanifest`, `icon.svg`, `icon-maskable.svg`)**: Standards-compliant manifest with standalone display, dark theme `#0B1220`, and multi-resolution icons (`logo.jpeg`, `icon.svg`, `icon-maskable.svg`).
- **Lightweight Native Service Worker (`frontend/public/sw.js`)**: Versioned static (`otravelz-static-v1.0.0`) and image (`otravelz-images-v1.0.0`) caching, pre-cached application shell, size-bounded image caching (max 80 entries), stale cache eviction on activation, and strict bypass for non-GET methods, auth (`/auth/*`), cloud sync (`/api/v1/sync/*`), share snapshot mutations (`/api/v1/trips/share`), and AI conversation routes (`/ai/*`).
- **PWA Frontend Registration (`frontend/src/utils/registerServiceWorker.ts`, `frontend/src/main.tsx`, `frontend/index.html`)**: Safe client-side service worker registration with update detection and graceful fallback for unsupported environments.

### Verified Phase 14 Step 3 Components:
- **Itinerary Export Utilities (`frontend/src/utils/itineraryExport.ts`)**: `generateItineraryMarkdown` generating day-by-day markdown with stops, visit times, transit directions, constraints, and emergency numbers; `downloadItineraryMarkdown` using native `Blob` and `URL.createObjectURL`; `triggerPrintItinerary` using native `window.print()`; `generateSafeFilename` sanitizing export filenames; and `ODISHA_EMERGENCY_HELPLINES` canonical helpline registry.
- **Printable Itinerary View (`frontend/src/components/itinerary/PrintableItineraryView.tsx`)**: High-contrast, paper-optimized layout using the canonical itinerary source data with sensible day page breaks (`break-inside-avoid`, `page-break-inside-avoid`), stop timelines, connecting hops, and emergency helplines.
- **Itinerary Export Modal (`frontend/src/components/itinerary/ItineraryExportModal.tsx`)**: Modal presenting "Print / Save as PDF" and "Download Markdown (.md)" actions with trip metadata preview and ₹0 client-side security notice.
- **Print Stylesheet (`frontend/src/index.css`)**: `@media print` rules hiding interactive UI (topbar, buttons, modals, docks, map) while rendering clean black-and-white printable itinerary document.

### Verified Phase 14 Step 2 Components:
- **Shareable Trip Snapshot API & Storage (`backend/app/api/share_routes.py`, `backend/app/schemas/share.py`, `backend/app/models/session.py`)**: `POST /api/v1/trips/share` authenticated snapshot creation (20/hr/user rate limit, 50KB payload bound, 22-char unguessable token) and `GET /api/v1/trips/shared/{share_id}` public read-only retrieval without owner ID/email/session token leakage.
- **Frontend Deep Link & Public Shared Viewer (`frontend/src/store/useSharedTrip.ts`, `ShareTripModal.tsx`, `SharedItineraryPage.tsx`, `navigation.ts`)**: SPA hash route `#trip/shared/{share_id}` / `#shared/{share_id}` resolving public read-only trip snapshots, with Google sign-in prompt for anonymous sharing and 1-click link copying for authenticated users.

### Verified Phase 14 Step 1 Components:
- **Timezone-Aware UTC Datetime Modernization (`session_manager.py`, `models/session.py`, `models/user.py`, `models/place_image.py`)**: Modernized all session, user, image, and auth timestamps to Python 3.12+ compliant timezone-aware UTC (`datetime.now(timezone.utc)`), eliminating 143+ datetime deprecation warnings with 0 SQL/schema breakages.
- **Frontend Cloud Sync Runtime Structural Validation (`frontend/src/store/useCloudSync.ts`)**: Dependency-free type guards (`isValidSyncPlaceItem`, `isValidSyncTripItem`) and sanitizers (`sanitizeSyncPlaceItem`, `sanitizeSyncTripItem`) protecting local state from malformed server sync payloads.
- **Google OAuth 2.0 & OpenID Connect (`backend/app/services/auth/google_oauth.py` + `backend/app/api/auth_routes.py`)**: Production-minded OAuth flow with RFC 7636 PKCE (S256 code challenge/verifier), HMAC-SHA256 signed state/nonce cookies, tokeninfo ID token verification with claim validation, and clean logout session revocation.
- **Hashed Server Sessions & User Resolution (`backend/app/services/auth/session_manager.py`)**: `UserSession` storage storing only SHA-256 hashed session tokens, 30-day session lifetime, explicit revocation tracking, and automatic user profile synchronization keyed on Google's immutable subject (`provider_subject`).
- **Cloud Synchronization API (`backend/app/api/sync_routes.py` + `backend/app/schemas/sync.py`)**: Additive synchronization endpoints (`/api/v1/sync/saved-places`, `/api/v1/sync/trips`) enforcing user ownership through session context, batch size limits (100 places, 50 trips), trip payload size caps (50KB/trip), canonical destination validation, and sliding-window rate limiting (30 req/min/user).
- **Frontend Authentication & Reactive State (`frontend/src/store/useAuth.ts` + `frontend/src/api/client.ts`)**: Global authentication hook with session check (`GET /auth/me`), `credentials: "include"` transport, Google login redirection, and logout handling that preserves `localStorage` data for anonymous visitors.
- **Offline-First Cloud Sync Integration (`frontend/src/store/useCloudSync.ts`)**: Background synchronization with deterministic conflict resolution (`higher updated_at wins`), tombstone propagation, 429 `Retry-After` cooldown, and network online/offline listeners.
- **Auth & Sync UI (`AuthStatusButton.tsx`)**: Header status button rendering "Sign In" controls when anonymous, and user avatar, name, live sync badge, manual sync trigger, and sign-out controls when authenticated.



### Verified Implementation Components:
- **Deterministic AI Grounding Verification Layer (`backend/app/ai/grounding_verifier.py`)**: Authoritative backend fact verification checking all place names, itinerary stop sequences, transport hops, opening hour assertions, and contact numbers against canonical database records and multilingual taxonomy with zero extra LLM calls.
- **In-Process Sliding-Window AI Rate Limiter (`backend/app/ai/rate_limit.py`)**: Dual-tier sliding window rate limiting (general endpoint limit + stricter external provider limit) with structured HTTP 429 semantics and zero external infrastructure dependencies.
- **Provider Circuit Breaker & Latency Budget Protection (`backend/app/ai/circuit_breaker.py`)**: Automatic failure counting, state transitions (`CLOSED` -> `OPEN` -> `HALF_OPEN`), and instant failover to prevent upstream timeouts from degrading responsiveness.
- **Search Typo Correction & Suggestion Engine (`backend/app/services/search/search_correction.py` & `GET /places/suggestions`)**: Deterministic typo tolerance and candidate ranking resolving common tourist misspellings (`poori` -> `Puri`, `bhuvneshwar` -> `Bhubaneswar`, `konarkk` -> `Konark`) while strictly preserving leisure domain isolation.
- **Frontend Search Suggestions Integration (`DestinationsPage.tsx` & `ApiClient`)**: "Did you mean" suggestion chips rendered on zero-match searches with 1-click query application.
- **Zero-Cost Live AI Provider Smoke Test & Preflight (`backend/app/ai/provider_health.py` + `provider_smoke_test.py`)**: Developer CLI (`python -m app.ai.provider_smoke_test`) and preflight inspection engine verifying provider readiness without unauthorized network calls, uncontrolled retries, tool execution, or credential leaks.
- **Zero-Cost Multi-Provider AI Activation (`backend/app/ai/`)**: Implemented `AzureOpenAIProviderAdapter`, `GeminiProviderAdapter`, `NVIDIAProviderAdapter`, and `MultiProviderFallbackAdapter` using Python standard library `urllib` (0 vendor SDK dependencies).
- **Zero-Cost Safety Policy & Budget Guards (`backend/app/core/config.py`)**: Environment-backed settings (`ai_allow_external_provider=False`, `ai_allow_paid_provider=False`) enforcing immediate, zero-cost routing to `RuleBasedProviderAdapter` unless outbound requests are explicitly enabled.
- **Frontend Grounded AI Conversation Integration (`frontend/src/`)**: Connected frontend conversational UI to provider-neutral backend `POST /ai/converse` contract, supporting multi-turn dialogue, grounding status badges, tool invocation tags, and full backward compatibility with `POST /ai/plan`.

- **Frontend Conversation Contracts & API Client (`types/api.ts` + `api/client.ts`)**: Strongly typed definitions for `ChatRole`, `ToolCall`, `ToolResult`, `ChatMessage`, `AIConverseRequest`, and `GroundedConversationResponse`, with typed `converseWithAi()` method.
- **Multi-Turn Conversation Hook (`frontend/src/store/useAIConversation.ts`)**: Turn-based history accumulator supporting iterative trip refinement, error recovery (`retryLast`), grounding verification, and backward-compatible `sendAiPlan` adapter.
- **Conversational UI & Trust Badges (`AIConversationPanel.tsx` + `AISidebar.tsx`)**: Clear grounded badges (*"Grounded in verified O-Travelz data"*), tool activity context tags, Indic typography preservation (`font-sans`, `leading-relaxed` in English, Odia, and Hindi), and accessible actionable error states.
- **Provider-Neutral Production Infrastructure (`backend/app/ai/`)**: Strengthened `AIProviderAdapter` protocol with `get_status()` contract, `RuleBasedProviderAdapter`, `GenericHTTPProviderAdapter` (OpenAI-compatible REST client using Python standard library `urllib` with 0 vendor SDK dependencies), and `create_provider_adapter` factory supporting safe offline execution by default.
- **Environment-Backed AI Configuration (`backend/app/core/config.py`)**: Environment-backed settings (`ai_provider`, `ai_model_name`, `ai_api_key`, `ai_api_base_url`, `ai_timeout_seconds`, `ai_max_retries`) defaulting to safe offline `"mock"` mode.
- **Canonical Provider Error Model (`backend/app/ai/contracts.py`)**: `ProviderErrorCode` enum and `AIProviderError` hierarchy (`ProviderUnavailableError`, `MissingConfigurationError`, `AuthenticationError`, `ProviderTimeoutError`, `MalformedProviderResponseError`, `UnsupportedCapabilityError`, `RateLimitExceededError`) with automatic secret/credential redaction.
- **Security & Secret Masking Boundaries**: Strict rejection of arbitrary Python execution (`eval`, `exec`, `os.system`, etc.), Pydantic argument validation, oversized payload protection (>100k chars), and 0 credential exposure in status output, logs, exceptions, or API responses.
- **Multilingual Grounded AI Conversation Layer (`backend/app/ai/`)**: `GroundedConversationOrchestrator` mediating natural language dialogue in English, Odia (**ଓଡ଼ିଆ**), Hindi (**हिन्दी**), and mixed queries while strictly grounding all travel facts, itinerary items, and transport steps in verified domain services.
- **Multilingual Intent & Numerals Parser (`backend/app/ai/multilingual.py`)**: Script detection (`detect_language`), Indic numeral & word extraction (`extract_multilingual_days` for `୩`, `३`, words), multilingual traveler theme resolution (`extract_multilingual_interests`), localized city hub resolution (`resolve_multilingual_location` for `ଭୁବନେଶ୍ୱର`, `ପୁରୀ`, `କଟକ`, `ରୂପା ସହର`, `चांदी का शहर`), and localized grounded message generators.
- **Multi-Turn Conversational Refinement**: Retains structured context across conversation turns (`ChatMessage`), enabling travelers to modify durations, add themes (`"Make it more heritage focused"`, `"ଏହାକୁ ୩ ଦିନ କରନ୍ତୁ"`), and revise itineraries with zero hallucinations.
- **Provider-Neutral AI Contracts & Architecture**: Standardized `ToolDefinition` (JSON Schema compliant), `ToolCall`, `ToolResult`, `ChatMessage`, and `GroundedConversationResponse` decoupling domain logic from vendor-specific SDKs.
- **Explicit Tool Registry & Defensive Execution Boundary**: `ToolRegistry` with `BaseToolAdapter`, duplicate prevention, and `ToolExecutionBoundary` enforcing tool allowlisting, schema validation, and exception containment.
- **Unified Domain Tool Adapters (`backend/app/ai/tools/adapters.py`)**: Standardized adapters wrapping verified O-Travelz services (`search_places`, `build_itinerary`, `plan_transport_hop`, `get_provider_status`, `create_default_tool_registry`).
- **REST API Conversational Endpoints (`backend/app/api/ai_routes.py`)**: `POST /ai/plan` (backward-compatible single-turn planning) and `POST /ai/converse` (rich multi-turn conversation returning `GroundedConversationResponse`).
- **Frontend Multilingual Taxonomy & Crosswalk (`frontend/src/types/multilingualTaxonomy.ts`)**: Strongly typed records for all 30 districts, 16 physical categories, and 12 traveler interests matching backend canonical models with English, native Odia (**ଓଡ଼ିଆ**), and Hindi (**हिन्दी**) labels. Zero synthetic translation fabrication.
- **Backend-Authoritative Live Search Routing (`DestinationsPage.tsx` + `usePlaces.ts`)**: Replaced local in-memory substring filtering with debounced (200ms) live calls to `GET /places?search=...`, incorporating race-condition cancellation (`isCancelled` flag) and rendering candidates directly in backend deterministic relevance rank order.
- **Localized Discovery UX & Language Guidance (`OdishaHero.tsx` + `DestinationsPage.tsx`)**: Subtle language hints (`English · ଓଡ଼ିଆ · हिन्दी`), accessible search input labels (`aria-label="Search destinations in English, Odia, or Hindi"`), localized Odia category/interest chip annotations, `leading-normal` + `py-1.5` Indic typography preservation, and truthful empty states distinguishing active search vs active filter zero-results with recovery actions (`Clear Search`, `Reset Filters`).
- **Frontend Accessibility Hardening**: Added `aria-pressed` states on filter buttons, `role="status"` and `aria-atomic="true"` on live result counts, `aria-hidden="true"` on decorative loading spinners, semantic HTML buttons for all recovery actions, and full keyboard navigability.
- **Multilingual Knowledge Model & Taxonomy (`backend/app/data/multilingual_taxonomy.py`)**: Authoritative crosswalk for all 30 districts, 16 physical categories, 12 traveler interests, and verified cultural aliases across English, native Odia (**ଓଡ଼ିଆ** - `\u0B00-\u0B7F`), and Hindi (**हिन्दी** - `\u0900-\u097F`). Fast $O(1)$ lookup maps (`resolve_district`, `resolve_category`, `resolve_interest`, `resolve_alias`) with zero fabrication guarantees.
- **Multilingual SearchNormalizer (`backend/app/services/search/search_normalizer.py`)**: Unicode-safe text normalization preserving Odia and Devanagari Unicode blocks; multilingual functional stop-word pruning (English, Odia, Hindi); sliding window (3-gram, 2-gram, 1-gram) entity intent resolution for districts, categories, and interests; and multilingual alias expansions.
- **Multilingual SearchService (`backend/app/services/search/search_service.py`)**: Pre-resolution of localized query parameters (`district`, `category`, `interest`) to canonical English; joinedload database execution; effective intent wiring for free-text search queries; and strict domain separation between leisure attractions, emergency medical facilities (`hospital`), and transit hubs (`transit_hub`).
- **Deterministic 8-Tier SearchRanker (`backend/app/services/search/search_ranker.py`)**: Exact Name (100) > Alias (85) > Prefix (70) > Name Token (50) > Category/Interest/District (35) > Description (15/10) > Address (10) + Filter Bonuses (+20 each) + Proximity Boost (up to +30); deterministic sort key `(-score, distance_km, place.name)`.
- **Backend REST API**: FastAPI (Python 3.12) REST API at `http://127.0.0.1:8000` with Pydantic V2 typed contracts, Dijkstra transport graph router, PostGIS geospatial projector, Open-Meteo weather service, static WebP image proxy, canonical 30-district registry, and verified alias lookup (`BBI`, `BBS`, `Silver City`, `Jagannath Dham`, `ରୂପା ସହର`, `चांदी का शहर`).
- **Database**: PostgreSQL 16 + PostGIS 3.4 running in Docker (host port `5433` to avoid collision with Windows host Postgres on `5432`) with **161 canonical places** across all 30 districts, 16 physical categories (including `hospital`, `emergency_facility`, `transit_hub`), 12 normalized traveler interests, 358 Place-Interest M:N associations, and 50 synchronized database image records.
- **Data Quality & Provenance Auditor**: CLI auditor (`scripts/audit_data_quality.py`, `--json`, `--strict`) validating WGS84 coordinates against the Odisha envelope `[17.5-22.8, 81.2-87.6]`, swapped lat/lon protection, intra-district duplicate name detection, canonical identity uniqueness, strict medical emergency contact safety (zero synthetic phone fabrication), and authentic provenance.
- **Data Contract Documentation**: `docs/DATA_QUALITY.md`, `docs/PHASE11_FINAL_CLOSEOUT.md`, `docs/PHASE12_STEP1_MULTILINGUAL_KNOWLEDGE.md`, `docs/PHASE12_STEP2_MULTILINGUAL_SEARCH.md`, `docs/PHASE12_STEP3_FRONTEND_SEARCH.md`, `docs/PHASE12_STEP4_AI_TOOL_ADAPTER.md`, `docs/PHASE12_STEP5_MULTILINGUAL_GROUNDED_AI.md`, `docs/PHASE12_STEP6_AI_PROVIDER_INTEGRATION.md`, `docs/PHASE12_STEP7_FRONTEND_GROUNDED_AI.md`, `docs/PHASE12_STEP8_ZERO_COST_AI_PROVIDER_ACTIVATION.md`, and `docs/PHASE12_STEP9_PROVIDER_SMOKE_TEST.md`.

---

## 2. Canonical Dataset & Taxonomy Invariants

- **Verified Places**: **161 canonical places** with 100% verified WGS84 coordinate coverage (161/161) across **all 30 districts** of Odisha (136 tourist attractions, 13 medical facilities, 12 transit hubs).
- **Physical Categories (16)**: `temple`, `monument`, `museum`, `market`, `park`, `lake`, `beach`, `nature`, `waterfall`, `wildlife`, `planetarium`, `sports_venue`, `science_center`, `hospital`, `emergency_facility`, `transit_hub`.
- **Traveler Interests (12)**: `heritage`, `spirituality`, `architecture`, `food`, `culture`, `nature`, `beach`, `wildlife`, `waterfall`, `relaxation`, `adventure`, `shopping`.
- **Place-Interest Associations**: **358 verified M:N associations** (0 duplicate records).
- **Multilingual Coverage**: **100% verified coverage** across English, Odia (`ଓଡ଼ିଆ`), and Hindi (`हिन्दी`) for all 30 districts, 16 categories, and 12 interests across backend (`multilingual_taxonomy.py`) and frontend (`multilingualTaxonomy.ts`).
- **Zero-Fabrication Guarantee**: Zero synthetic or translated descriptions/names/phone numbers fabricated. Unknown Indic queries return truthful empty results.
- **Search Precedence**: Exact name matches > aliases > prefixes > name tokens > category/interest/district intents > descriptions > addresses.

---

## 3. Current Quality Gate & Test Evidence

- **Data Quality Audit**: **PASS (0 FAIL, 0 WARNING)** across 161 places covering all 30 districts (`python scripts/audit_data_quality.py --json`).
- **Focused Step 10 Tests**: **18 passed in 2.32s** (`pytest backend/tests/test_ai_grounding_verifier.py backend/tests/test_ai_rate_limit.py backend/tests/test_ai_latency_budget.py backend/tests/test_search_correction.py`).
- **All AI Backend Test Suites**: **175 passed in 5.12s** across 12 test files (`python -m pytest backend/tests/test_ai_*.py`).
- **Backend Pytest**: **676 passed, 2 deselected** across 47 test files (`python -m pytest backend/tests`).
- **Full Frontend Vitest Suite**: **336 passed, 5 skipped** across 39 test files (`npm --prefix frontend test`).
- **Frontend Production Build**: `npm --prefix frontend run build` completed in **9.71s** with 0 errors.
- **Python Syntax & Compilation**: `python -m compileall backend scripts` completed with 0 errors.

- **Git Diff Formatting Check**: `git diff --check` passed cleanly with 0 errors.
- **System Diagnostics**: `.\doctor.ps1` completed with 11/11 PASS (`RESULT: READY`).


---



## 4. Historical Test Baselines (For Reference)

- **Historical Release Baseline (August 20, 2026)**:
  - Backend: 324 passed / 0 failed
  - Frontend: 167 passed / 0 failed
- **Historical Post-Release Baseline (August 21, 2026 Morning)**:
  - Backend: 324 passed / 0 failed
  - Frontend: 229 passed / 0 failed
- **Phase 7 Integration Baseline (August 21, 2026 Evening)**:
  - Backend: 329 passed / 2 deselected + 2 integration passed = 331 total tests
  - Frontend: 248 passed / 0 failed across 29 test files

---

## 5. Local Runtime & Development Setup

- **PostgreSQL / PostGIS**: Docker container `infra-db-1` running PostGIS 3.4.3 on host port `5433` (mapped from container `5432` to prevent collision with Windows native PostgreSQL).
  - Connection string: `postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz`
- **FastAPI Backend**:
  ```powershell
  $env:PYTHONPATH="backend"
  .\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
  ```
- **Vite Frontend**:
  ```powershell
  npm --prefix frontend run dev
  ```
- **Database Migration & Data Seeding**:
  ```powershell
  $env:PYTHONPATH="backend"
  .\.venv\Scripts\python.exe -m alembic -c backend/alembic.ini upgrade head
  .\.venv\Scripts\python.exe scripts/import_places.py
  .\.venv\Scripts\python.exe scripts/sync_db_place_images.py
  ```

---

## 6. Canonical Demo Scenarios

1. **Scenario 1 — The Odisha Heritage Triangle**:
   - Prompt: *"Plan a 2-day heritage trip in Bhubaneswar"*
   - Result: Deterministically parsed `days=2`, `start="Bhubaneswar"`, `interests=["heritage"]`, scheduling verified stops with inter-stop transit hops and timeline schedule.
2. **Scenario 2 — Architecture & Culinary Tour**:
   - Prompt: *"Plan a 2-day architecture and heritage trip in Bhubaneswar"*
   - Result: Deterministically parsed `interests=["heritage", "architecture"]`, routing through iconic temples and authentic food precincts (Ananda Bazar, Bapuji Nagar, Salepur Rasagola).
3. **Scenario 3 — Non-Canonical Safety**:
   - Prompt: *"Plan a photography trip"*
   - Result: Non-canonical `photography` interest is safely handled via clarification without hallucination or runtime error.

---

## 7. Known Limitations

- Real-time GTFS transit vehicle telemetry is unmodeled; transport hops utilize verified static/scheduled baseline speeds.
- Administrative district boundary GIS polygons are not modeled in map canvas; long transfers are accurately labeled as `"Long Journey"`.
