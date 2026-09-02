# O-TRAVELZ V4 — Artisans, Crafts & Living Cultural Heritage Data Model

> **Authoritative Specification for the Cultural Heritage, Crafts & Artisan Domain**  
> Focus: **Travel-Oriented Cultural Discovery (Visit, Learn, Meet, Experience, Support Locally)**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Vision: First-Class Cultural Discovery

Odisha's cultural identity is deeply rooted in centuries-old living traditions, handloom weaving clusters, and indigenous craft villages. O-TRAVELZ V4 elevates **Artisans and Living Crafts** into a **first-class travel domain alongside monuments and natural landmarks**.

### Core Philosophy
* **Travel-Oriented Discovery**: The focus is on *visiting* heritage clusters, *meeting* master craftspeople, *witnessing* demonstrations, *understanding* the cultural lineage, and *purchasing directly from source communities*.
* **Not an E-Commerce Catalog**: We do not build an online shopping cart. We build an immersive cultural guide with verified coordinates, visit hours, demonstration availability, and ethical visitor guidelines.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CRAFT TRADITION (GI Heritage)                   │
│         (e.g., Pattachitra, Cuttack Tarakasi, Sambalpuri Ikat)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ARTISAN CLUSTER / VILLAGE                         │
│           (e.g., Raghurajpur, Pipili, Alanda, Sadeibareni)             │
│            • Verified Coordinates & Travel Directions                  │
│            • Visitor Amenities (Parking, Guides, Restrooms)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    MASTER ARTISAN / LIVING WORKSHOP                    │
│            • Master Craftsperson & Workshop Bio                        │
│            • Demonstration & Interactive Workshop Offerings            │
│            • Public Contact & Visiting Policies                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Domain Entities

### 2.1 `CraftTradition` (The Heritage Lineage)
Represents the overarching art form or handicraft discipline.
* `id`: Unique identifier (e.g. `craft_pattachitra`, `craft_tarakasi_silver`, `craft_sambalpuri_ikat`).
* `name`: Official craft name.
* `odia_name`: Native Odia script name (e.g. `ପଟ୍ଟଚିତ୍ର`, `ତାରାକସି`).
* `category`: `WEAVING_TEXTILE`, `METAL_FILIGREE`, `STONE_CARVING`, `PAINTING_SCROLL`, `POTTERY_TERRACOTTA`, `WOOD_HORN`, `DHOKRA_CASTING`, `APPLIQUE`.
* `gi_tag_certified`: Boolean indicator if the craft holds a registered Geographical Indication (GI) tag.
* `gi_registration_year`: Year of GI certification (e.g. 2008 for Pattachitra, 2024 for Cuttack Rupa Tarakasi).
* `historical_background`: Sourced cultural narrative (min 150 chars).
* `raw_materials`: Sourced materials (e.g. Tussar silk, natural mineral pigments, fine silver wire).

---

### 2.2 `ArtisanCluster` / `CulturalVillage` (The Place to Visit)
Represents geographic enclaves and heritage craft villages.
* `id`: Cluster ID (e.g. `cluster_raghurajpur`, `cluster_pipili_applique`, `cluster_sadeibareni_dhokra`).
* `name`: Cluster / Village name.
* `village_name`: Specific revenue village / gram panchayat.
* `district`: One of 30 official Odisha districts.
* `coordinates`: Verified `Point(lat, lon)`.
* `primary_craft_ids`: Array of craft IDs practiced in the cluster.
* `cluster_type`: `HERITAGE_VILLAGE`, `URBAN_GUILD_STREET`, `TRIBAL_HAMLET`, `COOPERATIVE_SOCIETY`.
* `visitor_guidelines`: Ethical tourism norms (photography etiquette, direct artisan tipping/fair payment).
* `amenities`: Structured flags (`has_parking`, `has_restrooms`, `has_guided_walks`, `has_tea_stalls`).

---

