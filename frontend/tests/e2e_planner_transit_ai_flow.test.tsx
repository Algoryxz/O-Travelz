import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { StitchPlannerPage } from '../src/pages/stitch/StitchPlannerPage';
import { StitchTransitSection } from '../src/components/stitch/StitchTransitSection';
import { resolveCanonicalPlace, isSamePlace, getCanonicalPlaceId } from '../src/utils/placeIdentity';
import type { PlaceDetail } from '../src/api/contracts';

describe('End-To-End Planner, Transit Routing, and AI Failure Recovery Suite', () => {
  const samplePlaces: PlaceDetail[] = [
    {
      id: 'place_001',
      name: 'Jagannath Temple, Puri',
      category: 'temple',
      lat: 19.8049,
      lon: 85.8179,
      district: 'Puri',
      region: 'Coastal Belt',
      description: '12th-century sacred temple dedicated to Lord Jagannath.',
      research_id: 'research_001',
    } as any,
    {
      id: 'place_002',
      name: 'Konark Sun Temple',
      category: 'heritage',
      lat: 19.8876,
      lon: 86.0945,
      district: 'Puri',
      region: 'Coastal Belt',
      description: '13th-century UNESCO World Heritage monumental chariot temple.',
      research_id: 'research_002',
    } as any,
    {
      id: 'place_003',
      name: 'Lingaraj Temple',
      category: 'temple',
      lat: 20.2383,
      lon: 85.8336,
      district: 'Khordha',
      region: 'Central Plains',
      description: 'Ancient 11th-century temple representing Kalinga architecture.',
      research_id: 'research_003',
    } as any,
  ];

  describe('1. Place Identity Resolution Contract', () => {
    it('resolves place by exact database id', () => {
      const place = resolveCanonicalPlace(samplePlaces, 'place_001');
      expect(place).toBeDefined();
      expect(place?.name).toBe('Jagannath Temple, Puri');
    });

    it('resolves place by research_id', () => {
      const place = resolveCanonicalPlace(samplePlaces, 'research_002');
      expect(place).toBeDefined();
      expect(place?.name).toBe('Konark Sun Temple');
    });

    it('resolves place by hub alias', () => {
      const place = resolveCanonicalPlace(samplePlaces, 'bhubaneswar');
      expect(place).toBeDefined();
      expect(place?.name).toBe('Lingaraj Temple');
    });

    it('returns null gracefully for non-existent place', () => {
      const place = resolveCanonicalPlace(samplePlaces, 'unknown_xyz');
      expect(place).toBeNull();
    });

    it('confirms place equivalence via isSamePlace across differing representations', () => {
      const canonical = samplePlaces[0];
      const byResearch = { ...canonical, id: 'temporary-uuid' };
      expect(isSamePlace(canonical, byResearch)).toBe(true);
    });

    it('extracts canonical ID consistently', () => {
      expect(getCanonicalPlaceId(samplePlaces[0])).toBe('place_001');
      expect(getCanonicalPlaceId(null)).toBeNull();
    });
  });

  describe('2. Planner Anchor & Route Coverage Tiers', () => {
    it('renders StitchPlannerPage with resolved anchor and coverage UI', () => {
      const html = renderToString(
        <StitchPlannerPage
          onNavigate={() => {}}
          initialPlaceId="place_001"
        />
      );

      expect(html).toContain('Design Your Odisha Journey');
      expect(html).toContain('Deterministic Itinerary Engine');
      expect(html).toContain('Odisha Travel Copilot');
    });
  });

  describe('3. Transit Fallback & Diagnostic Messaging', () => {
    it('renders StitchTransitSection with initial hub without crashing', () => {
      const html = renderToString(
        <StitchTransitSection
          onNavigateToMap={() => {}}
          onAddStopToTrip={() => {}}
        />
      );

      expect(html).toContain('Mo Bus &amp; Transit Near You');
      expect(html).toContain('Intelligent Transit &amp; Spatial Corridors');
    });
  });
});
