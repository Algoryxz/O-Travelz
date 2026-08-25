import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { StitchJourneyCard } from '../src/components/stitch/StitchJourneyCard';
import type { NearbyStopResponse } from '../src/types/api';

const mockStop: NearbyStopResponse = {
  stop_id: 'stop-bbsr-railway-stn',
  name: 'Bhubaneswar Railway Station',
  distance_m: 150,
  walking_estimate_mins: 2,
  city: 'Bhubaneswar',
  routes_serving_stop: [
    {
      route_id: 'route-12-uuid',
      route_number: '12',
      route_name: 'Master Canteen to Biju Patnaik Airport',
      sequence_order: 1,
      service_area: 'Capital Region',
      origin: 'Master Canteen',
      destination: 'Airport',
    },
  ],
};

describe('StitchJourneyCard Corridor Food Waypoint Integration', () => {
  it('renders transit stop header and routes', () => {
    const html = renderToString(
      <StitchJourneyCard
        userLocationName="Master Canteen Square"
        stop={mockStop}
        selectedRoute={mockStop.routes_serving_stop[0]}
      />
    );

    expect(html).toContain('Bhubaneswar Railway Station');
    expect(html).toContain('Master Canteen');
    expect(html).toContain('Airport');
    expect(html).toContain('Corridor Food Discovery');
    expect(html).toContain('Board Transit');
  });

  it('renders destination and actions safely', () => {
    const html = renderToString(
      <StitchJourneyCard
        userLocationName="Master Canteen Square"
        stop={mockStop}
        selectedRoute={mockStop.routes_serving_stop[0]}
      />
    );

    expect(html).toContain('Destination');
    expect(html).toContain('View on Map');
    expect(html).toContain('Add to Trip');
  });

  it('handles empty routes gracefully without crashing', () => {
    const emptyStop: NearbyStopResponse = {
      ...mockStop,
      routes_serving_stop: [],
    };
    const html = renderToString(
      <StitchJourneyCard
        userLocationName="Master Canteen Square"
        stop={emptyStop}
      />
    );

    expect(html).toContain('Bhubaneswar Railway Station');
    expect(html).toContain('routes serving this stop');
  });
});
