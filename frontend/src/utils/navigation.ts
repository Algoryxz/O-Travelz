/**
 * O-Travelz URL Synchronization and Navigation Layer
 *
 * Provides bidirectional synchronization between the application activeTab state
 * and native browser URL hash routes (#discover, #destinations, #map, #plan, #saved).
 *
 * Preserves browser back/forward history navigation and deep linking without
 * introducing heavyweight external router dependencies.
 */

export type AppNavTab =
  | "discover"
  | "destinations"
  | "map"
  | "plan"
  | "saved"
  | "revisit"
  | "category"
  | "settings"
  | "privacy"
  | "terms"
  | "contact"
  | "shared";

export const SUPPORTED_HASH_TABS: Record<string, AppNavTab> = {
  discover: "discover",
  destinations: "destinations",
  map: "map",
  plan: "plan",
  saved: "saved",
  revisit: "revisit",
  privacy: "privacy",
  terms: "terms",
  contact: "contact",
  shared: "shared",
};

/**
 * Normalizes any URL hash string by removing leading '#', '/', '!',
 * trimming whitespace, and converting to lowercase.
 *
 * Examples:
 *   "#map"    -> "map"
 *   "/#map"   -> "map"
 *   "#/map"   -> "map"
 *   "##plan"  -> "plan"
 *   "#!saved" -> "saved"
 *   ""        -> ""
 */
export function normalizeHash(rawHash: string | null | undefined): string {
  if (!rawHash) return "";
  let clean = rawHash.trim().toLowerCase();
  // Strip leading question marks, hashes, slashes, and exclamation marks
  clean = clean.replace(/^[#/?!]+/, "");
  // Strip trailing slashes
  clean = clean.replace(/\/+$/, "");
  return clean;
}

/**
 * Extracts a shareable trip snapshot identifier from a URL hash string.
 * Supports #trip/shared/{share_id} and #shared/{share_id}.
 */
export function extractShareIdFromHash(rawHash: string | null | undefined): string | null {
  if (!rawHash) return null;
  const clean = normalizeHash(rawHash);
  const match = clean.match(/(?:trip\/)?shared\/([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

/**
 * Resolves an application tab from a browser URL hash string.
 * Unsupported or malformed hashes safely fall back to "discover".
 */
export function getTabFromHash(rawHash: string | null | undefined): AppNavTab {
  if (extractShareIdFromHash(rawHash)) {
    return "shared";
  }
  const normalized = normalizeHash(rawHash);
  if (!normalized) return "discover";

  if (SUPPORTED_HASH_TABS[normalized]) {
    return SUPPORTED_HASH_TABS[normalized];
  }

  return "discover";
}

/**
 * Returns the canonical URL hash string for a given application tab.
 */
export function getHashForTab(tab: AppNavTab | string): string {
  switch (tab) {
    case "destinations":
      return "#destinations";
    case "map":
      return "#map";
    case "plan":
      return "#plan";
    case "saved":
      return "#saved";
    case "revisit":
      return "#saved";
    case "category":
      return "#destinations";
    case "privacy":
      return "#privacy";
    case "terms":
      return "#terms";
    case "contact":
      return "#contact";
    case "shared":
      return "#shared";
    case "discover":
    default:
      return "#discover";
  }
}

/**
 * Checks whether a given raw hash corresponds to a valid, supported tab.
 */
export function isValidTabHash(rawHash: string | null | undefined): boolean {
  if (extractShareIdFromHash(rawHash)) return true;
  const normalized = normalizeHash(rawHash);
  return Boolean(normalized && SUPPORTED_HASH_TABS[normalized]);
}

/**
 * Synchronizes the current tab to the browser URL hash using pushState or replaceState.
 * Avoids duplicate history entries and avoids triggering unnecessary state changes.
 */
export function syncTabToUrl(
  tab: AppNavTab | string,
  mode: "push" | "replace" = "push"
): void {
  if (typeof window === "undefined") return;

  const targetHash = getHashForTab(tab);
  const currentNormalized = normalizeHash(window.location.hash);
  const targetNormalized = normalizeHash(targetHash);

  if (currentNormalized === targetNormalized) {
    return;
  }

  const newUrl = `${window.location.pathname}${window.location.search}${targetHash}`;

  if (mode === "replace") {
    window.history.replaceState(null, "", newUrl);
  } else {
    window.history.pushState(null, "", newUrl);
  }
}
