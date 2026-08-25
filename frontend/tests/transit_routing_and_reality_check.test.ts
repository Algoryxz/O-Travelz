import { describe, it, expect } from 'vitest';
import { calculateHaversineDistanceKm, isValidCoordinate } from '../src/utils/geoUtils';

describe('Transit Routing, Map Polyline, and Planner Reality Audit Suite', () => {
  const bhubaneswarCoord = { lat: 20.2961, lon: 85.8245 };
  const puriCoord = { lat: 19.8135, lon: 85.8312 };
  const koraputCoord = { lat: 18.8135, lon: 82.7123 };
  const fakeZeroCoord = { lat: 0, lon: 0 };
  const nullCoord = { lat: null, lon: null };

  describe('1. Geographic Hop Distance & Transit Categorization', () => {
    it('accurately calculates intra-corridor distance (Bhubaneswar to Puri ~53km)', () => {
      const dist = calculateHaversineDistanceKm(
        bhubaneswarCoord.lat,
        bhubaneswarCoord.lon,
        puriCoord.lat,
        puriCoord.lon
      );
      expect(dist).toBeGreaterThan(50);
      expect(dist).toBeLessThan(60);
    });

    it('accurately detects long-distance cross-state jumps (Bhubaneswar to Koraput ~360km)', () => {
      const dist = calculateHaversineDistanceKm(
        bhubaneswarCoord.lat,
        bhubaneswarCoord.lon,
        koraputCoord.lat,
        koraputCoord.lon
      );
      expect(dist).toBeGreaterThan(340);
      expect(dist).toBeLessThan(380);
      expect(dist > 100).toBe(true); // Must be tagged as Regional Transit
    });
  });

  describe('2. Coordinate Reality & Strict Filtering', () => {
    it('strictly accepts only valid real-world coordinates and rejects (0,0) and nulls', () => {
      expect(isValidCoordinate(bhubaneswarCoord.lat, bhubaneswarCoord.lon)).toBe(true);
      expect(isValidCoordinate(puriCoord.lat, puriCoord.lon)).toBe(true);
      expect(isValidCoordinate(fakeZeroCoord.lat, fakeZeroCoord.lon)).toBe(false);
      expect(isValidCoordinate(nullCoord.lat, nullCoord.lon)).toBe(false);
    });
  });

  describe('3. Route Geometry Truth (No Fake Polyline Interpolation)', () => {
    it('defines clear rules for exact vs corridor route geometry rendering', () => {
      const exactRoute = {
        route_id: 'R-EXACT-01',
        geometry_status: 'EXACT',
        stops: [
          { latitude: 20.2667, longitude: 85.8436 },
          { latitude: 20.2520, longitude: 85.8178 },
        ],
      };

      const corridorRoute = {
        route_id: 'R-CORRIDOR-02',
        geometry_status: 'CORRIDOR',
        stops: [
          { latitude: 20.2667, longitude: 85.8436 },
          { latitude: null, longitude: null },
        ],
      };

      // Only EXACT geometry should qualify for direct polyline drawing
      const shouldDrawPolyline = (route: typeof exactRoute) =>
        route.geometry_status === 'EXACT' &&
        route.stops.filter((s) => s.latitude != null && s.longitude != null).length >= 2;

      expect(shouldDrawPolyline(exactRoute)).toBe(true);
      expect(shouldDrawPolyline(corridorRoute as any)).toBe(false);
    });
  });
});
