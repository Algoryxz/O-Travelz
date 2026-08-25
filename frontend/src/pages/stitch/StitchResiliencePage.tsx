import React from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';

interface StitchResiliencePageProps {
  onNavigate: (tab: StitchTab) => void;
}

export const StitchResiliencePage: React.FC<StitchResiliencePageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full pt-28 pb-24 px-6 md:px-12 max-w-5xl mx-auto space-y-12">
      <header className="border-b border-[#E5DFD5] pb-8">
        <div className="inline-flex items-center gap-2 bg-[#2F523E]/10 text-[#2F523E] px-3 py-1 rounded-full text-xs font-mono font-medium mb-3">
          <span className="material-symbols-outlined text-sm">vital_signs</span>
          <span>System Resilience Catalog</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold text-[#12161E]">
          Resilience &amp; Normalized States
        </h1>
        <p className="text-sm md:text-base font-body text-[#70798B] mt-2">
          Demonstrating zero-error-leakage, graceful fallbacks, and humanized luxury states.
        </p>
      </header>

      {/* Grid of System States */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* State 1: Normalized API Fallback */}
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">wifi_off</span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#12161E] mb-1">
            Offline / Network Resilience
          </h3>
          <p className="text-xs font-body text-[#3D4654] leading-relaxed mb-4">
            All 161 verified canonical destinations remain browsable with local cached fallbacks even during transit through remote forest Ghats.
          </p>
          <div className="bg-[#F2EEE7] p-3 rounded-lg font-mono text-xs text-[#70798B]">
            Status: Active SW Fallback • Zero Python Tracebacks
          </div>
        </div>

        {/* State 2: Canonical Identity Guarantee */}
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-[#1B5E6B]/10 text-[#1B5E6B] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">fingerprint</span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#12161E] mb-1">
            Canonical UUIDv5 Identity
          </h3>
          <p className="text-xs font-body text-[#3D4654] leading-relaxed mb-4">
            Deterministic UUIDs across the entire stack eliminate any potential 422 map projection or itinerary synthesis mismatches.
          </p>
          <div className="bg-[#F2EEE7] p-3 rounded-lg font-mono text-xs text-[#70798B]">
            Example: e0f760f3-8f0a-5b12-9c17-91f1a5b81091
          </div>
        </div>
      </div>
    </div>
  );
};
