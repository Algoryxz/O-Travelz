# O-TRAVELZ — Phase 6A.6 Stop Coordinate Resolution Report

## Summary Overview
- **Total Canonical Stops Audited**: 1430
- **ACCEPTED (Verified Coordinates)**: 32
- **REVIEW (Approximations / Need Verification)**: 9
- **REJECTED (Out of Bounds / Invalid)**: 0
- **UNRESOLVED (Legit Stops Without Coordinates)**: 1389

## Resolution Policies
1. **ACCEPT**: Verified coordinates from `official_source`, `geocoded` (OSM Nominatim within Odisha bounding box), or `osm_verified` with explicit evidence.
2. **REVIEW**: Approximate landmarks or uncorroborated coordinates.
3. **REJECT**: Coordinates outside the Odisha bounding box (17.5–22.8° N, 81.2–87.6° E).
4. **UNRESOLVED**: Physical stops from official timetables that remain unresolved without fabrication.

## Sample Resolved Stops

### Verified & Accepted Sample Stops
| Stop Name | City | Coordinates | Provenance | Action |
|---|---|---|---|---|
| `NEW BUS STAND` | Berhampur | `19.31289, 84.80266` | `geocoded` | **ACCEPT** |
| `HOUSING BOARD COLONY` | Berhampur | `19.30664, 84.77980` | `geocoded` | **ACCEPT** |
| `KAMAPALLI` | Berhampur | `19.30703, 84.80582` | `geocoded` | **ACCEPT** |
| `MKCG STATE BANK` | Berhampur | `19.30830, 84.80830` | `geocoded` | **ACCEPT** |
| `MKCG MEDICAL COLLEGE SQUARE` | Berhampur | `19.30830, 84.80830` | `geocoded` | **ACCEPT** |
| `GOPALPUR JUNCTION` | Berhampur | `19.26111, 84.90833` | `geocoded` | **ACCEPT** |
| `GOPALPUR COLLEGE` | Berhampur | `19.26111, 84.90833` | `geocoded` | **ACCEPT** |
| `GOPALPUR BUS STAND` | Berhampur | `19.26111, 84.90833` | `geocoded` | **ACCEPT** |
| `AINTHAPALI BUS TERMINAL` | Sambalpur | `21.49538, 83.98396` | `geocoded` | **ACCEPT** |
| `KUCHINDA` | Sambalpur | `21.74774, 84.35064` | `geocoded` | **ACCEPT** |
| `PADIABAHAL` | Sambalpur | `21.44950, 84.15521` | `geocoded` | **ACCEPT** |
| `SANAGHAGHARA PARK` | Keonjhar | `21.61670, 85.55000` | `geocoded` | **ACCEPT** |
| `BHUBANESWAR RAILWAY STATION` | Bhubaneswar | `20.26678, 85.84356` | `geocoded` | **ACCEPT** |
| `SHREE MANDIRA PARKING, PURI` | Bhubaneswar | `19.80472, 85.81778` | `geocoded` | **ACCEPT** |
| `IGKC MULTISPECIALTY HOSPITAL` | Bhubaneswar | `20.27406, 85.76433` | `geocoded` | **ACCEPT** |

### Unresolved Sample Stops
| Stop Name | City | Serving Context | Action |
|---|---|---|---|
| `DUDUMA COLONY` | Berhampur | `Odisha` | **UNRESOLVED** |
| `FIRST GATE` | Berhampur | `Odisha` | **UNRESOLVED** |
| `HARIDAKHANDI CHAKA` | Berhampur | `Odisha` | **UNRESOLVED** |
| `KATHA MANTU CHAKA` | Berhampur | `Odisha` | **UNRESOLVED** |
| `GANESH NAGAR` | Berhampur | `Odisha` | **UNRESOLVED** |
| `MENTU CHAKA` | Berhampur | `Odisha` | **UNRESOLVED** |
| `RAJA RANI APARTMENT` | Berhampur | `Odisha` | **UNRESOLVED** |
| `AMBA MARKET` | Berhampur | `Odisha` | **UNRESOLVED** |
| `SHIVASHAKIT HALL` | Berhampur | `Odisha` | **UNRESOLVED** |
| `PREM NAGAR SQUARE` | Berhampur | `Odisha` | **UNRESOLVED** |
| `REGISTER OFFICE` | Berhampur | `Odisha` | **UNRESOLVED** |
| `MAHATMA GANDHI STADIUM` | Berhampur | `Odisha` | **UNRESOLVED** |
| `GANDHI NAGAR` | Berhampur | `Odisha` | **UNRESOLVED** |
| `CONGRESS BHABAN` | Berhampur | `Odisha` | **UNRESOLVED** |
| `KHALLIKOTE COLLEGE` | Berhampur | `Odisha` | **UNRESOLVED** |
