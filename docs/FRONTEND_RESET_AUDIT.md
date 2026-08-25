# FRONTEND RESET AUDIT — O-TRAVELZ PHASE 2

> **Protected Phase-1 Git Tag**: `production-stable-before-stitch` (`d56ca3e19757c4fc251a0915a758dd454895fb75`)  
> **Working Branch**: `stitch-rebuild`  
> **Recovery Guarantee**: Full Phase-1 frontend code is recoverable anytime via `git checkout production-stable-before-stitch -- frontend/`

---

## 1. Safety Matrix

| Path / Directory | Category | Action | Reason |
|---|---|---|---|
| `frontend/src/pages/DemoHome.tsx` | Old Presentation | **Remove** | Replaced by `StitchHomePage.tsx` & `StitchDestinationsPage.tsx`. |
| `frontend/src/pages/ItineraryPlannerPage.tsx` | Old Presentation | **Remove** | Replaced by `StitchPlannerPage.tsx` & `StitchMapPage.tsx`. |
| `frontend/src/components/{ai,auth,badges,gallery,home,itinerary,legal,location,nav,place,settings,transport,ui,weather}` | Old Components | **Remove / Archive** | All presentation replaced by Stitch luxury editorial components in `src/components/stitch/` & `src/pages/stitch/`. |
| `frontend/src/api/client.ts` | Shared Contract Client | **PRESERVE** | Typed HTTP client for all verified backend endpoints (`/places`, `/itinerary/plan`, `/map/v1/projection`, `/ai/converse`, `/weather/current`, `/auth/*`, `/api/v1/sync/*`). |
| `frontend/src/types/api.ts` | Contract Definitions | **PRESERVE** | Authoritative canonical API types matching FastAPI backend models and UUIDv5 contracts. |
| `frontend/src/types/multilingualTaxonomy.ts` | Multilingual Search | **PRESERVE** | English / Odia / Hindi transliteration mapping for all 161 Odisha destinations. |
| `frontend/src/utils/registerServiceWorker.ts` | PWA & Offline SW | **PRESERVE** | Offline caching worker registration for network resilience. |
| `frontend/public/` | Static Public Assets | **PRESERVE** | Icons, logo, manifest, and service worker for Render / Vercel deployment. |
| `frontend/package.json` & `vite.config.ts` | Tooling & Build Config | **PRESERVE** | Vite, Tailwind 4, Leaflet, and Vitest configuration used by Render CI. |
| `frontend/tests/` | Functional & Contract Tests | **PRESERVE** | Vitest test suites verifying contract parity and identity guarantees. |

---

## 2. New Primary Stitch Component Map

- **Top Navigation**: `src/components/stitch/StitchNavbar.tsx`
- **Mobile Drawer**: `src/components/stitch/StitchMobileDrawer.tsx`
- **Footer**: `src/components/stitch/StitchFooter.tsx`
- **Discover / Hero**: `src/pages/stitch/StitchHomePage.tsx`
- **161 Destinations Catalog**: `src/pages/stitch/StitchDestinationsPage.tsx`
- **Spatial Map Workspace**: `src/pages/stitch/StitchMapPage.tsx`
- **Trip Planner & AI Copilot**: `src/pages/stitch/StitchPlannerPage.tsx`
- **Saved Collections Archive**: `src/pages/stitch/StitchSavedPage.tsx`
- **Resilience States**: `src/pages/stitch/StitchResiliencePage.tsx`
- **Heritage Governance**: `src/pages/stitch/StitchLegalPage.tsx`
- **Auth Modal**: `src/components/stitch/StitchAuthModal.tsx`
- **Preferences Modal**: `src/components/stitch/StitchPreferencesModal.tsx`
- **Share Modal**: `src/components/stitch/StitchShareModal.tsx`
