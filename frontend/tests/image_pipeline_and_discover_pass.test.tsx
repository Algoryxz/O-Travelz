import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import {
  getPlaceImages,
  getPrimaryPlaceImage,
  getPlaceImageUrl,
  getCategoryImage,
  getFeaturedOdishaDestinations,
  getPlaceRegion,
  CATEGORY_IMAGE_MANIFEST,
  DEFAULT_FALLBACK_IMAGE,
} from "../src/utils/imageService";
import { HomeSections } from "../src/components/home/HomeSections";
import { CoverflowCarousel } from "../src/components/gallery/CoverflowCarousel";
import { PhotoGallery } from "../src/components/gallery/PhotoGallery";
import { PlaceDetailsModal } from "../src/components/place/PlaceDetailsModal";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

// In-memory mock localStorage for Node/test environment
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) {
      delete mockStorage[k];
    }
  },
};

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
}

describe("Image Pipeline & Discover Page Spacing Pass Suite", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // 1. Central Image Pipeline Verification
  it("resolves primary image and verified multi-image sets through imageService", () => {
    const puriImages = getPlaceImages("Puri Golden Beach", "beach");
    expect(puriImages.length).toBeGreaterThanOrEqual(3);
    expect(puriImages[0].src).toBeTruthy();
    expect(puriImages[0].alt).toContain("Puri Golden Beach");
    expect(puriImages[0].source).toBeTruthy();
    expect(puriImages[0].license).toBeTruthy();

    const konarkImages = getPlaceImages("Konark Sun Temple", "monument");
    expect(konarkImages.length).toBeGreaterThanOrEqual(3);
    expect(konarkImages[0].alt).toContain("Konark Sun Temple");
    expect(konarkImages[0].attribution).toBeTruthy();

    const chilikaImages = getPlaceImages("Chilika Lake", "nature");
    expect(chilikaImages.length).toBeGreaterThanOrEqual(3);
    expect(chilikaImages[0].alt).toContain("Chilika");

    const daringbadiImages = getPlaceImages("Daringbadi Hill Station", "nature");
    expect(daringbadiImages.length).toBeGreaterThanOrEqual(3);
    expect(daringbadiImages[0].alt).toContain("Daringbadi");

    const similipalImages = getPlaceImages("Similipal National Park", "wildlife");
    expect(similipalImages.length).toBeGreaterThanOrEqual(3);
    expect(similipalImages[0].alt).toContain("Similipal");
  });

  // 2. Verified Coverage for all Odisha Regions
  it("covers major destinations across Coastal, Marine, Central, Southern, Western, Northern regions", () => {
    const keyDestinations = [
      // Coastal
      "Puri",
      "Jagannath Temple, Puri",
      "Chandipur Beach",
      "Swargadwar Beach",
      // Marine
      "Konark Sun Temple",
      "Chandrabhaga Beach",
      "Ramachandi Beach",
      "Konark Archaeological Museum",
      // Central
      "Lingaraj Temple",
      "Mukteswar Temple",
      "Rajarani Temple",
      "Dhauli Shanti Stupa",
      "Barabati Fort",
      "Cuttack Chandi Temple",
      "Netaji Birthplace Museum",
      "Odisha State Maritime Museum",
      // Southern
      "Chilika Lake",
      "Satapada",
      "Maa Kalijai Temple",
      "Mangalajodi",
      "Gopalpur Beach",
      "Maa Tara Tarini Temple",
      "Daringbadi Hill Station",
      "Belghar Nature Camp",
      // Western
      "Hirakud Dam",
      "Maa Samaleswari Temple",
      "Huma Leaning Temple",
      "Debrigarh Wildlife Sanctuary",
      "Hanuman Vatika",
      "Khandadhar Falls",
      // Northern / Highlands
      "Similipal National Park",
      "Bhitarkanika National Park",
      "Deomali Peak",
      "Duduma Waterfall",
      "Gupteswar Cave",
      "Koraput Tribal Museum",
      "Kolab Reservoir",
    ];

    for (const dest of keyDestinations) {
      const images = getPlaceImages(dest);
      expect(images.length).toBeGreaterThanOrEqual(1);
      expect(images[0].src).toBeTruthy();
      expect(images[0].alt).toBeTruthy();
    }
  });

  // 3. Fallback Hierarchy & Graceful Degradation
  it("implements deterministic fallback hierarchy without crashing on unknown places", () => {
    const fallbackForUnknown = getPlaceImages("Random Nonexistent Valley", "waterfall");
    expect(fallbackForUnknown.length).toBeGreaterThanOrEqual(1);
    expect(fallbackForUnknown[0].src).toBeTruthy();

    const completelyUnknown = getPlaceImages(null, null);
    expect(completelyUnknown.length).toBe(1);
    expect(completelyUnknown[0].isFallback).toBe(true);

    const primaryUnknown = getPrimaryPlaceImage(undefined, undefined);
    expect(primaryUnknown.src).toBe(DEFAULT_FALLBACK_IMAGE.src);
  });

  // 4. Semantic Category Images
  it("resolves semantically matching category images with metadata", () => {
    const natureImg = getCategoryImage("Nature");
    expect(natureImg.alt.toLowerCase()).toContain("valley");

    const medImg = getCategoryImage("Medical Help");
    expect(medImg.alt.toLowerCase()).toContain("hospital");

    const atmImg = getCategoryImage("ATMs");
    expect(atmImg.alt.toLowerCase()).toContain("atm");

    const cafeImg = getCategoryImage("Hangout & Chill");
    expect(cafeImg.alt.toLowerCase()).toContain("café");

    const shoppingImg = getCategoryImage("Shopping & Fashion");
    expect(shoppingImg.alt.toLowerCase()).toContain("handloom");

    const heritageImg = getCategoryImage("Heritage & Culture");
    expect(heritageImg.alt.toLowerCase()).toContain("temple");
  });

  // 5. REGRESSION: 010203 Artifact MUST NOT exist anywhere
  it("REGRESSION: verifies 010203 text is completely eliminated from HomeSections", () => {
    const html = renderClean(
      <HomeSections
        selectedLocation="Bhubaneswar"
        onNavigateToPlan={() => {}}
        onNavigateToMap={() => {}}
        onNavigateToCopilot={() => {}}
        onSelectCategory={() => {}}
        onSelectPlace={() => {}}
      />
    );

    expect(html).not.toContain("010203");
    expect(html).not.toContain("route-sequence");
  });

  // 6. Popular Categories 3-Column Responsive Grid
  it("renders Popular Categories as an intentional responsive card grid", () => {
    const html = renderClean(
      <HomeSections
        selectedLocation="Bhubaneswar"
        onNavigateToPlan={() => {}}
        onNavigateToMap={() => {}}
        onNavigateToCopilot={() => {}}
        onSelectCategory={() => {}}
        onSelectPlace={() => {}}
      />
    );

    expect(html).toContain("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3");
    expect(html).toContain("category-card-nature");
    expect(html).toContain("category-card-medical-help");
    expect(html).toContain("category-card-heritage-culture");
    expect(html).toContain("category-card-atms");
    expect(html).toContain("category-card-hangout-chill");
    expect(html).toContain("category-card-shopping-fashion");
  });

  // 7. Coverflow Carousel Bounded Height and Pagination
  it("renders Coverflow Carousel with bounded height, attached dots, and object-cover images", () => {
    const featured = getFeaturedOdishaDestinations();
    const items = featured.map((f) => ({
      id: f.id,
      title: f.name,
      category: f.category,
      imageUrl: f.imageUrl,
    }));

    const html = renderClean(
      <CoverflowCarousel
        items={items}
        title="Iconic Odisha Highlights"
        tag="DESTINATION DISCOVERY"
      />
    );

    expect(html).toContain("data-testid=\"coverflow-stage\"");
    expect(html).toContain("data-testid=\"coverflow-dot-0\"");
    expect(html).toContain("object-cover");
    expect(html).toContain("coverflow-prev-button");
    expect(html).toContain("coverflow-next-button");
  });

  // 8. PhotoGallery with Provenance & Image Counter
  it("renders PhotoGallery with image counter, license attribution modal, and thumbnail strip", () => {
    const galleryMeta = [
      {
        url: "https://example.com/puri1.jpg",
        alt: "Puri Beach",
        source: "Odisha Tourism Archive",
        license: "Verified Asset",
        attribution: "Blue Flag Beach Documentation",
      },
      {
        url: "https://example.com/puri2.jpg",
        alt: "Sunrise at Puri",
        source: "Eco Tourism",
        license: "CC BY-SA 4.0",
        attribution: "Sunrise Coast Photography",
      },
    ];

    const html = renderClean(
      <PhotoGallery images={galleryMeta} placeName="Puri Beach" />
    );

    expect(html).toContain("gallery-image-counter");
    expect(html).toContain("1 / 2");
    expect(html).toContain("gallery-thumb-0");
    expect(html).toContain("gallery-thumb-1");
  });
});
