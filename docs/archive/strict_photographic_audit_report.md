# O-TRAVELZ — Strict Photographic Audit Report

**Audit date:** 2026-08-31  
**Auditor:** Akriti (Western Odisha researcher)  
**Standard:** REAL PHOTOGRAPH + EXACT LOCATION + VERIFIED SOURCE  
**Script:** `scripts/audit_photographic_registry.py`  
**Registry:** `data/images/sources/strict_photo_evidence_registry.json`

---

## Overall Summary

| Scope | Exact verified | Related only | Generic/rejected | Total |
|---|---:|---:|---:|---:|
| Production manifest | 50 | 0 | 0 | 50 |
| Round 2 Western | 7 | 6 | 8 | 21 |
| Round 2 Eastern | 14 | 6 | 1 | 21 |
| **TOTAL** | **71** | **12** | **9** | **92** |

**Production eligible (hero_image_eligible=True):** 71 of 92  
**Staging-only (no qualifying hero photo):** 21 of 92

---

## Classification Definitions

| Classification | Meaning | Hero photo eligible |
|---|---|---|
| `exact_location_verified` | Authentic camera photo clearly showing the named place | YES |
| `related_location_only` | Related to the destination but does not establish exact location | NO |
| `generic_image` | Unrelated, wrong district, wrong type, map, textile product, or complete mismatch | NO |

---

## Production Manifest (50 places)

All 50 entries carry `verification_status: VERIFIED_AUTHENTIC_PHOTOGRAPHY` in the local manifest. All are classified `exact_location_verified` with `hero_image_eligible: true`.

No anomalies detected in the production manifest.

---

## Round 2 Western Candidates

**7 of 21 have exact_location_verified status.**

### Verified (hero eligible)

| ID | Destination | District | Image file | Confidence |
|---|---|---|---|---|
| `round2_west_001` | Yogimath Rock Art Site | Nuapada | `Yogimath_Rock_Art.jpg` | high |
| `round2_west_002` | Sunabeda Wildlife Sanctuary | Nuapada | `River_Jonk_at_Beniadhus_in_Sunabeda.jpg` | medium |
| `round2_west_005` | Bargarh Dhanu Yatra Open-Air Arena | Bargarh | `Dhanu_Yatra.jpg` | medium |
| `round2_west_007` | Lankeswari Temple, Sonepur | Subarnapur | `Lankeswari_Thakurani_Sonepur_Subarnapur_Odisha.jpg` | high |
| `round2_west_008` | Khaliapali Matha (Santha Kabi Bhima Bhoi Pitha) | Subarnapur | `Bhima_Bhoi_memorial,_Khaliapali_temple.jpg` | high |
| `round2_west_018` | Gudguda Waterfall | Sambalpur | `Gudguda_waterfall_front_view.jpg` | high |
| `round2_west_020` | Vedvyas Temple & Confluence, Rourkela | Sundargarh | `Ved_Vyas,_Rourkela_-_1.jpg` | high |

### Rejected

**`round2_west_003`** — Patalganga Sacred Spring (Nuapada)  
Classification: `generic_image`  
Assigned file: `Dense_forests_still_exist_in_pockets_in_Sunabeda.jpg`  
Reason: NONE. File:Dense_forests_still_exist_in_pockets_in_Sunabeda.jpg (Satyesh.naik, CC BY-SA 4.0) is a generic forest landscape of the broader Sunabeda area. It does NOT depict the Patalganga rock spring, its kunds, or the spring outlet. No identifiable feature of the named destination is visible.

**`round2_west_004`** — Barpali Handloom Heritage Village (Bargarh)  
Classification: `generic_image` *(also reused in: round2_west_006)*  
Assigned file: `Sambalpuri_saree1.jpg`  
Reason: NONE. File:Sambalpuri_saree1.jpg (Rahul191313, CC BY-SA 4.0) is a product photograph of a Sambalpuri Ikat saree textile. It shows a woven product, not the physical weaving village, artisan workshops, or any built/natural feature of Barpali.

