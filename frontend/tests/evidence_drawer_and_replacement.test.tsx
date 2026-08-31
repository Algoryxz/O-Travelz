import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvidenceDrawer } from "../src/components/ai/EvidenceDrawer";
import { ClaimBadge } from "../src/components/badges/ClaimBadge";
import { ItineraryStopCard } from "../src/components/itinerary/ItineraryStopCard";
import { CopilotItineraryCard } from "../src/components/ai/CopilotItineraryCard";
import { ItineraryView } from "../src/components/itinerary/ItineraryView";
import type { EvidenceItem, ItineraryPlanResponse, ItineraryStop } from "../src/types/api";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

const mockEvidenceItems: EvidenceItem[] = [
  {
    title: "Weather Suitability",
    rationale: "Selected indoor cultural venue suitable for weather conditions",
    claim_type: "live",
    source: "Open-Meteo",
    confidence: "high",
  },
  {
    title: "Verified Destination",
    rationale: "Verified coordinates and operating hours from canonical catalog",
    claim_type: "verified",
    source: "itinerary_service:replacement",
    confidence: "high",
  },
  {
    title: "Scheduled Departure",
    rationale: "Timetable data for CRUT Mo Bus Route 10",
    claim_type: "scheduled",
    source: "CRUT Mo Bus timetable",
    confidence: "high",
  },
  {
    title: "Crowd Estimation",
    rationale: "Estimated moderate crowd based on category priors",
    claim_type: "estimated",
    source: "O-TRAVELZ crowd heuristic",
    confidence: "medium",
  },
];

const mockStop: ItineraryStop = {
  sequence: 2,
  place: {
    id: "p2",
    name: "Chandrabhaga Beach",
    category: "beach",
  },
  planned_arrival: "11:30",
  planned_departure: "13:00",
};

const mockItinerary: ItineraryPlanResponse = {
  itinerary_id: "test-itin-1",
  constraints: { days: 1, start: "Puri", interests: [] },
  days: [
    {
      day_number: 1,
      stops: [
        {
          sequence: 1,
          place: { id: "p1", name: "Jagannath Temple, Puri", category: "temple" },
          planned_arrival: "09:00",
          planned_departure: "11:00",
        },
        mockStop,
      ],
      hops: [
        {
          from_sequence: 1,
          to_sequence: 2,
          mode: "walk",
          estimated_minutes: 15,
          legs: [{ mode: "walk", detail: "Walk 15m" }],
          data_tier: "static",
        },
      ],
    },
  ],
  explanation: "1-day tour",
};

describe("Evidence Drawer & Single-Stop Replacement (AI Checkpoint 4)", () => {
  // Test 16: Evidence Drawer renders
  it("renders EvidenceDrawer with collapsed state and count badge", () => {
    const html = renderClean(<EvidenceDrawer evidenceItems={mockEvidenceItems} />);
    expect(html).toContain('data-testid="evidence-drawer"');
    expect(html).toContain("Why O-TRAVELZ suggested this");
    expect(html).toContain("4");
  });

  // Test 17: Drawer expand/collapse
  it("renders evidence items when defaultExpanded is true", () => {
    const html = renderClean(
      <EvidenceDrawer evidenceItems={mockEvidenceItems} defaultExpanded={true} />
    );
    expect(html).toContain('data-testid="evidence-drawer-content"');
    expect(html).toContain("Weather Suitability");
    expect(html).toContain("Selected indoor cultural venue suitable for weather conditions");
    expect(html).toContain("Open-Meteo");
  });

  // Test 18: Claim Badges render with correct semantic labels
  it("renders claim badges with distinct styles for verified, scheduled, live, estimated", () => {
    const liveHtml = renderClean(<ClaimBadge claimType="live" />);
    expect(liveHtml).toContain('data-testid="claim-badge-live"');
    expect(liveHtml).toContain("Live");

    const verifiedHtml = renderClean(<ClaimBadge claimType="verified" />);
    expect(verifiedHtml).toContain('data-testid="claim-badge-verified"');
    expect(verifiedHtml).toContain("Verified");

    const scheduledHtml = renderClean(<ClaimBadge claimType="scheduled" />);
    expect(scheduledHtml).toContain('data-testid="claim-badge-scheduled"');
    expect(scheduledHtml).toContain("Scheduled");

    const estimatedHtml = renderClean(<ClaimBadge claimType="estimated" />);
    expect(estimatedHtml).toContain('data-testid="claim-badge-estimated"');
    expect(estimatedHtml).toContain("Estimated");
  });


  // Test 19: Replace Stop action button renders on ItineraryStopCard
  it("renders Replace stop action button on ItineraryStopCard when onReplaceStop is passed", () => {
    const html = renderClean(
      <ItineraryStopCard stop={mockStop} dayNumber={1} onReplaceStop={() => {}} />
    );
    expect(html).toContain('data-testid="replace-stop-2"');
    expect(html).toContain("Replace");
  });

  // Test 20: ItineraryView renders EvidenceDrawer when evidenceItems are present
  it("renders EvidenceDrawer inside ItineraryView when evidence items are provided", () => {
    const html = renderClean(
      <ItineraryView itinerary={mockItinerary} evidenceItems={mockEvidenceItems} />
    );
    expect(html).toContain('data-testid="evidence-drawer"');
    expect(html).toContain("Why O-TRAVELZ suggested this");
  });

  // Test 21: CopilotItineraryCard renders EvidenceDrawer
  it("renders EvidenceDrawer inside CopilotItineraryCard when provided", () => {
    const html = renderClean(
      <CopilotItineraryCard
        itinerary={mockItinerary}
        evidenceItems={mockEvidenceItems}
      />
    );
    expect(html).toContain('data-testid="evidence-drawer"');
  });

  // Test 22: Old/legacy itinerary cards without onReplaceStop remain functional
  it("renders ItineraryStopCard cleanly without onReplaceStop prop", () => {
    const html = renderClean(<ItineraryStopCard stop={mockStop} />);
    expect(html).toContain('data-testid="itinerary-stop-2"');
    expect(html).not.toContain('data-testid="replace-stop-2"');
  });
});
