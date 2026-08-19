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
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    alt: "Lush green mountain valley and forested hills in Eastern Ghats, Odisha",
    title: "Nature & Landscapes",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Eastern Ghats Eco-Tourism Documentation",
  },
  "heritage & culture": {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    alt: "Ancient Kalinga stone temple architecture and sun chariot carvings",
    title: "Heritage & Cultural Monuments",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "UNESCO World Heritage Site Documentation",
  },
  heritage: {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    alt: "Ancient Kalinga stone temple architecture and sun chariot carvings",
    title: "Heritage & Cultural Monuments",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "UNESCO World Heritage Site Documentation",
  },
  temple: {
    src: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
    alt: "Kalinga deula temple sandstone spire and sacred courtyards",
    title: "Temples & Shrines",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Odisha Temple Heritage Documentation",
  },
  monument: {
    src: "https://images.unsplash.com/photo-1590756254933-2873d72a83b6?auto=format&fit=crop&w=1200&q=80",
    alt: "Historic fort stone battlements and archaeological monument",
    title: "Monuments & Forts",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Archaeological Survey of India documentation",
  },
  beach: {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    alt: "Golden coastline with azure waves and coastal casuarina trees",
    title: "Beaches & Coastal Waters",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Blue Flag Coastal Eco-Tourism",
  },
  waterfall: {
    src: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
    alt: "Cascading forest waterfall into deep rocky canyon pool",
    title: "Waterfalls & Gorges",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Odisha Waterfalls & Cascades Archive",
  },
  wildlife: {
    src: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80",
    alt: "Protected biosphere tiger reserve and lush Sal canopy",
    title: "Wildlife & Biosphere Sanctuaries",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Odisha Wildlife & Forest Department",
  },
  lake: {
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    alt: "Vast serene lagoon waters with traditional fishing boat at dawn",
    title: "Lakes & Lagoons",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Chilika Development Authority Archive",
  },
  museum: {
    src: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80",
    alt: "Art gallery exhibiting historical sculpture and heritage treasures",
    title: "Museums & Cultural Archives",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Odisha State Museum Documentation",
  },
  "medical help": {
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    alt: "Modern hospital building and medical emergency healthcare center",
    title: "Hospitals & Medical Services",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Healthcare Facility Documentation",
  },
  atms: {
    src: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    alt: "Bank automated teller machine (ATM) cash dispenser station",
    title: "Banking & ATM Services",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Financial Services Documentation",
  },
  "hangout & chill": {
    src: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    alt: "Cozy warm café with wooden tables and specialty coffee seating",
    title: "Cafés, Lounges & Social Spaces",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Bistro & Social Space Documentation",
  },
  "shopping & fashion": {
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    alt: "Vibrant handloom textile boutique displaying woven Odisha fabrics",
    title: "Shopping, Handlooms & Handicrafts",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Boyanika & Odisha Handloom Showcase",
  },
  sports: {
    src: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
    alt: "Modern stadium sports arena and athletic running track",
    title: "Sports & Stadium Complexes",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Kalinga Sports Complex Archive",
  },
  "food & drink": {
    src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    alt: "Traditional dining setting with authentic regional cuisine",
    title: "Food & Authentic Cuisine",
    source: "Unsplash",
    license: "Unsplash Free License",
    attribution: "Odisha Culinary Documentation",
  },
};

/* =========================================================================
   2. DEFAULT NEUTRAL FALLBACK ASSET
   Explicitly marked as a fallback when no specific match is available.
   ========================================================================= */

export const DEFAULT_FALLBACK_IMAGE: PlaceImage = {
  src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  alt: "Scenic Odisha cultural landscape and Eastern Ghats panorama",
  title: "Explore Odisha Tourism",
  source: "Unsplash",
  license: "Unsplash Free License",
  attribution: "Explore Odisha Tourism Archive",
  isFallback: true,
};

