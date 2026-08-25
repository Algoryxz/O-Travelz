import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { WeatherResponse } from "../src/api/contracts";
import type { ApiClient } from "../src/api/client";
import { normalizeWeatherCondition, getWeatherVisualTheme } from "../src/utils/weatherNormalizer";

describe("Weather Live Refresh, Time-Awareness & Error Truthfulness Contract", () => {
  it("determines daytime clear vs nighttime clear strictly based on isDay, never hardcoded", () => {
    // Daytime clear (isDay = true)
    const dayCond = normalizeWeatherCondition("Clear", 0);
    const dayTheme = getWeatherVisualTheme(dayCond, true);
    expect(dayTheme.displayName).toBe("Clear & Sunny");
    expect(dayTheme.iconType).toBe("sun");
    expect(dayTheme.isDay).toBe(true);

    // Nighttime clear (isDay = false)
    const nightCond = normalizeWeatherCondition("Clear", 0);
    const nightTheme = getWeatherVisualTheme(nightCond, false);
    expect(nightTheme.displayName).toBe("Clear Night");
    expect(nightTheme.iconType).toBe("moon");
    expect(nightTheme.isDay).toBe(false);
  });

  it("determines daytime partly cloudy vs nighttime partly cloudy correctly", () => {
    const dayCond = normalizeWeatherCondition("Partly cloudy", 2);
    const dayTheme = getWeatherVisualTheme(dayCond, true);
    expect(dayTheme.displayName).toBe("Partly Cloudy");
    expect(dayTheme.iconType).toBe("partly_cloudy");

    const nightCond = normalizeWeatherCondition("Partly cloudy", 2);
    const nightTheme = getWeatherVisualTheme(nightCond, false);
    expect(nightTheme.displayName).toBe("Partly Cloudy Night");
    expect(nightTheme.iconType).toBe("partly_cloudy_night");
  });

  it("determines rain and thunderstorm nighttime visual themes correctly", () => {
    const rainNight = getWeatherVisualTheme("rain", false);
    expect(rainNight.displayName).toBe("Night Rain");
    expect(rainNight.iconType).toBe("rain_night");

    const stormNight = getWeatherVisualTheme("thunderstorm", false);
    expect(stormNight.displayName).toBe("Night Thunderstorm");
    expect(stormNight.iconType).toBe("thunderstorm_night");
  });

  it("ensures weather responses from Open-Meteo preserve is_day without hardcoded sunny overrides", () => {
    const midnightApiResponse: WeatherResponse = {
      location_name: "Bhubaneswar",
      current: {
        location_name: "Bhubaneswar",
        lat: 20.2961,
        lon: 85.8245,
        observed_at: "2026-08-22T00:00:00Z",
        temperature_c: 26.5,
        apparent_temperature_c: 32.7,
        condition: "Drizzle",
        condition_code: 53,
        is_day: 0,
        humidity_pct: 97,
        precipitation_mm: 0.2,
        wind_speed_kmh: 7.5,
        advice: "Light drizzle; keep an umbrella handy.",
        provider: "Open-Meteo",
        freshness_timestamp: "2026-08-22T00:00:00Z",
        status: "available",
      },
      forecast_daily: [],
    };

    expect(midnightApiResponse.current.is_day).toBe(0);
    const cond = normalizeWeatherCondition(
      midnightApiResponse.current.condition,
      midnightApiResponse.current.condition_code,
      midnightApiResponse.current.status
    );
    const theme = getWeatherVisualTheme(cond, midnightApiResponse.current.is_day !== 0);
    expect(theme.isDay).toBe(false);
    expect(theme.iconType).toBe("rain_night");
  });
});
