import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import {
  resolveDestinationImage,
  getCategoryFallbackSvg,
  PLACE_IMAGE_OVERRIDES,
} from '../src/utils/imageRegistry';
import { StitchSavedPage } from '../src/pages/stitch/StitchSavedPage';
import { StitchTransitSection } from '../src/components/stitch/StitchTransitSection';
import { LocationProvider } from '../src/context/LocationContext';

describe('Phase 5B: Image Resolution & Manual Overrides', () => {
  it('resolves curated experiences and places via PLACE_IMAGE_OVERRIDES', () => {
    const ekamra = resolveDestinationImage({
      id: 'exp_ekamra_haat',
      name: 'Ekamra Haat Urban Craft & Food Village',
      category: 'shopping',
    });
    expect(ekamra.sourceType).toBe('manual_override');
    expect(ekamra.src).toContain('images.unsplash.com');

    const boyanika = resolveDestinationImage({
      name: 'Boyanika Sambalpuri Handloom Emporium',
      category: 'shopping',
    });
    expect(boyanika.sourceType).toBe('manual_override');
    expect(boyanika.src).toContain('images.unsplash.com');
  });

  it('falls back to distinct category SVGs for unknown destinations without photo contamination', () => {
    const unknownTemple = resolveDestinationImage({
      id: 'place_unknown_temple_999',
      name: 'Secret Hill Temple',
      category: 'Temple',
    });
    expect(unknownTemple.sourceType).toBe('category_fallback');
    expect(unknownTemple.src).toContain('data:image/svg+xml');
    expect(decodeURIComponent(unknownTemple.src)).toContain('Temple');
    expect(unknownTemple.src).not.toContain('lh3.googleusercontent.com'); // No Konark/Daringbadi contamination

    const unknownWaterfall = resolveDestinationImage({
      id: 'place_unknown_waterfall_888',
      name: 'Forest Rapids',
      category: 'Waterfall',
    });
    expect(unknownWaterfall.sourceType).toBe('category_fallback');
    expect(unknownWaterfall.src).toContain('data:image/svg+xml');
    expect(decodeURIComponent(unknownWaterfall.src)).toContain('Waterfall');
  });

  it('getCategoryFallbackSvg returns valid SVG data URI for all supported categories', () => {
    const categories = ['temple', 'monument', 'museum', 'beach', 'lake', 'waterfall', 'wildlife', 'nature', 'food', 'craft', 'shopping'];
    for (const cat of categories) {
      const svg = getCategoryFallbackSvg(cat);
      expect(svg).toContain('data:image/svg+xml');
    }
  });
});

describe('Phase 5B: Truthful Saved Page (No Fake Cloud Sync / Auth CTA)', () => {
  it('renders truthful device storage badge and does not render fake sign-in CTA', () => {
    const html = renderToString(<StitchSavedPage onNavigate={() => {}} />);

    // Must NOT contain fake sign-in action
    expect(html).not.toContain('Sign In to Sync Cloud Archive');

    // Must contain truthful device storage indicator
    expect(html).toContain('Stored On This Device');
    expect(html).toContain('Personal Sanctuary Archive');
    expect(html).toContain('Saved Sanctuaries &amp; Journeys');
  });
});

describe('Phase 5B: Transit Section State Separation', () => {
  it('renders warm editorial transit container with verified hubs and options', () => {
    const html = renderToString(
      <LocationProvider>
        <StitchTransitSection />
      </LocationProvider>
    );

    expect(html).toContain('Mo Bus &amp; Transit Near You');
    expect(html).toContain('Choose Starting Location');
    expect(html).toContain('Master Canteen');
  });
});
