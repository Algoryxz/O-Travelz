import { motion } from "motion/react";
import { buttonTap, cardHover, cardTap, chipTap } from "../../lib/motion";
import React, { useState, useMemo } from "react";
import { Compass, Sparkles, MapPin, ArrowLeft, Star, Clock } from "lucide-react";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";
import {
  getFeaturedOdishaDestinations,
  getPlaceImageUrl,
  getPlaceRegion,
  getCategoryImage,
  DEFAULT_FALLBACK_IMAGE,
} from "../../utils/imageService";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { resolvePlaceImageUrl } from "../../utils/imageAdapter";
import { CANONICAL_INTEREST_LABELS } from "../../utils/timelineService";

interface CategoryExplorePageProps {
  categoryId: string;
  categoryTitle: string;
  categoryDescription?: string;
  onBack: () => void;
  onSelectPlace?: (place: SelectedPlaceInfo) => void;
  onPlanWithSinglePlace?: (place: SelectedPlaceInfo) => void;
}

export const CategoryExplorePage: React.FC<CategoryExplorePageProps> = ({
  categoryId,
  categoryTitle,
  categoryDescription,
  onBack,
  onSelectPlace,
  onPlanWithSinglePlace,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedTheme, setSelectedTheme] = useState<string>("All");
  const { isPlaceSaved, toggleSavedPlace } = useSavedPlaces();

  const allDestinations = useMemo(() => getFeaturedOdishaDestinations(), []);

  const categoryDestinations = useMemo(() => {
    return allDestinations.filter((d) => {
      const matchCat = d.category?.toLowerCase() === categoryId.toLowerCase();
      return matchCat;
    });
  }, [allDestinations, categoryId]);

  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    categoryDestinations.forEach((d) => {
      const r = getPlaceRegion(d.name);
      if (r) set.add(r);
    });
    return ["All", ...Array.from(set).sort()];
  }, [categoryDestinations]);

  const availableThemes = useMemo(() => {
    const set = new Set<string>();
    categoryDestinations.forEach((d) => {
      if (Array.isArray(d.interests)) {
        d.interests.forEach((i: string) => set.add(i));
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [categoryDestinations]);

  const filteredDestinations = useMemo(() => {
    return categoryDestinations.filter((d) => {
      if (selectedRegion !== "All") {
        const r = getPlaceRegion(d.name);
        if (r !== selectedRegion) return false;
      }
      if (selectedTheme !== "All") {
        if (!Array.isArray(d.interests) || !d.interests.includes(selectedTheme)) {
          return false;
        }
      }
      return true;
    });
  }, [categoryDestinations, selectedRegion, selectedTheme]);

  const heroImage = getCategoryImage(categoryId) || DEFAULT_FALLBACK_IMAGE;

  return (
    <div
      data-testid="category-explore-view"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#12161E]"
    >
      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[300px] flex flex-col justify-end p-6 sm:p-10 shadow-lg border border-[#E5DFD5]">
        <img
          src={heroImage}
          alt={categoryTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <button
            type="button"
            data-testid="category-explore-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to All Categories</span>
          </button>

          <h1
            data-testid="category-explore-title"
            className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight"
          >
            {categoryTitle}
          </h1>

          {categoryDescription && (
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              {categoryDescription}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1 text-xs text-white/80 font-mono">
            <span>
              {filteredDestinations.length} of {categoryDestinations.length} places shown
            </span>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="space-y-4 bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DFD5] shadow-xs">
        {/* Region Filter */}
        {availableRegions.length > 2 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#70798B] uppercase tracking-wider font-mono mr-1">
              Region:
            </span>
            {availableRegions.map((region) => (
              <button
                key={region}
                type="button"
                data-testid={`filter-region-${region.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                  selectedRegion === region
                    ? "bg-[#B87B22] text-white border-[#B87B22]"
                    : "bg-[#FAF7F2] text-[#3D4654] border-[#E5DFD5] hover:bg-[#F2EEE7]"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        )}

        {/* Theme/Interest Filter */}
        {availableThemes.length > 2 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#70798B] uppercase tracking-wider font-mono mr-1">
              Theme:
            </span>
            {availableThemes.map((theme) => (
              <button
                key={theme}
                type="button"
                data-testid={`filter-theme-${theme.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                onClick={() => setSelectedTheme(theme)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                  selectedTheme === theme
                    ? "bg-[#1B5E6B] text-white border-[#1B5E6B]"
                    : "bg-[#FAF7F2] text-[#3D4654] border-[#E5DFD5] hover:bg-[#F2EEE7]"
                }`}
              >
                {CANONICAL_INTEREST_LABELS[theme] || theme}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Destination Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#F2EEE7] text-[#70798B] flex items-center justify-center font-bold text-xl font-mono">
            ∅
          </div>
          <h3 className="text-base font-serif font-bold text-[#12161E]">
            No destinations found matching these filters
          </h3>
          <p className="text-xs text-[#70798B] max-w-sm mx-auto">
            Try resetting your regional or thematic filters above to discover more {categoryTitle} locations.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedRegion("All");
              setSelectedTheme("All");
            }}
            className="px-4 py-2 rounded-xl bg-[#B87B22] text-white text-xs font-bold shadow-xs hover:bg-[#A0691B] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => {
            const isSaved = isPlaceSaved(dest.id || dest.name);
            const imageUrl = resolvePlaceImageUrl({ name: dest.name, category: dest.category }, "card");
            const region = getPlaceRegion(dest.name);

            return (
              <div
                key={dest.id || dest.name}
                data-testid={`category-destination-card-${dest.id || dest.name}`}
                className="group rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] hover:border-[#D1C8BA] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden text-[#12161E]"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full bg-[#F2EEE7] overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getPlaceImageUrl(dest.name, dest.category);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    data-testid={`save-btn-${dest.id || dest.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSavedPlace({
                        id: dest.id,
                        name: dest.name,
                        category: dest.category,
                        location: dest.location || region,
                        description: dest.description,
                        interests: dest.interests,
                      });
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                      isSaved
                        ? "bg-[#B87B22] text-white"
                        : "bg-black/30 hover:bg-black/50 text-white"
                    }`}
                    aria-label={isSaved ? `Remove ${dest.name} from saved` : `Save ${dest.name}`}
                  >
                    <Star size={14} className={isSaved ? "fill-white" : ""} />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 font-mono">
                      {dest.category}
                    </span>
                    <h3
                      className="font-serif font-bold text-lg text-white hover:text-[#B87B22] transition-colors cursor-pointer truncate"
                      onClick={() =>
                        onSelectPlace?.({
                          id: dest.id,
                          name: dest.name,
                          category: dest.category,
                          location: dest.location || region,
                          description: dest.description,
                          interests: dest.interests,
                        })
                      }
                    >
                      {dest.name}
                    </h3>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-xs text-[#70798B] flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[#3D4654] font-medium">
                        <MapPin size={12} className="text-[#B87B22]" />
                        <span>{region}</span>
                      </span>
                      {dest.ideal_duration && (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock size={11} className="text-[#1B5E6B]" />
                          <span>{dest.ideal_duration}</span>
                        </span>
                      )}
                    </div>

                    {dest.description && (
                      <p className="text-xs text-[#3D4654] line-clamp-2 leading-relaxed">
                        {dest.description}
                      </p>
                    )}

                    {Array.isArray(dest.interests) && dest.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {dest.interests.slice(0, 3).map((interest: string) => (
                          <span
                            key={interest}
                            className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E5DFD5] text-[10px] font-medium text-[#70798B]"
                          >
                            {CANONICAL_INTEREST_LABELS[interest] || interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[#E5DFD5]">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectPlace?.({
                          id: dest.id,
                          name: dest.name,
                          category: dest.category,
                          location: dest.location || region,
                          description: dest.description,
                          interests: dest.interests,
                        })
                      }
                      className="flex-1 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#12161E] text-xs font-semibold transition-colors text-center cursor-pointer border border-[#E5DFD5]"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onPlanWithSinglePlace) {
                          onPlanWithSinglePlace({
                            id: dest.id,
                            name: dest.name,
                            category: dest.category,
                            location: dest.location || region,
                            description: dest.description,
                            interests: dest.interests,
                          });
                        }
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-xs transition-colors text-center cursor-pointer"
                    >
                      Plan Trip
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
