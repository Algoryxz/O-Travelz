# O-TRAVELZ V4 — Release Readiness, Hardware Validation & QA

> **Authoritative Release & Quality Assurance Specification**  
> Testing Hierarchy: **Shared Unit Tests $\rightarrow$ Platform Native UI Tests $\rightarrow$ Physical Hardware Verification**  
> Target Platforms: **Web (Vite/React) | iOS (iPhone Hardware Target) | Android (Emulator Matrix $\rightarrow$ Physical Target)**  
> Document Version: `4.0.0` | Last Updated: `2026-09-04`

---

## 1. Quality Philosophy & Provisional Metrics

> **Performance Metric Rule**:
> Numeric latency and FPS targets documented below represent **provisional engineering goals**. They must not be claimed as verified achievements until before/after empirical baselines are measured on real devices.

### 1.1 Provisional Performance Budgets
* **Web Initial Page Load**: Target LCP $< 2.2\text{ s}$ on fast 4G; bundle size $< 450\text{ KB}$ (excluding on-demand map tiles and media).
* **Map Rendering**: Target steady $60\text{ fps}$ pan/zoom interactions across WebGL, MapKit, and Google Maps Compose.
* **Spatial Search Latency**: Target $< 100\text{ ms}$ query response from PostgreSQL/PostGIS for localized bounding boxes.
* **Deterministic First-Mile Math**: $< 1\text{ ms}$ CPU execution in Kotlin Multiplatform (`FirstMileEngine`).

---

## 2. Platform Hardware Validation Strategy

```
┌──────────────────────────────────────────────┐
│  Phase 1: iOS Physical iPhone Validation     │  User has direct access to physical iPhone
│  Hardware GPS, MapKit, Dynamic Type, OLED    │  Immediate hardware-in-the-loop testing
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Phase 2: Android Emulator Matrix Validation │  Kotlin 2.0+ & Compose build matrix
│  Pixel 7 / 8 virtual devices (API 34/35)     │  Functional UI and Room verification
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Phase 3: Android Physical Hardware Bench    │  Deferred until physical Android device
│  Battery telemetry, outdoor screen glare     │  is acquired; dev/emulator is NOT blocked
└──────────────────────────────────────────────┘
```

### 2.1 iOS Physical Validation Checklist (iPhone Target)
1. **Hardware GPS Telemetry**: Validate transition from Reference Datum mode (`OdishaBounds.MASTER_CANTEEN`) to live device lock (`LocationState.LiveDeviceLocation`) upon granting runtime permission.
2. **First-Mile Precision**: Verify pedestrian walking pill displays `Reasonable Walk` when within $800\text{ m}$ of a verified bus stop.
3. **MapKit Fluidity**: Ensure zero frame drop during rapid double-tap zoom and pan across clustered temple annotations.
4. **Accessibility (VoiceOver & Dynamic Type)**: Confirm all buttons, badges, and schedule rows scale cleanly under largest accessibility type sizes.
5. **Offline Flight Check**: Enable Airplane Mode; verify all 204 places and saved trips remain readable from SwiftData.

### 2.2 Android Hardware Verification Conditions
When measuring Android performance on physical hardware, the following environmental parameters **must be recorded**:
* Device Model & Manufacturer (e.g. Pixel, Samsung Galaxy, OnePlus).
* Android Version & API Level (e.g. Android 14 / API 34).
* Physical RAM & SoC.
* Network Condition (Wi-Fi, 4G, 5G, or Airplane Mode).
* Cold Start Latency, Warm Start Latency, Map Initial Load, Image Load Time, and Backend Round-Trip.

---

## 3. Allowed UI Network & Service States

UI components must represent genuine network conditions as **facts**, not speculative guesses:

| Allowed UI State | Definition & Trigger Condition | Permitted User Messaging |
|---|---|---|
| `CONTENT` | Data successfully loaded from backend or local cache. | Standard content presentation. |
| `LOADING` | Active network request in flight ($< 3.5\text{ s}$). | Muted skeleton shimmer (no spinning spinners). |
| `OFFLINE` | Hardware network interface disconnected. | Subtle offline banner: *"Viewing cached offline atlas"*. |
| `ERROR` | Network failure, timeout, or HTTP 5xx error. | Concrete recovery action: *"Unable to reach server. Tap to retry"*. |
| `STALE_CONTENT` | Network request failed, displaying last cached record. | Notice badge: *"Updated 2 hours ago"*. |

> **"Service Waking" Rule**:
> Only display a "service waking" or "cold-start warming" indicator if the backend or health-check API explicitly returns cold-boot telemetry. Never infer cold-start purely from response duration.

---

## 4. Multiplatform Automated Test Suites

```
                                Automated Test Pyramid
                                         / \
                                        /   \
                                       / E2E \
                                      /───────\
                                     / UI Test \
                                    /───────────\
                                   / Integration \
                                  /───────────────\
                                 /   Unit Tests    \
                                /───────────────────\
```

1. **Backend Tests (`backend/tests/`)**:
   * Command: `pytest`
   * Coverage: Fast spatial searches, deterministic route planner, multilingual normalizer, AI provider fallback chain, and security endpoints.
2. **Shared Core Tests (`mobile/shared/src/commonTest/`)**:
   * Command: `./gradlew :shared:test`
   * Coverage: `GeoPointTest`, `HaversineDistanceTest`, `OdishaBoundsTest`, `FirstMileEngineTest`, `TimetableEngineTest`, `LocationStateTest`.
3. **Web Client Tests (`frontend/`)**:
   * Command: `npm run test` & `npx tsc --noEmit`
   * Coverage: Component rendering, TypeScript strict typing, map feature adapter.
4. **iOS Native Tests (`mobile/ios/Tests/`)**:
   * Command: `xcodebuild test`
   * Coverage: SwiftData entity migrations, CoreLocation state mapping, SwiftUI view snapshots.
5. **Android Native Tests (`mobile/android/src/test/`)**:
   * Command: `./gradlew :android:testDebugUnitTest`
   * Coverage: ViewModel state flows, Room DAO queries, Compose UI interactions.
