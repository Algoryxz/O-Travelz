# O-TRAVELZ V4 — Media Pipelines, Language & Editorial Voice

> **Authoritative Media & Localization Specification**  
> Visual Rule: **NO VERIFIED IMAGE = NO PUBLIC DESTINATION**  
> Languages Supported: **English (en), Odia (or), Hindi (hi)**  
> Editorial Principle: **Cultural Gravity, Editorial Restraint, Authentic Provenance**  
> Document Version: `4.0.0` | Last Updated: `2026-09-04`

---

## 1. Photographic & Image Pipeline

### 1.1 The Publishability Gate
A destination may exist in staging or research datasets, but **it must not appear in the production public catalog without at least one verified, high-quality, authentic photograph**.

### 1.2 Multi-Tier WebP Asset Standard
Every published destination under `data/images/places/<place_id>/<hash>/` is pre-processed into four WebP representations:

| Image Tier | Max Dimensions | Target Size | Compression | Client Purpose |
|---|---|---|---|---|
| `hero.webp` | $1920 \times 1080\text{ px}$ | $150\text{ KB} - 350\text{ KB}$ | WebP (q=82) | Full-width editorial banners, carousel backgrounds |
| `card.webp` | $800 \times 600\text{ px}$ | $60\text{ KB} - 120\text{ KB}$ | WebP (q=78) | Explore grid cards, itinerary day cards |
| `thumbnail.webp` | $300 \times 225\text{ px}$ | $15\text{ KB} - 35\text{ KB}$ | WebP (q=72) | Map popovers, search dropdown items, list rows |
| `original.webp` | Master resolution | Max $2.5\text{ MB}$ | WebP (q=90) | High-res full-screen lightbox / zoom inspector |

### 1.3 Strict Provenance & License Tracking
Each image record in PostgreSQL (`place_images`) and the Git manifest (`data/images/manifest.json`) tracks:
* `license`: Creative Commons (CC BY, CC BY-SA), Public Domain, or Direct Algoryxz Field Photo.
* `source_url`: Verifiable primary source URL (Wikimedia Commons, official archive).
* `attribution`: Exact photographer credit and institution.
* `verification_notes`: Verification rationale confirming the photo depicts the genuine Odisha landmark.

### 1.4 Canonical Media Registry Architecture (`media_assets` & `entity_media`) `[CURRENT]`
Introduced in Wave A1 (ADR-003) to eliminate asset duplication and support all domain entity types:
* **Single Source of Truth**: All media assets (photography, video, audio) are uniquely registered in `media_assets` addressed by content SHA-256 (`content_sha256`).
* **Multi-Entity Associations**: The `entity_media` table links media assets to places, transit stops, artisan clusters, or craft traditions with explicit roles (`primary`, `gallery`, `hero`, `thumbnail`).
* **Verification Status Model**: Every media record enforces a photographic truth gate:
  - `EXACT_LOCATION_VERIFIED`: Directly captured at and verified against the specific landmark.
  - `RELATED_LOCATION`: Captured within the immediate precinct/corridor, clearly labeled.
  - `TECHNICAL_VECTOR`: Illustrative or architectural vector representation.
  - `UNVERIFIED`: In research pipeline; strictly quarantined from public catalog.
  - `REJECTED`: Fails authentic Odisha provenance gates; never served.
* **Compatibility Layer**: Legacy `place_images` table is maintained as an operational projection for legacy clients while `media_assets` serves as the authoritative media registry.

---


## 2. Cinematic Video & Heritage 3D Pipeline Design

### 2.1 Video Pipeline Architecture
To deliver immersive cinematic previews without introducing fragile external dependencies or uncontrolled billing:

```
                      Video Preview Request (/api/v1/places/{id}/video)
                                            │
                                            ▼
                           Does active VIDEO_PROVIDER exist?
                                    (kling / veo / runway)
                                  ┌─────────┴─────────┐
                             Yes  │                   │  No / Key Unset
                                  ▼                   ▼
                      Generate Dynamic Clip    Serve Audited Curated Clip
                      (Timeout 15s budget)     (data/video/places/{id}.mp4)
                                  │                   │
                                  └─────────┬─────────┘
                                            ▼
                              Client Stream: H.264 / WebM
```

