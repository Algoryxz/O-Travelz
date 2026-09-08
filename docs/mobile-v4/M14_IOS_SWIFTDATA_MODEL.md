# O-TRAVELZ Mobile V4 — iOS SwiftData Architecture

> **Authoritative Specification: iOS Persistence Layer**  
> Engine: **SwiftData (`@Model`) for iOS 17+**  
> Wave: `M14` | Status: `APPROVED_ARCHITECTURE` | Date: `2026-09-08`

---

## 1. Architectural Principles

1. **Native SwiftData**: Modern declarative `@Model` macros without Core Data `.xcdatamodeld` boilerplate.
2. **Actor Concurrency**: `@MainActor` isolation on UI view-models and database handlers, with background model contexts where necessary.
3. **Deterministic Sorting**: Explicit `orderIndex` and composite sorting keys (`dayNumber`, `stopSequence`) to avoid relying on non-deterministic SwiftData relationship sets.
4. **Local-First Container**: Single local container configured for `SavedPlaceModel`, `SavedTripModel`, `SavedTripStopModel`, and `TripProgressModel`. CloudKit sync is strictly disabled.

---

## 2. Model Structure

```swift
@Model
final class SavedPlaceModel {
    @Attribute(.unique) var canonicalPlaceId: String
    var savedAt: Date
    var placeName: String
    var category: String
    var district: String?
    var imageUrl: String?
    var rating: Double?
}

@Model
final class SavedTripModel {
    @Attribute(.unique) var tripId: String
    var title: String
    var daysCount: Int
    var startHub: String?
    var createdAt: Date
    var updatedAt: Date
    var constraintsJson: String
    var aiExplanation: String?
    var schemaVersion: Int
    
    @Relationship(deleteRule: .cascade, inverse: \SavedTripStopModel.trip)
    var stops: [SavedTripStopModel] = []
}

@Model
final class SavedTripStopModel {
    @Attribute(.unique) var stopId: String
    var dayNumber: Int
    var stopSequence: Int
    var canonicalPlaceId: String
    var placeName: String
    var category: String
    var plannedArrival: String?
    var plannedDeparture: String?
    var hopMode: String?
    var hopMinutes: Int?
    var hopDetail: String?
    var hopFare: Double?
    
    var trip: SavedTripModel?
}

@Model
final class TripProgressModel {
    @Attribute(.unique) var tripId: String
    var isActive: Bool
    var activeDay: Int
    var currentMilestoneIndex: Int
    var completedStopIdsJson: String
    var skippedStopIdsJson: String
    var startedAt: Date?
    var lastUpdatedAt: Date
    var completionState: String
}
```
