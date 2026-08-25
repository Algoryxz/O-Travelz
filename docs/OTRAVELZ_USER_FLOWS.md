# O-Travelz — Comprehensive User Journeys & End-to-End Flows
**Version:** 1.0.0 (Authoritative Journey Specifications)  
**Scope:** Complete Step-by-Step Frontend → API → Backend → Database Lifecycle

---

## 1. Journey Overview & Matrix

```
[Journey A: Anonymous Visitor Landing]
   │
   ├──▶ [Journey B: Discover Odisha (Hero & Categories)] ──▶ [Journey D: View Destination Details] ──▶ [Journey J: Save Destination]
   │
   ├──▶ [Journey C: Search & Filter Catalog] ─────────────▶ [Journey E: Explore Interactive Map] ──▶ [Journey Q: Navigate Between Places]
   │
   ├──▶ [Journey F: Live Location Hub Detection] ─────────▶ [Journey P: Check Weather & Forecast]
   │
   ├──▶ [Journey G: Ask AI Travel Assistant] ─────────────▶ [Journey H: Generate Itinerary] ───────▶ [Journey I: Modify / Refine Trip]
   │                                                                                                    │
   │                                                                                                    ├──▶ [Journey K: Save Trip / History]
   │                                                                                                    └──▶ [Journey N: Share Trip Snapshot]
   │                                                                                                             │
   │                                                                                                             ▼
   │                                                                                                    [Journey O: View Shared Trip (Recipient)]
   │
   └──▶ [Journey L: Google OAuth PKCE Login] ────────────▶ [Journey M: Cloud Sync Places & Trips]
```

---

## 2. Detailed Step-by-Step Flow Specifications

### Journey A: Anonymous Visitor First-Launch & Consent
1. **Frontend:** User lands on `https://otravelz.in`. `ItineraryPlannerPage.tsx` checks `useTermsConsent` in `localStorage`.
2. **Consent Gate:** If `o_travelz_terms_consent` is not found, `TermsConsentGate` renders, presenting platform terms and privacy guidelines.
3. **Acceptance:** User clicks "I Agree & Continue". Timestamp is stored locally; user enters `#discover` view without any blocking login walls.

---

### Journey B: Discover Odisha (Curated Circuits & Thematic Hubs)
1. **Frontend:** `OdishaHero` and `HomeSections` render curated destination cards from `usePlaces` (`/places`) and `imageService.ts`.
2. **Selection:** User clicks a category badge (e.g. "Waterfalls" or "Wildlife").
3. **Transition:** Active tab updates to `category`, rendering `CategoryExplorePage` with places matching category filter.
4. **Backend Flow:** `GET /places?category=waterfall` queried against PostgreSQL `places` joined with `categories`.

---

### Journey C: Search & Multilingual Filter Catalog
1. **Frontend:** User types search term in Hero or Destinations directory (supports English "Puri", Odia "ପୁରୀ", or Hindi "पुरी").
2. **Autocomplete:** As user types (debounced 300ms), `usePlaces` calls `GET /places/suggestions?query={input}&limit=5`.
3. **Correction & Matching:** `SearchCorrectionService` evaluates Levenshtein distance, transliteration tables, and phonetic matches.
4. **Result Presentation:** `DestinationsPage` filters cards across 81+ verified destinations with instant visual feedback.

---

### Journey D: View Destination Details & Photo Gallery
1. **Frontend:** User clicks any Place Card. `PlaceDetailsModal` opens.
2. **API Call:** Frontend calls `GET /places/{id}`.
3. **Backend Flow:** `places_routes.py` queries `Place` record, eager loading `place_images`, `categories`, and `interests`.
4. **Data Delivery:** Returns full metadata: coordinates, duration (`avg_visit_minutes`), rating, rating source, operating hours source, and verified WebP image gallery.
5. **Image Rendering:** `imageAdapter.ts` resolves primary hero variant via `/static/images/places/{id}/...`.

---

### Journey E: Explore Interactive Map & Viewport Spatial Sync
1. **Frontend:** User navigates to `#map`. Leaflet `MapView` loads lazily.
2. **Projection Request:** If no itinerary is active, frontend sends `POST /map/v1/projection` with all destination IDs:
   ```json
   { "requested_features": [{ "entity": "place", "id": "place_puri_001" }, ...] }
   ```
