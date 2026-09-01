# Eastern Odisha Research Staging

**Lead Researcher**: Rudra  
**Region**: `eastern`

---

## 1. Scope & Districts Owned

Rudra owns research and staging for the following 7 districts:

1. **Cuttack**
2. **Jagatsinghpur**
3. **Jajpur**
4. **Bhadrak**
5. **Kendrapara**
6. **Dhenkanal**
7. **Angul**

> **Priority targets**: Kendrapara (currently only 2 in catalog), Bhadrak (3), Dhenkanal (3), Jagatsinghpur (3), Jajpur (3).

---

## 2. Research Goal

- Find **10–20 high-quality, production-worthy destination candidates** across underrepresented districts.
- This is a research target, NOT a quota. Quality > Count.

---

## 3. Required Workflow

1. Identify candidate from official/reputable sources.
2. Verify coordinates using OpenStreetMap / official documentation (must be within Odisha bounding box).
3. Draft factual description (minimum 50 characters, no marketing fluff).
4. Identify a reusable, high-quality image lead (preferably Wikimedia Commons with CC license).
5. Document sources in `sources.json` with matching `research_id`.
6. Add candidate entry in `candidates.json` using `round2_east_XXX` ID format.
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
4. **District Administration Portals** (`cuttack.nic.in`, `kendrapara.nic.in`, etc.)
5. **OpenStreetMap** (for geospatial verification)
6. **Wikimedia Commons** (for reusable images with CC licenses)

## 6. Image Catalog, Audit & Frontend Integration

All 21 researched candidate destinations across the 7 Eastern Odisha districts were audited for geographic authenticity, license validity, and resolution standards:

- **Audit Record**: [`data/research/round2/eastern/eastern_image_audit.json`](eastern_image_audit.json)
- **Production Catalog**: [`data/research/round2/eastern/eastern_image_catalog.json`](eastern_image_catalog.json)
- **Audit & Fix Script**: [`scripts/perform_full_audit.py`](../../../scripts/perform_full_audit.py)
- **Frontend Overrides**: [`frontend/src/utils/imageRegistry.ts`](../../../frontend/src/utils/imageRegistry.ts) (`PLACE_IMAGE_OVERRIDES`)
- **Frontend Manifest**: [`frontend/src/utils/imageService.ts`](../../../frontend/src/utils/imageService.ts) (`PLACE_IMAGE_MANIFEST`)
- **Audit Status**:
  - **19 Destinations Verified**: 100% authentic photography from Wikimedia Commons with verified open licenses (CC BY / CC BY-SA / Public Domain).
  - **2 Destinations Needs Image**: Garh Kujanga (`round2_east_013`) and Alaka Ashram (`round2_east_014`) had unverified/unrelated images removed and are truthfully marked `NEEDS_VERIFIED_IMAGE` (with high-contrast category SVG fallback per project truthfulness rules).
