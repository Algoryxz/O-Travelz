import React from "react";
import { Shield, Lock, Eye, FileText, CheckCircle2, UserCheck, AlertCircle, ArrowLeft } from "lucide-react";

interface LegalPageProps {
  onBack?: () => void;
}

export const PrivacyPolicyPage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <main
      data-testid="privacy-policy-page"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300 text-white"
    >
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          data-testid="privacy-back-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Travel Hub</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#111827] border border-[#263244] shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[#14B8A6]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] font-mono">
            RESPONSIBLE DATA GOVERNANCE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          O-Travelz Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          Designed in alignment with India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the Digital Personal Data Protection Rules, 2025.
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-slate-400 font-mono">
          <span>Last Updated: August 2026</span>
          <span>•</span>
          <span>Version: 1.0 (Phase 9 Release)</span>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#172235] border border-[#263244] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
            <Lock size={16} />
          </div>
          <h3 className="text-sm font-bold text-white">Zero Cloud Tracking</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your live location stays client-side in browser memory. We do not maintain server-side user tracking databases.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#172235] border border-[#263244] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold">
            <Eye size={16} />
          </div>
          <h3 className="text-sm font-bold text-white">Explicit Consent</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Geolocation is requested only after an in-app explanation. You can withdraw or block location anytime.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#172235] border border-[#263244] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
            <UserCheck size={16} />
          </div>
          <h3 className="text-sm font-bold text-white">Local Storage Control</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Saved destinations and trip drafts are stored directly on your device via standard browser localStorage.
          </p>
        </div>
      </div>

      {/* Main Policy Sections */}
      <div className="space-y-6 text-sm text-slate-300 leading-relaxed divide-y divide-[#263244]">
        {/* Section 1: Data We Process */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <span>1. What Personal Data We Process</span>
          </h2>
          <p>
            O-Travelz is architected as a destination exploration and itinerary planning directory for Odisha. We process minimal data strictly necessary for travel functionalities:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
            <li>
              <strong className="text-white">Live Location Coordinates (Optional):</strong> Latitude and longitude obtained via your browser's Geolocation API when explicitly permitted. Processed client-side solely to center the Odisha map and compute nearby destination distances.
            </li>
            <li>
              <strong className="text-white">Saved Places &amp; Itineraries:</strong> Destination bookmarks and generated trip plans saved locally on your device (`localStorage`).
            </li>
            <li>
              <strong className="text-white">Planning Preferences:</strong> Travel filters (duration, canonical interests, pace, starting city) submitted ephemerally to compute deterministic itineraries.
            </li>
            <li>
              <strong className="text-white">Technical HTTP Requests:</strong> Standard ephemeral headers (User-Agent, IP) required for basic network connectivity to deliver map projection data and weather forecasts.
            </li>
          </ul>
        </section>

        {/* Section 2: Purpose of Processing */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            2. Purpose and Lawful Basis for Processing
          </h2>
          <p>
            Under Section 4 and Section 6 of the DPDP Act 2023, data is processed solely for specified, lawful travel purposes:
          </p>
          <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#263244] space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#14B8A6] shrink-0 mt-0.5" />
              <span><strong>Map Beacon &amp; Routing:</strong> Displaying your current position on the Leaflet map relative to Odisha destinations.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#14B8A6] shrink-0 mt-0.5" />
              <span><strong>Itinerary Calculation:</strong> Sequencing travel stops and multimodal transit hops (Mo Bus, walking, rail) across Odisha.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#14B8A6] shrink-0 mt-0.5" />
              <span><strong>Weather Integration:</strong> Retrieving open-access weather observations for Odisha districts via Open-Meteo.</span>
            </div>
          </div>
        </section>

        {/* Section 3: Third-Party Services */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            3. Third-Party Services &amp; Content Delivery
          </h2>
          <p>
            O-Travelz integrates select external services to render map tiles and public weather:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
            <li><strong>OpenStreetMap &amp; CARTO / Esri:</strong> Public map tile providers for rendering background map tiles.</li>
            <li><strong>Open-Meteo API:</strong> Open public weather forecast provider without personal identifiers.</li>
          </ul>
          <p className="text-xs text-slate-400">
            We do NOT integrate third-party advertising tracking scripts, tracking pixels, or cross-site behavioral telemetry.
          </p>
        </section>

        {/* Section 4: Data Retention & Deletion */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            4. Data Retention, Storage &amp; Erasure
          </h2>
          <p>
            - <strong>Client Data:</strong> Saved trips and bookmarks remain in your browser's localStorage until you choose to delete them or clear your browser cache.<br />
            - <strong>Transient Backend Requests:</strong> Planning constraint payloads and projection queries are processed in-memory and discarded upon response delivery.<br />
            - <strong>One-Click Erasure:</strong> You can clear all local storage data at any time through the in-app Settings or by clearing your browser site data.
          </p>
        </section>

        {/* Section 5: Children's Privacy */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            5. Children &amp; Age-Appropriate Processing
          </h2>
          <p>
            O-Travelz is a public travel information portal. In compliance with Section 9 of the DPDP Act 2023, we do not engage in behavioral tracking, targeted profiling, or harmful data processing directed at children.
          </p>
        </section>

        {/* Section 6: User Rights & Grievance Contact */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            6. Your Rights &amp; Grievance Redressal
          </h2>
          <p>
            Under the DPDP Act 2023, you have the right to access summary information, correct inaccuracies, withdraw consent, and request data erasure.
          </p>
          <div className="p-4 rounded-2xl bg-[#172235] border border-[#263244] space-y-1 text-xs font-mono">
            <div><strong className="text-white">Data Protection / Grievance Officer:</strong> Punam &amp; Algoryxz Team</div>
            <div><strong className="text-white">Email:</strong> grievance@o-travelz.in / support@o-travelz.in</div>
            <div><strong className="text-white">Location:</strong> Bhubaneswar, Odisha, India</div>
          </div>
        </section>
      </div>
    </main>
  );
};
