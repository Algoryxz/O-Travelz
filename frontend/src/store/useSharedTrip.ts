import { useState, useEffect, useCallback } from "react";
import { apiClient, ApiError } from "../api/client";
import type { PublicSharedTripResponse } from "../types/api";

export interface UseSharedTripState {
  sharedTrip: PublicSharedTripResponse | null;
  isLoading: boolean;
  error: string | null;
  errorCode?: string | null;
}

export function useSharedTrip(shareId: string | null) {
  const [state, setState] = useState<UseSharedTripState>({
    sharedTrip: null,
    isLoading: Boolean(shareId),
    error: null,
    errorCode: null,
  });

  const fetchSharedTrip = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, errorCode: null }));
    try {
      const data = await apiClient.getSharedTrip(id);
      setState({
        sharedTrip: data,
        isLoading: false,
        error: null,
        errorCode: null,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setState({
            sharedTrip: null,
            isLoading: false,
            error: "This shared itinerary link was not found or has expired.",
            errorCode: "not_found",
          });
        } else if (err.status === 429) {
          setState({
            sharedTrip: null,
            isLoading: false,
            error: "Too many requests. Please wait a moment before trying again.",
            errorCode: "rate_limited",
          });
        } else {
          setState({
            sharedTrip: null,
            isLoading: false,
            error: err.message || "Failed to load shared trip.",
            errorCode: err.code || "unknown",
          });
        }
      } else {
        setState({
          sharedTrip: null,
          isLoading: false,
          error: "A network error occurred while loading this shared trip.",
          errorCode: "network_error",
        });
      }
    }
  }, []);

  useEffect(() => {
    if (shareId) {
      fetchSharedTrip(shareId);
    } else {
      setState({
        sharedTrip: null,
        isLoading: false,
        error: null,
        errorCode: null,
      });
    }
  }, [shareId, fetchSharedTrip]);

  return {
    ...state,
    refetch: () => {
      if (shareId) fetchSharedTrip(shareId);
    },
  };
}
