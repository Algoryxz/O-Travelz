import React from "react";
import { FileCheck, AlertTriangle, ShieldCheck, ArrowLeft, Info, CheckCircle2 } from "lucide-react";

interface LegalPageProps {
  onBack?: () => void;
}

export const TermsConditionsPage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <main
      data-testid="terms-conditions-page"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300 text-white"
    >
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          data-testid="terms-back-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Travel Hub</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#111827] border border-[#263244] shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <FileCheck size={18} className="text-[#14B8A6]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] font-mono">
            TERMS OF SERVICE &amp; ACCEPTABLE USE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          O-Travelz Terms &amp; Conditions
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          Guidelines governing destination exploration, multimodal travel planning, and AI-assisted recommendations across Odisha.
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-slate-400 font-mono">
          <span>Effective Date: August 2026</span>
          <span>•</span>
          <span>Version: 1.0 (Phase 9 Baseline)</span>
        </div>
      </div>

      {/* Grounding Invariant Callout */}
      <div className="p-5 rounded-2xl bg-[#172235] border border-teal-500/30 text-teal-200 text-xs space-y-2 leading-relaxed">
        <div className="flex items-center gap-2 text-teal-300 font-bold font-mono uppercase">
          <ShieldCheck size={16} className="text-[#14B8A6]" />
          <span>Core Factuality Principle</span>
        </div>
        <p>
          &ldquo;AI orchestrates and refines; it does not invent factual travel information.&rdquo; All coordinates, transit times, and destination datasets in O-Travelz are grounded in verified government, transit, and open datasets.
        </p>
      </div>

      {/* Main Terms Sections */}
      <div className="space-y-6 text-sm text-slate-300 leading-relaxed divide-y divide-[#263244]">
        {/* Section 1 */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            1. Nature of the O-Travelz Service
          </h2>
          <p>
            O-Travelz provides an interactive directory of verified destinations across all 30 districts of Odisha, deterministic multi-day itinerary generation, multimodal transit hop calculation (walking, Mo Bus, road/rail), and real-time open weather information.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            2. Travel Recommendations &amp; Real-World Conditions
          </h2>
          <p>
            While O-Travelz verifies destination coordinates and transport relationships, real-world conditions (such as road construction, weather advisories, festival crowd management, and public transit schedules) may vary.
          </p>
          <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#263244] text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <AlertTriangle size={14} />
              <span>Traveler Notice:</span>
            </div>
            <p>
              Users are advised to check local temple guidelines, official national park timings, and state transport alerts prior to commencing travel.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            3. AI Copilot Assistance
          </h2>
          <p>
            The natural language AI Copilot assists with intent extraction, constraint tuning, and conversational itinerary refinement. It does not replace emergency guidance or authoritative district administrative directives.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            4. Acceptable Use
          </h2>
          <p>
            Users agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
            <li>Attempt to reverse-engineer, overload, or disrupt backend APIs.</li>
            <li>Scrape destination photography or catalog assets for unauthorized commercial resale.</li>
            <li>Submit malicious or deceptive inputs intended to compromise the service.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            5. Intellectual Property &amp; Open Datasets
          </h2>
          <p>
            The O-Travelz application code, design system, and custom geospatial schemas are the intellectual property of the O-Travelz team. Map tile data and open weather data are utilized under their respective open licenses (OpenStreetMap, CARTO, Esri, Open-Meteo).
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            6. Limitation of Liability
          </h2>
          <p>
            O-Travelz is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis for exploratory planning. To the maximum extent permitted under applicable Indian law, O-Travelz and its developers shall not be liable for indirect, incidental, or consequential damages resulting from travel decisions or schedule disruptions.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-6">
          <h2 className="text-lg font-bold font-display text-white">
            7. Contact &amp; Governance
          </h2>
          <p>
            For questions regarding these terms, please contact:
          </p>
          <div className="p-4 rounded-2xl bg-[#172235] border border-[#263244] text-xs font-mono">
            <div>Email: legal@o-travelz.in / support@o-travelz.in</div>
            <div>Jurisdiction: Bhubaneswar, Odisha, India</div>
          </div>
        </section>
      </div>
    </main>
  );
};
