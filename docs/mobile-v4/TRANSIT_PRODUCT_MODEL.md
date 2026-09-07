# O-TRAVELZ Mobile V4 — Transit Product Model & Truth Semantics

> **Authoritative Mobility Specification**<br>
> Operational Reality: **154 Routes, 1,430 Stops, 5,549 Canonical Unique Departures across CRUT Mo Bus & Ama Bus**<br>
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Multi-Tiered Stop Confidence Architecture

O-TRAVELZ Mobile strictly segregates physical verified poles from administrative localities. Mobile UI permissions derive deterministically from the stop's verification tier:

| Stop Verification Tier | Map Marker Allowed? | Tap / Inspection Allowed? | First-Mile Math Allowed? | Distance Claim Allowed? | External Nav Target Allowed? | Mandatory Truth Disclaimer |
|---|---|---|---|---|---|---|
| **`VERIFIED_OFFICIAL`** | **YES** (Solid Slate Bus Pin) | **YES** | **YES** (`FirstMileEngine`) | **YES** (`"320m walk"`) | **YES** (Exact pole lat/lon) | *"Verified CRUT Gazette / Survey Stop"* |
| **`VERIFIED_GEOSPATIAL`**| **YES** (Solid Slate Bus Pin) | **YES** | **YES** (`FirstMileEngine`) | **YES** (`"450m walk"`) | **YES** (Exact geo lat/lon) | *"Geospatially Verified Coordinate"* |
| **`CANDIDATE_HIGH`** | **YES** (Dashed Amber Halo) | **YES** | **NO (STRICTLY PROHIBITED)**| **NO** | **NO** (Navigation disabled) | *"Candidate stop pending final verification"* |
| **`CANDIDATE_MEDIUM`** | **YES** (Dashed Amber Halo) | **YES** | **NO (STRICTLY PROHIBITED)**| **NO** | **NO** (Navigation disabled) | *"Candidate stop: 2 of 5 check-ins"* |
| **`CANDIDATE_LOW`** | **NO** (Hidden in normal UI) | Only in Check-In | **NO** | **NO** | **NO** | Hidden from public catalog |
| **`LOCALITY_ONLY`** | **NO (Exact Pin Suppressed)**| **YES** (Via Route List) | **NO (STRICTLY PROHIBITED)**| **NO** | **NO** (Navigation disabled) | *"Official Service Area: Locality Only"* |
| **`UNRESOLVED`** | **NO** | **NO** | **NO** | **NO** | **NO** | Staged in internal audit queue |

---

## 2. Route Geometry Confidence Tiers (Independent of Stop Tiers)

A route may have verified road-following geometry even if some intermediate rural stops are locality-only. Geometry confidence is evaluated independently:

1. **`VERIFIED_ROUTE_GEOMETRY`**:
   - Source: Official GPS track log recorded along the transit corridor.
   - Mobile Permitted: Continuous solid polyline in official CRUT route color (e.g. Route 10 Blue, Route 11 Red).
2. **`HIGH_CONFIDENCE_ROUTE_GEOMETRY`**:
   - Source: Road-following spline resolved deterministically against OpenStreetMap highway relations between verified stops.
   - Mobile Permitted: Solid vector polyline with "High-Confidence Road Alignment" metadata.
3. **`MEDIUM_CONFIDENCE_ROUTE_GEOMETRY`**:
   - Source: Road-following spline with minor unpaved or rural bridging gaps.
   - Mobile Permitted: Dashed polyline; straight-line jumps greater than 500m are flagged with a disclaimer.
4. **`GEOMETRY_UNAVAILABLE`**:
   - Source: New or temporary route lacking coordinate splines.
   - Mobile Permitted: Polyline is **suppressed entirely**. The route is presented strictly as a topological sequence list of stops. Never draw straight "spiderweb" lines across forests or mountains.

---

## 3. Scheduled Truth Boundary (Anti-Fake-GPS Rule)

1. **Mandatory Schedule Labeling**:
   - Bus departures are calculated against official timetables using Indian Standard Time (IST / UTC+05:30).
   - Display formula: `[◷ Scheduled · 08:30 IST]`.
   - The phrase *"Arriving in 5 mins"* or displaying a moving bus icon without genuine vehicle hardware telemetry is **strictly banned under penalty of immediate code rejection**.
2. **Fare Presentation Policy**:
   - In data contracts, bus fares remain `null` until an official audited CRUT/OSRTC fare matrix is ingested.
   - In the traveler UI, the literal implementation token `null` or `₹0` must **never** be displayed.
   - Presentation semantics:
     * **`KNOWN_VERIFIED_FARE`**: Display verified stage amount with operator citation (e.g. `₹20 · CRUT Audited Stage`).
     * **`UNKNOWN_FARE`**: Omit fare amount entirely or display *"Fare information unavailable (subject to conductor stage ticketing)"*. Never infer, estimate, or invent exact ₹ values.

---

## 4. First-Mile Pedestrian Logic Gating

First-mile walking recommendations are computed via `mobile/shared/FirstMileEngine.kt`:

```
                       Distance to Stop (d)
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
    d <= 800m             800m < d <= 1500m          d > 1500m
[WALK_REASONABLE]       [WALK_OR_SHORT_AUTO]   [AUTO_OR_CAB_RECOMMENDED]
```

### The Live GPS Invariant
`FirstMileEngine.evaluate()` returns `null` unless `LocationState.isLiveDeviceLocation == true`. When the app is in Reference Datum mode or location permission is denied, walking pills are completely hidden to prevent misleading advice.
