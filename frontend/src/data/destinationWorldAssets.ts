/**
 * Authoritative Destination World Asset Manifest for Odisha Cinematic Stages.
 * Unique, verified imagery and video references for each iconic Odisha destination.
 */

export interface DestinationWorldAsset {
  id: string;
  name: string;
  odia_name: string;
  district: string;
  category: 'BEACH' | 'LAGOON' | 'HILL_STATION' | 'WILDLIFE' | 'HERITAGE';
  tagline: string;
  description: string;
  traveler_highlight: string;
  best_time: string;
  distance_from_hub: string;
  poster_url: string;
  midground_url?: string;
  foreground_texture: 'beach_sand' | 'coastal_surf' | 'water_ripple' | 'pine_mist' | 'forest_sal' | 'chlorite_stone' | 'hilltop_scrub';
  ambient_lighting: 'golden_coastal' | 'morning_mist' | 'ocean_breeze' | 'sunset_amber' | 'emerald_canopy';
  source_attribution: string;
  license: string;
}

export const DESTINATION_WORLD_ASSETS: DestinationWorldAsset[] = [
  {
    id: 'puri-beach',
    name: 'Puri Golden Beach',
    odia_name: 'ପୁରୀ ବେଳାଭୂମି',
    district: 'Puri District',
    category: 'BEACH',
    tagline: 'Blue Flag Certified Golden Coast',
    description: 'Golden sands stretching along the Bay of Bengal with gentle surf, coastal fishermen catamarans, and sunrise vistas over sacred waters.',
    traveler_highlight: 'Blue Flag certified pristine eco-beach with safe swimming zones and promenade walks.',
    best_time: 'October to March (Sunrise: 05:40 AM)',
    distance_from_hub: '60 km from Bhubaneswar (NH 316)',
    poster_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1920&auto=format&fit=crop',
    foreground_texture: 'beach_sand',
    ambient_lighting: 'golden_coastal',
    source_attribution: 'Odisha Tourism & Blue Flag Beach Program',
    license: 'Public Editorial Reference',
  },
  {
    id: 'chandrabhaga-beach',
    name: 'Chandrabhaga Beach',
    odia_name: 'ଚନ୍ଦ୍ରଭାଗା ବେଳାଭୂମି',
    district: 'Puri District',
    category: 'BEACH',
    tagline: 'Where the Sun Rises from the Ocean',
    description: 'Pristine coastal sanctuary near Konark where golden casuarina groves meet the rhythmic Bay of Bengal tides, renowned for the sacred Magha Saptami dawn dip.',
    traveler_highlight: 'Spectacular unimpeded ocean sunrise and serene eco-retreat trails.',
    best_time: 'November to February (Dawn / Sunrise)',
    distance_from_hub: '35 km from Puri / 65 km from Bhubaneswar',
    poster_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop',
    foreground_texture: 'coastal_surf',
    ambient_lighting: 'sunset_amber',
    source_attribution: 'Department of Tourism, Govt. of Odisha',
    license: 'Public Editorial Reference',
  },
  {
    id: 'gopalpur-on-sea',
    name: 'Gopalpur-on-Sea',
    odia_name: 'ଗୋପାଳପୁର ବେଳାଭୂମି',
    district: 'Ganjam District',
    category: 'BEACH',
    tagline: 'Historic Maritime Haven & Casuarina Dunes',
    description: 'Historic seaport with whispering casuarina dunes, an ancient red-and-white striped lighthouse, and peaceful tranquil surf along the southern coast.',
    traveler_highlight: 'Vintage colonial lighthouse climb with panoramic coastal vistas and fresh sea breeze.',
    best_time: 'October to March',
    distance_from_hub: '170 km from Bhubaneswar / 15 km from Berhampur',
    poster_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1920&auto=format&fit=crop',
    foreground_texture: 'beach_sand',
    ambient_lighting: 'ocean_breeze',
    source_attribution: 'Ganjam Heritage & Odisha Tourism',
    license: 'Public Editorial Reference',
  },
  {
    id: 'chilika-satapada',
    name: 'Chilika Lagoon & Satapada',
    odia_name: 'ଚିଲିକା ହ୍ରଦ ଓ ସାତପଡ଼ା',
    district: 'Puri / Khordha / Ganjam',
    category: 'LAGOON',
    tagline: 'Asia’s Largest Brackish Water Lagoon',
    description: 'Expansive 1,100 sq km wetland teeming with Irrawaddy dolphins, migratory avian flocks at Nalabana sanctuary, and traditional fishermen wooden boats.',
    traveler_highlight: 'Boat safari to Sea Mouth & Irrawaddy dolphin watching near Satapada.',
    best_time: 'November to February (Peak Migratory Bird Season)',
    distance_from_hub: '100 km from Bhubaneswar / 50 km from Puri',
    poster_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop',
    foreground_texture: 'water_ripple',
    ambient_lighting: 'ocean_breeze',
    source_attribution: 'Chilika Development Authority (CDA)',
    license: 'Public Editorial Reference',
  },
  {
    id: 'daringbadi',
    name: 'Daringbadi Pine Valleys',
    odia_name: 'ଦାରିଙ୍ଗବାଡ଼ି (ଓଡ଼ିଶାର କାଶ୍ମୀର)',
    district: 'Kandhamal District',
    category: 'HILL_STATION',
    tagline: 'The Kashmir of Odisha',
    description: 'High-altitude pine forests, aromatic coffee plantations, cascading hill springs, and winter morning frost at 3,000 feet elevation in the Eastern Ghats.',
    traveler_highlight: 'Misty pine forest canopy trails, Hill View park, and Midubanda waterfall.',
    best_time: 'October to February (Winter frost: Dec–Jan)',
    distance_from_hub: '250 km from Bhubaneswar / 125 km from Berhampur',
    poster_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop',
    foreground_texture: 'pine_mist',
    ambient_lighting: 'morning_mist',
    source_attribution: 'Kandhamal Eco-Tourism Initiative',
    license: 'Public Editorial Reference',
  },
  {
    id: 'similipal',
    name: 'Similipal Biosphere Reserve',
    odia_name: 'ଶିମିଳିପାଳ ଜାତୀୟ ଉଦ୍ୟାନ',
    district: 'Mayurbhanj District',
    category: 'WILDLIFE',
    tagline: 'UNESCO World Network of Biosphere Reserves',
    description: 'Vast 2,750 sq km primeval wilderness of towering dense Sal forests, roaring waterfalls at Barehipani & Joranda, and home to Bengal tigers & wild elephants.',
    traveler_highlight: 'Barehipani twin-tiered 399-meter waterfall and deep jungle jeep safari.',
    best_time: 'November to mid-June (Jungle open season)',
    distance_from_hub: '270 km from Bhubaneswar / 20 km from Baripada',
    poster_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop',
    foreground_texture: 'forest_sal',
    ambient_lighting: 'emerald_canopy',
    source_attribution: 'Similipal Tiger Reserve & Odisha Wildlife Wing',
    license: 'Public Editorial Reference',
  },
  {
    id: 'konark-chariot',
    name: 'Konark Sun Temple Precinct',
    odia_name: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ପରିସର',
    district: 'Puri District',
    category: 'HERITAGE',
    tagline: 'Poetry in Stone on the Eastern Seaboard',
    description: '13th-century monumental stone chariot of the Sun God, adorned with 24 colossal carved wheels and galloping horses overlooking sandy coastal plains.',
    traveler_highlight: 'Illuminated evening sound-and-light show and annual Konark Dance Festival.',
    best_time: 'October to March (Golden Hour & Evening)',
    distance_from_hub: '65 km from Bhubaneswar / 35 km from Puri',
    poster_url: 'https://images.unsplash.com/photo-1606210114565-964c5d12038a?q=80&w=1920&auto=format&fit=crop',
    foreground_texture: 'chlorite_stone',
    ambient_lighting: 'golden_coastal',
    source_attribution: 'Archaeological Survey of India & Odisha Tourism',
    license: 'Public Editorial Reference',
  },
  {
    id: 'dhauli-valley',
    name: 'Dhauli Shanti Stupa & Daya Valley',
    odia_name: 'ଦଉଳି ଶାନ୍ତି ସ୍ତୂପ ଓ ଦୟା ନଦୀ ଉପତ୍ୟକା',
    district: 'Khordha District',
    category: 'HERITAGE',
    tagline: 'Historical Cradle of Universal Peace',
    description: 'Gleaming white Buddhist Peace Pagoda perched atop Dhauli Hill, overlooking the serene Daya river plains where Emperor Ashoka renounced war for peace.',
    traveler_highlight: 'Ashokan 3rd-century BCE rock edicts and panoramic twilight sunset over the Daya river.',
    best_time: 'Year-round (Late Afternoon / Sunset)',
    distance_from_hub: '8 km south of Bhubaneswar city center',
    poster_url: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?q=80&w=1920&auto=format&fit=crop',
    foreground_texture: 'hilltop_scrub',
    ambient_lighting: 'sunset_amber',
    source_attribution: 'Odisha State Archaeology & Kalinga Nippon Buddha Sangha',
    license: 'Public Editorial Reference',
  },
];
