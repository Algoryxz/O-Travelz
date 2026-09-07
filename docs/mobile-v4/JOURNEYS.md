# O-TRAVELZ Mobile V4 — Core Product Journeys

> **Authoritative User Journey Specification**  
> Scope: **Step-by-Step User Flows, System Invariants, and State Transitions**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Journey 1: Discover & Cultural Exploration

1. **Entry**: Traveler opens the app on the **Discover** tab.
2. **Browse Feed**: Traveler scrolls an editorial feed of curated Odisha destinations.
3. **Filter by District**: Traveler selects `Puri` district filter chip. Feed immediately updates with verified destinations in Puri (Konark, Jagannath Temple, Raghurajpur).
4. **Select Destination**: Traveler taps `Konark Sun Temple`.
5. **Place Detail Presentation**:
   - iOS: Interactive modal sheet expands with smooth spring physics.
   - Android: Bottom sheet expands to edge-to-edge detail view.
6. **Information Consumed**:
   - Verified high-res WebP hero image.
   - Truth badge: `[● Verified Official]` (Archaeological Survey of India).
   - Live weather badge: `[☁ Live · 31°C · Humidity 78%]`.
   - Cultural essay on 13th-century Kalinga architecture and solar chariot iconography.
7. **Action**: Traveler taps **Save to Trip** (persisted locally immediately).

---

## 2. Journey 2: Constraint-Aware Trip Planning

1. **Entry**: Traveler taps the **Plan** tab.
2. **Parameters Entered**:
   - Duration: 3 Days
   - Starting Location: Bhubaneswar Railway Station (Master Canteen)
   - Interests: Heritage & Temple Architecture, Traditional Handlooms
   - Mobility: Public Transit + Short Walking
3. **Deterministic Evaluation**:
   - Backend `ItineraryService` computes feasible schedule sequences respecting:
     - Opening hours (e.g. Mukteshwar dawn access; State Museum closed Mondays).
     - Mo Bus Route 10 and Route 11 timetables.
     - Maximum 800m walking tolerance per leg.
4. **Timeline Rendered**: Day 1, Day 2, Day 3 cards displayed with explicit scheduled bus departures.
5. **Conversational Refinement**: Traveler asks AI Assistant: *"Can we stop for lunch at an authentic Odia thali near Lingaraj?"*
   - AI interprets intent, queries PostGIS verified food points, inserts authenticated restaurant stop into Day 1 schedule without breaking transit timings.
6. **Save**: Traveler taps **Save Itinerary** (synced to local Room / SwiftData store).

---

## 3. Journey 3: Active Trip & Turn-by-Turn Navigation

1. **Entry**: Traveler opens a saved itinerary on the day of travel.
2. **Current Leg Highlighted**: *"Next: Lingaraj Temple (Leg 2 of 4)"*.
3. **First-Mile Evaluation**:
   - App queries hardware GPS (`LocationState.LiveDeviceLocation`).
   - Distance to Mo Bus Stop `Lingaraj Temple Road`: $420\text{ m}$.
   - Shared `FirstMileEngine` returns: `WALK_REASONABLE` ($420\text{ m} \le 800\text{ m}$).
   - Walking guidance pill rendered: *"🚶 5 min walk to bus stop"*.
4. **Turn-by-Turn Navigation Trigger**:
   - Traveler taps **Navigate**.
   - System triggers native deep link:
     ```
     https://www.google.com/maps/dir/?api=1&destination=20.2382,85.8336&travelmode=walking
     ```
   - Hands off seamlessly to native Google Maps / Apple Maps.
   - O-TRAVELZ incurs $0.00 routing API cost; traveler receives real-time voice guidance.

---

## 4. Journey 4: Transit Schedule Lookup

1. **Entry**: Traveler selects the **Transit** tab.
2. **Select Region**: Traveler selects `Capital Region (Bhubaneswar, Cuttack, Puri)`.
3. **Search Route**: Traveler enters `Route 10`.
4. **Route Overview**:
   - Corridor: Master Canteen $\leftrightarrow$ Biju Patnaik International Airport.
   - Mode: Non-AC / AC CRUT Mo Bus.
   - Operating Hours: 06:30 IST to 21:30 IST.
5. **Upcoming Departures**:
   - Shows: `Scheduled · 10:15 IST`, `Scheduled · 10:45 IST`.
   - Explicit disclaimer: *"Scheduled timetable departure. Live vehicle tracking is not available."*
6. **Stop Inspection**: Traveler taps stop `Airport Terminal`.
   - Displays locality: `OFFICIAL_SERVICE_AREA · Airport Circle`.
   - Locality chip prevents drawing inaccurate 1m walking paths until coordinates are physically verified.

---

## 5. Journey 5: Community Contribution & Ride Verification

1. **Entry**: Traveler boards Mo Bus Route 24 and opens **Transit Check-In**.
2. **Stop Check-In**: Traveler confirms arrival at candidate stop `Khandagiri Crossing`.
3. **Data Captured**:
   - Hardware GPS lat/lon snapshot.
   - Timestamp in IST.
   - Optional photo of physical bus stop signboard via CameraX (Android) / AVCapture (iOS).
4. **Consensus Engine**:
   - Shared `RideVerificationEngine` checks observation count for `Khandagiri Crossing`.
   - If consensus threshold ($\ge 5$ independent observations from distinct devices within $25\text{ m}$) is met, stop candidate is staged for official promotion.

---

## 6. Journey 6: Complete Offline Flight Mode

1. **Pre-condition**: Traveler enters Similipal National Park or rural Keonjhar with zero cellular reception (Airplane Mode active).
2. **App Launch**: App opens instantly in under 1.5 seconds.
3. **State Indicator**: Subtle banner at top of canvas: *"Viewing cached offline atlas"*.
4. **Navigation**:
   - All 204 verified places are fully readable from local SQLite / SwiftData storage.
   - Cached WebP photos render crisply from disk cache.
   - Haversine distance calculations evaluate instantaneously via local KMP math.
5. **Weather & Live Telemetry**:
   - Displays: *"Weather cached 3h ago · 29°C"*.
   - Never displays fake 0°C or fake current weather.

---

## 7. Journey 7: Failure & Network Recovery

1. **Failure Event**: Traveler attempts to refresh weather or query AI assistant during an intermittent network drop.
2. **Immediate UI State**:
   - Active network request times out after 3.5 seconds.
   - UI transitions cleanly to `ERROR` state.
   - Permitted copy: *"Unable to reach server. Tap to retry."*
3. **Recovery**:
   - Connection restored. Traveler taps Retry.
   - Request completes; UI smoothly updates to `CONTENT` without screen flickering or scroll position reset.