**`round2_west_006`** — Papanga Hill (Bargarh)  
Classification: `generic_image` *(also reused in: round2_west_004)*  
Assigned file: `Sambalpuri_saree1.jpg`  
Reason: NONE. File:Sambalpuri_saree1.jpg shows a Sambalpuri saree textile. Papanga Hill is a natural hilltop in Bheden block, Bargarh. COMPLETE MISMATCH: a saree textile photograph has no connection to a hill formation.

**`round2_west_009`** — Metakani Temple, Ullunda (Subarnapur)  
Classification: `related_location_only` *(also reused in: round2_west_007)*  
Assigned file: `Lankeswari_Thakurani_Sonepur_Subarnapur_Odisha.jpg`  
Reason: NONE FOR THIS DESTINATION. File:Lankeswari_Thakurani_Sonepur_Subarnapur_Odisha.jpg shows Lankeswari Temple in Sonepur. Metakani Temple is in Ullunda block of Subarnapur district - a different block, a different temple, a different shrine. Temple-for-temple substitution within the same district is explicitly disallowed.

**`round2_west_010`** — Maa Patneswari Temple, Patnagarh (Balangir)  
Classification: `generic_image` *(also reused in: round2_west_011, round2_west_012)*  
Assigned file: `ASI_signboard_for_Ranipur_Jharial_and_Inndralath_Temple.jpg`  
Reason: NONE. File:ASI_signboard_for_Ranipur_Jharial_and_Inndralath_Temple.jpg is the ASI signboard at Ranipur Jharial, Balangir. Maa Patneswari Temple is in Patnagarh - a different town in Balangir district, 90+ km from Ranipur Jharial. Wrong location (different town) and wrong subject type (signboard for another site).

**`round2_west_011`** — Indralath Brick Temple, Ranipur Jharial (Balangir)  
Classification: `related_location_only` *(also reused in: round2_west_010, round2_west_012)*  
Assigned file: `ASI_signboard_for_Ranipur_Jharial_and_Inndralath_Temple.jpg`  
Reason: PARTIAL SUPPORT ONLY. File:ASI_signboard_for_Ranipur_Jharial_and_Inndralath_Temple.jpg is the ASI site entrance signboard at Ranipur Jharial, which IS the correct archaeological complex. The signboard CONFIRMS site existence and the Indralath Temple name. However it does NOT show the actual 20m brick temple structure itself. A signboard is supporting evidence, not a hero photograph of an architectural monument.

**`round2_west_012`** — Saintala Chandi Temple Archaeological Site (Balangir)  
Classification: `generic_image` *(also reused in: round2_west_010, round2_west_011)*  
Assigned file: `ASI_signboard_for_Ranipur_Jharial_and_Inndralath_Temple.jpg`  
Reason: NONE. File:ASI_signboard_for_Ranipur_Jharial_and_Inndralath_Temple.jpg is the ASI signboard at Ranipur Jharial. Saintala Chandi Temple is in Saintala, Balangir - a completely different archaeological site. Wrong location, wrong site, signboard reused for a third time.

**`round2_west_013`** — Ulapgarh Fort & Rock Enclosure (Jharsuguda)  
Classification: `generic_image` *(also reused in: round2_west_016, round2_west_017, round2_west_018)*  
Assigned file: `Gudguda_waterfall_front_view.jpg`  
Reason: NONE. File:Gudguda_waterfall_front_view.jpg (Nvstudio989, CC BY-SA 4.0) shows Gudguda Waterfall in Sambalpur district. Ulapgarh Fort is a hilltop stone fortress in Jharsuguda district. Different district, wrong feature type (fort vs waterfall). Complete category and geographic mismatch.

