/**
 * O-Travelz Deterministic Image Resolution & Manual Override Registry
 *
 * Strict resolution order:
 * 1. MANUAL_IMAGE_OVERRIDES (user/curator supplied dictionary by ID or slug)
 * 2. Verified place image from API / DB payload
 * 3. Canonical Curated Destination Manifest (1-to-1 semantic photograph matching by research_id or name)
 * 4. Distinct Category-Themed Editorial SVG Fallback (Temple, Waterfall, Beach, Wildlife, Handloom, Food)
 * 5. Neutral Editorial Architectural SVG Fallback
 *
 * INVARIANT: Never borrows or contaminates an unrelated landmark photograph (e.g. Konark, Lingaraj, Chilika fish)
 * as a universal fallback for a different destination.
 */

import { resolvePlaceImage } from './imageAdapter';
import {
  CATEGORY_THEMED_FALLBACKS,
  DEFAULT_FALLBACK_IMAGE,
  resolveHubImage,
  getLocationImage,
  getLocationImageUrl,
  CANONICAL_HUB_IMAGES,
  type HubImageInfo,
} from './imageService';
import type { PlaceImageContract } from '../types/api';

export {
  resolveHubImage,
  getLocationImage,
  getLocationImageUrl,
  CANONICAL_HUB_IMAGES,
  type HubImageInfo,
};

export interface ImageResolutionResult {
  src: string;
  alt: string;
  sourceType: 'manual_override' | 'api_verified' | 'curated_destination' | 'category_fallback' | 'neutral_fallback';
}

/**
 * Centralized, easily maintainable manual image overrides dictionary.
 * Supports lookup by research_id, database UUID, experience id, or exact place name.
 */
