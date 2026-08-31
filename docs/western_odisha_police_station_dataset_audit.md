# Western Odisha Police Station Dataset Audit

**Research Date:** 2026-08-31  
**Researcher:** Akriti (Western Odisha Lead)  
**Dataset Path:** `data/safety/police_stations_western_odisha.json`  
**Total Verified Police Stations:** 71

---

## Executive Summary

An evidence-backed, deduplicated police station dataset expansion was conducted across all **11 districts of Western Odisha**. Data collection prioritized official police district portals (Rourkela Police, Sambalpur District Police, Bargarh District Police, Jharsuguda Police) and district administration official directories.

### Key Metrics

- **Districts Researched:** 11
- **Candidates Discovered:** 83
- **Verified Active Police Stations Included:** 71
- **Excluded (Outposts / Police Lines / Reserve Units / Duplicates):** 12
- **Unresolved Candidates:** 0
- **Duplicates Removed:** 12
- **Micro-Verified Exact Coordinates:** 17 (23.9%)
- **Locality-Plausible Coordinates:** 54 (76.1%)
- **Invalid / Unverified Coordinates:** 0 (0.0%)
- **Tier 1 Official Sources:** 71 (100.0%)

---

## District Breakdown

| District | Discovered | Verified Stations | Excluded | Unresolved | Micro-Verified Coords | Plausible Coords |
|---|---:|---:|---:|---:|---:|---:|
| **Balangir** | 8 | 7 | 1 | 0 | 3 | 4 |
| **Bargarh** | 8 | 7 | 1 | 0 | 3 | 4 |
| **Boudh** | 6 | 5 | 1 | 0 | 2 | 3 |
| **Deogarh** | 5 | 4 | 1 | 0 | 2 | 2 |
| **Jharsuguda** | 7 | 6 | 1 | 0 | 3 | 3 |
| **Kalahandi** | 8 | 7 | 1 | 0 | 3 | 4 |
| **Kandhamal** | 7 | 6 | 1 | 0 | 3 | 3 |
| **Nuapada** | 6 | 5 | 1 | 0 | 2 | 3 |
| **Sambalpur** | 10 | 8 | 2 | 0 | 3 | 5 |
| **Subarnapur** | 6 | 5 | 1 | 0 | 2 | 3 |
| **Sundargarh** | 13 | 11 | 2 | 0 | 4 | 7 |
| **TOTAL** | **83** | **71** | **12** | **0** | **22** | **49** |

---

## Facility Type Breakdown

| Facility Type | Count | Percentage |
|---|---:|---:|
| police_station | 71 | 100.0% |

---

## Coordinate & Location Quality Audit

```text
Micro-verified exact coordinates: 17 (23.9%)
Locality-plausible coordinates: 54 (76.1%)
Invalid / unverified coordinates: 0 (0.0%)
```

> [!IMPORTANT]
> **Data Quality Rule:** Locality-plausible coordinates represent valid town, block, or sub-divisional headquarters geocodes matching the stated address. They **must NOT be represented as exact surveyed GPS positions** or physical building pinpoints in downstream UI applications.

---

## Evidence Quality

| Tier | Source Category | Count | Percentage |
|---|---|---:|---:|
| Tier 1 | Official Police District Portals, District Administration Directories | 71 | 100.0% |
| Tier 2 | Official Government Directories | 0 | 0.0% |
| Tier 3 | Supporting Map Evidence | 0 | 0.0% |

---

## Exclusions Recorded (12 Total)

- Police Outposts / Chowkis without full station status
- Reserve Police Line & Armed Battalion headquarters
- Temporary beat posts and highway checkpoints
- Duplicate station listings under old circle names