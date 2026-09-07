# O-TRAVELZ Mobile V4 — Traveler Product Jobs (JTBD)

> **Authoritative Functional Specification**  
> Framework: **Jobs-to-be-Done (JTBD) & Traveler Outcome Engineering**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## Overview

Mobile O-TRAVELZ is architected around the concrete tasks a traveler performs before, during, and after traveling across Odisha. Every surface, state, and interaction in the application exists solely to fulfill one of the 12 core product jobs defined below.

---

## Job 1: Discover Odisha (Inspiration & Spatial Orientation)

- **User Goal**: Answer "Where should I go?", "What is near me?", "What matches my cultural or nature interests?", and "What is genuinely worth visiting in Odisha?"
- **Trigger**: Opening the app for the first time; starting a trip planning session; arriving in a new district.
- **Required Information**: Curated destination catalog (all 204 verified places across 30 districts), category tags, district boundaries, verified photography, cultural significance essays.
- **Required Actions**: Filter by district chip; filter by category (Temples, Craft Villages, Wildlife, Corridors); view editorial hero cards; search by keyword or Odia name.
- **Backend / Data Dependency**: `GET /api/places` (cached locally in Room / SwiftData).
- **Offline Availability**: **100% Available**. Full 204-place catalog is pre-bundled and queryable offline.
- **Truth Risks**: Showing unverified destinations or AI-generated stock photography.
  - *Mitigation*: Hard rule `NO VERIFIED IMAGE = NO PUBLIC DESTINATION`.
- **Android Implications**: Material 3 multi-row filter chips, LazyColumn with staggered editorial cards, Adaptive Navigation Rail on foldables/tablets.
- **iOS Implications**: Sticky header with district picker, LazyVGrid with spring-animated filter transitions, Dynamic Type scaling.
- **Success Condition**: Traveler finds a relevant destination matching their intent within 3 taps or 15 seconds.

---

## Job 2: Understand a Destination (Depth, Feasibility & Truth Cues)

- **User Goal**: Comprehend the authentic cultural significance, physical reality, operating hours, and travel feasibility of a specific site.
- **Trigger**: Tapping a destination card in the feed or selecting a map marker.
- **Required Information**: Verified high-resolution photography, official provenance citation (ASI / State Archaeology), live/cached weather, opening hours where audited, nearest verified transit stop, cultural context.
- **Required Actions**: Browse photo gallery; inspect truth badges; view contextual mini-map; save to favorites; initiate turn-by-turn navigation handoff.
- **Backend / Data Dependency**: `GET /api/places/{id}`, `GET /weather/current`.
- **Offline Availability**: Core metadata and cached images **100% Available**. Weather displays cached timestamp or unavailable indicator.
- **Truth Risks**: Hallucinating opening hours or fabricating missing entry fees.
  - *Mitigation*: Opening hours shown only when officially verified; fees remain strictly `null` if unverified.
- **Android Implications**: Modal bottom sheet expanding to full-screen scaffold with Predictive Back dismissal.
- **iOS Implications**: Native SwiftUI `.sheet` with presentation detents (`.medium`, `.large`) and spring drag physics.
- **Success Condition**: Traveler clearly understands what makes the place unique and whether it is physically open today without encountering deceptive facts.

---

## Job 3: Plan a Trip (Constraint-Aware Itinerary Generation)

- **User Goal**: Formulate a realistic, executable travel itinerary respecting strict constraints of time, starting location, walking tolerance, and transit reality.
- **Trigger**: Traveler selects the "Plan" tab or requests an itinerary from a saved place collection.
- **Required Information**: Available days/hours, starting hub (e.g. Master Canteen, Airport), travel interests, transit schedule constraints, physical distance matrix.
- **Required Actions**: Input days and interests; choose transit mode preference; review deterministic day-by-day plan; refine via conversational AI prompt; save itinerary.
- **Backend / Data Dependency**: `POST /itinerary/plan`, `POST /ai/converse`.
- **Offline Availability**: Offline rule-based fallback generator provides static 1-day, 2-day, and 3-day regional golden circuits (Bhubaneswar-Puri-Konark). AI chat disabled offline.
- **Truth Risks**: AI proposing itineraries with physically impossible transit connections or places that are closed on the visiting day (e.g. State Museum on Mondays).
  - *Mitigation*: AI strictly formats explanations of deterministic solver output; deterministic engine enforces opening hours.
