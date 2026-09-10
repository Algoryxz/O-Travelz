/**
 * O-Travelz Service Worker
 * Version: v1.0.0
 * Lightweight, dependency-free offline shell and static asset caching.
 * Enforces strict exclusions for authenticated, cloud sync, and AI endpoints.
 */

const STATIC_CACHE_NAME = "otravelz-static-v1.0.0";
const IMAGE_CACHE_NAME = "otravelz-images-v1.0.0";
const MAX_IMAGE_ENTRIES = 80;

// Essential offline application shell
const CORE_SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/logo.jpeg",
  "/icon.svg",
  "/icon-maskable.svg",
];

// Endpoints that MUST NEVER be cached (all dynamic APIs)
const NEVER_CACHE_URL_PATTERNS = [
  /\/auth\//,                  // OAuth, session check, login, logout
  /\/api\/v1\/sync\//,          // Cloud sync saved-places and trips
  /\/api\/v1\/trips\/share/,    // Share snapshot generation mutation
  /\/ai\//,                     // AI planning and grounded conversation
  /^\/location(\/|$)/,          // Dynamic location and reverse geocoding
  /^\/transport(\/|$)/,         // Realtime Mo Bus and transit routing
  /^\/weather(\/|$)/,           // Live weather updates
  /^\/places(\/|$)/,            // Destinations and places API
  /^\/itinerary(\/|$)/,         // Dynamic itinerary engine
  /^\/map(\/|$)/,               // Dynamic map projections
  /^\/health(\/|$)/,
  /^\/ready(\/|$)/,
];

/**
 * Checks if a given request URL should bypass the cache completely.
 */
function shouldBypassCache(url) {
  return NEVER_CACHE_URL_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

/**
 * Checks if a request is for an image asset.
 */
function isImageRequest(request, url) {
  if (request.destination === "image") return true;
  if (url.pathname.startsWith("/static/images/")) return true;
  return /\.(webp|png|jpe?g|svg|gif|avif)$/i.test(url.pathname);
}

/**
 * Checks if a request is for static code/asset bundles.
 */
function isStaticAssetRequest(url) {
  return /\.(js|css|woff2?|ttf|eot|json)$/i.test(url.pathname) || url.pathname.startsWith("/assets/");
}

/**
 * Prunes cache entries if the total count exceeds the limit.
 */
async function pruneCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      // Delete oldest entry
      await cache.delete(keys[0]);
      await pruneCache(cacheName, maxItems);
    }
  } catch {
    // Non-fatal cache maintenance failure
  }
}

// ==========================================================================
// Service Worker Lifecycle Events
// ==========================================================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(CORE_SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Pre-cache error during install:", err);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ==========================================================================
// Network Interception & Caching Strategy
// ==========================================================================

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET requests; pass all mutations straight through to network
  if (request.method !== "GET") {
    return;
  }

  // 2. Strict Exclusions: Auth, Cloud Sync, AI, and Share mutations
  if (shouldBypassCache(url)) {
    return;
  }

  // 3. Navigation Requests: Network-first with cached index.html offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/index.html");
          if (fallback) return fallback;
          return new Response("O-Travelz is offline. Please check your connection.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        })
    );
    return;
  }

  // 4. Destination & Category Images: Stale-While-Revalidate with size-bounded cache
  if (isImageRequest(request, url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
                await cache.put(request, clone);
                pruneCache(IMAGE_CACHE_NAME, MAX_IMAGE_ENTRIES);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 5. Static Assets (JS, CSS, fonts, icons): Cache-First with Network Fallback
  if (isStaticAssetRequest(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                const clone = networkResponse.clone();
                caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, clone));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 6. Default Network Fallback (Network first, fall back to cache for offline)
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached || new Response("Network unavailable", { status: 503 });
    })
  );
});
