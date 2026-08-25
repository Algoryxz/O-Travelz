import React from "react";
import type { TransportHop } from "../../api/contracts";
import { DataTierBadge } from "./DataTierBadge";
import {
  Footprints,
  Bus,
  Car,
  ArrowDown,
  Clock,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  Utensils,
  Repeat,
  Info,
} from "lucide-react";

interface TransportHopCardProps {
  hop: TransportHop;
}

export const TransportHopCard: React.FC<TransportHopCardProps> = ({ hop }) => {
  const isOrigin = hop.from_sequence === 0;
  const isUnavailable = hop.mode === "unavailable" || !!hop.reason;
  const mj = hop.multimodal_journey;

  const formatDuration = (mins: number | null | undefined): string | null => {
    if (mins === null || mins === undefined) return null;
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining.toString().padStart(2, "0")}m` : `${hours}h`;
  };

  const formatMode = (mode: string): string => {
    const m = mode.toLowerCase();
    if (m.includes("transfer")) return "Multimodal (1-Transfer)";
    if (m === "road" || m === "car") return "Car / Road";
    if (m === "walk") return "Walk";
    if (m === "bus") return "Mo Bus";
    if (m === "rail" || m === "train") return "Train";
    if (m === "e-rickshaw" || m === "e_ride") return "Mo E-Ride";
    if (m === "unavailable") return "unavailable";
    return mode;
  };


  const extractDistance = (h: TransportHop): string | null => {
    for (const leg of h.legs || []) {
      const match = leg.detail?.match(/(?:~|approximately\s+)?(\d+(?:\.\d+)?\s*(?:km|m))/i);
      if (match) return match[1];
    }
    return null;
  };

  const getModeIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes("transfer")) return <Repeat size={14} className="text-[#B87B22]" />;
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
        className={`p-3.5 rounded-xl border transition-all ${
          isUnavailable
            ? "bg-[#FFF7ED] border-[#FDBA74] text-[#C2410C]"
            : "bg-[#FAF7F2] border-[#E5DFD5] text-[#12161E] shadow-2xs hover:border-[#D1C8BA]"
        }`}
      >
        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5DFD5]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#FFFFFF] border border-[#E5DFD5] flex items-center justify-center">
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
            {mj && (
              <span className="px-2 py-0.5 rounded-md bg-[#2B72BA]/10 text-[#2B72BA] border border-[#2B72BA]/30 text-[10px] font-bold font-mono">
                {mj.journey_type === "1_transfer" ? "1-Transfer Planned" : "Direct Transit Planned"}
              </span>
            )}
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
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-[#3D4654]">
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

          {mj?.departure_time && mj?.estimated_arrival_time && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#2B72BA]/10 text-[#2B72BA] border border-[#2B72BA]/20 font-mono text-[11px] font-semibold">
              <span>{`Dep: ${mj.departure_time}`}</span>
              <ArrowRight size={10} />
              <span>{`Arr: ${mj.estimated_arrival_time}`}</span>
            </div>
          )}
        </div>

        {/* Multimodal Detailed Journey Timeline if present */}
        {mj ? (
          <div className="mt-3 pt-2.5 border-t border-[#E5DFD5] space-y-2">
            <span className="text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono">
              Detailed Multimodal Transit Plan
            </span>

            {/* Transit Legs & Intermediate Transfer */}
            {mj.transit_legs.map((leg, lIdx) => (
              <div key={leg.route_id + lIdx} className="space-y-1.5">
                {/* Transfer Hub Step */}
                {lIdx > 0 && (
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-xs font-body">
                    <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-semibold font-mono text-[11px]">
                      <span>Transfer Interchange • {mj.transfer_hub || leg.boarding_stop_name}</span>
                      <span>~{mj.transfer_wait_minutes || 10} min buffer</span>
                    </div>
                    <div className="text-[11px] text-[#70798B] mt-0.5">
                      Alight from Mo Bus {mj.transit_legs[lIdx - 1].route_number} and board Mo Bus {leg.route_number} at {leg.boarding_stop_name}.
                    </div>
                  </div>
                )}

                {/* Transit Leg Detail */}
                <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-xs font-body">
                  <div className="flex items-center justify-between font-semibold text-[#12161E]">
                    <div className="flex items-center gap-1.5">
                      <Bus size={12} className="text-[#1B5E6B]" />
                      <span>{`Mo Bus ${leg.route_number}: ${leg.boarding_stop_name} → ${leg.alighting_stop_name}`}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#70798B]">{`${leg.stop_count} stops (~${leg.estimated_transit_mins}m)`}</span>
                  </div>

                  {leg.selected_departure && (
                    <div className="mt-1 text-[11px] font-mono text-emerald-700 font-semibold">
                      {`Scheduled: ${leg.selected_departure}${leg.estimated_arrival ? ` → Arrival: ${leg.estimated_arrival}` : ""}`}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Food Waypoint on Corridor */}
            {mj.food_waypoint && (
              <div className="p-2.5 rounded-lg bg-[#FAF5EE] border border-[#B87B22]/30 text-xs font-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-[#12161E]">
                    <Utensils size={12} className="text-[#B87B22]" />
                    <span>{`Corridor Food: ${mj.food_waypoint.name}`}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-bold bg-emerald-100 text-emerald-800">
                    {mj.food_waypoint.corridor_status === "ON_ROUTE" ? "On Route" : `~${mj.food_waypoint.estimated_detour_minutes}m detour`}
                  </span>
                </div>
                <div className="text-[11px] text-[#70798B] mt-0.5">
                  {`${mj.food_waypoint.cuisine || "Authentic Regional Food"} (${mj.food_waypoint.source})`}
                </div>
              </div>
            )}

            {/* Warnings */}
            {mj.warnings && mj.warnings.length > 0 && (
              <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-200/50 text-[10px] text-amber-800 font-mono flex items-start gap-1">
                <Info size={11} className="shrink-0 mt-0.5" />
                <span>{mj.warnings.join(" ")}</span>
              </div>
            )}
          </div>
        ) : (
          /* Standard Legacy Legs Display */
          hop.legs && hop.legs.length > 0 && (
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
          )
        )}

        {hop.reason && (
          <div
            data-testid="transport-hop-reason"
            className="mt-2 p-2 rounded-lg bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] text-xs font-medium flex items-start gap-1.5"
          >
            <AlertTriangle size={13} className="text-[#C2410C] shrink-0 mt-0.5" />
            <span>{`Transport Notice: ${hop.reason}`}</span>
          </div>
        )}
      </div>
    </div>
  );
};
