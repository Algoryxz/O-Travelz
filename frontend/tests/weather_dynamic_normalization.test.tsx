import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import {
  normalizeWeatherCondition,
  getWeatherVisualTheme,
  type NormalizedWeatherCondition,
} from "../src/utils/weatherNormalizer";
import { AnimatedWeatherIcon } from "../src/components/weather/AnimatedWeatherIcon";
import { WeatherCard } from "../src/components/weather/WeatherCard";
import type { WeatherResponse } from "../src/types/api";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Weather Dynamic Normalization & Visual System", () => {
  describe("WMO Weather Code Normalization", () => {
    it("maps WMO clear sky codes (0, 1) to 'clear'", () => {
      expect(normalizeWeatherCondition("Clear sky", 0)).toBe("clear");
      expect(normalizeWeatherCondition("Mainly clear", 1)).toBe("clear");
    });

    it("maps WMO code 2 to 'partly_cloudy'", () => {
      expect(normalizeWeatherCondition("Partly cloudy", 2)).toBe("partly_cloudy");
    });

    it("maps WMO code 3 to 'cloudy'", () => {
      expect(normalizeWeatherCondition("Overcast", 3)).toBe("cloudy");
    });

    it("maps WMO fog codes (45, 48) to 'fog'", () => {
      expect(normalizeWeatherCondition("Fog", 45)).toBe("fog");
      expect(normalizeWeatherCondition("Rime fog", 48)).toBe("fog");
    });

    it("maps WMO rain and drizzle codes (51, 61, 80) to 'rain'", () => {
      expect(normalizeWeatherCondition("Light drizzle", 51)).toBe("rain");
      expect(normalizeWeatherCondition("Moderate rain", 61)).toBe("rain");
      expect(normalizeWeatherCondition("Rain shower", 80)).toBe("rain");
    });

    it("maps WMO heavy rain codes (65, 82) to 'heavy_rain'", () => {
      expect(normalizeWeatherCondition("Heavy rain", 65)).toBe("heavy_rain");
      expect(normalizeWeatherCondition("Violent rain shower", 82)).toBe("heavy_rain");
    });

    it("maps WMO thunderstorm codes (95, 96, 99) to 'thunderstorm'", () => {
      expect(normalizeWeatherCondition("Thunderstorm", 95)).toBe("thunderstorm");
      expect(normalizeWeatherCondition("Thunderstorm with hail", 99)).toBe("thunderstorm");
    });

    it("maps WMO snow codes (71, 75, 85) to 'snow'", () => {
      expect(normalizeWeatherCondition("Slight snow", 71)).toBe("snow");
      expect(normalizeWeatherCondition("Heavy snow", 75)).toBe("snow");
    });
  });

  describe("Heterogeneous Condition String Normalization", () => {
    it("normalizes diverse string descriptions correctly", () => {
      expect(normalizeWeatherCondition("Sunny")).toBe("clear");
      expect(normalizeWeatherCondition("Scattered Clouds")).toBe("partly_cloudy");
      expect(normalizeWeatherCondition("Heavy Monsoon Downpour")).toBe("heavy_rain");
      expect(normalizeWeatherCondition("Lightning & Thunder")).toBe("thunderstorm");
      expect(normalizeWeatherCondition("Dense Morning Mist")).toBe("fog");
      expect(normalizeWeatherCondition("Atmospheric Haze")).toBe("haze");
      expect(normalizeWeatherCondition("Blizzard / Sleet")).toBe("snow");
      expect(normalizeWeatherCondition("Unknown condition")).toBe("unknown");
    });

    it("returns 'unknown' for unavailable status or null input", () => {
      expect(normalizeWeatherCondition("Clear", 0, "unavailable")).toBe("unknown");
      expect(normalizeWeatherCondition(null, null)).toBe("unknown");
    });
  });

  describe("Adaptive Visual Themes & Tokens", () => {
    const allConditions: NormalizedWeatherCondition[] = [
      "clear",
      "partly_cloudy",
      "cloudy",
      "rain",
      "heavy_rain",
      "thunderstorm",
      "fog",
      "haze",
      "snow",
      "unknown",
    ];

    it("provides complete visual tokens and aria labels for every normalized condition", () => {
      allConditions.forEach((cond) => {
        const theme = getWeatherVisualTheme(cond);
        expect(theme.condition).toBe(cond);
        expect(theme.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(theme.cardBgGradient).toBeTruthy();
        expect(theme.cardBorderClass).toBeTruthy();
        expect(theme.badgeBg).toBeTruthy();
        expect(theme.defaultAdvice).toBeTruthy();
        expect(theme.ariaLabel).toBeTruthy();
      });
    });
  });

  describe("Animated Weather Icon Component", () => {
    it("renders corresponding animated icon for each daytime condition", () => {
      const htmlSun = renderClean(<AnimatedWeatherIcon condition="clear" isDay={true} size={48} />);
      expect(htmlSun).toContain('data-testid="animated-weather-icon-sun"');

      const htmlPartly = renderClean(<AnimatedWeatherIcon condition="partly_cloudy" isDay={true} size={48} />);
      expect(htmlPartly).toContain('data-testid="animated-weather-icon-partly-cloudy"');

      const htmlCloud = renderClean(<AnimatedWeatherIcon condition="cloudy" isDay={true} size={48} />);
      expect(htmlCloud).toContain('data-testid="animated-weather-icon-cloud"');

      const htmlRain = renderClean(<AnimatedWeatherIcon condition="rain" isDay={true} size={48} />);
      expect(htmlRain).toContain('data-testid="animated-weather-icon-rain"');

      const htmlHeavyRain = renderClean(<AnimatedWeatherIcon condition="heavy_rain" isDay={true} size={48} />);
      expect(htmlHeavyRain).toContain('data-testid="animated-weather-icon-heavy-rain"');

      const htmlThunder = renderClean(<AnimatedWeatherIcon condition="thunderstorm" isDay={true} size={48} />);
      expect(htmlThunder).toContain('data-testid="animated-weather-icon-thunderstorm"');

      const htmlFog = renderClean(<AnimatedWeatherIcon condition="fog" isDay={true} size={48} />);
      expect(htmlFog).toContain('data-testid="animated-weather-icon-fog"');

      const htmlHaze = renderClean(<AnimatedWeatherIcon condition="haze" isDay={true} size={48} />);
      expect(htmlHaze).toContain('data-testid="animated-weather-icon-haze"');

      const htmlSnow = renderClean(<AnimatedWeatherIcon condition="snow" isDay={true} size={48} />);
      expect(htmlSnow).toContain('data-testid="animated-weather-icon-snow"');

      const htmlDefault = renderClean(<AnimatedWeatherIcon condition="unknown" isDay={true} size={48} />);
      expect(htmlDefault).toContain('data-testid="animated-weather-icon-default"');
    });

    it("renders corresponding animated night icon for nighttime conditions (isDay=false)", () => {
      const htmlMoon = renderClean(<AnimatedWeatherIcon condition="clear" isDay={false} size={48} />);
      expect(htmlMoon).toContain('data-testid="animated-weather-icon-moon"');

      const htmlPartlyNight = renderClean(<AnimatedWeatherIcon condition="partly_cloudy" isDay={false} size={48} />);
      expect(htmlPartlyNight).toContain('data-testid="animated-weather-icon-partly-cloudy-night"');

      const htmlCloudNight = renderClean(<AnimatedWeatherIcon condition="cloudy" isDay={false} size={48} />);
      expect(htmlCloudNight).toContain('data-testid="animated-weather-icon-cloud-night"');

      const htmlRainNight = renderClean(<AnimatedWeatherIcon condition="rain" isDay={false} size={48} />);
      expect(htmlRainNight).toContain('data-testid="animated-weather-icon-rain-night"');

      const htmlThunderNight = renderClean(<AnimatedWeatherIcon condition="thunderstorm" isDay={false} size={48} />);
      expect(htmlThunderNight).toContain('data-testid="animated-weather-icon-thunderstorm-night"');
    });
  });

  describe("WeatherCard Data-Driven UX", () => {
    const mockWeather: WeatherResponse = {
      location_name: "Puri",
      current: {
        location_name: "Puri",
        lat: 19.8135,
        lon: 85.8312,
        observed_at: "2026-08-21T12:00:00Z",
        temperature_c: 31.4,
        apparent_temperature_c: 36.2,
        condition: "Rain Showers",
        condition_code: 80,
        is_day: 1,
        humidity_pct: 82,
        wind_speed_kmh: 18.5,
        precipitation_probability_pct: 75,
        advice: "Coastal showers active along golden beach.",
        provider: "Open-Meteo",
        freshness_timestamp: "2026-08-21T12:00:00Z",
        status: "available",
      },
      forecast_daily: [],
    };

    it("renders dynamic weather data without hardcoded Bhubaneswar or 28°C", () => {
      const html = renderClean(
        <WeatherCard
          locationName="Puri"
          weather={mockWeather}
          isLoading={false}
          error={null}
        />
      );

      expect(html).toContain("LOCAL WEATHER · PURI");
      expect(html).toContain("31°C");
      expect(html).toContain("Rain Showers");
      expect(html).toContain("Humidity");
      expect(html).toContain("82%");
      expect(html).toContain("19 km/h");
      expect(html).toContain("75%");
      expect(html).toContain("Coastal showers active along golden beach.");
    });

    it("renders truthful nighttime visual for midnight Bhubaneswar weather (is_day=0)", () => {
      const midnightBbsr: WeatherResponse = {
        location_name: "Bhubaneswar",
        current: {
          location_name: "Bhubaneswar",
          lat: 20.2961,
          lon: 85.8245,
          observed_at: "2026-08-22T00:00:00Z",
          temperature_c: 26.5,
          apparent_temperature_c: 32.0,
          condition: "Clear",
          condition_code: 0,
          is_day: 0,
          humidity_pct: 95,
          wind_speed_kmh: 8.0,
          advice: "Clear starlit skies across Odisha.",
          provider: "Open-Meteo",
          freshness_timestamp: "2026-08-22T00:00:00Z",
          status: "available",
        },
        forecast_daily: [],
      };

      const html = renderClean(
        <WeatherCard
          locationName="Bhubaneswar"
          weather={midnightBbsr}
          isLoading={false}
          error={null}
        />
      );

      expect(html).toContain("LOCAL WEATHER · BHUBANESWAR");
      expect(html).toContain("27°C"); // 26.5 rounded
      expect(html).toContain("Clear Night");
      expect(html).toContain('data-testid="animated-weather-icon-moon"');
      expect(html).not.toContain('data-testid="animated-weather-icon-sun"');
    });

    it("does NOT render fake 0°C when weather data is missing or unavailable", () => {
      const missingTempWeather: WeatherResponse = {
        location_name: "Cuttack",
        current: {
          location_name: "Cuttack",
          lat: 20.4625,
          lon: 85.8828,
          observed_at: "2026-08-22T00:00:00Z",
          temperature_c: null,
          condition: "Unavailable",
          is_day: null,
          provider: "Open-Meteo",
          freshness_timestamp: "2026-08-22T00:00:00Z",
          status: "unavailable",
        },
        forecast_daily: [],
      };

      const html = renderClean(
        <WeatherCard
          locationName="Cuttack"
          weather={missingTempWeather}
          isLoading={false}
          error={null}
        />
      );

      expect(html).toContain('data-testid="weather-banner-error"');
      expect(html).toContain("Weather Data Temporarily Unavailable");
      expect(html).not.toContain("0°C");
    });

    it("renders loading skeleton when loading", () => {
      const html = renderClean(
        <WeatherCard
          locationName="Konark"
          weather={null}
          isLoading={true}
          error={null}
        />
      );

      expect(html).toContain('data-testid="weather-banner-loading"');
      expect(html).not.toContain("31°C");
      expect(html).not.toContain("0°C");
    });

    it("renders error state on API failure", () => {
      const html = renderClean(
        <WeatherCard
          locationName="Sambalpur"
          weather={null}
          isLoading={false}
          error={new Error("Network Error")}
        />
      );

      expect(html).toContain('data-testid="weather-banner-error"');
      expect(html).toContain("Weather Data Temporarily Unavailable");
      expect(html).not.toContain("0°C");
    });
  });
});