* **Provider Configuration**: Swappable via environment variables (`VIDEO_PROVIDER`: `kling`, `veo`, `runway`, or `curated`).
* **The Curated Zero-Cost Fallback**: When video provider credentials are unset or the external API is unreachable, the system automatically serves verified, curated Odisha drone and landscape footage from local storage / CDN. **No broken video states or spinning loaders are permitted in production.**

### 2.2 3D Heritage Model Architecture
* **Supported Formats**: Compact WebGL-compatible binary glTF (`.glb`) models and Gaussian Splats.
* **Provider Chain**: `tripo` (Primary) $\rightarrow$ `meshy` (Secondary) $\rightarrow$ `curated` (Audited local 3D assets in `data/models3d/`).
* **Render Pipeline**: Lightweight Three.js canvas on Web (`HeritageSceneViewer.tsx`) and SceneKit on iOS.

---

## 3. Multilingual Architecture & Odia Localization

### 3.1 Three-Language Foundation
O-TRAVELZ treats Odia (`or`) as a first-class language alongside English (`en`) and Hindi (`hi`):
* **English (`en`)**: Primary administrative and global travel language.
* **Odia (`or`)**: Indigenous state language, preserving authentic colloquial names, shrine titles, and artisan vocabulary.
* **Hindi (`hi`)**: Regional domestic travel accessibility.

### 3.2 Canonical Multilingual Taxonomy (`backend/app/data/multilingual_taxonomy.py`)
All 30 districts, 23 categories, and 12 interests are mapped bidirectionally across scripts:
```python
# Sample District Mapping
DISTRICTS = {
    "Puri": {"or": "ପୁରୀ", "hi": "पुरी"},
    "Mayurbhanj": {"or": "ମୟୂରଭଞ୍ଜ", "hi": "मयूरभंज"},
    "Sambalpur": {"or": "ସମ୍ବଲପୁର", "hi": "संबलपुर"}
}
```

### 3.3 Mobile Shared Localization Keys (`LocalizationKeys.kt`)
Kotlin Multiplatform standardizes all customer-facing strings across platforms:
* `LABEL_VERIFIED_OFFICIAL`: "Verified Official" / "ସରକାରୀ ସତ୍ୟାପିତ"
* `LABEL_SCHEDULED`: "Scheduled Departure" / "ନିର୍ଦ୍ଧାରିତ ସମୟ"
* `LABEL_FIRST_MILE_WALK`: "Reasonable Walk" / "ପାଦଚଲା ଦୂରତା"
* `LABEL_FIRST_MILE_AUTO`: "Short Auto Recommended" / "ଅଟୋ ରିକ୍ସା ଉପଯୁକ୍ତ"

### 3.4 Universal Localized Entity Identity Contract `[CURRENT]`
Introduced in Wave A1 (ADR-002) for consistent multilingual naming:
* **Contract**:
  ```json
  {
    "en": "Konark Sun Temple",
    "or": "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
    "hi": "कोणार्क सूर्य मंदिर"
  }
  ```
* **Supported Layers**:
  - Python Pydantic (`app.schemas.localization.LocalizedNames`)
  - TypeScript (`frontend/src/types/api.ts`)
  - Kotlin Multiplatform (`mobile/shared/src/commonMain/kotlin/.../LocalizedNames.kt`)
* **Deterministic Fallback**: Whenever an Odia (`or`) or Hindi (`hi`) script translation is absent, the resolver falls back to the canonical English (`en`) name without breaking the UI.

---


## 4. Editorial Voice & Tone Guidelines

### 4.1 Voice Attributes
* **Authoritative**: Facts are stated with quiet confidence based on historical and geographical evidence.
* **Calm & Unhurried**: We do not rush the traveler with countdown timers or synthetic urgency.
* **Culturally Grounded**: We honor local traditions, temple customs, and artisan livelihoods with dignity.
* **Exact**: Distances are qualified (`straight-line`), times include time zones (`IST`), and schedules cite agencies (`CRUT`).

### 4.2 Prohibited Copy Practices
* **No Marketing Hyperbole**: Discard *"unmatched beauty"*, *"breathtaking wonderland"*, or *"unforgettable magic"*.
* **No Synthetic AI Voice**: Never address the user as an AI persona (*"As an AI, I recommend..."*). Speak as the O-TRAVELZ platform.
* **Punctuation Standard**: Zero em dash (`—`) characters in customer-facing UI copy. Use periods, colons, or clean line breaks.
