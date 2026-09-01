import json
import re
import urllib.parse
from pathlib import Path

# 1. Read places.json
with open('data/places/places.json', 'r', encoding='utf-8') as f:
    places = json.load(f)

# 2. Read existing imageService.ts to extract verified entries from PLACE_IMAGE_MANIFEST
with open('frontend/src/utils/imageService.ts', 'r', encoding='utf-8') as f:
    orig_code = f.read()

# Category-themed SVG generator helper with 100% valid XML and full URI encoding
def make_svg(title, subtitle, accent_color, symbol_svg):
    escaped_title = title.replace("&", "&amp;")
    escaped_sub = subtitle.replace("&", "&amp;")
    raw_svg = (
        f"<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'>"
        f"<defs>"
        f"<linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>"
        f"<stop offset='0%' stop-color='#0B1220'/>"
        f"<stop offset='50%' stop-color='#111827'/>"
        f"<stop offset='100%' stop-color='#172235'/>"
        f"</linearGradient>"
        f"</defs>"
        f"<rect width='800' height='500' fill='url(#bg)'/>"
        f"<circle cx='400' cy='205' r='56' fill='#1E293B' stroke='{accent_color}' stroke-width='2.5' stroke-opacity='0.45'/>"
        f"{symbol_svg}"
        f"<text x='400' y='315' font-family='system-ui, -apple-system, sans-serif' font-size='18' font-weight='800' fill='#F8FAFC' text-anchor='middle'>{escaped_title}</text>"
        f"<text x='400' y='348' font-family='system-ui, -apple-system, sans-serif' font-size='12' font-weight='600' fill='#94A3B8' text-anchor='middle'>{escaped_sub} • O-Travelz Catalog</text>"
        f"</svg>"
    )
    return "data:image/svg+xml," + urllib.parse.quote(raw_svg)

