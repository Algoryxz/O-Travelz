# O-TRAVELZ Mobile V4 ? Native Project Architecture & Boundary Specification

> **Authoritative Multiplatform Architecture & Source-Set Boundary Specification**<br>
> Scope: **Wave M5 Native Bootstrap**<br>
> Architecture: **Dual-Native (Compose + SwiftUI) with Narrow Deterministic KMP Core**<br>
> Version: `4.0.0` | Status: `FROZEN_SPECIFIED` | Date: `2026-09-08`

---

## 1. System Topology & Architectural Philosophy

O-TRAVELZ Mobile V4 strictly follows a **Dual-Native** architectural model:
- **Android V4**: 100% Native Kotlin + Jetpack Compose + Material 3 Expressive (`mobile/android/`).
- **iOS V4**: 100% Native Swift 6 + SwiftUI + Apple HIG Publication System (`mobile/ios/`).
- **Shared Core**: Pure Kotlin Multiplatform (`mobile/shared/`) providing **deterministic mathematical parity** for truth boundaries, coordinate bounding boxes, timetable schedule evaluation, and haversine calculations.

### Absolute Invariant: Zero Cross-Platform UI Frameworks
- NO Compose Multiplatform for UI.
- NO Flutter.
- NO React Native.
- NO shared XML / HTML / WebView shells.

---

## 2. Module Boundary Hierarchy & Dependency Direction

```
                    ???????????????????????????
                    ?       External APIs     ?
                    ?   (Aiven DB / CRUT Mo)  ?
                    ???????????????????????????
                                 ? HTTP/JSON
        ???????????????????????????????????????????????????
        ?                                                 ?
???????????????????????????                     ?????????????????????????
?   Android Application   ?                     ?    iOS Application    ?
?    (Jetpack Compose)    ?                     ?       (SwiftUI)       ?
?    `mobile/android/`    ?                     ?     `mobile/ios/`     ?
???????????????????????????                     ?????????????????????????
        ?                                                 ?
        ? implementation(project(":shared"))              ? links OTravelzCore.xcframework
        ?                                                 ?
        ???????????????????????????????????????????????????
                                 ?
                    ???????????????????????????
                    ?   KMP Deterministic     ?
                    ?      Domain Core        ?
                    ?    `mobile/shared/`     ?
                    ???????????????????????????
```

### Dependency Rules:
1. `mobile/android/` depends on `:shared`.
2. `mobile/ios/` links `OTravelzCore` (produced by `:shared`).
3. `mobile/android/` and `mobile/ios/` **MUST NEVER** depend on each other.
4. `mobile/shared/` **MUST NEVER** depend on Android UI, iOS UI, or platform-specific presentation libraries.

---

## 3. Strict Shared-Core Scope Boundaries

The `:shared` module is restricted to pure, deterministic logic.

### Permitted in `:shared`:
- Geographic calculations (Haversine distances, bounding box evaluations in `OdishaBounds`).
- Timetable evaluation (Matching current time to 5,549 scheduled CRUT departures in `TimetableEngine`).
- First-mile distance bands and candidate-stop proximity classifications.
- Truth-state classifications and provenance models (`LocationState`, `WeatherState`).
- Data models / DTO contracts and localization key definitions.

### Explicitly Prohibited from `:shared`:
- Jetpack Compose UI or SwiftUI bridging.
- Network clients (OkHttp, Retrofit, Ktor, URLSession).
- Database engines (Room, SQLite, SwiftData, CoreData).
- Map SDK abstractions (Google Maps, Apple MapKit, MapLibre).
- Platform lifecycle, activities, fragments, or window controllers.
- Notification dispatch or background tasks.
- Dependency injection frameworks (Hilt, Koin).
- Device permission APIs.