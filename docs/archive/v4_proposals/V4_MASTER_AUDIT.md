# O-TRAVELZ V4 — Master Audit & Legacy Code Classification

> **Authoritative Legacy Mobile Audit & Migration Classification**  
> Branch: `feature/v4-platform-rebuild` | Reference Main: `51ab34ed0342d575e55ff799189b3dd19e8aee84`  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Executive Summary

O-TRAVELZ V4 is a **full product reset**. The legacy Android implementation (V1–V3 prototypes) is preserved in git history, previous feature branches (`feature/mobile-v3-rapid-features`, `mobile/release-gate`), and release tags.

On the `feature/v4-platform-rebuild` branch, the `mobile/` directory is cleared and restarted clean:
```
mobile/
├── shared/         # Kotlin Multiplatform (KMP) domain core
├── android/        # Fresh Jetpack Compose application
└── ios/            # Fresh SwiftUI application
```

This master audit classifies every component of the legacy mobile codebase so that valuable mathematical formulas, data contracts, and proven test cases are extracted and preserved in KMP or reference documentation, while obsolete UI and legacy glue code are deleted from the V4 worktree.

---

## 2. Legacy Mobile Component Classification

### Taxonomy:
* **`PORT_TO_KMP`**: Business invariants, deterministic math, first-mile classifiers, timetable logic, provenance enums, domain entities, and repository interfaces ported directly to `mobile/shared/`.
* **`PORT_TO_ANDROID_V4`**: Android-specific platform services (LocationManager, NotificationHelper, Room DAOs) to be cleanly re-architected in fresh Android V4.
* **`PORT_TO_IOS_V4`**: Concepts/specifications to be implemented natively in Swift / SwiftUI in `mobile/ios/`.
* **`REFERENCE_ONLY`**: Preserved for reference in documentation or test suites.
* **`DELETE_FROM_V4`**: Obsolete UI screens, temporary screenshot artifacts, and legacy glue code to be removed from the V4 branch.

---

### 2.1 Code Classification Table

