import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import type { PlaceDetail, PlaceImageContract } from "../src/api/contracts";
import {
  resolvePlaceImage,
  resolvePlaceImageUrl,
  resolvePlaceGallery,
  getVariantUrl,
} from "../src/utils/imageAdapter";
import { toExtendedPlace } from "../src/store/usePlaces";
import { PlaceDetailsModal } from "../src/components/place/PlaceDetailsModal";
import { PhotoGallery } from "../src/components/gallery/PhotoGallery";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Phase 4: Frontend API Image Consumption & Adapter", () => {
  const mockApiImages: PlaceImageContract[] = [
    {
      id: "img-002",
      url: "https://azure-blob.otravelz.com/places/lingaraj/hero.webp",
      card_url: "https://azure-blob.otravelz.com/places/lingaraj/card.webp",
      thumbnail_url: "https://azure-blob.otravelz.com/places/lingaraj/thumbnail.webp",
      alt_text: "11th-century Lingaraj Temple Sandstone Deula",
      title: "Lingaraj Temple Spire",
      source_name: "Wikimedia Commons Archive",
      creator: "Subhashree Dash",
      license: "CC BY-SA 4.0",
      attribution: "Photo by Subhashree Dash via Wikimedia Commons / CC BY-SA 4.0",
      sort_order: 2,
      is_primary: false,
    },
    {
      id: "img-001",
      url: "https://azure-blob.otravelz.com/places/lingaraj/primary_hero.webp",
      card_url: "https://azure-blob.otravelz.com/places/lingaraj/primary_card.webp",
      thumbnail_url: "https://azure-blob.otravelz.com/places/lingaraj/primary_thumbnail.webp",
      alt_text: "Lingaraj Temple Sanctum Main View",
      title: "Lingaraj Temple Main Sanctum",
      source_name: "ASI Official Documentation",
      creator: "Archaeological Survey of India",
      license: "Public Domain",
      attribution: "Public Domain Documentation / ASI",
      sort_order: 1,
      is_primary: true,
    },
  ];

  it("prefers API-provided images over static fallback when available", () => {
    const place: PlaceDetail = {
      id: "place_bbsr_001",
      name: "Lingaraj Temple",
      category: "temple",
      images: mockApiImages,
    };

    const resolvedCard = resolvePlaceImage(place, "card");
    expect(resolvedCard.src).toBe("https://azure-blob.otravelz.com/places/lingaraj/primary_card.webp");
    expect(resolvedCard.source).toBe("ASI Official Documentation");
    expect(resolvedCard.license).toBe("Public Domain");
    expect(resolvedCard.isFallback).toBe(false);

    const resolvedUrl = resolvePlaceImageUrl(place, "card");
    expect(resolvedUrl).toBe("https://azure-blob.otravelz.com/places/lingaraj/primary_card.webp");
  });

  it("selects appropriate variants (thumbnail, card, hero)", () => {
    const img = mockApiImages[1]; // Primary image
    expect(getVariantUrl(img, "thumbnail")).toBe("https://azure-blob.otravelz.com/places/lingaraj/primary_thumbnail.webp");
    expect(getVariantUrl(img, "card")).toBe("https://azure-blob.otravelz.com/places/lingaraj/primary_card.webp");
    expect(getVariantUrl(img, "hero")).toBe("https://azure-blob.otravelz.com/places/lingaraj/primary_hero.webp");
    expect(getVariantUrl(img, "original")).toBe("https://azure-blob.otravelz.com/places/lingaraj/primary_hero.webp");
  });

  it("prioritizes is_primary=true even if sort_order is higher", () => {
    const place: PlaceDetail = {
      id: "place_bbsr_001",
      name: "Lingaraj Temple",
      category: "temple",
      images: [
        {
          url: "https://example.com/secondary.webp",
          card_url: "https://example.com/secondary_card.webp",
          sort_order: 0,
          is_primary: false,
        },
        {
          url: "https://example.com/primary.webp",
          card_url: "https://example.com/primary_card.webp",
          sort_order: 10,
          is_primary: true,
        },
      ],
    };

    const img = resolvePlaceImage(place, "card");
    expect(img.src).toBe("https://example.com/primary_card.webp");
  });

  it("gracefully falls back to imageService.ts when images array is empty or undefined", () => {
    const placeNoImages: PlaceDetail = {
      id: "place_daringbadi_001",
      name: "Daringbadi Hill Station",
      category: "nature",
      images: [],
    };

    const resolved = resolvePlaceImage(placeNoImages, "card");
    expect(resolved.src).toBeDefined();
    expect(resolved.src.length).toBeGreaterThan(0);

    const gallery = resolvePlaceGallery(placeNoImages);
    expect(gallery.length).toBeGreaterThan(0);
    expect(gallery[0].url.length).toBeGreaterThan(0);
  });

  it("resolves multi-image gallery with complete provenance metadata", () => {
    const place: PlaceDetail = {
      id: "place_bbsr_001",
      name: "Lingaraj Temple",
      category: "temple",
      images: mockApiImages,
    };

    const gallery = resolvePlaceGallery(place);
    expect(gallery).toHaveLength(2);

    // Primary image is first in gallery
    expect(gallery[0].url).toBe("https://azure-blob.otravelz.com/places/lingaraj/primary_hero.webp");
    expect(gallery[0].attribution).toBe("Public Domain Documentation / ASI");
    expect(gallery[0].license).toBe("Public Domain");

    // Secondary image is second
    expect(gallery[1].url).toBe("https://azure-blob.otravelz.com/places/lingaraj/hero.webp");
    expect(gallery[1].attribution).toContain("Subhashree Dash");
  });

  it("integrates with usePlaces toExtendedPlace correctly", () => {
    const place: PlaceDetail = {
      id: "place_puri_001",
      name: "Puri Beach",
      category: "beach",
      images: [
        {
          url: "https://azure-blob.otravelz.com/places/puri/hero.webp",
          card_url: "https://azure-blob.otravelz.com/places/puri/card.webp",
          thumbnail_url: "https://azure-blob.otravelz.com/places/puri/thumb.webp",
          is_primary: true,
        },
      ],
    };

    const extended = toExtendedPlace(place);
    expect(extended.region).toBe("Puri & Coastal");
    expect(extended.imageUrl).toBe("https://azure-blob.otravelz.com/places/puri/card.webp");
    expect(extended.images).toHaveLength(1);
  });

  it("works across representative whole-Odisha regions without regression", () => {
    const regions = [
      { id: "place_puri_001", name: "Puri Golden Beach", category: "beach" },
      { id: "place_konark_001", name: "Konark Sun Temple", category: "monument" },
      { id: "place_bbsr_001", name: "Lingaraj Temple", category: "temple" },
      { id: "place_cuttack_001", name: "Barabati Fort", category: "monument" },
      { id: "place_chilika_001", name: "Chilika Lake - Satapada", category: "nature" },
      { id: "place_daringbadi_001", name: "Daringbadi Hill Station", category: "nature" },
      { id: "place_sambalpur_001", name: "Hirakud Dam & Reservoir", category: "nature" },
      { id: "place_mayurbhanj_001", name: "Similipal National Park", category: "wildlife" },
      { id: "place_koraput_003", name: "Deomali Peak", category: "nature" },
    ];

    for (const r of regions) {
      const place: PlaceDetail = {
        id: r.id,
        name: r.name,
        category: r.category,
        images: [
          {
            url: `https://azure-blob.otravelz.com/places/${r.id}/hero.webp`,
            card_url: `https://azure-blob.otravelz.com/places/${r.id}/card.webp`,
            is_primary: true,
          },
        ],
      };

      const imgUrl = resolvePlaceImageUrl(place, "card");
      expect(imgUrl).toBe(`https://azure-blob.otravelz.com/places/${r.id}/card.webp`);

      const extended = toExtendedPlace(place);
      expect(extended.imageUrl).toBe(`https://azure-blob.otravelz.com/places/${r.id}/card.webp`);
    }
  });

  it("renders PlaceDetailsModal with API gallery markup", () => {
    const place = {
      id: "place_bbsr_001",
      name: "Lingaraj Temple",
      category: "temple",
      location: "Bhubaneswar & Central",
      images: mockApiImages,
    };

    const html = renderClean(
      <PlaceDetailsModal
        place={place}
        onClose={() => {}}
        onViewOnMap={() => {}}
        onPlanTrip={() => {}}
      />
    );

    expect(html).toContain('data-testid="place-details-modal"');
    expect(html).toContain('data-testid="destination-photo-gallery"');
    expect(html).toContain("https://azure-blob.otravelz.com/places/lingaraj/primary_hero.webp");
    expect(html).toContain("1 / 2");
  });

  it("renders PhotoGallery with initial primary image and counter", () => {
    const gallery = resolvePlaceGallery({
      name: "Lingaraj Temple",
      category: "temple",
      images: mockApiImages,
    });

    const html = renderClean(
      <PhotoGallery images={gallery} placeName="Lingaraj Temple" />
    );

    expect(html).toContain('data-testid="destination-photo-gallery"');
    expect(html).toContain("https://azure-blob.otravelz.com/places/lingaraj/primary_hero.webp");
    expect(html).toContain("1 / 2");
    expect(html).toContain("Lingaraj Temple Sanctum Main View");
  });

  it("consumes authoritative backend image proxy URLs (/static/images/...) in PlaceDetailsModal and card", () => {
    const authoritativeBackendPlace: PlaceDetail = {
      id: "place_bbsr_001",
      name: "Lingaraj Temple",
      category: "temple",
      description: "11th-century Lingaraj Temple towering sandstone deula spire",
      lat: 20.238333,
      lon: 85.833611,
      avg_visit_minutes: 90,
      price_tier: "free",
      source: "https://odishatourism.gov.in",
      verified_at: "2026-08-19T00:00:00Z",
      images: [
        {
          id: "img-lingaraj-001",
          storage_key: "places/place_bbsr_001/6565b97835e5/hero.webp",
          url: "/static/images/places/place_bbsr_001/6565b97835e5/hero.webp",
          card_url: "/static/images/places/place_bbsr_001/6565b97835e5/card.webp",
          thumbnail_url: "/static/images/places/place_bbsr_001/6565b97835e5/thumbnail.webp",
          alt_text: "11th-century Lingaraj Temple towering sandstone deula spire",
          title: "Lingaraj Temple",
          source_name: "Wikimedia Commons",
          license: "CC BY-SA 4.0",
          attribution: "Photo by Subhashree Dash via Wikimedia Commons, licensed under CC BY-SA 4.0",
          is_primary: true,
          sort_order: 1,
        },
      ],
    };

    // 1. Check resolution for card and hero
    const cardUrl = resolvePlaceImageUrl(authoritativeBackendPlace, "card");
    expect(cardUrl).toBe("/static/images/places/place_bbsr_001/6565b97835e5/card.webp");

    const heroUrl = resolvePlaceImageUrl(authoritativeBackendPlace, "hero");
    expect(heroUrl).toBe("/static/images/places/place_bbsr_001/6565b97835e5/hero.webp");

    // 2. Check toExtendedPlace
    const extended = toExtendedPlace(authoritativeBackendPlace);
    expect(extended.imageUrl).toBe("/static/images/places/place_bbsr_001/6565b97835e5/card.webp");
    expect(extended.region).toBe("Bhubaneswar & Central");

    // 3. Check PlaceDetailsModal rendering
    const modalHtml = renderClean(
      <PlaceDetailsModal
        place={authoritativeBackendPlace}
        onClose={() => {}}
        onViewOnMap={() => {}}
        onPlanTrip={() => {}}
      />
    );
    expect(modalHtml).toContain("/static/images/places/place_bbsr_001/6565b97835e5/hero.webp");
    expect(modalHtml).toContain("Lingaraj Temple");
    expect(modalHtml).toContain("Bhubaneswar &amp; Central");
  });
});
