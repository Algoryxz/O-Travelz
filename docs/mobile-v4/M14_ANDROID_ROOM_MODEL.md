# O-TRAVELZ Mobile V4 — Android Room SQLite Architecture

> **Authoritative Specification: Android Persistence Layer**  
> Engine: **androidx.room:room-runtime / room-ktx (2.6.1) via KSP**  
> Wave: `M14` | Status: `APPROVED_ARCHITECTURE` | Date: `2026-09-08`

---

## 1. Architectural Principles

1. **Smallest Truthful Layer**: Zero dependency injection frameworks (No Hilt, No Koin). Singleton database access provided via thread-safe `OTravelzDatabase.getInstance(context)`.
2. **KSP Only**: Avoid kapt. Compile-time verification of SQL queries and type converters.
3. **Normalized Child Rows**: Trip stops are persisted as distinct child rows (`saved_trip_stops`) with composite sorting indices (`dayNumber`, `stopSequence`) to avoid brittle unindexed JSON blob manipulation while allowing atomic updates.
4. **Reactive Flow Queries**: DAOs expose Kotlin `Flow`s for reactive UI observation (e.g. `observeAllSavedPlaces()`, `observeActiveTripWithStops()`).

---

## 2. Package Structure

```
mobile/android/src/main/kotlin/com/otravelz/android/data/local/
├── OTravelzDatabase.kt
├── dao/
│   ├── SavedPlaceDao.kt
│   ├── SavedTripDao.kt
│   └── TripProgressDao.kt
├── entity/
│   ├── SavedPlaceEntity.kt
│   ├── SavedTripEntity.kt
│   ├── SavedTripStopEntity.kt
│   └── TripProgressEntity.kt
└── model/
    ├── SavedTripWithStops.kt
    └── ActiveTripState.kt
```

---

## 3. Database Specification

- **Class**: `OTravelzDatabase : RoomDatabase()`
- **Database Name**: `"otravelz_user_data.db"`
- **Version**: `1`
- **Entities**:
  1. `SavedPlaceEntity`
  2. `SavedTripEntity`
  3. `SavedTripStopEntity`
  4. `TripProgressEntity`
- **Export Schema**: `false` (in v1 unit-build configuration; migration testing enabled starting with v2)

---

## 4. DAO Contracts

### 4.1 `SavedPlaceDao`
- `observeAll(): Flow<List<SavedPlaceEntity>>`
- `isPlaceSaved(placeId: String): Flow<Boolean>`
- `insert(place: SavedPlaceEntity): Long` (OnConflictStrategy.REPLACE)
- `deleteByPlaceId(placeId: String): Int`
- `deleteAll(): Int`

### 4.2 `SavedTripDao`
- `observeAllTripsWithStops(): Flow<List<SavedTripWithStops>>`
- `getTripWithStops(tripId: String): SavedTripWithStops?`
- `insertTrip(trip: SavedTripEntity)`
- `insertStops(stops: List<SavedTripStopEntity>)`
- `deleteTrip(tripId: String): Int` (Triggers cascade deletion of stops and progress)

### 4.3 `TripProgressDao`
- `observeActiveProgress(): Flow<TripProgressEntity?>`
- `getProgress(tripId: String): TripProgressEntity?`
- `upsertProgress(progress: TripProgressEntity)`
- `clearActiveState(): Int`
- `deleteProgress(tripId: String): Int`
