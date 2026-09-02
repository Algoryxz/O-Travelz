# O-TRAVELZ V4 — Shared Core Scope & Boundary

> **Authoritative Specification for Kotlin Multiplatform (`mobile/shared/`)**  
> Target Artifact: **JVM / Android AAR & Apple XCFramework (`OTravelzCore.xcframework`)**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Executive Summary

The Kotlin Multiplatform (KMP) shared module (`mobile/shared/`) is designed with a **deliberately lean Phase 1 boundary**. Sharing is applied **only where it produces genuine business correctness, prevents contract drift, and simplifies cross-platform maintenance**.

Platform UI, system sensors, background tasks, local database engines, media players, and OS-specific translation resource catalogs are strictly kept platform-native.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   KMP SHARED CORE SCOPE (Phase 1)                      │
│                                                                        │
│   [ Domain Models & Contracts ]                                        │
│   • GeoPoint, LocationState, WeatherState, DataProvenance              │
│   • PlaceSummary, PlaceDetail, TransitStop, ItineraryPlan              │
│                                                                        │
│   [ Deterministic Algorithms & Engines ]                               │
│   • HaversineDistance: Spherical math (R = 6371.0 km)                  │
│   • OdishaBounds: Coarse geographic helper (17.8–22.6°N, 81.4–87.5°E)  │
│   • FirstMileEngine: Proximity classification (≤800m, 800-1500m, >1.5k)│
│   • TimetableEngine: Departure matching against IST clock blocks       │
│   • SearchFilterEngine: Query normalization, district & category filter│
│                                                                        │
│   [ Domain Repository Interfaces ]                                     │
│   • PlacesRepository, TransitRepository, PlannerRepository            │
│   • Localization string keys (keys only, zero embedded translations)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1 Detailed Component Inventory

### 2.1 Geospatial & Math (`com.otravelz.shared.geo`)
* **`GeoPoint`**: Immutable coordinate model `(latitude: Double, longitude: Double)`. Validates sane ranges ($-90.0 \le \text{lat} \le 90.0$, $-180.0 \le \text{lon} \le 180.0$).
* **`HaversineDistance`**:
  $$\Delta\sigma = 2 \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cos\phi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right)} \right), \quad d = R \cdot \Delta\sigma \ (R = 6371.0\text{ km})$$
  Pure mathematical implementation with no platform dependencies.
* **`OdishaBounds`**: Geographic bounding box helper ($17.8^\circ\text{--}22.6^\circ\text{N}$, $81.4^\circ\text{--}87.5^\circ\text{E}$).
  * *Purpose*: Coarse bounding and validation helper for map initial framing and regional sanity checks.
  * *Constraint*: NOT a truth oracle for place validity.

---

### 2.2 First-Mile Engine (`com.otravelz.shared.engine`)
* **`FirstMileEngine`**:
  Canonical distance classification:
  * $\le 800\text{ m}$: `FirstMileBand.WALK_REASONABLE`
  * $> 800\text{ m}$ and $\le 1500\text{ m}$: `FirstMileBand.WALK_OR_SHORT_AUTO`
  * $> 1500\text{ m}$: `FirstMileBand.AUTO_OR_CAB_RECOMMENDED`
* **Real-GPS Gating Rule**: Personalized guidance evaluates strictly when device location state is `LIVE_DEVICE_LOCATION`. When in `REFERENCE_ORIGIN`, `PERMISSION_DENIED`, or `UNAVAILABLE`, first-mile evaluation evaluates to `null`.

---

### 2.3 Truth, Provenance & State Models (`com.otravelz.shared.provenance`)
* **Orthogonal Dimensions**:
  1. **`ProvenanceSource`** (Origin of truth): `VERIFIED_OFFICIAL`, `VERIFIED_GEOSPATIAL`, `COMMUNITY_VERIFIED`, `RESEARCHED`, `UNVERIFIED`.
  2. **`DataTier`** (Temporal/Runtime state): `LIVE`, `SCHEDULED`, `ESTIMATED`, `FALLBACK`, `UNAVAILABLE`.
* **`LocationState`**:
  - `LiveDeviceLocation(point: GeoPoint, accuracyMeters: Double?)`
  - `ReferenceOrigin(point: GeoPoint = MasterCanteen, label: String = "Bhubaneswar Master Canteen")`
  - `PermissionDenied`
  - `Unavailable`
* **`WeatherState`**: Explicit nullable fields ensuring missing weather never defaults to $0^\circ\text{C}$ or fake "clear" skies.

---

### 2.4 Search, Filter & Timetable Engines (`com.otravelz.shared.engine`)
* **`SearchFilterEngine`**: Deterministic query normalization, tokenization, 30-district filter, and category matching. Zero vector DB or heavy dependencies.
* **`TimetableEngine`**: Pure timetable schedule search matching current IST clock against scheduled departure blocks. Strict invariant: Scheduled data is labeled `SCHEDULED` (never `LIVE`).

---

## 3. Platform-Native Scope Boundaries

| Area | Android Native (`mobile/android/`) | iOS Native (`mobile/ios/`) |
|---|---|---|
| **UI & Layout** | Jetpack Compose (Material 3) | SwiftUI 17+ (SF Pro / Rounded / Materials) |
| **View Navigation** | Jetpack Navigation Compose | SwiftUI `NavigationStack` & `NavigationPath` |
| **Local Persistence** | Room SQLite (`@Dao`, `@Entity`) | SwiftData (`@Model`) / CoreData |
| **Hardware Location**| `FusedLocationProviderClient` | `CLLocationManager` (When In Use only) |
| **Media Playback** | Media3 (ExoPlayer) | AVPlayer / AVKit |
| **Notifications** | `NotificationCompat` & NotificationManager | `UNUserNotificationCenter` |
| **Map Rendering** | MapLibre Native / Compose Spatial Map | Apple MapKit (`SwiftUI.Map`) |
| **Translations** | `res/values*/strings.xml` (EN, OR, HI) | `Localizable.xcstrings` (EN, OR, HI) |
| **Networking** | OkHttp / Retrofit | URLSession / Async-Await |
