/**
 * DestinationWorldStage: Full-width cinematic digital travel portal into Odisha destinations.
 * Smooth horizontal scrollable rail for all 12 verified destinations,
 * verified media, subtle parallax motion, and clear readable metadata.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Waves,
  Trees,
  Mountain,
  Eye,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { DESTINATION_WORLD_ASSETS, type DestinationWorldAsset } from '../../data/destinationWorldAssets';
import { computeParallaxOffsets, type ParallaxOffset } from './DestinationWorldMotion';
import { DestinationWorldScene } from './DestinationWorldScene';

interface DestinationWorldStageProps {
  onExplorePlace?: (placeId: string, name: string) => void;
  onExploreDestination?: (placeId: string, name: string) => void;
  onPlanTrip?: (placeName: string) => void;
  className?: string;
}

export const DestinationWorldStage: React.FC<DestinationWorldStageProps> = ({
  onExplorePlace,
  onExploreDestination,
  onPlanTrip,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [parallax, setParallax] = useState<ParallaxOffset>({
    bgX: 0,
    bgY: 0,
    midX: 0,
    midY: 0,
    fgX: 0,
    fgY: 0,
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prefersReducedMotion = useRef<boolean>(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const activeWorld = DESTINATION_WORLD_ASSETS[activeIndex] || DESTINATION_WORLD_ASSETS[0];

  // Auto-scroll the selected destination into center view on the rail
  useEffect(() => {
    const targetBtn = buttonRefs.current[activeIndex];
    if (targetBtn) {
      targetBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeIndex]);

  // Auto-drift through destinations every 9 seconds if not interacted
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DESTINATION_WORLD_ASSETS.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Subtle Mouse Parallax Tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    setParallax(computeParallaxOffsets(xNorm, yNorm, false));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setParallax({ bgX: 0, bgY: 0, midX: 0, midY: 0, fgX: 0, fgY: 0 });
  }, []);

  const handlePrev = () => {
    setIsPaused(true);
    setActiveIndex((prev) => (prev - 1 + DESTINATION_WORLD_ASSETS.length) % DESTINATION_WORLD_ASSETS.length);
  };

  const handleNext = () => {
    setIsPaused(true);
    setActiveIndex((prev) => (prev + 1) % DESTINATION_WORLD_ASSETS.length);
  };

  // Horizontal Wheel / Trackpad Scroll on Rail
  const handleRailWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (railRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      railRef.current.scrollLeft += e.deltaY;
    }
  };

  // Keyboard navigation on rail
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const getCategoryIcon = (category: DestinationWorldAsset['category']) => {
    switch (category) {
      case 'BEACH':
      case 'LAGOON':
        return <Waves className="w-3.5 h-3.5 text-cyan-400" />;
      case 'HILL_STATION':
        return <Mountain className="w-3.5 h-3.5 text-emerald-400" />;
      case 'WILDLIFE':
        return <Trees className="w-3.5 h-3.5 text-lime-400" />;
      case 'HERITAGE':
      default:
        return <Building2 className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <section
      aria-label="Cinematic Odisha Destination Portal"
      className={`relative w-full py-10 bg-slate-950 text-slate-100 overflow-hidden ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Eye className="w-3.5 h-3.5" />
              <span>Cinematic Destination Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Odisha Destination Worlds
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Step through atmospheric portals into Odisha’s golden coasts, misty highlands, primeval biosphere reserves, and monumental temples.
          </p>
        </div>

        {/* Destination World Horizontally Scrollable Rail */}
        <div className="relative mb-6">
          <div
            ref={railRef}
            onWheel={handleRailWheel}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label="Destination rail switcher"
            className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar max-w-full focus:outline-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {DESTINATION_WORLD_ASSETS.map((dest, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={dest.id}
                  ref={(el) => { buttonRefs.current[idx] = el; }}
                  type="button"
                  onClick={() => {
                    setIsPaused(true);
                    setActiveIndex(idx);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold scale-[1.02]'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {getCategoryIcon(dest.category)}
                  <span>{dest.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Master Cinematic Visual Stage */}
        <div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-[480px] sm:h-[540px] lg:h-[580px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col justify-between p-6 sm:p-10 transition-all"
        >
          {/* Layered Visual Scene Render */}
          <DestinationWorldScene
            world={activeWorld}
            parallax={parallax}
            isReducedMotion={prefersReducedMotion.current}
            isActive={true}
          />

          {/* Top Layer: Destination Category & Live Meta */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 shadow-lg">
                {getCategoryIcon(activeWorld.category)}
                <span className="capitalize">{activeWorld.category.replace('_', ' ')}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/70 backdrop-blur-md border border-slate-800 text-slate-300">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{activeWorld.district}</span>
              </span>

              {activeWorld.verified && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Location Media</span>
                </span>
              )}
            </div>

            {/* Top Right: Best Season Info */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-900/70 backdrop-blur-md border border-slate-800 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeWorld.best_time.split('(')[0].trim()}</span>
            </div>
          </div>

          {/* Bottom Layer: Readable Text Safe Zone & Destination Call to Actions */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-2.5 max-w-2xl">
              <div className="inline-block text-xs sm:text-sm font-semibold text-emerald-400 tracking-wide uppercase">
                {activeWorld.tagline}
              </div>

              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight flex items-baseline gap-3 flex-wrap drop-shadow-md">
                <span>{activeWorld.name}</span>
                <span className="text-sm sm:text-lg font-serif text-amber-300/90 font-normal">
                  {activeWorld.odia_name}
                </span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-200/95 leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-3">
                {activeWorld.description}
              </p>

              <div className="text-[11px] sm:text-xs text-slate-300/80 flex items-center gap-2 pt-0.5">
                <span className="font-semibold text-emerald-300">Route Info:</span>
                <span>{activeWorld.distance_from_hub}</span>
              </div>
            </div>

            {/* Right Action Column */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-end gap-3">
              <div className="flex items-center gap-2 self-start lg:self-end">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2.5 rounded-full bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
                  aria-label="Previous destination"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Progress Indicator */}
                <span className="text-xs font-mono text-slate-300 px-2 font-medium">
                  {activeIndex + 1} / {DESTINATION_WORLD_ASSETS.length}
                </span>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2.5 rounded-full bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
                  aria-label="Next destination"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onPlanTrip && (
                  <button
                    type="button"
                    onClick={() => onPlanTrip(activeWorld.name)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Plan Trip Here</span>
                  </button>
                )}

                {(onExplorePlace || onExploreDestination) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onExploreDestination) onExploreDestination(activeWorld.id, activeWorld.name);
                      else if (onExplorePlace) onExplorePlace(activeWorld.id, activeWorld.name);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-md font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
