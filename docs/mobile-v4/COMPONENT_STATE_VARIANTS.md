# O-TRAVELZ Mobile V4 — Component State & Variant Matrices Specification

> **Authoritative Specification of Truthful Component Variants and State Transitions**<br>
> Scope: **Exhaustive Variant Definitions for Truth, Transit, Weather, Media, AI, and Offline Systems**<br>
> Governance: **Zero Fabricated States; Transparent Degradation & Truth Boundaries**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Philosophy: Truthful States Over Superficial Polish

In O-TRAVELZ Mobile V4, component states are not limited to generic UI states (`idle`, `pressed`, `focused`, `disabled`). Every core component models **Domain Truth States** that honestly represent data provenance, network availability, and verification certainty.

Components never hide missing data behind vague placeholders or pretend that stale data is live.

---

## 2. Core Domain Variant Matrices

### 2.1 TruthBadge State Matrix
Used across both platforms to signal verification confidence on stops, hours, distances, and data sources.

| Variant Key | Visual Representation (M3 / HIG) | Semantic Meaning | Prohibited Usage |
|---|---|---|---|
| `VERIFIED` | Green seal (`#064E3B` / `.green`) | Confirmed by official government survey, CRUT agency, or physical field verification. | Cannot be applied to user-contributed stops before editorial approval. |
| `SCHEDULED` | Amber clock (`#451A03` / `.orange`) | Published static timetable departure (Mo Bus / Ama Bus). Non-telemetry. | Cannot be labeled "Live" or "Real-time arrival". |
| `LIVE` | Cyan telemetry (`#082F49` / `.cyan`) | Genuine real-time telemetry (Open-Meteo weather updates, on-device GPS tracking). | **STRICTLY PROHIBITED FOR BUS LOCATIONS** (no live transit telemetry exists). |
| `ESTIMATED` | Slate calculation (`#1E293B` / `.secondary`) | Mathematical calculation (Haversine spherical distance band, estimated walking duration). | Cannot be presented as surveyed pedestrian walking route. |
| `CANDIDATE` | Yellow dashed outline (`#422006` / `.amber`) | Candidate transit stop identified in route documents but awaiting physical GPS survey. | Cannot be rendered as a verified green stop pin. |
| `UNAVAILABLE` | Neutral gray (`#262626` / `.gray`) | Data point missing or external data provider unreachable. | Cannot fabricate default or fallback values. |

---

### 2.2 Weather State Matrix
Governs the `WeatherSummary` component powered by Open-Meteo.

| Variant Key | Visual Expression | Trigger Condition | Data Shown |
|---|---|---|---|
| `AVAILABLE` | High-contrast card with weather icon and current temp. | Network online; successful Open-Meteo response within last 60 minutes. | Temperature (°C), weather description, wind speed, "Open-Meteo • Just now". |
| `STALE_CACHED` | Muted card with clock indicator and warning tint. | Network offline or fetch failed; local cache exists but is older than 60 minutes. | Cached temperature, condition, explicit label: "Cached at [HH:MM] IST". |
| `UNAVAILABLE` | Compact row with neutral cloud slash glyph. | Network offline; no cached forecast available for this district. | "Weather unavailable offline", Retry action. |
| `ERROR` | Tonal error container with actionable button. | HTTP 5xx or API failure during active network request. | "Weather service temporarily unreachable", "Retry" button. |

---

### 2.3 TransitStop Verification Matrix
Governs stop pins, stop timeline rows, and transit detail headers across Mo Bus & Ama Bus networks.

| Variant Key | Icon / Border Style | Database Provenance | Traveler Guidance |
|---|---|---|---|
| `VERIFIED_OFFICIAL` | Solid circle with bus glyph + green checkmark. | Physical inspection confirmed; official CRUT survey. | "Official surveyed stop. Physical Mo Bus signage present." |
| `VERIFIED_GEOSPATIAL` | Solid circle with bus glyph + blue pin. | Geospatial imagery (satellite/street survey) verified coordinates. | "Geospatially confirmed location. Verified within 15 meters." |
| `CANDIDATE_HIGH` | Dashed circle with yellow border. | Extracted from official timetable route table with high-confidence cross-reference. | "Candidate stop. Approach landmark and verify signage locally." |
| `CANDIDATE_MEDIUM` | Dashed circle with amber border. | Approximate stop location derived from village/chowk center. | "Approximate stop location near chowk. Ask conductor for exact boarding point." |
| `CANDIDATE_LOW` | Dotted circle with muted border. | Historical or crowd-suggested stop; low confidence. | "Unconfirmed stop. Board at nearest major surveyed junction instead." |
| `LOCALITY_ONLY` | Muted square pin. | Village or gram panchayat name known; zero coordinate certainty. | "Locality milestone only. No fixed bus shelter recorded." |
| `UNRESOLVED` | Warning triangle. | Unmapped stop identifier in raw timetable text. | "Unmapped in transit database. Route passes through locality." |

---

