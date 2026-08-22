import { describe, it, expect } from "vitest";
import seedPlacesData from "../../data/places/places.json";
import {
  getPlaceImageUrl,
  getPlaceImages,
  getPlaceGallery,
  getCategoryFallback,
  getCategoryImage,
  DEFAULT_FALLBACK_IMAGE,
  CATEGORY_THEMED_FALLBACKS,
  CATEGORY_IMAGE_MANIFEST,
  PLACE_IMAGE_MANIFEST,
} from "../src/utils/imageService";
import { resolvePlaceImageUrl, resolvePlaceGallery, resolvePlaceImage } from "../src/utils/imageAdapter";

describe("Canonical Destinations Image Identity, Integrity & Ingestion Acceptance Suite", () => {
  const allPlaces = seedPlacesData as Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    lat: number;
    lon: number;
  }>;
  const manifestPlaces = allPlaces.filter((p) => p.id in PLACE_IMAGE_MANIFEST);

  // Expected 32 newly ingested destination asset hashes
  const EXPECTED_32_INGESTED_HASHES: Record<string, string> = {
    "place_005": "4e56a105e3a5",
    "place_007": "6d8254429a6a",
    "place_012": "a917c9873b59",
    "place_013": "a2d24252c0ce",
    "place_014": "30f7ed6f5755",
    "place_018": "3fdcd749885b",
    "place_019": "79d401a75a62",
    "place_020": "eaedc027e860",
    "place_021": "40dbffdb3896",
    "place_022": "250c5fb998e6",
    "place_023": "993614bac0d4",
    "place_024": "c24a920d9ea5",
    "place_025": "32de32c1a13d",
    "place_026": "37aea0eff98c",
    "place_027": "17b31b2b4531",
    "place_028": "cd738a94a267",
    "place_029": "4878025f4210",
    "place_030": "dd18b0f33834",
    "place_031": "420159c383f2",
    "place_032": "1b4f7e6f8b2e",
    "place_cuttack_002": "57a31cc80182",
    "place_food_001": "e6fb3a71867e",
    "place_food_002": "e0850b09b5ca",
    "place_food_003": "5a13e730e909",
    "place_food_004": "4e765c230837",
    "place_food_005": "daeb11d5893b",
    "place_food_006": "88f959c50d0e",
    "place_food_007": "a0a492f880a5",
    "place_food_008": "35cde5e9e0e8",
    "place_food_009": "0b3143c9ea24",
    "place_food_010": "abcf1ef01835",
    "place_food_011": "cb1d3fcc1b6c",
  };

  it("1. Exactly 81 canonical manifest destinations exist with photography", () => {
    expect(manifestPlaces.length).toBe(81);
    expect(allPlaces.length).toBeGreaterThanOrEqual(81);
  });

  it("2. All 81 manifest destinations resolve to authentic photography (81/81 authentic, 0 fallbacks)", () => {
    const resolvedResults = manifestPlaces.map((place) => {
      const imageUrl = getPlaceImageUrl(place.id, place.category);
      const images = getPlaceImages(place.id, place.category);
      return {
        id: place.id,
        name: place.name,
        category: place.category,
        imageUrl,
        isFallback: images[0]?.isFallback ?? false,
      };
    });

    resolvedResults.forEach((res) => {
      expect(res.imageUrl).toBeDefined();
      expect(typeof res.imageUrl).toBe("string");
      expect(res.imageUrl.length).toBeGreaterThan(10);
      expect(res.isFallback).toBe(false);
      expect(res.imageUrl).not.toContain("data:image/svg+xml");
    });

    const verifiedCount = resolvedResults.filter((r) => !r.isFallback).length;
    const fallbackCount = resolvedResults.filter((r) => r.isFallback).length;

    expect(verifiedCount).toBe(81);
    expect(fallbackCount).toBe(0);
  });

  it("3. All 32 newly supplied destinations resolve to their exact intended asset hashes", () => {
    Object.entries(EXPECTED_32_INGESTED_HASHES).forEach(([placeId, expectedHash]) => {
      const place = manifestPlaces.find((p) => p.id === placeId);
      expect(place).toBeDefined();

      const urlById = getPlaceImageUrl(placeId, place!.category);
      const urlByName = getPlaceImageUrl(place!.name, place!.category);
      const images = getPlaceImages(placeId, place!.category);

      expect(urlById).toContain(expectedHash);
      expect(urlByName).toContain(expectedHash);
      expect(images[0].isFallback).toBe(false);
      expect(images[0].src).toContain(`/static/images/places/${placeId}/${expectedHash}/`);
    });
  });

  it("4. Zero cross-destination photographic hash collisions across all 81 manifest destinations", () => {
    const hashToPlaceMap: Record<string, { id: string; name: string }> = {};

    manifestPlaces.forEach((place) => {
      const url = getPlaceImageUrl(place.id, place.category);
      // Extract hash part: /static/images/places/<id>/<hash>/...
      const match = url.match(/\/static\/images\/places\/[^/]+\/([a-f0-9]+)\//);
      expect(match).not.toBeNull();
      const hash = match![1];

      if (hashToPlaceMap[hash]) {
        const prev = hashToPlaceMap[hash];
        throw new Error(
          `Photographic hash collision: Hash ${hash} is shared between ${place.id} (${place.name}) and ${prev.id} (${prev.name})`
        );
      }
      hashToPlaceMap[hash] = { id: place.id, name: place.name };
    });

    expect(Object.keys(hashToPlaceMap).length).toBe(81);
  });

  it("5. Zero Lingaraj photo leakage across other 80 destinations", () => {
    const lingarajUrl = getPlaceImageUrl("place_bbsr_001", "temple");
    expect(lingarajUrl).toContain("place_bbsr_001");

    manifestPlaces.forEach((place) => {
      if (place.id !== "place_bbsr_001") {
        const urlById = getPlaceImageUrl(place.id, place.category);
        const urlByName = getPlaceImageUrl(place.name, place.category);
        expect(urlById).not.toContain("place_bbsr_001");
        expect(urlByName).not.toContain("place_bbsr_001");
      }
    });
  });

  it("6. Zero Konark photo leakage across other 80 destinations", () => {
    const konarkUrl = getPlaceImageUrl("place_konark_001", "monument");
    expect(konarkUrl).toContain("place_konark_001");

    manifestPlaces.forEach((place) => {
      if (place.id !== "place_konark_001") {
        const urlById = getPlaceImageUrl(place.id, place.category);
        const urlByName = getPlaceImageUrl(place.name, place.category);
        expect(urlById).not.toContain("place_konark_001");
        expect(urlByName).not.toContain("place_konark_001");
      }
    });
  });

  it("7. Cuttack Chandi Temple resolves to authentic temple photo (never old bhoga sweets hash)", () => {
    const byId = getPlaceImageUrl("place_cuttack_002", "temple");
    const byName = getPlaceImageUrl("Cuttack Chandi Temple", "temple");
    const images = getPlaceImages("place_cuttack_002", "temple");

    // Must NOT contain old bhoga sweets hash
    expect(byId).not.toContain("14877b098df9");
    expect(byName).not.toContain("14877b098df9");

    // Must contain new authentic temple asset hash
    expect(byId).toContain("57a31cc80182");
    expect(byName).toContain("57a31cc80182");
    expect(images[0].isFallback).toBe(false);
  });

  it("8. No double-extension (.webp.webp) URLs are ever generated or served", () => {
    allPlaces.forEach((place) => {
      const url = getPlaceImageUrl(place.id, place.category);
      expect(url).not.toContain(".webp.webp");
      const gallery = getPlaceGallery(place.id, place.category);
      gallery.forEach((g) => {
        expect(g.url).not.toContain(".webp.webp");
      });
    });
  });

  it("9. Canonical place ID takes precedence over aliases in resolution", () => {
    manifestPlaces.forEach((place) => {
      const url = getPlaceImageUrl(place.id, place.category);
      expect(url).toContain(`/static/images/places/${place.id}/`);
    });
  });

  it("10. Photo gallery resolution always returns hero.webp and never thumbnail.webp", () => {
    manifestPlaces.forEach((place) => {
      const gallery = getPlaceGallery(place.id, place.category);
      expect(gallery.length).toBeGreaterThanOrEqual(1);
      gallery.forEach((item) => {
        expect(item.url).toContain("/hero.webp");
        expect(item.url).not.toContain("/thumbnail.webp");
        expect(item.source).toBeDefined();
        expect(item.license).toBeDefined();
      });
    });
  });

  it("11. Image Adapter cleanly resolves PlaceLike objects with variant support", () => {
    const samplePlace = {
      id: "place_005",
      name: "Parasurameswar Temple",
      category: "temple",
    };

    const cardUrl = resolvePlaceImageUrl(samplePlace, "card");
    const heroUrl = resolvePlaceImageUrl(samplePlace, "hero");
    const thumbUrl = resolvePlaceImageUrl(samplePlace, "thumbnail");

    expect(cardUrl).toContain("place_005");
    expect(heroUrl).toContain("place_005");
    expect(thumbUrl).toContain("place_005");

    const placeImage = resolvePlaceImage(samplePlace, "card");
    expect(placeImage.isFallback).toBe(false);
    expect(placeImage.src).toContain("place_005");

    const gallery = resolvePlaceGallery(samplePlace);
    expect(gallery.length).toBeGreaterThanOrEqual(1);
    expect(gallery[0].url).toContain("place_005");
    expect(gallery[0].url).toContain("/hero.webp");
  });

  it("12. Fallback SVG mechanism remains intact for unmanifested or unknown categories", () => {
    const fallback = getCategoryFallback("unknown_category_xyz");
    expect(fallback.isFallback).toBe(true);
    expect(fallback.src).toContain("data:image/svg+xml");

    // Unmanifested places gracefully return category fallback
    const unmanifested = allPlaces.filter((p) => !(p.id in PLACE_IMAGE_MANIFEST));
    expect(unmanifested.length).toBeGreaterThan(0);
    unmanifested.forEach((p) => {
      const img = getPlaceImages(p.id, p.category);
      expect(img[0].isFallback).toBe(true);
      expect(img[0].src).toBeDefined();
    });
  });
});
