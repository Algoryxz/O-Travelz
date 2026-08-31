import { describe, expect, it } from "vitest";
import {
  getAllWesternOdishaMapFeatures,
  getWesternOdishaMapFeatures,
  getNearbyFeaturesForDestination,
} from "../src/services/westernOdishaMapService";
import { getMarkerCategoryColor } from "../src/components/map/MapCanvas";
import { isValidCoordinate } from "../src/utils/geoUtils";

describe("Western Odisha Map Integration Service", () => {
  describe("1. Map Features Compilation & Strict Coordinate Validation", () => {
    it("compiles verified MapFeatures for all Western Odisha POI categories", () => {
      const allFeatures = getAllWesternOdishaMapFeatures();
      expect(allFeatures.length).toBeGreaterThan(600);

      // Verify that every single feature has valid WGS84 coordinates
      for (const feat of allFeatures) {
        expect(feat.geometry).toBeDefined();
        expect(feat.geometry.type).toBe("Point");
        const [lon, lat] = feat.geometry.coordinates;

        expect(isValidCoordinate(lat, lon)).toBe(true);
        expect(lat).toBeGreaterThanOrEqual(17.8);
        expect(lat).toBeLessThanOrEqual(22.6);
        expect(lon).toBeGreaterThanOrEqual(81.4);
        expect(lon).toBeLessThanOrEqual(87.5);
      }
    });

    it("correctly filters MapFeatures by category", () => {
      const hotels = getWesternOdishaMapFeatures("hotel");
      expect(hotels.length).toBe(78);
      expect(hotels.every((h) => h.canonical_ref.entity === "hotel")).toBe(true);

      const police = getWesternOdishaMapFeatures("police_station");
      expect(police.length).toBe(71);

      const atms = getWesternOdishaMapFeatures("atm");
      expect(atms.length).toBe(112);

      const petrol = getWesternOdishaMapFeatures("petrol_pump");
      expect(petrol.length).toBe(98);

      const hospitals = getWesternOdishaMapFeatures("hospital");
      expect(hospitals.length).toBe(76);

      const transport = getWesternOdishaMapFeatures("transport");
      expect(transport.length).toBe(46);
    });
  });

  describe("2. Destination Proximity Map Features", () => {
    it("retrieves map features for destination and its nearby facilities", () => {
      const destFeatures = getNearbyFeaturesForDestination("place_sambalpur_002");
      expect(destFeatures.length).toBeGreaterThan(0);
      expect(destFeatures[0].canonical_ref.id).toBe("place_sambalpur_002");
    });
  });

  describe("3. Category Marker Color Coding", () => {
    it("assigns distinct colors to all Western Odisha POI categories", () => {
      expect(getMarkerCategoryColor("Police Station")).toBe("#2F523E");
      expect(getMarkerCategoryColor("Hotel")).toBe("#B87B22");
      expect(getMarkerCategoryColor("Petrol Pump")).toBe("#D69E2E");
      expect(getMarkerCategoryColor("ATM")).toBe("#0284C7");
      expect(getMarkerCategoryColor("Transport Stop")).toBe("#4A5568");
      expect(getMarkerCategoryColor("Hospital")).toBe("#E53E3E");
    });
  });
});
