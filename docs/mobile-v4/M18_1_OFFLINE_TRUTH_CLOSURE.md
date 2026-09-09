# O-TRAVELZ Mobile V4 — Wave M18.1 Offline Truth Closure & Calibration

> **Authoritative M18.1 Truth Reconciliation**  
> Branch: `feature/v4-platform-rebuild`  
> Baseline SHA: `2f2963d96fe8393c185a031f710ff0dd05f2d811`  
> Document Version: `1.0.0` | Date: `2026-09-09`

---

## 1. Objectives & Grounded Facts

Wave M18.1 performs surgical truth calibration across 10 critical offline claims to eliminate all contradictions with codebase reality and repository truth.

### Summary of Calibrated Truths

| Domain / Claim | Previous M18 Report Claim | M18.1 Calibrated Reality | Repository Evidence |
|---|---|---|---|
| **Itinerary Planner** | "deterministic itinerary generation continues locally" | `NOT_IMPLEMENTED` on-device; `POST /itinerary/plan` required for new itineraries. Offline Plan supports viewing/editing saved trips. | `PlannerRepository.kt`, `PlannerRepository.swift` hit remote API. |
| **Transit Stop Count** | "3,467 stops" | **1,430 canonical stops** (173 with verified physical coordinates, 1,257 locality-only) across 154 routes with 164 variants and 1,491 stop occurrences. | `data/transport/canonical/stops.json`, `assets/transit/route_stops.json` |
| **Destination Catalog** | "bundled places remain viewable as list" | `NO_DESTINATION_REFERENCE_BUNDLE`. Discover is network-fetched; offline fresh install is empty. Map copy updated to: *"Map tiles are unavailable offline. Saved places and previously available local content can still be viewed."* | `assets/transit/` only bundled; zero destination JSON files in assets. |
| **Auth Offline Status** | "auth session … 100% offline" | Cached identity viewable offline; session token stored locally; remote session validity is `UNKNOWN_WHILE_OFFLINE`. | `AuthRepository.kt` fails open without claiming server validation. |
| **Media Cache** | "iOS utilizes URLCache.shared (guaranteed offline)" | `SYSTEM_CACHE_BEST_EFFORT` on both platforms (Coil LRU disk cache on Android, URLCache on iOS). No master images bundled. | `AsyncImage` in Compose & SwiftUI; platform cache eviction policies. |
| **Placeholder Media** | "category icon fallback" | Non-photo cultural sandstone container with Odia script and pending badge; never increments photo count or masquerades as photo. | `PlaceDetailScreen.kt`, `PlaceCardView.swift` |
| **Storage Size** | "~45 MB baseline" | **Android debug APK: 19.40 MB (20,346,607 bytes)**; iOS binary: `PENDING_MACOS`. Generic cross-platform claim removed. | Direct file system measurement of `mobile/android/build/outputs/apk/debug/android-debug.apk` |
| **Weather Cache** | Implicit TTL freshness | Explicit relative age disclosure (`Cached weather · 2h ago`), no arbitrary TTL, never labeled live/current. | `WeatherCacheStore.kt`, `WeatherCacheStore.swift` |
| **Platform Parity** | Parity implied | Android: `RUNTIME_VERIFIED`; iOS: `SOURCE_PARITY_VERIFIED / PENDING_MACOS`. | Host execution environment is Windows 11. |
| **Stage G1/G2 Boundary** | Staged packages | Stage G1 candidates remain quarantined; Stage G2 remains `LOCKED / NOT STARTED`. 0 canonical mutations. | `validate_research_staging.py`, `validate_mobile_offline_staging.py` |

---

## 2. Canonical User Copy Standards

```text
[OFFLINE PLANNER FAILURE]
Trip planning requires an internet connection.
Your saved trips remain available offline.

[OFFLINE AI ASSISTANT]
AI Assistant requires an internet connection.
You can still view saved trips and edit local trip details.

[OFFLINE MAP TILES]
Map tiles are unavailable offline.
Saved places and previously available local content can still be viewed.

[OFFLINE CACHED WEATHER]
Cached weather • {relative_time} ago
```

---

## 3. Governance Sign-off

- Canonical transport data mutations: 0
- Canonical destination data mutations: 0
- Staging data mutations: 0
- Stage G2 started: `false`
