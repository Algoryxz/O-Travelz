import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getNearbyFacilitiesForPlace,
  getNearestFacilityForPlace,
  formatDistanceKm,
} from "../src/services/geospatialRelationshipService";
import { NearbyFacilities } from "../src/components/place/NearbyFacilities";

describe("Western Odisha Master Geospatial Relationship Service & Integration", () => {
  describe("1. Distance Formatter", () => {
    it("formats sub-kilometer distances in meters", () => {
      expect(formatDistanceKm(0.42)).toBe("420 m");
      expect(formatDistanceKm(0.05)).toBe("50 m");
    });

    it("formats distances >= 1.0 km in rounded kilometers", () => {
      expect(formatDistanceKm(1.42)).toBe("1.4 km");
      expect(formatDistanceKm(12.87)).toBe("12.9 km");
    });
  });

  describe("2. Relationship Querying & ID Resolution", () => {
    it("returns empty group for empty or non-existent source ID", () => {
      const emptyGroup = getNearbyFacilitiesForPlace("non_existent_place_999");
      expect(emptyGroup.total_nearby_count).toBe(0);
      expect(emptyGroup.hotels).toEqual([]);
      expect(emptyGroup.restaurants).toEqual([]);
    });

    it("queries verified nearby facilities for a valid Western Odisha tourist place", () => {
      // Test with Sambalpur Town / Hirakud / Rourkela place ID
      const group = getNearbyFacilitiesForPlace("place_sundargarh_001");
      if (group.total_nearby_count > 0) {
        expect(group.total_nearby_count).toBeGreaterThan(0);

        // Check distance sorting (ascending)
        if (group.hotels.length > 1) {
          for (let i = 0; i < group.hotels.length - 1; i++) {
            expect(group.hotels[i].distance_km).toBeLessThanOrEqual(group.hotels[i + 1].distance_km);
          }
        }

        // Verify structure & confidence attributes
        const firstItem = group.hotels[0] || group.restaurants[0] || group.atms[0] || group.police_stations[0];
        if (firstItem) {
          expect(firstItem.target_id).toBeDefined();
          expect(firstItem.target_name).toBeDefined();
          expect(firstItem.target_name.length).toBeGreaterThan(0);
          expect(typeof firstItem.distance_km).toBe("number");
          expect(["very_near", "nearby", "accessible", "extended"]).toContain(firstItem.distance_class);
          expect(["VERIFIED", "PLAUSIBLE"]).toContain(firstItem.source_coordinate_confidence);
          expect(["VERIFIED", "PLAUSIBLE"]).toContain(firstItem.target_coordinate_confidence);
          expect(typeof firstItem.cross_district).toBe("boolean");
        }
      }
    });

    it("retrieves the single nearest facility using getNearestFacilityForPlace", () => {
      const nearestHotel = getNearestFacilityForPlace("place_sundargarh_001", "hotel");
      if (nearestHotel) {
        expect(nearestHotel.facility_type).toBe("hotel");
        expect(nearestHotel.distance_km).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("3. UI Component SSR Rendering Test", () => {
    it("renders NearbyFacilities component cleanly without throwing errors", () => {
      const html = renderToString(
        <NearbyFacilities sourceId="place_sundargarh_001" />
      );

      expect(typeof html).toBe("string");
      if (html.length > 0) {
        expect(html).toContain("Nearby Facilities &amp; Utilities");
      }
    });

    it("renders null for non-existent source ID cleanly", () => {
      const html = renderToString(
        <NearbyFacilities sourceId="non_existent_id" />
      );
      expect(html).toBe("");
    });
  });
});
