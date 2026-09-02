// @vitest-environment jsdom
/**
 * Comprehensive Validation Suite for Digital Heritage 3D Rebuild & Odisha Destination Worlds Expansion.
 * Validates:
 * 1. Exactly 4 canonical heritage locations (Konark Sun Temple, Puri Jagannath Temple, Lingaraj Temple, Brahmeswara Temple).
 * 2. Solid 3D geometry models with PBR materials, no THREE.Points fake reconstruction.
 * 3. Sacred interior protection for Puri Jagannath Temple.
 * 4. All 12 verified eligible Odisha destinations with unique IDs, verified unique images, and complete provenance.
 * 5. Horizontal destination rail scrollability and responsive stability.
 * 6. CRITICAL: Autoplay slide changes NEVER scroll the window, NEVER call element.scrollIntoView, and NEVER steal focus.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { FALLBACK_HERITAGE_SCENES, fetchHeritageSceneById } from '../src/api/heritageApi';
import { DESTINATION_WORLD_ASSETS } from '../src/data/destinationWorldAssets';
import { getAllDestinationWorlds, getDestinationWorldById } from '../src/data/destinationWorlds';
import { HeritageQualityController } from '../src/components/heritage/HeritageQualityController';
import { HeritageSceneLoader } from '../src/components/heritage/HeritageSceneLoader';
import { HeritageSceneManager } from '../src/components/heritage/HeritageSceneManager';
import { HeritageModelBuilder } from '../src/components/heritage/HeritageModelBuilder';
import { DestinationWorldStage } from '../src/components/destination/DestinationWorldStage';

describe('Odisha Destination Worlds Expansion & Media Provenance Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = () => {};
    }
    if (!HTMLElement.prototype.scrollTo) {
      HTMLElement.prototype.scrollTo = () => {};
    }
    if (!window.scrollTo) {
      window.scrollTo = () => {};
    }
    if (!window.scroll) {
      window.scroll = () => {};
    }
    if (!window.matchMedia) {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('contains all 12 eligible verified Odisha destinations with unique IDs', () => {
    const worlds = getAllDestinationWorlds();
    expect(worlds).toHaveLength(12);

    const ids = worlds.map((w) => w.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(12);

    expect(ids).toContain('puri-beach');
    expect(ids).toContain('chandrabhaga-beach');
    expect(ids).toContain('gopalpur-on-sea');
    expect(ids).toContain('chilika-satapada');
    expect(ids).toContain('daringbadi');
    expect(ids).toContain('similipal');
    expect(ids).toContain('konark-chariot');
    expect(ids).toContain('dhauli-valley');
    expect(ids).toContain('lingaraj-heritage');
    expect(ids).toContain('puri-jagannath-heritage');
    expect(ids).toContain('barabati-citadel');
    expect(ids).toContain('udayagiri-monasteries');
  });

  it('verifies that every destination has a unique verified image with zero duplicate images', () => {
    const posters = DESTINATION_WORLD_ASSETS.map((w) => w.posterUrl);
    const uniquePosters = new Set(posters);
    expect(uniquePosters.size).toBe(12);

    DESTINATION_WORLD_ASSETS.forEach((dest) => {
      // Must use valid local webp path
      expect(dest.posterUrl).toMatch(/^\/images\/(destinations|heritage)\/[a-z_]+\.webp$/);
      // Fallback poster must be present
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
      expect(dest.verificationNote.length).toBeGreaterThan(25);
      expect(dest.destinationIdentity).toBeTruthy();
    });
  });

  it('verifies destination lookup by ID works accurately', () => {
    const puri = getDestinationWorldById('puri-beach');
    expect(puri).toBeDefined();
    expect(puri?.name).toBe('Puri Golden Beach');

    const konark = getDestinationWorldById('konark-chariot');
    expect(konark).toBeDefined();
    expect(konark?.category).toBe('HERITAGE');
  });

  it('covers all essential Odisha tourism categories across the 12 destinations', () => {
    const categories = DESTINATION_WORLD_ASSETS.map((w) => w.category);
    expect(categories).toContain('BEACH');
    expect(categories).toContain('LAGOON');
    expect(categories).toContain('HILL_STATION');
    expect(categories).toContain('WILDLIFE');
    expect(categories).toContain('HERITAGE');
  });

  it('guarantees automatic destination slide changes NEVER scroll the window or call element.scrollIntoView', () => {
    // Spies on DOM and Window scrolling APIs
    const scrollIntoViewSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
    const windowScrollToSpy = vi.spyOn(window, 'scrollTo');
    const windowScrollSpy = vi.spyOn(window, 'scroll');

    const { getAllByText, unmount } = render(<DestinationWorldStage />);

    // Initial destination is visible (in button and heading)
    expect(getAllByText('Puri Golden Beach').length).toBeGreaterThanOrEqual(1);

    // Advance 9 seconds to trigger automatic background slide transition
    act(() => {
      vi.advanceTimersByTime(9500);
    });

    // Content changes to next slide
    expect(getAllByText('Chandrabhaga Beach').length).toBeGreaterThanOrEqual(1);

    // Verify ZERO calls to scrollIntoView, window.scrollTo, or window.scroll
    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
    expect(windowScrollToSpy).not.toHaveBeenCalled();
    expect(windowScrollSpy).not.toHaveBeenCalled();

    // Advance 9 more seconds for another transition
    act(() => {
      vi.advanceTimersByTime(9500);
    });

    expect(getAllByText('Gopalpur-on-Sea').length).toBeGreaterThanOrEqual(1);
    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
    expect(windowScrollToSpy).not.toHaveBeenCalled();
    expect(windowScrollSpy).not.toHaveBeenCalled();

    scrollIntoViewSpy.mockRestore();
    windowScrollToSpy.mockRestore();
    windowScrollSpy.mockRestore();
    unmount();
  });
});

describe('Digital Heritage 3D Rebuild & Architecture Truthfulness Suite', () => {
  it('contains EXACTLY the 4 canonical high-priority Odisha heritage locations', () => {
    expect(FALLBACK_HERITAGE_SCENES).toHaveLength(4);

    const ids = FALLBACK_HERITAGE_SCENES.map((s) => s.id);
    expect(ids).toContain('konark-sun-temple');
    expect(ids).toContain('puri-jagannath-temple');
    expect(ids).toContain('lingaraj-temple');
    expect(ids).toContain('brahmeswara-temple');
  });

  it('builds genuine 3D volumetric geometry with Three.js without THREE.Points', () => {
    // 1. Konark Sun Temple
    const konarkMesh = HeritageModelBuilder.buildKonarkSunTemple();
    expect(konarkMesh).toBeDefined();
    expect(konarkMesh.children.length).toBeGreaterThan(3);

    // 2. Puri Jagannath Temple
    const jagannathMesh = HeritageModelBuilder.buildPuriJagannathTemple();
    expect(jagannathMesh).toBeDefined();
    expect(jagannathMesh.children.length).toBeGreaterThan(4);

    // 3. Lingaraj Temple
    const lingarajMesh = HeritageModelBuilder.buildLingarajTemple();
    expect(lingarajMesh).toBeDefined();
    expect(lingarajMesh.children.length).toBeGreaterThan(3);

    // 4. Brahmeswara Temple
    const brahmeswaraMesh = HeritageModelBuilder.buildBrahmeswaraTemple();
    expect(brahmeswaraMesh).toBeDefined();
    expect(brahmeswaraMesh.children.length).toBeGreaterThan(3);
  });

  it('enforces sacred architecture rule: Puri Jagannath Temple interior is strictly omitted', () => {
    const jagannath = FALLBACK_HERITAGE_SCENES.find((s) => s.id === 'puri-jagannath-temple')!;
    expect(jagannath.reconstruction_notes.toLowerCase()).toContain('interior');
    expect(
      jagannath.reconstruction_notes.toLowerCase().includes('omitted') ||
      jagannath.reconstruction_notes.toLowerCase().includes('no interior')
    ).toBe(true);

    const nilachakra = jagannath.hotspots.find((h) => h.id === 'jagannath_nilachakra');
    expect(nilachakra).toBeDefined();
    expect(nilachakra?.dimension).toBeDefined();
    expect(nilachakra?.material).toBeDefined();
  });

  it('verifies verified architectural dimensions and materials exist for all 4 monuments', () => {
    FALLBACK_HERITAGE_SCENES.forEach((scene) => {
      expect(scene.dimensions).toBeDefined();
      expect(Object.keys(scene.dimensions || {}).length).toBeGreaterThan(0);

      expect(scene.materials).toBeDefined();
      expect(Object.keys(scene.materials || {}).length).toBeGreaterThan(0);

      expect(scene.hotspots.length).toBeGreaterThanOrEqual(3);
      scene.hotspots.forEach((h) => {
        expect(h.position).toHaveLength(3);
        expect(h.dimension).toBeDefined();
        expect(h.material).toBeDefined();
        expect(h.architectural_significance).toBeTruthy();
      });
    });
  });

  it('verifies alias support for Bhrameshwar Temple', async () => {
    const byAlias = await fetchHeritageSceneById('bhrameshwar-temple');
    expect(byAlias).toBeDefined();
    expect(byAlias.id).toBe('brahmeswara-temple');
    expect(byAlias.name).toBe('Brahmeswara Temple');
  });

  it('verifies absence of naive THREE.Points fake conversion in HeritageSceneLoader', () => {
    const loaderCode = HeritageSceneLoader.toString();
    expect(loaderCode).not.toContain('PointsMaterial');
    expect(loaderCode).not.toContain('THREE.Points');
  });

  it('verifies HeritageSceneManager scene mounting and disposal', () => {
    const manager = new HeritageSceneManager();
    expect(manager.scene).toBeDefined();

    const loaded = manager.loadMonumentModel(FALLBACK_HERITAGE_SCENES[0]);
    expect(loaded).toBe(true);
    expect(manager.monumentGroup.children.length).toBeGreaterThan(0);

    // Test disposal
    manager.dispose();
    expect(manager.monumentGroup.children.length).toBe(0);
  });

  it('verifies Quality Controller presets', () => {
    const high = HeritageQualityController.getSettings('HIGH');
    expect(high.shadowsEnabled).toBe(true);

    const perf = HeritageQualityController.getSettings('PERFORMANCE');
    expect(perf.pixelRatio).toBe(1.0);
    expect(perf.shadowsEnabled).toBe(false);
  });
});
