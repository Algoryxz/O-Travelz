import React, { useState } from "react";
import {
  Compass,
  CalendarDays,
  Clock,
  Car,
  Train,
  Footprints,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Tag,
  Sliders,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Coffee,
  Heart,
  Landmark,
  TreePine,
  Waves,
  ShoppingBag,
  Flame,
  Camera,
  Accessibility,
} from "lucide-react";
import type { PlanningConstraints } from "../../types/api";

export const CANONICAL_INTERESTS: Array<{ id: string; label: string; icon: any; color: string }> = [
  { id: "heritage", label: "Heritage", icon: Landmark, color: "text-amber-400 bg-amber-950/60 border-amber-800/60" },
  { id: "spirituality", label: "Spirituality", icon: Sparkles, color: "text-emerald-400 bg-emerald-950/60 border-emerald-800/60" },
  { id: "architecture", label: "Architecture", icon: Landmark, color: "text-indigo-400 bg-indigo-950/60 border-indigo-800/60" },
  { id: "food", label: "Food & Cuisine", icon: Coffee, color: "text-rose-400 bg-rose-950/60 border-rose-800/60" },
  { id: "culture", label: "Culture & Arts", icon: Heart, color: "text-purple-400 bg-purple-950/60 border-purple-800/60" },
  { id: "nature", label: "Nature & Hills", icon: TreePine, color: "text-emerald-400 bg-emerald-950/60 border-emerald-800/60" },
  { id: "beach", label: "Coastal Beaches", icon: Waves, color: "text-cyan-400 bg-cyan-950/60 border-cyan-800/60" },
  { id: "wildlife", label: "Wildlife Safari", icon: TreePine, color: "text-yellow-400 bg-yellow-950/60 border-yellow-800/60" },
  { id: "waterfall", label: "Waterfalls", icon: Waves, color: "text-teal-400 bg-teal-950/60 border-teal-800/60" },
  { id: "relaxation", label: "Relaxation", icon: Coffee, color: "text-blue-400 bg-blue-950/60 border-blue-800/60" },
  { id: "adventure", label: "Adventure & Treks", icon: Flame, color: "text-orange-400 bg-orange-950/60 border-orange-800/60" },
  { id: "shopping", label: "Shopping & Crafts", icon: ShoppingBag, color: "text-pink-400 bg-pink-950/60 border-pink-800/60" },
];

export const POPULAR_ORIGIN_HUBS = [
  "Bhubaneswar",
  "Puri",
  "Konark",
  "Cuttack",
  "Daringbadi",
  "Sambalpur",
  "Koraput",
  "Chilika Lake",
] as const;

interface ConstraintFormProps {
  initialConstraints?: PlanningConstraints;
  isLoading: boolean;
  isReplanning?: boolean;
  onSubmit: (constraints: PlanningConstraints) => void;
  onReset?: () => void;
}

