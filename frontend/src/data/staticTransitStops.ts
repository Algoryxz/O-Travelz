// AUTO-GENERATED FROM data/transport/canonical/
// DO NOT EDIT MANUALLY.
// Run: python scripts/generate_frontend_transit_data.py

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
  coordinate_source?: string;
  agency?: "CRUT (Capital Region Urban Transport)" | "OSRTC (Odisha State Road Transport Corp)" | "Indian Railways (East Coast Railway)" | "AAI (Airports Authority of India)";
  stop_type?: "bus_stop" | "bus_terminal" | "rail_station" | "airport";
  routes_serving_stop: Array<{
    route_id: string;
    route_number: string;
    route_name?: string | null;
    sequence_order: number;
    service_area?: string | null;
    origin?: string | null;
    destination?: string | null;
  }>;
}

export const VERIFIED_TRANSIT_STOPS: VerifiedTransitStop[] = [
  {
    "stop_id": "stop_crut_berhampur_berhampur",
    "name": "Berhampur",
    "published_name": "BERHAMPUR",
    "canonical_stop_id": "stop_crut_berhampur_berhampur",
    "city": "Berhampur",
    "district": "Ganjam",
    "locality": "Berhampur",
    "latitude": 19.315,
    "longitude": 84.802,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_303",
        "route_number": "303",
        "route_name": "Duduma Colony Bus Stand \u2013 Gopalpur Bus Stand (Via- Amba market, gandhi nagar, Courtpeta",
        "sequence_order": 6,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_berhampur_railway",
    "name": "Berhampur Railway",
    "published_name": "BERHAMPUR RAILWAY",
    "canonical_stop_id": "stop_crut_berhampur_berhampur_railway",
    "city": "Berhampur",
    "district": "Ganjam",
    "locality": "Berhampur",
    "latitude": 19.317,
    "longitude": 84.793,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_302",
        "route_number": "302",
        "route_name": "Berhampur Railway Station \u2013 Regidi",
        "sequence_order": 28,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_304",
        "route_number": "304",
        "route_name": "Berhampur Railway Station -D.patapur",
        "sequence_order": 37,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_berhampur_railway_station",
    "name": "Berhampur Railway Station",
    "published_name": "BERHAMPUR RAILWAY STATION",
    "canonical_stop_id": "stop_crut_berhampur_berhampur_railway_station",
    "city": "Berhampur",
    "district": "Ganjam",
    "locality": "Berhampur",
    "latitude": 19.317,
    "longitude": 84.793,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_300",
        "route_number": "300",
        "route_name": "NIST college - Duduma Colony Bus stand",
        "sequence_order": 20,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_301",
        "route_number": "301",
        "route_name": "Berhampur Rail Stn. - Parala maharaja college (Via- MKCG Medical, Engineering",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_302",
        "route_number": "302",
        "route_name": "Berhampur Railway Station \u2013 Regidi",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_304",
        "route_number": "304",
        "route_name": "Berhampur Railway Station -D.patapur",
        "sequence_order": 58,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_304e",
        "route_number": "304E",
        "route_name": "Berhampur Railway Station - Ralaba",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_306",
        "route_number": "306",
        "route_name": "Mahatma Gandhi Stadium - Sonapur beach (Via- Railway Station,Haldiapadar New Bus Stand,Kanisi Hata,Sidhha",
        "sequence_order": 37,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_brahmapur_railway_station",
    "name": "Brahmapur Railway Station",
    "published_name": "BRAHMAPUR RAILWAY STATION",
    "canonical_stop_id": "stop_crut_berhampur_brahmapur_railway_station",
    "city": "Berhampur",
    "district": "Ganjam",
    "locality": "Berhampur",
    "latitude": 19.317,
    "longitude": 84.793,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_302",
        "route_number": "302",
        "route_name": "Berhampur Railway Station \u2013 Regidi",
        "sequence_order": 50,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_chowk_berhampur",
    "name": "Chowk Berhampur",
    "published_name": "CHOWK BERHAMPUR",
    "canonical_stop_id": "stop_crut_berhampur_chowk_berhampur",
    "city": "Berhampur",
    "district": "Ganjam",
    "locality": "Berhampur",
    "latitude": 19.315,
    "longitude": 84.802,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_berhampur_college",
    "name": "College",
    "published_name": "COLLEGE",
    "canonical_stop_id": "stop_crut_berhampur_college",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.307477,
    "longitude": 84.794415,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_berhampur_college_chaka",
    "name": "College Chaka",
    "published_name": "COLLEGE CHAKA",
    "canonical_stop_id": "stop_crut_berhampur_college_chaka",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.307477,
    "longitude": 84.794415,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_berhampur_gandhi_nagar",
    "name": "Gandhi Nagar",
    "published_name": "GANDHI NAGAR",
    "canonical_stop_id": "stop_crut_berhampur_gandhi_nagar",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.308028,
    "longitude": 84.788706,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_300",
        "route_number": "300",
        "route_name": "NIST college - Duduma Colony Bus stand",
        "sequence_order": 15,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_303",
        "route_number": "303",
        "route_name": "Duduma Colony Bus Stand \u2013 Gopalpur Bus Stand (Via- Amba market, gandhi nagar, Courtpeta",
        "sequence_order": 49,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_306",
        "route_number": "306",
        "route_name": "Mahatma Gandhi Stadium - Sonapur beach (Via- Railway Station,Haldiapadar New Bus Stand,Kanisi Hata,Sidhha",
        "sequence_order": 32,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_ganesh_nagar",
    "name": "Ganesh Nagar",
    "published_name": "GANESH NAGAR",
    "canonical_stop_id": "stop_crut_berhampur_ganesh_nagar",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.305118,
    "longitude": 84.780953,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_300",
        "route_number": "300",
        "route_name": "NIST college - Duduma Colony Bus stand",
        "sequence_order": 6,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_302",
        "route_number": "302",
        "route_name": "Berhampur Railway Station \u2013 Regidi",
        "sequence_order": 13,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_303",
        "route_number": "303",
        "route_name": "Duduma Colony Bus Stand \u2013 Gopalpur Bus Stand (Via- Amba market, gandhi nagar, Courtpeta",
        "sequence_order": 40,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_304",
        "route_number": "304",
        "route_name": "Berhampur Railway Station -D.patapur",
        "sequence_order": 22,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_kamapalli",
    "name": "Kamapalli",
    "published_name": "KAMAPALLI",
    "canonical_stop_id": "stop_crut_berhampur_kamapalli",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.307031,
    "longitude": 84.805822,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_301",
        "route_number": "301",
        "route_name": "Berhampur Rail Stn. - Parala maharaja college (Via- MKCG Medical, Engineering",
        "sequence_order": 5,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_302",
        "route_number": "302",
        "route_name": "Berhampur Railway Station \u2013 Regidi",
        "sequence_order": 19,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_303",
        "route_number": "303",
        "route_name": "Duduma Colony Bus Stand \u2013 Gopalpur Bus Stand (Via- Amba market, gandhi nagar, Courtpeta",
        "sequence_order": 54,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_304",
        "route_number": "304",
        "route_name": "Berhampur Railway Station -D.patapur",
        "sequence_order": 24,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_khallikote_college",
    "name": "Khallikote College",
    "published_name": "KHALLIKOTE COLLEGE",
    "canonical_stop_id": "stop_crut_berhampur_khallikote_college",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.307477,
    "longitude": 84.794415,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_300",
        "route_number": "300",
        "route_name": "NIST college - Duduma Colony Bus stand",
        "sequence_order": 17,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_303",
        "route_number": "303",
        "route_name": "Duduma Colony Bus Stand \u2013 Gopalpur Bus Stand (Via- Amba market, gandhi nagar, Courtpeta",
        "sequence_order": 51,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_306",
        "route_number": "306",
        "route_name": "Mahatma Gandhi Stadium - Sonapur beach (Via- Railway Station,Haldiapadar New Bus Stand,Kanisi Hata,Sidhha",
        "sequence_order": 34,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_mkcg_medical",
    "name": "Mkcg Medical",
    "published_name": "MKCG MEDICAL",
    "canonical_stop_id": "stop_crut_berhampur_mkcg_medical",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.3083,
    "longitude": 84.8083,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_berhampur_mkcg_medical_college",
    "name": "Mkcg Medical College",
    "published_name": "MKCG MEDICAL COLLEGE",
    "canonical_stop_id": "stop_crut_berhampur_mkcg_medical_college",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.3083,
    "longitude": 84.8083,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_berhampur_mkcg_medical_college_square",
    "name": "Mkcg Medical College Square",
    "published_name": "MKCG MEDICAL COLLEGE SQUARE",
    "canonical_stop_id": "stop_crut_berhampur_mkcg_medical_college_square",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.3083,
    "longitude": 84.8083,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_301",
        "route_number": "301",
        "route_name": "Berhampur Rail Stn. - Parala maharaja college (Via- MKCG Medical, Engineering",
        "sequence_order": 8,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_303",
        "route_number": "303",
        "route_name": "Duduma Colony Bus Stand \u2013 Gopalpur Bus Stand (Via- Amba market, gandhi nagar, Courtpeta",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_new_bus_stand",
    "name": "New Bus Stand",
    "published_name": "NEW BUS STAND",
    "canonical_stop_id": "stop_crut_berhampur_new_bus_stand",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 19.312894,
    "longitude": 84.802658,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_121",
        "route_number": "121",
        "route_name": "DAV POND \u2013 Radio Station (Kantajhor) (via Basanti Colony, New Bus Stand, NIT)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_300",
        "route_number": "300",
        "route_name": "NIST college - Duduma Colony Bus stand",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_303",
        "route_number": "303",
        "route_name": "Duduma Colony Bus Stand \u2013 Gopalpur Bus Stand (Via- Amba market, gandhi nagar, Courtpeta",
        "sequence_order": 36,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_berhampur_railway_station_pf_4",
    "name": "Railway Station P.f-4",
    "published_name": "RAILWAY STATION P.F-4",
    "canonical_stop_id": "stop_crut_berhampur_railway_station_pf_4",
    "city": "Berhampur",
    "district": "Ganjam",
    "locality": "Berhampur",
    "latitude": 19.317,
    "longitude": 84.793,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_berhampur_temple",
    "name": "Temple",
    "published_name": "TEMPLE",
    "canonical_stop_id": "stop_crut_berhampur_temple",
    "city": "Berhampur",
    "district": "Berhampur",
    "locality": "Berhampur",
    "latitude": 21.539347,
    "longitude": 86.656633,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_300",
        "route_number": "300",
        "route_name": "NIST college - Duduma Colony Bus stand",
        "sequence_order": 22,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_302",
        "route_number": "302",
        "route_name": "Berhampur Railway Station \u2013 Regidi",
        "sequence_order": 43,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_304",
        "route_number": "304",
        "route_name": "Berhampur Railway Station -D.patapur",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_306",
        "route_number": "306",
        "route_name": "Mahatma Gandhi Stadium - Sonapur beach (Via- Railway Station,Haldiapadar New Bus Stand,Kanisi Hata,Sidhha",
        "sequence_order": 39,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_aiims",
    "name": "AIIMS",
    "published_name": "AIIMS",
    "canonical_stop_id": "stop_crut_bhubaneswar_aiims",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.236178,
    "longitude": 85.778299,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_19",
        "route_number": "19",
        "route_name": "AIIMS - OMP Square-Mahanadi Vihar (via NH)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_27",
        "route_number": "27",
        "route_name": "Bhubaneswar Railway Station \u2013 Bhagwanpur (via AIIMS)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_39",
        "route_number": "39",
        "route_name": "Bhubaneswar Railway Station - AIIMS (via Capital Hospital, Bhimtangi)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_40",
        "route_number": "40",
        "route_name": "AIIMS - Sai Mandir (Kesora) (via Capital Hospital, Badagada Brit Colony)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_airport",
    "name": "Airport",
    "published_name": "AIRPORT",
    "canonical_stop_id": "stop_crut_bhubaneswar_airport",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.252295,
    "longitude": 85.813485,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_101",
        "route_number": "101",
        "route_name": "Rourkela New Bus Stand - Laukera (via Udit Nagar, Hanuman Vatika Chowk, Chhend, Airport)",
        "sequence_order": 5,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_82",
        "route_number": "82",
        "route_name": "AIRPORT - MASTER CANTEEN - SCB Medical (Settlement Office) (via NH)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_badambadi",
    "name": "Badambadi",
    "published_name": "Badambadi",
    "canonical_stop_id": "stop_crut_bhubaneswar_badambadi",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.4556,
    "longitude": 85.8778,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_54",
        "route_number": "54",
        "route_name": "NLU, Cuttack - Puri Bus Stand (via Badambadi, Puri Bypass)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_58",
        "route_number": "58",
        "route_name": "Jagatpur,Cuttack \u2013 Puri Bus Stand (via Badambadi,Link Road)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_59",
        "route_number": "59",
        "route_name": "Mahanadi Vihar,Cuttack \u2013 Puri Bus Stand (via Badambadi,Link Road)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_80",
        "route_number": "80",
        "route_name": "Naraj Police Outpost \u2013 Agrahat, Charbatia (via NLU, Badambadi, SCB Medical)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_80e",
        "route_number": "80E",
        "route_name": "Naraj Police Outpost \u2013 Mangarajpur (via NLU, Badambadi, SCB Medical)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_balakati",
    "name": "Balakati",
    "published_name": "Balakati",
    "canonical_stop_id": "stop_crut_bhubaneswar_balakati",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.203366,
    "longitude": 85.86856,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_34",
        "route_number": "34",
        "route_name": "Bhubaneswar Railway Station \u2013 Balakati (Sai Hospital)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_34e",
        "route_number": "34E",
        "route_name": "Bhubaneswar Railway Station - Trahi Achyut(Via-Balakati)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_bapuji_nagar",
    "name": "Bapuji Nagar",
    "published_name": "BAPUJI NAGAR",
    "canonical_stop_id": "stop_crut_bhubaneswar_bapuji_nagar",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.2642,
    "longitude": 85.8361,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_baramunda",
    "name": "Baramunda",
    "published_name": "BARAMUNDA",
    "canonical_stop_id": "stop_crut_bhubaneswar_baramunda",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.273141,
    "longitude": 85.79227,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
    "name": "Baramunda Bsabt",
    "published_name": "Baramunda BSABT",
    "canonical_stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.273141,
    "longitude": 85.79227,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_18",
        "route_number": "18",
        "route_name": "Baramunda BSABT \u2013 Jagatpur (via Nandankanan)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_32",
        "route_number": "32",
        "route_name": "Baramunda BSABT \u2013 Lingaraj Temple (Via Bhubaneswar Railway Station)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_37",
        "route_number": "37",
        "route_name": "Baramunda BSABT \u2013 Naraj Railway Station (via Trisulia Square, OMFED Dairy)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_41",
        "route_number": "41",
        "route_name": "Baramunda BSABT \u2013 Tangi (via NH)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_42",
        "route_number": "42",
        "route_name": "Baramunda BSABT \u2013 Nandankanan (via Chandaka)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_43",
        "route_number": "43",
        "route_name": "Baramunda BSABT \u2013 Banamalipur (via Rasulgarh ,Kalapana Sqr)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_43e",
        "route_number": "43E",
        "route_name": "Baramunda BSABT \u2013 Abhyamukhi (via Rasulgarh ,Kalapana Sqr,Banamalipur)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_44",
        "route_number": "44",
        "route_name": "Baramunda BSABT - SVNIRTAR,Olatpur (via Master Canteen, ,Kalapana",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_51",
        "route_number": "51",
        "route_name": "Baramunda BSABT - Puri Bus Stand (via Vani Vihar,Rasulgarh Square)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_91",
        "route_number": "91",
        "route_name": "Baramunda BSABT \u2013 Biju Patnaik Park, Cuttack (Via NH)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_baramunda_isbt",
    "name": "Baramunda ISBT",
    "published_name": "Baramunda ISBT",
    "canonical_stop_id": "stop_crut_bhubaneswar_baramunda_isbt",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Bhubaneswar",
    "latitude": 20.273141,
    "longitude": 85.79227,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_71",
        "route_number": "71",
        "route_name": "Baramunda ISBT \u2013 Konark (via Rasulgarh Square)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_bhubaneswar_airport",
    "name": "Bhubaneswar Airport",
    "published_name": "Bhubaneswar Airport",
    "canonical_stop_id": "stop_crut_bhubaneswar_bhubaneswar_airport",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Bhubaneswar",
    "latitude": 20.252,
    "longitude": 85.8178,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_10",
        "route_number": "10",
        "route_name": "Bhubaneswar Airport \u2013 Maulana Azad National Urdu University,",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
    "name": "Bhubaneswar Railway Station",
    "published_name": "Bhubaneswar Railway Station",
    "canonical_stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Bhubaneswar",
    "latitude": 20.2662,
    "longitude": 85.8436,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_09",
        "route_number": "09",
        "route_name": "Bhubaneswar Railway Station - Patia (via Niladri Vihar)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_11",
        "route_number": "11",
        "route_name": "Trishulia Bus Stand \u2013 Bhubaneswar Railway Station(via Nandankana, Acharya",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_12",
        "route_number": "12",
        "route_name": "Nandankanan - Bhubaneswar Railway Station (via Jaydev Vihar)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_14",
        "route_number": "14",
        "route_name": "Kalinga Vihar \u2013 Bhubaneswar Railway Station (Via Sum Ultimate,BSABT,OUAT,AG)",
        "sequence_order": 6,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_16",
        "route_number": "16",
        "route_name": "Bhubaneswar Railway Station \u2013 Sri Sri University, Kataka (via NH)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_20",
        "route_number": "20",
        "route_name": "Bhubaneswar Railway Station \u2013 Khordha New Bus Stand (via Vani Vihar)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_21",
        "route_number": "21",
        "route_name": "Bhubaneswar Railway Station - Khordha New Bus Stand (via OUAT)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_22a",
        "route_number": "22A",
        "route_name": "Bhubaneswar Railway Station - Khordha Road Station",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_23",
        "route_number": "23",
        "route_name": "Bhubaneswar Railway Station \u2013 Sum Hospital-IGKC",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_27",
        "route_number": "27",
        "route_name": "Bhubaneswar Railway Station \u2013 Bhagwanpur (via AIIMS)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_30",
        "route_number": "30",
        "route_name": "Bhubaneswar Railway Station \u2013 Chhatabar -Mahatma Gandhi Academy of",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_31",
        "route_number": "31",
        "route_name": "Bhubaneswar Railway Station \u2013 Hi-Tech Hospital (via Toshali Bhawan,",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_32",
        "route_number": "32",
        "route_name": "Baramunda BSABT \u2013 Lingaraj Temple (Via Bhubaneswar Railway Station)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_33",
        "route_number": "33",
        "route_name": "Bhubaneswar Railway Station \u2013 Pipili",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_34",
        "route_number": "34",
        "route_name": "Bhubaneswar Railway Station \u2013 Balakati (Sai Hospital)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_34e",
        "route_number": "34E",
        "route_name": "Bhubaneswar Railway Station - Trahi Achyut(Via-Balakati)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_36",
        "route_number": "36",
        "route_name": "Bhubaneswar Railway Station \u2013 Mundali (via Judicial Academy)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_38",
        "route_number": "38",
        "route_name": "Bhubaneswar Railway Station \u2013 Trimal (via Khordha Bypass, IIT)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_39",
        "route_number": "39",
        "route_name": "Bhubaneswar Railway Station - AIIMS (via Capital Hospital, Bhimtangi)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_45",
        "route_number": "45",
        "route_name": "Bhubaneswar Railway Station - Jayadev Pitha (via Brahman Sarangi,Khamanga)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_46",
        "route_number": "46",
        "route_name": "Bhubaneswar Railway Station - Nandankanan (via Kalayanpur,Gandarpur)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_49",
        "route_number": "49",
        "route_name": "Bhubaneswar Railway Station \u2013 Delanga Hata (via Pipili)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_50",
        "route_number": "50",
        "route_name": "Bhubaneswar Railway Station - Puri Bus Stand",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_62",
        "route_number": "62",
        "route_name": "Bhubaneswar Railway Station \u2013 Suando (via-Kalpana Square, Pipili Bypass,",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_64",
        "route_number": "64",
        "route_name": "Bhubaneswar Railway Station \u2013 Jatani Gate (via-Vani vihar, Gohiria square,",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_65",
        "route_number": "65",
        "route_name": "Bhubaneswar Railway Station \u2013 Wonderla Amusement Park (Via - Vani Vihar)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_66",
        "route_number": "66",
        "route_name": "Bhubaneswar Railway Station - Pathargadia Square (Via- Kiss College, Kelucharan",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_70",
        "route_number": "70",
        "route_name": "Bhubaneswar Railway Station - Konark",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_93",
        "route_number": "93",
        "route_name": "Bhubaneswar Railway Station \u2013 Biju Patnaik Park, CDA (Via Fire",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_dd1",
        "route_number": "DD1",
        "route_name": "Bhubaneswar Railway Station \u2013 Shree Mandira Parking, Puri (Via",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station_2",
    "name": "Bhubaneswar Railway Station.",
    "published_name": "Bhubaneswar Rly. Stn.",
    "canonical_stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station_2",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Bhubaneswar",
    "latitude": 20.2662,
    "longitude": 85.8436,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_35",
        "route_number": "35",
        "route_name": "Bhubaneswar Rly. Stn. - Udaynath College, Adaspur (Via Jayadev Pitha)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_biju_patnaik_international_airport",
    "name": "Biju Patnaik International Airport",
    "published_name": "BIJU PATNAIK INTERNATIONAL AIRPORT",
    "canonical_stop_id": "stop_crut_bhubaneswar_biju_patnaik_international_airport",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Bhubaneswar",
    "latitude": 20.252,
    "longitude": 85.8178,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_bsabt",
    "name": "Bsabt",
    "published_name": "BSABT",
    "canonical_stop_id": "stop_crut_bhubaneswar_bsabt",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.273141,
    "longitude": 85.79227,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_14",
        "route_number": "14",
        "route_name": "Kalinga Vihar \u2013 Bhubaneswar Railway Station (Via Sum Ultimate,BSABT,OUAT,AG)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_63",
        "route_number": "63",
        "route_name": "BSABT -Madhabananda Temple, Niali (Via-Vani Vihar, Master Canteen,",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_buddha_park",
    "name": "Buddha Park",
    "published_name": "BUDDHA PARK",
    "canonical_stop_id": "stop_crut_bhubaneswar_buddha_park",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.3241,
    "longitude": 85.8082,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_capital_hospital",
    "name": "Capital Hospital",
    "published_name": "Capital Hospital",
    "canonical_stop_id": "stop_crut_bhubaneswar_capital_hospital",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.2611,
    "longitude": 85.8278,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_39",
        "route_number": "39",
        "route_name": "Bhubaneswar Railway Station - AIIMS (via Capital Hospital, Bhimtangi)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_40",
        "route_number": "40",
        "route_name": "AIIMS - Sai Mandir (Kesora) (via Capital Hospital, Badagada Brit Colony)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_cuttack_netaji_bus_terminal",
    "name": "Cuttack Netaji Bus Terminal",
    "published_name": "Cuttack Netaji Bus Terminal",
    "canonical_stop_id": "stop_crut_bhubaneswar_cuttack_netaji_bus_terminal",
    "city": "Bhubaneswar",
    "district": "Cuttack",
    "locality": "Bhubaneswar",
    "latitude": 20.452,
    "longitude": 85.875,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_85",
        "route_number": "85",
        "route_name": "Cuttack Netaji Bus Terminal - Gadama (via OMP, Kandarpur)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_cuttack_netaji_bus_terminus_cnbt",
    "name": "Cuttack Netaji Bus Terminus (cnbt)",
    "published_name": "Cuttack Netaji Bus Terminus (CNBT)",
    "canonical_stop_id": "stop_crut_bhubaneswar_cuttack_netaji_bus_terminus_cnbt",
    "city": "Bhubaneswar",
    "district": "Cuttack",
    "locality": "Bhubaneswar",
    "latitude": 20.452,
    "longitude": 85.875,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_cuttack_netaji_bus_terminus_cnbt_2",
    "name": "Cuttack Netaji Bus Terminus Cnbt",
    "published_name": "Cuttack Netaji Bus Terminus (CNBT)",
    "canonical_stop_id": "stop_crut_bhubaneswar_cuttack_netaji_bus_terminus_cnbt_2",
    "city": "Bhubaneswar",
    "district": "Cuttack",
    "locality": "Bhubaneswar",
    "latitude": 20.452,
    "longitude": 85.875,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_15",
        "route_number": "15",
        "route_name": "Cuttack Netaji Bus Terminus (CNBT) \u2013 Utkal Hospital (Via Judicial Square,",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_15e",
        "route_number": "15E",
        "route_name": "Cuttack Netaji Bus Terminus (CNBT) \u2013 Salia Sahi (Via Judicial Square,",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_dhabaleswar",
    "name": "Dhabaleswar",
    "published_name": "Dhabaleswar",
    "canonical_stop_id": "stop_crut_bhubaneswar_dhabaleswar",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.192324,
    "longitude": 85.840249,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_303e",
        "route_number": "303E",
        "route_name": "Duduma Colony Bus stand \u2013 Dhabaleswar (Via- Railway station P.F-4, Lanjipali Village, Ankuli ,ARMY",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_83",
        "route_number": "83",
        "route_name": "Dhabaleswar - Kandarpur (via 42 Mouza)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_dumduma",
    "name": "Dumduma",
    "published_name": "Dumduma",
    "canonical_stop_id": "stop_crut_bhubaneswar_dumduma",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.239603,
    "longitude": 85.788816,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_25",
        "route_number": "25",
        "route_name": "Dumduma \u2013 Gadakana (Via \u2013 Mastercanteen, Mancheswar)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_dumduma_jadupur",
    "name": "Dumduma (jadupur)",
    "published_name": "Dumduma (Jadupur)",
    "canonical_stop_id": "stop_crut_bhubaneswar_dumduma_jadupur",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.239603,
    "longitude": 85.788816,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_dumduma_jadupur_2",
    "name": "Dumduma Jadupur",
    "published_name": "Dumduma (Jadupur)",
    "canonical_stop_id": "stop_crut_bhubaneswar_dumduma_jadupur_2",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.239603,
    "longitude": 85.788816,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_26",
        "route_number": "26",
        "route_name": "Dumduma (Jadupur) \u2013 Rokat, Rajdhani Engineering College (Via Chaikeisiani)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_hi_tech_hospital",
    "name": "Hi-tech Hospital",
    "published_name": "Hi-Tech Hospital",
    "canonical_stop_id": "stop_crut_bhubaneswar_hi_tech_hospital",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.303907,
    "longitude": 85.87846,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_31",
        "route_number": "31",
        "route_name": "Bhubaneswar Railway Station \u2013 Hi-Tech Hospital (via Toshali Bhawan,",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_igkc",
    "name": "Igkc",
    "published_name": "IGKC",
    "canonical_stop_id": "stop_crut_bhubaneswar_igkc",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.274059,
    "longitude": 85.764331,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_92",
        "route_number": "92",
        "route_name": "IGKC \u2013 Sai Temple (Via Khandagiri, Lingraj Station, Bhim Tangi,",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_igkc_hospital",
    "name": "Igkc Hospital",
    "published_name": "IGKC HOSPITAL",
    "canonical_stop_id": "stop_crut_bhubaneswar_igkc_hospital",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.274059,
    "longitude": 85.764331,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_igkc_multispecialty_hospital",
    "name": "Igkc Multispecialty Hospital",
    "published_name": "IGKC Multispecialty Hospital",
    "canonical_stop_id": "stop_crut_bhubaneswar_igkc_multispecialty_hospital",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.274059,
    "longitude": 85.764331,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_08",
        "route_number": "08",
        "route_name": "IGKC Multispecialty Hospital \u2013 Sum Hospital (Campus -2) (via Sum Hospital",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_jagannath_temple",
    "name": "Jagannath Temple",
    "published_name": "JAGANNATH TEMPLE",
    "canonical_stop_id": "stop_crut_bhubaneswar_jagannath_temple",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 19.804722,
    "longitude": 85.817778,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_jatani",
    "name": "Jatani",
    "published_name": "Jatani",
    "canonical_stop_id": "stop_crut_bhubaneswar_jatani",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.222787,
    "longitude": 85.81107,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_22b",
        "route_number": "22B",
        "route_name": "Jatani Gate- Khordha New Bus Stand (via Jatani)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_56",
        "route_number": "56",
        "route_name": "Khordha New Bus Stand \u2013 Puri Bus Stand (via Jatani,Pipili)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_56e",
        "route_number": "56E",
        "route_name": "Puri Bus Stand - Khordha Road Station (via Jatani,Pipili)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_jatani_gate",
    "name": "Jatani Gate",
    "published_name": "Jatani Gate",
    "canonical_stop_id": "stop_crut_bhubaneswar_jatani_gate",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.222787,
    "longitude": 85.81107,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_22b",
        "route_number": "22B",
        "route_name": "Jatani Gate- Khordha New Bus Stand (via Jatani)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_64",
        "route_number": "64",
        "route_name": "Bhubaneswar Railway Station \u2013 Jatani Gate (via-Vani vihar, Gohiria square,",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_jaydev_vihar",
    "name": "Jaydev Vihar",
    "published_name": "Jaydev Vihar",
    "canonical_stop_id": "stop_crut_bhubaneswar_jaydev_vihar",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Bhubaneswar",
    "latitude": 20.301,
    "longitude": 85.823,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_12",
        "route_number": "12",
        "route_name": "Nandankanan - Bhubaneswar Railway Station (via Jaydev Vihar)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_jaydev_vihar_square",
    "name": "Jaydev Vihar Square",
    "published_name": "JAYDEV VIHAR SQUARE",
    "canonical_stop_id": "stop_crut_bhubaneswar_jaydev_vihar_square",
    "city": "Bhubaneswar",
    "district": "Khordha",
    "locality": "Bhubaneswar",
    "latitude": 20.301,
    "longitude": 85.823,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_kala_bhoomi",
    "name": "Kala Bhoomi",
    "published_name": "KALA BHOOMI",
    "canonical_stop_id": "stop_crut_bhubaneswar_kala_bhoomi",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.221667,
    "longitude": 85.788611,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_kalinga_nagar",
    "name": "Kalinga Nagar",
    "published_name": "Kalinga Nagar",
    "canonical_stop_id": "stop_crut_bhubaneswar_kalinga_nagar",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.268043,
    "longitude": 85.762309,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_28",
        "route_number": "28",
        "route_name": "Master Canteen - Kalinga Nagar (Trident)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_kalinga_stadium_gate_2",
    "name": "Kalinga Stadium Gate-2",
    "published_name": "KALINGA STADIUM GATE-2",
    "canonical_stop_id": "stop_crut_bhubaneswar_kalinga_stadium_gate_2",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.290917,
    "longitude": 85.825,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_kalinga_stadium_gate_8",
    "name": "Kalinga Stadium Gate-8",
    "published_name": "KALINGA STADIUM GATE-8",
    "canonical_stop_id": "stop_crut_bhubaneswar_kalinga_stadium_gate_8",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.290917,
    "longitude": 85.825,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_kalinga_vihar",
    "name": "Kalinga Vihar",
    "published_name": "Kalinga Vihar",
    "canonical_stop_id": "stop_crut_bhubaneswar_kalinga_vihar",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.261627,
    "longitude": 85.760884,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_14",
        "route_number": "14",
        "route_name": "Kalinga Vihar \u2013 Bhubaneswar Railway Station (Via Sum Ultimate,BSABT,OUAT,AG)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_24",
        "route_number": "24",
        "route_name": "Kalinga Vihar- Sai Temple",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_24e",
        "route_number": "24E",
        "route_name": "Kalinga Vihar- Bainchua (via-Sai Temple)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_lingaraj_station",
    "name": "Lingaraj Station",
    "published_name": "LINGARAJ STATION",
    "canonical_stop_id": "stop_crut_bhubaneswar_lingaraj_station",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.238333,
    "longitude": 85.833611,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_lingaraj_temple",
    "name": "Lingaraj Temple",
    "published_name": "Lingaraj Temple",
    "canonical_stop_id": "stop_crut_bhubaneswar_lingaraj_temple",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.238333,
    "longitude": 85.833611,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_32",
        "route_number": "32",
        "route_name": "Baramunda BSABT \u2013 Lingaraj Temple (Via Bhubaneswar Railway Station)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_lingipur",
    "name": "Lingipur",
    "published_name": "Lingipur",
    "canonical_stop_id": "stop_crut_bhubaneswar_lingipur",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.213789,
    "longitude": 85.853611,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_13",
        "route_number": "13",
        "route_name": "Nandankanan Botanical Garden \u2013Lingipur (via AG Square)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_malatipatpur_bus_stand",
    "name": "Malatipatpur Bus Stand",
    "published_name": "Malatipatpur Bus Stand",
    "canonical_stop_id": "stop_crut_bhubaneswar_malatipatpur_bus_stand",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 19.866147,
    "longitude": 85.829336,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_53",
        "route_number": "53",
        "route_name": "Malatipatpur Bus Stand \u2013 Shree Mandira (via Puri Bus Stand)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_master_canteen",
    "name": "Master Canteen",
    "published_name": "Master Canteen",
    "canonical_stop_id": "stop_crut_bhubaneswar_master_canteen",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.268122,
    "longitude": 85.843785,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_28",
        "route_number": "28",
        "route_name": "Master Canteen - Kalinga Nagar (Trident)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_mastercanteen",
    "name": "Mastercanteen",
    "published_name": "Mastercanteen",
    "canonical_stop_id": "stop_crut_bhubaneswar_mastercanteen",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.268122,
    "longitude": 85.843785,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_25",
        "route_number": "25",
        "route_name": "Dumduma \u2013 Gadakana (Via \u2013 Mastercanteen, Mancheswar)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_nandankanan",
    "name": "Nandankanan",
    "published_name": "Nandankanan",
    "canonical_stop_id": "stop_crut_bhubaneswar_nandankanan",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.347814,
    "longitude": 85.824766,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_12",
        "route_number": "12",
        "route_name": "Nandankanan - Bhubaneswar Railway Station (via Jaydev Vihar)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_18",
        "route_number": "18",
        "route_name": "Baramunda BSABT \u2013 Jagatpur (via Nandankanan)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_42",
        "route_number": "42",
        "route_name": "Baramunda BSABT \u2013 Nandankanan (via Chandaka)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_46",
        "route_number": "46",
        "route_name": "Bhubaneswar Railway Station - Nandankanan (via Kalayanpur,Gandarpur)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_nh",
    "name": "NH",
    "published_name": "NH",
    "canonical_stop_id": "stop_crut_bhubaneswar_nh",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.258226,
    "longitude": 85.777753,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_105",
        "route_number": "105",
        "route_name": "Rourkela New Bus Stand - Rajgangpur (via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_106",
        "route_number": "106",
        "route_name": "Rourkela New Bus Stand - Birmitrapur (via Ring Road, NH)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_109",
        "route_number": "109",
        "route_name": "Rourkela New Bus Stand \u2013 Lathikata (via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_113",
        "route_number": "113",
        "route_name": "Rourkela New Bus Stand \u2013 Ushra (via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_16",
        "route_number": "16",
        "route_name": "Bhubaneswar Railway Station \u2013 Sri Sri University, Kataka (via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_17",
        "route_number": "17",
        "route_name": "Biju Patnaik International Airport, BBSR- Barabati Stadium, Cuttack (via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_19",
        "route_number": "19",
        "route_name": "AIIMS - OMP Square-Mahanadi Vihar (via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_41",
        "route_number": "41",
        "route_name": "Baramunda BSABT \u2013 Tangi (via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_82",
        "route_number": "82",
        "route_name": "AIRPORT - MASTER CANTEEN - SCB Medical (Settlement Office) (via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_90",
        "route_number": "90",
        "route_name": "Khordha New Bus Stand \u2013 Jagatpur, Cuttack (Via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_91",
        "route_number": "91",
        "route_name": "Baramunda BSABT \u2013 Biju Patnaik Park, Cuttack (Via NH)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_pipili",
    "name": "Pipili",
    "published_name": "Pipili",
    "canonical_stop_id": "stop_crut_bhubaneswar_pipili",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.137175,
    "longitude": 85.839165,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_33",
        "route_number": "33",
        "route_name": "Bhubaneswar Railway Station \u2013 Pipili",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_49",
        "route_number": "49",
        "route_name": "Bhubaneswar Railway Station \u2013 Delanga Hata (via Pipili)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_56",
        "route_number": "56",
        "route_name": "Khordha New Bus Stand \u2013 Puri Bus Stand (via Jatani,Pipili)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_56e",
        "route_number": "56E",
        "route_name": "Puri Bus Stand - Khordha Road Station (via Jatani,Pipili)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
    "name": "Puri Bus Stand",
    "published_name": "Puri Bus Stand",
    "canonical_stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
    "city": "Bhubaneswar",
    "district": "Puri",
    "locality": "Bhubaneswar",
    "latitude": 19.813,
    "longitude": 85.839,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_50",
        "route_number": "50",
        "route_name": "Bhubaneswar Railway Station - Puri Bus Stand",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_51",
        "route_number": "51",
        "route_name": "Baramunda BSABT - Puri Bus Stand (via Vani Vihar,Rasulgarh Square)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_52",
        "route_number": "52",
        "route_name": "Puri Bus Stand \u2013 Mangalahata (Via Puri Railway Station,Beach",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_53",
        "route_number": "53",
        "route_name": "Malatipatpur Bus Stand \u2013 Shree Mandira (via Puri Bus Stand)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_54",
        "route_number": "54",
        "route_name": "NLU, Cuttack - Puri Bus Stand (via Badambadi, Puri Bypass)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_56",
        "route_number": "56",
        "route_name": "Khordha New Bus Stand \u2013 Puri Bus Stand (via Jatani,Pipili)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_56e",
        "route_number": "56E",
        "route_name": "Puri Bus Stand - Khordha Road Station (via Jatani,Pipili)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_57",
        "route_number": "57",
        "route_name": "Puri Bus Stand - Astaranga",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_58",
        "route_number": "58",
        "route_name": "Jagatpur,Cuttack \u2013 Puri Bus Stand (via Badambadi,Link Road)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_59",
        "route_number": "59",
        "route_name": "Mahanadi Vihar,Cuttack \u2013 Puri Bus Stand (via Badambadi,Link Road)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_61",
        "route_number": "61",
        "route_name": "Puri Bus Stand \u2013 Satapada Bus Stand",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_73",
        "route_number": "73",
        "route_name": "Puri Bus Stand \u2013 Talabania",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_74",
        "route_number": "74",
        "route_name": "Puri Railway Station \u2013 Shree Mandira (Via \u2013 Puri Bus Stand)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_75",
        "route_number": "75",
        "route_name": "Shree Mandira \u2013 Kakatpur (Via Puri Bus Stand, Balighai, Marine Drive, Konark)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_76",
        "route_number": "76",
        "route_name": "Puri Bus Stand \u2013 Sakhigopal Temple",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_77",
        "route_number": "77",
        "route_name": "Puri Bus Stand \u2013 Nimapada Bus Stand",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_78",
        "route_number": "78",
        "route_name": "Puri Bus Stand\u2013 Alarnath (Brahamgiri New Bus Stand)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_puri_railway_station",
    "name": "Puri Railway Station",
    "published_name": "Puri Railway Station",
    "canonical_stop_id": "stop_crut_bhubaneswar_puri_railway_station",
    "city": "Bhubaneswar",
    "district": "Puri",
    "locality": "Bhubaneswar",
    "latitude": 19.813,
    "longitude": 85.839,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_74",
        "route_number": "74",
        "route_name": "Puri Railway Station \u2013 Shree Mandira (Via \u2013 Puri Bus Stand)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_ram_mandir",
    "name": "Ram Mandir",
    "published_name": "RAM MANDIR",
    "canonical_stop_id": "stop_crut_bhubaneswar_ram_mandir",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.2777,
    "longitude": 85.8429,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_scb",
    "name": "Scb",
    "published_name": "SCB",
    "canonical_stop_id": "stop_crut_bhubaneswar_scb",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.4725,
    "longitude": 85.8864,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_87e",
        "route_number": "87E",
        "route_name": "Judicial Academy\u2013 Nuapada(Via Barabati,SCB)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_scb_hospital",
    "name": "Scb Hospital",
    "published_name": "SCB Hospital",
    "canonical_stop_id": "stop_crut_bhubaneswar_scb_hospital",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.4725,
    "longitude": 85.8864,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_88",
        "route_number": "88",
        "route_name": "National Law University (O) \u2013 SCB Hospital (Via CDA, Raj Kishor Marg,",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_scb_medical",
    "name": "Scb Medical",
    "published_name": "SCB Medical",
    "canonical_stop_id": "stop_crut_bhubaneswar_scb_medical",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.4725,
    "longitude": 85.8864,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_80",
        "route_number": "80",
        "route_name": "Naraj Police Outpost \u2013 Agrahat, Charbatia (via NLU, Badambadi, SCB Medical)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_80e",
        "route_number": "80E",
        "route_name": "Naraj Police Outpost \u2013 Mangarajpur (via NLU, Badambadi, SCB Medical)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_89",
        "route_number": "89",
        "route_name": "SCB Medical \u2013 Jagadguru Krupalu University (JKU)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_89a",
        "route_number": "89A",
        "route_name": "SCB Medical \u2013 Judicial Square",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_shree_mandira",
    "name": "Shree Mandira",
    "published_name": "Shree Mandira",
    "canonical_stop_id": "stop_crut_bhubaneswar_shree_mandira",
    "city": "Bhubaneswar",
    "district": "Puri",
    "locality": "Bhubaneswar",
    "latitude": 19.8045,
    "longitude": 85.818,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_53",
        "route_number": "53",
        "route_name": "Malatipatpur Bus Stand \u2013 Shree Mandira (via Puri Bus Stand)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_72",
        "route_number": "72",
        "route_name": "Shree Mandira \u2013 Madhabnanda Temple, Niali",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_74",
        "route_number": "74",
        "route_name": "Puri Railway Station \u2013 Shree Mandira (Via \u2013 Puri Bus Stand)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_75",
        "route_number": "75",
        "route_name": "Shree Mandira \u2013 Kakatpur (Via Puri Bus Stand, Balighai, Marine Drive, Konark)",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_79",
        "route_number": "79",
        "route_name": "Shree Mandira \u2013 Light House (Via Police line, SCS College, Kacheri,",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_shree_mandira_parking_puri",
    "name": "Shree Mandira Parking, Puri",
    "published_name": "Shree Mandira Parking, Puri",
    "canonical_stop_id": "stop_crut_bhubaneswar_shree_mandira_parking_puri",
    "city": "Bhubaneswar",
    "district": "Puri",
    "locality": "Bhubaneswar",
    "latitude": 19.8045,
    "longitude": 85.818,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_dd1",
        "route_number": "DD1",
        "route_name": "Bhubaneswar Railway Station \u2013 Shree Mandira Parking, Puri (Via",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_temple_square",
    "name": "Temple Square",
    "published_name": "TEMPLE SQUARE",
    "canonical_stop_id": "stop_crut_bhubaneswar_temple_square",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 19.804722,
    "longitude": 85.817778,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_vani_vihar",
    "name": "Vani Vihar",
    "published_name": "Vani Vihar",
    "canonical_stop_id": "stop_crut_bhubaneswar_vani_vihar",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.303273,
    "longitude": 85.839744,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_20",
        "route_number": "20",
        "route_name": "Bhubaneswar Railway Station \u2013 Khordha New Bus Stand (via Vani Vihar)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_51",
        "route_number": "51",
        "route_name": "Baramunda BSABT - Puri Bus Stand (via Vani Vihar,Rasulgarh Square)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_65",
        "route_number": "65",
        "route_name": "Bhubaneswar Railway Station \u2013 Wonderla Amusement Park (Via - Vani Vihar)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_bhubaneswar_vani_vihar_square",
    "name": "Vani Vihar Square",
    "published_name": "VANI VIHAR SQUARE",
    "canonical_stop_id": "stop_crut_bhubaneswar_vani_vihar_square",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.303273,
    "longitude": 85.839744,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_bhubaneswar_vss_nagar_road",
    "name": "V.s.s. Nagar Road",
    "published_name": "V.S.S. NAGAR ROAD",
    "canonical_stop_id": "stop_crut_bhubaneswar_vss_nagar_road",
    "city": "Bhubaneswar",
    "district": "Bhubaneswar",
    "locality": "Bhubaneswar",
    "latitude": 20.2642,
    "longitude": 85.8361,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_keonjhar_dharanidhar_medical_college",
    "name": "Dharanidhar Medical College",
    "published_name": "DHARANIDHAR MEDICAL COLLEGE",
    "canonical_stop_id": "stop_crut_keonjhar_dharanidhar_medical_college",
    "city": "Keonjhar",
    "district": "Keonjhar",
    "locality": "Keonjhar",
    "latitude": 21.6333,
    "longitude": 85.5833,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_404",
        "route_number": "404",
        "route_name": "Route 404",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_keonjhar_district_hospital",
    "name": "District Hospital",
    "published_name": "DISTRICT HOSPITAL",
    "canonical_stop_id": "stop_crut_keonjhar_district_hospital",
    "city": "Keonjhar",
    "district": "Keonjhar",
    "locality": "Keonjhar",
    "latitude": 19.8167,
    "longitude": 85.8333,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_400",
        "route_number": "400",
        "route_name": "Route 400",
        "sequence_order": 33,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_403",
        "route_number": "403",
        "route_name": "Route 403",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_keonjhar_keonjhar_bus_stand",
    "name": "Keonjhar Bus Stand",
    "published_name": "KEONJHAR BUS STAND",
    "canonical_stop_id": "stop_crut_keonjhar_keonjhar_bus_stand",
    "city": "Keonjhar",
    "district": "Keonjhar",
    "locality": "Keonjhar",
    "latitude": 21.629,
    "longitude": 85.593,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_404",
        "route_number": "404",
        "route_name": "Route 404",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_405",
        "route_number": "405",
        "route_name": "Route 405",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_keonjhar_kv_keonjhar",
    "name": "K.v, Keonjhar",
    "published_name": "K.V, KEONJHAR",
    "canonical_stop_id": "stop_crut_keonjhar_kv_keonjhar",
    "city": "Keonjhar",
    "district": "Keonjhar",
    "locality": "Keonjhar",
    "latitude": 21.629,
    "longitude": 85.593,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_403",
        "route_number": "403",
        "route_name": "Route 403",
        "sequence_order": 21,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_puri_malatipatpur",
    "name": "Malatipatpur",
    "published_name": "MALATIPATPUR",
    "canonical_stop_id": "stop_crut_puri_malatipatpur",
    "city": "Puri",
    "district": "Bhubaneswar",
    "locality": "Puri",
    "latitude": 19.866147,
    "longitude": 85.829336,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_puri_sea_beach_road",
    "name": "Sea Beach Road",
    "published_name": "SEA BEACH ROAD",
    "canonical_stop_id": "stop_crut_puri_sea_beach_road",
    "city": "Puri",
    "district": "Puri",
    "locality": "Puri",
    "latitude": 19.261111,
    "longitude": 84.908333,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_puri_sun_temple",
    "name": "Sun Temple",
    "published_name": "SUN TEMPLE",
    "canonical_stop_id": "stop_crut_puri_sun_temple",
    "city": "Puri",
    "district": "Puri",
    "locality": "Puri",
    "latitude": 19.8875,
    "longitude": 86.094444,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_rourkela_hanuman_vatika_chowk",
    "name": "Hanuman Vatika Chowk",
    "published_name": "Hanuman Vatika Chowk",
    "canonical_stop_id": "stop_crut_rourkela_hanuman_vatika_chowk",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 22.216667,
    "longitude": 84.85,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_101",
        "route_number": "101",
        "route_name": "Rourkela New Bus Stand - Laukera (via Udit Nagar, Hanuman Vatika Chowk, Chhend, Airport)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_103",
        "route_number": "103",
        "route_name": "Rourkela New Bus Stand \u2013 Panposh( Via-Uditnagar,Hanuman Vatika Chowk,Chhend)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_rourkela_ispat_general_hospital",
    "name": "Ispat General Hospital",
    "published_name": "ISPAT GENERAL HOSPITAL",
    "canonical_stop_id": "stop_crut_rourkela_ispat_general_hospital",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 22.2583,
    "longitude": 84.8583,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_rourkela_jhirpani",
    "name": "Jhirpani",
    "published_name": "Jhirpani",
    "canonical_stop_id": "stop_crut_rourkela_jhirpani",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 22.268472,
    "longitude": 84.90068,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_102",
        "route_number": "102",
        "route_name": "Vedvyas - Jhirpani (via Panposh,Chhend Chowk, Koel Nagar)",
        "sequence_order": 5,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_104",
        "route_number": "104",
        "route_name": "Rourkela New Bus Stand - Jhirpani(via Sector-2,Nit,Jagda Chowk)",
        "sequence_order": 5,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_108",
        "route_number": "108",
        "route_name": "Rourkela New Bus Stand \u2013 Nuagaon (via Jagda Chowk, Jhirpani, Khuntagaon)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_rourkela_mangala_temple",
    "name": "Mangala Temple",
    "published_name": "MANGALA TEMPLE",
    "canonical_stop_id": "stop_crut_rourkela_mangala_temple",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 20.0,
    "longitude": 86.1948,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_rourkela_nit",
    "name": "NIT",
    "published_name": "Nit",
    "canonical_stop_id": "stop_crut_rourkela_nit",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 22.25312,
    "longitude": 84.90159,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_104",
        "route_number": "104",
        "route_name": "Rourkela New Bus Stand - Jhirpani(via Sector-2,Nit,Jagda Chowk)",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_116",
        "route_number": "116",
        "route_name": "Rourkela New Bus Stand \u2013 Loram (via NIT, Jagda Chowk, Khutagaon, Sorda)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_121",
        "route_number": "121",
        "route_name": "DAV POND \u2013 Radio Station (Kantajhor) (via Basanti Colony, New Bus Stand, NIT)",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_rourkela_nit_main_gate",
    "name": "NIT Main Gate",
    "published_name": "NIT MAIN GATE",
    "canonical_stop_id": "stop_crut_rourkela_nit_main_gate",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 22.25312,
    "longitude": 84.90159,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_rourkela_osrtc_bus_stand",
    "name": "Osrtc Bus Stand",
    "published_name": "OSRTC BUS STAND",
    "canonical_stop_id": "stop_crut_rourkela_osrtc_bus_stand",
    "city": "Rourkela",
    "district": "Sundargarh",
    "locality": "Rourkela",
    "latitude": 22.249,
    "longitude": 84.856,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_rourkela_panposh",
    "name": "Panposh",
    "published_name": "Panposh",
    "canonical_stop_id": "stop_crut_rourkela_panposh",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 22.228599,
    "longitude": 84.805323,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_102",
        "route_number": "102",
        "route_name": "Vedvyas - Jhirpani (via Panposh,Chhend Chowk, Koel Nagar)",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_103",
        "route_number": "103",
        "route_name": "Rourkela New Bus Stand \u2013 Panposh( Via-Uditnagar,Hanuman Vatika Chowk,Chhend)",
        "sequence_order": 5,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_rourkela_panposh_chowk",
    "name": "Panposh Chowk",
    "published_name": "PANPOSH CHOWK",
    "canonical_stop_id": "stop_crut_rourkela_panposh_chowk",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 22.228599,
    "longitude": 84.805323,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_rourkela_panposh_station",
    "name": "Panposh Station",
    "published_name": "Panposh Station",
    "canonical_stop_id": "stop_crut_rourkela_panposh_station",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 22.228599,
    "longitude": 84.805323,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_101e",
        "route_number": "101E",
        "route_name": "Rourkela New Bus Stand \u2013 Panposh Station(",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_rourkela_tarini_temple",
    "name": "Tarini Temple",
    "published_name": "TARINI TEMPLE",
    "canonical_stop_id": "stop_crut_rourkela_tarini_temple",
    "city": "Rourkela",
    "district": "Rourkela",
    "locality": "Rourkela",
    "latitude": 19.491667,
    "longitude": 84.9,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": []
  },
  {
    "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
    "name": "Ainthapali Bus Terminal",
    "published_name": "AINTHAPALI BUS TERMINAL",
    "canonical_stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.495385,
    "longitude": 83.983956,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_terminal",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_201",
        "route_number": "201",
        "route_name": "Ainthapali Bus Terminal \u2013 Ghanteswari Temple",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_202",
        "route_number": "202",
        "route_name": "Ainthapali Bus Terminal \u2013 Atal Chowk",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_203",
        "route_number": "203",
        "route_name": "Ainthapali Bus Terminal - Hirakud Dam",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_204",
        "route_number": "204",
        "route_name": "Ainthapali Bus Terminal - Maneswar",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_205",
        "route_number": "205",
        "route_name": "Ainthapali Bus Terminal - Nuajamda",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_207",
        "route_number": "207",
        "route_name": "Ainthapali Bus Terminal \u2013 Dhama",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_208",
        "route_number": "208",
        "route_name": "Dhanupali Chowk \u2013 Burla Hospital",
        "sequence_order": 39,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_210",
        "route_number": "210",
        "route_name": "Ainthapali Bus Terminal \u2013 Jamadarpali Dyke",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_211",
        "route_number": "211",
        "route_name": "Ainthapali Bus Terminal \u2013 Jharsuguda",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_212",
        "route_number": "212",
        "route_name": "Ainthapali Bus Terminal \u2013 Baragarh",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213",
        "route_number": "213",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213a",
        "route_number": "213A",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_214",
        "route_number": "214",
        "route_name": "Ainthapali Bus Terminal \u2013 Kuchinda",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_215",
        "route_number": "215",
        "route_name": "Ainthapali Bus Terminal \u2013 Padiabahal",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
    "name": "Ainthapali Chowk",
    "published_name": "AINTHAPALI CHOWK",
    "canonical_stop_id": "stop_crut_sambalpur_ainthapali_chowk",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.495385,
    "longitude": 83.983956,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_205",
        "route_number": "205",
        "route_name": "Ainthapali Bus Terminal - Nuajamda",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_208",
        "route_number": "208",
        "route_name": "Dhanupali Chowk \u2013 Burla Hospital",
        "sequence_order": 38,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_210",
        "route_number": "210",
        "route_name": "Ainthapali Bus Terminal \u2013 Jamadarpali Dyke",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_211",
        "route_number": "211",
        "route_name": "Ainthapali Bus Terminal \u2013 Jharsuguda",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_212",
        "route_number": "212",
        "route_name": "Ainthapali Bus Terminal \u2013 Baragarh",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213",
        "route_number": "213",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213a",
        "route_number": "213A",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_214",
        "route_number": "214",
        "route_name": "Ainthapali Bus Terminal \u2013 Kuchinda",
        "sequence_order": 3,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_215",
        "route_number": "215",
        "route_name": "Ainthapali Bus Terminal \u2013 Padiabahal",
        "sequence_order": 17,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_amruth_vihar",
    "name": "Amruth Vihar",
    "published_name": "AMRUTH VIHAR",
    "canonical_stop_id": "stop_crut_sambalpur_amruth_vihar",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.49046,
    "longitude": 83.991443,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_208",
        "route_number": "208",
        "route_name": "Dhanupali Chowk \u2013 Burla Hospital",
        "sequence_order": 36,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_214",
        "route_number": "214",
        "route_name": "Ainthapali Bus Terminal \u2013 Kuchinda",
        "sequence_order": 5,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_215",
        "route_number": "215",
        "route_name": "Ainthapali Bus Terminal \u2013 Padiabahal",
        "sequence_order": 19,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_birsa_munda_chowk",
    "name": "Birsa Munda Chowk",
    "published_name": "BIRSA MUNDA CHOWK",
    "canonical_stop_id": "stop_crut_sambalpur_birsa_munda_chowk",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.493747,
    "longitude": 83.988915,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_211",
        "route_number": "211",
        "route_name": "Ainthapali Bus Terminal \u2013 Jharsuguda",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213",
        "route_number": "213",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213a",
        "route_number": "213A",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 4,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_chc_debeipali",
    "name": "Chc Debeipali",
    "published_name": "CHC DEBEIPALI",
    "canonical_stop_id": "stop_crut_sambalpur_chc_debeipali",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.536393,
    "longitude": 84.023462,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_211",
        "route_number": "211",
        "route_name": "Ainthapali Bus Terminal \u2013 Jharsuguda",
        "sequence_order": 17,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213",
        "route_number": "213",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 17,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213a",
        "route_number": "213A",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 17,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_ghanteswari_temple",
    "name": "Ghanteswari Temple",
    "published_name": "Ghanteswari Temple",
    "canonical_stop_id": "stop_crut_sambalpur_ghanteswari_temple",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.35,
    "longitude": 83.9167,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_201",
        "route_number": "201",
        "route_name": "Ainthapali Bus Terminal \u2013 Ghanteswari Temple",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_206",
        "route_number": "206",
        "route_name": "Samaleswari Temple - Ghanteswari Temple",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_hirakud_dam",
    "name": "Hirakud Dam",
    "published_name": "Hirakud Dam",
    "canonical_stop_id": "stop_crut_sambalpur_hirakud_dam",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.527778,
    "longitude": 83.872222,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_203",
        "route_number": "203",
        "route_name": "Ainthapali Bus Terminal - Hirakud Dam",
        "sequence_order": 2,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_hirakud_ps",
    "name": "Hirakud P.s",
    "published_name": "HIRAKUD P.S",
    "canonical_stop_id": "stop_crut_sambalpur_hirakud_ps",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.527778,
    "longitude": 83.872222,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_205",
        "route_number": "205",
        "route_name": "Ainthapali Bus Terminal - Nuajamda",
        "sequence_order": 15,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_hirakud_ps_2",
    "name": "Hirakud P.s.",
    "published_name": "HIRAKUD P.S.",
    "canonical_stop_id": "stop_crut_sambalpur_hirakud_ps_2",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.527778,
    "longitude": 83.872222,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_205",
        "route_number": "205",
        "route_name": "Ainthapali Bus Terminal - Nuajamda",
        "sequence_order": 31,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_samaleswari_temple",
    "name": "Samaleswari Temple",
    "published_name": "Samaleswari Temple",
    "canonical_stop_id": "stop_crut_sambalpur_samaleswari_temple",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.463889,
    "longitude": 83.963889,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_206",
        "route_number": "206",
        "route_name": "Samaleswari Temple - Ghanteswari Temple",
        "sequence_order": 1,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  },
  {
    "stop_id": "stop_crut_sambalpur_sason_village_road",
    "name": "Sason Village Road",
    "published_name": "SASON VILLAGE ROAD",
    "canonical_stop_id": "stop_crut_sambalpur_sason_village_road",
    "city": "Sambalpur",
    "district": "Sambalpur",
    "locality": "Sambalpur",
    "latitude": 21.557249,
    "longitude": 84.039813,
    "coordinate_status": "official",
    "coordinate_source": "staticTransitStops_verified_survey",
    "agency": "CRUT (Capital Region Urban Transport)",
    "stop_type": "bus_stop",
    "routes_serving_stop": [
      {
        "route_id": "rt_crut_211",
        "route_number": "211",
        "route_name": "Ainthapali Bus Terminal \u2013 Jharsuguda",
        "sequence_order": 19,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213",
        "route_number": "213",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 19,
        "service_area": null,
        "origin": null,
        "destination": null
      },
      {
        "route_id": "rt_crut_213a",
        "route_number": "213A",
        "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
        "sequence_order": 19,
        "service_area": null,
        "origin": null,
        "destination": null
      }
    ]
  }
];

