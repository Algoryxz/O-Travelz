import React from "react";
import { Compass, Sparkles, MapPin } from "lucide-react";

export const InitialState: React.FC = () => {
  return (
    <div
      data-testid="initial-state"
      className="p-8 md:p-12 text-center rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4"
    >
      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold border border-emerald-100 shadow-xs">
        <Compass size={28} className="text-emerald-700" />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-xl font-bold font-display text-gray-900">
          Where will Odisha take you?
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Tell us how long you&apos;re travelling and what you&apos;re in the mood for. Or leave it to us and we&apos;ll surprise you.
        </p>
      </div>

      <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Curated Destinations
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500" /> Local Transit Connections
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-700" /> Realistic Day Schedules
        </span>
      </div>
    </div>
  );
};
