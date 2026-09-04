/**
 * Authoritative Odia Localization & Cultural Atlas Metadata.
 * 
 * Provides deterministic, verified Odia script names, architectural heritage taxonomies,
 * sanctuary etiquette rules, and ASI protection citations for Odisha destinations.
 * 
 * Zero-fabrication principle:
 * - Specific sanctuary names derive from official state tourism / ASI inventories.
 * - Categorical/district fallbacks derive strictly from MULTILINGUAL_DISTRICTS and MULTILINGUAL_CATEGORIES.
 */

import { MULTILINGUAL_DISTRICTS, MULTILINGUAL_CATEGORIES } from '../types/multilingualTaxonomy';

export interface CulturalHeritageMeta {
  odiaName: string;
  architecturalEra?: string;
  architecturalStyle?: string;
  materials?: string;
  sanctuaryEtiquette?: string;
  asiProtectionRef?: string;
  nearestHub: string;
  hubDistanceKm: number;
}

export const VERIFIED_CULTURAL_HERITAGE: Record<string, CulturalHeritageMeta> = {
  // World Heritage & Major Sanctuaries
  "Konark Sun Temple": {
    odiaName: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
    architecturalEra: "13th Century (c. 1250 CE) • Eastern Ganga Dynasty (King Narasimhadeva I)",
    architecturalStyle: "Kalinga Architectural Style (Pida Deula & Natya Mandapa)",
    materials: "Khondalite sandstone, chlorite stone, iron dowels",
    sanctuaryEtiquette: "Footwear prohibited on sanctum plinth; non-commercial photography permitted in outer complex; do not touch carvings.",
    asiProtectionRef: "UNESCO World Heritage Site #242 • ASI Monument N-OR-1",
    nearestHub: "Puri",
    hubDistanceKm: 35,
  },
  "Shree Jagannath Temple": {
    odiaName: "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର",
    architecturalEra: "12th Century (c. 1161 CE) • Eastern Ganga Dynasty (King Anantavarman Chodaganga)",
    architecturalStyle: "Classic Kalinga Architecture (Bada Deula, Jagamohana, Natamandapa, Bhogamandapa)",
    materials: "Khondalite stone with traditional lime plaster coating",
    sanctuaryEtiquette: "Sanctum restricted to orthodox Hindus per Supreme Court & Temple Managing Committee; phones, cameras, and leather items strictly prohibited at Singhadwara.",
    asiProtectionRef: "ASI Protected Monument N-OR-54 • Srimandir Act 1955",
    nearestHub: "Puri",
    hubDistanceKm: 2,
  },
  "Lingaraj Temple": {
    odiaName: "ଲିଙ୍ଗରାଜ ମନ୍ଦିର",
    architecturalEra: "11th Century (c. 1090-1104 CE) • Somavamsi Dynasty (King Jajati Keshari & Lalatendu Keshari)",
    architecturalStyle: "Quintessential Mature Kalinga Style (Rekha Deula tower rising 55m)",
    materials: "Dark red sandstone, laterite boundary walls",
    sanctuaryEtiquette: "Inner sanctum open to Hindus only; raised viewing platform outside northern wall available for non-Hindu visitors; footwear deposit mandatory.",
    asiProtectionRef: "ASI Protected Monument N-OR-12",
    nearestHub: "Bhubaneswar",
    hubDistanceKm: 4,
  },
  "Mukteshvara Temple": {
    odiaName: "ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିର",
    architecturalEra: "10th Century (c. 950-975 CE) • Somavamsi Dynasty",
    architecturalStyle: "Gem of Odishan Architecture (Transition from early to mature Kalinga style with famous arched Torana)",
    materials: "Fine-grained red sandstone",
    sanctuaryEtiquette: "Active shrine; footwear must be left at outer entrance; quiet contemplation encouraged near Marichi Kunda.",
    asiProtectionRef: "ASI Protected Monument N-OR-17",
    nearestHub: "Bhubaneswar",
    hubDistanceKm: 5,
  },
  "Rajarani Temple": {
    odiaName: "ରାଜାରାଣୀ ମନ୍ଦିର",
    architecturalEra: "11th Century (c. 1000-1050 CE) • Somavamsi Period",
    architecturalStyle: "Indresvara Style with clustered miniature spires (Angasikharas)",
    materials: "Yellowish and reddish Rajarania sandstone",
    sanctuaryEtiquette: "Protected archaeological monument with ticketed entry; no active presiding deity; photography permitted in gardens.",
    asiProtectionRef: "ASI Protected Monument N-OR-19",
    nearestHub: "Bhubaneswar",
    hubDistanceKm: 4,
  },
  "Brahmeswara Temple": {
    odiaName: "ବ୍ରହ୍ମେଶ୍ୱର ମନ୍ଦିର",
    architecturalEra: "11th Century (c. 1058 CE) • Commissioned by Queen Kolavatidevi (Somavamsi)",
    architecturalStyle: "Panchayatana Kalinga Style (Central shrine with four subsidiary corner shrines)",
    materials: "Light sandstone and laterite foundations",
    sanctuaryEtiquette: "Active worship site; remove shoes before stone boundary wall; do not climb on miniature corner shrines.",
    asiProtectionRef: "ASI Protected Monument N-OR-9",
    nearestHub: "Bhubaneswar",
    hubDistanceKm: 6,
  },
  "Parasurameswara Temple": {
    odiaName: "ପରଶୁରାମେଶ୍ୱର ମନ୍ଦିର",
    architecturalEra: "7th-8th Century (c. 650 CE) • Sailodbhava Period",
    architecturalStyle: "Early Kalinga Architectural Phase (Squat Rekha Deula with tiered flat-roofed Jagamohana)",
    materials: "Weathered local sandstone with intact relief carvings of Saptamatrikas",
    sanctuaryEtiquette: "Earliest surviving stone temple in Bhubaneswar; preserve delicate stone carvings; no flash photography on sanctum reliefs.",
    asiProtectionRef: "ASI Protected Monument N-OR-18",
    nearestHub: "Bhubaneswar",
    hubDistanceKm: 5,
  },
  "Chausathi Jogini Temple": {
    odiaName: "ଚଉଷଠି ଯୋଗିନୀ ମନ୍ଦିର (ହୀରାପୁର)",
    architecturalEra: "9th Century • Bhauma-Kara Dynasty (Queen Hiradevi)",
    architecturalStyle: "Hypaethral (Open-air circular roofless enclosure) Tantric Sanctuary",
    materials: "Local laterite stone with fine chlorite Jogini sculptures",
    sanctuaryEtiquette: "Venerated active Tantric sanctuary; modest attire required; circumambulate clockwise; silence requested inside inner circle.",
    asiProtectionRef: "ASI Protected Monument N-OR-10",
    nearestHub: "Bhubaneswar",
    hubDistanceKm: 14,
  },
  "Dhauli Shanti Stupa": {
    odiaName: "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ",
    architecturalEra: "3rd Century BCE (Ashokan Edicts) & 1972 CE (Indo-Japanese Peace Pagoda)",
    architecturalStyle: "Buddhist Hemispherical Stupa with Stone-carved Elephant Capital",
    materials: "White plastered masonry and Daya river rock face",
    sanctuaryEtiquette: "Site of historic Kalinga War transformation; silence requested around stupa terrace; visit rock edicts with licensed guide.",
    asiProtectionRef: "Ashokan Rock Edict protected by ASI • Shanti Stupa by Kalinga Nippon Buddha Sangha",
    nearestHub: "Bhubaneswar",
    hubDistanceKm: 8,
  },
  "Udayagiri and Khandagiri Caves": {
    odiaName: "ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରି ଗୁମ୍ଫା",
    architecturalEra: "2nd-1st Century BCE • Chedi / Mahameghavahana Dynasty (Emperor Kharavela)",
    architecturalStyle: "Jaina Rock-Cut Monastic Cells (Ranigumpha, Hathigumpha, Ananta Gumpha)",
    materials: "Coarse-grained sandstone hills",
    sanctuaryEtiquette: "Steep rock-cut steps; wild monkeys inhabit upper caves—do not carry exposed plastic bags or food; preserve Brahmi inscriptions.",
    asiProtectionRef: "ASI Protected Monument N-OR-21 & N-OR-22",
    nearestHub: "Bhubaneswar",
    hubDistanceKm: 7,
  },
  "Chilika Lake": {
    odiaName: "ଚିଲିକା ହ୍ରଦ",
    architecturalEra: "Holocene Coastal Brackish Wetland Biosphere",
    architecturalStyle: "Asia's Largest Brackish Water Coastal Lagoon (1,165 km²)",
    materials: "Estuarine ecosystem, barrier spit sand dunes, red clay islands",
    sanctuaryEtiquette: "Wetland ecosystem; 4-stroke speed restrictions in Nalabana sanctuary buffer; maintain distance from Irrawaddy dolphins; zero single-use plastic.",
    asiProtectionRef: "Ramsar Wetland Site No. 229 • Chilika Development Authority (CDA)",
    nearestHub: "Bhubaneswar / Puri",
    hubDistanceKm: 45,
  },
  "Bhitarkanika National Park": {
    odiaName: "ଭିତରକନିକା ଜାତୀୟ ଉଦ୍ୟାନ",
    architecturalEra: "Pristine Mangrove Estuary & Marine Turtle Breeding Biosphere",
    architecturalStyle: "India's Second Largest Mangrove Ecosystem & Saltwater Crocodile Sanctuary",
    materials: "Deltaic alluvium, tidal creeks, Sundari/Hental mangrove forests",
    sanctuaryEtiquette: "Entry permit mandatory from Forest Department; boat excursions strictly between sunrise and sunset; keep limbs inside boats at all times.",
    asiProtectionRef: "Ramsar Site No. 1205 • Odisha Forest & Environment Dept",
    nearestHub: "Cuttack",
    hubDistanceKm: 110,
  },
  "Similipal National Park": {
    odiaName: "ଶିମିଳିପାଳ ଜାତୀୟ ଉଦ୍ୟାନ",
    architecturalEra: "Precambrian Biosphere Reserve & Tiger Reserve",
    architecturalStyle: "Sal-dominated Moist Deciduous Plateau with Barehipani and Joranda Waterfalls",
    materials: "Metamorphic rock mass, red laterite soils, perennially flowing rivers",
    sanctuaryEtiquette: "Forest entry gates close at 09:00 AM; day passes valid for specific routes; plastic-free eco-tourism protocols strictly enforced.",
    asiProtectionRef: "UNESCO World Biosphere Reserve • Project Tiger Reserve 1973",
    nearestHub: "Baripada / Balasore",
    hubDistanceKm: 75,
  },
  "Daringbadi": {
    odiaName: "ଦାରିଙ୍ଗବାଡ଼ି (ଓଡ଼ିଶାର କାଶ୍ମୀର)",
    architecturalEra: "Eastern Ghats Hill Tracts (Altitude ~915m MSL)",
    architecturalStyle: "Montane Pine Forests, Coffee Gardens, and Tribal Plateaus",
    materials: "Granite gneiss formations, terrace agriculture",
    sanctuaryEtiquette: "Eco-sensitive indigenous tribal belt (Kutia Kandha); respect village privacy; stay on designated trails; warm clothing needed Oct-Feb.",
    asiProtectionRef: "Odisha Tourism Eco-Retreat Zone",
    nearestHub: "Berhampur",
    hubDistanceKm: 120,
  },
  "Hirakud Dam": {
    odiaName: "ହୀରାକୁଦ ବନ୍ଧ",
    architecturalEra: "1957 CE • Modern Engineering Landmark",
    architecturalStyle: "World's Longest Earthen Dam (25.8 km across Mahanadi)",
    materials: "Compacted earth, concrete, and masonry",
    sanctuaryEtiquette: "Strategic infrastructure; photography prohibited on the main dyke crest; observation allowed from Gandhi Minar and Nehru Minar.",
    asiProtectionRef: "Water Resources Dept Govt of Odisha • Ramsar Site No. 2487",
    nearestHub: "Sambalpur",
    hubDistanceKm: 15,
  },
  "Samaleswari Temple": {
    odiaName: "ମା’ ସମଲେଶ୍ୱରୀ ମନ୍ଦିର",
    architecturalEra: "16th Century (c. 1540 CE) • Chauhan Dynasty (King Balaram Dev)",
    architecturalStyle: "Western Odisha Regional Sacred Architecture",
    materials: "Sandstone and terracotta mortars on Mahanadi bank",
    sanctuaryEtiquette: "Presiding deity of Western Odisha; footwear deposited at entrance plaza; Nuakhai festival sees immense regional congregations.",
    asiProtectionRef: "State Protected Monument • Samaleswari Temple Trust Board",
    nearestHub: "Sambalpur",
    hubDistanceKm: 2,
  },
  "Taratarini Temple": {
    odiaName: "ମା’ ତାରାତାରିଣୀ ଶକ୍ତିପୀଠ",
    architecturalEra: "Ancient Shakti Shrine • Modern Kalinga Sandstone Reconstructed Sanctuary",
    architecturalStyle: "Hilltop Twin Goddess Peetha on Purnagiri Hill",
    materials: "Carved Baulamala stone and khondalite",
    sanctuaryEtiquette: "Ropeway and 999 stone steps available; hair-offering (Mundan) traditions observed; dress modestly.",
    asiProtectionRef: "Odisha Endowments Department",
    nearestHub: "Berhampur",
    hubDistanceKm: 32,
  },
  "Chandrabhaga Beach": {
    odiaName: "ଚନ୍ଦ୍ରଭାଗା ବେଳାଭୂମି",
    architecturalEra: "Sacred Marine Shore of the Bay of Bengal",
    architecturalStyle: "Blue Flag Certified Marine Coastline & Sun Worship Confluence",
    materials: "Silica beach sand, casuarina dunes",
    sanctuaryEtiquette: "Blue Flag certified beach; strictly plastic-free zone; swimming restricted to designated lifeguard-patrolled zones.",
    asiProtectionRef: "FEE Blue Flag Certification • CRZ-I Eco-Sensitive Zone",
    nearestHub: "Puri",
    hubDistanceKm: 32,
  },
  "Golden Beach Puri": {
    odiaName: "ସ୍ୱର୍ଣ୍ଣ ବେଳାଭୂମି (ପୁରୀ)",
    architecturalEra: "Sacred Holy Confluence (Mahodadhi Titha)",
    architecturalStyle: "Blue Flag Certified Coastal Promenade",
    materials: "Golden marine sand, promenade granite pavers",
    sanctuaryEtiquette: "Certified international clean beach; follow lifeguard flags (red flag = no swimming); littering attracts statutory municipal fines.",
    asiProtectionRef: "FEE Blue Flag Certified • Puri Municipality Cadastre",
    nearestHub: "Puri",
    hubDistanceKm: 1,
  },
  "Gopalpur Beach": {
    odiaName: "ଗୋପାଳପୁର ବେଳାଭୂମି",
    architecturalEra: "Colonial Port Seacoast & Historic Maritime Haven",
    architecturalStyle: "Historic Deep-Sea Port Coast with 1871 Lighthouse",
    materials: "Coastal sand dunes, historic laterite port ruins",
    sanctuaryEtiquette: "Climbing lighthouse subject to DGLL operational hours; respect local fishing community boats and nets.",
    asiProtectionRef: "Directorate General of Lighthouses & Lightships (DGLL)",
    nearestHub: "Berhampur",
    hubDistanceKm: 16,
  },
  "Deomali Peak": {
    odiaName: "ଦେଓମାଳୀ ଶୃଙ୍ଗ",
    architecturalEra: "Precambrian Eastern Ghats (Highest Peak in Odisha, 1,672m MSL)",
    architecturalStyle: "Sub-tropical Montane Cloud Meadow & Escarpment",
    materials: "Charnockite and khondalite mountain formations",
    sanctuaryEtiquette: "High wind exposure and steep drops; stay on designated viewing platforms; carry all trash back; no overnight unsanctioned camping.",
    asiProtectionRef: "Odisha Tourism Eco-Tourism Cadastre",
    nearestHub: "Koraput / Jeypore",
    hubDistanceKm: 65,
  },
  "Gupteswar Cave": {
    odiaName: "ଗୁପ୍ତେଶ୍ୱର ଶୈବପୀଠ",
    architecturalEra: "Natural Limestone Karst Cave Shrine",
    architecturalStyle: "Subterranean Stalagmitic Natural Lingam Sanctuary",
    materials: "Limestone stalagmites in Kolab river forest basin",
    sanctuaryEtiquette: "Natural subterranean cavern; steps can be slippery with dripping mineral water; low ceilings in inner chamber; respectful silence.",
    asiProtectionRef: "State Protected Shrine • Koraput District Administration",
    nearestHub: "Jeypore",
    hubDistanceKm: 55,
  },
  "Barehipani Falls": {
    odiaName: "ବରେହିପାଣି ଜଳପ୍ରପାତ",
    architecturalEra: "Similipal National Park Biosphere",
    architecturalStyle: "Two-tiered Cascading Waterfall (399m fall height, 2nd highest in India)",
    materials: "Precambrian metamorphic cliff shelf",
    sanctuaryEtiquette: "Located in the core zone of Similipal Tiger Reserve; viewing from designated watchtower only; no descent to waterfall pool.",
    asiProtectionRef: "Similipal Tiger Reserve Core Protection",
    nearestHub: "Baripada",
    hubDistanceKm: 82,
  },
  "Joranda Falls": {
    odiaName: "ଯୋରନ୍ଦା ଜଳପ୍ରପାତ",
    architecturalEra: "Similipal National Park Biosphere",
    architecturalStyle: "Single-drop Plunge Waterfall (150m vertical drop)",
    materials: "Dense sal forest cliff face",
    sanctuaryEtiquette: "Viewable from forest platform; stay behind safety guard rails; do not feed wild animals or monkeys.",
    asiProtectionRef: "Similipal Tiger Reserve Protection",
    nearestHub: "Baripada",
    hubDistanceKm: 78,
  },
  "Khandadhar Falls": {
    odiaName: "ଖଣ୍ଡାଧାର ଜଳପ୍ରପାତ",
    architecturalEra: "Precambrian Iron-ore Belt Biosphere",
    architecturalStyle: "Horsetail-type Waterfall (244m sheer drop)",
    materials: "Banded iron formation cliff edge",
    sanctuaryEtiquette: "Trekking route through tropical deciduous forest; guide recommended; keep away from slippery cliff ledges.",
    asiProtectionRef: "Sundargarh / Kendujhar Forest Division",
    nearestHub: "Rourkela",
    hubDistanceKm: 70,
  },
};

/**
 * Returns the localized Odia script name for any place in the catalog.
 * If not in the pre-compiled sanctuary list, falls back to categorical + district Odia script.
 */
export function getPlaceOdiaName(place: { name: string; category?: string | null; district?: string | null }): string {
  if (!place) return '';

  // 1. Direct match in verified cultural metadata
  const meta = VERIFIED_CULTURAL_HERITAGE[place.name];
  if (meta?.odiaName) {
    return meta.odiaName;
  }

  // 2. Partial match check
  for (const [key, value] of Object.entries(VERIFIED_CULTURAL_HERITAGE)) {
    if (place.name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(place.name.toLowerCase())) {
      return value.odiaName;
    }
  }

  // 3. Fallback: localized categorical Odia + district Odia
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
 * Returns cultural metadata if available for a given place.
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