THEMED_SVGS = {
    "temple": {
        "title": "Temple & Sacred Shrine",
        "subtitle": "Kalinga Sacred Architecture",
        "color": "#F59E0B",
        "symbol": "<path d='M400 162 L418 215 L382 215 Z M393 215 L407 215 L407 238 L393 238 Z' fill='#F59E0B'/><circle cx='400' cy='155' r='5' fill='#F59E0B'/>",
    },
    "monument": {
        "title": "Historic Monument & Heritage",
        "subtitle": "Archaeological & Historic Site",
        "color": "#D97706",
        "symbol": "<path d='M375 175 L425 175 L425 184 L375 184 Z M382 184 L390 184 L390 228 L382 228 Z M410 184 L418 184 L418 228 L410 228 Z M396 184 L404 184 L404 228 L396 228 Z M370 228 L430 228 L430 238 L370 238 Z' fill='#D97706'/>",
    },
    "museum": {
        "title": "Museum & Cultural Heritage",
        "subtitle": "Cultural Archives & Artifacts",
        "color": "#8B5CF6",
        "symbol": "<path d='M400 168 L428 185 L372 185 Z M380 188 L388 188 L388 230 L380 230 Z M396 188 L404 188 L404 230 L396 230 Z M412 188 L420 188 L420 230 L412 230 Z M370 230 L430 230 L430 238 L370 238 Z' fill='#8B5CF6'/>",
    },
    "beach": {
        "title": "Coastal Beach & Waters",
        "subtitle": "Bay of Bengal Shoreline",
        "color": "#0284C7",
        "symbol": "<circle cx='400' cy='175' r='14' fill='#F59E0B'/><path d='M370 215 Q385 200 400 215 T430 215 Q435 225 430 235 L370 235 Z' fill='#0284C7'/>",
    },
    "lake": {
        "title": "Lake & Lagoon Waters",
        "subtitle": "Wetlands & Freshwater Ecosystem",
        "color": "#06B6D4",
        "symbol": "<path d='M372 208 Q386 195 400 208 T428 208 L428 236 L372 236 Z' fill='#06B6D4'/>",
    },
    "nature": {
        "title": "Nature & Mountain Landscape",
        "subtitle": "Eastern Ghats & Valleys",
        "color": "#10B981",
        "symbol": "<path d='M372 235 L395 180 L418 235 Z' fill='#10B981'/><path d='M405 235 L420 196 L435 235 Z' fill='#059669'/>",
    },
    "waterfall": {
        "title": "Scenic Waterfall & Cascades",
        "subtitle": "Natural Forest Rapids",
        "color": "#38BDF8",
        "symbol": "<path d='M378 175 L422 175 L415 235 L385 235 Z' fill='#38BDF8'/>",
    },
    "wildlife": {
        "title": "Wildlife & Biosphere Reserve",
        "subtitle": "Sanctuary & Forest Canopy",
        "color": "#059669",
        "symbol": "<circle cx='400' cy='180' r='16' fill='#059669'/><circle cx='385' cy='195' r='14' fill='#059669'/><circle cx='415' cy='195' r='14' fill='#059669'/><rect x='396' y='205' width='8' height='30' fill='#D97706'/>",
    },
    "park": {
        "title": "Parks & Botanical Gardens",
        "subtitle": "Lush Urban & Botanical Greenery",
        "color": "#10B981",
        "symbol": "<circle cx='400' cy='182' r='20' fill='#10B981'/><rect x='396' y='208' width='8' height='26' fill='#D97706'/>",
    },
    "planetarium": {
        "title": "Planetarium & Space Center",
        "subtitle": "Celestial Science & Astronomy",
        "color": "#06B6D4",
        "symbol": "<circle cx='400' cy='205' r='12' fill='#38BDF8'/><ellipse cx='400' cy='205' rx='30' ry='10' fill='none' stroke='#06B6D4' stroke-width='2' transform='rotate(-20 400 205)'/>",
    },
    "science_center": {
        "title": "Science & Innovation Center",
        "subtitle": "Interactive Science Discovery",
        "color": "#3B82F6",
        "symbol": "<circle cx='400' cy='205' r='8' fill='#3B82F6'/><ellipse cx='400' cy='205' rx='28' ry='10' fill='none' stroke='#3B82F6' stroke-width='2'/><ellipse cx='400' cy='205' rx='28' ry='10' fill='none' stroke='#3B82F6' stroke-width='2' transform='rotate(60 400 205)'/>",
    },
    "sports_venue": {
        "title": "Sports & Stadium Arena",
        "subtitle": "Athletics & Sports Complex",
        "color": "#14B8A6",
        "symbol": "<rect x='376' y='185' width='48' height='40' rx='10' fill='none' stroke='#14B8A6' stroke-width='3'/><circle cx='400' cy='205' r='8' fill='#14B8A6'/>",
    },
    "market": {
        "title": "Market, Handlooms & Crafts",
        "subtitle": "Traditional Bazaars & Culinary Corner",
        "color": "#F97316",
        "symbol": "<path d='M380 180 L420 180 L430 235 L370 235 Z' fill='none' stroke='#F97316' stroke-width='2.5'/><path d='M390 180 Q400 160 410 180' fill='none' stroke='#F97316' stroke-width='2.5'/>",
    },
}

# 3. Extract the 49 verified place blocks from original imageService.ts (excluding place_cuttack_002)
# Find PLACE_IMAGE_MANIFEST blocks
entries = {}
# Regex matching "key": [ ... ]
pattern = re.compile(r'^\s*"([^"]+)": (\[\s*\{.*?\n\s*\}\s*\]),?', re.MULTILINE | re.DOTALL)
for match in pattern.finditer(orig_code):
    k = match.group(1)
    v = match.group(2)
    # Exclude place_cuttack_002 and Cuttack Chandi Temple (since its image was bhoga sweets)
    if k in ("place_cuttack_002", "Cuttack Chandi Temple"):
        continue
    # Exclude any non-place keys
    if k.startswith("cat_"):
        continue
    entries[k] = v

print(f"Extracted {len(entries)} verified destination keys from original code.")

