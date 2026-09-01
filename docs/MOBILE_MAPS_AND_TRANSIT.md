# Mobile Maps & Transit — Location, Proximity & Truthfulness

> Canonical technical documentation for the native Android Maps, GPS Location, First-Mile Proximity Guidance, and Scheduled Mo Bus Transit subsystem.
> Branch: `mobile/maps-rudra` | Target Commit: `72df451`

---

## 1. Purpose

The O-TRAVELZ Android Maps & Transit subsystem provides:
1. **Destination & Cultural Heritage Map Discovery**: Visual geospatial projection and filtering of verified Odisha places.
2. **Location-Aware Proximity Information**: Accurate, straight-line distance calculations from active device position or canonical datum points.
3. **First-Mile Proximity Guidance**: Multimodal transit connection recommendations based on geodesic proximity.
4. **Nearby Transit Discovery**: Proximity lookups for scheduled Mo Bus transit stops across Bhubaneswar, Cuttack, and Puri.
5. **Scheduled Timetable Presentation**: Grounded route sequence and frequency information from published CRUT / Mo Bus schedules.

### Core Truthfulness Principle
> **The application must never imply that a reference datum coordinate is the user's actual location, and straight-line geospatial calculations must never be represented as pedestrian navigation or walking routes.**

---

## 2. Location State Model

Location states are modeled as a sealed class hierarchy in `com.otravelz.android.core.location.GeolocationState`:

```
GeolocationState (sealed)
├── Idle                  # Initial uninitialized state
├── Requesting            # Actively querying GPS hardware
├── RealGps               # Verified genuine hardware GPS lock
├── FallbackReference     # Standard reference datum (Master Canteen)
├── Denied                # Location permission denied by user
└── Unavailable           # GPS hardware offline / cold timeout
```

### State Definitions

#### `RealGps`
```kotlin
data class RealGps(
    val lat: Double,
    val lon: Double,
    val accuracyMeters: Float? = null
) : GeolocationState()
```
Represents verified, genuine device GPS hardware telemetry obtained from Android Location Services.

#### `FallbackReference`
```kotlin
data class FallbackReference(
    val lat: Double = LocationManager.DEFAULT_FALLBACK_LAT,
    val lon: Double = LocationManager.DEFAULT_FALLBACK_LON,
    val referenceName: String = LocationManager.DEFAULT_FALLBACK_NAME
) : GeolocationState()
```
Represents the canonical Bhubaneswar Master Canteen reference origin ($20.2961^\circ\text{N}, 85.8245^\circ\text{E}$).  
**Strict Invariant**: This coordinate is a fixed geographic datum point, NOT the user's physical location.

#### `Denied`
```kotlin
data class Denied(
    val message: String = "Location permission denied. Utilizing Bhubaneswar Master Canteen reference origin."
) : GeolocationState()
```
Represents explicit runtime permission denial by the user.

#### `Unavailable`
```kotlin
data class Unavailable(
    val message: String = "GPS hardware unavailable. Utilizing Bhubaneswar Master Canteen reference origin."
) : GeolocationState()
```
Represents absence of device location services or hardware query failure.

#### `Idle`
```kotlin
object Idle : GeolocationState()
```
Represents the baseline state before any user-triggered location request has occurred.

### State Evaluation Helpers

* **`isRealGps: Boolean`**: Returns `true` strictly when `this is RealGps`. Crucial for preventing personalized first-mile recommendations from inadvertently executing against fallback coordinates.
* **`coordinatesOrFallback: Pair<Double, Double>`**: Returns real GPS coordinates when active, or the standard Bhubaneswar Master Canteen coordinates ($20.2961, 85.8245$) for all non-GPS states (`Idle`, `Requesting`, `FallbackReference`, `Denied`, `Unavailable`).

---

## 3. Privacy and Location Handling

The Android implementation enforces Digital Personal Data Protection (DPDP) principles:

1. **Strictly In-Memory State**: Active coordinates are maintained exclusively in transient Kotlin coroutine `StateFlow<GeolocationState>`.
2. **Zero Disk Persistence**: Coordinates are never stored in SQLite, Room, `SharedPreferences`, `DataStore`, or persistent logs.
3. **Explicit User-Triggered Acquisition**: Location requests are never invoked automatically on background startup. They execute solely upon explicit user interaction via the location action button or permission dialog.
4. **Consent Rationale Dialog**: Users are presented with a clear explanation before runtime permissions are prompted, highlighting in-memory usage and the option to use the reference datum instead.
5. **Right to Clear / Revoke (`clear()`)**: Calling `locationManager.clear()` immediately resets in-memory state back to `GeolocationState.Idle`.

