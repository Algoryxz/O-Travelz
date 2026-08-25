import React, { useState, useCallback, useRef } from "react";
import type { PlaceDetail } from "../../api/contracts";
import { useLocation } from "../../context/LocationContext";
import { apiClient } from "../../api/client";
import { calculateHaversineDistanceKm, formatDistance, isValidCoordinate } from "../../utils/geoUtils";
import { SurpriseDestinationModal } from "./SurpriseDestinationModal";

interface SurpriseMeButtonProps {
  onNavigateToMap?: (placeId: string, lat?: number, lon?: number) => void;
  onPlanTrip?: (placeName: string) => void;
  className?: string;
  variant?: "hero" | "compact";
}

export const SurpriseMeButton: React.FC<SurpriseMeButtonProps> = ({
  onNavigateToMap,
  onPlanTrip,
  className = "",
  variant = "hero",
}) => {
  const { currentPosition } = useLocation();
  const [isRolling, setIsRolling] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);
  const lastSelectedIdRef = useRef<string | null>(null);
  const cachedPlacesRef = useRef<PlaceDetail[]>([]);

  const rollDice = useCallback(async () => {
    setIsRolling(true);

    try {
      // 1. Fetch places if not yet cached
      let pool = cachedPlacesRef.current;
      if (!pool || pool.length === 0) {
        const fetched = await apiClient.listPlaces({ limit: 161 });
        if (Array.isArray(fetched) && fetched.length > 0) {
          cachedPlacesRef.current = fetched;
          pool = fetched;
        }
      }

      if (pool && pool.length > 0) {
        // Filter out the last selected place to prevent immediate duplicate
        const candidates = pool.filter((p) => p.id !== lastSelectedIdRef.current);
        const choicePool = candidates.length > 0 ? candidates : pool;
        const randomIndex = Math.floor(Math.random() * choicePool.length);
        const chosen = choicePool[randomIndex];

        lastSelectedIdRef.current = chosen.id;
        setSelectedPlace(chosen);

        // Small delay for dice spin animation feedback
        setTimeout(() => {
          setIsRolling(false);
          setModalOpen(true);
        }, 350);
        return;
      }
    } catch (err) {
      console.warn("Surprise Me fetch fallback:", err);
    }

    setIsRolling(false);
  }, []);

  const distanceFormatted = React.useMemo(() => {
    if (
      selectedPlace &&
      isValidCoordinate(selectedPlace.lat, selectedPlace.lon) &&
      isValidCoordinate(currentPosition?.lat, currentPosition?.lon)
    ) {
      const dist = calculateHaversineDistanceKm(
        currentPosition!.lat,
        currentPosition!.lon,
        selectedPlace.lat!,
        selectedPlace.lon!
      );
      return formatDistance(dist);
    }
    return undefined;
  }, [selectedPlace, currentPosition]);

  return (
    <>
      <div className={`relative group inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={rollDice}
          disabled={isRolling}
          title="Surprise Me (Roll the dice for a random Odisha discovery)"
          aria-label="Surprise Me: Discover a random destination in Odisha"
          className={`relative rounded-xl border transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
            variant === "hero"
              ? "h-12 px-3 sm:px-3.5 bg-white/95 hover:bg-white text-[#12161E] border-[#E5DFD5] shadow-md hover:shadow-lg hover:border-[#B87B22]"
              : "h-9 px-2.5 bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#12161E] border-[#E5DFD5] text-xs"
          } ${isRolling ? "scale-95 ring-2 ring-[#B87B22]/50" : "hover:scale-[1.03]"}`}
        >
          {/* Dice Icon with 3D Roll Animation */}
          <span
            className={`text-xl transition-transform duration-500 inline-block ${
              isRolling ? "animate-spin" : "group-hover:rotate-12 group-hover:scale-110"
            }`}
          >
            🎲
          </span>

          {/* Animated expandable label on hover */}
          <span className="hidden sm:inline-block max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 ease-out whitespace-nowrap text-xs font-mono font-bold text-[#B87B22]">
            Surprise Me
          </span>
        </button>

        {/* Floating Tooltip for mobile or compact view */}
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#12161E] text-white text-[11px] font-mono rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg whitespace-nowrap z-30 sm:hidden">
          Surprise Me
        </div>
      </div>

      {/* Discovery Result Modal */}
      <SurpriseDestinationModal
        isOpen={modalOpen}
        place={selectedPlace}
        distanceFormatted={distanceFormatted}
        onClose={() => setModalOpen(false)}
        onRollAgain={rollDice}
        onViewOnMap={(id, lat, lon) => {
          setModalOpen(false);
          onNavigateToMap?.(id, lat, lon);
        }}
        onPlanTrip={(name) => {
          setModalOpen(false);
          onPlanTrip?.(name);
        }}
      />
    </>
  );
};
