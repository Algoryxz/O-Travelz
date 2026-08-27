import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";
import { buildApiUrl } from "../api/config";
import type { AuthUser } from "../types/api";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

let globalAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const listeners = new Set<(state: AuthState) => void>();

function updateAuthState(newState: Partial<AuthState>) {
  globalAuthState = { ...globalAuthState, ...newState };
  listeners.forEach((listener) => listener(globalAuthState));
}

export function setAuthStateForTesting(newState: Partial<AuthState>) {
  updateAuthState(newState);
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(globalAuthState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const checkAuth = useCallback(async () => {
    updateAuthState({ isLoading: true, error: null });

    // 1. Check if an auth_ticket exists in URL fragment or search params (post-OAuth redirect)
    let ticket: string | null = null;
    if (typeof window !== "undefined") {
      try {
        const hash = window.location.hash;
        if (hash && hash.includes("auth_ticket=")) {
          const hashParams = new URLSearchParams(hash.replace(/^#\/?/, ""));
          ticket = hashParams.get("auth_ticket");
        }
        if (!ticket && window.location.search.includes("auth_ticket=")) {
          const searchParams = new URLSearchParams(window.location.search);
          ticket = searchParams.get("auth_ticket");
        }

        // Immediately scrub the ticket from the URL to keep history clean and prevent leakage
        if (ticket) {
          let cleanHash = window.location.hash;
          if (cleanHash.includes("auth_ticket=")) {
            const params = new URLSearchParams(cleanHash.replace(/^#\/?/, ""));
            params.delete("auth_ticket");
            const remaining = params.toString();
            cleanHash = remaining ? `#${remaining}` : "";
          }
          const searchParams = new URLSearchParams(window.location.search);
          searchParams.delete("auth_ticket");
          const remainingSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
          const cleanUrl = `${window.location.pathname}${remainingSearch}${cleanHash}`;
          window.history.replaceState(null, "", cleanUrl || window.location.pathname);
        }
      } catch {
        // ignore URL scrubbing errors
      }
    }

    try {
      let res;
      if (ticket) {
        res = await apiClient.exchangeAuthTicket(ticket);
      } else {
        res = await apiClient.getAuthMe();
      }

      if (res.authenticated && res.user) {
        updateAuthState({
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        updateAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      updateAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to verify authentication",
      });
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    // Navigate to Google OAuth start endpoint, respecting cross-domain API URL
    if (typeof window !== "undefined") {
      window.location.href = buildApiUrl("/auth/google/start");
    }
  }, []);

  const logout = useCallback(async () => {
    updateAuthState({ isLoading: true });
    try {
      await apiClient.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      // Local user state becomes anonymous; localStorage remains intact
      updateAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Initial check on mount if still loading
  useEffect(() => {
    if (globalAuthState.isLoading) {
      checkAuth();
    }
  }, [checkAuth]);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    checkAuth,
    loginWithGoogle,
    logout,
  };
}
