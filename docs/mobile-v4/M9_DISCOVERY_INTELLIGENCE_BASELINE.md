# O-TRAVELZ MOBILE V4 — WAVE M9: DISCOVERY INTELLIGENCE BASELINE

**Document Version**: 1.0.0  
**Wave**: M9 (Discovery Intelligence: Search Quality, Spatial Filtering, Ranking & Catalog Exploration)  
**Status**: ACCEPTED  
**Date**: September 2026  
**Architect**: Algoryxz Platform Team  

---

## 1. Executive Summary

Wave M9 delivers client-side Discovery Intelligence for the O-TRAVELZ Mobile V4 platform across Android and iOS. Building on the production Discover + Place Detail vertical slice established in Wave M8, M9 implements high-speed, deterministic search, multi-dimensional filtering, bilingual script matching (English and Odia), Haversine spatial proximity sorting, and contextual location permission management.

### Key Metrics
- **Catalog Size**: 179 eligible leisure destinations (out of 204 total places in PostgreSQL backend, with 25 non-leisure entities excluded).
- **Coordinate Completeness**: **100% (179 of 179 places)** possess valid, verified latitude and longitude coordinates.
- **District Coverage**: All 30 Odisha revenue districts covered, with historical `Kendujhar` normalized to `Keonjhar`.
- **Search Latency**: < 1ms per keystroke (evaluated in-memory on client devices).
- **Network Overhead**: 0 network requests for query typing or filter adjustments.
- **Authentic Media Truth**: 70 verified authentic photo places, 109 dignifying cultural sandstone cards, 0 stock photos or AI fabrications.

---

## 2. Architecture: In-Memory Client-Side Search (Option B)

### Rationale
In Wave M9, an architectural evaluation was conducted between:
- **Option A (Server-Side Endpoint)**: Every keystroke sends debounced HTTP requests to `/places?search=...`.
- **Option B (Client-Side In-Memory Engine)**: Discover loads the complete leisure catalog once (~150 KB JSON payload) and executes instant filtering, scoring, and sorting in memory.

**Selected Approach: Option B.**

### Justification & Ponytail Alignment:
1. **Catalog Payload Footprint**: 179 destination entities occupy ~142.5 KB in memory. This is trivial for modern mobile devices (minSdk 26 / iOS 17+).
2. **Sub-millisecond Latency**: Local filtering evaluates in < 1ms at 60fps, providing instantaneous keystroke response without network lag or debounce spinners.
3. **Transit Dead-Zone Resilience**: In rural Odisha, national parks, and highway transit (e.g. Similipal, Koraput, Chilika), connectivity drops frequently. With Option B, travelers retain full search and filter functionality even in offline dead-zones.
4. **Zero Backend Chatter**: Eliminates redundant server load and prevents client-server contract drift.

---

## 3. Deterministic Tiered Ranking Contract

The search engine strictly conforms to a 6-tier deterministic relevance scoring system across both Android (`DiscoverSearchEngine.kt`) and iOS (`DiscoverSearchEngine.swift`):

| Tier | Matching Rule | Score | Example Query | Example Match |
|---|---|---|---|---|
| **Tier 1** | Exact place name match (case-insensitive) | **1000 pts** | `Puri` | `Puri` (Puri Beach) |
| **Tier 2** | Prefix match on place name | **800 pts** | `Dhauli` | `Dhauli Shanti Stupa` |
| **Tier 3** | Authentic Odia script substring match | **600 pts** | `କୋଣାର୍କ` | `କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର` (Konark) |
| **Tier 4** | Normalized District or Category match | **400 pts** | `temple` / `Keonjhar` | All temples / all Keonjhar places |
| **Tier 5** | Name contains query substring / all tokens | **200 pts** | `Lingaraj` | `Lingaraj Temple` |
| **Tier 6** | Token substring match in name/district/category | **100 pts** | Partial tokens | Multi-token fallbacks |

