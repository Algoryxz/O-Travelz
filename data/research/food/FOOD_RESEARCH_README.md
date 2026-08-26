# O-TRAVELZ — 30-DISTRICT ODISHA FOOD RESEARCH DOCUMENTATION

## Overview
This research dataset establishes the grounded food, culinary heritage, and travel-corridor refreshment foundation for O-Travelz.

## Core Taxonomy

### Food Categories (`food_category`)
- `restaurant`: Full-service dining establishment.
- `local_food_experience`: Unique cultural or on-site cooking experience (e.g. Chilika fresh crab, Baripada Mudhi Mansa).
- `regional_speciality`: Producer of geographically distinct culinary items (e.g. Keonjhar Phula Badi, Berhampur Achar).
- `highway_stop`: Quality refreshment stop situated directly on a major transit corridor (NH-16, NH-316, NH-55, NH-49, NH-26).
- `street_food_market`: Concentrated urban street food hub (e.g. Choudhury Bazar Cuttack, Golbazar Sambalpur).
- `traditional_temple_food`: Sacred and sattvik prasadam cooked according to ancient temple rules (Ananda Bazar Puri, Lingaraj Kora Khai).
- `heritage_sweet_stall`: Historic sweet confectionery specializing in authentic Odia chhena or jaggery delicacies (Pahala, Salepur, Nimapada, Khandapada).
- `mall_food_court`: Modern multi-cuisine retail food court.

### Cuisines
- `Odia Traditional`
- `Temple Cuisine`
- `Coastal Seafood`
- `Cuttacki`
- `Western Odisha`
- `Tribal / Forest Produce`
- `South Indian`
- `North Indian`

### Dietary Tags
- `vegetarian`
- `pure_veg_no_onion_garlic`
- `non_vegetarian`
- `seafood`
- `sweets_desserts`
- `vegan_friendly`
- `halal_friendly`

### Highway Corridors
- `NH-16`: Kolkata — Balasore — Cuttack — Bhubaneswar — Khordha — Berhampur — Chennai
- `NH-316`: Bhubaneswar — Pipili — Puri — Konark Marine Drive
- `NH-55`: Cuttack — Dhenkanal — Angul — Sambalpur
- `NH-49`: Kolkata — Baripada — Keonjhar — Deogarh — Jharsuguda — Mumbai
- `NH-26`: Bargarh — Bolangir — Bhawanipatna — Koraput — Visakhapatnam

## Research Quality Standards
1. **Zero Rating Fabrication**: Only official Google Business or Tourism Department audited ratings are included. Unverified ratings are strictly `null`.
2. **Zero Coordinate Fabrication**: Only verified coordinates validated against official district bounding boxes are included. Unresolved coordinates are set to `null` with `coordinate_status: 'unresolved'`.
3. **No Centroid Guesses**: No district or locality centroids are substituted as place coordinates.
