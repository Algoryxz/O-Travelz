import { motion } from "motion/react";
import { cardHover, cardTap } from "../../lib/motion";
import React from "react";
import { MapPin } from "lucide-react";

interface NearbyDarkCardProps {
  title: string;
  location: string;
  distance: string;
  category: string;
  imageUrl?: string;
}

export const NearbyDarkCard: React.FC<NearbyDarkCardProps> = ({
  title,
  location,
  distance,
  category,
  imageUrl,
}) => {
  return (
    <motion.div
      whileHover={cardHover}
      whileTap={cardTap}
      data-testid="nearby-attraction-card"
      className="group relative rounded-2xl overflow-hidden bg-[#1B5E6B] text-white p-4 flex flex-col justify-between min-h-[140px] shadow-sm border border-[#1B5E6B]/30 cursor-pointer"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D1C8BA] font-mono">
          {category}
        </span>
        <h4 className="font-serif font-bold text-sm text-white mt-1 group-hover:text-[#B87B22] transition-colors line-clamp-1">
          {title}
        </h4>
      </div>

      <div className="relative z-10 flex items-center justify-between text-xs text-white/80 pt-2 font-mono">
        <span className="flex items-center gap-1 text-white/70">
          <MapPin size={11} className="text-[#B87B22]" />
          <span className="truncate max-w-[120px]">{location}</span>
        </span>
        <span className="font-bold text-[#D1C8BA]">{distance}</span>
      </div>
    </motion.div>
  );
};