| Source Path (Legacy `mobile/android/`) | Component Responsibility | Classification | Destination / V4 Handling |
|---|---|---|---|
| `core/location/FirstMileEstimator.kt` | Proximity classification ($\le 800\text{m}$, $800-1500\text{m}$, $>1500\text{m}$) | `PORT_TO_KMP` | Ported to `com.otravelz.shared.engine.FirstMileEngine` in `mobile/shared/`. |
| `core/location/LocationManager.kt` | Haversine distance formula & Master Canteen datum | `PORT_TO_KMP` & `PORT_TO_ANDROID_V4` | Math extracted to `HaversineDistance.kt` in KMP; sensor wrapper re-implemented in Android V4. |
| `core/location/GeolocationState.kt` | In-memory sealed state hierarchy (`RealGps`, `FallbackReference`) | `PORT_TO_KMP` | Ported to `GeolocationState.kt` in `mobile/shared/`. |
| `data/model/DataProvenance.kt` | `DataTier`, `ClaimType`, `VerificationStatus` | `PORT_TO_KMP` | Ported to `DataProvenance.kt` in `mobile/shared/`. |
| `data/model/Models.kt` | OpenAPI mirror DTOs | `PORT_TO_KMP` | Replaced by generated DTOs and stable domain models in `mobile/shared/domain/`. |
| `core/i18n/AppLocalization.kt` | Language key definitions & time-of-day greeting | `PORT_TO_KMP` | Keys and greeting logic ported to `LocalizationKeys.kt` in KMP. |
| `data/local/BundledCatalogProvider.kt` | Reading bundled `places.json` & `stops.json` | `PORT_TO_KMP` | Ported to `BundledFallbackProvider.kt` in `mobile/shared/`. |
| `data/repository/PlacesRepository.kt` | Places search, filter, and detail lookup | `PORT_TO_KMP` | Repository interface ported to KMP; native data sources in Android/iOS. |
| `data/repository/TransitRepository.kt` | 154-route CRUT lookup & timetable next departure | `PORT_TO_KMP` | Ported to `TimetableEngine.kt` in `mobile/shared/`. |
| `data/repository/PlannerRepository.kt` | Multi-day itinerary rules & constraint models | `PORT_TO_KMP` | Ported to `ItineraryRules.kt` in `mobile/shared/`. |
| `data/repository/SavedPlacesRepository.kt` | Bookmarking CRUD interface | `PORT_TO_KMP` | Interface ported to KMP; storage in Room (Android) and SwiftData (iOS). |
| `data/repository/SavedTripsRepository.kt` | Saved trips CRUD interface | `PORT_TO_KMP` | Interface ported to KMP; storage in Room (Android) and SwiftData (iOS). |
| `core/network/ApiConfig.kt` | Image URL resolver (`resolveImageUrl`) | `PORT_TO_KMP` | Ported to `ImageUrlResolver.kt` in `mobile/shared/`. |
| `core/network/NetworkClient.kt` | Retrofit / OkHttp client configuration | `PORT_TO_ANDROID_V4` | Clean Retrofit configuration for Android V4. |
| `core/notifications/NotificationHelper.kt`| Android Notification Channels & builders | `PORT_TO_ANDROID_V4` | Re-architected with modern NotificationManager in Android V4. |
| `core/notifications/TripReminderScheduler.kt`| AlarmManager / WorkManager trip triggers | `PORT_TO_ANDROID_V4` | Re-architected in Android V4; native `UNUserNotificationCenter` in iOS V4. |
| `data/local/room/AppDatabase.kt` | Room SQLite database | `PORT_TO_ANDROID_V4` | Fresh Room schema in Android V4. |
| `data/local/room/*Dao.kt`, `*Entity.kt` | DAOs and Entities for Places, Trips, Searches | `PORT_TO_ANDROID_V4` | Fresh Room entities in Android V4; matching `@Model` in SwiftData for iOS. |
| `core/design/Color.kt`, `Typography.kt` | Design tokens (Odisha Ochre, Terracotta, etc.) | `PORT_TO_ANDROID_V4` & `PORT_TO_IOS_V4` | Standardized in `docs/V4_DESIGN_SYSTEM.md`, implemented natively in Compose and SwiftUI. |
| `test/LocationAndMathTest.kt` | Haversine and First-Mile unit tests | `PORT_TO_KMP` | Ported to `commonTest` in `mobile/shared/`. |
| `test/ModelsSerializationTest.kt` | Serialization tests for OpenAPI DTOs | `PORT_TO_KMP` | Ported to `commonTest` in `mobile/shared/`. |
| `feature/home/HomeScreen.kt` | Legacy Compose Home UI | `DELETE_FROM_V4` | Re-designed from scratch for V4. |
| `feature/discover/DiscoverScreen.kt` | Legacy Compose Discover UI | `DELETE_FROM_V4` | Re-designed from scratch for V4. |
| `feature/place/PlaceDetailScreen.kt` | Legacy Compose Place Detail UI | `DELETE_FROM_V4` | Re-designed from scratch for V4. |
| `feature/planner/PlannerScreen.kt` | Legacy Compose Planner UI | `DELETE_FROM_V4` | Re-designed from scratch for V4. |
| `feature/trips/TripsScreen.kt` | Legacy Compose Trips UI | `DELETE_FROM_V4` | Re-designed from scratch for V4. |
| `feature/map/MapScreen.kt` | Legacy Compose Map UI | `DELETE_FROM_V4` | Re-designed with MapLibre Native in Android V4 and MapKit in iOS V4. |
| `feature/transit/TransitScreen.kt` | Legacy Compose Transit UI | `DELETE_FROM_V4` | Re-designed from scratch for V4. |
| `feature/community/CommunityStagingScreen.kt`| Legacy Community UI | `DELETE_FROM_V4` | Re-designed from scratch for V4. |
| `mobile/android/*.png` (80+ screenshot files)| Test & audit screenshot artifacts | `DELETE_FROM_V4` | Removed from worktree (preserved in git history). |

---

## 3. Worktree Cleaning Plan

1. **Extraction Step**: Core domain models, math functions, first-mile classifiers, and timetable logic are compiled into `mobile/shared/`.
2. **Purge Step**: Remove old `mobile/android/` implementation files from the V4 branch.
3. **Scaffold Step**:
   - `mobile/shared/`: New Gradle KMP module.
   - `mobile/android/`: Clean Kotlin + Jetpack Compose Android app scaffold.
   - `mobile/ios/`: Clean Swift + SwiftUI iOS app scaffold.
