import { useState, useEffect, useCallback, useRef } from "react";
import type { WeatherResponse } from "../api/contracts";
import { apiClient as defaultApiClient, ApiClient } from "../api/client";

export interface UseWeatherOptions {
  refreshIntervalMs?: number; // Default 5 minutes (300,000ms)
}

export interface UseWeatherResult {
  weather: WeatherResponse | null;
  isLoading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
}

const DEFAULT_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useWeather(
  locationName: string = "Bhubaneswar",
  coords?: { lat: number; lon: number },
  client?: ApiClient,
  options?: UseWeatherOptions
): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);

  const isFetchingRef = useRef<boolean>(false);
  const refreshInterval = options?.refreshIntervalMs ?? DEFAULT_REFRESH_INTERVAL_MS;

  const fetchWeather = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const api = client ?? defaultApiClient;
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getWeather({
        location_name: locationName,
        lat: coords?.lat,
        lon: coords?.lon,
      });
      setWeather(data);
    } catch (err) {
      setError(err);
      // Truthful unavailable fallback: NEVER hardcode 28°C or 0°C
      setWeather({
        location_name: locationName,
        current: {
          location_name: locationName,
          lat: coords?.lat ?? 20.2961,
          lon: coords?.lon ?? 85.8245,
          observed_at: new Date().toISOString(),
          temperature_c: null,
          apparent_temperature_c: null,
          condition: "Unavailable",
          condition_code: null,
          is_day: null,
          advice: "Weather data is temporarily unavailable. Check local forecasts before traveling.",
          provider: "Open-Meteo",
          freshness_timestamp: new Date().toISOString(),
          status: "unavailable",
          error_reason: err instanceof Error ? err.message : String(err),
        },
        forecast_daily: [],
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [locationName, coords?.lat, coords?.lon, client]);

  // Initial fetch on mount and whenever locationName / coords change
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Periodic automatic live refresh (e.g. every 5 minutes)
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      // Only auto-refresh if tab is visible/active to prevent unnecessary hammering
      if (typeof document === "undefined" || !document.hidden) {
        fetchWeather();
      }
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchWeather, refreshInterval]);

  return {
    weather,
    isLoading,
    error,
    refetch: fetchWeather,
  };
}
