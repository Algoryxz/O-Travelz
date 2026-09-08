# O-TRAVELZ Mobile V4 — API Nullability & Unknown Enum Policy

> **Authoritative Policy for Nullable Primitives, Missing Fields, and Unknown Enum Values**  
> Wave M6 Baseline  

---

## 1. Core Operating Rule: Absence Is Truth

In O-TRAVELZ Mobile V4, **data absence is an authentic domain state**, not an error to be covered up with synthetic fallback values.

### Prohibited Conversions:
- `null` -> `0` (e.g. A null temperature does NOT mean 0°C; a null fare does NOT mean free).
- `null` -> `""` (e.g. A missing attribution is NOT an empty string).
- `null` -> `false` (e.g. A null `is_day` or null `low_walking` does NOT mean false).
- `null` -> `"Unknown"` (indiscriminate synthetic string injection is forbidden).

---

## 2. Domain-Specific Nullability Contracts

| Field / Concept | Raw API Type | Native Type (`Kotlin` / `Swift`) | Semantic Truth Meaning |
|---|---|---|---|
| **Fare** | `float \| null` | `Double?` / `Double?` | Strictly `null` until official CRUT fare tables ingested. Never display Free or ₹0. |
| **Coordinates** | `float \| null` | `Double?` / `Double?` | Locality-only stops have `lat: null, lon: null`. Never default to `(0.0, 0.0)`. |
| **Route Geometry** | `list \| null` | `List<Coord>?` / `[Coord]?` | Missing polyline means route stops are known but highway geometry unmapped. |
| **Weather** | `float \| null` | `Double?` / `Double?` | Missing sensor reading maps to `WeatherState.Unavailable`. |
| **Media / Photos** | `list \| null` | `List<Image>?` / `[Image]?` | Empty or null list maps to `NoVerifiedImage`. Destination excluded from public catalog. |
| **Candidate Stop Precision** | `string \| null` | `String?` / `String?` | Stop coordinate confidence (`exact`, `approximate`, `candidate`). |
| **Opening Hours** | `string \| null` | `String?` / `String?` | Missing opening hours must prompt "Inquire locally", not "Closed". |

---

## 3. Unknown Enum Handling Policy

Backends evolve independently of mobile releases. If backend introduces a new category or state (e.g. `service_type: "ev_charger"` or `category: "eco_resort"`):

### Kotlin Strategy:
- When using Kotlin Serialization or Moshi/Gson: custom adapter or fallback to an `UNKNOWN` case containing the raw string value, or deserialize as a nullable enum `Category?` so unknown values cleanly evaluate to `null` without throwing `JsonDataException`.

### Swift Strategy:
- Implement `init(from decoder: Decoder)` with `try? container.decode(...)` falling back to `.unknown(rawValue: String)` or `nil`.
- The application will NEVER crash on an unrecognized backend enum case.
