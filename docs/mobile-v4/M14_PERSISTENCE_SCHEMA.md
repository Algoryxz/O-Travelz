# O-TRAVELZ Mobile V4 — Persistence Schema Specification

> **Authoritative Specification: Unified Cross-Platform Persistence Schema**  
> Engines: **Android Room SQLite (v1) & iOS SwiftData (@Model)**  
> Wave: `M14` | Status: `APPROVED_SCHEMA` | Date: `2026-09-08`

---

## 1. Schema Overview

O-TRAVELZ Mobile V4 persists user artifacts locally using native platform engines: **Room** on Android and **SwiftData** on iOS. Both engines adhere to an identical conceptual domain schema.

```
┌─────────────────────────┐             ┌─────────────────────────┐
│       SavedPlace        │             │        SavedTrip        │
├─────────────────────────┤             ├─────────────────────────┤
│ PK canonicalPlaceId     │             │ PK tripId (UUID)        │
│    savedAt              │             │    title                │
│    placeName            │             │    daysCount            │
│    category             │             │    startHub             │
│    district             │             │    createdAt            │
│    imageUrl             │             │    updatedAt            │
│    rating               │             │    constraintsJson      │
└─────────────────────────┘             │    aiExplanation        │
                                        │    schemaVersion        │
                                        └───────────┬─────────────┘
                                                    │ 1
                                                    │
                                      ┌─────────────┴─────────────┐
                                      │ 1..*                      │ 0..1
                                      ▼                           ▼
                        ┌─────────────────────────┐ ┌─────────────────────────┐
                        │      SavedTripStop      │ │      TripProgress       │
                        ├─────────────────────────┤ ├─────────────────────────┤
                        │ PK stopId (UUID)        │ │ PK tripId (FK)          │
                        │ FK tripId               │ │    isActive             │
                        │    dayNumber (1..7)     │ │    activeDay (1..7)     │
                        │    stopSequence (1..3)  │ │    currentMilestoneIndex│
                        │    canonicalPlaceId     │ │    completedStopIdsJson │
                        │    placeName            │ │    skippedStopIdsJson   │
                        │    category             │ │    startedAt            │
                        │    plannedArrival       │ │    lastUpdatedAt        │
                        │    plannedDeparture     │ │    completionState      │
                        │    hopMode              │ └─────────────────────────┘
                        │    hopMinutes           │
                        │    hopDetail            │
                        │    hopFare (null)       │
                        └─────────────────────────┘
```

---

## 2. Field-by-Field Specification Matrix

### 2.1 Table: `saved_places` / Model: `SavedPlaceModel`

| Semantic Field | Android Room Type | iOS SwiftData Type | Null? | Default | Mutable by User? | Authority Class | Cascade / Deletion | Sync Semantics | Privacy Class |
|---|---|---|---|---|---|---|---|---|---|
| `canonicalPlaceId` | `String` (PK) | `String` (@Attribute(.unique)) | No | None | No | CANONICAL_REF | Hard delete removes row | Local only | LOW_SENSITIVITY |
| `savedAt` | `Long` | `Date` / `Int64` | No | System time | No | USER_METADATA | Retained until unsaved | Local only | LOW_SENSITIVITY |
| `placeName` | `String` | `String` | No | None | No | DISPLAY_SNAPSHOT | Retained until unsaved | Local only | LOW_SENSITIVITY |
| `category` | `String` | `String` | No | None | No | DISPLAY_SNAPSHOT | Retained until unsaved | Local only | LOW_SENSITIVITY |
| `district` | `String?` | `String?` | Yes | null | No | DISPLAY_SNAPSHOT | Retained until unsaved | Local only | LOW_SENSITIVITY |
| `imageUrl` | `String?` | `String?` | Yes | null | No | DISPLAY_SNAPSHOT | Retained until unsaved | Local only | LOW_SENSITIVITY |
| `rating` | `Double?` | `Double?` | Yes | null | No | DISPLAY_SNAPSHOT | Retained until unsaved | Local only | LOW_SENSITIVITY |

---

### 2.2 Table: `saved_trips` / Model: `SavedTripModel`

