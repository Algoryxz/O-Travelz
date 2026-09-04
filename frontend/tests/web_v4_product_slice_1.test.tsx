/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { getPlaceOdiaName, getPlaceCulturalMeta } from '../src/data/canonicalOdiaPlaces';
import { StitchDestinationDetailModal } from '../src/components/stitch/StitchDestinationDetailModal';
import type { PlaceDetail } from '../src/api/contracts';

afterEach(() => {
  cleanup();
});

// Mock apiClient
vi.mock('../src/api/client', () => ({
  apiClient: {
    getWeather: vi.fn().mockResolvedValue({
      current: { temperature_c: 29, condition: 'Partly Cloudy' },
    }),
    listPlaces: vi.fn().mockResolvedValue([]),
  },
}));

// Mock MapLibreCanvas to avoid WebGL context requirements in jsdom
vi.mock('../src/components/map/MapLibreCanvas', () => ({
  MapLibreCanvas: (props: any) => (
    <div data-testid="mock-maplibre-canvas" data-selected={props.selectedPlaceId}>
      Mock MapLibre Canvas ({props.places?.length || 0} places)
    </div>
  ),
}));

describe('Web V4 Product Slice 1 — Cultural Atlas & Multidimensional Truth', () => {
  describe('Canonical Odia Localization & Cultural Taxonomy', () => {
    it('provides deterministic verified Odia script for landmark sanctuaries', () => {
      const konarkOdia = getPlaceOdiaName({ name: 'Konark Sun Temple', category: 'temple', district: 'Puri' });
      expect(konarkOdia).toBe('କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର');

      const jagannathOdia = getPlaceOdiaName({ name: 'Shree Jagannath Temple', category: 'temple', district: 'Puri' });
      expect(jagannathOdia).toBe('ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର');

      const lingarajOdia = getPlaceOdiaName({ name: 'Lingaraj Temple', category: 'temple', district: 'Khordha' });
      expect(lingarajOdia).toBe('ଲିଙ୍ଗରାଜ ମନ୍ଦିର');

      const chilikaOdia = getPlaceOdiaName({ name: 'Chilika Lake', category: 'lake', district: 'Puri' });
      expect(chilikaOdia).toBe('ଚିଲିକା ହ୍ରଦ');
    });

    it('falls back gracefully to verified category and district Odia script for generic entries', () => {
      const fallbackOdia = getPlaceOdiaName({ name: 'Random Eco Park', category: 'nature', district: 'Mayurbhanj' });
      expect(fallbackOdia).toContain('ମୟୂରଭଞ୍ଜ');
    });

    it('extracts grounded architectural era, etiquette, and nearest hub distance', () => {
      const meta = getPlaceCulturalMeta('Konark Sun Temple');
      expect(meta).not.toBeNull();
      expect(meta?.architecturalEra).toContain('13th Century');
      expect(meta?.architecturalStyle).toContain('Kalinga Architectural Style');
      expect(meta?.nearestHub).toBe('Puri');
      expect(meta?.hubDistanceKm).toBe(35);
      expect(meta?.sanctuaryEtiquette).toContain('Footwear prohibited');
    });
  });

  describe('Surface 3: Place Detail (Architectural & Cultural Modal)', () => {
    const mockPlace: PlaceDetail = {
      id: 'place_konark',
      name: 'Konark Sun Temple',
      category: 'temple',
      district: 'Puri',
      region: 'Coastal Belt',
      lat: 19.8876,
      lon: 86.0945,
      description: '13th-century Sun Temple built by King Narasimhadeva I of the Eastern Ganga Dynasty.',
      verification_status: 'VERIFIED_CANONICAL',
    };

    it('renders English title, Odia script, and multidimensional truth badges', () => {
      render(
        <StitchDestinationDetailModal
          place={mockPlace}
          isOpen={true}
          onClose={vi.fn()}
          onPlanTrip={vi.fn()}
          onViewOnMap={vi.fn()}
        />
      );

      // Titles
      expect(screen.getByText('Konark Sun Temple')).toBeDefined();
      expect(screen.getByText('କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର')).toBeDefined();

      // Multidimensional truth model badges
      expect(screen.getByText('VERIFIED_CANONICAL')).toBeDefined();
      expect(screen.getByText('FRESH (09/2026)')).toBeDefined();
      expect(screen.getByText('OPERATIONAL')).toBeDefined();
    });

    it('renders grounded transit connections and zero-hallucination governance notes', () => {
      render(
        <StitchDestinationDetailModal
          place={mockPlace}
          isOpen={true}
          onClose={vi.fn()}
          onPlanTrip={vi.fn()}
          onViewOnMap={vi.fn()}
        />
      );

      // Grounded transit
      expect(screen.getByText('Grounded Transit Connections')).toBeDefined();
      expect(screen.getByText('~35 km')).toBeDefined();
      expect(screen.getByText(/Scheduled arrival data only; live GPS telemetry is strictly not active/i)).toBeDefined();

      // Zero-hallucination visiting governance
      expect(screen.getByText('Visiting & Fare Governance')).toBeDefined();
      expect(screen.getByText(/Opening hours and darshan access are regulated by local temple trusts/i)).toBeDefined();
    });

    it('triggers onViewOnMap and onPlanTrip callbacks correctly', () => {
      const handleViewOnMap = vi.fn();
      const handlePlanTrip = vi.fn();
      const handleClose = vi.fn();

      render(
        <StitchDestinationDetailModal
          place={mockPlace}
          isOpen={true}
          onClose={handleClose}
          onPlanTrip={handlePlanTrip}
          onViewOnMap={handleViewOnMap}
        />
      );

      const mapBtn = screen.getByText('Explore on Vector Map');
      fireEvent.click(mapBtn);
      expect(handleViewOnMap).toHaveBeenCalledWith(mockPlace);

      const planBtn = screen.getByText('Plan Itinerary with AI');
      fireEvent.click(planBtn);
      expect(handlePlanTrip).toHaveBeenCalledWith(mockPlace);
    });
  });

  describe('Surface 1: Explore (Cultural Atlas)', () => {
    it('renders canonical header with 204 verified sanctuaries and view mode toggle', async () => {
      const { StitchDestinationsPage } = await import('../src/pages/stitch/StitchDestinationsPage');
      const { AIProvider } = await import('../src/context/AIContext');

      render(
        <AIProvider>
          <StitchDestinationsPage onNavigate={vi.fn()} />
        </AIProvider>
      );

      // Header verification
      expect(screen.getByText(/204 Canonical Sanctuaries \+ Verified Cultural Heritage/i)).toBeDefined();
      expect(screen.getByText('Destinations & Cultural Atlas')).toBeDefined();

      // Mode toggles
      const gridBtn = screen.getByTitle('Grid View');
      const mapBtn = screen.getByTitle('Split Map View');
      expect(gridBtn).toBeDefined();
      expect(mapBtn).toBeDefined();

      // Toggle to Split Map mode
      fireEvent.click(mapBtn);
      expect(screen.getByTitle('Split Map View')).toBeDefined();
    });
  });
});

