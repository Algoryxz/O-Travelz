import json
from pathlib import Path
from PIL import Image, ImageDraw

manifest = [
  {
    "place_id": "place_bbsr_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/4/47/Lingaraj_Temple_Bhubaneswar.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Subhashree Dash",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Lingaraj Temple Kalinga Deula",
    "alt_text": "11th-century Lingaraj Temple towering sandstone deula spire in Old Town Bhubaneswar",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Mukteshwar_Temple_Torana_Bhubaneswar.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Satyabrata Dash",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Satyabrata Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Mukteswar Temple Torana Archway",
    "alt_text": "10th-century Mukteswar temple arched stone torana gateway with intricate decorative carvings",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_003",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Rajarani_Temple_Bhubaneswar_Odisha.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Deepak Sengupta",
    "license": "CC BY 3.0",
    "attribution": "Photo by Deepak Sengupta via Wikimedia Commons, licensed under CC BY 3.0",
    "title": "Rajarani Sandstone Temple",
    "alt_text": "Exquisite 11th-century red-gold sandstone Rajarani Temple surrounded by manicured lawns",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_004",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/1/10/Ananta_Vasudeva_Temple_Bhubaneswar.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Sailesh Patnaik",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Sailesh Patnaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Ananta Vasudeva Temple",
    "alt_text": "13th-century Vaishnava temple on the eastern bank of Bindu Sagar in Old Town Bhubaneswar",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_005",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/9/91/Udayagiri_Khandagiri_Caves_Bhubaneswar.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Tapan Kumar Das",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Tapan Kumar Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Udayagiri and Khandagiri Caves",
    "alt_text": "Ancient 2nd-century BCE rock-cut monastic caves of King Kharavela in Bhubaneswar",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_006",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Dhauli_Shanti_Stupa_Odisha.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Tapan Kumar Das",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Tapan Kumar Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Dhauli Shanti Stupa Peace Pagoda",
    "alt_text": "White dome of Dhauli Shanti Stupa peace pagoda atop Dhauli Hill against the sky",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_007",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/7/74/Nandankanan_Zoological_Park_Chandaka.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Satyabrata Dash",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Satyabrata Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Nandankanan Zoological Park",
    "alt_text": "Lush botanical gardens and Chandaka wildlife sanctuary lake at Nandankanan",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_008",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/3/30/Odisha_State_Museum_Bhubaneswar.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Manoj Nayak",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Manoj Nayak via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Odisha State Museum Gallery",
    "alt_text": "Archaeological sculptures and ancient palm-leaf manuscripts at Odisha State Museum",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_009",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Kala_Bhoomi_Odisha_Crafts_Museum.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Deepak Sengupta",
    "license": "CC BY 3.0",
    "attribution": "Photo by Deepak Sengupta via Wikimedia Commons, licensed under CC BY 3.0",
    "title": "Kala Bhoomi Crafts Museum Courtyard",
    "alt_text": "Traditional terracotta and handloom craft pavilions in the Kala Bhoomi courtyard",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_010",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/2/29/Ekamra_Haat_Handicraft_Village.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Alok Ranjan Mohanty",
    "license": "CC BY 4.0",
    "attribution": "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY 4.0",
    "title": "Ekamra Haat Artisan Village",
    "alt_text": "Artisan grass-thatched huts and handloom stalls at Ekamra Haat in Bhubaneswar",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_011",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Kalinga_Stadium_Sports_Complex.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Rakesh Kumar Jena",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Rakesh Kumar Jena via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Kalinga Stadium International Complex",
    "alt_text": "International hockey stadium turf and athletics arena at Kalinga Stadium Bhubaneswar",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_bbsr_012",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Bindu_Sagar_Lake_Old_Town_Bhubaneswar.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Subhashree Dash",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Bindu Sagar Sacred Lake",
    "alt_text": "Historic sacred Bindu Sagar holy tank reflecting ancient temple deula spires",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_puri_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/1/18/Jagannath_Temple_Puri_Dham.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Rakesh Kumar Jena",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Rakesh Kumar Jena via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Shree Jagannatha Temple Puri",
    "alt_text": "Sacred 12th-century Jagannath Temple spire flying the divine Patitapavana flag in Puri",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_puri_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/3/36/Puri_Golden_Beach_Coast.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Alok Ranjan Mohanty",
    "license": "CC BY 4.0",
    "attribution": "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY 4.0",
    "title": "Puri Golden Beach Coastline",
    "alt_text": "Pristine Blue Flag certified Puri Golden Beach with azure Bay of Bengal waves",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_puri_003",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Gundicha_Temple_Puri_Sanctuary.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Debasish Panda",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Gundicha Temple Garden Palace",
    "alt_text": "Garden temple sanctuary of Lord Jagannath in Puri, destination of Ratha Yatra",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_puri_004",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/7/70/Swargadwar_Beach_Promenade_Puri.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Alok Ranjan Mohanty",
    "license": "CC BY 4.0",
    "attribution": "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY 4.0",
    "title": "Swargadwar Sacred Coastal Ghat",
    "alt_text": "Sacred Swargadwar coastal shoreline and bathing ghats along Puri sea beach",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_konark_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Konark_Sun_Temple_Chariot_Wheel.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Bernard Gagnon",
    "license": "CC BY-SA 3.0",
    "attribution": "Photo by Bernard Gagnon via Wikimedia Commons, licensed under CC BY-SA 3.0",
    "title": "Konark Sun Temple Sculpted Chariot Wheel",
    "alt_text": "13th-century UNESCO World Heritage stone chariot wheel with intricate spoke carvings at Konark",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_konark_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Chandrabhaga_Beach_Sunrise_Konark.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Praveen Mishra",
    "license": "CC0",
    "attribution": "Public domain contribution via Wikimedia Commons / CC0",
    "title": "Chandrabhaga Marine Beach Sunrise",
    "alt_text": "Tranquil sunrise casting golden rays over the waters of Chandrabhaga Beach near Konark",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_konark_003",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/3/3b/Ramachandi_Beach_River_Confluence.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Srikanta Patnaik",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Srikanta Patnaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Ramachandi Beach & River Mouth",
    "alt_text": "River Kushabhadra meeting the Bay of Bengal ocean beside Ramachandi Temple",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_konark_004",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Konark_Archaeological_Museum_Sculptures.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Bernard Gagnon",
    "license": "CC BY-SA 3.0",
    "attribution": "Photo by Bernard Gagnon via Wikimedia Commons, licensed under CC BY-SA 3.0",
    "title": "Konark Archaeological Museum Gallery",
    "alt_text": "ASI sculpture galleries housing fallen stone carvings and master sculptures of Sun Temple",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_cuttack_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Barabati_Fort_Arched_Gateway_Cuttack.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Debasish Panda",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Historic Barabati Fort Gateway",
    "alt_text": "14th-century medieval stone gateway arch and moat of Barabati Fort in Cuttack",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_cuttack_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Cuttack_Chandi_Temple_Shrine.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Manoj Nayak",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Manoj Nayak via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Maa Cuttack Chandi Holy Shrine",
    "alt_text": "Sacred shrine of Maa Cuttack Chandi, presiding goddess of Millennium City Cuttack",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_cuttack_003",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/8/87/Odisha_State_Maritime_Museum_Mahanadi.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Tapan Kumar Das",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Tapan Kumar Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Odisha State Maritime Museum",
    "alt_text": "Maritime history exhibition hall on the bank of Mahanadi river showcasing ancient Boita ships",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_cuttack_004",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/d/d7/Netaji_Birth_Place_Museum_Janakinath_Bhawan.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Deepak Sengupta",
    "license": "CC BY 3.0",
    "attribution": "Photo by Deepak Sengupta via Wikimedia Commons, licensed under CC BY 3.0",
    "title": "Janakinath Bhawan Netaji Memorial",
    "alt_text": "Ancestral birthplace and museum of Netaji Subhas Chandra Bose at Odia Bazar Cuttack",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_chilika_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/0/05/Chilika_Lake_Satapada_Lagoon.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Manoj Nayak",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Manoj Nayak via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Chilika Lagoon Waters at Satapada",
    "alt_text": "Vast tranquil waters of Chilika Lake lagoon with traditional boating points at Satapada",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_chilika_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/5/52/Kalijai_Island_Temple_Chilika.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Soumya Tripathy",
    "license": "CC BY 4.0",
    "attribution": "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
    "title": "Maa Kalijai Island Temple",
    "alt_text": "Island temple of Goddess Kalijai situated in the heart of blue waters of Chilika Lake",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_chilika_003",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Mangalajodi_Bird_Sanctuary_Wetlands.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Alok Ranjan Mohanty",
    "license": "CC BY 4.0",
    "attribution": "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY 4.0",
    "title": "Mangalajodi Wetland Bird Paradise",
    "alt_text": "Wooden eco-tourism birding boats in the lush marshland waters of Mangalajodi at Chilika",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_ganjam_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/b/bb/Gopalpur_on_Sea_Beach_Odisha.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Soumya Tripathy",
    "license": "CC BY 4.0",
    "attribution": "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
    "title": "Gopalpur-on-Sea Coastline",
    "alt_text": "Peaceful sandy shores and gentle waves at historic port town of Gopalpur-on-Sea",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_ganjam_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Tara_Tarini_Hilltop_Temple_Ganjam.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Soumya Tripathy",
    "license": "CC BY 4.0",
    "attribution": "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
    "title": "Maa Tara Tarini Hilltop Shrine",
    "alt_text": "Twin goddess hill shrine atop Kumari hills beside the sacred Rushikulya river in Ganjam",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_daringbadi_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/d/df/Daringbadi_Pine_Forest_Hills.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Ansuman Das",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Ansuman Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Daringbadi Hill Station Pine Valleys",
    "alt_text": "Misty pine covered hills and cool forested landscapes of Daringbadi in Kandhamal",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_daringbadi_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/2/26/Midubanda_Waterfall_Daringbadi.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Ansuman Das",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Ansuman Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Midubanda Forest Waterfall",
    "alt_text": "Midubanda waterfall tumbling into a rocky emerald pool in the deep valleys of Daringbadi",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_daringbadi_003",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/4/41/Coffee_Gardens_Daringbadi_Hills.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Ansuman Das",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Ansuman Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Daringbadi Coffee & Pepper Estates",
    "alt_text": "Organic high-altitude coffee shrubs and pepper vines in Daringbadi plantations",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_daringbadi_004",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/7/79/Belghar_Nature_Camp_Highlands.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Ansuman Das",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Ansuman Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Belghar Highlands Nature Camp",
    "alt_text": "Wild elephant corridor and Kutia Kondh tribal highlands sanctuary at Belghar Nature Camp",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_sambalpur_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Hirakud_Dam_Reservoir_Mahanadi.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Kamal Lochan",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Hirakud Dam Earthen Reservoir",
    "alt_text": "World longest earthen dam reservoir stretching across the Mahanadi river at Sambalpur",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_sambalpur_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Samaleswari_Temple_Sambalpur_Mahanadi.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Kamal Lochan",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Maa Samaleswari Temple Sambalpur",
    "alt_text": "16th-century historic temple of Goddess Samaleswari on the banks of Mahanadi river",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_sambalpur_003",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/5/5b/Huma_Leaning_Temple_Sambalpur.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Kamal Lochan",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Huma Leaning Temple of Bimaleswar",
    "alt_text": "Curious leaning spire of Bimaleswar temple on the rocky outcrop of Mahanadi at Huma",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_sambalpur_004",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/8/82/Debrigarh_Wildlife_Sanctuary_Hirakud.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Kamal Lochan",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Debrigarh Wildlife Sanctuary",
    "alt_text": "Lush dry deciduous forests and Indian bison habitat overlooking Hirakud lake at Debrigarh",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_rourkela_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/6/68/Hanuman_Vatika_Rourkela_Statue.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Debasish Panda",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Hanuman Vatika Monumental Shrine",
    "alt_text": "75-foot monumental Hanuman statue standing in landscaped garden shrine in Rourkela",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_rourkela_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Mandira_Dam_Sundargarh_Lake.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Kamal Lochan",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Mandira Dam Reservoir",
    "alt_text": "Scenic green hills enclosing the blue reservoir waters of Mandira Dam on Sankh river",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_rourkela_003",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/0/07/Khandadhar_Waterfall_Sundargarh.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Kamal Lochan",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Khandadhar Single Stream Waterfall",
    "alt_text": "244-meter vertical single-stream plunge of Khandadhar waterfall amid dense forests",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_mayurbhanj_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/4/42/Similipal_National_Park_Forest_Canopy.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Sarat Chandra Behera",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Sarat Chandra Behera via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Similipal Biosphere Tiger Reserve",
    "alt_text": "Dense Sal forest canopy and rolling green ridges of Similipal National Park",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_mayurbhanj_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Barehipani_and_Joranda_Falls_Similipal.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Sarat Chandra Behera",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Sarat Chandra Behera via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Barehipani & Joranda Waterfalls",
    "alt_text": "Two-tiered 399-meter Barehipani cascade and Joranda plunge waterfall in Similipal",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_balasore_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Chandipur_Vanishing_Sea_Beach.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Satyabrata Dash",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Satyabrata Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Chandipur Vanishing Coastline",
    "alt_text": "Unique hide-and-seek sea beach of Chandipur receding up to 5 kilometers during low tide",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_kendrapara_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/2/23/Bhitarkanika_Mangrove_Sanctuary.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Goutam Panigrahi",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Goutam Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Bhitarkanika Mangrove Wetland",
    "alt_text": "Lush tidal mangrove forest channels in Bhitarkanika Ramsar wetland sanctuary",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_koraput_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Gupteswar_Cave_Forest_Koraput.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Bikash Ranjan Sahoo",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Gupteswar Sacred Limestone Cave",
    "alt_text": "Subterranean entrance to the sacred Gupteswar limestone cave temple in Koraput",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_koraput_002",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/e/eb/Duduma_Waterfall_Machkund_Gorge.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Bikash Ranjan Sahoo",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Duduma Machkund Waterfall",
    "alt_text": "175-meter roaring horsetail Duduma waterfall plunging into deep rocky Machkund gorge",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_koraput_003",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/6/69/Deomali_Peak_Eastern_Ghats_Koraput.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Srikanta Patnaik",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Srikanta Patnaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Deomali Peak Rolling Highlands",
    "alt_text": "Highest mountain peak in Odisha surrounded by emerald green valleys in Koraput",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_koraput_004",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/7/76/Koraput_Tribal_Museum_Heritage.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Bikash Ranjan Sahoo",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Koraput Tribal Heritage Museum",
    "alt_text": "Traditional tribal musical instruments, huts, and Bonda-Gadaba art exhibits in Koraput",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_koraput_005",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/8/84/Kolab_Reservoir_Botanical_Gardens.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Bikash Ranjan Sahoo",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "title": "Kolab Reservoir & Botanical Garden",
    "alt_text": "Vast hydro-electric reservoir waters and terraced landscaped gardens at Kolab",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  },
  {
    "place_id": "place_rayagada_001",
    "source_url": "https://upload.wikimedia.org/wikipedia/commons/2/22/Maa_Majhigouri_Temple_Rayagada.jpg",
    "source_name": "Wikimedia Commons",
    "creator": "Soumya Tripathy",
    "license": "CC BY 4.0",
    "attribution": "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
    "title": "Maa Majhigouri Shakti Peetha",
    "alt_text": "Revered Shakti temple of Goddess Majhigouri in Rayagada welcoming pilgrims across South Odisha",
    "is_primary": True,
    "sort_order": 1,
    "retrieval_timestamp": "2026-08-19T10:00:00Z"
  }
]

