import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

vi.mock('leaflet', () => {
  return {
    default: {
      map: vi.fn(() => ({
        flyTo: vi.fn(),
        fitBounds: vi.fn(),
        addLayer: vi.fn(),
        remove: vi.fn(),
      })),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      control: { zoom: vi.fn(() => ({ addTo: vi.fn() })) },
      layerGroup: vi.fn(() => ({
        clearLayers: vi.fn(),
        addLayer: vi.fn(),
        addTo: vi.fn().mockReturnThis(),
      })),
      divIcon: vi.fn(() => ({})),
      marker: vi.fn(() => ({
        bindPopup: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
      })),
      polyline: vi.fn(() => ({
        addTo: vi.fn(),
      })),
      latLngBounds: vi.fn(() => ({})),
    },
  };
});

import { StitchMapPage } from '../src/pages/stitch/StitchMapPage';
import { LocationProvider } from '../src/context/LocationContext';
import {
  calculateDriveTimeMinutes,
  calculateWalkTimeMinutes,
  formatDuration,
} from '../src/utils/geoUtils';

describe('Map Modes, Custom Markers & Route Line Engine', () => {
  it('correctly computes driving ETA, walking ETA and formats duration strings', () => {
    // 10 km distance
    const drive10km = calculateDriveTimeMinutes(10);
    const walk10km = calculateWalkTimeMinutes(10);

    expect(drive10km).toBeGreaterThan(10); // ~15-25 mins
    expect(drive10km).toBeLessThan(40);
    expect(walk10km).toBeGreaterThan(100); // ~125 mins

    expect(formatDuration(15)).toBe('15 mins');
    expect(formatDuration(60)).toBe('1 hr');
    expect(formatDuration(95)).toBe('1 hr 35 mins');
  });

  it('renders StitchMapPage with 9 map mode tabs in server HTML', () => {
    const html = renderToString(
      <LocationProvider>
        <StitchMapPage onNavigate={() => {}} initialMode="culinary" />
      </LocationProvider>
    );

    expect(html).toContain('data-testid="map-tab-destinations"');
    expect(html).toContain('data-testid="map-tab-medical"');
    expect(html).toContain('data-testid="map-tab-atm"');
    expect(html).toContain('data-testid="map-tab-transit"');
    expect(html).toContain('data-testid="map-tab-culinary"');
    expect(html).toContain('data-testid="map-tab-petrol"');
    expect(html).toContain('data-testid="map-tab-police"');
    expect(html).toContain('data-testid="map-tab-experiences"');
    expect(html).toContain('data-testid="map-tab-saved"');

    // Verify culinary items are rendered in culinary mode
    expect(html).toContain('Odisha Hotel');
  });
});
