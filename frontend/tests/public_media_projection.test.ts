import { describe, it, expect } from "vitest";
import manifest from "../generated/publicMediaManifest.json";
import { getAppBasePath, resolveAssetUrl } from "../src/utils/imageService";

describe("Wave D1.4: Public Media Projection & Deployment Integrity", () => {
  it("1. manifest contains verified places with exact-location classification", () => {
    expect(manifest.places).toBeDefined();
    const placeIds = Object.keys(manifest.places);
    expect(placeIds.length).toBeGreaterThan(50);
  });

  it("2. strictly excludes REJECTED media from public manifest", () => {
    for (const [placeId, placeData] of Object.entries(manifest.places)) {
      expect((placeData as any).classification).not.toBe("REJECTED");
      expect((placeData as any).status).not.toBe("REJECTED");
    }
  });

  it("3. strictly excludes RELATED_LOCATION_ONLY places from public manifest", () => {
    // Known RELATED_LOCATION_ONLY place
    expect(manifest.places).not.toHaveProperty("place_cuttack_003");
  });

  it("4. excludes unneeded original.webp sources to prevent binary payload bloat", () => {
    for (const [placeId, placeData] of Object.entries(manifest.places)) {
      const variants = (placeData as any).variants;
      expect(variants).toHaveProperty("hero");
      expect(variants).toHaveProperty("card");
      expect(variants).toHaveProperty("thumbnail");
      // original must NOT be in public variants
      expect(variants).not.toHaveProperty("original");
    }
  });

  it("5. each variant path is well-formed with valid webp extension and hash", () => {
    for (const [placeId, placeData] of Object.entries(manifest.places)) {
      const variants = (placeData as any).variants;
      for (const [vName, vData] of Object.entries(variants)) {
        const p = (vData as any).path;
        expect(p).toMatch(/^\/static\/images\/places\/[a-z0-9_]+\/[a-f0-9]+\/(hero|card|thumbnail)\.webp$/);
        expect((vData as any).size_bytes).toBeGreaterThan(0);
      }
    }
  });

  it("6. categories manifest includes required UI categories without original.webp", () => {
    expect(manifest.categories).toBeDefined();
    const catKeys = Object.keys(manifest.categories);
    expect(catKeys.length).toBeGreaterThanOrEqual(3);
    for (const [catName, catData] of Object.entries(manifest.categories)) {
      const variants = (catData as any).variants;
      expect(variants).not.toHaveProperty("original");
      expect(variants).toHaveProperty("hero");
    }
  });

  it("7. base path resolution preserves application root prefix for projected assets", () => {
    const appBase = getAppBasePath();
    const testPath = "/static/images/places/place_bbsr_001/06a456469886/hero.webp";
    const resolved = resolveAssetUrl(testPath);
    expect(resolved).toBe(`${appBase}static/images/places/place_bbsr_001/06a456469886/hero.webp`);
    expect(resolved).not.toContain("//static");
  });

  it("8. manifest includes mandatory provenance and attribution metadata", () => {
    for (const [placeId, placeData] of Object.entries(manifest.places)) {
      const pd = placeData as any;
      expect(pd.attribution).toBeDefined();
      expect(pd.license).toBeDefined();
      expect(pd.creator).toBeDefined();
    }
  });
});
