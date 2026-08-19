# O-Travelz Demo Runbook

**Document Status**: Canonical Phase 8 Release & Demonstration Runbook
**Coordination**: Punam & Engineering Team
**Scope**: Approved reproducible demo scenarios, step-by-step presentation guide, and resilience procedures.

---

## 1. Purpose and Scope

This runbook provides the exact, deterministic script for demonstrating **O-Travelz** during Phase 8. It covers two canonical scenarios exercising the complete integrated stack:
1. **Scenario 1: The Odisha Heritage Triangle** (Bhubaneswar $\rightarrow$ Puri $\rightarrow$ Konark)
2. **Scenario 2: Coastal Eco-Tourism & Wildlife** (Puri $\rightarrow$ Chilika $\rightarrow$ Konark)

The presentation emphasizes **grounded deterministic authority**, **verified Whole-Odisha geography**, **data-tier transparency**, and **private Azure cloud image delivery**.

---

## 2. Prerequisites & Setup Verification

Before starting the live demonstration, confirm the local and cloud environment state:

### Environment Variables (`.env`)
```bash
STORAGE_BACKEND=azure
AZURE_STORAGE_ACCOUNT_NAME=stotravelzprod
AZURE_STORAGE_CONTAINER_NAME=otravelz-images
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/otravelz
```

### Preflight Health & Verification Commands
Run these commands from the repository root:
```bash
# 1. Verify Azure CLI identity
az account show --output table

# 2. Run backend pytest quality gate (274 tests)
.venv\Scripts\pytest.exe backend/tests --basetemp=backend/tests/.tmp -p no:cacheprovider
Remove-Item -Recurse -Force backend/tests/.tmp

# 3. Run frontend test suite (128 tests across 16 files)
npm --prefix frontend test

# 4. Start backend development server (Port 8000)
.venv\Scripts\uvicorn.exe app.main:app --app-dir backend --port 8000

# 5. Start frontend development server (Port 5173)
npm --prefix frontend run dev
```

Open browser at `http://localhost:5173`.

---

## 3. Scenario 1: The Odisha Heritage Triangle

### 3.1 Initial Input
Navigate to **Plan Trip** tab and submit:
- **Days**: `3`
- **Interests**: `["heritage", "temple"]`
- **Starting Location**: `Bhubaneswar`

### 3.2 Expected Itinerary Behavior
- **API Call**: `POST /itinerary/plan`
- **Response**: Returns structured 3-day itinerary:
  - **Day 1**: Bhubaneswar heritage circuit (Ananta Vasudeva, Baitala Deula, Bhaskareswar).
  - **Day 2**: Regional temple circuit (Chitrakarini, Cuttack Chandi, Gundicha Temple).
  - **Day 3**: Coastal sacred circuit (Gupteswar, Huma Leaning Temple, Jagannath Temple Puri).
- **Transport Presentation**: Transit hops display sequencing, mode (`walk`, `road`, `bus`), and data tier (`static` / `scheduled`). Walking is capped at $\le 2\text{ km}$; longer connections utilize road routing.

### 3.3 AI Grounded Refinement
In the **AI Copilot** panel, submit:
> *"Change this to a 2-day itinerary starting from Puri with beach and heritage"*

- **API Call**: `POST /ai/plan` with structured constraints.
- **Expected Grounded Behavior**:
  - AI model text is quarantined; response displays deterministic explanation: *"Here is the grounded result. I built a 2-day itinerary with 6 planned stop(s)..."*.
  - Itinerary view immediately updates to a 2-day schedule starting from Puri.

### 3.4 Map Verification & Popup Handoff
Switch to **Map** tab:
- **API Call**: `POST /map/v1/projection`
- **Expected Rendering**:
  - Displays verified `Point` coordinate markers for sacred sites with canonical names, categories, and regions.
  - Clicking any Leaflet pin opens a popup card.
  - Clicking **Plan Trip** inside the popup immediately transitions to the planning workspace with that destination.

### 3.5 Azure Image Delivery
- Click **Details** on Lingaraj Temple or Jagannath Temple:
- **Expected Delivery**: Streams WebP bytes via `/api/v1/images/.../hero.webp` with full legal provenance and multi-image photo galleries.

---

## 4. Scenario 2: Coastal Eco-Tourism & Saved Places Handoff

### 4.1 Initial Input
In **Plan Trip** tab:
- **Days**: `2`
- **Interests**: `["nature", "beach"]`
- **Starting Location**: `Puri`

### 4.2 Expected Itinerary Behavior
- Returns a 2-day itinerary focused on Odisha's coastline (Chandipur, Chandrabhaga, Gopalpur, Puri Golden Beach, Ramachandi, Swargadwar).

### 4.3 Ambiguous AI Safety Demonstration
In **AI Copilot** panel, enter ambiguous text:
> *"tell me about nature"*

- **Expected AI Safety Behavior**:
  - Returns `status="clarification"`: *"How many days should I plan, and which Odisha region or themes (e.g. Puri, Konark, Chilika..."*.
  - AI **does not** hallucinate or modify the active itinerary without explicit constraints.

### 4.4 Explicit Grounded Refinement
Enter:
> *"Extend this trip to 3 days and add wildlife interests"*

- **Expected Behavior**: Deterministically recalculates and renders a 3-day itinerary with 9 planned stops.

### 4.5 Saved Places Planning Handoff
1. Navigate to **Destinations** and save *Puri Golden Beach*, *Konark Sun Temple*, and *Daringbadi Hill Station*.
2. Open **Saved Places** tab.
3. Click **Plan Trip with Saved**:
   - Aggregates distinct categories (`beach`, `monument`, `nature`) into `constraints.interests`.
   - Sets the initial starting destination.
   - Transitions directly into the structured planner workspace.

---

## 5. Presenter Speaking Script & Strict Grounding Rules

### What the Presenter SHOULD Say:
1. *"O-Travelz delivers deterministic, fact-grounded travel planning for Odisha. Every destination, coordinate, and route is backed by verified data."*
2. *"Our AI layer operates under strict safety quarantine: it interprets user intent into structured constraints, but deterministic backend engines build the itinerary."*
3. *"Imagery is delivered securely from storage through an authenticated FastAPI proxy with immutable caching headers and verified legal provenance."*
4. *"Walking journeys are strictly constrained to under 2 km; intercity hops utilize backend road and transit routing."*
5. *"When transport schedules or geometries are unavailable or estimated, the UI displays explicit data-tier badges rather than fabricating live data."*

### What the Presenter Must NOT Claim:
1. **DO NOT** claim the AI generates routes or writes SQL. (AI only emits structured tool calls).
2. **DO NOT** claim we have live real-time GPS tracking for all rural buses. (We explicitly show `scheduled` / `static` / `heuristic` badges).
3. **DO NOT** claim the storage container is unauthenticated. (Private proxy architecture with verified caching).
4. **DO NOT** claim live commercial booking, flight purchasing, or hotel reservations exist. (Explicitly out of scope per PRD).

---

## 6. Recovery & Troubleshooting Procedures

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| **Azure Image Returns 500/403** | Expired Azure CLI token | Run `az login` in terminal, then restart FastAPI. |
| **FastAPI Fails to Start** | PostgreSQL not running | Check `pg_isready` and start PostgreSQL service. |
| **Map Tiles Don't Load** | Internet connectivity dropped | Map falls back to internal SVG coordinates canvas. |
| **Pydantic Deprecation Warning** | Pydantic v2 config syntax | Known non-blocking technical debt; ignore during run. |
