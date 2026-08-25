import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { resolveDestinationImage, PLACE_IMAGE_OVERRIDES } from '../src/utils/imageRegistry';

describe('Manual Image Ingestion & Registry Contract Tests', () => {
  const repoRoot = path.resolve(__dirname, '../../');
  const manifestPath = path.resolve(repoRoot, 'data/images/manual/manifest.json');
  const manualDir = path.resolve(repoRoot, 'data/images/manual');
  const publicManualDir = path.resolve(repoRoot, 'frontend/public/images/manual');
  const requestPath = path.resolve(repoRoot, 'data/images/sources/manual_image_request.json');

  let manifestImages: any[] = [];
  let requestedItems: any[] = [];

  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    manifestImages = JSON.parse(manifestContent).images || [];
  } catch (err) {
    console.warn('Could not read manifest.json:', err);
  }

  try {
    const reqContent = fs.readFileSync(requestPath, 'utf-8');
    requestedItems = JSON.parse(reqContent) || [];
  } catch (err) {
    console.warn('Could not read manual_image_request.json:', err);
  }

  it('1. verifies that every registered manifest image exists in data/images/manual and frontend/public/images/manual', () => {
    expect(manifestImages.length).toBeGreaterThan(50);

    for (const item of manifestImages) {
      const sourceFilePath = path.join(manualDir, item.filename);
      const publicFilePath = path.join(publicManualDir, item.filename);

      expect(fs.existsSync(sourceFilePath), `Source file missing: ${item.filename}`).toBe(true);
      expect(fs.existsSync(publicFilePath), `Public served asset missing: ${item.filename}`).toBe(true);
      
      const stats = fs.statSync(publicFilePath);
      expect(stats.size).toBeGreaterThan(0);
    }
  });

  it('2. verifies no duplicate research_id assignments in the manifest', () => {
    const seenIds = new Set<string>();
    const duplicates: string[] = [];

    for (const item of manifestImages) {
      if (seenIds.has(item.research_id)) {
        duplicates.push(item.research_id);
      }
      seenIds.add(item.research_id);
    }

    expect(duplicates).toEqual([]);
  });

  it('3. verifies manual image paths in PLACE_IMAGE_OVERRIDES resolve to real files without broken links', () => {
    const manualEntries = Object.entries(PLACE_IMAGE_OVERRIDES).filter(([_, url]) =>
      url.startsWith('/images/manual/')
    );

    expect(manualEntries.length).toBeGreaterThan(50);

    for (const [rid, url] of manualEntries) {
      const relativeAssetPath = url.replace('/images/manual/', '');
      const fullPath = path.join(publicManualDir, relativeAssetPath);

      expect(fs.existsSync(fullPath), `Asset file not found for ${rid}: ${fullPath}`).toBe(true);
    }
  });

  it('4. verifies registry fallback still works cleanly for unregistered research IDs', () => {
    const unmappedResult = resolveDestinationImage({
      researchId: 'place_unregistered_fantasy_123',
      name: 'Unregistered Fantasy Lake',
      category: 'lake',
    });

    expect(unmappedResult.sourceType).toBe('category_fallback');
    expect(unmappedResult.src.startsWith('data:image/svg+xml')).toBe(true);
    expect(unmappedResult.src).toContain('Lake');
  });

  it('5. verifies manual images override generic SVG fallbacks when registered', () => {
    const firstManual = manifestImages[0];
    const resolved = resolveDestinationImage({
      researchId: firstManual.research_id,
      name: firstManual.place_name,
      category: firstManual.category,
    });

    expect(resolved.sourceType).toBe('manual_override');
    expect(resolved.src).toBe(PLACE_IMAGE_OVERRIDES[firstManual.research_id]);
    expect(resolved.src).toContain('/images/manual/');
  });

  it('6. verifies unresolved provenance status does not break valid identity registration', () => {
    for (const item of manifestImages) {
      expect(item.metadata_status).toBe('identity_verified');
      // Provenance remains unverified/unresolved according to strict non-fabrication rule
      expect(item.source_url).toBeNull();
      expect(item.provenance_verified).toBe(false);
    }
  });
});
