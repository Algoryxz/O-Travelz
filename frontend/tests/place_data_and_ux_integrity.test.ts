import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { isValidCoordinate } from '../src/utils/geoUtils';
import { getCategoryFallbackSvg, CATEGORY_FALLBACK_SVGS } from '../src/utils/imageRegistry';
import { resolveCanonicalPlace, isSamePlace, getCanonicalPlaceId } from '../src/utils/placeIdentity';

interface RawPlace {
  id: string;
  name: string;
  category: string;
  lat: number | null;
  lon: number | null;
  district?: string;
  description?: string;
  rating?: number;
  rating_count?: number;
}

describe('Place Data & UX Integrity Audit', () => {
  const placesFilePath = path.resolve(__dirname, '../../data/places/places.json');
  let rawPlaces: RawPlace[] = [];

  try {
    const fileContent = fs.readFileSync(placesFilePath, 'utf-8');
    rawPlaces = JSON.parse(fileContent);
  } catch (err) {
    console.warn('Could not load places.json in test environment:', err);
  }

  describe('1. Place Catalog Integrity (161 Places)', () => {
    it('contains exactly 161 canonical destination records', () => {
      expect(rawPlaces.length).toBe(161);
    });

    it('has unique IDs across all records with no duplicates', () => {
      const idSet = new Set<string>();
      const duplicates: string[] = [];

      for (const p of rawPlaces) {
        if (idSet.has(p.id)) {
          duplicates.push(p.id);
        }
        idSet.add(p.id);
      }

      expect(duplicates).toEqual([]);
      expect(idSet.size).toBe(161);
    });

    it('ensures all coordinates are either valid Odisha coordinates or explicitly null (no 0,0 or corrupted GPS)', () => {
      for (const p of rawPlaces) {
        if (p.lat !== null || p.lon !== null) {
          expect(p.lat).not.toBe(0);
          expect(p.lon).not.toBe(0);
          expect(isValidCoordinate(p.lat, p.lon)).toBe(true);

          // Must be in Eastern India / Odisha bounding region
          expect(p.lat!).toBeGreaterThanOrEqual(17.5);
          expect(p.lat!).toBeLessThanOrEqual(23.0);
          expect(p.lon!).toBeGreaterThanOrEqual(81.0);
          expect(p.lon!).toBeLessThanOrEqual(88.0);
        }
      }
    });

    it('has non-empty names and valid categories for every place', () => {
      for (const p of rawPlaces) {
        expect(p.name).toBeDefined();
        expect(p.name.trim().length).toBeGreaterThan(2);
        expect(p.category).toBeDefined();
        expect(p.category.trim().length).toBeGreaterThan(1);
      }
    });

    it('verifies ratings have valid numerical ranges if present and never exceed 5.0', () => {
      for (const p of rawPlaces) {
        if (p.rating !== undefined && p.rating !== null) {
          expect(p.rating).toBeGreaterThanOrEqual(1.0);
          expect(p.rating).toBeLessThanOrEqual(5.0);
        }
      }
    });
  });

  describe('2. Image Fallback Coverage & Registry Safety', () => {
    it('provides deterministic SVG fallback for all unique catalog categories', () => {
      const uniqueCategories = Array.from(new Set(rawPlaces.map((p) => p.category.toLowerCase())));

      for (const cat of uniqueCategories) {
        const svg = getCategoryFallbackSvg(cat, 'Test Destination');
        expect(svg).toBeDefined();
        expect(svg.startsWith('data:image/svg+xml')).toBe(true);
        expect(svg).toContain('%3Csvg');
      }
    });

    it('handles unexpected unknown categories with safe default fallback', () => {
      const fallback = getCategoryFallbackSvg('unknown_mystical_category', 'Unknown Sanctuary');
      expect(fallback).toBeDefined();
      expect(fallback.startsWith('data:image/svg+xml')).toBe(true);
      expect(fallback).toContain('%3Csvg');
    });
  });

  describe('3. Canonical Identity Resolution Robustness', () => {
    it('resolves place from raw catalog by exact ID', () => {
      const first = rawPlaces[0];
      const resolved = resolveCanonicalPlace(rawPlaces as any, first.id);
      expect(resolved).not.toBeNull();
      expect(resolved?.id).toBe(first.id);
      expect(resolved?.name).toBe(first.name);
    });

    it('resolves place by exact name with whitespace trimming and case insensitivity', () => {
      const first = rawPlaces[0];
      const resolved = resolveCanonicalPlace(rawPlaces as any, `  ${first.name.toUpperCase()}  `);
      expect(resolved).not.toBeNull();
      expect(resolved?.id).toBe(first.id);
    });

    it('correctly compares place equality across representations', () => {
      const place1 = rawPlaces[0] as any;
      const place2 = { ...rawPlaces[0] } as any;
      expect(isSamePlace(place1, place2)).toBe(true);

      const place3 = rawPlaces[1] as any;
      expect(isSamePlace(place1, place3)).toBe(false);
    });
  });
});
