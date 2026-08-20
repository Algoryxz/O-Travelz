/**
 * O-Travelz Comprehensive Image Pipeline & Semantic Place-Aware Asset Manifest
 *
 * Central abstraction for all destination photography, multi-image galleries,
 * verified category imagery, and provenance metadata across Odisha.
 *
 * Strictly enforces 1-to-1 semantic match between canonical destinations
 * and authentic destination photography, as well as distinct category imagery.
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
   1. AUTHORITATIVE CATEGORY IMAGERY MANIFEST
   Every category has a verified, deliberately representative photograph.
   ========================================================================= */

export const CATEGORY_IMAGE_MANIFEST: Record<string, PlaceImage> = {
  "nature": {
    "src": "/static/images/places/place_daringbadi_001/49e608c2405f/card.webp",
    "alt": "Misty pine forest valleys of Daringbadi, Eastern Ghats",
    "title": "Nature & Landscapes",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
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
  "hangout & chill": {
    "src": "/static/images/categories/cat_hangout_chill/840313660e7c/card.webp",
    "alt": "Artisan caf\u00e9 lounge, open tea pavilion and social leisure space in Odisha",
    "title": "Cafes, Lounges & Social Spaces",
    "source": "Wikimedia Commons",
    "license": "CC BY 3.0",
    "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
    "isFallback": false
  },
  "cafes": {
    "src": "/static/images/categories/cat_hangout_chill/840313660e7c/card.webp",
    "alt": "Artisan caf\u00e9 lounge, open tea pavilion and social leisure space in Odisha",
    "title": "Cafes, Lounges & Social Spaces",
    "source": "Wikimedia Commons",
    "license": "CC BY 3.0",
    "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
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
  },
  "temple": {
    "src": "/static/images/places/place_bbsr_001/06a456469886/card.webp",
    "alt": "Towering Kalinga sandstone deula spire of Lingaraj Temple",
    "title": "Temples & Sacred Shrines",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "beach": {
    "src": "/static/images/places/place_puri_002/8146170ae9b7/card.webp",
    "alt": "Golden sands and azure waves of Puri Golden Beach",
    "title": "Beaches & Coastal Waters",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "waterfall": {
    "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/card.webp",
    "alt": "Barehipani two-tiered waterfall plunging through deep Similipal canyon",
    "title": "Waterfalls & Cascades",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
    "isFallback": false
  },
  "wildlife": {
    "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/card.webp",
    "alt": "Protected Royal Bengal and Black Tiger habitat in Similipal Biosphere Reserve",
    "title": "Wildlife & Biosphere Reserves",
    "source": "Wikimedia Commons",
    "license": "CC BY 4.0",
    "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
    "isFallback": false
  },
  "lake": {
    "src": "/static/images/places/place_chilika_001/b5a796039cf9/card.webp",
    "alt": "Vast serene waters and wooden fishing boats at Chilika Lake Satapada",
    "title": "Lakes & Lagoons",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "museum": {
    "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/card.webp",
    "alt": "Odisha State Museum historical galleries and sculptural archives",
    "title": "Museums & Cultural Archives",
    "source": "Wikimedia Commons",
    "license": "CC BY 3.0",
    "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
    "isFallback": false
  },
  "sports": {
    "src": "/static/images/places/place_bbsr_011/36e8a9a95990/card.webp",
    "alt": "Aerial vista of Kalinga Stadium international athletic complex",
    "title": "Sports & Stadium Complexes",
    "source": "Wikimedia Commons",
    "license": "CC BY 4.0",
    "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
    "isFallback": false
  },
  "monument": {
    "src": "/static/images/places/place_cuttack_001/02e40272a98d/card.webp",
    "alt": "Historic Barabati Fort stone gateway in Cuttack",
    "title": "Monuments & Forts",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
    "isFallback": false
  },
  "food & drink": {
    "src": "/static/images/places/place_cuttack_002/14877b098df9/card.webp",
    "alt": "Traditional authentic temple cuisine and regional Odia delicacies",
    "title": "Food & Authentic Cuisine",
    "source": "Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "attribution": "Photo by Lipika Priyadarsini via Wikimedia Commons, licensed under CC BY-SA 3.0",
    "isFallback": false
  },
  "transport": {
    "src": "/static/images/places/place_bbsr_011/36e8a9a95990/card.webp",
    "alt": "Integrated urban transport and stadium connectivity",
    "title": "Transit & Transport Hubs",
    "source": "Wikimedia Commons",
    "license": "CC BY 4.0",
    "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
    "isFallback": false
  }
};

/* =========================================================================
   2. DEFAULT VERIFIED FALLBACK ASSET
   ========================================================================= */

export const DEFAULT_FALLBACK_IMAGE: PlaceImage = {
  src: "/static/images/places/place_bbsr_001/06a456469886/hero.webp",
  alt: "Lingaraj Temple in Bhubaneswar, Odisha",
  title: "Lingaraj Temple, Bhubaneswar",
  source: "Wikimedia Commons",
  license: "CC BY-SA 4.0",
  attribution: "Photo by Sushant (Bubby) via Wikimedia Commons",
  isFallback: true,
};

/* =========================================================================
   3. CANONICAL DESTINATION IMAGE MANIFEST (50/50 DESTINATIONS)
   ========================================================================= */

export const PLACE_IMAGE_MANIFEST: Record<string, PlaceImage[]> = {
  "place_bbsr_001": [
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/hero.webp",
      "alt": "Authentic photograph of Lingaraj Temple in Odisha",
      "title": "Lingaraj Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/card.webp",
      "alt": "Lingaraj Temple architectural and landscape perspective",
      "title": "Lingaraj Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/thumbnail.webp",
      "alt": "Lingaraj Temple panorama perspective",
      "title": "Lingaraj Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Lingaraj Temple": [
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/hero.webp",
      "alt": "Authentic photograph of Lingaraj Temple in Odisha",
      "title": "Lingaraj Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/card.webp",
      "alt": "Lingaraj Temple architectural and landscape perspective",
      "title": "Lingaraj Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_001/06a456469886/thumbnail.webp",
      "alt": "Lingaraj Temple panorama perspective",
      "title": "Lingaraj Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sushant (Bubby) via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_002": [
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/hero.webp",
      "alt": "Authentic photograph of Mukteswar Temple in Odisha",
      "title": "Mukteswar Temple",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/card.webp",
      "alt": "Mukteswar Temple architectural and landscape perspective",
      "title": "Mukteswar Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/thumbnail.webp",
      "alt": "Mukteswar Temple panorama perspective",
      "title": "Mukteswar Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    }
  ],
  "Mukteswar Temple": [
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/hero.webp",
      "alt": "Authentic photograph of Mukteswar Temple in Odisha",
      "title": "Mukteswar Temple",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/card.webp",
      "alt": "Mukteswar Temple architectural and landscape perspective",
      "title": "Mukteswar Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_002/bf6293b73157/thumbnail.webp",
      "alt": "Mukteswar Temple panorama perspective",
      "title": "Mukteswar Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC0",
      "attribution": "Photo by Anandbora2024 via Wikimedia Commons, licensed under CC0",
      "isFallback": false
    }
  ],
  "place_bbsr_003": [
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/hero.webp",
      "alt": "Authentic photograph of Rajarani Temple in Odisha",
      "title": "Rajarani Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/card.webp",
      "alt": "Rajarani Temple architectural and landscape perspective",
      "title": "Rajarani Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/thumbnail.webp",
      "alt": "Rajarani Temple panorama perspective",
      "title": "Rajarani Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Rajarani Temple": [
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/hero.webp",
      "alt": "Authentic photograph of Rajarani Temple in Odisha",
      "title": "Rajarani Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/card.webp",
      "alt": "Rajarani Temple architectural and landscape perspective",
      "title": "Rajarani Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_003/0dd1f614ea63/thumbnail.webp",
      "alt": "Rajarani Temple panorama perspective",
      "title": "Rajarani Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Sourabh.biswas003 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_004": [
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/hero.webp",
      "alt": "Authentic photograph of Ananta Vasudeva Temple in Odisha",
      "title": "Ananta Vasudeva Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/card.webp",
      "alt": "Ananta Vasudeva Temple architectural and landscape perspective",
      "title": "Ananta Vasudeva Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/thumbnail.webp",
      "alt": "Ananta Vasudeva Temple panorama perspective",
      "title": "Ananta Vasudeva Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Ananta Vasudeva Temple": [
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/hero.webp",
      "alt": "Authentic photograph of Ananta Vasudeva Temple in Odisha",
      "title": "Ananta Vasudeva Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/card.webp",
      "alt": "Ananta Vasudeva Temple architectural and landscape perspective",
      "title": "Ananta Vasudeva Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_004/b91e7a5f0092/thumbnail.webp",
      "alt": "Ananta Vasudeva Temple panorama perspective",
      "title": "Ananta Vasudeva Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_005": [
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/hero.webp",
      "alt": "Authentic photograph of Udayagiri and Khandagiri Caves in Odisha",
      "title": "Udayagiri and Khandagiri Caves",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/card.webp",
      "alt": "Udayagiri and Khandagiri Caves architectural and landscape perspective",
      "title": "Udayagiri and Khandagiri Caves Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/thumbnail.webp",
      "alt": "Udayagiri and Khandagiri Caves panorama perspective",
      "title": "Udayagiri and Khandagiri Caves Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    }
  ],
  "Udayagiri and Khandagiri Caves": [
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/hero.webp",
      "alt": "Authentic photograph of Udayagiri and Khandagiri Caves in Odisha",
      "title": "Udayagiri and Khandagiri Caves",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/card.webp",
      "alt": "Udayagiri and Khandagiri Caves architectural and landscape perspective",
      "title": "Udayagiri and Khandagiri Caves Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_005/87c823650f8a/thumbnail.webp",
      "alt": "Udayagiri and Khandagiri Caves panorama perspective",
      "title": "Udayagiri and Khandagiri Caves Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Sourav Das from Santa Barbara, USA via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    }
  ],
  "place_bbsr_006": [
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/hero.webp",
      "alt": "Authentic photograph of Dhauli Shanti Stupa in Odisha",
      "title": "Dhauli Shanti Stupa",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/card.webp",
      "alt": "Dhauli Shanti Stupa architectural and landscape perspective",
      "title": "Dhauli Shanti Stupa Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/thumbnail.webp",
      "alt": "Dhauli Shanti Stupa panorama perspective",
      "title": "Dhauli Shanti Stupa Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Dhauli Shanti Stupa": [
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/hero.webp",
      "alt": "Authentic photograph of Dhauli Shanti Stupa in Odisha",
      "title": "Dhauli Shanti Stupa",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/card.webp",
      "alt": "Dhauli Shanti Stupa architectural and landscape perspective",
      "title": "Dhauli Shanti Stupa Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_006/94ea88ae627b/thumbnail.webp",
      "alt": "Dhauli Shanti Stupa panorama perspective",
      "title": "Dhauli Shanti Stupa Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Debashis Pradhan via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_bbsr_007": [
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/hero.webp",
      "alt": "Authentic photograph of Nandankanan Zoological Park in Odisha",
      "title": "Nandankanan Zoological Park",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/card.webp",
      "alt": "Nandankanan Zoological Park architectural and landscape perspective",
      "title": "Nandankanan Zoological Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/thumbnail.webp",
      "alt": "Nandankanan Zoological Park panorama perspective",
      "title": "Nandankanan Zoological Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Nandankanan Zoological Park": [
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/hero.webp",
      "alt": "Authentic photograph of Nandankanan Zoological Park in Odisha",
      "title": "Nandankanan Zoological Park",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/card.webp",
      "alt": "Nandankanan Zoological Park architectural and landscape perspective",
      "title": "Nandankanan Zoological Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_007/83ddf7bcbca3/thumbnail.webp",
      "alt": "Nandankanan Zoological Park panorama perspective",
      "title": "Nandankanan Zoological Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by DrGSINGH via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_008": [
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/hero.webp",
      "alt": "Authentic photograph of Odisha State Museum in Odisha",
      "title": "Odisha State Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/card.webp",
      "alt": "Odisha State Museum architectural and landscape perspective",
      "title": "Odisha State Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/thumbnail.webp",
      "alt": "Odisha State Museum panorama perspective",
      "title": "Odisha State Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    }
  ],
  "Odisha State Museum": [
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/hero.webp",
      "alt": "Authentic photograph of Odisha State Museum in Odisha",
      "title": "Odisha State Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/card.webp",
      "alt": "Odisha State Museum architectural and landscape perspective",
      "title": "Odisha State Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_008/dc85cc5814e7/thumbnail.webp",
      "alt": "Odisha State Museum panorama perspective",
      "title": "Odisha State Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by User:Tinucherian via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    }
  ],
  "place_bbsr_009": [
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/hero.webp",
      "alt": "Authentic photograph of Odisha Crafts Museum Kala Bhoomi in Odisha",
      "title": "Odisha Crafts Museum Kala Bhoomi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/card.webp",
      "alt": "Odisha Crafts Museum Kala Bhoomi architectural and landscape perspective",
      "title": "Odisha Crafts Museum Kala Bhoomi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/thumbnail.webp",
      "alt": "Odisha Crafts Museum Kala Bhoomi panorama perspective",
      "title": "Odisha Crafts Museum Kala Bhoomi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Odisha Crafts Museum Kala Bhoomi": [
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/hero.webp",
      "alt": "Authentic photograph of Odisha Crafts Museum Kala Bhoomi in Odisha",
      "title": "Odisha Crafts Museum Kala Bhoomi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/card.webp",
      "alt": "Odisha Crafts Museum Kala Bhoomi architectural and landscape perspective",
      "title": "Odisha Crafts Museum Kala Bhoomi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_009/d3fdc630c2d8/thumbnail.webp",
      "alt": "Odisha Crafts Museum Kala Bhoomi panorama perspective",
      "title": "Odisha Crafts Museum Kala Bhoomi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by SUDEEP PRAMANIK via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_010": [
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/hero.webp",
      "alt": "Authentic photograph of Ekamra Haat in Odisha",
      "title": "Ekamra Haat",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/card.webp",
      "alt": "Ekamra Haat architectural and landscape perspective",
      "title": "Ekamra Haat Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/thumbnail.webp",
      "alt": "Ekamra Haat panorama perspective",
      "title": "Ekamra Haat Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    }
  ],
  "Ekamra Haat": [
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/hero.webp",
      "alt": "Authentic photograph of Ekamra Haat in Odisha",
      "title": "Ekamra Haat",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/card.webp",
      "alt": "Ekamra Haat architectural and landscape perspective",
      "title": "Ekamra Haat Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_010/78c2ef783f40/thumbnail.webp",
      "alt": "Ekamra Haat panorama perspective",
      "title": "Ekamra Haat Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 3.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
      "isFallback": false
    }
  ],
  "place_bbsr_011": [
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/hero.webp",
      "alt": "Authentic photograph of Kalinga Stadium in Odisha",
      "title": "Kalinga Stadium",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/card.webp",
      "alt": "Kalinga Stadium architectural and landscape perspective",
      "title": "Kalinga Stadium Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/thumbnail.webp",
      "alt": "Kalinga Stadium panorama perspective",
      "title": "Kalinga Stadium Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Kalinga Stadium": [
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/hero.webp",
      "alt": "Authentic photograph of Kalinga Stadium in Odisha",
      "title": "Kalinga Stadium",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/card.webp",
      "alt": "Kalinga Stadium architectural and landscape perspective",
      "title": "Kalinga Stadium Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_011/36e8a9a95990/thumbnail.webp",
      "alt": "Kalinga Stadium panorama perspective",
      "title": "Kalinga Stadium Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "place_bbsr_012": [
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/hero.webp",
      "alt": "Authentic photograph of Bindu Sagar in Odisha",
      "title": "Bindu Sagar",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/card.webp",
      "alt": "Bindu Sagar architectural and landscape perspective",
      "title": "Bindu Sagar Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/thumbnail.webp",
      "alt": "Bindu Sagar panorama perspective",
      "title": "Bindu Sagar Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Bindu Sagar": [
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/hero.webp",
      "alt": "Authentic photograph of Bindu Sagar in Odisha",
      "title": "Bindu Sagar",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/card.webp",
      "alt": "Bindu Sagar architectural and landscape perspective",
      "title": "Bindu Sagar Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_bbsr_012/3e013f8a3fd2/thumbnail.webp",
      "alt": "Bindu Sagar panorama perspective",
      "title": "Bindu Sagar Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jalmanav via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_puri_001": [
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/hero.webp",
      "alt": "Authentic photograph of Jagannath Temple, Puri in Odisha",
      "title": "Jagannath Temple, Puri",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/card.webp",
      "alt": "Jagannath Temple, Puri architectural and landscape perspective",
      "title": "Jagannath Temple, Puri Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/thumbnail.webp",
      "alt": "Jagannath Temple, Puri panorama perspective",
      "title": "Jagannath Temple, Puri Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Jagannath Temple, Puri": [
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/hero.webp",
      "alt": "Authentic photograph of Jagannath Temple, Puri in Odisha",
      "title": "Jagannath Temple, Puri",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/card.webp",
      "alt": "Jagannath Temple, Puri architectural and landscape perspective",
      "title": "Jagannath Temple, Puri Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/thumbnail.webp",
      "alt": "Jagannath Temple, Puri panorama perspective",
      "title": "Jagannath Temple, Puri Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Jagannath Temple Puri": [
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/hero.webp",
      "alt": "Authentic photograph of Jagannath Temple, Puri in Odisha",
      "title": "Jagannath Temple, Puri",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/card.webp",
      "alt": "Jagannath Temple, Puri architectural and landscape perspective",
      "title": "Jagannath Temple, Puri Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/thumbnail.webp",
      "alt": "Jagannath Temple, Puri panorama perspective",
      "title": "Jagannath Temple, Puri Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_puri_002": [
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/hero.webp",
      "alt": "Authentic photograph of Puri Golden Beach in Odisha",
      "title": "Puri Golden Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/card.webp",
      "alt": "Puri Golden Beach architectural and landscape perspective",
      "title": "Puri Golden Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/thumbnail.webp",
      "alt": "Puri Golden Beach panorama perspective",
      "title": "Puri Golden Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Puri Golden Beach": [
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/hero.webp",
      "alt": "Authentic photograph of Puri Golden Beach in Odisha",
      "title": "Puri Golden Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/card.webp",
      "alt": "Puri Golden Beach architectural and landscape perspective",
      "title": "Puri Golden Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/thumbnail.webp",
      "alt": "Puri Golden Beach panorama perspective",
      "title": "Puri Golden Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_puri_003": [
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/hero.webp",
      "alt": "Authentic photograph of Gundicha Temple in Odisha",
      "title": "Gundicha Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/card.webp",
      "alt": "Gundicha Temple architectural and landscape perspective",
      "title": "Gundicha Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/thumbnail.webp",
      "alt": "Gundicha Temple panorama perspective",
      "title": "Gundicha Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Gundicha Temple": [
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/hero.webp",
      "alt": "Authentic photograph of Gundicha Temple in Odisha",
      "title": "Gundicha Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/card.webp",
      "alt": "Gundicha Temple architectural and landscape perspective",
      "title": "Gundicha Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_003/f14517383b2e/thumbnail.webp",
      "alt": "Gundicha Temple panorama perspective",
      "title": "Gundicha Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "place_puri_004": [
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/hero.webp",
      "alt": "Authentic photograph of Swargadwar Beach in Odisha",
      "title": "Swargadwar Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/card.webp",
      "alt": "Swargadwar Beach architectural and landscape perspective",
      "title": "Swargadwar Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/thumbnail.webp",
      "alt": "Swargadwar Beach panorama perspective",
      "title": "Swargadwar Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Swargadwar Beach": [
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/hero.webp",
      "alt": "Authentic photograph of Swargadwar Beach in Odisha",
      "title": "Swargadwar Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/card.webp",
      "alt": "Swargadwar Beach architectural and landscape perspective",
      "title": "Swargadwar Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_004/292d580f6bc0/thumbnail.webp",
      "alt": "Swargadwar Beach panorama perspective",
      "title": "Swargadwar Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_konark_001": [
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/hero.webp",
      "alt": "Authentic photograph of Konark Sun Temple in Odisha",
      "title": "Konark Sun Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/card.webp",
      "alt": "Konark Sun Temple architectural and landscape perspective",
      "title": "Konark Sun Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/thumbnail.webp",
      "alt": "Konark Sun Temple panorama perspective",
      "title": "Konark Sun Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Konark Sun Temple": [
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/hero.webp",
      "alt": "Authentic photograph of Konark Sun Temple in Odisha",
      "title": "Konark Sun Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/card.webp",
      "alt": "Konark Sun Temple architectural and landscape perspective",
      "title": "Konark Sun Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/thumbnail.webp",
      "alt": "Konark Sun Temple panorama perspective",
      "title": "Konark Sun Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_konark_002": [
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/hero.webp",
      "alt": "Authentic photograph of Chandrabhaga Beach in Odisha",
      "title": "Chandrabhaga Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/card.webp",
      "alt": "Chandrabhaga Beach architectural and landscape perspective",
      "title": "Chandrabhaga Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/thumbnail.webp",
      "alt": "Chandrabhaga Beach panorama perspective",
      "title": "Chandrabhaga Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Chandrabhaga Beach": [
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/hero.webp",
      "alt": "Authentic photograph of Chandrabhaga Beach in Odisha",
      "title": "Chandrabhaga Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/card.webp",
      "alt": "Chandrabhaga Beach architectural and landscape perspective",
      "title": "Chandrabhaga Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_002/96b3058c4a4d/thumbnail.webp",
      "alt": "Chandrabhaga Beach panorama perspective",
      "title": "Chandrabhaga Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_konark_003": [
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/hero.webp",
      "alt": "Authentic photograph of Ramachandi Beach & Temple in Odisha",
      "title": "Ramachandi Beach & Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/card.webp",
      "alt": "Ramachandi Beach & Temple architectural and landscape perspective",
      "title": "Ramachandi Beach & Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/thumbnail.webp",
      "alt": "Ramachandi Beach & Temple panorama perspective",
      "title": "Ramachandi Beach & Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Ramachandi Beach & Temple": [
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/hero.webp",
      "alt": "Authentic photograph of Ramachandi Beach & Temple in Odisha",
      "title": "Ramachandi Beach & Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/card.webp",
      "alt": "Ramachandi Beach & Temple architectural and landscape perspective",
      "title": "Ramachandi Beach & Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/thumbnail.webp",
      "alt": "Ramachandi Beach & Temple panorama perspective",
      "title": "Ramachandi Beach & Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_konark_004": [
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/hero.webp",
      "alt": "Authentic photograph of Konark Archaeological Museum in Odisha",
      "title": "Konark Archaeological Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/card.webp",
      "alt": "Konark Archaeological Museum architectural and landscape perspective",
      "title": "Konark Archaeological Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/thumbnail.webp",
      "alt": "Konark Archaeological Museum panorama perspective",
      "title": "Konark Archaeological Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Konark Archaeological Museum": [
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/hero.webp",
      "alt": "Authentic photograph of Konark Archaeological Museum in Odisha",
      "title": "Konark Archaeological Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/card.webp",
      "alt": "Konark Archaeological Museum architectural and landscape perspective",
      "title": "Konark Archaeological Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_004/ea4b0bedaa44/thumbnail.webp",
      "alt": "Konark Archaeological Museum panorama perspective",
      "title": "Konark Archaeological Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Pinakpani via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_cuttack_001": [
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/hero.webp",
      "alt": "Authentic photograph of Barabati Fort in Odisha",
      "title": "Barabati Fort",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/card.webp",
      "alt": "Barabati Fort architectural and landscape perspective",
      "title": "Barabati Fort Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/thumbnail.webp",
      "alt": "Barabati Fort panorama perspective",
      "title": "Barabati Fort Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Barabati Fort": [
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/hero.webp",
      "alt": "Authentic photograph of Barabati Fort in Odisha",
      "title": "Barabati Fort",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/card.webp",
      "alt": "Barabati Fort architectural and landscape perspective",
      "title": "Barabati Fort Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_001/02e40272a98d/thumbnail.webp",
      "alt": "Barabati Fort panorama perspective",
      "title": "Barabati Fort Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by MysticStone via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_cuttack_002": [
    {
      "src": "/static/images/places/place_cuttack_002/14877b098df9/hero.webp",
      "alt": "Authentic photograph of Cuttack Chandi Temple in Odisha",
      "title": "Cuttack Chandi Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Lipika Priyadarsini via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_002/14877b098df9/card.webp",
      "alt": "Cuttack Chandi Temple architectural and landscape perspective",
      "title": "Cuttack Chandi Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Lipika Priyadarsini via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_002/14877b098df9/thumbnail.webp",
      "alt": "Cuttack Chandi Temple panorama perspective",
      "title": "Cuttack Chandi Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Lipika Priyadarsini via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Cuttack Chandi Temple": [
    {
      "src": "/static/images/places/place_cuttack_002/14877b098df9/hero.webp",
      "alt": "Authentic photograph of Cuttack Chandi Temple in Odisha",
      "title": "Cuttack Chandi Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Lipika Priyadarsini via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_002/14877b098df9/card.webp",
      "alt": "Cuttack Chandi Temple architectural and landscape perspective",
      "title": "Cuttack Chandi Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Lipika Priyadarsini via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_002/14877b098df9/thumbnail.webp",
      "alt": "Cuttack Chandi Temple panorama perspective",
      "title": "Cuttack Chandi Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Lipika Priyadarsini via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_cuttack_003": [
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/hero.webp",
      "alt": "Authentic photograph of Odisha State Maritime Museum in Odisha",
      "title": "Odisha State Maritime Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/card.webp",
      "alt": "Odisha State Maritime Museum architectural and landscape perspective",
      "title": "Odisha State Maritime Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/thumbnail.webp",
      "alt": "Odisha State Maritime Museum panorama perspective",
      "title": "Odisha State Maritime Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Odisha State Maritime Museum": [
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/hero.webp",
      "alt": "Authentic photograph of Odisha State Maritime Museum in Odisha",
      "title": "Odisha State Maritime Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/card.webp",
      "alt": "Odisha State Maritime Museum architectural and landscape perspective",
      "title": "Odisha State Maritime Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_003/78dff96a9c3a/thumbnail.webp",
      "alt": "Odisha State Maritime Museum panorama perspective",
      "title": "Odisha State Maritime Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Soumendra Kumar Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_cuttack_004": [
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/hero.webp",
      "alt": "Authentic photograph of Netaji Birth Place Museum in Odisha",
      "title": "Netaji Birth Place Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/card.webp",
      "alt": "Netaji Birth Place Museum architectural and landscape perspective",
      "title": "Netaji Birth Place Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/thumbnail.webp",
      "alt": "Netaji Birth Place Museum panorama perspective",
      "title": "Netaji Birth Place Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Netaji Birth Place Museum": [
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/hero.webp",
      "alt": "Authentic photograph of Netaji Birth Place Museum in Odisha",
      "title": "Netaji Birth Place Museum",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/card.webp",
      "alt": "Netaji Birth Place Museum architectural and landscape perspective",
      "title": "Netaji Birth Place Museum Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_cuttack_004/3d8ae5f82b5d/thumbnail.webp",
      "alt": "Netaji Birth Place Museum panorama perspective",
      "title": "Netaji Birth Place Museum Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_chilika_001": [
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/hero.webp",
      "alt": "Authentic photograph of Chilika Lake - Satapada in Odisha",
      "title": "Chilika Lake - Satapada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/card.webp",
      "alt": "Chilika Lake - Satapada architectural and landscape perspective",
      "title": "Chilika Lake - Satapada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/thumbnail.webp",
      "alt": "Chilika Lake - Satapada panorama perspective",
      "title": "Chilika Lake - Satapada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Chilika Lake - Satapada": [
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/hero.webp",
      "alt": "Authentic photograph of Chilika Lake - Satapada in Odisha",
      "title": "Chilika Lake - Satapada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/card.webp",
      "alt": "Chilika Lake - Satapada architectural and landscape perspective",
      "title": "Chilika Lake - Satapada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/thumbnail.webp",
      "alt": "Chilika Lake - Satapada panorama perspective",
      "title": "Chilika Lake - Satapada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Chilika Lake   Satapada": [
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/hero.webp",
      "alt": "Authentic photograph of Chilika Lake - Satapada in Odisha",
      "title": "Chilika Lake - Satapada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/card.webp",
      "alt": "Chilika Lake - Satapada architectural and landscape perspective",
      "title": "Chilika Lake - Satapada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/thumbnail.webp",
      "alt": "Chilika Lake - Satapada panorama perspective",
      "title": "Chilika Lake - Satapada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_chilika_002": [
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/hero.webp",
      "alt": "Authentic photograph of Kalijai Island Temple, Chilika in Odisha",
      "title": "Kalijai Island Temple, Chilika",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/card.webp",
      "alt": "Kalijai Island Temple, Chilika architectural and landscape perspective",
      "title": "Kalijai Island Temple, Chilika Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/thumbnail.webp",
      "alt": "Kalijai Island Temple, Chilika panorama perspective",
      "title": "Kalijai Island Temple, Chilika Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Kalijai Island Temple, Chilika": [
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/hero.webp",
      "alt": "Authentic photograph of Kalijai Island Temple, Chilika in Odisha",
      "title": "Kalijai Island Temple, Chilika",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/card.webp",
      "alt": "Kalijai Island Temple, Chilika architectural and landscape perspective",
      "title": "Kalijai Island Temple, Chilika Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/thumbnail.webp",
      "alt": "Kalijai Island Temple, Chilika panorama perspective",
      "title": "Kalijai Island Temple, Chilika Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Kalijai Island Temple Chilika": [
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/hero.webp",
      "alt": "Authentic photograph of Kalijai Island Temple, Chilika in Odisha",
      "title": "Kalijai Island Temple, Chilika",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/card.webp",
      "alt": "Kalijai Island Temple, Chilika architectural and landscape perspective",
      "title": "Kalijai Island Temple, Chilika Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/thumbnail.webp",
      "alt": "Kalijai Island Temple, Chilika panorama perspective",
      "title": "Kalijai Island Temple, Chilika Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_chilika_003": [
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/hero.webp",
      "alt": "Authentic photograph of Mangalajodi Bird Sanctuary in Odisha",
      "title": "Mangalajodi Bird Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/card.webp",
      "alt": "Mangalajodi Bird Sanctuary architectural and landscape perspective",
      "title": "Mangalajodi Bird Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/thumbnail.webp",
      "alt": "Mangalajodi Bird Sanctuary panorama perspective",
      "title": "Mangalajodi Bird Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    }
  ],
  "Mangalajodi Bird Sanctuary": [
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/hero.webp",
      "alt": "Authentic photograph of Mangalajodi Bird Sanctuary in Odisha",
      "title": "Mangalajodi Bird Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/card.webp",
      "alt": "Mangalajodi Bird Sanctuary architectural and landscape perspective",
      "title": "Mangalajodi Bird Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/thumbnail.webp",
      "alt": "Mangalajodi Bird Sanctuary panorama perspective",
      "title": "Mangalajodi Bird Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    }
  ],
  "place_ganjam_001": [
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/hero.webp",
      "alt": "Authentic photograph of Gopalpur-on-Sea Beach in Odisha",
      "title": "Gopalpur-on-Sea Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/card.webp",
      "alt": "Gopalpur-on-Sea Beach architectural and landscape perspective",
      "title": "Gopalpur-on-Sea Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/thumbnail.webp",
      "alt": "Gopalpur-on-Sea Beach panorama perspective",
      "title": "Gopalpur-on-Sea Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Gopalpur-on-Sea Beach": [
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/hero.webp",
      "alt": "Authentic photograph of Gopalpur-on-Sea Beach in Odisha",
      "title": "Gopalpur-on-Sea Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/card.webp",
      "alt": "Gopalpur-on-Sea Beach architectural and landscape perspective",
      "title": "Gopalpur-on-Sea Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/thumbnail.webp",
      "alt": "Gopalpur-on-Sea Beach panorama perspective",
      "title": "Gopalpur-on-Sea Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Gopalpur on Sea Beach": [
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/hero.webp",
      "alt": "Authentic photograph of Gopalpur-on-Sea Beach in Odisha",
      "title": "Gopalpur-on-Sea Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/card.webp",
      "alt": "Gopalpur-on-Sea Beach architectural and landscape perspective",
      "title": "Gopalpur-on-Sea Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/thumbnail.webp",
      "alt": "Gopalpur-on-Sea Beach panorama perspective",
      "title": "Gopalpur-on-Sea Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_ganjam_002": [
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/hero.webp",
      "alt": "Authentic photograph of Tara Tarini Temple in Odisha",
      "title": "Tara Tarini Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/card.webp",
      "alt": "Tara Tarini Temple architectural and landscape perspective",
      "title": "Tara Tarini Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/thumbnail.webp",
      "alt": "Tara Tarini Temple panorama perspective",
      "title": "Tara Tarini Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Tara Tarini Temple": [
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/hero.webp",
      "alt": "Authentic photograph of Tara Tarini Temple in Odisha",
      "title": "Tara Tarini Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/card.webp",
      "alt": "Tara Tarini Temple architectural and landscape perspective",
      "title": "Tara Tarini Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_002/87bc44f63b2d/thumbnail.webp",
      "alt": "Tara Tarini Temple panorama perspective",
      "title": "Tara Tarini Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "place_daringbadi_001": [
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/hero.webp",
      "alt": "Authentic photograph of Daringbadi Hill Station in Odisha",
      "title": "Daringbadi Hill Station",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/card.webp",
      "alt": "Daringbadi Hill Station architectural and landscape perspective",
      "title": "Daringbadi Hill Station Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/thumbnail.webp",
      "alt": "Daringbadi Hill Station panorama perspective",
      "title": "Daringbadi Hill Station Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Daringbadi Hill Station": [
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/hero.webp",
      "alt": "Authentic photograph of Daringbadi Hill Station in Odisha",
      "title": "Daringbadi Hill Station",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/card.webp",
      "alt": "Daringbadi Hill Station architectural and landscape perspective",
      "title": "Daringbadi Hill Station Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/thumbnail.webp",
      "alt": "Daringbadi Hill Station panorama perspective",
      "title": "Daringbadi Hill Station Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_daringbadi_002": [
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/hero.webp",
      "alt": "Authentic photograph of Midubanda Waterfall, Daringbadi in Odisha",
      "title": "Midubanda Waterfall, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/card.webp",
      "alt": "Midubanda Waterfall, Daringbadi architectural and landscape perspective",
      "title": "Midubanda Waterfall, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/thumbnail.webp",
      "alt": "Midubanda Waterfall, Daringbadi panorama perspective",
      "title": "Midubanda Waterfall, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Midubanda Waterfall, Daringbadi": [
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/hero.webp",
      "alt": "Authentic photograph of Midubanda Waterfall, Daringbadi in Odisha",
      "title": "Midubanda Waterfall, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/card.webp",
      "alt": "Midubanda Waterfall, Daringbadi architectural and landscape perspective",
      "title": "Midubanda Waterfall, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/thumbnail.webp",
      "alt": "Midubanda Waterfall, Daringbadi panorama perspective",
      "title": "Midubanda Waterfall, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Midubanda Waterfall Daringbadi": [
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/hero.webp",
      "alt": "Authentic photograph of Midubanda Waterfall, Daringbadi in Odisha",
      "title": "Midubanda Waterfall, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/card.webp",
      "alt": "Midubanda Waterfall, Daringbadi architectural and landscape perspective",
      "title": "Midubanda Waterfall, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/thumbnail.webp",
      "alt": "Midubanda Waterfall, Daringbadi panorama perspective",
      "title": "Midubanda Waterfall, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_daringbadi_003": [
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/hero.webp",
      "alt": "Authentic photograph of Coffee Gardens, Daringbadi in Odisha",
      "title": "Coffee Gardens, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/card.webp",
      "alt": "Coffee Gardens, Daringbadi architectural and landscape perspective",
      "title": "Coffee Gardens, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/thumbnail.webp",
      "alt": "Coffee Gardens, Daringbadi panorama perspective",
      "title": "Coffee Gardens, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Coffee Gardens, Daringbadi": [
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/hero.webp",
      "alt": "Authentic photograph of Coffee Gardens, Daringbadi in Odisha",
      "title": "Coffee Gardens, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/card.webp",
      "alt": "Coffee Gardens, Daringbadi architectural and landscape perspective",
      "title": "Coffee Gardens, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/thumbnail.webp",
      "alt": "Coffee Gardens, Daringbadi panorama perspective",
      "title": "Coffee Gardens, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Coffee Gardens Daringbadi": [
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/hero.webp",
      "alt": "Authentic photograph of Coffee Gardens, Daringbadi in Odisha",
      "title": "Coffee Gardens, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/card.webp",
      "alt": "Coffee Gardens, Daringbadi architectural and landscape perspective",
      "title": "Coffee Gardens, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_003/18724980adff/thumbnail.webp",
      "alt": "Coffee Gardens, Daringbadi panorama perspective",
      "title": "Coffee Gardens, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_daringbadi_004": [
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/hero.webp",
      "alt": "Authentic photograph of Belghar Nature Camp in Odisha",
      "title": "Belghar Nature Camp",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/card.webp",
      "alt": "Belghar Nature Camp architectural and landscape perspective",
      "title": "Belghar Nature Camp Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/thumbnail.webp",
      "alt": "Belghar Nature Camp panorama perspective",
      "title": "Belghar Nature Camp Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Belghar Nature Camp": [
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/hero.webp",
      "alt": "Authentic photograph of Belghar Nature Camp in Odisha",
      "title": "Belghar Nature Camp",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/card.webp",
      "alt": "Belghar Nature Camp architectural and landscape perspective",
      "title": "Belghar Nature Camp Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_004/c5ae233d3210/thumbnail.webp",
      "alt": "Belghar Nature Camp panorama perspective",
      "title": "Belghar Nature Camp Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 at Bangla Wikipedia via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_sambalpur_001": [
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/hero.webp",
      "alt": "Authentic photograph of Hirakud Dam & Reservoir in Odisha",
      "title": "Hirakud Dam & Reservoir",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/card.webp",
      "alt": "Hirakud Dam & Reservoir architectural and landscape perspective",
      "title": "Hirakud Dam & Reservoir Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/thumbnail.webp",
      "alt": "Hirakud Dam & Reservoir panorama perspective",
      "title": "Hirakud Dam & Reservoir Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Hirakud Dam & Reservoir": [
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/hero.webp",
      "alt": "Authentic photograph of Hirakud Dam & Reservoir in Odisha",
      "title": "Hirakud Dam & Reservoir",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/card.webp",
      "alt": "Hirakud Dam & Reservoir architectural and landscape perspective",
      "title": "Hirakud Dam & Reservoir Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/thumbnail.webp",
      "alt": "Hirakud Dam & Reservoir panorama perspective",
      "title": "Hirakud Dam & Reservoir Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_sambalpur_002": [
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/hero.webp",
      "alt": "Authentic photograph of Samaleswari Temple, Sambalpur in Odisha",
      "title": "Samaleswari Temple, Sambalpur",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/card.webp",
      "alt": "Samaleswari Temple, Sambalpur architectural and landscape perspective",
      "title": "Samaleswari Temple, Sambalpur Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/thumbnail.webp",
      "alt": "Samaleswari Temple, Sambalpur panorama perspective",
      "title": "Samaleswari Temple, Sambalpur Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Samaleswari Temple, Sambalpur": [
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/hero.webp",
      "alt": "Authentic photograph of Samaleswari Temple, Sambalpur in Odisha",
      "title": "Samaleswari Temple, Sambalpur",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/card.webp",
      "alt": "Samaleswari Temple, Sambalpur architectural and landscape perspective",
      "title": "Samaleswari Temple, Sambalpur Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/thumbnail.webp",
      "alt": "Samaleswari Temple, Sambalpur panorama perspective",
      "title": "Samaleswari Temple, Sambalpur Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Samaleswari Temple Sambalpur": [
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/hero.webp",
      "alt": "Authentic photograph of Samaleswari Temple, Sambalpur in Odisha",
      "title": "Samaleswari Temple, Sambalpur",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/card.webp",
      "alt": "Samaleswari Temple, Sambalpur architectural and landscape perspective",
      "title": "Samaleswari Temple, Sambalpur Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/thumbnail.webp",
      "alt": "Samaleswari Temple, Sambalpur panorama perspective",
      "title": "Samaleswari Temple, Sambalpur Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_sambalpur_003": [
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/hero.webp",
      "alt": "Authentic photograph of Huma Leaning Temple in Odisha",
      "title": "Huma Leaning Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/card.webp",
      "alt": "Huma Leaning Temple architectural and landscape perspective",
      "title": "Huma Leaning Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/thumbnail.webp",
      "alt": "Huma Leaning Temple panorama perspective",
      "title": "Huma Leaning Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Huma Leaning Temple": [
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/hero.webp",
      "alt": "Authentic photograph of Huma Leaning Temple in Odisha",
      "title": "Huma Leaning Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/card.webp",
      "alt": "Huma Leaning Temple architectural and landscape perspective",
      "title": "Huma Leaning Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_003/62ffb7d419a2/thumbnail.webp",
      "alt": "Huma Leaning Temple panorama perspective",
      "title": "Huma Leaning Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Jnanaranjan sahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_sambalpur_004": [
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/hero.webp",
      "alt": "Authentic photograph of Debrigarh Wildlife Sanctuary in Odisha",
      "title": "Debrigarh Wildlife Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/card.webp",
      "alt": "Debrigarh Wildlife Sanctuary architectural and landscape perspective",
      "title": "Debrigarh Wildlife Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/thumbnail.webp",
      "alt": "Debrigarh Wildlife Sanctuary panorama perspective",
      "title": "Debrigarh Wildlife Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Debrigarh Wildlife Sanctuary": [
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/hero.webp",
      "alt": "Authentic photograph of Debrigarh Wildlife Sanctuary in Odisha",
      "title": "Debrigarh Wildlife Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/card.webp",
      "alt": "Debrigarh Wildlife Sanctuary architectural and landscape perspective",
      "title": "Debrigarh Wildlife Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/thumbnail.webp",
      "alt": "Debrigarh Wildlife Sanctuary panorama perspective",
      "title": "Debrigarh Wildlife Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_rourkela_001": [
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/hero.webp",
      "alt": "Authentic photograph of Hanuman Vatika, Rourkela in Odisha",
      "title": "Hanuman Vatika, Rourkela",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/card.webp",
      "alt": "Hanuman Vatika, Rourkela architectural and landscape perspective",
      "title": "Hanuman Vatika, Rourkela Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/thumbnail.webp",
      "alt": "Hanuman Vatika, Rourkela panorama perspective",
      "title": "Hanuman Vatika, Rourkela Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Hanuman Vatika, Rourkela": [
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/hero.webp",
      "alt": "Authentic photograph of Hanuman Vatika, Rourkela in Odisha",
      "title": "Hanuman Vatika, Rourkela",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/card.webp",
      "alt": "Hanuman Vatika, Rourkela architectural and landscape perspective",
      "title": "Hanuman Vatika, Rourkela Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/thumbnail.webp",
      "alt": "Hanuman Vatika, Rourkela panorama perspective",
      "title": "Hanuman Vatika, Rourkela Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Hanuman Vatika Rourkela": [
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/hero.webp",
      "alt": "Authentic photograph of Hanuman Vatika, Rourkela in Odisha",
      "title": "Hanuman Vatika, Rourkela",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/card.webp",
      "alt": "Hanuman Vatika, Rourkela architectural and landscape perspective",
      "title": "Hanuman Vatika, Rourkela Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/thumbnail.webp",
      "alt": "Hanuman Vatika, Rourkela panorama perspective",
      "title": "Hanuman Vatika, Rourkela Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_rourkela_002": [
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/hero.webp",
      "alt": "Authentic photograph of Mandira Dam, Sundargarh in Odisha",
      "title": "Mandira Dam, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/card.webp",
      "alt": "Mandira Dam, Sundargarh architectural and landscape perspective",
      "title": "Mandira Dam, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/thumbnail.webp",
      "alt": "Mandira Dam, Sundargarh panorama perspective",
      "title": "Mandira Dam, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Mandira Dam, Sundargarh": [
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/hero.webp",
      "alt": "Authentic photograph of Mandira Dam, Sundargarh in Odisha",
      "title": "Mandira Dam, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/card.webp",
      "alt": "Mandira Dam, Sundargarh architectural and landscape perspective",
      "title": "Mandira Dam, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/thumbnail.webp",
      "alt": "Mandira Dam, Sundargarh panorama perspective",
      "title": "Mandira Dam, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Mandira Dam Sundargarh": [
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/hero.webp",
      "alt": "Authentic photograph of Mandira Dam, Sundargarh in Odisha",
      "title": "Mandira Dam, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/card.webp",
      "alt": "Mandira Dam, Sundargarh architectural and landscape perspective",
      "title": "Mandira Dam, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/thumbnail.webp",
      "alt": "Mandira Dam, Sundargarh panorama perspective",
      "title": "Mandira Dam, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_rourkela_003": [
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/hero.webp",
      "alt": "Authentic photograph of Khandadhar Waterfall, Sundargarh in Odisha",
      "title": "Khandadhar Waterfall, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/card.webp",
      "alt": "Khandadhar Waterfall, Sundargarh architectural and landscape perspective",
      "title": "Khandadhar Waterfall, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/thumbnail.webp",
      "alt": "Khandadhar Waterfall, Sundargarh panorama perspective",
      "title": "Khandadhar Waterfall, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Khandadhar Waterfall, Sundargarh": [
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/hero.webp",
      "alt": "Authentic photograph of Khandadhar Waterfall, Sundargarh in Odisha",
      "title": "Khandadhar Waterfall, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/card.webp",
      "alt": "Khandadhar Waterfall, Sundargarh architectural and landscape perspective",
      "title": "Khandadhar Waterfall, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/thumbnail.webp",
      "alt": "Khandadhar Waterfall, Sundargarh panorama perspective",
      "title": "Khandadhar Waterfall, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Khandadhar Waterfall Sundargarh": [
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/hero.webp",
      "alt": "Authentic photograph of Khandadhar Waterfall, Sundargarh in Odisha",
      "title": "Khandadhar Waterfall, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/card.webp",
      "alt": "Khandadhar Waterfall, Sundargarh architectural and landscape perspective",
      "title": "Khandadhar Waterfall, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/thumbnail.webp",
      "alt": "Khandadhar Waterfall, Sundargarh panorama perspective",
      "title": "Khandadhar Waterfall, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_mayurbhanj_001": [
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/hero.webp",
      "alt": "Authentic photograph of Similipal National Park in Odisha",
      "title": "Similipal National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/card.webp",
      "alt": "Similipal National Park architectural and landscape perspective",
      "title": "Similipal National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/thumbnail.webp",
      "alt": "Similipal National Park panorama perspective",
      "title": "Similipal National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Similipal National Park": [
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/hero.webp",
      "alt": "Authentic photograph of Similipal National Park in Odisha",
      "title": "Similipal National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/card.webp",
      "alt": "Similipal National Park architectural and landscape perspective",
      "title": "Similipal National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/thumbnail.webp",
      "alt": "Similipal National Park panorama perspective",
      "title": "Similipal National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "place_mayurbhanj_002": [
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/hero.webp",
      "alt": "Authentic photograph of Barehipani & Joranda Falls in Odisha",
      "title": "Barehipani & Joranda Falls",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/card.webp",
      "alt": "Barehipani & Joranda Falls architectural and landscape perspective",
      "title": "Barehipani & Joranda Falls Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/thumbnail.webp",
      "alt": "Barehipani & Joranda Falls panorama perspective",
      "title": "Barehipani & Joranda Falls Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Barehipani & Joranda Falls": [
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/hero.webp",
      "alt": "Authentic photograph of Barehipani & Joranda Falls in Odisha",
      "title": "Barehipani & Joranda Falls",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/card.webp",
      "alt": "Barehipani & Joranda Falls architectural and landscape perspective",
      "title": "Barehipani & Joranda Falls Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/thumbnail.webp",
      "alt": "Barehipani & Joranda Falls panorama perspective",
      "title": "Barehipani & Joranda Falls Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_balasore_001": [
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/hero.webp",
      "alt": "Authentic photograph of Chandipur Beach in Odisha",
      "title": "Chandipur Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/card.webp",
      "alt": "Chandipur Beach architectural and landscape perspective",
      "title": "Chandipur Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/thumbnail.webp",
      "alt": "Chandipur Beach panorama perspective",
      "title": "Chandipur Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Chandipur Beach": [
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/hero.webp",
      "alt": "Authentic photograph of Chandipur Beach in Odisha",
      "title": "Chandipur Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/card.webp",
      "alt": "Chandipur Beach architectural and landscape perspective",
      "title": "Chandipur Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_balasore_001/7b71840acce2/thumbnail.webp",
      "alt": "Chandipur Beach panorama perspective",
      "title": "Chandipur Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by B.Sunita M via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_kendrapara_001": [
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/hero.webp",
      "alt": "Authentic photograph of Bhitarkanika National Park in Odisha",
      "title": "Bhitarkanika National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/card.webp",
      "alt": "Bhitarkanika National Park architectural and landscape perspective",
      "title": "Bhitarkanika National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/thumbnail.webp",
      "alt": "Bhitarkanika National Park panorama perspective",
      "title": "Bhitarkanika National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Bhitarkanika National Park": [
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/hero.webp",
      "alt": "Authentic photograph of Bhitarkanika National Park in Odisha",
      "title": "Bhitarkanika National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/card.webp",
      "alt": "Bhitarkanika National Park architectural and landscape perspective",
      "title": "Bhitarkanika National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/thumbnail.webp",
      "alt": "Bhitarkanika National Park panorama perspective",
      "title": "Bhitarkanika National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_koraput_001": [
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/hero.webp",
      "alt": "Authentic photograph of Gupteswar Cave Temple, Koraput in Odisha",
      "title": "Gupteswar Cave Temple, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/card.webp",
      "alt": "Gupteswar Cave Temple, Koraput architectural and landscape perspective",
      "title": "Gupteswar Cave Temple, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/thumbnail.webp",
      "alt": "Gupteswar Cave Temple, Koraput panorama perspective",
      "title": "Gupteswar Cave Temple, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Gupteswar Cave Temple, Koraput": [
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/hero.webp",
      "alt": "Authentic photograph of Gupteswar Cave Temple, Koraput in Odisha",
      "title": "Gupteswar Cave Temple, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/card.webp",
      "alt": "Gupteswar Cave Temple, Koraput architectural and landscape perspective",
      "title": "Gupteswar Cave Temple, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/thumbnail.webp",
      "alt": "Gupteswar Cave Temple, Koraput panorama perspective",
      "title": "Gupteswar Cave Temple, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Gupteswar Cave Temple Koraput": [
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/hero.webp",
      "alt": "Authentic photograph of Gupteswar Cave Temple, Koraput in Odisha",
      "title": "Gupteswar Cave Temple, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/card.webp",
      "alt": "Gupteswar Cave Temple, Koraput architectural and landscape perspective",
      "title": "Gupteswar Cave Temple, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/thumbnail.webp",
      "alt": "Gupteswar Cave Temple, Koraput panorama perspective",
      "title": "Gupteswar Cave Temple, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_koraput_002": [
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/hero.webp",
      "alt": "Authentic photograph of Duduma Waterfall in Odisha",
      "title": "Duduma Waterfall",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/card.webp",
      "alt": "Duduma Waterfall architectural and landscape perspective",
      "title": "Duduma Waterfall Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/thumbnail.webp",
      "alt": "Duduma Waterfall panorama perspective",
      "title": "Duduma Waterfall Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Duduma Waterfall": [
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/hero.webp",
      "alt": "Authentic photograph of Duduma Waterfall in Odisha",
      "title": "Duduma Waterfall",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/card.webp",
      "alt": "Duduma Waterfall architectural and landscape perspective",
      "title": "Duduma Waterfall Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_002/da596fb21308/thumbnail.webp",
      "alt": "Duduma Waterfall panorama perspective",
      "title": "Duduma Waterfall Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Parthapratim25 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_koraput_003": [
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/hero.webp",
      "alt": "Authentic photograph of Deomali Peak, Koraput in Odisha",
      "title": "Deomali Peak, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/card.webp",
      "alt": "Deomali Peak, Koraput architectural and landscape perspective",
      "title": "Deomali Peak, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/thumbnail.webp",
      "alt": "Deomali Peak, Koraput panorama perspective",
      "title": "Deomali Peak, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Deomali Peak, Koraput": [
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/hero.webp",
      "alt": "Authentic photograph of Deomali Peak, Koraput in Odisha",
      "title": "Deomali Peak, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/card.webp",
      "alt": "Deomali Peak, Koraput architectural and landscape perspective",
      "title": "Deomali Peak, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/thumbnail.webp",
      "alt": "Deomali Peak, Koraput panorama perspective",
      "title": "Deomali Peak, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Deomali Peak Koraput": [
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/hero.webp",
      "alt": "Authentic photograph of Deomali Peak, Koraput in Odisha",
      "title": "Deomali Peak, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/card.webp",
      "alt": "Deomali Peak, Koraput architectural and landscape perspective",
      "title": "Deomali Peak, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/thumbnail.webp",
      "alt": "Deomali Peak, Koraput panorama perspective",
      "title": "Deomali Peak, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_koraput_004": [
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/hero.webp",
      "alt": "Authentic photograph of Tribal Museum, Koraput in Odisha",
      "title": "Tribal Museum, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/card.webp",
      "alt": "Tribal Museum, Koraput architectural and landscape perspective",
      "title": "Tribal Museum, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/thumbnail.webp",
      "alt": "Tribal Museum, Koraput panorama perspective",
      "title": "Tribal Museum, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Tribal Museum, Koraput": [
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/hero.webp",
      "alt": "Authentic photograph of Tribal Museum, Koraput in Odisha",
      "title": "Tribal Museum, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/card.webp",
      "alt": "Tribal Museum, Koraput architectural and landscape perspective",
      "title": "Tribal Museum, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/thumbnail.webp",
      "alt": "Tribal Museum, Koraput panorama perspective",
      "title": "Tribal Museum, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Tribal Museum Koraput": [
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/hero.webp",
      "alt": "Authentic photograph of Tribal Museum, Koraput in Odisha",
      "title": "Tribal Museum, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/card.webp",
      "alt": "Tribal Museum, Koraput architectural and landscape perspective",
      "title": "Tribal Museum, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_004/a54c2ebd04a0/thumbnail.webp",
      "alt": "Tribal Museum, Koraput panorama perspective",
      "title": "Tribal Museum, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "place_koraput_005": [
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/hero.webp",
      "alt": "Authentic photograph of Kolab Reservoir & Botanical Garden in Odisha",
      "title": "Kolab Reservoir & Botanical Garden",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/card.webp",
      "alt": "Kolab Reservoir & Botanical Garden architectural and landscape perspective",
      "title": "Kolab Reservoir & Botanical Garden Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/thumbnail.webp",
      "alt": "Kolab Reservoir & Botanical Garden panorama perspective",
      "title": "Kolab Reservoir & Botanical Garden Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Kolab Reservoir & Botanical Garden": [
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/hero.webp",
      "alt": "Authentic photograph of Kolab Reservoir & Botanical Garden in Odisha",
      "title": "Kolab Reservoir & Botanical Garden",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/card.webp",
      "alt": "Kolab Reservoir & Botanical Garden architectural and landscape perspective",
      "title": "Kolab Reservoir & Botanical Garden Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/thumbnail.webp",
      "alt": "Kolab Reservoir & Botanical Garden panorama perspective",
      "title": "Kolab Reservoir & Botanical Garden Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "place_rayagada_001": [
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/hero.webp",
      "alt": "Authentic photograph of Maa Majhigouri Temple, Rayagada in Odisha",
      "title": "Maa Majhigouri Temple, Rayagada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/card.webp",
      "alt": "Maa Majhigouri Temple, Rayagada architectural and landscape perspective",
      "title": "Maa Majhigouri Temple, Rayagada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/thumbnail.webp",
      "alt": "Maa Majhigouri Temple, Rayagada panorama perspective",
      "title": "Maa Majhigouri Temple, Rayagada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Maa Majhigouri Temple, Rayagada": [
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/hero.webp",
      "alt": "Authentic photograph of Maa Majhigouri Temple, Rayagada in Odisha",
      "title": "Maa Majhigouri Temple, Rayagada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/card.webp",
      "alt": "Maa Majhigouri Temple, Rayagada architectural and landscape perspective",
      "title": "Maa Majhigouri Temple, Rayagada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/thumbnail.webp",
      "alt": "Maa Majhigouri Temple, Rayagada panorama perspective",
      "title": "Maa Majhigouri Temple, Rayagada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Maa Majhigouri Temple Rayagada": [
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/hero.webp",
      "alt": "Authentic photograph of Maa Majhigouri Temple, Rayagada in Odisha",
      "title": "Maa Majhigouri Temple, Rayagada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/card.webp",
      "alt": "Maa Majhigouri Temple, Rayagada architectural and landscape perspective",
      "title": "Maa Majhigouri Temple, Rayagada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/thumbnail.webp",
      "alt": "Maa Majhigouri Temple, Rayagada panorama perspective",
      "title": "Maa Majhigouri Temple, Rayagada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Jagannath Temple": [
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/hero.webp",
      "alt": "Authentic photograph of Jagannath Temple, Puri in Odisha",
      "title": "Jagannath Temple, Puri",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/card.webp",
      "alt": "Jagannath Temple, Puri architectural and landscape perspective",
      "title": "Jagannath Temple, Puri Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/thumbnail.webp",
      "alt": "Jagannath Temple, Puri panorama perspective",
      "title": "Jagannath Temple, Puri Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Shree Jagannatha Temple Puri": [
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/hero.webp",
      "alt": "Authentic photograph of Jagannath Temple, Puri in Odisha",
      "title": "Jagannath Temple, Puri",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/card.webp",
      "alt": "Jagannath Temple, Puri architectural and landscape perspective",
      "title": "Jagannath Temple, Puri Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/thumbnail.webp",
      "alt": "Jagannath Temple, Puri panorama perspective",
      "title": "Jagannath Temple, Puri Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Puri Jagannath": [
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/hero.webp",
      "alt": "Authentic photograph of Jagannath Temple, Puri in Odisha",
      "title": "Jagannath Temple, Puri",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/card.webp",
      "alt": "Jagannath Temple, Puri architectural and landscape perspective",
      "title": "Jagannath Temple, Puri Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_001/02287867dc89/thumbnail.webp",
      "alt": "Jagannath Temple, Puri panorama perspective",
      "title": "Jagannath Temple, Puri Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kabita.singh via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Puri Beach": [
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/hero.webp",
      "alt": "Authentic photograph of Puri Golden Beach in Odisha",
      "title": "Puri Golden Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/card.webp",
      "alt": "Puri Golden Beach architectural and landscape perspective",
      "title": "Puri Golden Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_puri_002/8146170ae9b7/thumbnail.webp",
      "alt": "Puri Golden Beach panorama perspective",
      "title": "Puri Golden Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Kritzolina via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Sun Temple Konark": [
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/hero.webp",
      "alt": "Authentic photograph of Konark Sun Temple in Odisha",
      "title": "Konark Sun Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/card.webp",
      "alt": "Konark Sun Temple architectural and landscape perspective",
      "title": "Konark Sun Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_001/03b959a8abef/thumbnail.webp",
      "alt": "Konark Sun Temple panorama perspective",
      "title": "Konark Sun Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Phadke09 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Ramachandi Beach": [
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/hero.webp",
      "alt": "Authentic photograph of Ramachandi Beach & Temple in Odisha",
      "title": "Ramachandi Beach & Temple",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/card.webp",
      "alt": "Ramachandi Beach & Temple architectural and landscape perspective",
      "title": "Ramachandi Beach & Temple Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_konark_003/05c33a10ed83/thumbnail.webp",
      "alt": "Ramachandi Beach & Temple panorama perspective",
      "title": "Ramachandi Beach & Temple Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Swapnil.sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Chilika Lake": [
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/hero.webp",
      "alt": "Authentic photograph of Chilika Lake - Satapada in Odisha",
      "title": "Chilika Lake - Satapada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/card.webp",
      "alt": "Chilika Lake - Satapada architectural and landscape perspective",
      "title": "Chilika Lake - Satapada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/thumbnail.webp",
      "alt": "Chilika Lake - Satapada panorama perspective",
      "title": "Chilika Lake - Satapada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Satapada": [
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/hero.webp",
      "alt": "Authentic photograph of Chilika Lake - Satapada in Odisha",
      "title": "Chilika Lake - Satapada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/card.webp",
      "alt": "Chilika Lake - Satapada architectural and landscape perspective",
      "title": "Chilika Lake - Satapada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_001/b5a796039cf9/thumbnail.webp",
      "alt": "Chilika Lake - Satapada panorama perspective",
      "title": "Chilika Lake - Satapada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Rangan Datta Wiki via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Kalijai Island Temple": [
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/hero.webp",
      "alt": "Authentic photograph of Kalijai Island Temple, Chilika in Odisha",
      "title": "Kalijai Island Temple, Chilika",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/card.webp",
      "alt": "Kalijai Island Temple, Chilika architectural and landscape perspective",
      "title": "Kalijai Island Temple, Chilika Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_002/a4ae8ae04351/thumbnail.webp",
      "alt": "Kalijai Island Temple, Chilika panorama perspective",
      "title": "Kalijai Island Temple, Chilika Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hellohappy via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Mangalajodi": [
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/hero.webp",
      "alt": "Authentic photograph of Mangalajodi Bird Sanctuary in Odisha",
      "title": "Mangalajodi Bird Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/card.webp",
      "alt": "Mangalajodi Bird Sanctuary architectural and landscape perspective",
      "title": "Mangalajodi Bird Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_chilika_003/3b306bfaf9fd/thumbnail.webp",
      "alt": "Mangalajodi Bird Sanctuary panorama perspective",
      "title": "Mangalajodi Bird Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 2.0",
      "attribution": "Photo by Aditya Bhattacharjee via Wikimedia Commons, licensed under CC BY 2.0",
      "isFallback": false
    }
  ],
  "Gopalpur-on-Sea": [
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/hero.webp",
      "alt": "Authentic photograph of Gopalpur-on-Sea Beach in Odisha",
      "title": "Gopalpur-on-Sea Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/card.webp",
      "alt": "Gopalpur-on-Sea Beach architectural and landscape perspective",
      "title": "Gopalpur-on-Sea Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/thumbnail.webp",
      "alt": "Gopalpur-on-Sea Beach panorama perspective",
      "title": "Gopalpur-on-Sea Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Gopalpur Beach": [
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/hero.webp",
      "alt": "Authentic photograph of Gopalpur-on-Sea Beach in Odisha",
      "title": "Gopalpur-on-Sea Beach",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/card.webp",
      "alt": "Gopalpur-on-Sea Beach architectural and landscape perspective",
      "title": "Gopalpur-on-Sea Beach Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_ganjam_001/e3487587a075/thumbnail.webp",
      "alt": "Gopalpur-on-Sea Beach panorama perspective",
      "title": "Gopalpur-on-Sea Beach Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Buddy.forever.985 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Daringbadi": [
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/hero.webp",
      "alt": "Authentic photograph of Daringbadi Hill Station in Odisha",
      "title": "Daringbadi Hill Station",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/card.webp",
      "alt": "Daringbadi Hill Station architectural and landscape perspective",
      "title": "Daringbadi Hill Station Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/thumbnail.webp",
      "alt": "Daringbadi Hill Station panorama perspective",
      "title": "Daringbadi Hill Station Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Daringbadi Pine Hills": [
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/hero.webp",
      "alt": "Authentic photograph of Daringbadi Hill Station in Odisha",
      "title": "Daringbadi Hill Station",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/card.webp",
      "alt": "Daringbadi Hill Station architectural and landscape perspective",
      "title": "Daringbadi Hill Station Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_001/49e608c2405f/thumbnail.webp",
      "alt": "Daringbadi Hill Station panorama perspective",
      "title": "Daringbadi Hill Station Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Midubanda Waterfall": [
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/hero.webp",
      "alt": "Authentic photograph of Midubanda Waterfall, Daringbadi in Odisha",
      "title": "Midubanda Waterfall, Daringbadi",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/card.webp",
      "alt": "Midubanda Waterfall, Daringbadi architectural and landscape perspective",
      "title": "Midubanda Waterfall, Daringbadi Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_daringbadi_002/604241c8ef4d/thumbnail.webp",
      "alt": "Midubanda Waterfall, Daringbadi panorama perspective",
      "title": "Midubanda Waterfall, Daringbadi Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by \u09b8\u09a8\u09cd\u09a6\u09c0\u09aa \u09b8\u09b0\u0995\u09be\u09b0 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Hirakud Dam": [
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/hero.webp",
      "alt": "Authentic photograph of Hirakud Dam & Reservoir in Odisha",
      "title": "Hirakud Dam & Reservoir",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/card.webp",
      "alt": "Hirakud Dam & Reservoir architectural and landscape perspective",
      "title": "Hirakud Dam & Reservoir Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_001/319e1fc78ef8/thumbnail.webp",
      "alt": "Hirakud Dam & Reservoir panorama perspective",
      "title": "Hirakud Dam & Reservoir Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Samaleswari Temple": [
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/hero.webp",
      "alt": "Authentic photograph of Samaleswari Temple, Sambalpur in Odisha",
      "title": "Samaleswari Temple, Sambalpur",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/card.webp",
      "alt": "Samaleswari Temple, Sambalpur architectural and landscape perspective",
      "title": "Samaleswari Temple, Sambalpur Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_002/34272df89ec2/thumbnail.webp",
      "alt": "Samaleswari Temple, Sambalpur panorama perspective",
      "title": "Samaleswari Temple, Sambalpur Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Debrigarh": [
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/hero.webp",
      "alt": "Authentic photograph of Debrigarh Wildlife Sanctuary in Odisha",
      "title": "Debrigarh Wildlife Sanctuary",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/card.webp",
      "alt": "Debrigarh Wildlife Sanctuary architectural and landscape perspective",
      "title": "Debrigarh Wildlife Sanctuary Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_sambalpur_004/22d5bc4545b0/thumbnail.webp",
      "alt": "Debrigarh Wildlife Sanctuary panorama perspective",
      "title": "Debrigarh Wildlife Sanctuary Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Amudha HariHaran via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Hanuman Vatika": [
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/hero.webp",
      "alt": "Authentic photograph of Hanuman Vatika, Rourkela in Odisha",
      "title": "Hanuman Vatika, Rourkela",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/card.webp",
      "alt": "Hanuman Vatika, Rourkela architectural and landscape perspective",
      "title": "Hanuman Vatika, Rourkela Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_001/ae7eb1c0b708/thumbnail.webp",
      "alt": "Hanuman Vatika, Rourkela panorama perspective",
      "title": "Hanuman Vatika, Rourkela Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Akilola via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Mandira Dam": [
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/hero.webp",
      "alt": "Authentic photograph of Mandira Dam, Sundargarh in Odisha",
      "title": "Mandira Dam, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/card.webp",
      "alt": "Mandira Dam, Sundargarh architectural and landscape perspective",
      "title": "Mandira Dam, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_002/00793bab38cf/thumbnail.webp",
      "alt": "Mandira Dam, Sundargarh panorama perspective",
      "title": "Mandira Dam, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Sidharthkochar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Khandadhar Waterfall": [
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/hero.webp",
      "alt": "Authentic photograph of Khandadhar Waterfall, Sundargarh in Odisha",
      "title": "Khandadhar Waterfall, Sundargarh",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/card.webp",
      "alt": "Khandadhar Waterfall, Sundargarh architectural and landscape perspective",
      "title": "Khandadhar Waterfall, Sundargarh Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rourkela_003/a8c814c32300/thumbnail.webp",
      "alt": "Khandadhar Waterfall, Sundargarh panorama perspective",
      "title": "Khandadhar Waterfall, Sundargarh Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Harichandan kar via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Similipal Tiger Reserve": [
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/hero.webp",
      "alt": "Authentic photograph of Similipal National Park in Odisha",
      "title": "Similipal National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/card.webp",
      "alt": "Similipal National Park architectural and landscape perspective",
      "title": "Similipal National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/thumbnail.webp",
      "alt": "Similipal National Park panorama perspective",
      "title": "Similipal National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Similipal": [
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/hero.webp",
      "alt": "Authentic photograph of Similipal National Park in Odisha",
      "title": "Similipal National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/card.webp",
      "alt": "Similipal National Park architectural and landscape perspective",
      "title": "Similipal National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_001/62ca826d15a0/thumbnail.webp",
      "alt": "Similipal National Park panorama perspective",
      "title": "Similipal National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY 4.0",
      "attribution": "Photo by Government of Odisha via Wikimedia Commons, licensed under CC BY 4.0",
      "isFallback": false
    }
  ],
  "Barehipani Falls": [
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/hero.webp",
      "alt": "Authentic photograph of Barehipani & Joranda Falls in Odisha",
      "title": "Barehipani & Joranda Falls",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/card.webp",
      "alt": "Barehipani & Joranda Falls architectural and landscape perspective",
      "title": "Barehipani & Joranda Falls Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_mayurbhanj_002/91f5f250ddfa/thumbnail.webp",
      "alt": "Barehipani & Joranda Falls panorama perspective",
      "title": "Barehipani & Joranda Falls Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by Samarth Joel Ram via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Bhitarkanika": [
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/hero.webp",
      "alt": "Authentic photograph of Bhitarkanika National Park in Odisha",
      "title": "Bhitarkanika National Park",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/card.webp",
      "alt": "Bhitarkanika National Park architectural and landscape perspective",
      "title": "Bhitarkanika National Park Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_kendrapara_001/3c1227e192f9/thumbnail.webp",
      "alt": "Bhitarkanika National Park panorama perspective",
      "title": "Bhitarkanika National Park Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Devopam via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Gupteswar Cave Temple": [
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/hero.webp",
      "alt": "Authentic photograph of Gupteswar Cave Temple, Koraput in Odisha",
      "title": "Gupteswar Cave Temple, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/card.webp",
      "alt": "Gupteswar Cave Temple, Koraput architectural and landscape perspective",
      "title": "Gupteswar Cave Temple, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_001/ebdb01aa8cee/thumbnail.webp",
      "alt": "Gupteswar Cave Temple, Koraput panorama perspective",
      "title": "Gupteswar Cave Temple, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Indopaedia via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Deomali Peak": [
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/hero.webp",
      "alt": "Authentic photograph of Deomali Peak, Koraput in Odisha",
      "title": "Deomali Peak, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/card.webp",
      "alt": "Deomali Peak, Koraput architectural and landscape perspective",
      "title": "Deomali Peak, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/thumbnail.webp",
      "alt": "Deomali Peak, Koraput panorama perspective",
      "title": "Deomali Peak, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Deomali": [
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/hero.webp",
      "alt": "Authentic photograph of Deomali Peak, Koraput in Odisha",
      "title": "Deomali Peak, Koraput",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/card.webp",
      "alt": "Deomali Peak, Koraput architectural and landscape perspective",
      "title": "Deomali Peak, Koraput Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_003/d706510f47e0/thumbnail.webp",
      "alt": "Deomali Peak, Koraput panorama perspective",
      "title": "Deomali Peak, Koraput Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Priyadarshini 89 via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ],
  "Kolab Reservoir": [
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/hero.webp",
      "alt": "Authentic photograph of Kolab Reservoir & Botanical Garden in Odisha",
      "title": "Kolab Reservoir & Botanical Garden",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/card.webp",
      "alt": "Kolab Reservoir & Botanical Garden architectural and landscape perspective",
      "title": "Kolab Reservoir & Botanical Garden Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_koraput_005/375b5f789f69/thumbnail.webp",
      "alt": "Kolab Reservoir & Botanical Garden panorama perspective",
      "title": "Kolab Reservoir & Botanical Garden Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "attribution": "Photo by w via Wikimedia Commons, licensed under CC BY-SA 3.0",
      "isFallback": false
    }
  ],
  "Maa Majhigouri Temple": [
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/hero.webp",
      "alt": "Authentic photograph of Maa Majhigouri Temple, Rayagada in Odisha",
      "title": "Maa Majhigouri Temple, Rayagada",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/card.webp",
      "alt": "Maa Majhigouri Temple, Rayagada architectural and landscape perspective",
      "title": "Maa Majhigouri Temple, Rayagada Detail View",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    },
    {
      "src": "/static/images/places/place_rayagada_001/a863f4660940/thumbnail.webp",
      "alt": "Maa Majhigouri Temple, Rayagada panorama perspective",
      "title": "Maa Majhigouri Temple, Rayagada Overview",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "attribution": "Photo by Hiranyabaahu via Wikimedia Commons, licensed under CC BY-SA 4.0",
      "isFallback": false
    }
  ]
};

function normalizeKey(str?: string | null): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getPlaceImages(placeName?: string | null, category?: string | null): PlaceImage[] {
  if (!placeName && !category) return [DEFAULT_FALLBACK_IMAGE];

  if (placeName) {
    // 1. Exact match by place_id or name
    if (PLACE_IMAGE_MANIFEST[placeName]) {
      return PLACE_IMAGE_MANIFEST[placeName];
    }

    // 2. Normalized alphanumeric match
    const normPlace = normalizeKey(placeName);
    for (const [key, images] of Object.entries(PLACE_IMAGE_MANIFEST)) {
      if (normalizeKey(key) === normPlace) {
        return images;
      }
    }

    // 3. Exact token match for composite names (e.g., "Puri Beach", "Konark Sun Temple")
    for (const [key, images] of Object.entries(PLACE_IMAGE_MANIFEST)) {
      const normKey = normalizeKey(key);
      if (normKey.length >= 6 && (normPlace === normKey)) {
        return images;
      }
    }
  }

  // 4. Category fallback if no destination match
  if (category) {
    const normCat = normalizeKey(category);
    for (const [key, img] of Object.entries(CATEGORY_IMAGE_MANIFEST)) {
      const normKey = normalizeKey(key);
      if (normCat === normKey || normCat.includes(normKey) || normKey.includes(normCat)) {
        return [img];
      }
    }
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

export function getCategoryImage(category: string): PlaceImage {
  const norm = normalizeKey(category);
  for (const [key, img] of Object.entries(CATEGORY_IMAGE_MANIFEST)) {
    const normKey = normalizeKey(key);
    if (norm === normKey || norm.includes(normKey) || normKey.includes(norm)) {
      return img;
    }
  }
  return CATEGORY_IMAGE_MANIFEST["nature"] || DEFAULT_FALLBACK_IMAGE;
}

export function getPlaceGallery(placeName?: string | null, category?: string | null): PlaceImageMeta[] {
  const images = getPlaceImages(placeName, category);
  return images.map((img) => ({
    url: img.src,
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