- **Android Implications**: Jetpack Navigation 3 list-detail pane on tablets; Stepper form controls with Material 3 styling.
- **iOS Implications**: NavigationSplitView on iPad; native Form controls with grouped styling and `.keyboardToolbar`.
- **Success Condition**: Traveler receives a logically sequenced schedule where travel times and opening hours are physically feasible.

---

## Job 4: Execute a Trip (Active Traveling & Real-Time Context)

- **User Goal**: Move through an active itinerary on the travel day with immediate clarity on "What do I do next?", "How do I get there?", and "Where are nearby essentials?"
- **Trigger**: Traveler marks a saved itinerary as "Start Trip" or opens the app while an itinerary is active.
- **Required Information**: Current step in itinerary, scheduled departure time of next bus hop, walking distance to next stop, weather conditions, next stop's coordinates.
- **Required Actions**: Mark current stop as visited; skip stop; tap "Navigate" for external turn-by-turn handoff; inspect next transit departure; view nearby water/medical essentials.
- **Backend / Data Dependency**: Local `SavedTrip` persistence, `FirstMileEngine`, Open-Meteo live weather.
- **Offline Availability**: **100% Functional Offline**. All trip steps, stops, and navigation handoffs function without cellular data.
- **Truth Risks**: Claiming live bus tracking when transit is scheduled.
  - *Mitigation*: Explicit label `Scheduled · HH:MM IST`.
- **Android Implications**: Persistent bottom sheet or Notification Ongoing Activity for active trip status; edge-to-edge route overview.
- **iOS Implications**: Interactive Live Activity / Dynamic Island (deferred to M17) and persistent toolbar header showing next milestone.
- **Success Condition**: Traveler completes their itinerary leg on time without getting lost or stranded.

---

## Job 5: Use Odisha Transit (CRUT Mo Bus & Ama Bus Directory)

- **User Goal**: Identify public transit routes, find nearby verified bus stops, view official scheduled departure times, and evaluate walking access.
- **Trigger**: Traveler taps the "Transit" tab or seeks public transit options from a destination detail view.
- **Required Information**: 154 routes across 5 regions, 1,430 canonical stops (173 verified coordinates, 1,257 locality stops), scheduled departure timetables, road-following route splines.
- **Required Actions**: Search routes by number or terminal; find stops near current location; view upcoming departure times in IST; inspect topological stop list; evaluate first-mile walking.
- **Backend / Data Dependency**: `GET /api/transport/routes`, `GET /transport/stops/nearby`.
- **Offline Availability**: **100% Available**. Complete transit directory is bundled locally in the mobile app.
- **Truth Risks**: Showing moving buses on a map without hardware GPS telemetry; drawing walking paths to unverified locality stops.
  - *Mitigation*: Zero moving bus icons; candidate and locality stops strictly suppress first-mile walking calculations.
- **Android Implications**: Tabular number formatting for IST departure clocks; Google Maps Compose polylines with official CRUT route colors.
- **iOS Implications**: Tabular figures in SwiftUI; Apple MapKit `MapPolyline` with crisp vector antialiasing.
- **Success Condition**: Traveler knows exactly which bus to take, where to board, and when it is scheduled to depart.

---

## Job 6: Navigate Spatially (Map as an Analytical Product Mode)

