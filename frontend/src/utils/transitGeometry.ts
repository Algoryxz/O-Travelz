/**
 * Authoritative Route Geometry Resolution Engine
 *
 * Implements deterministic three-tier route geometry resolution:
 * 1. Tier 1 (EXACT): Surveyed LineString geometry (solid route polyline).
 * 2. Tier 2 (CORRIDOR): Ordered sequence of >=2 valid stop coordinates (dashed corridor polyline).
 * 3. Tier 3 (ANCHOR): Exactly 1 valid stop coordinate (center/fly to stop anchor).
 * 4. Tier 4 (NONE): 0 valid coordinates (explicit unavailable state; no crash or fake geometry).
 *
 * Invariants:
 * - EXACT geometry takes precedence over stop-sequence fallback.
 * - Fallback geometry NEVER invents coordinates for unresolved intermediate stops.
 * - Output coordinates are always strictly validated [lat, lon] tuples for Leaflet.
 */
import { isValidCoordinate } from "./geoUtils";
import type { TransportMapRoute, TransportMapStop } from "../types/api";

export type RouteGeometryKind = "EXACT" | "CORRIDOR" | "ANCHOR" | "NONE";

export type GeometryConfidence = "VERIFIED_EXACT" | "ESTIMATED_CORRIDOR" | "SINGLE_ANCHOR" | "UNAVAILABLE";

export interface ResolvedRouteGeometry {
  kind: RouteGeometryKind;
  coordinates: [number, number][];
  confidence: GeometryConfidence;
  label: string;
  reason: string;
  validStops: TransportMapStop[];
  unresolvedStops: TransportMapStop[];
  totalStops: number;
  resolvedStopCount: number;
}

/**
 * Validates a lat/lon coordinate pair specifically ensuring finite numbers
 * and within broad regional/geographical bounds.
 */
function isValidPoint(lat: unknown, lon: unknown): lat is number {
  return isValidCoordinate(lat, lon);
}

/**
 * Resolves the displayable map geometry for any transit route.
 * Deterministic and pure function.
 */
export function resolveRouteMapGeometry(route: TransportMapRoute | null | undefined): ResolvedRouteGeometry {
  if (!route) {
    return {
      kind: "NONE",
      coordinates: [],
      confidence: "UNAVAILABLE",
      label: "No Route Selected",
      reason: "No route object provided to resolver",
      validStops: [],
      unresolvedStops: [],
      totalStops: 0,
      resolvedStopCount: 0,
    };
  }

  const stops = Array.isArray(route.stops) ? [...route.stops] : [];
  // Sort stops by sequence_order to preserve canonical transit direction
  stops.sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0));

  const validStops: TransportMapStop[] = [];
  const unresolvedStops: TransportMapStop[] = [];

  for (const s of stops) {
    if (isValidPoint(s.latitude, s.longitude)) {
      validStops.push(s);
    } else {
      unresolvedStops.push(s);
    }
  }

  const geoStatus = (route.geometry_status || "NONE").toUpperCase();

  // Tier 1: EXACT Survey LineString geometry
  if (geoStatus === "EXACT" && Array.isArray(route.verified_coordinates) && route.verified_coordinates.length >= 2) {
    const validVerifiedPoints: [number, number][] = [];
    for (const pt of route.verified_coordinates) {
      if (Array.isArray(pt) && pt.length >= 2 && isValidPoint(pt[0], pt[1])) {
        validVerifiedPoints.push([Number(pt[0]), Number(pt[1])]);
      }
    }

    if (validVerifiedPoints.length >= 2) {
      return {
        kind: "EXACT",
        coordinates: validVerifiedPoints,
        confidence: "VERIFIED_EXACT",
        label: "Verified Survey Path",
        reason: `Rendered from ${validVerifiedPoints.length} surveyed geometry coordinates`,
        validStops,
        unresolvedStops,
        totalStops: stops.length,
        resolvedStopCount: validStops.length,
      };
    }
  }

  // Tier 2: Stop-Sequence Corridor Fallback (>= 2 geocoded stops)
  if (validStops.length >= 2) {
    const rawCoords: [number, number][] = validStops.map((s) => [s.latitude!, s.longitude!]);
    
    // Deduplicate consecutive identical coordinates (e.g. multi-branch stop groups at the same hub)
    const stopCoords: [number, number][] = [];
    for (const pt of rawCoords) {
      if (
        stopCoords.length === 0 ||
        stopCoords[stopCoords.length - 1][0] !== pt[0] ||
        stopCoords[stopCoords.length - 1][1] !== pt[1]
      ) {
        stopCoords.push(pt);
      }
    }

    if (stopCoords.length >= 2) {
      const isFullCoverage = unresolvedStops.length === 0;

      return {
        kind: "CORRIDOR",
        coordinates: stopCoords,
        confidence: "ESTIMATED_CORRIDOR",
        label: isFullCoverage ? "Verified Stop Corridor" : "Estimated Stop Corridor",
        reason: isFullCoverage
          ? `Rendered directly across all ${validStops.length} verified stops in sequence`
          : `Rendered across ${validStops.length} verified anchor stops (${unresolvedStops.length} stops pending coordinates)`,
        validStops,
        unresolvedStops,
        totalStops: stops.length,
        resolvedStopCount: validStops.length,
      };
    } else if (stopCoords.length === 1) {
      return {
        kind: "ANCHOR",
        coordinates: stopCoords,
        confidence: "SINGLE_ANCHOR",
        label: "Single Stop Anchor",
        reason: `Route stops resolve to single unique coordinate point: ${validStops[0].stop_name || "Anchor Stop"}`,
        validStops,
        unresolvedStops,
        totalStops: stops.length,
        resolvedStopCount: validStops.length,
      };
    }
  }

  // Tier 3: Single Anchor Stop (1 geocoded stop)
  if (validStops.length === 1) {
    const singleCoord: [number, number] = [validStops[0].latitude!, validStops[0].longitude!];
    return {
      kind: "ANCHOR",
      coordinates: [singleCoord],
      confidence: "SINGLE_ANCHOR",
      label: "Single Stop Anchor",
      reason: `Route centered at ${validStops[0].stop_name || "Anchor Stop"} (remaining stops pending geocoding)`,
      validStops,
      unresolvedStops,
      totalStops: stops.length,
      resolvedStopCount: 1,
    };
  }

  // Tier 4: No Geocoded Stops Available
  return {
    kind: "NONE",
    coordinates: [],
    confidence: "UNAVAILABLE",
    label: "Map Geometry Unavailable",
    reason: `All ${stops.length} stops for Route ${route.route_number} are pending coordinate resolution`,
    validStops: [],
    unresolvedStops,
    totalStops: stops.length,
    resolvedStopCount: 0,
  };
}
