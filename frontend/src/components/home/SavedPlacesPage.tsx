import React, { useState } from "react";
import {
  Bookmark,
  MapPin,
  Compass,
  ArrowLeft,
  Trash2,
  Heart,
  Sparkles,
  History,
  Star,
  Calendar,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { useSavedPlaces, type SavedPlaceItem } from "../../store/useSavedPlaces";
import { useRecentPlaces, type MemoryStatus } from "../../store/useRecentPlaces";
import { resolvePlaceImageUrl } from "../../utils/imageAdapter";
import { getPlaceImageUrl, getPlaceRegion } from "../../utils/imageService";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";

interface SavedPlacesPageProps {
  initialViewMode?: "saved" | "revisit";
  onBackToDiscover: () => void;
  onPlanWithSaved: (places: SavedPlaceItem[]) => void;
  onPlanWithSinglePlace?: (place: SelectedPlaceInfo) => void;
  onOpenMap: (place?: SelectedPlaceInfo) => void;
  onSelectPlace?: (place: SelectedPlaceInfo) => void;
}

export const SavedPlacesPage: React.FC<SavedPlacesPageProps> = ({
  initialViewMode = "saved",
  onBackToDiscover,
  onPlanWithSaved,
  onPlanWithSinglePlace,
  onOpenMap,
  onSelectPlace,
}) => {
  const [viewMode, setViewMode] = useState<"saved" | "revisit">(initialViewMode);
  const { savedPlaces, removePlace, clearAllSaved } = useSavedPlaces();
  const { memories, removeRecentPlace, clearRecentPlaces } = useRecentPlaces();

  const getStatusBadge = (status: MemoryStatus) => {
    switch (status) {
      case "visited":
        return {
          label: "Visited Before",
          color: "bg-[#2F523E]/10 text-[#2F523E] border-[#2F523E]/30",
          icon: CheckCircle2,
        };
      case "planned":
        return {
          label: "Planned",
          color: "bg-[#1B5E6B]/10 text-[#1B5E6B] border-[#1B5E6B]/30",
          icon: Calendar,
        };
      case "navigated":
        return {
          label: "Navigated",
          color: "bg-[#B87B22]/10 text-[#B87B22] border-[#B87B22]/30",
          icon: Navigation,
        };
      case "explored":
      default:
        return {
          label: "Explored",
          color: "bg-[#FAF7F2] text-[#70798B] border-[#E5DFD5]",
          icon: History,
        };
    }
  };

  return (
    <div
      data-testid="saved-places-view"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300"
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
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#12161E] tracking-tight flex items-center gap-2">
              {viewMode === "saved" ? (
                <>
                  <Bookmark size={22} className="text-[#B87B22]" />
                  <span>Saved Places</span>
                </>
              ) : (
                <>
                  <History size={22} className="text-[#B87B22]" />
                  <span>Revisit Places &amp; Memories</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center p-1 rounded-full bg-[#FAF7F2] border border-[#E5DFD5]">
          <button
            type="button"
            data-testid="tab-saved-places tab-saved-wishlist"
            onClick={() => setViewMode("saved")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "saved"
                ? "bg-[#12161E] text-white shadow-xs font-bold"
                : "text-[#3D4654] hover:text-[#12161E]"
            }`}
          >
            <Bookmark size={13} />
            <span>Saved Wishlist</span>
            {savedPlaces.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#B87B22] text-white text-[10px]">
                {savedPlaces.length}
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="tab-revisit-places"
            onClick={() => setViewMode("revisit")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "revisit"
                ? "bg-[#12161E] text-white shadow-xs font-bold"
                : "text-[#3D4654] hover:text-[#12161E]"
            }`}
          >
            <History size={13} />
            <span>Recent History</span>
            {memories.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#B87B22] text-white text-[10px]">
                {memories.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: REVISIT MEMORIES */}
      {viewMode === "revisit" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#E5DFD5]">
            <div className="space-y-1">
              <h2 className="text-sm font-serif font-bold text-[#12161E] flex items-center gap-2">
                <Sparkles size={14} className="text-[#B87B22]" />
                <span>Places You've Explored &amp; Planned</span>
              </h2>
              <p className="text-xs text-[#70798B] max-w-xl leading-relaxed">
                O-Travelz remembers destinations you've viewed, mapped, or included in itineraries.
              </p>
            </div>

            {memories.length > 0 && (
              <button
                type="button"
                onClick={clearRecentPlaces}
                className="text-xs text-[#A84825] hover:underline transition-colors cursor-pointer font-medium"
              >
                Clear History
              </button>
            )}
          </div>

          {memories.length === 0 ? (
            <div
              data-testid="revisit-empty-state"
              className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-[#B87B22] flex items-center justify-center font-bold text-2xl">
                <History size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#12161E]">No travel memories yet</h3>
                <p className="text-xs sm:text-sm text-[#70798B] max-w-md mx-auto leading-relaxed">
                  As you discover destinations in Odisha, open detail cards, or view routes on the map, they will appear here as your personal history.
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToDiscover}
                className="px-5 py-2.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white font-bold text-xs shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Compass size={14} />
                <span>Discover Odisha Highlights</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {memories.map((mem) => {
                const badge = getStatusBadge(mem.status);
                const BadgeIcon = badge.icon;
                const imageUrl = mem.imageUrl || resolvePlaceImageUrl({ name: mem.name, category: mem.category }, "card");
                const timeAgo = new Date(mem.visitedAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={mem.id || mem.name}
                    data-testid={`revisit-card-${mem.id || mem.name}`}
                    className="group relative rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] hover:border-[#D1C8BA] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden text-[#12161E]"
                  >
                    {/* Photo Header */}
                    <div className="relative h-44 w-full bg-[#F2EEE7] overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={mem.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getPlaceImageUrl(mem.name, mem.category);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono border backdrop-blur-md flex items-center gap-1 shadow-xs ${badge.color}`}>
                          <BadgeIcon size={11} />
                          <span>{badge.label}</span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentPlace(mem.id || mem.name);
                          }}
                          className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-[#12161E] flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                          aria-label={`Remove ${mem.name} from memories`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Bottom Image Info */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-white/90 font-mono">
                            {mem.category}
                          </span>
                          <h3 className="font-serif font-bold text-base text-white leading-tight drop-shadow-sm truncate max-w-[200px]">
                            {mem.name}
                          </h3>
                        </div>

                        {mem.rating && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[#B87B22] text-xs font-bold">
                            <Star size={11} className="fill-[#B87B22] text-[#B87B22]" />
                            <span>{mem.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-[#70798B]">
                          <span className="flex items-center gap-1 text-[#3D4654] font-medium">
                            <MapPin size={11} className="text-[#B87B22]" />
                            <span>{mem.location || getPlaceRegion(mem.name)}</span>
                          </span>
                          <span className="font-mono text-[10px] text-[#70798B]">{timeAgo}</span>
                        </div>

                        {mem.description && (
                          <p className="text-xs text-[#70798B] line-clamp-2 leading-relaxed">
                            {mem.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons Strip */}
                      <div className="pt-3 border-t border-[#E5DFD5] flex items-center gap-2">
                        <button
                          type="button"
                          data-testid={`revisit-explore-${mem.id || mem.name}`}
                          onClick={() =>
                            onSelectPlace?.({
                              id: mem.id,
                              name: mem.name,
                              category: mem.category,
                              location: mem.location,
                              description: mem.description,
                              lat: mem.lat,
                              lon: mem.lon,
                              imageUrl: mem.imageUrl,
                            })
                          }
                          className="flex-1 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#12161E] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Explore Again</span>
                        </button>

                        <button
                          type="button"
                          data-testid={`revisit-plan-${mem.id || mem.name}`}
                          onClick={() => {
                            if (onPlanWithSinglePlace) {
                              onPlanWithSinglePlace({
                                id: mem.id,
                                name: mem.name,
                                category: mem.category,
                                location: mem.location,
                                description: mem.description,
                              });
                            }
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Compass size={12} />
                          <span>Plan Trip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SAVED WISHLIST */}
      {viewMode === "saved" && (
        <div className="space-y-6">
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
      )}
    </div>
  );
};
