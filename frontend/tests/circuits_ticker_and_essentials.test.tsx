import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CircuitsTicker } from '../src/components/home/CircuitsTicker';
import { EssentialsSection } from '../src/components/home/EssentialsSection';
import { LocationProvider } from '../src/context/LocationContext';

describe('Popular Circuits Marquee Ticker & Essentials Section', () => {
  it('renders popular circuits ticker with continuous marquee and editorial circuits', () => {
    const html = renderToString(<CircuitsTicker onSelectCircuit={() => {}} />);

    expect(html).toContain('data-testid="popular-circuits-ticker"');
    expect(html).toContain('POPULAR CIRCUITS:');
    expect(html).toContain('Golden Triangle');
    expect(html).toContain('Chilika Marine');
    expect(html).toContain('Koraput Highlands');
    expect(html).toContain('Similipal Biosphere');
  });

  it('renders Essentials Near You with Medical 24/7, ATMs, and Transit triggers', () => {
    const html = renderToString(
      <LocationProvider>
        <EssentialsSection
          onOpenMedical={() => {}}
          onOpenATM={() => {}}
          onOpenTransit={() => {}}
        />
      </LocationProvider>
    );

    expect(html).toContain('data-testid="essentials-near-you-section"');
    expect(html).toContain('Essentials Near You');
    expect(html).toContain('Medical Help 24/7');
    expect(html).toContain('ATMs &amp; Cash Points');
    expect(html).toContain('Mo Bus &amp; Transit');
  });
});
