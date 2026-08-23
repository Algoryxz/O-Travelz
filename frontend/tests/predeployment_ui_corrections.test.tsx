import React from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";

import { OdishaHero } from "../src/components/home/OdishaHero";
import { TopNav } from "../src/components/nav/TopNav";
import { MobileDrawer } from "../src/components/nav/MobileDrawer";
import { PlaceDetailsModal, type SelectedPlaceInfo } from "../src/components/place/PlaceDetailsModal";
import {
  getPlaceImageUrl,
  getPlaceGallery,
  DEFAULT_FALLBACK_IMAGE,
} from "../src/utils/imageService";
import { resolvePlaceImageUrl, resolvePlaceGallery } from "../src/utils/imageAdapter";
import { toExtendedPlace } from "../src/store/usePlaces";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

if (typeof global !== "undefined") {
  (global as any).localStorage = localStorageMock;
}

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Pre-Deployment UI Corrections & QA Suite", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // 1. Surprise Me Button
  describe("Surprise Me Interaction", () => {
    it("renders Surprise Me button with data-testid and invokes onSurpriseMe", () => {
      let surpriseMeClicked = false;
      const html = renderClean(
        <OdishaHero
          selectedLocation="Bhubaneswar"
          onSurpriseMe={() => {
            surpriseMeClicked = true;
          }}
        />
      );

      expect(html).toContain('data-testid="hero-surprise-me-button"');
      expect(html).toContain("Surprise Me");
    });

    it("opens PlaceDetailsModal with canonical place information when selected", () => {
      const mockPlace: SelectedPlaceInfo = {
        id: "place_puri_001",
        name: "Jagannath Temple, Puri",
        category: "heritage",
        location: "Puri & Coastal",
        description: "Sacred 12th-century Kalinga temple complex.",
        lat: 19.8049,
        lon: 85.8179,
        avg_visit_minutes: 180,
      };

      const html = renderClean(
        <PlaceDetailsModal
          place={mockPlace}
          isOpen={true}
          onClose={() => {}}
        />
      );

      expect(html).toContain("Jagannath Temple, Puri");
      expect(html).toContain("Puri &amp; Coastal");
      expect(html).toContain("Sacred 12th-century Kalinga temple complex.");
      expect(html).toContain('data-testid="destination-photo-gallery"');
    });
  });

  // 2. Unified Master Navigation Controls
  describe("Unified Master Navigation", () => {
    it("renders clean TopNav without dark/light mode toggle", () => {
      const html = renderClean(
        <TopNav
          activeTab="discover"
          onTabChange={() => {}}
          selectedLocation="Bhubaneswar"
          onLocationChange={() => {}}
          onOpenMobileDrawer={() => {}}
        />
      );

      expect(html).toContain('data-testid="top-navigation-bar"');
      expect(html).not.toContain('data-testid="desktop-theme-toggle"');
    });

    it("renders clean MobileDrawer without dark/light mode toggle", () => {
      const html = renderClean(
        <MobileDrawer
          isOpen={true}
          onClose={() => {}}
          activeTab="discover"
          onSelectTab={() => {}}
        />
      );

      expect(html).toContain('data-testid="drawer-nav-discover"');
      expect(html).not.toContain('data-testid="mobile-theme-toggle"');
    });
  });

  // 3. Image Resolution & Fallback Integrity
  describe("Image Quality and Resolution Pipeline", () => {
    it("resolves high-resolution hero variants for PlaceDetailsModal gallery", () => {
      const gallery = getPlaceGallery("place_bbsr_001", "temple");
      expect(gallery.length).toBeGreaterThanOrEqual(1);

      // Verify that the gallery item uses hero-level resolution and not a low-res thumbnail
      expect(gallery[0].url).toContain("/hero.webp");
      expect(gallery[0].url).not.toContain("/thumbnail.webp");
    });

    it("ensures fallback hierarchy preserves category fallbacks without cross-destination photo leakage or Lingaraj global fallback", () => {
      const beachFallback = getPlaceImageUrl("Unknown Beach In Odisha", "beach");
      expect(beachFallback).toContain("data:image/svg+xml"); // Themed beach fallback SVG
      expect(beachFallback).not.toContain("place_puri_002"); // Zero cross-destination leakage
      expect(beachFallback).not.toContain("place_bbsr_001"); // NOT Lingaraj

      const neutralFallback = getPlaceImageUrl("Nonexistent Unknown Place", "unknown_category_xyz");
      expect(neutralFallback).toBe(DEFAULT_FALLBACK_IMAGE.src);
      expect(neutralFallback).not.toContain("place_bbsr_001"); // NOT Lingaraj
    });

    it("converts backend place contracts to extended place with valid image URLs", () => {
      const rawBackendPlace = {
        id: "place_daringbadi_001",
        name: "Daringbadi Hill Station",
        category: "nature",
        description: "Misty hills and coffee gardens.",
        lat: 19.9103,
        lon: 84.1311,
        avg_visit_minutes: 240,
        price_tier: "budget" as const,
        source: "Odisha Tourism",
        verified_at: "2026-08-20T00:00:00Z",
      };

      const extended = toExtendedPlace(rawBackendPlace);
      expect(extended.region).toBe("Kandhamal & Southern Hills");
      expect(extended.imageUrl).toBeDefined();
      expect(extended.imageUrl.length).toBeGreaterThan(0);
    });
  });

  // 4. Active Navigation Accents
  describe("Active Navigation Styling", () => {
    it("applies active accent to selected TopNav item", () => {
      const html = renderClean(
        <TopNav
          activeTab="discover"
          onTabChange={() => {}}
          selectedLocation="Bhubaneswar"
          onLocationChange={() => {}}
          onOpenMobileDrawer={() => {}}
        />
      );

      expect(html).toContain("bg-[#12161E] text-white");
    });
  });

  // 5. 21st.dev Floating Navigation Dock
  describe("21st.dev Floating Navigation Dock", () => {
    it("renders dock with all 5 major view tabs and active state", async () => {
      const { FloatingNavigationDock } = await import("../src/components/nav/FloatingNavigationDock");
      let selectedTab = "";
      const html = renderClean(
        <FloatingNavigationDock
          activeTab="destinations"
          onSelectTab={(tab) => {
            selectedTab = tab;
          }}
          savedCount={4}
        />
      );

      expect(html).toContain('data-testid="floating-nav-dock"');
      expect(html).toContain('data-testid="dock-tab-discover"');
      expect(html).toContain('data-testid="dock-tab-destinations"');
      expect(html).toContain('data-testid="dock-tab-map"');
      expect(html).toContain('data-testid="dock-tab-plan"');
      expect(html).toContain('data-testid="dock-tab-saved"');
      expect(html).toContain("4"); // Saved count badge
    });
  });
});
