/**
 * Master Geospatial Relationship Service for O-Travelz
 *
 * Consumes the read-only derived geospatial relationship dataset
 * (data/geospatial/poi_relationships_western_odisha.json) and resolves
 * target IDs into human-readable facility names, distances, distance classes,
 * coordinate confidence labels, and cross-district flags.
 */

import relData from "../../../data/geospatial/poi_relationships_western_odisha.json";
import hotelsData from "../../../data/accommodation/hotels_western_odisha.json";
import diningData from "../../../data/dining/restaurants_western_odisha.json";
import safetyData from "../../../data/safety/police_stations_western_odisha.json";
import financeData from "../../../data/finance/atms_western_odisha.json";
import fuelData from "../../../data/fuel/petrol_pumps_western_odisha.json";
import healthData from "../../../data/health/hospitals_western_odisha.json";
import placesData from "../../../data/places/places.json";
import { VERIFIED_TRANSIT_STOPS } from "../data/staticTransitStops";

export type FacilityType =
  | "hotel"
  | "restaurant"
  | "atm"
  | "petrol_pump"
  | "hospital"
  | "police_station"
  | "transport";

export type DistanceClass = "very_near" | "nearby" | "accessible" | "extended";
export type CoordinateConfidence = "VERIFIED" | "PLAUSIBLE";

export interface GeospatialRelationshipRaw {
  source_id: string;
  source_type: string;
  source_district: string;
  target_id: string;
  target_type: string;
  target_district: string;
  relationship: string;
  distance_km: number;
  distance_class: DistanceClass;
  source_coordinate_confidence: CoordinateConfidence;
  target_coordinate_confidence: CoordinateConfidence;
  cross_district: boolean;
}

export interface NearbyFacilityItem {
  target_id: string;
  target_name: string;
  facility_type: FacilityType;
  distance_km: number;
  distance_formatted: string;
  distance_class: DistanceClass;
  source_coordinate_confidence: CoordinateConfidence;
  target_coordinate_confidence: CoordinateConfidence;
  cross_district: boolean;
  target_district: string;
}

export interface NearbyFacilitiesGroup {
  hotels: NearbyFacilityItem[];
  restaurants: NearbyFacilityItem[];
  atms: NearbyFacilityItem[];
  petrol_pumps: NearbyFacilityItem[];
  hospitals: NearbyFacilityItem[];
  police_stations: NearbyFacilityItem[];
  transport_stops: NearbyFacilityItem[];
  total_nearby_count: number;
}

// 1. Build Name Lookup Registry Map
const nameRegistry: Map<string, string> = new Map();

function buildNameRegistry() {
  if (nameRegistry.size > 0) return;

  const datasetList = [
    hotelsData,
    diningData,
    safetyData,
    financeData,
    fuelData,
    healthData,
    placesData,
  ];

  for (const ds of datasetList) {
    for (const item of ds as Array<{ id: string; name?: string; official_name?: string }>) {
      if (item.id) {
        nameRegistry.set(item.id, item.name || item.official_name || item.id);
      }
    }
  }

  for (const stop of VERIFIED_TRANSIT_STOPS) {
    if (stop.stop_id) {
      nameRegistry.set(stop.stop_id, stop.name || stop.published_name || stop.stop_id);
    }
  }
}

// 2. Build Fast Cached Relationship Index by Source ID
const sourceIndex: Map<string, GeospatialRelationshipRaw[]> = new Map();

function buildSourceIndex() {
  if (sourceIndex.size > 0) return;

  const rawList = (relData as { relationships?: GeospatialRelationshipRaw[] }).relationships || [];
  for (const rel of rawList) {
    if (!sourceIndex.has(rel.source_id)) {
      sourceIndex.set(rel.source_id, []);
    }
    sourceIndex.get(rel.source_id)!.push(rel);
  }
}

/**
 * Formats numeric distance into clean human-readable strings.
 */
export function formatDistanceKm(km: number): string {
  if (km < 1.0) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Retrieves all nearby facilities for a given canonical tourist place ID or POI source ID.
 * Results are grouped by facility type and sorted by distance_km ascending.
 */
export function getNearbyFacilitiesForPlace(sourceId: string): NearbyFacilitiesGroup {
  buildNameRegistry();
  buildSourceIndex();

  const emptyGroup: NearbyFacilitiesGroup = {
    hotels: [],
    restaurants: [],
    atms: [],
    petrol_pumps: [],
    hospitals: [],
    police_stations: [],
    transport_stops: [],
    total_nearby_count: 0,
  };

  if (!sourceId) return emptyGroup;

  const rels = sourceIndex.get(sourceId) || [];
  if (rels.length === 0) return emptyGroup;

  const result: NearbyFacilitiesGroup = {
    hotels: [],
    restaurants: [],
    atms: [],
    petrol_pumps: [],
    hospitals: [],
    police_stations: [],
    transport_stops: [],
    total_nearby_count: 0,
  };

  for (const rel of rels) {
    const resolvedName = nameRegistry.get(rel.target_id) || rel.target_id;
    const item: NearbyFacilityItem = {
      target_id: rel.target_id,
      target_name: resolvedName,
      facility_type: rel.target_type as FacilityType,
      distance_km: rel.distance_km,
      distance_formatted: formatDistanceKm(rel.distance_km),
      distance_class: rel.distance_class,
      source_coordinate_confidence: rel.source_coordinate_confidence,
      target_coordinate_confidence: rel.target_coordinate_confidence,
      cross_district: rel.cross_district,
      target_district: rel.target_district,
    };

    switch (rel.target_type) {
      case "hotel":
        result.hotels.push(item);
        break;
      case "restaurant":
        result.restaurants.push(item);
        break;
      case "atm":
        result.atms.push(item);
        break;
      case "petrol_pump":
        result.petrol_pumps.push(item);
        break;
      case "hospital":
        result.hospitals.push(item);
        break;
      case "police_station":
        result.police_stations.push(item);
        break;
      case "transport":
        result.transport_stops.push(item);
        break;
    }
  }

  // Sort each group ascending by distance_km
  result.hotels.sort((a, b) => a.distance_km - b.distance_km);
  result.restaurants.sort((a, b) => a.distance_km - b.distance_km);
  result.atms.sort((a, b) => a.distance_km - b.distance_km);
  result.petrol_pumps.sort((a, b) => a.distance_km - b.distance_km);
  result.hospitals.sort((a, b) => a.distance_km - b.distance_km);
  result.police_stations.sort((a, b) => a.distance_km - b.distance_km);
  result.transport_stops.sort((a, b) => a.distance_km - b.distance_km);

  result.total_nearby_count =
    result.hotels.length +
    result.restaurants.length +
    result.atms.length +
    result.petrol_pumps.length +
    result.hospitals.length +
    result.police_stations.length +
    result.transport_stops.length;

  return result;
}

/**
 * Retrieves the single nearest facility of a specific type for a source ID.
 */
export function getNearestFacilityForPlace(
  sourceId: string,
  facilityType: FacilityType
): NearbyFacilityItem | null {
  const group = getNearbyFacilitiesForPlace(sourceId);
  switch (facilityType) {
    case "hotel":
      return group.hotels[0] || null;
    case "restaurant":
      return group.restaurants[0] || null;
    case "atm":
      return group.atms[0] || null;
    case "petrol_pump":
      return group.petrol_pumps[0] || null;
    case "hospital":
      return group.hospitals[0] || null;
    case "police_station":
      return group.police_stations[0] || null;
    case "transport":
      return group.transport_stops[0] || null;
    default:
      return null;
  }
}
