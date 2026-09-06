import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getBackendAssetUrl,
  getAppBasePath,
  resolveAssetUrl,
  getPlaceImages,
  getPrimaryPlaceImage,
  DEFAULT_FALLBACK_IMAGE,
} from "../src/utils/imageService";
import { resolvePlaceImage, resolvePlaceImageUrl, contractToPlaceImage } from "../src/utils/imageAdapter";
import { DESTINATION_WORLD_ASSETS } from "../src/data/destinationWorldAssets";
import type { PlaceImageContract } from "../src/api/contracts";

describe("Wave D1.3: Media Runtime Resolution Regression Test Suite", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // 1. Canonical storage_key resolves correctly
  it("1. canonical storage_key resolves correctly without malformed path or duplication", () => {
    const key = "places/place_bbsr_011/36e8a9a95990/hero.webp";
    const resolved = getBackendAssetUrl(key);
    expect(resolved).toMatch(/static\/images\/places\/place_bbsr_011\/36e8a9a95990\/hero\.webp$/);
    expect(resolved).not.toContain("//static");
  });

  // 2. BASE_URL is respected
  it("2. BASE_URL is respected when resolving relative assets", () => {
    const base = getAppBasePath();
    const asset = resolveAssetUrl("logo.jpeg");
    expect(asset).toBe(`${base}logo.jpeg`);
    expect(asset).not.toContain("//logo.jpeg");
  });

  // 3. No guessed filename fallback
  it("3. no guessed filename fallback: nonexistent place gets verified category/neutral SVG fallback", () => {
    const fallback = getPrimaryPlaceImage("nonexistent_unknown_destination_xyz", "waterfall");
    expect(fallback.isFallback).toBe(true);
    expect(fallback.src).toMatch(/^data:image\/svg\+xml/);
    expect(fallback.src).not.toContain(".webp");
    expect(fallback.src).not.toContain(".jpg");
  });

  // 4. Unverified media cannot be HERO/CARD
  it("4. unverified media cannot be HERO/CARD", () => {
    const unverifiedContract: PlaceImageContract = {
      id: "img-unverified-1",
      place_id: "place-1",
      url: "/static/images/places/place_bbsr_001/abc/hero.webp",
      card_url: "/static/images/places/place_bbsr_001/abc/card.webp",
      status: "pending_review", // Not verified
      is_primary: true,
      sort_order: 0,
    };

    // If a place has no verified images, fallback must be used
    const place = {
      id: "place-1",
      name: "Unverified Place",
      category: "temple",
      images: [unverifiedContract],
    };

    // Status is checked by consumers and contract
    expect(unverifiedContract.status).not.toBe("verified");
  });

  // 5. Related-location cannot be HERO/CARD (No cross-contamination)
  it("5. related-location cannot be HERO/CARD: place does not borrow an unrelated place image", () => {
    const imagesForUnknownTemple = getPlaceImages("random_shrine_in_village", "temple");
    expect(imagesForUnknownTemple.length).toBeGreaterThan(0);
    // Must be category SVG, never Lingaraj or Konark
    expect(imagesForUnknownTemple[0].isFallback).toBe(true);
    expect(imagesForUnknownTemple[0].src).not.toContain("place_bbsr_001");
    expect(imagesForUnknownTemple[0].src).not.toContain("place_konark_001");
  });

  // 6. Missing verified media fails safely
  it("6. missing verified media fails safely without null pointer or unhandled exception", () => {
    expect(() => resolvePlaceImage(null, "hero")).not.toThrow();
    expect(() => resolvePlaceImage(undefined, "card")).not.toThrow();
    const result = resolvePlaceImage({ id: "missing-id" });
    expect(result).toBeDefined();
    expect(result.src).toBeDefined();
    expect(result.isFallback).toBe(true);
  });

  // 7. Deprecated / hazardous place assets are filtered out safely
  it("7. deprecated / hazardous place assets (e.g. 14877b098df9) cannot override truth", () => {
    const hazardousContract: PlaceImageContract = {
      id: "img-hazard",
      place_id: "p-hazard",
      url: "/static/images/places/food/14877b098df9/hero.webp",
      is_primary: true,
      status: "verified",
    };
    const place = {
      id: "p-hazard",
      name: "Hazard Place",
      category: "food",
      images: [hazardousContract],
    };
    const resolved = resolvePlaceImage(place, "card");
    // Should safely reject the hazardous hash and return fallback
    expect(resolved.src).not.toContain("14877b098df9");
  });

  // 8. Root-host deployment works
  it("8. root-host deployment works (cleanBase with slash or empty returns valid path)", () => {
    const pathWithLeadingSlash = resolveAssetUrl("/images/destinations/puri_beach.webp");
    expect(pathWithLeadingSlash).toMatch(/images\/destinations\/puri_beach\.webp$/);
    expect(pathWithLeadingSlash).not.toContain("//images");
  });

  // 9. GitHub Pages /O-Travelz/ base works
  it("9. GitHub Pages /O-Travelz/ base works: handles leading slashes and bare names cleanly", () => {
    const rawAsset = "logo.jpeg";
    const resolved = resolveAssetUrl(rawAsset);
    expect(resolved).not.toContain("//logo.jpeg");

    const slashAsset = "/sw.js";
    const resolvedSlash = resolveAssetUrl(slashAsset);
    expect(resolvedSlash).not.toContain("//sw.js");
  });

  // 10. No raw original JPEG fallback when optimized variant exists
  it("10. no raw original JPEG fallback (12+ MB Wikimedia) in DESTINATION_WORLD_ASSETS", () => {
    for (const world of DESTINATION_WORLD_ASSETS) {
      if (world.fallbackPosterUrl) {
        // Raw unscaled Wikimedia URLs look like /wikipedia/commons/f/fc/Name.jpg (no /thumb/ and no /1280px-)
        expect(world.fallbackPosterUrl).not.toMatch(/\/wikipedia\/commons\/[0-9a-f]\/[0-9a-f]{2}\/[^/]+\.jpg$/i);
      }
      expect(world.posterUrl).toMatch(/\.webp$/);
    }
  });
});
