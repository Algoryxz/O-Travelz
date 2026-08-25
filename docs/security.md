# O-Travelz Production Security Audit & Hardening Guide

`STATUS: VERIFIED`

## 1. Security Architecture & Threat Boundaries

### A. Zero Client-Side Secret Leakage
* All third-party API keys (Azure OpenAI, Google Gemini, NVIDIA) are strictly loaded in backend Python memory and are never exposed to browser bundles.
* `VITE_*` variables are audited: only `VITE_API_URL` and `VITE_APP_ENV` exist on the client.

### B. Session & Cookie Security
* Authentication relies on cryptographically signed HTTP-only cookies (`HMAC-SHA256`).
* When `ENVIRONMENT=production`, the application strictly enforces:
  1. `AUTH_SESSION_SECRET` must be $\ge 32$ high-entropy characters (fails closed on startup if default or short).
  2. `AUTH_COOKIE_SECURE=true` (enforces `Secure` flag, rejecting unencrypted HTTP transmission).
  3. `SameSite=lax` (protects against Cross-Site Request Forgery / CSRF while supporting OAuth 2.0 redirects).

### C. CORS & Origin Isolation
* In development, `CORS_ORIGINS=*` is allowed without credentials.
* In production, wildcard CORS is rejected when credentials are enabled. `CORS_ORIGINS` must be explicitly configured to allowed domains (e.g. `https://otravelz.in,https://www.otravelz.in`).

### D. Path Traversal & Injection Prevention
* Image asset path resolvers (`getBackendAssetUrl` on frontend and `storage` handlers on backend) strictly sanitize input and reject `..` directory traversal sequences.
* Database operations use SQLAlchemy ORM parameterization, eliminating SQL injection vectors.

### E. AI Rate Limiting & Circuit Breakers
* **Rate Limits**: Configured to 30 requests/minute per client, with a tighter 10 requests/minute for external AI calls.
* **Latency Budget**: 8000ms timeout budget prevents runaway AI connections.
* **Circuit Breaker**: Automatically trips after 3 consecutive failures, cooling down for 30s before retrying.
