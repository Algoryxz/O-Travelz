import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { TransportHopCard } from '../src/components/transport/TransportHopCard';
import { convertPlannedJourneyToItinerary, isMultimodalHop } from '../src/utils/multimodalItinerary';
import type { JourneyPlanResponse, TransportHop } from '../src/types/api';



const mockDirectJourney: JourneyPlanResponse = {
  journey_id: 'direct-journey-uuid',
  status: 'SUCCESS',
  journey_type: 'direct',
  transfer_count: 0,
  departure_time: '05:20',
  estimated_arrival_time: '05:26',
  origin: {
    latitude: 20.2523,
    longitude: 85.8135,
    resolved_name: 'Biju Patnaik Airport',
  },
  destination: {
    latitude: 20.2668,
    longitude: 85.8436,
    resolved_name: 'Master Canteen Station',
  },
  walking_legs: [
    {
      leg_type: 'walk_to_transit',
      from_name: 'Origin',
      to_name: 'AIRPORT',
      distance_m: 80,
      estimated_duration_mins: 1,
    },
    {
      leg_type: 'walk_to_destination',
      from_name: 'MASTER CANTEEN',
      to_name: 'Master Canteen Station',
      distance_m: 80,
      estimated_duration_mins: 1,
    },
  ],
  transit_legs: [
    {
      route_id: 'route-82-id',
      route_number: '82',
      route_name: 'Airport to Master Canteen',
      service_area: 'Capital Region',
      boarding_stop_id: 'stop-air',
      boarding_stop_name: 'AIRPORT',
      boarding_sequence: 1,
      alighting_stop_id: 'stop-mc',
      alighting_stop_name: 'MASTER CANTEEN',
      alighting_sequence: 3,
      stop_count: 2,
      scheduled_departures: ['05:20', '05:40'],
      estimated_transit_mins: 6,
      selected_departure: '05:20',
      estimated_arrival: '05:26',
    },
  ],
  food_waypoint: null,
  total_estimated_duration_minutes: 8,
  warnings: [],
};

const mock1TransferJourney: JourneyPlanResponse = {
  journey_id: 'transfer-journey-uuid',
  status: 'SUCCESS',
  journey_type: '1_transfer',
  transfer_count: 1,
  transfer_hub: 'Master Canteen / Bhubaneswar Railway Station Hub',
  transfer_wait_minutes: 17,
  departure_time: '10:12',
  estimated_arrival_time: '10:45',
  origin: {
    latitude: 20.2523,
    longitude: 85.8135,
    resolved_name: 'Biju Patnaik Airport',
  },
  destination: {
    latitude: 20.3956,
    longitude: 85.8256,
    resolved_name: 'Nandankanan Botanical Garden',
  },
  walking_legs: [
    {
      leg_type: 'walk_to_transit',
      from_name: 'Origin',
      to_name: 'AIRPORT',
      distance_m: 80,
      estimated_duration_mins: 1,
    },
    {
      leg_type: 'transfer_walk',
      from_name: 'MASTER CANTEEN - SCB MEDICAL',
      to_name: 'BHUBANESWAR RAILWAY STATION',
      distance_m: 0,
      estimated_duration_mins: 17,
    },
    {
      leg_type: 'walk_to_destination',
      from_name: 'NANDANKANAN',
      to_name: 'Nandankanan Botanical Garden',
      distance_m: 80,
      estimated_duration_mins: 1,
    },
  ],
  transit_legs: [
    {
      route_id: 'route-82-id',
      route_number: '82',
      route_name: 'Airport - SCB',
      service_area: 'Capital Region',
      boarding_stop_id: 'stop-air',
      boarding_stop_name: 'AIRPORT',
      boarding_sequence: 1,
      alighting_stop_id: 'stop-mc',
      alighting_stop_name: 'MASTER CANTEEN - SCB MEDICAL',
      alighting_sequence: 3,
      stop_count: 2,
      scheduled_departures: ['05:20', '10:12'],
      estimated_transit_mins: 6,
      selected_departure: '10:12',
      estimated_arrival: '10:18',
    },
    {
      route_id: 'route-46-id',
      route_number: '46',
      route_name: 'Station - Nandankanan',
      service_area: 'Capital Region',
      boarding_stop_id: 'stop-stn',
      boarding_stop_name: 'BHUBANESWAR RAILWAY STATION',
      boarding_sequence: 1,
      alighting_stop_id: 'stop-nk',
      alighting_stop_name: 'NANDANKANAN',
      alighting_sequence: 4,
      stop_count: 3,
      scheduled_departures: ['08:55', '10:35'],
      estimated_transit_mins: 9,
      selected_departure: '10:35',
      estimated_arrival: '10:44',
    },
  ],
  food_waypoint: {
    place_id: 'place-bapuji',
    research_id: 'food_khurda_003',
    name: 'Bapuji Nagar Food Corridor',
    food_category: 'street_food',
    cuisine: 'Odia Street Food & Tiffin',
    speciality_dishes: ['Chhena Mudki'],
    dietary_tags: ['vegetarian'],
    corridor_status: 'ON_ROUTE',
    distance_from_corridor_m: 220.0,
    estimated_detour_minutes: 0,
    rating: 4.5,
    rating_source: 'Google Business Verified',
    source: 'OTDC Street Food Register',
    verification_status: 'VERIFIED',
  },
  total_estimated_duration_minutes: 34,
  warnings: ['Route 82 geometry partially verified (1/3 stops geocoded).'],
};

