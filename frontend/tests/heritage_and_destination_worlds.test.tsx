/**
 * Tests for Digital Heritage 3D Explorer and Odisha Destination Worlds.
 */
import { describe, it, expect } from 'vitest';
import { FALLBACK_HERITAGE_SCENES, fetchHeritageScenes } from '../src/api/heritageApi';
import { ODISHA_DESTINATION_WORLDS } from '../src/components/destination/OdishaDestinationWorlds';
import { HeritageQualityController } from '../src/components/heritage/HeritageQualityController';

describe('Digital Heritage & Destination Worlds Suite', () => {
  it('contains all 6 canonical high-priority Odisha heritage reconstructions', () => {
    expect(FALLBACK_HERITAGE_SCENES).toHaveLength(6);

    const ids = FALLBACK_HERITAGE_SCENES.map((s) => s.id);
    expect(ids).toContain('konark-sun-temple');
    expect(ids).toContain('puri-jagannath-temple');
    expect(ids).toContain('dhauli-shanti-stupa');
    expect(ids).toContain('lingaraj-temple');
    expect(ids).toContain('udayagiri-khandagiri-caves');
    expect(ids).toContain('barabati-fort');
  });

  it('verifies Konark Sun Temple photogrammetric reconstruction integrity', () => {
    const konark = FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'konark-sun-temple')!;
    expect(konark.scene_type).toBe('REAL_3D_RECONSTRUCTION');
    expect(konark.status).toBe('AVAILABLE');
    expect(konark.hotspots.length).toBeGreaterThanOrEqual(4);
    expect(konark.sources.length).toBeGreaterThanOrEqual(2);

    // Verify 24-spoke wheel hotspot
    const wheelHotspot = konark.hotspots.find((h) => h.id === 'konark_wheel');
    expect(wheelHotspot).toBeDefined();
    expect(wheelHotspot?.title).toContain('Surya Chakra');
  });

  it('verifies Puri Jagannath Temple sacred reference classification', () => {
    const jagannath = FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'puri-jagannath-temple')!;
    expect(jagannath.scene_type).toBe('REFERENCE_VIRTUAL_EXPERIENCE');
    expect(jagannath.status).toBe('REFERENCE_ONLY');

    const nilachakra = jagannath.hotspots.find((h) => h.id === 'jagannath_nilachakra');
    expect(nilachakra).toBeDefined();
  });

  it('verifies Quality Presets configure proper pixel ratios and point budgets', () => {
    const high = HeritageQualityController.getSettings('HIGH');
    expect(high.shadowsEnabled).toBe(true);
    expect(high.pointBudget).toBeGreaterThanOrEqual(300000);

    const perf = HeritageQualityController.getSettings('PERFORMANCE');
    expect(perf.pixelRatio).toBe(1.0);
    expect(perf.shadowsEnabled).toBe(false);
  });

  it('contains authentic Odisha Destination Worlds with zero space/fake themes', () => {
    expect(ODISHA_DESTINATION_WORLDS.length).toBeGreaterThanOrEqual(6);

    const categories = ODISHA_DESTINATION_WORLDS.map((w) => w.category);
    expect(categories).toContain('BEACH');
    expect(categories).toContain('HERITAGE');
    expect(categories).toContain('NATURE');

    const names = ODISHA_DESTINATION_WORLDS.map((w) => w.name);
    expect(names.some((n) => n.includes('Puri'))).toBe(true);
    expect(names.some((n) => n.includes('Konark'))).toBe(true);
    expect(names.some((n) => n.includes('Chilika'))).toBe(true);
    expect(names.some((n) => n.includes('Daringbadi'))).toBe(true);
    expect(names.some((n) => n.includes('Similipal'))).toBe(true);
  });
});
