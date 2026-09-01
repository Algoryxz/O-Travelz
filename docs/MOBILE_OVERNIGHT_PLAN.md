# Mobile Overnight Sprint Plan — O-TRAVELZ

## 1. Goal & Objectives
Deliver a verified, demoable Native Android vertical slice by morning.

---

## 2. Morning P0 Scope (Mandatory Acceptance Gate)
1. **App Installs & Cold Launch**: Edge-to-edge Material 3 layout starts cleanly.
2. **Dynamic Home Screen**: Time-of-day greeting, weather pill, category chips, destination carousel.
3. **Discover Screen**: Search by name/district over verified destinations.
4. **Place Detail Screen**: High-resolution verified WebP image, coordinates, category, and first-mile access prompt.
5. **Weather Context**: Honest display of Open-Meteo observation with "LIVE" / "UNAVAILABLE" badge.
6. **AI Itinerary Planner**: Real request to backend returning structured time slots and transport hops.
7. **DPDP Location State Machine**: Idle $\rightarrow$ Requesting $\rightarrow$ Granted / Denied handling.
8. **Map View**: Canonical destination pins and nearest-first distance calculation.
9. **First-Mile Thresholds**: $\le 800\text{m}$ walking, $800\text{m}–1500\text{m}$ walk/auto, $> 1500\text{m}$ auto/cab.
10. **Local Notification & Deep Link**: Notification trigger leading to `otravelz://place?id=...`.
11. **Offline / Network Error Recovery**: Non-crashing error state with retry.
12. **Verification**: Unit tests pass (`assembleDebug`, `test`).

---

## 3. Team Workstream Mapping
- **Smarak** (`mobile/core-smarak`): Architecture, navigation graph, DI/client config, release build verification.
- **Deeptiman** (`mobile/ui-deeptiman`): Design system, Odisha themes, Hero media transitions, UI consistency review.
- **Rudra** (`mobile/maps-rudra`): Maps projection, GPS location callbacks, transit stop integration, first-mile logic.
- **Susmita** (`mobile/notifications-susmita`): `POST_NOTIFICATIONS` runtime permission, local notification scheduling, deep link dispatching.
- **Akriti** (`mobile/data-akriti`): OpenAPI sync, Retrofit API endpoints, repositories, weather & place caching.
- **Punam** (`mobile/features-punam`): Trip planner UI, AI prompt handling, error/offline states, Robolectric unit tests.

---

## 4. Timeline & Deadlines
- **Hour 0–1**: Foundation verification, repo checkout, branch synchronization.
- **Hour 1–5**: Parallel feature development on assigned branches.
- **Hour 5 (Feature Freeze)**: **ABSOLUTE FEATURE FREEZE**. No new screens or features.
- **Hour 5–7**: Integration into `feature/mobile-v1`, merge conflict resolution, bug fixes, UI polish.
- **Hour 7–8**: Acceptance testing on emulator and physical Android hardware.
