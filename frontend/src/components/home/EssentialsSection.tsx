import React from "react";
import { useLocation } from "../../context/LocationContext";

interface EssentialsSectionProps {
  onOpenMedical: () => void;
  onOpenATM: () => void;
  onOpenTransit: () => void;
}

export const EssentialsSection: React.FC<EssentialsSectionProps> = ({
  onOpenMedical,
  onOpenATM,
  onOpenTransit,
}) => {
  const { locationName, city, isLive } = useLocation();
  const currentLabel = locationName || city || "Odisha";

  return (
    <section
      data-testid="essentials-near-you-section"
      className="w-full bg-[#FAF7F2] border-b border-[#E5DFD5] py-10 px-6 md:px-12 transition-colors"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Location Context */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5DFD5] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#B87B22]">
              <span className="w-2 h-2 rounded-full bg-[#2F523E]"></span>
              <span>Essential Travel Utilities</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#12161E] mt-1">
              Essentials Near You
            </h3>
            <p className="text-xs sm:text-sm font-body text-[#70798B] mt-0.5">
              Instant verified emergency, cash points, and mobility assistance centered around{" "}
              <span className="font-semibold text-[#12161E]">{currentLabel}</span>
              {isLive && (
                <span className="ml-1.5 inline-flex items-center gap-1 text-[#2F523E] font-mono text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F523E] animate-ping inline-block"></span>
                  <span>(Live GPS)</span>
                </span>
              )}
            </p>
          </div>

          <span className="text-[11px] font-mono text-[#70798B] hidden md:block">
            Verified Spatial Intelligence
          </span>
        </div>

        {/* 3 Prominent Utility Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {/* Card 1: Medical Help 24/7 */}
          <button
            type="button"
            onClick={onOpenMedical}
            className="group text-left p-5 rounded-2xl bg-white hover:bg-[#FFF5F5] border border-[#E5DFD5] hover:border-[#9E2A2B]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#9E2A2B]/10 group-hover:bg-[#9E2A2B]/15 text-[#9E2A2B] flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-2xl">local_hospital</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9E2A2B] bg-[#9E2A2B]/10 px-2 py-0.5 rounded-full">
                  24/7 Active
                </span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-[#12161E] group-hover:text-[#9E2A2B] transition-colors leading-snug">
                  Medical Help 24/7
                </h4>
                <p className="text-xs font-body text-[#70798B] mt-1 leading-relaxed">
                  Verified apex hospitals, emergency trauma care centers, and 24x7 pharmacies sorted by proximity.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5DFD5]/60 flex items-center justify-between text-xs font-mono font-semibold text-[#9E2A2B]">
              <span>View Nearby Hospitals</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </button>

          {/* Card 2: ATMs & Cash Points */}
          <button
            type="button"
            onClick={onOpenATM}
            className="group text-left p-5 rounded-2xl bg-white hover:bg-[#FBF8F2] border border-[#E5DFD5] hover:border-[#B87B22]/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#B87B22]/10 group-hover:bg-[#B87B22]/15 text-[#B87B22] flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-2xl">atm</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2F523E] bg-[#2F523E]/10 px-2 py-0.5 rounded-full">
                  Cash &amp; Forex
                </span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-[#12161E] group-hover:text-[#B87B22] transition-colors leading-snug">
                  ATMs &amp; Cash Points
                </h4>
                <p className="text-xs font-body text-[#70798B] mt-1 leading-relaxed">
                  Locate verified 24/7 bank ATMs, touch banking lounges, and currency kiosks near your location.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5DFD5]/60 flex items-center justify-between text-xs font-mono font-semibold text-[#B87B22]">
              <span>Locate ATMs on Map</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </button>

          {/* Card 3: Mo Bus & Transit */}
          <button
            type="button"
            onClick={onOpenTransit}
            className="group text-left p-5 rounded-2xl bg-white hover:bg-[#F2F8F9] border border-[#E5DFD5] hover:border-[#1B5E6B]/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#1B5E6B]/10 group-hover:bg-[#1B5E6B]/15 text-[#1B5E6B] flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-2xl">directions_bus</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B5E6B] bg-[#1B5E6B]/10 px-2 py-0.5 rounded-full">
                  CRUT Transit
                </span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-[#12161E] group-hover:text-[#1B5E6B] transition-colors leading-snug">
                  Mo Bus &amp; Transit
                </h4>
                <p className="text-xs font-body text-[#70798B] mt-1 leading-relaxed">
                  Official CRUT stops, scheduled bus routes, walking estimates, and multimodal corridors.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5DFD5]/60 flex items-center justify-between text-xs font-mono font-semibold text-[#1B5E6B]">
              <span>Explore Transit Hubs</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