export const PLACE_IMAGE_OVERRIDES: Record<string, string> = {
  // 1. Signature Hubs & Curated Experiences
  "hero_odisha_cinematic": "https://lh3.googleusercontent.com/aida-public/AB6AXuBqOOikBJZ-5aej8Mblj0xhbGmiY5GW8Kj_DZfPgIWPyUvZ5vc_sVEWY7JWPXCXQFb-2br6r-8CWlxMzqLYIwHeuqC4S-BO4olt2McZxM0XMwm60bFF5jTHCJ9RzglXhmXsGtAeSglMXMTLvTeF6ylfKJbb15-N2Q_MhYfOTwaeSmGiir3D4rZv5iaAKQdKSvnn6b27mSb6nL5tXkFAD46fn4NVUcipQQcUR9MuzEOiMzaGlkR4n4fVqdjyPmY_H0PQ4XiMl9yCMb0", // Hero Editorial Photo & Konark Sun Temple
  "place_puri_001": "https://lh3.googleusercontent.com/aida-public/AB6AXuDX9t5xDnxhIlK3OKNGhyuOS73-1dAaksAFQQG_pMNb3CeRJYrdIV52fSNjxCwpm5iWiVwMIOTQXgUtjezNwOEj-IS3ysi7TasX98BsKC3cBLZBa26cpCBbXhLn0mVFSKHaMjWGTA2cbE7ZJftd49rZYbyWgJllFl6Nf7-rTyfDWLBxdBSGqarYv0Ay8lJ_SUK8OthnJ8c2zJWsx_-ehHOJhObOwcEPlaj9AJMvLx_WHzbsY38-o3lG-mgsq7UIn-1EXddvACeNm0Q", // Jagannath Temple Puri Golden Beach
  "place_konark_001": "https://lh3.googleusercontent.com/aida-public/AB6AXuBqOOikBJZ-5aej8Mblj0xhbGmiY5GW8Kj_DZfPgIWPyUvZ5vc_sVEWY7JWPXCXQFb-2br6r-8CWlxMzqLYIwHeuqC4S-BO4olt2McZxM0XMwm60bFF5jTHCJ9RzglXhmXsGtAeSglMXMTLvTeF6ylfKJbb15-N2Q_MhYfOTwaeSmGiir3D4rZv5iaAKQdKSvnn6b27mSb6nL5tXkFAD46fn4NVUcipQQcUR9MuzEOiMzaGlkR4n4fVqdjyPmY_H0PQ4XiMl9yCMb0", // Konark Sun Temple Sanctuary
  "place_bbsr_001": "https://lh3.googleusercontent.com/aida-public/AB6AXuBe49mA0mm7Qpx5MT7y5Djc1elkDXFDsaNpmLpJ4PY6IgMjNj2zKrp8HaiUzLv0qaau1kssmLlGV_cMihm9Fe4_1yjjN3xBmz3ce-Qm4SC_oKAN8QUDWJ3fx_gXOc2oKzW-dxlJyIROyw2USQwWfx4-YboARQzxLieWAoRy__qL4Jnz968ztd8rV3fItXe9pUNk9oKT35gvx_wASv-SpZRJGWv-AEwHOUuaT67zAwPFqjxh8ed6Ckh-2jw7eySKtp1okPgYLyc5Kms", // Lingaraj Temple Bhubaneswar Heritage Precinct
  "place_chilika_001": "https://lh3.googleusercontent.com/aida-public/AB6AXuBncciVZ_jB169hv_MKF44YxFY_wzB-0nEJAi6vrAnpeouErvxxKFxom7VZ-7VH9-vNrDKxN8ByHJmV0fSwpDCvfWJimHI98mDrHhdQnuSK-QwL88IBCAMCSVoaVGRLgl5O7mtGsbvpmBuHP6F7yMkUsDNRu85F9aKH8KliiglC5e8ZyAzkBtt2vd3fxyF1_cC1PJSxaPskidx5Q5U3hRBdUeDZoLNEobb-CVjWhJsGiP4yU1xS39ATAVvK4PfVW7q626KW5dHZYu0", // Chilika Marine Lagoon
  "exp_ekamra_haat": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80", // Ekamra Haat Traditional Craft Hub
  "Ekamra Haat Urban Craft & Food Village": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80",
  "exp_boyanika_handloom": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80", // Boyanika Sambalpuri Handloom Emporium
  "Boyanika Sambalpuri Handloom Emporium": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80",
  "exp_pahala_rasgulla": "/images/manual/food_khurda_001.webp", // Pahala Rasgulla & Chhena Gaja Trail (NH-16 Corridor)
  "Pahala Rasgulla & Chhena Gaja Trail": "/images/manual/food_khurda_001.webp",
  "exp_puri_mahaprasad": "/images/manual/food_puri_001.webp", // Ananda Bazaar Mahaprasad Experience (Puri Temple Complex)
  "Ananda Bazaar Mahaprasad Experience": "/images/manual/food_puri_001.webp",
  "exp_cuttack_dahibara": "/images/manual/food_cuttack_003.webp", // Cuttack Barabati Dahibara Aloodum (Barabati Bidanasi Hub)
  "Cuttack Barabati Dahibara Aloodum": "/images/manual/food_cuttack_003.webp",
  "exp_nayagarh_chhenapoda": "/images/manual/food_nayagarh_001.webp", // Nayagarh Authentic Chhena Poda (Nayagarh Birthplace Hub)
  "Nayagarh Authentic Chhena Poda": "/images/manual/food_nayagarh_001.webp",
  "exp_chilika_seafood": "/images/manual/food_jagatsinghpur_001.webp", // Satapada Fresh Lagoon Crab & Tiger Prawns (Chilika Coastal Kitchens)
  "Satapada Fresh Lagoon Crab & Tiger Prawns": "/images/manual/food_jagatsinghpur_001.webp",
  "exp_raghurajpur_craft": "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=1080&auto=format&fit=crop&q=80", // Raghurajpur Heritage Pattachitra Village
  "Raghurajpur Heritage Pattachitra Village": "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=1080&auto=format&fit=crop&q=80",
  "exp_pipili_applique": "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=1080&auto=format&fit=crop&q=80", // Pipili Applique Artisan Bazaar
  "Pipili Applique Artisan Bazaar": "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=1080&auto=format&fit=crop&q=80",
  "exp_esplanade_one": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1080&auto=format&fit=crop&q=80", // Esplanade One Shopping & Entertainment
  "Esplanade One Shopping & Entertainment": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1080&auto=format&fit=crop&q=80",

  // 2. Phase 4 Ingested Authentic Manual Assets (Local Static Serving)
  "food_angul_001": "/images/manual/food_angul_001.webp", // Bantala Mati Handi Desi Meat & Thali Junction (Angul, highway_stop)
  "food_balasore_001": "/images/manual/food_balasore_001.webp", // Sahadevkhunta Coastal Seafood Market & Dhaba Hub (Balasore, highway_stop)
  "food_bhadrak_001": "/images/manual/food_bhadrak_001.webp", // Puruna Bazar Palua Ladoo Heritage Confectionery (Bhadrak, heritage_sweet_stall)
  "food_bolangir_001": "/images/manual/food_bolangir_001.webp", // Balangir Daily Market Chaula Bara & Mithai Corner (Balangir, street_food_market)
  "food_boudh_001": "/images/manual/food_boudh_001.webp", // Boudh Mahanadi Ghat Traditional Chhena Gaja Corner (Boudh, heritage_sweet_stall)
  "food_cuttack_002": "/images/manual/food_cuttack_002.webp", // Bikalananda Kar Rasagola Heritage Confectionery (Cuttack, heritage_sweet_stall)
  "food_cuttack_003": "/images/manual/food_cuttack_003.webp", // Barabati Fort Bidanasi Dahibara Hub (Cuttack, street_food_market)
  "food_deogarh_001": "/images/manual/food_deogarh_001.webp", // Pradhanpat Waterfalls Approach Traditional Tiffin Hub (Deogarh, local_food_experience)
  "food_dhenkanal_001": "/images/manual/food_dhenkanal_001.webp", // Dhenkanal Bara & Magji Ladoo Heritage Hub (Dhenkanal, regional_speciality)
  "food_gajapati_001": "/images/manual/food_gajapati_001.webp", // Paralakhemundi Maharaja Palace Street Tiffin & Sweet Hub (Gajapati, heritage_sweet_stall)
  "food_ganjam_001": "/images/manual/food_ganjam_001.webp", // Berhampur Girija Square Tiffin & Dosa Hub (Ganjam, street_food_market)
  "food_ganjam_002": "/images/manual/food_ganjam_002.webp", // Old Bus Stand Achar & Papad Bajar, Berhampur (Ganjam, regional_speciality)
  "food_jagatsinghpur_001": "/images/manual/food_jagatsinghpur_001.webp", // Paradeep Port Fish Harbour & Coastal Kitchens (Jagatsinghpur, local_food_experience)
  "food_jajpur_001": "/images/manual/food_jajpur_001.webp", // Chandikhole Mahavinayak Rasagola & Highway Dhaba Junction (Jajpur, highway_stop)
  "food_jharsuguda_001": "/images/manual/food_jharsuguda_001.webp", // Jharsuguda Marwari Para Traditional Chaat & Thali Hub (Jharsuguda, street_food_market)
  "food_kalahandi_001": "/images/manual/food_kalahandi_001.webp", // Bhawanipatna Main Road Ragi & Traditional Thali Centre (Kalahandi, restaurant)
  "food_kandhamal_001": "/images/manual/food_kandhamal_001.webp", // Daringbadi Hill Station Organic Coffee & Spice Kitchen (Kandhamal, local_food_experience)
  "food_kendrapara_001": "/images/manual/food_kendrapara_001.webp", // Kendrapara Baladevjew Rasabali Confectionery Hub (Kendrapara, heritage_sweet_stall)
  "food_keonjhar_001": "/images/manual/food_keonjhar_001.webp", // Keonjhar Phula Badi Heritage Artisan Market (Kendujhar, regional_speciality)
  "food_keonjhar_002": "/images/manual/food_keonjhar_002.webp", // Ghatgaon Maa Tarini Pitha & Prasad Stall Precinct (Kendujhar, traditional_temple_food)
  "food_khurda_001": "/images/manual/food_khurda_001.webp", // Pahala Rasagola & Chhena Gaja Sweet Cluster (Khordha, heritage_sweet_stall)
  "food_khurda_002": "/images/manual/food_khurda_002.webp", // OTDC Nimantran Authentic Odia Cuisine Centre (Khordha, restaurant)
  "food_khurda_003": "/images/manual/food_khurda_003.webp", // Bapuji Nagar Food & Tiffin Corridor (Khordha, street_food_market)
  "food_khurda_004": "/images/manual/food_khurda_004.webp", // Old Town Lingaraj Temple Kora Khai Hub (Khordha, traditional_temple_food)
  "food_koraput_001": "/images/manual/food_koraput_001.webp", // Koraput Tribal Coffee Experience & Mandia Tiffin Hub (Koraput, local_food_experience)
  "food_malkangiri_001": "/images/manual/food_malkangiri_001.webp", // Malkangiri Tribal Hatpada Millet & Forest Kitchen (Malkangiri, local_food_experience)
  "food_mayurbhanj_001": "/images/manual/food_mayurbhanj_001.webp", // Baripada Mudhi Mansa Traditional Food Hub (Mayurbhanj, local_food_experience)
  "food_nabarangpur_001": "/images/manual/food_nabarangpur_001.webp", // Nabarangpur Lac & Grain Corridor Traditional Tiffin Centre (Nabarangpur, restaurant)
  "food_nayagarh_001": "/images/manual/food_nayagarh_001.webp", // Nayagarh Khandapada Chhena Poda Birthplace Confectionery (Nayagarh, heritage_sweet_stall)
  "food_nuapada_001": "/images/manual/food_nuapada_001.webp", // Khariar Road Highway Tiffin & Chaula Bara Hub (Nuapada, highway_stop)
  "food_puri_001": "/images/manual/food_puri_001.webp", // Ananda Bazar Sacred Mahaprasad Food Court (Puri, traditional_temple_food)
  "food_rayagada_001": "/images/manual/food_rayagada_001.webp", // Rayagada Station Road Andhra-Odia Confluence Tiffin Hub (Rayagada, street_food_market)
  "food_sambalpur_001": "/images/manual/food_sambalpur_001.webp", // Golbazar Chaula Bara & Tiffin Corner, Sambalpur (Sambalpur, street_food_market)
  "food_sambalpur_002": "/images/manual/food_sambalpur_002.webp", // Ainthapali Transit Food Corridor, Sambalpur (Sambalpur, highway_stop)
  "food_subarnapur_001": "/images/manual/food_subarnapur_001.webp", // Sonepur Suvarnameru Sweets & Pitha Heritage Stall (Subarnapur, heritage_sweet_stall)
  "food_sundargarh_001": "/images/manual/food_sundargarh_001.webp", // Sector-5 Commercial Food Hub, Rourkela (Sundargarh, street_food_market)
  "place_balasore_002": "/images/manual/place_balasore_002.webp", // Talasari Beach & Palm Fringes (Balasore, beach)
  "place_balasore_003": "/images/manual/place_balasore_003.webp", // Panchalingeswar Temple & Springs (Balasore, temple)
  "place_bhadrak_001": "/images/manual/place_bhadrak_001.webp", // Maa Akhandalamani Temple (Aradi) (Bhadrak, temple)
  "place_bhadrak_002": "/images/manual/place_bhadrak_002.webp", // Dhamra Port & Marine Estuary (Bhadrak, beach)
  "place_balangir_001": "/images/manual/place_bolangir_001.webp", // Harishankar Temple & Stream (Balangir, temple)
  "place_balangir_002": "/images/manual/place_bolangir_002.webp", // Ranipur Jharial 64 Yogini Temple (Balangir, monument)
  "place_boudh_001": "/images/manual/place_boudh_001.webp", // Boudh Colossal Buddha Statues (Boudh, monument)
  "place_boudh_002": "/images/manual/place_boudh_002.webp", // Rameswar Temple Complex (Boudh, temple)
  "place_deogarh_001": "/images/manual/place_deogarh_001.webp", // Pradhanpat Waterfall (Deogarh, waterfall)
  "place_dhenkanal_001": "/images/manual/place_dhenkanal_001.webp", // Kapilash Temple & Sanctuary (Dhenkanal, temple)
  "place_dhenkanal_003": "/images/manual/place_dhenkanal_003.webp", // Saptasajya Hill Sanctuary (Dhenkanal, nature)
  "place_gajapati_002": "/images/manual/place_gajapati_002.webp", // Khasada Waterfall (Chandragiri) (Gajapati, waterfall)
  "place_ganjam_003": "/images/manual/place_ganjam_003.webp", // Maa Tara Tarini Shakti Peetha (Ganjam, temple)
  "place_jagatsinghpur_001": "/images/manual/place_jagatsinghpur_001.webp", // Maa Sarala Temple (Jhankad) (Jagatsinghpur, temple)
  "place_jagatsinghpur_002": "/images/manual/place_jagatsinghpur_002.webp", // Paradip Sea Beach & Lighthouse (Jagatsinghpur, beach)
  "place_jagatsinghpur_003": "/images/manual/place_jagatsinghpur_003.webp", // Siali Sea Beach (Jagatsinghpur, beach)
  "place_jharsuguda_002": "/images/manual/place_jharsuguda_002.webp", // Bikramkhol Prehistoric Rock Art (Jharsuguda, monument)
  "place_kalahandi_002": "/images/manual/place_kalahandi_002.webp", // Asurgarh Ancient Fortified City (Kalahandi, monument)
  "place_kendrapara_002": "/images/manual/place_kendrapara_002.webp", // Baladevjew Temple (Ichhapur) (Kendrapara, temple)
  "place_koraput_003": "/images/manual/place_koraput_003.webp", // Deomali Peak, Koraput (Koraput, nature)
  "place_koraput_005": "/images/manual/place_koraput_005.webp", // Kolab Reservoir & Botanical Garden (Koraput, lake)
  "place_malkangiri_001": "/images/manual/place_malkangiri_001.webp", // Balimela Dam & Hydro Reservoir (Malkangiri, lake)
  "place_malkangiri_003": "/images/manual/place_malkangiri_003.webp", // Ammakunda Natural Pool (Malkangiri, nature)
  "place_med_001": "/images/manual/place_med_001.webp", // All India Institute of Medical Sciences (AIIMS) Bhubaneswar (Khordha, hospital)
  "place_med_004": "/images/manual/place_med_004.webp", // VIMSAR (Veer Surendra Sai Institute of Medical Sciences) (Sambalpur, hospital)
  "place_med_005": "/images/manual/place_med_005.webp", // Capital Hospital Bhubaneswar (Khordha, hospital)
  "place_med_008": "/images/manual/place_med_008.webp", // PRM Medical College & Hospital Baripada (Mayurbhanj, hospital)
  "place_med_010": "/images/manual/place_med_010.webp", // Fakir Mohan Medical College & Hospital (Balasore, hospital)
  "place_nabarangpur_001": "/images/manual/place_nabarangpur_001.webp", // Shahid Minar Papadahandi (Nabarangpur, monument)
  "place_nabarangpur_002": "/images/manual/place_nabarangpur_002.webp", // Chandandhara Waterfall (Nabarangpur, waterfall)
  "place_nayagarh_001": "/images/manual/place_nayagarh_001.webp", // Kantilo Nilamadhaba Temple (Nayagarh, temple)
  "place_nayagarh_002": "/images/manual/place_nayagarh_002.webp", // Sarankul Ladubaba Temple (Nayagarh, temple)
  "place_nayagarh_003": "/images/manual/place_nayagarh_003.webp", // Baisipalli Wildlife Sanctuary (Nayagarh, wildlife)
  "place_nuapada_002": "/images/manual/place_nuapada_002.webp", // Maraguda Valley Archaeological Site (Nuapada, monument)
  "place_rayagada_002": "/images/manual/place_rayagada_002.webp", // Chatikona Waterfall & Hanging Bridge (Rayagada, waterfall)
  "place_subarnapur_001": "/images/manual/place_subarnapur_001.webp", // Maa Sureswari Temple (Sonepur) (Subarnapur, temple)
  "place_transit_001": "/images/manual/place_transit_001.webp", // Biju Patnaik International Airport (BBI) (Khordha, transit_hub)
  "place_transit_004": "/images/manual/place_transit_004.webp", // Bhubaneswar Railway Station (BBS) (Khordha, transit_hub)
  "place_transit_006": "/images/manual/place_transit_006.webp", // Puri Railway Station (PURI) (Puri, transit_hub)
  "place_transit_011": "/images/manual/place_transit_011.webp", // Baramunda Inter State Bus Terminal (ISBT) (Khordha, transit_hub)

  // 3. Phase 3 Recovered Authentic Destinations (Wikimedia Commons Verified)
  "place_med_006": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/M5-Sec-19-Ispat-general-Hospital-1.jpg/960px-M5-Sec-19-Ispat-general-Hospital-1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", // Ispat General Hospital (IGH) (Sundargarh, hospital)
  "place_med_003": "https://upload.wikimedia.org/wikipedia/commons/7/7f/MKCG_Medical_college_Berhampur.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", // MKCG Medical College & Hospital (Ganjam, hospital)
  "place_med_002": "https://upload.wikimedia.org/wikipedia/commons/5/53/Platinum_jubilee_gate_of_scb_medical_2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", // SCB Medical College & Hospital (Cuttack, hospital)
  "place_angul_003": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Rengali_reservoir_Orrisa.jpg/960px-Rengali_reservoir_Orrisa.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", // Rengali Dam & Reservoir (Angul, lake)
  "place_dhenkanal_002": "https://upload.wikimedia.org/wikipedia/commons/d/d7/Mahima_Gadi%2C_Joranda%2C_Dhenkanal._Odisha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Joranda Gadi (Mahima Dharma Seat) (Dhenkanal, monument)
  "place_subarnapur_002": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Ratha_Jatra_at_Patali_Srikhetra%2C_Kotsamalae%2C_Sonepur%2C_Odisha.jpg/960px-Ratha_Jatra_at_Patali_Srikhetra%2C_Kotsamalae%2C_Sonepur%2C_Odisha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", // Patali Srikhetra (Kotsamalai) (Subarnapur, monument)
  "place_jajpur_002": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ratnagiri_-_Odisha_-_001.jpg/960px-Ratnagiri_-_Odisha_-_001.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", // Ratnagiri Buddhist Monastery (Jajpur, monument)
  "place_balangir_003": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Balangir_palace.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Sailashree Palace (Balangir, monument)
  "place_jajpur_003": "https://upload.wikimedia.org/wikipedia/commons/7/78/Udayagiri_Buddhist_Complex_10.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Udayagiri Buddhist Complex (Jajpur, monument)
  "place_keonjhar_004": "https://upload.wikimedia.org/wikipedia/commons/f/f0/Gonasika_Guptaganga_Temple%2C_Gonasika_-_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", // Gonasika (Baitarani Source) (Keonjhar, nature)
  "place_mayurbhanj_003": "https://upload.wikimedia.org/wikipedia/commons/2/22/Intricate_carvings_on_exterior_of_the_Kichakeswari_temple%2C_Khiching%2C_Mayurbhanj%2C_Odisha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Khiching Kichakeswari Temple (Mayurbhanj, temple)
  "place_sambalpur_005": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Ghanteswari_Temple_%2813%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Maa Ghanteswari Temple (Chiplima) (Sambalpur, temple)
  "place_kalahandi_003": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Maa_Manikeswari_Temple%2C_Bhawanipatna.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", // Maa Manikeswari Temple (Bhawanipatna) (Kalahandi, temple)
  "place_subarnapur_003": "https://upload.wikimedia.org/wikipedia/commons/8/88/Subarnameru_Sonepur_Subarnapur_district_Odisha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Subarnameru Temple (Subarnapur, temple)
  "place_transit_012": "https://upload.wikimedia.org/wikipedia/commons/8/8b/360%C2%B0_photo_sphere_of_Badambadi_bus_stand%2C_Cuttack%2C_Odisha.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Badambadi Bus Stand (Cuttack) (Cuttack, transit_hub)
  "place_transit_010": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Balasore_railway_station_in_Baleshwar%2C_Odisha_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Balasore Railway Station (BLS) (Balasore, transit_hub)
  "place_transit_007": "https://upload.wikimedia.org/wikipedia/commons/5/5b/Berhampur_railway_station_in_Ganjam_district%2C_Odisha_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Berhampur Railway Station (BAM) (Ganjam, transit_hub)
  "place_transit_005": "https://upload.wikimedia.org/wikipedia/commons/3/32/Cuttack_Railway_Station.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Cuttack Junction Railway Station (CTC) (Cuttack, transit_hub)
  "place_transit_003": "https://upload.wikimedia.org/wikipedia/commons/0/02/ATC_Tower_Rourkela.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Rourkela Airport (RRK) (Sundargarh, transit_hub)
  "place_transit_009": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Rourkela_Railway_Station.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", // Rourkela Junction Railway Station (ROU) (Sundargarh, transit_hub)
  "place_transit_002": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Jharsuguda_Airport.png/960px-Jharsuguda_Airport.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", // Veer Surendra Sai Airport Jharsuguda (JRG) (Jharsuguda, transit_hub)
  "place_keonjhar_002": "https://upload.wikimedia.org/wikipedia/commons/5/55/Badaghagara_Kendujhar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", // Badaghagara Waterfall (Keonjhar, waterfall)
  "place_gajapati_003": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Elephant_faced_waterfall.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Gandahati Waterfall (Gajapati, waterfall)
  "place_keonjhar_003": "https://upload.wikimedia.org/wikipedia/commons/b/b6/At_the_site_of_khandadhar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Khandadhar Waterfall (Keonjhar) (Keonjhar, waterfall)
  "place_jharsuguda_001": "https://upload.wikimedia.org/wikipedia/commons/d/da/Koilighugar_waterfall.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Koilighugar Waterfall (Jharsuguda, waterfall)
  "place_kalahandi_001": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Phurlijharan.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Phurlijharan Waterfall (Kalahandi, waterfall)
  "place_keonjhar_001": "https://upload.wikimedia.org/wikipedia/commons/e/e9/PXL_20250608_043103853.MP_Sanaghagara_Waterfall_%2C_Keonjhar%2C_Odisha_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", // Sanaghagara Waterfall (Keonjhar, waterfall)
  // 4. Round 2 Eastern Odisha Verified Research Destinations (Audited)
  "round2_east_001": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Olive_ridley_sea_turtle_with_satellite_transmitter_at_Gahirmatha_Beach.jpg", // Gahirmatha Marine Sanctuary (Kendrapara, wildlife)
  "Gahirmatha Marine Sanctuary": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Olive_ridley_sea_turtle_with_satellite_transmitter_at_Gahirmatha_Beach.jpg",
  "round2_east_002": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Hukitola-3.jpg", // Hukitola Monument (Kendrapara, heritage)
  "Hukitola Monument": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Hukitola-3.jpg",
  "round2_east_003": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Kanika_palace.jpg", // Kanika Palace (Kendrapara, heritage)
  "Kanika Palace": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Kanika_palace.jpg",
  "round2_east_004": "https://upload.wikimedia.org/wikipedia/commons/3/38/Aul_Palace.jpg", // Aul Palace (Kendrapara, heritage)
  "Aul Palace": "https://upload.wikimedia.org/wikipedia/commons/3/38/Aul_Palace.jpg",
  "round2_east_005": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Eram_Saheed_Smrutistambha.jpg", // Rakta Tirtha Eram (Bhadrak, heritage)
  "Rakta Tirtha Eram": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Eram_Saheed_Smrutistambha.jpg",
  "round2_east_006": "https://upload.wikimedia.org/wikipedia/commons/6/65/Biranchinarayan_Temple.jpg", // Biranchinarayan Sun Temple, Palia (Bhadrak, temple)
  "Biranchinarayan Sun Temple, Palia": "https://upload.wikimedia.org/wikipedia/commons/6/65/Biranchinarayan_Temple.jpg",
  "round2_east_007": "https://upload.wikimedia.org/wikipedia/commons/e/e7/BhadraKali_Temple_Gate.jpg", // Maa Bhadrakali Temple (Bhadrak, temple)
  "Maa Bhadrakali Temple": "https://upload.wikimedia.org/wikipedia/commons/e/e7/BhadraKali_Temple_Gate.jpg",
  "round2_east_008": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Anantasayana_Basudev_or_Lord_Vishnu_is_sleeping_posture_.This_open_air_relief_is_curved_out_of_stone_on_Brahmani_river_of_Sarang_village_of_Dhenkanal_district_of_Odisha._It%27s_length_is_approx_52_ft_and_was_built_in_9th_century.jpg", // Saranga Anantasayana Vishnu (Dhenkanal, heritage)
  "Saranga Anantasayana Vishnu": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Anantasayana_Basudev_or_Lord_Vishnu_is_sleeping_posture_.This_open_air_relief_is_curved_out_of_stone_on_Brahmani_river_of_Sarang_village_of_Dhenkanal_district_of_Odisha._It%27s_length_is_approx_52_ft_and_was_built_in_9th_century.jpg",
  "round2_east_009": "https://upload.wikimedia.org/wikipedia/commons/3/36/Ramial_Dam_-_Dhenkanal_2018-01-25_9375.JPG", // Dandadhar Dam & Reservoir (Dhenkanal, nature)
  "Dandadhar Dam & Reservoir": "https://upload.wikimedia.org/wikipedia/commons/3/36/Ramial_Dam_-_Dhenkanal_2018-01-25_9375.JPG",
  "round2_east_010": "https://upload.wikimedia.org/wikipedia/commons/6/66/A_Dhokra_cast_being_made_by_a_Dharua_tribal_woman.jpg", // Sadeibereni Dokra Craft Village (Dhenkanal, cultural)
  "Sadeibereni Dokra Craft Village": "https://upload.wikimedia.org/wikipedia/commons/6/66/A_Dhokra_cast_being_made_by_a_Dharua_tribal_woman.jpg",
  "round2_east_011": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Chatia_bata.jpg", // Chhatia Bata (Jajpur, temple)
  "Chhatia Bata": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Chatia_bata.jpg",
  "round2_east_012": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Maha_Binayak_Temple.jpg", // Mahavinayak Temple, Chandikhole (Jajpur, temple)
  "Mahavinayak Temple, Chandikhole": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Maha_Binayak_Temple.jpg",
  "round2_east_015": "https://upload.wikimedia.org/wikipedia/commons/3/38/Deulajhari_Angul.JPG", // Deulajhari Hot Springs (Angul, nature)
  "Deulajhari Hot Springs": "https://upload.wikimedia.org/wikipedia/commons/3/38/Deulajhari_Angul.JPG",
  "round2_east_016": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Talcher_Palace%2C_Angul%2C_Odisha.jpg", // Talcher Palace (Angul, heritage)
  "Talcher Palace": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Talcher_Palace%2C_Angul%2C_Odisha.jpg",
  "round2_east_017": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Lalitgiri_-_Odisha_-_001.jpg", // Lalitgiri Buddhist Complex (Cuttack, heritage)
  "Lalitgiri Buddhist Complex": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Lalitgiri_-_Odisha_-_001.jpg",
  "round2_east_018": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Dhabaleswar_Temple.JPG", // Dhabaleswar Island Temple (Cuttack, temple)
  "Dhabaleswar Island Temple": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Dhabaleswar_Temple.JPG",
  "round2_east_019": "https://upload.wikimedia.org/wikipedia/commons/7/77/A_view_of_the_Ansupa_Lake_from_atop_Saranda_Hill.jpg", // Ansupa Lake (Cuttack, lake)
  "Ansupa Lake": "https://upload.wikimedia.org/wikipedia/commons/7/77/A_view_of_the_Ansupa_Lake_from_atop_Saranda_Hill.jpg",
  "round2_east_020": "https://upload.wikimedia.org/wikipedia/commons/7/71/Bhattarika.JPG", // Bhattarika Temple (Cuttack, temple)
  "Bhattarika Temple": "https://upload.wikimedia.org/wikipedia/commons/7/71/Bhattarika.JPG",
  "round2_east_021": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Handloom_1.jpg", // Nuapatna Handloom Heritage Village (Cuttack, cultural)
  "Nuapatna Handloom Heritage Village": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Handloom_1.jpg",
};

