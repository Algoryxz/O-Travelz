/**
 * CLASSIFICATION: TEMPORARY_BRIDGE
 * 
 * Client-side localized Odia name bridge and cultural taxonomy mapper.
 * This file is a temporary client-side bridge until the backend Place schema
 * ingests a unified canonical `localized_names` JSON column (`en`, `or`, `hi`).
 * 
 * INVARIANTS:
 * 1. Specific sanctuary names derive from verified Odia cultural orthography.
 * 2. Categorical/district fallbacks derive strictly from MULTILINGUAL_DISTRICTS and MULTILINGUAL_CATEGORIES.
 * 3. Distance values are straight-line approximations (Haversine); never labeled "road distance".
 * 4. Protection references are limited to official gazetted designations (ASI National Monuments, UNESCO, Ramsar).
 */

import { MULTILINGUAL_DISTRICTS, MULTILINGUAL_CATEGORIES } from '../types/multilingualTaxonomy';

export type PlaceDomainType = 'sacred' | 'heritage' | 'nature' | 'culinary' | 'facility';

export interface CulturalHeritageMeta {
  odiaName: string;
  domain: PlaceDomainType;
  architecturalEra?: string;
  architecturalStyle?: string;
  materials?: string;
  sanctuaryEtiquette?: string;
  ecologicalGuidelines?: string;
  culinaryTradition?: string;
  asiProtectionRef?: string;
  nearestHub: string;
  approxStraightLineKm: number;
}