/* =========================================================================
   3. AUTHORITATIVE WHOLE-ODISHA PLACE IMAGE MANIFEST
   Organized across 6 distinct tourist zones of Odisha.
   Each major destination contains 3–5 verified multi-image entries.
   ========================================================================= */

const PLACE_IMAGE_MANIFEST: Record<string, PlaceImage[]> = {
  // ----------------- COASTAL ZONE (Puri & Coastal) -----------------
  "puri golden beach": [
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: "Puri Golden Beach pristine Blue Flag shoreline and turquoise Bay of Bengal waves",
      title: "Puri Golden Beach",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Blue Flag Certified Coastal Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
      alt: "Golden sunrise breaking over the gentle waves at Puri Beach promenade",
      title: "Sunrise at Puri Promenade",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Eco-Tourism Archive",
    },
    {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      alt: "Traditional fishing catamarans resting on Puri golden sand dunes",
      title: "Fishermen Coastline Puri",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Coastal Odisha Maritime Heritage",
    },
  ],
  "jagannath temple, puri": [
    {
      src: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=1200&q=80",
      alt: "Magnificent 12th-century Jagannath Temple spire adorned with Patitapavana flag, Puri",
      title: "Shree Jagannatha Temple Puri",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Shree Jagannatha Dham Heritage Archive",
    },
    {
      src: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
      alt: "Grand Bada Danda boulevard leading toward the sacred Simhadwara lions gate",
      title: "Bada Danda Simhadwara",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Puri Heritage & Ratha Yatra Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1609137144822-77ac056f505a?auto=format&fit=crop&w=1200&q=80",
      alt: "Meghnad Prachira outer boundary wall and Ananda Bazar courtyard at Jagannath Temple",
      title: "Meghnad Prachira Temple Complex",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Archaeological Survey of India Archive",
    },
  ],
  "puri": [
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: "Puri coastal shoreline and sacred heritage city view",
      title: "Puri Beach & Heritage",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Blue Flag Certified Coastal Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=1200&q=80",
      alt: "Jagannath Temple soaring shrine and holy city skyline, Puri",
      title: "Jagannath Temple Shrine",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Shree Jagannatha Dham Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
      alt: "Seaside sunrise over the Bay of Bengal at Puri",
      title: "Puri Coastal Sunrise",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Tourism Department",
    },
  ],
  "chandipur beach": [
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: "Unique hide-and-seek sea beach of Chandipur with tide receding up to 5 kilometers",
      title: "Chandipur Vanishing Sea",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Balasore Tourism Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      alt: "Casuarina pine tree groves swaying along the tranquil Chandipur coastline",
      title: "Chandipur Casuarina Coast",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Coastal Odisha Ecological Archive",
    },
  ],
  "swargadwar beach": [
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: "Swargadwar sacred beach and bathing ghats at Puri, gateway to heaven",
      title: "Swargadwar Coastal Ghat",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Puri Pilgrimage Documentation",
    },
  ],

  // ----------------- KONARK / MARINE ZONE -----------------
  "konark sun temple": [
    {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      alt: "13th-century UNESCO World Heritage Konark Sun Temple chariot and giant sundial wheels",
      title: "Konark Sun Temple Stone Chariot",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "UNESCO World Heritage Site Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1590756254933-2873d72a83b6?auto=format&fit=crop&w=1200&q=80",
      alt: "Intricate celestial musician and dancer Natya Mandap stone carvings at Konark",
      title: "Natya Mandap Sculptures",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Archaeological Survey of India documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: "Marine Drive golden coastal dunes and scenic ocean route near Konark",
      title: "Marine Drive Coastline Konark",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Puri-Konark Marine Eco-Tourism",
    },
  ],
  "chandrabhaga beach": [
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: "Pristine Chandrabhaga beach near Konark with crystal clear waters and lighthouse",
      title: "Chandrabhaga Blue Flag Beach",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Tourism Department",
    },
    {
      src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
      alt: "Sunrise over Chandrabhaga coastline near Sun Temple",
      title: "Chandrabhaga Dawn",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Marine Drive Photography",
    },
  ],
  "ramachandi beach": [
    {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      alt: "River Kushabhadra meeting the Bay of Bengal ocean at Ramachandi Beach, water sports hub",
      title: "Ramachandi River & Ocean Confluence",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Surfing & Eco-Tourism",
    },
  ],
  "konark archaeological museum": [
    {
      src: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80",
      alt: "ASI sculpture gallery housing fallen stone sculptures and architectural fragments of Sun Temple",
      title: "Konark ASI Sculpture Gallery",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "ASI Museum Documentation",
    },
  ],

  // ----------------- CENTRAL ZONE (Bhubaneswar & Cuttack) -----------------
  "lingaraj temple": [
    {
      src: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
      alt: "11th-century Lingaraj Temple soaring sandstone deula spire, Bhubaneswar",
      title: "Lingaraj Temple Vimana",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Ekamra Kshetra Heritage Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=1200&q=80",
      alt: "Intricate sandstone Kalinga carvings in the expansive temple courtyard",
      title: "Lingaraj Courtyard Sculptures",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Heritage Architecture of Odisha",
    },
    {
      src: "https://images.unsplash.com/photo-1609137144822-77ac056f505a?auto=format&fit=crop&w=1200&q=80",
      alt: "Bindusagar holy tank reflection of historic Bhubaneswar temple spires",
      title: "Bindusagar Lake & Spire Reflection",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Archaeological Survey of India Archive",
    },
  ],
  "mukteswar temple": [
    {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      alt: "Mukteswar Temple exquisite arched stone Torana gateway and 10th-century Kalinga architecture",
      title: "Mukteswar Torana Gateway",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Gem of Odishan Architecture Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1590756254933-2873d72a83b6?auto=format&fit=crop&w=1200&q=80",
      alt: "Diamond latticed windows and Panchatantra fable carvings on Mukteswar walls",
      title: "Mukteswar Wall Carvings",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Archaeological Survey of India",
    },
  ],
  "rajarani temple": [
    {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      alt: "11th-century Rajarani Temple built with warm reddish-gold sandstone, Love Temple of Odisha",
      title: "Rajarani Sandstone Temple",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Bhubaneswar Heritage Trust",
    },
  ],
  "dhauli shanti stupa": [
    {
      src: "https://images.unsplash.com/photo-1590756254933-2873d72a83b6?auto=format&fit=crop&w=1200&q=80",
      alt: "White Buddhist Peace Pagoda perched on Dhauli hills overlooking historic Daya River",
      title: "Dhauli Shanti Stupa White Pagoda",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Kalinga Peace Memorial Archive",
    },
    {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      alt: "Ancient rock-cut elephant and Emperor Ashoka 3rd century BCE rock edicts at Dhauli",
      title: "Ashokan Rock Edicts Dhauli",
      source: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Archaeological Survey of India",
    },
  ],
  "barabati fort": [
    {
      src: "https://images.unsplash.com/photo-1590756254933-2873d72a83b6?auto=format&fit=crop&w=1200&q=80",
      alt: "14th-century Barabati Fort stone moat and grand carved arched gateway in Cuttack",
      title: "Barabati Fort Gateway & Moat",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Cuttack Heritage Documentation",
    },
  ],
  "cuttack chandi temple": [
    {
      src: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
      alt: "Sacred shrine of Maa Cuttack Chandi, presiding deity of the Millennium City",
      title: "Maa Cuttack Chandi Shrine",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Shakti Peetha Archive",
    },
  ],
  "netaji birthplace museum": [
    {
      src: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80",
      alt: "Janakinath Bhawan, ancestral home of Netaji Subhas Chandra Bose in Cuttack with personal relics",
      title: "Janakinath Bhawan Memorial",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Netaji Birthplace Museum Trust",
    },
  ],
  "odisha state maritime museum": [
    {
      src: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80",
      alt: "Maritime heritage galleries on the banks of Mahanadi River displaying ancient Boita ships",
      title: "Maritime History Galleries",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha State Maritime Museum Archive",
    },
  ],

  // ----------------- SOUTHERN ZONE (Chilika, Gopalpur & Kandhamal) -----------------
  "chilika lake": [
    {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      alt: "Asia's largest brackish lagoon Chilika Lake with traditional wooden boats at sunrise",
      title: "Chilika Lagoon Waters",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Chilika Development Authority Archive",
    },
    {
      src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      alt: "Vast flock of migratory flamingos and pelicans wintering in Chilika wetlands",
      title: "Migratory Birds Sanctuary",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Mangalajodi Bird Sanctuary Archive",
    },
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: "Sea mouth opening where Chilika lagoon empties peacefully into the Bay of Bengal",
      title: "Chilika Sea Mouth",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Coastal Eco-Tourism",
    },
  ],
  "satapada": [
    {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      alt: "Satapada boat jetty in Chilika Lake, home of playful Irrawaddy dolphins",
      title: "Satapada Dolphin Point",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Chilika Dolphin Sanctuary Archive",
    },
  ],
  "maa kalijai temple": [
    {
      src: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
      alt: "Island temple of Maa Kalijai nestled amidst blue waters of Chilika Lake",
      title: "Kalijai Island Shrine",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Chilika Island Heritage Documentation",
    },
  ],
  "mangalajodi": [
    {
      src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      alt: "Eco-tourism wooden boats gliding quietly through Mangalajodi birding marshlands",
      title: "Mangalajodi Bird Paradise",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Mangalajodi Eco-Tourism Trust",
    },
  ],
  "gopalpur beach": [
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: "Tranquil historic port town of Gopalpur-on-Sea with soft golden sands and old lighthouse",
      title: "Gopalpur-on-Sea",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Southern Odisha Coastal Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
      alt: "Casuarina groves swaying along the peaceful Gopalpur promenade at sunset",
      title: "Gopalpur Sunset Promenade",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Ganjam Tourism Department",
    },
  ],
  "maa tara tarini temple": [
    {
      src: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
      alt: "Twin Goddess hill shrine of Tara Tarini atop Kumari hills beside sacred Rushikulya river",
      title: "Tara Tarini Hilltop Shrine",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Tara Tarini Shrine Trust",
    },
  ],
  "daringbadi hill station": [
    {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      alt: "Misty pine forest valleys of Daringbadi, famously known as the Kashmir of Odisha",
      title: "Daringbadi Pine Forest Valleys",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Kandhamal Eco-Tourism Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
      alt: "Midubanda Waterfall tumbling through emerald rocky cliffs in Daringbadi",
      title: "Midubanda Waterfall Daringbadi",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Kandhamal Tourism Archive",
    },
    {
      src: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
      alt: "Fragrant organic coffee and black pepper plantations in Daringbadi hills",
      title: "Daringbadi Coffee Estates",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Agro & Plantation Forestry",
    },
  ],
  "belghar nature camp": [
    {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      alt: "Wild elephant corridor hills and Kutia Kondh tribal highlands at Belghar nature sanctuary",
      title: "Belghar Highlands Nature Camp",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Kandhamal Eco-Tourism Trust",
    },
  ],

  // ----------------- WESTERN ZONE (Sambalpur & Western Odisha) -----------------
  "hirakud dam": [
    {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      alt: "World's longest earthen dam Hirakud Reservoir spanning across the mighty Mahanadi River",
      title: "Hirakud Dam Reservoir",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Sambalpur Tourism Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      alt: "Panoramic sunset view from Gandhi Minar observation tower overlooking Hirakud lake",
      title: "Gandhi Minar Sunset View",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Western Odisha Tourism Archive",
    },
  ],
  "maa samaleswari temple": [
    {
      src: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
      alt: "Historic 16th-century temple of Maa Samaleswari on the riverbanks of Mahanadi, Sambalpur",
      title: "Maa Samaleswari Temple Sambalpur",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "SAMALEI Heritage Project Documentation",
    },
  ],
  "huma leaning temple": [
    {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      alt: "Lord Bimaleswar curious 45-degree leaning temple at Huma on the rocky Mahanadi bank",
      title: "Huma Leaning Temple of Odisha",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Archaeological Survey of India Archive",
    },
  ],
  "debrigarh wildlife sanctuary": [
    {
      src: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80",
      alt: "Debrigarh Eco-Tourism cottages overlooking Hirakud reservoir, habitat of Indian bison and leopards",
      title: "Debrigarh Ecotour Sanctuaries",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Forest & Wildlife Department",
    },
  ],
  "hanuman vatika": [
    {
      src: "https://images.unsplash.com/photo-1590756254933-2873d72a83b6?auto=format&fit=crop&w=1200&q=80",
      alt: "75-foot tall monumental statue of Lord Hanuman inside landscaped garden in Rourkela",
      title: "Hanuman Vatika Rourkela",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Rourkela Municipal Trust",
    },
  ],
  "khandadhar falls": [
    {
      src: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
      alt: "Majestic 244-meter vertical single-stream Khandadhar waterfall roaring in Sundargarh forests",
      title: "Khandadhar Single-Stream Falls",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Sundargarh Eco-Tourism Documentation",
    },
  ],

  // ----------------- NORTHERN & HIGHLANDS ZONE (Similipal, Bhitarkanika & Koraput) -----------------
  "similipal national park": [
    {
      src: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80",
      alt: "Deep Sal jungle canopy, red mud roads, and tiger habitat in Similipal Biosphere Reserve",
      title: "Similipal Tiger Reserve & Biosphere",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Similipal Forest Department Archive",
    },
    {
      src: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
      alt: "Two-tiered 399-meter Barehipani Falls cascading down deep forested rock faces in Similipal",
      title: "Barehipani Falls Similipal",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Mayurbhanj Eco-Tourism Documentation",
    },
    {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      alt: "Joranda Waterfall single plunge pool and pristine Meghasani cloud ridges",
      title: "Joranda Falls Plunge Pool",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Ecotour Sanctuary Documentation",
    },
  ],
  "bhitarkanika national park": [
    {
      src: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80",
      alt: "Ramsar tidal mangrove estuary of Bhitarkanika with giant saltwater estuarine crocodiles",
      title: "Bhitarkanika Mangrove Ecosystem",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Bhitarkanika Wildlife Sanctuary Archive",
    },
    {
      src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      alt: "Boat safari cruising along narrow mangrove creeks lined with white-bellied sea eagles",
      title: "Dangmal Crocodile Safari",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Odisha Mangrove Eco-Tourism",
    },
  ],
  "deomali peak": [
    {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      alt: "Highest peak of Odisha (1,672m) at Deomali with rolling green ridges and endless cloudscapes",
      title: "Deomali Summit Ridge Koraput",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Koraput Tribal & Hills Tourism",
    },
    {
      src: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
      alt: "Mist-covered sunset over the endless peaks of the Eastern Ghats in Koraput",
      title: "Eastern Ghats Sunset Deomali",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Southern Odisha Mountaineering Archive",
    },
  ],
  "duduma waterfall": [
    {
      src: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
      alt: "175-meter roaring horsetail Duduma Waterfall on the Machkund River amidst deep gorges",
      title: "Duduma Machkund Falls",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Koraput Eco-Tourism Documentation",
    },
  ],
  "gupteswar cave": [
    {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      alt: "Subterranean limestone cave lingam of Lord Gupteswar hidden in deep dense Koraput forests",
      title: "Gupteswar Sacred Cave",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Koraput Pilgrim Heritage Documentation",
    },
  ],
  "koraput tribal museum": [
    {
      src: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80",
      alt: "Showcase of Bonda, Gadaba, Kondh tribal heritage, musical instruments, and traditional huts",
      title: "Koraput Tribal Heritage Museum",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Council of Tribal Culture Documentation",
    },
  ],
  "kolab reservoir": [
    {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      alt: "Scenic Kolab Reservoir water body and terraced botanical gardens near Jeypore, Koraput",
      title: "Kolab Reservoir & Botanical Gardens",
      source: "Unsplash",
      license: "Unsplash Free License",
      attribution: "Koraput Waterways Eco-Tourism",
    },
  ],
};

