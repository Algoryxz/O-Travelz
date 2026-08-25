import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CANONICAL_CATEGORIES,
  CANONICAL_INTERESTS,
  type PlanningConstraints,
  type TransportHop,
  type MapProjectionResponse,
} from "../src/api/contracts";
import { DestinationsPage } from "../src/components/home/DestinationsPage";
import { PlaceDetailsModal, type SelectedPlaceInfo } from "../src/components/place/PlaceDetailsModal";
import { AIConversationPanel } from "../src/components/ai/AIConversationPanel";
import { AISidebar } from "../src/components/ai/AISidebar";
import { TransportHopCard } from "../src/components/transport/TransportHopCard";
import { MapView } from "../src/components/map/MapView";
import { getRefinementSuggestions } from "../src/utils/timelineService";
import type { SavedTripConversation } from "../src/store/useConversationHistory";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Pass 3.1: Hardening & Contract Reconciliation", () => {
  describe("1. Contract Consistency & Taxonomy Drift Prevention", () => {
    it("has exactly 13 canonical categories and 12 canonical interests", () => {
      expect(CANONICAL_CATEGORIES).toHaveLength(13);
      expect(CANONICAL_INTERESTS).toHaveLength(12);

      const categoryIds = CANONICAL_CATEGORIES.map((c) => c.id);
      expect(categoryIds).toContain("temple");
      expect(categoryIds).toContain("monument");
      expect(categoryIds).toContain("nature");
      expect(categoryIds).toContain("beach");
      expect(categoryIds).toContain("wildlife");
      expect(categoryIds).toContain("waterfall");
      expect(categoryIds).toContain("museum");
      expect(categoryIds).toContain("lake");
      expect(categoryIds).toContain("market");
      expect(categoryIds).toContain("park");
      expect(categoryIds).toContain("sports_venue");
      expect(categoryIds).toContain("science_center");
      expect(categoryIds).toContain("planetarium");

      const interestIds = CANONICAL_INTERESTS.map((i) => i.id);
      expect(interestIds).toContain("heritage");
      expect(interestIds).toContain("spirituality");
      expect(interestIds).toContain("architecture");
      expect(interestIds).toContain("food");
      expect(interestIds).toContain("culture");
      expect(interestIds).toContain("nature");
      expect(interestIds).toContain("beach");
      expect(interestIds).toContain("wildlife");
      expect(interestIds).toContain("waterfall");
      expect(interestIds).toContain("relaxation");
      expect(interestIds).toContain("adventure");
      expect(interestIds).toContain("shopping");
    });
  });

  describe("2. Destination Discovery Category and Interest Alignment", () => {
    it("exposes all 13 canonical categories and 12 canonical interest filters from canonical contracts", () => {
      const html = renderClean(
        <DestinationsPage
          onSelectPlace={() => {}}
          onViewOnMap={() => {}}
          onPlanTripWithPlace={() => {}}
        />
      );

      // Verify all 13 physical categories
      CANONICAL_CATEGORIES.forEach((cat) => {
        const cleanLabel = cat.label.replace("&", "&amp;");
        expect(html).toContain(cleanLabel);
      });

      // Verify all 12 canonical interest chips
      CANONICAL_INTERESTS.forEach((interest) => {
        const cleanLabel = interest.label.replace("&", "&amp;");
        expect(html).toContain(cleanLabel);
      });
    });
  });

  describe("3. Category vs Interest Semantics & Precedence", () => {
    it("renders authentic place interests in PlaceDetailsModal without converting category to interest", () => {
      const samplePlace: SelectedPlaceInfo = {
        id: "p_101",
        name: "Ananta Vasudeva Temple",
        category: "temple",
        location: "Old Town, Bhubaneswar",
        interests: ["heritage", "spirituality", "architecture", "food"],
        avg_visit_minutes: 60,
      };

      const html = renderClean(
        <PlaceDetailsModal
          place={samplePlace}
          onClose={() => {}}
          onViewOnMap={() => {}}
          onPlanTrip={() => {}}
        />
      );

      // Physical Category badge
      expect(html).toContain("temple");
      // Genuine thematic interest tags
      expect(html).toContain("Themes:");
      expect(html).toContain("heritage");
      expect(html).toContain("spirituality");
      expect(html).toContain("architecture");
      expect(html).toContain("food");
    });

    it("does not guess interests when place has no canonical interests", () => {
      const samplePlace: SelectedPlaceInfo = {
        id: "p_102",
        name: "Generic Stadium",
        category: "sports_venue",
        location: "Bhubaneswar",
        interests: [],
      };

      const html = renderClean(
        <PlaceDetailsModal
          place={samplePlace}
          onClose={() => {}}
          onViewOnMap={() => {}}
          onPlanTrip={() => {}}
        />
      );

      expect(html).toContain("sports_venue");
      expect(html).not.toContain("Themes:");
    });
  });

  describe("4. Context-Aware AI Refinements", () => {
    it("returns generic discovery prompts when no itinerary exists", () => {
      const suggestions = getRefinementSuggestions(null, false);
      expect(suggestions).toContain("Plan a 2-day heritage trip in Bhubaneswar");
      expect(suggestions).toContain("Plan a 2-day food and culture tour");
      expect(suggestions).toContain("Plan a relaxing beach trip in Puri");
    });

    it("returns contextual prompts when itinerary exists", () => {
      const constraints: PlanningConstraints = {
        days: 2,
        interests: ["heritage", "spirituality"],
        start: "Bhubaneswar",
      };

      const suggestions = getRefinementSuggestions(constraints, true);

      // Duration adjustment
      expect(suggestions).toContain("Extend trip to 3 days");
      // Origin adjustment
      expect(suggestions).toContain("Start from Puri");
      // Thematic adjustment
      expect(suggestions).toContain("Add food and culinary stops");
      expect(suggestions).toContain("Add beaches and coastal views");
    });

    it("renders dynamic contextual suggestions in AIConversationPanel", () => {
      const constraints: PlanningConstraints = {
        days: 2,
        interests: ["heritage"],
        start: "Bhubaneswar",
      };

      const html = renderClean(
        <AIConversationPanel
          currentConstraints={constraints}
          hasItinerary={true}
          isLoading={false}
          error={null}
          aiResponse={null}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Extend trip to 3 days");
      expect(html).toContain("Add food and culinary stops");
    });
  });

  describe("5. Transport Semantics (Long Journey)", () => {
    it("renders Long Journey badge and highlighted styling for hops > 120 minutes", () => {
      const longHop: TransportHop = {
        from_sequence: 1,
        to_sequence: 2,
        mode: "road",
        estimated_minutes: 180,
        legs: [{ mode: "car", detail: "Bhubaneswar to Sambalpur (~280 km)" }],
        data_tier: "scheduled",
      };

      const html = renderClean(<TransportHopCard hop={longHop} />);

      expect(html).toContain("Long Journey");
      expect(html).not.toContain("Inter-District Journey");
      expect(html).toContain("3h");
      expect(html).toContain('data-testid="long-transfer-badge"');
    });

    it("does not render Long Journey badge for hops <= 120 minutes", () => {
      const shortHop: TransportHop = {
        from_sequence: 1,
        to_sequence: 2,
        mode: "road",
        estimated_minutes: 45,
        legs: [{ mode: "car", detail: "Puri to Konark (~35 km)" }],
        data_tier: "scheduled",
      };

      const html = renderClean(<TransportHopCard hop={shortHop} />);

      expect(html).not.toContain("Long Journey");
      expect(html).not.toContain("Inter-District Journey");
      expect(html).toContain("45 min");
    });
  });

  describe("6. Authoritative MapView Rendering", () => {
    it("renders map canvas when backend projection provides features", () => {
      const projection: MapProjectionResponse = {
        requested_features: [{ entity: "place", id: "p1" }],
        features: [
          {
            feature_type: "place",
            canonical_ref: { entity: "place", id: "p1" },
            name: "Lingaraj Temple",
            category: "temple",
            region: "Bhubaneswar & Central",
            geometry_status: "available",
            geometry: {
              type: "Point",
              coordinates: [85.8333, 20.2378],
            },
          },
        ],
        relationships: [],
        unavailable_items: [],
      };

      const html = renderClean(
        <MapView
          projection={projection}
          isLoading={false}
          error={null}
        />
      );

      expect(html).toContain('data-testid="map-view-root"');
      expect(html).toContain("Odisha Route &amp; Destination Map");
      expect(html).toContain('data-testid="map-canvas-container"');
    });

    it("renders truthful empty state when projection is null", () => {
      const html = renderClean(
        <MapView
          projection={null}
          isLoading={false}
          error={null}
        />
      );

      expect(html).toContain("Explore on the Map");
      expect(html).not.toContain('data-testid="map-canvas-container"');
    });
  });
});
