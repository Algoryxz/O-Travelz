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

  const getModeIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes("walk")) return <Footprints size={15} className="text-emerald-700" />;
    if (m.includes("bus") || m.includes("transit")) return <Bus size={15} className="text-blue-700" />;
    return <Car size={15} className="text-amber-700" />;
  };

  const hopTitle = isOrigin
    ? "Origin Start → Stop 1"
    : `Stop ${hop.from_sequence} → Stop ${hop.to_sequence}`;

  return (
    <div
      data-testid="transport-hop-card"
      className="relative pl-8 my-2.5 transition-all"
    >
      {/* Timeline connection line and directional arrow */}
      <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-300 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center shadow-xs">
          <ArrowDown size={11} className="text-emerald-700" />
        </div>
      </div>

      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
          isUnavailable
            ? "bg-amber-50/70 border-amber-200"
            : "bg-white border-gray-200 shadow-2xs hover:border-emerald-300"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              {getModeIcon(hop.mode)}
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">
                {hopTitle}
              </div>
              <span className="text-[11px] text-gray-500 font-medium">
                {`Mode: ${hop.mode}`}
              </span>
            </div>
          </div>

          <DataTierBadge tier={hop.data_tier} />
        </div>

        {/* Travel metrics strip */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          {hop.estimated_minutes !== null && hop.estimated_minutes !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
              <Clock size={12} className="text-emerald-700" />
              <span className="font-semibold text-gray-900">{`Duration: ${hop.estimated_minutes} min`}</span>
            </div>
          )}

          {hop.estimated_cost !== null && hop.estimated_cost !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
              <IndianRupee size={12} className="text-emerald-700" />
              <span className="font-semibold text-gray-900">{`Est. Cost: ₹${hop.estimated_cost}`}</span>
            </div>
          )}
        </div>

        {hop.reason && (
          <div
            data-testid="transport-hop-reason"
            className="mt-2.5 p-2.5 rounded-xl bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2"
          >
            <AlertTriangle size={14} className="text-amber-700 shrink-0 mt-0.5" />
            <span>{`Transport Notice: ${hop.reason}`}</span>
          </div>
        )}

        {hop.legs && hop.legs.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Transit Legs
            </span>
            <div className="space-y-1 text-xs text-gray-700">
              {hop.legs.map((leg, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold capitalize text-gray-900">{leg.mode}:</span>
                  <span className="text-gray-600">{leg.detail}</span>
                  {leg.provider && (
                    <span className="text-gray-400 font-mono text-[10px]">{`(Provider: ${leg.provider})`}</span>
                  )}
                  {leg.route && (
                    <span className="text-gray-400 font-mono text-[10px]">{`(Route: ${leg.route})`}</span>
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
