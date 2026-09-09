# M16 Auth Baseline: Implementation & Verification Baseline

## 1. Wave Identification
- **Wave**: M16 — Authentication, Account Identity & Local-First Sync Boundary
- **Preceding Accepted Wave**: M15 (Emergency Essentials, Civic Contacts & Artisan Clusters)
- **Branch**: `feature/v4-platform-rebuild`

## 2. Core Implementation Deliverables
1. **Backend Auth Support**:
   - Google OAuth mobile scheme redirect whitelist (`otravelz://auth/callback`).
   - One-time 60s login ticket exchange endpoint (`POST /auth/exchange-ticket`).
   - Bearer token session revocation in `POST /auth/logout`.
   - Local dev mock login endpoint (`POST /auth/dev/mock-login`) disabled in production.
2. **Android Native Implementation**:
   - `AuthModels.kt`, `AuthSessionStore.kt` (AES-GCM Keystore + safe fallback), `AuthRepository.kt`, `AuthViewModel.kt`.
   - Deep link intent filter on `MainActivity` for `otravelz://auth/callback`.
   - `AccountCard` in `YouRoot.kt` displaying signed-out card or signed-in identity details.
   - Comprehensive unit test suite in `AuthProductModelTest.kt`.
3. **iOS Native Parity Implementation**:
   - `AuthModels.swift`, `KeychainStore.swift`, `AuthRepository.swift`, `AuthViewModel.swift`.
   - `AccountIdentityCard` in `YouRootView.swift`.
   - `CFBundleURLTypes` registration in `Info.plist`.
   - Swift Testing suite in `AuthDomainTests.swift`.
4. **Contract Synchronization**:
   - Updated `mobile/contracts/openapi-mobile.json` validated via `python scripts/export_mobile_openapi.py --check`.

## 3. Invariants Verified
- `NO_ACCOUNT_WALL`: True
- `SIGNED_OUT_APP_USABLE`: True
- `SIGNOUT_PRESERVES_LOCAL_DATA`: True
- `ACTIVE_TRIP_SURVIVES_SIGNOUT`: True
- `SYNC_CAPABILITY_TRUTH`: DEFERRED (Local data remains device-only)
- `STAGE_G2_LOCKED`: True