### 2.4 RouteGeometry Truth Matrix
Governs polyline rendering on MapLibre and MapKit maps.

| Variant Key | Map Line Style | Meaning & Precision | Legend Description |
|---|---|---|---|
| `VERIFIED_ROUTE_GEOMETRY` | Solid 4dp/pt sandstone corridor line (`#D4A373`). | Official surveyed road alignment followed by Mo Bus service. | "Surveyed bus corridor route." |
| `HIGH_CONFIDENCE_ROUTE_GEOMETRY` | Solid 3dp/pt sandstone line with subtle glow. | Road-network routing matched along known sequential stops via OSRM. | "Road-network matched transit route." |
| `MEDIUM_CONFIDENCE_ROUTE_GEOMETRY` | Dashed 2dp/pt sandstone line. | Generalized road connection between distant surveyed waypoints. | "Estimated highway path between major stops." |
| `UNAVAILABLE` | Hidden polyline; straight dotted link between stops. | Road network path unavailable in vector data. | "Stop sequence shown. Exact road path unmapped." |

---

### 2.5 Media Truth Matrix
Governs image hero blocks, media galleries, and 3D preview surfaces.

| Variant Key | UI Presentation | Asset Truth Boundary |
|---|---|---|
| `VERIFIED_PHOTO` | Full-fidelity WebP editorial image with photographer badge. | 100% authentic photograph verified for cultural accuracy and licensing. |
| `MISSING` | Refined geometric cultural pattern placeholder with Odia script icon. | Destination has zero verified authentic photos. Strict rule: **Never publicly listed without photo**; placeholder used only in internal editor/staging mode. |
| `VERIFIED_VIDEO` | 16:9 player container with play trigger and duration badge. | Authentic field video verified without AI enhancement or misleading filters. |
| `NO_VIDEO` | Video tab disabled or omitted entirely. | Honest omission: zero video assets available. |
| `VERIFIED_3D` | Interactive 3D spatial viewer button with cube glyph. | Curated spatial capture or architectural photogrammetry. |
| `NO_3D` | 3D action omitted cleanly. | No 3D model; zero speculative CAD or fake renders. |

---

### 2.6 AI Assistant State Matrix
Governs the AI planning input, refinement chat, and conversational assistant surfaces.

| Variant Key | UI Presentation | Operational Behavior |
|---|---|---|
| `AVAILABLE` | Sandstone accent input field with "Grounded AI Assistant" badge. | Natural language intent parsing active; answers grounded in verified destination and transit database. |
| `DEGRADED` | Warning header with "Simplified Assistant" notification. | Cloud AI latency high or token budget constrained; falls back to fast extractive summarization. |
| `DETERMINISTIC_FALLBACK`| Direct filter chips (Duration, Pace, District) replacing text field. | AI service unavailable or offline; users plan using deterministic rule-based engine. |
| `UNAVAILABLE` | Explicit message: "AI Assistant requires internet connection." | Displays offline itinerary templates and saved trips without conversational features. |

---

### 2.7 Offline Product Tier Matrix
Governs data persistence, caching, and storage management across all mobile screens.

| Variant Key | Storage Mechanism | Guarantees & Features |
|---|---|---|
| `BUNDLED_AND_GUARANTEED` | Embedded read-only SQLite database & local assets. | 100% available at install time: all verified destinations, 211 civic facilities, 5,549 scheduled transit departures. |
| `PERSISTED_AFTER_USE` | Local SQLite cache (LRU, 250MB cap). | Browsed places, rendered map tiles, and viewed images saved automatically for offline revisit. |
| `OPTIONAL_DOWNLOAD` | On-demand district pack (e.g., "Puri & Konark Offline Pack - 85MB"). | Full high-res media, detailed vector tiles, and cultural audio guides explicitly downloaded by traveler. |
| `NETWORK_REQUIRED` | Blocked action with explanatory toast. | Features that strictly require live connectivity (feedback submission, live weather refresh). |
| `PROVIDER_DEPENDENT` | Map tile fallback to low-res base layer. | Vector map zoom levels beyond downloaded boundaries require external CDN tiles. |

---

## 3. Standard Interaction State Matrix

Every interactive button, card, chip, and list item supports the standard 6 interaction states:

| State | Android M3 Token | iOS HIG Expression |
|---|---|---|
| `Resting` | `surfaceContainer` / `outlineVariant` | `secondarySystemGroupedBackground` |
| `Hovered` | 8% onSurface overlay tint (large screens) | System pointer hover effect |
| `Pressed` | M3 Ripple (`stateLayerOpacity = 0.12f`) | `.buttonStyle(.opacity)` (0.75 opacity) |
| `Focused` | Prominent sandstone focus ring (2dp) | System accessibility focus ring |
| `Selected` | `primaryContainer` / `onPrimaryContainer` | `.tint(.accentColor)` / borderedProminent |
| `Disabled` | 38% content opacity; zero touch response | `.disabled(true)` (38% system opacity) |
