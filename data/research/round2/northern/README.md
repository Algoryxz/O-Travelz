# Northern Odisha Research Staging

**Lead Researcher**: Punam  
**Region**: `northern`

---

## 1. Scope & Districts Owned

Punam owns research and staging for the following 6 districts:

1. **Mayurbhanj**
2. **Balasore**
3. **Keonjhar**
4. **Puri**
5. **Khordha**
6. **Nayagarh**

> **Important notes**:  
> - **Primary research priorities**: Mayurbhanj (4 currently in catalog), Balasore (5), Keonjhar (5), Nayagarh (3).  
> - **Khordha and Puri**: These districts are already extensively covered in the production catalog (Khordha: 44, Puri: 15). Only propose candidates if they are uniquely significant, unrepresented in the current catalog, and thoroughly verified.  
> - **Keonjhar**: Assigned to Northern for Round 2 workflow (shared zone with Western).

---

## 2. Research Goal

- Find **10–20 high-quality, production-worthy destination candidates** primarily in Mayurbhanj, Balasore, Keonjhar, and Nayagarh.
- This is a research target, NOT a quota. Quality > Count.

---

## 3. Required Workflow

1. Identify candidate from official/reputable sources.
2. Verify coordinates using OpenStreetMap / official documentation (must be within Odisha bounding box: 17.8°N–22.6°N, 81.4°E–87.5°E).
3. Draft factual description (minimum 50 characters, no marketing fluff).
4. Identify a reusable, high-quality image lead (preferably Wikimedia Commons with CC license).
5. Document sources in `sources.json` with matching `research_id`.
6. Add candidate entry in `candidates.json` using `round2_north_XXX` ID format.
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
4. **District Administration Portals** (`mayurbhanj.nic.in`, `balasore.nic.in`, `keonjhar.nic.in`, etc.)
5. **OpenStreetMap** (for geospatial verification)
6. **Wikimedia Commons** (for reusable images with CC licenses)