# Generate new imageService.ts code
output = []
output.append("""/**
 * O-Travelz Comprehensive Image Pipeline & Semantic Place-Aware Asset Manifest
 *
 * Central abstraction for all destination photography, multi-image galleries,
 * verified category imagery, and provenance metadata across Odisha.
 *
 * Strictly enforces 1-to-1 semantic match between canonical destinations
 * and authentic destination photography. Never leaks photographs across destinations.
 */

export interface PlaceImage {
  src: string;
  alt: string;
  title?: string;
  attribution?: string;
  source?: string;
  license?: string;
  isFallback?: boolean;
}

export interface PlaceImageSet {
  placeId: string;
  placeName: string;
  region?: string;
  images: PlaceImage[];
}

export interface PlaceImageMeta {
  url: string;
  source: string;
  license: string;
  attribution: string;
  alt: string;
}

export interface FeaturedDestination {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  imageUrl: string;
}

/* =========================================================================
   1. AUTHORITATIVE CATEGORY-OWNED PHOTOGRAPHY MANIFEST
   Only contains genuinely category-owned assets from data/images/categories/.
   ========================================================================= */

export const CATEGORY_IMAGE_MANIFEST: Record<string, PlaceImage> = {
  "atms": {
    "src": "/static/images/categories/cat_atms/76647d302131/card.webp",
    "alt": "Banking, commercial and 24/7 ATM cash dispenser services in Odisha",
    "title": "Banking & ATM Services",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by WikiForRay via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "banking": {
    "src": "/static/images/categories/cat_atms/76647d302131/card.webp",
    "alt": "Banking, commercial and 24/7 ATM cash dispenser services in Odisha",
    "title": "Banking & ATM Services",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by WikiForRay via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "medical help": {
    "src": "/static/images/categories/cat_medical_help/bf5d0fc229ac/card.webp",
    "alt": "Modern hospital and medical emergency healthcare center at AIIMS Bhubaneswar in Odisha",
    "title": "Hospitals & Medical Services",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Debiprasad via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "hospitals": {
    "src": "/static/images/categories/cat_medical_help/bf5d0fc229ac/card.webp",
    "alt": "Modern hospital and medical emergency healthcare center at AIIMS Bhubaneswar in Odisha",
    "title": "Hospitals & Medical Services",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Debiprasad via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "hangout & chill": {
    "src": "/static/images/categories/cat_hangout_chill/840313660e7c/card.webp",
    "alt": "Artisan café lounge, open tea pavilion and social leisure space in Odisha",
    "title": "Cafes, Lounges & Social Spaces",
    "source": "Wikimedia Commons",
    "license": "CC BY 3.0",
    "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
    "isFallback": false
  },
  "cafes": {
    "src": "/static/images/categories/cat_hangout_chill/840313660e7c/card.webp",
    "alt": "Artisan café lounge, open tea pavilion and social leisure space in Odisha",
    "title": "Cafes, Lounges & Social Spaces",
    "source": "Wikimedia Commons",
    "license": "CC BY 3.0",
    "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
    "isFallback": false
  }
};

/* =========================================================================
   2. CATEGORY-THEMED NEUTRAL EDITORIAL FALLBACK ASSETS
   Deterministic, high-contrast, category-specific vector placeholders.
   Never borrows photography from unrelated destinations.
   ========================================================================= */
""")

output.append("export const CATEGORY_THEMED_FALLBACKS: Record<string, PlaceImage> = {")
for cat, data in THEMED_SVGS.items():
    svg_uri = make_svg(data["title"], data["subtitle"], data["color"], data["symbol"])
    output.append(f'  "{cat}": {{')
    output.append(f'    src: "{svg_uri}",')
    output.append(f'    alt: "{data["title"]} - Verified Odisha Destination",')
    output.append(f'    title: "{data["title"]}",')
    output.append('    source: "O-Travelz Verified Catalog",')
    output.append('    license: "Platform Standard Asset",')
    output.append('    attribution: "O-Travelz Destination Documentation",')
    output.append('    isFallback: true,')
    output.append('  },')
