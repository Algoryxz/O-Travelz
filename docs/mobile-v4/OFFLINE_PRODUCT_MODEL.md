# O-TRAVELZ Mobile V4 — Offline Product Model & Truth Capabilities

> **Authoritative Offline Specification**<br>
> Principle: **Truthful Offline Boundaries; Zero Unsupported Availability Claims**<br>
> Document Version: `4.3.0` | Last Updated: `2026-09-09` (Wave M18 Offline Mode Accepted)

---

## 1. Seven-Tier Capability Classification

Every capability in O-TRAVELZ Mobile belongs to one of seven explicit offline operational categories:

| Offline Capability Category | Definition | Components & Assets | Operational Guarantee |
|---|---|---|---|
| **`BUNDLED_AND_GUARANTEED`** | Core deterministic logic and reference metadata included directly in the application bundle. | KMP math kernels (`HaversineDistance`, `OdishaBounds`, `FirstMileEngine`), 154 transit routes & 302 schedules (5,549 departures), 24x7 state emergency helplines, artisan clusters catalog, GNSS user location fix. | **Guaranteed Available** on fresh install in Airplane Mode without prior usage. |
| **`PERSISTED_AFTER_USE`** | User data and previously fetched content stored in local platform databases upon user action. | `SavedPlace` bookmarks & display snapshots, `SavedTrip` itineraries, `TripProgress` milestones, cached session profile, local departure reminders. | **Guaranteed Available** for items previously saved or scheduled by the traveler. |
| **`CACHE_AFTER_USE`** | Ephemeral media and telemetry retained in platform caches after online viewing (`SYSTEM_CACHE_BEST_EFFORT`). | Verified responsive WebP photography (Coil on Android, URLCache on iOS), last-known weather observations with explicit timestamp disclosures. | **Available if Cached** from previous online session; degraded calmly if missing. |
| **`OPTIONAL_DOWNLOAD`** | Explicit offline packages downloaded deliberately by the user to conserve cellular data. | Future promoted district geometry and baseline catalog bundles (Stage G1 candidates, Stage G2 locked). | **Available if Downloaded** via future Offline Package Ingestion; zero background downloads. |
| **`NETWORK_REQUIRED`** | Capabilities dependent on remote cloud computation or external service backends. | Discover feed dynamic pagination, live weather telemetry, conversational AI assistant (`POST /ai/converse`), automated itinerary solver (`POST /itinerary/plan`), nearby civic query (`GET /api/v1/services/nearby`), remote session validation (`GET /auth/me`). | **Disabled / Graceful Degraded Banner** when disconnected. |
| **`PROVIDER_DEPENDENT`** | Features relying on underlying operating system SDKs or external provider caching. | Basemap vector tiles (Google Maps SDK on Android, Apple MapKit on iOS), external turn-by-turn navigation voice guidance. | **Not Guaranteed Offline** by O-TRAVELZ. Provider tile cache may render or fail; linear list view alternative is always provided. |
| **`NOT_IMPLEMENTED`** | Features planned for subsequent roadmap waves. | Community photo contributions (M19), crowdsourced ride consensus (M20). | **Not Present** in current release. |

---

## 2. Domain-Specific Offline Truth Rules

### 2.1 Canonical Place & Discover Catalog Truth
- The Discover catalog is network-fetched dynamically.
- On a fresh install with no network, Discover displays an honest offline empty state: *"Connection required to discover new places. Saved places and transit schedules remain available."*
- O-TRAVELZ does **not** claim a guaranteed offline catalog on fresh install. No destination catalog is bundled in production assets (`NO_DESTINATION_REFERENCE_BUNDLE`).

### 2.2 Place Detail Offline Continuity
- When disconnected, if a place is saved in bookmarks, Place Detail falls back seamlessly to the persisted `SavedPlace` snapshot (name, category, district, image URL, rating).
- Live mutable facts (hours, phone, entry fees, live weather) degrade calmly with clear disclosure: *"Offline Snapshot · Saved place details"*.
- Missing or uncached media renders a dignified sandstone cultural container with Odia script and photo-verification-pending badge; it never uses generic stock travel imagery, AI tourist photos, or increments photo count.

### 2.3 User Saved Places & Trips
- All user-saved bookmarks (`SavedPlace`), custom itineraries (`SavedTrip`), and checklist states (`TripProgress`) persist locally in Room SQLite (Android) and SwiftData (iOS).
- Saved trips remain readable and executable offline. Milestones can be manually completed or skipped without network access.

### 2.4 Base Maps & Spatial Cartography
- **No Guaranteed Offline Basemap**: O-TRAVELZ does **not** claim guaranteed offline map tile availability through Google Maps SDK or Apple MapKit.
- When offline and uncached, both Android and iOS provide an immediate linear list view alternative of saved destinations and route details with an informative notice: *"Map tiles are unavailable offline. Saved places and previously available local content can still be viewed."*

### 2.5 Weather Telemetry & Cache Policy
- Weather is mutable telemetry and must **never** be labeled as live when retrieved from cache.
- No arbitrary freshness TTLs: cached weather always discloses its relative observation time: `[☁ Cached weather · 3h ago · 29°C]`.
- If no cached observation exists, displays: `[☁ Weather Unavailable]`.
- **Never** default to `0°C`, `Sunny`, or `0% rain`.

### 2.6 Artificial Intelligence & Planning Truth
- Remote LLM conversational assistance (`POST /ai/converse`) and deterministic itinerary generation (`POST /itinerary/plan`) are **strictly unavailable offline** (`NETWORK_REQUIRED`).
- Neither mobile client contains an on-device local itinerary solver.
- Offline mode disables new plan generation and displays: *"Trip planning requires an internet connection. Your saved trips remain available offline."*
- AI prompt submission displays: *"AI Assistant requires an internet connection. You can still view saved trips and edit local trip details."*
- Zero simulated or fake offline LLM responses.

### 2.7 Transit Offline Continuity
- 154 canonical routes across 5 regions, 302 directional schedule groups, and 5,549 unique departures are bundled directly in production assets (`assets/transit/`).
- Stop inventory represents 1,430 canonical stops (173 with verified physical coordinates, 1,257 locality-only) across 164 directional variants with 1,491 stop occurrences.
- Transit route directory, stop sequences, and scheduled timetables are available offline on fresh install.
- Departure times are labeled strictly as `Scheduled` (never "Live" or "Arriving in X min").
- Staged route geometry remains quarantined in `data/staging/transit/`; when unavailable offline, transit screens display *"Schedule only — route map unavailable"*.

### 2.8 Auth Offline Semantics
- **Cached Account Identity**: Display name, email, and avatar URI stored in encrypted local storage are viewable offline in the You tab.
- **Local Secure Session Token**: Stored securely in EncryptedSharedPreferences (Android) and Apple Keychain (iOS).
- **Remote Session Validity**: Remains `UNKNOWN_WHILE_OFFLINE` until validated against `GET /auth/me`. The client fails open without forcing logout, but never asserts remote validation.

### 2.9 Advisory Network Monitoring
- `ConnectivityManager` (Android) and `NWPathMonitor` (iOS) provide non-authoritative advisory signals to display the global offline status banner.
- Actual HTTP request results (`NetworkResult.Success` / `NetworkResult.Failure`) remain the ultimate source of truth.