**`round2_west_014`** — Kolabira Fort (Jharsuguda)  
Classification: `related_location_only` *(also reused in: round2_west_015, round2_west_019)*  
Assigned file: `Sambalpur.jpg`  
Reason: NONE. File:Sambalpur.jpg (Lingarajsahoo raj, CC BY-SA 4.0) is a panoramic photograph of Sambalpur town taken from Budharaja hilltop. Kolabira Fort is in Kolabira block of Jharsuguda district - a different district entirely. The Sambalpur panorama does not depict Kolabira Fort.

**`round2_west_015`** — Jhadeswar Temple & Cave, Jharsuguda (Jharsuguda)  
Classification: `related_location_only` *(also reused in: round2_west_014, round2_west_019)*  
Assigned file: `Sambalpur.jpg`  
Reason: NONE. File:Sambalpur.jpg shows Sambalpur town panorama. Jhadeswar Temple & Cave is in Jharsuguda town (Purana Basti area) - a different town in a different district. The panorama does not contain or depict Jhadeswar Temple.

**`round2_west_016`** — Gohira Dam & Reservoir (Deogarh)  
Classification: `generic_image` *(also reused in: round2_west_013, round2_west_017, round2_west_018)*  
Assigned file: `Gudguda_waterfall_front_view.jpg`  
Reason: NONE. File:Gudguda_waterfall_front_view.jpg shows Gudguda Waterfall in Sambalpur district. Gohira Dam is an earthen irrigation dam on the Gohira River in Deogarh district. Wrong district, wrong feature type (waterfall vs dam/reservoir).

**`round2_west_017`** — Kurudkut Waterfall & Historic Hydro Site (Deogarh)  
Classification: `related_location_only` *(also reused in: round2_west_013, round2_west_016, round2_west_018)*  
Assigned file: `Gudguda_waterfall_front_view.jpg`  
Reason: NONE. File:Gudguda_waterfall_front_view.jpg shows Gudguda Waterfall (Sambalpur). Kurudkut Waterfall is a different waterfall in Deogarh district. Both are waterfalls, but they are different falls in different districts. Waterfall A cannot serve as hero photo for Waterfall B.

**`round2_west_019`** — Budharaja Temple & Hill Park (Sambalpur)  
Classification: `related_location_only` *(also reused in: round2_west_014, round2_west_015)*  
Assigned file: `Sambalpur.jpg`  
Reason: PARTIAL SUPPORT ONLY. File:Sambalpur.jpg is a panoramic photograph of Sambalpur town taken FROM Budharaja Hill - the hill where Budharaja Temple sits. Photographer was at the right location. However the image shows the VIEW FROM the temple hill, NOT the temple structure itself. The temple building is not depicted.

**`round2_west_021`** — Tensa Hill Station & Nature Camp (Sundargarh)  
Classification: `generic_image` *(also reused in: round2_west_020)*  
Assigned file: `Ved_Vyas,_Rourkela_-_1.jpg`  
Reason: NONE. File:Ved_Vyas,_Rourkela_-_1.jpg shows Vedvyas Temple at the river confluence in Rourkela, Sundargarh. Tensa Hill Station is a hill station in Bonai Forest Division, Sundargarh at 800m elevation. Different destination type (temple vs hill station) and different geographic location within the same district.

---

## Round 2 Eastern Candidates

**14 of 21 have exact_location_verified status.**

### Verified (hero eligible)

