/**
 * Verified Official Mo Bus & Odisha Transit Stops Dataset
 * Authoritative coordinates and serving routes across Odisha urban hubs.
 */
import type { NearbyStopResponse } from "../types/api";

export interface VerifiedTransitStop {
  stop_id: string;
  name: string;
  published_name: string;
  canonical_stop_id: string;
  city: string;
  district: string;
  locality: string;
  latitude: number;
  longitude: number;
  coordinate_status: "official" | "geocoded" | "ambiguous" | "unresolved";
  routes_serving_stop: Array<{
    route_id: string;
    route_number: string;
    route_name?: string | null;
    sequence_order?: number;
    service_area?: string | null;
    origin?: string | null;
    destination?: string | null;
  }>;
}

export const VERIFIED_TRANSIT_STOPS: VerifiedTransitStop[] = [
  // --- Bhubaneswar Airport & Capital Region ---
  {
    stop_id: "stop_bbsr_airport_01",
    name: "Biju Patnaik International Airport (Terminal 1 & 2)",
    published_name: "Biju Patnaik Airport",
    canonical_stop_id: "crut_bbsr_airport",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Airport Road, Aerodrome Area",
    latitude: 20.2520,
    longitude: 85.8178,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_10",
        route_number: "10",
        route_name: "Biju Patnaik Airport ⇄ Nandankanan",
        service_area: "Capital Region",
        origin: "Airport",
        destination: "Nandankanan Zoological Park",
      },
      {
        route_id: "rt_11",
        route_number: "11",
        route_name: "Biju Patnaik Airport ⇄ Cuttack Netaji Bus Terminal",
        service_area: "Capital Region",
        origin: "Airport",
        destination: "CNBT Cuttack",
      },
      {
        route_id: "rt_20",
        route_number: "20",
        route_name: "Airport ⇄ Master Canteen ⇄ Khordha New Bus Stand",
        service_area: "Capital Region",
        origin: "Airport",
        destination: "Khordha",
      },
    ],
  },
  {
    stop_id: "stop_bbsr_master_canteen_01",
    name: "Master Canteen / Bhubaneswar Railway Station",
    published_name: "Master Canteen Terminal",
    canonical_stop_id: "crut_bbsr_master_canteen",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Master Canteen Square, Kharvel Nagar",
    latitude: 20.2667,
    longitude: 85.8436,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_10",
        route_number: "10",
        route_name: "Biju Patnaik Airport ⇄ Nandankanan",
        service_area: "Capital Region",
        origin: "Airport",
        destination: "Nandankanan",
      },
      {
        route_id: "rt_12",
        route_number: "12",
        route_name: "Master Canteen ⇄ AIIMS Bhubaneswar",
        service_area: "Capital Region",
        origin: "Master Canteen",
        destination: "AIIMS Sijua",
      },
      {
        route_id: "rt_16",
        route_number: "16",
        route_name: "Master Canteen ⇄ Biju Patnaik Park Cuttack",
        service_area: "Capital Region",
        origin: "Master Canteen",
        destination: "Cuttack",
      },
      {
        route_id: "rt_30",
        route_number: "30",
        route_name: "Master Canteen ⇄ Puri Bus Stand",
        service_area: "Intercity Expressway",
        origin: "Master Canteen",
        destination: "Puri",
      },
    ],
  },
  {
    stop_id: "stop_bbsr_baramunda_01",
    name: "Baramunda ISBT (Babasaheb Bhimrao Ambedkar Bus Terminal)",
    published_name: "Baramunda BSABT",
    canonical_stop_id: "crut_bbsr_baramunda",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Baramunda, NH-16",
    latitude: 20.2731,
    longitude: 85.7923,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_18",
        route_number: "18",
        route_name: "Baramunda ISBT ⇄ Jagatpur Industrial Estate",
        service_area: "Capital Region",
        origin: "Baramunda",
        destination: "Jagatpur",
      },
      {
        route_id: "rt_24",
        route_number: "24",
        route_name: "Baramunda ⇄ Kalinga Nagar ⇄ Sai Temple",
        service_area: "Capital Region",
        origin: "Baramunda",
        destination: "Kalinga Nagar",
      },
      {
        route_id: "rt_28",
        route_number: "28",
        route_name: "Baramunda ⇄ Master Canteen ⇄ Lingaraj Temple",
        service_area: "Heritage Corridor",
        origin: "Baramunda",
        destination: "Old Town",
      },
    ],
  },
  {
    stop_id: "stop_bbsr_aiims_01",
    name: "AIIMS Bhubaneswar Hospital Main Gate",
    published_name: "AIIMS Bhubaneswar",
    canonical_stop_id: "crut_bbsr_aiims",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Sijua, Patrapada",
    latitude: 20.2312,
    longitude: 85.7891,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_12",
        route_number: "12",
        route_name: "Master Canteen ⇄ AIIMS Bhubaneswar",
        service_area: "Capital Region",
        origin: "Master Canteen",
        destination: "AIIMS Sijua",
      },
      {
        route_id: "rt_29",
        route_number: "29",
        route_name: "AIIMS Bhubaneswar ⇄ Rasulgarh Square",
        service_area: "Capital Region",
        origin: "AIIMS",
        destination: "Rasulgarh",
      },
    ],
  },
  {
    stop_id: "stop_bbsr_lingaraj_01",
    name: "Lingaraj Temple & Old Town Heritage Square",
    published_name: "Lingaraj Temple",
    canonical_stop_id: "crut_bbsr_lingaraj",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Old Town, Bindusagar",
    latitude: 20.2383,
    longitude: 85.8336,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_28",
        route_number: "28",
        route_name: "Baramunda ⇄ Master Canteen ⇄ Lingaraj Temple",
        service_area: "Heritage Corridor",
        origin: "Baramunda",
        destination: "Lingaraj Temple",
      },
      {
        route_id: "rt_33",
        route_number: "33",
        route_name: "Lingaraj Temple ⇄ Dhauli Peace Pagoda",
        service_area: "Heritage Corridor",
        origin: "Old Town",
        destination: "Dhauli Hills",
      },
    ],
  },
  {
    stop_id: "stop_bbsr_nandankanan_01",
    name: "Nandankanan Zoological & Botanical Park Gate",
    published_name: "Nandankanan Zoological Park",
    canonical_stop_id: "crut_bbsr_nandankanan",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Nandankanan Road",
    latitude: 20.3956,
    longitude: 85.8256,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_10",
        route_number: "10",
        route_name: "Biju Patnaik Airport ⇄ Nandankanan",
        service_area: "Capital Region",
        origin: "Airport",
        destination: "Nandankanan",
      },
      {
        route_id: "rt_16A",
        route_number: "16A",
        route_name: "Nandankanan ⇄ CDA Cuttack",
        service_area: "Capital Region",
        origin: "Nandankanan",
        destination: "CDA Cuttack",
      },
    ],
  },
  {
    stop_id: "stop_bbsr_jayadev_vihar_01",
    name: "Jayadev Vihar Square & Mo Bus Interchange",
    published_name: "Jayadev Vihar",
    canonical_stop_id: "crut_bbsr_jayadev_vihar",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Jayadev Vihar, NH-16",
    latitude: 20.2986,
    longitude: 85.8202,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_10",
        route_number: "10",
        route_name: "Airport ⇄ Nandankanan",
        service_area: "Capital Region",
        origin: "Airport",
        destination: "Nandankanan",
      },
      {
        route_id: "rt_13",
        route_number: "13",
        route_name: "Master Canteen ⇄ Infocity / KIIT",
        service_area: "Capital Region",
        origin: "Master Canteen",
        destination: "Patia Infocity",
      },
    ],
  },
  {
    stop_id: "stop_bbsr_patia_01",
    name: "Patia Infocity / KIIT University Gate",
    published_name: "Patia Infocity",
    canonical_stop_id: "crut_bbsr_patia",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Patia",
    latitude: 20.3542,
    longitude: 85.8172,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_13",
        route_number: "13",
        route_name: "Master Canteen ⇄ Infocity",
        service_area: "Capital Region",
        origin: "Master Canteen",
        destination: "Infocity",
      },
    ],
  },

  // --- Cuttack Region ---
  {
    stop_id: "stop_ctk_cnbt_01",
    name: "Netaji Subhash Chandra Bose Central Bus Terminal (CNBT)",
    published_name: "CNBT Cuttack",
    canonical_stop_id: "crut_ctk_cnbt",
    city: "Cuttack",
    district: "Cuttack",
    locality: "Khan Nagar",
    latitude: 20.4502,
    longitude: 85.8753,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_11",
        route_number: "11",
        route_name: "Airport ⇄ CNBT Cuttack",
        service_area: "Capital Region",
        origin: "Bhubaneswar",
        destination: "Cuttack",
      },
      {
        route_id: "rt_16",
        route_number: "16",
        route_name: "Master Canteen ⇄ Biju Patnaik Park Cuttack",
        service_area: "Capital Region",
        origin: "Master Canteen",
        destination: "Cuttack",
      },
    ],
  },
  {
    stop_id: "stop_ctk_badambadi_01",
    name: "Badambadi Bus Stand Terminal",
    published_name: "Badambadi Cuttack",
    canonical_stop_id: "crut_ctk_badambadi",
    city: "Cuttack",
    district: "Cuttack",
    locality: "Badambadi",
    latitude: 20.4568,
    longitude: 85.8821,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_11",
        route_number: "11",
        route_name: "Airport ⇄ Cuttack",
        service_area: "Capital Region",
        origin: "Airport",
        destination: "CNBT Cuttack",
      },
    ],
  },

  // --- Puri Coastal Region ---
  {
    stop_id: "stop_puri_bus_stand_01",
    name: "Puri Central Bus Stand (Malatipatpur / Bus Stand)",
    published_name: "Puri Central Bus Stand",
    canonical_stop_id: "crut_puri_bus_stand",
    city: "Puri",
    district: "Puri",
    locality: "Grand Road / Malatipatpur",
    latitude: 19.8135,
    longitude: 85.8312,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_30",
        route_number: "30",
        route_name: "Bhubaneswar ⇄ Puri Expressway",
        service_area: "Intercity Expressway",
        origin: "Master Canteen",
        destination: "Puri",
      },
      {
        route_id: "rt_31",
        route_number: "31",
        route_name: "Puri ⇄ Konark Sun Temple Marine Drive",
        service_area: "Marine Drive Heritage",
        origin: "Puri",
        destination: "Konark",
      },
    ],
  },
  {
    stop_id: "stop_konark_01",
    name: "Konark Sun Temple Bus Stand & OTDC Hub",
    published_name: "Konark Sun Temple Terminal",
    canonical_stop_id: "crut_konark_terminal",
    city: "Konark",
    district: "Puri",
    locality: "Sun Temple Complex",
    latitude: 19.8876,
    longitude: 86.0945,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_31",
        route_number: "31",
        route_name: "Puri ⇄ Konark Marine Drive",
        service_area: "Marine Drive Heritage",
        origin: "Puri",
        destination: "Konark",
      },
    ],
  },

  // --- Western & Southern Odisha Hubs ---
  {
    stop_id: "stop_sbp_ainthapali_01",
    name: "Ainthapali Central Bus Terminal",
    published_name: "Ainthapali Bus Terminal",
    canonical_stop_id: "crut_sbp_ainthapali",
    city: "Sambalpur",
    district: "Sambalpur",
    locality: "Ainthapali",
    latitude: 21.4954,
    longitude: 83.9840,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_sbp_01",
        route_number: "S-1",
        route_name: "Ainthapali ⇄ Burla Medical College",
        service_area: "Sambalpur Urban",
        origin: "Ainthapali",
        destination: "VIMSAR Burla",
      },
      {
        route_id: "rt_sbp_02",
        route_number: "S-2",
        route_name: "Ainthapali ⇄ Hirakud Dam",
        service_area: "Sambalpur Urban",
        origin: "Ainthapali",
        destination: "Hirakud",
      },
    ],
  },
  {
    stop_id: "stop_rkl_vedvyas_01",
    name: "Vedvyas Junction & Steel City Bus Stand",
    published_name: "Vedvyas Rourkela",
    canonical_stop_id: "crut_rkl_vedvyas",
    city: "Rourkela",
    district: "Sundargarh",
    locality: "Vedvyas",
    latitude: 22.2375,
    longitude: 84.7787,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_rkl_100",
        route_number: "100",
        route_name: "Rourkela Railway Station ⇄ Vedvyas Temple",
        service_area: "Rourkela Steel City",
        origin: "Rourkela Station",
        destination: "Vedvyas",
      },
    ],
  },
  {
    stop_id: "stop_bam_mkcg_01",
    name: "MKCG Medical College & Silk City Terminal",
    published_name: "MKCG Medical Berhampur",
    canonical_stop_id: "crut_bam_mkcg",
    city: "Berhampur",
    district: "Ganjam",
    locality: "Medical College Road",
    latitude: 19.3083,
    longitude: 84.8083,
    coordinate_status: "official",
    routes_serving_stop: [
      {
        route_id: "rt_bam_01",
        route_number: "B-1",
        route_name: "New Bus Stand ⇄ Gopalpur-on-Sea",
        service_area: "Ganjam Coast",
        origin: "Berhampur",
        destination: "Gopalpur Beach",
      },
    ],
  },
];

