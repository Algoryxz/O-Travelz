import React, { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import type { PlaceImageMeta } from "../../utils/imageService";

interface PhotoGalleryProps {
  images: PlaceImageMeta[];
  placeName: string;
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  images,
  placeName,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  const [showAttribution, setShowAttribution] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const validImages = images.filter((_, idx) => !failedIndices.has(idx));
  const activeList = validImages.length > 0 ? validImages : images;
  const currentImage = activeList[currentIndex % activeList.length] || images[0];

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeList.length - 1));
    },
    [activeList.length]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev < activeList.length - 1 ? prev + 1 : 0));
    },
    [activeList.length]
  );

  const handleImageError = (index: number) => {
    setFailedIndices((prev) => new Set(prev).add(index));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 40) {
      handlePrev();
    } else if (diff < -40) {
      handleNext();
    }
    setTouchStartX(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrev();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  return (
    <div
      data-testid="destination-photo-gallery"
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 select-none group ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Photo gallery for ${placeName}`}
    >
      {/* Main Image Viewport with Touch / Swipe Support */}
      <div
        className="relative h-64 sm:h-80 w-full overflow-hidden flex items-center justify-center touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={currentImage?.url}
          src={currentImage?.url}
          alt={currentImage?.alt || placeName}
          onError={() => handleImageError(currentIndex)}
          className="w-full h-full object-cover transition-all duration-500 brightness-95"
          loading="lazy"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Image Counter & Attribution Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span
            data-testid="gallery-image-counter"
            className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10"
          >
            {(currentIndex % activeList.length) + 1} / {activeList.length}
          </span>

          {currentImage?.attribution && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAttribution(!showAttribution);
              }}
              title="Image license & attribution"
              className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] flex items-center gap-1 border border-white/10 transition-colors cursor-pointer"
            >
              <Info size={12} className="text-emerald-400" />
              <span className="text-[10px] hidden sm:inline">Info</span>
            </button>
          )}
        </div>

        {/* Attribution Dropdown Banner */}
        {showAttribution && currentImage && (
          <div
            data-testid="gallery-attribution-info"
            className="absolute top-12 left-3 right-3 p-3 rounded-xl bg-black/85 backdrop-blur-lg border border-white/15 text-white text-xs z-20 space-y-1 animate-in fade-in duration-150"
          >
            <div className="font-semibold text-emerald-300 flex items-center justify-between">
              <span>{currentImage.source}</span>
              <span className="text-[10px] text-gray-400 font-mono">{currentImage.license}</span>
            </div>
            <p className="text-[11px] text-gray-300">{currentImage.attribution}</p>
          </div>
        )}

        {/* Navigation Arrows (if > 1 image) */}
        {activeList.length > 1 && (
          <>
            <button
              type="button"
              data-testid="gallery-prev-button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              data-testid="gallery-next-button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip (if > 1 image) */}
      {activeList.length > 1 && (
        <div className="p-2 bg-slate-900 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
          {activeList.map((img, idx) => {
            const active = idx === (currentIndex % activeList.length);
            return (
              <button
                key={idx}
                type="button"
                data-testid={`gallery-thumb-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`relative h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  active
                    ? "border-emerald-500 scale-105 shadow-md shadow-emerald-950"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
