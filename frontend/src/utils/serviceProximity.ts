/**
 * Authoritative Proximity & Local Services Discovery Engine
 * Provides deterministic distance calculation, progressive radius expansion,
 * and category-filtered service discovery for tourist destinations across Odisha.
 */

import type {
  ServiceCategory,
  ServiceRecord,
  NearbyServiceResult,
  DestinationSafetyAdvisory,
  NearbyServicesGrouped,
  ServiceSearchParams,
} from "../types/services";
import { ODISHA_SERVICES } from "../data/services/odishaServicesData";
import { DESTINATION_SAFETY_ADVISORIES } from "../data/services/destinationSafetyData";
import {
  calculateHaversineDistanceKm,
  calculateDriveTimeMinutes,
  calculateWalkTimeMinutes,
  formatDistance,
  isValidCoordinate,
} from "./geoUtils";

/**
 * Search nearby services by coordinates with progressive radius expansion.
 */
export function searchNearbyServices(params: ServiceSearchParams): NearbyServiceResult[] {
  const {
    lat,
    lon,
    category,
    subcategory,
    radiusKm = 5,
    maxRadiusKm = 50,
    minResults = 1,
    limit = 20,
  } = params;

  if (!isValidCoordinate(lat, lon)) {
    return [];
  }

  // 1. Filter services by category / subcategory
  let filtered = ODISHA_SERVICES.filter((svc) => {
    if (!isValidCoordinate(svc.lat, svc.lon)) return false;
    if (category && svc.category !== category) return false;
    if (subcategory && svc.subcategory !== subcategory) return false;
    return true;
  });

  // 2. Compute Haversine distances
  const withDistances: NearbyServiceResult[] = filtered.map((svc) => {
    const dist = calculateHaversineDistanceKm(lat, lon, svc.lat, svc.lon);
    return {
      ...svc,
      distanceKm: dist,
      distanceFormatted: formatDistance(dist),
      estimatedDriveMinutes: calculateDriveTimeMinutes(dist),
      estimatedWalkMinutes: calculateWalkTimeMinutes(dist),
    };
  });

  // 3. Sort strictly nearest-first
  withDistances.sort((a, b) => a.distanceKm - b.distanceKm);

  // 4. Progressive radius expansion if insufficient results in default radius
  const expansionRadii = [radiusKm, 10, 25, maxRadiusKm].filter(
    (r, idx, self) => r >= radiusKm && self.indexOf(r) === idx
  );

  let activeRadius = radiusKm;
  for (const r of expansionRadii) {
    const inRadius = withDistances.filter((svc) => svc.distanceKm <= r);
    if (inRadius.length >= minResults) {
      activeRadius = r;
      break;
    }
  }

  const resultsInRadius = withDistances.filter((svc) => svc.distanceKm <= activeRadius);
  return resultsInRadius.slice(0, limit);
}

/**
 * Find the single nearest service of a given category.
 */
export function findNearestService(
  lat: number,
  lon: number,
  category: ServiceCategory
): NearbyServiceResult | null {
  const results = searchNearbyServices({
    lat,
    lon,
    category,
    radiusKm: 50,
    minResults: 1,
    limit: 1,
  });
  return results.length > 0 ? results[0] : null;
}

/**
 * Retrieve comprehensive grouped services & safety advisory for a tourist destination.
 */
export function getNearbyServicesForDestination(
  destination: { id?: string; name: string; lat: number; lon: number; district?: string },
  options: { defaultRadiusKm?: number; maxRadiusKm?: number } = {}
): NearbyServicesGrouped {
  const { defaultRadiusKm = 10, maxRadiusKm = 50 } = options;
  const { id, name, lat, lon } = destination;

  if (!isValidCoordinate(lat, lon)) {
    return {
      destinationId: id,
      destinationName: name,
      activeRadiusKm: defaultRadiusKm,
      isExpanded: false,
      totalServicesCount: 0,
      healthcare: [],
      police: [],
      hotels: [],
      restaurants: [],
      fuel: [],
      transit: [],
      atms: [],
      safetyAdvisory: null,
    };
  }

  // Fetch categorized nearby services
  const healthcare = searchNearbyServices({ lat, lon, category: "healthcare", radiusKm: defaultRadiusKm, maxRadiusKm, limit: 5 });
  const police = searchNearbyServices({ lat, lon, category: "police", radiusKm: defaultRadiusKm, maxRadiusKm, limit: 5 });
  const hotels = searchNearbyServices({ lat, lon, category: "hotel", radiusKm: defaultRadiusKm, maxRadiusKm, limit: 5 });
  const restaurants = searchNearbyServices({ lat, lon, category: "restaurant", radiusKm: defaultRadiusKm, maxRadiusKm, limit: 5 });
  const fuel = searchNearbyServices({ lat, lon, category: "fuel", radiusKm: defaultRadiusKm, maxRadiusKm, limit: 5 });
  const transit = searchNearbyServices({ lat, lon, category: "transit", radiusKm: defaultRadiusKm, maxRadiusKm, limit: 5 });
  const atms = searchNearbyServices({ lat, lon, category: "atm", radiusKm: defaultRadiusKm, maxRadiusKm, limit: 5 });

  const totalCount =
    healthcare.length +
    police.length +
    hotels.length +
    restaurants.length +
    fuel.length +
    transit.length +
    atms.length;

  // Retrieve safety advisory
  const safetyAdvisory = getDestinationSafetyAdvisory(id || name);

  return {
    destinationId: id,
    destinationName: name,
    activeRadiusKm: defaultRadiusKm,
    isExpanded: false,
    totalServicesCount: totalCount,
    healthcare,
    police,
    hotels,
    restaurants,
    fuel,
    transit,
    atms,
    safetyAdvisory,
  };
}

/**
 * Retrieve verified safety advisory for a destination.
 */
export function getDestinationSafetyAdvisory(
  destinationIdOrName: string
): DestinationSafetyAdvisory | null {
  if (!destinationIdOrName) return null;
  const normalized = destinationIdOrName.toLowerCase().trim();

  // Try matching by destination_id
  const byId = DESTINATION_SAFETY_ADVISORIES.find(
    (adv) => adv.destination_id.toLowerCase() === normalized
  );
  if (byId) return byId;

  // Try matching by destination_name
  const byName = DESTINATION_SAFETY_ADVISORIES.find(
    (adv) =>
      adv.destination_name.toLowerCase() === normalized ||
      normalized.includes(adv.destination_name.toLowerCase()) ||
      adv.destination_name.toLowerCase().includes(normalized)
  );
  return byName || null;
}