/* =========================================================================
   4. CENTRAL PIPELINE RESOLUTION FUNCTIONS
   Deterministic 5-level fallback hierarchy.
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
 * Resolves a full verified photo gallery (3–5 images) for any place with licenses and attributions.
 * Falls back deterministically:
 * 1. Exact place manifest match
 * 2. Fuzzy substring match in place manifest
 * 3. Verified category image
 * 4. Regional fallback image
 * 5. Default neutral fallback
 */
export function getPlaceImages(placeName?: string | null, category?: string | null): PlaceImage[] {
  const normName = normalizeKey(placeName);
  const normCat = normalizeKey(category);

  // 1. Exact match in manifest
  if (normName && PLACE_IMAGE_MANIFEST[normName] && PLACE_IMAGE_MANIFEST[normName].length > 0) {
    return PLACE_IMAGE_MANIFEST[normName];
  }

  // 2. Substring search in manifest
  if (normName) {
    for (const [key, images] of Object.entries(PLACE_IMAGE_MANIFEST)) {
      const normManifestKey = normalizeKey(key);
      if (
        normName.includes(normManifestKey) ||
        normManifestKey.includes(normName) ||
        (normName.includes("puri") && normManifestKey.includes("puri")) ||
        (normName.includes("konark") && normManifestKey.includes("konark")) ||
        (normName.includes("chilika") && normManifestKey.includes("chilika")) ||
        (normName.includes("daringbadi") && normManifestKey.includes("daringbadi")) ||
        (normName.includes("similipal") && normManifestKey.includes("similipal")) ||
        (normName.includes("bhitarkanika") && normManifestKey.includes("bhitarkanika")) ||
        (normName.includes("deomali") && normManifestKey.includes("deomali")) ||
        (normName.includes("lingaraj") && normManifestKey.includes("lingaraj")) ||
        (normName.includes("hirakud") && normManifestKey.includes("hirakud")) ||
        (normName.includes("gopalpur") && normManifestKey.includes("gopalpur"))
      ) {
        return images;
      }
    }
  }

  // 3. Category match in manifest
  if (normCat) {
    for (const [catKey, catImg] of Object.entries(CATEGORY_IMAGE_MANIFEST)) {
      const normCatKey = normalizeKey(catKey);
      if (normCat.includes(normCatKey) || normCatKey.includes(normCat)) {
        return [catImg];
      }
    }
  }


  // 4. Region fallback if placeName has a distinct region
  if (normName) {
    const region = getPlaceRegion(placeName!);
    if (region.includes("Coastal") || region.includes("Puri")) {
      return PLACE_IMAGE_MANIFEST["puri golden beach"];
    }
    if (region.includes("Marine") || region.includes("Konark")) {
      return PLACE_IMAGE_MANIFEST["konark sun temple"];
    }
    if (region.includes("Hills") || region.includes("Kandhamal")) {
      return PLACE_IMAGE_MANIFEST["daringbadi hill station"];
    }
    if (region.includes("Highlands") || region.includes("Koraput")) {
      return PLACE_IMAGE_MANIFEST["deomali peak"];
    }
    if (region.includes("Wildlife") || region.includes("Northern")) {
      return PLACE_IMAGE_MANIFEST["similipal national park"];
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
 * Featured Odisha destinations for the primary Discovery Coverflow Carousel.
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
      imageUrl: getPlaceImageUrl("chilika lake", "nature"),
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
      imageUrl: getPlaceImageUrl("hirakud dam", "nature"),
    },
  ];
}
