/**
 * Authoritative Geospatial Utilities for O-Travelz
 *
 * Provides:
 * 1. Strict coordinate validation (rejects null, undefined, NaN, strings, out-of-bounds, (0,0) placeholder).
 * 2. Great-circle Haversine distance calculation in kilometers.
 * 3. Human-readable distance formatting with consistent units.
 * 4. Progressive radius expansion & deterministic nearest-first proximity sorting.
 */

export interface ValidatedCoordinate {
  lat: number;
  lon: number;
}

export interface NearbyPlaceResult<T> {
  places: (T & { distanceKm: number; distanceFormatted: string })[];
  activeRadiusKm: number;
  totalValidPlaces: number;
  isExpanded: boolean;
}

export interface NearbyOptions {
  minResults?: number;
  radii?: number[];
  maxRadiusKm?: number;
}

/**
 * Strict coordinate validation.
 * Rejects:
 * - null / undefined
 * - NaN / non-finite / non-numeric
 * - latitude outside -90..90
 * - longitude outside -180..180
 * - placeholder (0, 0)
 * Note: Does NOT reject legitimate coordinates where only one component is zero.
 */
export function isValidCoordinate(lat: unknown, lon: unknown): boolean {
  if (lat === null || lat === undefined || lon === null || lon === undefined) {
    return false;
  }

  const numLat = typeof lat === "number" ? lat : typeof lat === "string" && lat.trim() !== "" ? Number(lat) : NaN;
  const numLon = typeof lon === "number" ? lon : typeof lon === "string" && lon.trim() !== "" ? Number(lon) : NaN;

  if (!Number.isFinite(numLat) || !Number.isFinite(numLon)) {
    return false;
  }

  if (numLat < -90 || numLat > 90) {
    return false;
  }

  if (numLon < -180 || numLon > 180) {
    return false;
  }

  // Reject the specific placeholder pair (0, 0)
  if (Math.abs(numLat) < 1e-6 && Math.abs(numLon) < 1e-6) {
    return false;
  }

  return true;
}

/**
 * Great-circle distance between two coordinates in kilometers using the Haversine formula.
 * Returns NaN if either coordinate pair is invalid.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return NaN;
  }

  const R = 6371.0; // Earth's mean radius in km
  const toRad = Math.PI / 180.0;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;

  const a =
    Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1.0 - a)));
  return R * c;
}

/**
 * Format distance in kilometers to human-readable format:
 * - < 1 km: "X m away" (e.g. "850 m away")
 * - 1 km to < 10 km: "X.X km away" (e.g. "1.2 km away", "8.4 km away")
 * - >= 10 km: "X km away" (e.g. "42 km away")
 */
export function formatDistance(distKm: number): string {
  if (!Number.isFinite(distKm) || distKm < 0) {
    return "";
  }

  if (distKm < 1) {
    const meters = Math.round(distKm * 1000);
    return `${meters} m away`;
  }

  if (distKm < 10) {
    return `${distKm.toFixed(1)} km away`;
  }

  return `${Math.round(distKm)} km away`;
}

/**
 * Compute nearby places sorted strictly nearest-first with progressive radius expansion.
 *
 * Algorithm:
 * 1. Filter out items without strictly valid coordinates.
 * 2. Calculate Haversine distance for each valid place against user location.
 * 3. Sort all candidates nearest-first (ascending distance).
 * 4. Step through progressive radii [25km, 50km, 100km, 200km, 500km] to find the
 *    smallest radius that contains at least `minResults` places.
 * 5. Return the sorted slice within that radius.
 */
export function getNearbyPlacesWithExpansion<T extends { lat?: number | null; lon?: number | null }>(
  places: T[],
  userLat: number,
  userLon: number,
  options: NearbyOptions = {}
): NearbyPlaceResult<T> {
  const {
    minResults = 4,
    radii = [25, 50, 100, 200, 500],
  } = options;

  if (!isValidCoordinate(userLat, userLon) || !Array.isArray(places) || places.length === 0) {
    return {
      places: [],
      activeRadiusKm: radii[0] || 25,
      totalValidPlaces: 0,
      isExpanded: false,
    };
  }

  // 1. Exclude places without valid coordinates
  const validPlaces: (T & { distanceKm: number; distanceFormatted: string })[] = [];

  for (const p of places) {
    if (isValidCoordinate(p.lat, p.lon)) {
      const dist = calculateHaversineDistanceKm(userLat, userLon, p.lat!, p.lon!);
      if (Number.isFinite(dist)) {
        validPlaces.push({
          ...p,
          distanceKm: dist,
          distanceFormatted: formatDistance(dist),
        });
      }
    }
  }

  // 2. Sort strictly nearest-first
  validPlaces.sort((a, b) => a.distanceKm - b.distanceKm);

  if (validPlaces.length === 0) {
    return {
      places: [],
      activeRadiusKm: radii[0] || 25,
      totalValidPlaces: 0,
      isExpanded: false,
    };
  }

  // 3. Progressive radius expansion: find smallest radius containing >= minResults
  let activeRadius = radii[radii.length - 1];
  for (const r of radii) {
    const countInRadius = validPlaces.filter((p) => p.distanceKm <= r).length;
    if (countInRadius >= minResults) {
      activeRadius = r;
      break;
    }
  }

  const nearbySlice = validPlaces.filter((p) => p.distanceKm <= activeRadius);

  return {
    places: nearbySlice.length > 0 ? nearbySlice : validPlaces.slice(0, minResults),
    activeRadiusKm: activeRadius,
    totalValidPlaces: validPlaces.length,
    isExpanded: activeRadius > radii[0],
  };
}

/**
 * Calculates estimated driving time based on road distance factor (~1.2x straight line)
 * and an average urban/highway speed of ~42 km/h.
 */
export function calculateDriveTimeMinutes(distKm: number): number {
  if (!Number.isFinite(distKm) || distKm <= 0) return 0;
  const roadDist = distKm * 1.25;
  const speedKmH = distKm > 30 ? 55 : 38;
  return Math.max(2, Math.round((roadDist / speedKmH) * 60));
}

/**
 * Calculates estimated walking time based on an average speed of 4.8 km/h.
 */
export function calculateWalkTimeMinutes(distKm: number): number {
  if (!Number.isFinite(distKm) || distKm <= 0) return 0;
  return Math.max(1, Math.round((distKm / 4.8) * 60));
}

/**
 * Format duration in minutes to human readable string (e.g. "18 mins", "1 hr 25 mins").
 */
export function formatDuration(mins: number): string {
  if (!Number.isFinite(mins) || mins <= 0) return "1 min";
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${hrs} hr ${remainingMins} min${remainingMins > 1 ? "s" : ""}`;
}

