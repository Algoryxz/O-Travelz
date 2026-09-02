# O-TRAVELZ V4 — Product & Mobile System Architecture

> **Authoritative Technical Specification for Two-Platform Native Engineering**  
> Platforms: **Android (Kotlin + Jetpack Compose)** & **iOS (Swift + SwiftUI)**  
> Shared Core: **Kotlin Multiplatform (`mobile/shared/`)**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Architectural Strategy

O-TRAVELZ V4 is engineered as a **two-platform native mobile product**:

1. **Native OS Ergonomics**: Distinct, platform-idiomatic user experiences adhering to Material 3 on Android and Apple Human Interface Guidelines (HIG) on iOS.
2. **Shared Business Correctness**: Business invariants, deterministic math, first-mile decision trees, timetable lookups, and constraint rules implemented once in Kotlin Multiplatform (KMP).
3. **Generated OpenAPI Contracts**: Canonical OpenAPI 3.1 contracts generated directly from the backend, feeding automated model generation and mapping to stable KMP domain models.
4. **Long-Term Maintainability**: Clear, modular boundaries where platform teams can iterate on UI, system APIs, and hardware sensors without risking regression in shared domain logic.

---

## 2. Behavioral Parity Contract

A core requirement of O-TRAVELZ V4 is that **business outputs and truth semantics must be 100% identical between Android and iOS**, while UI layout, navigation transitions, and system controls remain fully native.

| Subsystem | Behavioral Parity Specification | Permitted Platform Difference |
|---|---|---|
| **Geospatial Distance** | Exact spherical Haversine formula ($R = 6371.0\text{ km}$). Output is straight-line distance ("as the crow flies"). | Formatting presentation (`km` unit localization). |
| **First-Mile Guidance** | • $\le 800\text{ m}$: `WALK_REASONABLE`<br>• $800\text{ m} - 1500\text{ m}$: `WALK_OR_SHORT_AUTO`<br>• $> 1500\text{ m}$: `AUTO_OR_CAB_RECOMMENDED`<br>**Gating Rule**: Evaluates to active advice **strictly** when location state is `LIVE_DEVICE_LOCATION`. | UI pill rendering (Compose chip vs SwiftUI capsule with SF Symbol). |
| **Location Fallback** | When GPS is inactive, denied, or unavailable, distance defaults to canonical Bhubaneswar Master Canteen reference datum ($20.2961^\circ\text{N}, 85.8245^\circ\text{E}$). UI must explicitly append `straight-line ref` and show reference datum banner. | Android uses Material banner; iOS uses frosted glass callout card. |
| **Transit Departures** | Next departure computed against official CRUT schedule blocks using Indian Standard Time (IST / UTC+05:30). Output labeled `Scheduled · HH:MM IST`. Fares are strictly `null` (zero invented ₹ values). | Android displays in route card; iOS displays in grouped list row. |
| **Data Truth Labels** | Exact semantic badge mapping:<br>• `VERIFIED_OFFICIAL`: Official provenance<br>• `SCHEDULED`: Published CRUT timetable<br>• `LIVE`: Open-Meteo real-time observation<br>• `ESTIMATED`: Haversine calculation or heuristic duration<br>• `FALLBACK`: Bundled offline dataset | Visual styling adopts platform design tokens (Material 3 pill vs SwiftUI SF badge). |
| **Offline Resilience** | Complete navigation of 161 bundled destinations and 154 transit routes when network is disconnected. | Android uses Room cache + Assets; iOS uses SwiftData + Bundle resources. |
