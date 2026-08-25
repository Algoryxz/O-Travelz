import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";
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
    try {
      const res = await apiClient.getAuthMe();
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
      const apiBase = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "";
      window.location.href = `${apiBase}/auth/google/start`;
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
