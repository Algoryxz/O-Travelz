import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeSections } from "../src/components/home/HomeSections";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Weather Integration & UI", () => {
  it("renders weather banner with live forecast attribution and metrics", () => {
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

    expect(html).toContain("LOCAL WEATHER · BHUBANESWAR");
    expect(html).toContain("data-testid=\"weather-banner-section\"");
    expect(html).toContain("°C");
    expect(html).toContain("FORECAST");
  });

  it("updates weather banner heading when location changes to Puri", () => {
    const html = renderClean(
      <HomeSections
        selectedLocation="Puri"
        onNavigateToPlan={() => {}}
        onNavigateToMap={() => {}}
        onNavigateToCopilot={() => {}}
        onSelectCategory={() => {}}
        onSelectPlace={() => {}}
      />
    );

    expect(html).toContain("LOCAL WEATHER · PURI");
  });
});
