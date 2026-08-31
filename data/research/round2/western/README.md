# Western Odisha Research Staging

**Lead Researcher**: Akriti  
**Region**: `western`

---

## 1. Scope & Districts Owned

Akriti owns research and staging for the following 8 districts:

1. **Sambalpur**
2. **Bargarh**
3. **Jharsuguda**
4. **Balangir**
5. **Subarnapur**
6. **Nuapada**
7. **Deogarh**
8. **Sundargarh**

> **Note on Keonjhar**: Assigned to Punam (Northern region). Do not submit Keonjhar records here.  
> **Priority targets**: Nuapada (2 in catalog), Deogarh (2), Bargarh (2), Subarnapur (3), Jharsuguda (3).

---

## 2. Research Goal

- Find **10–20 high-quality, production-worthy destination candidates** across underrepresented western districts.
- This is a research target, NOT a quota. Quality > Count.

---

## 3. Required Workflow

1. Identify candidate from official/reputable sources.
2. Verify coordinates using OpenStreetMap / official documentation (must be within Odisha bounding box: 17.8°N–22.6°N, 81.4°E–87.5°E).
3. Draft factual description (minimum 50 characters, no marketing fluff).
4. Identify a reusable, high-quality image lead (preferably Wikimedia Commons with CC license).
5. Document sources in `sources.json` with matching `research_id`.
6. Add candidate entry in `candidates.json` using `round2_west_XXX` ID format.
7. Run local validation:
   ```bash
   python scripts/validate_round2_research.py
   ```

---

## 4. Forbidden Actions

- ❌ Never edit `data/places/places.json` directly.
- ❌ Never invent coordinates or copy random unverified pins.
- ❌ Never fabricate opening hours, entry fees, or ratings.
- ❌ Never download or link copyrighted/watermarked images without license verification.
- ❌ Never mark research candidates as "verified" or "publishable" before core review.

---

## 5. Preferred Sources

1. **Government of Odisha** (`odisha.gov.in`)
2. **Odisha Tourism / OTDC** (`odishatourism.gov.in`)
3. **Archaeological Survey of India (ASI)** (`asi.nic.in`)
4. **District Administration Portals** (`sambalpur.nic.in`, `bargarh.nic.in`, `nuapada.nic.in`, etc.)
5. **OpenStreetMap** (for geospatial verification)
6. **Wikimedia Commons** (for reusable images with CC licenses)
