import React from "react";
import type { TransportHop } from "../../api/contracts";
import { DataTierBadge } from "./DataTierBadge";
import { Footprints, Bus, Car, ArrowDown, Clock, IndianRupee, AlertTriangle } from "lucide-react";

interface TransportHopCardProps {
  hop: TransportHop;
}

export const TransportHopCard: React.FC<TransportHopCardProps> = ({ hop }) => {
  const isOrigin = hop.from_sequence === 0;
  const isUnavailable = hop.mode === "unavailable" || !!hop.reason;

  const formatDuration = (mins: number | null | undefined): string | null => {
    if (mins === null || mins === undefined) return null;
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining.toString().padStart(2, "0")}m` : `${hours}h`;
  };

  const formatMode = (mode: string): string => {
    const m = mode.toLowerCase();
    if (m === "road" || m === "car") return "Car / Road";
    if (m === "walk") return "Walk";
    if (m === "bus") return "Mo Bus";
    if (m === "rail" || m === "train") return "Train";
    if (m === "e-rickshaw" || m === "e_ride") return "Mo E-Ride";
    if (m === "unavailable") return "unavailable";
    return mode;
  };

  const extractDistance = (hop: TransportHop): string | null => {
    for (const leg of hop.legs || []) {
      const match = leg.detail?.match(/(?:~|approximately\s+)?(\d+(?:\.\d+)?\s*(?:km|m))/i);
      if (match) return match[1];
    }
    return null;
  };

  const getModeIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes("walk")) return <Footprints size={14} className="text-[#2F523E]" />;
    if (m.includes("bus") || m.includes("transit")) return <Bus size={14} className="text-[#1B5E6B]" />;
    return <Car size={14} className="text-[#B87B22]" />;
  };

  const hopTitle = isOrigin
    ? "Origin Start → Stop 1"
    : `Stop ${hop.from_sequence} → Stop ${hop.to_sequence}`;

  const formattedDuration = formatDuration(hop.estimated_minutes);
  const distanceStr = extractDistance(hop);

  return (
    <div
      data-testid="transport-hop-card"
      className="relative pl-8 my-2 transition-all"
    >
      {/* Timeline connection line and directional arrow */}
      <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-[#E5DFD5] flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-[#FFFFFF] border border-[#E5DFD5] flex items-center justify-center shadow-xs">
          <ArrowDown size={10} className="text-[#70798B]" />
        </div>
      </div>

      <div
        className={`p-3 rounded-xl border transition-all ${
          isUnavailable
            ? "bg-[#FFF7ED] border-[#FDBA74] text-[#C2410C]"
            : "bg-[#FAF7F2] border-[#E5DFD5] text-[#12161E] shadow-2xs hover:border-[#D1C8BA]"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[#E5DFD5]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#FFFFFF] border border-[#E5DFD5] flex items-center justify-center">
              {getModeIcon(hop.mode)}
            </div>
            <div>
              <div className="text-xs font-bold text-[#12161E]">
                {hopTitle}
              </div>
              <span className="text-[11px] text-[#70798B] font-medium font-mono">
                {`Mode: ${formatMode(hop.mode)}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hop.estimated_minutes != null && hop.estimated_minutes > 120 && (
              <span
                data-testid="long-transfer-badge"
                className="px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#B87B22] border border-[#E5DFD5] text-[10px] font-bold uppercase tracking-wider font-mono"
              >
                Long Journey
              </span>
            )}
            <DataTierBadge tier={hop.data_tier} />
          </div>
        </div>

        {/* Travel metrics strip */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#3D4654]">
          {formattedDuration && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E5DFD5]">
              <Clock size={11} className="text-[#1B5E6B]" />
              <span className="font-semibold text-[#12161E] font-mono text-[11px]">{formattedDuration}</span>
            </div>
          )}

          {distanceStr && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E5DFD5]">
              <span className="text-[#B87B22] font-bold text-[11px]">📍</span>
              <span className="font-semibold text-[#12161E] font-mono text-[11px]">{distanceStr}</span>
            </div>
          )}

          {hop.estimated_cost !== null && hop.estimated_cost !== undefined && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E5DFD5]">
              <IndianRupee size={11} className="text-[#2F523E]" />
              <span className="font-semibold text-[#12161E] font-mono text-[11px]">{`Est: ₹${hop.estimated_cost}`}</span>
            </div>
          )}
        </div>

        {hop.reason && (
          <div
            data-testid="transport-hop-reason"
            className="mt-2 p-2 rounded-lg bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] text-xs font-medium flex items-start gap-1.5"
          >
            <AlertTriangle size={13} className="text-[#C2410C] shrink-0 mt-0.5" />
            <span>{`Transport Notice: ${hop.reason}`}</span>
          </div>
        )}

        {hop.legs && hop.legs.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-[#E5DFD5] space-y-1">
            <span className="text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono">
              Transit Legs
            </span>
            <div className="space-y-1 text-xs text-[#3D4654]">
              {hop.legs.map((leg, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E6B]" />
                  <span className="font-semibold capitalize text-[#12161E]">{leg.mode}:</span>
                  <span>{leg.detail}</span>
                  {leg.provider && (
                    <span className="text-[#70798B] font-mono text-[10px]">{`(Provider: ${leg.provider})`}</span>
                  )}
                  {leg.route && (
                    <span className="text-[#70798B] font-mono text-[10px]">{`(Route: ${leg.route})`}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
