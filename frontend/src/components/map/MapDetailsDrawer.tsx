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
      className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-5 text-[#12161E]"
    >
      <h4 className="text-sm font-bold text-[#12161E] pb-2 border-b border-[#E5DFD5] flex items-center justify-between font-serif">
        <span>Route Details &amp; Spatial Corridors</span>
        <span className="text-xs font-normal text-[#70798B] font-mono">
          {features.length} Places · {relationships.length} Hops
        </span>
      </h4>

      {/* Available Features List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#B87B22] font-mono uppercase tracking-wider">
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
                  className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-between hover:border-[#D1C8BA] transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-[#12161E] block text-xs truncate max-w-[180px]" title={displayName}>
                      {displayName}
                    </span>
                    <span className="text-[10px] text-[#B87B22] font-semibold uppercase font-mono">{category}</span>
                  </div>
                  {f.geometry?.type === "Point" && (
                    <span className="font-mono text-[#70798B] font-medium text-[11px] shrink-0">
                      {f.geometry.coordinates[0].toFixed(4)}°, {f.geometry.coordinates[1].toFixed(4)}°
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#70798B] italic">No destination locations currently returned.</p>
        )}
      </div>

      {/* Unavailable Features List */}
      {unavailableFeatures.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#E5DFD5]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#A84825] font-mono uppercase tracking-wider">
              Stops Without Map Pins ({unavailableFeatures.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {unavailableFeatures.map((f, idx) => {
              const displayName = f.name || "Pending Destination";
              const category = f.category || f.feature_type;
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(f.canonical_ref.id);
              return (
                <div
                  key={`unavail-${f.canonical_ref.id}-${idx}`}
                  data-testid={`unavailable-feature-${idx}`}
                  className="p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FDBA74] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#12161E] text-xs truncate max-w-[180px]" title={displayName}>
                      {displayName}
                    </span>
                    <span className="text-[10px] text-[#A84825] font-medium uppercase font-mono">{category}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-[#C2410C]">
                    {!isUuid && <span>{f.canonical_ref.id}</span>}
                    <span>({f.unavailable_reason || "coordinate_unverified"})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unavailable Items Notice */}
      {unavailableItems && unavailableItems.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#E5DFD5]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#A84825] font-mono uppercase tracking-wider">
              Notice on Selected Places ({unavailableItems.length})
            </span>
          </div>
          <div className="space-y-1 text-xs">
            {unavailableItems.map((u, idx) => {
              const uId = (u.ref as any)?.id || (u.ref as any)?.hop_id || (u as any).id || "unknown";
              const reason = u.unavailable_reason || (u as any).reason_code || "unavailable";
              return (
                <div key={idx} className="p-2 rounded-lg bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] font-mono text-[11px] flex items-center justify-between">
                  <span>{uId}</span>
                  <span>({reason})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Relationships / Transit Hops */}
      {relationships.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#E5DFD5]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1B5E6B] font-mono uppercase tracking-wider">
              Travel Hops ({relationships.length})
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {relationships.map((rel, idx) => (
              <div
                key={`rel-${idx}`}
                data-testid={`map-relationship-${idx}`}
                className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#12161E]">
                    Day {rel.hop_ref.day_number}: Stop {rel.hop_ref.from_sequence} → Stop {rel.hop_ref.to_sequence}
                  </span>
                  <div className="flex items-center gap-2">
                    {(rel as any).geometry && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1B5E6B]/15 text-[#1B5E6B] border border-[#1B5E6B]/30">
                        Route Plotted
                      </span>
                    )}
                    <DataTierBadge tier={rel.data_tier} />
                  </div>
                </div>
                <div className="text-[11px] text-[#3D4654]">
                  <span className="font-semibold text-[#1B5E6B]">{`Mode: ${rel.mode}`}</span>
                  {rel.reason && <span className="ml-2 text-[#70798B] font-italic">({rel.reason})</span>}
                </div>

                {rel.legs && rel.legs.length > 0 && (
                  <div className="pt-1.5 border-t border-[#E5DFD5] space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#70798B] font-semibold font-mono">Transit Segments</span>
                    <ul className="space-y-1 text-[11px] text-[#3D4654]">
                      {rel.legs.map((leg, lIdx) => (
                        <li key={lIdx} className="flex items-center justify-between">
                          <span>
                            <span className="capitalize font-medium text-[#1B5E6B]">{leg.mode}</span>: {leg.detail}
                          </span>
                          {leg.geometry_status === "available" && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1B5E6B]/15 text-[#1B5E6B]">
                              Route Plotted
                            </span>
                          )}
                          {leg.geometry_status === "unavailable" && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-[#70798B] bg-[#F2EEE7]">
                              Standard Connection
                            </span>
                          )}
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
    </div>
  );
};
