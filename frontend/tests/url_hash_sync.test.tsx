import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderToString } from "react-dom/server";
import {
  normalizeHash,
  getTabFromHash,
  getHashForTab,
  isValidTabHash,
  syncTabToUrl,
} from "../src/utils/navigation";
import { ItineraryPlannerPage } from "../src/pages/ItineraryPlannerPage";

// In-memory mock localStorage for SSR/DOM test isolation
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

describe("O-Travelz Phase 5: URL Hash Routing & Active Tab Synchronization Suite", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // =========================================================================
  // 1. Pure Unit Tests: Hash Parsing and Normalization
  // =========================================================================
  describe("1. Hash Normalization and Tab Resolution", () => {
    it("1.1 parses empty hash to 'discover'", () => {
      expect(getTabFromHash("")).toBe("discover");
      expect(getTabFromHash("#")).toBe("discover");
      expect(getTabFromHash(null)).toBe("discover");
      expect(getTabFromHash(undefined)).toBe("discover");
    });

    it("1.2 parses #discover and /#discover to 'discover'", () => {
      expect(getTabFromHash("#discover")).toBe("discover");
      expect(getTabFromHash("/#discover")).toBe("discover");
      expect(getTabFromHash("#/discover")).toBe("discover");
      expect(getTabFromHash("discover")).toBe("discover");
    });

    it("1.3 parses #destinations and /#destinations to 'destinations'", () => {
      expect(getTabFromHash("#destinations")).toBe("destinations");
      expect(getTabFromHash("/#destinations")).toBe("destinations");
      expect(getTabFromHash("#/destinations")).toBe("destinations");
      expect(getTabFromHash("destinations")).toBe("destinations");
    });

    it("1.4 parses #map and /#map to 'map'", () => {
      expect(getTabFromHash("#map")).toBe("map");
      expect(getTabFromHash("/#map")).toBe("map");
      expect(getTabFromHash("#/map")).toBe("map");
      expect(getTabFromHash("map")).toBe("map");
    });

    it("1.5 parses #plan and /#plan to 'plan'", () => {
      expect(getTabFromHash("#plan")).toBe("plan");
      expect(getTabFromHash("/#plan")).toBe("plan");
      expect(getTabFromHash("#/plan")).toBe("plan");
      expect(getTabFromHash("plan")).toBe("plan");
    });

    it("1.6 parses #saved and /#saved to 'saved'", () => {
      expect(getTabFromHash("#saved")).toBe("saved");
      expect(getTabFromHash("/#saved")).toBe("saved");
      expect(getTabFromHash("#/saved")).toBe("saved");
      expect(getTabFromHash("saved")).toBe("saved");
    });

    it("1.7 safely falls back to 'discover' on invalid, random, or malformed hashes", () => {
      expect(getTabFromHash("#foobar")).toBe("discover");
      expect(getTabFromHash("#random")).toBe("discover");
      expect(getTabFromHash("#123")).toBe("discover");
      expect(getTabFromHash("##unknown")).toBe("discover");
      expect(getTabFromHash("#!/test-route")).toBe("discover");
      expect(getTabFromHash("#undefined")).toBe("discover");
    });

    it("1.8 checks validity with isValidTabHash", () => {
      expect(isValidTabHash("#discover")).toBe(true);
      expect(isValidTabHash("#destinations")).toBe(true);
      expect(isValidTabHash("#map")).toBe(true);
      expect(isValidTabHash("#plan")).toBe(true);
      expect(isValidTabHash("#saved")).toBe(true);
      expect(isValidTabHash("#foobar")).toBe(false);
      expect(isValidTabHash("")).toBe(false);
    });

    it("1.9 maps canonical tabs to hashes via getHashForTab", () => {
      expect(getHashForTab("discover")).toBe("#discover");
      expect(getHashForTab("destinations")).toBe("#destinations");
      expect(getHashForTab("map")).toBe("#map");
      expect(getHashForTab("plan")).toBe("#plan");
      expect(getHashForTab("saved")).toBe("#saved");
      expect(getHashForTab("revisit")).toBe("#saved");
      expect(getHashForTab("category")).toBe("#destinations");
      expect(getHashForTab("unknown" as any)).toBe("#discover");
    });
  });

  // =========================================================================
  // 2. syncTabToUrl and Window History Mocking
  // =========================================================================
  describe("2. syncTabToUrl Browser History Updates", () => {
    let originalLocation: Location;
    let pushStateMock: any;
    let replaceStateMock: any;

    beforeEach(() => {
      pushStateMock = vi.fn();
      replaceStateMock = vi.fn();

      if (typeof window !== "undefined") {
        window.history.pushState = pushStateMock;
        window.history.replaceState = replaceStateMock;
      }
    });

    it("2.1 pushes new URL hash on tab switch when hash differs", () => {
      if (typeof window !== "undefined") {
        window.location.hash = "#discover";
        syncTabToUrl("map", "push");
        expect(pushStateMock).toHaveBeenCalledWith(null, "", expect.stringContaining("#map"));
      }
    });

    it("2.2 replaces URL hash when replace mode is specified", () => {
      if (typeof window !== "undefined") {
        window.location.hash = "#foobar";
        syncTabToUrl("discover", "replace");
        expect(replaceStateMock).toHaveBeenCalledWith(null, "", expect.stringContaining("#discover"));
      }
    });

    it("2.3 prevents redundant state updates if target hash matches current hash", () => {
      if (typeof window !== "undefined") {
        window.location.hash = "#map";
        syncTabToUrl("map", "push");
        expect(pushStateMock).not.toHaveBeenCalled();
      }
    });
  });

  // =========================================================================
  // 3. Component Deep Linking and Initial Tab Rendering
  // =========================================================================
  describe("3. ItineraryPlannerPage Deep Link and Tab Views", () => {
    it("3.1 renders Discover workspace by default when initialTab is discover", () => {
      const html = renderClean(<ItineraryPlannerPage initialTab="discover" initialConsentAccepted={true} />);
      expect(html).toContain("Odisha");
      expect(html).toContain("data-testid=\"nav-tab-discover\"");
    });

    it("3.2 renders All Destinations workspace when initialTab is destinations", () => {
      const html = renderClean(<ItineraryPlannerPage initialTab="destinations" initialConsentAccepted={true} />);
      expect(html).toContain("Explore Destinations Across Odisha");
      expect(html).toContain("data-testid=\"destinations-search-input\"");
    });

    it("3.3 renders Standalone Map workspace when initialTab is map", () => {
      const html = renderClean(<ItineraryPlannerPage initialTab="map" initialConsentAccepted={true} />);
      expect(html).toContain("Odisha Interactive Map");
      expect(html).toContain("Verified Geographical Explorer");
    });

    it("3.4 renders Itinerary Planner workspace when initialTab is plan", () => {
      const html = renderClean(<ItineraryPlannerPage initialTab="plan" initialConsentAccepted={true} />);
      expect(html).toContain("Odisha Itinerary Workspace");
      expect(html).toContain("Deterministic Travel Engine");
    });

    it("3.5 renders Saved Places workspace when initialTab is saved", () => {
      const html = renderClean(<ItineraryPlannerPage initialTab="saved" initialConsentAccepted={true} />);
      expect(html).toContain("Saved Places");
    });
  });

  // =========================================================================
  // 4. Invariant Protection & Edge Case Stability
  // =========================================================================
  describe("4. URL Routing Robustness & Edge Cases", () => {
    it("4.1 normalizeHash handles various prefix variations safely", () => {
      expect(normalizeHash("###map")).toBe("map");
      expect(normalizeHash("/#/destinations/")).toBe("destinations");
      expect(normalizeHash("   #plan   ")).toBe("plan");
      expect(normalizeHash("?query#saved")).toBe("query#saved");
    });

    it("4.2 maintains stable activeTab without infinite loops", () => {
      // Ensure passing known tabs returns expected identity
      const tabs = ["discover", "destinations", "map", "plan", "saved"] as const;
      for (const t of tabs) {
        const hash = getHashForTab(t);
        const resolved = getTabFromHash(hash);
        expect(resolved).toBe(t);
      }
    });
  });
});
