# O-TRAVELZ Mobile V4 — Mobile Network Error Model

> **Authoritative Specification for Backend Error Handling and Client Normalization**  
> Wave M6 Baseline  

---

## 1. Backend Error Envelope Reality

FastAPI in O-TRAVELZ returns structured error responses using `APIErrorResponse` (`app/schemas/api.py`):

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid itinerary request",
    "field": null
  },
  "details": [
    {
      "field": "days",
      "message": "Field required"
    }
  ]
}
```

However, standard HTTP server errors (e.g., Cloudflare 502, Render service spin-up timeouts, or raw 404s for unmounted routes) return unstructured plain text or standard HTML.

Therefore, client networking **must not assume** every error response will parse as `APIErrorResponse`.

---

## 2. Normalized Client Error Hierarchy

Both Android and iOS clients map transport and HTTP failures into a unified, sealed error model:

| Normalized Error Category | HTTP / Transport Trigger | User / Domain Impact |
|---|---|---|
| **`NETWORK_UNAVAILABLE`** | Device in airplane mode, no cell/Wi-Fi connection, DNS resolution failure (`UnknownHostException`, `NSURLErrorCannotFindHost`). | Surface offline status banner; serve cached data; rely on deterministic KMP engine. |
| **`TIMEOUT`** | Connection or socket read timeout exceeded (`SocketTimeoutException`, `NSURLErrorTimedOut`). | Offer retry action; do not block UI with full-screen error if partial data exists. |
| **`VALIDATION_ERROR`** | HTTP 422 with validation details from backend. | Log validation issue; prompt user to correct input. |
| **`HTTP_CLIENT_ERROR`** | HTTP 400–499 (e.g. 404 Not Found, 401 Unauthorized, 403 Forbidden). | Report resource not found or unauthenticated. |
| **`HTTP_SERVER_ERROR`** | HTTP 500–599 (e.g. 500 Internal Error, 502 Bad Gateway, 503 Service Unavailable). | Graceful degradation; indicate server is temporarily busy. |
| **`DECODING_ERROR`** | JSON syntax corruption, missing non-null field, schema mismatch (`JsonDataException`, `DecodingError`). | Log decoding diagnostic; never crash app. |
| **`INCOMPATIBLE_RESPONSE`** | Unrecognized payload format or missing expected schema envelope. | Fall back to safe domain state. |
| **`CANCELLED`** | User navigated away or cancellation invoked (`CancellationException`, `CancellationError`). | Silent no-op; discard response without alerting user. |

---

## 3. Strict Separation of Error from Domain State

Network errors must **never** be conflated with genuine domain conditions:
- A weather fetch HTTP failure or timeout is `NetworkError.Timeout`, **NOT** `WeatherState.Available(0°C)`.
- A transit stop query failure is `NetworkError.ServerError`, **NOT** "No buses operate in Odisha".
- An empty search result with HTTP 200 is a valid domain empty state (`SearchResult.Empty`), **NOT** a network error.
