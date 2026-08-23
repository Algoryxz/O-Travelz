import React from "react";
import { Compass } from "lucide-react";

export const InitialState: React.FC = () => {
  return (
    <div
      data-testid="initial-state"
      className="p-8 md:p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-4"
    >
      <div className="w-12 h-12 mx-auto rounded-xl bg-[#FAF7F2] text-[#B87B22] flex items-center justify-center border border-[#E5DFD5] shadow-xs">
        <Compass size={24} />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-xl font-serif font-bold text-[#12161E]">
          Where will Odisha take you?
        </h3>
        <p className="text-xs sm:text-sm text-[#70798B] leading-relaxed">
          Tell us how long you&apos;re travelling and what you&apos;re in the mood for. Or leave it to us and we&apos;ll surprise you.
        </p>
      </div>

      <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[#3D4654] font-medium font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#B87B22]" /> Curated Destinations
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1B5E6B]" /> Local Transit Connections
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2F523E]" /> Realistic Day Schedules
        </span>
      </div>
    </div>
  );
};
