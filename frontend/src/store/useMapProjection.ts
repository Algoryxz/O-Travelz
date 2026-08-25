import { useState, useCallback } from "react";
import { apiClient as defaultApiClient, ApiClient } from "../api/client";
import type {
  ItineraryPlanResponse,
  MapProjectionHTTPRequest,
  MapProjectionResponse,
  MapProjectionFeatureRequest,
  RequestedHopContext,
} from "../api/contracts";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

export interface MapProjectionHook {
  projection: MapProjectionResponse | null;
  isLoading: boolean;
  error: unknown | null;
  fetchProjection: (
    itinerary: ItineraryPlanResponse,
    customClient?: ApiClient
  ) => Promise<MapProjectionResponse | null>;
  fetchPlacesProjection: (
    placeIds?: string[],
    customClient?: ApiClient
  ) => Promise<MapProjectionResponse | null>;
  clearError: () => void;
  reset: () => void;
}

export function useMapProjection(): MapProjectionHook {
  const [projection, setProjection] = useState<MapProjectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetchProjection = useCallback(
    async (
      itinerary: ItineraryPlanResponse,
      customClient?: ApiClient
    ): Promise<MapProjectionResponse | null> => {
      const client = customClient ?? defaultApiClient;

      // Extract unique place IDs across all days and stops that are valid canonical UUIDs
      const seenPlaceIds = new Set<string>();
      const requestedFeatures: MapProjectionFeatureRequest[] = [];

      for (const day of itinerary.days) {
        for (const stop of day.stops) {
          const placeId = stop.place?.id ? String(stop.place.id).trim() : "";
          if (placeId && isUUID(placeId) && !seenPlaceIds.has(placeId)) {
            seenPlaceIds.add(placeId);
            requestedFeatures.push({
              entity: "place",
              id: placeId,
            });
          }
        }
      }

      // Extract hops
      const requestedHops: RequestedHopContext[] = [];
      for (const day of itinerary.days) {
        for (const hop of day.hops) {
          requestedHops.push({
            day_number: day.day_number,
            hop,
          });
        }
      }

      if (requestedFeatures.length === 0 && requestedHops.length === 0) {
        setProjection(null);
        setIsLoading(false);
        setError(null);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const payload: MapProjectionHTTPRequest = {
          requested_features: requestedFeatures,
          requested_hops: requestedHops,
        };
        const result = await client.getMapProjection(payload);
        setProjection(result);
        setIsLoading(false);
        return result;
      } catch (err) {
        setError(err);
        setProjection(null);
        setIsLoading(false);
        return null;
      }
    },
    []
  );

  const fetchPlacesProjection = useCallback(
    async (
      placeIds: string[] = [],
      customClient?: ApiClient
    ): Promise<MapProjectionResponse | null> => {
      const client = customClient ?? defaultApiClient;

      // Strictly filter to valid canonical UUID database identifiers
      const validPlaceIds = Array.from(new Set(placeIds))
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter((id) => id.length > 0 && isUUID(id));

      if (validPlaceIds.length === 0) {
        setProjection(null);
        setIsLoading(false);
        setError(null);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const payload: MapProjectionHTTPRequest = {
          requested_features: validPlaceIds.map((id) => ({
            entity: "place",
            id,
          })),
          requested_hops: [],
        };
        const result = await client.getMapProjection(payload);
        setProjection(result);
        setIsLoading(false);
        return result;
      } catch (err) {
        setError(err);
        setProjection(null);
        setIsLoading(false);
        return null;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setProjection(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    projection,
    isLoading,
    error,
    fetchProjection,
    fetchPlacesProjection,
    clearError,
    reset,
  };
}
