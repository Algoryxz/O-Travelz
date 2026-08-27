/**
 * Canonical API Configuration & URL Resolution for O-Travelz Frontend.
 *
 * Single Source of Truth for:
 * 1. Base URL normalization and validation (strips whitespace, trailing slashes, validates protocol).
 * 2. Safe URL path construction (prevents duplicate slashes, handles relative / absolute environments).
 * 3. Diagnostic error categorization (differentiates DNS/Offline, Timeout/Cold-Start, CORS, HTTP errors).
 */

/**
 * Normalizes a raw URL string by trimming whitespace and stripping trailing slashes.
 * If given a remote domain without a protocol (e.g. 'otravelz-backend.onrender.com'),
 * it automatically prepends 'https://' to avoid treating it as a relative path.
 */
export function normalizeBaseUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  let trimmed = rawUrl.trim();
  if (!trimmed) {
    return "";
  }

  // If protocol-relative or starts without protocol but looks like a full remote domain
  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith("//")) {
      trimmed = `https:${trimmed}`;
    } else if (
      trimmed.includes(".") &&
      !trimmed.startsWith("/") &&
      !trimmed.startsWith("localhost") &&
      !trimmed.startsWith("127.0.0.1")
    ) {
      trimmed = `https://${trimmed}`;
    }
  }

  // Remove all trailing slashes
  trimmed = trimmed.replace(/\/+$/, "");

  // Validate URL syntax if it has a protocol
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const cleanPath = parsed.pathname.replace(/\/+$/, "");
      return `${parsed.origin}${cleanPath}`;
    } catch {
      console.warn(`[O-Travelz Config] Invalid API Base URL format: "${rawUrl}". Falling back to same-origin.`);
      return "";
    }
  }

  return trimmed;
}

/**
 * Resolves the canonical backend API Base URL from environment variables.
 * Checks VITE_API_URL, then VITE_API_BASE_URL, and falls back to empty string (same-origin relative).
 */
export function getApiBaseUrl(): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const candidate = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (candidate) {
      return normalizeBaseUrl(candidate);
    }
  }
  return "";
}

/**
 * Safely constructs a full API URL using a specific or default base URL and an endpoint path.
 * Guarantees:
 * - No double slashes (e.g. `https://api.com//endpoint` -> `https://api.com/endpoint`)
 * - Clean query parameter appending
 * - Works identically with custom remote origins (`https://otravelz-backend.onrender.com`)
 *   or same-origin relative paths (`/location/reverse-geocode`).
 */
export function buildApiUrlWithBase(
  baseUrl: string,
  endpoint: string,
  queryParams?: Record<string, string | number | boolean | null | undefined> | URLSearchParams
): string {
  const cleanBase = normalizeBaseUrl(baseUrl);
  const trimmedEndpoint = (endpoint || "").trim().replace(/^\/+/, "");
  const cleanEndpoint = `/${trimmedEndpoint}`;

  let fullUrl: string;
  if (cleanBase) {
    fullUrl = `${cleanBase}${cleanEndpoint}`;
  } else {
    fullUrl = cleanEndpoint;
  }

  if (queryParams) {
    let paramsString = "";
    if (queryParams instanceof URLSearchParams) {
      paramsString = queryParams.toString();
    } else {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value != null && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      paramsString = searchParams.toString();
    }

    if (paramsString) {
      const separator = fullUrl.includes("?") ? "&" : "?";
      fullUrl = `${fullUrl}${separator}${paramsString}`;
    }
  }

  return fullUrl;
}

/**
 * Safely constructs a full API URL given the default canonical base URL and an endpoint path.
 */
export function buildApiUrl(
  endpoint: string,
  queryParams?: Record<string, string | number | boolean | null | undefined> | URLSearchParams
): string {
  return buildApiUrlWithBase(getApiBaseUrl(), endpoint, queryParams);
}

/**
 * Categorizes a low-level fetch failure into meaningful diagnostic categories.
 */
export type NetworkFailureCategory =
  | "OFFLINE"
  | "DNS_OR_UNRESOLVED"
  | "TIMEOUT_OR_COLD_START"
  | "CORS_OR_NETWORK"
  | "UNKNOWN";

export interface NetworkDiagnostic {
  category: NetworkFailureCategory;
  url: string;
  message: string;
  isRetryable: boolean;
  hint: string;
}

export function diagnoseFetchError(err: unknown, url: string): NetworkDiagnostic {
  const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
  if (isOffline) {
    return {
      category: "OFFLINE",
      url,
      message: "Browser appears to be offline. Please check your internet connection.",
      isRetryable: true,
      hint: "Device is disconnected from the network.",
    };
  }

  const errString = String(err).toLowerCase();
  const isAbort = err instanceof DOMException && err.name === "AbortError";
  const isTimeout = errString.includes("timeout") || errString.includes("timed out") || isAbort;
  const isDns =
    errString.includes("err_name_not_resolved") ||
    errString.includes("enotfound") ||
    errString.includes("getaddrinfo");

  if (isTimeout) {
    return {
      category: "TIMEOUT_OR_COLD_START",
      url,
      message: `Request timed out for ${url}. The backend service may be waking up from sleep.`,
      isRetryable: true,
      hint: "Render free-tier instances take ~30-50s to wake up on first request.",
    };
  }

  if (isDns) {
    return {
      category: "DNS_OR_UNRESOLVED",
      url,
      message: `Unable to resolve server address for ${url}.`,
      isRetryable: true,
      hint: "DNS resolution failed or backend hostname is unreachable.",
    };
  }

  return {
    category: "CORS_OR_NETWORK",
    url,
    message: `Failed to communicate with O-Travelz API at ${url}. Please check your connection.`,
    isRetryable: true,
    hint: "Fetch failed before receiving HTTP response (possible CORS preflight rejection, DNS lag, or service restart).",
  };
}
