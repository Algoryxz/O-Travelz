import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { StitchJourneyCard } from '../src/components/stitch/StitchJourneyCard';
import { StitchTransitSection } from '../src/components/stitch/StitchTransitSection';
import { LocationProvider } from '../src/context/LocationContext';
import type { JourneyPlanResponse } from '../src/types/api';

const mockPlannedJourney: JourneyPlanResponse = {
  journey_id: 'phase3d-test-uuid',
  status: 'SUCCESS',
  origin: {
    latitude: 20.2675,
    longitude: 85.8441,
    resolved_name: 'Master Canteen Square',
  },
  destination: {
    latitude: 20.2520,
    longitude: 85.8178,
    resolved_name: 'Biju Patnaik International Airport',
    place_id: 'airport-place-id',
  },
  walking_legs: [
    {
      leg_type: 'walk_to_transit',
      from_name: 'Origin',
      to_name: 'Bhubaneswar Railway Station',
      distance_m: 150,
      estimated_duration_mins: 2,
    },
    {
      leg_type: 'walk_to_destination',
      from_name: 'Airport Terminal Stop',
      to_name: 'Biju Patnaik International Airport',
      distance_m: 200,
      estimated_duration_mins: 3,
    },
  ],
  transit_legs: [
    {
      route_id: 'route-12-uuid',
      route_number: '12',
      route_name: 'Master Canteen to Airport',
      service_area: 'Capital Region',
      boarding_stop_id: 'stop-bbsr-stn',
      boarding_stop_name: 'Bhubaneswar Railway Station',
      boarding_sequence: 1,
      alighting_stop_id: 'stop-airport',
      alighting_stop_name: 'Airport Terminal Stop',
      alighting_sequence: 6,
      stop_count: 5,
      scheduled_departures: ['06:30', '07:00', '07:30', '08:00'],
      estimated_transit_mins: 15,
    },
  ],
  food_waypoint: {
    place_id: 'place-bapuji-nagar',
    research_id: 'food_khurda_003',
    name: 'Bapuji Nagar Food Corridor',
    food_category: 'street_food_market',
    cuisine: 'Odia Street Food & Tiffin',
    speciality_dishes: ['Chhena Mudki', 'Bara Ghuguni'],
    dietary_tags: ['vegetarian', 'snacks'],
    corridor_status: 'ON_ROUTE',
    distance_from_corridor_m: 220.0,
    estimated_detour_minutes: 0,
    rating: 4.5,
    rating_source: 'Google Business Verified',
    source: 'OTDC Street Food Register',
    verification_status: 'VERIFIED',
  },
  total_estimated_duration_minutes: 20,
  warnings: ['Transit route geometry partially verified (4/10 stops geocoded).'],
};

describe('Stitch Phase 3D End-to-End Integration Suite', () => {
  it('renders multimodal journey with preference controls and provenance badges', () => {
    const html = renderToString(
      <StitchJourneyCard
        userLocationName="Master Canteen Square"
        locationType="LIVE_GPS"
        plannedJourney={mockPlannedJourney}
        preferences={{ includeFood: true, minimizeDetour: false, dietaryTag: 'vegetarian' }}
      />
    );

    expect(html).toContain('Planned Multimodal Journey');
    expect(html).toContain('LIVE GPS');
    expect(html).toContain('Food Included');
    expect(html).toContain('Detour OK');
    expect(html).toContain('Veg Only');
    expect(html).toContain('Bapuji Nagar Food Corridor');
    expect(html).toContain('OTDC Street Food Register');
  });

  it('renders explicit failure card for NO_VERIFIED_BOARDING_STOP', () => {
    const failedJourney: JourneyPlanResponse = {
      journey_id: 'failed-journey-uuid',
      status: 'NO_VERIFIED_BOARDING_STOP',
      origin: { latitude: 18.0, longitude: 86.5, resolved_name: 'Bay of Bengal' },
      destination: { latitude: 20.252, longitude: 85.8178 },
      walking_legs: [],
      transit_legs: [],
      food_waypoint: null,
      total_estimated_duration_minutes: 0,
      warnings: ['No verified transit stops found within 2500m of origin.'],
    };

    const html = renderToString(
      <StitchJourneyCard
        userLocationName="Bay of Bengal"
        plannedJourney={failedJourney}
      />
    );

    expect(html).toContain('NO_VERIFIED_BOARDING_STOP');
    expect(html).toContain('No Verified Transit Stop Within Walking Distance');
    expect(html).toContain('No verified transit stops found within 2500m of origin.');
  });

  it('renders StitchTransitSection with Mode toggle and Hub selection', () => {
    const html = renderToString(
      <LocationProvider>
        <StitchTransitSection />
      </LocationProvider>
    );

    expect(html).toContain('Mo Bus');
    expect(html).toContain('Transit Near You');
    expect(html).toContain('Nearby Stops');
    expect(html).toContain('Plan Multimodal Trip');
    expect(html).toContain('Active Origin:');
  });
});
