# O-Travelz Production Deployment & Infrastructure Specification

---

## 1. Production Architecture Overview

O-Travelz uses a decoupled, three-tier cloud architecture:

```
                  ┌──────────────────────────────────────────────────┐
                  │                 USER BROWSER                     │
                  │   Single Dark Theme · Local DPDP Consent Gate    │
                  └─────────┬──────────────────────────────┬─────────┘
                            │                              │
                1. Static Assets (HTTPS)         2. REST API / Images (HTTPS)
                            │                              │
                            ▼                              ▼
                  ┌───────────────────┐          ┌───────────────────┐
                  │  STATIC FRONTEND  │          │  FASTAPI BACKEND  │
                  │  React 18 + Vite  │          │    Python 3.12    │
                  │  (Render / Static)│          │  (Container / VM) │
                  └───────────────────┘          └─────────┬─────────┘
                                                           │
                                                 3. Private SQL / PostGIS
                                                           │
                                                           ▼
                                                 ┌───────────────────┐
                                                 │ MANAGED DATABASE  │
                                                 │ PostgreSQL 16 +   │
                                                 │ PostGIS 3.4+      │
                                                 └───────────────────┘
```

---

## 2. Environment Variable Matrix

| Variable Name | Required? | Used By | Safe for Frontend? | Production Source / Example |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Backend (FastAPI, SQLAlchemy, Alembic) | **NO** (Server-only secret) | Managed PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/otravelz`) |
| `ENVIRONMENT` | **Yes** | Backend (`app.core.config`) | **NO** (Server-only) | Set to `production` |
| `CORS_ORIGINS` | **Yes** | Backend (`FastAPI CORSMiddleware`) | **NO** (Server-only) | Comma-separated frontend domains (e.g. `https://otravelz.onrender.com`) |
| `STORAGE_BACKEND` | Optional | Backend (`app.storage`) | **NO** (Server-only) | `local` (default) or `azure` |
| `LOCAL_STORAGE_BASE_PATH` | Optional | Backend (`app.storage.local`) | **NO** (Server-only) | `./data/images` (mount path) |
| `AZURE_STORAGE_CONNECTION_STRING` | Optional | Backend (Azure Blob storage) | **NO** (Server-only secret) | Azure Key Vault / Cloud Environment |
| `AZURE_STORAGE_ACCOUNT_NAME` | Optional | Backend (Azure Blob storage) | **NO** (Server-only) | Azure Storage Account name |
| `AZURE_STORAGE_ACCOUNT_KEY` | Optional | Backend (Azure Blob storage) | **NO** (Server-only secret) | Azure Storage Account key |
| `AZURE_STORAGE_CONTAINER_NAME`| Optional | Backend (Azure Blob storage) | **NO** (Server-only) | `otravelz-images` |
| `AZURE_STORAGE_CDN_BASE_URL` | Optional | Backend (Azure CDN edge) | **NO** (Server-only) | `https://cdn.o-travelz.in` |
| `WEATHER_PROVIDER` | Optional | Backend (`app.services.weather`) | **NO** (Server-only) | `Open-Meteo` |
| `WEATHER_BASE_URL` | Optional | Backend (`app.services.weather`) | **NO** (Server-only) | `https://api.open-meteo.com/v1/forecast` |
| `WEATHER_API_KEY` | Optional | Backend (Optional premium API) | **NO** (Server-only secret) | Upstream provider secret |
| `PORT` | Optional | Backend startup (`uvicorn`) | **NO** (Server-only) | Platform-injected port (e.g. `10000` or `8000`) |
| `VITE_API_BASE_URL` / `VITE_API_URL` | Optional | Frontend (`api/client.ts`) | **YES** (Public build-time / runtime) | Backend public base URL (e.g. `https://api.o-travelz.in`) |

