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
  Clock,
  Calendar,
  CheckCircle2,
  Navigation,
  Check,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useSavedPlaces, type SavedPlaceItem } from "../../store/useSavedPlaces";
import { useRecentPlaces, type PlaceMemoryItem, type MemoryStatus } from "../../store/useRecentPlaces";
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
  const { memories, removeRecentPlace, updateMemoryStatus, clearRecentPlaces } = useRecentPlaces();

  const getStatusBadge = (status: MemoryStatus, tripTitle?: string) => {
    switch (status) {
      case "visited":
        return {
          label: "Visited Before",
          color: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
          icon: CheckCircle2,
        };
      case "planned":
        return {
          label: "Planned in Trip",
          color: "bg-teal-950/80 text-teal-300 border-teal-700/60",
          icon: Calendar,
        };
      case "navigated":
        return {
          label: "Navigated On Map",
          color: "bg-blue-950/80 text-blue-300 border-blue-700/60",
          icon: Navigation,
        };
      case "explored":
      default:
        return {
          label: "Explored",
          color: "bg-[#172235] text-amber-300 border-[#334155]",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#263244]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="saved-back-button"
            onClick={onBackToDiscover}
            className="w-10 h-10 rounded-2xl bg-[#111827] border border-[#263244] hover:bg-[#172235] flex items-center justify-center text-slate-300 shadow-xs transition-colors cursor-pointer"
            aria-label="Back to Discover"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#14B8A6] font-mono">
              YOUR PERSONAL TRAVEL SPACE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
              {viewMode === "saved" ? (
                <>
                  <Bookmark size={24} className="text-[#14B8A6]" />
                  <span>Saved Places</span>
                </>
              ) : (
                <>
                  <History size={24} className="text-[#F59E0B]" />
                  <span>Revisit Places &amp; Memories</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-[#111827] border border-[#263244] shadow-inner">
          <button
            type="button"
            data-testid="tab-saved-wishlist"
            onClick={() => setViewMode("saved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "saved"
                ? "bg-[#14B8A6] text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Bookmark size={14} />
            <span>Saved Wishlist</span>
            {savedPlaces.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-200 text-[10px]">
                {savedPlaces.length}
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="tab-revisit-places"
            onClick={() => setViewMode("revisit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "revisit"
                ? "bg-[#F59E0B] text-slate-950 shadow-md font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <History size={14} />
            <span>Revisit Places</span>
            {memories.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-200 text-[10px]">
                {memories.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: REVISIT MEMORIES */}
      {viewMode === "revisit" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-4 sm:p-5 rounded-3xl border border-[#263244]">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={15} className="text-[#F59E0B]" />
                <span>Places You've Explored &amp; Planned</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                O-Travelz remembers every destination you've viewed, mapped, or included in an itinerary.
                Explore again, mark as visited, or jump straight into planning your next trip!
              </p>
            </div>

            {memories.length > 0 && (
              <button
                type="button"
                onClick={clearRecentPlaces}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline transition-colors cursor-pointer font-medium"
              >
                Clear History
              </button>
            )}
          </div>

          {memories.length === 0 ? (
            <div
              data-testid="revisit-empty-state"
              className="p-12 text-center rounded-3xl bg-[#111827] border border-[#263244] shadow-xl space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#172235] border border-[#334155] text-amber-400 flex items-center justify-center font-bold text-2xl">
                <History size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No travel memories yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  As you discover destinations in Odisha, open detail cards, view routes on the map, or build itineraries, they will appear here as your personal revisit list.
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToDiscover}
                className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Compass size={14} />
                <span>Discover Odisha Highlights</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {memories.map((mem) => {
                const badge = getStatusBadge(mem.status, mem.tripAssociation?.title);
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
                    className="group relative rounded-3xl bg-[#111827] border border-[#263244] hover:border-amber-500/50 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Photo Header */}
                    <div className="relative h-44 w-full bg-[#0B1220] overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={mem.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getPlaceImageUrl(mem.name, mem.category);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/40" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono border backdrop-blur-md flex items-center gap-1 shadow-xs ${badge.color}`}>
                          <BadgeIcon size={11} />
                          <span>{badge.label}</span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentPlace(mem.id || mem.name);
                          }}
                          className="w-7 h-7 rounded-xl bg-black/50 hover:bg-rose-900/80 text-gray-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                          aria-label={`Remove ${mem.name} from memories`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Bottom Image Info */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-teal-300 font-mono">
                            {mem.category}
                          </span>
                          <h3 className="font-display font-bold text-base text-white leading-tight drop-shadow-sm truncate max-w-[200px]">
                            {mem.name}
                          </h3>
                        </div>

                        {mem.rating && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>{mem.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1 text-teal-300/90 font-medium">
                            <MapPin size={12} />
                            <span>{mem.location || getPlaceRegion(mem.name)}</span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{timeAgo}</span>
                        </div>

                        {mem.description && (
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {mem.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons Strip */}
                      <div className="pt-3 border-t border-[#263244] flex items-center gap-2">
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
                          className="flex-1 py-2 rounded-xl bg-[#172235] border border-[#263244] hover:bg-[#1E2D44] text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
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
                          className="flex-1 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Compass size={13} />
                          <span>Plan Trip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenMap({
                              id: mem.id,
                              name: mem.name,
                              category: mem.category,
                              location: mem.location,
                              lat: mem.lat,
                              lon: mem.lon,
                            })
                          }
                          title="Navigate on Map"
                          className="w-8 h-8 rounded-xl bg-[#172235] border border-[#263244] hover:border-[#14B8A6] text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Navigation size={13} />
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
              className="p-12 text-center rounded-3xl bg-[#111827] border border-[#263244] shadow-xl space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#172235] border border-[#334155] text-rose-400 flex items-center justify-center font-bold text-2xl">
                <Heart size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Nothing saved yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  When exploring destinations or discovering places in Odisha, tap the save icon to keep them here for quick planning.
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToDiscover}
                className="px-5 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Explore Odisha Destinations</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>
                  Showing <span className="font-bold text-white">{savedPlaces.length}</span> saved{" "}
                  {savedPlaces.length === 1 ? "place" : "places"}.
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    data-testid="saved-plan-all-cta"
                    onClick={() => onPlanWithSaved(savedPlaces)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Compass size={13} />
                    <span>Plan Trip with All Saved</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearAllSaved}
                    className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
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
                      className="group rounded-3xl bg-[#111827] border border-[#263244] hover:border-[#14B8A6]/60 shadow-md hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden text-white"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative h-36 w-full bg-[#0B1220] overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getPlaceImageUrl(item.name, item.category);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/30" />

                        <button
                          type="button"
                          data-testid={`remove-saved-${item.id || item.name}`}
                          onClick={() => removePlace(item.id || item.name)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/60 text-slate-300 hover:text-rose-400 hover:bg-rose-950/70 transition-colors cursor-pointer"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="absolute bottom-2 left-3 right-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 font-mono">
                            {item.category}
                          </span>
                          <h3
                            className="font-display font-bold text-sm text-white hover:text-teal-300 transition-colors cursor-pointer truncate"
                            onClick={() =>
                              onSelectPlace?.({
                                id: item.id,
                                name: item.name,
                                category: item.category,
                                location: item.location,
                                description: item.description,
                                distance: item.distance,
                                notes: item.notes,
                                tags: item.tags,
                                interests: item.interests,
                              })
                            }
                          >
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin size={11} className="text-[#14B8A6]" />
                            <span>{item.location || getPlaceRegion(item.name)}</span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-[#263244] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenMap({
                                id: item.id,
                                name: item.name,
                                category: item.category,
                                location: item.location,
                                description: item.description,
                              })
                            }
                            className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <MapPin size={12} className="text-[#14B8A6]" />
                            <span>Map</span>
                          </button>

                          <button
                            type="button"
                            data-testid={`plan-single-saved-${item.id || item.name}`}
                            onClick={() => {
                              if (onPlanWithSinglePlace) {
                                onPlanWithSinglePlace({
                                  id: item.id,
                                  name: item.name,
                                  category: item.category,
                                  location: item.location,
                                  description: item.description,
                                });
                              }
                            }}
                            className="px-3 py-1 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Compass size={12} />
                            <span>Plan</span>
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
