import { motion } from "motion/react";
import React from "react";
import type { TransitHop } from "../../types/api";
import { Clock, IndianRupee, AlertTriangle, Bus, Utensils, Info, ArrowRight } from "lucide-react";
import { DataTierBadge } from "../badges/DataTierBadge";

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
        <div className="text-xs text-[#70798B] italic font-body">
          Transit between destinations
        </div>
      </div>
    );
  }

  const formatTransitDuration = (minutes: number | null | undefined): string | null => {
    if (minutes === null || minutes === undefined || minutes <= 0) return null;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const formattedDuration = formatTransitDuration(hop.estimated_minutes);
  const distanceStr = hop.distance_km != null ? `${hop.distance_km} km` : null;
  const mj = hop.multimodal_journey;

  return (
    <div
      data-testid="transport-hop-card"
      className={`my-3 p-3.5 sm:p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] shadow-xs text-[#12161E] ${className}`}
    >
      {/* Visual connection track */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-dashed border-[#B87B22]/40 ml-4 py-1">
        <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FAF7F2] border-2 border-[#B87B22] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#B87B22]" />
        </div>

        {/* Route header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                data-testid="transit-mode-badge"
                className="text-[11px] font-bold uppercase tracking-wider text-[#B87B22] font-mono"
              >
                {hop.mode_label || hop.mode || "Transit Connection"}
              </span>
              <span className="text-xs text-[#70798B] font-medium font-body">
                {originName && destinationName ? `${originName} → ${destinationName}` : "Inter-Destination Hop"}
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
