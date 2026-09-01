# O-Travelz Frontend Production Specification & Configuration Guide

`STATUS: VERIFIED`

This document details the production environment variables, security boundaries, API dependencies, caching architecture, and deployment procedures for the O-Travelz frontend.

---

## 1. Environment Variable Architecture & Security

### A. Core Rule: Client vs Server Separation
* **Client Variables (`VITE_*`)**: Everything prefixed with `VITE_` is baked into the browser bundle at build time and is **100% PUBLIC**.
* **Zero Secrets in Frontend**: AI API keys, Google OAuth client secrets, session HMAC keys, and database credentials **MUST NEVER** be placed in frontend code or `VITE_*` variables.
* **Architecture Flow**:
  $$\text{Browser (Client)} \xrightarrow{\text{Public REST API}} \text{FastAPI (Backend)} \xrightarrow{\text{Secret Keys}} \text{AI Providers / PostgreSQL / Weather}$$

### B. Complete Variable Matrix

| Variable Name | Required? | Layer | Scope | Purpose & Default |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Optional | Frontend | Public | Custom backend API base URL (Default: `""`, uses same-origin relative paths) |
| `VITE_APP_ENV` | Optional | Frontend | Public | Client environment indicator (`development` or `production`) |
| `ENVIRONMENT` | **Required** | Backend | Server-Only | Enforces fail-closed secret validation in `production` |
| `DATABASE_URL` | **Required** | Backend | Server-Only | PostgreSQL + PostGIS connection string |
| `AUTH_SESSION_SECRET` | **Required** | Backend | Server-Only | HMAC-SHA256 session cookie signing secret ($\ge 32$ chars) |
| `AUTH_COOKIE_SECURE` | **Required in Prod** | Backend | Server-Only | Enforces HTTPS-only `Secure` cookie flag |
| `CORS_ORIGINS` | **Required in Prod** | Backend | Server-Only | Explicit allowed frontend origins (e.g. `https://otravelz.in`) |
| `AI_GEMINI_API_KEY` | Optional | Backend | Server-Only | Google Gemini AI provider key |
| `AI_NVIDIA_API_KEY` | Optional | Backend | Server-Only | NVIDIA API Catalog provider key |
| `AI_API_KEY` | Optional | Backend | Server-Only | Azure OpenAI or generic OpenAI-compatible API key |

---

## 2. Image Manifest Architecture Audit (`imageService.ts`)

### A. Context & Size Analysis
* File size: ~260 KB TypeScript source ($\to$ bundles into `places-catalog` Rollup chunk at **301.71 kB uncompressed / 31.41 kB gzipped**).
* Contains: 81 verified Odisha places, complete multi-photo galleries, category image maps, and 1-to-1 provenance metadata across all 30 districts.

### B. Solution Comparison & Evaluation

| Approach | Initial Load Impact | Offline / PWA Support | Network Roundtrips | Scale Trade-off |
| :--- | :--- | :--- | :--- | :--- |
| **A. Rollup Chunk-Split Manifest (Current)** | **31.4 kB gzip** (isolated in `places-catalog.js`) | **100% Instant Offline** | **0 HTTP roundtrips** | Optimal for $\le 500$ verified places. Zero layout shift. |
| **B. Static JSON Asset via `fetch()`** | ~28 kB gzip | Requires explicit SW cache | +1 Network waterfall before render | Adds async hydration lag on initial page load. |
| **C. Backend API on-demand** | 0 KB initial bundle | **Broken when offline** | Multiple API queries on scroll | Inconsistent with PWA offline-first travel use cases. |
| **D. CDN Object Storage Manifest** | 0 KB initial bundle | Requires external CDN setup | +1 DNS lookup + SSL handshake | High complexity for 81 core Odisha places; recommended for Pan-India phase. |

### Decision: Preserve Chunk-Isolated Manifest (Choice A)
By leveraging Vite's `manualChunks: { 'places-catalog': ['src/utils/imageService'] }`, the manifest is already isolated from the main application bundle. It downloads in parallel, gzips to 31.4 kB, and provides 0ms instant place rendering with complete offline resilience.

---

## 3. Leaflet Vendor Bundle Audit

* The Leaflet mapping library (`leaflet-vendor` ~150 kB uncompressed / 43.5 kB gzipped) is **code-split via `React.lazy`** in `ItineraryPlannerPage.tsx`.
* **Initial Homepage Load**: Leaflet is **never downloaded** when a traveler opens the Discover homepage. It is fetched strictly on-demand when the user switches to the Map tab (`/#map`) or opens a full route projection.
* Attempting deep tree-shaking on Leaflet sub-modules introduces tile-layer edge case bugs with minimal user-perceptible savings (~15 kB). The current lazy-load strategy is optimal and low-risk.

---

## 4. Complete API Contract Inventory

| Endpoint | Method | Purpose | Auth | Client Consumer |
| :--- | :--- | :--- | :--- | :--- |
| `/places` | `GET` | List places by category, interest, or region | Public | `usePlaces.ts`, `DestinationsPage.tsx` |
| `/places/{id}` | `GET` | Fetch verified place details & coordinates | Public | `PlaceDetailsModal.tsx` |
| `/places/search/suggest`| `GET` | Autocomplete suggestions with typo tolerance | Public | `OdishaHero.tsx`, `DestinationsPage.tsx` |
| `/itinerary/plan` | `POST`| Generate deterministic multi-day itinerary | Public | `useItineraryPlanner.ts`, `ConstraintForm.tsx` |
| `/map/v1/projection` | `POST`| GeoJSON topological route paths & hops | Public | `useMapProjection.ts`, `MapView.tsx` |
| `/weather/current` | `GET` | Real-time weather observation for hub | Public | `useWeather.ts`, `WeatherCard.tsx` |
| `/weather/forecast`| `GET` | 5-day weather & precipitation forecast | Public | `useWeather.ts` |
| `/ai/plan` | `POST`| Grounded conversational itinerary synthesis | Public | `useAIConversation.ts`, `AISidebar.tsx` |
| `/auth/session` | `GET` | Check current authenticated user session | Session Cookie | `useAuthCloudSync.ts`, `TopNav.tsx` |
| `/auth/google` | `GET` | Initiate Google OAuth 2.0 flow | Public | `AuthModal.tsx` |
| `/sync/trips` | `POST`| Cloud backup for traveler itineraries | Authenticated | `useAuthCloudSync.ts` |

---

## 5. Production Failure Modes & Graceful Fallbacks

1. **Backend Unavailable**:
   * Client utilizes cached place catalog from `places-catalog.js` and cached saved places from `localStorage`.
   * Displays non-intrusive offline connectivity banner; navigation and saved wishlists remain operational.
2. **AI Provider Outage or Rate Limit**:
   * Backend automatically falls back to deterministic rule-based itinerary generation (`/itinerary/plan`).
   * Zero crash or cryptic error shown to traveler; displays standard verified itinerary.
3. **Weather Provider Failure**:
   * Normalizer injects seasonal historical baseline for the active Odisha district with a gentle *"Using seasonal historical forecast"* note.
4. **Invalid GPS / Unreachable Route**:
   * Routing engine automatically clamps to nearest verified road node and marks transfer tier as `scheduled` / `estimated`.
