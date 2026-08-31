# O-TRAVELZ — Strict Photographic Audit Report v2

**Audit Date:** 2026-08-31  
**Audit Scope:** Second-pass rigorous verification of all 92 destination records  
**Standard:** REAL PHOTOGRAPH + EXACT LOCATION + VERIFIED SOURCE  

---

## Executive Summary

A deep empirical second-pass verification audit was conducted across all 92 destination image assignments (50 Production Manifest, 21 Round 2 Western, 21 Round 2 Eastern).

### Key Findings & Corrections

1. **Previous Audit Was Inaccurate (71/92 figure corrected to 66/92):** The previous audit blindly assumed all 50 Production Manifest entries were 100% `exact_location_verified` without inspecting image subjects. Deep verification revealed **5 production entries fail exact location rules** and were downgraded to `related_location_only`.
2. **Production Manifest Downgrades (5 entries):**
   - `place_puri_004` (Swargadwar Beach): Photo depicts Maa Anandamayee Ashram building near the beach, not Swargadwar Beach itself.
   - `place_koraput_004` (Tribal Museum, Koraput): Photo depicts a single cowbell display artifact, not the museum building or gallery.
   - `place_daringbadi_001` (Daringbadi Hill Station): Photo is a close-up macro of black pepper plant creepers, not the hill station landscape.
   - `place_cuttack_003` (Odisha State Maritime Museum): Photo depicts an educational infographic poster panel, not the maritime museum.
   - `place_daringbadi_004` (Belghar Nature Camp): Photo depicts Mandasaru Kuthi gorge 45 km away, not Belghar Nature Camp.
3. **Round 2 Western Candidates (7/21 Verified):** 14 candidates remain rejected (6 `related_location_only`, 8 `generic_image`).
4. **Round 2 Eastern Candidates (14/21 Verified):** 7 candidates remain rejected (6 `related_location_only`, 1 `generic_image`).

---

## Summary Statistics

| Scope | Exact Verified | Related Location Only | Generic / Mismatch | Total Records | Exact % |
|---|---:|---:|---:|---:|---:|
| Production Manifest | 45 | 5 | 0 | 50 | 90.0% |
| Round 2 Western | 7 | 6 | 8 | 21 | 33.3% |
| Round 2 Eastern | 14 | 6 | 1 | 21 | 66.7% |
| **GRAND TOTAL** | **66** | **17** | **9** | **92** | **71.7%** |

**Production Eligible (`hero_image_eligible=True`):** 66 / 92
**Staging Only (Must NOT be promoted):** 26 / 92

---

## Production Manifest Downgrades (5 Entries)

| ID | Destination | File | Previous Status | Updated Classification | Reason |
|---|---|---|---|---|---|
| `place_puri_004` | Swargadwar Beach | `File:Maa Anandamayee Ashram, near Swargadwar Beach, Puri 01.jpg` | exact_location_verified | `related_location_only` | Ashram building near beach, not Swargadwar Beach itself |
| `place_koraput_004` | Tribal Museum, Koraput | `File:A cowbell in the Tribal Museum, Koraput.jpg` | exact_location_verified | `related_location_only` | Close-up of a cowbell artifact, not the museum building/complex |
| `place_daringbadi_001` | Daringbadi Hill Station | `File:Black pepper creepers, Daringbari.jpg` | exact_location_verified | `related_location_only` | Close-up of pepper plant creepers, not hill station view |
| `place_cuttack_003` | Odisha State Maritime Museum | `File:Identical places between Odisha and Indonesia 1.jpg` | exact_location_verified | `related_location_only` | Educational infographic poster panel, not museum building |
| `place_daringbadi_004` | Belghar Nature Camp | `File:Kandamal Zilla, Odisha.jpg` | exact_location_verified | `related_location_only` | Photo of Mandasaru Kuthi gorge 45 km away from Belghar |

---

## Round 2 Western Rejections (14 Candidates)

