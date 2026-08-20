import React, { useState, useMemo } from "react";
import {
  Crosshair,
  Layers3,
  Bot,
  ArrowUpRight,
  CloudRain,
  Mountain,
  Hospital,
  Landmark,
  WalletCards,
  Coffee,
  ShoppingBag,
  Heart,
  Navigation,
  TrainFront,
  MapPin,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { useWeather } from "../../store/useWeather";
import { usePlaces } from "../../store/usePlaces";
import type { SelectedPlaceInfo } from "../place/PlaceDetailsModal";
import { CoverflowCarousel, type CoverflowItem } from "../gallery/CoverflowCarousel";
import {
  getFeaturedOdishaDestinations,
  getPlaceImageUrl,
  getPlaceRegion,
  getCategoryImage,
  DEFAULT_FALLBACK_IMAGE,
} from "../../utils/imageService";

// Helper function to calculate distance in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

interface HomeSectionsProps {
  selectedLocation: string;
  userCoords?: { lat: number, lon: number } | null;
  onNavigateToPlan: () => void;
  onNavigateToMap: (place?: SelectedPlaceInfo) => void;
  onNavigateToCopilot: () => void;
  onSelectCategory: (category: string) => void;
  onSelectPlace: (place: SelectedPlaceInfo) => void;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({
  selectedLocation,
  userCoords,
  onNavigateToPlan,
  onNavigateToMap,
  onNavigateToCopilot,
  onSelectCategory,
  onSelectPlace,
}) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const { savedPlaces, isSaved, toggleSavePlace } = useSavedPlaces();
  const { weather, isLoading: isWeatherLoading } = useWeather(selectedLocation);
  const { places } = usePlaces();

  // Carousel #1: Featured Whole-Odisha Destinations
  const discoveryCarouselItems: CoverflowItem[] = useMemo(() => {
    const featured = getFeaturedOdishaDestinations();
    return featured.map((item) => ({
      id: item.id,
      title: item.name,
      category: item.category,
      location: item.location,
      description: item.description,
      imageUrl: item.imageUrl,
    }));
  }, []);

  // Carousel #2: Saved / Recommended Places to Explore
  const savedAndExploreItems: CoverflowItem[] = useMemo(() => {
    if (savedPlaces.length > 0) {
      return savedPlaces.map((sp) => ({
        id: sp.id,
        title: sp.name,
        category: sp.category,
        location: sp.location || getPlaceRegion(sp.name),
        description: sp.description || sp.notes || `Saved travel destination in Odisha.`,
        imageUrl: getPlaceImageUrl(sp.name, sp.category),
      }));
    }

    // Default Curated recommendations if no saved places yet
    return [
      {
        id: "rec-daringbadi",
        title: "Daringbadi Pine Hills",
        category: "Hills & Nature",
        location: "Kandhamal & Southern Hills",
        description: "Mist-covered pine forests, coffee plantations, and cool mountain breezes.",
        imageUrl: getPlaceImageUrl("daringbadi hill station", "nature"),
      },
      {
        id: "rec-chilika",
        title: "Chilika Mangalajodi",
        category: "Wetland & Birds",
        location: "Chilika & Southern Coast",
        description: "Eco-tourism haven with wooden boat birding tours in Asia's largest lagoon.",
        imageUrl: getPlaceImageUrl("chilika lake", "nature"),
      },
      {
        id: "rec-similipal",
        title: "Similipal Tiger Reserve",
        category: "Wildlife & Forests",
        location: "Northern Odisha & Wildlife",
        description: "Deep Sal forests, waterfalls, and rich wildlife in Mayurbhanj.",
        imageUrl: getPlaceImageUrl("similipal national park", "wildlife"),
      },
      {
        id: "rec-puri",
        title: "Puri Golden Beach",
        category: "Coastal Beach",
        location: "Puri & Coastal",
        description: "Blue Flag certified beach with golden sands and seaside promenades.",
        imageUrl: getPlaceImageUrl("puri golden beach", "beach"),
      },
      {
        id: "rec-deomali",
        title: "Deomali Peak Koraput",
        category: "Highlands & Treks",
        location: "Koraput & Tribal Highlands",
        description: "Spectacular misty clouds and high ridge treks at Odisha's highest peak.",
        imageUrl: getPlaceImageUrl("deomali peak", "nature"),
      },
    ];
  }, [savedPlaces]);

  // Categories resolved through central image pipeline
  const categories = useMemo(() => {
    return [
      {
        label: "Nature",
        icon: Mountain,
        image: getCategoryImage("nature"),
      },
      {
        label: "Medical Help",
        icon: Hospital,
        image: getCategoryImage("medical help"),
      },
      {
        label: "Heritage & Culture",
        icon: Landmark,
        image: getCategoryImage("heritage & culture"),
      },
      {
        label: "ATMs",
        icon: WalletCards,
        image: getCategoryImage("atms"),
      },
      {
        label: "Hangout & Chill",
        icon: Coffee,
        image: getCategoryImage("hangout & chill"),
      },
      {
        label: "Shopping & Fashion",
        icon: ShoppingBag,
        image: getCategoryImage("shopping & fashion"),
      },
    ];
  }, []);

  const nearbyPlaces = useMemo(() => {
    if (!places || places.length === 0) return [];
    
    // Determine the reference coordinates. Default to Bhubaneswar if none.
    const refLat = userCoords?.lat ?? 20.2961;
    const refLon = userCoords?.lon ?? 85.8245;

    return places
      .filter(place => place.lat != null && place.lon != null)
      .map(place => {
        const dist = calculateDistance(refLat, refLon, place.lat as number, place.lon as number);
        return {
          title: place.name,
          type: place.category.toUpperCase(),
          category: place.category,
          distance: dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`,
          distanceValue: dist,
          status: "Available",
          note: (place.description || "").substring(0, 60) + "...",
          rating: 4.5,
        };
      })
      .sort((a, b) => a.distanceValue - b.distanceValue)
      .slice(0, 4);
  }, [places, userCoords]);

  const detourPlaces = useMemo(() => {
    return [
      {
        name: "Konark Sun Temple",
        category: "Heritage & Culture",
        tag: "HERITAGE & CULTURE · 65 KM",
        desc: "Stone chariot sanctuary, intricate wheels, and a legendary coastline.",
        imageUrl: getPlaceImageUrl("konark sun temple", "monument"),
      },
      {
        name: "Chilika Lake",
        category: "Nature",
        tag: "NATURE · 104 KM · ROUTE 02",
        desc: "Asia's largest brackish lagoon with quiet waters and migratory birds.",
        imageUrl: getPlaceImageUrl("chilika lake", "nature"),
      },
      {
        name: "Daringbadi",
        category: "Nature",
        tag: "HILL STATION · 245 KM",
        desc: "Misty pine forest valleys, coffee gardens, and cool mountain air.",
        imageUrl: getPlaceImageUrl("daringbadi hill station", "nature"),
      },
      {
        name: "Similipal National Park",
        category: "Wildlife",
        tag: "WILDLIFE · 270 KM · ROUTE 04",
        desc: "Deep Sal jungles, tiger reserve, and cascading waterfalls.",
        imageUrl: getPlaceImageUrl("similipal national park", "wildlife"),
      },
    ];
  }, []);

  const handleCarouselSelect = (item: CoverflowItem) => {
    onSelectPlace({
      id: item.id,
      name: item.title,
      category: item.category,
      location: item.location,
      description: item.description,
      imageUrl: item.imageUrl,
    });
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. Context Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-2 sm:p-3 rounded-3xl bg-[#09221b] text-white border border-emerald-800/40 grid grid-cols-1 md:grid-cols-3 gap-2 shadow-md">
          <button
            type="button"
            onClick={() => onNavigateToMap()}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 text-emerald-300 flex items-center justify-center shrink-0">
              <Crosshair size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">Location active</div>
              <div className="text-[11px] text-emerald-300/80 truncate">
                {selectedLocation}, Odisha
              </div>
            </div>
            <ArrowUpRight size={15} className="ml-auto text-emerald-400/60 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateToMap()}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left border-t md:border-t-0 md:border-l border-emerald-900/40 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 text-emerald-300 flex items-center justify-center shrink-0">
              <Layers3 size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">See what&apos;s active now</div>
              <div className="text-[11px] text-emerald-300/80 truncate">
                Explore nearby attractions &amp; services
              </div>
            </div>
            <ArrowUpRight size={15} className="ml-auto text-emerald-400/60 shrink-0" />
          </button>

          <button
            type="button"
            onClick={onNavigateToCopilot}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left border-t md:border-t-0 md:border-l border-emerald-900/40 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 text-emerald-300 flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">Ask your travel copilot</div>
              <div className="text-[11px] text-emerald-300/80 truncate">
                &ldquo;What can I do this weekend?&rdquo;
              </div>
            </div>
            <ArrowUpRight size={15} className="ml-auto text-emerald-400/60 shrink-0" />
          </button>
        </div>
      </section>

      {/* 2. Weather Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="weather-banner-section">
        <div className="p-5 sm:p-6 rounded-3xl bg-[#09221b] text-white border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <CloudRain size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                <span>LOCAL WEATHER · {selectedLocation.toUpperCase()}</span>
                {weather?.current.provider && (
                  <span className="text-[9px] text-emerald-400/60 font-sans normal-case">
                    (via {weather.current.provider})
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                  {weather ? `${Math.round(weather.current.temperature_c)}°C` : isWeatherLoading ? "--°C" : "28°C"}
                </span>
                <span className="text-xs text-emerald-200 font-medium">
                  {weather?.current.condition || (isWeatherLoading ? "Loading..." : "Pleasant")}
                </span>
                {weather?.current.humidity_pct != null && (
                  <span className="text-xs text-emerald-300/70 font-mono">
                    💧 {weather.current.humidity_pct}% humidity
                  </span>
                )}
                {weather?.current.wind_speed_kmh != null && (
                  <span className="text-xs text-emerald-300/70 font-mono hidden sm:inline">
                    💨 {Math.round(weather.current.wind_speed_kmh)} km/h
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-emerald-200/80">
            <span className="italic max-w-sm">
              {weather?.current.advice || "Check local conditions before departing for regional travel."}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800 shrink-0">
              {weather?.current.status === "available" ? "LIVE FORECAST" : "FORECAST"}
            </span>
          </div>
        </div>
      </section>

      {/* 3. COVERFLOW CAROUSEL #1: Destination Discovery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="discovery-coverflow-section">
        <CoverflowCarousel
          items={discoveryCarouselItems}
          tag="DESTINATION DISCOVERY"
          title="Iconic Odisha Highlights"
          subtitle="Swipe or use arrow keys to immerse yourself in Odisha's top-ranked destinations."
          onSelectItem={handleCarouselSelect}
          onExploreItem={handleCarouselSelect}
        />
      </section>

      {/* 4. Popular Categories Section - Responsive 3-Column Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
              BROWSE BY CATEGORY
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mt-0.5">
              Popular Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={onNavigateToPlan}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Plan by category</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Choose a category to explore verified destinations and jumpstart your trip itinerary.
        </p>

        {/* 3-Column Responsive Grid with Proportional Aspect Ratios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                data-testid={`category-card-${cat.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                onClick={() => onSelectCategory(cat.label)}
                className="group relative h-48 sm:h-52 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 text-white border border-gray-200/50 dark:border-slate-800 cursor-pointer bg-slate-900"
              >
                {/* Semantic Category Background Image */}
                <img
                  src={cat.image.src}
                  alt={cat.image.alt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover brightness-85 group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE.src;
                  }}
                />

                {/* Gradient Overlay for Crisp Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top Icon Badge */}
                <div className="relative z-10 w-9 h-9 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-md border border-white/10">
                  <Icon size={18} />
                </div>

                {/* Bottom Title & Action Button */}
                <div className="relative z-10 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-display text-white leading-tight">
                      {cat.label}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] text-emerald-300 font-mono tracking-wider">
                      EXPLORE DESTINATIONS
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                  >
                    <span>Explore</span>
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Nearby & Active Now */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="live-dot" /> PLACES NEAR {selectedLocation.toUpperCase()}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mt-0.5">
              Nearby &amp; Active Now
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Popular spots and services close to your location.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "All" },
              { id: "open-now", label: "Open Now" },
              { id: "top-rated", label: "Top Rated" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                data-testid={`nearby-filter-${f.id}`}
                onClick={() => setActiveFilter(f.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === f.label
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2x2 Dark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearbyPlaces
            .filter((place) => {
              if (activeFilter === "Open Now") {
                return place.status === "Open now" || place.status === "Available";
              }
              if (activeFilter === "Top Rated") {
                return place.rating >= 4.6;
              }
              return true;
            })
            .map((place) => {
              const saved = isSaved(place.title);
              return (
                <div
                  key={place.title}
                  data-testid={`nearby-place-${place.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  onClick={() =>
                    onSelectPlace({
                      name: place.title,
                      category: place.category,
                      distance: place.distance,
                      description: place.note,
                    })
                  }
                  className="p-4 sm:p-5 rounded-3xl bg-[#0c241e] text-white border border-emerald-900/40 hover:border-emerald-500/40 transition-all flex items-start justify-between gap-4 cursor-pointer shadow-md group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-950 border border-emerald-800/60 text-emerald-300 flex flex-col items-center justify-center p-1 shrink-0">
                      <span className="text-[8px] font-bold uppercase tracking-tight text-center leading-none">
                        {place.type.split(" ")[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm sm:text-base text-white truncate">
                        {place.title}
                      </div>
                      <div className="text-xs text-emerald-300/80 flex items-center gap-2 mt-0.5">
                        <span>{place.distance}</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-medium">● {place.status}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {place.note}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSavePlace({
                          id: place.title,
                          name: place.title,
                          category: place.category,
                          distance: place.distance,
                          notes: place.note,
                        });
                      }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                        saved
                          ? "text-red-400 bg-red-950/40"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                      aria-label={`Save ${place.title}`}
                    >
                      <Heart
                        size={15}
                        fill={saved ? "currentColor" : "none"}
                      />
                    </button>
                    <ArrowUpRight
                      size={15}
                      className="text-gray-400 group-hover:text-emerald-400 transition-colors"
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* 6. Worth the Detour Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
              WORTH THE DETOUR
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mt-0.5">
              Places to put on your map.
            </h2>
          </div>
          <button
            type="button"
            onClick={onNavigateToPlan}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Build an itinerary</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* 4 Cards Gallery with object-cover image container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {detourPlaces.map((item) => (
            <div
              key={item.name}
              className="relative h-80 sm:h-88 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-end p-4 sm:p-5 text-white bg-slate-900 border border-gray-200/40 dark:border-slate-800"
            >
              {/* Background Image */}
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover brightness-85 group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE.src;
                }}
              />

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#041a13] via-[#041a13]/50 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
                  {item.tag}
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display leading-tight text-white line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
                <div className="pt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectPlace({
                        name: item.name,
                        category: item.category,
                        description: item.desc,
                        imageUrl: item.imageUrl,
                      })
                    }
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <Navigation size={12} />
                    <span>Explore Place</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateToMap({
                        name: item.name,
                        category: item.category,
                        description: item.desc,
                        imageUrl: item.imageUrl,
                      })
                    }
                    className="p-1.5 sm:p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                    aria-label="View on map"
                  >
                    <MapPin size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. COVERFLOW CAROUSEL #2: Saved / Recommended Places */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="saved-explore-coverflow-section">
        <CoverflowCarousel
          items={savedAndExploreItems}
          tag={savedPlaces.length > 0 ? "YOUR SAVED WISHLIST" : "PLACES TO EXPLORE"}
          title={savedPlaces.length > 0 ? "Your Saved Odisha Places" : "Handpicked Destinations to Put on Your Radar"}
          subtitle={
            savedPlaces.length > 0
              ? "All your saved spots ready for your next custom travel itinerary."
              : "Curated hill stations, wildlife wetlands, and ancient shrines worth adding to your journey."
          }
          onSelectItem={handleCarouselSelect}
          onExploreItem={handleCarouselSelect}
        />
      </section>

      {/* 8. Plan Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#dbe8d8] dark:bg-[#0f2d24] text-[#142c26] dark:text-[#d1e6de] border border-[#bed3be] dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 font-mono">
              YOUR NEXT CHAPTER
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#142c26] dark:text-white">
              Make a day of it.
            </h2>
            <p className="text-xs sm:text-sm text-[#4a6358] dark:text-emerald-300/80 max-w-xl">
              Tell us the time you have. We&apos;ll connect the places that make the route feel worth it.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToPlan}
            className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-display font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Plan my trip</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* 9. Essentials for the Road */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
              ALWAYS WITHIN REACH
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mt-0.5">
              Essentials for the road.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToMap()}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open map</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Convenient services across Odisha. Open the map to check nearby options before you leave.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            data-testid="essential-medical"
            onClick={() => onSelectCategory("Medical Help")}
            className="p-4 sm:p-5 rounded-3xl bg-[#0a231c] text-white border border-emerald-900/40 hover:border-emerald-500/40 text-left transition-all shadow-md group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center shrink-0">
                <Hospital size={20} />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white">Medical help</div>
                <div className="text-[11px] text-emerald-300/80">Hospitals &amp; clinics</div>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-emerald-400/60 group-hover:text-emerald-300" />
          </button>

          <button
            type="button"
            data-testid="essential-atm"
            onClick={() => onSelectCategory("ATMs")}
            className="p-4 sm:p-5 rounded-3xl bg-[#0a231c] text-white border border-emerald-900/40 hover:border-emerald-500/40 text-left transition-all shadow-md group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center shrink-0">
                <WalletCards size={20} />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white">Nearest ATM</div>
                <div className="text-[11px] text-emerald-300/80">Cash points &amp; kiosks</div>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-emerald-400/60 group-hover:text-emerald-300" />
          </button>

          <button
            type="button"
            data-testid="essential-transport"
            onClick={() => onNavigateToMap()}
            className="p-4 sm:p-5 rounded-3xl bg-[#0a231c] text-white border border-emerald-900/40 hover:border-emerald-500/40 text-left transition-all shadow-md group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center shrink-0">
                <TrainFront size={20} />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white">Transport</div>
                <div className="text-[11px] text-emerald-300/80">Routes, stations &amp; transit</div>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-emerald-400/60 group-hover:text-emerald-300" />
          </button>
        </div>
      </section>
    </div>
  );
};
