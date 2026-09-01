# Demo Runbook & Fallback Procedures — O-TRAVELZ

## 1. Production URLs

* **Production Backend**: `https://otravelz-backend.onrender.com`
* **Production Web App**: `https://algoryxz.github.io/O-Travelz/`
* **Backend Health**: `https://otravelz-backend.onrender.com/health` $\rightarrow$ `{"status":"ok"}`
* **Backend Readiness**: `https://otravelz-backend.onrender.com/ready` $\rightarrow$ `{"status":"ready","database":"connected"}`

---

## 2. Local Demo Startup

### Prerequisites
* Python 3.11+ / 3.12+ in `.venv`
* Node.js 18+ / 20+
* Docker Desktop (for local PostGIS on port 5433 or 5432)

### Quickstart Commands
```powershell
# 1. Check local environment & ports
.\doctor.ps1

# 2. Start backend dev server (FastAPI on port 8000)
python -m uvicorn app.main:app --app-dir backend --reload --port 8000

# 3. Start frontend dev server (Vite on port 5173)
npm --prefix frontend run dev
```

---

## 3. Verified Demo Flow & Sample Prompts

### Flow 1: Grounded Bhubaneswar Itinerary
* **Prompt**: `"Plan a 1 day trip in bbsr with temples and lunch"`
* **Expected Result**: 1-day itinerary starting in Old Town Bhubaneswar with structured arrival/departure time slots (`09:00`, `11:45`, `14:15`), visiting Lingaraj Temple, Ananta Vasudeva, and Kora Khai Hub.

### Flow 2: Transit Journey & First-Mile UX
* **Step**: Navigate to Journey Planner, select origin in Patia and destination in Old Town.
* **Expected Result**: Multimodal journey showing walking leg to Damana Square / KIIT Square, Mo Bus Route 10 / 11 transit boarding, schedule timetable, and alighting stop.

### Flow 3: Regional Culinary Search
* **Prompt**: `"Where can I get Pahala Rasgulla?"`
* **Expected Result**: Verified sweet clusters in Pahala along NH-16.

### Flow 4: Weather & Semantic Offline State
* **Behavior**: Displays live temperature, humidity, and condition for destinations; if weather provider is unavailable, cleanly renders disclaimer copy (*"Weather temporarily unavailable"*) with `—` metrics rather than `None°C` or fake numbers.
