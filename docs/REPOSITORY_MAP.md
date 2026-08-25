# O-Travelz Repository Map

**Status**: Canonical map of actual repository paths (Post-Phase 7 Baseline)

This document describes the repository as it exists. A path marked `TO CREATE` is
mentioned by approved project documentation but does not currently exist.

---

## Root Files and Directories

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `README.md` | Project summary and entry links | Punam | 0–7 | Stable orientation, features, setup, and test commands | Detailed implementation code | Canonical documents |
| `START_HERE.md` | Contributor onboarding | Punam | 0–7 | Reading order, workflow, team ownership, test commands | Outdated phase claims | `docs/` |
| `pytest.ini` | Pytest runner configuration | Rudra/Smarak | 0–7 | Test path, markers, pythonpath, temp isolation | Product logic | Pytest |
| `backend/` | FastAPI backend, database models, contracts, services, transport | Rudra / Smarak | 0–7 | Backend implementation, routing, ranking, AI, migrations | Frontend assets | `data/`, database, contracts |
| `frontend/` | React/TypeScript/Vite user experience SPA | Deeptiman | 0–7 | Complete frontend, components, state hooks, tests | Backend logic or DB queries | API and map contracts |
| `data/` | Verified sourced input data & photography | Akriti | 1–7 | Sourced factual places, categories, transit, images | AI-generated placeholders | Sources and import scripts |
| `docs/` | Canonical and supporting project documentation | Punam | 0–7 | Requirements, rules, architecture, phases, memory, handoffs | Application implementation | Repository and owner decisions |
| `infra/` | Local stack configuration | Rudra | 2/7 | Docker Compose configuration for PostgreSQL/PostGIS | Product logic | Database and backend |
| `scripts/` | Data import, auditing, and verification scripts | Smarak | 2–7 | Importers, photo sync, live audit scripts | UI components | `data/`, database models |

---

## Canonical Documentation

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `docs/PRD.md` | Product requirements and scope | Punam with all owners | 0–7 | Approved journeys, views, features, acceptance criteria | Implementation details | Repository audit |
| `docs/RULES.md` | Human and AI project rules | Punam | 0–7 | Scope, ownership, contracts, testing, factuality, approvals | Code or spec creep | PRD and architecture |
| `docs/ARCHITECTURE.md` | Canonical system architecture and boundaries | Punam with Smarak | 0–7 | Layers, data flows, boundaries, 30-district model | Unapproved redesign | PRD and existing contracts |
| `docs/PHASES.md` | Canonical phase order and exit gates | Punam | 0–7 | Objectives, owners, acceptance criteria, verified baselines | Feature code | Architecture and contracts |
| `docs/MEMORY.md` | Current project-state ledger | Punam | 0–7 | Current phase, status, test evidence, verified invariants | General memory or stale logs | All canonical documents |
| `docs/REPOSITORY_MAP.md` | Actual path and ownership map | Punam | 0–7 | Existing paths and structural mappings | Invented files | Actual repository tree |
| `docs/DATA_QUALITY.md` | Canonical data quality and provenance contract | Smarak | 11 | Schema validation rules, envelopes, zero-fabrication rules | Application code | PRD & Architecture |
| `docs/PHASE12_PROVIDER_DECISION.md` | Canonical AI provider decision matrix and evaluation framework | Smarak / Architecture | 12 | Provider evaluations, 10 weighted criteria, human decision record | Vendor SDK code | `backend/app/ai/` |
| `docs/PHASE12_STEP8_ZERO_COST_AI_PROVIDER_ACTIVATION.md` | Zero-cost multi-provider AI activation and production fallback contract | Smarak / Architecture | 12 | Azure/Gemini/NVIDIA adapters, zero-cost safety flags, fallback chain | Vendor SDK code | `backend/app/ai/` |
| `docs/PHASE12_STEP9_PROVIDER_SMOKE_TEST.md` | Zero-cost live AI provider smoke test and activation verification | Smarak / Architecture | 12 | Preflight health diagnostics, developer smoke test CLI, error normalization | Vendor SDK code | `backend/app/ai/` |
| `.github/workflows/ci.yml` | GitHub Actions CI workflow | Smarak / DevOps | 14 | Automated push/PR validation (git diff, backend compileall, migrations, pytest with PostGIS, frontend Vitest, Vite build) | Production deployment | GitHub Actions |

---

