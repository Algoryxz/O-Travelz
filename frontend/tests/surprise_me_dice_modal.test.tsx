import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { SurpriseMeButton } from '../src/components/discovery/SurpriseMeButton';
import { SurpriseDestinationModal } from '../src/components/discovery/SurpriseDestinationModal';
import { LocationProvider } from '../src/context/LocationContext';

describe('Surprise Me Dice Discovery Modal', () => {
  it('renders the dice icon button with label and aria attributes', () => {
    const html = renderToString(
      <LocationProvider>
        <SurpriseMeButton />
      </LocationProvider>
    );

    expect(html).toContain('🎲');
    expect(html).toContain('Surprise Me');
  });

  it('renders the surprise destination modal with place information', () => {
    const mockPlace = {
      id: 'place_konark_001',
      name: 'Konark Sun Temple',
      district: 'Puri',
      region: 'Coastal',
      category: 'Heritage',
      description: '13th Century monumental stone sanctuary.',
      lat: 19.8876,
      lon: 86.0945,
      rating: 4.9,
    } as any;

    const html = renderToString(
      <SurpriseDestinationModal
        isOpen={true}
        place={mockPlace}
        distanceFormatted="65 km"
        onClose={() => {}}
        onRollAgain={() => {}}
        onViewOnMap={() => {}}
        onPlanTrip={() => {}}
      />
    );

    expect(html).toContain('Konark Sun Temple');
    expect(html).toContain('Heritage');
    expect(html).toContain('Puri');
    expect(html).toContain('65 km');
    expect(html).toContain('Roll Again');
    expect(html).toContain('View on Map');
    expect(html).toContain('Plan Trip');
  });
});
