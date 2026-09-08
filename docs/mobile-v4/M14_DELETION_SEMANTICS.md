# O-TRAVELZ Mobile V4 — Persistence Deletion & Cascade Semantics

> **Authoritative Specification: Deletion Lifecycle & Referential Integrity**  
> Wave: `M14` | Status: `APPROVED_SEMANTICS` | Date: `2026-09-08`

---

## 1. Deletion Principles

1. **User Ownership**: All persisted data is strictly user-created or user-bookmarked. The user has full sovereign rights to delete any saved place, saved trip, or active trip progress at any time.
2. **Canonical Independence**: User deletion actions operate strictly on user tables/models (`saved_places`, `saved_trips`, `saved_trip_stops`, `trip_progress`). Deleting a user row **never** affects or cascades to the underlying 204 canonical places, 154 transit routes, or bundled assets.
3. **Deterministic Cascade**: Child records that have no independent meaning without their parent must cascade cleanly.

---

## 2. Specific Deletion Behaviors

### 2.1 Delete Saved Place (`Unsave Place`)
- **Action**: User taps the active bookmark button on Place Detail or swipes to delete in Trips Root.
- **Database Action**: `DELETE FROM saved_places WHERE canonical_place_id = :placeId` (Room) / `context.delete(savedPlace)` (SwiftData).
- **Cascade**: None. No child records exist for a saved place.
- **Side Effects**: UI updates reactively via Flow / `@Query`. Canonical catalog place remains untouched.

### 2.2 Delete Saved Trip (`Delete Itinerary`)
- **Action**: User selects "Delete Trip" from the saved trip card or detail.
- **Confirmation**: Native confirmation alert ("Delete Saved Itinerary? This cannot be undone.").
- **Database Action**:
  - `saved_trips` row is deleted.
  - Foreign key constraint with `ON DELETE CASCADE` automatically deletes all associated rows in `saved_trip_stops`.
  - Associated `trip_progress` row is also deleted.
- **Active Trip Implication**: If the trip being deleted is currently active, the active trip state is cleared.

### 2.3 End Active Trip (`Finish / Cancel Active Trip`)
- **Action**: User marks all stops completed, or taps "End Trip" / "Cancel Active Trip".
- **Confirmation**: Confirmation prompt if ended before all milestones are visited.
- **Database Action**:
  - `trip_progress.isActive` is set to `false`.
  - `trip_progress.completionState` is updated to `"COMPLETED"` or `"CANCELLED"`.
- **Preservation Rule**: Ending an active trip **does NOT delete the saved trip**. The itinerary remains safely in the "Saved Trips" archive.
