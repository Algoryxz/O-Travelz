# O-TRAVELZ Mobile V4 — M12 Transit Search & Ranking Specification

> **Authoritative Mobility Search Engine Specification**  
> Wave: `M12` | Document Version: `1.0.0` | Last Updated: `2026-09-08`

---

## 1. Objectives & Principles

The O-TRAVELZ transit search engine is a **deterministic in-memory ranking pipeline** designed for fast, offline-resilient route discovery across Odisha's 154 canonical transit routes.
- **Zero Remote Requests per Keystroke**: The 154 routes are loaded once on Transit Directory entry. All filtering and scoring evaluate synchronously in-memory.
- **No LLM / Hallucinatory Search**: Queries match strictly against verified metadata: public route numbers, origins, destinations, route names, and served cities.
- **Zero Stale Routes**: Only verified routes from the canonical dataset are indexed.

---

## 2. Multi-Tiered Scoring Formula

When a query $Q$ is entered, each route is scored according to the highest applicable tier:

| Tier | Priority Score | Criteria | Example ($Q$ = "10") |
|---|---|---|---|
| **Tier 1: Exact Route Number** | 1,000 | `routeNumber.equals(Q, ignoreCase = true)` | Route 10 matches exactly |
| **Tier 2: Prefix Route Number** | 800 | `routeNumber.startsWith(Q, ignoreCase = true)` | Route 10A, Route 101 |
| **Tier 3: Origin or Destination Exact** | 600 | `origin == Q` or `destination == Q` | "Puri" matching origin |
| **Tier 4: Origin or Destination Prefix** | 400 | `origin.startsWith(Q)` or `dest.startsWith(Q)` | "Bara" matching "Baramunda" |
| **Tier 5: Route Name Substring** | 200 | `routeName.contains(Q)` | "AIIMS" inside full name |
| **Tier 6: City / Service Area Substring**| 100 | `cities.any { contains(Q) }` | "Rourkela" matching city list |
| **Tier 0: No Match** | 0 | None of the above | Excluded from results |

Tie-breaking among equal scores sorts alphabetically by numerical route number.

---

## 3. Alias Normalization

Common traveler aliases are normalized deterministically before scoring:
- `"Mo Bus 10"` $\longrightarrow$ `"10"`
- `"Route 10"` $\longrightarrow$ `"10"`
- `"Ama Bus 300"` $\longrightarrow$ `"300"`
- `"BBSR"` $\longrightarrow$ `"Bhubaneswar"`
- `"CTC"` $\longrightarrow$ `"Cuttack"`

---

## 4. Cross-Platform Parity

Both Android (`TransitSearchEngine.kt`) and iOS (`TransitSearchEngine.swift`) implement identical scoring tiers and alias normalization rules to guarantee deterministic parity across platforms.
