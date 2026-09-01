# Western Odisha ATM / Cash Access Dataset Audit

**Research Date:** 2026-08-31  
**Researcher:** Akriti (Western Odisha Lead)  
**Dataset Path:** `data/finance/atms_western_odisha.json`  
**Total Verified ATMs:** 112

---

## Executive Summary

An evidence-backed, deduplicated ATM dataset expansion was conducted across all **11 districts of Western Odisha**. Data collection prioritized official bank locators (SBI, HDFC, ICICI, Axis, PNB, Bank of Baroda, Canara, Union Bank, UCO Bank) and transport hub / hospital campus infrastructure locators.

### Key Metrics

- **Districts Researched:** 11
- **Candidates Discovered:** 130
- **Verified Active ATMs Included:** 112
- **Excluded (Bank Branches without ATM / POS Terminals / Unverified Agent Outlets / Duplicates):** 18
- **Unresolved Candidates:** 0
- **Duplicates Removed:** 18
- **Exact / Micro-Verified Coordinates:** 54 (48.2%)
- **Locality-Plausible Coordinates:** 58 (51.8%)
- **Invalid / Unverified Coordinates:** 0 (0.0%)
- **Public Sector Banks Represented:** SBI (34), PNB (10), BoB (6), Canara (3), Union Bank (3), UCO Bank (1)
- **Private Sector Banks Represented:** ICICI Bank (23), HDFC Bank (17), Axis Bank (15)
- **Tier 1 Official Sources:** 112 (100.0%)

---

## District Breakdown

| District | Discovered | Verified ATMs | Excluded | Unresolved | Micro-Verified Coords | Plausible Coords |
|---|---:|---:|---:|---:|---:|---:|
| **Sundargarh** | 18 | 16 | 2 | 0 | 4 | 12 |
| **Sambalpur** | 17 | 15 | 2 | 0 | 6 | 9 |
| **Balangir** | 13 | 11 | 2 | 0 | 4 | 7 |
| **Bargarh** | 13 | 11 | 2 | 0 | 5 | 6 |
| **Jharsuguda** | 13 | 11 | 2 | 0 | 4 | 7 |
| **Kalahandi** | 11 | 10 | 1 | 0 | 7 | 3 |
| **Kandhamal** | 10 | 9 | 1 | 0 | 6 | 3 |
| **Subarnapur** | 9 | 8 | 1 | 0 | 4 | 4 |
| **Nuapada** | 9 | 8 | 1 | 0 | 5 | 3 |
| **Boudh** | 8 | 7 | 1 | 0 | 4 | 3 |
| **Deogarh** | 7 | 6 | 1 | 0 | 5 | 1 |
| **TOTAL** | **130** | **112** | **18** | **0** | **54** | **58** |

---

## Authoritative Bank Breakdown (Reconciled directly from JSON dataset)

| Bank Name | Bank Type | Verified ATMs | Percentage |
|---|---|---:|---:|
| **State Bank of India (SBI)** | Public Sector | 34 | 30.4% |
| **ICICI Bank** | Private Sector | 23 | 20.5% |
| **HDFC Bank** | Private Sector | 17 | 15.2% |
| **Axis Bank** | Private Sector | 15 | 13.4% |
| **Punjab National Bank (PNB)** | Public Sector | 10 | 8.9% |
| **Bank of Baroda** | Public Sector | 6 | 5.4% |
| **Union Bank of India** | Public Sector | 3 | 2.7% |
| **Canara Bank** | Public Sector | 3 | 2.7% |
| **UCO Bank** | Public Sector | 1 | 0.9% |
| **TOTAL** | | **112** | **100.0%** |

---

## Facility Type Breakdown

| Facility Type | Count | Percentage |
|---|---:|---:|
| Off-Site ATM Kiosk | 55 | 49.1% |
| Branch Attached ATM | 50 | 44.6% |
| Transport Hub ATM | 7 | 6.3% |

---

## Coordinate & Location Quality Audit

```text
Micro-verified exact coordinates: 54 (48.2%)
Locality-plausible coordinates: 58 (51.8%)
Invalid / unverified coordinates: 0 (0.0%)
```

> [!IMPORTANT]
> **Data Quality Rule:** Locality-plausible coordinates represent valid town, postal area, or major crossroad geocodes matching the stated address. They **must NOT be represented as exact surveyed GPS positions** or physical building pinpoints in downstream UI applications.

---

## Evidence Quality

| Tier | Source Category | Count | Percentage |
|---|---|---:|---:|
| Tier 1 | Official Bank ATM Locators (SBI, HDFC, ICICI, Axis, PNB, BoB, Canara, Union, UCO) | 112 | 100.0% |
| Tier 2 | Official Institutional Directories | 0 | 0.0% |
| Tier 3 | Supporting Map Evidence | 0 | 0.0% |

---

## Exclusions Recorded (18 Total)

- Bank branch offices that lack cash dispenser/ATM hardware
- Retail shop merchant POS terminals
- Micro-ATM BC agent outlets without standalone ATM machinery
- Permanently removed or closed legacy ATM kiosks
- Duplicate ATM records listed under alternate branch spellings
