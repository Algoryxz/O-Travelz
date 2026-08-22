/**
 * Safe client-side registration for the O-Travelz Service Worker.
 * Ensures offline shell caching and graceful degradation without blocking render.
 */

export interface ServiceWorkerRegistrationOptions {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export function registerServiceWorker(options?: ServiceWorkerRegistrationOptions): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  // Register when the window finishes initial loading
  window.addEventListener("load", () => {
    const swUrl = "/sw.js";

    navigator.serviceWorker
      .register(swUrl, { scope: "/" })
      .then((registration) => {
        if (options?.onSuccess) {
          options.onSuccess(registration);
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New content available
                if (options?.onUpdate) {
                  options.onUpdate(registration);
                }
              } else {
                // Content cached for offline use
                if (options?.onSuccess) {
                  options.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn("[PWA] Service Worker registration failed:", error);
        if (options?.onError) {
          options.onError(error instanceof Error ? error : new Error(String(error)));
        }
      });
  });
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      return await registration.unregister();
    }
    return false;
  } catch (err) {
    console.warn("[PWA] Service Worker unregister error:", err);
    return false;
  }
}
