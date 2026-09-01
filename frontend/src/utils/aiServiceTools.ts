/**
 * Deterministic AI Copilot Tools for Traveller Essentials & Local Services
 * Grounded tool execution functions answering traveller queries with zero hallucination.
 */

import {
  searchNearbyServices,
  findNearestService,
  getDestinationSafetyAdvisory,
  getNearbyServicesForDestination,
} from "./serviceProximity";
import type {
  ServiceCategory,
  NearbyServiceResult,
  DestinationSafetyAdvisory,
  NearbyServicesGrouped,
} from "../types/services";

export interface ServiceToolResponse<T> {
  status: "success" | "no_verified_data" | "error";
  message: string;
  data: T | null;
  provenance: string;
  timestamp: string;
}

/**
 * Tool: Find nearest hospital or emergency healthcare facility.
 */
export function toolFindNearestHospital(
  lat: number,
  lon: number,
  destinationName?: string
): ServiceToolResponse<NearbyServiceResult> {
  try {
    const nearest = findNearestService(lat, lon, "healthcare");
    if (!nearest) {
      return {
        status: "no_verified_data",
        message: `No verified hospital or healthcare facility found within search radius for ${destinationName || "this location"}.`,
        data: null,
        provenance: "Health & Family Welfare Dept, Odisha",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: "success",
      message: `Nearest verified hospital is ${nearest.name} (${nearest.distanceFormatted}, ~${nearest.estimatedDriveMinutes} mins drive). Emergency: ${nearest.emergency_phone || nearest.phone || "108"}.`,
      data: nearest,
      provenance: nearest.source,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: "error",
      message: `Failed to locate nearest hospital: ${err.message}`,
      data: null,
      provenance: "State Health Directory",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Tool: Find nearest police station or law-enforcement outpost.
 */
export function toolFindNearestPoliceStation(
  lat: number,
  lon: number,
  destinationName?: string
): ServiceToolResponse<NearbyServiceResult> {
  try {
    const nearest = findNearestService(lat, lon, "police");
    if (!nearest) {
      return {
        status: "no_verified_data",
        message: `No verified police facility found within search radius for ${destinationName || "this location"}.`,
        data: null,
        provenance: "Odisha State Police Directory",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: "success",
      message: `Nearest police station is ${nearest.name} (${nearest.distanceFormatted}, ~${nearest.estimatedDriveMinutes} mins drive). Emergency: ${nearest.emergency_phone || "112"}.`,
      data: nearest,
      provenance: nearest.source,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: "error",
      message: `Failed to locate nearest police station: ${err.message}`,
      data: null,
      provenance: "Odisha Police Directory",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Tool: Find nearby accommodation & hotels.
 */
export function toolFindNearbyHotels(
  lat: number,
  lon: number,
  radiusKm = 15,
  limit = 5
): ServiceToolResponse<NearbyServiceResult[]> {
  try {
    const hotels = searchNearbyServices({
      lat,
      lon,
      category: "hotel",
      radiusKm,
      limit,
    });
    if (hotels.length === 0) {
      return {
        status: "no_verified_data",
        message: `No verified hotels or guest houses found within ${radiusKm} km.`,
        data: [],
        provenance: "OTDC & State Tourism Registry",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: "success",
      message: `Found ${hotels.length} verified stays within ${radiusKm} km radius.`,
      data: hotels,
      provenance: "Odisha Tourism Development Corporation (OTDC)",
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: "error",
      message: `Failed to search hotels: ${err.message}`,
      data: null,
      provenance: "Tourism Registry",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Tool: Find nearby restaurants & dining.
 */
export function toolFindNearbyRestaurants(
  lat: number,
  lon: number,
  radiusKm = 10,
  limit = 5
): ServiceToolResponse<NearbyServiceResult[]> {
  try {
    const dining = searchNearbyServices({
      lat,
      lon,
      category: "restaurant",
      radiusKm,
      limit,
    });
    if (dining.length === 0) {
      return {
        status: "no_verified_data",
        message: `No verified dining options found within ${radiusKm} km.`,
        data: [],
        provenance: "Tourism Food Registry",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: "success",
      message: `Found ${dining.length} verified dining options nearby.`,
      data: dining,
      provenance: "Tourism Food Registry",
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: "error",
      message: `Failed to search restaurants: ${err.message}`,
      data: null,
      provenance: "Food Registry",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Tool: Find nearest petrol pump / fuel station.
 */
export function toolFindNearbyFuelStations(
  lat: number,
  lon: number,
  radiusKm = 15,
  limit = 3
): ServiceToolResponse<NearbyServiceResult[]> {
  try {
    const fuel = searchNearbyServices({
      lat,
      lon,
      category: "fuel",
      radiusKm,
      limit,
    });
    if (fuel.length === 0) {
      return {
        status: "no_verified_data",
        message: `No verified fuel stations found within ${radiusKm} km.`,
        data: [],
        provenance: "National Oil Corporation Retail Network",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: "success",
      message: `Nearest fuel station is ${fuel[0].name} (${fuel[0].distanceFormatted}).`,
      data: fuel,
      provenance: fuel[0].source,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: "error",
      message: `Failed to search fuel stations: ${err.message}`,
      data: null,
      provenance: "Fuel Registry",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Tool: Find nearest ATMs and cash points.
 */
export function toolFindNearbyATMs(
  lat: number,
  lon: number,
  radiusKm = 15,
  limit = 3
): ServiceToolResponse<NearbyServiceResult[]> {
  try {
    const atms = searchNearbyServices({
      lat,
      lon,
      category: "atm",
      radiusKm,
      limit,
    });
    if (atms.length === 0) {
      return {
        status: "no_verified_data",
        message: `No verified ATMs found within ${radiusKm} km.`,
        data: [],
        provenance: "State Level Bankers' Committee (SLBC) Odisha",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: "success",
      message: `Nearest ATM is ${atms[0].name} (${atms[0].distanceFormatted}).`,
      data: atms,
      provenance: atms[0].source,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: "error",
      message: `Failed to search ATMs: ${err.message}`,
      data: null,
      provenance: "SLBC Banking Directory",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Tool: Find nearby transit hubs & Mo Bus stops.
 */
export function toolFindNearbyTransit(
  lat: number,
  lon: number,
  radiusKm = 20,
  limit = 3
): ServiceToolResponse<NearbyServiceResult[]> {
  try {
    const transit = searchNearbyServices({
      lat,
      lon,
      category: "transit",
      radiusKm,
      limit,
    });
    if (transit.length === 0) {
      return {
        status: "no_verified_data",
        message: `No verified transit hubs or Mo Bus stops found within ${radiusKm} km.`,
        data: [],
        provenance: "CRUT & Indian Railways",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: "success",
      message: `Nearest transit point is ${transit[0].name} (${transit[0].distanceFormatted}).`,
      data: transit,
      provenance: transit[0].source,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: "error",
      message: `Failed to search transit: ${err.message}`,
      data: null,
      provenance: "Transit Registry",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Tool: Get comprehensive destination safety advisory and emergency numbers.
 */
export function toolGetDestinationSafety(
  destinationNameOrId: string
): ServiceToolResponse<DestinationSafetyAdvisory> {
  try {
    const advisory = getDestinationSafetyAdvisory(destinationNameOrId);
    if (!advisory) {
      return {
        status: "no_verified_data",
        message: `Standard safety guidance applies: Dial 112 for All Emergency Services or 108 for Medical Emergency.`,
        data: null,
        provenance: "State Emergency Services (112 / 108)",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: "success",
      message: `Safety profile loaded for ${advisory.destination_name} (Nearest Police: ${advisory.nearest_police_station_name}, Nearest Hospital: ${advisory.nearest_hospital_name}).`,
      data: advisory,
      provenance: advisory.source,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: "error",
      message: `Failed to retrieve safety advisory: ${err.message}`,
      data: null,
      provenance: "Safety Registry",
      timestamp: new Date().toISOString(),
    };
  }
}
