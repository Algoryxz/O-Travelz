# O-TRAVELZ — Whole-Odisha Intelligent Travel Platform

[![CI Status](https://github.com/Algoryxz/O-Travelz/actions/workflows/ci.yml/badge.svg)](https://github.com/Algoryxz/O-Travelz/actions/workflows/ci.yml)
[![Pages Deployment](https://github.com/Algoryxz/O-Travelz/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Algoryxz/O-Travelz/actions/workflows/deploy-pages.yml)
[![Production Baseline](https://img.shields.io/badge/Release-web--stable--2026--09--01-emerald)](https://github.com/Algoryxz/O-Travelz/releases/tag/web-stable-2026-09-01)

O-TRAVELZ is a production-grade, AI-guided multimodal travel platform for Odisha. It combines verified cultural and nature destinations, authentic photographic assets, deterministic Mo Bus / Ama Bus transit routing, live weather, and a grounded AI copilot.

---

## Live Production Links

* **Web Application**: [https://algoryxz.github.io/O-Travelz/](https://algoryxz.github.io/O-Travelz/)
* **Backend API**: [https://otravelz-backend.onrender.com](https://otravelz-backend.onrender.com)
* **Backend Health**: [https://otravelz-backend.onrender.com/health](https://otravelz-backend.onrender.com/health)

---

## Canonical Documentation

| Document | Purpose |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System boundaries, service layers, deployment, and shared API contract strategy |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Places, transit graph, 4-variant image pipeline, services, and source of truth |
| [`docs/AI.md`](docs/AI.md) | Grounded AI copilot, multilingual Odia parsing, tool routing, and provider fallback |
| [`docs/MOBILE.md`](docs/MOBILE.md) | Mobile app target architecture, React Native + Expo preconditions |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | Operating rules, test validation gates, and generated file policies |
| [`docs/DEMO.md`](docs/DEMO.md) | Local startup commands, verified demo flows, and sample prompts |
| [`project-map.yaml`](project-map.yaml) | Machine-readable architecture, sources of truth, validators, and ownership map |

---

## Repository Structure

```
o-travelz/
├── backend/              # FastAPI Python backend (AI, Itinerary, Transit, Places, Auth)
├── frontend/             # React + Vite + TypeScript web application (Stitch UI)
├── data/                 # Authoritative travel datasets & WebP photographic assets
│   ├── images/places/    # Verified place photo directories (4 WebP variants each)
│   ├── places/           # Master places.json catalog
│   ├── transport/        # Canonical transit dataset (154 routes, 1,430 stops)
│   ├── services/         # Essential civic infrastructure (ATMs, hospitals, fuel, police)
│   └── research/         # Regional research staging (North, South, East, West)
├── docs/                 # Canonical living documentation
├── infra/                # Docker compose infra (PostGIS)
└── scripts/              # Validation gates, database bootstrap, and transit generators
```

---

## Quickstart

### Prerequisites
* Python 3.11+ / 3.12+ (in `.venv`)
* Node.js 18+ / 20+
* Docker Desktop (for local PostgreSQL + PostGIS)

### 1. Backend Setup
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
python scripts/bootstrap_database.py
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

### 3. Run Validation Suite
```powershell
python -m pytest backend/tests -q
npm --prefix frontend test
npm --prefix frontend run build
python scripts/validate_round2_research.py
python scripts/validate_image_pipeline.py
python scripts/audit_destination_images.py
python scripts/validate_canonical_transit.py
python scripts/generate_frontend_transit_data.py --check
```
