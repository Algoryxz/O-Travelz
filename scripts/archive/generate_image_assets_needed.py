import json
from pathlib import Path

# Load places.json
with open('data/places/places.json', 'r', encoding='utf-8') as f:
    places = json.load(f)

# Priority mapping heuristics:
# P0: Major iconic heritage/temple destinations & high-traffic hubs
# P1: Popular museums, parks, planetarium, science center
# P2: Culinary hubs & regional specialty food corridors

ASSET_METADATA = {
    "place_cuttack_002": {
        "priority": "P0",
        "district": "Cuttack",
        "current_source": "data/images/places/place_cuttack_002/14877b098df9 (Bhoga sweet offering - unsafe)",
        "reason": "Current ingested asset File:Chandi mandira bhoga Cuttack Odisha.jpg depicts food offerings (bhoga in bowls) rather than the temple structure. Needs authentic architectural photo of the temple facade.",
        "recommended_subject": "Exterior facade of Cuttack Chandi Temple showing the main shrine, entryway, and devotees courtyard.",
        "recommended_filename": "place_cuttack_002_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_018": {
        "priority": "P0",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "8th-century Khakhara-style deula with rare Tantric Chamunda carvings; currently represented by neutral SVG placeholder.",
        "recommended_subject": "Exterior perspective of the rectangular Khakhara deula tower and detailed sandstone temple carvings.",
        "recommended_filename": "place_018_baitala_deula_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_019": {
        "priority": "P0",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "11th-century Somavamsi architectural masterpiece with four corner shrines (panchayatana); currently using neutral SVG placeholder.",
        "recommended_subject": "Full courtyard view of Brahmeswar Temple showing main rekha deula and surrounding miniature corner shrines.",
        "recommended_filename": "place_019_brahmeswar_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_007": {
        "priority": "P0",
        "district": "Khordha (Hirapur)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "9th-century hypaethral (roofless) circular yogini shrine with 64 black chlorite idols; iconic heritage destination without authentic photo.",
        "recommended_subject": "Circular open-air hypaethral sanctum wall showing interior black stone Yogini sculptures.",
        "recommended_filename": "place_007_chausathi_yogini_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_005": {
        "priority": "P0",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "7th-century Sailodbhava period temple, one of the oldest surviving stone temples in Bhubaneswar.",
        "recommended_subject": "Intricate stone carving reliefs on the jagamohana lattice windows and sikhara of Parasurameswar Temple.",
        "recommended_filename": "place_005_parasurameswar_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_022": {
        "priority": "P0",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "Prominent central city landmark in Janpath with towering red spires and night illumination.",
        "recommended_subject": "Front angle view of Ram Mandir spires and landscaped temple gardens along Janpath.",
        "recommended_filename": "place_022_ram_mandir_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_020": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "Unique double-storied monolithic sandstone deula enshrining a 9-foot Lingam.",
        "recommended_subject": "Exterior stone structure of Bhaskareswar Temple surrounded by archaeological lawns.",
        "recommended_filename": "place_020_bhaskareswar_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_023": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "Historic 13th-century sandstone temple with rich erotic and mythological carvings.",
        "recommended_subject": "Exterior elevation and carved wall panels of Chitrakarini Temple near Lingaraj precinct.",
        "recommended_filename": "place_023_chitrakarini_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_024": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "Ancient monastery complex established by Adi Shankaracharya disciples in Old Town.",
        "recommended_subject": "Matha entrance and historic monastic courtyard architecture in Old Town.",
        "recommended_filename": "place_024_bharati_matha_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_025": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "Twin temple complex dedicated to Lord Shiva and Goddess Gouri with sacred spring kundas.",
        "recommended_subject": "Twin deula spires and sacred natural spring tank at Kedar Gouri complex.",
        "recommended_filename": "place_025_kedar_gouri_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_026": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "12th-century Ganga-era temple famous for cloud-embellished sculpture panels.",
        "recommended_subject": "Exterior sandstone deula of Megheswar Temple and sacred tank backdrop.",
        "recommended_filename": "place_026_megheswar_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_027": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "Well-preserved miniature rekha deula in an archaeological enclave in Old Town.",
        "recommended_subject": "Frontal stone deula elevation of Nageshwar Temple amidst manicured grass.",
        "recommended_filename": "place_027_nageshwar_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_028": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "Early 8th-century stone temple near Kedar Gouri lane with classical Kalinga relief work.",
        "recommended_subject": "Preserved stone sanctum and entrance gate of Talesvara Siva Temple.",
        "recommended_filename": "place_028_talesvara_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_029": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "14th-century temple precinct built during Gajapati reign on the banks of Manikarnika kunda.",
        "recommended_subject": "Temple gate and stone deula reflected across the Manikarnika water tank.",
        "recommended_filename": "place_029_kapilesvara_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_021": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "Mausi Maa temple of Lingaraj deity, key hub of Rukuna Ratha Yatra festival.",
        "recommended_subject": "Exterior view of Rameshwar Deula and festival compound in Old Town.",
        "recommended_filename": "place_021_rameshwar_deula_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_013": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Museum)",
        "reason": "Recognized ethnographic museum showcasing 62 indigenous tribes of Odisha.",
        "recommended_subject": "Museum facade, traditional tribal hut replicas, and tribal art installation.",
        "recommended_filename": "place_013_tribal_museum_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_012": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Museum)",
        "reason": "Premier natural science and biodiversity exhibition center in eastern India.",
        "recommended_subject": "Exterior museum building with life-size dinosaur replica and botanical garden entrance.",
        "recommended_filename": "place_012_rmnh_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_014": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Planetarium)",
        "reason": "Iconic space dome and astronomical science learning landmark in Bhubaneswar.",
        "recommended_subject": "Signature hemispherical planetarium dome with astronomer statues and night sky lawn.",
        "recommended_filename": "place_014_planetarium_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_030": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Science Center)",
        "reason": "Interactive science center and science park in Acharya Vihar.",
        "recommended_subject": "Front view of Regional Science Centre building with outdoor science park exhibits.",
        "recommended_filename": "place_030_science_centre_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_031": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Park)",
        "reason": "Major central urban park opposite Secretariat with fountains and landscaped lawns.",
        "recommended_subject": "Panoramic view of Indira Gandhi Park gardens, fountains, and canopy trees.",
        "recommended_filename": "place_031_ig_park_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_032": {
        "priority": "P1",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Park)",
        "reason": "Serene park in Niladri Vihar with Buddhist stupa motifs and water body.",
        "recommended_subject": "Buddha statue and landscaped peaceful garden walkways at Buddha Jayanti Park.",
        "recommended_filename": "place_032_buddha_jayanti_park_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_001": {
        "priority": "P1",
        "district": "Khordha / Cuttack Highway",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "Odisha's world-famous Pahala Rasagola cluster along NH-16.",
        "recommended_subject": "Authentic street view of traditional sweet stalls in Pahala steaming with fresh earthen pots of Rasagola.",
        "recommended_filename": "place_food_001_pahala_rasagola_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_002": {
        "priority": "P2",
        "district": "Puri (Nimapada)",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "Origin hub of Chhena Jhili sweet delicacy.",
        "recommended_subject": "Traditional artisan sweet maker frying fresh golden Chhena Jhili in Nimapada sweet market.",
        "recommended_filename": "place_food_002_nimapada_chhena_jhili_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_003": {
        "priority": "P1",
        "district": "Puri",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "World's largest open-air temple food market inside Jagannath Temple outer compound.",
        "recommended_subject": "Ananda Bazar marketplace courtyard showing earthen pots of sacred Mahaprasad.",
        "recommended_filename": "place_food_003_ananda_bazar_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_004": {
        "priority": "P2",
        "district": "Cuttack",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "Legendary street food hub for authentic Cuttack Dahibara Aloopotola & Ghuguni.",
        "recommended_subject": "Street food stall in Choudhury Bazar preparing traditional Dahibara Aloodum with garnishes.",
        "recommended_filename": "place_food_004_cuttack_dahibara_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_005": {
        "priority": "P2",
        "district": "Cuttack (Salepur)",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "Heritage sweet maker Bikalananda Kar birthplace and legendary Rasagola hub.",
        "recommended_subject": "Iconic Bikalananda Kar heritage sweet showroom in Salepur with traditional Odia sweets.",
        "recommended_filename": "place_food_005_salepur_rasagola_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_006": {
        "priority": "P2",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "Flagship OTDC restaurant dedicated to authentic authentic Odia cuisine.",
        "recommended_subject": "Nimantran restaurant entrance and authentic Odia royal thali presentation.",
        "recommended_filename": "place_food_006_nimantran_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_007": {
        "priority": "P2",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "Vibrant evening street food corridor in central Bhubaneswar.",
        "recommended_subject": "Evening street food market along Bapuji Nagar corridor with bustling food stalls.",
        "recommended_filename": "place_food_007_bapuji_nagar_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_008": {
        "priority": "P2",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "Heritage urban fish, vegetable, and traditional culinary produce market in Unit-4.",
        "recommended_subject": "Traditional vegetable and culinary spice market stalls in Unit-4 Market.",
        "recommended_filename": "place_food_008_unit4_market_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_009": {
        "priority": "P2",
        "district": "Puri (Konark)",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "OTDC tourist cuisine and refreshment hub near Konark Sun Temple.",
        "recommended_subject": "Panthasala Odia cuisine center near the Konark monument gardens.",
        "recommended_filename": "place_food_009_konark_panthasala_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_010": {
        "priority": "P2",
        "district": "Puri (Kakatpur)",
        "current_source": "Category Neutral Fallback SVG (Temple)",
        "reason": "Heritage precinct famous for Kakatpur Pitha offerings and Maa Mangala deity.",
        "recommended_subject": "Pitha market and temple precinct at Maa Mangala Temple in Kakatpur.",
        "recommended_filename": "place_food_010_kakatpur_pitha_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    },
    "place_food_011": {
        "priority": "P2",
        "district": "Khordha (Bhubaneswar)",
        "current_source": "Category Neutral Fallback SVG (Market)",
        "reason": "Modern culinary hub connecting Nandankanan road food spots.",
        "recommended_subject": "Food and dining precinct along Raghunathpur Nandankanan corridor.",
        "recommended_filename": "place_food_011_raghunathpur_culinary_hero.webp",
        "recommended_dimensions": "1600x900 (16:9)"
    }
}

assets_list = []

for p in places:
    p_id = p.get('id', p.get('place_id', ''))
    name = p['name']
    category = p['category']
    
    if p_id in ASSET_METADATA:
        meta = ASSET_METADATA[p_id]
        assets_list.append({
            "place_id": p_id,
            "name": name,
            "category": category,
            "district": meta["district"],
            "current_source": meta["current_source"],
            "reason": meta["reason"],
            "recommended_subject": meta["recommended_subject"],
            "recommended_filename": meta["recommended_filename"],
            "recommended_dimensions": meta["recommended_dimensions"],
            "priority": meta["priority"]
        })

# Sort by Priority (P0 -> P1 -> P2)
priority_order = {"P0": 0, "P1": 1, "P2": 2}
assets_list.sort(key=lambda x: (priority_order[x["priority"]], x["place_id"]))

# Generate JSON
json_output = {
    "generated_at": "2026-08-21T08:00:00Z",
    "total_assets_needed": len(assets_list),
    "summary": {
        "P0_critical_heritage": sum(1 for a in assets_list if a["priority"] == "P0"),
        "P1_high_priority_attractions": sum(1 for a in assets_list if a["priority"] == "P1"),
        "P2_culinary_and_markets": sum(1 for a in assets_list if a["priority"] == "P2")
    },
    "assets": assets_list
}

with open('docs/IMAGE_ASSETS_NEEDED.json', 'w', encoding='utf-8') as f:
    json.dump(json_output, f, indent=2)

# Generate Markdown
md_lines = [
    "# O-TRAVELZ — IMAGE ASSET REQUEST LIST",
    "",
    "> **Status**: **ACTIVE ASSET SOURCING MANIFEST**",
    "> **Date**: 2026-08-21",
    f"> **Total Images Requested**: **{len(assets_list)} destinations**",
    "",
    "---",
    "",
    "## Guiding Policy for Image Sourcing",
    "",
    "- **Zero Cross-Destination Substitution**: A photograph of one place (e.g. Lingaraj Temple or Konark) must **NEVER** be used to represent another place.",
    "- **Zero Semantic Mismatches**: A temple destination must **NEVER** display sweets/food offerings.",
    "- **Current State Protection**: All destinations below are currently safely rendered using clean, category-themed vector placeholders (`CATEGORY_THEMED_FALLBACKS`) so the UI is 100% production-safe and unpolluted.",
    "- **Submission Format**: High-resolution photography (recommended 1600x900 or 1080x720 `.webp` / `.jpg`), CC-BY / CC-BY-SA or proprietary travel photography with authentic attribution.",
    "",
    "---",
    "",
    "## Priority Breakdown",
    "",
    f"- **P0 (Critical Architectural & Heritage Destinations)**: {sum(1 for a in assets_list if a['priority'] == 'P0')} places",
    f"- **P1 (Prominent Museums, Science Parks & Sacred Sites)**: {sum(1 for a in assets_list if a['priority'] == 'P1')} places",
    f"- **P2 (Culinary Corridors & Regional Food Hubs)**: {sum(1 for a in assets_list if a['priority'] == 'P2')} places",
    "",
    "---",
    "",
    "## Complete Image Asset Request Matrix",
    "",
    "| Place ID | Destination Name | Category | Region / District | Priority | Current State / Reason | Recommended Image Subject | Recommended Filename |",
    "|---|---|---|---|:---:|---|---|---|"
]

for a in assets_list:
    md_lines.append(
        f"| `{a['place_id']}` | **{a['name']}** | `{a['category']}` | {a['district']} | **{a['priority']}** | {a['reason']} | {a['recommended_subject']} | `{a['recommended_filename']}` |"
    )

md_lines.extend([
    "",
    "---",
    "",
    "## Ingestion Guide for New Assets",
    "",
    "When a user or photographer supplies an authentic image for one of the places above:",
    "1. Save original to `data/images/places/<place_id>/<asset_hash>/original.webp`",
    "2. Generate derivative sizes: `hero.webp` (1080x720), `card.webp` (640x360), `thumbnail.webp` (240x160)",
    "3. Add entry to `data/images/sources/manifest.json` with creator attribution and license.",
    "4. Register place key and images in `frontend/src/utils/imageService.ts` under `PLACE_IMAGE_MANIFEST`.",
    "5. Run `npm --prefix frontend test` to verify zero regression."
])

with open('docs/IMAGE_ASSETS_NEEDED.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines) + '\n')

print("Successfully generated docs/IMAGE_ASSETS_NEEDED.md and docs/IMAGE_ASSETS_NEEDED.json")