### 2.3 `ArtisanWorkshop` / `Artisan` (The Living Creator)
Represents verified workshops, master artists, and artisan families open to travelers.
* `id`: Unique artisan ID (e.g. `artisan_raghu_01`).
* `master_artisan_name`: Name of lead artist/craftsperson.
* `workshop_name`: Family workshop or collective name.
* `cluster_id`: Foreign key referencing `ArtisanCluster`.
* `craft_id`: Foreign key referencing `CraftTradition`.
* `national_award_winner`: Boolean indicating National Award / Shilp Guru / Padma recognition.
* `public_phone`: Verified contact number for visit coordination (if publicly authorized).
* `allows_visitors`: Boolean indicating if travelers may visit the studio.
* `demonstration_available`: Boolean indicating if craft-making is demonstrated live.
* `hands_on_workshop`: Boolean indicating if short visitor workshops/lessons are hosted.
* `languages_spoken`: List of languages (`["Odia", "Hindi", "English"]`).
* `verification_status`: `VERIFIED_FIELD_VISIT`, `VERIFIED_COOPERATIVE`, `RESEARCHED`.

---

## 3. The 12 Canonical Odisha Craft Domains (V4 Research Taxonomy)

| Craft Domain | GI Status | Primary Clusters & Districts | Cultural Lineage & Traveler Significance |
|---|---|---|---|
| **1. Pattachitra** | **GI Tagged** | Raghurajpur, Dandasahi (Puri) | Ancient cloth-based scroll painting using 100% natural stone/vegetable pigments and tamarind seed gum. |
| **2. Pipili Appliqué** | **GI Tagged** | Pipili (Puri) | Intricate hand-stitched cloth work historically used for Jagannath Rath Yatra canopies, umbrellas, and trimmings. |
| **3. Cuttack Silver Filigree (Rupa Tarakasi)** | **GI Tagged** | Cuttack Heritage Guilds (Alisha Bazar, Mansinghpatna) | 500-year-old delicate metalwork drawing silver into hair-thin wires to create jewelry, Durga Puja medhas, and Konark chariots. |
| **4. Sambalpuri Bandha (Ikat)** | **GI Tagged** | Bargarh, Barpali, Sonepur (Subarnapur) | World-renowned warp and weft tie-dye weaving creating intricate geometric and temple borders in cotton and silk. |
| **5. Bomkai Cotton & Silk** | **GI Tagged** | Bomkai (Ganjam), Sonepur | Traditional handloom weaving with extra-weft patterns featuring nature, fish, and temple architectural motifs. |
| **6. Kotpad Natural Dye Handloom** | **GI Tagged** | Kotpad (Koraput) | Mirgan tribal textile dyed using natural roots of the Aal tree (*Morinda citrifolia*), non-toxic, eco-friendly deep maroon and brown. |
| **7. Stone Carving (Pathara Kama)** | Researched | Puri, Bhubaneswar, Lalitgiri, Khiching | Living descendants of the Konark and Lingaraj temple sculptors working on chlorite, soapstone, and sandstone. |
| **8. Palm-Leaf Engraving (Tala Pattachitra)** | Researched | Raghurajpur (Puri), Nayagarh | Incising delicate lines onto cured dried palm leaves (*tala patra*) using iron styluses (*lekhani*) and natural lampblack. |
| **9. Dhokra Brass Metal Casting** | **GI Tagged** | Sadeibareni (Dhenkanal), Kuliana (Mayurbhanj), Rayagada | 4,000-year-old non-ferrous lost-wax bell-metal casting practiced by indigenous metalsmiths. |
| **10. Terracotta & Clay Pottery** | Researched | Barapali (Bargarh), Gujarpur (Cuttack) | Traditional terracotta roof tiles, grain jars, elephant figurines, and eco-friendly home decor. |
| **11. Horn Craft (Gosingha Kama)** | Researched | Paralakhemundi (Gajapati), Cuttack | Artisans hand-carving polished cattle and buffalo horns into cranes, birds, and comb artifacts. |
| **12. Tribal Textiles & Dongria Weaves** | **GI Tagged** | Niyamgiri Hills, Rayagada, Koraput | Traditional *Kapdaganda* shawls embroidered by Dongria Kondh women with symbolic triangular temple and hill motifs. |

---

## 4. Integration into Itinerary Planner & Maps

1. **Map Layer**: Toggleable `Artisan & Craft Clusters` pin layer with terracotta/ochre badge styling.
2. **Itinerary Synergy**: When a traveler visits Puri or Konark, the planner suggests a 1.5-hour cultural detour to Raghurajpur or Pipili with estimated transit/auto durations.
3. **Evidence & Provenance**: Every workshop card displays explicit provenance: `Verified Cooperative · District Handloom Office Aug 2026`.
