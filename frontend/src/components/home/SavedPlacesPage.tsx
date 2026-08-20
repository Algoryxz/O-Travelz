import React from "react";
import {
  Bookmark,
  MapPin,
  Compass,
  ArrowLeft,
  Trash2,
  Heart,
} from "lucide-react";
import { useSavedPlaces, type SavedPlaceItem } from "../../store/useSavedPlaces";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";

interface SavedPlacesPageProps {
  onBackToDiscover: () => void;
  onPlanWithSaved: (places: SavedPlaceItem[]) => void;
  onOpenMap: (place?: SelectedPlaceInfo) => void;
  onSelectPlace?: (place: SelectedPlaceInfo) => void;
}

export const SavedPlacesPage: React.FC<SavedPlacesPageProps> = ({
  onBackToDiscover,
  onPlanWithSaved,
  onOpenMap,
  onSelectPlace,
}) => {
  const { savedPlaces, removePlace, clearAllSaved } = useSavedPlaces();

  return (
    <div
      data-testid="saved-places-view"
      className="max-w-5xl mx-auto px-6 sm:px-8 py-8 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="saved-back-button"
            onClick={onBackToDiscover}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 shadow-xs transition-colors cursor-pointer"
            aria-label="Back to Discover"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
              SAVED DESTINATIONS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 tracking-tight flex items-center gap-2">
              <Bookmark size={24} className="text-emerald-600" />
              <span>Saved Places</span>
            </h1>
          </div>
        </div>

        {savedPlaces.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="saved-plan-cta"
              onClick={() => onPlanWithSaved(savedPlaces)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Compass size={15} />
              <span>Plan Trip with Saved</span>
            </button>
            <button
              type="button"
              data-testid="saved-map-cta"
              onClick={() => {
                if (savedPlaces.length > 0) {
                  onOpenMap({
                    id: savedPlaces[0].id,
                    name: savedPlaces[0].name,
                    category: savedPlaces[0].category,
                    location: savedPlaces[0].location,
                    description: savedPlaces[0].notes,
                  });
                } else {
                  onOpenMap();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <MapPin size={15} className="text-emerald-600" />
              <span>View on Map</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {savedPlaces.length === 0 ? (
        <div
          data-testid="saved-empty-state"
          className="p-12 text-center rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl">
            <Heart size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Nothing saved yet</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              When exploring destinations or discovering places in Odisha, tap the save icon to keep them here for quick planning.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToDiscover}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Explore Destinations</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>
              Showing <span className="font-bold text-gray-800">{savedPlaces.length}</span> saved{" "}
              {savedPlaces.length === 1 ? "place" : "places"}.
            </span>
            <button
              type="button"
              onClick={clearAllSaved}
              className="text-red-600 hover:underline cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPlaces.map((item) => (
              <div
                key={item.id || item.name}
                data-testid={`saved-item-${item.id || item.name}`}
                className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        onSelectPlace?.({
                          id: item.id,
                          name: item.name,
                          category: item.category,
                          distance: item.distance,
                          description: item.notes,
                          location: item.location,
                          tags: item.tags,
                          interests: item.interests,
                          lat: item.coordinates?.[1],
                          lon: item.coordinates?.[0],
                        })
                      }
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
                        {item.category}
                      </span>
                      <h3 className="font-display font-bold text-base text-gray-900 mt-0.5 hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      data-testid={`remove-saved-${item.id || item.name}`}
                      onClick={() => removePlace(item.id || item.name)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMap({
                        id: item.id,
                        name: item.name,
                        category: item.category,
                        location: item.location,
                        description: item.notes,
                        interests: item.interests,
                      })
                    }
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-medium cursor-pointer"
                  >
                    <MapPin size={13} /> View on Map
                  </button>
                  <span className="text-[11px] text-gray-400">{item.addedDate || "Saved"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