export const VERIFIED_TRANSIT_STOPS_BY_ID: Record<string, VerifiedTransitStop> = Object.fromEntries(
  VERIFIED_TRANSIT_STOPS.map((s) => [s.stop_id, s])
);

export function getTransitStopById(stopId: string): VerifiedTransitStop | undefined {
  return VERIFIED_TRANSIT_STOPS_BY_ID[stopId];
}

export function findNearbyTransitStops(
  latitude: number,
  longitude: number,
  radiusKm: number = 3.0
): Array<VerifiedTransitStop & { distanceKm: number }> {
  const R = 6371; // Earth radius in km
  const results: Array<VerifiedTransitStop & { distanceKm: number }> = [];
  for (const stop of VERIFIED_TRANSIT_STOPS) {
    const dLat = ((stop.latitude - latitude) * Math.PI) / 180;
    const dLon = ((stop.longitude - longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((latitude * Math.PI) / 180) *
        Math.cos((stop.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    if (dist <= radiusKm) {
      results.push({ ...stop, distanceKm: Math.round(dist * 100) / 100 });
    }
  }
  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results;
}

export function getVerifiedStaticNearbyStops(
  latitude: number,
  longitude: number,
  maxRadiusMeters: number = 35000,
  limit: number = 4
): NearbyStopResponse[] {
  const maxRadiusKm = maxRadiusMeters / 1000;
  const nearby = findNearbyTransitStops(latitude, longitude, maxRadiusKm);
  return nearby.slice(0, limit).map((s) => ({
    stop_id: s.stop_id,
    name: s.name,
    published_name: s.published_name,
    canonical_stop_id: s.canonical_stop_id,
    city: s.city,
    district: s.district,
    locality: s.locality,
    latitude: s.latitude,
    longitude: s.longitude,
    coordinate_status: s.coordinate_status,
    distance_m: Math.round(s.distanceKm * 1000),
    walking_estimate_mins: Math.max(1, Math.round((s.distanceKm * 1000) / 80)),
    region: s.city || "Odisha",
    routes_serving_stop: s.routes_serving_stop.map((r) => ({
      route_id: r.route_id,
      route_number: r.route_number,
      route_name: r.route_name || null,
      sequence_order: r.sequence_order ?? 1,
      service_area: r.service_area || null,
      origin: r.origin || null,
      destination: r.destination || null,
    })),
  }));
}
