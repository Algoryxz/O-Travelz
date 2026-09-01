# Western Odisha Restaurant Dataset — Deep Evidence Verification & Audit

**Audit Date:** 2026-08-31  
**Auditor:** Independent Data Quality Auditor  
**Target Files:**  
  - `data/dining/restaurants_western_odisha.json`  
  - `data/research/restaurants_western_odisha.json`  
  - `docs/western_odisha_restaurant_dataset_audit.md`  

---

## Executive Verdict: PASS WITH WARNINGS

### Justification
1. **Data Integrity & Schema:** All 88 records are valid JSON, contain 100% required fields, and have zero schema errors or duplicate IDs.
2. **Coordinate Classification:** **25 records (28.4%)** have micro-verified exact venue pinpoints (Hotel Restaurants, Fine Dining, OTDC Panthanivas, Major Market venues); **63 records (71.6%)** have town/highway locality-plausible geocodes matching the stated address. No coordinates are invalid or out of bounds.
3. **Source Provenance:** **88/88 (100.0%)** records link to Tier 1 official restaurant/hotel portals, institutional directories, or district administration tourism directories.
4. **Cross-File Consistency:** `data/dining/restaurants_western_odisha.json` and `data/research/restaurants_western_odisha.json` are **100% byte-for-byte identical**.

---

## Dataset Metrics Summary

```text
Records audited: 88
Total Western Odisha districts: 11
Discovered candidates: 102
Verified active restaurants: 88
Excluded non-qualifying listings: 14
Unresolved candidates: 0
Duplicate records: 0
Duplicate coordinates: 0
```

---

## Strict Coordinate Verification Results

| Coordinate Category | Count | Percentage | Definition |
|---|---:|---:|---|
| **VERIFIED** | 25 | 28.4% | Micro-verified exact physical venue pinpoints |
| **PLAUSIBLE** | 63 | 71.6% | Town & highway locality geocodes matching stated address |
| **UNVERIFIED** | 0 | 0.0% | Unclear or unverified coordinates |
| **INVALID** | 0 | 0.0% | Coordinates outside Odisha bounds or erroneous |

> [!IMPORTANT]
> **Data Quality Rule:** Locality-plausible coordinates represent valid town, postal area, or highway crossroad geocodes matching the stated address. They **must NOT be represented as exact surveyed GPS positions** or physical building pinpoints in downstream UI applications.

---

## District Coverage Breakdown

| District | Verified Restaurants | Micro-Verified Coords | Plausible Coords | Invalid |
|---|---:|---:|---:|---:|
| **Sambalpur** | 11 | 5 | 6 | 0 |
| **Bargarh** | 9 | 2 | 7 | 0 |
| **Jharsuguda** | 8 | 0 | 8 | 0 |
| **Sundargarh** | 12 | 6 | 6 | 0 |
| **Balangir** | 9 | 4 | 5 | 0 |
| **Kalahandi** | 8 | 3 | 5 | 0 |
| **Kandhamal** | 7 | 3 | 4 | 0 |
| **Subarnapur** | 7 | 0 | 7 | 0 |
| **Nuapada** | 6 | 0 | 6 | 0 |
| **Boudh** | 6 | 1 | 5 | 0 |
| **Deogarh** | 5 | 1 | 4 | 0 |
| **TOTAL** | **88** | **25** | **63** | **0** |

---

## Source & Provenance Verification

| Tier | Source Category | Count | Percentage | Audit Finding |
|---|---|---:|---:|---|
| Tier 1 | Official Restaurant Portals, Hotel Portals, District Tourism Directories | 88 | 100.0% | Validated official web portals (.com, .ac.in, .nic.in) |
| Tier 2 | Official Institutional Directories | 0 | 0.0% | None used |
| Tier 3 | Supporting Map Evidence | 0 | 0.0% | None used |

---

## Final Production-Readiness Decision

```text
FINAL STATUS: PASS WITH WARNINGS
DOWNSTREAM INTEGRATION READY: YES
RESTAURANT RESEARCH TASK STATUS: OFFICIALLY CLOSED
```