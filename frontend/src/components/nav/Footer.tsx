import React from "react";
import { MapPin, ShieldCheck, Sparkles, Heart, ArrowUp, Compass } from "lucide-react";
import type { NavTab } from "./TopNav";

interface FooterProps {
  onNavigateToTab?: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToTab }) => {
  return (
    <footer className="relative bg-[#041611] text-[#93b3a7] border-t border-emerald-950/80 pt-14 pb-10 overflow-hidden">
      {/* Decorative subtle ambient glows */}
      <div className="absolute left-1/4 -top-24 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-10 -bottom-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative subtle Konark Sun-Wheel line motif */}
      <div className="absolute right-4 -top-12 opacity-5 pointer-events-none hidden md:block">
        <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="130" cy="130" r="120" stroke="#34D399" strokeWidth="2" />
          <circle cx="130" cy="130" r="80" stroke="#34D399" strokeWidth="1.5" />
          <circle cx="130" cy="130" r="30" stroke="#34D399" strokeWidth="1" />
          <line x1="130" y1="10" x2="130" y2="250" stroke="#34D399" strokeWidth="1.5" />
          <line x1="10" y1="130" x2="250" y2="130" stroke="#34D399" strokeWidth="1.5" />
          <line x1="45" y1="45" x2="215" y2="215" stroke="#34D399" strokeWidth="1" />
          <line x1="215" y1="45" x2="45" y2="215" stroke="#34D399" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Footer Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-emerald-900/40 items-start">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigateToTab?.("discover")}>
              <img
                src="/images/logo.png"
                alt="O-Travelz Logo"
                className="h-12 w-auto rounded-xl object-contain shadow-sm border border-emerald-800/40 group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <div className="font-display font-extrabold text-lg text-white tracking-tight group-hover:text-emerald-300 transition-colors">
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
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" />
              <span>ODISHA SPIRIT</span>
            </div>
            <p className="text-xs italic text-emerald-100/80 leading-relaxed font-serif">
              &ldquo;Odisha is not just a place to visit — it is a rhythm to return to.&rdquo;
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-300">
              <span>Crafted by team</span>
              <span className="font-bold text-white tracking-wide bg-emerald-900/60 px-3 py-1 rounded-xl border border-emerald-700/50 shadow-xs hover:border-emerald-500/50 transition-colors">
                Algoryxz
              </span>
            </div>
          </div>

          {/* Quick Badges & Made in Odisha */}
          <div className="md:col-span-3 space-y-3 flex flex-col md:items-end">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              PROVENANCE
            </div>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 text-emerald-300 text-xs font-bold border border-emerald-800/70 font-mono flex items-center gap-1.5 shadow-sm hover:border-emerald-500/50 transition-colors">
              <MapPin size={12} className="text-emerald-400" />
              <span>MADE IN ODISHA</span>
            </span>
            <div className="text-[11px] text-emerald-400/80 flex items-center gap-1.5 pt-1">
              <span>Designed with care for explorers</span>
              <Heart size={12} className="text-rose-400 fill-rose-400" />
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
            className="group text-emerald-300 hover:text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 hover:border-emerald-700/60"
          >
            <span>Back to top</span>
            <ArrowUp size={13} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
