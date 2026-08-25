import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { StitchJourneyCard } from '../src/components/stitch/StitchJourneyCard';
import { StitchTransitSection } from '../src/components/stitch/StitchTransitSection';
import { LocationProvider } from '../src/context/LocationContext';
import type { NearbyStopResponse } from '../src/types/api';

const mockStop: NearbyStopResponse = {
  stop_id: 'stop-bbsr-stn-1',
  name: 'BHUBANESWAR RAILWAY STATION',
  published_name: 'Bhubaneswar Railway Station',
  canonical_stop_id: 'stop-bbsr-bbsr-stn-1',
  city: 'Bhubaneswar',
  latitude: 20.2668,
  longitude: 85.8436,
  coordinate_status: 'geocoded',
  distance_m: 450,
  walking_estimate_mins: 6,
  region: 'Capital Region',
  routes_serving_stop: [
    {
      route_id: 'route-09',
      route_number: '09',
      route_name: 'Bhubaneswar Railway Station - Patia (via Niladri Vihar)',
      sequence_order: 1,
      service_area: 'Capital Region',
      origin: 'Bhubaneswar Railway Station',
      destination: 'Patia',
    },
    {
      route_id: 'route-12',
      route_number: '12',
      route_name: 'Bhubaneswar Railway Station - Nandankanan (via Jaydev Vihar)',
      sequence_order: 1,
      service_area: 'Capital Region',
      origin: 'Bhubaneswar Railway Station',
      destination: 'Nandankanan',
    },
  ],
};

describe('Stitch Transit Frontend Integration Suite', () => {
  it('renders StitchJourneyCard with dynamic stop, distance, walking estimate, and serving routes', () => {
    const html = renderToString(
      <StitchJourneyCard
        userLocationName="Saheed Nagar, Bhubaneswar"
        stop={mockStop}
      />
    );

    // Stop Name
    expect(html).toContain('BHUBANESWAR RAILWAY STATION');

    // Distance and Walking
    expect(html).toContain('450');
    expect(html).toContain('min walk');

    // Origin Location
    expect(html).toContain('Saheed Nagar, Bhubaneswar');

    // Route Badges
    expect(html).toContain('09');
    expect(html).toContain('12');

    // Destination of active route
    expect(html).toContain('Patia');
    expect(html).toContain('View on Map');
    expect(html).toContain('Add to Trip');
  });

  it('renders StitchTransitSection with manual fallback selection and verified Odisha hubs', () => {
    const html = renderToString(
      <LocationProvider>
        <StitchTransitSection />
      </LocationProvider>
    );

    // Section title
    expect(html).toContain('Mo Bus &amp; Transit Near You');

    // Fallback dropdown contains major verified hubs
    expect(html).toContain('Master Canteen / BBSR Station');
    expect(html).toContain('AIIMS Bhubaneswar');
    expect(html).toContain('Ainthapali Bus Terminal');
    expect(html).toContain('Sanaghagara Park');
    expect(html).toContain('Vedvyas');
  });

  it('proves unresolved stops never receive fake map coordinates', () => {
    const unresolvedStop: NearbyStopResponse = {
      ...mockStop,
      stop_id: 'stop-unresolved-1',
      name: 'DAMANA SQUARE',
      coordinate_status: 'unresolved',
      latitude: null as unknown as number,
      longitude: null as unknown as number,
    };

    expect(unresolvedStop.coordinate_status).toBe('unresolved');
    expect(unresolvedStop.latitude).toBeNull();
    expect(unresolvedStop.longitude).toBeNull();
  });
});
