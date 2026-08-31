import { motion } from "motion/react";
import { buttonTap, cardHover, cardTap, chipTap } from "../../lib/motion";
import React from "react";
import {
  Bookmark,
  MapPin,
  Compass,
  ArrowLeft,
  Trash2,
  Heart,
  Sparkles,
} from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";
import {
  getPlaceImageUrl,
  getPlaceRegion,
} from "../../utils/imageService";
import { resolvePlaceImageUrl } from "../../utils/imageAdapter";

interface SavedPlacesPageProps {
  onBackToDiscover: () => void;
  onSelectPlace?: (place: SelectedPlaceInfo) => void;
  onPlanWithSaved: (places: any[]) => void;
  onPlanWithSinglePlace?: (place: SelectedPlaceInfo) => void;
}

export const SavedPlacesPage: React.FC<SavedPlacesPageProps> = ({
  onBackToDiscover,
  onSelectPlace,
  onPlanWithSaved,
  onPlanWithSinglePlace,
}) => {
  const { savedPlaces, removePlace, clearAllSaved } = useSavedPlaces();

  return (
    <div
      data-testid="saved-places-view"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#12161E]"
    >
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="saved-back-button"
            onClick={onBackToDiscover}
            className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#E5DFD5] hover:bg-[#FAF7F2] flex items-center justify-center text-[#12161E] shadow-xs transition-colors cursor-pointer"
            aria-label="Back to Discover"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#B87B22] font-mono">
              PERSONAL TRAVEL ARCHIVE
            </div>
            <h1
              data-testid="saved-places-title"
              className="text-2xl sm:text-3xl font-serif font-bold text-[#12161E] tracking-tight"
            >
              Saved Places & Wishlist
            </h1>
          </div>
        </div>

        {savedPlaces.length > 0 && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              data-testid="saved-clear-all"
              onClick={clearAllSaved}
              className="text-xs text-[#70798B] hover:text-[#C2410C] font-semibold transition-colors cursor-pointer"
            >
              Clear All
            </button>
            <button
              type="button"
              data-testid="saved-plan-all-cta"
              onClick={() => onPlanWithSaved(savedPlaces)}
              className="px-4 py-2 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Compass size={14} />
              <span>Plan Trip with All Saved ({savedPlaces.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {savedPlaces.length === 0 ? (
        <div
          data-testid="saved-empty-state"
          className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-4"
        >
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-[#A84825] flex items-center justify-center font-bold text-2xl">
            <Heart size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#12161E]">Nothing saved yet</h3>
            <p className="text-xs sm:text-sm text-[#70798B] max-w-md mx-auto leading-relaxed">
              When discovering places in Odisha, tap the save icon to keep them here for quick planning.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToDiscover}
            className="px-5 py-2.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white font-bold text-xs shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Explore Odisha Destinations</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#70798B] font-medium">
            <span>
              Showing <span className="font-bold text-[#12161E]">{savedPlaces.length}</span> saved{" "}
              {savedPlaces.length === 1 ? "place" : "places"}.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                data-testid="saved-plan-all-cta"
                onClick={() => onPlanWithSaved(savedPlaces)}
                className="px-3.5 py-1.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass size={13} />
                <span>Plan Trip with All Saved</span>
              </button>
              <button
                type="button"
                onClick={clearAllSaved}
                className="text-[#A84825] hover:underline cursor-pointer font-medium"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlaces.map((item) => {
              const imageUrl = resolvePlaceImageUrl({ name: item.name, category: item.category }, "card");
              return (
                <div
                  key={item.id || item.name}
                  data-testid={`saved-item-${item.id || item.name}`}
                  className="group rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] hover:border-[#D1C8BA] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden text-[#12161E]"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative h-36 w-full bg-[#F2EEE7] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getPlaceImageUrl(item.name, item.category);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <button
                      type="button"
                      data-testid={`remove-saved-${item.id || item.name}`}
                      onClick={() => removePlace(item.id || item.name)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 text-[#12161E] hover:bg-white transition-colors cursor-pointer"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="absolute bottom-2 left-3 right-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 font-mono">
                        {item.category}
                      </span>
                      <h3
                        className="font-serif font-bold text-sm text-white hover:text-[#B87B22] transition-colors cursor-pointer truncate"
                        onClick={() =>
                          onSelectPlace?.({
                            id: item.id,
                            name: item.name,
                            category: item.category,
                            location: item.location,
                            description: item.description,
                            interests: item.interests,
                          })
                        }
                      >
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content & Actions */}
                  <div className="p-3.5 space-y-3">
                    <div className="text-xs text-[#70798B] flex items-center justify-between">
                      <span className="flex items-center gap-1 truncate text-[#3D4654]">
                        <MapPin size={11} className="text-[#B87B22]" />
                        <span>{item.location || getPlaceRegion(item.name)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#E5DFD5]">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectPlace?.({
                            id: item.id,
                            name: item.name,
                            category: item.category,
                            location: item.location,
                            description: item.description,
                            interests: item.interests,
                          })
                        }
                        className="flex-1 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#12161E] text-xs font-semibold transition-colors text-center cursor-pointer border border-[#E5DFD5]"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onPlanWithSinglePlace) {
                            onPlanWithSinglePlace({
                              id: item.id,
                              name: item.name,
                              category: item.category,
                              location: item.location,
                              description: item.description,
                              interests: item.interests,
                            });
                          }
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-xs transition-colors text-center cursor-pointer"
                      >
                        Plan Trip
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