| ID | Destination | District | Image file | Confidence |
|---|---|---|---|---|
| `round2_east_001` | Gahirmatha Marine Sanctuary | Kendrapara | `Olive_ridley_sea_turtle_with_satellite_transmitter_at_Gahirmatha_Beach.jpg` | high |
| `round2_east_002` | Hukitola Monument | Kendrapara | `Hukitola-3.jpg` | high |
| `round2_east_003` | Kanika Palace | Kendrapara | `Kanika_palace.jpg` | high |
| `round2_east_004` | Aul Palace | Kendrapara | `Aul_Palace.jpg` | high |
| `round2_east_006` | Biranchinarayan Sun Temple, Palia | Bhadrak | `Biranchinarayan_Temple.jpg` | high |
| `round2_east_007` | Maa Bhadrakali Temple | Bhadrak | `Bhadrakali_Mandir.jpg` | high |
| `round2_east_008` | Saranga Anantasayana Vishnu | Dhenkanal | `Anantasayana_Basudev_or_Lord_Vishnu_is_sleeping_posture_.This_open_air_relief_is_curved_out_of_stone_on_Brahmani_river_of_Sarang_village_of_Dhenkanal_district_of_Odisha._It's_length_is_approx_52_ft_and_was_built_in_9th_century.jpg` | high |
| `round2_east_011` | Chhatia Bata | Jajpur | `Chatia_bata.jpg` | high |
| `round2_east_012` | Mahavinayak Temple, Chandikhole | Jajpur | `Maha_Binayak_Temple.jpg` | high |
| `round2_east_015` | Deulajhari Hot Springs | Angul | `Deulajhari_Angul.JPG` | high |
| `round2_east_016` | Talcher Palace | Angul | `Talcher_Palace,_Angul,_Odisha.jpg` | high |
| `round2_east_017` | Lalitgiri Buddhist Complex | Cuttack | `Lalitgiri_-_Odisha_-_001.jpg` | high |
| `round2_east_019` | Ansupa Lake | Cuttack | `A_view_of_the_Ansupa_Lake_from_atop_Saranda_Hill.jpg` | high |
| `round2_east_020` | Bhattarika Temple | Cuttack | `Bhattarika.JPG` | high |

### Rejected

**`round2_east_005`** — Rakta Tirtha Eram (Bhadrak)  
Classification: `related_location_only`  
Assigned file: `Banchhanidhi_Mohanty_Statue.jpg`  
Reason: NONE FOR THE SITE ITSELF. File:Banchhanidhi_Mohanty_Statue.jpg shows a statue of poet/freedom fighter Banchhanidhi Mohanty. Rakta Tirtha Eram is the specific field in Basudebpur, Bhadrak, where the 1942 police firing occurred. A statue of a historical personality is not a photograph of the martyrdom ground, its memorial pillar, or the site landscape of Eram.

**`round2_east_009`** — Dandadhar Dam & Reservoir (Dhenkanal)  
Classification: `related_location_only`  
Assigned file: `Ramial_Dam_-_Dhenkanal_2018-01-25_9375.JPG`  
Reason: UNCERTAIN. File:Ramial_Dam_-_Dhenkanal_2018-01-25_9375.JPG shows a dam in Dhenkanal. The destination lists 'Ramial Dam' as an alias for Dandadhar Dam in Kamakhyanagar block, Dhenkanal. The Commons filename 'Ramial_Dam_-_Dhenkanal' may be the same dam. However, without independently confirmed GPS coordinates from the Commons file, there remains uncertainty whether these are the same structure.

**`round2_east_010`** — Sadeibereni Dokra Craft Village (Dhenkanal)  
Classification: `related_location_only`  
Assigned file: `A_Dhokra_cast_being_made_by_a_Dharua_tribal_woman.jpg`  
Reason: NONE FOR THE VILLAGE. File:A_Dhokra_cast_being_made_by_a_Dharua_tribal_woman.jpg shows a Dharua tribal woman performing the Dhokra lost-wax metal casting process. This is a craft activity photograph - it documents the process, not the physical village of Sadeibereni, its settlement, its workshops as a place, or any identifiable built/natural feature of the destination.

