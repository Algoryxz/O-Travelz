import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Compass, MapPin, Heart } from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { DEFAULT_FALLBACK_IMAGE } from "../../utils/imageService";

export interface CoverflowItem {
  id?: string;
  title: string;
  category?: string;
  location?: string;
  description?: string;
  imageUrl?: string;
  src?: string;
  alt?: string;
  subtitle?: string;
  meta?: string;
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

      // Prevent page scrolling while pointer is over carousel
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
      className={`relative w-full select-none ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={title || "Destination Coverflow Carousel"}
    >
      {/* Optional Header with Title and Prev/Next buttons */}
      {(title || tag || subtitle) ? (
        <div className="flex items-end justify-between gap-4 mb-4 px-1 sm:px-0">
          <div>
            {tag && (
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B87B22] font-mono">
                {tag}
              </div>
            )}
            {title && (
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-[#12161E] tracking-tight mt-0.5">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#70798B] mt-0.5 max-w-xl line-clamp-1 sm:line-clamp-none font-body">
                {subtitle}
              </p>
            )}
          </div>

          {/* Previous / Next Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="coverflow-prev-button"
              onClick={handlePrev}
              aria-label="Previous destination"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F2EEE7] border border-[#E5DFD5] text-[#12161E] flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              data-testid="coverflow-next-button"
              onClick={handleNext}
              aria-label="Next destination"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F2EEE7] border border-[#E5DFD5] text-[#12161E] flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Standalone navigation buttons when no inline header */
        <div className="flex justify-end items-center gap-2 mb-3">
          <button
            type="button"
            data-testid="coverflow-prev-button"
            onClick={handlePrev}
            aria-label="Previous destination"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F2EEE7] border border-[#E5DFD5] text-[#12161E] flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            data-testid="coverflow-next-button"
            onClick={handleNext}
            aria-label="Next destination"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F2EEE7] border border-[#E5DFD5] text-[#12161E] flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 3D Coverflow Stage Container with Bounded Height & Smooth Depth */}
      <div
        ref={containerRef}
        data-testid="coverflow-stage"
        className="relative h-[370px] sm:h-[410px] w-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: "1100px" }}
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
          const translateX = diff * 255; // 255px step for optimal visible surface area
          const rotateY = diff * -20; // -20deg gentle tilt preserving photo visibility
          const scale = isCenter ? 1 : Math.max(0.84, 1 - absDiff * 0.08);
          const zIndex = 30 - absDiff * 5;
          // Keep inactive cards vivid and clearly visible (minimum 70% opacity)
          const opacity = isCenter ? 1 : Math.max(0.72, 1 - absDiff * 0.12);

          const imageSrc = item.src || item.imageUrl || DEFAULT_FALLBACK_IMAGE.src;
          const imageAlt = item.alt || item.title || "Odisha Destination";
          const categoryText = item.tag || item.category || "Odisha Signature";
          const locationText = item.meta || item.location;
          const descText = item.subtitle || item.description;

          const saved = isSaved(item.title);

          return (
            <div
              key={item.id || item.title || idx}
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
              className="absolute w-[290px] sm:w-[340px] md:w-[370px] h-[350px] sm:h-[390px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out bg-[#12161E] flex flex-col justify-between p-4 sm:p-5 text-white border border-white/20 hover:border-[#B87B22]/70 group cursor-pointer"
            >
              {/* Background Image with Object Cover & High Vibrancy */}
              <img
                src={imageSrc}
                alt={imageAlt}
                loading={isCenter ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE.src;
                }}
              />

              {/* Refined Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15 pointer-events-none" />

              {/* Top Glass Bar (Badges + Save Button) */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[#E5DFD5] text-[10px] sm:text-[11px] font-mono font-medium tracking-wide border border-white/20">
                  {categoryText}
                </span>

                <button
                  type="button"
                  data-testid={`coverflow-save-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSavePlace({
                      id: item.id || item.title,
                      name: item.title,
                      category: categoryText,
                      location: locationText,
                      description: descText,
                    });
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors cursor-pointer ${
                    saved
                      ? "bg-rose-600/90 border-rose-500 text-white shadow-sm"
                      : "bg-black/40 hover:bg-black/60 border-white/20 text-white"
                  }`}
                  aria-label={`Save ${item.title}`}
                >
                  <Heart size={14} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Bottom Translucent Glass Information Panel */}
              <div className="relative z-10 bg-[#12161E]/75 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 text-white shadow-lg space-y-1.5 transition-all">
                {locationText && (
                  <div className="text-[10px] sm:text-[11px] text-[#B87B22] font-mono font-medium flex items-center gap-1">
                    <MapPin size={11} className="text-[#B87B22] shrink-0" />
                    <span className="truncate text-[#E5DFD5]">{locationText}</span>
                  </div>
                )}

                <h3 className="text-base sm:text-lg font-bold font-display leading-tight text-white line-clamp-1">
                  {item.title}
                </h3>

                {descText && (
                  <p className="text-[11px] sm:text-xs text-[#E5DFD5]/90 line-clamp-2 leading-relaxed font-body">
                    {descText}
                  </p>
                )}

                {isCenter && (
                  <div className="pt-2 flex items-center gap-2">
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
                      className="flex-1 py-2 px-3.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                    >
                      <Compass size={14} />
                      <span>Explore details</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots Indicator - Directly Under Stage */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            data-testid={`coverflow-dot-${idx}`}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === activeIndex
                ? "w-6 bg-[#B87B22]"
                : "w-1.5 bg-[#E5DFD5] hover:bg-[#B87B22]/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

