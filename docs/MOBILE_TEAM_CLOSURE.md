# O-TRAVELZ Mobile V3 — Team Branch & Responsibility Closure Matrix

> Canonical record of contributor branch states, delivered work, missing items, and explicit takeover decisions for the Mobile V3 Product Redesign.

---

## 1. Team Head Summary

| Contributor | Branch | Head SHA | Status | Takeover / Closure Decision |
|---|---|---|---|---|
| **Smarak Padhi** | `mobile/core-smarak` | `154aca8` | **DONE / ACTIVE LEAD** | Architecture, Data/OpenAPI, Integration, Release Gate, Akriti takeover |
| **Deeptiman Parida** | `mobile/ui-deeptiman` | `1ffa804` | **PARTIALLY_DONE** | Visual design review, token refinement; UI code integrated into V3 Compose layer |
| **Rudra** | `mobile/maps-rudra` | `9e42bbc` | **PARTIALLY_DONE** | Reference origin & spatial fallback delivered; assigned Native Map V3 |
| **Susmita** | `mobile/notifications-susmita` | `e63ff40` | **DONE** | Notification helper, channels, and intent deep-links integrated; assigned Notification V3 |
| **Akriti** | `mobile/data-akriti` | `154aca8` | **SUPERSEDED** | **TAKE_OVER_BY_SMARAK** (Data models, OpenAPI sync, Room caching) |
| **Punam** | `mobile/features-punam` | `154aca8` | **SUPERSEDED** | **TAKE_OVER_BY_SMARAK & REASSIGNED** (Trips Hub & You Screen delivered in baseline; assigned QA & physical test execution) |

---

## 2. Contributor Deep Dives & Evidence

### Smarak Padhi (Core Architecture & Lead)
- **Branch**: `mobile/core-smarak` (and active integration lead on `feature/mobile-v1` $\rightarrow$ `feature/mobile-v3`)
- **Delivered**:
  - JVM reflection constructor fixes (`@JvmOverloads`)
  - Physical device 404 image URL qualification (`ApiConfig.resolveImageUrl`)
  - Keyguard display flags (`setShowWhenLocked`, `setTurnScreenOn`, `FLAG_KEEP_SCREEN_ON`)
  - Integration release gates and automated Gradle CI checks
- **Remaining / Assigned**:
  - Full Mobile V3 architecture
  - Takeover of Akriti data/API lane
  - Persistence layer (DataStore + Room)
  - Release gating on physical Vivo 1920 hardware

### Deeptiman Parida (UI/UX)
- **Branch**: `mobile/ui-deeptiman` (`1ffa804`)
- **Delivered**:
  - Odisha theme tokens (`SunTempleGold`, `SimilipalEmerald`, `DarkSurfaceElevated`)
  - Hero layout inspiration & search filter concepts
- **Remaining / Assigned**:
  - Visual critique of Stitch MCP outputs
  - Micro-animation spring token reviews
  - Accessibility & touch target audits

### Rudra (Maps & Spatial Discovery)
- **Branch**: `mobile/maps-rudra` (`9e42bbc`)
- **Delivered**:
  - Factual in-memory reference origin semantics (`GeocodingState.ReferenceOrigin`)
  - Haversine distance heuristics without fabricating GPS fixes
- **Remaining / Assigned**:
  - **Native Map V3**: MapLibre / Google Maps Compose basemap container
  - Verified place pins and transit stop markers
  - Place preview bottom sheet

### Susmita (Notifications & Lifecycle)
- **Branch**: `mobile/notifications-susmita` (`e63ff40`)
- **Delivered**:
  - Android Notification Manager channels (`TRIP_REMINDERS_CHANNEL_ID`)
  - Deep-link intent payloads to `PlaceDetailActivity`/Compose destinations
  - Unit tests for notification serialization
- **Remaining / Assigned**:
  - Contextual departure window reminders
  - Itinerary start time alerts

### Akriti (Data & API) — CLOSED & TAKEN OVER
- **Branch**: `mobile/data-akriti` (`154aca8` — stale at initial baseline)
- **Status**: No unique commits pushed beyond baseline.
- **Decision**: **TAKE_OVER_BY_SMARAK**. Smarak directly maintains OpenAPI generation (`scripts/generate_openapi.py --check`), Retrofit endpoints, DTO models, and offline caching.

### Punam (Features & QA) — REASSIGNED & BACKED BY SMARAK
- **Branch**: `mobile/features-punam` (`154aca8` — stale at initial baseline)
- **Status**: No unique commits pushed on remote branch.
- **Decision**: **TAKEN OVER & DELIVERED BY SMARAK**. Trips Hub and Profile/You screens were implemented in Compose by Smarak. Punam is assigned QA validation, physical device testing, and edge case bug reporting.
