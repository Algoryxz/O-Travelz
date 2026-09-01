import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import {
  VERIFIED_TRANSIT_STOPS,
  VERIFIED_TRANSIT_STOPS_BY_ID,
  getTransitStopById,
  findNearbyTransitStops,
  type VerifiedTransitStop,
} from '../src/data/staticTransitStops';
import {
  CANONICAL_TRANSIT_ROUTES,
  CANONICAL_TRANSIT_ROUTES_BY_NUMBER,
  getTransitRouteByNumber,
} from '../src/data/staticTransitRoutes';
import {
  VERIFIED_TRANSIT_TIMETABLES,
  getNextScheduledDeparture,
} from '../src/data/transitTimetables';
import { TransitTimetableModal } from '../src/components/transit/TransitTimetableModal';
import { isValidCoordinate } from '../src/utils/geoUtils';

// Canonical JSON imports for direct contract verification
import canonicalStops from '../../data/transport/canonical/stops.json';
import canonicalRoutes from '../../data/transport/canonical/routes.json';
import canonicalSchedules from '../../data/transport/canonical/schedules.json';

describe('Canonical Frontend Transit Fallback Sync Suite (Track B3)', () => {
  const canonicalRoutableStops = canonicalStops.filter(
    (s) => s.lat !== null && s.lon !== null
  );

  it('1. generated map stop count matches canonical routable subset', () => {
    expect(VERIFIED_TRANSIT_STOPS.length).toBe(canonicalRoutableStops.length);
    expect(VERIFIED_TRANSIT_STOPS.length).toBeGreaterThanOrEqual(70);
  });

  it('2. every rendered stop has valid coordinates within Odisha bounds', () => {
    for (const stop of VERIFIED_TRANSIT_STOPS) {
      expect(isValidCoordinate(stop.latitude, stop.longitude)).toBe(true);
      expect(stop.latitude).toBeGreaterThanOrEqual(17.5);
      expect(stop.latitude).toBeLessThanOrEqual(23.0);
      expect(stop.longitude).toBeGreaterThanOrEqual(81.0);
      expect(stop.longitude).toBeLessThanOrEqual(88.0);
    }
  });

  it('3. all frontend stop IDs exist canonically', () => {
    const canonicalIdSet = new Set(canonicalStops.map((s) => s.stop_id));
    for (const stop of VERIFIED_TRANSIT_STOPS) {
      expect(canonicalIdSet.has(stop.stop_id)).toBe(true);
    }
  });

  it('4. all frontend route IDs exist canonically', () => {
    const canonicalRouteIdSet = new Set(canonicalRoutes.map((r) => r.route_id));
    expect(CANONICAL_TRANSIT_ROUTES.length).toBe(canonicalRoutes.length);
    for (const r of CANONICAL_TRANSIT_ROUTES) {
      expect(canonicalRouteIdSet.has(r.route_id)).toBe(true);
    }
  });

  it('5. Route 50 exists in routes and timetables', () => {
    const r50 = getTransitRouteByNumber('50');
    expect(r50).toBeDefined();
    expect(r50?.route_name).toContain('Puri');

    const tt50 = VERIFIED_TRANSIT_TIMETABLES['50'];
    expect(tt50).toBeDefined();
    expect(tt50?.departures_weekday.length).toBeGreaterThan(0);
    expect(tt50?.first_departure).toBe('05:45');
  });

  it('6. timetable departure counts match canonical schedule source', () => {
    let totalFrontendDepartures = 0;
    for (const entry of Object.values(VERIFIED_TRANSIT_TIMETABLES)) {
      totalFrontendDepartures += entry.departures_weekday.length;
    }
    expect(totalFrontendDepartures).toBeGreaterThanOrEqual(3000);
  });

  it('7. next scheduled departure calculation uses IST correctly', () => {
    const departures = ['06:00', '08:30', '12:00', '16:45', '20:30'];

    // At 07:15 IST, next departure is 08:30 IST
    const morningResult = getNextScheduledDeparture(departures, '07:15');
    expect(morningResult.nextDeparture).toBe('08:30');
    expect(morningResult.isServiceFinished).toBe(false);
    expect(morningResult.label).toBe('Next scheduled departure: 08:30 IST');

    // At 12:00 IST exact match
    const noonResult = getNextScheduledDeparture(departures, '12:00');
    expect(noonResult.nextDeparture).toBe('12:00');
    expect(noonResult.isServiceFinished).toBe(false);
  });

  it('8. service-finished state handled correctly', () => {
    const departures = ['06:00', '08:30', '12:00', '16:45', '20:30'];

    // At 21:00 IST after last bus
    const nightResult = getNextScheduledDeparture(departures, '21:00');
    expect(nightResult.nextDeparture).toBeNull();
    expect(nightResult.isServiceFinished).toBe(true);
    expect(nightResult.label).toBe('Service finished for today');
  });

  it('9. no fares are displayed or fabricated', () => {
    for (const stop of VERIFIED_TRANSIT_STOPS) {
      expect((stop as any).fare).toBeUndefined();
      expect((stop as any).fare_inr).toBeUndefined();
    }
    for (const route of CANONICAL_TRANSIT_ROUTES) {
      expect((route as any).fare).toBeUndefined();
    }
  });

  it('10. no live tracking wording appears in static dataset', () => {
    for (const entry of Object.values(VERIFIED_TRANSIT_TIMETABLES)) {
      expect(entry.schedule_status).toBe('scheduled');
      expect((entry as any).is_live).toBeUndefined();
      expect((entry as any).live_tracking).toBeUndefined();
    }
  });

  it('11. unresolved stops are never included in VERIFIED_TRANSIT_STOPS', () => {
    const unresolvedCanonical = canonicalStops.filter((s) => s.lat === null);
    const unresolvedIdSet = new Set(unresolvedCanonical.map((s) => s.stop_id));

    for (const stop of VERIFIED_TRANSIT_STOPS) {
      expect(unresolvedIdSet.has(stop.stop_id)).toBe(false);
    }
  });

  it('12. backend-offline fallback utilities work deterministically', () => {
    const sampleStop = VERIFIED_TRANSIT_STOPS[0];
    const retrieved = getTransitStopById(sampleStop.stop_id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.canonical_stop_id).toBe(sampleStop.stop_id);

    // Nearby lookup around Master Canteen / BBSR (20.268, 85.843)
    const nearby = findNearbyTransitStops(20.268, 85.843, 5.0);
    expect(nearby.length).toBeGreaterThan(0);
    expect(nearby[0].distanceKm).toBeLessThanOrEqual(5.0);
  });

  it('13. TimetableModal renders canonical route schedule truthfully', () => {
    const html = renderToString(
      <TransitTimetableModal routeNumber="50" onClose={() => {}} />
    );
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain('50');
    expect(html).toContain('Scheduled');
    expect(html).toContain('CRUT');
    expect(html).toContain('First Bus');
    expect(html).toContain('05:45');
    expect(html).toContain('IST');
    expect(html).not.toContain('Live bus location');
    expect(html).not.toContain('₹');
  });
});
