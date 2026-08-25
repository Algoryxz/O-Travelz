# Google OAuth 2.0 & Cloud Identity Configuration for O-Travelz

This document provides the definitive setup and configuration guide for Google OAuth 2.0 authentication in O-Travelz for both local development and production deployment.

---

## 1. Architecture Overview

O-Travelz uses Google OAuth 2.0 with **PKCE (Proof Key for Code Exchange)** and server-side ID token cryptographic verification:

```text
Frontend ("Continue with Google")
    ↓
GET /auth/google/start (Generates PKCE pair, state cookie, and redirects to Google Consent)
    ↓
User Authenticates on accounts.google.com
    ↓
Google redirects to GET /auth/google/callback?code=...&state=...
    ↓
Backend exchanges code, verifies ID token, upserts User, issues HttpOnly Session Cookie
    ↓
Backend redirects to AUTH_FRONTEND_REDIRECT_URL
    ↓
Frontend calls GET /auth/me to restore authenticated traveler profile
```

---

## 2. Google Cloud Console Configuration

### Step 1: Create OAuth 2.0 Client ID
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth client ID**.
3. Select Application type: **Web application**.
4. Set Name: `O-Travelz Platform`.

### Step 2: Configure Authorized JavaScript Origins
Add both local development and production origins:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173` (Vite local loopback)
- `https://otravelz.in` (Production domain)
- `https://www.otravelz.in` (Production canonical www)

### Step 3: Configure Authorized Redirect URIs
Add both local and production callback URIs:
- `http://127.0.0.1:8000/auth/google/callback` (Local development FastAPI backend)
- `https://api.otravelz.in/auth/google/callback` (Production API domain)

---

## 3. Environment Variables

### Backend Configuration (`backend/.env`)

```env
# Google OAuth Configuration
GOOGLE_OAUTH_ENABLED=true
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback

# Session Security
AUTH_SESSION_SECRET=generate-a-secure-random-64-char-hex-secret
AUTH_SESSION_COOKIE_NAME=otravelz_session
AUTH_SESSION_EXPIRE_DAYS=30
AUTH_OAUTH_STATE_COOKIE_NAME=otravelz_oauth_state
AUTH_OAUTH_STATE_EXPIRE_SECONDS=600

# Cookie Policy (Set secure=false for localhost HTTP, secure=true in production HTTPS)
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAMESITE=lax
AUTH_FRONTEND_REDIRECT_URL=http://localhost:5173
```

### Production Render Environment Overrides
- `GOOGLE_OAUTH_REDIRECT_URI=https://api.otravelz.in/auth/google/callback`
- `AUTH_COOKIE_SECURE=true`
- `AUTH_FRONTEND_REDIRECT_URL=https://otravelz.in`

---

## 4. Security Guarantees
- **No Client Secrets in Frontend**: All Google client secrets and token exchanges remain strictly on the backend.
- **CSRF & PKCE Protected**: Signed state cookies prevent state injection and replay attacks.
- **HttpOnly Session Cookies**: Session tokens cannot be accessed or exfiltrated via JavaScript XSS.