- **User Goal**: Visually contextualize destinations, routes, stops, and personal position across the geography of Odisha.
- **Trigger**: Traveler switches to the "Map" tab or taps a location pin.
- **Required Information**: Map basemap tiles, PostGIS projected GeoJSON entities, category icons, cluster counts, live GPS coordinates.
- **Required Actions**: Pan, zoom, double-tap; filter visible layers (Temples, Crafts, Nature, Transit); tap clustered pins to expand; select single pin for preview bottom sheet.
- **Backend / Data Dependency**: `POST /api/map/projection`, device GPS.
- **Offline Availability**: Local vector/cached basemap viewable; all 204 places and 173 verified stops plotable offline.
- **Truth Risks**: Plotting unverified candidate coordinates as exact locations.
  - *Mitigation*: Locality-only stops display as boundary regions, never exact misleading pins.
- **Android Implications**: Google Maps Compose with hardware GPU acceleration; custom marker layouts.
- **iOS Implications**: Metal-accelerated SwiftUI `Map` with custom `Annotation` views and `.mapControls`.
- **Success Condition**: Traveler effortlessly orients themselves within the district and spots proximate points of interest.

---

## Job 7: Find Practical Essentials (Civic & Emergency Utilities)

- **User Goal**: Quickly locate verified emergency services, district hospitals, police stations, ATMs, fuel stations, and major transport hubs.
- **Trigger**: Emergency need; urgent medical requirement; needing cash or fuel during highway transit.
- **Required Information**: Verified civic utilities dataset, verified phone numbers, coordinates, address.
- **Required Actions**: Filter essentials by category; tap to call (telephony intent); launch turn-by-turn navigation.
- **Backend / Data Dependency**: `GET /api/v1/services/nearby`.
- **Offline Availability**: Critical emergency contacts (Police 112, District Headquarter Hospitals, Tourist Police) bundled permanently offline.
- **Truth Risks**: Displaying unverified or out-of-date emergency phone numbers; mixing emergency pins into leisure tourism feeds.
  - *Mitigation*: Essentials are strictly isolated from leisure discovery feeds; phone numbers verified against official directory.
- **Android Implications**: Standard `Intent.ACTION_DIAL` with verified telephone URI.
- **iOS Implications**: Standard `tel://` URL scheme with confirmation dialog.
- **Success Condition**: Traveler initiates communication or navigation to an emergency utility within 2 taps.

---

## Job 8: Save and Resume (Personal Travel Memory)

- **User Goal**: Curate a personalized collection of places to visit, retain custom itineraries, and resume planning seamlessly across app sessions.
- **Trigger**: Tapping the "Save" bookmark icon on a place card; completing an itinerary plan.
- **Required Information**: User's saved place IDs, custom itinerary JSON structures, creation timestamps.
- **Required Actions**: View saved places list; group by district; view saved trips; delete saved items; export trip summary.
- **Backend / Data Dependency**: Local database (Room / SwiftData); future sync via `POST /api/v1/sync/saved-places`.
- **Offline Availability**: **100% Functional Offline**. All saves write immediately to device storage.
- **Truth Risks**: Data loss on app update or offline disconnect.
  - *Mitigation*: Local-first persistence; cloud sync is an optional background enhancement.
- **Android Implications**: Room SQLite entities with KSP compilation; Flow state observation.
- **iOS Implications**: SwiftData `@Model` classes with `@Query` property wrappers.
- **Success Condition**: Traveler's bookmarks and plans persist permanently with zero cloud account friction required.

---

## Job 9: Contribute Local Knowledge (Community Intelligence Loop)

- **User Goal**: Submit on-the-ground observations, suggest corrections, share authentic photos, or report missing cultural places.
- **Trigger**: Traveler experiences a monument or artisan cluster and notices missing or updated information.
- **Required Information**: User GPS coordinate snapshot, photo asset, category, factual description.
- **Required Actions**: Select "Contribute" in Profile; take photo; select category; describe local tip; submit to audit queue.
- **Backend / Data Dependency**: `POST /api/v1/contributions/submit`.
- **Offline Availability**: Offline draft queue saves contribution locally until network connectivity is restored.
- **Truth Risks**: Publishing unvetted claims, spam, or copyright-infringing photos directly to the public catalog.
  - *Mitigation*: Zero unreviewed contributions enter the public catalog. All submissions land in an administrative audit staging queue.