export const MANUAL_IMAGE_OVERRIDES = PLACE_IMAGE_OVERRIDES;

/**
 * Returns a deterministic, high-contrast category SVG placeholder.
 * Guaranteed to never fail network loads or contaminate with unrelated photos.
 */
export function getCategoryFallbackSvg(category?: string, name?: string): string {
  const cat = (category || "").toLowerCase().trim();
  const n = (name || "").toLowerCase().trim();

  // 1. Primary: Check explicit category FIRST
  if (cat) {
    // Temple & Sacred Shrines
    if (
      cat.includes("temple") ||
      cat.includes("sacred") ||
      cat.includes("shrine") ||
      cat.includes("matha") ||
      cat.includes("deula")
    ) {
      return CATEGORY_THEMED_FALLBACKS["temple"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Heritage & Historic Monuments
    if (
      cat.includes("monument") ||
      cat.includes("heritage") ||
      cat.includes("historical") ||
      cat.includes("archaeological") ||
      cat.includes("fort")
    ) {
      return CATEGORY_THEMED_FALLBACKS["monument"]?.src || CATEGORY_THEMED_FALLBACKS["temple"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Waterfalls
    if (cat.includes("waterfall") || cat.includes("cascade")) {
      return CATEGORY_THEMED_FALLBACKS["waterfall"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Beach & Coast
    if (cat.includes("beach") || cat.includes("coastal") || cat.includes("sea")) {
      return CATEGORY_THEMED_FALLBACKS["beach"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Lake & Lagoon / Wetlands
    if (cat.includes("lake") || cat.includes("lagoon") || cat.includes("wetland") || cat.includes("reservoir")) {
      return CATEGORY_THEMED_FALLBACKS["lake"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Wildlife & Biosphere / Sanctuaries
    if (
      cat.includes("wildlife") ||
      cat.includes("sanctuary") ||
      cat.includes("biosphere") ||
      cat.includes("safari")
    ) {
      return CATEGORY_THEMED_FALLBACKS["wildlife"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Nature, Forests & Hills
    if (cat.includes("nature") || cat.includes("forest") || cat.includes("hill") || cat.includes("mountain") || cat.includes("valley") || cat.includes("highland")) {
      return CATEGORY_THEMED_FALLBACKS["nature"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Food, Restaurants, Sweets & Culinary Traditions
    if (
      cat.includes("food") ||
      cat.includes("restaurant") ||
      cat.includes("culinary") ||
      cat.includes("sweet") ||
      cat.includes("dhaba") ||
      cat.includes("cafe") ||
      cat.includes("dining") ||
      cat.includes("bakery") ||
      cat.includes("stall") ||
      cat.includes("highway_stop")
    ) {
      return CATEGORY_THEMED_FALLBACKS["food"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Craft, Handlooms & Shopping / Markets
    if (
      cat.includes("craft") ||
      cat.includes("handloom") ||
      cat.includes("artisan") ||
      cat.includes("market") ||
      cat.includes("bazaar") ||
      cat.includes("shopping") ||
      cat.includes("textile") ||
      cat.includes("mall")
    ) {
      return CATEGORY_THEMED_FALLBACKS["market"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Transit & Public Transport / Mo Bus
    if (
      cat.includes("transit") ||
      cat.includes("bus") ||
      cat.includes("transport") ||
      cat.includes("station") ||
      cat.includes("terminal")
    ) {
      return CATEGORY_THEMED_FALLBACKS["transit"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Parks & Gardens
    if (cat.includes("park") || cat.includes("garden") || cat.includes("botanical")) {
      return CATEGORY_THEMED_FALLBACKS["park"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Museum
    if (cat.includes("museum")) {
      return CATEGORY_THEMED_FALLBACKS["museum"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Planetarium
    if (cat.includes("planetarium")) {
      return CATEGORY_THEMED_FALLBACKS["planetarium"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Science Center
    if (cat.includes("science")) {
      return CATEGORY_THEMED_FALLBACKS["science_center"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }

    // Sports Venue
    if (cat.includes("sports") || cat.includes("stadium")) {
      return CATEGORY_THEMED_FALLBACKS["sports_venue"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
  }

  // 2. Secondary: Inspect Place Name keywords ONLY when category is ambiguous/generic/unmatched
  if (n) {
    // Sacred / Temple
    if (/\b(temple|mandir|deula|matha|shrine|peetha|stupa|monastery)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["temple"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    // Waterfalls
    if (/\b(waterfall|waterfalls|falls|cascade|ghagara|gandahati|pradhanpat|khandadhar|barehipani|joranda|dunduma)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["waterfall"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    // Beach & Coast
    if (/\b(beach|sea|coast|shoreline|chandipur|gopalpur|puri beach|marine drive|talsari|pati sonapur)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["beach"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    // Lakes & Lagoons
    if (/\b(lake|lagoon|chilika|ansupa|tampara|kanjia|reservoir)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["lake"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    // Wildlife & Sanctuaries
    if (/\b(sanctuary|national park|biosphere|tiger reserve|similipal|bhitarkanika|nandankanan|satkosia|khalasuni|hadgarh|kotagarh|baisipalli)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["wildlife"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    // Food & Dining (strict culinary terms, not broad 'hotel')
    if (/\b(restaurant|sweets|sweet stall|rasagola|rasgulla|chhena poda|chhena jhili|dahibara|thali|tiffin|kitchen|dhaba|bhojanalaya|cafe|baking|canteen)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["food"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    // Crafts & Handlooms
    if (/\b(craft|crafts|handloom|handlooms|artisan|pattachitra|applique|weaving|weavers|emporium|boyanika|sambalpuri|ekamra haat|raghurajpur|pipli)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["market"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    // Transit
    if (/\b(bus|crut|terminal|station|transit|depot)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["transit"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    // Parks & Gardens
    if (/\b(garden|gardens|botanical|park)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["park"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    // Museum & Planetarium
    if (/\b(museum|archives|gallery)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["museum"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
    if (/\b(planetarium|science center|science park)\b/i.test(n)) {
      return CATEGORY_THEMED_FALLBACKS["planetarium"]?.src || DEFAULT_FALLBACK_IMAGE.src;
    }
  }

  return DEFAULT_FALLBACK_IMAGE.src;
}

export function resolveDestinationImage(params: {
  id?: string;
  researchId?: string;
  name?: string;
  category?: string;
  apiImageUrl?: string;
  images?: PlaceImageContract[];
}): ImageResolutionResult {
  const { id, researchId, name, category, apiImageUrl, images } = params;

  // 1. Check Manual Overrides strictly by verified researchId, id, or exact place name
  if (researchId && PLACE_IMAGE_OVERRIDES[researchId]) {
    return { src: PLACE_IMAGE_OVERRIDES[researchId], alt: name || "Odisha Destination", sourceType: 'manual_override' };
  }
  if (id && PLACE_IMAGE_OVERRIDES[id]) {
    return { src: PLACE_IMAGE_OVERRIDES[id], alt: name || "Odisha Destination", sourceType: 'manual_override' };
  }
  if (name && PLACE_IMAGE_OVERRIDES[name]) {
    return { src: PLACE_IMAGE_OVERRIDES[name], alt: name, sourceType: 'manual_override' };
  }

  // 2. Check API verified image URL
  if (apiImageUrl && (apiImageUrl.startsWith("http") || apiImageUrl.startsWith("/static/") || apiImageUrl.startsWith("/api/"))) {
    return { src: apiImageUrl, alt: name || "Odisha Destination", sourceType: 'api_verified' };
  }
  if (images && images.length > 0 && images[0]?.url) {
    const candidate = images[0].card_url || images[0].url;
    if (candidate && (candidate.startsWith("http") || candidate.startsWith("/static/") || candidate.startsWith("/api/"))) {
      return { src: candidate, alt: images[0].alt_text || name || "Odisha Destination", sourceType: 'api_verified' };
    }
  }

  // 3. Check 1-to-1 verified image manifest matching by research_id or name in imageService
  const placeLike = {
    id: researchId || id,
    research_id: researchId,
    name: name,
    category: category,
    images: images,
  };
  const resolved = resolvePlaceImage(placeLike, "card");
  if (resolved && resolved.src && !resolved.src.startsWith("data:image/svg+xml") && !resolved.isFallback) {
    return { src: resolved.src, alt: resolved.alt || name || "Odisha Destination", sourceType: 'curated_destination' };
  }

  // 4. Distinct Category-Themed Editorial SVG Fallback
  const fallbackSvg = getCategoryFallbackSvg(category, name);
  if (fallbackSvg !== DEFAULT_FALLBACK_IMAGE.src) {
    return {
      src: fallbackSvg,
      alt: `${name || category || "Odisha"} (Category Sanctuary)`,
      sourceType: 'category_fallback',
    };
  }

  // 5. Neutral Category Fallback SVG
  return {
    src: DEFAULT_FALLBACK_IMAGE.src,
    alt: name ? `${name} (Odisha Sanctuary)` : "Odisha Sanctuary",
    sourceType: 'neutral_fallback',
  };
}
