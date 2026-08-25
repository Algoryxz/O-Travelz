import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  isValidCoordinate,
  calculateHaversineDistanceKm,
  formatDistance,
  getNearbyPlacesWithExpansion,
} from "../src/utils/geoUtils";

describe("Geospatial Utilities & Proximity Engine", () => {
  describe("1. Strict Coordinate Validation", () => {
    it("accepts genuine WGS84 geographic coordinates", () => {
      expect(isValidCoordinate(20.2961, 85.8245)).toBe(true); // Bhubaneswar
      expect(isValidCoordinate(19.8135, 85.8312)).toBe(true); // Puri
      expect(isValidCoordinate(19.8876, 86.0945)).toBe(true); // Konark
      expect(isValidCoordinate(-33.8688, 151.2093)).toBe(true); // Sydney (valid global)
      expect(isValidCoordinate(0, 10)).toBe(true); // Equator valid lon
      expect(isValidCoordinate(10, 0)).toBe(true); // Prime meridian valid lat
    });

    it("rejects null, undefined, NaN, and non-numeric values", () => {
      expect(isValidCoordinate(null, 85.82)).toBe(false);
      expect(isValidCoordinate(20.29, null)).toBe(false);
      expect(isValidCoordinate(undefined, 85.82)).toBe(false);
      expect(isValidCoordinate(20.29, undefined)).toBe(false);
      expect(isValidCoordinate(NaN, 85.82)).toBe(false);
      expect(isValidCoordinate(20.29, NaN)).toBe(false);
      expect(isValidCoordinate(Infinity, 85.82)).toBe(false);
      expect(isValidCoordinate("invalid", 85.82)).toBe(false);
      expect(isValidCoordinate("", 85.82)).toBe(false);
    });

    it("rejects out-of-range latitudes and longitudes", () => {
      expect(isValidCoordinate(95.0, 85.82)).toBe(false);
      expect(isValidCoordinate(-95.0, 85.82)).toBe(false);
      expect(isValidCoordinate(20.29, 185.0)).toBe(false);
      expect(isValidCoordinate(20.29, -185.0)).toBe(false);
    });

    it("specifically rejects the (0, 0) placeholder pair", () => {
      expect(isValidCoordinate(0, 0)).toBe(false);
      expect(isValidCoordinate(0.00000001, 0.00000001)).toBe(false);
    });
  });

  describe("2. Great-Circle Haversine Distance Calculation", () => {
    it("calculates accurate distances between known Odisha landmarks", () => {
      // Master Canteen BBSR (20.2667, 85.8436) to Lingaraj Temple (20.2382, 85.8336) ~ 3.3 - 3.5 km
      const distBbsrToLingaraj = calculateHaversineDistanceKm(20.2667, 85.8436, 20.2382, 85.8336);
      expect(distBbsrToLingaraj).toBeGreaterThan(3.0);
      expect(distBbsrToLingaraj).toBeLessThan(3.8);

      // Bhubaneswar (20.2961, 85.8245) to Puri Jagannath Temple (19.8049, 85.8179) ~ 54 - 58 km
      const distBbsrToPuri = calculateHaversineDistanceKm(20.2961, 85.8245, 19.8049, 85.8179);
      expect(distBbsrToPuri).toBeGreaterThan(50.0);
      expect(distBbsrToPuri).toBeLessThan(60.0);

      // Bhubaneswar to Sambalpur (21.4669, 83.9812) ~ 230 - 260 km
      const distBbsrToSambalpur = calculateHaversineDistanceKm(20.2961, 85.8245, 21.4669, 83.9812);
      expect(distBbsrToSambalpur).toBeGreaterThan(220.0);
      expect(distBbsrToSambalpur).toBeLessThan(260.0);
    });

    it("returns NaN for invalid coordinates", () => {
      expect(calculateHaversineDistanceKm(NaN, 85.82, 20.29, 85.82)).toBeNaN();
      expect(calculateHaversineDistanceKm(20.29, 85.82, 0, 0)).toBeNaN();
    });
  });

  describe("3. Human-Readable Distance Formatting", () => {
    it("formats sub-kilometer distances in meters without misleading decimals", () => {
      expect(formatDistance(0.45)).toBe("450 m away");
      expect(formatDistance(0.852)).toBe("852 m away");
      expect(formatDistance(0.05)).toBe("50 m away");
    });

    it("formats short distances (< 10 km) with 1 decimal place", () => {
      expect(formatDistance(1.23)).toBe("1.2 km away");
      expect(formatDistance(8.46)).toBe("8.5 km away");
    });

    it("formats longer distances (>= 10 km) rounded to nearest integer", () => {
      expect(formatDistance(42.3)).toBe("42 km away");
      expect(formatDistance(105.8)).toBe("106 km away");
      expect(formatDistance(260.1)).toBe("260 km away");
    });

    it("handles non-finite or negative distances gracefully", () => {
      expect(formatDistance(NaN)).toBe("");
      expect(formatDistance(-5)).toBe("");
    });
  });

  describe("4. Nearest-First Sorting & Bhubaneswar Ground Truth", () => {
    const mockOdishaPlaces = [
      { id: "p-sambalpur", name: "Hirakud Dam, Sambalpur", lat: 21.528, lon: 83.872, category: "nature" },
      { id: "p-lingaraj", name: "Lingaraj Temple, Bhubaneswar", lat: 20.238, lon: 85.833, category: "temple" },
      { id: "p-rourkela", name: "Hanuman Vatika, Rourkela", lat: 22.245, lon: 84.842, category: "heritage" },
      { id: "p-dhauli", name: "Dhauli Shanti Stupa, Bhubaneswar", lat: 20.192, lon: 85.839, category: "monument" },
      { id: "p-koraput", name: "Deomali Peak, Koraput", lat: 18.675, lon: 82.983, category: "mountain" },
      { id: "p-mukteswar", name: "Mukteswar Temple, Bhubaneswar", lat: 20.243, lon: 85.835, category: "temple" },
      { id: "p-invalid-zero", name: "Fake 0,0 Place", lat: 0, lon: 0, category: "invalid" },
      { id: "p-invalid-null", name: "Unresolved Place", lat: null, lon: null, category: "invalid" },
      { id: "p-khandagiri", name: "Udayagiri & Khandagiri Caves", lat: 20.263, lon: 85.786, category: "caves" },
    ];

    it("excludes places with invalid/zero coordinates and sorts strictly nearest-first", () => {
      // User at Master Canteen, Bhubaneswar (20.2667, 85.8436)
      const result = getNearbyPlacesWithExpansion(mockOdishaPlaces, 20.2667, 85.8436, {
        minResults: 4,
        radii: [25, 50, 100, 200, 500],
      });

      // Must exclude invalid places
      expect(result.places.some((p) => p.id === "p-invalid-zero")).toBe(false);
      expect(result.places.some((p) => p.id === "p-invalid-null")).toBe(false);

      // Must prioritize nearby Bhubaneswar destinations before distant Sambalpur/Rourkela/Koraput
      const names = result.places.map((p) => p.name);
      expect(names[0]).toContain("Bhubaneswar");
      expect(names[1]).toContain("Bhubaneswar");
      expect(names).not.toContain("Hirakud Dam, Sambalpur");
      expect(names).not.toContain("Hanuman Vatika, Rourkela");
      expect(names).not.toContain("Deomali Peak, Koraput");

      // Verify strict distance ascending order
      for (let i = 0; i < result.places.length - 1; i++) {
        expect(result.places[i].distanceKm).toBeLessThanOrEqual(result.places[i + 1].distanceKm);
      }
    });

    it("progressively expands radius if initial radius has fewer than minResults", () => {
      // Only 1 place within 5 km
      const tightRadiusResult = getNearbyPlacesWithExpansion(
        mockOdishaPlaces,
        20.2667,
        85.8436,
        { minResults: 4, radii: [5, 15, 50, 500] }
      );

      // Should have automatically expanded to 15 km or 50 km to find at least 4 places
      expect(tightRadiusResult.places.length).toBeGreaterThanOrEqual(4);
      expect(tightRadiusResult.activeRadiusKm).toBeGreaterThan(5);
      expect(tightRadiusResult.isExpanded).toBe(true);
    });

    it("caps at max radius and returns all valid available places if catalog has fewer than minResults", () => {
      const fewPlaces = [
        { id: "p-1", name: "Distant Place A", lat: 21.5, lon: 84.0 },
        { id: "p-2", name: "Distant Place B", lat: 22.0, lon: 84.5 },
      ];

      const result = getNearbyPlacesWithExpansion(fewPlaces, 20.2667, 85.8436, {
        minResults: 5,
        radii: [25, 50, 100, 500],
      });

      expect(result.places.length).toBe(2);
      expect(result.activeRadiusKm).toBe(500);
    });
  });

  describe("5. Geolocation Fallback Integrity", () => {
    it("gracefully handles invalid user coordinates without throwing", () => {
      const result = getNearbyPlacesWithExpansion([], NaN, NaN);
      expect(result.places).toEqual([]);
      expect(result.totalValidPlaces).toBe(0);
    });
  });
});