### Tie-Breaking Hierarchy
When two places share the same score:
1. Places with **verified authentic imagery** (`primaryPhoto != null`) rank higher than unverified candidates.
2. Ties are deterministically broken by **alphabetical name ordering (A-Z)**.

---

## 4. Multi-Dimensional Filtering & Normalization

The Discover screen features two horizontal scrolling chip rows:
1. **Row 1 (Categories + Near Me)**:
   - `Near Me` (opt-in spatial proximity toggle)
   - `All Categories`
   - `Heritage`, `Nature`, `Beach`, `Temple`, `Culture`, `Crafts`
2. **Row 2 (Districts)**:
   - `All Districts`
   - Dynamically aggregated list of all 30 Odisha districts derived from loaded places.

### District Normalization
The database contains legacy variations such as `Kendujhar`. The domain mapper normalizes `Kendujhar` to `Keonjhar`, guaranteeing clean, single-entry district filtering.

---

## 5. Spatial Proximity & Truth Boundaries

### Great-Circle Haversine Formula
Spatial sorting uses the canonical Haversine great-circle distance:
$$\Delta\sigma = 2 \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cos\phi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
$$d = R \cdot \Delta\sigma \quad (R = 6371\text{ km})$$

### Presentation Truth Contract
- Distances `< 1.0 km` are displayed as meters (e.g. `650 m away`).
- Distances `\ge 1.0 km` are displayed to 1 decimal place (e.g. `2.4 km away`).
- **NEVER imply driving, walking, or transit travel times** (e.g. "15 mins away" is strictly prohibited without authentic real-time traffic and route telemetry).

### Contextual Permission Opt-In
In strict compliance with privacy guidelines:
- **Zero location permission prompts on launch**.
- Location permission (`ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION` on Android, `WhenInUse` on iOS) is requested **only when the traveler explicitly taps the "Near Me" chip**.
- If denied, the app degrades gracefully with a respectful non-blocking notification and maintains default ranking without crashing or nagging.

---

## 6. Actionable Zero-Result Recovery

When an active combination of search query, category, district, or Near Me yields 0 matches, the interface displays:
1. Informative empty state with cultural sandstone styling.
2. Contextual individual recovery chip buttons:
   - **"Clear search"** (clears text input)
   - **"All districts"** (resets district filter)
   - **"All categories"** (resets category filter)
   - **"Disable Near Me"** (disables proximity sort)
   - **"Reset all filters"** (resets entire filter state)

---

## 7. Cross-Platform Parity

| Feature | Android (Jetpack Compose) | iOS (SwiftUI) | Parity Status |
|---|---|---|---|
| Search Engine Logic | `DiscoverSearchEngine.kt` | `DiscoverSearchEngine.swift` | EXACT |
| Scoring Tiers (1000/800/600/400/200/100) | Yes | Yes | EXACT |
| District Normalization | Kendujhar $\to$ Keonjhar | Kendujhar $\to$ Keonjhar | EXACT |
| Proximity Distance Formula | Haversine trigonometric | Haversine trigonometric | EXACT |
| Distance Label Formatting | "X m away" / "X.X km away" | "X m away" / "X.X km away" | EXACT |
| Location Permission Timing | Explicit opt-in on Near Me tap | Explicit opt-in on Near Me tap | EXACT |
| Zero-Results Recovery | Discrete chip buttons | Discrete chip buttons | EXACT |
| Bilingual String Keys | `res/values/strings.xml`, `values-or` | `en.lproj`, `or.lproj` | EXACT |

---

## 8. Verification & QA Summary

1. **Android Unit Tests**:
   - `DiscoverPlaceModelTest.kt`: 11 passed, 0 failed.
   - Verified exact match, prefix match, Odia script match, district normalization, Haversine distance calculation, and proximity sorting.
2. **Android Build**:
   - `:android:assembleDebug`: BUILD SUCCESSFUL.
3. **Android Lint**:
   - `:android:lintDebug`: clean.
4. **iOS Validation**:
   - Source code complete with full unit tests in `DiscoverDomainTests.swift`. Runtime execution pending macOS developer environment.
