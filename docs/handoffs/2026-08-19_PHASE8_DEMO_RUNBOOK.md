# Phase 8 — Demo Operator Runbook & Presenter Guide

## Task

Canonical Operator Runbook and Step-by-Step Presenter Guide for the O-Travelz Phase 8 Reproducible Demo.

## Owner

Punam coordinates Phase 8 Demo Preparation and presentation with all subsystem owners (Smarak, Akriti, Rudra, Susmita, Deeptiman).

## Phase

Phase 8 — Demo preparation.

## Objective

Provide a step-by-step, deterministic, and presenter-ready runbook for executing the approved O-Travelz trip planner demo across the integrated local stack.

## Status

COMPLETE — Verdict: **READY WITH CANONICAL LIMITATIONS**

---

## 1. Demo Objective & Central Principle

Demonstrate a transportation-aware itinerary planning system for Bhubaneswar, Odisha that enforces the core project rule:
> **"AI orchestrates. It does not invent travel facts."**

Every displayed place, coordinate, category, transport hop, duration, and transit leg comes exclusively from verified data and deterministic backend services. Factual prose in conversational responses is strictly grounded in current-turn tool results.

---

## 2. Pre-Demo Verification & Checklist

Before starting the presentation, verify:
- [ ] Docker daemon is running.
- [ ] PostgreSQL/PostGIS container (`infra-db-1`) is healthy on port `5432`.
- [ ] Virtual environment `.venv` has all required backend packages installed.
- [ ] Frontend dependencies (`frontend/node_modules`) are installed.
- [ ] Port `8000` is free for the FastAPI backend server.
- [ ] Port `5173` is free for the Vite frontend server.
- [ ] Browser can open `http://127.0.0.1:5173`.

---

## 3. Exact Startup Procedure

Open three terminal windows:

### Terminal 1: Database
```bash
docker-compose -f infra/docker-compose.yml up -d db
```
*Verify: `docker ps` shows `infra-db-1` with status `Up (healthy)`.*

### Terminal 2: Backend API
```bash
cd backend
../.venv/Scripts/uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Verify: `GET http://127.0.0.1:8000/health` returns `{"status":"ok"}`.*

### Terminal 3: Frontend Web Server
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
*Verify: Open browser to `http://127.0.0.1:5173`.*

---

## 4. Step-by-Step Presenter Script & Flow

### Step 1: Open Application & Show Initial State
1. **Action**: Navigate to `http://127.0.0.1:5173`.
2. **Presenter Script**:
   > "Welcome to O-Travelz. This is a transportation-aware itinerary planner for Bhubaneswar, Odisha. All recommendations, travel times, and map coordinates come strictly from verified backend facts and deterministic services."
3. **What Appears**:
   - Header with `O-Travelz` badge: `Phase 6B · Itinerary & Geospatial`.
   - Title: `Transportation-Aware Itinerary Planner`.
   - Mode Selector Tabs: `Structured Constraints` (active) and `AI Natural Language Planner`.
   - Initial State card: `Ready to Plan Your Trip` with guidance on setting days, origin, and interests.

---

### Step 2: Enter Planning Constraints & Generate Itinerary
1. **Action**: In the `Structured Constraints` form:
   - Set **Trip Duration (Days)**: `2` (in `#days-input`).
   - Set **Start Location / Origin**: `Lingaraj Temple` (in `#start-input`).
   - Under **Interests / Categories**:
     - Click `temple` (chips activate with green highlight).
     - Add `history` in `Add custom interest...` and click **Add** (or select `heritage`).
   - Click the green **Plan Itinerary** button (`#submit-plan-button`).
2. **Presenter Script**:
   > "We submit our planning constraints to the deterministic backend planner via `POST /itinerary/plan`. The backend selects verified places using exact category relevance and plans transit hops between consecutive stops."
3. **What Appears**:
   - Loading indicator briefly animates: `Planning Your Itinerary...`.
   - View switcher appears showing `Itinerary Schedule` (selected) and `Geospatial Map (6)`.
   - `Itinerary Schedule` renders:
     - **Day 1**: 3 stops:
       1. `Bindu Sagar` (Category: `lake`)
       2. `Kalinga Stadium` (Category: `sports_venue`)
       3. `Ananta Vasudeva Temple` (Category: `temple`)
     - **Day 1 Hops**:
       - `Origin Start → Stop 1`: Walk (5 min, ~72m), Data Tier: `static`.
       - `Stop 1 → Stop 2`: Walk (71 min, ~5675m), Data Tier: `static`.
       - `Stop 2 → Stop 3`: Walk (72 min, ~5674m), Data Tier: `static`.
     - **Day 2**: 3 stops:
       1. `Baitala Deula` (Category: `temple`)
       2. `Bhaskareswar Temple` (Category: `temple`)
       3. `Chitrakarini Temple` (Category: `temple`)
     - **Day 2 Hops**:
       - `Stop 1 → Stop 2`: Walk (27 min, ~2147m), Data Tier: `static`.
       - `Stop 2 → Stop 3`: Walk (27 min, ~2096m), Data Tier: `static`.

---

### Step 3: Demonstrate Authoritative Map Projection
1. **Action**: Click the **Geospatial Map** tab (`#result-tab-map`).
2. **Presenter Script**:
   > "When the itinerary is generated, the frontend automatically queries `POST /map/v1/projection` using canonical place UUIDs. Notice that coordinates are rendered strictly from backend WGS84 model facts. No coordinates are geocoded on the client, and no route lines are invented."
