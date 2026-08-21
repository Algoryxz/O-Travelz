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

export const CANONICAL_INTERESTS: Array<{
  id: string;
  label: string;
  icon: any;
  unselectedClass: string;
  activeClass: string;
  iconClass: string;
}> = [
  {
    id: "heritage",
    label: "Heritage",
    icon: Landmark,
    unselectedClass: "border-amber-500/30 text-amber-300 bg-amber-950/20 hover:bg-amber-900/30 hover:border-amber-400/60",
    activeClass: "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/20 font-bold",
    iconClass: "text-amber-400",
  },
  {
    id: "spirituality",
    label: "Spirituality",
    icon: Sparkles,
    unselectedClass: "border-orange-500/30 text-orange-300 bg-orange-950/20 hover:bg-orange-900/30 hover:border-orange-400/60",
    activeClass: "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400 shadow-md shadow-orange-500/20 font-bold",
    iconClass: "text-orange-400",
  },
  {
    id: "architecture",
    label: "Architecture",
    icon: Landmark,
    unselectedClass: "border-indigo-500/30 text-indigo-300 bg-indigo-950/20 hover:bg-indigo-900/30 hover:border-indigo-400/60",
    activeClass: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20 font-bold",
    iconClass: "text-indigo-400",
  },
  {
    id: "food",
    label: "Food & Cuisine",
    icon: Coffee,
    unselectedClass: "border-rose-500/30 text-rose-300 bg-rose-950/20 hover:bg-rose-900/30 hover:border-rose-400/60",
    activeClass: "bg-gradient-to-r from-rose-500 to-rose-600 text-white border-rose-400 shadow-md shadow-rose-500/20 font-bold",
    iconClass: "text-rose-400",
  },
  {
    id: "culture",
    label: "Culture & Arts",
    icon: Heart,
    unselectedClass: "border-purple-500/30 text-purple-300 bg-purple-950/20 hover:bg-purple-900/30 hover:border-purple-400/60",
    activeClass: "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20 font-bold",
    iconClass: "text-purple-400",
  },
  {
    id: "nature",
    label: "Nature & Hills",
    icon: TreePine,
    unselectedClass: "border-emerald-500/30 text-emerald-300 bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-400/60",
    activeClass: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20 font-bold",
    iconClass: "text-emerald-400",
  },
  {
    id: "beach",
    label: "Coastal Beaches",
    icon: Waves,
    unselectedClass: "border-cyan-500/30 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/30 hover:border-cyan-400/60",
    activeClass: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20 font-bold",
    iconClass: "text-cyan-400",
  },
  {
    id: "wildlife",
    label: "Wildlife Safari",
    icon: TreePine,
    unselectedClass: "border-lime-500/30 text-lime-300 bg-lime-950/20 hover:bg-lime-900/30 hover:border-lime-400/60",
    activeClass: "bg-gradient-to-r from-lime-600 to-lime-700 text-white border-lime-400 shadow-md shadow-lime-500/20 font-bold",
    iconClass: "text-lime-400",
  },
  {
    id: "waterfall",
    label: "Waterfalls",
    icon: Waves,
    unselectedClass: "border-teal-500/30 text-teal-300 bg-teal-950/20 hover:bg-teal-900/30 hover:border-teal-400/60",
    activeClass: "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-400 shadow-md shadow-teal-500/20 font-bold",
    iconClass: "text-teal-400",
  },
  {
    id: "relaxation",
    label: "Relaxation",
    icon: Coffee,
    unselectedClass: "border-violet-500/30 text-violet-300 bg-violet-950/20 hover:bg-violet-900/30 hover:border-violet-400/60",
    activeClass: "bg-gradient-to-r from-violet-500 to-violet-600 text-white border-violet-400 shadow-md shadow-violet-500/20 font-bold",
    iconClass: "text-violet-400",
  },
  {
    id: "adventure",
    label: "Adventure & Treks",
    icon: Flame,
    unselectedClass: "border-red-500/30 text-red-300 bg-red-950/20 hover:bg-red-900/30 hover:border-red-400/60",
    activeClass: "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 shadow-md shadow-red-500/20 font-bold",
    iconClass: "text-red-400",
  },
  {
    id: "shopping",
    label: "Shopping & Crafts",
    icon: ShoppingBag,
    unselectedClass: "border-pink-500/30 text-pink-300 bg-pink-950/20 hover:bg-pink-900/30 hover:border-pink-400/60",
    activeClass: "bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-400 shadow-md shadow-pink-500/20 font-bold",
    iconClass: "text-pink-400",
  },
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
      className="rounded-3xl bg-[#111827] border border-[#263244] shadow-xl overflow-hidden space-y-0 text-white"
    >
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 bg-[#0B1220] border-b border-[#263244] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6] font-mono">
              ODISHA ROUTE &amp; TRANSIT PLANNER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white tracking-tight">
            {isReplanning ? "Modify Constraints & Re-plan" : "Trip Constraints & Itinerary Planner"}
          </h2>
          <p className="text-xs text-slate-400">
            Deterministic scheduling, transportation hop calculations, and verified destinations.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 text-xs font-mono bg-[#172235] px-3.5 py-1.5 rounded-2xl border border-[#263244] shadow-xs">
          <span className="text-teal-300 font-bold">{days} Days</span>
          <span className="text-slate-500">•</span>
          <span className="text-teal-300 font-bold">{startOrigin || "Any Origin"}</span>
          <span className="text-slate-500">•</span>
          <span className="text-teal-300 font-bold">
            {selectedInterests.length > 0 ? `${selectedInterests.length} Themes` : "Surprise Me"}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* SECTION 1: TRIP BASICS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#172235] border border-[#263244] space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleSection(1)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#14B8A6]/20 border border-[#14B8A6]/40 text-teal-300 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin size={15} className="text-[#14B8A6]" />
                  <span>Trip Basics &amp; Starting Hub</span>
                </h3>
                <span className="text-[11px] text-slate-400">Duration, origin location, dates &amp; group size</span>
              </div>
            </div>
            {isSectionOpen(1) ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>

          {isSectionOpen(1) && (
            <div className="pt-3 border-t border-[#263244] space-y-4 animate-in fade-in duration-200">
              {/* Origin Hub & Popular Pills */}
              <div className="space-y-2">
                <label htmlFor="start-input" className="block text-xs font-semibold text-slate-300">
                  Starting City / Origin Hub <span className="text-[#14B8A6]">*</span>
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
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#334155] bg-[#111827] text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6]"
                  />
                  <MapPin size={15} className="absolute left-3 top-3 text-[#14B8A6]" />
                </div>

                {/* Popular Origin Hub Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono mr-1">
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
                            ? "bg-[#14B8A6] text-white border-[#14B8A6] font-bold shadow-xs"
                            : "bg-[#111827] text-slate-300 border-[#334155] hover:bg-slate-800 hover:text-white"
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
                  <label htmlFor="days-input" className="block text-xs font-semibold text-slate-300">
                    Trip Duration (Days) <span className="text-[#14B8A6]">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 5, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDays(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                          days === d
                            ? "bg-[#14B8A6] text-white border-[#14B8A6] shadow-xs"
                            : "bg-[#111827] text-slate-300 border-[#334155] hover:bg-slate-800"
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
                    className="w-full px-3 py-1.5 rounded-xl border border-[#334155] bg-[#111827] text-xs font-mono text-white mt-1"
                  />
                </div>

                {/* Travel Date */}
                <div className="space-y-1.5">
                  <label htmlFor="date-input" className="block text-xs font-semibold text-slate-300">
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#334155] bg-[#111827] text-xs font-mono text-white focus:outline-none focus:border-[#14B8A6]"
                    />
                  </div>
                </div>

                {/* Travelers Count */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
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
                            ? "bg-[#14B8A6] text-white border-[#14B8A6]"
                            : "bg-[#111827] text-slate-300 border-[#334155] hover:bg-slate-800"
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
        <div className="p-4 sm:p-5 rounded-2xl bg-[#172235] border border-[#263244] space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleSection(2)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={15} className="text-[#F59E0B]" />
                  <span>Interests / Themes &amp; Experiences</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedInterests.length > 0 ? `${selectedInterests.length} selected themes` : "All themes (balanced plan)"}
                </span>
              </div>
            </div>
            {isSectionOpen(2) ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>

          {isSectionOpen(2) && (
            <div className="pt-3 border-t border-[#263244] space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose the themes that match your travel vision. Leave blank for a curated whole-Odisha blend!
              </p>

              {/* 12 Canonical Thematic Chips */}
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
                          ? `${interest.activeClass} scale-[1.02]`
                          : `${interest.unselectedClass}`
                      }`}
                    >
                      <Icon size={14} className={active ? "text-white" : interest.iconClass} />
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
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#111827] text-teal-300 text-xs font-medium border border-[#263244]"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="text-teal-400 hover:text-white font-bold ml-1 cursor-pointer"
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
                    className="px-3.5 py-1.5 text-xs rounded-xl border border-[#334155] bg-[#111827] text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomInterest}
                    disabled={isLoading || !customInterestInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: TRANSPORTATION & PACE */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#172235] border border-[#263244] space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleSection(3)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Car size={15} className="text-[#38BDF8]" />
                  <span>Transportation &amp; Pace Intelligence</span>
                </h3>
                <span className="text-[11px] text-slate-400">Transit modes, daily travel pace &amp; budget preference</span>
              </div>
            </div>
            {isSectionOpen(3) ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>

          {isSectionOpen(3) && (
            <div className="pt-3 border-t border-[#263244] space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pace Preference */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
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
                            ? "bg-[#14B8A6] text-white border-[#14B8A6] shadow-xs font-bold"
                            : "bg-[#111827] text-slate-300 border-[#334155] hover:bg-slate-800"
                        }`}
                      >
                        <div className="text-xs">{p.label}</div>
                        <div className="text-[10px] text-slate-400">{p.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transport Mode */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
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
                              ? "bg-[#14B8A6] text-white border-[#14B8A6] shadow-xs font-bold"
                              : "bg-[#111827] text-slate-300 border-[#334155] hover:bg-slate-800"
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
              <div className="p-3 rounded-xl bg-[#111827] border border-[#263244] flex items-start gap-2.5 text-xs text-slate-300">
                <ShieldCheck size={16} className="text-[#14B8A6] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Automated Hop Optimization</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Our routing engine automatically sequences destinations in geographical order to minimize backtracking and road transit hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Button Strip */}
      <div className="p-5 sm:p-6 bg-[#0B1220] border-t border-[#263244] flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Ready to generate an optimized <span className="font-bold text-teal-300">{days}-day</span> itinerary from{" "}
          <span className="font-bold text-white">{startOrigin}</span>.
        </div>

        <div className="flex items-center gap-3">
          {onReset && (
            <button
              type="button"
              data-testid="reset-button"
              disabled={isLoading}
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl border border-[#334155] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Reset
            </button>
          )}

          <button
            type="submit"
            data-testid="submit-plan-button"
            disabled={isLoading || days < 1}
            className="px-6 py-3 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
