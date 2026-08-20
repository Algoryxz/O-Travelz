import React, { useMemo } from "react";
import type { MapProjectionResponse, MapFeature } from "../../types/api";
import { MapCanvas } from "./MapCanvas";
import { MapDetailsDrawer } from "./MapDetailsDrawer";
import { ErrorAlert } from "../itinerary/ErrorAlert";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";
import { MapPin, Compass, X } from "lucide-react";

import { getPlaceRegion } from "../../utils/imageService";

interface MapViewProps {
  projection: MapProjectionResponse | null;
  isLoading: boolean;
  error: unknown | null;
  allPlaces?: Array<{ id: string; name: string; category: string; location?: string; lat?: number | null; lon?: number | null; description?: string | null }>;
  selectedPlace?: SelectedPlaceInfo | null;
  userLocation?: { lat: number; lon: number } | null;
  userLocationName?: string;
  onClearSelectedPlace?: () => void;
  onPlanTripWithPlace?: (place: SelectedPlaceInfo) => void;
  onViewDetails?: (place: SelectedPlaceInfo) => void;
  onClearError?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  projection,
  isLoading,
  error,
  allPlaces = [],
  selectedPlace,
  userLocation,
  userLocationName,
  onClearSelectedPlace,
  onPlanTripWithPlace,
  onViewDetails,
  onClearError,
}) => {
  const availableCount =
    projection?.features.filter((f) => f.geometry_status === "available").length ?? 0;
  const unavailableCount =
    projection?.features.filter((f) => f.geometry_status === "unavailable").length ?? 0;
  const relationshipsCount = projection?.relationships.length ?? 0;

  // Features are consumed from backend map projection, or all verified places across Odisha,
  // or a standalone selected place with verified coordinates when exploring a single spot
  const featuresToRender: MapFeature[] = useMemo(() => {
    if (projection && projection.features.length > 0) {
      return projection.features;
    }
    if (allPlaces && allPlaces.length > 0) {
      return allPlaces
        .filter((p) => p.lat != null && p.lon != null)
        .map((p) => ({
          canonical_ref: { entity: "place", id: p.id || p.name },
          name: p.name,
          category: p.category,
          region: p.location || getPlaceRegion(p.name),
          feature_type: "place" as const,
          geometry_status: "available" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [p.lon!, p.lat!] as [number, number],
          },
        }));
    }
    if (selectedPlace && selectedPlace.lat != null && selectedPlace.lon != null) {
      return [
        {
          canonical_ref: { entity: "place", id: selectedPlace.id || selectedPlace.name },
          name: selectedPlace.name,
          category: selectedPlace.category,
          region: selectedPlace.location || getPlaceRegion(selectedPlace.name),
          feature_type: "place",
          geometry_status: "available",
          geometry: {
            type: "Point",
            coordinates: [selectedPlace.lon, selectedPlace.lat],
          },
        },
      ];
    }
    return [];
  }, [projection, allPlaces, selectedPlace]);

  const hasMapContent = featuresToRender.length > 0 || (projection && projection.relationships.length > 0);

  return (
    <div data-testid="map-view-root" className="space-y-4">
      {/* Map Section Header */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Odisha Route &amp; Destination Map
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Explore destinations, route connections, and transport stops across Odisha.
            </p>
          </div>
        </div>

        {/* Selected Place Context Banner if navigated via 'View on Map' */}
        {selectedPlace && (
          <div
            data-testid="map-selected-place-banner"
            className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{selectedPlace.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[10px] font-semibold uppercase">
                    {selectedPlace.category}
                  </span>
                </div>
                {selectedPlace.location && (
                  <div className="text-[11px] text-gray-600 dark:text-gray-400">{selectedPlace.location}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onPlanTripWithPlace && (
                <button
                  type="button"
                  onClick={() => onPlanTripWithPlace(selectedPlace)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Compass size={13} />
                  <span>Plan Trip Here</span>
                </button>
              )}
              {onClearSelectedPlace && (
                <button
                  type="button"
                  onClick={onClearSelectedPlace}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 flex items-center justify-center transition-colors"
                  aria-label="Clear selection"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Projection Statistics Counters */}
        {projection && (
          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-center">
              <span className="text-emerald-950 dark:text-emerald-200 font-bold block text-sm">{availableCount}</span>
              <span className="text-emerald-800 dark:text-emerald-300 text-[11px]">Mapped Locations</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-center">
              <span className="text-blue-950 dark:text-blue-200 font-bold block text-sm">{relationshipsCount}</span>
              <span className="text-blue-800 dark:text-blue-300 text-[11px]">Travel Hops</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-center">
              <span className="text-gray-950 dark:text-gray-200 font-bold block text-sm">{unavailableCount}</span>
              <span className="text-gray-600 dark:text-gray-400 text-[11px]">Unmapped</span>
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error != null && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Loading state */}
      {isLoading && (
        <div
          data-testid="map-loading-state"
          className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs"
        >
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin mb-3" />
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Loading Map...</h4>
          <p className="text-xs text-gray-400 mt-1">
            Connecting destination coordinates and route connections.
          </p>
        </div>
      )}

      {/* Empty State when no map content to display */}
      {!isLoading && !hasMapContent && !error && (
        <div
          data-testid="map-empty-state"
          className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3"
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-100 dark:border-slate-700">
            <MapPin size={24} />
          </div>
          <h4 className="text-base font-bold font-display text-gray-900 dark:text-white">Explore on the Map</h4>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            Plan a trip above or select any place in Discover or Destinations to explore its location and travel routes on the map.
          </p>
        </div>
      )}

      {/* Render Map Canvas and Details Drawer */}
      {!isLoading && hasMapContent && (
        <div className="space-y-4">
          <MapCanvas
            features={featuresToRender}
            relationships={projection?.relationships ?? []}
            selectedFeatureId={selectedPlace?.id || selectedPlace?.name || null}
            userLocation={userLocation}
            userLocationName={userLocationName}
            onPlanTripWithPlace={onPlanTripWithPlace}
            onViewDetails={onViewDetails}
          />
          {projection && (
            <MapDetailsDrawer
              features={projection.features}
              relationships={projection.relationships}
              unavailableItems={projection.unavailable_items}
            />
          )}
        </div>
      )}
    </div>
  );
};
