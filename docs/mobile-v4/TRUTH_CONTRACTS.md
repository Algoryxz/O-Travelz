# O-TRAVELZ Mobile V4 — Truth Contracts & Boundary Specifications

> **Authoritative Epistemic Truth Specification**  
> Scope: **Categorical Invariants, Fallback Rules, and Fail-Closed Boundaries**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Transit Truth Contracts

O-TRAVELZ maintains a strict separation between verified ground coordinates and administrative service areas.

### 1.1 Stop Verification Tiers
| Tier Name | Definition | Allowed Mobile Display | Allowed Routing Role |
|---|---|---|---|
| `VERIFIED_OFFICIAL` | Physical coordinates verified directly from government gazettes or ASI surveys. | Exact coordinate map pin with category glyph. | Fully eligible for exact first-mile walking calculation. |
| `VERIFIED_GEOSPATIAL` | Coordinates cross-verified against high-confidence satellite imagery and OSM nodes. | Exact coordinate map pin. | Fully eligible for exact first-mile walking calculation. |
| `CANDIDATE_HIGH` | Crowdsourced candidate stop with $\ge 5$ verified independent GPS check-ins. | Dashed halo marker with "Candidate" pill. | **STRICTLY PROHIBITED** from exact first-mile walking math. |
| `CANDIDATE_MEDIUM` | Candidate stop with 2–4 independent check-ins. | Dashed halo marker. | **STRICTLY PROHIBITED** from exact first-mile walking math. |
| `CANDIDATE_LOW` | Single-contributor candidate stop. | Visible only in Community Contribution mode. | Excluded from public catalog. |
| `LOCALITY_ONLY` | Stop exists in official route sequence with administrative locality, but exact physical pole coordinate is pending survey (1,257 stops). | Locality polygon / administrative chip (`OFFICIAL_SERVICE_AREA`). No exact pin. | Topological sequence participation only; zero walking calculations. |
| `UNRESOLVED` | Legacy anomaly or ambiguous name requiring manual audit. | Hidden from consumer UI. | None. |

### 1.2 Transit Invariants
1. **No Fabricated GPS**: Candidate coordinates must **never** become exact simply because a mobile client renders them.
2. **First-Mile Gating**: `FirstMileEngine.evaluate()` returns `null` for any candidate or locality-only stop.
3. **Route Geometry Decoupling**: Route geometry confidence (road-following spline) remains strictly independent of stop coordinate confidence.
4. **Schedule Labeling**: Bus departures must always be labeled `Scheduled · HH:MM IST`. The words "Live bus", "Arriving in 3 mins", or "Real-time location" are **strictly forbidden** until vehicle telemetry hardware is integrated.
5. **Fare Integrity**: Fares remain strictly `null` until official audited CRUT/OSRTC fare tables are ingested. Never invent ₹ values.

---

## 2. Media Truth Contracts

### 2.1 Media Classification Tiers
| Tier Name | Definition | Publication Gate |
|---|---|---|
| `EXACT_LOCATION_VERIFIED` | Audited photograph depicting the exact physical site, temple, or artisan cluster in Odisha. | **Eligible** for destination hero image, explore card, and public catalog. |
| `RELATED_LOCATION` | Photograph depicting general district environment or cultural tradition, but not the specific monument. | Eligible for contextual article galleries; **PROHIBITED** from destination hero/card. |
| `UNVERIFIED` | Uploaded image pending forensic review. | Staged in admin queue; **PROHIBITED** from public view. |
| `REJECTED` | Synthetic AI-generated imagery, watermarked stock photo, or incorrect location. | Permanently rejected and purged. |
| `MISSING` | Destination lacking verified photography. | `NO VERIFIED IMAGE = NO PUBLIC DESTINATION`. Staged in private inventory. |

### 2.2 Media Rules
1. **Zero Synthetic Photography**: AI-generated tourist imagery (Midjourney, DALL-E, etc.) is strictly banned across all mobile surfaces.
2. **Distinct Photo Count**: Any photo count badge (`"8 Photos"`) must count **distinct source photographs**, never resolution variants (`hero.webp`, `thumbnail.webp`).
3. **Heritage 3D Standards**: 3D interactive models (`.glb` / `.usdz`) are rendered **strictly** for monuments with explicit canonical 3D scans (e.g. Konark Sun Temple, Mukteshwar). Never show 3D controls on destinations lacking 3D assets.
4. **Authentic Video**: Video loops must be genuine field video recordings. AI video generators (Sora, Runway) are prohibited.

---

## 3. Weather Truth Contracts

1. **Fail-Closed on Missing Telemetry**: If Open-Meteo API is unreachable, the UI displays explicit `Unavailable` or the last cached value with an explicit stale timestamp (`"Updated 2h ago"`).
2. **Never Default to Fake Weather**: Under **no circumstances** may missing weather default to `0°C`, `"Sunny"`, or `"0% rain"`.
3. **Live Distinction**: Only live weather telemetry carries the `[☁ Live]` badge.

---

## 4. AI & Conversational Truth Contracts

1. **AI Never Owns Canonical Facts**: Coordinates, route numbers, schedules, opening hours, fares, and closure statuses are owned strictly by deterministic databases and services.
2. **No Hallucination**: If a traveler asks for an itinerary between points not served by transit, AI must report the transit gap as a factual constraint rather than inventing a fictional bus route or schedule.
3. **Attribution Requirement**: All claims generated in AI conversational responses must cite their underlying `DataProvenance` tier (`FACTUAL_VERIFIED`, `SCHEDULED_TIMETABLE`, or `GENERAL_KNOWLEDGE`).
