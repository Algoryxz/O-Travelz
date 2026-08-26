# O-TRAVELZ — PHASE 4B PRE-IMPLEMENTATION AUDIT
## Schedule-Aware 1-Transfer Multimodal Routing

> **STATUS: LOCAL/DEV ONLY — PRE-IMPLEMENTATION FORENSIC AUDIT**
> **ENVIRONMENT: LOCAL/DEV ONLY — ZERO MUTATIONS, ZERO MIGRATIONS, ZERO FABRICATIONS**
> **BASELINE: 3 PROVIDERS, 154 ROUTES, 1,430 STOPS, 1,487 LINKS, 302 SCHEDULES, 5,553 DEPARTURES**

---

### 1. Objective & Problem Analysis
In Phase 4A, Canonical Transit Hub clustering was established to resolve naming fragmentation across stops representing the same physical hub. However, `MultimodalJourneyPlanner` was strictly restricted to direct single-route journeys.

In the real CRUT transit network across Odisha:
- Many pairs of origin/destination points (e.g. Master Canteen $\leftrightarrow$ Baramunda ISBT, or Master Canteen $\leftrightarrow$ SCB Medical Cuttack) require an interchange at a major hub (e.g. Rasulgarh, Baramunda BSABT, Master Canteen).
- Travelers frequently depart at a specific time (e.g., "10:00 AM") and require schedule-feasible departures where the second leg departs after the first leg arrives plus an interchange buffer.

Phase 4B implements **Schedule-Aware 1-Transfer Multimodal Routing** on top of the authoritative RouteStop graph and Phase 4A Canonical Hubs.

---

### 2. Forensic Discovery of Real 1-Transfer Opportunities

Let us examine real transfer combinations across canonical hubs in the active database:

1. **Master Canteen $\to$ Baramunda Interchange**:
   - `BHUBANESWAR RAILWAY STATION` (Route 32 to Lingaraj Temple / Baramunda)
   - Transfer Hub: `HUB_BARAMUNDA_BSABT`
   - Route B: Routes 18, 37, 41, 42, 43, 44, 51, 91 departing Baramunda BSABT.
2. **Master Canteen $\to$ Cuttack SCB Medical**:
   - Leg 1: Route 82 (`AIRPORT` $\to$ `MASTER CANTEEN - SCB MEDICAL`) or Route 16 to NH.
   - Transfer Hub: `HUB_SCB_MEDICAL` / `HUB_MASTER_CANTEEN`.
   - Leg 2: Routes 80, 80E, 89, 89A serving SCB Medical.
3. **Airport $\to$ Nandankanan**:
   - Leg 1: Route 82 (`AIRPORT` $\to$ `MASTER CANTEEN - SCB MEDICAL`).
   - Transfer Hub: `HUB_MASTER_CANTEEN` (`BHUBANESWAR RAILWAY STATION`).
   - Leg 2: Route 46 (`BHUBANESWAR RAILWAY STATION` $\to$ `NANDANKANAN`).

---

### 3. Transfer Timing & Schedule Model Design

- **Constant**: `DEFAULT_TRANSFER_BUFFER_MINS = 10` (Enforces minimum 10 minutes between Leg 1 arrival and Leg 2 departure).
- **Time Representation**: Pure integer minutes from midnight `[0..1439]` for deterministic comparison and arithmetic.
- **Departure Selection**:
  - For direct routes: Earliest scheduled departure $\ge \text{requested\_departure\_time} + \text{walk\_to\_stop\_mins}$.
  - For 1-transfer routes:
    - Leg 1 departure $D_1 \ge \text{requested\_departure\_time} + \text{walk\_to\_stop\_mins}$.
    - Leg 1 arrival $A_1 = D_1 + \text{duration}_1$.
    - Leg 2 departure $D_2 \ge A_1 + \text{DEFAULT\_TRANSFER\_BUFFER\_MINS}$.
    - Leg 2 arrival $A_2 = D_2 + \text{duration}_2$.
    - Total journey arrival $= A_2 + \text{walk\_to\_dest\_mins}$.
- **Ranking Hierarchy**:
  1. Fewest transfers (0 transfers strictly beats 1 transfer).
  2. Earliest feasible arrival time ($A_2$ or $A_1$).
  3. Lowest total walking distance ($W_1 + W_2$).
  4. Lowest total transit duration.
  5. Fewest total stops.

---

### 4. Non-Negotiable Data Safety & Coordinate Integrity

- **Unresolved Coordinates**: 1,389 unresolved stops retain `location = NULL` and `coordinate_status = 'unresolved'`.
- **Spatial Boarding/Alighting**: Strictly restricted to the 41 geocoded stops (and their Canonical Hub members).
- **Zero Fabricated Departures**: Departures are strictly drawn from the 302 official `ScheduledTripGroup` records containing 5,553 departures.
- **Zero Database Mutations**: No Alembic migrations, no table mutations, no record alterations.
