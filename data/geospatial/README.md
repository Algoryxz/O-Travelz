# Western Odisha Geospatial Proximity Layer Specification

> **Canonical File:** `data/geospatial/poi_relationships_western_odisha.json`  
> **Documentation:** `docs/WESTERN_ODISHA_FINAL_HANDOFF.md`  

---

## Overview

The Western Odisha geospatial relationship layer provides read-only, evidence-backed straight-line Haversine proximity linkages ($R = 6371.0088 \text{ km}$) connecting 730 verified POI and transport records across Western Odisha.

### Summary Metrics
* **Total Proximity Relationships:** 2,670
* **Nearest Facility Linkages:** 1,077
* **Source Records Audited:** 730
* **Distance Formula:** Haversine formula
* **Duplicate Relationships:** 0
* **Self Linkages:** 0

---

## Distance Classifications

* `very_near`: $0.00 - 1.00 \text{ km}$
* `nearby`: $1.01 - 3.00 \text{ km}$
* `accessible`: $3.01 - 5.00 \text{ km}$
* `extended`: $> 5.00 \text{ km}$

---

## Schema Contract

```json
{
  "source_id": "place_sundargarh_001",
  "source_type": "tourist_place",
  "source_district": "Sundargarh",
  "target_id": "hotel_sundargarh_001",
  "target_type": "hotel",
  "target_district": "Sundargarh",
  "relationship": "nearby",
  "distance_km": 1.42,
  "distance_class": "nearby",
  "source_coordinate_confidence": "VERIFIED",
  "target_coordinate_confidence": "PLAUSIBLE",
  "cross_district": false
}
```

---

## Usage Rules

1. **Read-Only Layer:** Do NOT modify `poi_relationships_western_odisha.json` directly.
2. **Straight-Line Distance:** Distances represent straight-line Haversine measurements and must NOT be presented to users as driving distances or estimated travel times without routing telemetry.
3. **Coordinate Confidence Preservation:** Preserves `VERIFIED` vs `PLAUSIBLE` coordinate confidence status for both source and target POIs.