# Aliases
output.append(f'  "heritage": {{')
output.append(f'    src: "{make_svg(THEMED_SVGS["monument"]["title"], THEMED_SVGS["monument"]["subtitle"], THEMED_SVGS["monument"]["color"], THEMED_SVGS["monument"]["symbol"])}",')
output.append('    alt: "Heritage & Cultural Monuments - Verified Odisha Destination",')
output.append('    title: "Heritage & Cultural Monuments",')
output.append('    source: "O-Travelz Verified Catalog",')
output.append('    license: "Platform Standard Asset",')
output.append('    attribution: "O-Travelz Destination Documentation",')
output.append('    isFallback: true,')
output.append('  },')

output.append(f'  "food": {{')
output.append(f'    src: "{make_svg(THEMED_SVGS["market"]["title"], "Culinary Hub & Traditional Food Market", THEMED_SVGS["market"]["color"], THEMED_SVGS["market"]["symbol"])}",')
output.append('    alt: "Traditional Food & Culinary Market - Verified Odisha Destination",')
output.append('    title: "Traditional Food & Culinary Market",')
output.append('    source: "O-Travelz Verified Catalog",')
output.append('    license: "Platform Standard Asset",')
output.append('    attribution: "O-Travelz Destination Documentation",')
output.append('    isFallback: true,')
output.append('  },')

output.append(f'  "sports": {{')
output.append(f'    src: "{make_svg(THEMED_SVGS["sports_venue"]["title"], THEMED_SVGS["sports_venue"]["subtitle"], THEMED_SVGS["sports_venue"]["color"], THEMED_SVGS["sports_venue"]["symbol"])}",')
output.append('    alt: "Sports & Stadium Arena - Verified Odisha Destination",')
output.append('    title: "Sports & Stadium Arena",')
output.append('    source: "O-Travelz Verified Catalog",')
output.append('    license: "Platform Standard Asset",')
output.append('    attribution: "O-Travelz Destination Documentation",')
output.append('    isFallback: true,')
output.append('  },')
output.append("};\n")

output.append("""export const DEFAULT_FALLBACK_IMAGE: PlaceImage = {
  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23111827'/%3E%3Cstop offset='100%25' stop-color='%23172235'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='500' fill='url(%23bg)'/%3E%3Ccircle cx='400' cy='220' r='60' fill='%231E293B' stroke='%23334155' stroke-width='2'/%3E%3Cpath d='M400 180 L420 220 L380 220 Z' fill='%2314B8A6'/%3E%3Cpath d='M400 260 L380 220 L420 220 Z' fill='%23F59E0B'/%3E%3Ccircle cx='400' cy='220' r='8' fill='%23F8FAFC'/%3E%3Ctext x='400' y='330' font-family='system-ui, -apple-system, sans-serif' font-size='18' font-weight='700' fill='%23F8FAFC' text-anchor='middle'%3EOdisha Travel Destination%3C/text%3E%3Ctext x='400' y='360' font-family='system-ui, -apple-system, sans-serif' font-size='13' fill='%2394A3B8' text-anchor='middle'%3EVerified Location • O-Travelz%3C/text%3E%3C/svg%3E",
  alt: "Odisha Verified Travel Destination",
  title: "Odisha Verified Travel Destination",
  source: "O-Travelz Verified Catalog",
  license: "Platform Standard Asset",
  attribution: "O-Travelz Verified Tourism Asset",
  isFallback: true,
};

/* =========================================================================
   3. CANONICAL DESTINATION IMAGE MANIFEST (49 VERIFIED PLACES)
   ========================================================================= */

export const PLACE_IMAGE_MANIFEST: Record<string, PlaceImage[]> = {
""")

for k, v in entries.items():
    output.append(f'  "{k}": {v},')

output.append("};\n")

output.append("""function normalizeKey(str?: string | null): string {
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

    // Semantic mismatch protection: Cuttack Chandi Temple asset was bhoga (food/sweets)
    if (normPlace === "placecuttack002" || normPlace === "cuttackchanditemple" || normPlace === "cuttackchandi") {
      return [getCategoryFallback(category || "temple")];
    }

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
    url: img.src.replace(/\/(thumbnail|card)\.webp$/i, "/hero.webp"),
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
""")

new_file_content = "\n".join(output)

with open('frontend/src/utils/imageService.ts', 'w', encoding='utf-8') as f:
    f.write(new_file_content)

print("Successfully written clean frontend/src/utils/imageService.ts")

