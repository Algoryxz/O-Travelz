# O-Travelz Required Accounts & Services Matrix (Source Code Reconciled)

`STATUS: VERIFIED FROM SOURCE CODE`

This document classifies every external service mentioned across the project into three unambiguous categories based on actual source code requirements.

---

## 1. ABSOLUTELY REQUIRED (Mandatory for Production)

### A. PostgreSQL 16+ Database with PostGIS 3.4+ Extension
* **Why O-Travelz needs it**: Stores all 81 canonical places, geometry coordinates (WGS84 EPSG:4326), users, saved wishlists, and shared itineraries.
* **Where used**: `backend/app/db/session.py`, `backend/app/models/`, `backend/alembic/`.
* **Environment Variable**: `DATABASE_URL` (Server-Only).
* **Can O-Travelz run without it?**: **NO**. The application requires a PostgreSQL connection with PostGIS to initialize and serve data.
* **Where to create**: Any managed PostgreSQL host (AWS RDS, Supabase, Neon, self-hosted Docker).

---

## 2. REQUIRED ONLY FOR OPTIONAL FEATURES

### B. Google AI Studio (Optional — for Conversational Copilot)
* **Why O-Travelz needs it**: Powers natural-language conversational queries in the sidebar copilot.
* **Where used**: `backend/app/ai/adapter.py:596` (`GeminiProviderAdapter`).
* **Environment Variable**: `AI_GEMINI_API_KEY` (Server-Only).
* **Can O-Travelz run without it?**: **YES**. Without it, O-Travelz defaults to the offline deterministic rule-based generator.
* **What feature disappears without it?**: Conversational free-form natural language chat falls back to deterministic keyword parsing. Core trip planning, itinerary creation, and maps remain 100% operational.

### C. Google Cloud Console (Optional — for Google OAuth 2.0 Login)
* **Why O-Travelz needs it**: Allows travelers to log in with Google to sync wishlists and itineraries across devices.
* **Where used**: `backend/app/api/auth_routes.py`, `backend/app/services/auth/google_oauth.py`.
* **Environment Variables**: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`.
* **Can O-Travelz run without it?**: **YES**. Set `GOOGLE_OAUTH_ENABLED=false`.
* **What feature disappears without it?**: Cross-device cloud sync. Anonymous travelers still get full local-storage wishlist and trip saving capabilities.

### D. Azure Blob Storage (Optional — for Cloud Image Hosting)
* **Why O-Travelz needs it**: Alternative to local filesystem image storage.
* **Where used**: `backend/app/storage/azure_blob.py`.
* **Environment Variable**: `AZURE_STORAGE_CONNECTION_STRING`.
* **Can O-Travelz run without it?**: **YES**. Set `STORAGE_BACKEND=local` (the default).
* **What feature disappears without it?**: None; images are served from `./data/images` locally.

---

## 3. NOT REQUIRED (Zero Accounts / Zero Keys Needed)

### E. Open-Meteo Weather API
* **Account/Key**: **NONE**. Consumes public open meteorological endpoints (`backend/app/services/weather/adapter.py`).

### F. Map Tiles (OpenStreetMap / CartoDB)
* **Account/Key**: **NONE**. Leaflet renders open public tile layers (`frontend/src/components/map/MapCanvas.tsx`).

### G. Groq API
* **Account/Key**: **NONE**. Groq is not implemented in the codebase.
