# O-TRAVELZ Mobile V4 — Network Retry Policy

> **Authoritative Specification for HTTP Idempotency, Bounded Retries, and Storm Prevention**  
> Wave M6 Baseline  

---

## 1. Idempotency Boundary

Not all HTTP requests may be safely replayed upon failure.

| Method | Endpoint Domain | Idempotent | Retry Policy | Max Attempts |
|---|---|---|---|---|
| `GET` | Core (`/health`, `/ready`) | Yes | Immediate single retry on connection reset. | 2 |
| `GET` | Places (`/places/*`) | Yes | Exponential backoff (1s, 2s). | 2 |
| `GET` | Weather (`/weather/current`) | Yes | Linear backoff (2s). Fall back to stale cache. | 2 |
| `GET` | Transit (`/transport/*`) | Yes | Exponential backoff (1s, 2s). | 2 |
| `GET` | Services (`/api/v1/services/*`) | Yes | Exponential backoff (1s, 2s). | 2 |
| `POST` | AI Converse (`/ai/converse`) | **No** | **DO NOT AUTOMATICALLY RETRY**. Require user prompt re-submission to prevent duplicate LLM token consumption. | 1 |
| `POST` | Itinerary Plan (`/itinerary/plan`) | Yes (Pure function) | Safe to retry once upon transport timeout. | 2 |
| `POST` | Transit Ride Session (`/transport/rides/*`) | **No** | Requires unique client idempotency token. | 1 |

---

## 2. Anti-Retry-Storm Rules
1. **Never loop retries indefinitely**: All automatic retries cap at a hard maximum of 2 attempts.
2. **Never retry 4xx errors**: HTTP 400, 401, 403, 404, 422 are permanent client errors; retrying immediately is strictly prohibited.
3. **No Retries on Background Suspension**: When the app transitions to background, active network requests are cancelled gracefully.
