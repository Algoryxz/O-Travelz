# O-TRAVELZ Mobile V4 — Persistence Canonical Identity Contract

> **Authoritative Persistence Identity Contract**  
> Wave: `M14` | Status: `APPROVED_CANONICAL_CONTRACT` | Date: `2026-09-08`  
> Principle: **Reference Canonical Truth; Never Fork or Mutate Authoritative Data**

---

## 1. The Canonical Identity Principle

The 204 canonical places and 154 transit routes in O-TRAVELZ represent the single source of truth for Odisha cultural geography and transit. User persistence must strictly **reference** these canonical entities via immutable identifiers (`canonical_place_id`, `route_id`), rather than duplicating or forking them as user-editable records.

Every persisted user artifact falls into one of two categories:
1. **Canonical Identity Reference**: The immutable foreign key identifying the official place or route.
2. **Display Snapshot**: A frozen copy of non-authoritative presentation attributes (name, category, thumbnail URL) captured at the moment of bookmarking or plan generation, enabling offline rendering without network roundtrips.

> [!CRITICAL]
> Display snapshots are strictly classified as `DISPLAY_SNAPSHOT`. They are never `CANONICAL_AUTHORITY`. If canonical metadata changes in a future catalog update, the display snapshot provides graceful fallback but never overrides live or bundled canonical truth.

---

## 2. Entity Identity Contracts

### 2.1 `SavedPlace` Contract
- **Primary Key**: `canonicalPlaceId: String` (Guarantees idempotency: saving the same place twice updates timestamp, never duplicates).
- **Audit Timestamp**: `savedAt: Long` (Epoch milliseconds).
- **Display Snapshot** (`DISPLAY_SNAPSHOT`):
  - `placeName: String`
  - `category: String`
  - `district: String?`
  - `imageUrl: String?`
  - `rating: Double?`
- **Canonical Boundary**: Coordinates, opening hours, cultural essays, entry fees, and transit stops are **not** persisted here; they are resolved live or from bundled canonical data.

### 2.2 `SavedTrip` & `SavedTripStop` Contract
- **Primary Key**: `tripId: String` (UUID generated locally upon save).
- **Provenance & Metadata**:
  - `title: String` (User-facing or default generated title, e.g. "1-Day Bhubaneswar Itinerary")
  - `createdAt: Long`, `updatedAt: Long`
  - `daysCount: Int`
  - `startHub: String?`
  - `schemaVersion: Int` (starts at 1)
  - `constraintsSnapshotJson: String` (serialized constraints used to generate the plan)
  - `aiCompanionExplanation: String?` (grounded explanation captured at generation)
- **Stop Identity Contract (`SavedTripStop`)**:
  - `stopId: String` (UUID)
  - `tripId: String` (Foreign Key referencing `SavedTrip`)
  - `dayNumber: Int` (1..7)
  - `stopSequence: Int` (1..3)
  - `canonicalPlaceId: String` (Reference to official catalog)
  - `placeName: String`, `category: String` (`DISPLAY_SNAPSHOT`)
  - `plannedArrival: String?`, `plannedDeparture: String?`
  - `hopToNextMode: String?`, `hopToNextMinutes: Int?`, `hopToNextDetail: String?`
  - `hopFare: Double?` (Strictly `null`)

### 2.3 `TripProgress` Contract
- **Primary Key**: `tripId: String` (One-to-one relationship with `SavedTrip`).
- **Operational Progress**:
  - `isActive: Boolean` (Only one trip can be active at a time)
  - `activeDay: Int` (1-indexed, starts at 1)
  - `currentMilestoneIndex: Int` (0-indexed position within the day's timeline)
  - `completedStopIdsJson: String` (JSON array of visited `canonicalPlaceId`s)
  - `skippedStopIdsJson: String` (JSON array of skipped `canonicalPlaceId`s)
  - `startedAt: Long?`, `lastUpdatedAt: Long`
  - `completionState: String` (`"ACTIVE"`, `"PAUSED"`, `"COMPLETED"`, `"CANCELLED"`)

---

## 3. Truth Invariants

1. **Zero Fake Coordinates**: Saved places and stops never invent or interpolate coordinates.
2. **Zero Inferred Fares**: Transit hop fares in saved trips remain strictly `null`.
3. **Deterministic Ordering**: Stops preserve `dayNumber` and `stopSequence` strictly.
4. **Idempotent Bookmarks**: Re-saving an existing place ID updates `savedAt` without altering database count.
5. **Cascade Independence**: Deleting a saved place or saved trip has zero effect on canonical catalog data.
