# O-TRAVELZ Mobile V4 — Offline Product Model & Truth Capabilities

> **Authoritative Offline Specification**<br>
> Principle: **Truthful Offline Boundaries; Zero Unsupported Availability Claims**<br>
> Document Version: `4.2.0` | Last Updated: `2026-09-08` (Wave M14 Persistence Accepted)

---

## 1. Five-Tier Capability Classification

Every capability in O-TRAVELZ Mobile belongs to one of five explicit offline operational categories:

| Offline Capability Category | Definition | Components & Assets | Operational Guarantee |
|---|---|---|---|
| **`BUNDLED_AND_GUARANTEED`** | Core deterministic logic and reference metadata included directly in the application bundle. | KMP math kernels (`HaversineDistance`, `OdishaBounds`, `FirstMileEngine`), 211 emergency civic facilities & phone numbers, canonical place reference attributes (subject to packaging size audit at M5). | **Guaranteed Available** in Airplane Mode without prior usage. |
| **`PERSISTED_AFTER_USE`** | User data and previously fetched content stored in local platform databases upon user action. | `SavedPlace` bookmarks, `SavedTrip` itineraries, `TripProgress` milestones, locally cached media thumbnails. | **Guaranteed Available** for items previously opened or saved by the traveler. |
| **`OPTIONAL_DOWNLOAD`** | Explicit offline packages downloaded deliberately by the user to conserve cellular data. | Curated district image bundles, complete regional transit schedule packs. | **Available if Downloaded** via Offline Manager; zero surprise background downloads. |
| **`NETWORK_REQUIRED`** | Capabilities dependent on remote cloud computation or external service backends. | Conversational AI assistant (`POST /ai/converse`), real-time weather refresh (`GET /weather/current`), crowdsourced check-in sync, account sync. | **Disabled / Graceful Banner** when disconnected. |
| **`PROVIDER_DEPENDENT`** | Features relying on underlying operating system SDKs or external provider caching. | Basemap vector tiles (Google Maps SDK on Android, Apple MapKit on iOS), external turn-by-turn navigation voice guidance. | **Not Guaranteed Offline** by O-TRAVELZ. Relies on provider cache or external Google/Apple Maps offline areas. |

---

## 2. Domain-Specific Offline Truth Rules

### 2.1 Canonical Place & Transit Metadata
- Canonical place metadata and transit schedules may be bundled or locally cached according to packaging and storage measurements finalized at Wave M5.
- Where bundled or cached, text metadata (names, cultural essays, coordinates, categories, route stop sequences) remains viewable offline.

### 2.2 User Saved Places & Trips
- All user-saved bookmarks (`SavedPlace`), custom itineraries (`SavedTrip`), and checklist states (`TripProgress`) persist locally in Room SQLite (Android) and SwiftData (iOS).
- Saved trips remain 100% readable and executable offline.

### 2.3 Base Maps & Spatial Cartography
- **No Guaranteed Offline Basemap**: O-TRAVELZ does **not** claim guaranteed offline map tile availability through Google Maps SDK or Apple MapKit unless platform caching or dedicated vector tile packaging is verified in later implementation waves.
- When offline and uncached, the map displays a grid with locally plotted pin coordinates and an informative notice: *"Basemap tiles require connection or external offline maps."*

### 2.4 Weather Telemetry
- Offline weather displays the last cached temperature and condition with an explicit timestamp: `[☁ Cached 3h ago · 29°C]`.
- If no cached observation exists, displays: `[☁ Weather Unavailable]`.
- **Never** label stale or missing weather as live.

### 2.5 Artificial Intelligence & Planning
- Remote LLM conversational planning is **strictly unavailable offline** (`NETWORK_REQUIRED`).
- Offline AI is not automatically guaranteed. A deterministic local fallback is only available if an on-device algorithmic solver is physically packaged and verified in a later implementation wave. If not packaged, offline mode displays standard catalog browsing with informative notice.

### 2.6 Media & Photography
- Media availability offline depends on prior viewing (cached in local disk cache) or explicit offline package download.
- No fixed arbitrary cache quota (e.g. "250 MB") is enforced until real image weight budgets are measured during production testing.
- Uncached photos render an informative stone-textured placeholder with title and essay, never an error crash.