| Semantic Field | Android Room Type | iOS SwiftData Type | Null? | Default | Mutable by User? | Authority Class | Cascade / Deletion | Sync Semantics | Privacy Class |
|---|---|---|---|---|---|---|---|---|---|
| `tripId` | `String` (PK) | `String` (@Attribute(.unique)) | No | UUID | No | USER_IDENTITY | Cascades stops & progress | Local only | PRIVATE_TRAVEL |
| `title` | `String` | `String` | No | Generated | Yes | USER_METADATA | Cascades on trip delete | Local only | PRIVATE_TRAVEL |
| `daysCount` | `Int` | `Int` | No | 1 | No | USER_METADATA | Cascades on trip delete | Local only | PRIVATE_TRAVEL |
| `startHub` | `String?` | `String?` | Yes | null | No | USER_METADATA | Cascades on trip delete | Local only | PRIVATE_TRAVEL |
| `createdAt` | `Long` | `Date` / `Int64` | No | System time | No | USER_METADATA | Cascades on trip delete | Local only | PRIVATE_TRAVEL |
| `updatedAt` | `Long` | `Date` / `Int64` | No | System time | Yes | USER_METADATA | Cascades on trip delete | Local only | PRIVATE_TRAVEL |
| `constraintsJson`| `String` | `String` | No | None | No | SNAPSHOT_CONFIG | Cascades on trip delete | Local only | PRIVATE_TRAVEL |
| `aiExplanation` | `String?` | `String?` | Yes | null | No | DISPLAY_SNAPSHOT | Cascades on trip delete | Local only | PRIVATE_TRAVEL |
| `schemaVersion` | `Int` | `Int` | No | 1 | No | SYSTEM_META | Cascades on trip delete | Local only | PRIVATE_TRAVEL |

---

### 2.3 Table: `saved_trip_stops` / Model: `SavedTripStopModel`

| Semantic Field | Android Room Type | iOS SwiftData Type | Null? | Default | Mutable by User? | Authority Class | Cascade / Deletion | Sync Semantics | Privacy Class |
|---|---|---|---|---|---|---|---|---|---|
| `stopId` | `String` (PK) | `String` (@Attribute(.unique)) | No | UUID | No | USER_IDENTITY | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `tripId` | `String` (FK, Index) | Relationship (`trip`) | No | None | No | USER_IDENTITY | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `dayNumber` | `Int` | `Int` | No | 1 | No | SNAPSHOT_FACT | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `stopSequence` | `Int` | `Int` | No | 1 | No | SNAPSHOT_FACT | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `canonicalPlaceId`| `String` | `String` | No | None | No | CANONICAL_REF | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `placeName` | `String` | `String` | No | None | No | DISPLAY_SNAPSHOT | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `category` | `String` | `String` | No | None | No | DISPLAY_SNAPSHOT | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `plannedArrival` | `String?` | `String?` | Yes | null | No | DISPLAY_SNAPSHOT | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `plannedDeparture`| `String?`| `String?` | Yes | null | No | DISPLAY_SNAPSHOT | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `hopMode` | `String?` | `String?` | Yes | null | No | DISPLAY_SNAPSHOT | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `hopMinutes` | `Int?` | `Int?` | Yes | null | No | DISPLAY_SNAPSHOT | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `hopDetail` | `String?` | `String?` | Yes | null | No | DISPLAY_SNAPSHOT | Deleted with trip | Local only | PRIVATE_TRAVEL |
| `hopFare` | `Double?` | `Double?` | Yes | null (always) | No | CANONICAL_TRUTH | Deleted with trip | Local only | PRIVATE_TRAVEL |

---

### 2.4 Table: `trip_progress` / Model: `TripProgressModel`

| Semantic Field | Android Room Type | iOS SwiftData Type | Null? | Default | Mutable by User? | Authority Class | Cascade / Deletion | Sync Semantics | Privacy Class |
|---|---|---|---|---|---|---|---|---|---|
| `tripId` | `String` (PK, FK) | `String` (@Attribute(.unique)) | No | None | No | USER_IDENTITY | Deleted with trip | Local only | PRIVATE_ACTIVITY |
| `isActive` | `Boolean` | `Bool` | No | false | Yes | OPERATIONAL_STATE| Cleared on End Trip | Local only | PRIVATE_ACTIVITY |
| `activeDay` | `Int` | `Int` | No | 1 | Yes | OPERATIONAL_STATE| Cleared on End Trip | Local only | PRIVATE_ACTIVITY |
| `currentMilestoneIndex`| `Int` | `Int` | No | 0 | Yes | OPERATIONAL_STATE| Cleared on End Trip | Local only | PRIVATE_ACTIVITY |
| `completedStopIdsJson` | `String` | `String` | No | "[]" | Yes | OPERATIONAL_STATE| Cleared on End Trip | Local only | PRIVATE_ACTIVITY |
| `skippedStopIdsJson` | `String` | `String` | No | "[]" | Yes | OPERATIONAL_STATE| Cleared on End Trip | Local only | PRIVATE_ACTIVITY |
| `startedAt` | `Long?` | `Date?` / `Int64?` | Yes | null | Yes | USER_METADATA | Cleared on End Trip | Local only | PRIVATE_ACTIVITY |
| `lastUpdatedAt`| `Long` | `Date` / `Int64` | No | System time | Yes | USER_METADATA | Cleared on End Trip | Local only | PRIVATE_ACTIVITY |
| `completionState`| `String`| `String` | No | "IN_PROGRESS"| Yes | OPERATIONAL_STATE| Cleared on End Trip | Local only | PRIVATE_ACTIVITY |