> **Note on Acquisition vs Persistence**: The application requests standard Android location permissions (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`) to acquire live device coordinates in RAM, but enforces zero persistence across app restarts or background transitions.

---

## 4. GPS Fallback UX

When genuine GPS hardware telemetry cannot be acquired, the user interface enforces transparent labeling:

### Location Status Headers
* **Real GPS Lock**: `Real GPS Telemetry (In-Memory)` with live satellite coordinates: `Live Device Lock: %.4f°N, %.4f°E (±%.0fm)`.
* **Non-GPS Fallback**: `Reference Origin (Standard Datum)` with explicit contextual subtitle:
  `Location unavailable · Showing estimates from Bhubaneswar Master Canteen (20.2961°N, 85.8245°E)`.

### Reference Origin Disclaimer Banner
When real GPS is inactive, a persistent disclaimer card is rendered above map listings:
> `Straight-line distances shown below are measured from Bhubaneswar Master Canteen reference origin.`

Under no circumstances is the reference datum presented or labeled as the user's location.

---

## 5. Distance Semantics

All geospatial distances are computed using the deterministic Haversine great-circle formula:

$$\Delta\sigma = 2 \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cos\phi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right)} \right)$$
$$d = R \cdot \Delta\sigma \quad (R = 6371\text{ km})$$

### What the Calculation Means
* The exact geographic spherical straight-line distance ("as the crow flies") between two latitude/longitude pairs.

### What the Calculation Does NOT Mean
* It is **NOT** actual road distance.
* It is **NOT** pedestrian path or walking distance.
* It is **NOT** walking duration or estimated travel time.
* It is **NOT** a step-by-step navigation route.

### UI Terminology Standards
| Scenario | UI Label Format |
|---|---|
| Real GPS Lock Active | `%.1f km · straight-line` |
| Reference Datum Active | `%.1f km · straight-line ref` |
| Mo Bus Transit Stops | `Straight-line proximity: X m from Master Canteen • Scheduled` |

---

## 6. First-Mile Proximity Guidance

First-mile multimodal transit connection guidance provides proximity recommendations, **not turn-by-turn road navigation**.

### Proximity Thresholds
* **$\le 800\text{ m}$**: `Walking proximity (≤ 800m straight-line)`
* **$800\text{ m} - 1500\text{ m}$**: `Walk or Short Auto proximity (800m–1.5km)`
* **$> 1500\text{ m}$**: `Auto / Cab proximity (> 1.5km)`

### Real-GPS Gating
> **Personalized first-mile guidance is enabled ONLY when `locationState.isRealGps == true`.**

When the location state is `Idle`, `FallbackReference`, `Denied`, or `Unavailable`, personalized first-mile badges are **disabled** (`null`). This prevents recommending that a user walk $\le 800\text{m}$ to a destination when the distance was calculated from Bhubaneswar Master Canteen rather than their actual physical location.

---

## 7. Map Screen Behavior (`MapScreen.kt`)

* **DPDP Permission Rationale**: Intercepts location requests with an `AlertDialog` detailing in-memory handling and reference origin options.
* **Datum-Aware Header**: Switches between `Real GPS Telemetry (In-Memory)` and `Reference Origin (Standard Datum)`.
* **Clear Action**: Wipes in-memory coordinates when GPS is active.
* **Category Filtering**: Horizontal filter chips (`All Places`, `Heritage`, `Temple`, `Nature`, `Wildlife`, `Craft`, `Beach`).
* **Pin Card Distance Formatting**:
  * Real GPS: `%.1f km · straight-line`
  * Fallback Datum: `%.1f km · straight-line ref`
* **Gated First-Mile Guidance**: Renders first-mile guidance pills with walking icons exclusively when live GPS telemetry is locked.

---

## 8. Transit Screen Behavior (`TransitScreen.kt`)

* **Mo Bus Network Overview**: Displays network statistics (154 routes, 1,430 scheduled stops across Bhubaneswar, Cuttack, and Puri).
* **Scheduled Timetable Truthfulness Banner**:
  > `ℹ️ Scheduled Timetable Notice: Stop departures and route frequencies are derived from published CRUT / Mo Bus timetables. Live GPS vehicle tracking is not available.`
* **Stop Proximity Formatting**: Stop distances are labeled honestly as `Straight-line proximity: X m from Master Canteen • Scheduled`.
* **No Live Tracking Claims**: No claims of real-time arrival estimates or vehicle telemetry.
* **Search & Filter**: Search stops by name or route number; horizontal route filter chips (`All Routes`, `Route 10`, `Route 11`, etc.).

---

## 9. Tests

Deterministic unit tests are implemented in `mobile/android/app/src/test/java/com/otravelz/android/LocationAndMathTest.kt`:

| Test Name | Verification Scope |
|---|---|
| `testGeolocationStateRealGpsVsFallbackDistinction` | Verifies `RealGps.isRealGps == true` and `FallbackReference`, `Idle`, `Denied`, `Unavailable` have `isRealGps == false`. |
| `testCoordinatesOrFallbackHelper` | Verifies fallback coordinates default to Master Canteen ($20.2961, 85.8245$). |
| `testHaversineDistanceZeroForSameCoords` | Verifies $0.0\text{ km}$ distance for identical coordinates. |
| `testHaversineDistanceBhubaneswarToPuri` | Verifies Haversine distance between Bhubaneswar and Puri Jagannath Temple is within $53.0\text{--}57.0\text{ km}$. |
| `testHaversineDistanceBhubaneswarToCuttack` | Verifies Haversine distance between Bhubaneswar and Cuttack SCB Medical is within $19.0\text{--}23.0\text{ km}$. |
| `testFirstMileThresholdsOnRealGps` | Verifies boundary conditions ($600\text{m}$, $800\text{m}$, $1200\text{m}$, $1500\text{m}$, $2500\text{m}$) against straight-line proximity labels. |
| `testFirstMileDisabledWhenRealGpsInactive` | Verifies that first-mile guidance evaluates to `null` for `Idle` and `FallbackReference` states. |

Existing serialization tests in `ModelsSerializationTest.kt` verify OpenAPI DTO deserialization and planning constraint schemas.

---

## 10. Verification

### Verification Command
```cmd
cd mobile\android && gradlew.bat test
```

### Verified Build Result
```
> Task :app:compileDebugKotlin
> Task :app:compileDebugJavaWithJavac
> Task :app:compileDebugUnitTestKotlin
> Task :app:testDebugUnitTest
> Task :app:compileReleaseUnitTestKotlin
> Task :app:testReleaseUnitTest
> Task :app:test

BUILD SUCCESSFUL in 8m 47s
49 actionable tasks: 49 executed
```
* **Executed Tasks**: 49 actionable tasks
* **Test Results**: All 9 unit tests passed (0 failures, 0 errors, 0 skipped).

---

## 11. Files Changed

| File | Responsibility | Change Scope |
|---|---|---|
| `GeolocationState.kt` | Location state model | Real GPS / fallback / denied / unavailable / idle distinction and `isRealGps` helper |
| `LocationManager.kt` | Location state & proximity logic | Truthful state handling, DPDP invariants, and proximity strings |
| `MapScreen.kt` | Map UI | Reference-origin disclosure, straight-line labels, and real-GPS first-mile gating |
| `TransitScreen.kt` | Transit UI | Straight-line proximity labels and scheduled timetable truthfulness banners |
| `LocationAndMathTest.kt` | Unit tests | State distinction, math, threshold, and first-mile gating test coverage |
| `gradle.properties` | Build configuration | Enabled `android.builder.sdkDownload=true` for automated toolchain setup |

---

## 12. Known Limitations

1. **No Pedestrian/Road Routing Engine**: Proximity values are mathematical Haversine straight-line estimates, not turn-by-turn road routes or walking navigation paths.
2. **No Walking ETA**: The application does not calculate real-world walking travel times based on street topography or pedestrian sidewalks.
3. **No Live Vehicle Telemetry**: Mo Bus transit data is based entirely on published static schedules. Live GPS bus tracking and real-time arrival estimates are not available in the current phase.
4. **Static Reference Datum**: When GPS is cold or denied, calculations project strictly from Bhubaneswar Master Canteen.

---

## 13. Engineering Principles

* **Truthful Location Semantics**: Never represent a fallback datum coordinate as the user's active physical location.
* **Truthful Distance Semantics**: Never represent Haversine straight-line proximity as actual walking routes or travel times.
* **Deterministic Calculations**: All geodesic math and threshold classifications are deterministic and unit-tested.
* **Privacy-Conscious State Handling**: Transient in-memory state flow without disk or database persistence.
* **Capability Honesty**: Static schedule data is labeled explicitly as `Scheduled` rather than live telemetry.
* **Personalized Behavior Gating**: Personalized guidance is enabled only when genuine hardware GPS is active.

---

## 14. Handoff & Maintenance Notes

* **Integrating Turn-by-Turn Routing**: If a pedestrian routing engine (e.g. OSRM or Valhalla) is integrated in a future phase, clearly distinguish routing engine outputs from Haversine straight-line proximity badges.
* **Integrating Real-Time Transit**: If live GTFS-RT or vehicle telemetry feeds are integrated, maintain explicit timestamps and data freshness labels.
* **Location State Checking**: Always verify `locationState.isRealGps == true` before applying personalized origin-based logic.
* **Preserve Truthfulness Badges**: Do not remove `straight-line` or `Scheduled` labels from map or transit cards.
