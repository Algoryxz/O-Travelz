/**
 * Verified Agency-Aware Odisha Transit Network Dataset
 * Distinguishes CRUT / Ama Bus, OSRTC Intercity, Indian Railways (ECoR), and Airports (AAI).
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
  agency?: "CRUT (Capital Region Urban Transport)" | "OSRTC (Odisha State Road Transport Corp)" | "Indian Railways (East Coast Railway)" | "AAI (Airports Authority of India)";
  stop_type?: "bus_stop" | "bus_terminal" | "rail_station" | "airport";
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
  {
    "stop_id": "airport_bbsr_bbi",
    "name": "Biju Patnaik International Airport (BBI)",
    "published_name": "Bhubaneswar Airport (Terminal 1 & 2)",
    "canonical_stop_id": "aai_bbi_airport",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Aerodrome Area, Airport Road",
    "latitude": 20.252,
    "longitude": 85.8178,
    "coordinate_status": "official",
    "agency": "AAI (Airports Authority of India)",
    "stop_type": "airport",
    "routes_serving_stop": [
      {
        "route_id": "rt_10",
        "route_number": "10",
        "route_name": "BBI Airport \u21c4 Nandankanan",
        "service_area": "Capital Region",
        "origin": "Airport",
        "destination": "Nandankanan"
      },
      {
        "route_id": "rt_11",
        "route_number": "11",
        "route_name": "BBI Airport \u21c4 CNBT Cuttack",
        "service_area": "Capital Region",
        "origin": "Airport",
        "destination": "CNBT Cuttack"
      },
      {
        "route_id": "rt_20",
        "route_number": "20",
        "route_name": "BBI Airport \u21c4 Master Canteen \u21c4 Khurda",
        "service_area": "Capital Region",
        "origin": "Airport",
        "destination": "Khurda New Bus Stand"
      }
    ]
  },
  {
    "stop_id": "airport_jharsuguda_jrg",
    "name": "Veer Surendra Sai Airport Jharsuguda (JRG)",
    "published_name": "Jharsuguda Airport",
    "canonical_stop_id": "aai_jrg_airport",
    "city": "Jharsuguda",
    "district": "Jharsuguda",
    "locality": "Durlaga, Airport Road",
    "latitude": 21.914,
    "longitude": 84.05,
    "coordinate_status": "official",
    "agency": "AAI (Airports Authority of India)",
    "stop_type": "airport",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_jrg_rkl",
        "route_number": "OSRTC-JRG-RKL",
        "route_name": "Jharsuguda Airport \u21c4 Rourkela",
        "service_area": "Western Odisha",
        "origin": "Jharsuguda Airport",
        "destination": "Rourkela Bus Stand"
      }
    ]
  },
  {
    "stop_id": "airport_rourkela_rrk",
    "name": "Rourkela Airport (RRK)",
    "published_name": "Rourkela Commercial Airport",
    "canonical_stop_id": "aai_rrk_airport",
    "city": "Rourkela",
    "district": "Sundargarh",
    "locality": "Sector 1, Chhend Colony Road",
    "latitude": 22.256,
    "longitude": 84.815,
    "coordinate_status": "official",
    "agency": "AAI (Airports Authority of India)",
    "stop_type": "airport",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_rkl_100",
        "route_number": "RKL-100",
        "route_name": "Rourkela Airport \u21c4 Rourkela Railway Station",
        "service_area": "Rourkela",
        "origin": "Rourkela Airport",
        "destination": "Railway Station"
      }
    ]
  },
  {
    "stop_id": "rail_bbsr_central",
    "name": "Bhubaneswar Railway Station (BBS)",
    "published_name": "Bhubaneswar Main Railway Station",
    "canonical_stop_id": "ecor_bbs",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Master Canteen, Unit-3",
    "latitude": 20.2662,
    "longitude": 85.8436,
    "coordinate_status": "official",
    "agency": "Indian Railways (East Coast Railway)",
    "stop_type": "rail_station",
    "routes_serving_stop": [
      {
        "route_id": "rt_10",
        "route_number": "10",
        "route_name": "BBI Airport \u21c4 Nandankanan",
        "service_area": "Capital Region",
        "origin": "Airport",
        "destination": "Nandankanan"
      },
      {
        "route_id": "rt_12",
        "route_number": "12",
        "route_name": "Master Canteen \u21c4 Nandankanan via Jaydev Vihar",
        "service_area": "Capital Region",
        "origin": "Master Canteen",
        "destination": "Nandankanan"
      },
      {
        "route_id": "rt_70",
        "route_number": "70",
        "route_name": "Bhubaneswar Rly Stn \u21c4 Puri Shree Mandira",
        "service_area": "Puri Corridor",
        "origin": "Master Canteen",
        "destination": "Puri Jagannath Temple"
      }
    ]
  },
  {
    "stop_id": "rail_cuttack_central",
    "name": "Cuttack Junction Railway Station (CTC)",
    "published_name": "Cuttack Railway Station",
    "canonical_stop_id": "ecor_ctc",
    "city": "Cuttack",
    "district": "Cuttack",
    "locality": "Station Bazar, College Square",
    "latitude": 20.4638,
    "longitude": 85.8942,
    "coordinate_status": "official",
    "agency": "Indian Railways (East Coast Railway)",
    "stop_type": "rail_station",
    "routes_serving_stop": [
      {
        "route_id": "rt_11",
        "route_number": "11",
        "route_name": "CNBT Cuttack \u21c4 BBI Airport",
        "service_area": "Capital Region",
        "origin": "CNBT Cuttack",
        "destination": "Airport"
      }
    ]
  },
  {
    "stop_id": "rail_puri_central",
    "name": "Puri Railway Station (PURI)",
    "published_name": "Puri Terminus Railway Station",
    "canonical_stop_id": "ecor_puri",
    "city": "Puri",
    "district": "Puri",
    "locality": "Station Road, Jagannath Dham",
    "latitude": 19.813,
    "longitude": 85.839,
    "coordinate_status": "official",
    "agency": "Indian Railways (East Coast Railway)",
    "stop_type": "rail_station",
    "routes_serving_stop": [
      {
        "route_id": "rt_70",
        "route_number": "70",
        "route_name": "Puri Railway Station \u21c4 Shree Mandira \u21c4 Bhubaneswar",
        "service_area": "Puri Corridor",
        "origin": "Bhubaneswar",
        "destination": "Puri"
      }
    ]
  },
  {
    "stop_id": "rail_berhampur_bam",
    "name": "Berhampur Railway Station (BAM)",
    "published_name": "Brahmapur Railway Station",
    "canonical_stop_id": "ecor_bam",
    "city": "Berhampur",
    "district": "Ganjam",
    "locality": "Station Road, Old Berhampur",
    "latitude": 19.317,
    "longitude": 84.793,
    "coordinate_status": "official",
    "agency": "Indian Railways (East Coast Railway)",
    "stop_type": "rail_station",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_bam_300",
        "route_number": "300",
        "route_name": "Berhampur Railway Station \u21c4 Gopalpur Sea Beach",
        "service_area": "Berhampur",
        "origin": "Railway Station",
        "destination": "Gopalpur"
      }
    ]
  },
  {
    "stop_id": "rail_sambalpur_sbp",
    "name": "Sambalpur Junction Railway Station (SBP)",
    "published_name": "Sambalpur Main Junction",
    "canonical_stop_id": "ecor_sbp",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Khetrajpur, Sambalpur",
    "latitude": 21.488,
    "longitude": 83.955,
    "coordinate_status": "official",
    "agency": "Indian Railways (East Coast Railway)",
    "stop_type": "rail_station",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_sbp_200",
        "route_number": "200",
        "route_name": "Sambalpur Rly Stn \u21c4 Burla VIMSAR",
        "service_area": "Sambalpur",
        "origin": "Sambalpur Rly Stn",
        "destination": "Burla VIMSAR"
      }
    ]
  },
  {
    "stop_id": "rail_rourkela_rou",
    "name": "Rourkela Junction Railway Station (ROU)",
    "published_name": "Rourkela Main Railway Station",
    "canonical_stop_id": "ecor_rou",
    "city": "Rourkela",
    "district": "Sundargarh",
    "locality": "Station Road, Bisra Square",
    "latitude": 22.2505,
    "longitude": 84.8565,
    "coordinate_status": "official",
    "agency": "Indian Railways (East Coast Railway)",
    "stop_type": "rail_station",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_rkl_101",
        "route_number": "RKL-101",
        "route_name": "Rourkela Railway Stn \u21c4 Panposh \u21c4 NIT",
        "service_area": "Rourkela",
        "origin": "Railway Station",
        "destination": "NIT Rourkela"
      }
    ]
  },
  {
    "stop_id": "rail_balasore_bls",
    "name": "Balasore Railway Station (BLS)",
    "published_name": "Balasore Central Railway Station",
    "canonical_stop_id": "ecor_bls",
    "city": "Balasore",
    "district": "Balasore",
    "locality": "Station Road, Balasore Town",
    "latitude": 21.498,
    "longitude": 86.929,
    "coordinate_status": "official",
    "agency": "Indian Railways (East Coast Railway)",
    "stop_type": "rail_station",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_bls_cdp",
        "route_number": "OSRTC-BLS-CDP",
        "route_name": "Balasore Rly Stn \u21c4 Chandipur Sea Beach",
        "service_area": "Balasore",
        "origin": "Railway Station",
        "destination": "Chandipur Beach"
      }
    ]
  },
  {
    "stop_id": "rail_rayagada_rgda",
    "name": "Rayagada Railway Station (RGDA)",
    "published_name": "Rayagada Junction Railway Station",
    "canonical_stop_id": "ecor_rgda",
    "city": "Rayagada",
    "district": "Rayagada",
    "locality": "Station Road, Rayagada",
    "latitude": 19.164,
    "longitude": 83.421,
    "coordinate_status": "official",
    "agency": "Indian Railways (East Coast Railway)",
    "stop_type": "rail_station",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_rgda_krpu",
        "route_number": "OSRTC-RGDA-KRPU",
        "route_name": "Rayagada Rly Stn \u21c4 Koraput Bus Terminal",
        "service_area": "KBK Region",
        "origin": "Rayagada",
        "destination": "Koraput"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_angul",
    "name": "OSRTC Central Bus Stand Angul",
    "published_name": "Angul Central Bus Terminal (Angul)",
    "canonical_stop_id": "osrtc_angul_isbt",
    "city": "Angul",
    "district": "Angul",
    "locality": "Bus Stand Complex, Angul",
    "latitude": 20.8395,
    "longitude": 85.10520000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_angul_bbsr",
        "route_number": "OSRTC-ANG-BBS",
        "route_name": "Angul \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Angul Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_balangir",
    "name": "OSRTC Central Bus Stand Balangir",
    "published_name": "Balangir Central Bus Terminal (Balangir)",
    "canonical_stop_id": "osrtc_balangir_isbt",
    "city": "Balangir",
    "district": "Balangir",
    "locality": "Bus Stand Complex, Balangir",
    "latitude": 20.7135,
    "longitude": 83.49000000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_balangir_bbsr",
        "route_number": "OSRTC-BAL-BBS",
        "route_name": "Balangir \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Balangir Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_balasore",
    "name": "OSRTC Central Bus Stand Balasore",
    "published_name": "Balasore Central Bus Terminal (Balasore)",
    "canonical_stop_id": "osrtc_balasore_isbt",
    "city": "Balasore",
    "district": "Balasore",
    "locality": "Bus Stand Complex, Balasore",
    "latitude": 21.497,
    "longitude": 86.929,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_balasore_bbsr",
        "route_number": "OSRTC-BAL-BBS",
        "route_name": "Balasore \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Balasore Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_bargarh",
    "name": "OSRTC Central Bus Stand Bargarh",
    "published_name": "Bargarh Central Bus Terminal (Bargarh)",
    "canonical_stop_id": "osrtc_bargarh_isbt",
    "city": "Bargarh",
    "district": "Bargarh",
    "locality": "Bus Stand Complex, Bargarh",
    "latitude": 21.332,
    "longitude": 83.622,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_bargarh_bbsr",
        "route_number": "OSRTC-BAR-BBS",
        "route_name": "Bargarh \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Bargarh Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_bhadrak",
    "name": "OSRTC Central Bus Stand Bhadrak",
    "published_name": "Bhadrak Central Bus Terminal (Bhadrak)",
    "canonical_stop_id": "osrtc_bhadrak_isbt",
    "city": "Bhadrak",
    "district": "Bhadrak",
    "locality": "Bus Stand Complex, Bhadrak",
    "latitude": 21.055,
    "longitude": 86.51700000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_bhadrak_bbsr",
        "route_number": "OSRTC-BHA-BBS",
        "route_name": "Bhadrak \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Bhadrak Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_boudh",
    "name": "OSRTC Central Bus Stand Boudh",
    "published_name": "Boudh Central Bus Terminal (Boudh)",
    "canonical_stop_id": "osrtc_boudh_isbt",
    "city": "Boudh",
    "district": "Boudh",
    "locality": "Bus Stand Complex, Boudh",
    "latitude": 20.837,
    "longitude": 84.328,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_boudh_bbsr",
        "route_number": "OSRTC-BOU-BBS",
        "route_name": "Boudh \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Boudh Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_cuttack",
    "name": "OSRTC Central Bus Stand Cuttack",
    "published_name": "Cuttack Central Bus Terminal (Cuttack)",
    "canonical_stop_id": "osrtc_cuttack_isbt",
    "city": "Cuttack",
    "district": "Cuttack",
    "locality": "Bus Stand Complex, Cuttack",
    "latitude": 20.464000000000002,
    "longitude": 85.88300000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_cuttack_bbsr",
        "route_number": "OSRTC-CUT-BBS",
        "route_name": "Cuttack \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Cuttack Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_deogarh",
    "name": "OSRTC Central Bus Stand Deogarh",
    "published_name": "Deogarh Central Bus Terminal (Deogarh)",
    "canonical_stop_id": "osrtc_deogarh_isbt",
    "city": "Deogarh",
    "district": "Deogarh",
    "locality": "Bus Stand Complex, Deogarh",
    "latitude": 21.535,
    "longitude": 84.736,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_deogarh_bbsr",
        "route_number": "OSRTC-DEO-BBS",
        "route_name": "Deogarh \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Deogarh Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_dhenkanal",
    "name": "OSRTC Central Bus Stand Dhenkanal",
    "published_name": "Dhenkanal Central Bus Terminal (Dhenkanal)",
    "canonical_stop_id": "osrtc_dhenkanal_isbt",
    "city": "Dhenkanal",
    "district": "Dhenkanal",
    "locality": "Bus Stand Complex, Dhenkanal",
    "latitude": 20.666,
    "longitude": 85.60000000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_dhenkanal_bbsr",
        "route_number": "OSRTC-DHE-BBS",
        "route_name": "Dhenkanal \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Dhenkanal Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_gajapati",
    "name": "OSRTC Central Bus Stand Paralakhemundi",
    "published_name": "Paralakhemundi Central Bus Terminal (Gajapati)",
    "canonical_stop_id": "osrtc_gajapati_isbt",
    "city": "Paralakhemundi",
    "district": "Gajapati",
    "locality": "Bus Stand Complex, Paralakhemundi",
    "latitude": 18.776,
    "longitude": 84.096,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_gajapati_bbsr",
        "route_number": "OSRTC-PAR-BBS",
        "route_name": "Paralakhemundi \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Paralakhemundi Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_ganjam",
    "name": "OSRTC Central Bus Stand Berhampur",
    "published_name": "Berhampur Central Bus Terminal (Ganjam)",
    "canonical_stop_id": "osrtc_ganjam_isbt",
    "city": "Berhampur",
    "district": "Ganjam",
    "locality": "Bus Stand Complex, Berhampur",
    "latitude": 19.315,
    "longitude": 84.802,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_ganjam_bbsr",
        "route_number": "OSRTC-BER-BBS",
        "route_name": "Berhampur \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Berhampur Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_jagatsinghpur",
    "name": "OSRTC Central Bus Stand Jagatsinghpur",
    "published_name": "Jagatsinghpur Central Bus Terminal (Jagatsinghpur)",
    "canonical_stop_id": "osrtc_jagatsinghpur_isbt",
    "city": "Jagatsinghpur",
    "district": "Jagatsinghpur",
    "locality": "Bus Stand Complex, Jagatsinghpur",
    "latitude": 20.266000000000002,
    "longitude": 86.176,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_jagatsinghpur_bbsr",
        "route_number": "OSRTC-JAG-BBS",
        "route_name": "Jagatsinghpur \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Jagatsinghpur Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_jajpur",
    "name": "OSRTC Central Bus Stand Jajpur",
    "published_name": "Jajpur Central Bus Terminal (Jajpur)",
    "canonical_stop_id": "osrtc_jajpur_isbt",
    "city": "Jajpur",
    "district": "Jajpur",
    "locality": "Bus Stand Complex, Jajpur",
    "latitude": 20.85,
    "longitude": 86.339,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_jajpur_bbsr",
        "route_number": "OSRTC-JAJ-BBS",
        "route_name": "Jajpur \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Jajpur Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_jharsuguda",
    "name": "OSRTC Central Bus Stand Jharsuguda",
    "published_name": "Jharsuguda Central Bus Terminal (Jharsuguda)",
    "canonical_stop_id": "osrtc_jharsuguda_isbt",
    "city": "Jharsuguda",
    "district": "Jharsuguda",
    "locality": "Bus Stand Complex, Jharsuguda",
    "latitude": 21.860000000000003,
    "longitude": 84.019,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_jharsuguda_bbsr",
        "route_number": "OSRTC-JHA-BBS",
        "route_name": "Jharsuguda \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Jharsuguda Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_kalahandi",
    "name": "OSRTC Central Bus Stand Bhawanipatna",
    "published_name": "Bhawanipatna Central Bus Terminal (Kalahandi)",
    "canonical_stop_id": "osrtc_kalahandi_isbt",
    "city": "Bhawanipatna",
    "district": "Kalahandi",
    "locality": "Bus Stand Complex, Bhawanipatna",
    "latitude": 19.903000000000002,
    "longitude": 83.17200000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_kalahandi_bbsr",
        "route_number": "OSRTC-BHA-BBS",
        "route_name": "Bhawanipatna \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Bhawanipatna Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_kandhamal",
    "name": "OSRTC Central Bus Stand Phulbani",
    "published_name": "Phulbani Central Bus Terminal (Kandhamal)",
    "canonical_stop_id": "osrtc_kandhamal_isbt",
    "city": "Phulbani",
    "district": "Kandhamal",
    "locality": "Bus Stand Complex, Phulbani",
    "latitude": 20.476000000000003,
    "longitude": 84.238,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_kandhamal_bbsr",
        "route_number": "OSRTC-PHU-BBS",
        "route_name": "Phulbani \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Phulbani Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_kendrapara",
    "name": "OSRTC Central Bus Stand Kendrapara",
    "published_name": "Kendrapara Central Bus Terminal (Kendrapara)",
    "canonical_stop_id": "osrtc_kendrapara_isbt",
    "city": "Kendrapara",
    "district": "Kendrapara",
    "locality": "Bus Stand Complex, Kendrapara",
    "latitude": 20.503,
    "longitude": 86.429,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_kendrapara_bbsr",
        "route_number": "OSRTC-KEN-BBS",
        "route_name": "Kendrapara \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Kendrapara Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_keonjhar",
    "name": "OSRTC Central Bus Stand Keonjhar",
    "published_name": "Keonjhar Central Bus Terminal (Keonjhar)",
    "canonical_stop_id": "osrtc_keonjhar_isbt",
    "city": "Keonjhar",
    "district": "Keonjhar",
    "locality": "Bus Stand Complex, Keonjhar",
    "latitude": 21.629,
    "longitude": 85.593,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_keonjhar_bbsr",
        "route_number": "OSRTC-KEO-BBS",
        "route_name": "Keonjhar \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Keonjhar Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_khordha",
    "name": "OSRTC Central Bus Stand Bhubaneswar",
    "published_name": "Bhubaneswar Central Bus Terminal (Khordha)",
    "canonical_stop_id": "osrtc_khordha_isbt",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Bus Stand Complex, Bhubaneswar",
    "latitude": 20.265,
    "longitude": 85.845,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_khordha_bbsr",
        "route_number": "OSRTC-BHU-BBS",
        "route_name": "Bhubaneswar \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Bhubaneswar Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_koraput",
    "name": "OSRTC Central Bus Stand Koraput",
    "published_name": "Koraput Central Bus Terminal (Koraput)",
    "canonical_stop_id": "osrtc_koraput_isbt",
    "city": "Koraput",
    "district": "Koraput",
    "locality": "Bus Stand Complex, Koraput",
    "latitude": 18.812,
    "longitude": 82.71600000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_koraput_bbsr",
        "route_number": "OSRTC-KOR-BBS",
        "route_name": "Koraput \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Koraput Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_malkangiri",
    "name": "OSRTC Central Bus Stand Malkangiri",
    "published_name": "Malkangiri Central Bus Terminal (Malkangiri)",
    "canonical_stop_id": "osrtc_malkangiri_isbt",
    "city": "Malkangiri",
    "district": "Malkangiri",
    "locality": "Bus Stand Complex, Malkangiri",
    "latitude": 18.352,
    "longitude": 81.896,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_malkangiri_bbsr",
        "route_number": "OSRTC-MAL-BBS",
        "route_name": "Malkangiri \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Malkangiri Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_mayurbhanj",
    "name": "OSRTC Central Bus Stand Baripada",
    "published_name": "Baripada Central Bus Terminal (Mayurbhanj)",
    "canonical_stop_id": "osrtc_mayurbhanj_isbt",
    "city": "Baripada",
    "district": "Mayurbhanj",
    "locality": "Bus Stand Complex, Baripada",
    "latitude": 21.929000000000002,
    "longitude": 86.73,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_mayurbhanj_bbsr",
        "route_number": "OSRTC-BAR-BBS",
        "route_name": "Baripada \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Baripada Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_nabarangpur",
    "name": "OSRTC Central Bus Stand Nabarangpur",
    "published_name": "Nabarangpur Central Bus Terminal (Nabarangpur)",
    "canonical_stop_id": "osrtc_nabarangpur_isbt",
    "city": "Nabarangpur",
    "district": "Nabarangpur",
    "locality": "Bus Stand Complex, Nabarangpur",
    "latitude": 19.23,
    "longitude": 82.55600000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_nabarangpur_bbsr",
        "route_number": "OSRTC-NAB-BBS",
        "route_name": "Nabarangpur \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Nabarangpur Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_nayagarh",
    "name": "OSRTC Central Bus Stand Nayagarh",
    "published_name": "Nayagarh Central Bus Terminal (Nayagarh)",
    "canonical_stop_id": "osrtc_nayagarh_isbt",
    "city": "Nayagarh",
    "district": "Nayagarh",
    "locality": "Bus Stand Complex, Nayagarh",
    "latitude": 20.126,
    "longitude": 85.10900000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_nayagarh_bbsr",
        "route_number": "OSRTC-NAY-BBS",
        "route_name": "Nayagarh \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Nayagarh Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_nuapada",
    "name": "OSRTC Central Bus Stand Nuapada",
    "published_name": "Nuapada Central Bus Terminal (Nuapada)",
    "canonical_stop_id": "osrtc_nuapada_isbt",
    "city": "Nuapada",
    "district": "Nuapada",
    "locality": "Bus Stand Complex, Nuapada",
    "latitude": 20.830000000000002,
    "longitude": 82.53800000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_nuapada_bbsr",
        "route_number": "OSRTC-NUA-BBS",
        "route_name": "Nuapada \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Nuapada Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_puri",
    "name": "OSRTC Central Bus Stand Puri",
    "published_name": "Puri Central Bus Terminal (Puri)",
    "canonical_stop_id": "osrtc_puri_isbt",
    "city": "Puri",
    "district": "Puri",
    "locality": "Bus Stand Complex, Puri",
    "latitude": 19.806,
    "longitude": 85.827,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_puri_bbsr",
        "route_number": "OSRTC-PUR-BBS",
        "route_name": "Puri \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Puri Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_rayagada",
    "name": "OSRTC Central Bus Stand Rayagada",
    "published_name": "Rayagada Central Bus Terminal (Rayagada)",
    "canonical_stop_id": "osrtc_rayagada_isbt",
    "city": "Rayagada",
    "district": "Rayagada",
    "locality": "Bus Stand Complex, Rayagada",
    "latitude": 19.166,
    "longitude": 83.41900000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_rayagada_bbsr",
        "route_number": "OSRTC-RAY-BBS",
        "route_name": "Rayagada \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Rayagada Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_sambalpur",
    "name": "OSRTC Central Bus Stand Sambalpur",
    "published_name": "Sambalpur Central Bus Terminal (Sambalpur)",
    "canonical_stop_id": "osrtc_sambalpur_isbt",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Bus Stand Complex, Sambalpur",
    "latitude": 21.468,
    "longitude": 83.979,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_sambalpur_bbsr",
        "route_number": "OSRTC-SAM-BBS",
        "route_name": "Sambalpur \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Sambalpur Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_subarnapur",
    "name": "OSRTC Central Bus Stand Sonepur",
    "published_name": "Sonepur Central Bus Terminal (Subarnapur)",
    "canonical_stop_id": "osrtc_subarnapur_isbt",
    "city": "Sonepur",
    "district": "Subarnapur",
    "locality": "Bus Stand Complex, Sonepur",
    "latitude": 20.84,
    "longitude": 83.92500000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_subarnapur_bbsr",
        "route_number": "OSRTC-SON-BBS",
        "route_name": "Sonepur \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Sonepur Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "osrtc_bus_stand_sundargarh",
    "name": "OSRTC Central Bus Stand Rourkela",
    "published_name": "Rourkela Central Bus Terminal (Sundargarh)",
    "canonical_stop_id": "osrtc_sundargarh_isbt",
    "city": "Rourkela",
    "district": "Sundargarh",
    "locality": "Bus Stand Complex, Rourkela",
    "latitude": 22.249000000000002,
    "longitude": 84.85600000000001,
    "coordinate_status": "official",
    "agency": "OSRTC (Odisha State Road Transport Corp)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_osrtc_sundargarh_bbsr",
        "route_number": "OSRTC-ROU-BBS",
        "route_name": "Rourkela \u21c4 Bhubaneswar Baramunda ISBT",
        "service_area": "Intercity Express",
        "origin": "Rourkela Bus Stand",
        "destination": "Baramunda ISBT Bhubaneswar"
      }
    ]
  },
  {
    "stop_id": "crut_stop_baramunda_isbt",
    "name": "Baramunda Inter State Bus Terminal (ISBT)",
    "published_name": "Baramunda ISBT",
    "canonical_stop_id": "crut_baramunda",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "NH-16, Baramunda",
    "latitude": 20.279,
    "longitude": 85.798,
    "coordinate_status": "official",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_10",
        "route_number": "10",
        "route_name": "Airport \u21c4 Nandankanan",
        "service_area": "Capital Region"
      },
      {
        "route_id": "rt_20",
        "route_number": "20",
        "route_name": "Master Canteen \u21c4 Khurda",
        "service_area": "Capital Region"
      }
    ]
  },
  {
    "stop_id": "crut_stop_jaydev_vihar",
    "name": "Jaydev Vihar Square Bus Stop",
    "published_name": "Jaydev Vihar",
    "canonical_stop_id": "crut_jaydev_vihar",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Jaydev Vihar NH-16 Intersection",
    "latitude": 20.301,
    "longitude": 85.823,
    "coordinate_status": "official",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_10",
        "route_number": "10",
        "route_name": "Airport \u21c4 Nandankanan",
        "service_area": "Capital Region"
      },
      {
        "route_id": "rt_12",
        "route_number": "12",
        "route_name": "Master Canteen \u21c4 Nandankanan",
        "service_area": "Capital Region"
      }
    ]
  },
  {
    "stop_id": "crut_stop_nandankanan",
    "name": "Nandankanan Zoological Park Bus Terminal",
    "published_name": "Nandankanan Terminal",
    "canonical_stop_id": "crut_nandankanan",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Nandankanan Main Gate",
    "latitude": 20.398,
    "longitude": 85.824,
    "coordinate_status": "official",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_10",
        "route_number": "10",
        "route_name": "Airport \u21c4 Nandankanan",
        "service_area": "Capital Region"
      },
      {
        "route_id": "rt_12",
        "route_number": "12",
        "route_name": "Master Canteen \u21c4 Nandankanan",
        "service_area": "Capital Region"
      }
    ]
  },
  {
    "stop_id": "crut_stop_cnbt_cuttack",
    "name": "Netaji Central Bus Terminal Cuttack (CNBT)",
    "published_name": "CNBT Khannagar Cuttack",
    "canonical_stop_id": "crut_cnbt_cuttack",
    "city": "Cuttack",
    "district": "Cuttack",
    "locality": "Khannagar Ring Road, Cuttack",
    "latitude": 20.452,
    "longitude": 85.875,
    "coordinate_status": "official",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_11",
        "route_number": "11",
        "route_name": "CNBT Cuttack \u21c4 BBI Airport",
        "service_area": "Capital Region"
      }
    ]
  },
  {
    "stop_id": "crut_stop_shree_mandira_puri",
    "name": "Puri Shree Mandira Parikrama Bus Stop",
    "published_name": "Shree Mandira South Gate Parking",
    "canonical_stop_id": "crut_shree_mandira_puri",
    "city": "Puri",
    "district": "Puri",
    "locality": "Grand Road, South Gate, Puri",
    "latitude": 19.8045,
    "longitude": 85.818,
    "coordinate_status": "official",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_70",
        "route_number": "70",
        "route_name": "Master Canteen \u21c4 Puri Shree Mandira",
        "service_area": "Puri Corridor"
      }
    ]
  }
];

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
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

export function getVerifiedStaticNearbyStops(
  lat: number,
  lon: number,
  radiusMeters: number = 35000,
  limit: number = 5
): NearbyStopResponse[] {
  return VERIFIED_TRANSIT_STOPS.map((stop) => {
    const dist = calculateDistanceMeters(lat, lon, stop.latitude, stop.longitude);
    return {
      stop_id: stop.stop_id,
      name: stop.name,
      published_name: stop.published_name,
      canonical_stop_id: stop.canonical_stop_id,
      city: stop.city,
      distance_m: Math.round(dist),
      walking_estimate_mins: Math.ceil(dist / 80),
      latitude: stop.latitude,
      longitude: stop.longitude,
      coordinate_status: stop.coordinate_status,
      region: stop.district,
      routes_serving_stop: stop.routes_serving_stop.map((r, idx) => ({
        route_id: r.route_id,
        route_number: r.route_number,
        route_name: r.route_name ?? null,
        sequence_order: r.sequence_order ?? (idx + 1),
        service_area: r.service_area ?? null,
        origin: r.origin ?? null,
        destination: r.destination ?? null,
      })),
    };
  })
    .filter((s) => s.distance_m <= radiusMeters)
    .sort((a, b) => a.distance_m - b.distance_m)
    .slice(0, limit);
}
