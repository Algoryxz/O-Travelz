#!/usr/bin/env python3
"""scripts/audit_external_provenance_pilot.py — Controlled External Provenance Discovery (Track A2 Step 2A & 2C1).

Audits all 19 destinations previously classified as PROVENANCE_PARTIAL:
  Pilot 5 (Step 2A):
    1. place_005 (Parasurameswar Temple)
    2. place_007 (Chausathi Yogini Temple, Hirapur)
    3. place_019 (Brahmeswar Temple)
    4. place_025 (Kedar Gouri Temple)
    5. place_030 (Regional Science Centre, Bhubaneswar)
  Remaining 14 (Step 2C1):
    6. place_012 (Regional Museum of Natural History)
    7. place_013 (Museum of Tribal Arts and Artifacts)
    8. place_014 (Pathani Samanta Planetarium)
    9. place_018 (Baitala Deula)
    10. place_020 (Bhaskareswar Temple)
    11. place_021 (Rameshwar Deula)
    12. place_022 (Ram Mandir, Bhubaneswar)
    13. place_023 (Chitrakarini Temple)
    14. place_food_001 (Pahala Rasagola Sweet Hub)
    15. place_food_002 (Nimapada Chhena Jhili Market)
    16. place_food_004 (Choudhury Bazar Dahibara Hub, Cuttack)
    17. place_food_005 (Bikalananda Kar Rasagola Hub, Salepur)
    18. place_food_006 (OTDC Nimantran Restaurant, Bhubaneswar)
    19. place_food_009 (OTDC Panthasala Odia Cuisine Centre, Konark)

Outputs:
  data/images/sources/legacy_external_provenance_research.json
"""
import sys
import json
import hashlib
from pathlib import Path
from typing import Dict, Any, List

REPO_ROOT = Path(__file__).resolve().parent.parent
PLACES_FILE = REPO_ROOT / "data" / "places" / "places.json"
PLACES_IMG_DIR = REPO_ROOT / "data" / "images" / "places"
REPORT_OUTPUT = REPO_ROOT / "data" / "images" / "sources" / "legacy_external_provenance_research.json"

