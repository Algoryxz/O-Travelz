import React, { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Heart,
  Compass,
  CalendarDays,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { usePlaces, type ExtendedPlaceDetail } from "../../store/usePlaces";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";

interface DestinationsPageProps {
  onSelectPlace: (place: SelectedPlaceInfo) => void;
  onViewOnMap: (place: SelectedPlaceInfo) => void;
  onPlanTripWithPlace: (place: SelectedPlaceInfo) => void;
  initialSearch?: string;
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

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "temple", label: "Temples & Shrines" },
  { id: "monument", label: "Monuments & Forts" },
  { id: "nature", label: "Hills & Nature" },
  { id: "beach", label: "Beaches & Marine" },
  { id: "waterfall", label: "Waterfalls" },
  { id: "wildlife", label: "Wildlife & Parks" },
  { id: "museum", label: "Museums & Arts" },
  { id: "lake", label: "Lakes & Reservoirs" },
] as const;

export const DestinationsPage: React.FC<DestinationsPageProps> = ({
  onSelectPlace,
  onViewOnMap,
  onPlanTripWithPlace,
  initialSearch = "",
}) => {
  const { places, isLoading } = usePlaces();
  const { isSaved, toggleSavePlace } = useSavedPlaces();

  const [selectedRegion, setSelectedRegion] = useState<string>("All Regions");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // Region filter
      if (selectedRegion !== "All Regions" && place.region !== selectedRegion) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all") {
        const cat = place.category.toLowerCase();
        if (selectedCategory === "wildlife") {
          if (!cat.includes("wildlife") && !cat.includes("park")) return false;
        } else if (!cat.includes(selectedCategory)) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = place.name.toLowerCase().includes(q);
        const matchesDesc = (place.description || "").toLowerCase().includes(q);
        const matchesRegion = place.region.toLowerCase().includes(q);
        const matchesCategory = place.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesRegion && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [places, selectedRegion, selectedCategory, searchQuery]);

  return (
    <main
      data-testid="destinations-explore-view"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300"
    >
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#0b241d] text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              All Odisha Destinations ({places.length} Places)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Explore Destinations Across Odisha
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl leading-relaxed">
            Discover historic heritage temples, golden coastlines, misty hills of Daringbadi,
            wildlife sanctuaries, and tribal highlands throughout all regions of Odisha.
          </p>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="flex items-center gap-3 p-2 pl-4 rounded-2xl bg-white border border-gray-200 shadow-xs max-w-lg">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            data-testid="destinations-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by destination name, town, or theme..."
            className="w-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent border-0 outline-hidden py-1"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Region Selector Pills */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Filter by Region
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                data-testid={`region-filter-${region.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                onClick={() => setSelectedRegion(region)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                  selectedRegion === region
                    ? "bg-emerald-700 border-emerald-700 text-white shadow-xs"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Filter by Category
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                data-testid={`cat-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-gray-900 border-gray-900 text-white shadow-xs"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between gap-4 pt-2 border-b border-gray-200 pb-3">
        <div className="text-xs text-gray-600 font-medium">
          Showing <span className="font-bold text-gray-900">{filteredPlaces.length}</span>{" "}
          {filteredPlaces.length === 1 ? "destination" : "destinations"}
          {selectedRegion !== "All Regions" && ` in ${selectedRegion}`}
        </div>

        {(selectedRegion !== "All Regions" || selectedCategory !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedRegion("All Regions");
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Destinations Grid */}
      {filteredPlaces.length === 0 ? (
        <div
          data-testid="destinations-empty-state"
          className="p-12 text-center rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4"
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
            <Compass size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-gray-900">
              No destinations match your filters
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Try choosing another region, clearing your search term, or selecting &ldquo;All Categories&rdquo;.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedRegion("All Regions");
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          data-testid="destinations-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPlaces.map((place) => {
            const saved = isSaved(place.name);

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
                  })
                }
                className="group rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

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
                      });
                    }}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                      saved
                        ? "bg-rose-50 text-rose-600 shadow-md"
                        : "bg-black/40 text-white hover:bg-black/60"
                    }`}
                    aria-label={saved ? "Remove from saved" : "Save destination"}
                  >
                    <Heart size={15} className={saved ? "fill-rose-600" : ""} />
                  </button>

                  {/* Badges on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      {place.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-medium backdrop-blur-md flex items-center gap-1">
                      <MapPin size={10} />
                      <span>{place.region}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold font-display text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {place.description || `Explore ${place.name} in ${place.region}, Odisha.`}
                    </p>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
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
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Compass size={12} className="text-emerald-700" />
                      <span>Map</span>
                    </button>

                    <button
                      type="button"
                      data-testid={`plan-with-${place.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlanTripWithPlace({
                          id: place.id,
                          name: place.name,
                          category: place.category,
                          location: place.region,
                          description: place.description ?? undefined,
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
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
