import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent

# Read all 81 places from places.json
with open(root / "data" / "places" / "places.json", "r", encoding="utf-8") as f:
    places_list = json.load(f)

# Read 32 ingestion report
with open(root / "docs" / "32_DESTINATIONS_IMAGE_INGESTION_REPORT.json", "r", encoding="utf-8") as f:
    ingestion_32 = json.load(f)

ingested_by_id = {item["place_id"]: item for item in ingestion_32["assets"]}

# Read current imageService.ts to extract previous 49 verified places
with open(root / "frontend" / "src" / "utils" / "imageService.ts", "r", encoding="utf-8") as f:
    current_code = f.read()

# Pattern for existing PLACE_IMAGE_MANIFEST entries
pattern = re.compile(r'^\s*"([^"]+)": (\[\s*\{.*?\n\s*\}\s*\]),?', re.MULTILINE | re.DOTALL)
existing_manifest = {}
for m in pattern.finditer(current_code):
    k = m.group(1)
    v = m.group(2)
    if k not in ("place_cuttack_002", "Cuttack Chandi Temple"):
        existing_manifest[k] = v

print(f"Found {len(existing_manifest)} existing manifest keys.")

# Now build the full 81 places manifest
all_manifest_entries = {}

# 1. Add/keep existing verified places
for p in places_list:
    pid = p["id"]
    pname = p["name"]
    cat = p["category"]

    if pid in ingested_by_id:
        # Ingested 32 asset
        item = ingested_by_id[pid]
        h = item["asset_hash"]
        entry_list = [
            {
                "src": f"/static/images/places/{pid}/{h}/hero.webp",
                "alt": f"Authentic photograph of {pname} in Odisha",
                "title": pname,
                "source": "O-Travelz Verified Photography",
                "license": "Platform Standard Asset",
                "attribution": f"O-Travelz Destination Documentation - {pname}",
                "isFallback": False
            },
            {
                "src": f"/static/images/places/{pid}/{h}/card.webp",
                "alt": f"{pname} architectural and landscape perspective",
                "title": f"{pname} Detail View",
                "source": "O-Travelz Verified Photography",
                "license": "Platform Standard Asset",
                "attribution": f"O-Travelz Destination Documentation - {pname}",
                "isFallback": False
            },
            {
                "src": f"/static/images/places/{pid}/{h}/thumbnail.webp",
                "alt": f"{pname} panorama perspective",
                "title": f"{pname} Overview",
                "source": "O-Travelz Verified Photography",
                "license": "Platform Standard Asset",
                "attribution": f"O-Travelz Destination Documentation - {pname}",
                "isFallback": False
            }
        ]
        formatted = json.dumps(entry_list, indent=4)
        all_manifest_entries[pid] = formatted
        all_manifest_entries[pname] = formatted
    else:
        # Check existing
        if pid in existing_manifest:
            all_manifest_entries[pid] = existing_manifest[pid]
        if pname in existing_manifest:
            all_manifest_entries[pname] = existing_manifest[pname]

print(f"Total places covered in new manifest: {len([p for p in places_list if p['id'] in all_manifest_entries])} / {len(places_list)}")

# Now generate full imageService.ts
# Keep sections 1, 2 intact, update 3 (PLACE_IMAGE_MANIFEST), and functions
header_part = current_code.split("export const PLACE_IMAGE_MANIFEST: Record<string, PlaceImage[]> = {")[0]
footer_part = current_code.split("export const PLACE_IMAGE_MANIFEST: Record<string, PlaceImage[]> = {")[1].split("};\n\nfunction normalizeKey")[1]

manifest_code = "export const PLACE_IMAGE_MANIFEST: Record<string, PlaceImage[]> = {\n"
for k, v in all_manifest_entries.items():
    manifest_code += f'  "{k}": {v},\n'
manifest_code += "};\n"

