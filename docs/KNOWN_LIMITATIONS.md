# O-Travelz Known Limitations & Technical Debt Ledger

**Document Status**: Canonical Limitations Record
**Coordination**: Punam & Engineering Team
**Scope**: Explicit architectural boundaries, data limitations, and known non-blocking technical debt.

---

## 1. Transport Data Tiers & Road Routing Boundaries

1. **Walking Bounds & Road Routing**:
   - Direct walking journeys are strictly constrained to $\le 2000\text{ m}$ (and $\le 1500\text{ m}$ for transit station transfers).
   - Longer journeys ($> 2000\text{ m}$) route via the backend road engine (`mode="road"`) using curvature-adjusted distance and estimated road speeds.
   - Live dynamic traffic feeds and real-time intercity bus GPS are not present; hops utilize static or heuristic data tiers.
2. **Transit Schedules & Vector Geometry**:
   - Mo Bus (CRUT) routes (e.g. Route 10, Route 12) operate on verified static frequency tables rather than live GTFS-RT feeds.
   - Detailed GIS polyline geometries exist for major verified corridors; rural or connecting links without published vector alignments display `geometry_status: "unavailable"` with reason `provider_geometry_unavailable`.

---

## 2. Image Catalog Coverage & Pipeline Status

1. **Ingested Destination Photography**:
   - All 50 canonical Whole-Odisha destinations have verified, destination-specific photography ingested into the database & storage pipeline with Creative Commons legal provenance metadata and WebP multi-variant assets (`hero`, `card`, `thumbnail`).
2. **Private Proxy & Client-Side Fallback System**:
   - Imagery is delivered through the authenticated backend proxy (`GET /api/v1/images/{storage_key}`).
   - Client-side fallback mappings in `imageAdapter.ts` / `imageService.ts` ensure seamless offline rendering without broken images or masked server errors.

---

## 3. Database Catalog Evolution & Legacy Records

1. **Canonical Dataset**:
   - `data/places/places.json` defines **81 canonical Whole-Odisha destinations** covering all 30 districts across 6 geographical zones with 100% verified WGS84 coordinate coverage.
2. **Legacy Phase 0 Database Rows & Schema Tolerance**:
   - Early prototype seed records from Phase 0 (e.g., `place_005`, `place_012`) may exist in non-reset legacy databases alongside canonical records.
   - The database schema and idempotent importer ([scripts/import_places.py](file:///c:/Users/smara/Desktop/o-travelz/scripts/import_places.py)) safely manage canonical place records without destructive table drops.
   - All `PlaceImage` records map directly to verified canonical destinations, causing zero test failures.

---

## 4. Cloud Dependency & Private Proxy Architecture

1. **Private Azure Access**:
   - The Azure Storage Account `stotravelzprod` enforces `AllowBlobPublicAccess = false`. Direct browser requests to the storage URL return HTTP 403 Forbidden.
   - Images are delivered via the authenticated backend proxy (`GET /api/v1/images/{storage_key}`) using `DefaultAzureCredential` (Entra ID).
2. **Local Offline Mode**:
   - Setting `STORAGE_BACKEND=local` allows complete offline development without cloud credentials.

---

## 5. Non-Blocking Framework Warnings

1. **Pydantic v2 Configuration Deprecation**:
   - `backend/app/core/config.py` raises 1 deprecation warning (`PydanticDeprecatedSince20: Support for class-based config is deprecated, use ConfigDict instead`).
   - This warning does not affect runtime execution or contract validation.
