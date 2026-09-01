# O-Travelz Production Deployment & Smoke Test Checklist

`STATUS: VERIFIED`

This checklist must be executed and signed off prior to any public production release or staging deployment.

---

## 1. Pre-Deployment Configuration & Security

- [ ] **Environment Mode**: Set `ENVIRONMENT=production` in backend `.env`.
- [ ] **Session Secrets**: `AUTH_SESSION_SECRET` is set to a cryptographically secure random string ($\ge 32$ chars, generated via `openssl rand -hex 32`).
- [ ] **HTTPS & Cookie Security**: `AUTH_COOKIE_SECURE=true` is enabled.
- [ ] **CORS Isolation**: `CORS_ORIGINS` is configured with explicit frontend domains (e.g. `https://otravelz.in,https://www.otravelz.in`) and does not use wildcard `*` with credentials.
- [ ] **Zero Frontend Secrets**: Verified that no private keys, passwords, or provider secrets exist in `frontend/.env` or client source code.
- [ ] **Database Migrations**: Executed `alembic upgrade head` on production PostGIS database.
- [ ] **Place Data Sync**: Executed `python scripts/import_places.py` and `python scripts/sync_db_place_images.py`.

---

## 2. Automated Quality Gates

- [ ] **Backend Test Suite**: `pytest backend/tests` passes 100% (329+ tests).
- [ ] **Frontend Vitest Suite**: `npm test` passes 100% (43 test files, 385 tests).
- [ ] **Frontend Production Build**: `npm run build` completes with zero TypeScript errors.

---

## 3. End-to-End Smoke Test Flow

1. **Discovery & Search**:
   - [ ] Homepage loads in $< 1.5$s on 4G network.
   - [ ] Universal Search auto-completes Odia, Hindi, and English queries (e.g., "Konark", "କୋଣାର୍କ", "Puri Beach").
   - [ ] Regional Hub Switcher updates active district context cleanly.
2. **Destination Catalog**:
   - [ ] All 13 physical categories filter places deterministically.
   - [ ] All 81 places render authentic photography with zero broken images.
3. **Place Decision Surface**:
   - [ ] Place detail modal displays accurate operating hours, duration, and coordinates.
   - [ ] "Save Place" persists to wishlist across browser reload.
   - [ ] "Plan Trip with Place" transitions into the Planner pre-populated.
4. **Itinerary Planning Engine**:
   - [ ] Generates valid 1 to 5 day itineraries without exceeding 3 stops/day invariant.
   - [ ] Timeline calculates arrivals, visit durations, and transfer times chronologically.
   - [ ] Export / Print generates clean PDF-ready travel document.
5. **Interactive Map**:
   - [ ] Map tab lazily loads Leaflet on demand.
   - [ ] Route paths and hop markers synchronize with active itinerary.

---

## 4. Failure Mode Resilience Verification

- [ ] **Backend Unavailable**: Displays offline banner; cached catalog and wishlist remain browsable.
- [ ] **AI Provider Unavailable**: Backend automatically falls back to deterministic rule-based planning.
- [ ] **Weather API Outage**: Seamlessly displays seasonal normal data without throwing errors.