**`round2_east_013`** — Garh Kujanga (Jagatsinghpur)  
Classification: `related_location_only`  
Assigned file: `KrutamachandiTemple_TripathySahi_Jagatsinghpur_Odisha_India.jpg`  
Reason: NONE FOR GARH KUJANGA. File:KrutamachandiTemple_TripathySahi_Jagatsinghpur_Odisha_India.jpg shows Krutamachandi Temple at TripathySahi in Jagatsinghpur district. Garh Kujanga is the historic fortified royal estate in Kujang block - a different location, different temple, different block. Same district, different site.

**`round2_east_014`** — Alaka Ashram (Jagatsinghpur)  
Classification: `generic_image`  
Assigned file: `Jagatsinghpur_in_Odisha_(India).svg`  
Reason: NONE. File:Jagatsinghpur_in_Odisha_(India).svg is an SVG administrative district map of Jagatsinghpur. This is a vector graphic diagram, not a camera photograph of any physical location. Maps/SVGs cannot serve as destination hero photographs.

**`round2_east_018`** — Dhabaleswar Island Temple (Cuttack)  
Classification: `related_location_only`  
Assigned file: `Dhabaleswar_Bridge.jpg`  
Reason: PARTIAL SUPPORT ONLY. File:Dhabaleswar_Bridge.jpg shows the pedestrian suspension ropeway bridge (Jhula) that leads to Dhabaleswar island - strongly associated with this destination. However, the named destination is the TEMPLE on the island. The bridge is not the temple. The Shiva temple building is not visible.

**`round2_east_021`** — Nuapatna Handloom Heritage Village (Cuttack)  
Classification: `related_location_only`  
Assigned file: `Gita_Gobinda_Khandua.jpg`  
Reason: NONE FOR THE VILLAGE. File:Gita_Gobinda_Khandua.jpg shows a Khandua silk cloth woven with Gita Govinda verses - the sacred textile product from Nuapatna. Nuapatna Handloom Heritage Village is the weaver settlement where this cloth is produced. The photograph shows the product, not the village, its looms, artisans, or any identifiable physical feature of the destination.

---

## Reused Image Analysis

The following image files were assigned to multiple destinations. Where one destination is correct, the others are misassignments.

### `Sambalpuri_saree1.jpg`
Assigned to 2 destinations:

- `round2_west_004` — Barpali Handloom Heritage Village (Bargarh) [generic_image] [REJECTED]
- `round2_west_006` — Papanga Hill (Bargarh) [generic_image] [REJECTED]

### `Sambalpur.jpg`
Assigned to 3 destinations:

- `round2_west_014` — Kolabira Fort (Jharsuguda) [related_location_only] [REJECTED]
- `round2_west_015` — Jhadeswar Temple & Cave, Jharsuguda (Jharsuguda) [related_location_only] [REJECTED]
- `round2_west_019` — Budharaja Temple & Hill Park (Sambalpur) [related_location_only] [REJECTED]

### `Lankeswari_Thakurani_Sonepur_Subarnapur_Odisha.jpg`
Assigned to 2 destinations:

- `round2_west_007` — Lankeswari Temple, Sonepur (Subarnapur) [exact_location_verified] [hero eligible]
- `round2_west_009` — Metakani Temple, Ullunda (Subarnapur) [related_location_only] [REJECTED]

### `Ved_Vyas%2C_Rourkela_-_1.jpg`
Assigned to 2 destinations:

- `round2_west_020` — Vedvyas Temple & Confluence, Rourkela (Sundargarh) [exact_location_verified] [hero eligible]
- `round2_west_021` — Tensa Hill Station & Nature Camp (Sundargarh) [generic_image] [REJECTED]

### `Gudguda_waterfall_front_view.jpg`
Assigned to 4 destinations:

- `round2_west_013` — Ulapgarh Fort & Rock Enclosure (Jharsuguda) [generic_image] [REJECTED]
- `round2_west_016` — Gohira Dam & Reservoir (Deogarh) [generic_image] [REJECTED]
- `round2_west_017` — Kurudkut Waterfall & Historic Hydro Site (Deogarh) [related_location_only] [REJECTED]
- `round2_west_018` — Gudguda Waterfall (Sambalpur) [exact_location_verified] [hero eligible]

