import React from "react";
import type { PlaceDetail } from "../../api/contracts";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { resolveDestinationImage } from "../../utils/imageRegistry";

interface SurpriseDestinationModalProps {
  isOpen: boolean;
  place: PlaceDetail | null;
  distanceFormatted?: string;
  onClose: () => void;
  onRollAgain: () => void;
  onViewOnMap: (placeId: string, lat?: number, lon?: number) => void;
  onPlanTrip: (placeName: string) => void;
}

export const SurpriseDestinationModal: React.FC<SurpriseDestinationModalProps> = ({
  isOpen,
  place,
  distanceFormatted,
  onClose,
  onRollAgain,
  onViewOnMap,
  onPlanTrip,
}) => {
  const { isSaved, toggleSavePlace } = useSavedPlaces();

  if (!isOpen || !place) return null;

  const resolvedImage = resolveDestinationImage({
    id: place.id,
    researchId: place.research_id || undefined,
    name: place.name,
    category: place.category,
    images: place.images || undefined,
  });
  const imageSrc = resolvedImage.src;

  const saved = isSaved(place.id) || isSaved(place.name);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="surprise-dest-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#FBF9F5] border border-[#E5DFD5] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 text-[#12161E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Header with Curated Badges */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#12161E]">
          <img
            src={imageSrc}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDlDr9_Cek0l7sSj8p9l7a6HT5uYjYAkDij85CJ6uhJV8eizUTCMbyqKS4rlQKXpG2i_BAztVjrdoDYjZIbQf8MmFqxgB0ahaa_X9gAvn4_CQZQqUYVJ2EJJcBH365Dnwd9Pzr9EjRdsnuQtHhSbVBInYpZfeCz3nxzq4oX91YTxIfZ2oJgCpbMwIbcANSqHH1brcUm9gKAfrBa1CocGM7zZ-ARsFtyYEl2koEkEHUjoBnA9_7xyjBwbDAqj3MnQXISntVnPN8L17U";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12161E] via-[#12161E]/30 to-transparent" />

          {/* Top Floating Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-medium">
              <span className="text-base">🎲</span>
              <span>Surprise Discovery</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  toggleSavePlace({
                    id: place.id,
                    name: place.name,
                    category: place.category,
                    location: place.district || place.region || undefined,
                    description: place.description || undefined,
                  })
                }
                title={saved ? "Remove from Saved" : "Save Destination"}
                className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                  saved
                    ? "bg-[#B87B22] text-white border-[#B87B22]"
                    : "bg-black/50 text-white border-white/20 hover:bg-black/70"
                }`}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bookmark
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 rounded-full bg-black/50 text-white border border-white/20 hover:bg-black/70 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#B87B22] font-semibold mb-1">
              <span>{place.category}</span>
              {place.district && <span>• {place.district}</span>}
              {distanceFormatted && <span className="text-[#E5DFD5]">({distanceFormatted} away)</span>}
            </div>
            <h3 id="surprise-dest-title" className="text-2xl sm:text-3xl font-display font-bold leading-tight">
              {place.name}
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm font-body text-[#3D4654] leading-relaxed">
            {place.description ||
              "An authentic verified sanctuary in Odisha celebrated for its scenic heritage, architectural marvels, and cultural resonance."}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-white p-3 rounded-xl border border-[#E5DFD5]">
              <span className="text-[10px] uppercase text-[#70798B] block">Region</span>
              <span className="font-semibold text-[#12161E] mt-0.5 block truncate">
                {place.region || place.district || "Odisha"}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E5DFD5]">
              <span className="text-[10px] uppercase text-[#70798B] block">Category</span>
              <span className="font-semibold text-[#12161E] mt-0.5 block capitalize truncate">
                {place.category.replace(/_/g, " ")}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase text-[#70798B] block">Verification</span>
              <span className="font-semibold text-[#2F523E] mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F523E]"></span>
                <span>Verified Data</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#E5DFD5]">
            <button
              type="button"
              onClick={onRollAgain}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="text-sm">🎲</span>
              <span>Roll Again</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewOnMap(place.id, place.lat ?? undefined, place.lon ?? undefined)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#12161E] hover:bg-[#2A3447] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">map</span>
                <span>View on Map</span>
              </button>

              <button
                type="button"
                onClick={() => onPlanTrip(place.name)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">route</span>
                <span>Plan Trip</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
