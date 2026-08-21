# O-Travelz Deployment Guide & Infrastructure Specification

---

## 1. Current Deployment Target
**Platform**: [Render](https://render.com/)

---

## 2. Why Render
- **Railway PostGIS Incompatibility**: During initial infrastructure provisioning on Railway, the default managed PostgreSQL template lacked the required `PostGIS` geospatial extension, and extension installation was blocked.
- **PostGIS Preservation**: O-Travelz models geographical coordinates natively using PostGIS `Geometry(Point, 4326)` in PostgreSQL. Render's managed PostgreSQL includes native PostGIS support without modifying the database schema or removing geospatial features.
- **Unified Monorepo Support**: Render natively supports monorepo root directory targeting for static frontend sites, backend web services, and managed PostgreSQL databases.

---

## 3. Deployment Architecture

```
GitHub Repository: Algoryxz/O-Travelz (Branch: release/stable-baseline)
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [Render Static Site]             [Render Web Service]
     otravelz-frontend                otravelz-backend
   (React 18 + Vite SPA)           (FastAPI + Python 3.12)
            │                                 │
            │ REST API / Image Requests       │ Private / Internal DB Connection
            └─────────────────────────────────►
                                              │
                                              ▼
                                 [Render Managed PostgreSQL]
                                         otravelz-db
                                   (PostgreSQL 16 + PostGIS)
```

---

## 4. Current Deployment Status

| Service Component | Platform Target | Status | Notes |
| :--- | :--- | :--- | :--- |
| **PostgreSQL / PostGIS** | Render Managed PostgreSQL | `PENDING_USER_PROVISION` | Ready for creation in Render dashboard |
| **Backend Web Service** | Render Web Service (Python 3) | `READY_FOR_CONFIG` | Start command chains migrations & place seeding |
| **Frontend Static Site** | Render Static Site | `READY_FOR_CONFIG` | Vite production build with SPA rewrite rule |
| **End-to-End Live System**| Render Staging URL | `PENDING_DEPLOY` | Awaiting service creation and environment variable binding |

---

## 5. Render Configuration Matrix

### A. Database Service (`otravelz-db`)
- **Service Type**: Managed PostgreSQL
- **Database Name**: `otravelz`
- **Database User**: `otravelz`
- **PostgreSQL Version**: `16`
- **PostGIS Requirement**: Mandatory (automatically enabled via migration `0001_initial_schema.py`)
- **Alembic Migration Command**: `alembic -c backend/alembic.ini upgrade head`
- **Place Seeding Command**: `python scripts/import_places.py` (Seeds all 81 verified destinations)

### B. Backend Web Service (`otravelz-backend`)
- **Root Directory**: `.` (Repository root)
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**:
  ```bash
  sh -c "alembic -c backend/alembic.ini upgrade head && python scripts/import_places.py && uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT"
  ```
- **Port**: Binds to Render dynamic `$PORT` (default 10000)
- **Health Endpoint**: `GET /health` (returns `{"status":"ok"}`)

### C. Frontend Static Site (`otravelz-frontend`)
- **Root Directory**: `frontend`
- **Build Command**: `npm ci && npm run build` (or `npm install && npm run build`)
- **Publish Directory**: `dist`
- **SPA Rewrite Rule** (Under Settings -> Redirects / Rewrites):
  - **Source**: `/*`
  - **Destination**: `/index.html`
  - **Action**: `Rewrite`

---

## 6. Environment Variables Reference

> [!CAUTION]
> NEVER commit credentials, passwords, or full database connection strings to GitHub. Use Render's dashboard environment variables.

### Backend Web Service Environment Variables
| Variable Name | Required | Description | Example / Recommended Value |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Internal PostgreSQL connection string | `postgresql://otravelz:...@dpg-...-a:5432/otravelz` (from Render Postgres) |
| `ENVIRONMENT` | **Yes** | Application execution environment | `production` |
| `CORS_ORIGINS` | **Yes** | Allowed frontend origins | `*` (or `https://<frontend-subdomain>.onrender.com`) |
| `STORAGE_BACKEND` | **Yes** | Local vs Azure Blob image storage | `local` |
| `LOCAL_STORAGE_BASE_PATH` | **Yes** | Path to verified WebP assets | `./data/images` |
| `WEATHER_BASE_URL` | No | Open-Meteo API base URL | `https://api.open-meteo.com/v1/forecast` |
| `WEATHER_PROVIDER` | No | Provider metadata name | `Open-Meteo` |

### Frontend Static Site Environment Variables
| Variable Name | Required | Description | Example / Recommended Value |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | Public Render Backend URL | `https://<backend-subdomain>.onrender.com` |

---

## 7. Images & Asset Strategy
- **Asset Directory**: `data/images/` (`places/`, `categories/`, `sources/`).
- **Total Asset Size**: **60.55 MB** across 130+ high-resolution WebP images.
- **Strategy**: Assets are version-controlled in the repository and deployed directly inside the Backend Web Service container.
- **Proxy Endpoint**: `/api/v1/images/{storage_key}` and `/static/images/{storage_key}`.
- **No External Cloud Storage Needed**: Local storage mode operates with zero Azure Blob or AWS S3 dependencies for competition demo hosting.

---

## 8. Verification & QA Status
- **Backend Test Suite**: 324 passed / 0 failed (Pytest 8.3.3 / Python 3.12).
- **Frontend Test Suite**: 229 passed / 0 failed across 28 test files (Vitest 2.1.9).
- **Full-Stack Live Integration Suite**: 5 passed / 0 failed (`tests/e2e_scenarios.test.ts`).
- **TypeScript / Vite Build**: Clean pass with 0 type errors.

---

## 9. Problems Encountered & Resolutions
- **Issue**: Railway default PostgreSQL service blocked PostGIS extension installation.
- **Resolution**: Selected Render managed PostgreSQL which provides native PostGIS support without schema downgrades.

---

## 10. Step-by-Step Render Deployment Guide

### STEP 1 — Provision Render PostgreSQL Database
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **PostgreSQL**.
3. Fill in:
   - **Name**: `otravelz-db`
   - **Database**: `otravelz`
   - **User**: `otravelz`
   - **Region**: `Oregon (US West)` (or closest region)
   - **Plan**: `Free`
4. Click **Create Database**.
5. Once created and status is **Available**, copy the **Internal Database URL** (e.g., `postgresql://otravelz:...@dpg-...:5432/otravelz`).

### STEP 2 — Deploy Backend Web Service
1. Click **New +** -> **Web Service**.
2. Connect repository `Algoryxz/O-Travelz` (Branch: `release/stable-baseline`).
3. Set configuration:
   - **Name**: `otravelz-backend`
   - **Root Directory**: `.`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `sh -c "alembic -c backend/alembic.ini upgrade head && python scripts/import_places.py && uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT"`
   - **Health Check Path**: `/health`
4. In **Environment Variables**, add:
   - `DATABASE_URL`: *(Paste Internal Database URL from Step 1)*
   - `ENVIRONMENT`: `production`
   - `CORS_ORIGINS`: `*`
   - `STORAGE_BACKEND`: `local`
   - `LOCAL_STORAGE_BASE_PATH`: `./data/images`
5. Click **Create Web Service**.
6. Wait for build to complete. Verify logs show:
   - Alembic migration `0001` - `0006` applied.
   - `Imported 81 places, 13 categories, 12 interests`.
   - `Uvicorn running on http://0.0.0.0:10000`.
7. Copy the public backend URL (e.g., `https://otravelz-backend.onrender.com`).

### STEP 3 — Deploy Frontend Static Site
1. Click **New +** -> **Static Site**.
2. Connect repository `Algoryxz/O-Travelz` (Branch: `release/stable-baseline`).
3. Set configuration:
   - **Name**: `otravelz-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://otravelz-backend.onrender.com` *(from Step 2)*
5. In **Settings** -> **Redirects / Rewrites**, add:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

### STEP 4 — End-to-End Verification
1. Open the frontend static site URL in a browser.
2. Confirm:
   - [ ] Hero section and 81 destination cards render with images.
   - [ ] Category filters and regional hubs (Puri, Konark, Chilika, etc.) filter correctly.
   - [ ] Place details modal displays authentic operating hours.
   - [ ] Itinerary Planner generates 1–7 day plans.
   - [ ] Live Weather widget displays real-time Odisha temperatures from Open-Meteo.
   - [ ] AI Assistant drawer responds with grounded itinerary suggestions.
   - [ ] Bookmark / Saved Places persist to local storage.
