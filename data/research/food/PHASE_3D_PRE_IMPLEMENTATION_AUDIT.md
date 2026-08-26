# O-TRAVELZ — PHASE 3D PRE-IMPLEMENTATION AUDIT
## End-to-End Stitch Journey Integration & Hardening

> **STATUS: LOCAL/DEV ONLY — STRICT DATA & GRAPH INTEGRITY AUDIT**

---

### 1. Current Subsystem Status & Audit

#### A. Location Flow (`LocationContext.tsx`)
- Currently acquires browser geolocation via `navigator.geolocation.getCurrentPosition`.
- Fallbacks to default hub (Puri / BBSR).
- **Gap to resolve**: Expose explicit `locationType` (`'LIVE_GPS' | 'MANUAL_LOCATION' | 'VERIFIED_DEFAULT_HUB' | 'UNRESOLVED'`) and clean manual location setter so the UI unambiguously communicates provenance to the traveler.

#### B. Multimodal Journey API Flow (`POST /transport/plan-journey`)
- Backend service `MultimodalJourneyPlanner` (`backend/app/transport/planner.py`) accepts origin GPS coords and resolves destination (Place, Stop, or Coordinates).
- Discovers direct route sequence on 154 routes, schedules, and Phase 3B corridor food candidate waypoints.
- **Invariants**: 100% deterministic, 0 fabricated coordinates, strict sequence ordering ($seq_{boarding} < seq_{alighting}$).

#### C. JourneyCard Contract (`StitchJourneyCard.tsx`)
- Supports both planned multimodal journey mode and single stop/route mode.
- Renders origin, walk legs, transit leg with scheduled departure times, food waypoint with detour badges, destination, and warnings.
- **Enhancement for 3D**: Add explicit journey controls (Add Food / Skip Food, Minimize Detour, dietary/cuisine preferences), and rich failure state presentation (`NO_VERIFIED_BOARDING_STOP`, `DESTINATION_UNREACHABLE`, `NO_TRANSIT_PATH`, `FOOD_UNAVAILABLE`).

#### D. Map Flow (`StitchMapPage.tsx`)
- Currently supports `'destinations' | 'experiences' | 'transit'`.
- **Enhancement for 3D**: Support dedicated `'journey'` mode when viewing a planned multimodal journey. Renders origin pin, walking leg polylines, transit boarding/alighting stops, food waypoint, and destination pin. If route geometry is partial, displays a transparent warning banner rather than drawing misleading continuous lines between unresolved stops.

#### E. Planner Flow (`StitchPlannerPage.tsx`)
- Generates curated multi-day itineraries and supports adding custom stops.
- **Enhancement for 3D**: Allow inserting planned multimodal journeys directly as structured travel segments with transit route and corridor food waypoint.

#### F. Saved Trip / Sync Flow
- Shareable trip snapshots (`POST /api/v1/trips/share`) store full itinerary JSON payloads.
- No DB schema changes or migrations needed for Phase 3D.

---

### 2. Transport Graph Confirmation

- **Transport Providers**: 3
- **Routes**: 154 (154/154 with valid ordered stop sequences)
- **Stops**: 1,430 (41 geocoded, 1,389 preserved as null)
- **Route-Stop Links**: 1,487
- **Schedule Groups**: 302
- **Scheduled Departures**: 5,553
- **Database Migrations Required**: **0**

---

### 3. Exact Files Modified/Created in Phase 3D

1. `frontend/src/context/LocationContext.tsx` — Add explicit `locationType` and `setManualLocation`.
2. `frontend/src/components/stitch/StitchJourneyCard.tsx` — Add journey preference controls (`Add/Skip Food`, `Minimize Detour`, dietary tags) and rich failure state cards.
3. `frontend/src/components/stitch/StitchTransitSection.tsx` — Connect LocationContext $\rightarrow$ journey planner destination picker.
4. `frontend/src/pages/stitch/StitchMapPage.tsx` — Support Journey Mode with verified layer rendering and partial geometry warnings.
5. `frontend/src/pages/stitch/StitchPlannerPage.tsx` — Support adding planned multimodal journeys to trip segments.
6. `backend/tests/test_phase_3d_end_to_end.py` — Backend end-to-end integration test suite.
7. `frontend/tests/stitch_phase_3d_integration.test.tsx` — Frontend integration test suite.
8. `data/research/food/PHASE_3D_END_TO_END_INTEGRATION_REPORT.md` — Master completion report.
