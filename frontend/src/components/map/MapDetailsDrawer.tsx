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
      className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5"
    >
      <h4 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center justify-between font-display">
        <span>Route Details &amp; Stops</span>
        <span className="text-xs font-normal text-gray-500 font-mono">
          {features.length} Places · {relationships.length} Hops
        </span>
      </h4>

      {/* Available Features List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-800">
            Mapped Locations ({availableFeatures.length})
          </span>
        </div>

        {availableFeatures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {availableFeatures.map((f, idx) => (
              <div
                key={`avail-${f.canonical_ref.id}-${idx}`}
                data-testid={`available-feature-${idx}`}
                className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-gray-800 block text-[11px] truncate max-w-[150px]" title={f.canonical_ref.id}>
                    {f.canonical_ref.id}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">{f.feature_type}</span>
                </div>
                {f.geometry?.type === "Point" && (
                  <span className="font-mono text-emerald-900 font-medium text-[11px]">
                    {f.geometry.coordinates[0].toFixed(4)}°, {f.geometry.coordinates[1].toFixed(4)}°
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No destination locations currently returned.</p>
        )}
      </div>

      {/* Unavailable Features List */}
      {unavailableFeatures.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-800">
              Stops Without Map Pins ({unavailableFeatures.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {unavailableFeatures.map((f, idx) => (
              <div
                key={`unavail-${f.canonical_ref.id}-${idx}`}
                data-testid={`unavailable-feature-${idx}`}
                className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-800 text-[11px] truncate max-w-[140px]" title={f.canonical_ref.id}>
                    {f.canonical_ref.id}
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium uppercase">{f.feature_type}</span>
                </div>
                <span className="mt-1 text-[11px] text-amber-900 font-mono">
                  Status: Location details pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationships / Transit Hops */}
      {relationships.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-800">
              Travel Hops ({relationships.length})
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {relationships.map((rel, idx) => (
              <div
                key={`rel-${idx}`}
                data-testid={`map-relationship-${idx}`}
                className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Day {rel.hop_ref.day_number}: Stop {rel.hop_ref.from_sequence} → Stop {rel.hop_ref.to_sequence}
                  </span>
                  <DataTierBadge tier={rel.data_tier} />
                </div>
                <div className="text-[11px] text-gray-600">
                  <span className="font-semibold">{`Mode: ${rel.mode}`}</span>
                  {rel.reason && <span className="ml-2 text-gray-500 font-italic">({rel.reason})</span>}
                </div>

                {rel.legs && rel.legs.length > 0 && (
                  <div className="pt-1 border-t border-gray-100 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Transit Segments</span>
                    <ul className="space-y-0.5 text-[11px] text-gray-600">
                      {rel.legs.map((leg, lIdx) => (
                        <li key={lIdx} className="flex items-center justify-between">
                          <span>
                            <span className="capitalize font-medium text-gray-800">{leg.mode}</span>: {leg.detail}
                          </span>
                          <span className="font-mono text-[10px] text-gray-500">
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
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <span className="font-semibold text-xs text-red-800">
            Notice on Selected Places ({unavailableItems.length})
          </span>
          <div className="space-y-1.5 text-xs">
            {unavailableItems.map((item, idx) => (
              <div
                key={`unres-${idx}`}
                data-testid={`unavailable-item-${idx}`}
                className="p-2 rounded-xl bg-red-50 text-red-900 border border-red-200 text-xs font-mono"
              >
                <span>{item.item_type}: </span>
                <span className="font-bold">{"id" in item.ref ? item.ref.id : `Day ${item.ref.day_number}`}</span>
                <span className="ml-2 text-red-700">({item.unavailable_reason})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
