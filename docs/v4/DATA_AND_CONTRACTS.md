# O-TRAVELZ V4 — Data Entities, Schemas & API Contracts

> **Authoritative Data Specification**  
> Database Engine: **Aiven Managed PostgreSQL 16 + PostGIS 3.4**  
> Seed & Migration Pipeline: **Git Canonical Datasets (`data/`) + Alembic Migrations + `scripts/bootstrap_database.py`**  
> API Contract Standard: **OpenAPI 3.1 Generated from FastAPI Pydantic V2 Schemas**  
> Document Version: `4.0.0` | Last Updated: `2026-09-04`

---

## 1. Verified Bootstrap Database Inventory `[CURRENT]`

When the canonical database bootstrap script (`scripts/bootstrap_database.py`) executes against PostgreSQL/PostGIS, the following exact entity counts are seeded and verified:

| Entity / Layer | Bootstrap Record Count | Provenance & Validation Gate | Status |
|---|---|---|---|
| **Places / Destinations** | **204** | Master catalog across all 30 districts; verified WGS84 coordinates | `[CURRENT]` |
| **Categories** | **23** | Canonical taxonomy (Monument, Temple, Craft Village, Beach, etc.) | `[CURRENT]` |
| **Interests** | **12** | Travel intent tags (Architecture, Heritage, Wildlife, Handlooms, etc.) | `[CURRENT]` |
| **Transport Providers** | **3** | CRUT (Mo Bus), OSRTC (Ama Bus), Indian Railways | `[CURRENT]` |
| **Transit Routes** | **154** | Official urban & intercity transit corridors | `[CURRENT]` |
| **Transit Stops** | **1,430** | Verified transit network stops across 5 regions | `[PROMOTED - WAVE C4]` |
| **Geocoded Stops** | **173** | High-confidence audited coordinates (103 official + 70 geospatial) | `[PROMOTED - WAVE C4]` |
| **Unresolved Stops** | **1,257** | Legitimate stops with official service area locality (strictly **no fabrication**) | `[PROMOTED - WAVE C4]` |
| **Route-Stops (Sequences)** | **1,487** | Ordered topological stop sequences per route | `[CURRENT]` |
| **Schedule Trip Groups** | **302** | Timetable frequency blocks (weekday, weekend, peak) | `[CURRENT]` |
| **Scheduled Departures** | **5,553** | Individual departure timestamps mapped to IST blocks | `[CURRENT]` |
| **Verified Place Images** | **70** | Passed strict multi-tier WebP pipeline; zero missing images in public catalog | `[CURRENT]` |
| **Route Intelligence Records** | **154** | High-level route characteristics, frequency, operating hours | `[CURRENT]` |
| **Corridors** | **154** | Geographic highway & arterial transit corridors | `[CURRENT]` |
| **Stop Intelligence Records** | **1,487** | Interchange hub tags, transfer flags, accessibility status | `[CURRENT]` |
| **Evidence Citations** | **11** | Official government gazettes, CRUT publications, research papers | `[CURRENT]` |
| **EXACT Verified Routes** | **$\ge 1$** | Route 12 fully verified with ground-truth GPS stop sequences | `[CURRENT]` |

---

## 2. Core Entity Data Models

### 2.1 Destination / Place Schema (`app.models.place.Place`)
```sql
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id),
    description TEXT,
    location GEOGRAPHY(Point, 4326),
    district VARCHAR(100) NOT NULL,
    avg_visit_minutes INTEGER DEFAULT 60,
    price_tier VARCHAR(16),
    rating NUMERIC(2,1),
    rating_count INTEGER,
    rating_source VARCHAR(64),
    opening_hours_source VARCHAR(64),
    source VARCHAR(255),
    verified_at TIMESTAMPTZ,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'VERIFIED_OFFICIAL',
    contact_phone VARCHAR(64),
    emergency_phone VARCHAR(64),
    address TEXT,
    cuisine VARCHAR(128),
    highway_corridor VARCHAR(128),
    food_category VARCHAR(64),
    localized_names JSON,
    confidence VARCHAR(16),
    last_verified_at TIMESTAMPTZ
);
CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_places_district ON places(district);
CREATE INDEX idx_places_confidence ON places(confidence);
```

### 2.2 Normalized Cross-Entity Relationships (`app.models.entity_relationship.EntityRelationship`) `[CURRENT]`
```sql
CREATE TABLE entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_type VARCHAR(32) NOT NULL,
    source_entity_id UUID NOT NULL,
    target_entity_type VARCHAR(32) NOT NULL,
    target_entity_id UUID NOT NULL,
    relationship_type VARCHAR(64) NOT NULL,
    confidence VARCHAR(16), -- Never defaulted to HIGH; must be computed or assigned from evidence
    provenance VARCHAR(255),
    properties JSON,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_entity_relationship UNIQUE (
        source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type
    )
);
CREATE INDEX ix_entity_rel_source ON entity_relationships(source_entity_type, source_entity_id);
CREATE INDEX ix_entity_rel_target ON entity_relationships(target_entity_type, target_entity_id);
CREATE INDEX ix_entity_rel_type ON entity_relationships(relationship_type);
```