### `ASI_signboard_for_Ranipur_Jharial_and_Inndralath_Temple.jpg`
Assigned to 3 destinations:

- `round2_west_010` — Maa Patneswari Temple, Patnagarh (Balangir) [generic_image] [REJECTED]
- `round2_west_011` — Indralath Brick Temple, Ranipur Jharial (Balangir) [related_location_only] [REJECTED]
- `round2_west_012` — Saintala Chandi Temple Archaeological Site (Balangir) [generic_image] [REJECTED]


---

## Public Catalog Eligibility

> **Rule (AGENTS.md):** NO VERIFIED EXACT PHOTOGRAPH = NO PUBLIC DESTINATION.

### Production-eligible Round 2 destinations

| ID | Destination | District | Scope |
|---|---|---|---|
| `round2_west_001` | Yogimath Rock Art Site | Nuapada | round2_western |
| `round2_west_002` | Sunabeda Wildlife Sanctuary | Nuapada | round2_western |
| `round2_west_005` | Bargarh Dhanu Yatra Open-Air Arena | Bargarh | round2_western |
| `round2_west_007` | Lankeswari Temple, Sonepur | Subarnapur | round2_western |
| `round2_west_008` | Khaliapali Matha (Santha Kabi Bhima Bhoi Pitha) | Subarnapur | round2_western |
| `round2_west_018` | Gudguda Waterfall | Sambalpur | round2_western |
| `round2_west_020` | Vedvyas Temple & Confluence, Rourkela | Sundargarh | round2_western |
| `round2_east_001` | Gahirmatha Marine Sanctuary | Kendrapara | round2_eastern |
| `round2_east_002` | Hukitola Monument | Kendrapara | round2_eastern |
| `round2_east_003` | Kanika Palace | Kendrapara | round2_eastern |
| `round2_east_004` | Aul Palace | Kendrapara | round2_eastern |
| `round2_east_006` | Biranchinarayan Sun Temple, Palia | Bhadrak | round2_eastern |
| `round2_east_007` | Maa Bhadrakali Temple | Bhadrak | round2_eastern |
| `round2_east_008` | Saranga Anantasayana Vishnu | Dhenkanal | round2_eastern |
| `round2_east_011` | Chhatia Bata | Jajpur | round2_eastern |
| `round2_east_012` | Mahavinayak Temple, Chandikhole | Jajpur | round2_eastern |
| `round2_east_015` | Deulajhari Hot Springs | Angul | round2_eastern |
| `round2_east_016` | Talcher Palace | Angul | round2_eastern |
| `round2_east_017` | Lalitgiri Buddhist Complex | Cuttack | round2_eastern |
| `round2_east_019` | Ansupa Lake | Cuttack | round2_eastern |
| `round2_east_020` | Bhattarika Temple | Cuttack | round2_eastern |

### Staging-only (must NOT be promoted)

