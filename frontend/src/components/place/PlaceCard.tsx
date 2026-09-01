import React from "react";
import { Star, MapPin, Eye, Compass, Box, Film, Sparkles } from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { resolvePlaceImageUrl } from "../../utils/imageAdapter";
import { TiltCard } from "../ui/TiltCard";
import type { SelectedPlaceInfo } from "./PlaceDetailsModal";

interface PlaceCardProps {
  place: {
    id?: string;
    name: string;
    category?: string;
    location?: string;
    description?: string;
    interests?: string[];
    rating?: number;
    image_url?: string;
    has_3d?: boolean;
    has_video?: boolean;
  };
  onClick?: () => void;
  onPlanTrip?: (place: SelectedPlaceInfo) => void;
  onViewDetails?: (place: SelectedPlaceInfo) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onClick,
  onPlanTrip,
  onViewDetails,
}) => {
  const { isSaved: checkSaved, toggleSave } = useSavedPlaces();
  const isSaved = checkSaved(place.id || place.name);

  // Deterministic catalog image via resolution adapter
  const imageUrl = resolvePlaceImageUrl(
    { name: place.name, category: place.category, imageUrl: place.image_url },
    "card"
  );

  const isHeritageOrNotable =
    place.id?.includes("konark") ||
    place.id?.includes("puri") ||
    place.id?.includes("chilika") ||
    place.id?.includes("033") ||
    place.id?.includes("002") ||
    place.id?.includes("020") ||
    place.category === "temple" ||
    place.category === "monument";

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave({
      id: place.id || place.name,
      name: place.name,
      category: place.category || "destination",
      location: place.location || "Odisha",
      description: place.description,
      interests: place.interests,
    });
  };

  const handlePlanClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlanTrip) {
      onPlanTrip({
        id: place.id,
        name: place.name,
        category: place.category || "destination",
        location: place.location || "Odisha",
        description: place.description,
        interests: place.interests,
      });
    }
  };

  const handleViewClick = (e: React.MouseEvent, initialMediaTab?: "photos" | "video" | "3d") => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails({
        id: place.id,
        name: place.name,
        category: place.category || "destination",
        location: place.location || "Odisha",
        description: place.description,
        interests: place.interests,
        initialMediaTab,
      });
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <TiltCard
      data-testid="destination-place-card"
      maxTilt={6}
      scale={1.02}
      className="group relative bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#E5DFD5] shadow-xs hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
      onClick={() => handleViewClick({} as any)}
    >
      {/* Image & Badges */}
      <div className="relative aspect-4/3 w-full bg-[#F2EEE7] overflow-hidden">
        <img
          src={imageUrl}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12161E]/90 via-black/25 to-transparent" />

        {/* Category Pill */}
        {place.category && (\n          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0D5C3A] text-white border border-white/20 shadow-xs">
            {place.category}
          </span>
        )}

        {/* Media Capability Badges */}
        <div className="absolute top-3 right-12 flex items-center gap-1">
          {isHeritageOrNotable && (
            <span
              onClick={(e) => handleViewClick(e, "3d")}
              className="p-1.5 rounded-full bg-black/60 hover:bg-[#C69214] text-white backdrop-blur-md transition-colors border border-white/20 shadow-xs"
              title="3D Heritage Model Available"
            >
              <Box size={12} />
            </span>
          )}
          <span
            onClick={(e) => handleViewClick(e, "video")}
            className="p-1.5 rounded-full bg-black/60 hover:bg-[#0D5C3A] text-white backdrop-blur-md transition-colors border border-white/20 shadow-xs"
            title="Video Preview Available"
          >
            <Film size={12} />
          </span>
        </div>

        {/* Save/Bookmark Button */}
        <button
          type="button"
          data-testid="save-place-toggle-btn"
          onClick={handleToggleSave}
          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/20 shadow-xs ${
            isSaved ? "bg-[#A84825] text-white" : "bg-black/40 text-white hover:bg-black/70"
          }`}
          aria-label={isSaved ? `Remove ${place.name} from saved` : `Save ${place.name}`}
        >
          <Star size={13} className={isSaved ? "fill-white text-white" : "text-white"} />
        </button>

        {/* Place Title & Location Overlay */}
        <div className="absolute bottom-3 left-3.5 right-3.5 space-y-0.5">
          <h3 className="font-display font-bold text-base text-white truncate drop-shadow-sm">
            {place.name}
          </h3>
          {place.location && (
            <p className="text-[#E5DFD5] text-xs flex items-center gap-1 font-body">
              <MapPin size={11} className="text-[#C69214]" />
              <span className="truncate">{place.location}</span>
            </p>
          )}
        </div>
      </div>

      {/* Content & Actions */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        {place.description && (
          <p className="text-xs text-[#70798B] line-clamp-2 leading-relaxed font-body">
            {place.description}
          </p>
        )}

        {/* Action Buttons: View Details & Plan Trip */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#E5DFD5]">
          <button
            type="button"
            data-testid="view-place-details-btn"
            onClick={(e) => handleViewClick(e)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Eye size={13} className="text-[#0D5C3A]" />
            <span>Details</span>
          </button>

          <button
            type="button"
            data-testid="plan-trip-from-card-btn"
            onClick={handlePlanClick}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#0D5C3A] hover:bg-[#0A472C] text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Compass size={13} className="text-[#C69214]" />
            <span>Plan Trip</span>
          </button>
        </div>
      </div>
    </TiltCard>
  );
};
