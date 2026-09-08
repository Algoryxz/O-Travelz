# O-TRAVELZ Mobile V4 — Backend API Surface Classification

> **Authoritative Classification of Backend Endpoints for Mobile V4**  
> Backend Runtime: https://otravelz-backend.onrender.com  
> Generated: Wave M6  

---

## 1. Classification Methodology

Every backend route exposed in the FastAPI OpenAPI specification (100 mounted paths) is partitioned into strict operational categories. In accordance with **Ponytail minimalism**, Mobile V4 only constructs native DTOs and network clients for endpoints required immediately (MOBILE_REQUIRED_NOW). Future wave endpoints (MOBILE_REQUIRED_LATER) are architecturally cataloged but deferred from implementation.

---

## 2. Endpoints: MOBILE_REQUIRED_NOW (Wave M6 Core Scope)

These 11 endpoint contracts are established and smoke-verified in Wave M6:

| Domain | Method | Path | Purpose |
|---|---|---|---|
| **Core** | GET | /health | Liveness probe with Git SHA, Alembic version, and DB status |
| **Core** | GET | /ready | Readiness probe verifying PostgreSQL connection |
| **Places** | GET | /places | Public destination catalog, category and district filtering |
| **Places** | GET | /places/{place_id} | Detailed metadata for verified destination |
| **Weather** | GET | /weather/current | Coordinates-based real-time weather and 7-day daily forecast |
| **AI** | POST | /ai/converse | Multi-turn travel assistant with deterministic grounding |
| **Itinerary** | POST | /itinerary/plan | Deterministic constraints-driven day planner |
| **Transit** | GET | /api/transport/routes | 154-route CRUT Mo Bus / Ama Bus catalog |
| **Transit** | GET | /api/transport/routes/{route_id}/geometry | High-fidelity coordinate polyline for route path |
| **Transit** | GET | /transport/stops/nearby | Spatial stop discovery with walking time estimates |
| **Services** | GET | /api/v1/services/nearby | Civic emergency essentials (hospitals, police, ATMs) |

---

## 3. Endpoints: MOBILE_REQUIRED_LATER

| Target Wave | Endpoints | Domain | Notes |
|---|---|---|---|
| **M10** | /api/v1/media/places/{id}, /api/v1/images/{key} | Media | Verified WebP photos, attribution |
| **M14** | /api/v1/sync/*, /api/v1/trips/share* | Persistence & Sharing | Cloud backup of local Room/SwiftData |
| **M15** | /api/v1/services/for-destination, /api/v1/services/safety/* | Essentials | Destination-specific safety and civic contacts |
| **M15** | /api/v1/heritage/scenes/* | Culture & Heritage | Cultural heritage models |
| **M16** | /api/auth/* | Auth | Native session exchange and profiles |
| **M20** | /api/transport/rides/*, /api/transport/stops/confirm | Crowdsourcing | Rider consensus telemetry |

---

## 4. Endpoints: WEB_ONLY, INTERNAL & LEGACY

- **WEB_ONLY**: /map/v1/projection — MapLibre GL JS web tile projection math; native mobile uses Google Maps SDK / Apple MapKit native projections.
- **INTERNAL**: /api/v1/media/providers/status, /api/v1/media/*/generate — Pipeline worker triggers; client apps never invoke generation directly.
- **LEGACY_COMPATIBILITY**: Unprefixed root mounts mirroring /api/* mounts.
