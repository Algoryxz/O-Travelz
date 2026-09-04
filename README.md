# O-TRAVELZ — Odisha Travel Intelligence + Cultural Atlas

> **Built by Algoryxz**  
> Positioning: **Odisha Travel Intelligence + Cultural Atlas**  
> Long-Term Differentiation: **Community-verified Odisha travel intelligence network**  
> Branch: `feature/v4-platform-rebuild`

---

## 1. Authoritative V4 Documentation Suite

All primary architectural specifications and operating rules are consolidated under [`docs/v4/`](docs/v4/):

| Document | Purpose & Scope |
|---|---|
| [`docs/v4/PRODUCT.md`](docs/v4/PRODUCT.md) | Authoritative PRD, core user jobs, multidimensional truth model, and anti-vibe-code rules |
| [`docs/v4/ARCHITECTURE.md`](docs/v4/ARCHITECTURE.md) | Platform topology, KMP shared core, Web/iOS/Android layers, Aiven DB runtime |
| [`docs/v4/DATA_AND_CONTRACTS.md`](docs/v4/DATA_AND_CONTRACTS.md) | Verified bootstrap inventory (204 places, 154 routes), SQL schemas, OpenAPI 3.1 sync |
| [`docs/v4/DESIGN.md`](docs/v4/DESIGN.md) | Modern Odisha Cultural Atlas visual direction, design tokens, typography, truth badges |
| [`docs/v4/MAPS_AND_TRANSPORT.md`](docs/v4/MAPS_AND_TRANSPORT.md) | MapKit, Google Maps SDK, MapLibre GL JS, CRUT truth boundary, September 2026 pricing |
| [`docs/v4/MEDIA_LANGUAGE_VOICE.md`](docs/v4/MEDIA_LANGUAGE_VOICE.md) | Multi-tier WebP image gates, video preview pipeline, Odia language localization |
| [`docs/v4/SKILLS_AND_TOOLING.md`](docs/v4/SKILLS_AND_TOOLING.md) | Approved local and task-specific agent skills, Stitch MCP, SwiftUI and Android baselines |
| [`docs/v4/RELEASE_AND_QA.md`](docs/v4/RELEASE_AND_QA.md) | Physical iPhone validation protocol, Android hardware benchmark rules, test suites |
| [`docs/v4/ROADMAP.md`](docs/v4/ROADMAP.md) | 5-stage platform rebuild sequence (Docs $\rightarrow$ Web $\rightarrow$ iOS $\rightarrow$ Android $\rightarrow$ QA) |
| [`docs/v4/adr/ADR-001_MAP_STACK_DECISION.md`](docs/v4/adr/ADR-001_MAP_STACK_DECISION.md) | Formal Architecture Decision Record for mapping and navigation stack |

---

## 2. Platform Execution Order

1. **Documentation & Architecture Synchronization** `[CURRENT]`
2. **Website V4 Redesign & Capability Integration** `[PLANNED]`
3. **iOS V4 Native App (SwiftUI + MapKit + Real iPhone Validation)** `[PLANNED]`
4. **Android V4 Native App (Jetpack Compose + Google Maps SDK)** `[PLANNED]`
5. **Cross-Platform QA & Performance Audits** `[PLANNED]`

---

## 3. Repository Structure

```
o-travelz/
├── backend/              # FastAPI Python backend (AI, Itinerary, Transit, Places, Auth)
├── frontend/             # Web application (React 18 + TypeScript + Vite + MapLibre GL JS)
├── mobile/               # Native Mobile Multiplatform
│   ├── shared/           # Kotlin Multiplatform (KMP) shared core (Math, Geo, Engines)
│   ├── ios/              # iOS native application (Swift 5.9+ / SwiftUI / MapKit)
│   └── android/          # Android native application (Kotlin 2.0+ / Compose / Maps SDK)
├── data/                 # Git canonical datasets & WebP photographic assets
│   ├── images/places/    # Verified place photo directories (4 WebP variants each)
│   ├── places/           # Master places.json catalog (204 places)
│   ├── transport/        # Canonical transit dataset (154 routes, 1,430 stops, schedules)
│   └── geospatial/       # Audited proximity linkages (2,670 pairs)
├── docs/
│   ├── v4/               # Authoritative V4 documentation suite
│   └── archive/          # Historical audits and research notes
├── scripts/              # Validation gates and database bootstrap scripts
└── tests/                # Pytest backend test suite
```

---

## 4. Quickstart & Verification

### Backend Setup
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
python scripts/bootstrap_database.py
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

### Multiplatform Test Suite
```powershell
# Backend
python -m pytest backend/tests -q

# Shared KMP Core
./gradlew :shared:test

# Frontend Build & Type Check
npm --prefix frontend test
npm --prefix frontend run build
```
