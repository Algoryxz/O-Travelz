import { motion } from "motion/react";
import React from "react";
import type { TransitHop } from "../../types/api";
import {
  formatDurationMinutes,
  formatPriceInr,
  resolveTransitModeIcon,
  resolveRouteComplexity,
} from "../../utils/transitFormatting";
import {
  Train,
  Bus,
  Car,
  Clock,
  CircleDollarSign,
  Route,
  Navigation,
  ChevronRight,
  TrendingDown,
  Info,
} from "lucide-react";

interface TransportHopCardProps {
  hop?: TransitHop;
  originName?: string;
  destinationName?: string;
  className?: string;
}

export const TransportHopCard: React.FC<TransportHopCardProps> = ({
  hop,
  originName,
  destinationName,
  className = "",
}) => {
  // If no hop data is provided, return null or a minimal visual connector
  if (!hop) {
    return (
      <div className={`my-2 flex items-center gap-3 px-4 py-2 ${className}`}>
        <div className="flex flex-col items-center">
          <div className="h-4 w-0.5 border-l-2 border-dashed border-[#D1C8BA]" />
          <div className="h-2 w-2 rounded-full bg-[#B87B22]/40" />
          <div className="h-4 w-0.5 border-l-2 border-dashed border-[#D1C8BA]" />
        </div>
        <div className="text-xs text-[#70798B] italic">
          Transit between destinations
        </div>
      </div>
    );
  }

  const durationStr = formatDurationMinutes(hop.duration_minutes);
  const costStr = formatPriceInr(hop.estimated_cost_inr);
  const modeIcon = resolveTransitModeIcon(hop.mode);
  const complexityBadge = resolveRouteComplexity(hop.complexity);

  const displayOrigin = originName || hop.from_stop_id || "Origin";
  const displayDestination = destinationName || hop.to_stop_id || "Destination";

  return (
    <div
      data-testid="transport-hop-card"
      className={`my-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] shadow-xs text-[#12161E] ${className}`}
    >
      {/* Header / Mode Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-[#1B5E6B]">
            {modeIcon === "Train" && <Train size={16} />}
            {modeIcon === "Bus" && <Bus size={16} />}
            {modeIcon === "Cab" && <Car size={16} />}
            {modeIcon === "Walking" && <Navigation size={16} />}
            {modeIcon === "Auto" && <Navigation size={16} />}
            {!["Train", "Bus", "Cab", "Walking", "Auto"].includes(modeIcon) && <Route size={16} />}
          </span>
          <div>
            <span
              data-testid="transit-mode-badge"
              className="text-xs font-bold uppercase tracking-wider text-[#12161E] font-mono"
            >
              {hop.mode || "Transit Connection"}
            </span>
            {hop.service_name && (
              <span className="text-xs text-[#70798B] ml-2">
                • {hop.service_name}
              </span>
            )}
          </div>
        </div>

        {complexityBadge && (
          <span
            data-testid="transit-complexity-badge"
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E5DFD5] text-[#70798B]"
          >
            {complexityBadge}
          </span>
        )}
      </div>

      {/* Origin -> Destination Route Visualization */}
      <div className="py-3 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 truncate max-w-[42%]">
          <div className="w-2 h-2 rounded-full bg-[#1B5E6B] shrink-0" />
          <span className="font-semibold text-[#12161E] truncate">{displayOrigin}</span>
        </div>

        <div className="flex items-center gap-1 text-[#70798B] shrink-0">
          <div className="w-8 sm:w-12 h-0.5 bg-[#E5DFD5]" />
          <ChevronRight size={14} className="text-[#B87B22]" />
        </div>

        <div className="flex items-center gap-1.5 truncate max-w-[42%] justify-end">
          <span className="font-semibold text-[#12161E] truncate">{displayDestination}</span>
          <div className="w-2 h-2 rounded-full bg-[#B87B22] shrink-0" />
        </div>
      </div>

      {/* Metrics Grid (Duration, Distance, Cost, Frequency) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E5DFD5] text-xs">
        <div className="flex items-center gap-1.5 text-[#3D4654]">
          <Clock size={13} className="text-[#70798B] shrink-0" />
          <span data-testid="transit-duration" className="font-mono font-medium">
            {durationStr}
          </span>
        </div>

        {hop.distance_km != null && (
          <div className="flex items-center gap-1.5 text-[#3D4654]">
            <Route size={13} className="text-[#70798B] shrink-0" />
            <span data-testid="transit-distance" className="font-mono font-medium">
              {hop.distance_km} km
            </span>
          </div>
        )}

        {costStr && (
          <div className="flex items-center gap-1.5 text-[#3D4654]">
            <CircleDollarSign size={13} className="text-[#70798B] shrink-0" />
            <span data-testid="transit-cost" className="font-mono font-bold text-[#2F523E]">
              {costStr}
            </span>
          </div>
        )}

        {hop.frequency && (
          <div className="flex items-center gap-1.5 text-[#3D4654] col-span-2 sm:col-span-1">
            <Info size={13} className="text-[#70798B] shrink-0" />
            <span className="text-[11px] text-[#70798B] truncate">
              {hop.frequency}
            </span>
          </div>
        )}
      </div>

      {/* Optional Booking Tip / Route Reality Note */}
      {hop.booking_tip && (
        <div className="mt-2.5 p-2 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-[11px] text-[#70798B] flex items-start gap-1.5">
          <span className="text-[#B87B22] shrink-0 font-bold font-mono">Tip:</span>
          <span>{hop.booking_tip}</span>
        </div>
      )}
    </div>
  );
};
