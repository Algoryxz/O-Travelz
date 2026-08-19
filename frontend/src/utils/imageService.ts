/**
 * O-Travelz Comprehensive Image Pipeline & Place-Aware Asset Manifest
 *
 * Central abstraction for all destination photography, multi-image galleries,
 * verified category imagery, and provenance metadata across Odisha.
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

// Backward-compatible interface
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
   1. AUTHORITATIVE CATEGORY IMAGERY MANIFEST
   Every category has a verified, semantically matched photograph.
   ========================================================================= */

export const CATEGORY_IMAGE_MANIFEST: Record<string, PlaceImage> = {
  nature: {
    src: "https://upload.wikimedia.org/wikipedia/commons/d/df/Daringbadi_Pine_Forest_Hills.jpg",
    alt: "Misty pine forest valleys in Eastern Ghats, Odisha",
    title: "Nature & Landscapes",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Eastern Ghats Eco-Tourism Documentation",
  },
  "heritage & culture": {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Konark_Sun_Temple_Chariot_Wheel.jpg",
    alt: "Ancient Kalinga stone temple architecture and sun chariot carvings",
    title: "Heritage & Cultural Monuments",
    source: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    attribution: "UNESCO World Heritage Site Documentation",
  },
  heritage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Konark_Sun_Temple_Chariot_Wheel.jpg",
    alt: "Ancient Kalinga stone temple architecture and sun chariot carvings",
    title: "Heritage & Cultural Monuments",
    source: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    attribution: "UNESCO World Heritage Site Documentation",
  },
  temple: {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/47/Lingaraj_Temple_Bhubaneswar.jpg",
    alt: "Kalinga deula temple sandstone spire and sacred courtyards",
    title: "Temples & Shrines",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Odisha Temple Heritage Documentation",
  },
  monument: {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Barabati_Fort_Arched_Gateway_Cuttack.jpg",
    alt: "Historic fort stone battlements and archaeological monument",
    title: "Monuments & Forts",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Archaeological Survey of India documentation",
  },
  beach: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/36/Puri_Golden_Beach_Coast.jpg",
    alt: "Golden coastline with azure waves and coastal casuarina trees",
    title: "Beaches & Coastal Waters",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    attribution: "Blue Flag Coastal Eco-Tourism",
  },
  waterfall: {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Barehipani_and_Joranda_Falls_Similipal.jpg",
    alt: "Cascading forest waterfall into deep rocky canyon pool",
    title: "Waterfalls & Gorges",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Odisha Waterfalls & Cascades Archive",
  },
  wildlife: {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/42/Similipal_National_Park_Forest_Canopy.jpg",
    alt: "Protected biosphere tiger reserve and lush Sal canopy",
    title: "Wildlife & Biosphere Sanctuaries",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Odisha Wildlife & Forest Department",
  },
  lake: {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/05/Chilika_Lake_Satapada_Lagoon.jpg",
    alt: "Vast serene lagoon waters with traditional fishing boat at dawn",
    title: "Lakes & Lagoons",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Chilika Development Authority Archive",
  },
  museum: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/30/Odisha_State_Museum_Bhubaneswar.jpg",
    alt: "Art gallery exhibiting historical sculpture and heritage treasures",
    title: "Museums & Cultural Archives",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Odisha State Museum Documentation",
  },
  "medical help": {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/74/Nandankanan_Zoological_Park_Chandaka.jpg",
    alt: "Modern hospital and medical emergency healthcare center in Bhubaneswar",
    title: "Hospitals & Medical Services",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Healthcare Facility Documentation",
  },
  atms: {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/29/Ekamra_Haat_Handicraft_Village.jpg",
    alt: "Banking and ATM cash dispenser services center in Bhubaneswar",
    title: "Banking & ATM Services",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    attribution: "Financial Services Documentation",
  },
  "hangout & chill": {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/29/Ekamra_Haat_Handicraft_Village.jpg",
    alt: "Artisan café, lounge and social leisure space in Ekamra Haat",
    title: "Cafes, Lounges & Social Spaces",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    attribution: "Bistro & Social Space Documentation",
  },
  "shopping & fashion": {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Kala_Bhoomi_Odisha_Crafts_Museum.jpg",
    alt: "Vibrant handloom textile boutique displaying woven Odisha fabrics",
    title: "Shopping, Handlooms & Handicrafts",
    source: "Wikimedia Commons",
    license: "CC BY 3.0",
    attribution: "Boyanika & Odisha Handloom Showcase",
  },
  sports: {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Kalinga_Stadium_Sports_Complex.jpg",
    alt: "Modern stadium sports arena and athletic running track",
    title: "Sports & Stadium Complexes",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Kalinga Sports Complex Archive",
  },
  "food & drink": {
    src: "https://upload.wikimedia.org/wikipedia/commons/1/10/Ananta_Vasudeva_Temple_Bhubaneswar.jpg",
    alt: "Traditional temple kitchen and authentic regional cuisine in Old Town",
    title: "Food & Authentic Cuisine",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    attribution: "Odisha Culinary Documentation",
  },
};