- **Android Implications**: CameraX integration for direct hardware photo capture.
- **iOS Implications**: AVFoundation / PhotosUI `PhotosPicker` with strict camera permissions.
- **Success Condition**: Traveler successfully stages an authentic community contribution with full audit transparency.

---

## Job 10: Verify Transit While Riding (Crowdsourced Stop Consensus)

- **User Goal**: Check in during a Mo Bus or Ama Bus ride to confirm bus stop physical locations and help promote candidate stops to verified status.
- **Trigger**: Boarding a bus and opening "Transit Check-In" mode.
- **Required Information**: Active transit route, hardware GPS coordinate sequence, timestamp in IST.
- **Required Actions**: Tap "Check-in at Stop"; confirm visual identification of stop signboard; submit coordinate telemetry.
- **Backend / Data Dependency**: `POST /api/transport/verify-stop`, shared `RideVerificationEngine`.
- **Offline Availability**: Observations logged locally with GPS timestamps and batched upon reconnecting.
- **Truth Risks**: Single-user spoofed GPS promoting false stops.
  - *Mitigation*: Consensus algorithm requires $\ge 5$ independent observations from distinct device IDs before staging for review.
- **Android Implications**: FusedLocationProviderClient high-accuracy updates.
- **iOS Implications**: `CLLocationManager` authorized for `kCLLocationAccuracyBest`.
- **Success Condition**: Contributor helps validate transit infrastructure without impeding standard travel utility.

---

## Job 11: Operate Offline / Degraded (Resilience in Low-Connectivity Terrains)

- **User Goal**: Retain uninterrupted access to verified travel intelligence when venturing into remote forests, hills, or rural villages with zero network reception.
- **Trigger**: Entering Airplane Mode; traversing dead zones (e.g. interior Similipal, Eastern Ghats passes).
- **Required Information**: Local database snapshot of 204 places, 154 routes, saved itineraries, cached photos, emergency contacts.
- **Required Actions**: Browse catalog; view saved trips; calculate straight-line distances; access emergency contacts.
- **Backend / Data Dependency**: None (Local disk cache).
- **Offline Availability**: **100% Guaranteed for Core Atlas**.
- **Truth Risks**: Displaying stale weather as current, or hiding failure behind deceptive cached flags.
  - *Mitigation*: Clear offline indicator; weather clearly badged with cached timestamp; live features gracefully disabled.
- **Android Implications**: NetworkCapabilities monitoring via ConnectivityManager.
- **iOS Implications**: NWPathMonitor async stream monitoring reachability transitions.
- **Success Condition**: Traveler feels confident and fully informed even with zero cellular signal.

---

## Job 12: Control Account, Privacy & Settings (Sovereignty & Preferences)

- **User Goal**: Configure application language (Odia / English), manage offline storage footprint, adjust theme, and govern location privacy.
- **Trigger**: Traveler opens "You / Settings" tab.
- **Required Information**: Current locale settings, cache storage usage metrics, permission authorization states.
- **Required Actions**: Switch language; clear media cache; toggle Dark Atlas / Warm Sandstone theme; review privacy policy; revoke location permissions.
- **Backend / Data Dependency**: Local DataStore (Android) / UserDefaults (iOS).
- **Offline Availability**: **100% Available**.
- **Truth Risks**: Undeclared background location tracking or silent data collection.
  - *Mitigation*: Progressive disclosure; zero background location without explicit user trigger; full privacy manifest compliance.
- **Android Implications**: DataStore Preferences; Material 3 settings layout.
- **iOS Implications**: Standard SwiftUI Form with grouped Sections and Toggle controls.
- **Success Condition**: Traveler maintains total transparency and control over their device storage, language, and privacy settings.
