/**
 * Master Western Odisha Map Integration Service for O-Travelz
 *
 * Compiles all verified Western Odisha POIs (Tourist Places, Hotels, Restaurants,
 * ATMs, Petrol Pumps, Hospitals, Police Stations, and Transport Stops) into
 * clean MapFeature objects for Leaflet / MapCanvas rendering.
 *
 * Strictly enforces WGS84 coordinate validation (isValidCoordinate).
 * Excludes invalid, missing, or (0,0) placeholder coordinates.
 */

import type { FeatureType, MapEntity, MapFeature } from "../types/api";
import { isValidCoordinate } from "../utils/geoUtils";
import { getNearbyFacilitiesForPlace } from "./geospatialRelationshipService";

import hotelsData from "../../../data/accommodation/hotels_western_odisha.json";
import diningData from "../../../data/dining/restaurants_western_odisha.json";
import safetyData from "../../../data/safety/police_stations_western_odisha.json";
import financeData from "../../../data/finance/atms_western_odisha.json";
import fuelData from "../../../data/fuel/petrol_pumps_western_odisha.json";
import healthData from "../../../data/health/hospitals_western_odisha.json";
import placesData from "../../../data/places/places.json";
import { VERIFIED_TRANSIT_STOPS } from "../data/staticTransitStops";

export type MapCategoryFilter =
  | "all"
  | "tourist_place"
  | "hotel"
  | "restaurant"
  | "atm"
  | "petrol_pump"
  | "hospital"
  | "police_station"
  | "transport";

let cachedFeatures: MapFeature[] | null = null;
const featureLookupMap: Map<string, MapFeature> = new Map();

/**
 * Builds and caches all MapFeature objects for verified Western Odisha datasets.
 */
export function getAllWesternOdishaMapFeatures(): MapFeature[] {
  if (cachedFeatures) return cachedFeatures;

  const features: MapFeature[] = [];

  // Helper to add valid point feature
  const addPointFeature = (
    id: string,
    name: string,
    category: string,
    district: string,
    lat: unknown,
    lon: unknown,
    featureType: FeatureType,
    _verificationStatus: string = "verified"
  ) => {
    if (!isValidCoordinate(lat, lon)) return;

    const numLat = typeof lat === "number" ? lat : Number(lat);
    const numLon = typeof lon === "number" ? lon : Number(lon);

    const feat: MapFeature = {
      canonical_ref: {
        entity: featureType as MapEntity,
        id,
      },
      name,
      category,
      region: district,
      feature_type: featureType,
      geometry_status: "available",
      geometry: {
        type: "Point",
        coordinates: [numLon, numLat],
      },
    };

    features.push(feat);
    featureLookupMap.set(id, feat);
  };

  // 1. Tourist Places (161)
  for (const p of placesData as unknown as Array<{ id: string; name: string; category?: string; district?: string; lat?: unknown; lon?: unknown; latitude?: unknown; longitude?: unknown }>) {
    const lat = p.lat ?? p.latitude;
    const lon = p.lon ?? p.longitude;
    addPointFeature(p.id, p.name, p.category || "Tourist Attraction", p.district || "Odisha", lat, lon, "tourist_place");
  }

  // 2. Hotels & Accommodation (78)
  for (const h of hotelsData as unknown as Array<{ id: string; name: string; category?: string; district: string; latitude: unknown; longitude: unknown }>) {
    addPointFeature(h.id, h.name, h.category || "Hotel", h.district, h.latitude, h.longitude, "hotel");
  }

  // 3. Restaurants & Dining (88)
  for (const r of diningData as unknown as Array<{ id: string; name: string; cuisine?: string | string[]; district: string; latitude: unknown; longitude: unknown }>) {
    const cuisineStr = Array.isArray(r.cuisine) ? r.cuisine.join(", ") : (r.cuisine || "Restaurant");
    addPointFeature(r.id, r.name, cuisineStr, r.district, r.latitude, r.longitude, "restaurant");
  }

  // 4. Police Stations (71)
  for (const pol of safetyData as unknown as Array<{ id: string; name: string; district: string; latitude: unknown; longitude: unknown }>) {
    addPointFeature(pol.id, pol.name, "Police Station", pol.district, pol.latitude, pol.longitude, "police_station");
  }

  // 5. ATMs & Cash Points (112)
  for (const atm of financeData as unknown as Array<{ id: string; name: string; bank?: string; district: string; latitude: unknown; longitude: unknown }>) {
    addPointFeature(atm.id, atm.name, atm.bank || "ATM", atm.district, atm.latitude, atm.longitude, "atm");
  }

  // 6. Petrol Pumps (98)
  for (const fuel of fuelData as unknown as Array<{ id: string; name: string; brand?: string; district: string; latitude: unknown; longitude: unknown }>) {
    addPointFeature(fuel.id, fuel.name, fuel.brand || "Petrol Pump", fuel.district, fuel.latitude, fuel.longitude, "petrol_pump");
  }

  // 7. Hospitals & Medical Care (76)
  for (const hosp of healthData as unknown as Array<{ id: string; name: string; district: string; latitude: unknown; longitude: unknown }>) {
    addPointFeature(hosp.id, hosp.name, "Hospital", hosp.district, hosp.latitude, hosp.longitude, "hospital");
  }

  // 8. Verified Transport Stops (46)
  for (const stop of VERIFIED_TRANSIT_STOPS) {
    addPointFeature(stop.stop_id, stop.name, stop.stop_type || "Transport Stop", stop.district || "Odisha", stop.latitude, stop.longitude, "transport");
  }

  cachedFeatures = features;
  return cachedFeatures;
}

/**
 * Filter MapFeature objects by category or feature_type.
 */
export function getWesternOdishaMapFeatures(filter: MapCategoryFilter = "all"): MapFeature[] {
  const all = getAllWesternOdishaMapFeatures();
  if (filter === "all") return all;
  return all.filter((f) => f.canonical_ref.entity === filter);
}

/**
 * Retrieves map features for a destination and all its verified nearby facilities.
 */
export function getNearbyFeaturesForDestination(destinationId: string): MapFeature[] {
  getAllWesternOdishaMapFeatures();
  const destFeature = featureLookupMap.get(destinationId);
  const result: MapFeature[] = [];

  if (destFeature) {
    result.push(destFeature);
  }

  const group = getNearbyFacilitiesForPlace(destinationId);
  const allItems = [
    ...group.hotels,
    ...group.restaurants,
    ...group.atms,
    ...group.petrol_pumps,
    ...group.hospitals,
    ...group.police_stations,
    ...group.transport_stops,
  ];

  for (const item of allItems) {
    const feat = featureLookupMap.get(item.target_id);
    if (feat && !result.some((r) => r.canonical_ref.id === feat.canonical_ref.id)) {
      result.push(feat);
    }
  }

  return result;
}
