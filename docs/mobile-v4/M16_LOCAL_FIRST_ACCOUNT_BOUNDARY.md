# M16 Local-First Account Boundary: Data Ownership & Storage Isolation

## 1. Architectural Invariant
```
LOCAL_DATA_OWNER  = DEVICE_DATABASE
ACCOUNT_IDENTITY  = OPTIONAL_ASSOCIATION
```

Under no circumstances does Wave M16 modify existing M14 Room or SwiftData schemas to mandate `userId NOT NULL`.

All user-generated travel artifacts:
- Saved places (`SavedPlaceEntity` / `SavedPlaceModel`)
- Saved trips (`SavedTripEntity` / `SavedTripModel`)
- Saved trip stops (`SavedTripStopEntity` / `SavedTripStopModel`)
- Active trip progress (`TripProgressEntity` / `TripProgressModel`)
- Offline transit bundles and cached map vector tiles

belong strictly to the local physical device instance.

## 2. Entity Storage Classification

```
+---------------------------------------------------------------------------------+
|                               DEVICE LOCAL ONLY                                 |
|               (Never synced, never wiped on logout or auth failure)             |
+---------------------------------------------------------------------------------+
| 1. Saved Places (Room `saved_places` / SwiftData `SavedPlaceModel`)             |
| 2. Saved Trips (Room `saved_trips` / SwiftData `SavedTripModel`)                |
| 3. Trip Progress (Room `trip_progress` / SwiftData `TripProgressModel`)         |
| 4. Active Navigation State & Current Milestone Markers                          |
| 5. Offline Media Cache, Map Tiles, Vector Fonts                                 |
| 6. Emergency Call Logs & Recent Search Queries                                  |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
|                            ACCOUNT IDENTITY ATTRIBUTES                          |
|                     (Server-verified, stored in secure keystore)                |
+---------------------------------------------------------------------------------+
| 1. Canonical User ID (`usr-...` / UUID)                                         |
| 2. Verified Primary Email                                                       |
| 3. Display Name & Full Name                                                     |
| 4. Profile Avatar URL (Google usercontent)                                      |
| 5. Identity Provider Tag (`google`)                                             |
| 6. Server Session Token (Keystore/Keychain only)                               |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
|                      CROSS-DEVICE SYNC CAPABILITY BOUNDARY                      |
+---------------------------------------------------------------------------------+
| Wave M16 Status: DEFERRED / NOT IMPLEMENTED                                     |
| Reason: Backend has no delta sync engine, tombstone tracking, or vector clock   |
| conflict resolution. Local storage remains 100% authoritative.                  |
+---------------------------------------------------------------------------------+
```

## 3. Account Association Semantics
When a user signs in:
1. The client receives a session token and user profile metadata.
2. The UI reflects the user's signed-in status in the You tab.
3. The local Room/SwiftData tables continue to operate exactly as before. Existing bookmarks and itineraries are immediately visible.
4. No background process uploads or modifies local records without explicit future sync architecture.

When a user signs out:
1. The server session is invalidated via `POST /auth/logout`.
2. The local secure hardware storage (Keystore/Keychain) is purged of the session token and cached user profile.
3. **Local Room/SwiftData rows are strictly preserved.** The traveler does not lose their planned itinerary or active trip progress.
