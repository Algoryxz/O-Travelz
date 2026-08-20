import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Compass, MapPin, ArrowRight, Heart } from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { DEFAULT_FALLBACK_IMAGE } from "../../utils/imageService";

export interface CoverflowItem {
  id: string;
  title: string;
  category: string;
  location?: string;
  description?: string;
  imageUrl: string;
  tag?: string;
  rating?: number;
}

interface CoverflowCarouselProps {
  items: CoverflowItem[];
  onSelectItem?: (item: CoverflowItem) => void;
  onExploreItem?: (item: CoverflowItem) => void;
  title?: string;
  subtitle?: string;
  tag?: string;
  className?: string;
}

export const CoverflowCarousel: React.FC<CoverflowCarouselProps> = ({
  items,
  onSelectItem,
  onExploreItem,
  title,
  subtitle,
  tag,
  className = "",
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSaved, toggleSavePlace } = useSavedPlaces();

  const total = items.length;

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  }, [total]);

  // Wheel event horizontal scroll handling with throttling
  const lastWheelTime = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 6) return;

      // Prevent window scrolling while pointer is over carousel
      e.preventDefault();

      const now = Date.now();
      if (now - lastWheelTime.current < 240) {
        return;
      }

      if (delta > 0) {
        handleNext();
        lastWheelTime.current = now;
      } else if (delta < 0) {
        handlePrev();
        lastWheelTime.current = now;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [handleNext, handlePrev]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    },
    [handlePrev, handleNext]
  );

  // Mouse / Touch drag handling
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragOffset(clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 40;
    if (dragOffset > threshold) {
      handlePrev();
    } else if (dragOffset < -threshold) {
      handleNext();
    }
    setDragOffset(0);
  };

  if (total === 0) return null;

  return (
    <section
      data-testid="coverflow-carousel-section"
      className={`relative w-full py-2 select-none ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={title || "Destination Coverflow Carousel"}
    >
      {/* Header with Title and Prev/Next buttons */}
      {(title || tag || subtitle) && (
        <div className="flex items-end justify-between gap-4 mb-3 px-1 sm:px-0">
          <div>
            {tag && (
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                {tag}
              </div>
            )}
            {title && (
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mt-0.5">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xl line-clamp-1 sm:line-clamp-none">
                {subtitle}
              </p>
            )}
          </div>

          {/* Previous / Next Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              data-testid="coverflow-prev-button"
              onClick={handlePrev}
              aria-label="Previous destination"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              data-testid="coverflow-next-button"
              onClick={handleNext}
              aria-label="Next destination"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 3D Coverflow Stage Container with Bounded Height & Smooth Depth */}
      <div
        ref={containerRef}
        data-testid="coverflow-stage"
        className="relative h-[340px] sm:h-[370px] w-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: "1000px" }}
      >
        {items.map((item, idx) => {
          // Calculate cyclic distance
          let diff = idx - activeIndex;
          if (diff > total / 2) diff -= total;
          if (diff < -total / 2) diff += total;

          const isCenter = diff === 0;
          const absDiff = Math.abs(diff);

          // Only render elements within range of 3 items left/right
          if (absDiff > 3) return null;

          // 3D positioning transform
          const translateX = diff * 235; // 235px step for optimal visible surface area
          const rotateY = diff * -22; // -22deg gentle tilt preserving photo visibility
          const scale = isCenter ? 1 : Math.max(0.82, 1 - absDiff * 0.09);
          const zIndex = 30 - absDiff * 5;
          // Keep inactive cards vivid and clearly visible (minimum 70% opacity)
          const opacity = isCenter ? 1 : Math.max(0.70, 1 - absDiff * 0.14);

          const saved = isSaved(item.title);

          return (
            <div
              key={item.id || item.title}
              data-testid={`coverflow-card-${idx}`}
              onClick={() => {
                if (isCenter) {
                  onSelectItem?.(item);
                } else {
                  setActiveIndex(idx);
                }
              }}
              style={{
                transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
                opacity,
              }}
              className="absolute w-[270px] sm:w-[320px] md:w-[340px] h-[310px] sm:h-[345px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out bg-slate-900 flex flex-col justify-end p-4 sm:p-5 text-white border border-emerald-500/20 hover:border-emerald-400/40 group cursor-pointer"
            >
              {/* Background Image with Object Cover & High Vibrancy */}
              <img
                src={item.imageUrl}
                alt={item.title}
                loading={isCenter ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE.src;
                }}
              />

              {/* Refined Gradient Overlay Preserving Photographic Clarity in Upper/Middle areas */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 via-45% to-transparent pointer-events-none" />

              {/* Top Badges */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                  {item.category}
                </span>

                <button
                  type="button"
                  data-testid={`coverflow-save-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSavePlace({
                      id: item.id || item.title,
                      name: item.title,
                      category: item.category,
                      location: item.location,
                      description: item.description,
                    });
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors cursor-pointer ${
                    saved
                      ? "bg-rose-500/80 border-rose-400 text-white"
                      : "bg-black/40 hover:bg-black/60 border-white/20 text-white"
                  }`}
                  aria-label={`Save ${item.title}`}
                >
                  <Heart size={13} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Bottom Caption & Action Button */}
              <div className="relative z-10 space-y-1.5">
                {item.location && (
                  <div className="text-[10px] sm:text-[11px] text-emerald-200/90 font-medium flex items-center gap-1">
                    <MapPin size={10} className="text-emerald-400" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}

                <h3 className="text-base sm:text-lg font-bold font-display leading-tight text-white line-clamp-1">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-[11px] sm:text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {isCenter && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      data-testid={`coverflow-explore-btn-${idx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onExploreItem) {
                          onExploreItem(item);
                        } else {
                          onSelectItem?.(item);
                        }
                      }}
                      className="flex-1 py-1.5 sm:py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                    >
                      <Compass size={13} />
                      <span>Explore Details</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots Indicator - Tightly Attached Directly Under Stage */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            data-testid={`coverflow-dot-${idx}`}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === activeIndex
                ? "w-6 bg-emerald-600 dark:bg-emerald-400"
                : "w-1.5 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
