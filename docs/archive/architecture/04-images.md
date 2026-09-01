# O-Travelz Image Architecture & Ingestion Pipeline

Status: Canonical Image Pipeline Specification (Phase 3.1 & 3.2 Azure Readiness)

This document describes the destination photography data contract, provenance requirements, optimization pipeline, and storage abstractions for the O-Travelz platform.

---

## Architectural Principles

1. **Strict Provenance Boundary**: Every ingested image must have verifiable legal provenance (permissive license, creator, source URL, and complete attribution statement). Unattributed or ambiguous imagery is rejected at the manifest boundary.
2. **Provider-Neutral Storage Abstraction**: The core application and models do not depend on cloud-specific SDKs. Asset storage operates via the `ImageStorage` abstraction with `LocalImageStorage` (offline local development/testing) and `AzureBlobImageStorage` (cloud production).
3. **Deterministic Idempotency**: All image assets are identified by content SHA-256 hashes and stored under deterministic keys (`places/{place_id}/{hash_prefix}/{variant}.webp`). Re-running ingestion is a safe, zero-cost no-op.
4. **Responsive Standardized Variants**: Raw images are converted into modern WebP format across three standard UI breakpoints (`hero`, `card`, `thumbnail`) while strictly preserving aspect ratio without distortion.
5. **Private Storage by Default**: Microsoft security best practices are enforced: anonymous/public blob access is disabled by default on Azure Blob storage.
6. **Local Fallback Continuity**: During transition, `frontend/src/utils/imageService.ts` remains active as client-side fallback.

---

## Data Model & Manifest Contract

### Manifest Schema (`data/images/sources/manifest.json`)

Each manifest record requires:

```json
{
  "place_id": "place_bbsr_001",
  "source_url": "https://upload.wikimedia.org/wikipedia/commons/4/47/Lingaraj_Temple_Bhubaneswar.jpg",
  "source_name": "Wikimedia Commons",
  "creator": "Subhashree Dash",
  "license": "CC BY-SA 4.0",
  "attribution": "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
  "title": "Lingaraj Temple Kalinga Deula",
  "alt_text": "11th-century Lingaraj Temple towering sandstone deula spire in Old Town Bhubaneswar",
  "is_primary": true,
  "sort_order": 1,
  "retrieval_timestamp": "2026-08-19T10:00:00Z"
}
```

### Approved License Whitelist

- `CC0` (Public Domain Dedication)
- `Public Domain`
- `CC BY` (`CC BY 4.0`, `CC BY 3.0`, `CC BY 2.0`)
- `CC BY-SA` (`CC BY-SA 4.0`, `CC BY-SA 3.0`, `CC BY-SA 2.0`)
- `Unsplash Free License` (requires explicit creator, source, and attribution)

---

## Standard Image Variants

| Variant | Target Max Dimensions | Format | Quality | Resampling Method | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`original`** | Up to 1920x1080 | WebP | q=90 | `LANCZOS` | Fullscreen modal view / high-res archive |
| **`hero`** | Max 1280x720 | WebP | q=80 | `LANCZOS` | PlaceDetailsModal header, Coverflow 3D center card |
| **`card`** | Max 640x480 | WebP | q=80 | `LANCZOS` | Destinations catalog cards, Itinerary stop cards |
| **`thumbnail`**| Max 320x240 | WebP | q=80 | `LANCZOS` | PhotoGallery thumbnail strip, Map pin popups |

---

## Azure Storage Architecture & Security Model

```text
Development / Local Testing:
React (Browser) → FastAPI → ImageStorage → LocalImageStorage → ./data/images

Production Cloud Deployment:
React (Browser) → FastAPI → ImageStorage → AzureBlobImageStorage → Azure Blob Storage (Private Container)
```

### Authentication Model
- **Production**: Microsoft Entra ID with Managed Identity / Workload Identity.
  - Ingestion role: `Storage Blob Data Contributor`
  - Read-only delivery role: `Storage Blob Data Reader`
- **Local Developer**: `DefaultAzureCredential` (Azure CLI / developer login) or environment variables (`AZURE_STORAGE_ACCOUNT_NAME` + `AZURE_STORAGE_ACCOUNT_KEY` / `AZURE_STORAGE_CONNECTION_STRING`).

### Storage Account Configuration
- **Resource Group**: `otravelz-rg`
- **SKU**: Standard General-Purpose v2, Locally Redundant Storage (`Standard_LRS`)
- **Container**: `otravelz-images` (Private access; anonymous blob public access disabled)
- **Zero Compute Cost**: Ingestion and Pillow resizing run locally or on-demand. No always-on compute (Functions/Container Apps/Cognitive Search) is provisioned.

---

## Ingestion CLI Usage (`scripts/ingest_place_images.py`)

```bash
# Validate manifest without writing files or database records (Dry-Run)
python scripts/ingest_place_images.py --manifest data/images/sources/manifest.json --dry-run

# Run full ingestion using local storage (default)
python scripts/ingest_place_images.py

# Ingest single place or provider
python scripts/ingest_place_images.py --place place_puri_001
python scripts/ingest_place_images.py --provider "Wikimedia Commons"

# Force re-ingestion and overwrite existing variants
python scripts/ingest_place_images.py --force

# Ingest to Azure Blob Storage
python scripts/ingest_place_images.py --storage-backend azure
```

## Azure Live Connectivity Smoke Test (`scripts/azure_storage_smoke_test.py`)

```bash
# Run connectivity smoke test against configured Azure Storage container
python scripts/azure_storage_smoke_test.py
```