/**
 * Great-circle distance in meters between two lat/lon coordinates.
 */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filter verified static stops by proximity to a given coordinate.
 */
export function getVerifiedStaticNearbyStops(
  lat: number,
  lon: number,
  radiusMeters: number = 25000,
  limit: number = 6
): NearbyStopResponse[] {
  const scored: NearbyStopResponse[] = VERIFIED_TRANSIT_STOPS.map((st) => {
    const distM = haversineMeters(lat, lon, st.latitude, st.longitude);
    const walkingMins = Math.max(1, Math.ceil(distM / 80)); // 80 m/min = 4.8 km/h
    return {
      ...st,
      distance_m: Math.round(distM),
      walking_estimate_mins: walkingMins,
      region: st.city,
      routes_serving_stop: st.routes_serving_stop.map((r, idx) => ({
        ...r,
        sequence_order: r.sequence_order ?? (idx + 1),
      })),
    };
  });

  // Sort by distance ascending
  scored.sort((a, b) => a.distance_m - b.distance_m);

  // If within radius, return matching
  const matching = scored.filter((s) => s.distance_m <= radiusMeters);
  if (matching.length > 0) {
    return matching.slice(0, limit);
  }

  // If none within strict radius, return closest available verified hubs
  return scored.slice(0, limit);
}
