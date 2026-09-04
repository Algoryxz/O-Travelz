import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { setWorkerUrl, config } from 'maplibre-gl';
import maplibreglWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { DEFAULT_MAP_CONFIG, MAP_STYLES } from '../src/config/mapConfig';

describe('MapLibre GL JS — Worker Bundling & Vector Map Configuration', () => {
  it('resolves a non-empty worker URL from Vite worker query pipeline', () => {
    expect(maplibreglWorkerUrl).toBeDefined();
    expect(typeof maplibreglWorkerUrl).toBe('string');
    expect(maplibreglWorkerUrl.length).toBeGreaterThan(0);
  });

  it('sets config.WORKER_URL in MapLibre via setWorkerUrl without 404 relative fallback', () => {
    setWorkerUrl(maplibreglWorkerUrl);
    expect(config.WORKER_URL).toBe(maplibreglWorkerUrl);
    expect(config.WORKER_URL).not.toBe('');
  });

  it('uses OpenFreeMap Liberty as the primary default vector style', () => {
    expect(DEFAULT_MAP_CONFIG.styleUrl).toBe('https://tiles.openfreemap.org/styles/liberty');
    expect(MAP_STYLES.liberty.url).toBe('https://tiles.openfreemap.org/styles/liberty');
    expect(MAP_STYLES.positron.url).toBe('https://tiles.openfreemap.org/styles/positron');
    expect(MAP_STYLES.bright.url).toBe('https://tiles.openfreemap.org/styles/bright');
  });

  it('enforces canonical Odisha bounds and central coordinates', () => {
    const [centerLng, centerLat] = DEFAULT_MAP_CONFIG.defaultCenter;
    expect(centerLng).toBeCloseTo(85.8245, 3);
    expect(centerLat).toBeCloseTo(20.2961, 3);

    const [[swLng, swLat], [neLng, neLat]] = DEFAULT_MAP_CONFIG.odishaBounds;
    // Verify southwest covers western/southern Odisha
    expect(swLng).toBeLessThanOrEqual(81.0);
    expect(swLat).toBeLessThanOrEqual(17.5);
    // Verify northeast covers northern/coastal Odisha
    expect(neLng).toBeGreaterThanOrEqual(87.8);
    expect(neLat).toBeGreaterThanOrEqual(22.8);
  });

  it('verifies production build emits a self-contained maplibre-gl-worker chunk', () => {
    const distAssetsDir = path.resolve(__dirname, '../dist/assets');
    if (fs.existsSync(distAssetsDir)) {
      const files = fs.readdirSync(distAssetsDir);
      const workerFiles = files.filter(
        (f) => f.startsWith('maplibre-gl-worker') && f.endsWith('.js')
      );
      expect(workerFiles.length).toBeGreaterThan(0);

      const workerPath = path.join(distAssetsDir, workerFiles[0]);
      const stats = fs.statSync(workerPath);
      // Self-contained bundled worker should be substantial (> 200 kB), not an empty stub
      expect(stats.size).toBeGreaterThan(200000);
    }
  });
});
