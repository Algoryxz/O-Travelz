# M18 Offline Baseline: Truthful Offline Mode, Airplane-Mode Continuity & Honest Degraded-State Execution

## 1. Wave Scope
- **Wave**: M18 — Offline Mode, Airplane-Mode Continuity, Cached Media, Deterministic Local Capability & Honest Degraded-State Execution
- **Preceding Accepted Wave**: M17 (Local Notifications)
- **Branch**: `feature/v4-platform-rebuild`

## 2. Core Implementation Deliverables
1. **Advisory Network State Monitor**:
   - Android: `NetworkConnectivityMonitor.kt` (`StateFlow<NetworkState>`) using `ConnectivityManager.NetworkCallback`.
   - iOS: `NetworkMonitor.swift` (`ObservableObject`) using `NWPathMonitor`.
   - HTTP request results remain authoritative; network callback is purely advisory.
2. **Global Degraded-State Presentation**:
   - Android: `OfflineStatusBanner.kt` integrated at the root content level in `OTravelzApp.kt`.
   - iOS: `OfflineBannerView.swift` integrated via `.safeAreaInset(edge: .top)` in `RootTabView.swift`.
   - Full dual-script localization in English and Odia.
3. **Saved Place Offline Continuity**:
   - `PlaceDetailScreen.kt` and `PlaceDetailView.swift` fall back to persisted `SavedPlaceEntity` / `SavedPlaceModel` snapshot when network fails.
   - Distinctive `Offline Snapshot` badge rendered; missing live facts (timings, fee, phone) omitted calmly.
4. **Weather Cache & Freshness**:
   - `WeatherCacheStore.kt` / `WeatherCacheStore.swift` store last-known observations with timestamps.
   - Relative elapsed time displayed (`Cached weather • %s ago`); cached weather is NEVER labeled live.
   - Zero default to `0°C` or fake sunny.
5. **Map & AI Truthful Degraded States**:
   - Map: Linear list view alternative provided with clear notice that map tiles are unavailable offline.
   - AI: Natural language prompt extraction disabled or calmly informs traveler that AI Assistant requires an internet connection.
6. **Transit & Essentials Offline Guarantee**:
   - Bundled 154 routes, 302 schedules, 5,549 departures, and 24x7 state helplines are 100% available offline on fresh install.
7. **Stage G1 / G2 Quarantine**:
   - Zero promotion of staging assets into production bundles; Stage G2 remains `LOCKED`.
   - `M18_OFFLINE_PACKAGE_INGESTION_CONTRACT.md` establishes the future manifest standard.

## 3. Invariants Verified
- `OFFLINE_MODE_IMPLEMENTED`: True
- `AIRPLANE_MODE_CONTINUITY`: True
- `SAVED_PLACES_OFFLINE_SNAPSHOT`: True
- `SAVED_TRIPS_OFFLINE_ACCESSIBLE`: True
- `TRANSIT_SCHEDULES_OFFLINE_BUNDLED`: True
- `EMERGENCY_HELPLINES_OFFLINE_BUNDLED`: True
- `ZERO_HALLUCINATED_METRICS`: True
- `ZERO_FAKE_OFFLINE_MAPS`: True
- `ZERO_FAKE_LOCAL_AI`: True
- `NO_ARBITRARY_WEATHER_TTL`: True
- `STAGE_G1_QUARANTINED`: True
- `STAGE_G2_LOCKED`: True
- `ROOM_SWIFTDATA_SCHEMA_PRESERVED`: True
- `WORKTREE_CLEAN`: True
