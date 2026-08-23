# O-Travelz Production Deployment Architecture & Guide

`STATUS: VERIFIED`

## 1. Production Topology

```
                  [ Internet Users ]
                          │ (HTTPS :443)
                          ▼
            [ Reverse Proxy / CDN / Nginx ]
             ├── /            ──► [ Static Frontend Bundle (Vite Dist) ]
             └── /api, /places, /itinerary, /auth, /map, /weather, /health
                              ──► [ FastAPI ASGI (Gunicorn/Uvicorn) :8000 ]
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
          [ PostgreSQL + PostGIS ]  [ Local / Azure Image ]  [ Open-Meteo ]
                   :5432                 Storage                 API
```

---

## 2. Server Requirements & Dependencies
* **OS**: Linux (Ubuntu 22.04 LTS recommended) / Docker container
* **Python**: 3.11+
* **Node.js**: 20+ (for build time)
* **Database**: PostgreSQL 16+ with PostGIS 3.4+ extension
* **Memory**: Minimum 1 GB RAM (2 GB recommended)

---

## 3. Step-by-Step Deployment Commands

### A. Database Provisioning & Schema Migration
```bash
# 1. Ensure PostGIS extension is installed
psql -d $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# 2. Run Alembic database migrations
export PYTHONPATH="backend"
python -m alembic -c backend/alembic.ini upgrade head

# 3. Seed canonical places catalog and sync photography
python scripts/import_places.py
python scripts/sync_db_place_images.py
```

### B. Backend Service Startup (FastAPI + Gunicorn)
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start production ASGI worker pool
gunicorn app.main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### C. Frontend Production Build & Hosting
```bash
# Build optimized production bundle
cd frontend
npm ci
npm run build

# Output directory: frontend/dist
# Host via Nginx, Vercel, Cloudflare Pages, or AWS S3 + CloudFront
```
