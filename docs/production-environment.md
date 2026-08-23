# O-Travelz Master Production Environment Variable Matrix (Source Reconciled)

`STATUS: VERIFIED FROM SOURCE CODE`

Every variable below is traced to its exact source file in the repository.

---

## 1. Public Variables (Client / Vite Bundle)

> [!WARNING]
> All `VITE_*` variables are baked into browser JavaScript at build time. **Never** place private secrets here.

| Variable | Exact Code Location | Required? | Prod Required? | Secret? | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `VITE_API_URL` | `frontend/src/utils/imageService.ts:14` | No | No | No (Public) | `""` (Uses relative path `/`) | Custom backend API base URL for decoupled cross-origin hosting |
| `VITE_API_BASE_URL` | `frontend/src/utils/imageService.ts:14` | No | No | No (Public) | `""` | Alias fallback for `VITE_API_URL` |
| `VITE_APP_ENV` | `frontend/.env.example:10` | No | No | No (Public) | `development` | Client environment flag |

---

## 2. Server-Only Core Application Variables (`backend/.env`)

| Variable | Exact Code Location | Required? | Prod Required? | Secret? | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | `backend/app/core/config.py:7` | No | **Yes** | No | `development` | Setting `production` enforces fail-closed secret validation |
| `DATABASE_URL` | `backend/app/core/config.py:6` | **Yes** | **Yes** | **Yes** | `postgresql://...` | PostgreSQL 16+ with PostGIS 3.4+ connection string |
| `CORS_ORIGINS` | `backend/app/main.py:28` | No | **Yes** | No | `*` | Comma-separated allowed frontend domains (e.g. `https://otravelz.in`) |
| `AUTH_SESSION_SECRET` | `backend/app/core/config.py:62` | **Yes** | **Yes** | **Yes** | Dev placeholder | HMAC-SHA256 session cookie signing secret ($\ge 32$ chars) |
| `AUTH_COOKIE_SECURE` | `backend/app/core/config.py:67` | No | **Yes** | No | `false` | Must be `true` in production to enforce HTTPS-only cookies |
| `AUTH_COOKIE_SAMESITE` | `backend/app/core/config.py:68` | No | No | No | `lax` | Browser cookie SameSite policy |
| `AUTH_FRONTEND_REDIRECT_URL`| `backend/app/core/config.py:69` | No | **Yes** | No | `http://localhost:5173` | Redirect target after OAuth completion e.g. `https://otravelz.in` |
| `STORAGE_BACKEND` | `backend/app/core/config.py:10` | No | No | No | `local` | Image storage driver (`local` or `azure`) |
| `LOCAL_STORAGE_BASE_PATH` | `backend/app/core/config.py:11` | No | No | No | `./data/images` | Filesystem path for local image storage |

---

## 3. Server-Only Optional Provider Variables (`backend/.env`)

| Variable | Exact Code Location | Required? | Prod Required? | Secret? | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AI_PROVIDER` | `backend/app/core/config.py:21` | No | No | No | `mock` | AI engine (`mock`, `rule_based`, `gemini`, `azure_openai`, `nvidia`, `multi_provider`) |
| `AI_ALLOW_EXTERNAL_PROVIDER`| `backend/app/core/config.py:22` | No | No | No | `false` | Set `true` to authorize outbound calls to external LLM APIs |
| `AI_GEMINI_API_KEY` | `backend/app/core/config.py:37` | No | Optional | **Yes** | `None` | Google AI Studio Gemini API Key |
| `AI_GEMINI_MODEL_NAME` | `backend/app/core/config.py:38` | No | No | No | `gemini-1.5-flash` | Gemini model name |
| `AI_NVIDIA_API_KEY` | `backend/app/core/config.py:42` | No | Optional | **Yes** | `None` | NVIDIA API Catalog Key |
| `AI_NVIDIA_MODEL_NAME` | `backend/app/core/config.py:43` | No | No | No | `meta/llama-3.1-8b-instruct` | NVIDIA model name |
| `AI_API_KEY` | `backend/app/core/config.py:27` | No | Optional | **Yes** | `None` | Generic OpenAI / Azure OpenAI key |
| `AI_API_BASE_URL` | `backend/app/core/config.py:28` | No | Optional | No | `None` | Generic OpenAI / Azure OpenAI base URL |
| `GOOGLE_OAUTH_ENABLED` | `backend/app/core/config.py:56` | No | No | No | `false` | Enable Google OAuth 2.0 PKCE login |
| `GOOGLE_OAUTH_CLIENT_ID` | `backend/app/core/config.py:57` | If OAuth | If OAuth | No | `None` | Google Cloud OAuth Client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET`| `backend/app/core/config.py:58` | If OAuth | If OAuth | **Yes** | `None` | Google Cloud OAuth Client Secret |
| `GOOGLE_OAUTH_REDIRECT_URI` | `backend/app/core/config.py:59` | If OAuth | If OAuth | No | `http://localhost:8000/auth/google/callback` | OAuth redirect URI |
| `AZURE_STORAGE_CONNECTION_STRING`| `backend/app/core/config.py:14` | If Azure | If Azure | **Yes** | `None` | Azure Blob Storage connection string |
