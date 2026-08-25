import { describe, it, expect } from 'vitest';
import { resolveDestinationImage, getCategoryFallbackSvg, PLACE_IMAGE_OVERRIDES } from '../src/utils/imageRegistry';
import { getPlaceImages, getPrimaryPlaceImage } from '../src/utils/imageService';

describe('Semantic Image Contract & Anti-Cross-Contamination', () => {
  it('prioritizes explicit curated/verified images', () => {
    const result = resolveDestinationImage({
      researchId: 'place_puri_001',
      name: 'Puri Beach',
      category: 'beach',
    });
    expect(result.sourceType).toBe('manual_override');
    expect(result.src).toContain('googleusercontent.com');
    expect(result.src).toBe(PLACE_IMAGE_OVERRIDES['place_puri_001']);
  });

  it('verified Konark image resolves to public 200 asset without 403 /aida/ forbidden path', () => {
    const result = resolveDestinationImage({
      researchId: 'place_konark_001',
      name: 'Konark Sun Temple',
      category: 'monument',
    });
    expect(result.sourceType).toBe('manual_override');
    expect(result.src).toContain('aida-public');
    expect(result.src).not.toContain('/aida/');
  });

  it('rejects cross-category contamination: food places resolve to food SVG fallback', () => {
    const fallbackSvg = getCategoryFallbackSvg('restaurant', 'Local Odia Dhaba');
    expect(fallbackSvg).toContain('data:image/svg+xml');
    expect(fallbackSvg).toContain('Traditional');
    expect(fallbackSvg).not.toContain('1559742811-822873691df8');
    expect(fallbackSvg).not.toContain('Temple');
  });

  it('temple category resolves to sacred architecture SVG fallback and never to food or fish', () => {
    const fallbackSvg = getCategoryFallbackSvg('temple', 'Unknown Sacred Shrine');
    expect(fallbackSvg).toContain('data:image/svg+xml');
    expect(fallbackSvg).toContain('Temple');
    expect(fallbackSvg).not.toContain('Food');
    expect(fallbackSvg).not.toContain('Culinary');
  });

  it('wildlife category resolves to sanctuary forest canopy SVG fallback and never to medical imagery', () => {
    const fallbackSvg = getCategoryFallbackSvg('wildlife', 'Wildlife Reserve');
    expect(fallbackSvg).toContain('data:image/svg+xml');
    expect(fallbackSvg).toContain('Wildlife');
    expect(fallbackSvg).not.toContain('Medical');
    expect(fallbackSvg).not.toContain('bf5d0fc229ac');
  });

  it('waterfall category resolves to waterfall cascades SVG fallback', () => {
    const fallbackSvg = getCategoryFallbackSvg('waterfall', 'Forest Falls');
    expect(fallbackSvg).toContain('data:image/svg+xml');
    expect(fallbackSvg).toContain('Waterfall');
  });

  it('beach category resolves to coastal beach SVG fallback even if name includes hotel', () => {
    const fallbackSvg = getCategoryFallbackSvg('beach', 'Hotel Sea Pearl, Puri Beach');
    expect(fallbackSvg).toContain('data:image/svg+xml');
    expect(fallbackSvg).toContain('Coastal%20Beach');
    expect(fallbackSvg).not.toContain('Culinary');
  });

  it('craft category resolves to handloom & bazaar market SVG fallback', () => {
    const fallbackSvg = getCategoryFallbackSvg('market', 'Raghurajpur Crafts Village');
    expect(fallbackSvg).toContain('data:image/svg+xml');
    expect(fallbackSvg).toContain('Market%2C%20Handlooms');
  });

  it('transit category resolves to Mo Bus corridor SVG fallback', () => {
    const fallbackSvg = getCategoryFallbackSvg('transit_hub', 'Baramunda ISBT Station');
    expect(fallbackSvg).toContain('data:image/svg+xml');
    expect(fallbackSvg).toContain('Mo%20Bus');
  });

  it('resolves newly recovered authentic images with verified manual overrides', () => {
    const waterfallResult = resolveDestinationImage({
      researchId: 'place_keonjhar_002',
      name: 'Badaghagara Waterfall',
      category: 'waterfall',
    });
    expect(waterfallResult.sourceType).toBe('manual_override');
    expect(waterfallResult.src).toBe(PLACE_IMAGE_OVERRIDES['place_keonjhar_002']);

    const airportResult = resolveDestinationImage({
      researchId: 'place_transit_002',
      name: 'Veer Surendra Sai Airport Jharsuguda',
      category: 'transit_hub',
    });
    expect(airportResult.sourceType).toBe('manual_override');
    expect(airportResult.src).toContain('wikimedia.org');

    const monasteryResult = resolveDestinationImage({
      researchId: 'place_jajpur_002',
      name: 'Ratnagiri Buddhist Monastery',
      category: 'monument',
    });
    expect(monasteryResult.sourceType).toBe('manual_override');
    expect(monasteryResult.src).toContain('wikimedia.org');
  });

  it('unresolved places cleanly degrade to their specific category SVG fallback', () => {
    const foodUnresolved = resolveDestinationImage({
      researchId: 'food_bargarh_001',
      name: 'Bargarh Dhanu Yatra Cultural Food Street',
      category: 'local_food_experience',
    });
    expect(foodUnresolved.sourceType).toBe('category_fallback');
    expect(foodUnresolved.src).toContain('Traditional');

    const riverGatewayUnresolved = resolveDestinationImage({
      researchId: 'place_bhadrak_003',
      name: 'Chandbali River Gateway',
      category: 'nature',
    });
    expect(riverGatewayUnresolved.sourceType).toBe('category_fallback');
    expect(riverGatewayUnresolved.src).toContain('Nature');
  });
});