> [!CAUTION]
> **Zero Secrets in Frontend**: `VITE_*` environment variables are embedded into client-side JS bundles. Never prefix database URLs, storage keys, or backend secrets with `VITE_`.
> **Git Tracking**: `.env` and `.env.*` are strictly excluded in [.gitignore](file:///c:/Users/smara/Desktop/o-travelz/.gitignore). Never commit production credentials to Git.

---

## 3. Python & Runtime Specification

- **Target Runtime**: Python 3.12 (specifically `python:3.12-slim` in containerized environments).
- **Core Dependencies**:
  - `fastapi==0.115.0`
  - `uvicorn[standard]==0.30.6`
  - `sqlalchemy==2.0.35`
  - `alembic==1.13.2`
  - `psycopg2-binary==2.9.9`
  - `geoalchemy2==0.15.2`
  - `pydantic==2.9.2`
  - `pydantic-settings==2.5.2`

---

## 4. Database & Geospatial Requirements

1. **PostgreSQL Version**: PostgreSQL 16.
2. **PostGIS Version**: PostGIS 3.4+.
3. **Geospatial Model**: O-Travelz uses `Geometry(Point, 4326)` for coordinate indexing and spatial ranking. PostGIS extension must be active (`CREATE EXTENSION IF NOT EXISTS postgis;`).
4. **Alembic Working Directory**: `backend/`
   ```bash
   alembic -c backend/alembic.ini upgrade head
   ```
5. **Canonical Data Import Sequence**:
   ```bash
   # 1. Import and verify canonical places, categories, and interests across all 30 districts
   python scripts/import_places.py

   # 2. Import transit hubs and multimodal graph connections
   python scripts/import_transport.py

   # 3. Synchronize database PlaceImage records with verified WebP assets
   python scripts/sync_db_place_images.py
   ```
   *Note: All three import scripts are strictly idempotent and safe for repeated execution.*

---

## 5. Backend Production Startup

### Native Linux / Cloud Web Service Startup:
```bash
sh -c "alembic -c backend/alembic.ini upgrade head && python scripts/import_places.py && python scripts/import_transport.py && python scripts/sync_db_place_images.py && uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8000} --workers 4"
```

### Docker Container Startup:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["sh", "-c", "alembic -c alembic.ini upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"]
```

---

## 6. CORS Configuration

In production, wildcard `CORS_ORIGINS=*` must be replaced with the exact frontend production origin(s):

```bash
CORS_ORIGINS=https://otravelz.onrender.com,https://o-travelz.in,https://www.o-travelz.in
```

The backend parser in [backend/app/main.py](file:///c:/Users/smara/Desktop/o-travelz/backend/app/main.py) automatically splits comma-separated URLs and enables credentials for specified origins.

---

## 7. Frontend Production Build & Static Hosting

1. **Build Command**: `npm ci && npm run build` inside `frontend/`
2. **Publish Directory**: `frontend/dist`
3. **API URL Resolution**:
   - If frontend and backend are on different domains: supply `VITE_API_BASE_URL=https://api.o-travelz.in`.
   - If frontend and backend are hosted behind a unified reverse proxy: leave `VITE_API_BASE_URL` empty (defaults to relative path requests `/places`, `/itinerary`, `/map`, etc.).
4. **SPA Rewrite Rule**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

---

## 8. Health Checks & Verification Endpoints

| Component | Endpoint | Expected Response |
| :--- | :--- | :--- |
| **System Liveness** | `GET /health` | HTTP 200 `{"status": "ok"}` |
| **Places Catalog** | `GET /places?limit=1` | HTTP 200 Array with verified place objects |
| **Live Weather** | `GET /weather/current?hub=Bhubaneswar` | HTTP 200 Weather object with temperature and condition |
| **Map Projection** | `POST /map/v1/projection` | HTTP 200 Feature collection projection |
| **Itinerary Planning**| `POST /itinerary/plan` | HTTP 200 Multi-day itinerary schedule |
| **AI Copilot** | `POST /ai/plan` | HTTP 200 Grounded plan response with suggestions |

---

## 9. Step-by-Step Production Deployment Sequence

1. **Step 1: Provision Managed Database**
   - Create PostgreSQL 16 database with PostGIS 3.4 enabled.
   - Record internal connection URI (`DATABASE_URL`).

2. **Step 2: Deploy Backend Web Service**
   - Bind `DATABASE_URL`, `ENVIRONMENT=production`, `STORAGE_BACKEND=local`, `LOCAL_STORAGE_BASE_PATH=./data/images`.
   - Set start command to run migrations, seed places/transport/images, and start Uvicorn.
   - Verify `GET /health` returns `{"status": "ok"}`.
   - Record public backend URL (e.g. `https://otravelz-backend.onrender.com`).

3. **Step 3: Deploy Frontend Static Site**
   - Set root directory to `frontend`, build command to `npm ci && npm run build`.
   - Set environment variable `VITE_API_BASE_URL=https://otravelz-backend.onrender.com`.
   - Add SPA routing rewrite rule (`/* -> /index.html`).
   - Record public frontend URL (e.g. `https://otravelz-frontend.onrender.com`).

4. **Step 4: Update Backend CORS**
   - Update backend `CORS_ORIGINS` to `https://otravelz-frontend.onrender.com`.

5. **Step 5: End-to-End Smoke Test**
   - [ ] First visit presents Terms & Privacy consent gate (`CURRENT_TERMS_VERSION = "2026-08-21-v1"`).
   - [ ] Acceptance unlocks Discover view with 81 verified destination cards and authentic photography.
   - [ ] Live Location 2-step permission modal functions client-side without errors.
   - [ ] Deterministic 1–7 day itinerary plans generate with multimodal travel hops.
   - [ ] Real-time Open-Meteo weather widget displays accurate temperature for selected hub.
   - [ ] Leaflet interactive map displays verified PostGIS coordinates and routes.

---

## 10. Rollback Guidance & Failure Recovery

1. **Frontend Rollback**:
   - Re-deploy previous static build artifact in static host dashboard (instant zero-downtime rollback).
2. **Backend Rollback**:
   - Re-deploy previous container image or Git commit hash.
3. **Database Schema Rollback**:
   - Downgrade specific Alembic revision if needed:
     ```bash
     alembic -c backend/alembic.ini downgrade <revision_id>
     ```

---

## 11. Security Audit Findings

- **Zero Tracked Credentials**: Checked [.gitignore](file:///c:/Users/smara/Desktop/o-travelz/.gitignore); `.env` and `.env.*` are strictly untracked.
- **Zero Hardcoded Secrets**: No database passwords or API keys are committed in source code.
- **Local Paths Isolated**: No local Windows paths exist in backend or frontend production configurations.
- **Client-Side Geolocation**: Geolocation processing occurs exclusively on the traveler's device. No GPS coordinates are stored in the database or server logs.
- **DPDP Act 2023 Aligned**: First-launch consent gate and legal notices strictly adhere to responsible data governance.
