import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";

import { getPlaceImageUrl } from "../../utils/imageService";

interface OdishaHeroProps {
  selectedLocation: string;
  onSearch?: (term: string) => void;
  onSurpriseMe?: () => void;
  onSelectDestination?: (name: string) => void;
  onViewAllDestinations?: () => void;
  destinationSearch?: string;
  onSearchChange?: (term: string) => void;
  onNavigateToPlan?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToCopilot?: () => void;
  onSelectCategory?: (cat: string) => void;
  onSelectPlace?: (place: any) => void;
}

export const OdishaHero: React.FC<OdishaHeroProps> = ({
  selectedLocation,
  onSearch,
  onSurpriseMe,
  onSelectDestination,
  onViewAllDestinations,
  destinationSearch,
  onSearchChange,
  onNavigateToPlan,
  onNavigateToMap,
  onNavigateToCopilot,
  onSelectCategory,
  onSelectPlace,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const destinations = [
    {
      name: "Daringbadi",
      category: "Hills · Nature",
      detail: "Cool climate · 280 km",
      quote: "Monsoon air and mountain roads",
      bgImage: getPlaceImageUrl("place_daringbadi_001"),
    },
    {
      name: "Chilika Lake",
      category: "Wildlife · Nature",
      detail: "Dolphins · Flamingos",
      quote: "Slow water, wide skies",
      bgImage: getPlaceImageUrl("place_chilika_001"),
    },
    {
      name: "Konark Sun Temple",
      category: "Heritage · UNESCO",
      detail: "Open now · 6:00 PM",
      quote: "Stone, shadow, and a coastline that makes history bigger",
      bgImage: getPlaceImageUrl("place_konark_001"),
    },
    {
      name: "Puri Beach",
      category: "Beach · Coastal",
      detail: "60 km · High season",
      quote: "Salt air, long walks, and an easy coastal reset",
      bgImage: getPlaceImageUrl("place_puri_002"),
    },
  ];

  const [offsetY, setOffsetY] = useState(0);

  // Subtle parallax effect on scroll (respects reduced motion)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduced) {
          setOffsetY(Math.min(window.scrollY * 0.18, 120));
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-cycle hero slides
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % destinations.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, destinations.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch?.(searchTerm.trim());
      onSearchChange?.(searchTerm.trim());
    }
  };

  const current = destinations[activeSlide];

  return (
    <section className="relative overflow-hidden bg-[#0B1220] border-b border-[#263244]">
      {/* Background Image Carousel with Parallax, Crossfade & Refined Vignette */}
      <div
        className="absolute inset-0 will-change-transform pointer-events-none"
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        {destinations.map((dest, idx) => (
          <div
            key={dest.name}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
              idx === activeSlide ? "opacity-75 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ backgroundImage: `url('${dest.bgImage}')` }}
          />
        ))}
      </div>

      {/* Sophisticated Dark Neutral Gradient Overlay preserving photograph visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220]/90 via-[#0B1220]/35 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-black/20 pointer-events-none" />

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headings, Search & Surprise Me */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live location badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827]/90 border border-[#263244] text-slate-200 text-xs font-semibold backdrop-blur-md shadow-xs">
            <span className="live-dot" />
            <MapPin size={13} className="text-[#14B8A6]" />
            <span>{selectedLocation} · Live Hub</span>
          </div>

          <div className="space-y-3">
            <div className="text-[#14B8A6] text-xs font-bold uppercase tracking-wider font-mono">
              ODISHA, YOUR WAY · TRAVEL INTELLIGENCE
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.08]">
              Discover everything<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] via-[#2DD4BF] to-[#38BDF8]">
                in Odisha.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal">
              Temples · Beaches · Cafés · Nature · Shopping · Food · Heritage · Trails
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-light">
              Authentic route curation for tourists, locals, students, and explorers.
            </p>
          </div>

          {/* Search Bar Pill */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="flex items-center gap-2 p-1.5 pl-4 bg-[#111827] rounded-2xl shadow-xl max-w-lg border border-[#263244] focus-within:border-[#14B8A6] transition-colors">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Find places near ${selectedLocation}...`}
                className="w-full text-xs sm:text-sm text-white placeholder-slate-400 bg-transparent border-0 outline-hidden py-2"
                aria-label="Search places"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-display font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Surprise Me Button & Subtext */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              data-testid="hero-surprise-me-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSurpriseMe?.();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172235] hover:bg-[#1E2D44] border border-[#263244] hover:border-[#14B8A6] text-white font-display font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Sparkles size={16} className="text-[#F59E0B]" />
              <span>Surprise Me</span>
              <ArrowRight size={14} className="text-[#14B8A6]" />
            </button>
            <span className="text-xs text-slate-400">
              Location-aware · open places near you
            </span>
          </div>
        </div>

        {/* Right Column: Destination Cards Stack */}
        <div className="lg:col-span-5 space-y-3">
          <div className="space-y-2.5">
            {destinations.map((dest, idx) => {
              const isActive = idx === activeSlide;
              return (
                <div
                  key={dest.name}
                  onClick={() => {
                    setActiveSlide(idx);
                    onSelectDestination?.(dest.name);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isActive
                      ? "bg-[#172235] border border-[#14B8A6] shadow-xl backdrop-blur-md translate-x-1"
                      : "bg-[#111827]/90 hover:bg-[#172235]/70 border border-[#263244] backdrop-blur-sm"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-[#14B8A6]/20 text-teal-300 border border-[#14B8A6]/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm text-white truncate">
                        {dest.name}
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">
                        {dest.category}
                      </div>
                      <div className="text-[10px] text-teal-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                        {dest.detail}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`shrink-0 transition-transform ${
                      isActive ? "text-[#14B8A6] translate-x-0.5" : "text-slate-500"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onViewAllDestinations}
            className="w-full py-2.5 px-4 rounded-xl bg-[#111827] hover:bg-[#172235] border border-[#263244] hover:border-slate-600 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>View all destinations</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Hero Bottom Bar with Slide Counter & Caption */}
      <div className="relative z-10 border-t border-[#263244] bg-[#080E1A]/80 backdrop-blur-md px-6 sm:px-8 py-3 flex items-center justify-between text-xs text-slate-400">
        <div className="truncate max-w-md">
          <span className="font-semibold text-slate-200">{current.name}</span> · {current.quote}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-[11px] text-teal-400">
            {String(activeSlide + 1).padStart(2, "0")} / {String(destinations.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="w-6 h-6 rounded-full border border-[#263244] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
          >
            {isPaused ? <Play size={10} /> : <Pause size={10} />}
          </button>
        </div>
      </div>
    </section>
  );
};
