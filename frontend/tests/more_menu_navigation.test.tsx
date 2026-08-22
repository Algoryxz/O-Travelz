import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { TopNav } from "../src/components/nav/TopNav";
import { MobileDrawer } from "../src/components/nav/MobileDrawer";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("More Menu & Navigation Integration", () => {
  it("renders desktop More menu trigger button with correct accessibility attributes", () => {
    const html = renderClean(
      <TopNav
        activeTab="discover"
        onTabChange={() => {}}
        selectedLocation="Bhubaneswar"
        onLocationChange={() => {}}
        onOpenMobileDrawer={() => {}}
        onOpenSettings={() => {}}
        savedCount={3}
        revisitCount={2}
      />
    );

    expect(html).toContain('data-testid="desktop-more-menu-btn"');
    expect(html).toContain("More");
    expect(html).toContain('data-testid="nav-tab-discover"');
    expect(html).toContain('data-testid="nav-tab-destinations"');
    expect(html).toContain('data-testid="nav-tab-map"');
    expect(html).toContain('data-testid="nav-tab-plan"');
    expect(html).toContain('data-testid="nav-tab-saved"');
  });

  it("renders MobileDrawer with full Your Space, Discovery Shortcuts, and Preferences sections", () => {
    const html = renderClean(
      <MobileDrawer
        isOpen={true}
        onClose={() => {}}
        activeTab="discover"
        onSelectTab={() => {}}
        onOpenSettings={() => {}}
        savedCount={3}
        revisitCount={2}
      />
    );

    // Section 1: Navigate
    expect(html).toContain("Navigate");
    expect(html).toContain('data-testid="drawer-nav-discover"');
    expect(html).toContain('data-testid="drawer-nav-destinations"');
    expect(html).toContain('data-testid="drawer-nav-map"');
    expect(html).toContain('data-testid="drawer-nav-plan"');

    // Section 2: Your Space
    expect(html).toContain("Your Space");
    expect(html).toContain('data-testid="drawer-nav-saved"');
    expect(html).toContain("Saved places");
    expect(html).toContain('data-testid="drawer-nav-revisit"');
    expect(html).toContain("Revisit Places");
    expect(html).toContain('data-testid="drawer-nav-planned-trips"');
    expect(html).toContain("Planned Trips &amp; Itineraries");

    // Section 3: Discovery Shortcuts
    expect(html).toContain("Discovery Shortcuts");
    expect(html).toContain('data-testid="drawer-nav-all-destinations"');
    expect(html).toContain("All Destinations Index");
    expect(html).toContain('data-testid="drawer-nav-thematic-circuits"');
    expect(html).toContain("Thematic Travel Circuits");


    // Section 4: Preferences & Tools
    expect(html).toContain("Preferences &amp; Tools");
    expect(html).toContain('data-testid="drawer-nav-trip-preferences"');
    expect(html).toContain("Trip Preferences");
  });
});
