import React from "react";
import { Sparkles } from "lucide-react";

interface FloatingAICopilotTriggerProps {
  isOpen: boolean;
  onClick: () => void;
}

export const FloatingAICopilotTrigger: React.FC<FloatingAICopilotTriggerProps> = ({
  isOpen,
  onClick,
}) => {
  if (isOpen) return null;

  return (
    <div
      data-testid="floating-ai-copilot-trigger"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 animate-in fade-in zoom-in-90 duration-300"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Open O-Travelz AI Copilot"
        title="Open O-Travelz AI Travel Copilot"
        className="group relative flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-[#12161E] hover:bg-[#B87B22] text-white shadow-2xl border border-white/20 hover:border-[#B87B22] transition-all duration-300 hover:scale-105 cursor-pointer select-none"
      >
        {/* Glowing Sparkle Icon */}
        <div className="w-6 h-6 rounded-full bg-[#B87B22] group-hover:bg-white/20 text-white flex items-center justify-center transition-colors shadow-xs">
          <Sparkles size={13} className="animate-pulse" />
        </div>

        {/* Text Label */}
        <div className="flex flex-col text-left leading-none">
          <span className="font-display font-bold text-xs tracking-tight">AI Copilot</span>
          <span className="text-[9px] font-mono text-[#E5DFD5]/80 group-hover:text-white">Odisha Guide</span>
        </div>

        {/* Soft Ambient Ring */}
        <div className="absolute -inset-1 rounded-full bg-[#B87B22]/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity pointer-events-none" />
      </button>
    </div>
  );
};