## Backend Subsystem (`backend/`)

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `backend/app/main.py` | FastAPI application entrypoint and health endpoint | Rudra | 0–7 | API router wiring, CORS middleware, error handlers | Direct business logic | FastAPI |
| `backend/app/core/config.py` | Environment-backed settings | Rudra / Smarak | 0–2 | Runtime configuration | Hardcoded secrets | Pydantic Settings |
| `backend/app/core/regions.py` | 30-district mapping and region resolution engine | Smarak | 6/7 | Authoritative district-to-region taxonomy | Frontend presentation | Canonical taxonomy |
| `backend/app/data/odisha_districts.py` | Canonical 30-district registry and validation helpers | Smarak | 11 | Authoritative district exports and helpers | Route handlers | `core/regions.py` |
| `backend/app/data/multilingual_taxonomy.py` | Authoritative Odia/Hindi multilingual taxonomy & crosswalk | Smarak | 12 | 30 districts, 16 categories, 12 interests, aliases | Machine translation | `core/regions.py` |
| `backend/app/db/base.py` | SQLAlchemy base and model import hub | Smarak | 0–2 | Database metadata registration | API routes | SQLAlchemy models |
| `backend/app/db/base_class.py` | Declarative Base class separation | Smarak | 11 | Pure SQLAlchemy Base | Model imports | SQLAlchemy |
| `backend/app/db/session.py` | SQLAlchemy engine and session dependency | Smarak | 0–2 | Database sessions | Business logic | Database config |
| `backend/app/models/` | SQLAlchemy ORM model files | Smarak | 0–7 | `Place`, `Category`, `Interest`, `PlaceInterest`, `PlaceImage`, `TransportStop`, `TransportRoute`, `TransportFare` | API schemas | PostgreSQL/PostGIS |
| `backend/app/schemas/` | Validated Pydantic V2 boundary schemas | Smarak / Rudra | 0–7 | API, Itinerary, Transport, AI, Map, and Weather contracts | Unvalidated payloads | Canonical contracts |
| `backend/app/api/places_routes.py` | Places discovery endpoints (`GET /places`, `GET /places/{id}`) | Smarak / Rudra | 6/7 | Listing, district/region filtering, search, place details | Direct UI rendering | SQLAlchemy models |
| `backend/app/api/itinerary_routes.py` | Itinerary planner endpoint (`POST /itinerary/plan`) | Rudra / Smarak | 4/7 | Request validation, service invocation, error formatting | AI prose | Itinerary service |
| `backend/app/api/ai_routes.py` | Grounded AI planner & conversation endpoints (`POST /ai/plan`, `POST /ai/converse`) | Smarak / Rudra | 5/12 | Intent validation and GroundedConversationOrchestrator execution | Unverified LLM calls | AI orchestrator |
| `backend/app/api/auth_routes.py` | Google OAuth & Session endpoints (`/auth/google/start`, `/auth/google/callback`, `/auth/me`, `/auth/logout`) | Smarak / Rudra | 13 | PKCE flow, signed state cookie, session issuance & revocation | Client-side secrets | Session manager |
| `backend/app/api/sync_routes.py` | Cloud Sync endpoints (`GET/POST /api/v1/sync/saved-places`, `GET/POST /api/v1/sync/trips`) | Smarak / Rudra | 13 | Additive saved place and trip synchronization, rate limiting | Public access | Session manager |
| `backend/app/api/share_routes.py` | Trip share endpoints (`POST /api/v1/trips/share`, `GET /api/v1/trips/shared/{share_id}`) | Smarak / Rudra | 14 | Immutable public trip snapshot creation and read-only retrieval | Mutating owner trips | Session manager |
| `backend/app/schemas/share.py` | Trip share Pydantic contracts | Smarak | 14 | `CreateShareTripRequest`, `CreateShareTripResponse`, `PublicSharedTripResponse` | Unvalidated payloads | Pydantic |
| `backend/app/services/auth/` | Google OAuth client, PKCE helpers & server-side session management | Smarak | 13 | `google_oauth.py`, `session_manager.py`, SHA-256 token hashing | Plaintext secret storage | DB models |
| `backend/app/api/map_routes.py` | PostGIS map projection endpoint (`POST /map/v1/projection`) | Rudra / Susmita | 6A/7 | Map request/response adapter invocation | Frontend rendering | Map HTTP adapter |
| `backend/app/api/weather_routes.py` | Weather endpoints (`GET /weather/current`, `GET /weather/forecast`) | Rudra | 6/7 | Open-Meteo adapter invocation and condition normalization | Frontend UI | Weather service |
| `backend/app/api/image_routes.py` | WebP image serving endpoints (`GET /static/images/*`, `GET /api/v1/images/*`) | Smarak / Rudra | 6/7 | Image proxy and static asset delivery | Image generation | Local/cloud storage |
| `backend/app/services/ranking/` | Deterministic candidate selection and relevance ranking | Smarak | 4 | Canonical relevance ranking, exact matching, stable tie-breaks | AI prose or popularity | Database models |
| `backend/app/services/itinerary/` | Deterministic itinerary sequencing engine | Smarak | 4 | Day capacity (max 3/day), uniqueness, start/consecutive hops | Routing or AI | Ranking service |
| `backend/app/services/search/` | Whole-Odisha Search & AI Knowledge Retrieval Service | Smarak | 11 | Deterministic 8-tier ranking, alias resolution, geospatial proximity, domain separation | Ad hoc substring filters | Database models |
| `backend/app/ai/` | Multilingual grounded AI conversation, fact verifier, in-process rate limiting, circuit breaking, health diagnostics, smoke testing & adapter factory | Smarak | 5/12 | Provider-neutral contracts, `GroundedConversationOrchestrator`, `GroundingVerifier`, `rate_limiter`, `circuit_breaker`, `ToolRegistry`, `ToolExecutionBoundary`, `AIProviderAdapter`, `AzureOpenAIProviderAdapter`, `GeminiProviderAdapter`, `NVIDIAProviderAdapter`, `MultiProviderFallbackAdapter`, `inspect_provider_health`, `provider_smoke_test`, `create_provider_adapter` | Hallucinated facts, proprietary SDKs | Approved tools |
| `backend/app/geospatial/` | Geospatial validation and projection core | Susmita / Rudra | 6A | Coordinate validation, Point feature projection, bounding box | Invented coordinates | GeoAlchemy2 |
| `backend/app/transport/` | Multimodal transport graph and routing | Rudra | 3 | Dijkstra graph router, walking/road/rail adapters | Itinerary ranking | Transport data |
| `backend/tests/` | Backend test suite (760 passed, 2 deselected across 56 suites) | All owners | 0–14 | Pytest suites across health, places, multilingual taxonomy, search, ranking, itinerary, grounded AI conversations, fact verifier, rate limiting, circuit breaker, multi-provider adapters, latency budgets, resilience, production readiness, smoke tests, auth DB, Google OAuth, session management, security, cloud sync, public trip sharing, CI workflow, weather, map, and transport | Test-only product changes | Pytest |

