import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { EssentialsSection } from '../src/components/home/EssentialsSection';
import { LocationProvider } from '../src/context/LocationContext';
import { ODISHA_ESSENTIALS } from '../src/data/odishaEssentials';

describe('EssentialsSection Expansion to 6 Verified Utility Categories', () => {
  it('contains comprehensive verified entries for medical, atms, restaurants, petrol, and police', () => {
    const medical = ODISHA_ESSENTIALS.filter(e => e.category === 'hospital' || e.category === 'pharmacy');
    const atms = ODISHA_ESSENTIALS.filter(e => e.category === 'atm' || e.category === 'bank');
    const restaurants = ODISHA_ESSENTIALS.filter(e => e.category === 'restaurant');
    const petrol = ODISHA_ESSENTIALS.filter(e => e.category === 'petrol');
    const police = ODISHA_ESSENTIALS.filter(e => e.category === 'police');

    expect(medical.length).toBeGreaterThanOrEqual(5);
    expect(atms.length).toBeGreaterThanOrEqual(5);
    expect(restaurants.length).toBeGreaterThanOrEqual(5);
    expect(petrol.length).toBeGreaterThanOrEqual(5);
    expect(police.length).toBeGreaterThanOrEqual(5);

    // Verify coordinates and emergency contact details
    police.forEach(p => {
      expect(p.emergencyPhone).toBe('112');
      expect(p.lat).toBeGreaterThan(18.0);
      expect(p.lon).toBeGreaterThan(82.0);
    });

    petrol.forEach(p => {
      expect(p.is24x7).toBe(true);
      expect(Array.isArray(p.fuelTypes)).toBe(true);
    });
  });

  it('renders all 6 utility cards with clear titles and test IDs in server HTML', () => {
    const html = renderToString(
      <LocationProvider>
        <EssentialsSection
          onOpenMedical={() => {}}
          onOpenATM={() => {}}
          onOpenTransit={() => {}}
          onOpenCulinary={() => {}}
          onOpenPetrol={() => {}}
          onOpenPolice={() => {}}
        />
      </LocationProvider>
    );

    expect(html).toContain('data-testid="essentials-near-you-section"');
    expect(html).toContain('data-testid="essential-card-medical"');
    expect(html).toContain('data-testid="essential-card-atm"');
    expect(html).toContain('data-testid="essential-card-transit"');
    expect(html).toContain('data-testid="essential-card-culinary"');
    expect(html).toContain('data-testid="essential-card-petrol"');
    expect(html).toContain('data-testid="essential-card-police"');

    expect(html).toContain('Medical Help 24/7');
    expect(html).toContain('ATMs &amp; Cash Points');
    expect(html).toContain('Mo Bus &amp; Transit');
    expect(html).toContain('Restaurants &amp; Dining');
    expect(html).toContain('Petrol Pumps &amp; Fuel');
    expect(html).toContain('Police &amp; Tourist Safety');
  });
});