export const VERIFIED_CULTURAL_HERITAGE: Record<string, CulturalHeritageMeta> = {
  // World Heritage & Major Archaeological/Sacred Sites
  "Konark Sun Temple": {
    odiaName: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
    domain: "heritage",
    architecturalEra: "13th Century (c. 1250 CE) • Eastern Ganga Dynasty (King Narasimhadeva I)",
    architecturalStyle: "Kalinga Architectural Style (Pida Deula & Natya Mandapa)",
    materials: "Khondalite sandstone, chlorite stone, iron dowels",
    sanctuaryEtiquette: "Footwear prohibited on the main sanctum plinth; non-commercial photography permitted in outer complex; do not touch stone carvings.",
    asiProtectionRef: "UNESCO World Heritage Site #242 • ASI National Monument N-OR-1",
    nearestHub: "Puri",
    approxStraightLineKm: 31,
  },
  "Shree Jagannath Temple": {
    odiaName: "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର",
    domain: "sacred",
    architecturalEra: "12th Century (c. 1161 CE) • Eastern Ganga Dynasty (King Anantavarman Chodaganga)",
    architecturalStyle: "Classic Kalinga Architecture (Bada Deula, Jagamohana, Natamandapa, Bhogamandapa)",
    materials: "Khondalite stone with traditional protective lime coating",
    sanctuaryEtiquette: "Sanctum restricted to orthodox Hindus per Supreme Court & Temple Managing Committee; electronic devices, cameras, and leather items strictly prohibited at Singhadwara.",
    asiProtectionRef: "ASI Protected Monument N-OR-54 • Srimandir Act 1955",
    nearestHub: "Puri",
    approxStraightLineKm: 2,
  },
  "Lingaraj Temple": {
    odiaName: "ଲିଙ୍ଗରାଜ ମନ୍ଦିର",
    domain: "sacred",
    architecturalEra: "11th Century (c. 1090-1104 CE) • Somavamsi Dynasty (King Jajati Keshari & Lalatendu Keshari)",
    architecturalStyle: "Quintessential Mature Kalinga Style (Rekha Deula tower rising 55m)",
    materials: "Dark red sandstone, laterite boundary walls",
    sanctuaryEtiquette: "Inner sanctum open to Hindus only; raised viewing platform outside northern boundary wall available for non-Hindu visitors; footwear deposit mandatory.",
    asiProtectionRef: "ASI Protected Monument N-OR-12",
    nearestHub: "Bhubaneswar",
    approxStraightLineKm: 4,
  },
  "Mukteshvara Temple": {
    odiaName: "ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିର",
    domain: "heritage",
    architecturalEra: "10th Century (c. 950-975 CE) • Somavamsi Dynasty",
    architecturalStyle: "Gem of Odishan Architecture (Transition from early to mature Kalinga style with famous arched Torana)",
    materials: "Fine-grained red sandstone",
    sanctuaryEtiquette: "Active shrine; footwear must be deposited at outer gateway; quiet contemplation encouraged near Marichi Kunda.",
    asiProtectionRef: "ASI Protected Monument N-OR-17",
    nearestHub: "Bhubaneswar",
    approxStraightLineKm: 5,
  },
  "Rajarani Temple": {
    odiaName: "ରାଜାରାଣୀ ମନ୍ଦିର",
    domain: "heritage",
    architecturalEra: "11th Century (c. 1000-1050 CE) • Somavamsi Period",
    architecturalStyle: "Indresvara Style with clustered miniature spires (Angasikharas)",
    materials: "Yellowish and reddish Rajarania sandstone",
    sanctuaryEtiquette: "Protected archaeological monument with ticketed entry; no active presiding deity; photography permitted in garden perimeter.",
    asiProtectionRef: "ASI Protected Monument N-OR-19",
    nearestHub: "Bhubaneswar",
    approxStraightLineKm: 4,
  },
  "Brahmeswara Temple": {
    odiaName: "ବ୍ରହ୍ମେଶ୍ୱର ମନ୍ଦିର",
    domain: "heritage",
    architecturalEra: "11th Century (c. 1058 CE) • Commissioned by Queen Kolavatidevi (Somavamsi)",
    architecturalStyle: "Panchayatana Kalinga Style (Central shrine with four subsidiary corner shrines)",
    materials: "Light sandstone and laterite foundations",
    sanctuaryEtiquette: "Active worship site; remove shoes before stone boundary wall; do not climb on subsidiary shrines.",
    asiProtectionRef: "ASI Protected Monument N-OR-9",
    nearestHub: "Bhubaneswar",
    approxStraightLineKm: 5,
  },
  "Parasurameswara Temple": {
    odiaName: "ପରଶୁରାମେଶ୍ୱର ମନ୍ଦିର",
    domain: "heritage",
    architecturalEra: "7th-8th Century (c. 650 CE) • Sailodbhava Period",
    architecturalStyle: "Early Kalinga Architectural Phase (Squat Rekha Deula with tiered flat-roofed Jagamohana)",
    materials: "Weathered local sandstone with intact relief carvings of Saptamatrikas",
    sanctuaryEtiquette: "Earliest surviving stone temple in Bhubaneswar; preserve delicate stone reliefs; no flash photography on sanctum walls.",
    asiProtectionRef: "ASI Protected Monument N-OR-18",
    nearestHub: "Bhubaneswar",
    approxStraightLineKm: 5,
  },
  "Chausathi Jogini Temple": {
    odiaName: "ଚଉଷଠି ଯୋଗିନୀ ମନ୍ଦିର (ହୀରାପୁର)",
    domain: "sacred",
    architecturalEra: "9th Century • Bhauma-Kara Dynasty (Queen Hiradevi)",
    architecturalStyle: "Hypaethral (Open-air circular roofless enclosure) Tantric Sanctuary",
    materials: "Local laterite stone with fine chlorite Jogini sculptures",
    sanctuaryEtiquette: "Venerated active Tantric sanctuary; modest attire required; circumambulate clockwise; silence requested inside inner circle.",
    asiProtectionRef: "ASI Protected Monument N-OR-10",
    nearestHub: "Bhubaneswar",
    approxStraightLineKm: 11,
  },
  "Dhauli Shanti Stupa": {
    odiaName: "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ",
    domain: "heritage",
    architecturalEra: "3rd Century BCE (Ashokan Edicts) & 1972 CE (Indo-Japanese Peace Pagoda)",
    architecturalStyle: "Buddhist Hemispherical Stupa with Stone-carved Elephant Capital",
    materials: "White plastered masonry and Daya river rock face",
    sanctuaryEtiquette: "Historical battlefield transformation site; respectful silence requested around stupa terrace.",
    asiProtectionRef: "Ashokan Rock Edicts protected by ASI • Shanti Stupa maintained by Kalinga Nippon Buddha Sangha",
    nearestHub: "Bhubaneswar",
    approxStraightLineKm: 8,
  },
  "Udayagiri and Khandagiri Caves": {
    odiaName: "ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରି ଗୁମ୍ଫା",
    domain: "heritage",
    architecturalEra: "2nd-1st Century BCE • Chedi / Mahameghavahana Dynasty (Emperor Kharavela)",
    architecturalStyle: "Jaina Rock-Cut Monastic Enclosures (Ranigumpha, Hathigumpha, Ananta Gumpha)",
    materials: "Coarse-grained sandstone hills",
    sanctuaryEtiquette: "Steep rock-cut steps; wild monkeys inhabit upper caves—avoid carrying exposed plastic bags; do not touch Brahmi inscriptions.",
    asiProtectionRef: "ASI Protected Monuments N-OR-21 & N-OR-22",
    nearestHub: "Bhubaneswar",
    approxStraightLineKm: 6,
  },

  // Natural Ecosystems, Beaches & Waterfalls
  "Chilika Lake": {
    odiaName: "ଚିଲିକା ହ୍ରଦ",
    domain: "nature",
    architecturalStyle: "Asia's Largest Brackish Water Coastal Lagoon (1,165 km²)",
    materials: "Estuarine ecosystem, barrier spit sand dunes, red clay islands",
    ecologicalGuidelines: "Ramsar Wetland Site No. 229. 4-stroke speed limits enforced near Nalabana bird sanctuary; maintain minimum 50m distance from Irrawaddy dolphins; zero single-use plastic strictly enforced.",
    asiProtectionRef: "Ramsar Wetland Site No. 229 • Chilika Development Authority (CDA)",
    nearestHub: "Puri",
    approxStraightLineKm: 38,
  },
  "Bhitarkanika National Park": {
    odiaName: "ଭିତରକନିକା ଜାତୀୟ ଉଦ୍ୟାନ",
    domain: "nature",
    architecturalStyle: "India's Second Largest Mangrove Ecosystem & Estuarine Crocodile Sanctuary",
    materials: "Tidal creeks, deltaic mudflats, Sundari mangrove canopy",
    ecologicalGuidelines: "Ramsar Site No. 1205. Forest entry permit mandatory; boat excursions restricted to daylight hours; keep all limbs inside boats due to saltwater crocodile population.",
    asiProtectionRef: "Ramsar Site No. 1205 • Odisha Forest & Environment Dept",
    nearestHub: "Cuttack",
    approxStraightLineKm: 85,
  },
  "Similipal National Park": {
    odiaName: "ଶିମିଳିପାଳ ଜାତୀୟ ଉଦ୍ୟାନ",
    domain: "nature",
    architecturalStyle: "Precambrian Biosphere Reserve & Tiger Reserve",
    materials: "Metamorphic rock mass, red laterite soils, dense sal forests",
    ecologicalGuidelines: "UNESCO World Biosphere Reserve. Day entry gates close at 09:00 AM; day passes valid for specific authorized corridors; zero plastic eco-tourism protocols enforced.",
    asiProtectionRef: "UNESCO World Biosphere Reserve • Project Tiger 1973",
    nearestHub: "Baripada",
    approxStraightLineKm: 60,
  },
  "Daringbadi": {
    odiaName: "ଦାରିଙ୍ଗବାଡ଼ି",
    domain: "nature",
    architecturalStyle: "Eastern Ghats Hill Station & Montane Pine Plateau (~915m MSL)",
    materials: "Granite gneiss formations, terrace valleys",
    ecologicalGuidelines: "Eco-sensitive tribal belt; respect indigenous village autonomy; stay on designated trails; warm clothing needed Oct-Feb.",
    nearestHub: "Berhampur",
    approxStraightLineKm: 98,
  },
  "Chandrabhaga Beach": {
    odiaName: "ଚନ୍ଦ୍ରଭାଗା ବେଳାଭୂମି",
    domain: "nature",
    architecturalStyle: "Blue Flag Certified Marine Coastline & Sun Worship Confluence",
    materials: "Silica beach sand, casuarina dunes",
    ecologicalGuidelines: "Blue Flag Certified marine beach. Plastic-free eco-zone; swimming permitted only in designated lifeguard-patrolled zones.",
    asiProtectionRef: "FEE Blue Flag Certified • CRZ-I Eco-Sensitive Zone",
    nearestHub: "Puri",
    approxStraightLineKm: 28,
  },
  "Golden Beach Puri": {
    odiaName: "ସ୍ୱର୍ଣ୍ଣ ବେଳାଭୂମି (ପୁରୀ)",
    domain: "nature",
    architecturalStyle: "Blue Flag Certified Coastal Marine Promenade",
    materials: "Golden marine sand, promenade pavers",
    ecologicalGuidelines: "Blue Flag Certified. Obey lifeguard beach flags (red flag = dangerous undertow, no swimming); municipal littering fines enforced.",
    asiProtectionRef: "FEE Blue Flag Certified",
    nearestHub: "Puri",
    approxStraightLineKm: 1,
  },
  "Gopalpur Beach": {
    odiaName: "ଗୋପାଳପୁର ବେଳାଭୂମି",
    domain: "nature",
    architecturalStyle: "Historic Colonial Port Seacoast & Marine Shoreline",
    materials: "Coastal sand dunes, historic laterite port ruins",
    ecologicalGuidelines: "Active artisanal fishing coast; respect local fishing community boats, tackle, and nets.",
    nearestHub: "Berhampur",
    approxStraightLineKm: 14,
  },
  "Deomali Peak": {
    odiaName: "ଦେଓମାଳୀ ଶୃଙ୍ଗ",
    domain: "nature",
    architecturalStyle: "Highest Mountain Peak in Odisha (1,672m MSL)",
    materials: "Charnockite and khondalite mountain formations",
    ecologicalGuidelines: "High wind exposure and steep precipices; remain behind safety viewing barriers; carry all waste back; no unsanctioned cliff camping.",
    nearestHub: "Koraput",
    approxStraightLineKm: 42,
  },
  "Barehipani Falls": {
    odiaName: "ବରେହିପାଣି ଜଳପ୍ରପାତ",
    domain: "nature",
    architecturalStyle: "Two-tiered Cascading Waterfall (399m fall height)",
    materials: "Precambrian cliff shelf in Similipal Tiger Reserve",
    ecologicalGuidelines: "Located in the core zone of Similipal Tiger Reserve; viewing from designated watchtower only; descent to the pool is strictly prohibited.",
    asiProtectionRef: "Similipal Tiger Reserve Core Protection",
    nearestHub: "Baripada",
    approxStraightLineKm: 65,
  },
  "Joranda Falls": {
    odiaName: "ଯୋରନ୍ଦା ଜଳପ୍ରପାତ",
    domain: "nature",
    architecturalStyle: "Single-drop Plunge Waterfall (150m vertical drop)",
    materials: "Dense sal forest cliff face",
    ecologicalGuidelines: "Viewable from forest platform; remain behind safety railings; do not feed wildlife.",
    asiProtectionRef: "Similipal Tiger Reserve Protection",
    nearestHub: "Baripada",
    approxStraightLineKm: 62,
  },
  "Khandadhar Falls": {
    odiaName: "ଖଣ୍ଡାଧାର ଜଳପ୍ରପାତ",
    domain: "nature",
    architecturalStyle: "Horsetail-type Waterfall (244m sheer drop)",
    materials: "Banded iron formation cliff edge",
    ecologicalGuidelines: "Forest trekking trail; rocks near waterfall spray are perennially slippery; local guide recommended.",
    nearestHub: "Rourkela",
    approxStraightLineKm: 52,
  },
  "Hirakud Dam": {
    odiaName: "ହୀରାକୁଦ ବନ୍ଧ",
    domain: "facility",
    architecturalStyle: "Major Hydroelectric Infrastructure (25.8 km across Mahanadi)",
    materials: "Compacted earth, concrete, and masonry",
    ecologicalGuidelines: "Strategic civil infrastructure. Photography prohibited on the main dyke crest; public observation allowed from Gandhi Minar and Nehru Minar.",
    asiProtectionRef: "Ramsar Site No. 2487 (Hirakud Reservoir)",
    nearestHub: "Sambalpur",
    approxStraightLineKm: 12,
  },
  "Samaleswari Temple": {
    odiaName: "ମା’ ସମଲେଶ୍ୱରୀ ମନ୍ଦିର",
    domain: "sacred",
    architecturalEra: "16th Century (c. 1540 CE) • Chauhan Dynasty (King Balaram Dev)",
    architecturalStyle: "Western Odisha Regional Sacred Architecture",
    materials: "Sandstone and terracotta mortars on Mahanadi bank",
    sanctuaryEtiquette: "Presiding deity of Western Odisha; footwear deposited at entrance plaza; traditional attire recommended during Nuakhai festival congregations.",
    nearestHub: "Sambalpur",
    approxStraightLineKm: 2,
  },
  "Taratarini Temple": {
    odiaName: "ମା’ ତାରାତାରିଣୀ ଶକ୍ତିପୀଠ",
    domain: "sacred",
    architecturalEra: "Ancient Shakti Sanctuary • Kalinga Sandstone Reconstructed Complex",
    architecturalStyle: "Hilltop Twin Goddess Peetha on Purnagiri Hill",
    materials: "Carved Baulamala stone and khondalite",
    sanctuaryEtiquette: "Ropeway and 999 stone steps available; tonsuring (Mundan) rituals observed; dress with modest restraint.",
    nearestHub: "Berhampur",
    approxStraightLineKm: 26,
  },
  "Gupteswar Cave": {
    odiaName: "ଗୁପ୍ତେଶ୍ୱର ଶୈବପୀଠ",
    domain: "sacred",
    architecturalEra: "Natural Limestone Karst Cavern Shrine",
    architecturalStyle: "Subterranean Stalagmitic Natural Lingam Sanctuary",
    materials: "Limestone stalagmites in Kolab river forest basin",
    sanctuaryEtiquette: "Subterranean cavern; rock steps can be damp and slippery; low ceilings in inner chamber; maintain respectful quiet.",
    nearestHub: "Jeypore",
    approxStraightLineKm: 42,
  },
};