---

## Frontend Subsystem (`frontend/`)

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `frontend/package.json` | React/Vite dependencies and scripts | Deeptiman | 0–7 | React 18, TypeScript, Tailwind CSS, Leaflet, Vitest | Backend packages | npm |
| `frontend/vite.config.ts` | Vite configuration and Rollup code-splitting | Deeptiman | 5–7 | Dynamic chunking (`leaflet-vendor`, `react-vendor`, etc.) | Ad hoc build hacks | Vite / Rollup |
| `frontend/src/pages/ItineraryPlannerPage.tsx` | Main SPA page shell with hash navigation & tabs | Deeptiman | 5–7 | URL hash sync, activeTab management, lazy MapView | Direct DB queries | Navigation utils |
| `frontend/src/components/map/MapView.tsx` | Code-split Leaflet map canvas component | Deeptiman / Susmita | 5–7 | Dynamic map pins, clustering, bounding box, export default | Backend routing | Leaflet |
| `frontend/src/components/auth/AuthStatusButton.tsx` | Responsive Header Auth & Cloud Sync Status Button | Deeptiman | 13 | Sign in controls, user profile avatar, live sync badge, manual sync, logout | Direct DB access | `useAuth`, `useCloudSync` |
| `frontend/src/components/` | Reusable presentation components | Deeptiman | 6B/7 | Discover hero, destination cards, search suggestions, modals, timeline, weather widget | Direct DB access | Design tokens |
| `frontend/src/store/useAuth.ts` | Reactive authentication state hook | Deeptiman | 13 | Session check (`GET /auth/me`), Google login redirect, logout | Plaintext token storage | `apiClient` |
| `frontend/src/store/useCloudSync.ts` | Offline-first cloud synchronization hook | Deeptiman | 13 | Deterministic conflict reconciliation, tombstone records, rate limit backoff | Direct SQL | `useAuth`, `apiClient` |
| `frontend/src/store/useSharedTrip.ts` | Public read-only shared trip snapshot hook | Deeptiman | 14 | Read-only shared trip snapshot retrieval and error handling | Mutating trip data | `apiClient` |
| `frontend/src/components/itinerary/ShareTripModal.tsx` | Share Trip generation and copy modal | Deeptiman | 14 | Authenticated share creation, link copy, 429 backoff message | Plaintext token storage | `useAuth`, `apiClient` |
| `frontend/src/components/itinerary/ItineraryExportModal.tsx` | Itinerary export & print modal | Deeptiman | 14 | Print / Save as PDF invocation, client-side Markdown download | Server-side PDF generation | `itineraryExport.ts` |
| `frontend/src/components/itinerary/PrintableItineraryView.tsx` | Print-optimized paper layout component | Deeptiman | 14 | High-contrast printable layout, day page breaks, helplines | Interactive controls | `timelineService` |
| `frontend/src/components/itinerary/SharedItineraryPage.tsx` | Public read-only shared itinerary presentation view | Deeptiman | 14 | Read-only itinerary view, "Plan Your Own Trip" CTA | Trip editing | `useSharedTrip` |
| `frontend/src/store/` | Presentation state hooks | Deeptiman | 6B/7 | `usePlaces`, `useSavedPlaces`, `useItineraryPlanner`, `useAIConversation`, `useWeather`, `useConversationHistory` | Backend business logic | React hooks |
| `frontend/src/types/multilingualTaxonomy.ts` | Authoritative frontend multilingual taxonomy crosswalk (30 districts, 16 categories, 12 interests) | Deeptiman | 12 | Strongly typed records and label accessors in English, Odia, and Hindi | Machine translation logic | Backend taxonomy |
| `frontend/public/manifest.webmanifest` | Standards-compliant PWA Web App Manifest | Deeptiman | 14 | Standalone display, theme `#0B1220`, multi-resolution icons | Dynamic routing | Web standards |
| `frontend/public/sw.js` | Native offline caching Service Worker | Deeptiman | 14 | App shell caching, WebP image caching, strict API bypass | Authenticated caching | Service Worker API |
| `frontend/src/utils/registerServiceWorker.ts` | Client-side Service Worker registration helper | Deeptiman | 14 | Window load registration, update detection, unregister helper | Business logic | Web API |
| `frontend/src/utils/itineraryExport.ts` | Client-side itinerary Markdown export, print trigger & emergency helplines | Deeptiman | 14 | Markdown document generator, filename sanitization, Blob download, emergency helplines | External PDF APIs | Native Web APIs |
| `frontend/src/utils/navigation.ts` | URL hash normalization and synchronization helper | Deeptiman | 5–7 | Bidirectional `#discover`, `#destinations`, `#map`, `#plan`, `#saved`, `#shared` routing | UI rendering | Browser history API |
| `frontend/src/utils/regionUtils.ts` | 30-district to region mapping utility | Deeptiman | 6/7 | Frontend region resolution mirror | Database queries | Core taxonomy |
| `frontend/src/utils/imageService.ts` | 1-to-1 WebP destination image resolver | Deeptiman | 6/7 | Sourced image path resolution and fallbacks | Synthetic images | Image manifest |
| `frontend/tests/` | 390 frontend unit, component, AI conversation, auth, search, shared trip, export, and PWA tests (385 passed, 5 skipped across 43 test files) | Deeptiman | 0–14 | 43 Vitest test files covering UI, navigation, map, grounded AI conversations, weather, multilingual taxonomy, live search, suggestions, auth state, cloud sync, public trip sharing, print optimization, Markdown export, and PWA offline caching | Backend implementation | Vitest |




