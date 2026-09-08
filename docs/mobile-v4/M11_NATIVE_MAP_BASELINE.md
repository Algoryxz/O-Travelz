# O-TRAVELZ Mobile V4 — Wave M11 Native Map Product Baseline

> **Authoritative Native Spatial Exploration Specification**  
> Status: `ACCEPTED_PRODUCTION_BASELINE` | Wave: `M11` | Date: `2026-09-08`  
> Git Commit Reference: Wave M11 Completion

---

## 1. Executive Summary

Wave M11 materializes the native Map root into a production spatial exploration product across Android and iOS. Built on platform GPU vector acceleration (Google Maps Compose 6.1.2 on Android, Apple MapKit on iOS), the native map enforces strict geospatial truth boundaries across 179 cultural destinations, 173 verified transit poles, surveyed road transit corridors, and 211 civic essentials.

---

## 2. Platform SDK & Architecture Matrix

| Dimension | Android Implementation | iOS Implementation | Truth Boundary |
|---|---|---|---|
| **Map Engine** | Google Maps Compose 6.1.2 + Play Services Maps 19.0.0 | Apple MapKit (`SwiftUI.Map`) | Native platform GPU vector rendering |
| **API Keys & Secrets** | `MAPS_API_KEY` via `local.properties` / env var; zero committed secrets | Built-in Apple platform entitlement; 0 keys required | Fails gracefully to linear list when key unconfigured |
| **Pricing Model** | `SUBJECT_TO_PROVIDER_PRICING` | `NATIVE_PLATFORM_ENTITLEMENT` | Revalidated before production deployments |
| **Location Framework** | `FusedLocationProviderClient` (balanced power) | `CoreLocation` (`CLLocationManager`) | Foreground one-shot only; zero background tracking |
| **External Navigation** | `geo:0,0?q=lat,lon(name)` Intent | `maps://?daddr=lat,lon` Apple Maps URL | Turn-by-turn delegated externally; 0 internal routing |

---

## 3. Layer Architecture & Default Visibility

| Layer Name | Default State | Coexistence / Exclusivity Rule | Data Source |
|---|---|---|---|
| **Destinations** | **ON** | Dimmed when Essentials active | 179 eligible leisure destinations |
| **User Location** | **Contextual** | Activated only when traveler taps "My Location" | Hardware GPS fix |
| **Essentials** | **OFF** | Mutually exclusive with deep leisure exploration | 211 verified civic amenities |
| **Transit Stops** | **OFF** | Only verified stops (173) render exact pins | Official CRUT transit stop catalog |
| **Candidate Stops** | **OFF** | Visible strictly on explicit candidate toggle | Staged observation candidates |
| **Transit Routes** | **OFF** | Rendered on-demand per corridor selection | Deterministic surveyed road geometry |
| **Saved / Itinerary** | **UNAVAILABLE** | Defer to M13/M14 Plan & Trips waves | 0 mock pins or fake storage |

---

## 4. Geospatial & Transit Truth Boundaries

1. **Zero District MultiPolygons**:
   - The repository contains 0 canonical 30-district boundary polygon datasets.
   - District exploration is implemented strictly through metadata and camera centroid targets.
2. **Zero Straight-Line Route Bridging**:
   - Transit routes lacking verified road geometry evaluate to `GEOMETRY_UNAVAILABLE`.
   - Polylines are suppressed completely; the route is presented as a sequenced stop list.
   - Synthetic chords across unresolved transit gaps are strictly prohibited.
3. **Multi-Tier Stop Confidence**:
   - `VERIFIED_OFFICIAL` & `VERIFIED_GEOSPATIAL` (173 stops): Exact solid pin, first-mile walking calculation, external navigation enabled.
   - `CANDIDATE_HIGH` & `CANDIDATE_MEDIUM`: Dashed amber ring, explicit uncertainty disclaimer, first-mile and navigation prohibited.
   - `LOCALITY_ONLY` / `UNRESOLVED` (1,257 stops): Exact coordinate pins suppressed entirely.
4. **Civic Essentials Isolation**:
   - 211 verified civic services (healthcare, police, fuel, ATMs) are strictly segregated from cultural leisure points to prevent pin clutter.
5. **Anti-Fake-GPS**:
   - User location puck represents traveler hardware GPS only.
   - It is never styled, animated, or labeled as live transit vehicles.
   - Permission denial retains statewide Odisha overview without silent fallback to fake coordinates.

---

## 5. Linear Accessible Alternative

To guarantee VoiceOver and TalkBack accessibility without requiring complex map pan/pinch gestures:
- Both Android and iOS provide a dedicated **"List View"** action.
- Displays a linear, scrollable modal containing all entities in the active layer/area.
- Full screen reader content descriptions for names, categories, districts, and verification badges.

---

## 6. Verification Summary

- **Android Unit Tests**: 53 passed (`.\gradlew.bat :android:testDebugUnitTest`).
- **Android Assembly**: `BUILD SUCCESSFUL` (`.\gradlew.bat :android:assembleDebug`).
- **Android Lint**: `BUILD SUCCESSFUL` with 0 errors (`.\gradlew.bat :android:lintDebug`).
- **iOS Unit Tests**: Source-verified parity tests in `OTravelzTests/MapDomainTests.swift`.
