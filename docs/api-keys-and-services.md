# O-Travelz External Services & API Key Reference (Source Reconciled)

`STATUS: VERIFIED FROM SOURCE CODE`

This document specifies all external services supported by the O-Travelz backend codebase (`backend/app/ai/adapter.py`, `backend/app/core/config.py`, `backend/app/services/`).

---

## 1. Zero Client-Side Credential Rule

> [!CAUTION]
> **API keys, database passwords, and signing secrets must NEVER be placed in:**
> * `frontend/.env` or `frontend/.env.production`
> * `VITE_*` environment variables (these are baked into browser JavaScript)
> * React / TypeScript client source code
> * Browser `localStorage`, `sessionStorage`, or client-accessible cookies
> * Git commits, issues, or pull requests
>
> All third-party provider keys must reside exclusively in server-side backend environment variables (`backend/.env`).

---

## 2. Implemented AI Providers (Zero-Cost & Free-Tier Options)

### A. Google AI Studio (Gemini) — Optional
* **Why O-Travelz needs it**: Conversational trip planning and natural-language destination queries.
* **Implementation File**: `backend/app/ai/adapter.py:596` (`GeminiProviderAdapter`).
* **Active Model**: `gemini-1.5-flash` (Configurable via `AI_GEMINI_MODEL_NAME`).
* **Endpoint Format**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`.
* **Where to create account**: [Google AI Studio](https://aistudio.google.com/).
* **Where to generate key**: [Google AI Studio API Keys](https://aistudio.google.com/app/apikey) $\to$ **Create API key**.
* **Exact Environment Variables**:
  ```bash
  AI_GEMINI_API_KEY=AIzaSy...
  AI_GEMINI_MODEL_NAME=gemini-1.5-flash
  AI_GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta
  ```
* **Server-Only**: Yes (`backend/.env` only).
* **Can O-Travelz run without it?**: **YES**. Defaults to offline deterministic rule-based planner.

---

### B. Microsoft Azure OpenAI Service — Optional
* **Why O-Travelz needs it**: Enterprise-grade OpenAI inference backed by Azure credits with zero vendor SDK lock-in.
* **Implementation File**: `backend/app/ai/adapter.py:546` (`AzureOpenAIProviderAdapter`).
* **Azure Resource Requirements**:
  1. An active Azure subscription with Azure OpenAI access enabled.
  2. Azure OpenAI Resource created in an approved region (e.g. `East US`, `Sweden Central`).
* **Deployment Requirements & Distinction**:
  - In Azure OpenAI, you create a custom **Deployment Name** (e.g. `gpt-5-mini-prod`) that maps to an underlying base model (e.g. `gpt-5-mini`).
  - `AI_AZURE_DEPLOYMENT_NAME` specifies this deployment identifier.
* **Endpoint Format**: `https://<your-resource-name>.openai.azure.com`
* **Exact Environment Variables**:
  ```bash
  AI_API_BASE_URL=https://<your-resource-name>.openai.azure.com
  AI_API_KEY=<azure-openai-api-key>
  AI_AZURE_DEPLOYMENT_NAME=gpt-5-mini
  AI_AZURE_API_VERSION=2024-12-01-preview
  ```
* **Server-Only**: Yes (`backend/.env` only).
* **Can O-Travelz run without it?**: **YES**.

---

### C. NVIDIA API Catalog / NIM — Optional
* **Why O-Travelz needs it**: High-performance open-weights inference (Llama-3.1) with 1,000 free build credits.
* **Implementation File**: `backend/app/ai/adapter.py:826` (`NVIDIAProviderAdapter`).
* **Active Model**: `meta/llama-3.1-8b-instruct` (Configurable via `AI_NVIDIA_MODEL_NAME`).
* **Endpoint Format**: `https://integrate.api.nvidia.com/v1/chat/completions`.
* **Where to create account**: [NVIDIA Build / API Catalog](https://build.nvidia.com/).
* **Where to generate key**: [NVIDIA API Keys](https://build.nvidia.com/meta/llama-3_1-8b-instruct) $\to$ **Get API Key**.
* **Exact Environment Variables**:
  ```bash
  AI_NVIDIA_API_KEY=nvapi-...
  AI_NVIDIA_MODEL_NAME=meta/llama-3.1-8b-instruct
  AI_NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
  ```
* **Server-Only**: Yes (`backend/.env` only).
* **Can O-Travelz run without it?**: **YES**.

---

### D. Whole-Odisha Deterministic Rule Engine — Built-in & Mandatory Fallback
* **Why O-Travelz needs it**: Guarantees 100% offline, ₹0-cost travel planning across all 30 districts of Odisha.
* **Implementation File**: `backend/app/ai/adapter.py:155` (`RuleBasedProviderAdapter`).
* **Account / Key**: **NONE**. Requires zero network calls and zero external credentials.
* **Always Available**: Yes. Acts as the final resilient anchor whenever external providers fail or are disabled.

---

### E. Groq API — NOT IMPLEMENTED
* **Status**: **NOT IMPLEMENTED** in current codebase.
* Zero classes, routes, or configuration entries exist for Groq.

---

## 3. Core & Authentication Services

### A. PostgreSQL 16+ with PostGIS 3.4+ Extension — MANDATORY
* **Why O-Travelz needs it**: Primary database for places, geospatial geometries, users, wishlists, and shared itineraries.
* **Environment Variable**: `DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db_name>` (Server-Only).
* **Where to provision**: Supabase, AWS RDS, Neon, DigitalOcean, or Docker container.

### B. Google OAuth 2.0 & OpenID Connect — Optional
* **Why O-Travelz needs it**: Multi-device wishlist and itinerary synchronization.
* **Where to configure**: [Google Cloud Console](https://console.cloud.google.com/) $\to$ Credentials $\to$ OAuth 2.0 Client ID.
  - Authorized JavaScript Origins: `https://otravelz.in`
  - Authorized Redirect URIs: `https://api.otravelz.in/auth/google/callback`
* **Environment Variables**:
  ```bash
  GOOGLE_OAUTH_ENABLED=true
  GOOGLE_OAUTH_CLIENT_ID=<client-id>.apps.googleusercontent.com
  GOOGLE_OAUTH_CLIENT_SECRET=<client-secret>
  GOOGLE_OAUTH_REDIRECT_URI=https://api.otravelz.in/auth/google/callback
  ```

---

## 4. Keyless Public Services (₹0 / No Accounts Needed)

* **Open-Meteo Weather API**: `https://api.open-meteo.com/v1/forecast` (Keyless, free meteorological observation and forecast).
* **CartoDB & OpenStreetMap Tiles**: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` (Keyless dark map tiles).
