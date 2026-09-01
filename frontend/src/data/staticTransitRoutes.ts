// AUTO-GENERATED FROM data/transport/canonical/
// DO NOT EDIT MANUALLY.
// Run: python scripts/generate_frontend_transit_data.py

export interface CanonicalRouteStopSequenceItem {
  sequence_order: number;
  stop_id: string;
  stop_name: string;
  is_routable: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CanonicalTransitRoute {
  route_id: string;
  route_number: string;
  route_name: string;
  agency: string;
  service_type: string;
  service_area: string;
  origin: string;
  destination: string;
  has_schedule: boolean;
  stops_count: number;
  stops_sequence: CanonicalRouteStopSequenceItem[];
}

export const CANONICAL_TRANSIT_ROUTES: CanonicalTransitRoute[] = [
  {
    "route_id": "rt_crut_08",
    "route_number": "08",
    "route_name": "IGKC Multispecialty Hospital \u2013 Sum Hospital (Campus -2) (via Sum Hospital",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "IGKC Multispecialty Hospital",
    "destination": "Sum Hospital",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_igkc_multispecialty_hospital",
        "stop_name": "Igkc Multispecialty Hospital",
        "is_routable": true,
        "latitude": 20.274059,
        "longitude": 85.764331
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_sum_hospital",
        "stop_name": "Sum Hospital",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_09",
    "route_number": "09",
    "route_name": "Bhubaneswar Railway Station - Patia (via Niladri Vihar)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Patia",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_niladri_vihar",
        "stop_name": "Niladri Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_patia",
        "stop_name": "Patia",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_10",
    "route_number": "10",
    "route_name": "Bhubaneswar Airport \u2013 Maulana Azad National Urdu University,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Airport",
    "destination": "Maulana Azad National Urdu University",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_airport",
        "stop_name": "Bhubaneswar Airport",
        "is_routable": true,
        "latitude": 20.252,
        "longitude": 85.8178
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_maulana_azad_national_urdu_university",
        "stop_name": "Maulana Azad National Urdu University",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_100",
    "route_number": "100",
    "route_name": "Rourkela New Bus Stand - Birsa Munda Hockey Stadium (via Ring Road, IGH, Chend Colony)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Birsa Munda Hockey Stadium",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_ring_road",
        "stop_name": "Ring Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_igh",
        "stop_name": "Igh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_chend_colony",
        "stop_name": "Chend Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_rourkela_birsa_munda_hockey_stadium",
        "stop_name": "Birsa Munda Hockey Stadium",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_101",
    "route_number": "101",
    "route_name": "Rourkela New Bus Stand - Laukera (via Udit Nagar, Hanuman Vatika Chowk, Chhend, Airport)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Laukera",
    "has_schedule": true,
    "stops_count": 6,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_udit_nagar",
        "stop_name": "Udit Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_hanuman_vatika_chowk",
        "stop_name": "Hanuman Vatika Chowk",
        "is_routable": true,
        "latitude": 22.216667,
        "longitude": 84.85
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_chhend",
        "stop_name": "Chhend",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_bhubaneswar_airport",
        "stop_name": "Airport",
        "is_routable": true,
        "latitude": 20.252295,
        "longitude": 85.813485
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_rourkela_laukera",
        "stop_name": "Laukera",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_101e",
    "route_number": "101E",
    "route_name": "Rourkela New Bus Stand \u2013 Panposh Station(",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Panposh Station",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_panposh_station",
        "stop_name": "Panposh Station",
        "is_routable": true,
        "latitude": 22.228599,
        "longitude": 84.805323
      }
    ]
  },
  {
    "route_id": "rt_crut_102",
    "route_number": "102",
    "route_name": "Vedvyas - Jhirpani (via Panposh,Chhend Chowk, Koel Nagar)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Vedvyas",
    "destination": "Jhirpani",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_vedvyas",
        "stop_name": "Vedvyas",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_panposh",
        "stop_name": "Panposh",
        "is_routable": true,
        "latitude": 22.228599,
        "longitude": 84.805323
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_chhend_chowk",
        "stop_name": "Chhend Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_koel_nagar",
        "stop_name": "Koel Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_rourkela_jhirpani",
        "stop_name": "Jhirpani",
        "is_routable": true,
        "latitude": 22.268472,
        "longitude": 84.90068
      }
    ]
  },
  {
    "route_id": "rt_crut_103",
    "route_number": "103",
    "route_name": "Rourkela New Bus Stand \u2013 Panposh( Via-Uditnagar,Hanuman Vatika Chowk,Chhend)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Panposh",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_uditnagar",
        "stop_name": "Uditnagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_hanuman_vatika_chowk",
        "stop_name": "Hanuman Vatika Chowk",
        "is_routable": true,
        "latitude": 22.216667,
        "longitude": 84.85
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_chhend",
        "stop_name": "Chhend",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_rourkela_panposh",
        "stop_name": "Panposh",
        "is_routable": true,
        "latitude": 22.228599,
        "longitude": 84.805323
      }
    ]
  },
  {
    "route_id": "rt_crut_104",
    "route_number": "104",
    "route_name": "Rourkela New Bus Stand - Jhirpani(via Sector-2,Nit,Jagda Chowk)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Jhirpani",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_sector_2",
        "stop_name": "Sector-2",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_nit",
        "stop_name": "NIT",
        "is_routable": true,
        "latitude": 22.25312,
        "longitude": 84.90159
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_jagda_chowk",
        "stop_name": "Jagda Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_rourkela_jhirpani",
        "stop_name": "Jhirpani",
        "is_routable": true,
        "latitude": 22.268472,
        "longitude": 84.90068
      }
    ]
  },
  {
    "route_id": "rt_crut_105",
    "route_number": "105",
    "route_name": "Rourkela New Bus Stand - Rajgangpur (via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Rajgangpur",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_rajgangpur",
        "stop_name": "Rajgangpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_106",
    "route_number": "106",
    "route_name": "Rourkela New Bus Stand - Birmitrapur (via Ring Road, NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Birmitrapur",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_ring_road",
        "stop_name": "Ring Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_birmitrapur",
        "stop_name": "Birmitrapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_107",
    "route_number": "107",
    "route_name": "Rourkela New Bus Stand - Teterkela (via Bondamunda)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Teterkela",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_bondamunda",
        "stop_name": "Bondamunda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_teterkela",
        "stop_name": "Teterkela",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_108",
    "route_number": "108",
    "route_name": "Rourkela New Bus Stand \u2013 Nuagaon (via Jagda Chowk, Jhirpani, Khuntagaon)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Nuagaon",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_jagda_chowk",
        "stop_name": "Jagda Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_jhirpani",
        "stop_name": "Jhirpani",
        "is_routable": true,
        "latitude": 22.268472,
        "longitude": 84.90068
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_khuntagaon",
        "stop_name": "Khuntagaon",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_rourkela_nuagaon",
        "stop_name": "Nuagaon",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_109",
    "route_number": "109",
    "route_name": "Rourkela New Bus Stand \u2013 Lathikata (via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Lathikata",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_lathikata",
        "stop_name": "Lathikata",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_11",
    "route_number": "11",
    "route_name": "Trishulia Bus Stand \u2013 Bhubaneswar Railway Station(via Nandankana, Acharya",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Trishulia Bus Stand",
    "destination": "Bhubaneswar Railway Station",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_trishulia_bus_stand",
        "stop_name": "Trishulia Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      }
    ]
  },
  {
    "route_id": "rt_crut_110",
    "route_number": "110",
    "route_name": "Rourkela New Bus Stand \u2013 Kalunga (via Raghunathpali)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Kalunga",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_raghunathpali",
        "stop_name": "Raghunathpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_kalunga",
        "stop_name": "Kalunga",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_111",
    "route_number": "111",
    "route_name": "Rourkela New Bus Stand \u2013 Bonaigarh",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Bonaigarh",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_bonaigarh",
        "stop_name": "Bonaigarh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_112",
    "route_number": "112",
    "route_name": "Rourkela New Bus Stand \u2013 Lahunipara",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Lahunipara",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_lahunipara",
        "stop_name": "Lahunipara",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_113",
    "route_number": "113",
    "route_name": "Rourkela New Bus Stand \u2013 Ushra (via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Ushra",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_ushra",
        "stop_name": "Ushra",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_114",
    "route_number": "114",
    "route_name": "Rourkela New Bus Stand - Nuagaon (via Hatibari)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Nuagaon",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_hatibari",
        "stop_name": "Hatibari",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_nuagaon",
        "stop_name": "Nuagaon",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_115",
    "route_number": "115",
    "route_name": "Rourkela New Bus Stand \u2013 Potab (via Hatibari)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Potab",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_hatibari",
        "stop_name": "Hatibari",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_potab",
        "stop_name": "Potab",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_116",
    "route_number": "116",
    "route_name": "Rourkela New Bus Stand \u2013 Loram (via NIT, Jagda Chowk, Khutagaon, Sorda)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Loram",
    "has_schedule": true,
    "stops_count": 6,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_nit",
        "stop_name": "NIT",
        "is_routable": true,
        "latitude": 22.25312,
        "longitude": 84.90159
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_jagda_chowk",
        "stop_name": "Jagda Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_khutagaon",
        "stop_name": "Khutagaon",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_rourkela_sorda",
        "stop_name": "Sorda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_rourkela_loram",
        "stop_name": "Loram",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_117",
    "route_number": "117",
    "route_name": "Rourkela New Bus Stand \u2013 Jaraikela (via Bondamunda, Bisra)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Jaraikela",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_bondamunda",
        "stop_name": "Bondamunda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_bisra",
        "stop_name": "Bisra",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_jaraikela",
        "stop_name": "Jaraikela",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_118",
    "route_number": "118",
    "route_name": "Rourkela New Bus Stand \u2013 Salangabahal (via Kuarmunda,Biramitrapur)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Salangabahal",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_kuarmunda",
        "stop_name": "Kuarmunda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_biramitrapur",
        "stop_name": "Biramitrapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_salangabahal",
        "stop_name": "Salangabahal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_119",
    "route_number": "119",
    "route_name": "Rourkela New Bus Stand \u2013 Kutra (via Rajgangpur Bypass)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Kutra",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_rajgangpur_bypass",
        "stop_name": "Rajgangpur Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_kutra",
        "stop_name": "Kutra",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_12",
    "route_number": "12",
    "route_name": "Nandankanan - Bhubaneswar Railway Station (via Jaydev Vihar)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Nandankanan",
    "destination": "Bhubaneswar Railway Station",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_nandankanan",
        "stop_name": "Nandankanan",
        "is_routable": true,
        "latitude": 20.347814,
        "longitude": 85.824766
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_jaydev_vihar",
        "stop_name": "Jaydev Vihar",
        "is_routable": true,
        "latitude": 20.301,
        "longitude": 85.823
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      }
    ]
  },
  {
    "route_id": "rt_crut_120",
    "route_number": "120",
    "route_name": "Rourkela New Bus Stand \u2013 Gurundia (via Disco Chowk,Soldega)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Gurundia",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_disco_chowk",
        "stop_name": "Disco Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_soldega",
        "stop_name": "Soldega",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_gurundia",
        "stop_name": "Gurundia",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_121",
    "route_number": "121",
    "route_name": "DAV POND \u2013 Radio Station (Kantajhor) (via Basanti Colony, New Bus Stand, NIT)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "DAV POND",
    "destination": "Radio Station",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_dav_pond",
        "stop_name": "Dav Pond",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_basanti_colony",
        "stop_name": "Basanti Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_berhampur_new_bus_stand",
        "stop_name": "New Bus Stand",
        "is_routable": true,
        "latitude": 19.312894,
        "longitude": 84.802658
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_nit",
        "stop_name": "NIT",
        "is_routable": true,
        "latitude": 22.25312,
        "longitude": 84.90159
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_rourkela_radio_station",
        "stop_name": "Radio Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_122",
    "route_number": "122",
    "route_name": "Shakti Nagar \u2013 Tarapur Filter House (Laxmi Market)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Shakti Nagar",
    "destination": "Tarapur Filter House",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_shakti_nagar",
        "stop_name": "Shakti Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_tarapur_filter_house",
        "stop_name": "Tarapur Filter House",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_124",
    "route_number": "124",
    "route_name": "Rourkela New Bus Stand \u2013 Hamirpur (via Malgodown, Basanti Colony, Chennd Colony, IGH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Rourkela",
    "origin": "Rourkela New Bus Stand",
    "destination": "Hamirpur",
    "has_schedule": true,
    "stops_count": 6,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_rourkela_rourkela_new_bus_stand",
        "stop_name": "Rourkela New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_rourkela_malgodown",
        "stop_name": "Malgodown",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_rourkela_basanti_colony",
        "stop_name": "Basanti Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_rourkela_chennd_colony",
        "stop_name": "Chennd Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_rourkela_igh",
        "stop_name": "Igh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_rourkela_hamirpur",
        "stop_name": "Hamirpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_13",
    "route_number": "13",
    "route_name": "Nandankanan Botanical Garden \u2013Lingipur (via AG Square)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Nandankanan Botanical Garden",
    "destination": "Lingipur",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_nandankanan_botanical_garden",
        "stop_name": "Nandankanan Botanical Garden",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_ag_square",
        "stop_name": "Ag Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_lingipur",
        "stop_name": "Lingipur",
        "is_routable": true,
        "latitude": 20.213789,
        "longitude": 85.853611
      }
    ]
  },
  {
    "route_id": "rt_crut_13e",
    "route_number": "13E",
    "route_name": "Nandankanan Botanical Garden \u2013 Dhauli(via AG Square)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Nandankanan Botanical Garden",
    "destination": "Dhauli",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_nandankanan_botanical_garden",
        "stop_name": "Nandankanan Botanical Garden",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_ag_square",
        "stop_name": "Ag Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_dhauli",
        "stop_name": "Dhauli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_14",
    "route_number": "14",
    "route_name": "Kalinga Vihar \u2013 Bhubaneswar Railway Station (Via Sum Ultimate,BSABT,OUAT,AG)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Kalinga Vihar",
    "destination": "Bhubaneswar Railway Station",
    "has_schedule": true,
    "stops_count": 6,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_kalinga_vihar",
        "stop_name": "Kalinga Vihar",
        "is_routable": true,
        "latitude": 20.261627,
        "longitude": 85.760884
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_sum_ultimate",
        "stop_name": "Sum Ultimate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_bsabt",
        "stop_name": "Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_ouat",
        "stop_name": "OUAT",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_bhubaneswar_ag",
        "stop_name": "Ag",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      }
    ]
  },
  {
    "route_id": "rt_crut_15",
    "route_number": "15",
    "route_name": "Cuttack Netaji Bus Terminus (CNBT) \u2013 Utkal Hospital (Via Judicial Square,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Cuttack Netaji Bus Terminus (CNBT)",
    "destination": "Utkal Hospital",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_cuttack_netaji_bus_terminus_cnbt_2",
        "stop_name": "Cuttack Netaji Bus Terminus Cnbt",
        "is_routable": true,
        "latitude": 20.452,
        "longitude": 85.875
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_utkal_hospital",
        "stop_name": "Utkal Hospital",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_15e",
    "route_number": "15E",
    "route_name": "Cuttack Netaji Bus Terminus (CNBT) \u2013 Salia Sahi (Via Judicial Square,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Cuttack Netaji Bus Terminus (CNBT)",
    "destination": "Salia Sahi",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_cuttack_netaji_bus_terminus_cnbt_2",
        "stop_name": "Cuttack Netaji Bus Terminus Cnbt",
        "is_routable": true,
        "latitude": 20.452,
        "longitude": 85.875
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_salia_sahi",
        "stop_name": "Salia Sahi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_16",
    "route_number": "16",
    "route_name": "Bhubaneswar Railway Station \u2013 Sri Sri University, Kataka (via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Sri Sri University, Kataka",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_sri_sri_university_kataka",
        "stop_name": "Sri Sri University, Kataka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_17",
    "route_number": "17",
    "route_name": "Biju Patnaik International Airport, BBSR- Barabati Stadium, Cuttack (via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Biju Patnaik International Airport, BBSR",
    "destination": "Barabati Stadium, Cuttack",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_biju_patnaik_international_airport_bbsr",
        "stop_name": "Biju Patnaik International Airport, Bbsr",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_barabati_stadium_cuttack",
        "stop_name": "Barabati Stadium, Cuttack",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_18",
    "route_number": "18",
    "route_name": "Baramunda BSABT \u2013 Jagatpur (via Nandankanan)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "Jagatpur",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nandankanan",
        "stop_name": "Nandankanan",
        "is_routable": true,
        "latitude": 20.347814,
        "longitude": 85.824766
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_jagatpur",
        "stop_name": "Jagatpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_19",
    "route_number": "19",
    "route_name": "AIIMS - OMP Square-Mahanadi Vihar (via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "AIIMS",
    "destination": "OMP Square-Mahanadi Vihar",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_aiims",
        "stop_name": "AIIMS",
        "is_routable": true,
        "latitude": 20.236178,
        "longitude": 85.778299
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_omp_square_mahanadi_vihar",
        "stop_name": "Omp Square-mahanadi Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_20",
    "route_number": "20",
    "route_name": "Bhubaneswar Railway Station \u2013 Khordha New Bus Stand (via Vani Vihar)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Khordha New Bus Stand",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_vani_vihar",
        "stop_name": "Vani Vihar",
        "is_routable": true,
        "latitude": 20.303273,
        "longitude": 85.839744
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_khordha_new_bus_stand",
        "stop_name": "Khordha New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_200",
    "route_number": "200",
    "route_name": "Khetrajpur Railway station - City Railway station",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Khetrajpur Railway station",
    "destination": "City Railway station",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_khetrajpur_railway_station",
        "stop_name": "Khetrajpur Railway Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_city_railway_station",
        "stop_name": "City Railway Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_201",
    "route_number": "201",
    "route_name": "Ainthapali Bus Terminal \u2013 Ghanteswari Temple",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Ghanteswari Temple",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_ghanteswari_temple",
        "stop_name": "Ghanteswari Temple",
        "is_routable": true,
        "latitude": 21.35,
        "longitude": 83.9167
      }
    ]
  },
  {
    "route_id": "rt_crut_202",
    "route_number": "202",
    "route_name": "Ainthapali Bus Terminal \u2013 Atal Chowk",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Atal Chowk",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_atal_chowk",
        "stop_name": "Atal Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_203",
    "route_number": "203",
    "route_name": "Ainthapali Bus Terminal - Hirakud Dam",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Hirakud Dam",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_hirakud_dam",
        "stop_name": "Hirakud Dam",
        "is_routable": true,
        "latitude": 21.527778,
        "longitude": 83.872222
      }
    ]
  },
  {
    "route_id": "rt_crut_204",
    "route_number": "204",
    "route_name": "Ainthapali Bus Terminal - Maneswar",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Maneswar",
    "has_schedule": false,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_maneswar",
        "stop_name": "Maneswar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_205",
    "route_number": "205",
    "route_name": "Ainthapali Bus Terminal - Nuajamda",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Nuajamda",
    "has_schedule": true,
    "stops_count": 35,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_nuajamada",
        "stop_name": "Nuajamada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_nuagujatala",
        "stop_name": "Nuagujatala",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_nuajamada_chowk",
        "stop_name": "Nuajamada Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_sambalpur_gundurupada",
        "stop_name": "Gundurupada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_sambalpur_alind_chowk",
        "stop_name": "Alind Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_sambalpur_smelter_main_gate",
        "stop_name": "Smelter Main Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_sambalpur_durga_mandir_chowk",
        "stop_name": "Durga Mandir Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_sambalpur_idc_chowk",
        "stop_name": "Idc Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_sambalpur_samaleswari_temple_hirakud",
        "stop_name": "Samaleswari Temple, Hirakud",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_sambalpur_iti_colony",
        "stop_name": "Iti Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_sambalpur_vss_chowk",
        "stop_name": "Vss Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_sambalpur_hirakud_school",
        "stop_name": "Hirakud School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_sambalpur_hindalco_chowk",
        "stop_name": "Hindalco Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_sambalpur_hirakud_ps",
        "stop_name": "Hirakud P.s",
        "is_routable": true,
        "latitude": 21.527778,
        "longitude": 83.872222
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_sambalpur_hil",
        "stop_name": "Hil",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_jhankarpada",
        "stop_name": "Jhankarpada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_sambalpur_shaktinagar_hirakud",
        "stop_name": "Shaktinagar, Hirakud",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_naradihi",
        "stop_name": "Naradihi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_sambalpur_sidheswar_temple_chowk",
        "stop_name": "Sidheswar Temple Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_sambalpur_panchagochhia",
        "stop_name": "Panchagochhia",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_sambalpur_vikash_school",
        "stop_name": "Vikash School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_sambalpur_bareipali",
        "stop_name": "Bareipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_sambalpur_duanpali_road",
        "stop_name": "Duanpali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_sambalpur_rmc_office",
        "stop_name": "Rmc Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_sambalpur_gopalpali",
        "stop_name": "Gopalpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_sambalpur_remed_chowk",
        "stop_name": "Remed Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_sambalpur_bhangamunda",
        "stop_name": "Bhangamunda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_sambalpur_tikirapada",
        "stop_name": "Tikirapada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_sambalpur_sainath_colony",
        "stop_name": "Sainath Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_sambalpur_rk_rice_mill",
        "stop_name": "Rk Rice Mill",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_sambalpur_larpank",
        "stop_name": "Larpank",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_sambalpur_raja_pada",
        "stop_name": "Raja Pada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_sambalpur_hirakud_college",
        "stop_name": "Hirakud College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_sambalpur_fci",
        "stop_name": "Fci",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_206",
    "route_number": "206",
    "route_name": "Samaleswari Temple - Ghanteswari Temple",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Samaleswari Temple",
    "destination": "Ghanteswari Temple",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_samaleswari_temple",
        "stop_name": "Samaleswari Temple",
        "is_routable": true,
        "latitude": 21.463889,
        "longitude": 83.963889
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_ghanteswari_temple",
        "stop_name": "Ghanteswari Temple",
        "is_routable": true,
        "latitude": 21.35,
        "longitude": 83.9167
      }
    ]
  },
  {
    "route_id": "rt_crut_207",
    "route_number": "207",
    "route_name": "Ainthapali Bus Terminal \u2013 Dhama",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Dhama",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_dhama",
        "stop_name": "Dhama",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_208",
    "route_number": "208",
    "route_name": "Dhanupali Chowk \u2013 Burla Hospital",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Dhanupali Chowk",
    "destination": "Burla Hospital",
    "has_schedule": true,
    "stops_count": 55,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_burla_hospital",
        "stop_name": "Burla Hospital",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_dhanupali_chowk",
        "stop_name": "Dhanupali Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_burla_hospital_back_gate",
        "stop_name": "Burla Hospital Back Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_phed_office",
        "stop_name": "Phed Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_sambalpur_gangadhar_meher_chowk",
        "stop_name": "Gangadhar Meher Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_sambalpur_gargi_ladies_hostel",
        "stop_name": "Gargi Ladies Hostel",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_sambalpur_medical_chowkburla",
        "stop_name": "Medical Chowk,burla",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_sambalpur_sourav_vihar",
        "stop_name": "Sourav Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_sambalpur_kirba_chowk",
        "stop_name": "Kirba Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_sambalpur_vssut_burla",
        "stop_name": "Vssut, Burla",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_sambalpur_mclanand_vihar",
        "stop_name": "Mcl,anand Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_sambalpur_pc_bridge_chowk",
        "stop_name": "P.c Bridge Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_sambalpur_mcl_chowk",
        "stop_name": "Mcl Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_sambalpur_gohira_tikira",
        "stop_name": "Gohira Tikira",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_sambalpur_lakshmi_dunguri_chowk",
        "stop_name": "Lakshmi Dunguri Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_sambalpur_mahindra_showroom",
        "stop_name": "Mahindra Showroom",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_remed_chowk",
        "stop_name": "Remed Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_sambalpur_gopalpali",
        "stop_name": "Gopalpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_rmc_office",
        "stop_name": "Rmc Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_sambalpur_duanpali_road",
        "stop_name": "Duanpali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_sambalpur_bareipali",
        "stop_name": "Bareipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_sambalpur_vikash_school",
        "stop_name": "Vikash School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_sambalpur_sp_vigilance_office",
        "stop_name": "Sp Vigilance Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_sambalpur_motijharan_chowk",
        "stop_name": "Motijharan Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_sambalpur_govt_women_college",
        "stop_name": "Govt. Women College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_sambalpur_echs_polyclinic",
        "stop_name": "Echs Polyclinic",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_sambalpur_raza_nagar_chowk",
        "stop_name": "Raza Nagar Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_sambalpur_deer_park_square",
        "stop_name": "Deer Park Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_sambalpur_sonapali_chowk",
        "stop_name": "Sonapali Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_sambalpur_dhankauda_field",
        "stop_name": "Dhankauda Field",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_sambalpur_dhankauda_high_school",
        "stop_name": "Dhankauda High School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_sambalpur_uphc_dhankauda",
        "stop_name": "Uphc Dhankauda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_sambalpur_dhankauda_chowk",
        "stop_name": "Dhankauda Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_sambalpur_city_railway_station_square",
        "stop_name": "City Railway Station Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_sambalpur_sakhipada",
        "stop_name": "Sakhipada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_sambalpur_amruth_vihar",
        "stop_name": "Amruth Vihar",
        "is_routable": true,
        "latitude": 21.49046,
        "longitude": 83.991443
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_sambalpur_birsa_munda_chowk_ainthapali",
        "stop_name": "Birsa Munda Chowk, Ainthapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
        "stop_name": "Ainthapali Chowk",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_sambalpur_sidheswar_temple_chowk",
        "stop_name": "Sidheswar Temple Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_sambalpur_panchagochhia",
        "stop_name": "Panchagochhia",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_sambalpur_gengutipali_u_p_school",
        "stop_name": "Gengutipali U P School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_sambalpur_gengutipali_chowk",
        "stop_name": "Gengutipali Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_sambalpur_shiv_mandir_chowk",
        "stop_name": "Shiv Mandir Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_sambalpur_shree_ram_chowk",
        "stop_name": "Shree Ram Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_sambalpur_nscb_college",
        "stop_name": "Nscb College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_sambalpur_nscb_college_bypass",
        "stop_name": "Nscb College Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 48,
        "stop_id": "stop_crut_sambalpur_maruti_vihar",
        "stop_name": "Maruti Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 49,
        "stop_id": "stop_crut_sambalpur_kuluthkani_chowk",
        "stop_name": "Kuluthkani Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 50,
        "stop_id": "stop_crut_sambalpur_hanuman_mandir_chowk",
        "stop_name": "Hanuman Mandir Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 51,
        "stop_id": "stop_crut_sambalpur_charbhati_chowk",
        "stop_name": "Charbhati Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 52,
        "stop_id": "stop_crut_sambalpur_govindtola_durga_mandap",
        "stop_name": "Govindtola Durga Mandap",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 53,
        "stop_id": "stop_crut_sambalpur_petrol_pump_govindtola",
        "stop_name": "Petrol Pump, Govindtola",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 54,
        "stop_id": "stop_crut_sambalpur_dhanupali_square",
        "stop_name": "Dhanupali Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 55,
        "stop_id": "stop_crut_sambalpur_mahavir_square",
        "stop_name": "Mahavir Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_209",
    "route_number": "209",
    "route_name": "Khetrajpur Rly. Station \u2013 Osou Sambalpur",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Khetrajpur Rly. Station",
    "destination": "Osou Sambalpur",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_khetrajpur_rly_station",
        "stop_name": "Khetrajpur Rly. Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_osou_sambalpur",
        "stop_name": "Osou Sambalpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_21",
    "route_number": "21",
    "route_name": "Bhubaneswar Railway Station - Khordha New Bus Stand (via OUAT)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Khordha New Bus Stand",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_ouat",
        "stop_name": "OUAT",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_khordha_new_bus_stand",
        "stop_name": "Khordha New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_210",
    "route_number": "210",
    "route_name": "Ainthapali Bus Terminal \u2013 Jamadarpali Dyke",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Jamadarpali Dyke",
    "has_schedule": true,
    "stops_count": 20,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_jamadarpali_dyke",
        "stop_name": "Jamadarpali Dyke",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
        "stop_name": "Ainthapali Chowk",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_karam_toli",
        "stop_name": "Karam Toli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_sambalpur_city_palace",
        "stop_name": "City Palace",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_sambalpur_gayatri_colony",
        "stop_name": "Gayatri Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_sambalpur_lic_colony",
        "stop_name": "Lic Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_sambalpur_master_colony",
        "stop_name": "Master Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_sambalpur_kainsir_village_road",
        "stop_name": "Kainsir Village Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_sambalpur_singhpali_chowk",
        "stop_name": "Singhpali Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_sambalpur_mahavir_chowk",
        "stop_name": "Mahavir Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_sambalpur_gayatri_nursing",
        "stop_name": "Gayatri Nursing",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_sambalpur_college_chowk",
        "stop_name": "College Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_sambalpur_jamadarpali_village",
        "stop_name": "Jamadarpali Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_sambalpur_jattu_pada",
        "stop_name": "Jattu Pada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_sambalpur_dale_pada",
        "stop_name": "Dale Pada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_tipu_pada",
        "stop_name": "Tipu Pada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_sambalpur_jogipali_chowk",
        "stop_name": "Jogipali Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_daniel_public_school",
        "stop_name": "Daniel Public School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_sambalpur_anisha_ladies_hostel",
        "stop_name": "Anisha Ladies Hostel",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_211",
    "route_number": "211",
    "route_name": "Ainthapali Bus Terminal \u2013 Jharsuguda",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Jharsuguda",
    "has_schedule": true,
    "stops_count": 73,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_jharsuguda_new_bus_terminal",
        "stop_name": "Jharsuguda New Bus Terminal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
        "stop_name": "Ainthapali Chowk",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_birsa_munda_chowk",
        "stop_name": "Birsa Munda Chowk",
        "is_routable": true,
        "latitude": 21.493747,
        "longitude": 83.988915
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_sambalpur_sriram_vihar",
        "stop_name": "Sriram Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_sambalpur_kamakhya_temple_malipali",
        "stop_name": "Kamakhya Temple Malipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_sambalpur_bhalupali",
        "stop_name": "Bhalupali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_sambalpur_baidarnuapali",
        "stop_name": "Baidarnuapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_sambalpur_fisheries_office",
        "stop_name": "Fisheries Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_sambalpur_pardhiapali",
        "stop_name": "Pardhiapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_sambalpur_pardhiapali_road",
        "stop_name": "Pardhiapali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_sambalpur_kia_sambalpur",
        "stop_name": "Kia Sambalpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_sambalpur_gupteswar_nagar",
        "stop_name": "Gupteswar Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_sambalpur_rengali_fire_office",
        "stop_name": "Rengali Fire Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_sambalpur_talab",
        "stop_name": "Talab",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_sambalpur_hanuman_temple_debeipali",
        "stop_name": "Hanuman Temple Debeipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_chc_debeipali",
        "stop_name": "Chc Debeipali",
        "is_routable": true,
        "latitude": 21.536393,
        "longitude": 84.023462
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_sambalpur_badriprasad_college",
        "stop_name": "Badriprasad College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_sason_village_road",
        "stop_name": "Sason Village Road",
        "is_routable": true,
        "latitude": 21.557249,
        "longitude": 84.039813
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_sambalpur_kankhinda",
        "stop_name": "Kankhinda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_sambalpur_vikash_school",
        "stop_name": "Vikash School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_sambalpur_amba_pada",
        "stop_name": "Amba Pada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_sambalpur_bhalubahal",
        "stop_name": "Bhalubahal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_sambalpur_sason_toll_gate",
        "stop_name": "Sason Toll Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_sambalpur_pradhanpali_road",
        "stop_name": "Pradhanpali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_sambalpur_kilasama_road",
        "stop_name": "Kilasama Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_sambalpur_nuarampela",
        "stop_name": "Nuarampela",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_sambalpur_police_station_rengali",
        "stop_name": "Police Station Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_sambalpur_rengali_bypass_square",
        "stop_name": "Rengali Bypass Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_sambalpur_chc_rengali",
        "stop_name": "Chc Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_sambalpur_bus_stand_rengali",
        "stop_name": "Bus Stand Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_sambalpur_hanuman_temple_rengali",
        "stop_name": "Hanuman Temple Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_sambalpur_puruna_basti",
        "stop_name": "Puruna Basti",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_sambalpur_ramchandra_nagar",
        "stop_name": "Ramchandra Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_sambalpur_fire_office_rengali",
        "stop_name": "Fire Office Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_sambalpur_shyam_metallics_g_1",
        "stop_name": "Shyam Metallics G-1",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_sambalpur_shyam_metallics_g_2",
        "stop_name": "Shyam Metallics G-2",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_sambalpur_pandaloi",
        "stop_name": "Pandaloi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_sambalpur_viraj_steel",
        "stop_name": "Viraj Steel",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_sambalpur_gurupali",
        "stop_name": "Gurupali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_sambalpur_aditya_aluminium",
        "stop_name": "Aditya Aluminium",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_sambalpur_lapanga_chowk",
        "stop_name": "Lapanga Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_sambalpur_bansimal",
        "stop_name": "Bansimal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_sambalpur_khinda",
        "stop_name": "Khinda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_sambalpur_paulepada",
        "stop_name": "Paulepada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_sambalpur_thelkoloi_high_school",
        "stop_name": "Thelkoloi High School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_sambalpur_police_station_thelkoloi",
        "stop_name": "Police Station Thelkoloi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 48,
        "stop_id": "stop_crut_sambalpur_thelkoloi",
        "stop_name": "Thelkoloi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 49,
        "stop_id": "stop_crut_sambalpur_jsw_main_gate",
        "stop_name": "Jsw Main Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 50,
        "stop_id": "stop_crut_sambalpur_jsw_plaza_gate",
        "stop_name": "Jsw Plaza Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 51,
        "stop_id": "stop_crut_sambalpur_sripura_road",
        "stop_name": "Sripura Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 52,
        "stop_id": "stop_crut_sambalpur_taraikela",
        "stop_name": "Taraikela",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 53,
        "stop_id": "stop_crut_sambalpur_tumbekela",
        "stop_name": "Tumbekela",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 54,
        "stop_id": "stop_crut_sambalpur_kherual",
        "stop_name": "Kherual",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 55,
        "stop_id": "stop_crut_sambalpur_sahapada_road",
        "stop_name": "Sahapada Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 56,
        "stop_id": "stop_crut_sambalpur_sahapada",
        "stop_name": "Sahapada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 57,
        "stop_id": "stop_crut_sambalpur_badmal_police_station",
        "stop_name": "Badmal Police Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 58,
        "stop_id": "stop_crut_sambalpur_badmal",
        "stop_name": "Badmal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 59,
        "stop_id": "stop_crut_sambalpur_jharsuguda_bypass",
        "stop_name": "Jharsuguda Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 60,
        "stop_id": "stop_crut_sambalpur_power_house_road",
        "stop_name": "Power House Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 61,
        "stop_id": "stop_crut_sambalpur_sarosmal",
        "stop_name": "Sarosmal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 62,
        "stop_id": "stop_crut_sambalpur_beherapat_chowk",
        "stop_name": "Beherapat Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 63,
        "stop_id": "stop_crut_sambalpur_btm_bypass_overbridge",
        "stop_name": "Btm Bypass Overbridge",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 64,
        "stop_id": "stop_crut_sambalpur_btm_bypass",
        "stop_name": "Btm Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 65,
        "stop_id": "stop_crut_sambalpur_shiv_mandir",
        "stop_name": "Shiv Mandir",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 66,
        "stop_id": "stop_crut_sambalpur_bombay_chowk",
        "stop_name": "Bombay Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 67,
        "stop_id": "stop_crut_sambalpur_bijju_nagar",
        "stop_name": "Bijju Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 68,
        "stop_id": "stop_crut_sambalpur_beheramal_chowk",
        "stop_name": "Beheramal Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 69,
        "stop_id": "stop_crut_sambalpur_mcl_auditorium",
        "stop_name": "Mcl Auditorium",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 70,
        "stop_id": "stop_crut_sambalpur_maa_tarini_temple",
        "stop_name": "Maa Tarini Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 71,
        "stop_id": "stop_crut_sambalpur_district_collectorate_office",
        "stop_name": "District Collectorate Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 72,
        "stop_id": "stop_crut_sambalpur_jharsuguda_new_bus_stand_bypass",
        "stop_name": "Jharsuguda New Bus Stand Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 73,
        "stop_id": "stop_crut_sambalpur_jharsuguda",
        "stop_name": "Jharsuguda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_212",
    "route_number": "212",
    "route_name": "Ainthapali Bus Terminal \u2013 Baragarh",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Baragarh",
    "has_schedule": true,
    "stops_count": 59,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_bargarh",
        "stop_name": "Bargarh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
        "stop_name": "Ainthapali Chowk",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_tpwodl_chowk",
        "stop_name": "Tpwodl Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_sambalpur_panchagochhia",
        "stop_name": "Panchagochhia",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_sambalpur_vikash_school",
        "stop_name": "Vikash School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_sambalpur_bareipali",
        "stop_name": "Bareipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_sambalpur_truck_association",
        "stop_name": "Truck Association",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_sambalpur_rmc_office",
        "stop_name": "Rmc Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_sambalpur_gopalpali",
        "stop_name": "Gopalpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_sambalpur_remed_chowk",
        "stop_name": "Remed Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_sambalpur_mahindra_showroom",
        "stop_name": "Mahindra Showroom",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_sambalpur_lakshmi_dunguri_chowk",
        "stop_name": "Lakshmi Dunguri Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_sambalpur_gohira_tikira",
        "stop_name": "Gohira Tikira",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_sambalpur_pc_bridge_chowk",
        "stop_name": "P.c Bridge Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_sambalpur_mcl_chowk",
        "stop_name": "Mcl Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_hirakud_railway_station",
        "stop_name": "Hirakud Railway Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_sambalpur_golgunda_village_road",
        "stop_name": "Golgunda Village Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_akatapali",
        "stop_name": "A.katapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_sambalpur_mudhi_mill",
        "stop_name": "Mudhi Mill",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_sambalpur_silvermoon_hotel",
        "stop_name": "Silvermoon Hotel",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_sambalpur_attabira_chowk",
        "stop_name": "Attabira Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_sambalpur_attabira_market",
        "stop_name": "Attabira Market",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_sambalpur_attabira_railway_station",
        "stop_name": "Attabira Railway Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_sambalpur_chowk",
        "stop_name": "Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_sambalpur_saranda_chowk",
        "stop_name": "Saranda Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_sambalpur_saranda_high_school",
        "stop_name": "Saranda High School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_sambalpur_chakuli_fam",
        "stop_name": "Chakuli Fam",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_sambalpur_shiva_mandir_gartiapali",
        "stop_name": "Shiva Mandir, Gartiapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_sambalpur_godbhaga_chowk",
        "stop_name": "Godbhaga Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_sambalpur_saraswat_mahavidyalaya",
        "stop_name": "Saraswat Mahavidyalaya",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_sambalpur_godbhaga",
        "stop_name": "Godbhaga",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_sambalpur_godbhaga_railway_station",
        "stop_name": "Godbhaga Railway Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_sambalpur_ladukhai",
        "stop_name": "Ladukhai",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_sambalpur_bhoitikira",
        "stop_name": "Bhoitikira",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_sambalpur_babubandh",
        "stop_name": "Babubandh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_sambalpur_goshala_market",
        "stop_name": "Goshala Market",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_sambalpur_jnv_goshala",
        "stop_name": "Jnv, Goshala",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_sambalpur_sambalpur_dairy",
        "stop_name": "Sambalpur Dairy",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_sambalpur_baijamunda",
        "stop_name": "Baijamunda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_sambalpur_lathi_chowk",
        "stop_name": "Lathi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_sambalpur_attabira_collage",
        "stop_name": "Attabira Collage",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_sambalpur_kandpali",
        "stop_name": "Kandpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_sambalpur_laderpali_chowk",
        "stop_name": "Laderpali Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_sambalpur_rengali_camp",
        "stop_name": "Rengali Camp",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_sambalpur_de_baahaal_chowk",
        "stop_name": "De-baahaal Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_sambalpur_janhapada",
        "stop_name": "Janhapada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 48,
        "stop_id": "stop_crut_sambalpur_suktapali",
        "stop_name": "Suktapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 49,
        "stop_id": "stop_crut_sambalpur_kalapani_chowk",
        "stop_name": "Kalapani Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 50,
        "stop_id": "stop_crut_sambalpur_barahagoda",
        "stop_name": "Barahagoda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 51,
        "stop_id": "stop_crut_sambalpur_vikash_hospital",
        "stop_name": "Vikash Hospital",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 52,
        "stop_id": "stop_crut_sambalpur_nagenpali_chowk",
        "stop_name": "Nagenpali Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 53,
        "stop_id": "stop_crut_sambalpur_fci_werehouse",
        "stop_name": "Fci Werehouse",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 54,
        "stop_id": "stop_crut_sambalpur_guruduwara_chowk",
        "stop_name": "Guruduwara Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 55,
        "stop_id": "stop_crut_sambalpur_private_bus_stand_baragarh",
        "stop_name": "Private Bus Stand, Baragarh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 56,
        "stop_id": "stop_crut_sambalpur_gandhi_chowk",
        "stop_name": "Gandhi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 57,
        "stop_id": "stop_crut_sambalpur_sp_office_bargarh",
        "stop_name": "S.p Office, Bargarh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 58,
        "stop_id": "stop_crut_sambalpur_baragarh_govt_bus_stand",
        "stop_name": "Baragarh Govt. Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 59,
        "stop_id": "stop_crut_sambalpur_baragarh",
        "stop_name": "Baragarh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_213",
    "route_number": "213",
    "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Belpahar",
    "has_schedule": true,
    "stops_count": 56,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_belapahar",
        "stop_name": "Belapahar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
        "stop_name": "Ainthapali Chowk",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_birsa_munda_chowk",
        "stop_name": "Birsa Munda Chowk",
        "is_routable": true,
        "latitude": 21.493747,
        "longitude": 83.988915
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_sambalpur_sriram_vihar",
        "stop_name": "Sriram Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_sambalpur_kamakhya_temple_malipali",
        "stop_name": "Kamakhya Temple Malipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_sambalpur_bhalupali",
        "stop_name": "Bhalupali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_sambalpur_baidarnuapali",
        "stop_name": "Baidarnuapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_sambalpur_fisheries_office",
        "stop_name": "Fisheries Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_sambalpur_pardhiapali",
        "stop_name": "Pardhiapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_sambalpur_pardhiapali_road",
        "stop_name": "Pardhiapali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_sambalpur_kia_showroom",
        "stop_name": "Kia Showroom",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_sambalpur_gupteswar_nagar",
        "stop_name": "Gupteswar Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_sambalpur_rengali_fire_office",
        "stop_name": "Rengali Fire Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_sambalpur_talab",
        "stop_name": "Talab",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_sambalpur_hanuman_temple_debeipali",
        "stop_name": "Hanuman Temple Debeipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_chc_debeipali",
        "stop_name": "Chc Debeipali",
        "is_routable": true,
        "latitude": 21.536393,
        "longitude": 84.023462
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_sambalpur_badriprasad_collage",
        "stop_name": "Badriprasad Collage",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_sason_village_road",
        "stop_name": "Sason Village Road",
        "is_routable": true,
        "latitude": 21.557249,
        "longitude": 84.039813
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_sambalpur_kankhinda",
        "stop_name": "Kankhinda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_sambalpur_vikash_school",
        "stop_name": "Vikash School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_sambalpur_govt_high_school",
        "stop_name": "Govt. High School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_sambalpur_charpali",
        "stop_name": "Charpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_sambalpur_barpali",
        "stop_name": "Barpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_sambalpur_dun_dun_chowk",
        "stop_name": "Dun - Dun Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_sambalpur_kurla",
        "stop_name": "Kurla",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_sambalpur_turitikira_chowk",
        "stop_name": "Turitikira Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_sambalpur_salad_up_school",
        "stop_name": "Salad Up School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_sambalpur_govt_polytechnic_college",
        "stop_name": "Govt. Polytechnic College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_sambalpur_rengali_block_office",
        "stop_name": "Rengali Block Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_sambalpur_hanuman_temple_rengali_2",
        "stop_name": "Hanuman Temple, Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_sambalpur_bus_stand_rengali_2",
        "stop_name": "Bus Stand, Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_sambalpur_chc_rengali",
        "stop_name": "Chc Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_sambalpur_rengali_bypass_square",
        "stop_name": "Rengali Bypass Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_sambalpur_police_station_rengali_2",
        "stop_name": "Police Station, Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_sambalpur_nuarampela",
        "stop_name": "Nuarampela",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_sambalpur_kilasama_road",
        "stop_name": "Kilasama Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_sambalpur_pradhanpali_road",
        "stop_name": "Pradhanpali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_sambalpur_sason_toll_gate",
        "stop_name": "Sason Toll Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_sambalpur_bhalubahal",
        "stop_name": "Bhalubahal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_sambalpur_ambapada",
        "stop_name": "Ambapada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_sambalpur_kumarbandh_college",
        "stop_name": "Kumarbandh College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_sambalpur_kumarbandh_chowk",
        "stop_name": "Kumarbandh Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_sambalpur_rampela_post_office",
        "stop_name": "Rampela Post Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_sambalpur_pump_house_market",
        "stop_name": "Pump House Market",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_sambalpur_telenpali",
        "stop_name": "Telenpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_sambalpur_ib_thermal_bus_stand",
        "stop_name": "Ib Thermal Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 48,
        "stop_id": "stop_crut_sambalpur_parvati_nagar",
        "stop_name": "Parvati Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 49,
        "stop_id": "stop_crut_sambalpur_khadam",
        "stop_name": "Khadam",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 50,
        "stop_id": "stop_crut_sambalpur_karpabahal_chowk",
        "stop_name": "Karpabahal Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 51,
        "stop_id": "stop_crut_sambalpur_banaharpali_thana",
        "stop_name": "Banaharpali Thana",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 52,
        "stop_id": "stop_crut_sambalpur_laxmi_market_bus_stand",
        "stop_name": "Laxmi Market Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 53,
        "stop_id": "stop_crut_sambalpur_central_workshop_bus_stop",
        "stop_name": "Central Workshop Bus Stop",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 54,
        "stop_id": "stop_crut_sambalpur_gumadera",
        "stop_name": "Gumadera",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 55,
        "stop_id": "stop_crut_sambalpur_mausi_mandir_bus_stop",
        "stop_name": "Mausi Mandir Bus Stop",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 56,
        "stop_id": "stop_crut_sambalpur_belpahar",
        "stop_name": "Belpahar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_213a",
    "route_number": "213A",
    "route_name": "Ainthapali Bus Terminal \u2013 Belpahar",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Belpahar",
    "has_schedule": true,
    "stops_count": 63,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_belapahar",
        "stop_name": "Belapahar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
        "stop_name": "Ainthapali Chowk",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_birsa_munda_chowk",
        "stop_name": "Birsa Munda Chowk",
        "is_routable": true,
        "latitude": 21.493747,
        "longitude": 83.988915
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_sambalpur_sriram_vihar",
        "stop_name": "Sriram Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_sambalpur_kamakhya_temple_malipali",
        "stop_name": "Kamakhya Temple Malipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_sambalpur_bhalupali",
        "stop_name": "Bhalupali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_sambalpur_baidarnuapali",
        "stop_name": "Baidarnuapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_sambalpur_fisheries_office",
        "stop_name": "Fisheries Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_sambalpur_pardhiapali",
        "stop_name": "Pardhiapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_sambalpur_pardhiapali_road",
        "stop_name": "Pardhiapali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_sambalpur_kia_showroom",
        "stop_name": "Kia Showroom",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_sambalpur_gupteswar_nagar",
        "stop_name": "Gupteswar Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_sambalpur_rengali_fire_office",
        "stop_name": "Rengali Fire Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_sambalpur_talab",
        "stop_name": "Talab",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_sambalpur_hanuman_temple_debeipali",
        "stop_name": "Hanuman Temple Debeipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_chc_debeipali",
        "stop_name": "Chc Debeipali",
        "is_routable": true,
        "latitude": 21.536393,
        "longitude": 84.023462
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_sambalpur_badriprasad_collage",
        "stop_name": "Badriprasad Collage",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_sason_village_road",
        "stop_name": "Sason Village Road",
        "is_routable": true,
        "latitude": 21.557249,
        "longitude": 84.039813
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_sambalpur_kankhinda",
        "stop_name": "Kankhinda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_sambalpur_vikash_school",
        "stop_name": "Vikash School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_sambalpur_ambapada",
        "stop_name": "Ambapada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_sambalpur_rengali_chowk",
        "stop_name": "Rengali Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_sambalpur_kumarbandh_chowk",
        "stop_name": "Kumarbandh Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_sambalpur_kumarbandh_college",
        "stop_name": "Kumarbandh College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_sambalpur_govt_high_school_charpali",
        "stop_name": "Govt. High School, Charpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_sambalpur_barpali",
        "stop_name": "Barpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_sambalpur_dun_dun_chowk",
        "stop_name": "Dun - Dun Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_sambalpur_kurla",
        "stop_name": "Kurla",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_sambalpur_turitikira_chowk",
        "stop_name": "Turitikira Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_sambalpur_salad_up_school",
        "stop_name": "Salad Up School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_sambalpur_govt_polytechnic_college",
        "stop_name": "Govt. Polytechnic College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_sambalpur_rengali_block_office",
        "stop_name": "Rengali Block Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_sambalpur_hanuman_temple_rengali_2",
        "stop_name": "Hanuman Temple, Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_sambalpur_bus_stand_rengali_2",
        "stop_name": "Bus Stand, Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_sambalpur_chc_rengali",
        "stop_name": "Chc Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_sambalpur_rengali_bypass_square",
        "stop_name": "Rengali Bypass Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_sambalpur_police_station_rengali_2",
        "stop_name": "Police Station, Rengali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_sambalpur_nuarampela",
        "stop_name": "Nuarampela",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_sambalpur_kilasama_road",
        "stop_name": "Kilasama Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_sambalpur_pradhanpali_road",
        "stop_name": "Pradhanpali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_sambalpur_sason_toll_gate",
        "stop_name": "Sason Toll Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_sambalpur_bhalubahal",
        "stop_name": "Bhalubahal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_sambalpur_hanuman_temple",
        "stop_name": "Hanuman Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_sambalpur_khamar_dihi",
        "stop_name": "Khamar Dihi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_sambalpur_puja_mandap_dalgaon",
        "stop_name": "Puja Mandap Dalgaon",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_sambalpur_anchalik_govt_high_school",
        "stop_name": "Anchalik Govt. High School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 48,
        "stop_id": "stop_crut_sambalpur_dalgaon",
        "stop_name": "Dalgaon",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 49,
        "stop_id": "stop_crut_sambalpur_sarandamal_chowk",
        "stop_name": "Sarandamal Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 50,
        "stop_id": "stop_crut_sambalpur_phata_primary_school",
        "stop_name": "Phata Primary School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 51,
        "stop_id": "stop_crut_sambalpur_sarandamal",
        "stop_name": "Sarandamal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 52,
        "stop_id": "stop_crut_sambalpur_karpabahal_chowk",
        "stop_name": "Karpabahal Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 53,
        "stop_id": "stop_crut_sambalpur_banaharpali_thana",
        "stop_name": "Banaharpali Thana",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 54,
        "stop_id": "stop_crut_sambalpur_laxmi_market_bus_stand",
        "stop_name": "Laxmi Market Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 55,
        "stop_id": "stop_crut_sambalpur_bandhabahal_bus_stop",
        "stop_name": "Bandhabahal Bus Stop",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 56,
        "stop_id": "stop_crut_sambalpur_cgm_office_lakhanpur",
        "stop_name": "Cgm Office, Lakhanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 57,
        "stop_id": "stop_crut_sambalpur_central_workshop_bus_stop",
        "stop_name": "Central Workshop Bus Stop",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 58,
        "stop_id": "stop_crut_sambalpur_sukhapattnaik_chowk",
        "stop_name": "Sukhapattnaik Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 59,
        "stop_id": "stop_crut_sambalpur_jorabaga",
        "stop_name": "Jorabaga",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 60,
        "stop_id": "stop_crut_sambalpur_kurpabahal_chowk",
        "stop_name": "Kurpabahal Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 61,
        "stop_id": "stop_crut_sambalpur_gumadera",
        "stop_name": "Gumadera",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 62,
        "stop_id": "stop_crut_sambalpur_mausi_mandir_bus_stop",
        "stop_name": "Mausi Mandir Bus Stop",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 63,
        "stop_id": "stop_crut_sambalpur_belpahar",
        "stop_name": "Belpahar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_214",
    "route_number": "214",
    "route_name": "Ainthapali Bus Terminal \u2013 Kuchinda",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Kuchinda",
    "has_schedule": true,
    "stops_count": 76,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_kuchinda",
        "stop_name": "Kuchinda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
        "stop_name": "Ainthapali Chowk",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_birsa_munda_chowk_ainthapali",
        "stop_name": "Birsa Munda Chowk, Ainthapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_sambalpur_amruth_vihar",
        "stop_name": "Amruth Vihar",
        "is_routable": true,
        "latitude": 21.49046,
        "longitude": 83.991443
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_sambalpur_sakhipada",
        "stop_name": "Sakhipada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_sambalpur_city_railway_station_square",
        "stop_name": "City Railway Station Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_sambalpur_satsang_vihar",
        "stop_name": "Satsang Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_sambalpur_hanuman_templedhankauda",
        "stop_name": "Hanuman Temple,dhankauda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_sambalpur_takba_square",
        "stop_name": "Takba Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_sambalpur_sindurpank_nh_bypass",
        "stop_name": "Sindurpank NH Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_sambalpur_sindurpank_chowk",
        "stop_name": "Sindurpank Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_sambalpur_sindurpank_durga_mandap",
        "stop_name": "Sindurpank Durga Mandap",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_sambalpur_dandeipali",
        "stop_name": "Dandeipali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_sambalpur_kudopali_road",
        "stop_name": "Kudopali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_sambalpur_sbi_themra",
        "stop_name": "Sbi Themra",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_padarpara_chowk",
        "stop_name": "Padarpara Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_sambalpur_themra_village",
        "stop_name": "Themra Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_themra_bypass",
        "stop_name": "Themra Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_sambalpur_gudesingha",
        "stop_name": "Gudesingha",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_sambalpur_khulia",
        "stop_name": "Khulia",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_sambalpur_malgund",
        "stop_name": "Malgund",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_sambalpur_sersuatala_village",
        "stop_name": "Sersuatala Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_sambalpur_sersuatala_chowk",
        "stop_name": "Sersuatala Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_sambalpur_gambharipank_road",
        "stop_name": "Gambharipank Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_sambalpur_jampali_road",
        "stop_name": "Jampali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_sambalpur_junadihi",
        "stop_name": "Junadihi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_sambalpur_junadihi_chowk",
        "stop_name": "Junadihi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_sambalpur_khindapada_village",
        "stop_name": "Khindapada Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_sambalpur_luhakhandi",
        "stop_name": "Luhakhandi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_sambalpur_charbhati_chowk",
        "stop_name": "Charbhati Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_sambalpur_runimahul_village",
        "stop_name": "Runimahul Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_sambalpur_runimahul_pup_school",
        "stop_name": "Runimahul P.u.p School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_sambalpur_laumal_chowk",
        "stop_name": "Laumal Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_sambalpur_jhankarpali_village",
        "stop_name": "Jhankarpali Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_sambalpur_jhankarpali",
        "stop_name": "Jhankarpali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_sambalpur_kendutikra_market",
        "stop_name": "Kendutikra Market",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_sambalpur_mendhabahal",
        "stop_name": "Mendhabahal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_sambalpur_gumuloi_forest_office",
        "stop_name": "Gumuloi Forest Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_sambalpur_gumuloi",
        "stop_name": "Gumuloi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_sambalpur_tamparkela_village",
        "stop_name": "Tamparkela Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_sambalpur_tamparkela_chowk",
        "stop_name": "Tamparkela Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_sambalpur_kusumdihi",
        "stop_name": "Kusumdihi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_sambalpur_hanuman_temple_road",
        "stop_name": "Hanuman Temple, Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_sambalpur_baradunguri_village",
        "stop_name": "Baradunguri Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_sambalpur_baradunguri_road",
        "stop_name": "Baradunguri Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_sambalpur_nuamunda",
        "stop_name": "Nuamunda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 48,
        "stop_id": "stop_crut_sambalpur_adarsha_vidyala",
        "stop_name": "Adarsha Vidyala",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 49,
        "stop_id": "stop_crut_sambalpur_parmanpur_college",
        "stop_name": "Parmanpur College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 50,
        "stop_id": "stop_crut_sambalpur_parmanpur_bus_stand",
        "stop_name": "Parmanpur Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 51,
        "stop_id": "stop_crut_sambalpur_salepali_road",
        "stop_name": "Salepali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 52,
        "stop_id": "stop_crut_sambalpur_bhikhampur_road",
        "stop_name": "Bhikhampur Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 53,
        "stop_id": "stop_crut_sambalpur_bhalubahala",
        "stop_name": "Bhalubahala",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 54,
        "stop_id": "stop_crut_sambalpur_langabahal",
        "stop_name": "Langabahal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 55,
        "stop_id": "stop_crut_sambalpur_langabahal_village",
        "stop_name": "Langabahal Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 56,
        "stop_id": "stop_crut_sambalpur_katapali",
        "stop_name": "Katapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 57,
        "stop_id": "stop_crut_sambalpur_jarli_chowk",
        "stop_name": "Jarli Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 58,
        "stop_id": "stop_crut_sambalpur_dehuripali",
        "stop_name": "Dehuripali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 59,
        "stop_id": "stop_crut_sambalpur_laida_road",
        "stop_name": "Laida Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 60,
        "stop_id": "stop_crut_sambalpur_laida",
        "stop_name": "Laida",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 61,
        "stop_id": "stop_crut_sambalpur_baijapali_road",
        "stop_name": "Baijapali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 62,
        "stop_id": "stop_crut_sambalpur_purnapani_village",
        "stop_name": "Purnapani Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 63,
        "stop_id": "stop_crut_sambalpur_purnapani_road",
        "stop_name": "Purnapani Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 64,
        "stop_id": "stop_crut_sambalpur_kutrachuan_square",
        "stop_name": "Kutrachuan Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 65,
        "stop_id": "stop_crut_sambalpur_satkhama",
        "stop_name": "Satkhama",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 66,
        "stop_id": "stop_crut_sambalpur_satkhama_up_school",
        "stop_name": "Satkhama U.p School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 67,
        "stop_id": "stop_crut_sambalpur_st_thomas_school",
        "stop_name": "St. Thomas School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 68,
        "stop_id": "stop_crut_sambalpur_cathalic_church",
        "stop_name": "Cathalic Church",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 69,
        "stop_id": "stop_crut_sambalpur_bandhubas_chowk",
        "stop_name": "Bandhubas Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 70,
        "stop_id": "stop_crut_sambalpur_kuchinda_bus_stand_up",
        "stop_name": "Kuchinda Bus Stand Up",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 71,
        "stop_id": "stop_crut_sambalpur_rajiv_gandhi_chowk",
        "stop_name": "Rajiv Gandhi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 72,
        "stop_id": "stop_crut_sambalpur_civil_court_kuchinda",
        "stop_name": "Civil Court, Kuchinda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 73,
        "stop_id": "stop_crut_sambalpur_kuchinda_college",
        "stop_name": "Kuchinda College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 74,
        "stop_id": "stop_crut_sambalpur_forest_office_kuchinda",
        "stop_name": "Forest Office, Kuchinda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 75,
        "stop_id": "stop_crut_sambalpur_mahabir_nagar",
        "stop_name": "Mahabir Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 76,
        "stop_id": "stop_crut_sambalpur_kuchinda_bus_stand",
        "stop_name": "Kuchinda Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_215",
    "route_number": "215",
    "route_name": "Ainthapali Bus Terminal \u2013 Padiabahal",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Sambalpur",
    "origin": "Ainthapali Bus Terminal",
    "destination": "Padiabahal",
    "has_schedule": true,
    "stops_count": 29,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_sambalpur_padiabahal",
        "stop_name": "Padiabahal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_sambalpur_ainthapali_bus_terminal",
        "stop_name": "Ainthapali Bus Terminal",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_padiabahal_chowk",
        "stop_name": "Padiabahal Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_primary_school_padiabahal",
        "stop_name": "Primary School, Padiabahal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_sambalpur_khaliapali",
        "stop_name": "Khaliapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_sambalpur_binayak_dera",
        "stop_name": "Binayak Dera",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_sambalpur_sanatanpali_road",
        "stop_name": "Sanatanpali Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_sambalpur_nildunguri_toll_plaza",
        "stop_name": "Nildunguri Toll Plaza",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_sambalpur_turipada",
        "stop_name": "Turipada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_sambalpur_kabrapali_chowk",
        "stop_name": "Kabrapali Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_sambalpur_kabrapali_high_school",
        "stop_name": "Kabrapali High School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_sambalpur_dakdera_chowk",
        "stop_name": "Dakdera Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_sambalpur_hapriabahal_road",
        "stop_name": "Hapriabahal Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_sambalpur_nurshing_college_road",
        "stop_name": "Nurshing College Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_sambalpur_kendghati_chowk",
        "stop_name": "Kendghati Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_sambalpur_shree_ram_vatika",
        "stop_name": "Shree Ram Vatika",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_ainthapali_chowk",
        "stop_name": "Ainthapali Chowk",
        "is_routable": true,
        "latitude": 21.495385,
        "longitude": 83.983956
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_sambalpur_birsa_munda_chowk_ainthapali",
        "stop_name": "Birsa Munda Chowk, Ainthapali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_amruth_vihar",
        "stop_name": "Amruth Vihar",
        "is_routable": true,
        "latitude": 21.49046,
        "longitude": 83.991443
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_sambalpur_sakhipada",
        "stop_name": "Sakhipada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_sambalpur_city_railway_station_square",
        "stop_name": "City Railway Station Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_sambalpur_satsang_vihar",
        "stop_name": "Satsang Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_sambalpur_hanuman_temple_dhankauda",
        "stop_name": "Hanuman Temple, Dhankauda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_sambalpur_takba_square",
        "stop_name": "Takba Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_sambalpur_sindurpank_nh_bypass",
        "stop_name": "Sindurpank NH Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_sambalpur_sindurpank_up",
        "stop_name": "Sindurpank Up",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_sambalpur_sadar_police_station",
        "stop_name": "Sadar Police Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_sambalpur_kudopali",
        "stop_name": "Kudopali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_sambalpur_chandamunda_road",
        "stop_name": "Chandamunda Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_22a",
    "route_number": "22A",
    "route_name": "Bhubaneswar Railway Station - Khordha Road Station",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Khordha Road Station",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_khordha_road_station",
        "stop_name": "Khordha Road Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_22b",
    "route_number": "22B",
    "route_name": "Jatani Gate- Khordha New Bus Stand (via Jatani)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Jatani Gate",
    "destination": "Khordha New Bus Stand",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_jatani_gate",
        "stop_name": "Jatani Gate",
        "is_routable": true,
        "latitude": 20.222787,
        "longitude": 85.81107
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_jatani",
        "stop_name": "Jatani",
        "is_routable": true,
        "latitude": 20.222787,
        "longitude": 85.81107
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_khordha_new_bus_stand",
        "stop_name": "Khordha New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_23",
    "route_number": "23",
    "route_name": "Bhubaneswar Railway Station \u2013 Sum Hospital-IGKC",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Sum Hospital-IGKC",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_sum_hospital_igkc",
        "stop_name": "Sum Hospital-igkc",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_24",
    "route_number": "24",
    "route_name": "Kalinga Vihar- Sai Temple",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Kalinga Vihar",
    "destination": "Sai Temple",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_kalinga_vihar",
        "stop_name": "Kalinga Vihar",
        "is_routable": true,
        "latitude": 20.261627,
        "longitude": 85.760884
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_sai_temple",
        "stop_name": "Sai Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_24e",
    "route_number": "24E",
    "route_name": "Kalinga Vihar- Bainchua (via-Sai Temple)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Kalinga Vihar",
    "destination": "Bainchua",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_kalinga_vihar",
        "stop_name": "Kalinga Vihar",
        "is_routable": true,
        "latitude": 20.261627,
        "longitude": 85.760884
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_sai_temple",
        "stop_name": "Sai Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_bainchua",
        "stop_name": "Bainchua",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_25",
    "route_number": "25",
    "route_name": "Dumduma \u2013 Gadakana (Via \u2013 Mastercanteen, Mancheswar)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Dumduma",
    "destination": "Gadakana",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_dumduma",
        "stop_name": "Dumduma",
        "is_routable": true,
        "latitude": 20.239603,
        "longitude": 85.788816
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_mastercanteen",
        "stop_name": "Mastercanteen",
        "is_routable": true,
        "latitude": 20.268122,
        "longitude": 85.843785
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_mancheswar",
        "stop_name": "Mancheswar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_gadakana",
        "stop_name": "Gadakana",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_26",
    "route_number": "26",
    "route_name": "Dumduma (Jadupur) \u2013 Rokat, Rajdhani Engineering College (Via Chaikeisiani)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Dumduma (Jadupur)",
    "destination": "Rokat, Rajdhani Engineering College",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_dumduma_jadupur_2",
        "stop_name": "Dumduma Jadupur",
        "is_routable": true,
        "latitude": 20.239603,
        "longitude": 85.788816
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_chaikeisiani",
        "stop_name": "Chaikeisiani",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_rokat_rajdhani_engineering_college",
        "stop_name": "Rokat, Rajdhani Engineering College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_27",
    "route_number": "27",
    "route_name": "Bhubaneswar Railway Station \u2013 Bhagwanpur (via AIIMS)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Bhagwanpur",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_aiims",
        "stop_name": "AIIMS",
        "is_routable": true,
        "latitude": 20.236178,
        "longitude": 85.778299
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_bhagwanpur",
        "stop_name": "Bhagwanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_28",
    "route_number": "28",
    "route_name": "Master Canteen - Kalinga Nagar (Trident)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Master Canteen",
    "destination": "Kalinga Nagar",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_master_canteen",
        "stop_name": "Master Canteen",
        "is_routable": true,
        "latitude": 20.268122,
        "longitude": 85.843785
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_kalinga_nagar",
        "stop_name": "Kalinga Nagar",
        "is_routable": true,
        "latitude": 20.268043,
        "longitude": 85.762309
      }
    ]
  },
  {
    "route_id": "rt_crut_29",
    "route_number": "29",
    "route_name": "Bhagwanpur \u2013 Sai Mandir",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhagwanpur",
    "destination": "Sai Mandir",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhagwanpur",
        "stop_name": "Bhagwanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_sai_mandir",
        "stop_name": "Sai Mandir",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_29e",
    "route_number": "29E",
    "route_name": "Bhagwanpur \u2013 SBI Colony Via(Sai Mandir)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhagwanpur",
    "destination": "SBI Colony",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhagwanpur",
        "stop_name": "Bhagwanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_sai_mandir",
        "stop_name": "Sai Mandir",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_sbi_colony",
        "stop_name": "Sbi Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_30",
    "route_number": "30",
    "route_name": "Bhubaneswar Railway Station \u2013 Chhatabar -Mahatma Gandhi Academy of",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Chhatabar -Mahatma Gandhi Academy of",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_chhatabar_mahatma_gandhi_academy_of",
        "stop_name": "Chhatabar -mahatma Gandhi Academy Of",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_300",
    "route_number": "300",
    "route_name": "NIST college - Duduma Colony Bus stand",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "NIST college",
    "destination": "Duduma Colony Bus stand",
    "has_schedule": true,
    "stops_count": 46,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_duduma_colony",
        "stop_name": "Duduma Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_new_bus_stand",
        "stop_name": "New Bus Stand",
        "is_routable": true,
        "latitude": 19.312894,
        "longitude": 84.802658
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_berhampur_first_gate",
        "stop_name": "First Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_berhampur_haridakhandi_chaka",
        "stop_name": "Haridakhandi Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_berhampur_katha_mantu_chaka",
        "stop_name": "Katha Mantu Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_berhampur_ganesh_nagar",
        "stop_name": "Ganesh Nagar",
        "is_routable": true,
        "latitude": 19.305118,
        "longitude": 84.780953
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_berhampur_mentu_chaka",
        "stop_name": "Mentu Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_berhampur_raja_rani_apartment",
        "stop_name": "Raja Rani Apartment",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_berhampur_amba_market",
        "stop_name": "Amba Market",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_berhampur_housing_board_colony",
        "stop_name": "Housing Board Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_berhampur_shivashakit_hall",
        "stop_name": "Shivashakit Hall",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_berhampur_prem_nagar_square",
        "stop_name": "Prem Nagar Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_berhampur_register_office",
        "stop_name": "Register Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_berhampur_mahatma_gandhi_stadium",
        "stop_name": "Mahatma Gandhi Stadium",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_berhampur_gandhi_nagar",
        "stop_name": "Gandhi Nagar",
        "is_routable": true,
        "latitude": 19.308028,
        "longitude": 84.788706
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_berhampur_congress_bhaban",
        "stop_name": "Congress Bhaban",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_berhampur_khallikote_college",
        "stop_name": "Khallikote College",
        "is_routable": true,
        "latitude": 19.307477,
        "longitude": 84.794415
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_berhampur_church_square",
        "stop_name": "Church Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_berhampur_bijipur_square",
        "stop_name": "Bijipur Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_berhampur_berhampur_railway_station",
        "stop_name": "Berhampur Railway Station",
        "is_routable": true,
        "latitude": 19.317,
        "longitude": 84.793
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_berhampur_gosaninugaa_santoshi",
        "stop_name": "Gosaninugaa Santoshi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_berhampur_temple",
        "stop_name": "Temple",
        "is_routable": true,
        "latitude": 21.539347,
        "longitude": 86.656633
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_berhampur_bijipur_state_bank",
        "stop_name": "Bijipur State Bank",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_berhampur_gokul_dhaam",
        "stop_name": "Gokul Dhaam",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_berhampur_gosaninugaa_police_station",
        "stop_name": "Gosaninugaa Police Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_berhampur_utareswara_temple",
        "stop_name": "Utareswara Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_berhampur_raj_dhoba_street",
        "stop_name": "Raj Dhoba Street",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_berhampur_andhpasara_square",
        "stop_name": "Andhpasara Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_berhampur_nalini_nagar",
        "stop_name": "Nalini Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_berhampur_haldiapadar_over_bridge",
        "stop_name": "Haldiapadar Over Bridge",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_berhampur_haldiapadar_village",
        "stop_name": "Haldiapadar Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_berhampur_haldiapadar_new_bus_stand",
        "stop_name": "Haldiapadar New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_berhampur_madanmohanpur",
        "stop_name": "Madanmohanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_berhampur_sihnala_road",
        "stop_name": "Sihnala Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_berhampur_kanisi_hata",
        "stop_name": "Kanisi Hata",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_berhampur_kanisi_village",
        "stop_name": "Kanisi Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_berhampur_amit_hospital",
        "stop_name": "Amit Hospital",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_berhampur_randha_chowk",
        "stop_name": "Randha Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_berhampur_gandhi_college",
        "stop_name": "Gandhi College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_berhampur_isaneswar_temple",
        "stop_name": "Isaneswar Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_berhampur_golanthra_village",
        "stop_name": "Golanthra Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_berhampur_bhairavi_chatti",
        "stop_name": "Bhairavi Chatti",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_berhampur_govind_nagar",
        "stop_name": "Govind Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_berhampur_nist_college",
        "stop_name": "Nist College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_berhampur_duduma_colony_new_bus_stand",
        "stop_name": "Duduma Colony New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_berhampur_duduma_colony_bus_stand",
        "stop_name": "Duduma Colony Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_301",
    "route_number": "301",
    "route_name": "Berhampur Rail Stn. - Parala maharaja college (Via- MKCG Medical, Engineering",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "Berhampur Rail Stn.",
    "destination": "Parala maharaja college",
    "has_schedule": true,
    "stops_count": 35,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_berhampur_railway_station",
        "stop_name": "Berhampur Railway Station",
        "is_routable": true,
        "latitude": 19.317,
        "longitude": 84.793
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_bijipur_square",
        "stop_name": "Bijipur Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_berhampur_church_square",
        "stop_name": "Church Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_berhampur_tata_benz_square",
        "stop_name": "Tata Benz Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_berhampur_kamapalli",
        "stop_name": "Kamapalli",
        "is_routable": true,
        "latitude": 19.307031,
        "longitude": 84.805822
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_berhampur_courtpeta_square",
        "stop_name": "Courtpeta Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_berhampur_mkcg_state_bank",
        "stop_name": "Mkcg State Bank",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_berhampur_mkcg_medical_college_square",
        "stop_name": "Mkcg Medical College Square",
        "is_routable": true,
        "latitude": 19.3083,
        "longitude": 84.8083
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_berhampur_gajapati_nagar",
        "stop_name": "Gajapati Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_berhampur_jayaprakash_nagar",
        "stop_name": "Jayaprakash Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_berhampur_engineering_school_chowk_berhampur",
        "stop_name": "Engineering School Chowk Berhampur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_berhampur_government_iti",
        "stop_name": "Government Iti",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_berhampur_lic_office_berhampur",
        "stop_name": "Lic Office Berhampur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_berhampur_khoda_singh_gate",
        "stop_name": "Khoda Singh Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_berhampur_gopalpur_junction",
        "stop_name": "Gopalpur Junction",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_berhampur_roland_pharmacy_college",
        "stop_name": "Roland Pharmacy College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_berhampur_ganjam_law_college",
        "stop_name": "Ganjam Law College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_berhampur_bhima_nagar",
        "stop_name": "Bhima Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_berhampur_ambapua",
        "stop_name": "Ambapua",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_berhampur_vivak_bihar",
        "stop_name": "Vivak Bihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_berhampur_city_college_square_berhampur",
        "stop_name": "City College Square Berhampur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_berhampur_income_tax_office_berhampur",
        "stop_name": "Income Tax Office Berhampur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_berhampur_central_school_berhampur",
        "stop_name": "Central School Berhampur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_berhampur_city_college_berhampur",
        "stop_name": "City College Berhampur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_berhampur_rock_garden",
        "stop_name": "Rock Garden",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_berhampur_barrack_ground",
        "stop_name": "Barrack Ground",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_berhampur_jagannath_pur_chaka",
        "stop_name": "Jagannath Pur Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_berhampur_kusasthali_college",
        "stop_name": "Kusasthali College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_berhampur_narandra_pur",
        "stop_name": "Narandra Pur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_berhampur_tata_colony",
        "stop_name": "Tata Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_berhampur_sum_hospital",
        "stop_name": "Sum Hospital",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_berhampur_parala_maharaja_college",
        "stop_name": "Parala Maharaja College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_berhampur_sitalapali_square",
        "stop_name": "Sitalapali Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_berhampur_sum_hospital_parala_maharaja_college",
        "stop_name": "Sum Hospital - Parala Maharaja College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_berhampur_berhampur_rail_stn",
        "stop_name": "Berhampur Rail Stn.",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_302",
    "route_number": "302",
    "route_name": "Berhampur Railway Station \u2013 Regidi",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "Berhampur Railway Station",
    "destination": "Regidi",
    "has_schedule": true,
    "stops_count": 50,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_jagadalpur_gramapanchayat",
        "stop_name": "Jagadalpur Gramapanchayat",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_jagadalpur_village",
        "stop_name": "Jagadalpur Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_berhampur_jagadalpur_up_school",
        "stop_name": "Jagadalpur Up School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_berhampur_jagadalpur_ri_office",
        "stop_name": "Jagadalpur Ri Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_berhampur_rajarani_apartment",
        "stop_name": "Rajarani Apartment",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_berhampur_shreekhetra_vihar",
        "stop_name": "Shreekhetra Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_berhampur_auto_nagar",
        "stop_name": "Auto Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_berhampur_truck_union",
        "stop_name": "Truck Union",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_berhampur_first_gate",
        "stop_name": "First Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_berhampur_duduma_colony_bus_stand",
        "stop_name": "Duduma Colony Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_berhampur_haradakhandi_sqare",
        "stop_name": "Haradakhandi Sqare",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_berhampur_khata_mantu_chaka",
        "stop_name": "Khata Mantu Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_berhampur_ganesh_nagar",
        "stop_name": "Ganesh Nagar",
        "is_routable": true,
        "latitude": 19.305118,
        "longitude": 84.780953
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_berhampur_mantu_chaka",
        "stop_name": "Mantu Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_berhampur_raja_rani_apartment",
        "stop_name": "Raja Rani Apartment",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_berhampur_amba_market",
        "stop_name": "Amba Market",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_berhampur_royal_pharmacy_college",
        "stop_name": "Royal Pharmacy College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_berhampur_patita_paban_nagar",
        "stop_name": "Patita Paban Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_berhampur_andhapasara_road",
        "stop_name": "Andhapasara Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_berhampur_uttareswar_temple",
        "stop_name": "Uttareswar Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_berhampur_police_station",
        "stop_name": "Police Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_berhampur_gosaninuagaon",
        "stop_name": "Gosaninuagaon",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_berhampur_gokul_dhaam",
        "stop_name": "Gokul Dhaam",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_berhampur_bijipur_state_bank",
        "stop_name": "Bijipur State Bank",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_berhampur_gosaninugaa",
        "stop_name": "Gosaninugaa",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_berhampur_santoshi_temple",
        "stop_name": "Santoshi Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_berhampur_bijipur_square",
        "stop_name": "Bijipur Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_berhampur_berhampur_railway",
        "stop_name": "Berhampur Railway",
        "is_routable": true,
        "latitude": 19.317,
        "longitude": 84.793
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_berhampur_station",
        "stop_name": "Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_berhampur_regidi_chowk",
        "stop_name": "Regidi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_berhampur_smit_degree_college",
        "stop_name": "Smit Degree College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_berhampur_chandipadar_village",
        "stop_name": "Chandipadar Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_berhampur_chandipadar_chowk",
        "stop_name": "Chandipadar Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_berhampur_ramapalli",
        "stop_name": "Ramapalli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_berhampur_hugulapata",
        "stop_name": "Hugulapata",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_berhampur_gurunthi_chowk",
        "stop_name": "Gurunthi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_berhampur_gurunthi_village",
        "stop_name": "Gurunthi Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_berhampur_techno_city",
        "stop_name": "Techno City",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_berhampur_new_jugiyapalli",
        "stop_name": "New Jugiyapalli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_berhampur_old_jugiyapalli",
        "stop_name": "Old Jugiyapalli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_berhampur_techno_park",
        "stop_name": "Techno Park",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_berhampur_shri_gangadhareshwar",
        "stop_name": "Shri Gangadhareshwar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_berhampur_temple",
        "stop_name": "Temple",
        "is_routable": true,
        "latitude": 21.539347,
        "longitude": 86.656633
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_berhampur_g_jagganathpur",
        "stop_name": "G Jagganathpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_berhampur_lochapada_ganesh_bazaar",
        "stop_name": "Lochapada Ganesh Bazaar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_berhampur_lochapada_hanuman_mandir",
        "stop_name": "Lochapada Hanuman Mandir",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_berhampur_square",
        "stop_name": "Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 48,
        "stop_id": "stop_crut_berhampur_nimakhandi_ri_office",
        "stop_name": "Nimakhandi Ri Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 49,
        "stop_id": "stop_crut_berhampur_borigana",
        "stop_name": "Borigana",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 50,
        "stop_id": "stop_crut_berhampur_brahmapur_railway_station",
        "stop_name": "Brahmapur Railway Station",
        "is_routable": true,
        "latitude": 19.317,
        "longitude": 84.793
      }
    ]
  },
  {
    "route_id": "rt_crut_303",
    "route_number": "303",
    "route_name": "Duduma Colony Bus Stand \u2013 Gopalpur Bus Stand (Via- Amba market, gandhi nagar, Courtpeta",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "Duduma Colony Bus Stand",
    "destination": "Gopalpur Bus Stand",
    "has_schedule": true,
    "stops_count": 57,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_mkcg_state_bank",
        "stop_name": "Mkcg State Bank",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_mkcg_medical_college_square",
        "stop_name": "Mkcg Medical College Square",
        "is_routable": true,
        "latitude": 19.3083,
        "longitude": 84.8083
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_berhampur_gajapati_nagar",
        "stop_name": "Gajapati Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_berhampur_jayaprakash_nagar",
        "stop_name": "Jayaprakash Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_berhampur_engineering_school_chowk",
        "stop_name": "Engineering School Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_berhampur_berhampur",
        "stop_name": "Berhampur",
        "is_routable": true,
        "latitude": 19.315,
        "longitude": 84.802
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_berhampur_government_iti",
        "stop_name": "Government Iti",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_berhampur_lic_office_berhampur",
        "stop_name": "Lic Office Berhampur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_berhampur_khoda_singh_gate",
        "stop_name": "Khoda Singh Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_berhampur_gopalpur_junction",
        "stop_name": "Gopalpur Junction",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_berhampur_roland_pharmacy_college",
        "stop_name": "Roland Pharmacy College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_berhampur_ganjam_law_college",
        "stop_name": "Ganjam Law College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_berhampur_bhima_nagar",
        "stop_name": "Bhima Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_berhampur_ambapua",
        "stop_name": "Ambapua",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_berhampur_vivek_vihar",
        "stop_name": "Vivek Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_berhampur_city_college_square",
        "stop_name": "City College Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_berhampur_pokidibandha_junction",
        "stop_name": "Pokidibandha Junction",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_berhampur_mandiapalli_junction",
        "stop_name": "Mandiapalli Junction",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_berhampur_sai_temple",
        "stop_name": "Sai Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_berhampur_prem_office",
        "stop_name": "Prem Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_berhampur_mandiapalli_village",
        "stop_name": "Mandiapalli Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_berhampur_gouda_street",
        "stop_name": "Gouda Street",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_berhampur_ouat_college_of_fishery",
        "stop_name": "OUAT College Of Fishery",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_berhampur_rite",
        "stop_name": "Rite",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_berhampur_bhanja_vihar",
        "stop_name": "Bhanja Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_berhampur_berhampur_university",
        "stop_name": "Berhampur University",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_berhampur_rangeilunda_village",
        "stop_name": "Rangeilunda Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_berhampur_sataya_narayanpur",
        "stop_name": "Sataya Narayanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_berhampur_karapalli_village",
        "stop_name": "Karapalli Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_berhampur_aum_sai_institute",
        "stop_name": "Aum Sai Institute",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_berhampur_narayanpur",
        "stop_name": "Narayanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_berhampur_gopalpur_college",
        "stop_name": "Gopalpur College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_berhampur_sandha_chhaka",
        "stop_name": "Sandha Chhaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_berhampur_gopalpur_bus_stand",
        "stop_name": "Gopalpur Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_berhampur_duduma_colony",
        "stop_name": "Duduma Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_berhampur_new_bus_stand",
        "stop_name": "New Bus Stand",
        "is_routable": true,
        "latitude": 19.312894,
        "longitude": 84.802658
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_berhampur_first_gate",
        "stop_name": "First Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_berhampur_haridakhandi_chaka",
        "stop_name": "Haridakhandi Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_berhampur_katha_mantu_chaka",
        "stop_name": "Katha Mantu Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_berhampur_ganesh_nagar",
        "stop_name": "Ganesh Nagar",
        "is_routable": true,
        "latitude": 19.305118,
        "longitude": 84.780953
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_berhampur_mentu_chaka",
        "stop_name": "Mentu Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_berhampur_raja_rani_apartment",
        "stop_name": "Raja Rani Apartment",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_berhampur_amba_market",
        "stop_name": "Amba Market",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_berhampur_housing_board_colony",
        "stop_name": "Housing Board Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_berhampur_shivashakit_hall",
        "stop_name": "Shivashakit Hall",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_berhampur_prem_nagar_square",
        "stop_name": "Prem Nagar Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_berhampur_register_office",
        "stop_name": "Register Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 48,
        "stop_id": "stop_crut_berhampur_mahatma_gandhi_stadium",
        "stop_name": "Mahatma Gandhi Stadium",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 49,
        "stop_id": "stop_crut_berhampur_gandhi_nagar",
        "stop_name": "Gandhi Nagar",
        "is_routable": true,
        "latitude": 19.308028,
        "longitude": 84.788706
      },
      {
        "sequence_order": 50,
        "stop_id": "stop_crut_berhampur_congress_bhaban",
        "stop_name": "Congress Bhaban",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 51,
        "stop_id": "stop_crut_berhampur_khallikote_college",
        "stop_name": "Khallikote College",
        "is_routable": true,
        "latitude": 19.307477,
        "longitude": 84.794415
      },
      {
        "sequence_order": 52,
        "stop_id": "stop_crut_berhampur_church_square",
        "stop_name": "Church Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 53,
        "stop_id": "stop_crut_berhampur_tata_benz_square",
        "stop_name": "Tata Benz Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 54,
        "stop_id": "stop_crut_berhampur_kamapalli",
        "stop_name": "Kamapalli",
        "is_routable": true,
        "latitude": 19.307031,
        "longitude": 84.805822
      },
      {
        "sequence_order": 55,
        "stop_id": "stop_crut_berhampur_courtpeta_square",
        "stop_name": "Courtpeta Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 56,
        "stop_id": "stop_crut_berhampur_duduma_colony_new_bus_stand",
        "stop_name": "Duduma Colony New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 57,
        "stop_id": "stop_crut_berhampur_duduma_colony_bus_stand",
        "stop_name": "Duduma Colony Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_303e",
    "route_number": "303E",
    "route_name": "Duduma Colony Bus stand \u2013 Dhabaleswar (Via- Railway station P.F-4, Lanjipali Village, Ankuli ,ARMY",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "Duduma Colony Bus stand",
    "destination": "Dhabaleswar",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_duduma_colony_bus_stand",
        "stop_name": "Duduma Colony Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_dhabaleswar",
        "stop_name": "Dhabaleswar",
        "is_routable": true,
        "latitude": 20.192324,
        "longitude": 85.840249
      }
    ]
  },
  {
    "route_id": "rt_crut_304",
    "route_number": "304",
    "route_name": "Berhampur Railway Station -D.patapur",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "Berhampur Railway Station",
    "destination": "D.patapur",
    "has_schedule": true,
    "stops_count": 58,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_old_jugiyapalli",
        "stop_name": "Old Jugiyapalli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_techno_park",
        "stop_name": "Techno Park",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_berhampur_shri_gangadhareshwar",
        "stop_name": "Shri Gangadhareshwar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_berhampur_temple",
        "stop_name": "Temple",
        "is_routable": true,
        "latitude": 21.539347,
        "longitude": 86.656633
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_berhampur_g_jagganathpur",
        "stop_name": "G Jagganathpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_berhampur_lochapada_ganesh_bazaar",
        "stop_name": "Lochapada Ganesh Bazaar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_berhampur_lochapada_hanuman_mandir",
        "stop_name": "Lochapada Hanuman Mandir",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_berhampur_square",
        "stop_name": "Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_berhampur_nimakhandi_ri_office",
        "stop_name": "Nimakhandi Ri Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_berhampur_borigana",
        "stop_name": "Borigana",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_berhampur_jagadalpur_gramapanchayat",
        "stop_name": "Jagadalpur Gramapanchayat",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_berhampur_jagadalpur_village",
        "stop_name": "Jagadalpur Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_berhampur_jagadalpur_up_school",
        "stop_name": "Jagadalpur Up School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_berhampur_jagadalpur_ri_office",
        "stop_name": "Jagadalpur Ri Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_berhampur_rajarani_apartment",
        "stop_name": "Rajarani Apartment",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_berhampur_shreekhetra_vihar",
        "stop_name": "Shreekhetra Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_berhampur_auto_nagar",
        "stop_name": "Auto Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_berhampur_truck_union",
        "stop_name": "Truck Union",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_berhampur_first_gate",
        "stop_name": "First Gate",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_berhampur_haradakhandi_sqare",
        "stop_name": "Haradakhandi Sqare",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_berhampur_khata_mantu_chaka",
        "stop_name": "Khata Mantu Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_berhampur_ganesh_nagar",
        "stop_name": "Ganesh Nagar",
        "is_routable": true,
        "latitude": 19.305118,
        "longitude": 84.780953
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_berhampur_mantu_chaka",
        "stop_name": "Mantu Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_berhampur_raja_rani_apartment",
        "stop_name": "Raja Rani Apartment",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_berhampur_amba_market",
        "stop_name": "Amba Market",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_berhampur_royal_pharmacy_college",
        "stop_name": "Royal Pharmacy College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_berhampur_patita_paban_nagar",
        "stop_name": "Patita Paban Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_berhampur_andhapasara_road",
        "stop_name": "Andhapasara Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_berhampur_uttareswar_temple",
        "stop_name": "Uttareswar Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_berhampur_police_station",
        "stop_name": "Police Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_berhampur_gosaninuagaon",
        "stop_name": "Gosaninuagaon",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_berhampur_gokul_dhaam",
        "stop_name": "Gokul Dhaam",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_berhampur_bijipur_state_bank",
        "stop_name": "Bijipur State Bank",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_berhampur_gosaninugaa",
        "stop_name": "Gosaninugaa",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_berhampur_santoshi_temple",
        "stop_name": "Santoshi Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_berhampur_bijipur_square",
        "stop_name": "Bijipur Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_berhampur_berhampur_railway",
        "stop_name": "Berhampur Railway",
        "is_routable": true,
        "latitude": 19.317,
        "longitude": 84.793
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_berhampur_station",
        "stop_name": "Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_berhampur_ralaba",
        "stop_name": "Ralaba",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_berhampur_nandika",
        "stop_name": "Nandika",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_berhampur_balakrishnspur_village",
        "stop_name": "Balakrishnspur Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_berhampur_dhobadi_village",
        "stop_name": "Dhobadi Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_berhampur_dhobadi_chaka",
        "stop_name": "Dhobadi Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_berhampur_d_patapur_village",
        "stop_name": "D Patapur Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_berhampur_d_patapur",
        "stop_name": "D Patapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_berhampur_bellagam",
        "stop_name": "Bellagam",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_berhampur_shanti_nagar",
        "stop_name": "Shanti Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 48,
        "stop_id": "stop_crut_berhampur_gondala",
        "stop_name": "Gondala",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 49,
        "stop_id": "stop_crut_berhampur_palasi",
        "stop_name": "Palasi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 50,
        "stop_id": "stop_crut_berhampur_sikulapalli",
        "stop_name": "Sikulapalli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 51,
        "stop_id": "stop_crut_berhampur_barapalli",
        "stop_name": "Barapalli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 52,
        "stop_id": "stop_crut_berhampur_jakarpalli",
        "stop_name": "Jakarpalli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 53,
        "stop_id": "stop_crut_berhampur_laxminarayanpur",
        "stop_name": "Laxminarayanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 54,
        "stop_id": "stop_crut_berhampur_gurunthi_chowk",
        "stop_name": "Gurunthi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 55,
        "stop_id": "stop_crut_berhampur_gurunthi_village",
        "stop_name": "Gurunthi Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 56,
        "stop_id": "stop_crut_berhampur_techno_city",
        "stop_name": "Techno City",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 57,
        "stop_id": "stop_crut_berhampur_new_jugiyapalli",
        "stop_name": "New Jugiyapalli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 58,
        "stop_id": "stop_crut_berhampur_berhampur_railway_station",
        "stop_name": "Berhampur Railway Station",
        "is_routable": true,
        "latitude": 19.317,
        "longitude": 84.793
      }
    ]
  },
  {
    "route_id": "rt_crut_304e",
    "route_number": "304E",
    "route_name": "Berhampur Railway Station - Ralaba",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "Berhampur Railway Station",
    "destination": "Ralaba",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_berhampur_railway_station",
        "stop_name": "Berhampur Railway Station",
        "is_routable": true,
        "latitude": 19.317,
        "longitude": 84.793
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_ralaba",
        "stop_name": "Ralaba",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_305",
    "route_number": "305",
    "route_name": "Haladiapadar Bus Stand\u2013 Chatrapur",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "Haladiapadar Bus Stand",
    "destination": "Chatrapur",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_haladiapadar_bus_stand",
        "stop_name": "Haladiapadar Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_chatrapur",
        "stop_name": "Chatrapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_306",
    "route_number": "306",
    "route_name": "Mahatma Gandhi Stadium - Sonapur beach (Via- Railway Station,Haldiapadar New Bus Stand,Kanisi Hata,Sidhha",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "Mahatma Gandhi Stadium",
    "destination": "Sonapur beach",
    "has_schedule": true,
    "stops_count": 47,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_haldiapadar_village",
        "stop_name": "Haldiapadar Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_haldiapadar_new",
        "stop_name": "Haldiapadar New",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_berhampur_bus_stand",
        "stop_name": "Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_berhampur_madanmohanpur",
        "stop_name": "Madanmohanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_berhampur_sihnala_road",
        "stop_name": "Sihnala Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_berhampur_kanisi_hata",
        "stop_name": "Kanisi Hata",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_berhampur_kanisi_village",
        "stop_name": "Kanisi Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_berhampur_amit_hospital",
        "stop_name": "Amit Hospital",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_berhampur_randha_chowk",
        "stop_name": "Randha Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_berhampur_gandhi_college",
        "stop_name": "Gandhi College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_berhampur_isaneswar_temple",
        "stop_name": "Isaneswar Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_berhampur_golanthra_village",
        "stop_name": "Golanthra Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_berhampur_bhairavi_chatti",
        "stop_name": "Bhairavi Chatti",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_berhampur_biswanath_school",
        "stop_name": "Biswanath School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_berhampur_kotharsingi_village",
        "stop_name": "Kotharsingi Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_berhampur_palur_hill",
        "stop_name": "Palur Hill",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_berhampur_sidhha_bhairavi_temple",
        "stop_name": "Sidhha Bhairavi Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_berhampur_haradanga_village",
        "stop_name": "Haradanga Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_berhampur_disha_college",
        "stop_name": "Disha College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_berhampur_jagannathpur",
        "stop_name": "Jagannathpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_berhampur_vignan_college",
        "stop_name": "Vignan College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_berhampur_bahadur_pentho",
        "stop_name": "Bahadur Pentho",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_berhampur_biswanathpur_village",
        "stop_name": "Biswanathpur Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_berhampur_srihari_nagar",
        "stop_name": "Srihari Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_berhampur_govindpur",
        "stop_name": "Govindpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_berhampur_govindpur_square",
        "stop_name": "Govindpur Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_berhampur_badi_chhaka",
        "stop_name": "Badi Chhaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_berhampur_arua_sonapur",
        "stop_name": "Arua Sonapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_berhampur_sonapur_village",
        "stop_name": "Sonapur Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_berhampur_sonapur_beach",
        "stop_name": "Sonapur Beach",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_berhampur_mahatma_gandhi_stadium",
        "stop_name": "Mahatma Gandhi Stadium",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_berhampur_gandhi_nagar",
        "stop_name": "Gandhi Nagar",
        "is_routable": true,
        "latitude": 19.308028,
        "longitude": 84.788706
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_berhampur_congress_bhaban",
        "stop_name": "Congress Bhaban",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 34,
        "stop_id": "stop_crut_berhampur_khallikote_college",
        "stop_name": "Khallikote College",
        "is_routable": true,
        "latitude": 19.307477,
        "longitude": 84.794415
      },
      {
        "sequence_order": 35,
        "stop_id": "stop_crut_berhampur_church_square",
        "stop_name": "Church Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 36,
        "stop_id": "stop_crut_berhampur_bijipur_square",
        "stop_name": "Bijipur Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 37,
        "stop_id": "stop_crut_berhampur_berhampur_railway_station",
        "stop_name": "Berhampur Railway Station",
        "is_routable": true,
        "latitude": 19.317,
        "longitude": 84.793
      },
      {
        "sequence_order": 38,
        "stop_id": "stop_crut_berhampur_gosaninugaa_santoshi",
        "stop_name": "Gosaninugaa Santoshi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 39,
        "stop_id": "stop_crut_berhampur_temple",
        "stop_name": "Temple",
        "is_routable": true,
        "latitude": 21.539347,
        "longitude": 86.656633
      },
      {
        "sequence_order": 40,
        "stop_id": "stop_crut_berhampur_bijipur_state_bank",
        "stop_name": "Bijipur State Bank",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 41,
        "stop_id": "stop_crut_berhampur_gokul_dhaam",
        "stop_name": "Gokul Dhaam",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 42,
        "stop_id": "stop_crut_berhampur_gosaninugaa_police_station",
        "stop_name": "Gosaninugaa Police Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 43,
        "stop_id": "stop_crut_berhampur_utareswara_temple",
        "stop_name": "Utareswara Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 44,
        "stop_id": "stop_crut_berhampur_raj_dhoba_street",
        "stop_name": "Raj Dhoba Street",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 45,
        "stop_id": "stop_crut_berhampur_andhpasara_square",
        "stop_name": "Andhpasara Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 46,
        "stop_id": "stop_crut_berhampur_nalini_nagar",
        "stop_name": "Nalini Nagar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 47,
        "stop_id": "stop_crut_berhampur_haldiapadar_over_bridge",
        "stop_name": "Haldiapadar Over Bridge",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_307",
    "route_number": "307",
    "route_name": "Duduma Colony Bus stand - Engg.School",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Berhampur",
    "origin": "Duduma Colony Bus stand",
    "destination": "Engg.School",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_duduma_colony_bus_stand",
        "stop_name": "Duduma Colony Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_enggschool",
        "stop_name": "Engg.school",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_31",
    "route_number": "31",
    "route_name": "Bhubaneswar Railway Station \u2013 Hi-Tech Hospital (via Toshali Bhawan,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Hi-Tech Hospital",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_hi_tech_hospital",
        "stop_name": "Hi-tech Hospital",
        "is_routable": true,
        "latitude": 20.303907,
        "longitude": 85.87846
      }
    ]
  },
  {
    "route_id": "rt_crut_32",
    "route_number": "32",
    "route_name": "Baramunda BSABT \u2013 Lingaraj Temple (Via Bhubaneswar Railway Station)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "Lingaraj Temple",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_lingaraj_temple",
        "stop_name": "Lingaraj Temple",
        "is_routable": true,
        "latitude": 20.238333,
        "longitude": 85.833611
      }
    ]
  },
  {
    "route_id": "rt_crut_33",
    "route_number": "33",
    "route_name": "Bhubaneswar Railway Station \u2013 Pipili",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Pipili",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_pipili",
        "stop_name": "Pipili",
        "is_routable": true,
        "latitude": 20.137175,
        "longitude": 85.839165
      }
    ]
  },
  {
    "route_id": "rt_crut_34",
    "route_number": "34",
    "route_name": "Bhubaneswar Railway Station \u2013 Balakati (Sai Hospital)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Balakati",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_balakati",
        "stop_name": "Balakati",
        "is_routable": true,
        "latitude": 20.203366,
        "longitude": 85.86856
      }
    ]
  },
  {
    "route_id": "rt_crut_34e",
    "route_number": "34E",
    "route_name": "Bhubaneswar Railway Station - Trahi Achyut(Via-Balakati)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Trahi Achyut",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_balakati",
        "stop_name": "Balakati",
        "is_routable": true,
        "latitude": 20.203366,
        "longitude": 85.86856
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_trahi_achyut",
        "stop_name": "Trahi Achyut",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_35",
    "route_number": "35",
    "route_name": "Bhubaneswar Rly. Stn. - Udaynath College, Adaspur (Via Jayadev Pitha)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Rly. Stn.",
    "destination": "Udaynath College, Adaspur",
    "has_schedule": false,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station_2",
        "stop_name": "Bhubaneswar Railway Station.",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_jayadev_pitha",
        "stop_name": "Jayadev Pitha",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_udaynath_college_adaspur",
        "stop_name": "Udaynath College, Adaspur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_36",
    "route_number": "36",
    "route_name": "Bhubaneswar Railway Station \u2013 Mundali (via Judicial Academy)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Mundali",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_judicial_academy",
        "stop_name": "Judicial Academy",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_mundali",
        "stop_name": "Mundali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_37",
    "route_number": "37",
    "route_name": "Baramunda BSABT \u2013 Naraj Railway Station (via Trisulia Square, OMFED Dairy)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "Naraj Railway Station",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_trisulia_square",
        "stop_name": "Trisulia Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_omfed_dairy",
        "stop_name": "Omfed Dairy",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_naraj_railway_station",
        "stop_name": "Naraj Railway Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_38",
    "route_number": "38",
    "route_name": "Bhubaneswar Railway Station \u2013 Trimal (via Khordha Bypass, IIT)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Trimal",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_khordha_bypass",
        "stop_name": "Khordha Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_iit",
        "stop_name": "IIT",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_trimal",
        "stop_name": "Trimal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_39",
    "route_number": "39",
    "route_name": "Bhubaneswar Railway Station - AIIMS (via Capital Hospital, Bhimtangi)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "AIIMS",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_capital_hospital",
        "stop_name": "Capital Hospital",
        "is_routable": true,
        "latitude": 20.2611,
        "longitude": 85.8278
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_bhimtangi",
        "stop_name": "Bhimtangi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_aiims",
        "stop_name": "AIIMS",
        "is_routable": true,
        "latitude": 20.236178,
        "longitude": 85.778299
      }
    ]
  },
  {
    "route_id": "rt_crut_40",
    "route_number": "40",
    "route_name": "AIIMS - Sai Mandir (Kesora) (via Capital Hospital, Badagada Brit Colony)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "AIIMS",
    "destination": "Sai Mandir",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_aiims",
        "stop_name": "AIIMS",
        "is_routable": true,
        "latitude": 20.236178,
        "longitude": 85.778299
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_capital_hospital",
        "stop_name": "Capital Hospital",
        "is_routable": true,
        "latitude": 20.2611,
        "longitude": 85.8278
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_badagada_brit_colony",
        "stop_name": "Badagada Brit Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_sai_mandir",
        "stop_name": "Sai Mandir",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_400",
    "route_number": "400",
    "route_name": "Route 400",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Keonjhar",
    "origin": "",
    "destination": "",
    "has_schedule": false,
    "stops_count": 33,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_keonjhar_govt_hospital_suakati",
        "stop_name": "Govt Hospital, Suakati",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_keonjhar_rimuli_highway",
        "stop_name": "Rimuli Highway",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_keonjhar_jail_road",
        "stop_name": "Jail Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_keonjhar_bsnl_chowk",
        "stop_name": "Bsnl Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_keonjhar_biju_pattanaik_chowk",
        "stop_name": "Biju Pattanaik Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_keonjhar_collectorate_circle",
        "stop_name": "Collectorate Circle",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_keonjhar_labanya_bus_stand",
        "stop_name": "Labanya Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_keonjhar_new_court_chowk",
        "stop_name": "New Court Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_keonjhar_rto_office",
        "stop_name": "Rto Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_keonjhar_govt_womens_college",
        "stop_name": "Govt. Womens College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_keonjhar_mandua",
        "stop_name": "Mandua",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_keonjhar_tasar_silk_park",
        "stop_name": "Tasar Silk Park",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_keonjhar_tangarpalsa",
        "stop_name": "Tangarpalsa",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_keonjhar_naranpur_raailway_stn_road",
        "stop_name": "Naranpur Raailway Stn. Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_keonjhar_naranpur",
        "stop_name": "Naranpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_keonjhar_naranpur_duburi_jn",
        "stop_name": "Naranpur Duburi Jn.",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_keonjhar_naranpur_high_school",
        "stop_name": "Naranpur High School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_keonjhar_kiss_campus",
        "stop_name": "Kiss Campus",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_keonjhar_rimuli_highway_chowk",
        "stop_name": "Rimuli Highway Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_keonjhar_suakati_square",
        "stop_name": "Suakati Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_keonjhar_jamudia",
        "stop_name": "Jamudia",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_keonjhar_sarukudara_chowk",
        "stop_name": "Sarukudara Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_keonjhar_bada_ghaghara_village",
        "stop_name": "Bada Ghaghara Village",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_keonjhar_uparjagara",
        "stop_name": "Uparjagara",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_keonjhar_bada_ghaghara_waterfall",
        "stop_name": "Bada Ghaghara Waterfall",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_keonjhar_sanaghaghara_park",
        "stop_name": "Sanaghaghara Park",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_keonjhar_hati_tower",
        "stop_name": "Hati Tower",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 28,
        "stop_id": "stop_crut_keonjhar_fire_station",
        "stop_name": "Fire Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 29,
        "stop_id": "stop_crut_keonjhar_mumbai_highway_road",
        "stop_name": "Mumbai Highway Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 30,
        "stop_id": "stop_crut_keonjhar_old_town_post_office",
        "stop_name": "Old Town Post Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 31,
        "stop_id": "stop_crut_keonjhar_dukhia_chowk",
        "stop_name": "Dukhia Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 32,
        "stop_id": "stop_crut_keonjhar_dhenkapur",
        "stop_name": "Dhenkapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 33,
        "stop_id": "stop_crut_keonjhar_district_hospital",
        "stop_name": "District Hospital",
        "is_routable": true,
        "latitude": 19.8167,
        "longitude": 85.8333
      }
    ]
  },
  {
    "route_id": "rt_crut_401",
    "route_number": "401",
    "route_name": "Route 401",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Keonjhar",
    "origin": "",
    "destination": "",
    "has_schedule": false,
    "stops_count": 20,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_keonjhar_ddu_campus",
        "stop_name": "Ddu Campus",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_keonjhar_regional_collge_babartaposi",
        "stop_name": "Regional Collge, Babartaposi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_sambalpur_gandhi_chowk",
        "stop_name": "Gandhi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_keonjhar_serajuddin_chowk",
        "stop_name": "Serajuddin Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_keonjhar_railway_station_keonjhar",
        "stop_name": "Railway Station, Keonjhar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_keonjhar_karanjia_bus_stand",
        "stop_name": "Karanjia Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_keonjhar_rabindra_vidhya_niketan",
        "stop_name": "Rabindra Vidhya Niketan",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_keonjhar_ghutur_square",
        "stop_name": "Ghutur Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_keonjhar_gurudwara_muktapur",
        "stop_name": "Gurudwara, Muktapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_keonjhar_shankarpur_stadium",
        "stop_name": "Shankarpur Stadium",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_keonjhar_regional_college",
        "stop_name": "Regional College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_keonjhar_babartaposi",
        "stop_name": "Babartaposi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_keonjhar_sidhhi_matha",
        "stop_name": "Sidhhi Matha",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_keonjhar_agnishwar_mahadev_temple",
        "stop_name": "Agnishwar Mahadev Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_keonjhar_mumbai_highway_road",
        "stop_name": "Mumbai Highway Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_keonjhar_judia_chaura",
        "stop_name": "Judia Chaura",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_keonjhar_nihal_singh_chaka",
        "stop_name": "Nihal Singh Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_keonjhar_dhangarapada_tiraha",
        "stop_name": "Dhangarapada Tiraha",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_keonjhar_atopur_road",
        "stop_name": "Atopur Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_keonjhar_telkoi_bus_stand",
        "stop_name": "Telkoi Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_402",
    "route_number": "402",
    "route_name": "Route 402",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Keonjhar",
    "origin": "",
    "destination": "",
    "has_schedule": false,
    "stops_count": 20,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_keonjhar_sanaghaghara_park",
        "stop_name": "Sanaghaghara Park",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_keonjhar_chaka_nua_sahi",
        "stop_name": "Chaka Nua Sahi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_keonjhar_labanya_bus_stand",
        "stop_name": "Labanya Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_keonjhar_law_college",
        "stop_name": "Law College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_keonjhar_odisha_school_of",
        "stop_name": "Odisha School Of",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_keonjhar_mining_engineering_osme",
        "stop_name": "Mining Engineering Osme",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_keonjhar_silua_mukundapur",
        "stop_name": "Silua Mukundapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_keonjhar_siva_templegovindapur",
        "stop_name": "Siva Temple,govindapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_keonjhar_govindapur",
        "stop_name": "Govindapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_keonjhar_siridisai_bampara",
        "stop_name": "Siridisai, Bampara",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_keonjhar_chaka",
        "stop_name": "Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_keonjhar_hati_tower",
        "stop_name": "Hati Tower",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_keonjhar_fire_station",
        "stop_name": "Fire Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_keonjhar_judia_chaura",
        "stop_name": "Judia Chaura",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_keonjhar_nihal_singh_chaka",
        "stop_name": "Nihal Singh Chaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_keonjhar_dhangarapada_tiraha",
        "stop_name": "Dhangarapada Tiraha",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_keonjhar_atopur_road",
        "stop_name": "Atopur Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_keonjhar_telkoi_bus_stand",
        "stop_name": "Telkoi Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_sambalpur_gandhi_chowk",
        "stop_name": "Gandhi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_keonjhar_collectorate_circle",
        "stop_name": "Collectorate Circle",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_403",
    "route_number": "403",
    "route_name": "Route 403",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Keonjhar",
    "origin": "",
    "destination": "",
    "has_schedule": false,
    "stops_count": 23,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_keonjhar_ddu_campus",
        "stop_name": "Ddu Campus",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_keonjhar_district_hospital",
        "stop_name": "District Hospital",
        "is_routable": true,
        "latitude": 19.8167,
        "longitude": 85.8333
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_keonjhar_saras",
        "stop_name": "Saras",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_keonjhar_dakshina_kali_mandir",
        "stop_name": "Dakshina Kali Mandir",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_keonjhar_badadera",
        "stop_name": "Badadera",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_keonjhar_mandua",
        "stop_name": "Mandua",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_keonjhar_govt_womens_college",
        "stop_name": "Govt. Womens College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_keonjhar_rto_office",
        "stop_name": "Rto Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_keonjhar_new_court_chowk",
        "stop_name": "New Court Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_keonjhar_district_library",
        "stop_name": "District Library",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_keonjhar_bhalukipatala",
        "stop_name": "Bhalukipatala",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_keonjhar_bsnl_chowk",
        "stop_name": "Bsnl Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_keonjhar_jail_road",
        "stop_name": "Jail Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_keonjhar_sidhimatha",
        "stop_name": "Sidhimatha",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_keonjhar_agnishwar_mahadev_temple",
        "stop_name": "Agnishwar Mahadev Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_keonjhar_old_town_post_office",
        "stop_name": "Old Town Post Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_keonjhar_hudco_park",
        "stop_name": "Hudco Park",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_keonjhar_shree_ganesh_sikhyanusthan",
        "stop_name": "Shree Ganesh Sikhyanusthan",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_keonjhar_thakurpatna",
        "stop_name": "Thakurpatna",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_keonjhar_ranki",
        "stop_name": "Ranki",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_keonjhar_kv_keonjhar",
        "stop_name": "K.v, Keonjhar",
        "is_routable": true,
        "latitude": 21.629,
        "longitude": 85.593
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_keonjhar_balabhadrapur",
        "stop_name": "Balabhadrapur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_keonjhar_belda",
        "stop_name": "Belda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_404",
    "route_number": "404",
    "route_name": "Route 404",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Keonjhar",
    "origin": "",
    "destination": "",
    "has_schedule": false,
    "stops_count": 11,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_keonjhar_keonjhar_bus_stand",
        "stop_name": "Keonjhar Bus Stand",
        "is_routable": true,
        "latitude": 21.629,
        "longitude": 85.593
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_keonjhar_dharanidhar_medical_college",
        "stop_name": "Dharanidhar Medical College",
        "is_routable": true,
        "latitude": 21.6333,
        "longitude": 85.5833
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_keonjhar_collectorate_circle",
        "stop_name": "Collectorate Circle",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_sambalpur_gandhi_chowk",
        "stop_name": "Gandhi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_keonjhar_serajuddin_chowk",
        "stop_name": "Serajuddin Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_keonjhar_lv_prasad",
        "stop_name": "L.v Prasad",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_keonjhar_lord_jagannath_college",
        "stop_name": "Lord Jagannath College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_keonjhar_baniapat_chowk",
        "stop_name": "Baniapat Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_keonjhar_harihar_colony",
        "stop_name": "Harihar Colony",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_keonjhar_dd_unversity",
        "stop_name": "Dd Unversity",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_keonjhar_gst_office",
        "stop_name": "Gst Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_405",
    "route_number": "405",
    "route_name": "Route 405",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Keonjhar",
    "origin": "",
    "destination": "",
    "has_schedule": false,
    "stops_count": 27,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_keonjhar_keonjhar_bus_stand",
        "stop_name": "Keonjhar Bus Stand",
        "is_routable": true,
        "latitude": 21.629,
        "longitude": 85.593
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_keonjhar_jhumpura",
        "stop_name": "Jhumpura",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_keonjhar_yogi_matha",
        "stop_name": "Yogi Matha",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_keonjhar_padmpur",
        "stop_name": "Padmpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_keonjhar_msp_sponge_iron",
        "stop_name": "Msp Sponge Iron",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_keonjhar_hundula",
        "stop_name": "Hundula",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 7,
        "stop_id": "stop_crut_keonjhar_jamudiha",
        "stop_name": "Jamudiha",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 8,
        "stop_id": "stop_crut_keonjhar_palaspanga_chowk",
        "stop_name": "Palaspanga Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 9,
        "stop_id": "stop_crut_keonjhar_green_field_school",
        "stop_name": "Green Field School",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 10,
        "stop_id": "stop_crut_keonjhar_osisl_chowk",
        "stop_name": "Osisl Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 11,
        "stop_id": "stop_crut_keonjhar_jhumpura_bypass",
        "stop_name": "Jhumpura Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 12,
        "stop_id": "stop_crut_keonjhar_jhumpura_block_chowk",
        "stop_name": "Jhumpura Block Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 13,
        "stop_id": "stop_crut_keonjhar_jhumpura_market",
        "stop_name": "Jhumpura Market",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 14,
        "stop_id": "stop_crut_keonjhar_jhumpura_bus_stand",
        "stop_name": "Jhumpura Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 15,
        "stop_id": "stop_crut_keonjhar_jhumpura_ps",
        "stop_name": "Jhumpura P.s",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 16,
        "stop_id": "stop_crut_keonjhar_collectorate_circle",
        "stop_name": "Collectorate Circle",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 17,
        "stop_id": "stop_crut_sambalpur_gandhi_chowk",
        "stop_name": "Gandhi Chowk",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 18,
        "stop_id": "stop_crut_keonjhar_v_mart",
        "stop_name": "V-mart",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 19,
        "stop_id": "stop_crut_keonjhar_sambad_office",
        "stop_name": "Sambad Office",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 20,
        "stop_id": "stop_crut_keonjhar_joda_barbil_bus_stand",
        "stop_name": "Joda Barbil Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 21,
        "stop_id": "stop_crut_keonjhar_mohigaon",
        "stop_name": "Mohigaon",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 22,
        "stop_id": "stop_crut_keonjhar_dhurpada",
        "stop_name": "Dhurpada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 23,
        "stop_id": "stop_crut_keonjhar_baliaguda",
        "stop_name": "Baliaguda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 24,
        "stop_id": "stop_crut_keonjhar_raisun",
        "stop_name": "Raisun",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 25,
        "stop_id": "stop_crut_keonjhar_raisun_college",
        "stop_name": "Raisun College",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 26,
        "stop_id": "stop_crut_keonjhar_raisuan_airstrip",
        "stop_name": "Raisuan Airstrip",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 27,
        "stop_id": "stop_crut_keonjhar_omfed",
        "stop_name": "Omfed",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_41",
    "route_number": "41",
    "route_name": "Baramunda BSABT \u2013 Tangi (via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "Tangi",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_tangi",
        "stop_name": "Tangi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_42",
    "route_number": "42",
    "route_name": "Baramunda BSABT \u2013 Nandankanan (via Chandaka)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "Nandankanan",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_chandaka",
        "stop_name": "Chandaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_nandankanan",
        "stop_name": "Nandankanan",
        "is_routable": true,
        "latitude": 20.347814,
        "longitude": 85.824766
      }
    ]
  },
  {
    "route_id": "rt_crut_43",
    "route_number": "43",
    "route_name": "Baramunda BSABT \u2013 Banamalipur (via Rasulgarh ,Kalapana Sqr)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "Banamalipur",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_rasulgarh",
        "stop_name": "Rasulgarh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_kalapana_square",
        "stop_name": "Kalapana Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_banamalipur",
        "stop_name": "Banamalipur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_43e",
    "route_number": "43E",
    "route_name": "Baramunda BSABT \u2013 Abhyamukhi (via Rasulgarh ,Kalapana Sqr,Banamalipur)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "Abhyamukhi",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_rasulgarh",
        "stop_name": "Rasulgarh",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_kalapana_square",
        "stop_name": "Kalapana Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_banamalipur",
        "stop_name": "Banamalipur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_bhubaneswar_abhyamukhi",
        "stop_name": "Abhyamukhi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_44",
    "route_number": "44",
    "route_name": "Baramunda BSABT - SVNIRTAR,Olatpur (via Master Canteen, ,Kalapana",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "SVNIRTAR,Olatpur",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_svnirtarolatpur",
        "stop_name": "Svnirtar,olatpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_45",
    "route_number": "45",
    "route_name": "Bhubaneswar Railway Station - Jayadev Pitha (via Brahman Sarangi,Khamanga)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Jayadev Pitha",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_brahman_sarangi",
        "stop_name": "Brahman Sarangi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_khamanga",
        "stop_name": "Khamanga",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_jayadev_pitha",
        "stop_name": "Jayadev Pitha",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_46",
    "route_number": "46",
    "route_name": "Bhubaneswar Railway Station - Nandankanan (via Kalayanpur,Gandarpur)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Nandankanan",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_kalayanpur",
        "stop_name": "Kalayanpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_gandarpur",
        "stop_name": "Gandarpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_nandankanan",
        "stop_name": "Nandankanan",
        "is_routable": true,
        "latitude": 20.347814,
        "longitude": 85.824766
      }
    ]
  },
  {
    "route_id": "rt_crut_47",
    "route_number": "47",
    "route_name": "Sum Hospital - SCB Medical,Cuttack (via Ekamra Kanan,Mayfair)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Sum Hospital",
    "destination": "SCB Medical,Cuttack",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_berhampur_sum_hospital",
        "stop_name": "Sum Hospital",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_ekamra_kanan",
        "stop_name": "Ekamra Kanan",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_mayfair",
        "stop_name": "Mayfair",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_scb_medicalcuttack",
        "stop_name": "Scb Medical,cuttack",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_48",
    "route_number": "48",
    "route_name": "Khordha New Bus Stand - Jagatpur,Cuttack (via Pitapalli, Chandaka)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Khordha New Bus Stand",
    "destination": "Jagatpur,Cuttack",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_khordha_new_bus_stand",
        "stop_name": "Khordha New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_pitapalli",
        "stop_name": "Pitapalli",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_chandaka",
        "stop_name": "Chandaka",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_jagatpurcuttack",
        "stop_name": "Jagatpur,cuttack",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_49",
    "route_number": "49",
    "route_name": "Bhubaneswar Railway Station \u2013 Delanga Hata (via Pipili)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Delanga Hata",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_pipili",
        "stop_name": "Pipili",
        "is_routable": true,
        "latitude": 20.137175,
        "longitude": 85.839165
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_delanga_hata",
        "stop_name": "Delanga Hata",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_50",
    "route_number": "50",
    "route_name": "Bhubaneswar Railway Station - Puri Bus Stand",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Puri Bus Stand",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      }
    ]
  },
  {
    "route_id": "rt_crut_51",
    "route_number": "51",
    "route_name": "Baramunda BSABT - Puri Bus Stand (via Vani Vihar,Rasulgarh Square)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "Puri Bus Stand",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_vani_vihar",
        "stop_name": "Vani Vihar",
        "is_routable": true,
        "latitude": 20.303273,
        "longitude": 85.839744
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_rasulgarh_square",
        "stop_name": "Rasulgarh Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      }
    ]
  },
  {
    "route_id": "rt_crut_52",
    "route_number": "52",
    "route_name": "Puri Bus Stand \u2013 Mangalahata (Via Puri Railway Station,Beach",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Puri Bus Stand",
    "destination": "Mangalahata",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_mangalahata",
        "stop_name": "Mangalahata",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_53",
    "route_number": "53",
    "route_name": "Malatipatpur Bus Stand \u2013 Shree Mandira (via Puri Bus Stand)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Malatipatpur Bus Stand",
    "destination": "Shree Mandira",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_malatipatpur_bus_stand",
        "stop_name": "Malatipatpur Bus Stand",
        "is_routable": true,
        "latitude": 19.866147,
        "longitude": 85.829336
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_shree_mandira",
        "stop_name": "Shree Mandira",
        "is_routable": true,
        "latitude": 19.8045,
        "longitude": 85.818
      }
    ]
  },
  {
    "route_id": "rt_crut_54",
    "route_number": "54",
    "route_name": "NLU, Cuttack - Puri Bus Stand (via Badambadi, Puri Bypass)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "NLU, Cuttack",
    "destination": "Puri Bus Stand",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_nlu_cuttack",
        "stop_name": "Nlu, Cuttack",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_badambadi",
        "stop_name": "Badambadi",
        "is_routable": true,
        "latitude": 20.4556,
        "longitude": 85.8778
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_puri_bypass",
        "stop_name": "Puri Bypass",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      }
    ]
  },
  {
    "route_id": "rt_crut_56",
    "route_number": "56",
    "route_name": "Khordha New Bus Stand \u2013 Puri Bus Stand (via Jatani,Pipili)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Khordha New Bus Stand",
    "destination": "Puri Bus Stand",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_khordha_new_bus_stand",
        "stop_name": "Khordha New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_jatani",
        "stop_name": "Jatani",
        "is_routable": true,
        "latitude": 20.222787,
        "longitude": 85.81107
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_pipili",
        "stop_name": "Pipili",
        "is_routable": true,
        "latitude": 20.137175,
        "longitude": 85.839165
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      }
    ]
  },
  {
    "route_id": "rt_crut_56e",
    "route_number": "56E",
    "route_name": "Puri Bus Stand - Khordha Road Station (via Jatani,Pipili)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Puri Bus Stand",
    "destination": "Khordha Road Station",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_jatani",
        "stop_name": "Jatani",
        "is_routable": true,
        "latitude": 20.222787,
        "longitude": 85.81107
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_pipili",
        "stop_name": "Pipili",
        "is_routable": true,
        "latitude": 20.137175,
        "longitude": 85.839165
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_khordha_road_station",
        "stop_name": "Khordha Road Station",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_57",
    "route_number": "57",
    "route_name": "Puri Bus Stand - Astaranga",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Puri Bus Stand",
    "destination": "Astaranga",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_astaranga",
        "stop_name": "Astaranga",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_58",
    "route_number": "58",
    "route_name": "Jagatpur,Cuttack \u2013 Puri Bus Stand (via Badambadi,Link Road)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Jagatpur,Cuttack",
    "destination": "Puri Bus Stand",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_jagatpurcuttack",
        "stop_name": "Jagatpur,cuttack",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_badambadi",
        "stop_name": "Badambadi",
        "is_routable": true,
        "latitude": 20.4556,
        "longitude": 85.8778
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_link_road",
        "stop_name": "Link Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      }
    ]
  },
  {
    "route_id": "rt_crut_59",
    "route_number": "59",
    "route_name": "Mahanadi Vihar,Cuttack \u2013 Puri Bus Stand (via Badambadi,Link Road)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Mahanadi Vihar,Cuttack",
    "destination": "Puri Bus Stand",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_mahanadi_viharcuttack",
        "stop_name": "Mahanadi Vihar,cuttack",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_badambadi",
        "stop_name": "Badambadi",
        "is_routable": true,
        "latitude": 20.4556,
        "longitude": 85.8778
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_link_road",
        "stop_name": "Link Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      }
    ]
  },
  {
    "route_id": "rt_crut_61",
    "route_number": "61",
    "route_name": "Puri Bus Stand \u2013 Satapada Bus Stand",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Puri Bus Stand",
    "destination": "Satapada Bus Stand",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_satapada_bus_stand",
        "stop_name": "Satapada Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_62",
    "route_number": "62",
    "route_name": "Bhubaneswar Railway Station \u2013 Suando (via-Kalpana Square, Pipili Bypass,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Suando",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_suando",
        "stop_name": "Suando",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_63",
    "route_number": "63",
    "route_name": "BSABT -Madhabananda Temple, Niali (Via-Vani Vihar, Master Canteen,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "BSABT",
    "destination": "Madhabananda Temple, Niali",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bsabt",
        "stop_name": "Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_madhabananda_temple_niali",
        "stop_name": "Madhabananda Temple, Niali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_64",
    "route_number": "64",
    "route_name": "Bhubaneswar Railway Station \u2013 Jatani Gate (via-Vani vihar, Gohiria square,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Jatani Gate",
    "has_schedule": false,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_jatani_gate",
        "stop_name": "Jatani Gate",
        "is_routable": true,
        "latitude": 20.222787,
        "longitude": 85.81107
      }
    ]
  },
  {
    "route_id": "rt_crut_65",
    "route_number": "65",
    "route_name": "Bhubaneswar Railway Station \u2013 Wonderla Amusement Park (Via - Vani Vihar)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Wonderla Amusement Park",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_vani_vihar",
        "stop_name": "Vani Vihar",
        "is_routable": true,
        "latitude": 20.303273,
        "longitude": 85.839744
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_wonderla_amusement_park",
        "stop_name": "Wonderla Amusement Park",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_66",
    "route_number": "66",
    "route_name": "Bhubaneswar Railway Station - Pathargadia Square (Via- Kiss College, Kelucharan",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Pathargadia Square",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_pathargadia_square",
        "stop_name": "Pathargadia Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_70",
    "route_number": "70",
    "route_name": "Bhubaneswar Railway Station - Konark",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Konark",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_konark",
        "stop_name": "Konark",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_71",
    "route_number": "71",
    "route_name": "Baramunda ISBT \u2013 Konark (via Rasulgarh Square)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda ISBT",
    "destination": "Konark",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_isbt",
        "stop_name": "Baramunda ISBT",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_rasulgarh_square",
        "stop_name": "Rasulgarh Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_konark",
        "stop_name": "Konark",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_72",
    "route_number": "72",
    "route_name": "Shree Mandira \u2013 Madhabnanda Temple, Niali",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Shree Mandira",
    "destination": "Madhabnanda Temple, Niali",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_shree_mandira",
        "stop_name": "Shree Mandira",
        "is_routable": true,
        "latitude": 19.8045,
        "longitude": 85.818
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_madhabnanda_temple_niali",
        "stop_name": "Madhabnanda Temple, Niali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_73",
    "route_number": "73",
    "route_name": "Puri Bus Stand \u2013 Talabania",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Puri Bus Stand",
    "destination": "Talabania",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_talabania",
        "stop_name": "Talabania",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_74",
    "route_number": "74",
    "route_name": "Puri Railway Station \u2013 Shree Mandira (Via \u2013 Puri Bus Stand)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Puri Railway Station",
    "destination": "Shree Mandira",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_puri_railway_station",
        "stop_name": "Puri Railway Station",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_shree_mandira",
        "stop_name": "Shree Mandira",
        "is_routable": true,
        "latitude": 19.8045,
        "longitude": 85.818
      }
    ]
  },
  {
    "route_id": "rt_crut_75",
    "route_number": "75",
    "route_name": "Shree Mandira \u2013 Kakatpur (Via Puri Bus Stand, Balighai, Marine Drive, Konark)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Shree Mandira",
    "destination": "Kakatpur",
    "has_schedule": true,
    "stops_count": 6,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_shree_mandira",
        "stop_name": "Shree Mandira",
        "is_routable": true,
        "latitude": 19.8045,
        "longitude": 85.818
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_balighai",
        "stop_name": "Balighai",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_marine_drive",
        "stop_name": "Marine Drive",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_bhubaneswar_konark",
        "stop_name": "Konark",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 6,
        "stop_id": "stop_crut_bhubaneswar_kakatpur",
        "stop_name": "Kakatpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_76",
    "route_number": "76",
    "route_name": "Puri Bus Stand \u2013 Sakhigopal Temple",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Puri Bus Stand",
    "destination": "Sakhigopal Temple",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_sakhigopal_temple",
        "stop_name": "Sakhigopal Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_77",
    "route_number": "77",
    "route_name": "Puri Bus Stand \u2013 Nimapada Bus Stand",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Puri Bus Stand",
    "destination": "Nimapada Bus Stand",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nimapada_bus_stand",
        "stop_name": "Nimapada Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_78",
    "route_number": "78",
    "route_name": "Puri Bus Stand\u2013 Alarnath (Brahamgiri New Bus Stand)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Puri Bus Stand",
    "destination": "Alarnath",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_puri_bus_stand",
        "stop_name": "Puri Bus Stand",
        "is_routable": true,
        "latitude": 19.813,
        "longitude": 85.839
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_alarnath",
        "stop_name": "Alarnath",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_79",
    "route_number": "79",
    "route_name": "Shree Mandira \u2013 Light House (Via Police line, SCS College, Kacheri,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Shree Mandira",
    "destination": "Light House",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_shree_mandira",
        "stop_name": "Shree Mandira",
        "is_routable": true,
        "latitude": 19.8045,
        "longitude": 85.818
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_light_house",
        "stop_name": "Light House",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_80",
    "route_number": "80",
    "route_name": "Naraj Police Outpost \u2013 Agrahat, Charbatia (via NLU, Badambadi, SCB Medical)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Naraj Police Outpost",
    "destination": "Agrahat, Charbatia",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_naraj_police_outpost",
        "stop_name": "Naraj Police Outpost",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nlu",
        "stop_name": "Nlu",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_badambadi",
        "stop_name": "Badambadi",
        "is_routable": true,
        "latitude": 20.4556,
        "longitude": 85.8778
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_scb_medical",
        "stop_name": "Scb Medical",
        "is_routable": true,
        "latitude": 20.4725,
        "longitude": 85.8864
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_bhubaneswar_agrahat_charbatia",
        "stop_name": "Agrahat, Charbatia",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_80e",
    "route_number": "80E",
    "route_name": "Naraj Police Outpost \u2013 Mangarajpur (via NLU, Badambadi, SCB Medical)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Naraj Police Outpost",
    "destination": "Mangarajpur",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_naraj_police_outpost",
        "stop_name": "Naraj Police Outpost",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nlu",
        "stop_name": "Nlu",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_badambadi",
        "stop_name": "Badambadi",
        "is_routable": true,
        "latitude": 20.4556,
        "longitude": 85.8778
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_scb_medical",
        "stop_name": "Scb Medical",
        "is_routable": true,
        "latitude": 20.4725,
        "longitude": 85.8864
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_bhubaneswar_mangarajpur",
        "stop_name": "Mangarajpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_81",
    "route_number": "81",
    "route_name": "Barabati Stadium \u2013 Jagannath Temple, Salepur (via SCB Medical, OMP",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Barabati Stadium",
    "destination": "Jagannath Temple, Salepur",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_barabati_stadium",
        "stop_name": "Barabati Stadium",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_jagannath_temple_salepur",
        "stop_name": "Jagannath Temple, Salepur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_82",
    "route_number": "82",
    "route_name": "AIRPORT - MASTER CANTEEN - SCB Medical (Settlement Office) (via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "AIRPORT",
    "destination": "MASTER CANTEEN - SCB Medical",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_airport",
        "stop_name": "Airport",
        "is_routable": true,
        "latitude": 20.252295,
        "longitude": 85.813485
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_master_canteen_scb_medical",
        "stop_name": "Master Canteen - Scb Medical",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_83",
    "route_number": "83",
    "route_name": "Dhabaleswar - Kandarpur (via 42 Mouza)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Dhabaleswar",
    "destination": "Kandarpur",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_dhabaleswar",
        "stop_name": "Dhabaleswar",
        "is_routable": true,
        "latitude": 20.192324,
        "longitude": 85.840249
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_42_mouza",
        "stop_name": "42 Mouza",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_kandarpur",
        "stop_name": "Kandarpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_83a",
    "route_number": "83A",
    "route_name": "CDA9 - Nuapatana",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "CDA9",
    "destination": "Nuapatana",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_cda9",
        "stop_name": "Cda9",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nuapatana",
        "stop_name": "Nuapatana",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_84",
    "route_number": "84",
    "route_name": "Biju pattanaik Park,CDA \u2013 Madhabananda Temple, Niali (via",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Biju pattanaik Park,CDA",
    "destination": "Madhabananda Temple, Niali",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_biju_pattanaik_parkcda",
        "stop_name": "Biju Pattanaik Park,cda",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_madhabananda_temple_niali",
        "stop_name": "Madhabananda Temple, Niali",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_85",
    "route_number": "85",
    "route_name": "Cuttack Netaji Bus Terminal - Gadama (via OMP, Kandarpur)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Cuttack Netaji Bus Terminal",
    "destination": "Gadama",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_cuttack_netaji_bus_terminal",
        "stop_name": "Cuttack Netaji Bus Terminal",
        "is_routable": true,
        "latitude": 20.452,
        "longitude": 85.875
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_omp",
        "stop_name": "Omp",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_kandarpur",
        "stop_name": "Kandarpur",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_gadama",
        "stop_name": "Gadama",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_86",
    "route_number": "86",
    "route_name": "CDA 9 OD terminal \u2013 Driems,Tangi",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "CDA 9 OD terminal",
    "destination": "Driems,Tangi",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_cda_9_od_terminal",
        "stop_name": "CDA 9 Od Terminal",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_driemstangi",
        "stop_name": "Driems,tangi",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_87",
    "route_number": "87",
    "route_name": "Biju Patanaik Park \u2013 Mahanadi Vihar (Via CDA, Judicial Square, Link Road)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Biju Patanaik Park",
    "destination": "Mahanadi Vihar",
    "has_schedule": true,
    "stops_count": 5,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_biju_patanaik_park",
        "stop_name": "Biju Patanaik Park",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_cda",
        "stop_name": "CDA",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_judicial_square",
        "stop_name": "Judicial Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_link_road",
        "stop_name": "Link Road",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 5,
        "stop_id": "stop_crut_bhubaneswar_mahanadi_vihar",
        "stop_name": "Mahanadi Vihar",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_87e",
    "route_number": "87E",
    "route_name": "Judicial Academy\u2013 Nuapada(Via Barabati,SCB)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Judicial Academy",
    "destination": "Nuapada",
    "has_schedule": true,
    "stops_count": 4,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_judicial_academy",
        "stop_name": "Judicial Academy",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_barabati",
        "stop_name": "Barabati",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_scb",
        "stop_name": "Scb",
        "is_routable": true,
        "latitude": 20.4725,
        "longitude": 85.8864
      },
      {
        "sequence_order": 4,
        "stop_id": "stop_crut_bhubaneswar_nuapada",
        "stop_name": "Nuapada",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_88",
    "route_number": "88",
    "route_name": "National Law University (O) \u2013 SCB Hospital (Via CDA, Raj Kishor Marg,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "National Law University (O)",
    "destination": "SCB Hospital",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_national_law_university_o_2",
        "stop_name": "National Law University O",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_scb_hospital",
        "stop_name": "Scb Hospital",
        "is_routable": true,
        "latitude": 20.4725,
        "longitude": 85.8864
      }
    ]
  },
  {
    "route_id": "rt_crut_89",
    "route_number": "89",
    "route_name": "SCB Medical \u2013 Jagadguru Krupalu University (JKU)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "SCB Medical",
    "destination": "Jagadguru Krupalu University",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_scb_medical",
        "stop_name": "Scb Medical",
        "is_routable": true,
        "latitude": 20.4725,
        "longitude": 85.8864
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_jagadguru_krupalu_university",
        "stop_name": "Jagadguru Krupalu University",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_89a",
    "route_number": "89A",
    "route_name": "SCB Medical \u2013 Judicial Square",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "SCB Medical",
    "destination": "Judicial Square",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_scb_medical",
        "stop_name": "Scb Medical",
        "is_routable": true,
        "latitude": 20.4725,
        "longitude": 85.8864
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_judicial_square",
        "stop_name": "Judicial Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_90",
    "route_number": "90",
    "route_name": "Khordha New Bus Stand \u2013 Jagatpur, Cuttack (Via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Khordha New Bus Stand",
    "destination": "Jagatpur, Cuttack",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_khordha_new_bus_stand",
        "stop_name": "Khordha New Bus Stand",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_jagatpur_cuttack",
        "stop_name": "Jagatpur, Cuttack",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_91",
    "route_number": "91",
    "route_name": "Baramunda BSABT \u2013 Biju Patnaik Park, Cuttack (Via NH)",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Baramunda BSABT",
    "destination": "Biju Patnaik Park, Cuttack",
    "has_schedule": true,
    "stops_count": 3,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_baramunda_bsabt",
        "stop_name": "Baramunda Bsabt",
        "is_routable": true,
        "latitude": 20.273141,
        "longitude": 85.79227
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_nh",
        "stop_name": "NH",
        "is_routable": true,
        "latitude": 20.258226,
        "longitude": 85.777753
      },
      {
        "sequence_order": 3,
        "stop_id": "stop_crut_bhubaneswar_biju_patnaik_park_cuttack",
        "stop_name": "Biju Patnaik Park, Cuttack",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_92",
    "route_number": "92",
    "route_name": "IGKC \u2013 Sai Temple (Via Khandagiri, Lingraj Station, Bhim Tangi,",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "IGKC",
    "destination": "Sai Temple",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_igkc",
        "stop_name": "Igkc",
        "is_routable": true,
        "latitude": 20.274059,
        "longitude": 85.764331
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_berhampur_sai_temple",
        "stop_name": "Sai Temple",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_93",
    "route_number": "93",
    "route_name": "Bhubaneswar Railway Station \u2013 Biju Patnaik Park, CDA (Via Fire",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Biju Patnaik Park, CDA",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_biju_patnaik_park_cda",
        "stop_name": "Biju Patnaik Park, CDA",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_94",
    "route_number": "94",
    "route_name": "Babasaheb Bhimrao Ambedkar Bus Terminal (BSABT) \u2013 SIEP, JATNI",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Babasaheb Bhimrao Ambedkar Bus Terminal (BSABT)",
    "destination": "SIEP, JATNI",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_babasaheb_bhimrao_ambedkar_bus_terminal_bsabt_2",
        "stop_name": "Babasaheb Bhimrao Ambedkar Bus Terminal Bsabt",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_siep_jatni",
        "stop_name": "Siep, Jatni",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  },
  {
    "route_id": "rt_crut_dd1",
    "route_number": "DD1",
    "route_name": "Bhubaneswar Railway Station \u2013 Shree Mandira Parking, Puri (Via",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Bhubaneswar Railway Station",
    "destination": "Shree Mandira Parking, Puri",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_bhubaneswar_railway_station",
        "stop_name": "Bhubaneswar Railway Station",
        "is_routable": true,
        "latitude": 20.2662,
        "longitude": 85.8436
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_shree_mandira_parking_puri",
        "stop_name": "Shree Mandira Parking, Puri",
        "is_routable": true,
        "latitude": 19.8045,
        "longitude": 85.818
      }
    ]
  },
  {
    "route_id": "rt_crut_f1",
    "route_number": "F1",
    "route_name": "Damana Square - KIIT Square",
    "agency": "CRUT (Capital Region Urban Transport)",
    "service_type": "Ama Bus",
    "service_area": "Capital Region",
    "origin": "Damana Square",
    "destination": "KIIT Square",
    "has_schedule": true,
    "stops_count": 2,
    "stops_sequence": [
      {
        "sequence_order": 1,
        "stop_id": "stop_crut_bhubaneswar_damana_square",
        "stop_name": "Damana Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      },
      {
        "sequence_order": 2,
        "stop_id": "stop_crut_bhubaneswar_kiit_square",
        "stop_name": "Kiit Square",
        "is_routable": false,
        "latitude": null,
        "longitude": null
      }
    ]
  }
];

export const CANONICAL_TRANSIT_ROUTES_BY_ID: Record<string, CanonicalTransitRoute> = Object.fromEntries(
  CANONICAL_TRANSIT_ROUTES.map((r) => [r.route_id, r])
);

export const CANONICAL_TRANSIT_ROUTES_BY_NUMBER: Record<string, CanonicalTransitRoute> = Object.fromEntries(
  CANONICAL_TRANSIT_ROUTES.map((r) => [r.route_number, r])
);

export function getTransitRouteByNumber(routeNumber: string): CanonicalTransitRoute | undefined {
  return CANONICAL_TRANSIT_ROUTES_BY_NUMBER[routeNumber];
}