3. **What Appears**:
   - Map Section Header: `Authoritative Geospatial Projection (POST /map/v1/projection)`.
   - Metric Counters: `6 Verified Points`, `0 Missing Geometry`, `5 Transit Relationships`.
   - SVG Map Canvas: Displays 6 numbered stop pins plotted accurately according to their longitude and latitude.
   - `Projection Layer Breakdown` Drawer:
     - Lists all 6 verified place UUIDs with explicit latitude and longitude values (e.g., `85.8323°, 20.2424°`).
     - Lists 5 transit relationships with preserved sequences and `static` data tiers.

---

### Step 4: Conversational AI Refinement
1. **Action**:
   - Click the **AI Refinement** tab in the mode selector (`#mode-tab-ai`).
   - In the input field (`#ai-message-input`), type:
     ```text
     Actually make it 2 days and include sports
     ```
   - Click **Refine Itinerary** (`#ai-submit-button`).
2. **Presenter Script**:
   > "Now let's converse with the AI planner. The AI layer parses user intent, converts it into structured constraints, calls deterministic backend tools, and frames its response using only tool-returned facts. Raw LLM output is quarantined so hallucinated facts cannot enter."
3. **What Appears**:
   - Status Badge: `Success` (in green).
   - Grounded Message:
     > *"Here is the grounded result. I built a 2-day itinerary with 6 planned stop(s). It includes Bindu Sagar. It includes Kalinga Stadium. It includes Ananta Vasudeva Temple... It includes Baitala Deula. It includes Bhaskareswar Temple. It includes Chitrakarini Temple."*
   - Itinerary Schedule automatically updates with the refined plan.
4. **Action**: Switch to the **Geospatial Map** tab (`#result-tab-map`).
5. **Presenter Script**:
   > "The map projection immediately synchronizes with the refined itinerary. Old markers are cleared and new verified coordinates for the refined stops appear automatically."
6. **What Appears**:
   - Updated map projection reflecting the refined stop schedule.

---

### Step 5: Demonstrate Structured Re-Planning
1. **Action**:
   - Click the **Structured Constraints** tab (`#mode-tab-structured`).
   - Change **Trip Duration (Days)** to `3`.
   - Under interests, add `lake` and keep `temple`.
   - Click **Re-plan Itinerary** (`#submit-plan-button`).
2. **Presenter Script**:
   > "The user can also modify constraints directly through structured controls. Re-planning triggers deterministic recalculation and updates both the itinerary schedule and the map projection."
3. **What Appears**:
   - 3-day itinerary (`8 stops, 6 hops`) renders in the schedule view.
   - Switching to the Map tab shows `8 Verified Points` and `6 Transit Relationships`.

---

### Step 6: Demonstrate Honest Error Handling (Optional/Recommended)
1. **Action**:
   - Click **Reset** in the form.
   - Enter `0` in the days input or submit with no interests selected.
2. **Presenter Script**:
   > "If an invalid constraint is provided, the backend returns a structured HTTP 422 error. The application surfaces the error honestly without fabricating a fake fallback itinerary."
3. **What Appears**:
   - Structured error alert: `ApiError 422: Invalid itinerary request`.

---

## 5. Known Canonical Limitations (Must Disclose)

When presenting, explicitly explain the following approved architectural boundaries:
1. **AI Model Provider**: The demo uses the accepted provider-neutral rule-based model adapter with strict current-turn tool grounding. Commercial LLM integration is deferred.
2. **Authoritative Transit Geometry**: Road transit hops display `provider_geometry_unavailable` with honest `geometry: null`. No synthetic street geometry is invented.
3. **AMA Bus Research Scope**: 72 confirmed stops with NULL coordinates and 95 routes are persisted; AMA coordinate mapping and Route 12 topology remain excluded pending an authoritative cross-system identity crosswalk.
4. **Local Deployment**: The frontend runs via Vite development server rather than a Docker container, consistent with canonical project decisions.

---

## 6. Troubleshooting & Recovery Procedures

### Issue A: "NetworkError: Failed to fetch"
- **Cause**: Backend FastAPI server is not running on port 8000.
- **Recovery**: Open Terminal 2 and run:
  ```bash
  cd backend && ../.venv/Scripts/uvicorn app.main:app --host 127.0.0.1 --port 8000
  ```

### Issue B: "Database connection failed / SQLAlchemy OperationalError"
- **Cause**: Docker container `infra-db-1` is stopped.
- **Recovery**: Run:
  ```bash
  docker-compose -f infra/docker-compose.yml up -d db
  ```
  Wait 5 seconds for healthcheck, then test with `curl http://127.0.0.1:8000/health`.

### Issue C: UI shows stale state
- **Cause**: Browser cache or previous session state.
- **Recovery**: Click the **Reset** button in the form or perform a hard browser refresh (`Ctrl+F5`).

---

## 7. Post-Demo Cleanup Checklist

After concluding the presentation:
- [ ] Stop backend and frontend development servers (`Ctrl+C` in Terminals 2 & 3).
- [ ] Stop Docker database container if no longer needed:
  ```bash
  docker-compose -f infra/docker-compose.yml down
  ```
- [ ] Verify no unapproved application code changes were introduced (`git status`).

---

## 8. Feature Freeze Notice

**FEATURE FREEZE IS ACTIVE.**
No new product features, UI redesigns, map libraries, or database changes may be introduced. The application code is frozen and approved for Phase 8 demo presentation.
