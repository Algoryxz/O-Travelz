import { useState, useCallback } from "react";
import { apiClient as defaultApiClient, ApiClient } from "../api/client";
import type { ItineraryPlanResponse, PlanningConstraints } from "../api/contracts";

export interface ItineraryPlannerHook {
  constraints: PlanningConstraints;
  itinerary: ItineraryPlanResponse | null;
  isLoading: boolean;
  error: unknown | null;
  setConstraints: (constraints: PlanningConstraints) => void;
  setItinerary: (itinerary: ItineraryPlanResponse | null) => void;
  planItinerary: (constraintsToUse?: PlanningConstraints, customClient?: ApiClient) => Promise<ItineraryPlanResponse | null>;
  reset: () => void;
  clearError: () => void;
}

export const DEFAULT_CONSTRAINTS: PlanningConstraints = {
  days: 1,
  interests: [],
  start: null,
  dates: null,
};

export function useItineraryPlanner(initialConstraints: PlanningConstraints = DEFAULT_CONSTRAINTS): ItineraryPlannerHook {
  const [constraints, setConstraints] = useState<PlanningConstraints>(initialConstraints);
  const [itinerary, setItinerary] = useState<ItineraryPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);

  const planItinerary = useCallback(
    async (
      constraintsToUse?: PlanningConstraints,
      customClient?: ApiClient
    ): Promise<ItineraryPlanResponse | null> => {
      const activeConstraints = constraintsToUse ?? constraints;
      const client = customClient ?? defaultApiClient;

      setIsLoading(true);
      setError(null);

      try {
        const response = await client.planItinerary(activeConstraints);
        setItinerary(response);
        setConstraints(activeConstraints);
        setIsLoading(false);
        return response;
      } catch (err) {
        setItinerary(null);
        setError(err);
        setIsLoading(false);
        return null;
      }
    },
    [constraints]
  );

  const reset = useCallback(() => {
    setConstraints(initialConstraints);
    setItinerary(null);
    setError(null);
    setIsLoading(false);
  }, [initialConstraints]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    constraints,
    itinerary,
    isLoading,
    error,
    setConstraints,
    setItinerary,
    planItinerary,
    reset,
    clearError,
  };
}
