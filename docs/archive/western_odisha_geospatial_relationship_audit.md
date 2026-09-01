# Western Odisha Master Geo-Spatial Relationship Layer Audit

**Audit Date:** 2026-08-31  
**Engine:** O-Travelz Haversine Proximity Calculator  
**Dataset File:** `data/geospatial/poi_relationships_western_odisha.json`  
**Total Derived Relationships:** 2670
**Total Nearest Links:** 1077

---

## Executive Summary

A derived, read-only geospatial proximity layer was calculated connecting **161 Tourist Places**, **78 Hotels**, **88 Restaurants**, **71 Police Stations**, **112 ATMs**, **98 Petrol Pumps**, **76 Hospitals**, and **28 Verified Transport Stops** across Western Odisha.

### Key Metrics

- **Total Source POIs Audited:** 730
- **Computed Spatial Relationships:** 2670
- **Nearest Links Computed:** 1077
- **Cross-District Relationships:** 83
- **Duplicate Relationships:** 0
- **Invalid Distances / Self Links:** 0
- **Canonical Datasets Modified:** NO (100% read-only analysis)

---

## Relationship Pairing Breakdown

| Relationship Pair | Calculated Linkages | Distance Threshold |
|---|---:|---:|
| `tourist_place→hotel` | 124 | Threshold Applied |
| `tourist_place→restaurant` | 93 | Threshold Applied |
| `tourist_place→atm` | 140 | Threshold Applied |
| `tourist_place→petrol_pump` | 135 | Threshold Applied |
| `tourist_place→hospital` | 86 | Threshold Applied |
| `tourist_place→police_station` | 87 | Threshold Applied |
| `tourist_place→transport` | 412 | Threshold Applied |
| `hotel→restaurant` | 201 | Threshold Applied |
| `hotel→atm` | 287 | Threshold Applied |
| `hotel→hospital` | 159 | Threshold Applied |
| `hotel→police_station` | 160 | Threshold Applied |
| `hotel→transport` | 73 | Threshold Applied |
| `restaurant→atm` | 313 | Threshold Applied |
| `restaurant→petrol_pump` | 215 | Threshold Applied |
| `petrol_pump→hospital` | 185 | Threshold Applied |
| **TOTAL** | **2670** | -- |

---

## Distance Classification Breakdown

| Distance Class | Range (km) | Count | Percentage |
|---|---|---:|---:|
| **very_near** | 0.00 - 1.00 km | 1030 | 38.6% |
| **nearby** | 1.01 - 3.00 km | 691 | 25.9% |
| **accessible** | 3.01 - 5.00 km | 374 | 14.0% |
| **extended** | > 5.00 km | 575 | 21.5% |

---

## Data Quality & Integrity Standards

> [!NOTE]
> All distances represent straight-line **Haversine formula** calculations ($R = 6371.0088 \text{ km}$). They must NOT be represented as driving distances or estimated travel times without routing telemetry.