| ID | Destination | District | Classification | Reason |
|---|---|---|---|---|
| `round2_west_003` | Patalganga Sacred Spring | Nuapada | `generic_image` | File depicts a generic Sunabeda forest pocket, not the specific Patalganga rock spring or its sacred bathing kunds. |
| `round2_west_004` | Barpali Handloom Heritage Village | Bargarh | `generic_image` | File depicts a Sambalpuri saree textile product, not the physical weaving village, looms, or workshops of Barpali. |
| `round2_west_006` | Papanga Hill | Bargarh | `generic_image` | File depicts a Sambalpuri saree textile product assigned to Papanga Hill — a complete subject mismatch. |
| `round2_west_009` | Metakani Temple, Ullunda | Subarnapur | `related_location_only` | File depicts Lankeswari Temple in Sonepur town, assigned to Metakani Temple in Ullunda block — different temple in another block. |
| `round2_west_010` | Maa Patneswari Temple, Patnagarh | Balangir | `generic_image` | File depicts an ASI signboard at Ranipur Jharial, assigned to Patneswari Temple in Patnagarh (90+ km away). |
| `round2_west_011` | Indralath Brick Temple, Ranipur Jharial | Balangir | `related_location_only` | File is an ASI entrance signboard at Ranipur Jharial. Signboards support site identity but do not qualify as hero architectural photographs. |
| `round2_west_012` | Saintala Chandi Temple Archaeological Site | Balangir | `generic_image` | File depicts an ASI signboard for Ranipur Jharial, assigned to Saintala Chandi Temple Archaeological Site — different site. |
| `round2_west_013` | Ulapgarh Fort & Rock Enclosure | Jharsuguda | `generic_image` | File depicts Gudguda Waterfall in Sambalpur, assigned to Ulapgarh Fort in Jharsuguda — waterfall assigned to a fort. |
| `round2_west_014` | Kolabira Fort | Jharsuguda | `related_location_only` | File depicts a panoramic city view of Sambalpur town, assigned to Kolabira Fort in Jharsuguda district — different district. |
| `round2_west_015` | Jhadeswar Temple & Cave, Jharsuguda | Jharsuguda | `related_location_only` | File depicts a panoramic city view of Sambalpur town, assigned to Jhadeswar Temple & Cave in Jharsuguda town — different town/district. |
| `round2_west_016` | Gohira Dam & Reservoir | Deogarh | `generic_image` | File depicts Gudguda Waterfall in Sambalpur, assigned to Gohira Dam in Deogarh district — waterfall assigned to a dam. |
| `round2_west_017` | Kurudkut Waterfall & Historic Hydro Site | Deogarh | `related_location_only` | File depicts Gudguda Waterfall in Sambalpur, assigned to Kurudkut Waterfall in Deogarh — different waterfall in another district. |
| `round2_west_019` | Budharaja Temple & Hill Park | Sambalpur | `related_location_only` | File is a city panorama taken from Budharaja Hill, showing the town view rather than the Budharaja Shiva temple structure. |
| `round2_west_021` | Tensa Hill Station & Nature Camp | Sundargarh | `generic_image` | File depicts Vedvyas Temple in Rourkela, assigned to Tensa Hill Station & Nature Camp — temple assigned to a hill station. |

---

## Round 2 Eastern Rejections (7 Candidates)

| ID | Destination | District | Classification | Reason |
|---|---|---|---|---|
| `round2_east_005` | Rakta Tirtha Eram | Bhadrak | `related_location_only` | File depicts a statue of poet Banchhanidhi Mohanty, not the Rakta Tirtha Eram martyrdom ground field or memorial pillar. |
| `round2_east_009` | Dandadhar Dam & Reservoir | Dhenkanal | `related_location_only` | File depicts Ramial Dam in Dhenkanal. Dandadhar Dam is listed with Ramial Dam as an alias, but unconfirmed GPS metadata requires related classification. |
| `round2_east_010` | Sadeibereni Dokra Craft Village | Dhenkanal | `related_location_only` | File depicts a Dharua tribal woman performing Dhokra metal casting, not the physical Sadeibereni village or workshop grounds. |
| `round2_east_013` | Garh Kujanga | Jagatsinghpur | `related_location_only` | File depicts Krutamachandi Temple in TripathySahi, assigned to Garh Kujanga fortified royal estate — different site. |
| `round2_east_014` | Alaka Ashram | Jagatsinghpur | `generic_image` | File is an SVG administrative district map of Jagatsinghpur — a cartographic diagram, not a camera photograph. |
| `round2_east_018` | Dhabaleswar Island Temple | Cuttack | `related_location_only` | File depicts the pedestrian suspension bridge leading to Dhabaleswar island, not the Dhabaleswar Shiva temple building itself. |
| `round2_east_021` | Nuapatna Handloom Heritage Village | Cuttack | `related_location_only` | File depicts a Khandua silk fabric textile product, not the physical Nuapatna Handloom Heritage Village. |

---

## Image Reuse & Contamination Findings

6 image reuse groups were detected across Western candidates:
- `Sambalpuri_saree1.jpg` -> `round2_west_004` (Barpali Ikat village) & `round2_west_006` (Papanga Hill - complete mismatch)
- `Lankeswari_Thakurani.jpg` -> `round2_west_007` (Lankeswari Sonepur) & `round2_west_009` (Metakani Ullunda - wrong temple)
- `ASI_signboard_Ranipur.jpg` -> `round2_west_010` (Patneswari Patnagarh), `round2_west_011` (Indralath), `round2_west_012` (Saintala)
- `Gudguda_waterfall.jpg` -> `round2_west_013` (Ulapgarh Fort), `round2_west_016` (Gohira Dam), `round2_west_017` (Kurudkut), `round2_west_018` (Gudguda [OK])
- `Sambalpur.jpg` -> `round2_west_014` (Kolabira Fort), `round2_west_015` (Jhadeswar Temple), `round2_west_019` (Budharaja Temple)
- `Ved_Vyas_Rourkela.jpg` -> `round2_west_020` (Vedvyas [OK]), `round2_west_021` (Tensa Hill Station - wrong type)

---

## Production Eligibility Rule Enforcement

> **AGENTS.md Rule:** NO VERIFIED EXACT PHOTOGRAPH = NO PUBLIC DESTINATION.

All 26 non-verified records (5 Production, 14 Western, 7 Eastern) MUST REMAIN IN STAGING and must not appear in the production catalog.