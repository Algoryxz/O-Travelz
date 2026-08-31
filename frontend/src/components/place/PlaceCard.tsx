import { motion } from "motion/react";
import { cardHover, cardTap, buttonTap } from "../../lib/motion";
import React from "react";
import { Star, MapPin, Eye, Compass } from "lucide-react";
import { useSavedPlaces } from "../../store/useSavedPlaces";
import { resolvePlaceImageUrl } from "../../utils/imageAdapter";
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
  const { isPlaceSaved, toggleSavedPlace } = useSavedPlaces();
  const isSaved = isPlaceSaved(place.id || place.name);

  // Deterministic catalog image via resolution adapter
  const imageUrl = resolvePlaceImageUrl({ name: place.name, category: place.category, image_url: place.image_url }, "card");

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavedPlace({
      id: place.id,
      name: place.name,
      category: place.category,
      location: place.location,
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
        category: place.category,
        location: place.location,
        description: place.description,
        interests: place.interests,
      });
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails({
        id: place.id,
        name: place.name,
        category: place.category,
        location: place.location,
        description: place.description,
        interests: place.interests,
      });
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={cardHover}
      whileTap={cardTap}
      data-testid="destination-place-card"
      onClick={onClick}
      className="group relative bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#E5DFD5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
    >
      {/* Image & Badges */}
      <div className="relative aspect-4/3 w-full bg-[#F2EEE7] overflow-hidden">
        <img
          src={imageUrl}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Pill */}
        {place.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFFFFF]/90 backdrop-blur-xs text-[#12161E] border border-[#E5DFD5]">
            {place.category}
          </span>
        )}

        {/* Save/Bookmark Button */}
        <motion.button
          whileTap={buttonTap}
          type="button"
          data-testid="save-place-toggle-btn"
          onClick={handleToggleSave}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            isSaved
              ? "bg-[#B87B22] text-white"
              : "bg-black/30 text-white hover:bg-black/50"
          }`}
          aria-label={isSaved ? `Remove ${place.name} from saved` : `Save ${place.name}`}
        >
          <Star size={14} className={isSaved ? "fill-white text-white" : "text-white"} />
        </motion.button>

        {/* Place Title on image overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-serif font-bold text-base text-white truncate drop-shadow-xs">
            {place.name}
          </h3>
          {place.location && (
            <p className="text-white/80 text-xs flex items-center gap-1 drop-shadow-2xs">
              <MapPin size={11} className="text-[#B87B22]" />
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
          <motion.button
            whileTap={buttonTap}
            type="button"
            data-testid="view-place-details-btn"
            onClick={handleViewClick}
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye size={12} className="text-[#70798B]" />
            <span>Details</span>
          </motion.button>

          <motion.button
            whileTap={buttonTap}
            type="button"
            data-testid="plan-trip-from-card-btn"
            onClick={handlePlanClick}
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#B87B22] hover:bg-[#A0691B] text-white shadow-2xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Compass size={12} className="text-white" />
            <span>Plan Trip</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
