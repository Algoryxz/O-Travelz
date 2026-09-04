# O-TRAVELZ V4 — Travel Graph Data Model & Schema

> **Authoritative Specification for the Multimodal Travel & Cultural Graph**  
> Storage Engine: **PostgreSQL 16 + PostGIS 3.4 (Relational-Geospatial Graph)**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Architectural Vision: From Flat Lists to a Travel Graph

O-TRAVELZ V4 transitions from an isolated list of destinations to a **connected multimodal travel graph**. 

Travelers do not experience Odisha as disconnected points; they experience it as an interconnected web of:
* **Arrival Hubs** (Airports, Railway Stations, Intercity Bus Terminals)
* **Local Transit & First-Mile** (Mo Bus / Ama Bus stops, routes, walking corridors)
* **Cultural Traditions & Artisans** (Villages, workshops, living craft traditions)
* **Destinations & Sacred Sites** (Temples, heritage monuments, beaches, wildlife sanctuaries)
* **Hospitality & Essentials** (Regional cuisine, verified hotels, hospitals, ATMs)

```
┌─────────────┐       SERVED_BY       ┌──────────────┐      CONNECTED_TO     ┌──────────────┐
│   Airport   ├──────────────────────►│ Transit Route├──────────────────────►│ RailwayStation│
└──────┬──────┘                       └──────┬───────┘                       └──────┬───────┘
       │                                     │                                      │
       │ REACHABLE_VIA                       │ SERVED_BY                            │ REACHABLE_VIA
       ▼                                     ▼                                      ▼
┌─────────────┐       NEAR / PART_OF  ┌──────────────┐       NEAR            ┌──────────────┐
│  Artisan    ├──────────────────────►│ Destination  ├──────────────────────►│  Restaurant  │
│  Workshop   │                       │ / Heritage   │                       │   / Hotel    │
└──────┬──────┘                       └──────┬───────┘                       └──────────────┘
       │                                     │
       │ CREATED_BY                          │ LOCATED_IN
       ▼                                     ▼
┌─────────────┐                       ┌──────────────┐
│    Craft    │                       │  District /  │
│  Tradition  │                       │   Village    │
└─────────────┘                       └──────────────┘
```

---

## 2. Core Graph Node Taxonomy

| Node Type | Description & Domain | Primary Attributes | Geospatial Representation |
|---|---|---|---|
| **`Destination`** | Verified cultural/natural landmark (161+ places) | `id`, `slug`, `name`, `category`, `district`, `rating`, `open_hours` | `Point(lon, lat)` (SRID 4326) |
| **`Artisan`** | Master craftsperson, weaving collective, workshop | `id`, `name`, `craft_id`, `cluster_id`, `contact_public`, `visit_policy` | `Point(lon, lat)` |
| **`CraftTradition`**| Living heritage practice (Pattachitra, Silver Filigree) | `id`, `name`, `origin_district`, `gi_tag_status`, `description` | Non-spatial / Region geometry |
| **`ArtisanCluster`**| Craft village or artisan enclave (Raghurajpur, Pipili) | `id`, `name`, `district`, `village_name`, `visitor_amenities` | `Point(lon, lat)` / Polygon |
| **`Airport`** | Commercial aviation arrival hubs (Bhubaneswar, Jharsuguda) | `iata_code`, `icao_code`, `name`, `city`, `terminals`, `transit_access` | `Point(lon, lat)` |
| **`Flight`** | Scheduled flight route connecting Odisha hubs | `flight_number`, `carrier`, `origin_iata`, `dest_iata`, `frequency` | Non-spatial |
| **`RailwayStation`**| Major railway stations (Puri, BBS, Cuttack, Sambalpur) | `station_code`, `name`, `division`, `platforms`, `interchange_tier` | `Point(lon, lat)` |
| **`TrainService`** | Major express & passenger train services | `train_number`, `train_name`, `origin_code`, `dest_code`, `days_run` | Non-spatial |
| **`TransitStop`** | Canonical Mo Bus / Ama Bus stops (1,430 stops) | `stop_id`, `name`, `coordinate_status`, `is_interchange`, `district` | `Point(lon, lat)` (where verified) |
| **`TransitRoute`** | Official CRUT transit corridors (154 routes) | `route_id`, `route_number`, `origin_name`, `dest_name`, `service_area` | MultiLineString / Stop Array |
| **`Facility`** | Essential services (Hospitals, Police, Fuel, ATMs) | `id`, `name`, `facility_type`, `emergency_phone`, `is_24x7` | `Point(lon, lat)` |
| **`Hospitality`** | Verified restaurants, regional dining, accommodations | `id`, `name`, `cuisine_type`, `star_category`, `hygiene_rating` | `Point(lon, lat)` |
| **`CommunitySubmission`**| Staged contributions pending verification | `id`, `contributor_id`, `entity_type`, `review_status`, `payload` | `Point(lon, lat)` |

