import { motion } from "framer-motion";
import { cardHover, cardTap } from "../../lib/motion";
import React from "react";
import { MapPin, Phone, Clock } from "lucide-react";

interface EssentialCardProps {
  name: string;
  category: string;
  location: string;
  contact?: string;
  hours?: string;
}

export const EssentialCard: React.FC<EssentialCardProps> = ({
  name,
  category,
  location,
  contact,
  hours,
}) => {
  return (
    <motion.div
      whileHover={cardHover}
      whileTap={cardTap}
      data-testid="essential-service-card"
      className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs hover:border-[#D1C8BA] transition-all space-y-2 text-[#12161E]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B87B22] font-mono">
          {category}
        </span>
      </div>

      <h4 className="font-serif font-bold text-sm text-[#12161E]">{name}</h4>

      <div className="space-y-1 text-xs text-[#70798B]">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-[#B87B22] shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        {contact && (
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-[#1B5E6B] shrink-0" />
            <span className="font-mono">{contact}</span>
          </div>
        )}
        {hours && (
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-[#2F523E] shrink-0" />
            <span>{hours}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
