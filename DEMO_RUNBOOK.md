# DEMO_RUNBOOK.md — O-TRAVELZ Demo Startup & Fallback Procedure

> Read `PROJECT_CONTEXT.md` first.
> This file documents the known-good demo procedure, fallback strategies, and sample prompts.
> **Only add startup commands here after testing them end-to-end on the demo machine.**

---

## System Requirements

| Component | Minimum |
|---|---|
| Node.js | ≥ 18 LTS |
| Python | ≥ 3.11 |
| Docker Desktop | Latest stable (for PostGIS) |
| OS | Windows 10/11 (primary), macOS (secondary) |
| Browser | Chrome or Edge (latest) |
| RAM | ≥ 8 GB recommended |
| Network | Not required for L3 demo mode |

---

## Environment Variables

Copy `.env.example` to `.env` in the repository root and in `backend/`.
Required variables before a full L1 demo:

| Variable | Purpose | Required for L1? |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth | Yes (for auth) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Yes (for auth) |
| `AZURE_OPENAI_*` | Azure OpenAI endpoint + key | No (rule-based fallback exists) |
| `GEMINI_API_KEY` | Gemini fallback | No |
| `GROQ_API_KEY` | Groq fallback | No |

**Never commit `.env` to Git.**

---

## Startup — VERIFIED PROCEDURES

> ⚠️ **Do not add a startup step here until it has been tested and confirmed working on the demo machine.**
> Commands will be filled in after each checkpoint is verified.

### Database

*(To be filled after Checkpoint 1 database verification)*

Expected: PostgreSQL available on port 5433 (Docker) or 5432 (native).
Use `doctor.ps1` to probe both ports and report active connection.

```powershell
# Check database connectivity (runs both port 5433 and 5432 probes)
.\doctor.ps1
```

### Backend

*(To be filled after backend startup is verified)*

```powershell
# Start backend
cd backend
# activate virtual environment if needed
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend

*(To be filled after frontend startup is verified)*

```powershell
# Start frontend
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### One-Command Demo (planned)

```powershell
# After start_demo.ps1 is implemented and verified:
.\start_demo.ps1
```

---

## Service Health Verification

After starting, verify:

```
GET http://localhost:8000/health    → {"status": "ok"}
GET http://localhost:8000/ready     → {"status": "ready", "database": "connected"}
GET http://localhost:8000/system/status   → {database, ai, weather, transit, auth}
```

*(Note: `/system/status` endpoint is planned in Checkpoint 1.5)*

Frontend: `http://localhost:5173`

---

## Service Levels for Demo

### L1 — Full Live Mode (preferred for demo)
- Backend online
- PostGIS connected
- At least one AI provider active (or rule-based fallback)
- Weather: live Open-Meteo
- Transit: static scheduled timetables

### L2 — AI Degraded
- AI provider unavailable
- Rule-based planner activates automatically
- Show banner: "AI planner is using offline recommendations"
- All other features remain fully operational

### L3 — Backend Degraded (network-safe fallback)
- Backend unreachable or offline
- Frontend serves from bundled datasets:
  - Destination catalog: 161 places from bundled JSON
  - Nearby discovery: Haversine in-browser
  - Transit stops and timetables: `staticTransitStops.ts` + `transitTimetables.ts`
  - Saved places: localStorage
- Show subtle "Using cached data" notice
- **This mode is fully demo-safe for place browsing and transit timetables**

### L4 — Demo Safe Mode (fully offline)
- Access via URL: `http://localhost:5173?demo=true`
- Forces all data from local fallbacks
- OAuth / Google Sign In is disabled
- Demo badge displayed
- No external API calls
- **Use this as the backup demo path if any network issues occur**

---

## Demo Backup Flow

If the database or backend fails during a live demo:

1. **Add `?demo=true` to the browser URL** → switches to L4 Demo Safe Mode automatically.
2. All destination browsing, map, proximity, and transit timetables remain functional.
3. AI Copilot operates in rule-based mode only.
4. Announce: "Let me show you the offline resilience mode — O-TRAVELZ continues working even when backend infrastructure is unavailable."

This is a feature, not a failure. Present it as intentional.

---

## Sample Demo Prompts

*(To be updated with verified outputs after each checkpoint)*

### AI Copilot — Planning
```
Plan a 2-day heritage trip starting from Bhubaneswar
```
```
Plan one day in Puri
```
```
Show me temples and waterfalls near Cuttack
```
```
ମୋ ପାଇଁ ପୁରୀରେ ଗୋଟିଏ ଦିନ ଯୋଜନା ଦିଅ
```
(Odia: "Give me a one-day plan in Puri")

### AI Copilot — Non-Planning (verify these don't crash before demo)
```
Hello, what is O-TRAVELZ?
```
```
What can you help me with?
```

### Transit
- Select the Transit layer on the map → verify bus stop pins appear in Bhubaneswar.
- Click a stop → verify "Next scheduled departure" badge shows with route number and time.

### Multimodal Comparison (after Checkpoint 4)
```
Plan a trip from Lingaraj Temple to Konark Sun Temple
```
→ Verify: Private option (estimated) + Public Mo Bus option (scheduled departure) both appear side-by-side.

---

## 3-Minute Live Demo Script

*(Structure — fill in verified details after demo rehearsal)*

**0:00 — Open with Discovery**
- Open to home page.
- Show destination catalog with all 30 districts.
- Filter by category: Temple → show Lingaraj Temple card.
- Click "Plan Around This Place" → transitions to planner.

**0:45 — Trip Planner**
- AI Copilot: "Plan one day in Bhubaneswar focusing on heritage temples."
- Show itinerary card: stops, timings, "Why this stop?" rationale.
- Point to source labels: "Verified," "Scheduled," "Estimated."

**1:30 — Multimodal Transit**
- Expand a leg on the itinerary.
- Show: Private cab ~18 min estimated vs Mo Bus Route 09 next departure 18:35 IST (scheduled).
- Say: "We use real published CRUT timetables — not invented data."

**2:15 — Resilience**
- Add `?demo=true` to URL.
- Show: app still works fully offline.
- Say: "O-TRAVELZ degrades gracefully — tourists can still plan even with no connectivity."

**2:45 — Close**
- Briefly show the map with transit pins.
- Close on the data quality story: "161 verified destinations, 154 CRUT routes, published schedules."

---

## Known Issues (update as resolved)

| Issue | Status | Workaround |
|---|---|---|
| AI Copilot crashes on non-planning greeting | Open (Checkpoint 1.1) | Use planning queries only until fixed |
| doctor.ps1 only probes port 5433 | Open (Checkpoint 1.4) | Check both ports manually |
| `GET /system/status` not yet implemented | Open (Checkpoint 1.5) | Use `/health` and `/ready` endpoints |

---

## Post-Demo Cleanup

After demo session:
```powershell
.\stop.ps1   # or Ctrl+C each process
```

Do not leave the backend running with live credentials unattended.