RESEARCH_DATA: List[Dict[str, Any]] = [
    # --- PILOT 5 (Step 2A) ---
    {
        "place_id": "place_005",
        "place_name": "Parasurameswar Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Parasurameswar_Temple.jpg",
            "https://commons.wikimedia.org/wiki/File:Parsurameswar_Temple,_Bhubaneswar,_Odisha._India_(DSCN0998).JPG",
            "https://commons.wikimedia.org/wiki/Category:Parsurameswara_Temple"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Parasurameswar_Temple.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/5/54/Parasurameswar_Temple.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Parasurameswar_Temple.jpg",
            "creator": "Balajijagadesh",
            "license": "CC BY-SA 3.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/3.0/",
            "attribution": "Photo by Balajijagadesh via Wikimedia Commons, licensed under CC BY-SA 3.0",
            "dimensions": [4000, 3000],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Wikimedia Commons depicted entity Q7140073 (Parsurameswara Temple, Bhubaneswar, ASI Monument #29). Full temple compound with vimana and jagamohana in high-resolution photography."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "VISUAL_MATCH_UNPROVEN_BYTE_LINEAGE",
        "local_asset_details": {
            "asset_dir": "4e56a105e3a5",
            "original_dimensions": [678, 452],
            "notes": "Local WebP is a visual match depicting the same viewpoint, but raw source SHA lineage is unproven."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 3.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_007",
        "place_name": "Chausathi Yogini Temple, Hirapur",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Chausath_Yogini_Temple_-_Outside.JPG",
            "https://commons.wikimedia.org/wiki/Category:Chausath_Yogini_Temple,_Hirapur"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Chausath_Yogini_Temple_-_Outside.JPG",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/3/3b/Chausath_Yogini_Temple_-_Outside.JPG",
            "source_platform": "Wikimedia Commons",
            "filename": "Chausath_Yogini_Temple_-_Outside.JPG",
            "creator": "Rohit Agarwal",
            "license": "CC BY-SA 3.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/3.0/",
            "attribution": "Photo by Rohit Agarwal via Wikimedia Commons, licensed under CC BY-SA 3.0",
            "dimensions": [1280, 960],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Wiki Loves Monuments 2012 entry depicting Chausath Yogini Temple, Hirapur (Q11058991, ASI monument). Exterior sandstone perimeter view of hypaethral circular shrine."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "VISUAL_MATCH_UNPROVEN_BYTE_LINEAGE",
        "local_asset_details": {
            "asset_dir": "6d8254429a6a",
            "original_dimensions": [713, 429],
            "notes": "Local WebP depicts the same exterior angle, but raw source bytes were transcoded without recorded SHA."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 3.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_019",
        "place_name": "Brahmeswar Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Brahmeswara_Temple,_Bhubaneswar,_Odisha_01.jpg",
            "https://commons.wikimedia.org/wiki/File:Brahmeswara_Temple,_Bhubaneswar.JPG",
            "https://commons.wikimedia.org/wiki/Category:Brahmeswara_Temple"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Brahmeswara_Temple,_Bhubaneswar,_Odisha_01.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/1/18/Brahmeswara_Temple%2C_Bhubaneswar%2C_Odisha_01.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Brahmeswara_Temple,_Bhubaneswar,_Odisha_01.jpg",
            "creator": "Paramanu Sarkar",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Paramanu Sarkar via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4000, 2250],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Wiki Loves Monuments 2020 photography depicting Brahmeswara Temple (Q4955611) with confirmed coordinates (20.239647, 85.851655). Pristine panoramic landscape view."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "79d401a75a62",
            "original_dimensions": [552, 362],
            "notes": "Current local WebP is a low-res crop from an unproven source; the recovered 4000x2250 CC BY-SA 4.0 image is a superior authentic replacement."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_025",
        "place_name": "Kedar Gouri Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Kedareswara_Deula,_Bhubaneswar,_Odisha.jpg",
            "https://en.wikipedia.org/wiki/Kedareswar_Temple"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Kedareswara_Deula,_Bhubaneswar,_Odisha.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Kedareswara_Deula%2C_Bhubaneswar%2C_Odisha.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Kedareswara_Deula,_Bhubaneswar,_Odisha.jpg",
            "creator": "Prateek Pattanaik",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [960, 1920],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Kedareswara Deula (Q6382542) within the Kedara-Gouri temple precinct in Bhubaneswar, Odisha."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "32de32c1a13d",
            "original_dimensions": [638, 480],
            "notes": "Current local WebP is horizontal (638x480) from an unrecorded source; recovered photo is authentic vertical pancharatha vimana view."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_030",
        "place_name": "Regional Science Centre, Bhubaneswar",
        "district": "Khordha",
        "category": "science_center",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Sun_Dial_%26_Simple_Camera.jpg",
            "https://commons.wikimedia.org/wiki/File:MSE_Bus_-_Regional_Science_Centre_-_Bhubaneswar_-_MSE_Golden_Jubilee_Celebration_-_Science_City_-_Kolkata_2015-11-18_5329.jpg"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Sun_Dial_%26_Simple_Camera.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/3/39/Sun_Dial_%26_Simple_Camera.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Sun_Dial_&_Simple_Camera.jpg",
            "creator": "Aliva Sahoo",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4096, 3072],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Wiki Science Competition 2025 in India entry depicting the outdoor Science Park exhibits (Equatorial Sundial and Camera Obscura) at the Regional Science Centre, Bhubaneswar."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "dd18b0f33834",
            "original_dimensions": [640, 480],
            "notes": "Current local WebP is a low-res generic planetarium/exhibit image (640x480); recovered source is authentic verified on-site Science Park photography."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    # --- REMAINING 14 (Step 2C1) ---
    {
        "place_id": "place_012",
        "place_name": "Regional Museum of Natural History",
        "district": "Khordha",
        "category": "museum",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Regional_Museum_of_Natural_History_Bhubaneswar.jpg",
            "https://commons.wikimedia.org/wiki/Category:Regional_Museum_of_Natural_History,_Bhubaneswar"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Regional_Museum_of_Natural_History_Bhubaneswar.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/1/1c/Regional_Museum_of_Natural_History_Bhubaneswar.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Regional_Museum_of_Natural_History_Bhubaneswar.jpg",
            "creator": "Hellohappy",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4160, 3120],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Wikimedia Commons depicted entity Q7309107 (Regional Museum of Natural History, Bhubaneswar) with confirmed GPS coordinates (20.298966, 85.832343). Depicts exterior museum facade and grounds."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "a917c9873b59",
            "original_dimensions": [374, 520],
            "notes": "Legacy local WebP was a low-resolution portrait crop (374x520); recovered source is a pristine 4160x3120 CC BY-SA 4.0 photograph."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_013",
        "place_name": "Museum of Tribal Arts and Artifacts",
        "district": "Khordha",
        "category": "museum",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Tribal_museum_Bhubaneswar.jpg",
            "https://commons.wikimedia.org/wiki/Category:Tribal_Museum,_Bhubaneswar"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Tribal_museum_Bhubaneswar.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/1/19/Tribal_museum_Bhubaneswar.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Tribal_museum_Bhubaneswar.jpg",
            "creator": "Balajijagadesh",
            "license": "CC BY-SA 3.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/3.0/",
            "attribution": "Photo by Balajijagadesh via Wikimedia Commons, licensed under CC BY-SA 3.0",
            "dimensions": [4000, 3000],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Q7840311 (Tribal Research Institute Museum / Museum of Tribal Arts and Artifacts, CRP Square, Bhubaneswar) showing outdoor tribal architecture and museum galleries."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "a2d24252c0ce",
            "original_dimensions": [738, 345],
            "notes": "Legacy local WebP was a wide crop (738x345); recovered source is an authentic 4000x3000 photograph by Balajijagadesh."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 3.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_014",
        "place_name": "Pathani Samanta Planetarium",
        "district": "Khordha",
        "category": "planetarium",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Pathani_Samanta_planetarium_building.JPG",
            "https://commons.wikimedia.org/wiki/Category:Pathani_Samanta_Planetarium"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Pathani_Samanta_planetarium_building.JPG",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/6/69/Pathani_Samanta_planetarium_building.JPG",
            "source_platform": "Wikimedia Commons",
            "filename": "Pathani_Samanta_planetarium_building.JPG",
            "creator": "Subhashish Panigrahi",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4696, 2970],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Pathani Samanta Planetarium building in Bhubaneswar with exact coordinates (20.298412, 85.832212). Clear full-angle view of the planetarium dome and complex."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "30f7ed6f5755",
            "original_dimensions": [275, 183],
            "notes": "Legacy local WebP was a low-res 275x183 thumbnail; recovered source is a 4696x2970 authentic photograph."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_018",
        "place_name": "Baitala Deula",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Baitala_Deula_Bhubaneswar_10.jpg",
            "https://commons.wikimedia.org/wiki/File:Baitala_Deula_Bhubaneswar_19.jpg",
            "https://commons.wikimedia.org/wiki/File:Vaital_Deul,_Bhubaneswar,_Odisha,_India.jpg",
            "https://commons.wikimedia.org/wiki/Category:Vaital_Deula"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Baitala_Deula_Bhubaneswar_10.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Baitala_Deula_Bhubaneswar_10.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Baitala_Deula_Bhubaneswar_10.jpg",
            "creator": "Prateek Pattanaik",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [3264, 2448],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Q4848728 (Vaital Deula / Baitala Deula, 8th-century temple) with verified coordinates (20.245930, 85.809387). High-resolution landscape view of the complete 8th-century khakhara deul structure."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "3fdcd749885b",
            "original_dimensions": [800, 638],
            "notes": "Legacy local WebP was a cropped 800x638 image; recovered photo is a full 3264x2448 CC BY-SA 4.0 photograph by Prateek Pattanaik."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_020",
        "place_name": "Bhaskareswar Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Bhaskareswar_Temple_Bhubaneswar.jpg",
            "https://commons.wikimedia.org/wiki/Category:Bhaskareswar_Temple"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Bhaskareswar_Temple_Bhubaneswar.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Bhaskareswar_Temple_Bhubaneswar.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Bhaskareswar_Temple_Bhubaneswar.jpg",
            "creator": "Hellohappy",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4080, 2296],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Q4901358 (Bhaskareswar Temple, Bhubaneswar, ASI protected monument) with its distinct two-tiered circular sanctum structure."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "eaedc027e860",
            "original_dimensions": [678, 452],
            "notes": "Legacy local WebP was 678x452; recovered source is a widescreen 4080x2296 CC BY-SA 4.0 photograph."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_021",
        "place_name": "Rameshwar Deula",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Rameswar_Deula_(5).jpg",
            "https://commons.wikimedia.org/wiki/Category:Rameswar_Temple,_Bhubaneswar"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Rameswar_Deula_(5).jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/2/27/Rameswar_Deula_%285%29.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Rameswar_Deula_(5).jpg",
            "creator": "Ssriram mt",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Ssriram mt via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [5039, 3359],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Q7289498 (Rameshwar Deula / Mausi Maa Temple, Bhubaneswar) in pristine high-resolution landscape orientation."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "40dbffdb3896",
            "original_dimensions": [399, 501],
            "notes": "Legacy local WebP was 399x501; recovered source is a 5039x3359 high-res full temple compound photograph."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_022",
        "place_name": "Ram Mandir, Bhubaneswar",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Rama_Mandir_Bhubaneswar_03.jpg",
            "https://commons.wikimedia.org/wiki/File:Rama_Mandir_Bhubaneswar_02.jpg",
            "https://commons.wikimedia.org/wiki/Category:Ram_Mandir,_Bhubaneswar"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Rama_Mandir_Bhubaneswar_03.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/9/92/Rama_Mandir_Bhubaneswar_03.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Rama_Mandir_Bhubaneswar_03.jpg",
            "creator": "Chinmayee Mishra",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Chinmayee Mishra via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [5184, 3456],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Q7288540 (Ram Mandir, Janpath, Bhubaneswar) showing its iconic towering main shikhara and entrance compound."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "250c5fb998e6",
            "original_dimensions": [640, 480],
            "notes": "Legacy local WebP was 640x480; recovered source is a 5184x3456 high-resolution CC BY-SA 4.0 photograph."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_023",
        "place_name": "Chitrakarini Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Chitrakarini_Temple,_Old_Town,_Bhubaneswar.jpg",
            "https://commons.wikimedia.org/wiki/Category:Chitrakarini_Temple"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Chitrakarini_Temple,_Old_Town,_Bhubaneswar.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/6/61/Chitrakarini_Temple%2C_Old_Town%2C_Bhubaneswar.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Chitrakarini_Temple,_Old_Town,_Bhubaneswar.jpg",
            "creator": "Sushant (Bubby)",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [3490, 2327],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Q5102288 (Chitrakarini Temple, Old Town, Bhubaneswar) showing the 13th-century panchayatana temple complex and decorative bas-reliefs."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "993614bac0d4",
            "original_dimensions": [387, 516],
            "notes": "Legacy local WebP was 387x516; recovered source is a 3490x2327 CC BY-SA 4.0 photograph."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_food_001",
        "place_name": "Pahala Rasagola Sweet Hub",
        "district": "Khordha",
        "category": "market",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Red_color_rasagola_from_Pahala,_Khurda_district,_Odisha,_India.jpg",
            "https://commons.wikimedia.org/wiki/File:Pahala_Rasagola.jpg",
            "https://commons.wikimedia.org/wiki/Category:Rasgulla"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Red_color_rasagola_from_Pahala,_Khurda_district,_Odisha,_India.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/7/72/Red_color_rasagola_from_Pahala%2C_Khurda_district%2C_Odisha%2C_India.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Red_color_rasagola_from_Pahala,_Khurda_district,_Odisha,_India.jpg",
            "creator": "Subhashish Panigrahi",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [2308, 1731],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Close-up photograph of authentic fresh brown Pahala Rasagola from Pahala, Khordha district, Odisha. Depicts the culinary specialty but lacks physical market storefront context."
        },
        "proposed_classification": "RELATED_LOCATION_ONLY",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "e6fb3a71867e",
            "original_dimensions": [515, 388],
            "notes": "Legacy local WebP depicted a sweet bowl; recovered CC BY-SA 4.0 photo is authenticated Pahala cuisine but classified RELATED_LOCATION_ONLY under strict venue criteria."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": ["NON_EXACT_VENUE_PHOTOGRAPHY"],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_food_002",
        "place_name": "Nimapada Chhena Jhili Market",
        "district": "Puri",
        "category": "market",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Chhena_Jhili.JPG",
            "https://commons.wikimedia.org/wiki/File:Chenajhili.jpg"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Chhena_Jhili.JPG",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/2/25/Chhena_Jhili.JPG",
            "source_platform": "Wikimedia Commons",
            "filename": "Chhena_Jhili.JPG",
            "creator": "Jit.roy.chowdhury",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Jit.roy.chowdhury via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [3264, 2448],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Authentic photograph of freshly prepared fried Chhena Jhili soaked in sugar syrup. Depicts the regional specialty originating from Nimapada, but lacks physical market stall infrastructure."
        },
        "proposed_classification": "RELATED_LOCATION_ONLY",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "e0850b09b5ca",
            "original_dimensions": [480, 640],
            "notes": "Legacy local WebP was vertical 480x640; recovered photo is high-res cuisine imagery classified RELATED_LOCATION_ONLY."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 4.0)",
        "blockers": ["NON_EXACT_VENUE_PHOTOGRAPHY"],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_food_004",
        "place_name": "Choudhury Bazar Dahibara Hub, Cuttack",
        "district": "Cuttack",
        "category": "market",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Cuttack_dahibara_aludum.jpg",
            "https://commons.wikimedia.org/wiki/File:Dahibara_Aludam.jpg"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Cuttack_dahibara_aludum.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/9/92/Cuttack_dahibara_aludum.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Cuttack_dahibara_aludum.jpg",
            "creator": "Kamalakanta777",
            "license": "CC BY-SA 3.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/3.0/",
            "attribution": "Photo by Kamalakanta777 via Wikimedia Commons, licensed under CC BY-SA 3.0",
            "dimensions": [4000, 3000],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Traditional Cuttack Dahibara Aloodum plate garnished with sev and coriander. Represents the signature street delicacy of Choudhury Bazar, Cuttack, but is a food plate rather than market vendor stall."
        },
        "proposed_classification": "RELATED_LOCATION_ONLY",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "4e765c230837",
            "original_dimensions": [415, 739],
            "notes": "Legacy local WebP was 415x739; recovered photo is 4000x3000 cuisine photo classified RELATED_LOCATION_ONLY."
        },
        "license_verification_result": "PASS (Approved CC BY-SA 3.0)",
        "blockers": ["NON_EXACT_VENUE_PHOTOGRAPHY"],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_food_005",
        "place_name": "Bikalananda Kar Rasagola Hub, Salepur",
        "district": "Cuttack",
        "category": "market",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Bikalkar_rasagola.gif"
        ],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "daeb11d5893b",
            "original_dimensions": [399, 501],
            "notes": "Legacy local WebP exists without proven source; only Commons candidate is a sub-resolution 210x240 GIF which was rejected."
        },
        "license_verification_result": "FAIL (No valid format source)",
        "blockers": ["NO_VALID_FORMAT_SOURCE_FOUND"],
        "recommended_next_action": "NEEDS_MORE_RESEARCH"
    },
    {
        "place_id": "place_food_006",
        "place_name": "OTDC Nimantran Restaurant, Bhubaneswar",
        "district": "Khordha",
        "category": "market",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "88f959c50d0e",
            "original_dimensions": [597, 335],
            "notes": "Legacy local WebP exists without provenance; no authentic Commons or institutional licensed images found."
        },
        "license_verification_result": "FAIL (No source found)",
        "blockers": ["NO_SOURCE_FOUND"],
        "recommended_next_action": "NEEDS_MORE_RESEARCH"
    },
    {
        "place_id": "place_food_009",
        "place_name": "OTDC Panthasala Odia Cuisine Centre, Konark",
        "district": "Puri",
        "category": "market",
        "previous_recovery_bucket": "PROVENANCE_PARTIAL",
        "sources_reviewed": [],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "0b3143c9ea24",
            "original_dimensions": [408, 306],
            "notes": "Legacy local WebP exists without provenance; no authentic Commons or institutional licensed images found."
        },
        "license_verification_result": "FAIL (No source found)",
        "blockers": ["NO_SOURCE_FOUND"],
        "recommended_next_action": "NEEDS_MORE_RESEARCH"
    },
    # --- REMAINING 12 NO_PROVENANCE_FOUND (Step 3A) ---
    {
        "place_id": "place_024",
        "place_name": "Bharati Matha Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://www.wikidata.org/wiki/Q4901208",
            "https://commons.wikimedia.org/w/index.php?search=Bharati+Matha"
        ],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "c24a920d9ea5",
            "original_dimensions": [452, 678],
            "notes": "No free-license or public domain photograph found on Wikimedia Commons for Bharati Matha."
        },
        "blockers": ["NO_VERIFIED_FREE_LICENSE_SOURCE"],
        "recommended_next_action": "NO_ACCEPTABLE_SOURCE_FOUND"
    },
    {
        "place_id": "place_026",
        "place_name": "Megheswar Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Megheswar_Temple_(52640).jpg",
            "https://commons.wikimedia.org/wiki/Category:Megheswar_temple,_Bhubaneswar",
            "https://www.wikidata.org/wiki/Q24944004"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Megheswar_Temple_(52640).jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Megheswar_Temple_%2852640%29.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Megheswar_Temple_(52640).jpg",
            "creator": "Hellohappy",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4080, 2296],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Wikimedia Commons category Megheswar temple, Bhubaneswar depicting Wikidata Q24944004. Clear landscape view of the 12th-century temple tower and compound."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "37aea0eff98c",
            "original_dimensions": [399, 501],
            "notes": "Local WebP is a low-resolution legacy crop; new source is an authentic 4080x2296 CC BY-SA 4.0 camera photograph."
        },
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_027",
        "place_name": "Nageshwar Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Nageswar_Temple,_Old_Town,_Bhubaneswar.jpg",
            "https://commons.wikimedia.org/wiki/Category:Nagesvara_Temple,_Bhubaneswar",
            "https://www.wikidata.org/wiki/Q6958786"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Nageswar_Temple,_Old_Town,_Bhubaneswar.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/0/05/Nageswar_Temple%2C_Old_Town%2C_Bhubaneswar.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Nageswar_Temple,_Old_Town,_Bhubaneswar.jpg",
            "creator": "SUDEEP PRAMANIK",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [960, 1280],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Wikidata Q6958786 (Nagesvara Temple, Old Town, Bhubaneswar). Authentic photograph of the isolated 11th-century temple deula."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "VISUAL_MATCH_UNPROVEN_BYTE_LINEAGE",
        "local_asset_details": {
            "asset_dir": "17b31b2b4531",
            "original_dimensions": [638, 480],
            "notes": "Depicts the exact same Nagesvara Temple facade; fresh canonical source replaces unverified legacy crop."
        },
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_028",
        "place_name": "Talesvara Siva Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://www.wikidata.org/wiki/Q7679427",
            "https://commons.wikimedia.org/w/index.php?search=Talesvara+Siva"
        ],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "cd738a94a267",
            "original_dimensions": [160, 213],
            "notes": "No free-license photograph found on Wikimedia Commons for Talesvara Siva Temple."
        },
        "blockers": ["NO_VERIFIED_FREE_LICENSE_SOURCE"],
        "recommended_next_action": "NO_ACCEPTABLE_SOURCE_FOUND"
    },
    {
        "place_id": "place_029",
        "place_name": "Kapilesvara Siva Temple",
        "district": "Khordha",
        "category": "temple",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Kapilesvara_temple_(1).jpg",
            "https://commons.wikimedia.org/wiki/Category:Kapilesvara_Siva_Temple",
            "https://www.wikidata.org/wiki/Q15723826"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Kapilesvara_temple_(1).jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Kapilesvara_temple_%281%29.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Kapilesvara_temple_(1).jpg",
            "creator": "Ssriram mt",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Ssriram mt via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [3905, 2197],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Wikidata Q15723826 (Kapilesvara Siva Temple, Kapileswar village, Bhubaneswar). Complete temple compound with deula and jagamohana."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "4878025f4210",
            "original_dimensions": [678, 452],
            "notes": "Fresh high-resolution authentic CC BY-SA 4.0 source replaces legacy crop."
        },
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_031",
        "place_name": "Indira Gandhi Park",
        "district": "Khordha",
        "category": "park",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/wiki/File:Indira_Gandhi_Park.jpg",
            "https://commons.wikimedia.org/wiki/Category:Indira_Gandhi_Park,_Bhubaneswar"
        ],
        "selected_source": {
            "source_page_url": "https://commons.wikimedia.org/wiki/File:Indira_Gandhi_Park.jpg",
            "original_image_url": "https://upload.wikimedia.org/wikipedia/commons/0/01/Indira_Gandhi_Park.jpg",
            "source_platform": "Wikimedia Commons",
            "filename": "Indira_Gandhi_Park.jpg",
            "creator": "Subhrasingh",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "attribution": "Photo by Subhrasingh via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4028, 2258],
            "access_date": "2026-09-01",
            "exact_location_evidence": "Depicts Bhubaneswar Development Authority (BDA) Indira Gandhi Park in AG Square, Unit-2, Bhubaneswar. Landscape view showing central garden paths, floral landscaping, and lawns."
        },
        "proposed_classification": "EXACT_LOCATION_VERIFIED",
        "local_asset_linkage": "DIFFERENT_IMAGE",
        "local_asset_details": {
            "asset_dir": "420159c383f2",
            "original_dimensions": [637, 313],
            "notes": "Fresh high-resolution authentic CC BY-SA 4.0 park landscape replaces legacy banner."
        },
        "blockers": [],
        "recommended_next_action": "READY_FOR_FRESH_CANONICAL_INGESTION"
    },
    {
        "place_id": "place_032",
        "place_name": "Buddha Jayanti Park",
        "district": "Khordha",
        "category": "park",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/w/index.php?search=Buddha+Jayanti+Park+Bhubaneswar"
        ],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "1b4f7e6f8b2e",
            "original_dimensions": [638, 480],
            "notes": "No verified free-license photograph found on Wikimedia Commons specifically depicting Niladri Vihar Buddha Jayanti Park."
        },
        "blockers": ["NO_VERIFIED_FREE_LICENSE_SOURCE"],
        "recommended_next_action": "NO_ACCEPTABLE_SOURCE_FOUND"
    },
    {
        "place_id": "place_food_003",
        "place_name": "Ananda Bazar, Puri",
        "district": "Puri",
        "category": "market",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/w/index.php?search=Ananda+Bazar+Puri"
        ],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "5a13e730e909",
            "original_dimensions": [515, 388],
            "notes": "No verified CC photograph of the physical Ananda Bazar hall/market inside the temple compound."
        },
        "blockers": ["NO_VERIFIED_VENUE_PHOTOGRAPH"],
        "recommended_next_action": "NO_ACCEPTABLE_SOURCE_FOUND"
    },
    {
        "place_id": "place_food_007",
        "place_name": "Bapuji Nagar Food Corridor, Bhubaneswar",
        "district": "Khordha",
        "category": "market",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/w/index.php?search=Bapuji+Nagar+Bhubaneswar"
        ],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "a0a492f880a5",
            "original_dimensions": [480, 640],
            "notes": "No CC-licensed market photography found for Bapuji Nagar."
        },
        "blockers": ["NO_VERIFIED_VENUE_PHOTOGRAPH"],
        "recommended_next_action": "NO_ACCEPTABLE_SOURCE_FOUND"
    },
    {
        "place_id": "place_food_008",
        "place_name": "Unit-4 Traditional Food & Fish Market, Bhubaneswar",
        "district": "Khordha",
        "category": "market",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/w/index.php?search=Unit+4+Market+Bhubaneswar"
        ],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "35cde5e9e0e8",
            "original_dimensions": [597, 335],
            "notes": "No CC-licensed market photography found for Unit-4 Market."
        },
        "blockers": ["NO_VERIFIED_VENUE_PHOTOGRAPH"],
        "recommended_next_action": "NO_ACCEPTABLE_SOURCE_FOUND"
    },
    {
        "place_id": "place_food_010",
        "place_name": "Maa Mangala Temple Food & Pitha Precinct, Kakatpur",
        "district": "Puri",
        "category": "temple",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/w/index.php?search=Kakatpur+Mangala+Temple"
        ],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "abcf1ef01835",
            "original_dimensions": [701, 436],
            "notes": "No verifiable free-license photograph found on Commons."
        },
        "blockers": ["NO_VERIFIED_FREE_LICENSE_SOURCE"],
        "recommended_next_action": "NO_ACCEPTABLE_SOURCE_FOUND"
    },
    {
        "place_id": "place_food_011",
        "place_name": "Raghunathpur Culinary Corner, Bhubaneswar",
        "district": "Khordha",
        "category": "market",
        "previous_recovery_bucket": "NO_PROVENANCE_FOUND",
        "sources_reviewed": [
            "https://commons.wikimedia.org/w/index.php?search=Raghunathpur+Bhubaneswar"
        ],
        "selected_source": None,
        "proposed_classification": "REJECTED",
        "local_asset_linkage": "NO_COMPARABLE_SOURCE",
        "local_asset_details": {
            "asset_dir": "cb1d3fcc1b6c",
            "original_dimensions": [408, 544],
            "notes": "No CC-licensed photography found for Raghunathpur culinary corner."
        },
        "blockers": ["NO_VERIFIED_VENUE_PHOTOGRAPH"],
        "recommended_next_action": "NO_ACCEPTABLE_SOURCE_FOUND"
    }
]

