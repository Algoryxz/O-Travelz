# Wave M14 — Trips Persistence, Saved Places, Saved Itineraries, Active-Trip Progress, Room SQLite & SwiftData

> **Authoritative Baseline Document**
> **Wave**: M14
> **Status**: COMPLETED
> **Branch**: `feature/v4-platform-rebuild`
> **Date**: September 2026

---

## 1. Overview & Core Mission

Wave M14 introduces production-grade local persistence for O-TRAVELZ Mobile V4 on both Android and iOS. Prior to M14, user bookmarks, planned itineraries, and active trip progress were transient in-memory states that did not survive application restarts.

M14 achieves complete offline persistence for:
1. **Saved Places (Bookmarks)**: Wishlist destinations saved from Discover or Place Detail.
2. **Saved Itineraries (Trips)**: Multi-day constraint-generated itineraries saved from the Planner into immutable local snapshots.
3. **Active Trip Progress**: Manual milestone tracking (Mark Visited, Skip Stop, End Trip) with resilient state restoration across app restarts.
4. **Trips Root Experience**: A unified, responsive screen presenting Active Trip, Saved Trips, and Saved Places with a calm empty state.

---

## 2. Strict Truth Boundaries & Invariants

1. **Canonical Decoupling**: Local persistence strictly references `canonicalPlaceId`. It never mutates, forks, or duplicates the canonical destinations catalog (`data/destinations/canonical/`) or transit graph (`data/transport/canonical/`). Display fields (`placeName`, `category`, `district`, `imageUrl`, `rating`) are classified as `DISPLAY_SNAPSHOT` for offline convenience only.
2. **Fare Semantics Invariant**: `hopFare` in `SavedTripStopEntity` and `SavedTripStopModel` is **strictly `null`**. No estimated, fabricated, or simulated fares are permitted.
3. **Active Trip Lifecycle**: Starting a trip requires explicit user interaction ("Start Trip"). Only **one** trip may be active at any given time. Starting a new trip deactivates any previously active trip in an atomic transaction.
4. **Manual Milestone Progression Only**: Milestones advance strictly upon manual traveler actions ("Mark Visited" or "Skip Stop"). Background location services, GPS geofencing, simulated breadcrumbs, and automated telematics claims are strictly forbidden.
5. **Stage G1 Non-Ingestion Gate**: Staged offline assets in `data/staging/mobile_offline/` remain un-ingested and un-promoted. Stage G2 remains strictly LOCKED.
6. **Zero Cloud / Account Sync**: All data remains strictly local in sandboxed device storage (Room SQLite on Android, SwiftData on iOS).

---

## 3. Storage Schema Architecture

### A. Android Room SQLite (`otravelz.db`)

| Entity / Table | Primary Key | Key Columns | Foreign Keys & Cascades |
|---|---|---|---|
| `saved_places` | `canonicalPlaceId` (String) | `savedAt`, `placeName`, `category`, `district`, `imageUrl`, `rating` | None |
| `saved_trips` | `tripId` (String) | `title`, `daysCount`, `startHub`, `createdAt`, `updatedAt`, `constraintsJson`, `aiExplanation`, `schemaVersion` | None |
| `saved_trip_stops` | `stopId` (String) | `tripId`, `dayNumber`, `stopSequence`, `canonicalPlaceId`, `placeName`, `category`, `plannedArrival`, `plannedDeparture`, `hopMode`, `hopMinutes`, `hopDetail`, `hopFare` | FK to `saved_trips(tripId)` `ON DELETE CASCADE` |
| `trip_progress` | `tripId` (String) | `isActive`, `activeDay`, `currentMilestoneIndex`, `completedStopIdsJson`, `skippedStopIdsJson`, `startedAt`, `lastUpdatedAt`, `completionState` | FK to `saved_trips(tripId)` `ON DELETE CASCADE` |

### B. iOS SwiftData (`default.store`)

| Model Class | Primary Key | Key Attributes | Relationships & Cascades |
|---|---|---|---|
| `SavedPlaceModel` | `canonicalPlaceId` | `savedAt`, `placeName`, `category`, `district`, `imageUrl`, `rating` | None |
| `SavedTripModel` | `tripId` | `title`, `daysCount`, `startHub`, `createdAt`, `updatedAt`, `constraintsJson`, `aiExplanation`, `schemaVersion` | `@Relationship(deleteRule: .cascade)` to `[SavedTripStopModel]` |
| `SavedTripStopModel` | `stopId` | `dayNumber`, `stopSequence`, `canonicalPlaceId`, `placeName`, `category`, `plannedArrival`, `plannedDeparture`, `hopMode`, `hopMinutes`, `hopDetail`, `hopFare` | Inverse relationship to `SavedTripModel` |
| `TripProgressModel` | `tripId` | `isActive`, `activeDay`, `currentMilestoneIndex`, `completedStopIdsJson`, `skippedStopIdsJson`, `startedAt`, `lastUpdatedAt`, `completionState` | Standalone progress entity |

---

## 4. UI Architecture & Navigation Wiring

- **Discover / Place Detail**: Bookmark icon in TopAppBar / Toolbar reacts immediately to persistence state. Clicking toggles save/unsave in Room / SwiftData.
- **Plan**: Generated plan displays "Save Itinerary" (with `UNSAVED` -> `SAVING` -> `SAVED` visual feedback) and "Start Trip" (persists plan, starts trip, and routes to Trips tab).
- **Trips Root**:
  - Section 1: Active Trip card with day indicator, next stop card, Mark Visited (green), Skip Stop (outlined), and End Trip.
  - Section 2: Saved Itineraries list with stop chips, Start Trip action, and confirmation-gated Delete dialog.
  - Section 3: Saved Places list with thumbnails, categories, unsave action, and tap-to-inspect.
  - Calm Empty State: Styled with Terracotta bookmark icon, cultural atlas copy, and direct navigation buttons to Plan and Discover.

---

## 5. Verification Matrix

| Target | Tool / Command | Result |
|---|---|---|
| Android Unit Tests | `.\mobile\gradlew.bat -p mobile :android:testDebugUnitTest` | PASS (40 tasks, 0 failures) |
| Android Debug APK | `.\mobile\gradlew.bat -p mobile :android:assembleDebug` | PASS (BUILD SUCCESSFUL) |
| Android Lint | `.\mobile\gradlew.bat -p mobile :android:lintDebug` | PASS (BUILD SUCCESSFUL) |
| iOS Swift Testing | `PersistenceDomainTests.swift` | SOURCE_PARITY_VERIFIED / PENDING_MACOS |
| OpenAPI Spec Sync | `python scripts/export_mobile_openapi.py --check` | PASS (In Sync) |
| Context Validation | `python scripts/check_project_context.py` | PASS (All 24 files present) |
| Research Staging | `python scripts/validate_research_staging.py` | PASS |
| Mobile Offline Staging | `python scripts/validate_mobile_offline_staging.py` | PASS |
| Knowledge Graph | `graphify update .` | PASS (16,765 nodes, 29,116 edges) |
