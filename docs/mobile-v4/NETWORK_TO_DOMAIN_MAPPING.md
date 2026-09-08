# O-TRAVELZ Mobile V4 — Network to Domain Mapping Architecture

> **Authoritative Specification for DTO-to-Domain Model Isolation and Truth Boundaries**  
> Wave M6 Baseline  

---

## 1. Architectural Philosophy: Anti-Leakage Boundary

Raw backend network DTOs reflect HTTP transport serialization (snake_case, nullable keys, JSON string encodings). They **must never leak directly into presentation or UI composables**.

Instead, thin, strongly-typed domain adapters transform DTOs into domain models that enforce O-TRAVELZ truth invariants:

```
[ Backend REST API ]
         │
         ▼ (HTTP JSON)
[ Native DTO Layer (Retrofit / URLSession) ]
         │
         ▼ (Domain Adapter Transformation)
[ Domain Truth Models (WeatherState, TransitRoute, Place, etc.) ]
         │
         ▼ (Immutable State)
[ Presentation / ViewModels (Wave M7+) ]
```

---

## 2. Truth-Critical Domain Mappings

### 2.1. Weather Truth Mapping
- Raw `WeatherResponseDto` -> `WeatherState`
- If `temperature_c == null` or request fails -> `WeatherState.Unavailable` (NEVER `0°C`).
- If `forecast_daily` is empty -> `forecast = emptyList()` (NEVER hallucinated sunny icons).

### 2.2. Transit Truth Mapping
- Raw `StopDto` -> `TransitStop`
- `coordinate_status == "candidate"` or `lat == null` -> `StopLocation.LocalityOnly(locality, city)`.
- Never fabricate an exact GPS pin for a stop that has not attained rider consensus.
- Route geometry linestring -> `RoutePolyline.Verified(points)` or `RoutePolyline.Unmapped`. Never synthesize a straight line between distant bus stops.

### 2.3. Services & Civic Essentials Mapping
- Raw `ServiceDto` -> `CivicService`
- Strictly maps civic infrastructure (hospitals, police stations, ATMs, fuel stations).
- **Prohibited**: Services must NEVER be mapped into the leisure `Place` discovery feed.

### 2.4. Media & Verified Photography Mapping
- Raw `ImageDto` -> `VerifiedMedia`
- If `images` is null or empty, destination receives `PublishabilityState.DraftUnpublished`.
- Public catalog query strictly filters out destinations lacking verified imagery (`NO VERIFIED IMAGE = NO PUBLIC DESTINATION`).
