# Southern Odisha Research Staging

**Lead Researcher**: Susmita  
**Region**: `southern`

---

## 1. Scope & Districts Owned

Susmita owns research and staging for the following 9 districts:

1. **Ganjam**
2. **Gajapati**
3. **Koraput**
4. **Rayagada**
5. **Nabarangpur**
6. **Malkangiri**
7. **Kalahandi**
8. **Kandhamal**
9. **Boudh**

> **Priority targets**: Rayagada (2 in catalog), Nabarangpur (2), Boudh (2), Gajapati (3), Malkangiri (3), Kalahandi (3).

---

## 2. Research Goal

- Find **10–20 high-quality, production-worthy destination candidates** across southern and tribal highland districts.
- This is a research target, NOT a quota. Quality > Count.

---

## 3. Required Workflow

1. Identify candidate from official/reputable sources.
2. Verify coordinates using OpenStreetMap / official documentation (must be within Odisha bounding box: 17.8°N–22.6°N, 81.4°E–87.5°E).
3. Draft factual description (minimum 50 characters, no marketing fluff).
4. Identify a reusable, high-quality image lead (preferably Wikimedia Commons with CC license).
5. Document sources in `sources.json` with matching `research_id`.
6. Add candidate entry in `candidates.json` using `round2_south_XXX` ID format.
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
4. **District Administration Portals** (`koraput.nic.in`, `rayagada.nic.in`, `malkangiri.nic.in`, etc.)
5. **OpenStreetMap** (for geospatial verification)
6. **Wikimedia Commons** (for reusable images with CC licenses)