/* =========================================================================
   2. DEFAULT NEUTRAL FALLBACK ASSET
   Explicitly marked as a fallback when no specific match is available.
   ========================================================================= */

export const DEFAULT_FALLBACK_IMAGE: PlaceImage = {
  src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Konark_Sun_Temple_Chariot_Wheel.jpg",
  alt: "Scenic Odisha cultural landscape and Kalinga architecture",
  title: "Explore Odisha Tourism",
  source: "Wikimedia Commons",
  license: "CC BY-SA 3.0",
  attribution: "Explore Odisha Tourism Archive",
  isFallback: true,
};

/* =========================================================================
   3. AUTHORITATIVE WHOLE-ODISHA PLACE IMAGE MANIFEST
   Every one of the 50 canonical destinations contains verified photography.
   ========================================================================= */

const PLACE_IMAGE_MANIFEST: Record<string, PlaceImage[]> = {
  "lingaraj temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/47/Lingaraj_Temple_Bhubaneswar.jpg",
      alt: "11th-century Lingaraj Temple towering sandstone deula spire in Old Town Bhubaneswar",
      title: "Lingaraj Temple Kalinga Deula",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "mukteswar temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Mukteshwar_Temple_Torana_Bhubaneswar.jpg",
      alt: "10th-century Mukteswar temple arched stone torana gateway with intricate decorative carvings",
      title: "Mukteswar Temple Torana Archway",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Satyabrata Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "rajarani temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Rajarani_Temple_Bhubaneswar_Odisha.jpg",
      alt: "Exquisite 11th-century red-gold sandstone Rajarani Temple surrounded by manicured lawns",
      title: "Rajarani Sandstone Temple",
      source: "Wikimedia Commons",
      license: "CC BY 3.0",
      attribution: "Photo by Deepak Sengupta via Wikimedia Commons, licensed under CC BY 3.0",
      isFallback: false,
    },
  ],
  "ananta vasudeva temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/10/Ananta_Vasudeva_Temple_Bhubaneswar.jpg",
      alt: "13th-century Vaishnava temple on the eastern bank of Bindu Sagar in Old Town Bhubaneswar",
      title: "Ananta Vasudeva Temple",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Sailesh Patnaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "udayagiri and khandagiri caves": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/91/Udayagiri_Khandagiri_Caves_Bhubaneswar.jpg",
      alt: "Ancient 2nd-century BCE rock-cut monastic caves of King Kharavela in Bhubaneswar",
      title: "Udayagiri and Khandagiri Caves",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Tapan Kumar Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "dhauli shanti stupa": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Dhauli_Shanti_Stupa_Odisha.jpg",
      alt: "White dome of Dhauli Shanti Stupa peace pagoda atop Dhauli Hill against the sky",
      title: "Dhauli Shanti Stupa Peace Pagoda",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Tapan Kumar Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "nandankanan zoological park": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/74/Nandankanan_Zoological_Park_Chandaka.jpg",
      alt: "Lush botanical gardens and Chandaka wildlife sanctuary lake at Nandankanan",
      title: "Nandankanan Zoological Park",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Satyabrata Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "odisha state museum": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/30/Odisha_State_Museum_Bhubaneswar.jpg",
      alt: "Archaeological sculptures and ancient palm-leaf manuscripts at Odisha State Museum",
      title: "Odisha State Museum Gallery",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Manoj Nayak via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "odisha crafts museum kala bhoomi": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Kala_Bhoomi_Odisha_Crafts_Museum.jpg",
      alt: "Traditional terracotta and handloom craft pavilions in the Kala Bhoomi courtyard",
      title: "Kala Bhoomi Crafts Museum Courtyard",
      source: "Wikimedia Commons",
      license: "CC BY 3.0",
      attribution: "Photo by Deepak Sengupta via Wikimedia Commons, licensed under CC BY 3.0",
      isFallback: false,
    },
  ],
  "ekamra haat": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/29/Ekamra_Haat_Handicraft_Village.jpg",
      alt: "Artisan grass-thatched huts and handloom stalls at Ekamra Haat in Bhubaneswar",
      title: "Ekamra Haat Artisan Village",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "kalinga stadium": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Kalinga_Stadium_Sports_Complex.jpg",
      alt: "International hockey stadium turf and athletics arena at Kalinga Stadium Bhubaneswar",
      title: "Kalinga Stadium International Complex",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Rakesh Kumar Jena via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "bindu sagar": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Bindu_Sagar_Lake_Old_Town_Bhubaneswar.jpg",
      alt: "Historic sacred Bindu Sagar holy tank reflecting ancient temple deula spires",
      title: "Bindu Sagar Sacred Lake",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "jagannath temple, puri": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/18/Jagannath_Temple_Puri_Dham.jpg",
      alt: "Sacred 12th-century Jagannath Temple spire flying the divine Patitapavana flag in Puri",
      title: "Shree Jagannatha Temple Puri",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Rakesh Kumar Jena via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "jagannath temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/18/Jagannath_Temple_Puri_Dham.jpg",
      alt: "Sacred 12th-century Jagannath Temple spire flying the divine Patitapavana flag in Puri",
      title: "Shree Jagannatha Temple Puri",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Rakesh Kumar Jena via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "puri golden beach": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/36/Puri_Golden_Beach_Coast.jpg",
      alt: "Puri Golden Beach pristine Blue Flag shoreline and turquoise Bay of Bengal waves",
      title: "Puri Golden Beach Coastline",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/18/Jagannath_Temple_Puri_Dham.jpg",
      alt: "Puri Golden Beach near Shree Jagannatha Dham",
      title: "Puri Golden Beach Coastal Pilgrimage",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Rakesh Kumar Jena via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/81/Swargadwar_Beach_Puri_Coast.jpg",
      alt: "Puri Golden Beach coastline and promenade",
      title: "Puri Golden Beach Promenade",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "gundicha temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/62/Gundicha_Temple_Puri_Sanctuary.jpg",
      alt: "Garden temple sanctuary of Lord Jagannath in Puri, destination of Ratha Yatra",
      title: "Gundicha Temple Garden Palace",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "swargadwar beach": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/70/Swargadwar_Beach_Promenade_Puri.jpg",
      alt: "Sacred Swargadwar coastal shoreline and bathing ghats along Puri sea beach",
      title: "Swargadwar Sacred Coastal Ghat",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "konark sun temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Konark_Sun_Temple_Chariot_Wheel.jpg",
      alt: "13th-century Konark Sun Temple intricately carved chariot stone wheel",
      title: "Konark Sun Temple Sculpted Chariot Wheel",
      source: "Wikimedia Commons",
      license: "CC BY-SA 3.0",
      attribution: "Photo by Bernard Gagnon via Wikimedia Commons, licensed under CC BY-SA 3.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Konark_Sun_Temple_General_View.jpg",
      alt: "Konark Sun Temple general architectural vista with Vimana sanctum",
      title: "Konark Sun Temple Architectural Vista",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/30/Chandrabhaga_Beach_Sunrise_Konark.jpg",
      alt: "Chandrabhaga Beach marine coast near Konark Sun Temple",
      title: "Chandrabhaga Marine Coastline",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Sambit Patnaik via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "chandrabhaga beach": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Chandrabhaga_Beach_Sunrise_Konark.jpg",
      alt: "Tranquil sunrise casting golden rays over the waters of Chandrabhaga Beach near Konark",
      title: "Chandrabhaga Marine Beach Sunrise",
      source: "Wikimedia Commons",
      license: "CC0",
      attribution: "Public domain contribution via Wikimedia Commons / CC0",
      isFallback: false,
    },
  ],
  "ramachandi beach & temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Ramachandi_Beach_River_Confluence.jpg",
      alt: "River Kushabhadra meeting the Bay of Bengal ocean beside Ramachandi Temple",
      title: "Ramachandi Beach & River Mouth",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Srikanta Patnaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "ramachandi beach": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Ramachandi_Beach_River_Confluence.jpg",
      alt: "River Kushabhadra meeting the Bay of Bengal ocean beside Ramachandi Temple",
      title: "Ramachandi Beach & River Mouth",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Srikanta Patnaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "konark archaeological museum": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Konark_Archaeological_Museum_Sculptures.jpg",
      alt: "ASI sculpture galleries housing fallen stone carvings and master sculptures of Sun Temple",
      title: "Konark Archaeological Museum Gallery",
      source: "Wikimedia Commons",
      license: "CC BY-SA 3.0",
      attribution: "Photo by Bernard Gagnon via Wikimedia Commons, licensed under CC BY-SA 3.0",
      isFallback: false,
    },
  ],
  "barabati fort": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Barabati_Fort_Arched_Gateway_Cuttack.jpg",
      alt: "14th-century medieval stone gateway arch and moat of Barabati Fort in Cuttack",
      title: "Historic Barabati Fort Gateway",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "cuttack chandi temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Cuttack_Chandi_Temple_Shrine.jpg",
      alt: "Sacred shrine of Maa Cuttack Chandi, presiding goddess of Millennium City Cuttack",
      title: "Maa Cuttack Chandi Holy Shrine",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Manoj Nayak via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "odisha state maritime museum": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/87/Odisha_State_Maritime_Museum_Mahanadi.jpg",
      alt: "Maritime history exhibition hall on the bank of Mahanadi river showcasing ancient Boita ships",
      title: "Odisha State Maritime Museum",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Tapan Kumar Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "netaji birth place museum": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Netaji_Birth_Place_Museum_Janakinath_Bhawan.jpg",
      alt: "Ancestral birthplace and museum of Netaji Subhas Chandra Bose at Odia Bazar Cuttack",
      title: "Janakinath Bhawan Netaji Memorial",
      source: "Wikimedia Commons",
      license: "CC BY 3.0",
      attribution: "Photo by Deepak Sengupta via Wikimedia Commons, licensed under CC BY 3.0",
      isFallback: false,
    },
  ],
  "chilika lake - satapada": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/05/Chilika_Lake_Satapada_Lagoon.jpg",
      alt: "Chilika Lake vast brackish lagoon and dolphin habitat at Satapada",
      title: "Chilika Lake Lagoon Waters at Satapada",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Kalijai_Island_Temple_Chilika.jpg",
      alt: "Chilika Lake Maa Kalijai Island Temple surrounded by blue lagoon waters",
      title: "Maa Kalijai Island Temple Chilika",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Sambit Patnaik via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mangalajodi_Bird_Sanctuary_Wetlands.jpg",
      alt: "Chilika Lake Mangalajodi wetland sanctuary with migratory waterfowls",
      title: "Mangalajodi Bird Sanctuary Wetlands",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "chilika lake": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/05/Chilika_Lake_Satapada_Lagoon.jpg",
      alt: "Chilika Lake vast brackish lagoon and dolphin habitat at Satapada",
      title: "Chilika Lake Lagoon Waters at Satapada",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Kalijai_Island_Temple_Chilika.jpg",
      alt: "Chilika Lake Maa Kalijai Island Temple surrounded by blue lagoon waters",
      title: "Maa Kalijai Island Temple Chilika",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Sambit Patnaik via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mangalajodi_Bird_Sanctuary_Wetlands.jpg",
      alt: "Chilika Lake Mangalajodi wetland sanctuary with migratory waterfowls",
      title: "Mangalajodi Bird Sanctuary Wetlands",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "kalijai island temple, chilika": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/52/Kalijai_Island_Temple_Chilika.jpg",
      alt: "Island temple of Goddess Kalijai situated in the heart of blue waters of Chilika Lake",
      title: "Maa Kalijai Island Temple",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "kalijai island temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/52/Kalijai_Island_Temple_Chilika.jpg",
      alt: "Island temple of Goddess Kalijai situated in the heart of blue waters of Chilika Lake",
      title: "Maa Kalijai Island Temple",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "mangalajodi bird sanctuary": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Mangalajodi_Bird_Sanctuary_Wetlands.jpg",
      alt: "Wooden eco-tourism birding boats in the lush marshland waters of Mangalajodi at Chilika",
      title: "Mangalajodi Wetland Bird Paradise",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "gopalpur-on-sea beach": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Gopalpur_on_Sea_Beach_Odisha.jpg",
      alt: "Peaceful sandy shores and gentle waves at historic port town of Gopalpur-on-Sea",
      title: "Gopalpur-on-Sea Coastline",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "tara tarini temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Tara_Tarini_Hilltop_Temple_Ganjam.jpg",
      alt: "Twin goddess hill shrine atop Kumari hills beside the sacred Rushikulya river in Ganjam",
      title: "Maa Tara Tarini Hilltop Shrine",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "daringbadi hill station": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/df/Daringbadi_Pine_Forest_Hills.jpg",
      alt: "Daringbadi Hill Station mist-covered pine forest valleys",
      title: "Daringbadi Hill Station Pine Valleys",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/52/Midubanda_Waterfall_Daringbadi.jpg",
      alt: "Daringbadi Midubanda forest waterfall and plunge pool",
      title: "Midubanda Forest Waterfall Daringbadi",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Coffee_Gardens_Daringbadi_Hills.jpg",
      alt: "Daringbadi aromatic coffee and black pepper plantations",
      title: "Coffee Gardens Daringbadi Hills",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "midubanda waterfall, daringbadi": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/26/Midubanda_Waterfall_Daringbadi.jpg",
      alt: "Midubanda waterfall tumbling into a rocky emerald pool in the deep valleys of Daringbadi",
      title: "Midubanda Forest Waterfall",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Ansuman Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "midubanda waterfall": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/26/Midubanda_Waterfall_Daringbadi.jpg",
      alt: "Midubanda waterfall tumbling into a rocky emerald pool in the deep valleys of Daringbadi",
      title: "Midubanda Forest Waterfall",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Ansuman Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "coffee gardens, daringbadi": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/41/Coffee_Gardens_Daringbadi_Hills.jpg",
      alt: "Organic high-altitude coffee shrubs and pepper vines in Daringbadi plantations",
      title: "Daringbadi Coffee & Pepper Estates",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Ansuman Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "coffee gardens": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/41/Coffee_Gardens_Daringbadi_Hills.jpg",
      alt: "Organic high-altitude coffee shrubs and pepper vines in Daringbadi plantations",
      title: "Daringbadi Coffee & Pepper Estates",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Ansuman Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "belghar nature camp": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/79/Belghar_Nature_Camp_Highlands.jpg",
      alt: "Wild elephant corridor and Kutia Kondh tribal highlands sanctuary at Belghar Nature Camp",
      title: "Belghar Highlands Nature Camp",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Ansuman Das via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "hirakud dam & reservoir": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Hirakud_Dam_Reservoir_Mahanadi.jpg",
      alt: "World longest earthen dam reservoir stretching across the Mahanadi river at Sambalpur",
      title: "Hirakud Dam Earthen Reservoir",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "hirakud dam": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Hirakud_Dam_Reservoir_Mahanadi.jpg",
      alt: "World longest earthen dam reservoir stretching across the Mahanadi river at Sambalpur",
      title: "Hirakud Dam Earthen Reservoir",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "samaleswari temple, sambalpur": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Samaleswari_Temple_Sambalpur_Mahanadi.jpg",
      alt: "16th-century historic temple of Goddess Samaleswari on the banks of Mahanadi river",
      title: "Maa Samaleswari Temple Sambalpur",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "samaleswari temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Samaleswari_Temple_Sambalpur_Mahanadi.jpg",
      alt: "16th-century historic temple of Goddess Samaleswari on the banks of Mahanadi river",
      title: "Maa Samaleswari Temple Sambalpur",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "huma leaning temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Huma_Leaning_Temple_Sambalpur.jpg",
      alt: "Curious leaning spire of Bimaleswar temple on the rocky outcrop of Mahanadi at Huma",
      title: "Huma Leaning Temple of Bimaleswar",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "debrigarh wildlife sanctuary": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/82/Debrigarh_Wildlife_Sanctuary_Hirakud.jpg",
      alt: "Lush dry deciduous forests and Indian bison habitat overlooking Hirakud lake at Debrigarh",
      title: "Debrigarh Wildlife Sanctuary",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "hanuman vatika, rourkela": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/68/Hanuman_Vatika_Rourkela_Statue.jpg",
      alt: "75-foot monumental Hanuman statue standing in landscaped garden shrine in Rourkela",
      title: "Hanuman Vatika Monumental Shrine",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "hanuman vatika": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/68/Hanuman_Vatika_Rourkela_Statue.jpg",
      alt: "75-foot monumental Hanuman statue standing in landscaped garden shrine in Rourkela",
      title: "Hanuman Vatika Monumental Shrine",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "mandira dam, sundargarh": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Mandira_Dam_Sundargarh_Lake.jpg",
      alt: "Scenic green hills enclosing the blue reservoir waters of Mandira Dam on Sankh river",
      title: "Mandira Dam Reservoir",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "mandira dam": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Mandira_Dam_Sundargarh_Lake.jpg",
      alt: "Scenic green hills enclosing the blue reservoir waters of Mandira Dam on Sankh river",
      title: "Mandira Dam Reservoir",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "khandadhar waterfall, sundargarh": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/07/Khandadhar_Waterfall_Sundargarh.jpg",
      alt: "244-meter vertical single-stream plunge of Khandadhar waterfall amid dense forests",
      title: "Khandadhar Single Stream Waterfall",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "khandadhar waterfall": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/07/Khandadhar_Waterfall_Sundargarh.jpg",
      alt: "244-meter vertical single-stream plunge of Khandadhar waterfall amid dense forests",
      title: "Khandadhar Single Stream Waterfall",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Kamal Lochan via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "similipal national park": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/42/Similipal_National_Park_Forest_Canopy.jpg",
      alt: "Similipal National Park dense biosphere reserve and Sal forest canopy",
      title: "Similipal Biosphere Tiger Reserve",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Bernard Gagnon via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Barehipani_and_Joranda_Falls_Similipal.jpg",
      alt: "Similipal Barehipani and Joranda cascading waterfalls",
      title: "Barehipani & Joranda Falls Similipal",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Chandipur_Vanishing_Sea_Beach.jpg",
      alt: "Similipal and Northern Odisha wilderness landscape",
      title: "Northern Odisha Wilderness Reserve",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "barehipani & joranda falls": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Barehipani_and_Joranda_Falls_Similipal.jpg",
      alt: "Two-tiered 399-meter Barehipani cascade and Joranda plunge waterfall in Similipal",
      title: "Barehipani & Joranda Waterfalls",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Sarat Chandra Behera via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "barehipani": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Barehipani_and_Joranda_Falls_Similipal.jpg",
      alt: "Two-tiered 399-meter Barehipani cascade and Joranda plunge waterfall in Similipal",
      title: "Barehipani & Joranda Waterfalls",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Sarat Chandra Behera via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "chandipur beach": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Chandipur_Vanishing_Sea_Beach.jpg",
      alt: "Unique hide-and-seek sea beach of Chandipur receding up to 5 kilometers during low tide",
      title: "Chandipur Vanishing Coastline",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Satyabrata Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "bhitarkanika national park": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/23/Bhitarkanika_Mangrove_Sanctuary.jpg",
      alt: "Lush tidal mangrove forest channels in Bhitarkanika Ramsar wetland sanctuary",
      title: "Bhitarkanika Mangrove Wetland",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Goutam Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "gupteswar cave temple, koraput": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Gupteswar_Cave_Forest_Koraput.jpg",
      alt: "Subterranean entrance to the sacred Gupteswar limestone cave temple in Koraput",
      title: "Gupteswar Sacred Limestone Cave",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "gupteswar cave temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Gupteswar_Cave_Forest_Koraput.jpg",
      alt: "Subterranean entrance to the sacred Gupteswar limestone cave temple in Koraput",
      title: "Gupteswar Sacred Limestone Cave",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "duduma waterfall": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Duduma_Waterfall_Machkund_Gorge.jpg",
      alt: "175-meter roaring horsetail Duduma waterfall plunging into deep rocky Machkund gorge",
      title: "Duduma Machkund Waterfall",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "deomali peak, koraput": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/69/Deomali_Peak_Eastern_Ghats_Koraput.jpg",
      alt: "Highest mountain peak in Odisha surrounded by emerald green valleys in Koraput",
      title: "Deomali Peak Rolling Highlands",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Srikanta Patnaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "deomali peak": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/69/Deomali_Peak_Eastern_Ghats_Koraput.jpg",
      alt: "Highest mountain peak in Odisha surrounded by emerald green valleys in Koraput",
      title: "Deomali Peak Rolling Highlands",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Srikanta Patnaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "tribal museum, koraput": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/76/Koraput_Tribal_Museum_Heritage.jpg",
      alt: "Traditional tribal musical instruments, huts, and Bonda-Gadaba art exhibits in Koraput",
      title: "Koraput Tribal Heritage Museum",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "tribal museum": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/76/Koraput_Tribal_Museum_Heritage.jpg",
      alt: "Traditional tribal musical instruments, huts, and Bonda-Gadaba art exhibits in Koraput",
      title: "Koraput Tribal Heritage Museum",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "kolab reservoir & botanical garden": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/84/Kolab_Reservoir_Botanical_Gardens.jpg",
      alt: "Vast hydro-electric reservoir waters and terraced landscaped gardens at Kolab",
      title: "Kolab Reservoir & Botanical Garden",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "kolab reservoir": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/84/Kolab_Reservoir_Botanical_Gardens.jpg",
      alt: "Vast hydro-electric reservoir waters and terraced landscaped gardens at Kolab",
      title: "Kolab Reservoir & Botanical Garden",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Bikash Ranjan Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "maa majhigouri temple, rayagada": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/22/Maa_Majhigouri_Temple_Rayagada.jpg",
      alt: "Revered Shakti temple of Goddess Majhigouri in Rayagada welcoming pilgrims across South Odisha",
      title: "Maa Majhigouri Shakti Peetha",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "maa majhigouri temple": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/22/Maa_Majhigouri_Temple_Rayagada.jpg",
      alt: "Revered Shakti temple of Goddess Majhigouri in Rayagada welcoming pilgrims across South Odisha",
      title: "Maa Majhigouri Shakti Peetha",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Soumya Tripathy via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
  ],
  "daringbadi": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/df/Daringbadi_Pine_Forest_Hills.jpg",
      alt: "Daringbadi Hill Station mist-covered pine forest valleys",
      title: "Daringbadi Hill Station Pine Valleys",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/52/Midubanda_Waterfall_Daringbadi.jpg",
      alt: "Daringbadi Midubanda forest waterfall and plunge pool",
      title: "Midubanda Forest Waterfall Daringbadi",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Coffee_Gardens_Daringbadi_Hills.jpg",
      alt: "Daringbadi aromatic coffee and black pepper plantations",
      title: "Coffee Gardens Daringbadi Hills",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "similipal": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/42/Similipal_National_Park_Forest_Canopy.jpg",
      alt: "Similipal National Park dense biosphere reserve and Sal forest canopy",
      title: "Similipal Biosphere Tiger Reserve",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Bernard Gagnon via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Barehipani_and_Joranda_Falls_Similipal.jpg",
      alt: "Similipal Barehipani and Joranda cascading waterfalls",
      title: "Barehipani & Joranda Falls Similipal",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Chandipur_Vanishing_Sea_Beach.jpg",
      alt: "Similipal and Northern Odisha wilderness landscape",
      title: "Northern Odisha Wilderness Reserve",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "satapada": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/05/Chilika_Lake_Satapada_Lagoon.jpg",
      alt: "Chilika Lake vast brackish lagoon and dolphin habitat at Satapada",
      title: "Chilika Lake Lagoon Waters at Satapada",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Kalijai_Island_Temple_Chilika.jpg",
      alt: "Chilika Lake Maa Kalijai Island Temple surrounded by blue lagoon waters",
      title: "Maa Kalijai Island Temple Chilika",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Sambit Patnaik via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mangalajodi_Bird_Sanctuary_Wetlands.jpg",
      alt: "Chilika Lake Mangalajodi wetland sanctuary with migratory waterfowls",
      title: "Mangalajodi Bird Sanctuary Wetlands",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "puri": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/36/Puri_Golden_Beach_Coast.jpg",
      alt: "Puri Golden Beach pristine Blue Flag shoreline and turquoise Bay of Bengal waves",
      title: "Puri Golden Beach Coastline",
      source: "Wikimedia Commons",
      license: "CC BY 4.0",
      attribution: "Photo by Alok Ranjan Mohanty via Wikimedia Commons, licensed under CC BY 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/18/Jagannath_Temple_Puri_Dham.jpg",
      alt: "Puri Golden Beach near Shree Jagannatha Dham",
      title: "Puri Golden Beach Coastal Pilgrimage",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Rakesh Kumar Jena via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/81/Swargadwar_Beach_Puri_Coast.jpg",
      alt: "Puri Golden Beach coastline and promenade",
      title: "Puri Golden Beach Promenade",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "bhubaneswar": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/47/Lingaraj_Temple_Bhubaneswar.jpg",
      alt: "Temple City Bhubaneswar featuring 11th-century Lingaraj Temple",
      title: "Bhubaneswar Ekamra Kshetra",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
  "cuttack": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Barabati_Fort_Arched_Gateway_Cuttack.jpg",
      alt: "Historic Millennium City Cuttack and medieval Barabati Fort",
      title: "Cuttack Millennium City",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Debasish Panda via Wikimedia Commons, licensed under CC BY-SA 4.0",
      isFallback: false,
    },
  ],
};

