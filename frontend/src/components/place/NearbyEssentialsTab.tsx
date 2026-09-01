import React, { useState, useEffect } from "react";
import type {
  ServiceCategory,
  NearbyServiceResult,
  NearbyServicesGrouped,
} from "../../types/services";
import { getNearbyServicesForDestination } from "../../utils/serviceProximity";
import { apiClient } from "../../api/client";
import {
  HeartPulse,
  Shield,
  Hotel,
  Utensils,
  Fuel,
  Bus,
  CreditCard,
  Phone,
  Clock,
  Car,
  Compass,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface NearbyEssentialsTabProps {
  place: {
    id?: string;
    name: string;
    category?: string;
    lat?: number | null;
    lon?: number | null;
    location?: string;
  };
  onExploreServiceOnMap?: (service: NearbyServiceResult) => void;
}

export const NearbyEssentialsTab: React.FC<NearbyEssentialsTabProps> = ({
  place,
  onExploreServiceOnMap,
}) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("healthcare");
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineSnapshot, setIsOfflineSnapshot] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);
  const [groupedData, setGroupedData] = useState<NearbyServicesGrouped>(() => {
    if (!place.lat || !place.lon) {
      return {
        activeRadiusKm: 10,
        isExpanded: false,
        totalServicesCount: 0,
        healthcare: [],
        police: [],
        hotels: [],
        restaurants: [],
        fuel: [],
        transit: [],
        atms: [],
        safetyAdvisory: null,
      };
    }
    return getNearbyServicesForDestination({
      id: place.id,
      name: place.name,
      lat: place.lat,
      lon: place.lon,
      district: place.location,
    });
  });

  useEffect(() => {
    let isMounted = true;
    if (!place.lat || !place.lon) return;

    const fetchFromBackend = async () => {
      setIsLoading(true);
      setHasFetchError(false);
      try {
        const res = await apiClient.getDestinationEssentials({
          lat: place.lat!,
          lon: place.lon!,
          destination_id: place.id,
          destination_name: place.name,
          radius_km: 10.0,
        });
        if (isMounted && res && res.healthcare) {
          setIsOfflineSnapshot(false);
          setGroupedData({
            destinationId: res.destination_id,
            destinationName: res.destination_name,
            activeRadiusKm: res.active_radius_km,
            isExpanded: res.is_expanded,
            totalServicesCount: res.total_services_count,
            healthcare: res.healthcare.map((s: any) => ({ ...s, distanceKm: s.distance_km, distanceFormatted: s.distance_formatted, estimatedDriveMinutes: s.estimated_drive_minutes, estimatedWalkMinutes: s.estimated_walk_minutes })),
            police: res.police.map((s: any) => ({ ...s, distanceKm: s.distance_km, distanceFormatted: s.distance_formatted, estimatedDriveMinutes: s.estimated_drive_minutes, estimatedWalkMinutes: s.estimated_walk_minutes })),
            hotels: res.hotels.map((s: any) => ({ ...s, distanceKm: s.distance_km, distanceFormatted: s.distance_formatted, estimatedDriveMinutes: s.estimated_drive_minutes, estimatedWalkMinutes: s.estimated_walk_minutes })),
            restaurants: res.restaurants.map((s: any) => ({ ...s, distanceKm: s.distance_km, distanceFormatted: s.distance_formatted, estimatedDriveMinutes: s.estimated_drive_minutes, estimatedWalkMinutes: s.estimated_walk_minutes })),
            fuel: res.fuel.map((s: any) => ({ ...s, distanceKm: s.distance_km, distanceFormatted: s.distance_formatted, estimatedDriveMinutes: s.estimated_drive_minutes, estimatedWalkMinutes: s.estimated_walk_minutes })),
            transit: res.transit.map((s: any) => ({ ...s, distanceKm: s.distance_km, distanceFormatted: s.distance_formatted, estimatedDriveMinutes: s.estimated_drive_minutes, estimatedWalkMinutes: s.estimated_walk_minutes })),
            atms: res.atms.map((s: any) => ({ ...s, distanceKm: s.distance_km, distanceFormatted: s.distance_formatted, estimatedDriveMinutes: s.estimated_drive_minutes, estimatedWalkMinutes: s.estimated_walk_minutes })),
            safetyAdvisory: res.safety_advisory,
          });
        }
      } catch {
        if (isMounted) {
          setIsOfflineSnapshot(true);
          setHasFetchError(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFromBackend();
    return () => {
      isMounted = false;
    };
  }, [place.id, place.name, place.lat, place.lon, place.location]);

  const categories: Array<{
    id: ServiceCategory;
    label: string;
    icon: React.ElementType;
    count: number;
  }> = [
    {
      id: "healthcare",
      label: "Healthcare",
      icon: HeartPulse,
      count: groupedData.healthcare.length,
    },
    {
      id: "police",
      label: "Safety & Police",
      icon: Shield,
      count: groupedData.police.length,
    },
    {
      id: "hotel",
      label: "Hotels & Stays",
      icon: Hotel,
      count: groupedData.hotels.length,
    },
    {
      id: "restaurant",
      label: "Dining",
      icon: Utensils,
      count: groupedData.restaurants.length,
    },
    {
      id: "fuel",
      label: "Fuel Stations",
      icon: Fuel,
      count: groupedData.fuel.length,
    },
    {
      id: "transit",
      label: "Transit",
      icon: Bus,
      count: groupedData.transit.length,
    },
    {
      id: "atm",
      label: "ATMs & Cash",
      icon: CreditCard,
      count: groupedData.atms.length,
    },
  ];

  const getActiveList = (): NearbyServiceResult[] => {
    switch (activeCategory) {
      case "healthcare":
        return groupedData.healthcare;
      case "police":
        return groupedData.police;
      case "hotel":
        return groupedData.hotels;
      case "restaurant":
        return groupedData.restaurants;
      case "fuel":
        return groupedData.fuel;
      case "transit":
        return groupedData.transit;
      case "atm":
        return groupedData.atms;
      default:
        return [];
    }
  };

  const activeServices = getActiveList();
  const advisory = groupedData.safetyAdvisory;

  return (
    <div data-testid="nearby-essentials-panel" className="space-y-6">
      {/* Offline Snapshot / Degradation Notice */}
      {isOfflineSnapshot && (
        <div
          data-testid="offline-snapshot-notice"
          className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-[#70798B] flex items-center justify-between text-xs font-mono"
        >
          <div className="flex items-center gap-2">
            <Info size={14} className="text-[#B87B22]" />
            <span>Offline Snapshot · Displaying verified static development dataset (August 2026)</span>
          </div>
          <span className="text-[10px] bg-[#E5DFD5] text-[#3D4654] px-2 py-0.5 rounded-full font-bold">
            Offline Fallback
          </span>
        </div>
      )}

      {/* Prominent Traveller Safety Advisory Banner */}
      {advisory && (
        <div
          data-testid="destination-safety-banner"
          className="p-4 sm:p-5 rounded-2xl bg-[#FFFBF0] border border-[#F5E2B3] shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#F5E2B3] pb-2.5">
            <div className="flex items-center gap-2 text-[#945C10] font-mono font-bold text-xs uppercase tracking-wider">
              <Shield size={16} />
              <span>Traveller Safety &amp; Emergency Guidance</span>
            </div>
            {advisory.best_visiting_hours && (
              <span className="text-[11px] font-mono text-[#70798B] hidden sm:inline-block">
                Visiting hours: {advisory.best_visiting_hours}
              </span>
            )}
          </div>

          {/* Emergency Helplines Quick Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {advisory.emergency_contacts.map((contact, idx) => (
              <a
                key={idx}
                href={`tel:${contact.number}`}
                className="p-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E5DFD5] transition-colors flex items-center gap-2 text-xs font-semibold text-[#12161E] group"
              >
                <div className="w-6 h-6 rounded-md bg-[#9E2A2B]/10 text-[#9E2A2B] flex items-center justify-center shrink-0">
                  <Phone size={12} />
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-[10px] text-[#70798B] truncate">{contact.label}</div>
                  <div className="font-mono font-bold group-hover:text-[#9E2A2B]">{contact.number}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Grounded Advisories */}
          {advisory.safety_advisories.length > 0 && (
            <div className="space-y-2 pt-1">
              {advisory.safety_advisories.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-[#3D4654] leading-relaxed p-2.5 rounded-xl bg-white/80 border border-[#F5E2B3]"
                >
                  <AlertTriangle
                    size={15}
                    className={`shrink-0 mt-0.5 ${
                      item.severity === "warning"
                        ? "text-[#C2410C]"
                        : item.severity === "caution"
                        ? "text-[#D97706]"
                        : "text-[#1B5E6B]"
                    }`}
                  />
                  <div>
                    <span className="font-bold text-[#12161E] mr-1.5">{item.title}:</span>
                    <span>{item.guidance}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-[#70798B] pt-1">
            <span>Authoritative Source: {advisory.source}</span>
            <span>Verified: {advisory.last_verified}</span>
          </div>
        </div>
      )}

      {/* Category Navigation Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B87B22] flex items-center gap-1.5">
            <HeartPulse size={14} />
            <span>Essential Services Around Destination</span>
          </div>
          <span className="text-xs font-mono text-[#70798B]">
            {groupedData.totalServicesCount} verified facilities
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                data-testid={`essential-tab-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? "bg-[#12161E] text-white border-[#12161E] shadow-sm"
                    : "bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#3D4654] border-[#E5DFD5]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[#E6A035]" : "text-[#70798B]"} />
                <span>{cat.label}</span>
                <span
                  className={`ml-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-[#F2EEE7] text-[#70798B]"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Services List */}
      <div className="space-y-3">
        {activeServices.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] space-y-2">
            <Info size={24} className="mx-auto text-[#B87B22]/70" />
            <h4 className="font-serif font-bold text-sm text-[#12161E]">
              No verified {activeCategory} found within 50 km
            </h4>
            <p className="text-xs text-[#70798B] max-w-md mx-auto">
              In accordance with our zero-fabrication quality policy, we only present officially verified records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeServices.map((service) => (
              <div
                key={service.id}
                data-testid={`service-card-${service.id}`}
                className="p-4 rounded-2xl bg-white border border-[#E5DFD5] hover:border-[#B87B22]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#B87B22]/10 text-[#B87B22]">
                        {service.distanceFormatted}
                      </span>
                      <span className="text-[10px] font-mono text-[#70798B]">
                        (Straight-line)
                      </span>
                    </div>
                    {service.is_24x7 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2F523E]/10 text-[#2F523E]">
                        24x7 Open
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#12161E] group-hover:text-[#B87B22] transition-colors leading-snug">
                    {service.name}
                  </h4>
                  <p className="text-xs text-[#70798B] line-clamp-2 leading-relaxed">
                    {service.address}
                  </p>
                </div>

                {/* Metadata & Quick Actions */}
                <div className="pt-2 border-t border-[#E5DFD5]/60 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#70798B]">
                    <span className="flex items-center gap-1">
                      <Car size={12} className="text-[#1B5E6B]" />
                      <span>~{service.estimatedDriveMinutes} mins drive</span>
                    </span>
                    {service.cuisine && (
                      <span className="text-[#B87B22] truncate max-w-[140px]">
                        {service.cuisine}
                      </span>
                    )}
                    {service.bank_name && (
                      <span className="text-[#1B5E6B] font-semibold">
                        {service.bank_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {service.phone || service.emergency_phone ? (
                      <a
                        href={`tel:${service.emergency_phone || service.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#12161E] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#E5DFD5]"
                      >
                        <Phone size={12} className="text-[#2F523E]" />
                        <span>Call {service.emergency_phone || service.phone}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#70798B] italic">No phone listed</span>
                    )}

                    {onExploreServiceOnMap && (
                      <button
                        type="button"
                        onClick={() => onExploreServiceOnMap(service)}
                        className="px-3 py-1.5 rounded-lg bg-[#12161E] hover:bg-black text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Compass size={12} />
                        <span>Map</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Source Verification Badge */}
                <div className="text-[10px] font-mono text-[#70798B] flex items-center gap-1 truncate pt-1 border-t border-[#E5DFD5]/40">
                  <CheckCircle2 size={10} className="text-[#2F523E] shrink-0" />
                  <span className="truncate">Source: {service.source}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