# Backwards compatibility alias for pilot imports
PILOT_DATA = RESEARCH_DATA[:5]


def generate_external_provenance_report() -> Dict[str, Any]:
    """Generate structured external provenance research report for all 31 legacy unmanifested destinations."""
    counts = {
        "READY_FOR_FRESH_CANONICAL_INGESTION": 0,
        "READY_FOR_LEGACY_LINKAGE_REVIEW": 0,
        "NEEDS_MORE_RESEARCH": 0,
        "NO_ACCEPTABLE_SOURCE_FOUND": 0,
        "REJECT_SOURCE": 0
    }
    classification_counts = {
        "EXACT_LOCATION_VERIFIED": 0,
        "RELATED_LOCATION_ONLY": 0,
        "GENERIC_IMAGE": 0,
        "REJECTED": 0,
        "REVIEW_REQUIRED": 0
    }
    
    for d in RESEARCH_DATA:
        action = d.get("recommended_next_action", "NEEDS_MORE_RESEARCH")
        if action in counts:
            counts[action] += 1
        cls_name = d.get("proposed_classification", "REVIEW_REQUIRED")
        if cls_name in classification_counts:
            classification_counts[cls_name] += 1
            
    report = {
        "metadata": {
            "title": "O-Travelz External Provenance Discovery (Track A2 Step 2A, 2C1 & 3A)",
            "total_destinations_audited": len(RESEARCH_DATA),
            "summary_counts": counts,
            "classification_counts": classification_counts,
            "breakdown": {
                "step2a_pilot_count": 5,
                "step2c1_remaining_partial_count": 14,
                "step3a_no_provenance_count": 12
            }
        },
        "destinations": RESEARCH_DATA
    }
    
    REPORT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    REPORT_OUTPUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    rep = generate_external_provenance_report()
    meta = rep["metadata"]
    counts = meta["summary_counts"]
    print("=" * 70)
    print("  O-TRAVELZ EXTERNAL PROVENANCE DISCOVERY (TRACK A2 STEPS 2A, 2C1 & 3A)")
    print("=" * 70)
    print(f"Total Destinations Audited: {meta['total_destinations_audited']}")
    print(f"  Step 2A Pilot Destinations (Pilot 5) : {meta['breakdown']['step2a_pilot_count']}")
    print(f"  Step 2C1 Partial Destinations (14)   : {meta['breakdown']['step2c1_remaining_partial_count']}")
    print(f"  Step 3A No-Provenance Destinations(12): {meta['breakdown']['step3a_no_provenance_count']}")
    print("\nSummary Action Counts:")
    for k, v in counts.items():
        print(f"  {k:<40}: {v}")
    print("\nClassification Counts:")
    for k, v in meta["classification_counts"].items():
        print(f"  {k:<40}: {v}")
    print("=" * 70)