---

## 3. Core Graph Edge Taxonomy

| Edge Type | Source Node $\rightarrow$ Target Node | Semantic Meaning & Constraints | Weight / Properties |
|---|---|---|---|
| **`NEAR`** | Any Spatial Node $\rightarrow$ Any Spatial Node | Straight-line proximity calculated via PostGIS `ST_DistanceSphere`. | `distance_meters`, `is_straight_line = true` |
| **`SERVED_BY`** | Destination / Village $\rightarrow$ `TransitRoute` | Route stops within walking distance ($\le 1500\text{ m}$) of the place. | `stop_id`, `walking_distance_m`, `route_number` |
| **`CONNECTED_TO`**| `Airport` / `RailwayStation` $\rightarrow$ `TransitStop` | Physical interchange connecting intercity transport to local transit. | `transfer_type`, `walk_time_mins` |
| **`CREATED_BY`** | `CraftTradition` $\rightarrow$ `Artisan` / `Cluster` | Links a cultural craft practice to the living people and villages making it. | `lineage`, `experience_type` |
| **`LOCATED_IN`** | Any Node $\rightarrow$ `District` / `Village` | Administrative and geographic territorial hierarchy. | `district_name`, `subdivision` |
| **`PART_OF`** | Destination / Stop $\rightarrow$ `CuratedCircuit` | Membership in a themed tourist circuit (e.g. Golden Triangle). | `sequence_index`, `recommended_day` |
| **`RECOMMENDED_WITH`**| Destination $\rightarrow$ Restaurant / Craft Workshop | Grounded recommendation pairing visit with nearby authentic meal or craft. | `synergy_score`, `time_slot` |
| **`REACHABLE_VIA`** | Origin Hub $\rightarrow$ Target Destination | Complete multimodal path through transit, rail, flight, and first-mile legs. | `duration_mins`, `data_tier`, `modes[]` |

---

## 4. PostgreSQL / PostGIS Relational Graph Schema