### 2.3 Canonical Media Registry & Entity Association `[CURRENT]`
```sql
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_type VARCHAR(16) NOT NULL DEFAULT 'image', -- 'image' | 'video' | 'audio'
    content_sha256 VARCHAR(64) UNIQUE NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    width INTEGER,
    height INTEGER,
    duration_ms INTEGER,
    storage_backend VARCHAR(32) NOT NULL DEFAULT 'local',
    storage_key VARCHAR(255) UNIQUE NOT NULL,
    variants JSON,
    perceptual_hash VARCHAR(64),
    license VARCHAR(64),
    creator VARCHAR(128),
    attribution VARCHAR(255),
    source_url VARCHAR(512),
    verification_status VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE entity_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(32) NOT NULL,
    entity_id UUID NOT NULL,
    media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    association_type VARCHAR(32) NOT NULL DEFAULT 'primary', -- 'primary' | 'gallery' | 'hero' | 'thumbnail'
    sort_order INTEGER NOT NULL DEFAULT 0,
    alt_text VARCHAR(255),
    caption VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_entity_media_assoc UNIQUE (entity_type, entity_id, media_asset_id, association_type)
);
CREATE INDEX ix_entity_media_entity ON entity_media(entity_type, entity_id);
CREATE INDEX ix_entity_media_asset ON entity_media(media_asset_id);
```
> Note: `place_images` is preserved as a legacy compatibility store for existing client endpoints and bootstrap invariant checking. `media_assets` serves as the sole canonical registry.

### 2.4 Living Heritage & Artisan Schema `[PLANNED]`
```sql
CREATE TABLE craft_traditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    gi_tagged BOOLEAN DEFAULT FALSE,
    gi_application_number VARCHAR(64),
    historical_origins TEXT,
    primary_materials TEXT[],
    canonical_region VARCHAR(64)
);

CREATE TABLE artisan_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tradition_id UUID REFERENCES craft_traditions(id),
    village_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    location GEOGRAPHY(Point, 4326),
    estimated_artisan_households INTEGER,
    visitor_guidelines TEXT,
    best_visiting_months VARCHAR(64)
);
```

### 2.3 Transit Network Schema (`app.models.transport.*`)
```sql
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES transport_providers(id),
    route_number VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    origin_name VARCHAR(255),
    destination_name VARCHAR(255),
    service_area VARCHAR(100),
    geometry GEOGRAPHY(LineString, 4326)
);

CREATE TABLE stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    location GEOGRAPHY(Point, 4326),
    coordinate_provenance VARCHAR(64), -- 'OFFICIAL', 'GEOCODED', 'UNRESOLVED'
    localized_names JSON
);
```

### 2.6 Universal Localized Entity Identity Contract `[CURRENT]`
Every domain entity (Place, Stop, CraftTradition, ArtisanCluster, RailwayStation) supports the universal localization contract:
```json
{
  "en": "Konark Sun Temple",
  "or": "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
  "hi": "कोणार्क सूर्य मंदिर"
}
```
* **Python**: `app.schemas.localization.LocalizedNames` (with `or` alias for Odia and `resolve(lang)`).
* **TypeScript**: `export interface LocalizedNames { en: string; or?: string | null; hi?: string | null; }`.
* **Kotlin Multiplatform**: `com.otravelz.shared.i18n.LocalizedNames(val en: String, val orName: String? = null, val hi: String? = null)`.
* **Fallback Contract**: Always resolves to `en` if the requested language or script translation is unavailable.


---

## 3. OpenAPI 3.1 Contract Pipeline

To guarantee contract safety between the Python FastAPI backend and client platforms:

```
FastAPI Pydantic V2 Schemas (backend/app/schemas/)
                      │
                      ▼
            GET /api/openapi.json
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
Web Client (frontend/src/types/)   Mobile Shared Models (mobile/shared/)
Generated TypeScript Types          Kotlinx Serialization Data Classes
```

### Key API Endpoints & Request/Response Shapes

#### 1. Map Projection: `POST /api/map/projection`
* **Purpose**: Pure deterministic projection of backend entities into GeoJSON WGS84 features.
* **Request**:
  ```json
  {
    "requested_features": [
      {"entity": "place", "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"},
      {"entity": "stop", "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"}
    ],
    "requested_hops": []
  }
  ```
* **Response**:
  ```json
  {
    "features": [
      {
        "feature_type": "place",
        "canonical_ref": {"entity": "place", "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"},
        "geometry_status": "available",
        "geometry": {"type": "Point", "coordinates": [85.8245, 20.2961]},
        "name": "Master Canteen Square",
        "category": "transit_hub",
        "region": "Capital Region"
      }
    ],
    "relationships": [],
    "unavailable_items": []
  }
  ```

#### 2. Spatial Place Search: `GET /api/places`
* **Query Parameters**: `search`, `district`, `category`, `interest`, `near_lat`, `near_lon`, `radius_km`, `limit`, `offset`.
* **Response**: List of `PlaceDetailResponse` items with verified coordinates, multilingual tags, and image URLs.

#### 3. Multimodal Hop: `POST /api/transport/hop`
* **Query Arguments**: `origin_place_id`, `destination_place_id`, `departure_time`.
* **Response**: `TransportHopContract` containing walking legs, transit routes, scheduled departure times, and canonical hub transfers.
