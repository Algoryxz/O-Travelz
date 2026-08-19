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

      // Extract unique place IDs across all days and stops
      const seenPlaceIds = new Set<string>();
      const requestedFeatures: MapProjectionFeatureRequest[] = [];

      for (const day of itinerary.days) {
        for (const stop of day.stops) {
          if (stop.place?.id && !seenPlaceIds.has(stop.place.id)) {
            seenPlaceIds.add(stop.place.id);
            if (isUUID(stop.place.id)) {
              requestedFeatures.push({
                entity: "place",
                id: stop.place.id,
              });
            }
          }
        }
      }

      // Extract requested hop contexts
      const requestedHops: RequestedHopContext[] = [];
      for (const day of itinerary.days) {
        for (const hop of day.hops) {
          requestedHops.push({
            day_number: day.day_number,
            hop,
          });
        }
      }

      // If no valid UUID features exist to request, do not trigger an empty 422 request
      if (requestedFeatures.length === 0) {
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
    clearError,
    reset,
  };
}
