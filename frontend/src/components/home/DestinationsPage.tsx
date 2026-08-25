import React, { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Heart,
  Compass,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { usePlaceSearch } from "../../store/usePlaces";
import { type ApiClient } from "../../api/client";
import { getPlaceImageUrl } from "../../utils/imageService";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";

import { CANONICAL_CATEGORIES, CANONICAL_INTERESTS, type PlaceListParams } from "../../types/api";
import {
  getLocalizedCategoryLabel,
  getLocalizedInterestLabel,
} from "../../types/multilingualTaxonomy";

interface DestinationsPageProps {
  onSelectPlace: (place: SelectedPlaceInfo) => void;
  onViewOnMap: (place: SelectedPlaceInfo) => void;
  onPlanTripWithPlace?: (place: SelectedPlaceInfo) => void;
  onPlanTrip?: (place: SelectedPlaceInfo) => void;
  selectedLocation?: string;
  initialSearch?: string;
  apiClient?: ApiClient;
}

const REGIONS = [
  "All Regions",
  "Puri & Coastal",
  "Konark & Marine",
  "Bhubaneswar & Central",
  "Cuttack & Mahanadi",
  "Chilika & Southern Coast",
  "Kandhamal & Southern Hills",
  "Sambalpur & Western Odisha",
  "Rourkela & Sundargarh",
  "Northern Odisha & Wildlife",
  "Koraput & Tribal Highlands",
] as const;

// All 13 verified canonical physical place categories derived from canonical contract
const CATEGORIES = [
  { id: "all", label: "All Categories" },
  ...CANONICAL_CATEGORIES,
] as const;

// 12 canonical traveler themes derived from canonical contract
const INTEREST_FILTERS = [
  { id: "all", label: "All Themes" },
  ...CANONICAL_INTERESTS,
] as const;

export const DestinationsPage: React.FC<DestinationsPageProps> = ({
  onSelectPlace,
  onViewOnMap,
  onPlanTripWithPlace,
  onPlanTrip,
  initialSearch = "",
  apiClient,
}) => {
  const handlePlanTrip = onPlanTripWithPlace || onPlanTrip || (() => {});
  const { isSaved, toggleSavePlace } = useSavedPlaces();

  const [selectedRegion, setSelectedRegion] = useState<string>("All Regions");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedInterest, setSelectedInterest] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; canonical_name: string }>>([]);

  // Fetch search suggestions when query changes
  React.useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const fetchSuggestions = async () => {
      try {
        if (apiClient) {
          const res = await apiClient.getSearchSuggestions(searchQuery.trim());
          if (!cancelled) {
            setSuggestions(res);
          }
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      }
    };
    const timer = setTimeout(fetchSuggestions, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, apiClient]);

  // Construct structured API search/filter parameters
  const searchParams: PlaceListParams = useMemo(() => {
    const p: PlaceListParams = {};
    if (searchQuery.trim()) {
      p.search = searchQuery.trim();
    }
    if (selectedCategory !== "all") {
      p.category = selectedCategory;
    }
    if (selectedInterest !== "all") {
      p.interest = selectedInterest;
    }
    if (selectedRegion !== "All Regions") {
      p.region = selectedRegion;
    }
    return p;
  }, [searchQuery, selectedCategory, selectedInterest, selectedRegion]);

  const { places, isLoading } = usePlaceSearch(searchParams, apiClient, 200);

  const filteredPlaces = places;

  return (
    <main
      data-testid="destinations-explore-view"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300"
    >
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-2xl bg-[#FAF7F2] text-[#12161E] border border-[#E5DFD5] shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#B87B22] font-mono">
              All Odisha Destinations ({places.length} Places)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#12161E]">
            Explore Destinations Across Odisha
          </h1>
          <p className="text-xs sm:text-sm text-[#3D4654] max-w-2xl leading-relaxed">
            Discover historic heritage temples, golden coastlines, authentic culinary sweet hubs,
            misty hills of Daringbadi, and tribal highlands throughout all regions of Odisha.
          </p>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="space-y-4">
        {/* Search input & Multilingual Hint */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 pl-4 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs max-w-lg focus-within:border-[#B87B22] transition-colors">
            <Search size={18} className="text-[#70798B] shrink-0" />
            <input
              type="text"
              data-testid="destinations-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, towns, or themes..."
              aria-label="Search destinations in English, Odia, or Hindi"
              className="w-full text-xs sm:text-sm text-[#12161E] placeholder-[#70798B] bg-transparent border-0 outline-hidden py-1 leading-normal"
            />
            {isLoading && (
              <div
                aria-hidden="true"
                className="w-4 h-4 rounded-full border-2 border-[#E5DFD5] border-t-[#B87B22] animate-spin shrink-0"
              />
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="text-xs text-[#70798B] hover:text-[#12161E] px-2 py-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 px-1 text-[11px] text-[#70798B] font-medium">
            <span className="text-[#B87B22] font-semibold">Multilingual:</span>
            <span>English · ଓଡ଼ିଆ · हिन्दी</span>
          </div>
        </div>

        {/* Region Selector Pills */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#70798B] font-mono">
            Filter by Region
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
            {REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                data-testid={`region-filter-${region.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                onClick={() => setSelectedRegion(region)}
                aria-pressed={selectedRegion === region}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border shrink-0 leading-normal ${
                  selectedRegion === region
                    ? "bg-[#12161E] border-[#12161E] text-white shadow-xs font-bold"
                    : "bg-[#FFFFFF] border-[#E5DFD5] text-[#3D4654] hover:text-[#12161E] hover:border-[#D1C8BA]"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* 13 Physical Category Filter Chips with Localized Annotations */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#70798B] font-mono">
            Filter by Category
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
            {CATEGORIES.map((cat) => {
              const localized = cat.id !== "all" ? getLocalizedCategoryLabel(cat.id, "or") : null;
              return (
                <button
                  key={cat.id}
                  type="button"
                  data-testid={`cat-filter-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-pressed={selectedCategory === cat.id}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border shrink-0 flex items-center gap-1.5 leading-normal ${
                    selectedCategory === cat.id
                      ? "bg-[#B87B22] border-[#B87B22] text-white shadow-xs font-bold"
                      : "bg-[#FFFFFF] border-[#E5DFD5] text-[#3D4654] hover:text-[#12161E] hover:border-[#D1C8BA]"
                  }`}
                >
                  <span>{cat.label}</span>
                  {localized && (
                    <span className={`text-[10px] ${selectedCategory === cat.id ? "text-amber-100" : "text-[#70798B]"}`}>
                      ({localized})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 12 Canonical Thematic Interest Filter Chips with Localized Annotations */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#70798B] font-mono flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#B87B22]" />
            <span>Filter by Experience / Theme</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
            {INTEREST_FILTERS.map((interest) => {
              const localized = interest.id !== "all" ? getLocalizedInterestLabel(interest.id, "or") : null;
              return (
                <button
                  key={interest.id}
                  type="button"
                  data-testid={`interest-filter-${interest.id}`}
                  onClick={() => setSelectedInterest(interest.id)}
                  aria-pressed={selectedInterest === interest.id}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border shrink-0 flex items-center gap-1.5 leading-normal ${
                    selectedInterest === interest.id
                      ? "bg-[#B87B22] border-[#B87B22] text-white shadow-xs font-bold"
                      : "bg-[#FFFFFF] border-[#E5DFD5] text-[#3D4654] hover:text-[#12161E] hover:border-[#D1C8BA]"
                  }`}
                >
                  <span>{interest.label}</span>
                  {localized && (
                    <span className={`text-[10px] ${selectedInterest === interest.id ? "text-amber-100" : "text-[#70798B]"}`}>
                      ({localized})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between gap-4 pt-2 border-b border-[#E5DFD5] pb-3">
        <div className="text-xs text-[#70798B] font-medium flex items-center gap-2" role="status" aria-atomic="true">
          <span>
            Showing <span className="font-bold text-[#12161E]">{filteredPlaces.length}</span>{" "}
            {filteredPlaces.length === 1 ? "destination" : "destinations"}
            {selectedRegion !== "All Regions" && ` in ${selectedRegion}`}
            {selectedCategory !== "all" && ` · ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`}
            {selectedInterest !== "all" && ` · ${INTEREST_FILTERS.find((i) => i.id === selectedInterest)?.label}`}
          </span>
          {isLoading && (
            <span className="text-[#B87B22] text-[11px] animate-pulse">Searching...</span>
          )}
        </div>

        {(selectedRegion !== "All Regions" || selectedCategory !== "all" || selectedInterest !== "all" || searchQuery) && (
          <button
            type="button"
            data-testid="reset-all-destination-filters"
            onClick={() => {
              setSelectedRegion("All Regions");
              setSelectedCategory("all");
              setSelectedInterest("all");
              setSearchQuery("");
            }}
            aria-label="Reset all destination filters and search"
            className="text-xs text-[#B87B22] hover:text-[#A0691B] font-bold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Grid of Destination Cards or Empty State */}
      {filteredPlaces.length === 0 ? (
        <div
          data-testid="no-destinations-found"
          className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-sm space-y-4"
        >
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#F2EEE7] text-[#70798B] flex items-center justify-center">
            <Compass size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#12161E]">
              {searchQuery.trim() ? "No destinations found" : "No destinations match these filters"}
            </h3>
            <p className="text-xs sm:text-sm text-[#70798B] max-w-sm mx-auto leading-relaxed">
              {searchQuery.trim() ? (
                <>
                  No places matched &ldquo;{searchQuery}&rdquo;. Try another place, district, category, or search in English, ଓଡ଼ିଆ, or हिन्दी.
                </>
              ) : (
                "No places matched your active category, region, or theme filters. Try adjusting or resetting your filter selections."
              )}
            </p>
            {suggestions.length > 0 && (
              <div data-testid="search-suggestions-container" className="pt-2 pb-1 space-y-2">
                <div className="text-xs text-[#3D4654] font-medium flex items-center justify-center gap-1.5">
                  <Sparkles size={14} className="text-[#B87B22]" />
                  <span>Did you mean:</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.canonical_name}
                      type="button"
                      data-testid={`search-suggestion-${s.canonical_name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      onClick={() => setSearchQuery(s.canonical_name)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2EEE7] border border-[#B87B22]/30 text-[#B87B22] text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      {s.canonical_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="px-4 py-2 rounded-lg bg-[#F2EEE7] hover:bg-[#EAE4DA] border border-[#E5DFD5] text-[#12161E] font-bold text-xs transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedRegion("All Regions");
                setSelectedCategory("all");
                setSelectedInterest("all");
                setSearchQuery("");
              }}
              aria-label="Reset all destination filters"
              className="px-4 py-2 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div
          data-testid="destinations-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredPlaces.map((place) => {
            const saved = isSaved(place.id || place.name);
            return (
              <div
                key={place.id}
                data-testid={`destination-card-${place.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                onClick={() =>
                  onSelectPlace({
                    id: place.id,
                    name: place.name,
                    category: place.category,
                    location: place.region,
                    description: place.description ?? undefined,
                    lat: place.lat,
                    lon: place.lon,
                    avg_visit_minutes: place.avg_visit_minutes,
                    price_tier: place.price_tier,
                    source: place.source,
                    verified_at: place.verified_at,
                    imageUrl: place.imageUrl,
                    images: place.images,
                    interests: place.interests,
                  })
                }
                className="group rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer hover:border-[#D1C8BA]"
              >
                {/* Image Container */}
                <div className="relative h-48 w-full bg-[#F2EEE7] overflow-hidden">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getPlaceImageUrl(place.name, place.category);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                  {/* Save Button */}
                  <button
                    type="button"
                    data-testid={`save-card-button-${place.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSavePlace({
                        id: place.id,
                        name: place.name,
                        category: place.category,
                        location: place.region,
                        description: place.description ?? undefined,
                        interests: place.interests,
                      });
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                      saved
                        ? "bg-[#A84825] text-white shadow-md"
                        : "bg-white/80 text-[#12161E] hover:bg-white border border-white/40"
                    }`}
                    aria-label={saved ? "Remove from saved" : "Save destination"}
                  >
                    <Heart size={14} className={saved ? "fill-white" : ""} />
                  </button>

                  {/* Badges on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF]/90 text-[#12161E] text-[10px] font-bold uppercase tracking-wider font-mono">
                      {place.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium backdrop-blur-md flex items-center gap-1">
                      <MapPin size={10} className="text-[#B87B22]" />
                      <span>{place.region}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-serif font-bold text-[#12161E] group-hover:text-[#B87B22] transition-colors line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-xs text-[#70798B] line-clamp-2 leading-relaxed">
                      {place.description || `Explore ${place.name} in ${place.region}, Odisha.`}
                    </p>

                    {/* Thematic Tags on Card */}
                    {place.interests && place.interests.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {place.interests.slice(0, 3).map((interestId) => (
                          <span
                            key={interestId}
                            className="px-2 py-0.5 rounded-md bg-[#F2EEE7] text-[#3D4654] text-[10px] font-semibold capitalize"
                          >
                            {interestId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      data-testid={`view-map-${place.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOnMap({
                          id: place.id,
                          name: place.name,
                          category: place.category,
                          location: place.region,
                          description: place.description ?? undefined,
                          lat: place.lat,
                          lon: place.lon,
                          interests: place.interests,
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#F2EEE7] hover:bg-[#EAE4DA] text-[#3D4654] hover:text-[#12161E] border border-[#E5DFD5] text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Compass size={12} className="text-[#B87B22]" />
                      <span>Map</span>
                    </button>

                    <button
                      type="button"
                      data-testid={`plan-with-${place.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanTrip({
                          id: place.id,
                          name: place.name,
                          category: place.category,
                          location: place.region,
                          description: place.description ?? undefined,
                          interests: place.interests,
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <CalendarDays size={12} />
                      <span>Plan Trip</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};
