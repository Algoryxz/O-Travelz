# Western Odisha Hospital Dataset Audit

**Research Date:** 2026-08-31  
**Researcher:** Akriti (Western Odisha Lead)  
**Dataset Path:** `data/health/hospitals_western_odisha.json`  
**Total Verified Facilities:** 76

---

## Executive Summary

A comprehensive, evidence-first hospital dataset expansion was conducted for all **11 districts of Western Odisha**. The research prioritized official government healthcare portals (NHM Odisha, District Administration NIC sites, VIMSAR, BBMCH, SRMMCH, GMCH Sundargarh), PSU medical divisions (SAIL, MCL, NTPC, East Coast & South Eastern Railways), and accredited private multi-specialty institutions.

### Key Metrics

- **Total Candidates Discovered:** 88
- **Verified Active Hospitals Included:** 76
- **Excluded (Clinics / Pharmacies / Standalone Blood Banks / Duplicates):** 12
- **Unresolved Candidates:** 0
- **Facilities with Verified Coordinates:** 76 (100.0%)
- **Government / PSU Owned:** 69
- **Private / Trust / Corporate:** 7

---

## District Breakdown

| District | Total Verified Hospitals | Government / PSU | Private / Trust | Verified Coordinates |
|---|---:|---:|---:|---:|
| **Balangir** | 7 | 7 | 0 | 7/7 |
| **Bargarh** | 10 | 9 | 1 | 10/10 |
| **Boudh** | 4 | 4 | 0 | 4/4 |
| **Deogarh** | 3 | 3 | 0 | 3/3 |
| **Jharsuguda** | 10 | 9 | 1 | 10/10 |
| **Kalahandi** | 7 | 7 | 0 | 7/7 |
| **Kandhamal** | 5 | 5 | 0 | 5/5 |
| **Nuapada** | 4 | 4 | 0 | 4/4 |
| **Sambalpur** | 12 | 9 | 3 | 12/12 |
| **Subarnapur** | 4 | 4 | 0 | 4/4 |
| **Sundargarh** | 10 | 8 | 2 | 10/10 |
| **TOTAL** | **76** | **69** | **7** | **76/76** |

---

## Facility Types Included

| Facility Type | Count | Percentage |
|---|---:|---:|
| Community Health Centre | 35 | 46.1% |
| Sub-Divisional Hospital | 13 | 17.1% |
| District Headquarters Hospital | 11 | 14.5% |
| Multi-Specialty Hospital | 6 | 7.9% |
| Government Hospital | 6 | 7.9% |
| Medical College & Hospital | 5 | 6.6% |

---

## Verification Methodology & Evidence Hierarchy

1. **Tier 1 (Preferred):** NHM Odisha, Directorate of Health Services Odisha, NIC District Administration portals, VIMSAR, BBMCH, SRMMCH, GMCH Sundargarh, SAIL RSP, MCL, NTPC, and Railway Medical Division official portals.
2. **Tier 2:** Official websites of accredited private healthcare providers (Vikash Hospital Bargarh, Ashwini Hospital Sambalpur, JP Hospital Rourkela, Hi-Tech Medical College Rourkela).
3. **Zero Fabrication Policy:** Every coordinate pair was cross-verified within Odisha administrative boundaries. Phone numbers and pincodes were attached only when verified from Tier 1/2 portals.
4. **Deduplication:** Merged alternate names (e.g. Tukurla Hospital -> DHH Bargarh; BBMCH -> Balangir DHH Medical College) to ensure single canonical record per physical building.

---

## Exclusions Recorded

- Individual private doctor consultation chambers
- Standalone retail pharmacies and medical stores
- Standalone diagnostic pathology labs without inpatient beds
- Dental clinics without hospital inpatient infrastructure
- Standalone blood banks and health insurance offices