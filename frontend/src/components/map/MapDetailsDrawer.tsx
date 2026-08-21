import React from "react";
import type { MapFeature, MapRelationship, UnavailableItem } from "../../api/contracts";
import { DataTierBadge } from "../transport/DataTierBadge";

interface MapDetailsDrawerProps {
  features: MapFeature[];
  relationships: MapRelationship[];
  unavailableItems: UnavailableItem[];
}

export const MapDetailsDrawer: React.FC<MapDetailsDrawerProps> = ({
  features,
  relationships,
  unavailableItems,
}) => {
  const availableFeatures = features.filter((f) => f.geometry_status === "available");
  const unavailableFeatures = features.filter((f) => f.geometry_status === "unavailable");

  return (
    <div
      data-testid="map-details-drawer"
      className="p-5 sm:p-6 rounded-3xl bg-[#111827] border border-[#263244] shadow-xl space-y-5 text-white"
    >
      <h4 className="text-sm font-bold text-white pb-2 border-b border-[#263244] flex items-center justify-between font-display">
        <span>Route Details &amp; Stops</span>
        <span className="text-xs font-normal text-slate-400 font-mono">
          {features.length} Places · {relationships.length} Hops
        </span>
      </h4>

      {/* Available Features List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-teal-300 font-mono uppercase tracking-wider">
            Mapped Locations ({availableFeatures.length})
          </span>
        </div>

        {availableFeatures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {availableFeatures.map((f, idx) => {
              const displayName = f.name || "Verified Destination";
              const category = f.category || f.feature_type;
              return (
                <div
                  key={`avail-${f.canonical_ref.id}-${idx}`}
                  data-testid={`available-feature-${idx}`}
                  className="p-2.5 rounded-2xl bg-[#172235] border border-[#263244] flex items-center justify-between hover:border-teal-500/40 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-white block text-xs truncate max-w-[180px]" title={displayName}>
                      {displayName}
                    </span>
                    <span className="text-[10px] text-teal-300 font-semibold uppercase">{category}</span>
                  </div>
                  {f.geometry?.type === "Point" && (
                    <span className="font-mono text-teal-400 font-medium text-[11px] shrink-0">
                      {f.geometry.coordinates[0].toFixed(4)}°, {f.geometry.coordinates[1].toFixed(4)}°
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No destination locations currently returned.</p>
        )}
      </div>

      {/* Unavailable Features List */}
      {unavailableFeatures.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#263244]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-300 font-mono uppercase tracking-wider">
              Stops Without Map Pins ({unavailableFeatures.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {unavailableFeatures.map((f, idx) => {
              const displayName = f.name || "Pending Destination";
              const category = f.category || f.feature_type;
              return (
                <div
                  key={`unavail-${f.canonical_ref.id}-${idx}`}
                  data-testid={`unavailable-feature-${idx}`}
                  className="p-2.5 rounded-2xl bg-[#172235] border border-amber-500/30 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs truncate max-w-[180px]" title={displayName}>
                      {displayName}
                    </span>
                    <span className="text-[10px] text-amber-300 font-medium uppercase">{category}</span>
                  </div>
                  <span className="mt-1 text-[11px] text-amber-200/80 font-mono">
                    Status: Location details pending
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Relationships / Transit Hops */}
      {relationships.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#263244]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-300 font-mono uppercase tracking-wider">
              Travel Hops ({relationships.length})
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {relationships.map((rel, idx) => (
              <div
                key={`rel-${idx}`}
                data-testid={`map-relationship-${idx}`}
                className="p-3 rounded-2xl bg-[#172235] border border-[#263244] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    Day {rel.hop_ref.day_number}: Stop {rel.hop_ref.from_sequence} → Stop {rel.hop_ref.to_sequence}
                  </span>
                  <DataTierBadge tier={rel.data_tier} />
                </div>
                <div className="text-[11px] text-slate-300">
                  <span className="font-semibold text-teal-300">{`Mode: ${rel.mode}`}</span>
                  {rel.reason && <span className="ml-2 text-slate-400 font-italic">({rel.reason})</span>}
                </div>

                {rel.legs && rel.legs.length > 0 && (
                  <div className="pt-1.5 border-t border-[#263244] space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono">Transit Segments</span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {rel.legs.map((leg, lIdx) => (
                        <li key={lIdx} className="flex items-center justify-between">
                          <span>
                            <span className="capitalize font-medium text-teal-300">{leg.mode}</span>: {leg.detail}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {leg.geometry_status === "available" ? "Route Plotted" : "Standard Connection"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unavailable Items */}
      {unavailableItems.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#263244]">
          <span className="font-semibold text-xs text-rose-400 font-mono uppercase tracking-wider">
            Notice on Selected Places ({unavailableItems.length})
          </span>
          <div className="space-y-1.5 text-xs">
            {unavailableItems.map((item, idx) => (
              <div
                key={`unres-${idx}`}
                data-testid={`unavailable-item-${idx}`}
                className="p-2.5 rounded-xl bg-rose-950/40 text-rose-200 border border-rose-500/40 text-xs font-mono"
              >
                <span>{item.item_type}: </span>
                <span className="font-bold text-white">{"id" in item.ref ? item.ref.id : `Day ${item.ref.day_number}`}</span>
                <span className="ml-2 text-rose-300">({item.unavailable_reason})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