describe('Phase 4C Multimodal Journey -> Itinerary Deep Integration Suite', () => {
  it('1. converts planned direct journey into structured itinerary plan', () => {
    const itinerary = convertPlannedJourneyToItinerary(mockDirectJourney);
    expect(itinerary.itinerary_id).toBe('direct-journey-uuid');
    expect(itinerary.days.length).toBe(1);
    expect(itinerary.days[0].stops.length).toBe(2);
    expect(itinerary.days[0].hops.length).toBe(1);

    const hop = itinerary.days[0].hops[0];
    expect(isMultimodalHop(hop)).toBe(true);
    expect(hop.mode).toBe('walk+bus');
    expect(hop.estimated_minutes).toBe(8);
    expect(hop.multimodal_journey?.journey_type).toBe('direct');
    expect(hop.multimodal_journey?.transit_legs[0].route_number).toBe('82');
  });

  it('2. converts planned 1-transfer journey with food into structured itinerary plan', () => {
    const itinerary = convertPlannedJourneyToItinerary(mock1TransferJourney);
    expect(itinerary.days.length).toBe(1);
    const hop = itinerary.days[0].hops[0];
    expect(isMultimodalHop(hop)).toBe(true);
    expect(hop.mode).toBe('walk+bus+transfer');
    expect(hop.estimated_minutes).toBe(34);
    expect(hop.multimodal_journey?.journey_type).toBe('1_transfer');
    expect(hop.multimodal_journey?.transfer_count).toBe(1);
    expect(hop.multimodal_journey?.transfer_hub).toContain('Master Canteen');
    expect(hop.multimodal_journey?.food_waypoint?.name).toBe('Bapuji Nagar Food Corridor');
  });

  it('3. renders direct multimodal journey hop card with schedule times', () => {
    const itinerary = convertPlannedJourneyToItinerary(mockDirectJourney);
    const hop = itinerary.days[0].hops[0];
    const html = renderToString(<TransportHopCard hop={hop} />);

    expect(html).toContain('Direct Transit Planned');
    expect(html).toContain('Dep: 05:20');
    expect(html).toContain('Arr: 05:26');
    expect(html).toContain('Mo Bus 82: AIRPORT → MASTER CANTEEN');
    expect(html).toContain('Scheduled: 05:20 → Arrival: 05:26');
  });

  it('4. renders 1-transfer multimodal journey hop card with transfer hub, buffer, and food', () => {
    const itinerary = convertPlannedJourneyToItinerary(mock1TransferJourney);
    const hop = itinerary.days[0].hops[0];
    const html = renderToString(<TransportHopCard hop={hop} />);

    expect(html).toContain('1-Transfer Planned');
    expect(html).toContain('Dep: 10:12');
    expect(html).toContain('Arr: 10:45');
    expect(html).toContain('Transfer Interchange');
    expect(html).toContain('Master Canteen / Bhubaneswar Railway Station Hub');
    expect(html).toContain('min buffer');



    expect(html).toContain('Mo Bus 46: BHUBANESWAR RAILWAY STATION → NANDANKANAN');
    expect(html).toContain('Corridor Food: Bapuji Nagar Food Corridor');
    expect(html).toContain('On Route');
    expect(html).toContain('Route 82 geometry partially verified');
  });

  it('5. maintains backward compatibility with legacy hop without multimodal_journey', () => {
    const legacyHop: TransportHop = {
      from_sequence: 1,
      to_sequence: 2,
      mode: 'car',
      estimated_minutes: 25,
      estimated_cost: 150.0,
      legs: [
        { mode: 'car', detail: 'Drive via NH16', provider: 'Road', route: null },
      ],
      data_tier: 'static',
      reason: null,
    };


    expect(isMultimodalHop(legacyHop)).toBe(false);
    const html = renderToString(<TransportHopCard hop={legacyHop} />);
    expect(html).toContain('Car / Road');
    expect(html).toContain('25 min');
    expect(html).toContain('Drive via NH16');
    expect(html).not.toContain('Multimodal');
  });
});
