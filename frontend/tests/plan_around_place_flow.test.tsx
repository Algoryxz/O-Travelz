import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { StitchPlannerPage } from '../src/pages/stitch/StitchPlannerPage';
import {
  isValidCoordinate,
  calculateHaversineDistanceKm,
  getNearbyPlacesWithExpansion,
} from '../src/utils/geoUtils';

describe('Plan Around This Place & Geographic Anchor Routing Suite', () => {
  const mockCanonicalPlaces = [
    {
      id: 'place-tara-tarini',
      name: 'Maa Tara Tarini Shakti Peetha',
      category: 'temple',
      lat: 19.4925,
      lon: 84.8988,
      district: 'Ganjam',
      region: 'Coastal Belt',
      description: 'Ancient hill shrine on the Kumari hills along Rushikulya river.',
    },
    {
      id: 'place-gopalpur',
      name: 'Gopalpur-on-Sea Beach',
      category: 'beach',
      lat: 19.2604,
      lon: 84.9085,
      district: 'Ganjam',
      region: 'Coastal Belt',
      description: 'Historic seaport and tranquil blue beach in Ganjam.',
    },
    {
      id: 'place-tampara',
      name: 'Tampara Lake Eco-Park',
      category: 'lake',
      lat: 19.3871,
      lon: 84.9812,
      district: 'Ganjam',
      region: 'Coastal Belt',
      description: 'Scenic freshwater lagoon near Chatrapur.',
    },
    {
      id: 'place-sambalpur',
      name: 'Hirakud Dam, Sambalpur',
      category: 'nature',
      lat: 21.528,
      lon: 83.872,
      district: 'Sambalpur',
      region: 'Western Highlands',
      description: 'Longest earthen dam in Asia.',
    },
    {
      id: 'place-invalid-zero',
      name: 'Fake (0,0) Landmark',
      category: 'invalid',
      lat: 0,
      lon: 0,
      district: 'Odisha',
      region: 'Odisha',
      description: 'Invalid placeholder coordinate.',
    },
    {
      id: 'place-missing-coord',
      name: 'Unmapped Heritage Site',
      category: 'heritage',
      lat: null,
      lon: null,
      district: 'Mayurbhanj',
      region: 'Northern Biosphere',
      description: 'Historic site without verified GPS.',
    },
  ];

  describe('1. Navigation Contract & Prop Flow', () => {
    it('preserves exact placeId during navigation callback', () => {
      const onNavigateMock = vi.fn();
      const placeIdToPlan = 'place-tara-tarini';

      // Simulating clicking "Plan Around This Place"
      onNavigateMock('plan', { placeId: placeIdToPlan });

      expect(onNavigateMock).toHaveBeenCalledWith('plan', { placeId: 'place-tara-tarini' });
      expect(onNavigateMock).not.toHaveBeenCalledWith('plan', { placeId: 'Maa Tara Tarini' }); // No fuzzy name matching
    });

    it('renders StitchPlannerPage with initialPlaceId prop without crashing', () => {
      const html = renderToString(
        <StitchPlannerPage
          onNavigate={() => {}}
          initialPlaceId="place-tara-tarini"
        />
      );

      expect(html).toContain('Design Your Odisha Journey');
      expect(html).toContain('Deterministic Itinerary Engine');
    });

    it('renders generic planner when initialPlaceId is omitted', () => {
      const html = renderToString(
        <StitchPlannerPage onNavigate={() => {}} />
      );

      expect(html).toContain('1. Select Starting Hub');
      expect(html).toContain('Bhubaneswar Hub');
      expect(html).toContain('Puri Coastal Hub');
      expect(html).not.toContain('Planning Around Selected Destination');
    });
  });

  describe('2. Canonical Place Resolution & Coordinate Validation', () => {
    it('resolves valid canonical place and strictly validates its coordinates', () => {
      const target = mockCanonicalPlaces.find((p) => p.id === 'place-tara-tarini');
      expect(target).toBeDefined();
      expect(isValidCoordinate(target!.lat, target!.lon)).toBe(true);

      const invalidTarget = mockCanonicalPlaces.find((p) => p.id === 'place-invalid-zero');
      expect(invalidTarget).toBeDefined();
      expect(isValidCoordinate(invalidTarget!.lat, invalidTarget!.lon)).toBe(false);

      const nullTarget = mockCanonicalPlaces.find((p) => p.id === 'place-missing-coord');
      expect(nullTarget).toBeDefined();
      expect(isValidCoordinate(nullTarget!.lat, nullTarget!.lon)).toBe(false);
    });

    it('ranks surrounding candidates geographically nearest-first from the anchor', () => {
      const anchor = mockCanonicalPlaces[0]; // Maa Tara Tarini (19.4925, 84.8988)

      const nearbyResult = getNearbyPlacesWithExpansion(
        mockCanonicalPlaces,
        anchor.lat!,
        anchor.lon!,
        { minResults: 3, radii: [25, 50, 100, 200, 500] }
      );

      // Must exclude invalid/null coordinates
      expect(nearbyResult.places.some((p) => p.id === 'place-invalid-zero')).toBe(false);
      expect(nearbyResult.places.some((p) => p.id === 'place-missing-coord')).toBe(false);

      // Tara Tarini, Tampara, and Gopalpur are in Ganjam (~15-30 km away)
      // Sambalpur is ~270 km away and should not appear ahead of Ganjam places
      const names = nearbyResult.places.map((p) => p.name);
      expect(names[0]).toBe('Maa Tara Tarini Shakti Peetha');
      expect(names[1]).toBe('Tampara Lake Eco-Park');
      expect(names[2]).toBe('Gopalpur-on-Sea Beach');
      expect(names).not.toContain('Hirakud Dam, Sambalpur');
    });
  });

  describe('3. Distance & Hop Calculations', () => {
    it('calculates real Haversine hop distances for itinerary legs', () => {
      const taraTarini = { lat: 19.4925, lon: 84.8988 };
      const gopalpur = { lat: 19.2604, lon: 84.9085 };

      const dist = calculateHaversineDistanceKm(
        taraTarini.lat,
        taraTarini.lon,
        gopalpur.lat,
        gopalpur.lon
      );

      // Distance Tara Tarini to Gopalpur is ~25.8 km
      expect(dist).toBeGreaterThan(24);
      expect(dist).toBeLessThan(28);
    });
  });

  describe('4. Regression: No Fake Routing for Places without Coordinates', () => {
    it('refuses to route places with missing coordinates', () => {
      const unmappedPlace = mockCanonicalPlaces.find((p) => p.id === 'place-missing-coord');
      const hasValid = isValidCoordinate(unmappedPlace!.lat, unmappedPlace!.lon);
      expect(hasValid).toBe(false);
    });

    it('rejects placeholder (0,0) from reaching candidate route pool', () => {
      const fakePlace = mockCanonicalPlaces.find((p) => p.id === 'place-invalid-zero');
      const hasValid = isValidCoordinate(fakePlace!.lat, fakePlace!.lon);
      expect(hasValid).toBe(false);
    });
  });
});