3. **Backend Flow:** `MapProjectionHTTPAdapter` validates IDs, looks up PostGIS points, and returns authoritative GeoJSON `FeatureCollection` with status `available`.
4. **Interaction:** User clicks a marker pin; map centers with popup and opens `MapDetailsDrawer`.

---

### Journey F: Use Live Location & Proximity Hubs
1. **Frontend:** User clicks location button in header. `LocationPermissionModal` opens with 2-step explanation.
2. **Browser Geolocation:** User approves; `useGeolocation` requests `navigator.geolocation.getCurrentPosition()`.
3. **Hub Computation:** Frontend runs Haversine formula against Odisha hubs (Bhubaneswar, Puri, Konark, Cuttack, Chilika, Daringbadi, Sambalpur, Koraput, Rourkela).
4. **UI Update:** If within 500 km, header displays e.g. `Puri, Odisha` with green live indicator.

---

### Journey G: Ask AI Travel Assistant (Conversational Multilingual Help)
1. **Frontend:** User opens `AISidebar` or clicks AI launcher dock.
2. **Message Dispatch:** User enters natural language request (e.g., "Suggest a 3-day spiritual circuit from Puri in Odia").
3. **API Request:** Frontend calls `POST /ai/converse` with payload:
   ```json
   { "messages": [{ "role": "user", "content": "Suggest a 3-day spiritual circuit..." }], "constraints": null }
   ```
4. **Backend Flow:**
   * `ai_routes.py` applies IP sliding-window rate limiter.
   * `GroundedConversationOrchestrator` invokes `MultiProviderFallbackAdapter`.
   * Model identifies required tool: `build_itinerary`.
   * Sandboxed `ToolExecutionBoundary` executes `ItineraryService` against PostgreSQL.
   * `GroundingVerifier` passes output through anti-hallucination sanitization.
5. **Frontend Presentation:** Renders formatted assistant response with embedded interactive itinerary card and source badges.

---

### Journey H: Generate Itinerary (Deterministic Engine vs AI)
1. **Frontend:** User fills `ConstraintForm` in `#plan` tab (e.g., Days: 3, Start: Bhubaneswar, Interests: Heritage & Food).
2. **API Call:** Frontend sends `POST /itinerary/plan` with `PlanningConstraints`.
3. **Backend Execution:**
   * `SQLAlchemyPlaceRepository` filters verified places matching interests.
   * Ranking algorithm scores destinations based on popularity, category affinity, and geographic clustering.
   * `TransportService` builds route graph, computes pairwise hops, assigns public transit (Mo Bus / Mo E-Ride / walking), and calculates time/cost budgets.
4. **Response:** Returns `ItineraryPlanResponse` with days, sequenced stops, planned arrival/departure times, and topological hops.
5. **UI Rendering:** Renders `ItineraryView` timeline with interactive stop cards and hop connection badges.

---

### Journey I: Modify & Refine a Trip
1. **Frontend:** User requests an adjustment (e.g. "Add one day for Chilika Lake" or changes start hub from Bhubaneswar to Puri).
2. **State Merge:** `useItineraryPlanner` updates constraints and submits replanning request to `POST /itinerary/plan` or `POST /ai/converse`.
3. **Differential Update:** Backend recalculates schedule, maintaining existing locked stops where feasible and recalculating transportation hops.
4. **UI Transition:** Schedule animates to new structure with toast notification confirming updated constraints.

---

### Journey J: Save / Bookmark Destinations
1. **Frontend:** User clicks bookmark icon on any Place Card or Modal.
2. **Anonymous State:** Item saved to `localStorage` under `o_travelz_saved_places`.
3. **Authenticated State:** `useSavedPlaces` immediately queues item into `useCloudSync` for background sync to `/api/v1/sync/saved-places`.
4. **Feedback:** Bookmark icon toggles to filled state with incremented counter in Top Navigation.

---

### Journey K: Save Itinerary / Trip Conversation History
1. **Frontend:** Upon successful plan generation, `useConversationHistory` stores trip object:
   * Title, timestamps, constraints, stops, and AI conversation messages.
2. **Local History Strip:** Stored in `localStorage` under `o_travelz_conversations`.
3. **Cloud Sync (if logged in):** Synchronized to PostgreSQL `user_saved_trips` table.

---

