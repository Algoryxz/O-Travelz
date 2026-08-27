import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  normalizeBaseUrl,
  buildApiUrlWithBase,
  diagnoseFetchError,
} from "../src/api/config";
import { ApiClient, NetworkError } from "../src/api/client";

describe("API Configuration & Canonical URL Resolution", () => {
  describe("normalizeBaseUrl", () => {
    it("returns empty string for undefined, null, or empty values", () => {
      expect(normalizeBaseUrl(undefined)).toBe("");
      expect(normalizeBaseUrl(null)).toBe("");
      expect(normalizeBaseUrl("")).toBe("");
      expect(normalizeBaseUrl("   ")).toBe("");
    });

    it("trims whitespace from start and end of URLs", () => {
      expect(normalizeBaseUrl("  https://otravelz-backend.onrender.com  ")).toBe(
        "https://otravelz-backend.onrender.com"
      );
    });

    it("strips trailing slashes cleanly", () => {
      expect(normalizeBaseUrl("https://otravelz-backend.onrender.com/")).toBe(
        "https://otravelz-backend.onrender.com"
      );
      expect(normalizeBaseUrl("https://otravelz-backend.onrender.com///")).toBe(
        "https://otravelz-backend.onrender.com"
      );
    });

    it("automatically prepends https:// to domain names without protocol", () => {
      expect(normalizeBaseUrl("otravelz-backend.onrender.com")).toBe(
        "https://otravelz-backend.onrender.com"
      );
      expect(normalizeBaseUrl("//otravelz-backend.onrender.com")).toBe(
        "https://otravelz-backend.onrender.com"
      );
    });

    it("preserves localhost and port configurations for local development", () => {
      expect(normalizeBaseUrl("http://localhost:8000")).toBe("http://localhost:8000");
      expect(normalizeBaseUrl("http://127.0.0.1:8000/")).toBe("http://127.0.0.1:8000");
    });
  });

  describe("buildApiUrlWithBase", () => {
    const PROD_BASE = "https://otravelz-backend.onrender.com";

    it("constructs /location/reverse-geocode URL correctly in production and local", () => {
      const prodUrl = buildApiUrlWithBase(PROD_BASE, "/location/reverse-geocode", {
        lat: 20.2667,
        lon: 85.8436,
      });
      expect(prodUrl).toBe(
        "https://otravelz-backend.onrender.com/location/reverse-geocode?lat=20.2667&lon=85.8436"
      );

      const localUrl = buildApiUrlWithBase("", "/location/reverse-geocode", {
        lat: 20.2667,
        lon: 85.8436,
      });
      expect(localUrl).toBe("/location/reverse-geocode?lat=20.2667&lon=85.8436");
    });

    it("constructs /weather/current URL correctly in production and local", () => {
      const prodUrl = buildApiUrlWithBase(PROD_BASE, "/weather/current", {
        lat: 20.2667,
        lon: 85.8436,
      });
      expect(prodUrl).toBe(
        "https://otravelz-backend.onrender.com/weather/current?lat=20.2667&lon=85.8436"
      );

      const localUrl = buildApiUrlWithBase("", "/weather/current", {
        location_name: "Bhubaneswar",
      });
      expect(localUrl).toBe("/weather/current?location_name=Bhubaneswar");
    });

    it("constructs /transport/stops/nearby URL correctly", () => {
      const prodUrl = buildApiUrlWithBase(PROD_BASE, "/transport/stops/nearby", {
        lat: 20.2667,
        lon: 85.8436,
        radius_m: 25000,
        limit: 4,
      });
      expect(prodUrl).toBe(
        "https://otravelz-backend.onrender.com/transport/stops/nearby?lat=20.2667&lon=85.8436&radius_m=25000&limit=4"
      );
    });

    it("constructs /transport/corridor-food URL correctly", () => {
      const prodUrl = buildApiUrlWithBase(PROD_BASE, "/transport/corridor-food", {
        route_id: "rt_10",
        max_distance_m: 2500,
        limit: 5,
      });
      expect(prodUrl).toBe(
        "https://otravelz-backend.onrender.com/transport/corridor-food?route_id=rt_10&max_distance_m=2500&limit=5"
      );
    });

    it("constructs /ai/converse URL correctly", () => {
      const prodUrl = buildApiUrlWithBase(PROD_BASE, "/ai/converse");
      expect(prodUrl).toBe("https://otravelz-backend.onrender.com/ai/converse");

      const localUrl = buildApiUrlWithBase("", "/ai/converse");
      expect(localUrl).toBe("/ai/converse");
    });

    it("avoids duplicate slashes even if base or endpoint has extra slashes", () => {
      const url = buildApiUrlWithBase(
        "https://otravelz-backend.onrender.com///",
        "///places/list"
      );
      expect(url).toBe("https://otravelz-backend.onrender.com/places/list");
    });
  });

  describe("diagnoseFetchError", () => {
    it("identifies DNS failure when error message indicates ERR_NAME_NOT_RESOLVED", () => {
      const diagnostic = diagnoseFetchError(
        new Error("TypeError: Failed to fetch (net::ERR_NAME_NOT_RESOLVED)"),
        "https://otravelz-backend.onrender.com/weather/current"
      );
      expect(diagnostic.category).toBe("DNS_OR_UNRESOLVED");
      expect(diagnostic.isRetryable).toBe(true);
      expect(diagnostic.message).toContain("Unable to resolve server address");
    });

    it("identifies Timeout or Render cold start when aborted or timed out", () => {
      const abortErr = new DOMException("The user aborted a request.", "AbortError");
      const diagnostic = diagnoseFetchError(
        abortErr,
        "https://otravelz-backend.onrender.com/ai/converse"
      );
      expect(diagnostic.category).toBe("TIMEOUT_OR_COLD_START");
      expect(diagnostic.isRetryable).toBe(true);
      expect(diagnostic.hint).toContain("Render free-tier instances take ~30-50s to wake up");
    });

    it("identifies offline state if navigator.onLine is false", () => {
      const hadNavigator = typeof globalThis.navigator !== "undefined";
      const originalOnLine = hadNavigator ? globalThis.navigator.onLine : undefined;

      if (!hadNavigator) {
        Object.defineProperty(globalThis, "navigator", {
          value: { onLine: false },
          configurable: true,
          writable: true,
        });
      } else {
        Object.defineProperty(globalThis.navigator, "onLine", {
          value: false,
          configurable: true,
          writable: true,
        });
      }

      try {
        const diagnostic = diagnoseFetchError(
          new Error("Failed to fetch"),
          "https://otravelz-backend.onrender.com/places"
        );
        expect(diagnostic.category).toBe("OFFLINE");
        expect(diagnostic.message).toContain("offline");
      } finally {
        if (!hadNavigator) {
          // @ts-expect-error cleanup injected global
          delete globalThis.navigator;
        } else {
          Object.defineProperty(globalThis.navigator, "onLine", {
            value: originalOnLine,
            configurable: true,
            writable: true,
          });
        }
      }
    });
  });

  describe("ApiClient Idempotent GET Retry & Error Diagnostics", () => {
    it("retries idempotent GET once on transient fetch failure and succeeds if second attempt succeeds", async () => {
      let callCount = 0;
      const fetchFn = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new TypeError("Failed to fetch");
        }
        return {
          ok: true,
          status: 200,
          statusText: "OK",
          text: () =>
            Promise.resolve(
              JSON.stringify({ locality: "Bhubaneswar", city: "Bhubaneswar" })
            ),
        } as unknown as Response;
      });

      const client = new ApiClient({
        baseUrl: "https://otravelz-backend.onrender.com",
        fetchFn,
      });

      const res = await client.reverseGeocode(20.2667, 85.8436);
      expect(res.locality).toBe("Bhubaneswar");
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it("throws NetworkError with diagnostic details when all attempts fail", async () => {
      const fetchFn = vi.fn().mockRejectedValue(
        new Error("TypeError: Failed to fetch net::ERR_NAME_NOT_RESOLVED")
      );

      const client = new ApiClient({
        baseUrl: "https://otravelz-backend.onrender.com",
        fetchFn,
      });

      await expect(client.getWeather({ lat: 20.2667, lon: 85.8436 })).rejects.toThrow(
        NetworkError
      );
    });
  });
});
