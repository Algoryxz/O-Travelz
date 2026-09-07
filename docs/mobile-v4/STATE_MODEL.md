# O-TRAVELZ Mobile V4 — Universal State Model & Domain Truth Matrices

> **Authoritative State Specification**  
> State Philosophy: **Facts over Speculation; Graceful Fail-Closed Degradation**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Core Viewport States

Every mobile screen, card, and detail sheet must bind to one of the following 12 mutually exclusive viewport lifecycle states:

```
┌─────────────┐       Request in flight (<3.5s)       ┌─────────────┐
│    IDLE     │ ────────────────────────────────────> │   LOADING   │
└─────────────┘                                       └──────┬──────┘
                                                             │
                 ┌───────────────────┬───────────────────────┼───────────────────────┐
                 ▼                   ▼                       ▼                       ▼
          ┌─────────────┐     ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
          │   CONTENT   │     │    EMPTY    │         │OFFLINE_CACHE│         │ERROR_RETRY  │
          └─────────────┘     └─────────────┘         └─────────────┘         └─────────────┘
```

| State Name | Definition & Trigger | Permitted User Messaging | Prohibited Actions / Copy |
|---|---|---|---|
| `LOADING` | Network request in flight ($< 3.5\text{ s}$). | Muted skeleton shimmer matching card shapes. | No spinning activity wheels; no blank black boxes. |
| `CONTENT` | Verified data successfully loaded. | Standard presentation with appropriate truth badges. | No unverified claims; no fabricated counts. |
| `EMPTY` | Search query or filter yielded 0 results. | *"No destinations match '{filter}'. Try clearing district filter."* | No generic "Nothing here!"; must offer concrete recovery tap. |
| `PARTIAL` | Primary text loaded, secondary telemetry pending. | Render text immediately; show inline shimmer on weather badge. | Never block reading for optional weather or media. |
| `OFFLINE_CACHED` | Network disconnected; local cache present. | Header pill: *"Viewing cached offline atlas"*; timestamps shown. | Never display cached data as if it were live. |
| `OFFLINE_NO_CACHE` | Network disconnected; no local record exists. | *"Content not available offline. Connect to network to view."* | Never show broken broken-image icons or empty blank screens. |
| `ERROR_RETRYABLE` | HTTP 5xx, socket timeout, or connection dropped. | Banner: *"Unable to reach server. Tap to retry."* | Never show raw stack traces or cryptic HTTP error codes. |
| `ERROR_TERMINAL` | Unrecoverable data corruption or 404 entity. | *"Destination could not be found. Return to Discover."* | No dead ends without a clear navigation button. |
| `PERMISSION_REQUIRED`| Feature requires hardware permission. | Pre-prompt sheet explaining *why* location/camera is needed. | Never trigger OS permission dialog without context. |
| `PERMISSION_DENIED` | User tapped "Don't Allow" on system prompt. | Inline chip: *"Location disabled. Showing all 30 districts."* | Never nag user with repetitive modal prompts; degrade gracefully. |
| `LOCATION_UNAVAILABLE`| GPS hardware timed out or indoor shield. | Reference datum chip: *"Centered on Master Canteen (Reference Datum)"*. | Never present reference datum as the user's actual location. |
| `BACKEND_UNAVAILABLE`| Remote backend down for maintenance. | Subtle offline mode banner; switches to local rule-based solver. | No blocking crashes; local catalog continues running. |

---

## 2. Domain-Specific Truth State Matrices

### 2.1 Weather States (`WeatherState`)
- **`WEATHER_AVAILABLE`**: Real-time Open-Meteo observation loaded. Badge: `[☁ Live · 31°C · Humidity 78%]`.
- **`WEATHER_CACHED`**: Network unavailable; cached observation exists. Badge: `[☁ Cached 2h ago · 29°C]`.
- **`WEATHER_UNAVAILABLE`**: No telemetry available. Badge: `[☁ Weather Unavailable]`.
- **CRITICAL INVARIANT**: Missing weather **never** defaults to `0°C`, `"Sunny"`, or `"0% Rain"`.

### 2.2 Media Verification States
- **`MEDIA_VERIFIED`**: Distinct physical photograph authenticated for this specific monument. Hero image rendered with attribution badge.
- **`MEDIA_MISSING`**: Place lacks verified photo. Place remains in staging queue; **strictly excluded from public Discover feed**.
- **CRITICAL INVARIANT**: Photo count badge must strictly represent **distinct source assets**, never WebP resolution variants (`hero.webp`, `card.webp`).

### 2.3 Transit Stop Verification States
- **`TRANSIT_VERIFIED_STOP`**: Coordinates authenticated via government gazette or high-confidence satellite imagery. Exact pin rendered on map; eligible for `FirstMileEngine` walking calculation.
- **`TRANSIT_CANDIDATE_STOP`**: Crowdsourced stop with pending check-ins. Dashed halo marker rendered; **strictly prohibited** from first-mile walking calculation.
- **`TRANSIT_LOCALITY_ONLY`**: Official route stop sequence exists, but physical pole coordinates are pending survey. Administrative locality chip (`OFFICIAL_SERVICE_AREA`) rendered; exact map pin suppressed.

### 2.4 Route Geometry States
- **`ROUTE_GEOMETRY_VERIFIED`**: Official road-following GPS polyline sequence. Vector line rendered on map.
- **`ROUTE_GEOMETRY_HIGH_CONFIDENCE`**: Road-following spline resolved against OpenStreetMap highway relations. Vector line rendered with confidence badge.
- **`ROUTE_GEOMETRY_UNAVAILABLE`**: Route sequence known, but geometry spline unverified. Straight line connections suppressed; stops plotted as connected topological nodes.

### 2.5 AI Assistant States
- **`AI_AVAILABLE`**: Cloud LLM (Gemini 1.5 Flash / Groq Llama 3.3) connected. Grounded conversation with claim attribution badges active.
- **`AI_DETERMINISTIC_FALLBACK`**: Cloud LLM unreachable. RuleBasedAdapter provides deterministic golden circuits and pre-canned Odia cultural FAQs.
- **`AI_UNAVAILABLE`**: Completely offline and user seeks open-ended query. Banner: *"AI Assistant requires network connection. View offline itineraries."*

### 2.6 Persistence & Sync States
- **`SAVE_LOCAL_ONLY`**: Saved immediately to device SQLite / SwiftData storage. Accessible 100% offline.
- **`SAVE_SYNC_PENDING`**: Saved locally; queued in background sync table awaiting network reconnection.
- **`SAVE_SYNCED`**: Authenticated account has synchronized bookmarks with backend.
