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
    if (m === "bus") return "Bus";
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
    if (m.includes("walk")) return <Footprints size={15} className="text-[#14B8A6]" />;
    if (m.includes("bus") || m.includes("transit")) return <Bus size={15} className="text-[#38BDF8]" />;
    return <Car size={15} className="text-[#F59E0B]" />;
  };

  const hopTitle = isOrigin
    ? "Origin Start → Stop 1"
    : `Stop ${hop.from_sequence} → Stop ${hop.to_sequence}`;

  const formattedDuration = formatDuration(hop.estimated_minutes);
  const distanceStr = extractDistance(hop);

  return (
    <div
      data-testid="transport-hop-card"
      className="relative pl-8 my-2.5 transition-all"
    >
      {/* Timeline connection line and directional arrow */}
      <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#14B8A6] via-[#0F766E] to-[#14B8A6] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-[#111827] border-2 border-[#14B8A6] flex items-center justify-center shadow-xs">
          <ArrowDown size={11} className="text-teal-300" />
        </div>
      </div>

      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
          isUnavailable
            ? "bg-amber-950/40 border-amber-800/60 text-amber-200"
            : "bg-[#111827] border-[#263244] text-white shadow-2xs hover:border-[#14B8A6]/50"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#263244]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#172235] border border-[#263244] flex items-center justify-center">
              {getModeIcon(hop.mode)}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {hopTitle}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {`Mode: ${formatMode(hop.mode)}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hop.estimated_minutes != null && hop.estimated_minutes > 120 && (
              <span
                data-testid="long-transfer-badge"
                className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 text-[10px] font-extrabold uppercase tracking-wider"
              >
                Long Journey
              </span>
            )}
            <DataTierBadge tier={hop.data_tier} />
          </div>
        </div>

        {/* Travel metrics strip */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
          {formattedDuration && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                hop.estimated_minutes != null && hop.estimated_minutes > 120
                  ? "bg-amber-950/60 border-amber-800 text-amber-200 font-bold"
                  : "bg-[#172235] border-[#263244]"
              }`}
            >
              <Clock
                size={12}
                className={
                  hop.estimated_minutes != null && hop.estimated_minutes > 120
                    ? "text-amber-400"
                    : "text-[#14B8A6]"
                }
              />
              <span className="font-semibold text-white font-mono">{formattedDuration}</span>
            </div>
          )}

          {distanceStr && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#172235] border border-[#263244]">
              <span className="text-[#14B8A6] font-bold">📍</span>
              <span className="font-semibold text-white font-mono">{distanceStr}</span>
            </div>
          )}

          {hop.estimated_cost !== null && hop.estimated_cost !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#172235] border border-[#263244]">
              <IndianRupee size={12} className="text-[#14B8A6]" />
              <span className="font-semibold text-white font-mono">{`Est. Cost: ₹${hop.estimated_cost}`}</span>
            </div>
          )}
        </div>

        {hop.reason && (
          <div
            data-testid="transport-hop-reason"
            className="mt-2.5 p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs font-medium flex items-start gap-2"
          >
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <span>{`Transport Notice: ${hop.reason}`}</span>
          </div>
        )}

        {hop.legs && hop.legs.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[#263244] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Transit Legs
            </span>
            <div className="space-y-1 text-xs text-slate-300">
              {hop.legs.map((leg, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                  <span className="font-semibold capitalize text-white">{leg.mode}:</span>
                  <span className="text-slate-300">{leg.detail}</span>
                  {leg.provider && (
                    <span className="text-slate-400 font-mono text-[10px]">{`(Provider: ${leg.provider})`}</span>
                  )}
                  {leg.route && (
                    <span className="text-slate-400 font-mono text-[10px]">{`(Route: ${leg.route})`}</span>
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
