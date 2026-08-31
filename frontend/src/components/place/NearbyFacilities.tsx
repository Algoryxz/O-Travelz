import React from "react";
import {
  Hotel,
  Utensils,
  CreditCard,
  Fuel,
  Hospital,
  Shield,
  Bus,
  Compass,
} from "lucide-react";
import {
  getNearbyFacilitiesForPlace,
  NearbyFacilityItem,
} from "../../services/geospatialRelationshipService";

export interface NearbyFacilitiesProps {
  sourceId?: string | null;
  maxItemsPerCategory?: number;
  className?: string;
}

export const NearbyFacilities: React.FC<NearbyFacilitiesProps> = ({
  sourceId,
  maxItemsPerCategory = 4,
  className = "",
}) => {
  if (!sourceId) return null;

  const group = getNearbyFacilitiesForPlace(sourceId);
  if (group.total_nearby_count === 0) return null;

  const categories = [
    {
      key: "hotels",
      title: "Nearby Hotels & Lodging",
      icon: Hotel,
      color: "text-[#B87B22]",
      bgColor: "bg-[#FDF8F0]",
      items: group.hotels.slice(0, maxItemsPerCategory),
    },
    {
      key: "restaurants",
      title: "Nearby Dining & Restaurants",
      icon: Utensils,
      color: "text-[#C05621]",
      bgColor: "bg-[#FFF5F5]",
      items: group.restaurants.slice(0, maxItemsPerCategory),
    },
    {
      key: "atms",
      title: "Nearby Cash Points & ATMs",
      icon: CreditCard,
      color: "text-[#2B6CB0]",
      bgColor: "bg-[#EBF8FF]",
      items: group.atms.slice(0, maxItemsPerCategory),
    },
    {
      key: "petrol_pumps",
      title: "Nearby Fuel & Petrol Pumps",
      icon: Fuel,
      color: "text-[#D69E2E]",
      bgColor: "bg-[#FEFCBF]",
      items: group.petrol_pumps.slice(0, maxItemsPerCategory),
    },
    {
      key: "hospitals",
      title: "Nearby Medical & Emergency Care",
      icon: Hospital,
      color: "text-[#E53E3E]",
      bgColor: "bg-[#FFF5F5]",
      items: group.hospitals.slice(0, maxItemsPerCategory),
    },
    {
      key: "police_stations",
      title: "Nearby Police & Safety Services",
      icon: Shield,
      color: "text-[#2F523E]",
      bgColor: "bg-[#F2F7F4]",
      items: group.police_stations.slice(0, maxItemsPerCategory),
    },
    {
      key: "transport_stops",
      title: "Nearby Verified Transport Stops",
      icon: Bus,
      color: "text-[#4A5568]",
      bgColor: "bg-[#EDF2F7]",
      items: group.transport_stops.slice(0, maxItemsPerCategory),
    },
  ];

  const activeCategories = categories.filter((c) => c.items.length > 0);

  return (
    <div
      data-testid="nearby-facilities-container"
      className={`space-y-6 bg-white rounded-xl border border-[#E5DFD5] p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#B87B22]" />
          <h4 className="text-lg font-display font-bold text-[#12161E]">
            Nearby Facilities & Utilities
          </h4>
        </div>
        <span className="text-xs font-mono font-semibold text-[#70798B]">
          {group.total_nearby_count} Verified Nearby
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeCategories.map((cat) => {
          const IconComp = cat.icon;
          return (
            <div
              key={cat.key}
              className={`rounded-lg border border-[#E5DFD5] p-4 ${cat.bgColor} space-y-3`}
            >
              <div className="flex items-center gap-2 border-b border-[#E5DFD5]/60 pb-2">
                <IconComp className={`w-4 h-4 ${cat.color}`} />
                <h5 className="text-sm font-display font-bold text-[#12161E]">
                  {cat.title}
                </h5>
              </div>

              <ul className="space-y-2">
                {cat.items.map((item: NearbyFacilityItem) => (
                  <li
                    key={item.target_id}
                    className="flex items-center justify-between gap-2 text-xs font-body bg-white/80 rounded px-2.5 py-1.5 border border-[#E5DFD5]/50 shadow-2xs"
                  >
                    <span className="font-semibold text-[#12161E] truncate max-w-[200px] sm:max-w-[240px]">
                      {item.target_name}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-[#70798B]">
                      <span className="font-bold text-[#12161E]">
                        {item.distance_formatted}
                      </span>
                      <span>·</span>
                      <span className="capitalize">{item.distance_class.replace("_", " ")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