```sql
-- 1. Geographical Districts
CREATE TABLE districts (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    region VARCHAR(32) NOT NULL, -- Eastern, Western, Southern, Northern
    headquarters VARCHAR(64),
    boundary_geom GEOMETRY(MultiPolygon, 4326)
);

-- 2. Craft Traditions
CREATE TABLE craft_traditions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL, -- Weaving, Metal, Stone, Painting, Pottery
    origin_district_id VARCHAR(32) REFERENCES districts(id),
    has_gi_tag BOOLEAN DEFAULT FALSE,
    gi_registration_year INT,
    cultural_significance TEXT NOT NULL,
    provenance_source VARCHAR(255)
);

-- 3. Artisan Clusters & Villages
CREATE TABLE artisan_clusters (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    village_name VARCHAR(128) NOT NULL,
    district_id VARCHAR(32) REFERENCES districts(id),
    primary_craft_id VARCHAR(64) REFERENCES craft_traditions(id),
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    description TEXT,
    visitor_amenities JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE
);

-- 4. Individual Artisans & Workshops
CREATE TABLE artisans (
    id VARCHAR(64) PRIMARY KEY,
    cluster_id VARCHAR(64) REFERENCES artisan_clusters(id),
    craft_id VARCHAR(64) REFERENCES craft_traditions(id),
    master_artisan_name VARCHAR(128) NOT NULL,
    workshop_name VARCHAR(128),
    national_award_winner BOOLEAN DEFAULT FALSE,
    phone_contact VARCHAR(32),
    allows_visitors BOOLEAN DEFAULT TRUE,
    demonstration_available BOOLEAN DEFAULT FALSE,
    coordinates GEOMETRY(Point, 4326),
    verification_status VARCHAR(32) NOT NULL DEFAULT 'RESEARCHED'
);

-- 5. Intercity Transport: Airports & Railway Stations
CREATE TABLE transit_hubs (
    id VARCHAR(64) PRIMARY KEY,
    hub_type VARCHAR(32) NOT NULL, -- AIRPORT, RAILWAY_STATION, INTERCITY_BUS_TERMINAL
    code VARCHAR(16) NOT NULL UNIQUE, -- BBI, JRG, KUR, CTC, PURI, etc.
    name VARCHAR(128) NOT NULL,
    district_id VARCHAR(32) REFERENCES districts(id),
    city VARCHAR(64) NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    facilities JSONB DEFAULT '{}',
    is_operational BOOLEAN DEFAULT TRUE
);

-- 6. Spatial Indexing
CREATE INDEX idx_artisan_clusters_geom ON artisan_clusters USING GIST(coordinates);
CREATE INDEX idx_artisans_geom ON artisans USING GIST(coordinates);
CREATE INDEX idx_transit_hubs_geom ON transit_hubs USING GIST(coordinates);
```

---

## 5. Graph Query Patterns

### Query 1: Find Artisans & Craft Clusters Near a Destination
```sql
SELECT 
    a.id, 
    a.master_artisan_name, 
    c.name AS craft_name, 
    cl.village_name,
    ROUND(ST_DistanceSphere(a.coordinates, d.coordinates)) AS distance_meters
FROM artisans a
JOIN craft_traditions c ON a.craft_id = c.id
JOIN artisan_clusters cl ON a.cluster_id = cl.id
CROSS JOIN places d
WHERE d.id = 'place_001' -- Konark Sun Temple
  AND ST_DistanceSphere(a.coordinates, d.coordinates) <= 25000 -- within 25 km
ORDER BY distance_meters ASC;
```

### Query 2: Multimodal First-Mile Link from Arrival Hub to Heritage Place
```sql
SELECT 
    hub.name AS arrival_hub,
    stop.canonical_name AS nearest_bus_stop,
    ROUND(ST_DistanceSphere(hub.coordinates, stop.coordinates)) AS hub_to_bus_stop_m,
    route.route_number,
    dest.name AS target_destination,
    ROUND(ST_DistanceSphere(dest_stop.coordinates, dest.coordinates)) AS bus_to_dest_m
FROM transit_hubs hub
JOIN transit_stops stop ON ST_DistanceSphere(hub.coordinates, stop.coordinates) <= 1000
JOIN route_stops rs_origin ON rs_origin.stop_id = stop.stop_id
JOIN transit_routes route ON rs_origin.route_id = route.route_id
JOIN route_stops rs_dest ON rs_dest.route_id = route.route_id AND rs_dest.sequence_number > rs_origin.sequence_number
JOIN transit_stops dest_stop ON rs_dest.stop_id = dest_stop.stop_id
JOIN places dest ON ST_DistanceSphere(dest_stop.coordinates, dest.coordinates) <= 1500
WHERE hub.code = 'BBI' AND dest.id = 'place_002';
```
