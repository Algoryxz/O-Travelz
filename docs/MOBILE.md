# Mobile App Architecture & Specifications — O-TRAVELZ

## 1. Status

> **Status**: `INITIALIZED` (Native Android Foundation)  
> Mobile implementation has commenced using **Kotlin + Jetpack Compose**.

---

## 2. Technology Stack

* **Platform**: Native Android (`mobile/android/`)
* **Language**: Kotlin 2.0.20
* **UI Framework**: Jetpack Compose BOM 2024.09.02 (Material 3)
* **Architecture**: MVI / MVVM with Coroutines & StateFlow
* **Networking**: Retrofit 2.11.0 + OkHttp 4.12.0 + `kotlinx.serialization`
* **Image Pipeline**: Coil 2.7.0 for WebP 4-variant photo loading
* **Location**: Android Fused Location / LocationManager with DPDP in-memory privacy
* **Notifications**: NotificationCompat + Channels (`otravelz_trip_alerts`, `otravelz_transit_guidance`)
* **API Contracts**: Generated OpenAPI 3.1 snapshot (`shared/openapi/openapi.json`)

---

## 3. Shared Architectural Parity

1. **Shared Contract Source of Truth**:
   - Backend Pydantic models in `backend/app/schemas/` $\rightarrow$ `shared/openapi/openapi.json`.
2. **First-Mile Distance Classifier**:
   - $\le 800\text{ m}$: Walking recommended
   - $800–1500\text{ m}$: Walk or short auto optional
   - $> 1500\text{ m}$: Auto / cab recommended
3. **Data Integrity & Truthfulness**:
   - Explicit data tier labeling (`Verified`, `Scheduled`, `Estimated`, `Live`).
   - Zero fabricated transit arrival timers or fares.

---

## 4. Documentation References
- [`docs/ANDROID.md`](ANDROID.md) — Android technical architecture and package mapping.
- [`docs/MOBILE_OVERNIGHT_PLAN.md`](MOBILE_OVERNIGHT_PLAN.md) — Overnight implementation milestones.
- [`mobile/android/TEAM.md`](../mobile/android/TEAM.md) — Team workstreams and branch assignments.