| ID | Destination | District | Classification | Reason summary |
|---|---|---|---|---|
| `round2_west_003` | Patalganga Sacred Spring | Nuapada | `generic_image` | Selected because it is from the same area, but it is a landscape of generic fore... |
| `round2_west_004` | Barpali Handloom Heritage Village | Bargarh | `generic_image` | Rule: A textile product photograph does not qualify as a hero photo of the craft... |
| `round2_west_006` | Papanga Hill | Bargarh | `generic_image` | Same Sambalpuri saree image reused for both Barpali village (weak but at least r... |
| `round2_west_009` | Metakani Temple, Ullunda | Subarnapur | `related_location_only` | Lankeswari Sonepur photograph is appropriate ONLY for west_007. Metakani Temple ... |
| `round2_west_010` | Maa Patneswari Temple, Patnagarh | Balangir | `generic_image` | ASI Ranipur Jharial signboard reused across three different destinations. Patnes... |
| `round2_west_011` | Indralath Brick Temple, Ranipur Jharial | Balangir | `related_location_only` | This is the ONLY one of the three signboard-assigned destinations that is even a... |
| `round2_west_012` | Saintala Chandi Temple Archaeological Site | Balangir | `generic_image` | Triple reuse of one signboard image across three unrelated archaeological sites. |
| `round2_west_013` | Ulapgarh Fort & Rock Enclosure | Jharsuguda | `generic_image` | Gudguda waterfall image reused for 4 destinations. Only west_018 is correct. |
| `round2_west_014` | Kolabira Fort | Jharsuguda | `related_location_only` | Sambalpur panorama reused for 3 destinations. None qualify except possibly west_... |
| `round2_west_015` | Jhadeswar Temple & Cave, Jharsuguda | Jharsuguda | `related_location_only` | Sambalpur.jpg reused for a Jharsuguda temple. Different district. |
| `round2_west_016` | Gohira Dam & Reservoir | Deogarh | `generic_image` | Gudguda waterfall used for a dam in a different district. |
| `round2_west_017` | Kurudkut Waterfall & Historic Hydro Site | Deogarh | `related_location_only` | Classified related_location_only (not generic) because it is at least a waterfal... |
| `round2_west_019` | Budharaja Temple & Hill Park | Sambalpur | `related_location_only` | A city panorama shot from the temple hill is context/ambiance but not a temple p... |
| `round2_west_021` | Tensa Hill Station & Nature Camp | Sundargarh | `generic_image` | Vedvyas temple photograph reused for an unrelated destination type in the same d... |
| `round2_east_005` | Rakta Tirtha Eram | Bhadrak | `related_location_only` | Related_location_only: Banchhanidhi Mohanty is connected to Bhadrak freedom stru... |
| `round2_east_009` | Dandadhar Dam & Reservoir | Dhenkanal | `related_location_only` | The destination candidate itself lists 'Ramial Dam' as an alias. If Ramial Dam a... |
| `round2_east_010` | Sadeibereni Dokra Craft Village | Dhenkanal | `related_location_only` | Per cultural/village destination rules: a craftsperson activity photo does not p... |
| `round2_east_013` | Garh Kujanga | Jagatsinghpur | `related_location_only` | A temple in the same district does not qualify as hero photo for a different tem... |
| `round2_east_014` | Alaka Ashram | Jagatsinghpur | `generic_image` | SVG administrative boundary map. Most clear-cut rejection case possible. |
| `round2_east_018` | Dhabaleswar Island Temple | Cuttack | `related_location_only` | Bridge photo could serve as gallery/supporting image. The primary attraction - t... |
| `round2_east_021` | Nuapatna Handloom Heritage Village | Cuttack | `related_location_only` | Related_location_only (not generic): the Khandua fabric is genuinely from Nuapat... |

---

## Validation Results

- No duplicate `research_id`s detected.
- All records have a valid classification.
- No `hero_image_eligible=True` assigned to non-verified records.
- Registry JSON is valid.

---

## Critical Rules Applied

1. A textile product photograph (saree, khandua) is NOT a photograph of the weaving village.
2. A signboard at a site entrance is NOT a hero photograph of the monument.
3. A city panorama taken from a hilltop is NOT a photograph of the specific temple on that hill.
4. A photograph of Dam A is NOT a photograph of Dam B in the same district.
5. A photograph of Temple A is NOT a photograph of Temple B in the same district.
6. A waterfall photograph is NOT a photograph of a fort or dam.
7. An SVG administrative district map is NEVER a qualifying hero photograph.
8. A craft activity photograph (craftsperson at work) is NOT a photograph of the craft village.
9. A bridge leading to an island temple is NOT a photograph of the temple.
10. A statue of a historical figure is NOT a photograph of the memorial/martyrdom site.