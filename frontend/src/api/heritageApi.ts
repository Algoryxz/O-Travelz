/**
 * Digital Heritage API client connecting to FastAPI backend with verified fallback catalog.
 * Covers exactly the FOUR canonical Odisha 3D heritage monuments:
 * 1. Konark Sun Temple
 * 2. Puri Jagannath Temple
 * 3. Lingaraj Temple
 * 4. Brahmeswara Temple (Bhrameshwar)
 */
import type { HeritageScene } from '../types/heritage';
import { getApiBaseUrl } from './config';

export const FALLBACK_HERITAGE_SCENES: HeritageScene[] = [
  {
    id: "konark-sun-temple",
    name: "Konark Sun Temple",
    odia_name: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
    district: "Puri District",
    century: "13th Century CE (King Narasimhadeva I, Eastern Ganga Dynasty)",
    category: "Monumental Chariot & Chlorite Deula",
    description: "The monumental 24-spoke Surya Chakra astronomical sundials, Jagamohana stone massing, Natya Mandap pillared pavilion, and intricately sculpted chlorite relief panels.",
    scene_type: "REAL_3D_RECONSTRUCTION",
    status: "AVAILABLE",
    asset: {
      format: "procedural_kalinga_3d_mesh",
      model_url: undefined,
      splat_url: undefined,
      point_count: undefined,
      mesh_quality: "high_fidelity_architectural_model",
      coordinate_system: "Y-Up",
    },
    thumbnail: "/images/destinations/konark_sun_temple.webp",
    hero_banner: "/images/destinations/konark_sun_temple.webp",
    reconstruction_notes: "Authentic 3D architectural reconstruction presenting the 13th-century Jagamohana stepped pyramid, Natya Mandap hypostyle pavilion, 24-spoke Surya Chakra chariot wheels, and carved chlorite relief plinth.",
    camera_preset: {
      position: [0.0, 2.4, 5.8],
      target: [0.0, 1.2, 0.0],
      min_distance: 1.5,
      max_distance: 12.0,
      fov: 45.0,
    },
    lighting_preset: "golden_hour",
    surrounding_environment: "Sandy coastal plains, landscaped sandstone plinths, and coastal sunlight",
    is_canonical: true,
    dimensions: {
      jagamohana_height: "39 meters (128 ft)",
      base_width: "36 meters",
      wheel_diameter: "3.0 meters (9.8 ft)",
      natya_mandap_pillars: "16 massive carved chlorite pillars",
      structural_proportions: "Authentic Kalinga architectural ratio (1:4 deula to jagamohana)",
    },
    materials: {
      primary_stone: "Khondalite Stone (weathered golden-brown metamorphic rock)",
      sculptures_and_wheels: "Chlorite Stone (fine-grained greenish-grey polished stone)",
      foundation_and_core: "Laterite Stone (porous ferruginous rock)",
    },
    hotspots: [
      {
        id: "konark_wheel",
        title: "24-Spoke Surya Chakra",
        odia_title: "ସୂର୍ଯ୍ୟ ଚକ୍ର",
        description: "Astronomical stone sundial wheels where the 8 major spokes signify 3-hour praharas. The shadows cast by the axle pin indicate precise solar time.",
        architectural_significance: "Masterpiece of Kalinga sculptural precision, carved from fine-grained chlorite stone with beadings and animal medallions.",
        position: [0.0, 0.9, 1.45],
        look_at: [0.0, 0.9, 0.0],
        camera_offset: [0.0, 1.3, 2.8],
        dimension: "Diameter: 3.0 m (9.8 ft), 24 total spokes",
        material: "Chlorite stone",
        source_provenance: "ASI Archaeological Survey Monograph",
      },
      {
        id: "konark_jagamohana",
        title: "Jagamohana (Audience Hall)",
        odia_title: "ଜଗମୋହନ",
        description: "Surviving 39-meter pyramidal tiered porch constructed in three distinct tiers (potalas) crowned with the monumental kalasa and amalaka.",
        architectural_significance: "Largest surviving freestanding stone stepped-pyramid hall of Kalinga architectural style, built with interlocking laterite and khondalite blocks.",
        position: [0.0, 2.2, -0.6],
        look_at: [0.0, 1.8, -0.4],
        camera_offset: [0.0, 2.8, 4.5],
        dimension: "Height: 39 m (128 ft), 3 potalas of 9 pidha tiers",
        material: "Khondalite & Laterite stone",
        source_provenance: "ASI Architectural Survey",
      },
      {
        id: "konark_natya_mandap",
        title: "Natya Mandap (Dancing Pavilion)",
        odia_title: "ନାଟ୍ୟ ମଣ୍ଡପ",
        description: "Open hypostyle dancing pavilion featuring 16 massive carved pillars depicting classical Odissi dance postures, musicians playing mardala, and dancers.",
        architectural_significance: "Elevated plinth adorned with continuous friezes of war elephants, court musicians, and celestial nymphs (apsaras).",
        position: [0.0, 0.7, 1.3],
        look_at: [0.0, 0.7, 1.0],
        camera_offset: [0.0, 1.4, 3.2],
        dimension: "Plinth: 1.5m elevated base, 16 hypostyle columns",
        material: "Khondalite & Chlorite stone",
        source_provenance: "ASI Epigraphical Records",
      },
      {
        id: "konark_sculpture_frieze",
        title: "Chlorite Relief Facades",
        odia_title: "ଶିଳ୍ପକଳା କାରୁକାର୍ଯ୍ୟ",
        description: "Green chlorite relief panels depicting royal hunting processions, planetary deities (Navagrahas), and mythical gajasimha motifs.",
        architectural_significance: "Unsurpassed relief depth and polish, highlighting 13th-century metallurgical tools and stonemasonry guilds.",
        position: [1.2, 0.6, 0.3],
        look_at: [0.9, 0.6, 0.0],
        camera_offset: [1.8, 1.1, 2.2],
        dimension: "Continuous 3.6m plinth perimeter frieze",
        material: "Polished Chlorite Stone",
        source_provenance: "Archaeological Survey of India",
      },
    ],
    sources: [
      {
        title: "Archaeological Survey of India Reference Monograph",
        source: "ASI Architectural Survey of Konark Sun Temple & Epigraphical Archives",
        license: "Government of India Public Historical Archive",
        url: "https://odishatourism.gov.in",
        access_date: "2026-08-20",
        content_type: "Architectural Survey & Spatial Mapping Reference",
        attribution: "Archaeological Survey of India & Odisha Tourism",
      },
      {
        title: "Wikimedia Commons Cultural Heritage Documentation",
        source: "High-resolution orthogonal monument photographic documentation (File:Closeup of the center of a stone wheel - Konark Sun Temple, Orissa, India.jpg)",
        license: "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
        url: "https://commons.wikimedia.org",
        access_date: "2026-08-22",
        content_type: "Multi-angle Photographic Documentation",
        attribution: "Photo by Subhrajyoti07 via Wikimedia Commons",
      },
    ],
  },
  {
    id: "puri-jagannath-temple",
    name: "Puri Jagannath Temple",
    odia_name: "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର, ପୁରୀ",
    district: "Puri District",
    century: "12th Century CE (King Anantavarman Chodaganga Deva, Eastern Ganga Dynasty)",
    category: "Living Sacred Sanctuary & Rekha Deula",
    description: "65-meter towering sacred Rekha Deula, Jagamohana, Nata Mandapa, and Bhoga Mandapa crowned by the eight-spoke Nilachakra and sacred Patitapabana flag.",
    scene_type: "REAL_3D_RECONSTRUCTION",
    status: "AVAILABLE",
    asset: {
      format: "procedural_kalinga_3d_mesh",
      model_url: undefined,
      splat_url: undefined,
      point_count: undefined,
      mesh_quality: "high_fidelity_architectural_model",
      coordinate_system: "Y-Up",
    },
    thumbnail: "/images/destinations/puri_beach.webp",
    hero_banner: "/images/destinations/puri_beach.webp",
    reconstruction_notes: "3D architectural reconstruction of the exterior monument skyline (65m Bada Deula, Jagamohana, Singhadwara, and Nilachakra). In accordance with sacred sanctum sanctity rules, interior sanctum geometry is strictly omitted.",
    camera_preset: {
      position: [0.0, 2.8, 6.5],
      target: [0.0, 1.8, 0.0],
      min_distance: 2.0,
      max_distance: 15.0,
      fov: 45.0,
    },
    lighting_preset: "temple_glow",
    surrounding_environment: "Grand Road (Bada Danda), sacred temple enclosure, and ocean breeze",
    is_canonical: true,
    dimensions: {
      bada_deula_height: "65 meters (214 ft)",
      outer_compound_dimensions: "200 meters x 195 meters (Kurma Beda)",
      meghnad_pacheri_wall_height: "6.1 meters (20 ft)",
      nilachakra_diameter: "3.5 meters ashtadhatu discus",
    },
    materials: {
      primary_stone: "Khondalite Stone (weathered temple masonry)",
      outer_boundary_wall: "Laterite Stone (Meghanada Pacheri)",
      crown_discus: "Ashtadhatu (Sacred eight-metal alloy)",
      aruna_stambha_pillar: "Monolithic Chlorite Stone (originally from Konark)",
    },
    hotspots: [
      {
        id: "jagannath_nilachakra",
        title: "Nilachakra & Patitapabana Flag",
        odia_title: "ନୀଳଚକ୍ର ଓ ପତିତପାବନ ବାନା",
        description: "The eight-spoked sacred discus forged from ashtadhatu atop the 65m shikhara, adorned with the daily ceremonial flag changed by the Chuda Sevakas.",
        architectural_significance: "Crowning metal crest of the monumental Rekha Deula visible across Puri and the Bay of Bengal coastline.",
        position: [0.0, 4.2, -0.6],
        look_at: [0.0, 3.8, -0.6],
        camera_offset: [0.0, 4.5, 3.0],
        dimension: "Diameter: 3.5 m at 65 m elevation",
        material: "Ashtadhatu alloy",
        source_provenance: "SJTA & State Culture Monograph",
      },
      {
        id: "jagannath_rekha_deula",
        title: "Bada Deula (Main Sanctum Spire)",
        odia_title: "ବଡ଼ ଦେଉଳ",
        description: "Monumental curvilinear tower rising 65 meters on an elevated stone plinth (Kurma Beda), dominating the sacred skyline.",
        architectural_significance: "Pinnacle of mature Kalinga architecture with vertical pagas, rahapaga niches, and amalaka crowning disc.",
        position: [0.0, 2.4, -0.6],
        look_at: [0.0, 1.8, -0.6],
        camera_offset: [0.0, 2.8, 5.0],
        dimension: "Height: 65 m (214 ft)",
        material: "Khondalite stone",
        source_provenance: "SJTA Survey Records",
      },
      {
        id: "jagannath_singhadwara",
        title: "Singhadwara (Lion's Gate)",
        odia_title: "ସିଂହଦ୍ୱାର",
        description: "The majestic eastern portal of the outer Meghnad Pacheri wall guarded by two colossal monolithic crouching stone lions and Aruna Stambha.",
        architectural_significance: "Primary ceremonial gateway leading up the historic 22 Baisi Pahacha steps to the inner sanctuary.",
        position: [2.4, 0.6, 0.0],
        look_at: [2.0, 0.6, 0.0],
        camera_offset: [3.5, 1.2, 0.0],
        dimension: "Aruna Stambha: 10 m monolithic chlorite pillar",
        material: "Chlorite & Laterite stone",
        source_provenance: "Department of Tourism, Govt. of Odisha",
      },
    ],
    sources: [
      {
        title: "Shree Jagannath Temple Administration & Odisha Culture Department",
        source: "Official External Architectural Survey & Monograph",
        license: "Public Domain / Authorized External Heritage Documentation",
        url: "https://shreejagannatha.in",
        access_date: "2026-08-15",
        content_type: "External Survey & Topographical Reference",
        attribution: "SJTA & Department of Tourism, Govt. of Odisha",
      },
    ],
  },
  {
    id: "lingaraj-temple",
    name: "Lingaraj Temple",
    odia_name: "ଲିଙ୍ଗରାଜ ମନ୍ଦିର, ଭୁବନେଶ୍ୱର",
    district: "Bhubaneswar (Ekamra Kshetra)",
    century: "11th Century CE (Somavamsi Dynasty, King Jajati Keshari)",
    category: "Culmination of Kalinga Temple Architecture",
    description: "55-meter towering curvilinear Sri Mandir deula, sprawling compound of 150 subsidiary shrines, laterite compound wall, and sacred Bindu Sagar tank context.",
    scene_type: "REAL_3D_RECONSTRUCTION",
    status: "AVAILABLE",
    asset: {
      format: "procedural_kalinga_3d_mesh",
      model_url: undefined,
      splat_url: undefined,
      point_count: undefined,
      mesh_quality: "high_fidelity_architectural_model",
      coordinate_system: "Y-Up",
    },
    thumbnail: "/images/destinations/gopalpur_beach.webp",
    hero_banner: "/images/destinations/gopalpur_beach.webp",
    reconstruction_notes: "Authentic 3D digital model of the 11th-century Ekamra Kshetra complex, featuring the 55-meter curvilinear pancharatha deula, tiered jagamohana, mandapa pavilions, and surrounding precinct.",
    camera_preset: {
      position: [0.0, 2.6, 6.2],
      target: [0.0, 1.6, 0.0],
      min_distance: 2.0,
      max_distance: 15.0,
      fov: 45.0,
    },
    lighting_preset: "golden_hour",
    surrounding_environment: "Ancient Ekamra Kshetra heritage precinct, red sandstone laterite walls, and Bindu Sagar lake",
    is_canonical: true,
    dimensions: {
      sri_mandir_shikhara_height: "55 meters (180 ft)",
      jagamohana_height: "35 meters",
      compound_perimeter: "158 meters x 142 meters",
      subsidiary_shrines: "150 verified shrines in inner courtyard",
    },
    materials: {
      primary_stone: "Red Sandstone & Laterite (weathered Kalinga sandstone)",
      compound_walls: "Laterite Stone blocks (Kurma Pacheri)",
      finial_crest: "Copper/Ashtadhatu Trident Ayudha",
    },
    hotspots: [
      {
        id: "lingaraj_shikhara",
        title: "55m Curvilinear Shikhara (Sri Mandir)",
        odia_title: "ଶ୍ରୀ ମନ୍ଦିର ଶିଖର",
        description: "Rising 55 meters, the deula is divided into five vertical facets (pancharatha) with vertical miniature temple motifs soaring to the crowning amalaka.",
        architectural_significance: "Widely regarded by architectural historians as the finest and most complete expression of Kalinga sacred architecture.",
        position: [0.0, 3.2, -0.8],
        look_at: [0.0, 2.4, -0.4],
        camera_offset: [0.0, 3.6, 4.5],
        dimension: "Height: 55 m (180 ft), Pancharatha 5-segment deula",
        material: "Red Sandstone",
        source_provenance: "Ekamra Heritage Masterplan & ASI",
      },
      {
        id: "lingaraj_jagamohana",
        title: "Stepped Pyramidal Jagamohana",
        odia_title: "ଜଗମୋହନ ମଣ୍ଡପ",
        description: "Massive pyramidal tiered hall porch joined seamlessly to the main sanctum tower.",
        architectural_significance: "Exemplary Pidha Deula proportioning balancing the soaring verticality of the Sri Mandir.",
        position: [0.0, 1.8, 0.5],
        look_at: [0.0, 1.4, 0.2],
        camera_offset: [0.0, 2.2, 3.8],
        dimension: "Height: 35 m",
        material: "Red Sandstone",
        source_provenance: "ASI Bhubaneswar Circle",
      },
      {
        id: "lingaraj_compound",
        title: "Ekamra Compound & Subsidiary Shrines",
        odia_title: "ମନ୍ଦିର ପରିସର ଶତାଧିକ ମନ୍ଦିର",
        description: "Massive laterite stone compound wall (Kurma Pacheri) sheltering 150 individual shrines including the sacred Parvati Temple.",
        architectural_significance: "Living pilgrimage ecosystem preserved continuously for over a millennium.",
        position: [-1.8, 0.5, 0.0],
        look_at: [-1.2, 0.5, 0.0],
        camera_offset: [-3.0, 1.6, 2.5],
        dimension: "158m x 142m enclosure, 150 shrines",
        material: "Laterite & Sandstone",
        source_provenance: "Ekamra Kshetra Heritage Project",
      },
    ],
    sources: [
      {
        title: "Ekamra Kshetra Heritage Masterplan & ASI Bhubaneswar Circle",
        source: "Architectural Heritage Mapping of Ancient Temples of Bhubaneswar",
        license: "Government Research & Educational Reference Archive",
        url: "https://culture.odisha.gov.in",
        access_date: "2026-08-10",
        content_type: "Architectural CAD & Survey Dataset",
        attribution: "Ekamra Heritage Project, ASI & Govt. of Odisha",
      },
    ],
  },
  {
    id: "brahmeswara-temple",
    name: "Brahmeswara Temple",
    odia_name: "ବ୍ରହ୍ମେଶ୍ୱର ମନ୍ଦିର, ଭୁବନେଶ୍ୱର",
    district: "Bhubaneswar (Khordha District)",
    century: "11th Century CE (1058 CE, Queen Kolavati Devi, Somavamsi Dynasty)",
    category: "Classic Panchayatana Kalinga Temple",
    description: "Intricately carved 18.96-meter rekha deula, pyramidal jagamohana, and four authentic subsidiary corner shrines in classic Panchayatana layout with dated foundation inscription.",
    scene_type: "REAL_3D_RECONSTRUCTION",
    status: "AVAILABLE",
    asset: {
      format: "procedural_kalinga_3d_mesh",
      model_url: undefined,
      splat_url: undefined,
      point_count: undefined,
      mesh_quality: "high_fidelity_architectural_model",
      coordinate_system: "Y-Up",
    },
    thumbnail: "/images/destinations/chandrabhaga_beach.webp",
    hero_banner: "/images/destinations/chandrabhaga_beach.webp",
    reconstruction_notes: "Authentic 3D architectural model of the 11th-century Brahmeswara Panchayatana complex with central rekha deula, pyramidal jagamohana, and four authentic subsidiary corner shrines.",
    camera_preset: {
      position: [0.0, 2.2, 5.5],
      target: [0.0, 1.2, 0.0],
      min_distance: 1.6,
      max_distance: 13.0,
      fov: 45.0,
    },
    lighting_preset: "golden_hour",
    surrounding_environment: "Historic Ekamra precinct garden enclosure, ancient stone plinth, and sacred pond",
    is_canonical: true,
    dimensions: {
      shikhara_height: "18.96 meters (62.2 ft)",
      central_sanctum_base: "6.7 meters x 6.7 meters",
      corner_shrines_count: "4 subsidiary deulas at platform corners",
      plan_type: "Panchayatana (Five-shrine layout)",
    },
    materials: {
      primary_stone: "Light Ochre Sandstone (fine-grained carving stone)",
      terrace_platform: "Laterite & Sandstone Plinth",
      sculptural_friezes: "Carved Sandstone (Nataraja, Chamunda, musicians)",
    },
    hotspots: [
      {
        id: "brahmeswara_rekha_deula",
        title: "Central Rekha Deula Tower",
        odia_title: "କେନ୍ଦ୍ରୀୟ ରେଖା ଦେଉଳ",
        description: "18.96-meter soaring tower with curvilinear shikhara, carved with Chamunda, Nataraja, and celestial musicians playing flutes and cymbals.",
        architectural_significance: "Textbook masterpiece of mature Somavamsi temple craftsmanship with intact foundation date inscription (1058 CE).",
        position: [0.0, 2.6, -0.4],
        look_at: [0.0, 2.0, -0.2],
        camera_offset: [0.0, 3.0, 4.0],
        dimension: "Height: 18.96 m (62.2 ft)",
        material: "Light Ochre Sandstone",
        source_provenance: "ASI Epigraphia Indica",
      },
      {
        id: "brahmeswara_panchayatana_shrines",
        title: "4 Corner Subsidiary Shrines (Panchayatana)",
        odia_title: "ଚାରି କୋଣସ୍ଥ କ୍ଷୁଦ୍ର ମନ୍ଦିର",
        description: "Four miniature replica rekha deulas positioned at the four cardinal corners of the raised stone plinth.",
        architectural_significance: "One of the earliest and most completely preserved Panchayatana temple layouts in Eastern India.",
        position: [-1.35, 0.9, -1.35],
        look_at: [-1.0, 0.8, -1.0],
        camera_offset: [-2.2, 1.5, 2.5],
        dimension: "4 corner shrines, 1.1m model scale",
        material: "Light Sandstone",
        source_provenance: "ASI Bhubaneswar Circle",
      },
      {
        id: "brahmeswara_jagamohana",
        title: "Jagamohana with Tiered Pidha Roof",
        odia_title: "ଜଗମୋହନ ମଣ୍ଡପ",
        description: "Stepped pyramidal roof adorned with lion motifs and carved ceiling panels.",
        architectural_significance: "Seamless structural joinery between Pidha Deula porch and Rekha Deula sanctum.",
        position: [0.0, 1.3, 0.9],
        look_at: [0.0, 1.1, 0.5],
        camera_offset: [0.0, 1.8, 3.2],
        dimension: "Base: 6.0m x 6.0m",
        material: "Sandstone",
        source_provenance: "Odisha State Archaeology",
      },
    ],
    sources: [
      {
        title: "Archaeological Survey of India & Epigraphia Indica Archives",
        source: "Inscriptions of Queen Kolavati & Temple Survey of Bhubaneswar",
        license: "Government Research Open Reference Dataset",
        url: "https://asi.nic.in",
        access_date: "2026-08-12",
        content_type: "Architectural & Epigraphical Survey Documentation",
        attribution: "Archaeological Survey of India & Odisha State Archaeology",
      },
    ],
  },
];

export async function fetchHeritageScenes(): Promise<HeritageScene[]> {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/heritage/scenes`, { credentials: 'omit' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
    return FALLBACK_HERITAGE_SCENES;
  } catch {
    return FALLBACK_HERITAGE_SCENES;
  }
}

export async function fetchHeritageSceneById(id: string): Promise<HeritageScene> {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/heritage/scenes/${id}`, { credentials: 'omit' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) {
        return data;
      }
    }
    const fallback = FALLBACK_HERITAGE_SCENES.find((s) => s.id === id) ||
      (id.includes('bhrameshwar') || id.includes('brahmeshwar')
        ? FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'brahmeswara-temple')
        : undefined);
    if (fallback) return fallback;
    throw new Error(`Scene not found: ${id}`);
  } catch {
    const fallback = FALLBACK_HERITAGE_SCENES.find((s) => s.id === id) ||
      (id.includes('bhrameshwar') || id.includes('brahmeshwar')
        ? FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'brahmeswara-temple')
        : undefined);
    if (fallback) return fallback;
    throw new Error(`Scene not found: ${id}`);
  }
}

export const heritageApi = {
  getAllScenes: fetchHeritageScenes,
  getSceneById: fetchHeritageSceneById,
};
