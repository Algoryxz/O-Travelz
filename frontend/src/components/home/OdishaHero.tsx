import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Pause,
  Play,
  Calendar,
  Compass,
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
  const [searchTerm, setSearchTerm] = useState(destinationSearch || "");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("2-3 Days");

  const destinations = [
    {
      name: "Konark Sun Temple",
      category: "Heritage · UNESCO",
      detail: "13th Century · Open 6:00 AM",
      quote: "Stone wheels, sacred geometry, and quiet coastal light",
      bgImage: getPlaceImageUrl("place_konark_001"),
    },
    {
      name: "Chilika Lake",
      category: "Wildlife · Nature",
      detail: "Dolphins · Slow Eco-Boats",
      quote: "Slow water, wide skies, and migratory birds",
      bgImage: getPlaceImageUrl("place_chilika_001"),
    },
    {
      name: "Daringbadi",
      category: "Hills · Nature",
      detail: "Cool climate · Pine Valleys",
      quote: "Monsoon air, coffee plantations, and mountain roads",
      bgImage: getPlaceImageUrl("place_daringbadi_001"),
    },
    {
      name: "Puri Beach",
      category: "Beach · Coastal",
      detail: "Blue Flag · Sunrise Walks",
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
          setOffsetY(Math.min(window.scrollY * 0.14, 90));
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
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, destinations.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch?.(searchTerm.trim());
      onSearchChange?.(searchTerm.trim());
    } else {
      onViewAllDestinations?.();
    }
  };

  const current = destinations[activeSlide];

  return (
    <section className="relative overflow-hidden bg-[#0B1220] border-b border-[#263244]">
      {/* Background Image Carousel with Subtle Parallax & Clean Editorial Vignette */}
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
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220]/94 via-[#0B1220]/65 to-[#0B1220]/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-black/30 pointer-events-none" />

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Confident Thesis, Editorial Narrative & Direct Search */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Location Hub Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827]/90 border border-[#263244] text-slate-200 text-xs font-semibold backdrop-blur-md shadow-xs">
              <span className="live-dot" />
              <MapPin size={13} className="text-[#14B8A6]" />
              <span>{selectedLocation} · Live Hub</span>
              <span className="text-slate-500 font-odia text-[11px] ml-1">ଓଡ଼ିଶା</span>
            </div>

            <div className="space-y-3">
              <div className="text-[#14B8A6] text-xs font-bold uppercase tracking-wider font-mono">
                ODISHA, YOUR WAY · TRAVEL INTELLIGENCE
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-brand-heading tracking-tight text-white leading-[1.08]">
                Discover everything<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] via-[#2DD4BF] to-[#E06D44]">
                  in Odisha.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl leading-relaxed">
                Temples · Beaches · Cafés · Nature · Shopping · Food · Heritage · Trails. Authentic route curation and verified travel intelligence for every traveler.
              </p>
            </div>

            {/* Travel Search Console */}
            <form
              onSubmit={handleSearchSubmit}
              className="p-2 sm:p-2.5 bg-[#111827]/95 border border-[#263244] rounded-2xl shadow-2xl backdrop-blur-xl space-y-2.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                {/* Field 1: Destination input */}
                <div className="sm:col-span-6 flex items-center gap-2.5 px-3 py-2 bg-[#0B1220] rounded-xl border border-[#263244] focus-within:border-[#14B8A6] transition-colors">
                  <Search size={16} className="text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                      Where to?
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        onSearchChange?.(e.target.value);
                      }}
                      placeholder={`Find places near ${selectedLocation}...`}
                      className="w-full text-xs sm:text-sm text-white placeholder-slate-500 bg-transparent border-0 outline-hidden p-0 font-medium"
                      aria-label="Search destinations in English, Odia, or Hindi"
                    />
                  </div>
                </div>

                {/* Field 2: Duration / When */}
                <div className="sm:col-span-3 flex items-center gap-2 px-3 py-2 bg-[#0B1220] rounded-xl border border-[#263244]">
                  <Calendar size={15} className="text-[#14B8A6] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                      Duration
                    </label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="w-full text-xs text-slate-200 bg-transparent border-0 outline-hidden cursor-pointer font-medium"
                    >
                      <option value="1 Day" className="bg-[#111827] text-white">1 Day</option>
                      <option value="2-3 Days" className="bg-[#111827] text-white">2–3 Days</option>
                      <option value="4-5 Days" className="bg-[#111827] text-white">4–5 Days</option>
                      <option value="1 Week" className="bg-[#111827] text-white">1 Week</option>
                    </select>
                  </div>
                </div>

                {/* Field 3: Action Button */}
                <div className="sm:col-span-3 flex">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-display font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass size={15} />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Quick tags bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 px-1 border-t border-[#1F293D]/80">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="text-teal-400 font-semibold font-mono text-[10px]">Multilingual:</span>
                  <span>English · ଓଡ଼ିଆ · हिन्दी</span>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="hero-surprise-me-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSurpriseMe?.();
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#172235] hover:bg-[#1E2D44] border border-[#263244] text-[11px] text-amber-300 font-medium transition-colors cursor-pointer"
                  >
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Surprise Me</span>
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateToPlan}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#14B8A6]/10 hover:bg-[#14B8A6]/20 border border-[#14B8A6]/30 text-[11px] text-teal-300 font-medium transition-colors cursor-pointer"
                  >
                    <span>Plan a Trip</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Destination Cards Stack */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono uppercase tracking-wider">
              <span>Featured Destinations</span>
              <span className="text-teal-400">{String(activeSlide + 1).padStart(2, "0")} / 04</span>
            </div>

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
      </div>

      {/* Hero Bottom Bar with Slide Counter, Pause & Editorial Quote */}
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
