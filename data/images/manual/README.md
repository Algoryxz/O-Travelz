# O-Travelz Manual Image Drop-In Directory

This directory is the drop-in staging area for manually sourced authentic photographs for the **90 unresolved destinations** in the Odisha catalog.

---

## Instructions for Adding an Image

1. **Find or take an authentic photograph**:
   - Refer to [data/images/sources/MANUAL_IMAGE_COLLECTION.md](../sources/MANUAL_IMAGE_COLLECTION.md) for required subjects and search queries.
   - For monuments/temples/transit/hospitals: Use an authentic photo of the exact physical structure or building exterior.
   - For food destinations: Use an authentic storefront photo OR a genuine high-quality photo of the exact regional Odia dish/experience.
   - **Do NOT** use generic stock images, AI images, PDFs, logos, or photos of unrelated places.

2. **Save the image file in this folder (`data/images/manual/`)**:
   - Name the file exactly with the place's `research_id`, for example:
     - `food_puri_001.webp` (or `.jpg`, `.jpeg`, `.png`)
     - `place_bhadrak_001.webp`
     - `place_transit_001.webp`
     - `place_med_001.webp`

3. **Add entry to `data/images/manual/metadata.json`**:
   - Every file must have an entry in `metadata.json` mapping its `place_id` (or `research_id`) to source provenance:
   ```json
   {
     "food_puri_001": {
       "filename": "food_puri_001.webp",
       "source_url": "https://example.com/source-page",
       "source_type": "official | wikimedia | licensed | user_supplied",
       "license": "CC BY-SA 4.0 | Public Domain | Proprietary Permission",
       "verified": true,
       "notes": "Authentic photograph of Ananda Bazar Mahaprasad Kudua pots in Puri"
     }
   }
   ```

4. **Run the Validation Script**:
   ```powershell
   .venv\Scripts\python.exe scripts/validate_manual_images.py
   ```
   The script checks:
   - File existence & readable image headers
   - Minimum dimensions (at least 640x360, recommended 1080x720)
   - Metadata presence, schema adherence & verification flag
   - ID matching against catalog places

5. **Safe Registry Integration**:
   - Validated images can then be safely registered into production overrides without touching the core resolution fallback contracts.
