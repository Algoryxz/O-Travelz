# O-TRAVELZ Mobile V4 — M6 Networking Baseline Specification

## 1. Executive Summary

Wave M6 establishes the native networking foundation, API contract enforcement, and DTO layers for Android and iOS against the real public O-TRAVELZ backend (`https://otravelz-backend.onrender.com`).

| Dimension | Android V4 | iOS V4 |
|---|---|---|
| **Networking Engine** | Retrofit 2.11.0 + OkHttp 4.12.0 | Foundation `URLSession` (async/await) |
| **Serialization** | `kotlinx-serialization-json` 1.7.2 | Swift 6 `Codable` |
| **Contract Snapshot** | `mobile/contracts/openapi-mobile.json` | `mobile/contracts/openapi-mobile.json` |
| **Drift Check** | `python scripts/check_mobile_api_contract.py` | `python scripts/check_mobile_api_contract.py` |
| **Client Source Path** | `mobile/android/.../data/network/` | `mobile/ios/OTravelz/Networking/` |
| **Endpoint Client** | `OTravelzApiService` (Retrofit) | `APIClient` (Actor) |
| **Error Handling** | Sealed class `NetworkError` | Enum `APIError: LocalizedError` |
| **Domain Adapters** | `WeatherState`, `TransitStopTruth` | `WeatherState`, `TransitStopTruth` |
| **Test Verification** | 17 unit tests passed (`DtoDecodingTest`, `MockWebServer`) | Static XCTest source (`NetworkDTOTests.swift`) |
| **Host Limitations** | Android tests & APK assembled on Windows 11 | iOS runtime compilation deferred to macOS |

---

## 2. Canonical Contract Snapshot & Verification

- **Snapshot Generation**: `python scripts/export_mobile_openapi.py` exports deterministic JSON from FastAPI without credentials or volatile timestamps.
- **Drift Verification**: `python scripts/check_mobile_api_contract.py` continuously audits differences between committed snapshot and backend schema, rejecting breaking changes.
- **Repository Integration Test**: `backend/tests/test_mobile_api_contract.py` verifies core mobile paths and HTTP methods during backend CI.

---

## 3. Truth Invariants Enforced in Networking

1. **Absence Is Truth**:
   - `null` temperature does NOT map to `0.0°C`; it evaluates to `WeatherState.Unavailable`.
   - `null` fare remains `null` (never display ₹0 / free).
   - `candidate` transit stops evaluate to `TransitStopTruth.LocalityOnly` (never exact GPS).
2. **Services Isolation**:
   - Civic essentials (`/api/v1/services/nearby`) use isolated DTOs and never contaminate the leisure `Place` discovery feed.
3. **No Retries on AI Converse**:
   - `POST /ai/converse` requests are strictly non-idempotent to prevent duplicate LLM token consumption.

---

## 4. Zero Scope Creep Confirmation

- **mobile/shared**: Zero networking code, zero HTTP dependencies, zero API DTOs.
- **Features / UI**: Zero screen implementation, zero Room/SwiftData databases, zero fake data fixtures.
- **Backend**: Zero runtime backend changes (`backend/app/` completely untouched).