---

## Data & Scripts Subsystems

| Path | Purpose | Owner | Phase | Belongs here | Does not belong here | Dependencies |
|---|---|---|---|---|---|---|
| `data/places/places.json` | Sourced 81 canonical place records with districts | Akriti | 1–7 | Verified coordinates, categories, districts, descriptions | Unverified places | Sources |
| `data/places/categories.json` | 13 physical category records | Akriti | 1–7 | Physical categories | Traveler themes | Place schemas |
| `data/places/interests.json` | 12 normalized traveler interest records | Akriti | 1–7 | Canonical traveler themes | Physical categories | Taxonomy |
| `data/images/` | Verified WebP destination and category photography | Akriti | 6/7 | Optimized WebP assets organized by place research ID | Random unsourced images | Manifests |
| `scripts/audit_data_quality.py` | Reusable dataset quality, provenance, and envelope audit CLI | Smarak | 11 | Automated PASS/WARNING/FAIL reporting, JSON output | Production API code | `data/` |
| `scripts/import_places.py` | Canonical place importer with district & region validation | Smarak | 2/7 | Idempotent database population | UI logic | `data/`, DB models |
| `scripts/sync_db_place_images.py` | Place image database synchronizer | Smarak | 6/7 | Synchronizes `place_images` table with filesystem WebP assets | Image conversion | DB models |
| `scripts/import_transport.py` | Provider-neutral transport loader | Smarak | 2/3 | Route/stop/fare import | Provider APIs | Transport data |
| `scripts/phase7_full_stack_audit.py` | Phase 7 live full-stack automated audit script | Smarak / Punam | 7 | Real PostgreSQL, FastAPI, AI, and frontend verification | Mocked functions | Live stack |
| `scripts/e2e_full_stack_audit.py` | Full-stack endpoint verification audit script | Smarak | 6/7 | Live HTTP endpoint smoke tests | Mocked unit tests | Live backend |
| `infra/docker-compose.yml` | Local PostgreSQL/PostGIS Docker Compose spec | Rudra | 2/7 | Database container configuration (port 5433) | Application code | Docker |
