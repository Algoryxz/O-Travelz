import { describe, it, expect } from 'vitest';
import { resolveRouteMapGeometry } from '../src/utils/transitGeometry';
import type { TransportMapRoute } from '../src/types/api';

describe('Wave C5.2: Frontend Route Geometry & Truth-Safe Rendering', () => {
  it('1. Suppresses continuous connecting line across unresolved stop gaps (fail-closed)', () => {
    const routeWithGap: TransportMapRoute = {
      route_id: 'rt_test_gap',
      route_number: '99',
      geometry_status: 'CORRIDOR',
      geometry_render_status: 'ANCHOR_ONLY',
      stops_count: 3,
      stops: [
        { stop_id: 's1', stop_name: 'Origin Stop', sequence_order: 1, latitude: 20.2667, longitude: 85.8436, coordinate_status: 'VERIFIED_OFFICIAL' },
        { stop_id: 's2', stop_name: 'Unresolved Stop', sequence_order: 2, latitude: null, longitude: null, coordinate_status: 'LOCALITY_ONLY' },
        { stop_id: 's3', stop_name: 'Destination Stop', sequence_order: 3, latitude: 20.2520, longitude: 85.8178, coordinate_status: 'VERIFIED_OFFICIAL' },
      ],
    };

    const resolved = resolveRouteMapGeometry(routeWithGap);
    expect(resolved.kind).toBe('ANCHOR');
    expect(resolved.coordinates).toEqual([]); // Zero fake straight lines!
    expect(resolved.validStops.length).toBe(2);
    expect(resolved.unresolvedStops.length).toBe(1);
    expect(resolved.reason).toContain('connecting line suppressed');
  });

  it('2. Draws polyline when 100% of stops in sequence are verified', () => {
    const fullRoute: TransportMapRoute = {
      route_id: 'rt_test_full',
      route_number: '100',
      geometry_status: 'CORRIDOR',
      stops_count: 2,
      stops: [
        { stop_id: 's1', stop_name: 'Stop A', sequence_order: 1, latitude: 20.2667, longitude: 85.8436, coordinate_status: 'VERIFIED_OFFICIAL' },
        { stop_id: 's2', stop_name: 'Stop B', sequence_order: 2, latitude: 20.2520, longitude: 85.8178, coordinate_status: 'VERIFIED_OFFICIAL' },
      ],
    };

    const resolved = resolveRouteMapGeometry(fullRoute);
    expect(resolved.kind).toBe('CORRIDOR');
    expect(resolved.coordinates.length).toBe(2);
    expect(resolved.confidence).toBe('VERIFIED_EXACT');
    expect(resolved.unresolvedStops.length).toBe(0);
  });

  it('3. Respects backend RENDERABLE_EXACT survey coordinates over stops', () => {
    const surveyRoute: TransportMapRoute = {
      route_id: 'rt_test_survey',
      route_number: '32',
      geometry_status: 'EXACT',
      geometry_render_status: 'RENDERABLE_EXACT',
      verified_coordinates: [
        [20.2961, 85.8245],
        [20.2970, 85.8255],
        [20.2980, 85.8265],
      ],
      stops_count: 2,
      stops: [
        { stop_id: 's1', stop_name: 'Stop A', sequence_order: 1, latitude: 20.2961, longitude: 85.8245, coordinate_status: 'VERIFIED_OFFICIAL' },
        { stop_id: 's2', stop_name: 'Stop B', sequence_order: 2, latitude: 20.2980, longitude: 85.8265, coordinate_status: 'VERIFIED_OFFICIAL' },
      ],
    };

    const resolved = resolveRouteMapGeometry(surveyRoute);
    expect(resolved.kind).toBe('EXACT');
    expect(resolved.coordinates.length).toBe(3);
    expect(resolved.confidence).toBe('VERIFIED_EXACT');
  });

  it('4. Returns NONE with empty coordinates when 0 stops have coordinates', () => {
    const unverifiedRoute: TransportMapRoute = {
      route_id: 'rt_test_none',
      route_number: '999',
      geometry_status: 'NONE',
      stops_count: 2,
      stops: [
        { stop_id: 's1', stop_name: 'Stop 1', sequence_order: 1, latitude: null, longitude: null, coordinate_status: 'UNRESOLVED' },
        { stop_id: 's2', stop_name: 'Stop 2', sequence_order: 2, latitude: null, longitude: null, coordinate_status: 'UNRESOLVED' },
      ],
    };

    const resolved = resolveRouteMapGeometry(unverifiedRoute);
    expect(resolved.kind).toBe('NONE');
    expect(resolved.coordinates).toEqual([]);
    expect(resolved.confidence).toBe('UNAVAILABLE');
  });
});