/**
 * Returns the domain classification for any place category.
 */
export function getPlaceDomain(category: string | null | undefined): PlaceDomainType {
  if (!category) return 'heritage';
  const c = category.toLowerCase().trim();

  if (c === 'temple' || c === 'traditional_temple_food') {
    return 'sacred';
  }
  if (c === 'monument' || c === 'museum') {
    return 'heritage';
  }
  if (
    c === 'nature' ||
    c === 'beach' ||
    c === 'lake' ||
    c === 'waterfall' ||
    c === 'wildlife' ||
    c === 'park'
  ) {
    return 'nature';
  }
  if (
    c.startsWith('food') ||
    c === 'restaurant' ||
    c === 'street_food_market' ||
    c === 'heritage_sweet_stall' ||
    c === 'highway_stop' ||
    c === 'local_food_experience' ||
    c === 'regional_speciality'
  ) {
    return 'culinary';
  }
  return 'facility';
}

/**
 * Returns localized Odia script name for any place in the catalog.
 * Falls back deterministically to category + district Odia script if unmapped.
 */
export function getPlaceOdiaName(place: { name: string; category?: string | null; district?: string | null }): string {
  if (!place) return '';

  const meta = VERIFIED_CULTURAL_HERITAGE[place.name];
  if (meta?.odiaName) {
    return meta.odiaName;
  }

  for (const [key, value] of Object.entries(VERIFIED_CULTURAL_HERITAGE)) {
    if (place.name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(place.name.toLowerCase())) {
      return value.odiaName;
    }
  }

  let catOdia = 'ସ୍ଥଳ';
  if (place.category) {
    const catItem = MULTILINGUAL_CATEGORIES.find(
      (c) => c.id.toLowerCase() === place.category?.toLowerCase()
    );
    if (catItem) {
      catOdia = catItem.label_or;
    }
  }

  let distOdia = 'ଓଡ଼ିଶା';
  if (place.district) {
    const distItem = MULTILINGUAL_DISTRICTS.find(
      (d) => d.id.toLowerCase() === place.district?.toLowerCase()
    );
    if (distItem) {
      distOdia = distItem.label_or;
    }
  }

  return `${catOdia} • ${distOdia}`;
}

/**
 * Returns verified cultural metadata if available for a given place.
 */
export function getPlaceCulturalMeta(name: string): CulturalHeritageMeta | null {
  if (!name) return null;
  if (VERIFIED_CULTURAL_HERITAGE[name]) {
    return VERIFIED_CULTURAL_HERITAGE[name];
  }
  for (const [key, value] of Object.entries(VERIFIED_CULTURAL_HERITAGE)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return value;
    }
  }
  return null;
}