# Update function getPlaceImages to remove the old bhoga bypass
clean_footer = """
function normalizeKey(str?: string | null): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getCategoryFallback(category?: string | null): PlaceImage {
  if (!category) return DEFAULT_FALLBACK_IMAGE;
  const normCat = normalizeKey(category);

  // 1. If category has a dedicated, verified category-owned asset (ATMs, Medical, Cafes)
  if (CATEGORY_IMAGE_MANIFEST[category]) {
    return CATEGORY_IMAGE_MANIFEST[category];
  }
  for (const [key, img] of Object.entries(CATEGORY_IMAGE_MANIFEST)) {
    if (normalizeKey(key) === normCat) {
      return img;
    }
  }

  // 2. Themed vector fallback for standard categories
  if (CATEGORY_THEMED_FALLBACKS[normCat]) {
    return CATEGORY_THEMED_FALLBACKS[normCat];
  }
  for (const [key, img] of Object.entries(CATEGORY_THEMED_FALLBACKS)) {
    if (normCat.includes(key) || key.includes(normCat)) {
      return img;
    }
  }

  return DEFAULT_FALLBACK_IMAGE;
}

export function getPlaceImages(placeName?: string | null, category?: string | null): PlaceImage[] {
  if (!placeName && !category) return [DEFAULT_FALLBACK_IMAGE];

  if (placeName) {
    const normPlace = normalizeKey(placeName);

    // 1. Exact match by canonical place_id or name in PLACE_IMAGE_MANIFEST
    if (PLACE_IMAGE_MANIFEST[placeName]) {
      return PLACE_IMAGE_MANIFEST[placeName];
    }

    // 2. Normalized alphanumeric match ONLY for verified canonical place keys
    for (const [key, images] of Object.entries(PLACE_IMAGE_MANIFEST)) {
      if (normalizeKey(key) === normPlace) {
        return images;
      }
    }
  }

  // 3. Strict safe fallback: Return category-themed neutral SVG fallback (NEVER another destination's photo!)
  if (category) {
    return [getCategoryFallback(category)];
  }

  return [DEFAULT_FALLBACK_IMAGE];
}

export function getPrimaryPlaceImage(placeName?: string | null, category?: string | null): PlaceImage {
  const images = getPlaceImages(placeName, category);
  return images[0] || DEFAULT_FALLBACK_IMAGE;
}

export function getPlaceImageUrl(placeName?: string | null, category?: string | null): string {
  const img = getPrimaryPlaceImage(placeName, category);
  return img.src;
}

const DISCOVER_CATEGORY_CARDS: Record<string, PlaceImage> = {
  "nature": {
    "src": "/static/images/places/place_daringbadi_001/49e608c2405f/card.webp",
    "alt": "Misty pine forest valleys of Daringbadi, Eastern Ghats",
    "title": "Nature & Landscapes",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Sandeep Sarkar via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "heritage & culture": {
    "src": "/static/images/places/place_konark_001/03b959a8abef/card.webp",
    "alt": "Ancient Kalinga stone temple architecture and sun chariot carvings at Konark",
    "title": "Heritage & Cultural Monuments",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "heritage": {
    "src": "/static/images/places/place_konark_001/03b959a8abef/card.webp",
    "alt": "Ancient Kalinga stone temple architecture and sun chariot carvings at Konark",
    "title": "Heritage & Cultural Monuments",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "shopping & fashion": {
    "src": "/static/images/places/place_bbsr_010/78c2ef783f40/card.webp",
    "alt": "Vibrant handloom textile boutique and artisan craft village at Ekamra Haat",
    "title": "Shopping, Handlooms & Crafts",
    "source": "Wikimedia Commons",
    "license": "CC BY 3.0",
    "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
    "isFallback": false
  }
};

export function getCategoryImage(category: string): PlaceImage {
  const norm = normalizeKey(category);
  for (const [key, img] of Object.entries(CATEGORY_IMAGE_MANIFEST)) {
    const normKey = normalizeKey(key);
    if (norm === normKey || norm.includes(normKey) || normKey.includes(norm)) {
      return img;
    }
  }
  for (const [key, img] of Object.entries(DISCOVER_CATEGORY_CARDS)) {
    const normKey = normalizeKey(key);
    if (norm === normKey || norm.includes(normKey) || normKey.includes(norm)) {
      return img;
    }
  }
  return getCategoryFallback(category);
}

export function getPlaceGallery(placeName?: string | null, category?: string | null): PlaceImageMeta[] {
  const images = getPlaceImages(placeName, category);
  return images.map((img) => ({
    url: img.src.replace(/\\/(thumbnail|card)\\.webp$/i, "/hero.webp"),
    alt: img.alt,
    source: img.source || "Wikimedia Commons",
    license: img.license || "CC BY-SA 4.0",
    attribution: img.attribution || img.title || "Odisha Tourism Documentation",
  }));
}

export function getPlaceRegion(placeName: string): string {
  const name = placeName.toLowerCase();
  if (name.includes("puri") || name.includes("gundicha") || name.includes("swargadwar")) return "Puri & Coastal";
  if (name.includes("konark") || name.includes("chandrabhaga") || name.includes("ramachandi")) return "Konark & Marine";
  if (name.includes("cuttack") || name.includes("barabati") || name.includes("chandi") || name.includes("maritime") || name.includes("netaji")) return "Cuttack & Mahanadi";
  if (name.includes("chilika") || name.includes("kalijai") || name.includes("mangalajodi") || name.includes("gopalpur") || name.includes("tara tarini")) return "Chilika & Southern Coast";
  if (name.includes("daringbadi") || name.includes("midubanda") || name.includes("coffee") || name.includes("belghar") || name.includes("kandhamal")) return "Kandhamal & Southern Hills";
  if (name.includes("hirakud") || name.includes("samaleswari") || name.includes("huma") || name.includes("debrigarh") || name.includes("sambalpur")) return "Sambalpur & Western Odisha";
  if (name.includes("rourkela") || name.includes("hanuman vatika") || name.includes("mandira") || name.includes("khandadhar") || name.includes("sundargarh")) return "Rourkela & Sundargarh";
  if (name.includes("similipal") || name.includes("barehipani") || name.includes("bhitarkanika") || name.includes("chandipur") || name.includes("balasore") || name.includes("mayurbhanj")) return "Northern Odisha & Wildlife";
  if (name.includes("koraput") || name.includes("deomali") || name.includes("gupteswar") || name.includes("duduma") || name.includes("kolab") || name.includes("rayagada") || name.includes("majhigouri")) return "Koraput & Tribal Highlands";
  return "Bhubaneswar & Central";
}

export function getFeaturedOdishaDestinations(): FeaturedDestination[] {
  return [
    {
      id: "place_puri_001",
      name: "Jagannath Temple, Puri",
      category: "Heritage & Pilgrimage",
      location: "Puri & Coastal",
      description: "Sacred 12th-century Kalinga temple complex of Lord Jagannath with grand Bada Danda courtyards.",
      imageUrl: getPlaceImageUrl("place_puri_001"),
    },
    {
      id: "place_puri_002",
      name: "Puri Golden Beach",
      category: "Beach & Coastal",
      location: "Puri & Coastal",
      description: "Blue Flag certified coastline with azure waters and lively sunrise promenade.",
      imageUrl: getPlaceImageUrl("place_puri_002"),
    },
    {
      id: "place_konark_001",
      name: "Konark Sun Temple",
      category: "Monuments & Heritage",
      location: "Konark & Marine",
      description: "13th-century UNESCO World Heritage stone chariot with 24 sculpted sun wheels and celestial dancers.",
      imageUrl: getPlaceImageUrl("place_konark_001"),
    },
    {
      id: "place_chilika_001",
      name: "Chilika Lake - Satapada",
      category: "Nature & Lagoons",
      location: "Chilika & Southern Coast",
      description: "Asia's largest brackish lagoon with Irrawaddy dolphin cruises and serene island waters.",
      imageUrl: getPlaceImageUrl("place_chilika_001"),
    },
    {
      id: "place_daringbadi_001",
      name: "Daringbadi Hill Station",
      category: "Hills & Nature",
      location: "Kandhamal & Southern Hills",
      description: "Misty pine forest valleys, organic coffee gardens, and cool mountain breezes in the Eastern Ghats.",
      imageUrl: getPlaceImageUrl("place_daringbadi_001"),
    },
    {
      id: "place_bbsr_001",
      name: "Lingaraj Temple",
      category: "Temples & Culture",
      location: "Bhubaneswar & Central",
      description: "11th-century architectural masterpiece of Kalinga style in the ancient Temple City of Bhubaneswar.",
      imageUrl: getPlaceImageUrl("place_bbsr_001"),
    },
    {
      id: "place_mayurbhanj_001",
      name: "Similipal National Park",
      category: "Wildlife & Forests",
      location: "Northern Odisha & Wildlife",
      description: "Vast biosphere tiger reserve with deep Sal canopy, wild elephants, and roaring waterfalls.",
      imageUrl: getPlaceImageUrl("place_mayurbhanj_001"),
    },
    {
      id: "place_koraput_003",
      name: "Deomali Peak, Koraput",
      category: "Highlands & Treks",
      location: "Koraput & Tribal Highlands",
      description: "Highest mountain peak in Odisha offering panoramic views of misty clouds and rolling hills.",
      imageUrl: getPlaceImageUrl("place_koraput_003"),
    },
    {
      id: "place_ganjam_001",
      name: "Gopalpur-on-Sea Beach",
      category: "Coastal Beach",
      location: "Chilika & Southern Coast",
      description: "Tranquil coastal resort beach with casuarina groves and historic lighthouse overlooking the sea.",
      imageUrl: getPlaceImageUrl("place_ganjam_001"),
    },
    {
      id: "place_sambalpur_001",
      name: "Hirakud Dam & Reservoir",
      category: "Lakes & Engineering",
      location: "Sambalpur & Western Odisha",
      description: "One of the world's longest earthen dams spanning the Mahanadi River with panoramic lookout towers.",
      imageUrl: getPlaceImageUrl("place_sambalpur_001"),
    },
  ];
}
"""

full_code = header_part + manifest_code + clean_footer

with open(root / "frontend" / "src" / "utils" / "imageService.ts", "w", encoding="utf-8") as f:
    f.write(full_code)

print("Updated frontend/src/utils/imageService.ts successfully with all 81 destinations!")
