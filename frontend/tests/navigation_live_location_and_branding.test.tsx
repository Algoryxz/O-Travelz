import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StitchNavbar } from '../src/components/stitch/StitchNavbar';
import { LocationProvider, CANONICAL_ODISHA_HUBS } from '../src/context/LocationContext';

describe('Top Navigation & Live Location Taskbar Control', () => {
  it('renders O-Travelz brand with "safe • secure • smart" tagline', () => {
    const html = renderToString(
      <LocationProvider>
        <StitchNavbar currentTab="discover" onSelectTab={() => {}} />
      </LocationProvider>
    );

    expect(html).toContain('O-Travelz');
    expect(html).toContain('safe • secure • smart');
  });

  it('displays a single "Saved Places" concept without duplicate "Saved Journeys"', () => {
    const html = renderToString(
      <LocationProvider>
        <StitchNavbar currentTab="discover" onSelectTab={() => {}} />
      </LocationProvider>
    );

    expect(html).toContain('Saved Places');
    expect(html).not.toContain('Saved Journeys');
  });

  it('provides canonical Odisha hubs in location context', () => {
    expect(CANONICAL_ODISHA_HUBS.length).toBeGreaterThan(5);
    const cities = CANONICAL_ODISHA_HUBS.map(h => h.city);
    expect(cities).toContain('Bhubaneswar');
    expect(cities).toContain('Puri');
    expect(cities).toContain('Konark');
  });
});
