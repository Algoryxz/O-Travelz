import React from "react";
import { MapPin, ShieldCheck, Sparkles, Heart } from "lucide-react";
import type { NavTab } from "./TopNav";

interface FooterProps {
  onNavigateToTab?: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToTab }) => {
  return (
    <footer className="bg-[#041e17] text-[#93b3a7] border-t border-emerald-950/80 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Footer Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-emerald-900/40 items-start">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.jpeg"
                alt="O-Travelz Logo"
                className="h-12 w-auto rounded-xl object-contain shadow-sm border border-emerald-800/40"
              />
              <div>
                <div className="font-display font-extrabold text-lg text-white tracking-tight">
                  O-Travelz
                </div>
                <div className="text-[11px] text-emerald-400 font-mono tracking-wider font-semibold">
                  safe • secure • smart
                </div>
              </div>
            </div>
            <p className="text-xs text-emerald-200/70 max-w-sm leading-relaxed">
              Odisha's authentic travel, transit, and route intelligence platform.
              Crafted for travelers, locals, students, and explorers.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-300/80 font-medium">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Verified Destinations &amp; Transit Information</span>
            </div>
          </div>

          {/* Quote & Team Attribution Col */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              ODISHA SPIRIT
            </div>
            <p className="text-xs italic text-emerald-100/80 leading-relaxed">
              &ldquo;Odisha is not just a place to visit — it is a rhythm to return to.&rdquo;
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-300">
              <span>Crafted by team</span>
              <span className="font-bold text-white tracking-wide bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-700/50">
                Algoryxz
              </span>
            </div>
          </div>

          {/* Quick Badges & Made in Odisha */}
          <div className="md:col-span-3 space-y-3 flex flex-col md:items-end">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              PROVENANCE
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/90 text-emerald-300 text-xs font-bold border border-emerald-800/70 font-mono flex items-center gap-1.5 shadow-sm">
              <MapPin size={12} className="text-emerald-400" />
              <span>MADE IN ODISHA</span>
            </span>
            <div className="text-[11px] text-emerald-400/80 flex items-center gap-1.5 pt-1">
              <span>Designed with care</span>
              <Heart size={12} className="text-emerald-400 fill-emerald-400" />
            </div>
          </div>
        </div>

        {/* Copyright & Top Scroll */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/70 font-mono">
          <div>
            © 2026 <span className="text-white font-semibold">O-Travelz</span> by <span className="text-emerald-300 font-bold">Algoryxz</span>. All rights reserved.
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-emerald-300 hover:text-white font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Back to top</span>
            <span>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
