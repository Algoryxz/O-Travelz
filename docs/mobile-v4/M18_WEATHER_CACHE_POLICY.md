# M18 Weather Cache Policy

## 1. Ground Truth Principle
> **Weather is mutable telemetry. Absence of network connectivity must never fabricate live weather, and cached observations must never be labeled as live.**

---

## 2. Invariants
1. **Never Default to Fabricated Values**: No `0°C`, no default `Sunny`, no `0% rain`.
2. **No Arbitrary Hard Expiry**: Stored observations are not forcibly expired or discarded after an arbitrary TTL; rather, they are always displayed with an explicit relative timestamp (e.g. `Cached weather · 3h ago`).
3. **Disclosure of Provenance**:
   - `Live`: Rendered only when directly fetched in the current online session.
   - `Cached`: Rendered with relative elapsed time disclosure (`Cached weather · %s ago`).
   - `Unavailable`: Rendered when no observation exists for coordinates.

---

## 3. Storage Schema
- **Key**: Regional coordinate grid key `weather_{lat_2dec}_{lon_2dec}`.
- **Fields**:
  - `locationName`: String
  - `temperatureC`: Double
  - `condition`: String
  - `advice`: String?
  - `observedAtMillis`: Long (epoch milliseconds)

---

## 4. UI Rendering Specifications
- **Live**:
  ```text
  29°C  |  Partly Cloudy
  Light rain expected in afternoon. Carry an umbrella.
  ```
- **Cached (Offline)**:
  ```text
  Cached weather · 3h ago
  29°C  |  Partly Cloudy
  ```
- **Unavailable**:
  ```text
  Weather unavailable
  ```
