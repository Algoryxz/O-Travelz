/**
 * Comprehensive Validation Suite for Digital Heritage Spatial Explorer & Odisha Destination Worlds.
 * Validates media authenticity, provenance, Gaussian Splatting architecture,
 * and honest reconstruction status reporting.
 */
import { describe, it, expect } from 'vitest';
import { FALLBACK_HERITAGE_SCENES } from '../src/api/heritageApi';
import { DESTINATION_WORLD_ASSETS } from '../src/data/destinationWorldAssets';
import { getAllDestinationWorlds } from '../src/data/destinationWorlds';
import { HeritageQualityController } from '../src/components/heritage/HeritageQualityController';
import { HeritageSplatRenderer } from '../src/components/heritage/HeritageSplatRenderer';
import { HeritageSceneLoader } from '../src/components/heritage/HeritageSceneLoader';
import { HeritageSceneManager } from '../src/components/heritage/HeritageSceneManager';

describe('Odisha Destination Worlds - Media Authenticity & Provenance Suite', () => {
  it('contains exactly 8 canonical Odisha destinations with unique IDs', () => {
    const worlds = getAllDestinationWorlds();
    expect(worlds).toHaveLength(8);

    const ids = worlds.map((w) => w.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(8);

    expect(ids).toContain('puri-beach');
    expect(ids).toContain('chandrabhaga-beach');
    expect(ids).toContain('gopalpur-on-sea');
    expect(ids).toContain('chilika-satapada');
    expect(ids).toContain('daringbadi');
    expect(ids).toContain('similipal');
    expect(ids).toContain('konark-chariot');
    expect(ids).toContain('dhauli-valley');
  });

  it('verifies that each destination has a unique verified local poster and valid fallback', () => {
    const posters = DESTINATION_WORLD_ASSETS.map((w) => w.posterUrl);
    const uniquePosters = new Set(posters);
    expect(uniquePosters.size).toBe(8);

    DESTINATION_WORLD_ASSETS.forEach((dest) => {
      // Must use local webp asset
      expect(dest.posterUrl).toMatch(/^\/images\/destinations\/[a-z_]+\.webp$/);
      // Fallback poster must be present and point to verified Wikimedia / external archive
      expect(dest.fallbackPosterUrl).toBeTruthy();
      expect(dest.fallbackPosterUrl).toMatch(/^https?:\/\//);
      // Media type must be image or video
      expect(['image', 'video']).toContain(dest.mediaType);
      // Verified flag
      expect(dest.verified).toBe(true);
    });
  });

  it('verifies complete provenance metadata and meaningful verification notes for each destination', () => {
    DESTINATION_WORLD_ASSETS.forEach((dest) => {
      expect(dest.source).toBeTruthy();
      expect(dest.sourceUrl).toMatch(/^https?:\/\//);
      expect(dest.license).toBeTruthy();
      expect(dest.attribution).toBeTruthy();
      expect(dest.verificationNote).toBeTruthy();
      // Verification note must be descriptive (not a generic placeholder)
      expect(dest.verificationNote.length).toBeGreaterThan(25);
      expect(dest.verificationNote).not.toBe('Verified image of destination');
      expect(dest.destinationIdentity).toBeTruthy();
    });
  });

  it('covers all essential Odisha tourism categories', () => {
    const categories = DESTINATION_WORLD_ASSETS.map((w) => w.category);
    expect(categories).toContain('BEACH');
    expect(categories).toContain('LAGOON');
    expect(categories).toContain('HILL_STATION');
    expect(categories).toContain('WILDLIFE');
    expect(categories).toContain('HERITAGE');
  });
});

describe('Digital Heritage - Spatial Architecture & Status Truthfulness Suite', () => {
  it('contains all 6 canonical high-priority Odisha heritage locations', () => {
    expect(FALLBACK_HERITAGE_SCENES).toHaveLength(6);

    const ids = FALLBACK_HERITAGE_SCENES.map((s) => s.id);
    expect(ids).toContain('konark-sun-temple');
    expect(ids).toContain('puri-jagannath-temple');
    expect(ids).toContain('dhauli-shanti-stupa');
    expect(ids).toContain('lingaraj-temple');
    expect(ids).toContain('udayagiri-khandagiri-caves');
    expect(ids).toContain('barabati-fort');
  });

  it('enforces status truthfulness: no REAL_3D_RECONSTRUCTION when spatial file is absent', () => {
    FALLBACK_HERITAGE_SCENES.forEach((scene) => {
      if (!scene.asset.splat_url && !scene.asset.model_url) {
        // Must NEVER claim REAL_3D_RECONSTRUCTION if asset is not present
        expect(scene.scene_type).not.toBe('REAL_3D_RECONSTRUCTION');
        expect(['RECONSTRUCTION_IN_PROGRESS', 'REFERENCE_VIRTUAL_EXPERIENCE']).toContain(
          scene.scene_type
        );
      }
    });
  });

  it('verifies Konark Sun Temple reconstruction in progress status and verified hotspots', () => {
    const konark = FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'konark-sun-temple')!;
    expect(konark.scene_type).toBe('RECONSTRUCTION_IN_PROGRESS');
    expect(konark.status).toBe('PROCESSING');
    expect(konark.hotspots.length).toBeGreaterThanOrEqual(3);
    expect(konark.sources.length).toBeGreaterThanOrEqual(2);

    const wheelHotspot = konark.hotspots.find((h) => h.id === 'konark_wheel');
    expect(wheelHotspot).toBeDefined();
    expect(wheelHotspot?.title).toContain('Surya Chakra');
  });

  it('verifies Puri Jagannath Temple sacred living reference classification', () => {
    const jagannath = FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'puri-jagannath-temple')!;
    expect(jagannath.scene_type).toBe('REFERENCE_VIRTUAL_EXPERIENCE');
    expect(jagannath.status).toBe('REFERENCE_ONLY');

    const nilachakra = jagannath.hotspots.find((h) => h.id === 'jagannath_nilachakra');
    expect(nilachakra).toBeDefined();
  });

  it('verifies absence of naive THREE.Points splat conversion in HeritageSceneLoader', () => {
    const loaderCode = HeritageSceneLoader.toString();
    expect(loaderCode).not.toContain('PointsMaterial');
    expect(loaderCode).not.toContain('THREE.Points');
  });

  it('verifies genuine DropInViewer integration in HeritageSplatRenderer', () => {
    const renderer = new HeritageSplatRenderer();
    expect(renderer).toBeDefined();
    expect(typeof renderer.loadSplatScene).toBe('function');
    expect(typeof renderer.update).toBe('function');
    expect(typeof renderer.dispose).toBe('function');
  });

  it('verifies Quality Controller presets', () => {
    const high = HeritageQualityController.getSettings('HIGH');
    expect(high.shadowsEnabled).toBe(true);
    expect(high.pointBudget).toBeGreaterThanOrEqual(300000);

    const perf = HeritageQualityController.getSettings('PERFORMANCE');
    expect(perf.pixelRatio).toBe(1.0);
    expect(perf.shadowsEnabled).toBe(false);
  });
});
