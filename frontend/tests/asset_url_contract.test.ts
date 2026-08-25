import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getBackendAssetUrl,
  getBackendBaseUrl,
  getPlaceImages,
  getPrimaryPlaceImage,
  getPlaceImageUrl,
  getCategoryImage,
  getPlaceGallery,
  DEFAULT_FALLBACK_IMAGE,
} from "../src/utils/imageService";
import { getVariantUrl, resolvePlaceImageUrl, resolvePlaceImage, contractToPlaceImage } from "../src/utils/imageAdapter";
import type { PlaceImageContract } from "../src/api/contracts";

describe("Frontend Asset URL Resolution Contract", () => {
  it("safely handles null, undefined, empty strings without throwing", () => {
    expect(getBackendAssetUrl(null)).toBe("");
    expect(getBackendAssetUrl(undefined)).toBe("");
    expect(getBackendAssetUrl("")).toBe("");
    expect(getBackendAssetUrl("   ")).toBe("");
  });

  it("never outputs double slashes or undefined prefixes", () => {
    const url = getBackendAssetUrl("/static/images//places/place_bbsr_001/hero.webp");
    expect(url).not.toContain("//places");
    expect(url).not.toContain("undefined");
    expect(url).toBe("/static/images/places/place_bbsr_001/hero.webp");
  });

  it("rejects path traversal attempts", () => {
    expect(getBackendAssetUrl("../secret.key")).toBe("");
    expect(getBackendAssetUrl("places/../../etc/passwd")).toBe("");
  });

  it("preserves data URIs (inline SVGs) and absolute URLs untouched", () => {
    const svgDataUri = "data:image/svg+xml;utf8,<svg></svg>";
    expect(getBackendAssetUrl(svgDataUri)).toBe(svgDataUri);

    const httpUrl = "https://example.com/photo.webp";
    expect(getBackendAssetUrl(httpUrl)).toBe(httpUrl);
  });

  it("normalizes bare storage keys into /static/images/ paths", () => {
    expect(getBackendAssetUrl("places/place_bbsr_011/36e8a9a95990/hero.webp")).toBe(
      "/static/images/places/place_bbsr_011/36e8a9a95990/hero.webp"
    );
    expect(getBackendAssetUrl("categories/cat_atms/76647d302131/card.webp")).toBe(
      "/static/images/categories/cat_atms/76647d302131/card.webp"
    );
  });

  it("resolves representative place images for at least 3 destinations (hero, card, thumbnail)", () => {
    const puriImages = getPlaceImages("place_puri_001");
    expect(puriImages.length).toBeGreaterThan(0);
    expect(puriImages[0].src).toMatch(/\/static\/images\/places\/place_puri_001\/.*\/hero\.webp$/);

    const konarkImages = getPlaceImages("place_konark_001");
    expect(konarkImages.length).toBeGreaterThan(0);
    expect(konarkImages[0].src).toMatch(/\/static\/images\/places\/place_konark_001\/.*\/hero\.webp$/);

    const bbsrImages = getPlaceImages("place_bbsr_001");
    expect(bbsrImages.length).toBeGreaterThan(0);
    expect(bbsrImages[0].src).toMatch(/\/static\/images\/places\/place_bbsr_001\/.*\/hero\.webp$/);
  });

  it("resolves representative category images for at least 3 categories", () => {
    const atmImg = getCategoryImage("atms");
    expect(atmImg.src).toContain("/static/images/categories/cat_atms/");
    expect(atmImg.isFallback).toBe(false);

    const cafeImg = getCategoryImage("cafes");
    expect(cafeImg.src).toContain("/static/images/categories/cat_hangout_chill/");
    expect(cafeImg.isFallback).toBe(false);

    const medicalImg = getCategoryImage("medical help");
    expect(medicalImg.src).toContain("/static/images/categories/cat_medical_help/");
    expect(medicalImg.isFallback).toBe(false);
  });

  it("enforces image integrity rule: never leaks another destination's photo for missing places", () => {
    const nonExistentPlace = getPlaceImages("place_nonexistent_999", "temple");
    expect(nonExistentPlace.length).toBeGreaterThan(0);
    // Must return category fallback or neutral SVG, NEVER a photo of another destination
    expect(nonExistentPlace[0].isFallback).toBe(true);
    expect(nonExistentPlace[0].src).toMatch(/^data:image\/svg\+xml/);
  });

  it("resolves gallery hero URLs properly without malformed paths", () => {
    const gallery = getPlaceGallery("place_puri_001");
    expect(gallery.length).toBeGreaterThan(0);
    gallery.forEach((item) => {
      expect(item.url).toMatch(/\.webp$/);
      expect(item.url).not.toContain("//");
      expect(item.url).not.toContain("undefined");
    });
  });

  it("imageAdapter correctly routes variants and wraps with backend URL", () => {
    const mockContract: PlaceImageContract = {
      id: "img-1",
      place_id: "p-1",
      url: "/static/images/places/place_bbsr_001/abc123/hero.webp",
      card_url: "/static/images/places/place_bbsr_001/abc123/card.webp",
      thumbnail_url: "/static/images/places/place_bbsr_001/abc123/thumbnail.webp",
      source_name: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      attribution: "Photo Attribution",
      is_primary: true,
      sort_order: 0,
      status: "verified",
    };

    expect(getVariantUrl(mockContract, "hero")).toBe("/static/images/places/place_bbsr_001/abc123/hero.webp");
    expect(getVariantUrl(mockContract, "card")).toBe("/static/images/places/place_bbsr_001/abc123/card.webp");
    expect(getVariantUrl(mockContract, "thumbnail")).toBe("/static/images/places/place_bbsr_001/abc123/thumbnail.webp");

    const resolved = contractToPlaceImage(mockContract, "Lingaraj Temple", "card");
    expect(resolved.src).toBe("/static/images/places/place_bbsr_001/abc123/card.webp");
  });
});
