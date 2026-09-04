import React from 'react';
import { Bus, ShieldAlert, CheckCircle, Image, Sparkles, Navigation, AlertCircle } from 'lucide-react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';

interface StitchDataTrustPageProps {
  onNavigate: (tab: StitchTab) => void;
}

export const StitchDataTrustPage: React.FC<StitchDataTrustPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto font-body selection:bg-[#B87B22]/20 selection:text-[#B87B22]">
      {/* Header */}
      <header className="border-b border-[#E5DFD5] pb-8 mb-10">
        <div className="flex items-center gap-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#B87B22] mb-3">
          <Bus className="w-4 h-4 text-[#B87B22]" />
          <span>Truth Boundaries &amp; Data Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#12161E] tracking-tight">
          Data Trust &amp; Transit Disclaimers
        </h1>
        <p className="text-sm text-[#70798B] mt-3 max-w-2xl leading-relaxed">
          O-TRAVELZ is built on deterministic truth standards. We clearly delineate verified facts from scheduled data, ensuring travelers in Odisha can plan journeys with grounded confidence.
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-[#70798B] font-mono">
          <span>Authority: Algoryxz Data Governance</span>
          <span>•</span>
          <span>Updated: September 2026</span>
        </div>
      </header>

      {/* Disclaimers & Standards */}
      <div className="space-y-8 text-sm text-[#3D4654] leading-relaxed">
        
        {/* Priority 1: Transit Timetable vs Real-Time Boundary */}
        <section className="bg-white border-2 border-[#B87B22]/40 rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#B87B22]/10 rounded-lg text-[#B87B22] shrink-0">
              <Bus className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-[#12161E]">
                  CRUT Mo Bus &amp; OSRTC Transit Boundary
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B87B22]/15 text-[#B87B22]">
                  SCHEDULED ONLY
                </span>
              </div>
              <p>
                All transit route numbers, bus stop sequences, corridors, and departure times in O-TRAVELZ are compiled directly from officially published static schedules provided by <strong>Capital Region Urban Transport (CRUT)</strong> and <strong>Odisha State Road Transport Corporation (OSRTC)</strong>.
              </p>
              
              <div className="bg-[#FBF9F5] border border-[#E5DFD5] rounded-lg p-4 space-y-2 mt-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#B87B22] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#3D4654] leading-relaxed">
                    <strong>Important Truth Boundary:</strong> O-TRAVELZ presents <em>scheduled timetable data</em>. We do <strong>not</strong> claim live vehicle GPS tracking or guaranteed real-time vehicle arrivals. Real-world bus arrivals may vary depending on urban traffic, road maintenance, and operator fleet adjustments.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 pt-1">
                  <CheckCircle className="w-4 h-4 text-[#2F523E] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#3D4654]">
                    <strong>Fare Integrity:</strong> Transit fares are strictly displayed only when official rate matrices are verified. Unverified fares remain unset rather than approximated.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Priority 2: Multidimensional Truth Badges */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#1B5E6B]/10 rounded-lg text-[#1B5E6B] shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                Multidimensional Place Verification
              </h2>
              <p>
                Every destination in our 204-place catalog is audited under a three-dimensional verification schema:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="border border-[#E5DFD5] bg-[#FAF7F2] rounded-lg p-3">
                  <span className="text-[11px] font-mono font-bold text-[#1B5E6B] uppercase block mb-1">
                    Verification
                  </span>
                  <p className="text-xs text-[#3D4654]">
                    Identifies whether coordinates and cultural records are canonical, field-checked, or provisional.
                  </p>
                </div>
                <div className="border border-[#E5DFD5] bg-[#FAF7F2] rounded-lg p-3">
                  <span className="text-[11px] font-mono font-bold text-[#2F523E] uppercase block mb-1">
                    Freshness
                  </span>
                  <p className="text-xs text-[#3D4654]">
                    Tracks when operational details, entry policies, and accessibility were last validated.
                  </p>
                </div>
                <div className="border border-[#E5DFD5] bg-[#FAF7F2] rounded-lg p-3">
                  <span className="text-[11px] font-mono font-bold text-[#A84825] uppercase block mb-1">
                    Availability
                  </span>
                  <p className="text-xs text-[#3D4654]">
                    Reflects whether an attraction is open, seasonal (e.g. waterfalls), or undergoing restoration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Priority 3: Authentic Image Gate */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#2F523E]/10 rounded-lg text-[#2F523E] shrink-0">
              <Image className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                Authentic Media Gate Policy
              </h2>
              <p>
                We enforce the strict architectural rule: <strong>NO VERIFIED IMAGE = NO PUBLIC DESTINATION</strong>.
              </p>
              <p className="text-xs text-[#70798B]">
                All destination imagery presented across O-TRAVELZ is sourced from verified photography or archival documentation. We do not generate or publish synthetic AI imagery of Odisha landmarks, temples, or landscapes.
              </p>
            </div>
          </div>
        </section>

        {/* Priority 4: Sacred Sanctuary & Ecological Protocols */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#A84825]/10 rounded-lg text-[#A84825] shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                Sacred Sanctuary &amp; Wildlife Protocols
              </h2>
              <p>
                Odisha is a tapestry of living sacred traditions and fragile coastal wetlands:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#3D4654]">
                <li><strong>Temple Etiquette:</strong> Traditional attire is mandatory in prominent temple sanctums. Remove leather accessories and footwear before entry. Strict photography bans apply inside sanctum grounds.</li>
                <li><strong>Wetland Protection:</strong> In Chilika Lake and Mangalajodi, motorized boats must throttle down near Irrawaddy dolphin habitats and migratory bird nesting grounds.</li>
              </ul>
            </div>
          </div>
        </section>

      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-6 border-t border-[#E5DFD5] flex flex-wrap gap-4 text-xs font-mono">
        <button
          onClick={() => onNavigate('privacy')}
          className="text-[#B87B22] hover:underline cursor-pointer"
        >
          Privacy Policy →
        </button>
        <button
          onClick={() => onNavigate('terms')}
          className="text-[#B87B22] hover:underline cursor-pointer"
        >
          Terms of Service →
        </button>
        <button
          onClick={() => onNavigate('discover')}
          className="text-[#70798B] hover:text-[#12161E] ml-auto cursor-pointer"
        >
          Return to Explore
        </button>
      </div>
    </div>
  );
};
