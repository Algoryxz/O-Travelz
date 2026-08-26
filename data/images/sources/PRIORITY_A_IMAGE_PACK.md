# O-TRAVELZ: PRIORITY A IMAGE COLLECTION PACK (24 DESTINATIONS)

> **Mission**: Personally source authentic, high-resolution photographs for the **24 highest-priority destinations** in Odisha (Top pilgrimage shrines, signature waterfalls, natural wonders, key transit gateways, and iconic Odia culinary experiences).

---

## HOW TO SEND IMAGES BACK

You can provide verified images in either of these two easy ways:

### Option 1: Reply directly in chat using this compact format
```yaml
ID: food_mayurbhanj_001
SOURCE URL: https://example.com/baripada-mudhi-mansa.jpg
SOURCE TYPE: wikimedia # (wikimedia | official | user_supplied | licensed)
LICENSE/PERMISSION: CC BY-SA 4.0
NOTES: Authentic Baripada Mudhi Mansa plate with puffed rice and mutton gravy
```

### Option 2: Drop local image files into the staging directory
1. Save image file to: `data/images/manual/<internal_id>.webp` (or `.jpg`, `.png`)
   - Example: `data/images/manual/food_mayurbhanj_001.webp`
2. Add entry to [data/images/manual/metadata.json](file:///c:/Users/smara/Desktop/o-travelz/data/images/manual/metadata.json):
   ```json
   "food_mayurbhanj_001": {
     "filename": "food_mayurbhanj_001.webp",
     "source_url": "https://...",
     "source_type": "user_supplied",
     "license": "Personal photography / CC0",
     "verified": true,
     "notes": "Freshly prepared Baripada Mudhi Mansa"
   }
   ```
3. Run validation: `.venv\Scripts\python.exe scripts/validate_manual_images.py`

---

## PRIORITY A DESTINATION CARDS (24 PLACES)

### 1. Maa Akhandalamani Temple (Aradi)
- **INTERNAL ID**: `place_bhadrak_001`
- **DISTRICT**: Bhadrak
- **CATEGORY**: `temple`
- **EXACT IMAGE WE NEED**: Authentic photograph of Maa Akhandalamani Temple and Baitarani river ghat in Aradi, Bhadrak.
- **WHAT IS ACCEPTABLE**: Temple building facade, main shikhara (spire), or Shiva sanctum courtyard in Aradi.
- **WHAT IS NOT ACCEPTABLE**: Photos of Akhandalamani clubs/offices in other cities, generic Shiva temples, AI art.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Akhandalamani Temple" Aradi Bhadrak Odisha official`
  - `"Akhandalamani Temple" Aradi photograph high resolution`
  - `"Maa Akhandalamani" Aradi temple Wikimedia Commons`
  - `"Akhandalamani" Bhadrak Odisha Tourism`

```yaml
ID: place_bhadrak_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 2. Kapilash Temple & Sanctuary
- **INTERNAL ID**: `place_dhenkanal_001`
- **DISTRICT**: Dhenkanal
- **CATEGORY**: `temple`
- **EXACT IMAGE WE NEED**: Authentic photograph of Kapilash Chandrasekhar Temple on the hill in Dhenkanal.
- **WHAT IS ACCEPTABLE**: Hilltop temple structure, 1352-step pilgrimage path, or main temple compound at Kapilash.
- **WHAT IS NOT ACCEPTABLE**: Kapilash zoo animals only without temple, generic mountain hills.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Kapilash Temple" Dhenkanal Chandrasekhar Odisha`
  - `"Kapilash Temple" Dhenkanal photograph high resolution`
  - `"Kapilash" Dhenkanal temple Wikimedia Commons`
  - `"Kapilash Temple" Dhenkanal Odisha Tourism official`

```yaml
ID: place_dhenkanal_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 3. Maa Tara Tarini Shakti Peetha
- **INTERNAL ID**: `place_ganjam_003`
- **DISTRICT**: Ganjam
- **CATEGORY**: `temple`
- **EXACT IMAGE WE NEED**: Authentic photograph of Maa Tara Tarini Shakti Peetha hilltop temple near Purushottampur, Ganjam.
- **WHAT IS ACCEPTABLE**: Twin goddess hilltop temple structure, Rushikulya river view from top, or temple ropeway.
- **WHAT IS NOT ACCEPTABLE**: Tarapith in West Bengal, unrelated Kali temples, festive posters.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Tara Tarini Temple" Ganjam Odisha official photograph`
  - `"Maa Tara Tarini" Rushikulya hilltop shrine high resolution`
  - `"Tara Tarini" Ganjam temple Wikimedia Commons`
  - `"Tara Tarini Temple" Odisha Tourism official`

```yaml
ID: place_ganjam_003
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 4. Maa Sarala Temple (Jhankad)
- **INTERNAL ID**: `place_jagatsinghpur_001`
- **DISTRICT**: Jagatsinghpur
- **CATEGORY**: `temple`
- **EXACT IMAGE WE NEED**: Authentic photograph of historic Maa Sarala Temple in Jhankad, Jagatsinghpur.
- **WHAT IS ACCEPTABLE**: Ancient Jhankad temple facade, entrance lion gate (Singhadwara), or main sanctum shikhara.
- **WHAT IS NOT ACCEPTABLE**: Sarala temple in Kendrapara / other districts, generic Durga idols, calendar art.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Maa Sarala Temple" Jhankad Jagatsinghpur Odisha official`
  - `"Sarala Temple" Jhankad photograph high resolution`
  - `"Maa Sarala Temple" Jagatsinghpur Wikimedia Commons`
  - `"Sarala Temple" Jhankad Odisha Tourism`

```yaml
ID: place_jagatsinghpur_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 5. Baladevjew Temple (Ichhapur)
- **INTERNAL ID**: `place_kendrapara_002`
- **DISTRICT**: Kendrapara
- **CATEGORY**: `temple`
- **EXACT IMAGE WE NEED**: Authentic photograph of Baladevjew Temple complex in Ichhapur (Tulasi Kshetra), Kendrapara.
- **WHAT IS ACCEPTABLE**: Four-tiered temple complex, main temple entrance gate, or large temple courtyard in Ichhapur.
- **WHAT IS NOT ACCEPTABLE**: Baladevjew temple in Manjuri (Bhadrak) or Keonjhar, generic temple spires.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Baladevjew Temple" Ichhapur Kendrapara Odisha official`
  - `"Baladevjew Temple" Kendrapara Tulasi Kshetra photograph`
  - `"Baladevjew Temple" Kendrapara high resolution`
  - `"Baladevjew" Kendrapara Wikimedia Commons`

```yaml
ID: place_kendrapara_002
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 6. Panchalingeswar Temple & Springs
- **INTERNAL ID**: `place_balasore_003`
- **DISTRICT**: Balasore
- **CATEGORY**: `temple`
- **EXACT IMAGE WE NEED**: Authentic photograph of Panchalingeswar Temple and natural hill springs in Nilagiri, Balasore.
- **WHAT IS ACCEPTABLE**: Perennial rock stream flowing over the five shivlings on Devagiri hill OR the hill temple entrance.
- **WHAT IS NOT ACCEPTABLE**: Generic mountain streams, artificial indoor shrines, AI art.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Panchalingeswar Temple" Balasore Nilagiri Odisha`
  - `"Panchalingeswar" hill spring temple photograph high resolution`
  - `"Panchalingeswar" Balasore Wikimedia Commons`
  - `"Panchalingeswar" Odisha Tourism official`

```yaml
ID: place_balasore_003
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 7. Sarankul Ladubaba Temple
- **INTERNAL ID**: `place_nayagarh_002`
- **DISTRICT**: Nayagarh
- **CATEGORY**: `temple`
- **EXACT IMAGE WE NEED**: Authentic photograph of Sarankul Ladubaba Temple (Ladu Kishore) in Nayagarh.
- **WHAT IS ACCEPTABLE**: Ancient Kalinga temple building facade, brass flag staff, or temple sanctum courtyard in Sarankul.
- **WHAT IS NOT ACCEPTABLE**: Unrelated Shiva temples, festive graphics.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Ladubaba Temple" Sarankul Nayagarh Odisha official`
  - `"Sarankul Ladubaba" temple photograph high resolution`
  - `"Ladubaba Temple" Sarankul Wikimedia Commons`
  - `"Sarankul" Nayagarh Odisha Tourism`

```yaml
ID: place_nayagarh_002
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 8. Chandandhara Waterfall
- **INTERNAL ID**: `place_nabarangpur_002`
- **DISTRICT**: Nabarangpur
- **CATEGORY**: `waterfall`
- **EXACT IMAGE WE NEED**: Authentic photograph of Chandandhara Waterfall on the Turi river in Nabarangpur district.
- **WHAT IS ACCEPTABLE**: Wide shot of the cascading waterfall over granite rocks in natural forest setting.
- **WHAT IS NOT ACCEPTABLE**: Other Odisha waterfalls (Barehipani, Duduma), generic mountain rapids.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Chandandhara Waterfall" Nabarangpur Odisha official`
  - `"Chandandhara Waterfall" Turi river photograph`
  - `"Chandandhara Waterfall" Nabarangpur high resolution`
  - `"Chandandhara" Nabarangpur Odisha Tourism`

```yaml
ID: place_nabarangpur_002
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 9. Chatikona Waterfall & Hanging Bridge
- **INTERNAL ID**: `place_rayagada_002`
- **DISTRICT**: Rayagada
- **CATEGORY**: `waterfall`
- **EXACT IMAGE WE NEED**: Authentic photograph of Chatikona Waterfall & Hanging Suspension Bridge in Rayagada.
- **WHAT IS ACCEPTABLE**: Scenic waterfall cascade amidst Niyamgiri hills OR the steel-wire pedestrian hanging bridge.
- **WHAT IS NOT ACCEPTABLE**: Generic rope bridges in Uttarakhand, unrelated waterfalls.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Chatikona Waterfall" Rayagada Niyamgiri Odisha`
  - `"Chatikona Hanging Bridge" Rayagada photograph high resolution`
  - `"Chatikona Waterfall" Rayagada Wikimedia Commons`
  - `"Chatikona" Rayagada Odisha Tourism`

```yaml
ID: place_rayagada_002
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 10. Paradip Sea Beach & Lighthouse
- **INTERNAL ID**: `place_jagatsinghpur_002`
- **DISTRICT**: Jagatsinghpur
- **CATEGORY**: `beach`
- **EXACT IMAGE WE NEED**: Authentic photograph of Paradip Sea Beach, coastline, and historic Paradip Lighthouse in Jagatsinghpur.
- **WHAT IS ACCEPTABLE**: Paradip beach shoreline with sea waves and lighthouse tower OR port confluence coastline.
- **WHAT IS NOT ACCEPTABLE**: Goa/Puri beaches, industrial oil refinery closeups without beach context.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Paradip Sea Beach" lighthouse Jagatsinghpur Odisha`
  - `"Paradip Lighthouse" beach photograph high resolution`
  - `"Paradip Sea Beach" Wikimedia Commons`
  - `"Paradip Beach" Jagatsinghpur Odisha Tourism`

```yaml
ID: place_jagatsinghpur_002
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 11. Balimela Dam & Hydro Reservoir
- **INTERNAL ID**: `place_malkangiri_001`
- **DISTRICT**: Malkangiri
- **CATEGORY**: `lake`
- **EXACT IMAGE WE NEED**: Authentic photograph of Balimela Dam & Hydro Reservoir in Malkangiri district.
- **WHAT IS ACCEPTABLE**: Panoramic view of Balimela reservoir blue water, dam spillway structure, or surrounding Eastern Ghat hills.
- **WHAT IS NOT ACCEPTABLE**: Hirakud dam, generic concrete dams, industrial hydro turbines.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Balimela Dam" reservoir Malkangiri Odisha official`
  - `"Balimela Reservoir" photograph high resolution`
  - `"Balimela Dam" Malkangiri Wikimedia Commons`
  - `"Balimela Hydro Electric" Odisha Tourism`

```yaml
ID: place_malkangiri_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 12. Baisipalli Wildlife Sanctuary
- **INTERNAL ID**: `place_nayagarh_003`
- **DISTRICT**: Nayagarh
- **CATEGORY**: `wildlife`
- **EXACT IMAGE WE NEED**: Authentic photograph of Baisipalli Wildlife Sanctuary in Nayagarh / Mahanadi valley.
- **WHAT IS ACCEPTABLE**: Dense Sal forest canopy, valley river gorge, or wildlife landscape inside Baisipalli sanctuary.
- **WHAT IS NOT ACCEPTABLE**: African safari animals, generic zoo enclosures, captive tigers.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Baisipalli Wildlife Sanctuary" Nayagarh Odisha official`
  - `"Baisipalli Sanctuary" forest landscape photograph`
  - `"Baisipalli Wildlife Sanctuary" high resolution`
  - `"Baisipalli" Nayagarh Odisha Forest Department`

```yaml
ID: place_nayagarh_003
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 13. Satkosia Gorge Sanctuary
- **INTERNAL ID**: `place_angul_001`
- **DISTRICT**: Angul
- **CATEGORY**: `wildlife`
- **EXACT IMAGE WE NEED**: Authentic photograph of Satkosia Gorge Wildlife Sanctuary on the Mahanadi River in Angul.
- **WHAT IS ACCEPTABLE**: Famous 22km long Mahanadi river gorge cutting through Eastern Ghat hills, gharial riverbank, or Tikarpada gorge view.
- **WHAT IS NOT ACCEPTABLE**: Generic river shots without gorge hills, crocodiles in concrete pools.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Satkosia Gorge Sanctuary" Mahanadi Angul Odisha official`
  - `"Satkosia Gorge" river valley photograph high resolution`
  - `"Satkosia Gorge" Wikimedia Commons`
  - `"Satkosia" Odisha Tourism official`

```yaml
ID: place_angul_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 14. Biju Patnaik International Airport (BBI)
- **INTERNAL ID**: `place_transit_001`
- **DISTRICT**: Khordha
- **CATEGORY**: `transit_hub`
- **EXACT IMAGE WE NEED**: Authentic photograph of Biju Patnaik International Airport (BBI) terminal building in Bhubaneswar.
- **WHAT IS ACCEPTABLE**: Exterior building facade of Terminal 1 (Domestic) or Terminal 2 with Kalinga sandstone artwork murals.
- **WHAT IS NOT ACCEPTABLE**: Inside airplane cabin, PDF brochures, airport runway tarmac only without building.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Biju Patnaik International Airport" Bhubaneswar terminal facade`
  - `"Bhubaneswar Airport" BBI building exterior photograph`
  - `"Biju Patnaik Airport" terminal Wikimedia Commons`
  - `"Bhubaneswar Airport" AAI official photograph high resolution`

```yaml
ID: place_transit_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 15. Bhubaneswar Railway Station (BBS)
- **INTERNAL ID**: `place_transit_004`
- **DISTRICT**: Khordha
- **CATEGORY**: `transit_hub`
- **EXACT IMAGE WE NEED**: Authentic photograph of Bhubaneswar Railway Station (BBS) main station building facade.
- **WHAT IS ACCEPTABLE**: Master Canteen side entrance building facade, passenger concourse, or station portico.
- **WHAT IS NOT ACCEPTABLE**: Train engine locomotive only, interior ticket counter screens, PDF timetables.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Bhubaneswar Railway Station" main building facade photograph`
  - `"Bhubaneswar Railway Station" BBS exterior high resolution`
  - `"Bhubaneswar Railway Station" East Coast Railway official`
  - `"Bhubaneswar Station" Wikimedia Commons`

```yaml
ID: place_transit_004
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 16. Baramunda Inter State Bus Terminal (ISBT)
- **INTERNAL ID**: `place_transit_011`
- **DISTRICT**: Khordha
- **CATEGORY**: `transit_hub`
- **EXACT IMAGE WE NEED**: Authentic photograph of Baramunda Inter State Bus Terminal (Babasaheb Bhimrao Ambedkar Bus Terminal - BSABT) in Bhubaneswar.
- **WHAT IS ACCEPTABLE**: New multi-level modern glass bus terminal building facade or organized bus boarding bays.
- **WHAT IS NOT ACCEPTABLE**: Old muddy Baramunda stand before redevelopment, single city bus closeup.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Babasaheb Bhimrao Ambedkar Bus Terminal" Baramunda Bhubaneswar building`
  - `"Baramunda ISBT" new terminal facade photograph`
  - `"BSABT Baramunda" Bhubaneswar bus terminal high resolution`
  - `"Baramunda Bus Terminal" CRUT official`

```yaml
ID: place_transit_011
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 17. Ananda Bazar Sacred Mahaprasad Food Court
- **INTERNAL ID**: `food_puri_001`
- **DISTRICT**: Puri
- **CATEGORY**: `traditional_temple_food`
- **EXACT IMAGE WE NEED**: Authentic photograph of Puri Jagannath Temple Ananda Bazar Mahaprasad served in traditional earthen Kudua pots.
- **WHAT IS ACCEPTABLE**: Real photo of Ananda Bazar food court in Puri OR authentic Kudua clay pots filled with Mahaprasad (Dalma, Kanika, Besara, Khechedi).
- **WHAT IS NOT ACCEPTABLE**: Generic Indian thali, North Indian sweets, modern restaurant table spread, AI food illustrations.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Ananda Bazar" Puri Mahaprasad "Kudua"`
  - `"Jagannath Temple" Mahaprasad authentic earthen pots`
  - `"Ananda Bazar" Puri food court Wikimedia Commons`
  - `"Ananda Bazar" Puri Odisha Tourism photo`

```yaml
ID: food_puri_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 18. Baripada Mudhi Mansa Traditional Food Hub
- **INTERNAL ID**: `food_mayurbhanj_001`
- **DISTRICT**: Mayurbhanj
- **CATEGORY**: `local_food_experience`
- **EXACT IMAGE WE NEED**: Authentic photograph of traditional Baripada Mudhi Mansa (puffed rice served with spiced mutton gravy).
- **WHAT IS ACCEPTABLE**: High-quality authentic plate of Baripada Mudhi Mansa with puffed rice, rich mutton curry, chopped onions, and chilies OR Baripada eatery stall.
- **WHAT IS NOT ACCEPTABLE**: Generic mutton curry without mudhi (puffed rice), biryani, generic restaurant meat curry.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Baripada Mudhi Mansa" authentic Odisha`
  - `"Mudhi Mansa" Baripada Mayurbhanj photograph`
  - `"Baripada Mudhi Mansa" traditional food Wikimedia Commons`
  - `"Baripada Mudhi Mansa" Mayurbhanj dish high resolution`

```yaml
ID: food_mayurbhanj_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 19. Bikalananda Kar Rasagola Heritage Confectionery
- **INTERNAL ID**: `food_cuttack_002`
- **DISTRICT**: Cuttack
- **CATEGORY**: `heritage_sweet_stall`
- **EXACT IMAGE WE NEED**: Authentic photograph of Bikalananda Kar heritage Rasagola confectionery in Salepur / Cuttack.
- **WHAT IS ACCEPTABLE**: Storefront of Bikalananda Kar in Salepur OR authentic fresh bowl of light-brown caramelized Salepur Rasagolas.
- **WHAT IS NOT ACCEPTABLE**: White Bengali sponge rasgullas, generic canned sweets, Gulab Jamun.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Bikalananda Kar" Salepur Rasagola authentic`
  - `"Salepur Rasagola" Bikalananda Kar confectionery`
  - `"Bikalananda Kar" Rasagola Salepur Cuttack photograph`
  - `"Salepur Rasagola" Odisha traditional sweet high resolution`

```yaml
ID: food_cuttack_002
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 20. Nayagarh Khandapada Chhena Poda Birthplace Confectionery
- **INTERNAL ID**: `food_nayagarh_001`
- **DISTRICT**: Nayagarh
- **CATEGORY**: `heritage_sweet_stall`
- **EXACT IMAGE WE NEED**: Authentic photograph of traditional wood-fired caramelized Chhena Poda from Khandapada / Nayagarh.
- **WHAT IS ACCEPTABLE**: Authentic freshly baked wheel of Nayagarh Chhena Poda with dark caramelized sal leaf crust OR slice showing baked cottage cheese texture.
- **WHAT IS NOT ACCEPTABLE**: Cheesecake, paneer tikka, yellow milk cake, generic Indian sweets.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Nayagarh Chhena Poda" authentic caramelized Odisha`
  - `"Chhena Poda" Nayagarh Khandapada traditional sweet`
  - `"Chhena Poda" Nayagarh photograph high resolution`
  - `"Nayagarh Chhena Poda" Wikimedia Commons`

```yaml
ID: food_nayagarh_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 21. Kendrapara Baladevjew Rasabali Confectionery Hub
- **INTERNAL ID**: `food_kendrapara_001`
- **DISTRICT**: Kendrapara
- **CATEGORY**: `heritage_sweet_stall`
- **EXACT IMAGE WE NEED**: Authentic photograph of traditional Kendrapara Baladevjew Rasabali (cardamom fried chhena patties in thick rabri milk).
- **WHAT IS ACCEPTABLE**: Plate of authentic dark-golden Rasabali patties soaked in thick rabri milk OR Baladevjew temple confectionery stall.
- **WHAT IS NOT ACCEPTABLE**: Rasmalai, Gulab Jamun, Malpua, generic dairy desserts.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Kendrapara Rasabali" authentic Odisha sweet`
  - `"Rasabali" Kendrapara Baladevjew traditional photograph`
  - `"Kendrapara Rasabali" dish high resolution`
  - `"Rasabali" Kendrapara sweet Wikimedia Commons`

```yaml
ID: food_kendrapara_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 22. Barabati Fort Bidanasi Dahibara Hub
- **INTERNAL ID**: `food_cuttack_003`
- **DISTRICT**: Cuttack
- **CATEGORY**: `street_food_market`
- **EXACT IMAGE WE NEED**: Authentic photograph of Cuttack Dahibara Aloodum & Guguni plate at Barabati Fort / Bidanasi.
- **WHAT IS ACCEPTABLE**: Signature Cuttack street food plate: lentil vadas in curd water, spicy aloodum, yellow pea guguni, topped with sev and coriander.
- **WHAT IS NOT ACCEPTABLE**: North Indian Dahi Bhalla with sweet chutney, plain South Indian dahi vada, generic street snacks.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Cuttack Dahibara Aloodum" authentic Barabati Bidanasi`
  - `"Cuttack Dahibara Aloodum" street food photograph`
  - `"Dahibara Aloodum" Cuttack Guguni high resolution`
  - `"Cuttack Dahibara" Wikimedia Commons`

```yaml
ID: food_cuttack_003
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 23. OTDC Nimantran Authentic Odia Cuisine Centre
- **INTERNAL ID**: `food_khurda_002`
- **DISTRICT**: Khordha
- **CATEGORY**: `restaurant`
- **EXACT IMAGE WE NEED**: Authentic photograph of OTDC Nimantran authentic Odia cuisine restaurant (Bhubaneswar / Puri).
- **WHAT IS ACCEPTABLE**: OTDC Nimantran restaurant exterior/interior OR authentic Kansa (bell-metal) Odia thali served at Nimantran.
- **WHAT IS NOT ACCEPTABLE**: Generic multi-cuisine restaurant, buffet spreads, fast food.
- **COPY-PASTE SEARCH QUERIES**:
  - `"OTDC Nimantran" Bhubaneswar authentic Odia restaurant`
  - `"Nimantran" OTDC restaurant exterior photograph`
  - `"Nimantran" Odisha Tourism restaurant food`
  - `"OTDC Nimantran" Bhubaneswar high resolution`

```yaml
ID: food_khurda_002
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---

### 24. Golbazar Chaula Bara & Tiffin Corner, Sambalpur
- **INTERNAL ID**: `food_sambalpur_001`
- **DISTRICT**: Sambalpur
- **CATEGORY**: `street_food_market`
- **EXACT IMAGE WE NEED**: Authentic photograph of Western Odisha Chaula Bara and street tiffin at Golbazar, Sambalpur.
- **WHAT IS ACCEPTABLE**: Freshly fried crispy rice-flour Chaula Bara served with spicy tomato/chili chutney OR Golbazar evening street food stall.
- **WHAT IS NOT ACCEPTABLE**: South Indian medu vada, plain pakodas, generic fried snacks.
- **COPY-PASTE SEARCH QUERIES**:
  - `"Chaula Bara" Sambalpur Golbazar authentic street food`
  - `"Chaula Bara" Sambalpur Odisha traditional snack`
  - `"Sambalpur Chaula Bara" photograph high resolution`
  - `"Chaula Bara" Wikimedia Commons`

```yaml
ID: food_sambalpur_001
SOURCE URL: ""
SOURCE TYPE: "" # wikimedia | official | user_supplied | licensed
LICENSE/PERMISSION: "" # e.g. CC BY-SA 4.0, Public Domain
NOTES: ""
```

---
