import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import {
  resolveDestinationImage,
  getCategoryFallbackSvg,
  PLACE_IMAGE_OVERRIDES,
} from '../src/utils/imageRegistry';
import { ODISHA_EXPERIENCES } from '../src/data/odishaExperiences';
import { StitchSavedPage } from '../src/pages/stitch/StitchSavedPage';
import { StitchNavbar } from '../src/components/stitch/StitchNavbar';
import { StitchTransitSection } from '../src/components/stitch/StitchTransitSection';
import { LocationProvider } from '../src/context/LocationContext';

describe('Phase 5C: Experience & Destination Image Truth', () => {
  it('resolves curated experiences with dedicated keys without Konark/Daringbadi contamination', () => {
    const ekamra = resolveDestinationImage({
      id: 'exp_ekamra_haat',
      name: 'Ekamra Haat Urban Craft & Food Village',
      category: 'shopping',
    });
    expect(ekamra.src).toBeTruthy();
    expect(ekamra.src).not.toContain('place_konark_001');

    const boyanika = resolveDestinationImage({
      id: 'exp_boyanika_handloom',
      name: 'Boyanika Sambalpuri Handloom Emporium',
      category: 'shopping',
    });
    expect(boyanika.src).toBeTruthy();

    const esplanade = resolveDestinationImage({
      id: 'exp_esplanade_one',
      name: 'Esplanade One Shopping & Entertainment',
      category: 'mall',
    });
    expect(esplanade.src).toBeTruthy();
  });

  it('all 10 verified experiential traditions have valid image keys and category labels', () => {
    expect(ODISHA_EXPERIENCES.length).toBeGreaterThanOrEqual(10);
    for (const exp of ODISHA_EXPERIENCES) {
      expect(exp.image_key).toBeTruthy();
      expect(exp.name).toBeTruthy();
      expect(exp.type).toBeTruthy();
      const resolved = resolveDestinationImage({
        id: exp.image_key,
        name: exp.name,
        category: exp.type,
      });
      expect(resolved.src).toBeTruthy();
    }
  });

  it('getCategoryFallbackSvg produces valid vector URIs without leaking other photos', () => {
    const categories = ['shopping', 'mall', 'food_experience', 'craft', 'temple', 'waterfall', 'beach', 'lake', 'wildlife'];
    for (const cat of categories) {
      const svg = getCategoryFallbackSvg(cat);
      expect(svg).toContain('data:image/svg+xml');
      expect(svg).not.toContain('lh3.googleusercontent.com');
    }
  });
});

describe('Phase 5C: Truthful Saved Page & Navigation', () => {
  it('does not contain fake sign-in or cloud auth CTA on Saved page', () => {
    const html = renderToString(<StitchSavedPage onNavigate={() => {}} />);
    expect(html).not.toContain('Sign In to Sync Cloud Archive');
    expect(html).not.toContain('Sign In');
    expect(html).toContain('Personal Sanctuary Archive');
    expect(html).toContain('Stored On This Device');
  });

  it('renders Saved shortcut in Navbar instead of misleading Account button', () => {
    const html = renderToString(
      <LocationProvider>
        <StitchNavbar currentTab="discover" onSelectTab={() => {}} />
      </LocationProvider>
    );
    expect(html).not.toContain('Account &amp; Cloud Sync');
    expect(html).toContain('Saved');
  });
});

describe('Phase 5C: Locality & Transit Intelligence Presentation', () => {
  it('renders default hub as Master Canteen · Bhubaneswar with middle dot hierarchy', () => {
    const html = renderToString(
      <LocationProvider>
        <StitchNavbar currentTab="discover" onSelectTab={() => {}} />
      </LocationProvider>
    );
    expect(html).toContain('Master Canteen · Bhubaneswar');
    expect(html).not.toContain('20.26');
    expect(html).not.toContain('85.84');
  });

  it('renders Mo Bus section with verified hubs and options', () => {
    const html = renderToString(
      <LocationProvider>
        <StitchTransitSection />
      </LocationProvider>
    );
    expect(html).toContain('Mo Bus &amp; Transit Near You');
    expect(html).toContain('Choose Starting Location');
  });
});