### Journey L: Authenticate with Google OAuth 2.0 PKCE
1. **Frontend:** User clicks "Sign in with Google" in TopNav or MobileDrawer.
2. **Start Endpoint:** Browser redirected to `GET /auth/google/start`.
3. **PKCE & State:** Backend generates `code_verifier`, SHA-256 `code_challenge`, state, and nonce. Signs state in `otravelz_oauth_state` HttpOnly cookie. Redirects user to Google Consent Screen.
4. **Callback Handling:** Google redirects user back to `GET /auth/google/callback?code=...&state=...`.
5. **Token Exchange:** Backend exchanges authorization code with Google token endpoint using PKCE verifier. Validates ID token claims.
6. **Session Creation:** Upserts `User` record in PostgreSQL, creates `UserSession`, sets 30-day HttpOnly `otravelz_session` cookie, and redirects user to frontend.
7. **Frontend Mount:** `useAuth` calls `GET /auth/me`, sets `isAuthenticated: true`, and displays user avatar.

---

### Journey M: Cloud Synchronize Content Across Devices
1. **Trigger:** Fires automatically on authentication, on network reconnection (`online` event), or on local mutations (debounced 1.5s).
2. **API Calls:**
   * `POST /api/v1/sync/saved-places`
   * `POST /api/v1/sync/trips`
3. **Conflict Resolution:** Backend resolves client vs server records using deterministic `updated_at` timestamps with tombstone preference on ties (`is_deleted = true`).
4. **State Reconciliation:** Local storage updated with merged canonical state; sync indicator changes to `synced`.

---

### Journey N: Share Trip Itinerary Snapshot
1. **Frontend:** In `#plan` tab, user clicks "Share Trip". `ShareTripModal` opens.
2. **API Call:** Frontend sends `POST /api/v1/trips/share` with title, itinerary, and constraints.
3. **Backend Snapshot:** Backend verifies session, generates unguessable 22-character URL-safe `share_id` (e.g. `k8Z_9pL1vQe...`), stores immutable snapshot in `shared_trip_snapshots`, and returns `share_url: "/#trip/shared/{share_id}"`.
4. **UI Presentation:** Modal displays copyable share URL with social share triggers.

---

### Journey O: View Public Shared Trip (Recipient Flow)
1. **Recipient Access:** Recipient visits `https://otravelz.in/#trip/shared/k8Z_9pL1vQe...`.
2. **API Request:** Frontend calls public endpoint `GET /api/v1/trips/shared/{share_id}` (Zero authentication required).
3. **Backend Flow:** `share_routes.py` applies IP abuse rate limit (120 req/min), queries `shared_trip_snapshots`, checks expiration (if any), and returns public payload.
4. **Display:** `SharedItineraryPage` renders full read-only schedule, day breakdown, and interactive map with "Plan Your Own Trip" CTA.

---

### Journey P: Check Live Weather & Dynamic Meteorological Forecast
1. **Frontend:** `WeatherCard` in `#discover` or `useWeather` requests current conditions for active hub.
2. **API Call:** `GET /weather/current?location_name=Puri&lat=19.8135&lon=85.8312`.
3. **Backend Service:** `WeatherService` queries Open-Meteo REST API (cached 15 min), maps WMO weather codes to canonical conditions ("Sunny", "Monsoon Rain", "Tropical Breeze"), and generates real-time travel advice.
4. **UI Display:** Animated weather icon, temperature, humidity, wind gusts, and travel comfort index.

---

### Journey Q: Multimodal Hop Navigation Between Destinations
1. **Frontend:** Inside Itinerary Timeline, user expands `TransportHopCard` between Stop 1 (Lingaraj Temple) and Stop 2 (Dhauli Shanti Stupa).
2. **Hop Details:** Displays transportation mode (e.g., "Mo Bus Route 10 + Walking"), estimated travel minutes (25 min), estimated fare (₹20), and data reliability tier (`scheduled` or `live`).
3. **Map Connection:** Clicking "View on Map" projects the exact route line between stops.

---

### Journey R: Legal Compliance, Privacy Inquiries & Grievance
1. **Frontend:** User clicks "Privacy Policy", "Terms & Conditions", or "Contact Grievance" in Footer.
2. **Routing:** Browser updates hash to `#privacy`, `#terms`, or `#contact`.
3. **Content Display:** Renders statutory disclosures, Grievance Officer email, and data retention policy.
