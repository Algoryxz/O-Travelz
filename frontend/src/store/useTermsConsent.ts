import { useState, useEffect, useCallback } from "react";

export const CURRENT_TERMS_VERSION = "2026-08-21-v1";
export const TERMS_STORAGE_KEY = "otz_terms_accepted_version";
export const TERMS_TIMESTAMP_KEY = "otz_terms_accepted_at";

/**
 * Checks synchronously whether the current Terms & Privacy version has been accepted.
 */
export function checkTermsConsentAccepted(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const storedVersion = window.localStorage.getItem(TERMS_STORAGE_KEY);
    return storedVersion === CURRENT_TERMS_VERSION;
  } catch {
    return false;
  }
}

/**
 * Saves the versioned acceptance record to localStorage without personal data.
 */
export function saveTermsConsentAccepted(version: string = CURRENT_TERMS_VERSION): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(TERMS_STORAGE_KEY, version);
    window.localStorage.setItem(TERMS_TIMESTAMP_KEY, new Date().toISOString());
  } catch (e) {
    console.warn("Unable to persist terms consent in localStorage:", e);
  }
}

/**
 * Clears stored terms acceptance for testing or user-initiated reset.
 */
export function clearTermsConsent(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(TERMS_STORAGE_KEY);
    window.localStorage.removeItem(TERMS_TIMESTAMP_KEY);
  } catch (e) {
    console.warn("Unable to clear terms consent from localStorage:", e);
  }
}

/**
 * React hook for reactive Terms & Privacy consent gate state.
 */
export function useTermsConsent(initialOverride?: boolean) {
  const [hasAccepted, setHasAccepted] = useState<boolean>(() => {
    if (typeof initialOverride === "boolean") {
      return initialOverride;
    }
    return checkTermsConsentAccepted();
  });

  useEffect(() => {
    if (typeof initialOverride === "boolean") {
      setHasAccepted(initialOverride);
    } else {
      setHasAccepted(checkTermsConsentAccepted());
    }
  }, [initialOverride]);

  const acceptConsent = useCallback((customVersion: string = CURRENT_TERMS_VERSION) => {
    saveTermsConsentAccepted(customVersion);
    setHasAccepted(true);
  }, []);

  const revokeConsent = useCallback(() => {
    clearTermsConsent();
    setHasAccepted(false);
  }, []);

  return {
    hasAccepted,
    acceptConsent,
    revokeConsent,
    currentVersion: CURRENT_TERMS_VERSION,
    storageKey: TERMS_STORAGE_KEY,
  };
}
