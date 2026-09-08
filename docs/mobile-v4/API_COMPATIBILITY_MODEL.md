# O-TRAVELZ Mobile V4 — API Compatibility & Identity Model

> **Authoritative Specification for Backend Identity & Client Compatibility**  
> Wave M6 Baseline  

---

## 1. Backend Identity Payloads

The live O-TRAVELZ backend (https://otravelz-backend.onrender.com) provides machine-readable identity via two root probes:

### 1.1. Liveness Probe (GET /health)
`json
{
  "status": "ok",
  "version": "4.0.0",
  "git_sha": "4affea9fba7ac49acbad6eacd0d017c68818385d",
  "alembic_version": "0020_transit_ride_observations",
  "database": "connected"
}
`

### 1.2. Readiness Probe (GET /ready)
`json
{
  "status": "ready",
  "database": "connected"
}
`

---

## 2. Compatibility Evaluation Matrix

Mobile clients evaluate backend compatibility without aggressive blocking or fabricated semantic version gates.

| Compatibility State | Condition | Mobile Behavior |
|---|---|---|
| **SUPPORTED** | GET /health returns HTTP 200, database == "connected", version 4.x. | Full online operation. All remote queries and sync enabled. |
| **DEGRADED** | GET /health returns HTTP 200, but database != "connected" or status == "degraded". | Read operations succeed if cached; display non-intrusive status banner indicating live data is temporarily unavailable. Offline deterministic core continues functioning. |
| **INCOMPATIBLE** | Major version mismatch (e.g. backend returns version 5.x or unknown incompatible schema that breaks essential DTO parsing). | Inform user gently that an application update is recommended; graceful fallback to cached/offline data. |
| **UNREACHABLE** | Network timeout, DNS failure, TLS error, or HTTP 502/503. | Classify as transport error; seamlessly fall back to local KMP deterministic engine and cached assets. |

---

## 3. Resilience Rules
1. **Never Crash on Missing Metadata**: If git_sha or lembic_version is omitted, the client must safely decode the remaining payload.
2. **No Semantic Version Negotiation**: The backend does not support Accept-Version headers; client requests adhere strictly to standard REST URLs.
3. **Database Disconnection Handling**: When PostgreSQL is disconnected, /ready responds with HTTP 503; client handles this gracefully as DEGRADED/UNREACHABLE without looping retry storms.
