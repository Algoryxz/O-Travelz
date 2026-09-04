import React from 'react';
import { Shield, Lock, EyeOff, Smartphone, Database, CheckCircle2 } from 'lucide-react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';

interface StitchPrivacyPageProps {
  onNavigate: (tab: StitchTab) => void;
}

export const StitchPrivacyPage: React.FC<StitchPrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto font-body selection:bg-[#B87B22]/20 selection:text-[#B87B22]">
      {/* Header */}
      <header className="border-b border-[#E5DFD5] pb-8 mb-10">
        <div className="flex items-center gap-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#B87B22] mb-3">
          <Shield className="w-4 h-4 text-[#B87B22]" />
          <span>Trust &amp; Privacy Boundary</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#12161E] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#70798B] mt-3 max-w-2xl leading-relaxed">
          O-TRAVELZ is designed with sovereign privacy principles. We operate transparent, ephemeral data flows to protect travelers discovering Odisha.
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-[#70798B] font-mono">
          <span>Effective: September 2026</span>
          <span>•</span>
          <span>Version 4.0</span>
          <span>•</span>
          <span>Algoryxz Core Architecture</span>
        </div>
      </header>

      {/* Core Privacy Pillars */}
      <div className="space-y-8 text-sm text-[#3D4654] leading-relaxed">
        
        {/* Section 1: Ephemeral Geolocation */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#1B5E6B]/10 rounded-lg text-[#1B5E6B] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                1. Ephemeral Geolocation &amp; Live GPS
              </h2>
              <p>
                When you grant location permissions, your geographic coordinates are processed strictly <strong>in-session on your local device</strong>. Coordinates are used solely to:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#3D4654]">
                <li>Calculate walking distance bands to nearby Mo Bus / Ama Bus stops.</li>
                <li>Sort destination circuits by real-time proximity.</li>
                <li>Center the interactive map on your active hub.</li>
              </ul>
              <div className="bg-[#FAF7F2] border border-[#E5DFD5] rounded-lg p-3.5 text-xs text-[#70798B] flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-[#2F523E] shrink-0" />
                <span>Your precise live GPS coordinates are never stored in backend databases or sold to third-party ad brokers.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Local Device Storage */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#B87B22]/10 rounded-lg text-[#B87B22] shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                2. Local Device Storage &amp; Offline Caching
              </h2>
              <p>
                O-TRAVELZ utilizes modern browser storage (LocalStorage and IndexedDB) to preserve your travel session:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#3D4654]">
                <li><strong>Saved Bookmarks:</strong> Destinations and itineraries you bookmark stay saved in your device storage.</li>
                <li><strong>Traveler Preferences:</strong> Selected budget tiers, mobility constraints, and dietary preferences.</li>
                <li><strong>Offline Transit Schedules:</strong> Downloaded timetable groups to ensure navigation continues even during rural connectivity blackouts.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Telemetry & Analytics */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#2F523E]/10 rounded-lg text-[#2F523E] shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                3. Zero Third-Party Tracker Guarantees
              </h2>
              <p>
                We do not integrate surveillance tracking scripts, third-party advertising cookies, or cross-site tracking pixels. Analytical pings are strictly limited to anonymous API health telemetry (e.g. routing latency and tile server availability).
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Contact & Data Subject Rights */}
        <section className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#A84825]/10 rounded-lg text-[#A84825] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-display font-bold text-[#12161E]">
                4. Data Subject Rights &amp; Algoryxz Governance
              </h2>
              <p>
                You may clear all locally cached preferences and saved places at any time directly through your browser cache settings or the Settings modal.
              </p>
              <p className="text-xs text-[#70798B] mt-2">
                For architectural or governance inquiries: <span className="font-mono text-[#12161E]">contact@algoryxz.com</span>
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-6 border-t border-[#E5DFD5] flex flex-wrap gap-4 text-xs font-mono">
        <button
          onClick={() => onNavigate('terms')}
          className="text-[#B87B22] hover:underline cursor-pointer"
        >
          Terms of Service →
        </button>
        <button
          onClick={() => onNavigate('trust')}
          className="text-[#B87B22] hover:underline cursor-pointer"
        >
          Data Trust &amp; Transit Disclaimers →
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