export const ConstraintForm: React.FC<ConstraintFormProps> = ({
  initialConstraints,
  isLoading,
  isReplanning = false,
  onSubmit,
  onReset,
}) => {
  const [days, setDays] = useState<number>(initialConstraints?.days ?? 2);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialConstraints?.interests ?? []
  );
  const [customInterestInput, setCustomInterestInput] = useState<string>("");
  const [startOrigin, setStartOrigin] = useState<string>(initialConstraints?.start ?? "Bhubaneswar");
  const [dateInput, setDateInput] = useState<string>(
    initialConstraints?.dates?.[0] ?? new Date().toISOString().split("T")[0]
  );
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [travelPace, setTravelPace] = useState<"relaxed" | "balanced" | "fast">("balanced");
  const [transportMode, setTransportMode] = useState<"road" | "rail" | "mixed">("road");
  const [budgetTier, setBudgetTier] = useState<"budget" | "moderate" | "luxury">("moderate");
  const [openSections, setOpenSections] = useState<number[]>([1, 2, 3]);

  const isSectionOpen = (id: number) => openSections.includes(id);
  const toggleSection = (id: number) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInterestInput.trim().toLowerCase();
    if (trimmed && !selectedInterests.includes(trimmed)) {
      setSelectedInterests([...selectedInterests, trimmed]);
      setCustomInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(selectedInterests.filter((i) => i !== interest));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (days < 1) return;

    const payload: PlanningConstraints = {
      days: Number(days),
      interests: selectedInterests,
      start: startOrigin.trim() ? startOrigin.trim() : null,
      dates: dateInput.trim() ? [dateInput.trim()] : null,
    };

    onSubmit(payload);
  };

  const isCanonicalInterest = (id: string) =>
    CANONICAL_INTERESTS.some((ci) => ci.id === id);

  return (
    <form
      data-testid="constraint-form"
      onSubmit={handleSubmit}
      className="rounded-3xl bg-[#0a241d] border border-emerald-800/40 shadow-xl overflow-hidden space-y-0 text-white"
    >
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#062018] via-[#092920] to-[#0a241d] border-b border-emerald-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              ODISHA ROUTE &amp; TRANSIT PLANNER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white tracking-tight">
            {isReplanning ? "Modify Constraints & Re-plan" : "Trip Constraints & Itinerary Planner"}
          </h2>
          <p className="text-xs text-gray-300">
            Deterministic scheduling, transportation hop calculations, and verified destinations.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-950/80 px-3.5 py-1.5 rounded-2xl border border-emerald-700/60 shadow-xs">
          <span className="text-emerald-300 font-bold">{days} Days</span>
          <span className="text-gray-500">•</span>
          <span className="text-emerald-300 font-bold">{startOrigin || "Any Origin"}</span>
          <span className="text-gray-500">•</span>
          <span className="text-emerald-300 font-bold">
            {selectedInterests.length > 0 ? `${selectedInterests.length} Themes` : "Surprise Me"}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* SECTION 1: TRIP BASICS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#061e17] border border-emerald-800/40 space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleSection(1)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin size={15} className="text-emerald-400" />
                  <span>Trip Basics &amp; Starting Hub</span>
                </h3>
                <span className="text-[11px] text-gray-400">Duration, origin location, dates &amp; group size</span>
              </div>
            </div>
            {isSectionOpen(1) ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>

          {isSectionOpen(1) && (
            <div className="pt-3 border-t border-emerald-900/40 space-y-4 animate-in fade-in duration-200">
              {/* Origin Hub & Popular Pills */}
              <div className="space-y-2">
                <label htmlFor="start-input" className="block text-xs font-semibold text-gray-200">
                  Starting City / Origin Hub <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="start-input"
                    data-testid="start-input"
                    type="text"
                    placeholder="e.g. Bhubaneswar, Puri, Konark, Koraput..."
                    value={startOrigin}
                    disabled={isLoading}
                    onChange={(e) => setStartOrigin(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-800/60 bg-[#0a271f] text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  />
                  <MapPin size={15} className="absolute left-3 top-3 text-emerald-400" />
                </div>

                {/* Popular Origin Hub Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase font-mono mr-1">
                    Quick Hubs:
                  </span>
                  {POPULAR_ORIGIN_HUBS.map((hub) => {
                    const isSelected = startOrigin.trim().toLowerCase() === hub.toLowerCase();
                    return (
                      <button
                        key={hub}
                        type="button"
                        disabled={isLoading}
                        data-testid={`origin-hub-${hub.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                        onClick={() => setStartOrigin(hub)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-500 font-bold shadow-xs"
                            : "bg-[#0b2b22] text-gray-300 border-emerald-800/50 hover:bg-emerald-900/50 hover:text-white"
                        }`}
                      >
                        {hub}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Days Duration */}
                <div className="space-y-1.5">
                  <label htmlFor="days-input" className="block text-xs font-semibold text-gray-200">
                    Trip Duration (Days) <span className="text-emerald-400">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 5, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDays(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                          days === d
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-xs"
                            : "bg-[#0a271f] text-gray-300 border-emerald-800/50 hover:bg-emerald-900/50"
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                  <input
                    id="days-input"
                    data-testid="days-input"
                    type="number"
                    min={1}
                    max={14}
                    value={days}
                    disabled={isLoading}
                    onChange={(e) => setDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-1.5 rounded-xl border border-emerald-800/60 bg-[#0a271f] text-xs font-mono text-white mt-1"
                  />
                </div>

                {/* Travel Date */}
                <div className="space-y-1.5">
                  <label htmlFor="date-input" className="block text-xs font-semibold text-gray-200">
                    Travel Start Date
                  </label>
                  <div className="relative">
                    <input
                      id="date-input"
                      data-testid="date-input"
                      type="date"
                      value={dateInput}
                      disabled={isLoading}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-800/60 bg-[#0a271f] text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Travelers Count */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-200">
                    Travelers
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[
                      { count: 1, label: "Solo" },
                      { count: 2, label: "Couple" },
                      { count: 4, label: "Family" },
                      { count: 6, label: "Group" },
                    ].map((opt) => (
                      <button
                        key={opt.count}
                        type="button"
                        onClick={() => setTravelersCount(opt.count)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                          travelersCount === opt.count
                            ? "bg-emerald-600 text-white border-emerald-400"
                            : "bg-[#0a271f] text-gray-300 border-emerald-800/50 hover:bg-emerald-900/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: THEMES & INTERESTS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#061e17] border border-emerald-800/40 space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleSection(2)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-600/30 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-400" />
                  <span>Interests / Themes &amp; Experiences</span>
                </h3>
                <span className="text-[11px] text-gray-400">
                  {selectedInterests.length > 0 ? `${selectedInterests.length} selected themes` : "All themes (balanced plan)"}
                </span>
              </div>
            </div>
            {isSectionOpen(2) ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>

          {isSectionOpen(2) && (
            <div className="pt-3 border-t border-emerald-900/40 space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-gray-300 leading-relaxed">
                Choose the themes that match your travel vision. Leave blank for a curated whole-Odisha blend!
              </p>

              {/* 12 Canonical Thematic Chips with Category Colors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {CANONICAL_INTERESTS.map((interest) => {
                  const active = selectedInterests.includes(interest.id);
                  const Icon = interest.icon;

                  return (
                    <button
                      type="button"
                      key={interest.id}
                      disabled={isLoading}
                      data-testid={`interest-chip-${interest.id}`}
                      onClick={() => toggleInterest(interest.id)}
                      className={`p-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border text-left ${
                        active
                          ? "bg-emerald-600 text-white border-emerald-400 shadow-md scale-[1.02]"
                          : `${interest.color} text-gray-200 hover:scale-[1.01]`
                      }`}
                    >
                      <Icon size={14} className={active ? "text-white" : "text-emerald-400"} />
                      <span className="truncate">{interest.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Interests Input */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {selectedInterests
                  .filter((id) => !isCanonicalInterest(id))
                  .map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-medium border border-emerald-700"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="text-emerald-400 hover:text-white font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add custom theme (e.g. photography)..."
                    value={customInterestInput}
                    disabled={isLoading}
                    onChange={(e) => setCustomInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomInterest(e);
                      }
                    }}
                    className="px-3.5 py-1.5 text-xs rounded-xl border border-emerald-800/60 bg-[#0a271f] text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomInterest}
                    disabled={isLoading || !customInterestInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: TRANSPORTATION & PACE */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#061e17] border border-emerald-800/40 space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleSection(3)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Car size={15} className="text-cyan-400" />
                  <span>Transportation &amp; Pace Intelligence</span>
                </h3>
                <span className="text-[11px] text-gray-400">Transit modes, daily travel pace &amp; budget preference</span>
              </div>
            </div>
            {isSectionOpen(3) ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>

          {isSectionOpen(3) && (
            <div className="pt-3 border-t border-emerald-900/40 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pace Preference */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-200">
                    Travel Pace
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "relaxed", label: "Relaxed", sub: "2-3 stops/day" },
                      { id: "balanced", label: "Balanced", sub: "3-4 stops/day" },
                      { id: "fast", label: "Packed", sub: "5+ stops/day" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setTravelPace(p.id as any)}
                        className={`p-2.5 rounded-xl text-center border transition-all ${
                          travelPace === p.id
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-xs font-bold"
                            : "bg-[#0a271f] text-gray-300 border-emerald-800/50 hover:bg-emerald-900/50"
                        }`}
                      >
                        <div className="text-xs">{p.label}</div>
                        <div className="text-[10px] text-emerald-200/70">{p.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transport Mode */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-200">
                    Transportation Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "road", label: "Cab / Road", icon: Car },
                      { id: "rail", label: "Train / Rail", icon: Train },
                      { id: "mixed", label: "Flexible", icon: Navigation },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setTransportMode(m.id as any)}
                          className={`p-2.5 rounded-xl text-center border transition-all flex flex-col items-center gap-1 ${
                            transportMode === m.id
                              ? "bg-emerald-600 text-white border-emerald-400 shadow-xs font-bold"
                              : "bg-[#0a271f] text-gray-300 border-emerald-800/50 hover:bg-emerald-900/50"
                          }`}
                        >
                          <Icon size={14} />
                          <span className="text-xs">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Transportation Intelligence Assurance */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-200">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Automated Hop Optimization</div>
                  <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                    Our routing engine automatically sequences destinations in geographical order to minimize backtracking and road transit hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Button Strip */}
      <div className="p-5 sm:p-6 bg-[#071f18] border-t border-emerald-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-gray-300">
          Ready to generate an optimized <span className="font-bold text-emerald-300">{days}-day</span> itinerary from{" "}
          <span className="font-bold text-white">{startOrigin}</span>.
        </div>

        <div className="flex items-center gap-3">
          {onReset && (
            <button
              type="button"
              data-testid="reset-button"
              disabled={isLoading}
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl border border-emerald-800/60 hover:bg-emerald-950/60 text-gray-300 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Reset
            </button>
          )}

          <button
            type="submit"
            data-testid="submit-plan-button"
            disabled={isLoading || days < 1}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Calculating Route &amp; Transit...</span>
              </>
            ) : (
              <>
                <Compass size={16} />
                <span>
                  {isReplanning
                    ? "Re-plan Itinerary"
                    : selectedInterests.length === 0
                    ? "Plan Itinerary (Surprise Me)"
                    : `Plan Itinerary (${days} Days)`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
