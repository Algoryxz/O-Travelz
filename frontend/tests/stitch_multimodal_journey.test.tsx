import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { StitchJourneyCard } from '../src/components/stitch/StitchJourneyCard';
import type { JourneyPlanResponse } from '../src/types/api';

const mockPlannedJourney: JourneyPlanResponse = {
  journey_id: 'journey-test-uuid',
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
    name: 'Bapuji Nagar Food and Tiffin Corridor',
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

describe('StitchJourneyCard Multimodal Journey Planning Integration', () => {
  it('renders planned multimodal journey with all legs and food waypoint', () => {
    const html = renderToString(
      <StitchJourneyCard
        userLocationName="Master Canteen Square"
        plannedJourney={mockPlannedJourney}
      />
    );

    // Header overview
    expect(html).toContain('Planned Multimodal Journey');
    expect(html).toContain('Master Canteen Square');
    expect(html).toContain('Biju Patnaik International Airport');
    expect(html).toContain('min total');

    // Walk leg 1
    expect(html).toContain('Bhubaneswar Railway Station');
    expect(html).toContain('150');

    // Transit leg
    expect(html).toContain('Board Transit • Mo Bus');
    expect(html).toContain('stops');
    expect(html).toContain('06:30');
    expect(html).toContain('07:00');

    // Food Waypoint
    expect(html).toContain('Food Waypoint on Corridor');
    expect(html).toContain('Bapuji Nagar Food and Tiffin Corridor');
    expect(html).toContain('Chhena Mudki');
    expect(html).toContain('On Route • 0 min detour');

    // Walk leg 2 & Destination
    expect(html).toContain('Airport Terminal Stop');
    expect(html).toContain('Destination');

    // Warnings & Action buttons
    expect(html).toContain('Transit route geometry partially verified');
    expect(html).toContain('View Journey on Map');
    expect(html).toContain('Save Itinerary Leg');
  });

  it('renders planned journey without food waypoint gracefully', () => {
    const noFoodJourney: JourneyPlanResponse = {
      ...mockPlannedJourney,
      food_waypoint: null,
    };

    const html = renderToString(
      <StitchJourneyCard
        userLocationName="Master Canteen Square"
        plannedJourney={noFoodJourney}
      />
    );

    expect(html).toContain('Planned Multimodal Journey');
    expect(html).not.toContain('Food Waypoint on Corridor');
    expect(html).toContain('Board Transit • Mo Bus');
  });
});
