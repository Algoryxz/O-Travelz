# O-TRAVELZ Mobile V4 — Offline Product Model & Cache Strategy

> **Authoritative Offline Specification**  
> Goal: **100% Core Atlas Navigability in Airplane Mode**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Offline Tier Classification

Every data entity in the application belongs to one of four offline freshness tiers:

| Offline Freshness Tier | Definition | Examples | Allowed Presentation & Badge |
|---|---|---|---|
| **`FRESH`** | Data fetched within current active session or within HTTP max-age cache window ($< 30\text{ mins}$). | Live weather observation, latest check-in count. | Standard presentation with live badges. |
| **`STALE_BUT_USABLE`** | Previously fetched data older than max-age, but still functionally valuable. | Weather observation from 3 hours ago. | Stale badge: `[☁ Cached 3h ago · 29°C]`. |
| **`OFFLINE_CACHED`** | Pre-bundled canonical dataset or user-saved bookmark stored permanently in local SQLite. | 204 places, 154 routes, 1,430 stops, saved itineraries, emergency contacts. | Standard presentation with subtle top indicator: `[Viewing cached offline atlas]`. |
| **`NOT_AVAILABLE_OFFLINE`**| Dynamic services requiring live server computation. | Grounded conversational AI chat, live GPS vehicle tracking, cloud sync. | Graceful fallback banner: *"Feature requires internet connection."* |

---

## 2. Pre-Bundled & Permanently Stored Offline Assets

The following core assets are pre-bundled in the mobile application binary or seeded on first launch into Room / SwiftData:
1. **The 204 Canonical Places**: Complete names, dual-script Odia transliterations, historical essays, coordinate pairs, category classifications.
2. **The 154 Transit Routes & 1,430 Stops**: Full route names, corridor identities, operating agencies (CRUT / OSRTC), and topological stop sequences.
3. **The 5,553 Scheduled Departure Times**: Complete timetable matrix in Indian Standard Time (IST).
4. **Emergency Civic Contacts**: Statewide 112, 108 ambulance, district headquarters hospitals, and tourist police stations across all 30 districts.
5. **Local KMP Math Kernels**: `HaversineDistance`, `OdishaBounds`, and `FirstMileEngine` execute 100% locally with zero network calls.

---

## 3. Media Caching Strategy

- **Disk Cache Footprint**: Image loading libraries (Coil on Android, URLCache on iOS) maintain a strict **250 MB LRU disk cache** for high-resolution WebP images.
- **Offline Place Images**: Once a destination card or detail sheet is viewed online, its WebP photo is cached on disk. In Airplane Mode, cached photos render instantaneously.
- **Missing Image Grace**: If an uncached photo is opened in Airplane Mode, the card renders a warm sandstone textured placeholder with the destination title and cultural essay—never an ugly broken-image icon.
