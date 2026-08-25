import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import { DestinationsPage } from "../src/components/home/DestinationsPage";
import { ApiClient } from "../src/api/client";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Phase 12 Step 10: Search Correction & Suggestions UI", () => {
  it("renders explore view with initial typo search query", () => {
    const html = renderClean(
      <DestinationsPage
        onSelectPlace={() => {}}
        onViewOnMap={() => {}}
        initialSearch="poori"
      />
    );

    expect(html).toContain('value="poori"');
    expect(html).toContain("data-testid=\"destinations-explore-view\"");
  });

  it("exposes getSearchSuggestions on ApiClient", async () => {
    const mockSuggestions = [
      { text: "Puri", canonical_name: "Puri", match_type: "typo_correction", confidence: 0.85 },
    ];
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockSuggestions),
      json: async () => mockSuggestions,
    });

    const client = new ApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const suggestions = await client.getSearchSuggestions("poori");

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].canonical_name).toBe("Puri");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/places/suggestions?query=poori"),
      expect.any(Object)
    );
  });
});
