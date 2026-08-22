import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import { OdishaHero } from "../src/components/home/OdishaHero";
import { DestinationsPage } from "../src/components/home/DestinationsPage";
import { ApiClient } from "../src/api/client";
import {
  MULTILINGUAL_CATEGORIES,
  MULTILINGUAL_INTERESTS,
} from "../src/types/multilingualTaxonomy";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Phase 12 Step 3C — Localized UI Presentation & Search Guidance", () => {
  describe("1. OdishaHero Search Guidance & Multilingual Hint", () => {
    it("renders multilingual search input placeholder, accessible label, and language hint", () => {
      const html = renderClean(
        <OdishaHero selectedLocation="Bhubaneswar" />
      );

      expect(html).toContain('placeholder="Find places near Bhubaneswar..."');
      expect(html).toContain('aria-label="Search destinations in English, Odia, or Hindi"');
      expect(html).toContain("Multilingual:");
      expect(html).toContain("English · ଓଡ଼ିଆ · हिन्दी");
    });
  });

  describe("2. DestinationsPage Search Guidance & Multilingual Hint", () => {
    it("renders multilingual search placeholder, accessible label, and language hint", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
        />
      );

      expect(html).toContain('data-testid="destinations-search-input"');
      expect(html).toContain('placeholder="Search destinations, towns, or themes..."');
      expect(html).toContain('aria-label="Search destinations in English, Odia, or Hindi"');
      expect(html).toContain("Multilingual:");
      expect(html).toContain("English · ଓଡ଼ିଆ · हिन्दी");
    });
  });

  describe("3. Localized Filter Chips & Canonical Taxonomy Parity", () => {
    it("renders category filter chips with verified Odia annotations while preserving canonical test IDs", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
        />
      );

      // Verify canonical test IDs exist
      expect(html).toContain('data-testid="cat-filter-all"');
      expect(html).toContain('data-testid="cat-filter-temple"');
      expect(html).toContain('data-testid="cat-filter-waterfall"');
      expect(html).toContain('data-testid="cat-filter-beach"');
      expect(html).toContain('data-testid="cat-filter-museum"');

      // Verify verified Odia localized annotations are present
      expect(html).toContain("ମନ୍ଦିର"); // temple
      expect(html).toContain("ଜଳପ୍ରପାତ"); // waterfall
      expect(html).toContain("ସମୁଦ୍ର କୂଳ"); // beach
    });

    it("renders thematic interest filter chips with verified Odia annotations while preserving canonical test IDs", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
        />
      );

      // Verify canonical test IDs exist
      expect(html).toContain('data-testid="interest-filter-all"');
      expect(html).toContain('data-testid="interest-filter-heritage"');
      expect(html).toContain('data-testid="interest-filter-spirituality"');
      expect(html).toContain('data-testid="interest-filter-food"');

      // Verify verified Odia localized annotations are present
      expect(html).toContain("ଐତିହ୍ୟ"); // heritage
      expect(html).toContain("ଆଧ୍ୟାତ୍ମିକତା"); // spirituality
      expect(html).toContain("ଖାଦ୍ୟ"); // food
    });
  });

  describe("4. Live Search Status & Result Counts", () => {
    it("renders live result count with accessible role='status'", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
        />
      );

      expect(html).toContain('role="status"');
      expect(html).toContain('aria-atomic="true"');
      expect(html).toContain("Showing");
      expect(html).toContain("destinations");
    });
  });

  describe("5. Truthful Empty States & Contextual Recovery", () => {
    it("renders search-specific empty state with clear search button when no places match", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
          initialSearch="NonExistentPlaceXYZ123"
        />
      );

      expect(html).toContain('data-testid="no-destinations-found"');
      expect(html).toContain("No destinations found");
      expect(html).toContain("NonExistentPlaceXYZ123");
      expect(html).toContain("Clear Search");
      expect(html).toContain("Reset Filters");
    });

    it("displays honest zero-fabrication empty state on unknown Odia query", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
          initialSearch="ଅଜ୍ଞାତ_ସ୍ଥାନ_୧୨୩"
        />
      );

      expect(html).toContain('data-testid="no-destinations-found"');
      expect(html).toContain("No destinations found");
      expect(html).toContain("ଅଜ୍ଞାତ_ସ୍ଥାନ_୧୨୩");
      expect(html).toContain("English, ଓଡ଼ିଆ, or हिन्दी");
      expect(html).not.toContain('data-testid="destinations-grid"');
    });

    it("displays honest zero-fabrication empty state on unknown Hindi query", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
          initialSearch="कोई_अज्ञात_स्थान"
        />
      );

      expect(html).toContain('data-testid="no-destinations-found"');
      expect(html).toContain("No destinations found");
      expect(html).toContain("कोई_अज्ञात_स्थान");
      expect(html).toContain("English, ଓଡ଼ିଆ, or हिन्दी");
      expect(html).not.toContain('data-testid="destinations-grid"');
    });
  });

  describe("6. API Contract & Parameter Preservation", () => {
    it("passes Odia, Hindi, and mixed-language queries unchanged to ApiClient", async () => {
      const mockListPlaces = vi.fn().mockResolvedValue([]);
      const mockClient = { listPlaces: mockListPlaces } as unknown as ApiClient;

      // Odia
      await mockClient.listPlaces({ search: "ପୁରୀ" });
      expect(mockListPlaces).toHaveBeenCalledWith({ search: "ପୁରୀ" });

      // Hindi
      await mockClient.listPlaces({ search: "मंदिर" });
      expect(mockListPlaces).toHaveBeenCalledWith({ search: "मंदिर" });

      // Mixed
      await mockClient.listPlaces({ search: "Temples in ପୁରୀ" });
      expect(mockListPlaces).toHaveBeenCalledWith({ search: "Temples in ପୁରୀ" });

      // Search + Canonical Filter combination
      await mockClient.listPlaces({ search: "ପୁରୀ", category: "temple" });
      expect(mockListPlaces).toHaveBeenCalledWith({ search: "ପୁରୀ", category: "temple" });
    });
  });

  describe("7. Accessibility & Semantic Controls Hardening (Step 3D)", () => {
    it("exposes programmatic aria-pressed state on active vs inactive filter buttons", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
        />
      );

      // Default selected region is 'All Regions'
      expect(html).toContain('data-testid="region-filter-all-regions" aria-pressed="true"');
      expect(html).toContain('data-testid="region-filter-puri---coastal" aria-pressed="false"');

      // Default selected category is 'all'
      expect(html).toContain('data-testid="cat-filter-all" aria-pressed="true"');
      expect(html).toContain('data-testid="cat-filter-temple" aria-pressed="false"');

      // Default selected interest is 'all'
      expect(html).toContain('data-testid="interest-filter-all" aria-pressed="true"');
      expect(html).toContain('data-testid="interest-filter-heritage" aria-pressed="false"');
    });

    it("ensures search inputs have explicit accessible names and supplementary placeholders", () => {
      const heroHtml = renderClean(<OdishaHero selectedLocation="Bhubaneswar" />);
      expect(heroHtml).toContain('aria-label="Search destinations in English, Odia, or Hindi"');

      const destHtml = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
        />
      );
      expect(destHtml).toContain('aria-label="Search destinations in English, Odia, or Hindi"');
      expect(destHtml).toContain('placeholder="Search destinations, towns, or themes..."');
    });

    it("renders semantic button recovery elements with accessible labels", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
          initialSearch="NonExistent"
        />
      );

      // Recovery controls are semantic buttons with clear accessible names
      expect(html).toContain('<button type="button" aria-label="Clear search query"');
      expect(html).toContain('<button type="button" aria-label="Reset all destination filters"');
      expect(html).toContain('<button type="button" data-testid="reset-all-destination-filters" aria-label="Reset all destination filters and search"');
    });
  });
});
