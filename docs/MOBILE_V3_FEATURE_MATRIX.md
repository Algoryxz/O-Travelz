# O-TRAVELZ Mobile V3 — Feature & Runtime Truth Matrix

> Honest inventory of all mobile capabilities, data bindings, and runtime statuses.

---

## 1. Feature Status Summary

| Feature Area | Sub-feature | Status | Evidence / Implementation Details |
|---|---|---|---|
| **Primary Navigation** | 5-Tab Shell (`HOME`, `DISCOVER`, `PLAN`, `TRIPS`, `YOU`) | **WORKING** | Verified in `MainActivity.kt` with Material 3 `NavigationBar` on Vivo phone |
| **Home Screen** | Contextual Greeting (IST) | **WORKING** | Time-of-day greeting bound to system clock |
| | Live / Fallback Weather Banner | **WORKING** | Open-Meteo live API integration with `LIVE` vs `ESTIMATED` badge |
| | Landmark Hero Photo Matching | **WORKING** | Iconic temple/heritage priority image selection |
| | Quick Action Dock | **WORKING** | Plan, Discover, Saved, and Transit shortcuts |
| | Curated Circuits Carousel | **WORKING** | Verified multi-stop Odisha day itineraries |
| **Discover & Search** | Full-width Search Bar | **WORKING** | Instant search filter with clear action |
| | Category & District Filter Chips | **WORKING** | Animated multi-select filter chips |
| | Grid / List View Toggle | **WORKING** | Instant layout switching between 2-col grid & detailed list |
| | Verified Badge | **WORKING** | `VERIFIED` green tag based on `isVerified` metadata |
| **Place Detail** | Hero Image & Provenance | **WORKING** | Qualified image URL via `ApiConfig.resolveImageUrl` |
| | Cultural Story & Essentials | **WORKING** | Rich typography for description, hours, fees, contact numbers |
| | Bookmarking / Saved Toggle | **WORKING** | In-memory bookmark toggle with bookmark state indicator |
| | First-mile Transit Distance | **WORKING** | Scheduled Mo Bus / Ama Bus connectivity details |
| **Planner** | Visual Guided Planner | **WORKING** | Day count stepper, origin selector, interest chips, transit toggle |
| | Conversational AI Planner | **WORKING** | Grounded prompt-based trip generation with deterministic backend |
| | Multi-day Timeline View | **WORKING** | Day tabs, sequential stop cards, arrival/departure time badges |
| **Trips Hub** | Offline Saved Itineraries | **WORKING** | Multi-stop route previews, scheduled transit info, trip deletion |
| | Room Database Cache | **PARTIAL** | In-memory + file persistence active; Room SQLite schema in progress |
| **You / Profile** | Guest User Status | **WORKING** | Guest status banner with local device storage notice |
| | Language Switcher | **WORKING** | English / Odia toggle |
| | Notification Channel Toggles | **WORKING** | Granular switches for Trip, Weather, and Transit alerts |
| | DPDP Act 2023 Privacy Controls | **WORKING** | Explicit transparency modal on local data handling |
| | Community Hometown Submission | **UI_ONLY** | Staged submission modal with *"Submitted for review"* contract |
| **Maps & Location** | GPS / Geolocation State | **WORKING** | Real device location vs `ReferenceOrigin` fallback |
| | Native Map Container | **PARTIAL** | Spatial list fallback working; MapLibre / Maps Compose planned for Wave 4 |
| | Transit Stop & Route Markers | **PARTIAL** | Stop list and distance heuristics active; vector polylines in Wave 4 |
| **Notifications** | Local Notification Manager | **WORKING** | Verified push notifications for trip guidance and test prompts |
| | Foreground Channel Dispatch | **WORKING** | Android O+ notification channels registered |
| **Offline & Media** | Image Caching (Coil) | **WORKING** | OkHttp HTTP disk cache configured for catalog photos |
| | Media3 Video Playback | **NOT_STARTED** | Scheduled for Wave 6 with AI Generated labeling rules |

---

## 2. Status Label Definitions

- **WORKING**: Implemented, compiled, and verified running on physical Android hardware.
- **PARTIAL**: Implemented in code/memory; undergoing backend or storage optimization.
- **UI_ONLY**: Visual presentation and interaction complete; backend staging contract in proposal.
- **BACKEND_ONLY**: Backend endpoints exist; mobile Compose presentation pending.
- **NOT_STARTED**: Planned for later implementation wave.
- **BLOCKED**: Waiting on external dependency or hardware feature.
- **DEFERRED**: Explicitly pushed to post-Round 2 sprint.
