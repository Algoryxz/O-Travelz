import React, { useMemo } from "react";
import type { MapProjectionResponse, MapFeature } from "../../api/contracts";
import { MapCanvas } from "./MapCanvas";
import { MapDetailsDrawer } from "./MapDetailsDrawer";
import { ErrorAlert } from "../itinerary/ErrorAlert";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";
import { getPlaceRegion } from "../../utils/imageService";
import { MapPin, Compass, X } from "lucide-react";

interface MapViewProps {
  projection: MapProjectionResponse | null;
  isLoading: boolean;
  error: unknown | null;
  selectedPlace?: SelectedPlaceInfo | null;
  onClearSelectedPlace?: () => void;
  onPlanTripWithPlace?: (place: SelectedPlaceInfo) => void;
  onViewDetails?: (place: SelectedPlaceInfo) => void;
  onClearError?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  projection,
  isLoading,
  error,
  selectedPlace,
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

  // Construct map features from projection or standalone selected place
  const featuresToRender: MapFeature[] = useMemo(() => {
    if (projection && projection.features.length > 0) {
      return projection.features;
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
  }, [projection, selectedPlace]);

  return (
    <div data-testid="map-view-root" className="space-y-4">
      {/* Map Section Header */}
      <div className="p-5 md:p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold font-display text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Odisha Route &amp; Destination Map
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Explore destinations, route connections, and transport stops across Odisha.
            </p>
          </div>
        </div>

        {/* Selected Place Context Banner if navigated via 'View on Map' */}
        {selectedPlace && (
          <div
            data-testid="map-selected-place-banner"
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <span>{selectedPlace.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-semibold uppercase">
                    {selectedPlace.category}
                  </span>
                </div>
                {selectedPlace.location && (
                  <div className="text-[11px] text-gray-600">{selectedPlace.location}</div>
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
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-emerald-100 flex items-center justify-center transition-colors"
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
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-emerald-950 font-bold block text-sm">{availableCount}</span>
              <span className="text-emerald-800 text-[11px]">Mapped Locations</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-blue-950 font-bold block text-sm">{relationshipsCount}</span>
              <span className="text-blue-800 text-[11px]">Travel Hops</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-center">
              <span className="text-gray-950 font-bold block text-sm">{unavailableCount}</span>
              <span className="text-gray-600 text-[11px]">Unmapped</span>
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
          className="p-8 text-center rounded-3xl bg-white border border-gray-200 shadow-xs"
        >
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin mb-3" />
          <h4 className="text-sm font-semibold text-gray-800">Loading Map...</h4>
          <p className="text-xs text-gray-400 mt-1">
            Connecting destination coordinates and route connections.
          </p>
        </div>
      )}

      {/* Empty State when no projection or points */}
      {!isLoading && !projection && featuresToRender.length === 0 && !error && (
        <div
          data-testid="map-empty-state"
          className="p-8 sm:p-12 text-center rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3"
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl border border-emerald-100">
            <MapPin size={24} />
          </div>
          <h4 className="text-base font-bold font-display text-gray-900">Explore on the Map</h4>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            Plan a trip above or select any place in Discover or Destinations to explore its location and travel routes on the map.
          </p>
        </div>
      )}

      {/* Render Map Canvas and Details Drawer */}
      {!isLoading && (projection || featuresToRender.length > 0) && (
        <div className="space-y-4">
          <MapCanvas
            features={featuresToRender}
            relationships={projection?.relationships ?? []}
            selectedFeatureId={selectedPlace?.id || selectedPlace?.name || null}
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