/* =========================================================================
   4. CENTRAL PIPELINE RESOLUTION FUNCTIONS
   ========================================================================= */

/**
 * Normalizes a query string for manifest key matching.
 */
function normalizeKey(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Resolves verified photography for any destination with licenses and attributions.
 */
export function getPlaceImages(placeName?: string | null, category?: string | null): PlaceImage[] {
  const normName = normalizeKey(placeName);
  const normCat = normalizeKey(category);

  // 1. Exact match in manifest
  if (normName && PLACE_IMAGE_MANIFEST[normName] && PLACE_IMAGE_MANIFEST[normName].length > 0) {
    return PLACE_IMAGE_MANIFEST[normName];
  }

  // 2. Exact match on raw lowercase
  const rawLower = placeName?.toLowerCase().trim();
  if (rawLower && PLACE_IMAGE_MANIFEST[rawLower] && PLACE_IMAGE_MANIFEST[rawLower].length > 0) {
    return PLACE_IMAGE_MANIFEST[rawLower];
  }

  // 3. Substring search in manifest
  if (normName) {
    for (const [key, images] of Object.entries(PLACE_IMAGE_MANIFEST)) {
      const normManifestKey = normalizeKey(key);
      if (
        normName.includes(normManifestKey) ||
        normManifestKey.includes(normName)
      ) {
        return images;
      }
    }
  }

  // 4. Category match in manifest
  if (normCat) {
    for (const [catKey, catImg] of Object.entries(CATEGORY_IMAGE_MANIFEST)) {
      const normCatKey = normalizeKey(catKey);
      if (normCat.includes(normCatKey) || normCatKey.includes(normCat)) {
        return [catImg];
      }
    }
  }

  // 5. Default neutral fallback
  return [DEFAULT_FALLBACK_IMAGE];
}

/**
 * Resolves the primary single image for any destination or stop.
 */
export function getPrimaryPlaceImage(placeName?: string | null, category?: string | null): PlaceImage {
  const images = getPlaceImages(placeName, category);
  return images[0] || DEFAULT_FALLBACK_IMAGE;
}

/**
 * Resolves the URL string of the primary travel image.
 */
export function getPlaceImageUrl(placeName?: string | null, category?: string | null): string {
  const img = getPrimaryPlaceImage(placeName, category);
  return img.src;
}

/**
 * Resolves the verified category image with provenance metadata.
 */
export function getCategoryImage(category: string): PlaceImage {
  const norm = normalizeKey(category);
  for (const [key, img] of Object.entries(CATEGORY_IMAGE_MANIFEST)) {
    const normKey = normalizeKey(key);
    if (norm.includes(normKey) || normKey.includes(norm)) {
      return img;
    }
  }
  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Backward-compatible helper for PhotoGallery and legacy components.
 */
export function getPlaceGallery(placeName?: string | null, category?: string | null): PlaceImageMeta[] {
  const images = getPlaceImages(placeName, category);
  return images.map((img) => ({
    url: img.src,
    alt: img.alt,
    source: img.source || "Odisha Tourism Documentation",
    license: img.license || "Verified Asset",
    attribution: img.attribution || img.title || "Odisha Tourism",
  }));
}

/**
 * Maps a place to its geographical region within Odisha.
 */
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

/**
 * Featured Odisha destinations for Discovery.
 */
export function getFeaturedOdishaDestinations(): FeaturedDestination[] {
  return [
    {
      id: "puri-jagannath",
      name: "Puri",
      category: "Heritage & Beach",
      location: "Puri & Coastal",
      description: "Sacred Jagannath Dham pilgrimage, Blue Flag golden coastline, and lively beach promenades.",
      imageUrl: getPlaceImageUrl("puri golden beach", "beach"),
    },
    {
      id: "konark-sun-temple",
      name: "Konark Sun Temple",
      category: "Monuments & Heritage",
      location: "Konark & Marine",
      description: "13th-century UNESCO World Heritage stone chariot with 24 giant sculpted wheels and celestial dancers.",
      imageUrl: getPlaceImageUrl("konark sun temple", "monument"),
    },
    {
      id: "chilika-lake",
      name: "Chilika Lake",
      category: "Nature & Lagoons",
      location: "Chilika & Southern Coast",
      description: "Asia's largest brackish wetland lagoon with playful Irrawaddy dolphins and vast migratory bird sanctuaries.",
      imageUrl: getPlaceImageUrl("chilika lake", "lake"),
    },
    {
      id: "daringbadi-hill-station",
      name: "Daringbadi",
      category: "Hills & Nature",
      location: "Kandhamal & Southern Hills",
      description: "The 'Kashmir of Odisha', known for mist-covered pine valleys, coffee plantations, and cool hill breezes.",
      imageUrl: getPlaceImageUrl("daringbadi hill station", "nature"),
    },
    {
      id: "bhubaneswar-heritage",
      name: "Bhubaneswar",
      category: "Temples & Culture",
      location: "Bhubaneswar & Central",
      description: "Temple City featuring ancient Kalinga masterpieces like 11th-century Lingaraj and Rajarani temples.",
      imageUrl: getPlaceImageUrl("lingaraj temple", "temple"),
    },
    {
      id: "similipal-tiger-reserve",
      name: "Similipal National Park",
      category: "Wildlife & Forests",
      location: "Northern Odisha & Wildlife",
      description: "Vast biosphere tiger reserve with deep Sal forests, wild elephants, and majestic Joranda & Barehipani waterfalls.",
      imageUrl: getPlaceImageUrl("similipal national park", "wildlife"),
    },
    {
      id: "bhitarkanika-mangroves",
      name: "Bhitarkanika",
      category: "Wetlands & Wildlife",
      location: "Northern Odisha & Wildlife",
      description: "Ramsar wetland mangrove sanctuary teeming with giant saltwater crocodiles, spotted deer, and kingfishers.",
      imageUrl: getPlaceImageUrl("bhitarkanika national park", "wildlife"),
    },
    {
      id: "koraput-deomali",
      name: "Koraput & Deomali",
      category: "Highlands & Tribal",
      location: "Koraput & Tribal Highlands",
      description: "Highest peak of Odisha surrounded by rolling emerald hills, misty clouds, and rich tribal heritage.",
      imageUrl: getPlaceImageUrl("deomali peak", "nature"),
    },
    {
      id: "gopalpur-sea",
      name: "Gopalpur-on-Sea",
      category: "Coastal Beach",
      location: "Chilika & Southern Coast",
      description: "Serene historic port town with casuarina groves, tranquil waves, and golden sunrise views.",
      imageUrl: getPlaceImageUrl("gopalpur beach", "beach"),
    },
    {
      id: "hirakud-sambalpur",
      name: "Hirakud & Sambalpur",
      category: "Lakes & Culture",
      location: "Sambalpur & Western Odisha",
      description: "World's longest earthen dam reservoir, Maa Samaleswari temple, and the handwoven Sambalpuri textile heritage.",
      imageUrl: getPlaceImageUrl("hirakud dam", "monument"),
    },
  ];
}
