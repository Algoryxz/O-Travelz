import React, { useMemo } from "react";
import type {
  MapFeature,
  MapProjectionResponse,
  PlaceSummary,
} from "../../types/api";
import { MapDetailsDrawer } from "./MapDetailsDrawer";
import { ErrorAlert } from "../itinerary/ErrorAlert";
import { MapPin, Compass, X } from "lucide-react";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";
import { MapCanvas } from "./MapCanvas";
import {
  getAllWesternOdishaMapFeatures,
  getNearbyFeaturesForDestination,
} from "../../services/westernOdishaMapService";

export interface MapViewProps {
  projection?: MapProjectionResponse | null;
  isLoading?: boolean;
  error?: unknown | null;
  allPlaces?: PlaceSummary[];
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
  isLoading = false,
  error = null,
  allPlaces = [],
  selectedPlace = null,
  userLocation = null,
  userLocationName,
  onClearSelectedPlace,
  onPlanTripWithPlace,
  onViewDetails,
  onClearError,
}) => {
  // If no projection is loaded yet, project all verified Western Odisha POIs and nearby destination features
  const featuresToRender = useMemo<MapFeature[]>(() => {
    if (projection && projection.features.length > 0) {
      return projection.features;
    }
    if (selectedPlace && selectedPlace.id) {
      const nearbyFeats = getNearbyFeaturesForDestination(selectedPlace.id);
      if (nearbyFeats.length > 0) return nearbyFeats;

      if (selectedPlace.lat != null && selectedPlace.lon != null) {
        return [
          {
            canonical_ref: { entity: "place" as const, id: selectedPlace.id },
            name: selectedPlace.name,
            category: selectedPlace.category || "place",
            region: selectedPlace.location || undefined,
            feature_type: "place" as const,
            geometry_status: "available" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [selectedPlace.lon, selectedPlace.lat] as [number, number],
            },
          },
        ];
      }
    }
    if (allPlaces && allPlaces.length > 0) {
      const mapped = allPlaces
        .filter((p) => p.lat != null && p.lon != null)
        .map((p) => ({
          canonical_ref: { entity: "place" as const, id: p.id || p.name },
          name: p.name,
          category: p.category,
          region: p.location || undefined,
          feature_type: "place" as const,
          geometry_status: "available" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [p.lon!, p.lat!] as [number, number],
          },
        }));
      if (mapped.length > 0) return mapped;
    }
    return [];
  }, [projection, allPlaces, selectedPlace]);

  const hasMapContent = featuresToRender.length > 0 || (projection && projection.relationships.length > 0);

  return (
    <div data-testid="map-view-root" className="space-y-4">
      {/* Map Section Header */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5DFD5]">
          <div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#12161E] tracking-tight">
              Odisha Route &amp; Destination Map
            </h3>
            <p className="text-xs text-[#70798B] mt-0.5">
              Explore destinations, verified transport corridors, and geographical routes across Odisha.
            </p>
          </div>
        </div>

        {/* Selected Place Context Banner if navigated via 'View on Map' */}
        {selectedPlace && (
          <div
            data-testid="map-selected-place-banner"
            className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3 text-[#12161E]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#B87B22] text-white flex items-center justify-center shrink-0">
                <MapPin size={15} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#12161E] flex items-center gap-2">
                  <span>{selectedPlace.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#12161E] text-[10px] font-semibold uppercase border border-[#E5DFD5] font-mono">
                    {selectedPlace.category}
                  </span>
                </div>
                {selectedPlace.location && (
                  <div className="text-[11px] text-[#70798B]">{selectedPlace.location}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onPlanTripWithPlace && (
                <button
                  type="button"
                  onClick={() => onPlanTripWithPlace(selectedPlace)}
                  className="px-3 py-1.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Compass size={13} />
                  <span>Plan Trip Here</span>
                </button>
              )}
              {onClearSelectedPlace && (
                <button
                  type="button"
                  onClick={onClearSelectedPlace}
                  className="w-7 h-7 rounded-lg text-[#70798B] hover:text-[#12161E] hover:bg-[#F2EEE7] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Clear selection"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error alert surface */}
      {error ? (
        <ErrorAlert
          error={error}
          onDismiss={onClearError}
        />
      ) : null}

      {/* Interactive Map Canvas Container or Empty State */}
      {hasMapContent || isLoading ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#E5DFD5] bg-[#FAF7F2] shadow-xs">
          <MapCanvas
            features={featuresToRender}
            relationships={projection?.relationships ?? []}
            userLocation={userLocation}
            userLocationName={userLocationName}
            onViewDetails={onViewDetails}
          />

          {isLoading && (
            <div
              data-testid="map-loading-indicator"
              className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-[#FFFFFF]/90 text-[#12161E] text-xs font-semibold backdrop-blur-md border border-[#E5DFD5] flex items-center gap-2 shadow-xs"
            >
              <div className="w-3 h-3 rounded-full border-2 border-[#E5DFD5] border-t-[#B87B22] animate-spin" />
              <span>Loading Map...</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty State when no map content */
        <div data-testid="map-empty-state" className="p-8 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-2">
          <h4 className="text-base font-serif font-bold text-[#12161E]">Explore on the Map</h4>
          <p className="text-xs text-[#70798B]">Select destinations or plan an itinerary to plot routes and transport corridors.</p>
        </div>
      )}

      {/* Map Details Drawer if features exist */}
      {hasMapContent && (
        <MapDetailsDrawer
          features={featuresToRender}
          relationships={projection?.relationships ?? []}
          unavailableItems={projection?.unavailable_items ?? []}
        />
      )}
    </div>
  );
};

export default MapView;
