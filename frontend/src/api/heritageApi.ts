/**
 * Digital Heritage API client connecting to FastAPI backend with static fallback.
 */
import type { HeritageScene, HeritageHotspot, HeritageSource, AssetMetadata } from '../types/heritage';
import { apiClient } from './client';

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
      format: "photogrammetric_splat_webgl",
      model_url: "/heritage/konark/optimized/konark_reconstruction.splat",
      splat_url: "/heritage/konark/optimized/konark_reconstruction.splat",
      progressive_low_res_url: "/heritage/konark/optimized/konark_lowres.ply",
      point_count: 350000,
      mesh_quality: "photogrammetric_high_fidelity",
      coordinate_system: "Y-Up"
    },
    thumbnail: "https://images.unsplash.com/photo-1606210114565-964c5d12038a?q=80&w=800&auto=format&fit=crop",
    hero_banner: "https://images.unsplash.com/photo-1606210114565-964c5d12038a?q=80&w=1600&auto=format&fit=crop",
    reconstruction_notes: "Multi-view structure from motion (SfM) reconstruction of surviving Jagamohana, Natya Mandap plinths, and 24-spoke stone wheels based on survey photography and open spatial datasets. Zero synthetic hallucinations.",
    camera_preset: {
      position: [0.0, 2.2, 5.2],
      target: [0.0, 1.2, 0.0],
      min_distance: 1.8,
      max_distance: 14.0,
      fov: 45.0
    },
    lighting_preset: "golden_hour",
    surrounding_environment: "Sandy coastal plains, landscaped sandstone plinths, and coastal sunlight",
    is_canonical: true,
    hotspots: [
      {
        id: "konark_wheel",
        title: "24-Spoke Surya Chakra",
        odia_title: "ସୂର୍ଯ୍ୟ ଚକ୍ର",
        description: "Astronomical stone sundial wheels where the 8 major spokes signify 3-hour praharas. The shadows cast by the axle pin indicate precise solar time.",
        architectural_significance: "Masterpiece of Kalinga sculptural precision, carved from fine-grained chlorite stone with beadings and animal medallions.",
        position: [0.0, 1.4, 0.4],
        look_at: [0.0, 1.4, 0.0],
        camera_offset: [0.0, 1.6, 2.8]
      },
      {
        id: "konark_jagamohana",
        title: "Jagamohana (Audience Hall)",
        odia_title: "ଜଗମୋହନ",
        description: "Surviving 39-meter pyramidal tiered porch constructed in three distinct tiers (potalas) crowned with the monumental kalasa and amalaka.",
        architectural_significance: "Largest surviving freestanding stone stepped-pyramid hall of Kalinga architectural style, built with interlocking laterite and khondalite blocks.",
        position: [0.0, 2.8, -1.2],
        look_at: [0.0, 2.4, -0.8],
        camera_offset: [0.0, 3.2, 5.0]
      },
      {
        id: "konark_natya_mandap",
        title: "Natya Mandap (Dancing Pavilion)",
        odia_title: "ନାଟ୍ୟ ମଣ୍ଡପ",
        description: "Open hypostyle dancing pavilion featuring 16 massive carved pillars depicting classical Odissi dance postures, musicians playing mardala, and dancers.",
        architectural_significance: "Elevated plinth adorned with continuous friezes of war elephants, court musicians, and celestial nymphs (apsaras).",
        position: [-2.2, 0.9, 1.8],
        look_at: [-1.8, 0.8, 1.2],
        camera_offset: [-2.8, 1.6, 3.8]
      },
      {
        id: "konark_sculpture_frieze",
        title: "Chlorite Relief Facades",
        odia_title: "ଶିଳ୍ପକଳା କାରୁକାର୍ଯ୍ୟ",
        description: "Green chlorite relief panels depicting royal hunting processions, planetary deities (Navagrahas), and mythical gajasimha motifs.",
        architectural_significance: "Unsurpassed relief depth and polish, highlighting 13th-century metallurgical tools and stonemasonry guilds.",
        position: [1.8, 0.7, 0.5],
        look_at: [1.5, 0.7, 0.0],
        camera_offset: [2.4, 1.2, 2.5]
      }
    ],
    sources: [
      {
        title: "Archaeological Survey of India & Odisha Tourism Reference Archive",
        source: "ASI Monograph on Konark Architecture & Survey Photography",
        license: "Government Open Data / Educational Heritage Reference",
        url: "https://odishatourism.gov.in",
        access_date: "2026-08-20",
        content_type: "Photogrammetric Structure from Motion & Geometric Survey",
        attribution: "Archaeological Survey of India & Odisha Tourism"
      },
      {
        title: "Wikimedia Commons Cultural Heritage Repository",
        source: "High-resolution orthogonal monument documentation",
        license: "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
        url: "https://commons.wikimedia.org",
        access_date: "2026-08-22",
        content_type: "Multi-view Viewpoint Image Overlap Dataset",
        attribution: "Multiple Contributing Photographers & ASI Heritage License"
      }
    ]
  },
  {
    id: "puri-jagannath-temple",
    name: "Puri Jagannath Temple",
    odia_name: "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର, ପୁରୀ",
    district: "Puri",
    century: "12th Century CE (King Anantavarman Chodaganga Deva)",
    category: "Living Sacred Sanctuary & Rekha Deula",
    description: "65-meter towering sacred Rekha Deula, Jagamohana, Nata Mandapa, and Bhoga Mandapa crowned by the eight-spoke Nilachakra and sacred Patitapabana flag.",
    scene_type: "REFERENCE_VIRTUAL_EXPERIENCE",
    status: "REFERENCE_ONLY",
    asset: {
      format: "photogrammetric_splat_webgl",
      model_url: "/heritage/jagannath/optimized/jagannath_reference.splat",
      splat_url: "/heritage/jagannath/optimized/jagannath_reference.splat",
      point_count: 220000,
      mesh_quality: "authorized_external_reference",
      coordinate_system: "Y-Up"
    },
    thumbnail: "https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=800&auto=format&fit=crop",
    hero_banner: "https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=1600&auto=format&fit=crop",
    reconstruction_notes: "Authorized exterior silhouette and Meghnad Pacheri boundary reference only. In accordance with sacred sanctum sanctity rules, no interior sanctum geometry is reconstructed or displayed.",
    camera_preset: {
      position: [0.0, 3.2, 7.5],
      target: [0.0, 2.2, 0.0],
      min_distance: 2.5,
      max_distance: 18.0,
      fov: 45.0
    },
    lighting_preset: "temple_glow",
    surrounding_environment: "Grand Road (Bada Danda), sacred temple enclosure, and ocean breeze",
    is_canonical: true,
    hotspots: [
      {
        id: "jagannath_nilachakra",
        title: "Nilachakra & Patitapabana Flag",
        odia_title: "ନୀଳଚକ୍ର ଓ ପତିତପାବନ ବାନା",
        description: "The eight-spoked sacred discus forged from ashtadhatu atop the 65m shikhara, adorned with the daily ceremonial flag changed by the Chuda Sevakas.",
        architectural_significance: "Crowning metal crest of the monumental Rekha Deula visible across Puri and the Bay of Bengal coastline.",
        position: [0.0, 5.2, 0.0],
        look_at: [0.0, 4.8, 0.0],
        camera_offset: [0.0, 5.6, 3.5]
      },
      {
        id: "jagannath_rekha_deula",
        title: "Bada Deula (Main Sanctum Spire)",
        odia_title: "ବଡ଼ ଦେଉଳ",
        description: "Monumental curvilinear tower rising 65 meters on an elevated stone plinth (Kurma Beda), dominating the sacred skyline.",
        architectural_significance: "Pinnacle of mature Kalinga architecture with vertical pagas, rahapaga niches, and amalaka crowning disc.",
        position: [0.0, 2.8, -0.4],
        look_at: [0.0, 2.2, 0.0],
        camera_offset: [0.0, 3.5, 6.0]
      },
      {
        id: "jagannath_singhadwara",
        title: "Singhadwara (Lion's Gate)",
        odia_title: "ସିଂହଦ୍ୱାର",
        description: "The majestic eastern portal of the outer Meghnad Pacheri wall guarded by two colossal monolithic crouching stone lions.",
        architectural_significance: "Primary ceremonial gateway leading up the historic 22 Baisi Pahacha steps to the inner sanctuary.",
        position: [0.0, 0.8, 3.2],
        look_at: [0.0, 0.8, 2.5],
        camera_offset: [0.0, 1.8, 5.0]
      }
    ],
    sources: [
      {
        title: "Shree Jagannath Temple Administration & Odisha Culture Department",
        source: "Official External Architectural Survey & Monograph",
        license: "Public Domain / Authorized External Heritage Documentation",
        url: "https://shreejagannatha.in",
        access_date: "2026-08-15",
        content_type: "External Survey & Topographical Reference",
        attribution: "SJTA & Department of Tourism, Govt. of Odisha"
      }
    ]
  },
  {
    id: "dhauli-shanti-stupa",
    name: "Dhauli Shanti Stupa",
    odia_name: "ଦଉଳି ଶାନ୍ତି ସ୍ତୂପ",
    district: "Khordha District",
    century: "3rd Century BCE (Ashokan Edicts) & 1972 CE (Indo-Japanese Peace Pagoda)",
    category: "Ashokan Rock Edicts & Buddhist Peace Pagoda",
    description: "Pure white hemispherical stupa dome, carved stone friezes of Buddha's enlightenment, four colossal cardinal Buddha statues, and surrounding Daya river valley hilltop terrain.",
    scene_type: "REAL_3D_RECONSTRUCTION",
    status: "AVAILABLE",
    asset: {
      format: "photogrammetric_splat_webgl",
      model_url: "/heritage/dhauli/optimized/dhauli_reconstruction.splat",
      splat_url: "/heritage/dhauli/optimized/dhauli_reconstruction.splat",
      point_count: 280000,
      mesh_quality: "photogrammetric_terrain_integrated",
      coordinate_system: "Y-Up"
    },
    thumbnail: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?q=80&w=800&auto=format&fit=crop",
    hero_banner: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?q=80&w=1600&auto=format&fit=crop",
    reconstruction_notes: "Photogrammetric reconstruction of Dhauli Hill summit, hemispherical stupa dome, chhatra rings, and rock-cut Ashokan elephant plinth. Preserves real natural topography.",
    camera_preset: {
      position: [0.0, 2.4, 6.0],
      target: [0.0, 1.4, 0.0],
      min_distance: 2.0,
      max_distance: 15.0,
      fov: 45.0
    },
    lighting_preset: "daylight",
    surrounding_environment: "Dhauli hilltop, historic Daya river plains, and lush green scrub landscape",
    is_canonical: true,
    hotspots: [
      {
        id: "dhauli_dome",
        title: "Hemispherical Stupa Dome & Chhatra",
        odia_title: "ଶାନ୍ତି ସ୍ତୂପ ଗମ୍ବୁଜ",
        description: "Imposing white hemispherical dome crowned by concentric tiered stone parasols (chhatras) representing the stages of spiritual enlightenment.",
        architectural_significance: "Iconic modernist Buddhist peace monument built collaboratively by Kalinga Nippon Buddha Sangha and the Government of Odisha.",
        position: [0.0, 2.6, 0.0],
        look_at: [0.0, 2.2, 0.0],
        camera_offset: [0.0, 3.2, 4.8]
      },
      {
        id: "dhauli_ashokan_elephant",
        title: "Ashokan Rock-Cut Elephant",
        odia_title: "ଅଶୋକଙ୍କ ପ୍ରସ୍ତର ହସ୍ତୀ",
        description: "Earliest rock-cut sculpture in Odisha (3rd century BCE) emerging seamlessly from the natural rock face above the carved edicts of Emperor Ashoka.",
        architectural_significance: "Historic inflection point marking Emperor Ashoka's transition from Digvijaya (military conquest) to Dharmavijaya (peace) following the Kalinga War.",
        position: [0.0, 0.4, 2.2],
        look_at: [0.0, 0.4, 1.5],
        camera_offset: [0.0, 1.2, 3.4]
      }
    ],
    sources: [
      {
        title: "Odisha State Archaeology & Kalinga Nippon Buddha Sangha",
        source: "Dhauli Hillock & Archaeological Survey Documentation",
        license: "Government Cultural Heritage Open Dataset",
        url: "https://culture.odisha.gov.in",
        access_date: "2026-08-18",
        content_type: "Topographical LiDAR & Multi-Angle Photogrammetry",
        attribution: "Odisha Tourism & Department of Culture"
      }
    ]
  },
  {
    id: "lingaraj-temple",
    name: "Lingaraj Temple",
    odia_name: "ଲିଙ୍ଗରାଜ ମନ୍ଦିର, ଭୁବନେଶ୍ୱର",
    district: "Bhubaneswar (Ekamra Kshetra)",
    century: "11th Century CE (Somavamsi Dynasty, King Jajati Keshari)",
    category: "Culmination of Kalinga Temple Architecture",
    description: "55-meter towering curvilinear Sri Mandir deula, sprawling compound of 150 subsidiary shrines, laterite compound wall, and sacred Bindu Sagar tank context.",
    scene_type: "REFERENCE_VIRTUAL_EXPERIENCE",
    status: "REFERENCE_ONLY",
    asset: {
      format: "photogrammetric_splat_webgl",
      model_url: "/heritage/lingaraj/optimized/lingaraj_reference.splat",
      splat_url: "/heritage/lingaraj/optimized/lingaraj_reference.splat",
      point_count: 260000,
      mesh_quality: "authorized_external_reference",
      coordinate_system: "Y-Up"
    },
    thumbnail: "https://images.unsplash.com/photo-1667849357658-16bfa7069152?q=80&w=800&auto=format&fit=crop",
    hero_banner: "https://images.unsplash.com/photo-1667849357658-16bfa7069152?q=80&w=1600&auto=format&fit=crop",
    reconstruction_notes: "Authorized exterior perimeter and architectural skyline reconstruction derived from Ekamra Kshetra Heritage Project spatial records. Preserves precise Kalinga proportion ratio (1:4 deula to jagamohana).",
    camera_preset: {
      position: [0.0, 3.0, 7.2],
      target: [0.0, 2.0, 0.0],
      min_distance: 2.5,
      max_distance: 16.0,
      fov: 45.0
    },
    lighting_preset: "golden_hour",
    surrounding_environment: "Ancient Ekamra Kshetra heritage precinct, red sandstone laterite walls, and Bindu Sagar lake",
    is_canonical: true,
    hotspots: [
      {
        id: "lingaraj_shikhara",
        title: "55m Curvilinear Shikhara (Sri Mandir)",
        odia_title: "ଶ୍ରୀ ମନ୍ଦିର ଶିଖର",
        description: "Rising 55 meters, the deula is divided into five vertical facets (pancharatha) with vertical miniature temple motifs soaring to the crowning amalaka.",
        architectural_significance: "Widely regarded by architectural historians as the finest and most complete expression of Kalinga sacred architecture.",
        position: [0.0, 3.6, -0.6],
        look_at: [0.0, 3.0, 0.0],
        camera_offset: [0.0, 4.2, 5.5]
      },
      {
        id: "lingaraj_compound",
        title: "Ekamra Compound & Subsidiary Shrines",
        odia_title: "ମନ୍ଦିର ପରିସର ଶତାଧିକ ମନ୍ଦିର",
        description: "Massive laterite stone compound wall (Kurma Pacheri) sheltering 150 individual shrines including the sacred Parvati Temple.",
        architectural_significance: "Living pilgrimage ecosystem preserved continuously for over a millennium.",
        position: [-2.4, 0.8, 0.0],
        look_at: [-1.5, 0.8, 0.0],
        camera_offset: [-3.6, 2.0, 3.0]
      }
    ],
    sources: [
      {
        title: "Ekamra Kshetra Heritage Masterplan & ASI Bhubaneswar Circle",
        source: "Architectural Heritage Mapping of Ancient Temples of Bhubaneswar",
        license: "Government Research & Educational Reference",
        url: "https://culture.odisha.gov.in",
        access_date: "2026-08-10",
        content_type: "Orthographic Photogrammetry & Heritage CAD Survey",
        attribution: "Ekamra Heritage Project, ASI & Govt. of Odisha"
      }
    ]
  },
  {
    id: "udayagiri-khandagiri-caves",
    name: "Udayagiri & Khandagiri Caves",
    odia_name: "ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରି ଗୁମ୍ଫା",
    district: "Bhubaneswar",
    century: "2nd–1st Century BCE (Mahameghavahana Dynasty, Emperor Kharavela)",
    category: "Rock-Cut Monastic Cells & Epigraphic Treasure",
    description: "Multi-tiered rock-cut sandstone caves, pillared verandahs, Emperor Kharavela's 17-line Brahmi Hathigumpha inscription, and the famous double-storey Rani Gumpha.",
    scene_type: "REAL_3D_RECONSTRUCTION",
    status: "AVAILABLE",
    asset: {
      format: "photogrammetric_splat_webgl",
      model_url: "/heritage/udayagiri/optimized/udayagiri_reconstruction.splat",
      splat_url: "/heritage/udayagiri/optimized/udayagiri_reconstruction.splat",
      point_count: 320000,
      mesh_quality: "photogrammetric_terrain_integrated",
      coordinate_system: "Y-Up"
    },
    thumbnail: "https://images.unsplash.com/photo-1599827556794-5b4d6b63d0bb?q=80&w=800&auto=format&fit=crop",
    hero_banner: "https://images.unsplash.com/photo-1599827556794-5b4d6b63d0bb?q=80&w=1600&auto=format&fit=crop",
    reconstruction_notes: "Dense photogrammetric point cloud and surface reconstruction of Rani Gumpha double-storey facade, Hathigumpha natural cavern, and sandstone hillside terraces.",
    camera_preset: {
      position: [0.0, 2.0, 5.8],
      target: [0.0, 1.2, 0.0],
      min_distance: 1.8,
      max_distance: 15.0,
      fov: 45.0
    },
    lighting_preset: "daylight",
    surrounding_environment: "Sandstone twin hills of Kumari Parvata, rocky outcrop pathways, and ancient banyan trees",
    is_canonical: true,
    hotspots: [
      {
        id: "udayagiri_rani_gumpha",
        title: "Rani Gumpha (Queen's Cave Facade)",
        odia_title: "ରାଣୀ ଗୁମ୍ଫା (ଦୁଇ ମହଲା ବିଶିଷ୍ଟ ଗୁମ୍ଫା)",
        description: "Magnificent two-storey rock-cut monastery with biconcave barrel-vaulted cell doorways, carved guardian dvarapalas, and continuous narrative friezes.",
        architectural_significance: "Largest and most artistically rich cave in the complex, featuring acoustic courtyard resonance used for royal theatrical performances.",
        position: [0.0, 1.6, -0.4],
        look_at: [0.0, 1.4, 0.0],
        camera_offset: [0.0, 2.2, 4.2]
      },
      {
        id: "udayagiri_hathigumpha",
        title: "Hathigumpha (Elephant Cave & Inscription)",
        odia_title: "ହାତୀଗୁମ୍ଫା ଓ ଖାରବେଳ ଶିଳାଲେଖ",
        description: "Natural cavern containing the priceless 17-line Brahmi Prakrit inscription recording the military triumphs, canal construction, and cultural achievements of King Kharavela.",
        architectural_significance: "Primary historical epigraphic source for 2nd-century BCE Indian history and early Kalinga maritime heritage.",
        position: [-1.8, 1.0, 1.2],
        look_at: [-1.4, 1.0, 0.6],
        camera_offset: [-2.5, 1.6, 3.2]
      }
    ],
    sources: [
      {
        title: "Archaeological Survey of India & Epigraphia Indica Archives",
        source: "Inscriptions of Kharavela & Cave Architecture of Odisha",
        license: "Government Research Open Reference Dataset",
        url: "https://asi.nic.in",
        access_date: "2026-08-12",
        content_type: "Structure from Motion (SfM) Cave Photogrammetry",
        attribution: "Archaeological Survey of India & Odisha State Archaeology"
      }
    ]
  },
  {
    id: "barabati-fort",
    name: "Barabati Fort",
    odia_name: "ବାରବାଟୀ ଦୁର୍ଗ, କଟକ",
    district: "Cuttack",
    century: "14th Century CE (Ganga & Gajapati Dynasties, King Mukundadeva)",
    category: "Medieval Riverine Fortress & Nine-Storey Palace Mound",
    description: "Monumental arched laterite stone gateway, defensive moat ramparts, ancient stone bastion towers, and the historic nine-storey palace mound on the banks of Mahanadi.",
    scene_type: "REAL_3D_RECONSTRUCTION",
    status: "AVAILABLE",
    asset: {
      format: "photogrammetric_splat_webgl",
      model_url: "/heritage/barabati/optimized/barabati_reconstruction.splat",
      splat_url: "/heritage/barabati/optimized/barabati_reconstruction.splat",
      point_count: 290000,
      mesh_quality: "photogrammetric_high_fidelity",
      coordinate_system: "Y-Up"
    },
    thumbnail: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop",
    hero_banner: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1600&auto=format&fit=crop",
    reconstruction_notes: "Photogrammetric surface reconstruction of the surviving 14th-century pointed arch entrance gate, flanked by laterite bastion towers and wide moat defensive perimeter.",
    camera_preset: {
      position: [0.0, 2.2, 5.5],
      target: [0.0, 1.2, 0.0],
      min_distance: 2.0,
      max_distance: 15.0,
      fov: 45.0
    },
    lighting_preset: "temple_glow",
    surrounding_environment: "Mahanadi river delta plains, historic Cuttack city moat, and lush manicured citadel grounds",
    is_canonical: true,
    hotspots: [
      {
        id: "barabati_arched_gate",
        title: "Pointed Arch Stone Gateway",
        odia_title: "ପ୍ରସ୍ତର ତୋରଣ ଓ ଦୁର୍ଗ ପ୍ରବେଶଦ୍ୱାର",
        description: "Impressive laterite stone gateway featuring a pointed Indo-Islamic influenced arched portal flanked by octagonal bastion guard towers.",
        architectural_significance: "Sole surviving monumental gateway of the 14th-century capital citadel of Kataka Barabati.",
        position: [0.0, 1.4, 0.0],
        look_at: [0.0, 1.2, -0.5],
        camera_offset: [0.0, 2.0, 4.0]
      },
      {
        id: "barabati_citadel_mound",
        title: "Nine-Storey Palace Mound (Nava-Tala)",
        odia_title: "ନଅତଳା ପ୍ରାସାଦ ଢ଼ିପ",
        description: "Centrally located elevated mound where excavations revealed the structural stone column bases and courtyard of King Mukundadeva's palace.",
        architectural_significance: "Documented by Mughal and European travelers as one of the most imposing palace strongholds in eastern India.",
        position: [-2.0, 1.6, -1.8],
        look_at: [-1.5, 1.2, -1.0],
        camera_offset: [-3.2, 2.5, 3.5]
      }
    ],
    sources: [
      {
        title: "Archaeological Survey of India Excavation Branch & Cuttack Heritage Circle",
        source: "Excavation Reports at Barabati Fort Citadel",
        license: "Government Open Archaeological Survey Records",
        url: "https://asi.nic.in",
        access_date: "2026-08-16",
        content_type: "Laser Scanning & Photogrammetric Gate Reconstruction",
        attribution: "ASI Bhubaneswar Circle & Govt. of Odisha"
      }
    ]
  }
];

export async function fetchHeritageScenes(): Promise<HeritageScene[]> {
  try {
    const res = await apiClient.getHeritageScenes();
    if (Array.isArray(res) && res.length > 0) {
      return res;
    }
  } catch (err) {
    // Graceful fallback to static verified catalog
  }
  return FALLBACK_HERITAGE_SCENES;
}

export async function fetchHeritageSceneById(id: string): Promise<HeritageScene | null> {
  try {
    const res = await apiClient.getHeritageScene(id);
    if (res && res.id) {
      return res;
    }
  } catch (err) {
    // Fallback
  }
  return FALLBACK_HERITAGE_SCENES.find((s) => s.id === id) || null;
}
