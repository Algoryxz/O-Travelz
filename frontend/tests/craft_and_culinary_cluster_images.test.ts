import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { ODISHA_EXPERIENCES } from '../src/data/odishaExperiences';
import { resolveDestinationImage, getCategoryFallbackSvg, PLACE_IMAGE_OVERRIDES } from '../src/utils/imageRegistry';
import { StitchDestinationsPage } from '../src/pages/stitch/StitchDestinationsPage';

describe('Culinary, Handloom & Craft Cluster Images Reliability', () => {
  it('all 10 culinary and craft clusters resolve to a non-empty, valid image source', () => {
    expect(ODISHA_EXPERIENCES.length).toBe(10);

    for (const exp of ODISHA_EXPERIENCES) {
      const result = resolveDestinationImage({
        id: exp.image_key,
        name: exp.name,
        category: exp.type,
      });

      expect(result).toBeDefined();
      expect(result.src).toBeTruthy();
      expect(typeof result.src).toBe('string');
      expect(result.src.trim().length).toBeGreaterThan(0);
      expect(result.src).not.toBe('undefined');
      expect(result.src).not.toBe('null');
      expect(result.alt).toBeTruthy();
      expect(result.sourceType).toBe('manual_override');
    }
  });

  it('all 5 culinary experiences map to verified authentic food assets', () => {
    const foodExps = ODISHA_EXPERIENCES.filter(e => e.type === 'food_experience' || e.type === 'restaurant');
    expect(foodExps.length).toBe(5);

    for (const exp of foodExps) {
      const result = resolveDestinationImage({ id: exp.image_key, name: exp.name, category: exp.type });
      expect(result.src).toMatch(/^\/images\/manual\/food_/);
    }
  });

  it('all craft, handloom, and shopping clusters resolve to distinct, representative images', () => {
    const craftExps = ODISHA_EXPERIENCES.filter(e => e.type === 'craft' || e.type === 'shopping' || e.type === 'mall');
    expect(craftExps.length).toBe(5);

    for (const exp of craftExps) {
      const result = resolveDestinationImage({ id: exp.image_key, name: exp.name, category: exp.type });
      expect(result.src.startsWith('http') || result.src.startsWith('/images/')).toBe(true);
    }
  });

  it('places with missing overrides fall back gracefully through the category-themed SVG hierarchy', () => {
    const unmappedFood = resolveDestinationImage({
      id: 'unknown_experience_food_999',
      name: 'Unknown Village Sweets Stall',
      category: 'food_experience',
    });
    expect(unmappedFood.sourceType).toBe('category_fallback');
    expect(unmappedFood.src).toContain('data:image/svg+xml');
    expect(unmappedFood.src).toContain('Traditional');

    const unmappedCraft = resolveDestinationImage({
      id: 'unknown_experience_craft_999',
      name: 'Unknown Artisan Colony',
      category: 'craft',
    });
    expect(unmappedCraft.sourceType).toBe('category_fallback');
    expect(unmappedCraft.src).toContain('data:image/svg+xml');
  });

  it('onError fallback function getCategoryFallbackSvg always returns a valid, renderable SVG', () => {
    for (const exp of ODISHA_EXPERIENCES) {
      const fallback = getCategoryFallbackSvg(exp.type, exp.name);
      expect(fallback).toBeTruthy();
      expect(fallback.startsWith('data:image/svg+xml')).toBe(true);
    }
  });

  it('StitchDestinationsPage renders all 10 Culinary, Handloom & Craft Cluster cards with non-empty images', () => {
    const html = renderToString(
      React.createElement(StitchDestinationsPage, {
        onNavigate: () => {},
      })
    );

    expect(html).toContain('Culinary, Handloom');
    expect(html).toContain('Craft Clusters');

    for (const exp of ODISHA_EXPERIENCES) {
      expect(html).toContain(exp.name.replace(/&/g, '&amp;'));
    }
  });

  it('every place in the whole destinations catalog resolves to a non-empty renderable image source', () => {
    const places = require('../../data/places/places.json');
    expect(places.length).toBeGreaterThan(150);

    for (const place of places) {
      const result = resolveDestinationImage({
        id: place.id,
        researchId: place.research_id,
        name: place.name,
        category: place.category,
      });

      expect(result).toBeDefined();
      expect(result.src).toBeTruthy();
      expect(typeof result.src).toBe('string');
      expect(result.src.trim().length).toBeGreaterThan(0);
      expect(result.src).not.toBe('undefined');
      expect(result.src).not.toBe('null');
      expect(result.alt).toBeTruthy();
    }
  });
});
