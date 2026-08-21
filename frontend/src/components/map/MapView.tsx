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
      <div className="p-5 md:p-6 rounded-3xl bg-[#111827] border border-[#263244] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#263244]">
          <div>
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
              Odisha Route &amp; Destination Map
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore destinations, route connections, and transport stops across Odisha.
            </p>
          </div>
        </div>

        {/* Selected Place Context Banner if navigated via 'View on Map' */}
        {selectedPlace && (
          <div
            data-testid="map-selected-place-banner"
            className="p-3.5 rounded-2xl bg-[#172235] border border-[#334155] flex flex-wrap items-center justify-between gap-3 text-white"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#14B8A6] text-white flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{selectedPlace.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#111827] text-teal-300 text-[10px] font-semibold uppercase border border-[#263244]">
                    {selectedPlace.category}
                  </span>
                </div>
                {selectedPlace.location && (
                  <div className="text-[11px] text-slate-400">{selectedPlace.location}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onPlanTripWithPlace && (
                <button
                  type="button"
                  onClick={() => onPlanTripWithPlace(selectedPlace)}
                  className="px-3 py-1.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Compass size={13} />
                  <span>Plan Trip Here</span>
                </button>
              )}
              {onClearSelectedPlace && (
                <button
                  type="button"
                  onClick={onClearSelectedPlace}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
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
            <div className="p-2.5 rounded-2xl bg-[#172235] border border-[#263244] text-center">
              <span className="text-teal-300 font-bold block text-sm font-mono">{availableCount}</span>
              <span className="text-slate-400 text-[11px]">Mapped Locations</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#172235] border border-[#263244] text-center">
              <span className="text-sky-300 font-bold block text-sm font-mono">{relationshipsCount}</span>
              <span className="text-slate-400 text-[11px]">Travel Hops</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#172235] border border-[#263244] text-center">
              <span className="text-slate-300 font-bold block text-sm font-mono">{unavailableCount}</span>
              <span className="text-slate-400 text-[11px]">Unmapped</span>
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
          className="p-8 text-center rounded-3xl bg-[#111827] border border-[#263244] shadow-xs"
        >
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-[#263244] border-t-[#14B8A6] animate-spin mb-3" />
          <h4 className="text-sm font-semibold text-white">Loading Map...</h4>
          <p className="text-xs text-slate-400 mt-1">
            Connecting destination coordinates and route connections.
          </p>
        </div>
      )}

      {/* Empty State when no map content to display */}
      {!isLoading && !hasMapContent && !error && (
        <div
          data-testid="map-empty-state"
          className="p-8 sm:p-12 text-center rounded-3xl bg-[#111827] border border-[#263244] shadow-xs space-y-3 text-white"
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#172235] text-[#14B8A6] flex items-center justify-center font-bold text-xl border border-[#263244]">
            <MapPin size={24} />
          </div>
          <h4 className="text-base font-bold font-display text-white">Explore on the Map</h4>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
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

export default MapView;