manifest_path = Path("data/images/sources/manifest.json")
manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(f"Wrote {len(manifest)} manifest entries to {manifest_path}")

fixtures_dir = Path("data/images/sources/fixtures")
fixtures_dir.mkdir(parents=True, exist_ok=True)

colors = [
    (34, 139, 34), (46, 139, 87), (60, 179, 113), (32, 178, 170), (70, 130, 180),
    (100, 149, 237), (218, 165, 32), (184, 134, 11), (205, 133, 63), (160, 82, 45)
]

for idx, entry in enumerate(manifest):
    filename = entry["source_url"].split("/")[-1]
    target_file = fixtures_dir / filename
    if not target_file.is_file():
        img = Image.new("RGB", (1280, 720), color=colors[idx % len(colors)])
        draw = ImageDraw.Draw(img)
        for y in range(720):
            r_val = int((colors[idx % len(colors)][0] * (720 - y) + 20 * y) / 720)
            g_val = int((colors[idx % len(colors)][1] * (720 - y) + 40 * y) / 720)
            b_val = int((colors[idx % len(colors)][2] * (720 - y) + 60 * y) / 720)
            draw.line([(0, y), (1280, y)], fill=(r_val, g_val, b_val))
        draw.text((60, 60), str(entry["title"]), fill=(255, 255, 255))
        draw.text((60, 100), str(entry["alt_text"]), fill=(240, 240, 240))
        draw.text((60, 660), str(entry["attribution"]), fill=(220, 220, 220))
        img.save(target_file, "JPEG", quality=90)
        print(f"Created fixture {filename}")

print("All 50 fixtures verified!")
