<div align="center">
  <img src="./frontend/public/logo.jpeg" alt="O-TRAVELZ Logo" width="110" height="110" style="border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />

  <h1 align="center">O-TRAVELZ</h1>

  <p align="center">
    <strong>Discover Odisha. Plan Smarter. Travel Better.</strong>
    <br />
    An intelligent multimodal travel platform combining proximity exploration, interactive geospatial mapping, landmark-anchored trip planning, deterministic transit routing, live weather context, and zero-hallucination AI assistance across all 30 districts of Odisha.
  </p>

  <p align="center">
    <a href="https://Lurkaee.github.io/O-Travelz/">
      <img src="https://img.shields.io/badge/🌐_Live_Demo-https%3A%2F%2FLurkaee.github.io%2FO--Travelz-success?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live Demo" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/PostGIS-3.4-2D882D?style=for-the-badge&logo=postgis&logoColor=white" alt="PostGIS" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>

  <p align="center">
    <a href="#about-the-project">About The Project</a> •
    <a href="#key-features">Key Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#testing--verification">Testing</a> •
    <a href="#image--content-policy">Content Policy</a> •
    <a href="#core-team">Team</a> •
    <a href="#built-by-algoryxz">Built by Algoryxz</a>
  </p>
</div>

---

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Built With](#built-with)
- [Architecture](#architecture)
- [Screenshots & Product Experience](#screenshots--product-experience)
- [Data & Intelligence Engine](#data--intelligence-engine)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start (Single-Command Setup)](#quick-start-single-command-setup)
  - [Manual Granular Setup](#manual-granular-setup)
- [Configuration](#configuration)
- [Testing & Verification](#testing--verification)
- [Image & Content Policy](#image--content-policy)
- [Project Structure](#project-structure)
- [Core Team](#core-team)
- [Built by Algoryxz](#built-by-algoryxz)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## About The Project

Odisha's travel ecosystem is exceptionally rich—spanning ancient Kalinga temple architecture, golden Bay of Bengal coastlines, serene brackish lagoons, sacred hill shrines, wildlife sanctuaries, handloom weaving clusters, and centuries-old culinary traditions. However, travelers routinely encounter fragmented information: disjointed public transit schedules, inaccurate coordinates, generic stock photography, and AI tools that hallucinate non-existent travel connections or unfeasible daily itineraries.

**O-TRAVELZ** brings these layers together into one unified, production-grade travel platform.

### Core Architectural Principle

> **AI orchestrates and refines; it does not invent factual travel logistics.**
> Every destination coordinate, transit timeline, operating hour, and geographic calculation is strictly grounded in verified database records and deterministic spatial algorithms.

---

## Key Features

1. **Whole-Odisha Destination Catalog**
   Curated, verified destination records spanning all 30 districts of Odisha with strictly bounded WGS-84 coordinates and multi-category classification (temples, beaches, waterfalls, wildlife, monuments, transit hubs, hospitals, and heritage cuisine).

2. **Geographic Proximity Discovery ("Places Around Me")**
   Haversine-calculated nearest-first sorting relative to the traveler's live GPS coordinates, with progressive radius expansion (10 km $\rightarrow$ 25 km $\rightarrow$ 50 km $\rightarrow$ 100 km $\rightarrow$ 250 km) ensuring geographically honest exploration.

3. **Synchronized Map & Discovery List**
   High-performance interactive Leaflet canvas featuring numbered SVG pins that maintain 1-to-1 visual synchronization with ranked search cards and active category filters.

4. **Honest GPS Fallback Semantics**
   Explicit separation between authenticated live GPS location and default exploration centers (e.g. *"Exploring from Bhubaneswar"*), preventing misleading "fake user location" pins.

5. **"Plan Around This Place" Landmark Anchoring**
   One-click flow navigating from any discovery card or map pin directly into the trip planner, automatically locking the destination as the Day 1 geographic anchor.

6. **Deterministic Multi-Day Itinerary Engine**
   Day-by-day sequencing with realistic transit timelines, visit duration allocations, arrival/departure schedules (09:00 baseline), and a strict maximum 3 stops/day density invariant.

7. **Transit Routing & Disconnected Route Fallbacks**
   Official Capital Region Urban Transport (Mo Bus) urban routes, combined with realistic road/rail transit estimates and honest fallback travel guidance for cross-district corridors.

8. **Zero-Hallucination AI Copilot**
   Natural language conversational planner with prompt preservation, graceful offline/rate-limit recovery, and strict anti-hallucination guardrails preventing invented routes.

9. **Authentic Image Ingestion & Resolution Pipeline**
   Deterministic image resolution hierarchy prioritizing verified physical photography, local manual assets, and curated Wikimedia Commons photography with SVG fallback degrading cleanly per category.

10. **Data Privacy & Legal Compliance**
    Aligned with the Digital Personal Data Protection (DPDP) Act, 2023, featuring explicit user consent gating and dedicated grievance redressal mechanisms.

---

## Built With

### Frontend Stack
* [React 18](https://react.dev/) — Component architecture and declarative UI rendering
* [TypeScript 5.5](https://www.typescriptlang.org/) — End-to-end static type safety and contract enforcement
* [Vite 5.4](https://vitejs.dev/) — Lightning-fast development tooling and optimized production bundling
* [Tailwind CSS 3.4](https://tailwindcss.com/) — Utility-first, responsive design system
* [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) — Geospatial mapping and custom SVG marker projection
* [Lucide React](https://lucide.dev/) — Clean, consistent iconography
* [Zustand](https://github.com/pmndrs/zustand) — Lightweight, reactive client-side state management

### Backend & Data Stack
* [FastAPI](https://fastapi.tiangolo.com/) — Asynchronous Python web framework with OpenAPI documentation
* [PostgreSQL 16](https://www.postgresql.org/) & [PostGIS 3.4](https://postgis.net/) — Spatial indexing and geometry queries
* [SQLAlchemy 2.0](https://www.sqlalchemy.org/) & [Alembic](https://alembic.sqlalchemy.org/) — Relational ORM and database schema migrations
* [Pydantic v2](https://docs.pydantic.dev/) — Runtime payload validation and error normalization

### Intelligence & Services
* [Groq Cloud](https://groq.com/) / [Google Gemini](https://ai.google.dev/) — High-speed LLM inference for travel intent extraction
* [Open-Meteo](https://open-meteo.com/) — Real-time and forecasted weather conditions across Odisha

---

## Architecture

```mermaid
graph TD
    User([Traveler / User]) --> Frontend[React + TypeScript Frontend]

    subgraph Frontend_App [Frontend Application Layer]
        Frontend --> Discovery[Discovery & Search Engine]
        Frontend --> MapModule[Interactive Leaflet Map Canvas]
        Frontend --> PlannerUI[Itinerary Planner & Landmark Anchor]
        Frontend --> TransitUI[Transit Routing & Corridor View]
        Frontend --> AICopilot[AI Travel Copilot Panel]
        Frontend --> ImageRegistry[Deterministic Image Registry]
    end

    Discovery --> APIClient[API Gateway & Adapter Client]
    MapModule --> APIClient
    PlannerUI --> APIClient
    TransitUI --> APIClient
    AICopilot --> APIClient

    APIClient --> Backend[FastAPI Backend Services]

    subgraph Backend_App [FastAPI Backend Layer]
        Backend --> PlaceService[Places & Nearby Proximity Service]
        Backend --> ItineraryService[Deterministic Itinerary Synthesis Engine]
        Backend --> TransitService[Mo Bus & Inter-District Transit Service]
        Backend --> AIService[AI Intent Extraction & Guardrail Layer]
        Backend --> WeatherService[Open-Meteo Weather Service]
    end

    PlaceService --> Database[(PostgreSQL 16 + PostGIS 3.4)]
    ItineraryService --> Database
    TransitService --> Database
    AIService --> LLMProvider[Groq / Gemini LLM API]
    WeatherService --> OpenMeteoAPI[Open-Meteo API]
```

---

## Screenshots & Product Experience

| Travel Discovery & Filters | Synchronized Interactive Map |
| :---: | :---: |
| *Curated destinations across all 30 districts with proximity ranking.* | *Geographic pins synchronized 1-to-1 with ranked discovery cards.* |

| Deterministic Itinerary Planner | AI Travel Copilot |
| :---: | :---: |
| *Landmark-anchored daily schedules with realistic transit timelines.* | *Zero-hallucination natural language trip refinement.* |

> *UI walkthrough recordings and high-resolution interface captures are available in the project documentation.*

---

## Data & Intelligence Engine

### 1. Spatial Proximity & Bounding Constraints
All coordinates are strictly validated against Odisha's geographic bounding envelope ($17.5^\circ\text{N}$ to $23.0^\circ\text{N}$, $81.0^\circ\text{E}$ to $88.0^\circ\text{E}$). The spatial engine uses great-circle Haversine computation for exact nearest-neighbor discovery.

### 2. Multi-Day Itinerary Sequencing
Itineraries enforce logistical feasibility invariants:
* Morning baseline departure at 09:00.
* Stop allocation capped at 3 places per day to prevent traveler burnout.
* Inter-district hops $>100\text{ km}$ classified explicitly as `REGIONAL TRANSIT` with road/rail estimates.

### 3. Anti-Hallucination AI Copilot
The AI orchestration pipeline translates natural language requests into structured constraints matching canonical destinations. If an external AI provider fails or rates are exhausted, the engine degrades gracefully to deterministic spatial synthesis without losing the traveler's prompt.

---

## Quick Start (One-Command Development Setup)

Run the entire full-stack application from a fresh clone with a single command:

### Windows (PowerShell)
```powershell
git clone https://github.com/Smarak-padhi/O-Travelz.git
cd o-travelz
.\run.ps1
```

### macOS / Linux / Cross-Platform
```bash
git clone https://github.com/Smarak-padhi/O-Travelz.git
cd o-travelz
python scripts/run_dev.py
```

The single command automatically:
1. **Preflight Checks**: Verifies Python (>=3.10), Node.js (>=18), npm, and port availability (8000 & 5173).
2. **Python Environment**: Creates `.venv` if missing, installs/updates backend requirements, and validates imports.
3. **Frontend Environment**: Installs/synchronizes `frontend/node_modules` via `npm`.
4. **Configuration**: Initializes `.env` from `.env.example` safely without overwriting existing settings.
5. **Database Bootstrap**: Starts Docker PostGIS container if available and idempotently seeds 204 places, 154 transit routes, 1,430 stops, 302 schedules, and 50 canonical images.
6. **Concurrent Stack Launch**: Starts FastAPI (`http://127.0.0.1:8000`) and Vite (`http://localhost:5173`) with live multiplexed logs (`[BACKEND]` and `[FRONTEND]`).
7. **Readiness Check**: Probes `/health` and prints ready URLs.

Press `Ctrl+C` at any time to gracefully stop all development processes.

#### Useful Flags
```powershell
.\run.ps1 -SkipBootstrap  # Skip database migrations and seed (fast restart)
.\run.ps1 -BackendOnly    # Run only the FastAPI backend service
.\run.ps1 -FrontendOnly   # Run only the Vite frontend dev server
.\run.ps1 -Test           # Run full pytest suite, vitest suite & production build
```

---

## Getting Started

### Prerequisites
* **Python**: 3.10+ (recommended 3.11 or 3.12) & `pip` / `venv`
* **Node.js**: v18.0+ & `npm`
* **Docker & Docker Compose**: (Optional; for local PostgreSQL + PostGIS database container on port 5433)

### Service URLs
* **Frontend Web App**: `http://localhost:5173`
* **Backend REST API**: `http://127.0.0.1:8000`
* **Interactive OpenAPI Docs**: `http://127.0.0.1:8000/docs`
* **Health Endpoint**: `http://127.0.0.1:8000/health`

### Optional AI Provider Keys
O-Travelz includes deterministic rule-based grounding that operates completely free with zero external API dependencies. If you wish to enable generative AI providers, copy `.env.example` to `.env` and configure:
* `AI_GEMINI_API_KEY`: Google Gemini API key (Free Tier)
* `AZURE_OPENAI_API_KEY`: Azure OpenAI API key & endpoint
* `AI_GROQ_API_KEY`: Groq high-speed inference API key

### Troubleshooting Occupied Ports
If port 8000 or 5173 is in use:
* If the port is occupied by an existing O-Travelz instance, `.\run.ps1` safely detects and reuses the running service.
* If occupied by an unrelated application, `.\run.ps1` reports the conflict and pauses safely without killing unrelated processes. Free the port or use `-BackendOnly` / `-FrontendOnly`.


#### 4. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

---

## Configuration

Create a `.env` file in the root directory (refer to `.env.example` if available):

```ini
# Database Connection
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/otravelz

# AI Provider Keys (Optional: fallbacks to deterministic mode if unconfigured)
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Environment Mode
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## Testing & Verification

O-TRAVELZ maintains a comprehensive regression test suite covering frontend UI components, spatial calculations, state machines, API contracts, image resolution, and backend services.

```bash
# Run Frontend Vitest Suite (58 test files, 479+ unit/integration tests)
cd frontend
npm test -- --run

# Verify Frontend Production Build & TypeScript compilation
npm run build

# Run Backend Pytest Suite
pytest backend/tests
```

---

## Image & Content Policy

O-TRAVELZ respects intellectual property rights and visual authenticity:

* **No Claim of Blanket Ownership**: O-TRAVELZ does not claim ownership of third-party photographs, logos, or visual trademarks displayed on the platform. Visual content is presented for travel discovery, destination identification, and informational reference.
* **Separation of Authenticity & Provenance**: Authenticity verification (confirming that an image depicts the genuine physical destination or regional specialty) is cataloged strictly separately from copyright/provenance metadata.
* **Non-Fabrication Policy**: O-TRAVELZ never fabricates photographer names, licenses, or source URLs. Where historical provenance records were not recorded, metadata is cataloged honestly as unrecorded.
* **Attribution & Content Removal**: If you are a copyright holder or authorized representative and believe content displayed requires attribution correction or removal, please submit a notice via the in-app **Contact & Grievance** portal or open an issue on the project repository.

*For complete details, see our in-app [Terms & Conditions](frontend/src/components/legal/TermsConditionsPage.tsx).*

---

## Project Structure

```text
O-Travelz/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # REST Endpoints (places, map, itinerary, ai, weather)
│   │   ├── core/             # Configuration, security & database sessions
│   │   ├── models/           # SQLAlchemy database entities
│   │   ├── schemas/          # Pydantic data schemas
│   │   └── services/         # Spatial, itinerary synthesis, transit & AI logic
│   ├── alembic/              # Database migration versions
│   └── tests/                # Pytest unit & integration test suites
├── frontend/                 # React + TypeScript Client
│   ├── public/               # Static assets, logo, manifest & icons
│   │   └── images/manual/    # Locally served authentic destination photographs
│   ├── src/
│   │   ├── components/       # UI components (Discovery, Map, Planner, AI, Legal)
│   │   ├── pages/            # Page-level route views
│   │   ├── store/            # Zustand state stores (location, filters, trips)
│   │   └── utils/            # GeoUtils, imageRegistry, API adapters
│   └── tests/                # Vitest & Testing Library regression suites
├── data/                     # Authoritative data catalogs & research
│   ├── places/               # Canonical places catalog (places.json)
│   ├── research/             # District research, Mo Bus routes, food studies
│   └── images/               # Manual collection staging & manifest files
├── infra/                    # Docker Compose & local infrastructure configs
├── docs/                     # Canonical architecture & PRD documentation
└── scripts/                  # Data import, validation & manifest generation scripts
```

---

## Core Team

<div align="center">

| Team Member |
| :--- |
| **Smarak Padhi** |
| **Deeptiman Parida** |
| **Akriti Lohani** |
| **Soumya Ranjan Senapati** |
| **Punam Sahoo** |
| **Susmita Rana** |

</div>

---

## Built by Algoryxz

<div align="center">
  <h3>Built with passion by <strong>ALGORYXZ</strong></h3>
  <p><em>Engineering intelligent spatial systems and cultural technology for Odisha.</em></p>
</div>

---

## Roadmap

### Completed (v1.0 Release)
- [x] Complete 30-district destination and regional food catalog.
- [x] Proximity-based discovery with Haversine distance ranking and progressive radius expansion.
- [x] Interactive Leaflet map canvas synchronized with numbered discovery pins.
- [x] Honest GPS location fallback behavior and reference mode.
- [x] Landmark-anchored itinerary planning with realistic travel timelines.
- [x] Capital Region Urban Transport (Mo Bus) integration.
- [x] Resilient AI Copilot with prompt retention and deterministic fallback.
- [x] Automated manual image ingestion and non-fabricating metadata pipeline.
- [x] DPDP Act 2023 legal consent and grievance redressal channels.

### In Progress
- [ ] Offline caching and Progressive Web App (PWA) installation improvements.
- [ ] Direct multi-lingual translation for Odia and Hindi script localization.

### Future Ideas
- [ ] Real-time GPS-guided audio tour commentary for ASI heritage monuments.
- [ ] Direct inter-city bus and train booking API integrations.
- [ ] Community-contributed eco-tourism trails across Similipal and Deomali.

---

## Contributing

Contributions are welcome! Please follow these standard steps:

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Run Test Suite** (`npm test -- --run` in `frontend/`)
5. **Push to the Branch** (`git push origin feature/AmazingFeature`)
6. **Open a Pull Request**

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## Acknowledgments

* [Best-README-Template by othneildrew](https://github.com/othneildrew/Best-README-Template) for the README structural inspiration.
* [Odisha Tourism](https://odishatourism.gov.in/) & [Archaeological Survey of India (ASI)](https://asi.nic.in/) for cultural heritage references.
* [Capital Region Urban Transport (CRUT)](https://www.capitalregiontransport.in/) for Mo Bus network data.
* [Open-Meteo](https://open-meteo.com/) for reliable open weather API services.
* [Wikimedia Commons](https://commons.wikimedia.org/) contributors for open documentation photography.

<div align="center">
  <p><sub>&copy; 2026 O-TRAVELZ · Made in Odisha with pride.</sub></p>
</div>
