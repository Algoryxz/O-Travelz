import React, { useState } from "react";
import {
  Compass,
  CalendarDays,
  Clock,
  Car,
  Train,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
  Navigation,
  Coffee,
  Heart,
  Landmark,
  TreePine,
  Waves,
  ShoppingBag,
  Flame,
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
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#A84825] text-white border-[#A84825] shadow-xs font-bold",
    iconClass: "text-[#A84825]",
  },
  {
    id: "spirituality",
    label: "Spirituality",
    icon: Sparkles,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#B87B22] text-white border-[#B87B22] shadow-xs font-bold",
    iconClass: "text-[#B87B22]",
  },
  {
    id: "architecture",
    label: "Architecture",
    icon: Landmark,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#12161E] text-white border-[#12161E] shadow-xs font-bold",
    iconClass: "text-[#12161E]",
  },
  {
    id: "food",
    label: "Food & Cuisine",
    icon: Coffee,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#B87B22] text-white border-[#B87B22] shadow-xs font-bold",
    iconClass: "text-[#B87B22]",
  },
  {
    id: "culture",
    label: "Culture",
    icon: Heart,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#A84825] text-white border-[#A84825] shadow-xs font-bold",
    iconClass: "text-[#A84825]",
  },
  {
    id: "nature",
    label: "Nature",
    icon: TreePine,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#2F523E] text-white border-[#2F523E] shadow-xs font-bold",
    iconClass: "text-[#2F523E]",
  },
  {
    id: "beach",
    label: "Beaches",
    icon: Waves,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#1B5E6B] text-white border-[#1B5E6B] shadow-xs font-bold",
    iconClass: "text-[#1B5E6B]",
  },
  {
    id: "wildlife",
    label: "Wildlife",
    icon: TreePine,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#2F523E] text-white border-[#2F523E] shadow-xs font-bold",
    iconClass: "text-[#2F523E]",
  },
  {
    id: "waterfall",
    label: "Waterfalls",
    icon: Waves,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#1B5E6B] text-white border-[#1B5E6B] shadow-xs font-bold",
    iconClass: "text-[#1B5E6B]",
  },
  {
    id: "relaxation",
    label: "Relaxation",
    icon: Coffee,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#70798B] text-white border-[#70798B] shadow-xs font-bold",
    iconClass: "text-[#70798B]",
  },
  {
    id: "adventure",
    label: "Adventure",
    icon: Flame,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#A84825] text-white border-[#A84825] shadow-xs font-bold",
    iconClass: "text-[#A84825]",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    unselectedClass: "border-[#E5DFD5] text-[#3D4654] bg-[#FAF7F2] hover:bg-[#F2EEE7] hover:border-[#D1C8BA]",
    activeClass: "bg-[#B87B22] text-white border-[#B87B22] shadow-xs font-bold",
    iconClass: "text-[#B87B22]",
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
      className="rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs overflow-hidden space-y-0 text-[#12161E]"
    >
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 bg-[#FAF7F2] border-b border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B87B22] font-mono">
              ODISHA ROUTE &amp; TRANSIT PLANNER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#12161E] tracking-tight">
            {isReplanning ? "Modify Constraints & Re-plan" : "Trip Constraints & Itinerary Planner"}
          </h2>
          <p className="text-xs text-[#70798B]">
            Deterministic scheduling, transportation hop calculations, and verified destinations.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 text-xs font-mono bg-[#FFFFFF] px-3.5 py-1.5 rounded-full border border-[#E5DFD5] shadow-xs">
          <span className="text-[#B87B22] font-bold">{days} Days</span>
          <span className="text-[#E5DFD5]">•</span>
          <span className="text-[#12161E] font-bold">{startOrigin || "Any Origin"}</span>
          <span className="text-[#E5DFD5]">•</span>
          <span className="text-[#1B5E6B] font-bold">
            {selectedInterests.length > 0 ? `${selectedInterests.length} Themes` : "Surprise Me"}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* SECTION 1: TRIP BASICS */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleSection(1)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-[#B87B22] flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                1
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#12161E] flex items-center gap-2">
                  <MapPin size={15} className="text-[#B87B22]" />
                  <span>Trip Basics &amp; Starting Hub</span>
                </h3>
                <span className="text-[11px] text-[#70798B]">Duration, origin location, dates &amp; group size</span>
              </div>
            </div>
            {isSectionOpen(1) ? <ChevronUp size={16} className="text-[#70798B]" /> : <ChevronDown size={16} className="text-[#70798B]" />}
          </div>

          {isSectionOpen(1) && (
            <div className="pt-3 border-t border-[#E5DFD5] space-y-4 animate-in fade-in duration-200">
              {/* Origin Hub & Popular Pills */}
              <div className="space-y-2">
                <label htmlFor="start-input" className="block text-xs font-semibold text-[#12161E]">
                  Starting City / Departure Hub <span className="text-[#B87B22]">*</span>
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
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5DFD5] bg-[#FFFFFF] text-sm font-medium text-[#12161E] placeholder-[#70798B] focus:outline-none focus:border-[#B87B22]"
                  />
                  <MapPin size={15} className="absolute left-3 top-3 text-[#B87B22]" />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-[#70798B] font-bold uppercase font-mono mr-1">
                    Quick Hubs:
                  </span>
                  {POPULAR_ORIGIN_HUBS.map((hub) => (
                    <button
                      key={hub}
                      type="button"
                      data-testid={`origin-hub-${hub.toLowerCase()}`}
                      onClick={() => setStartOrigin(hub)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        startOrigin === hub
                          ? "bg-[#12161E] text-white border-[#12161E] font-bold"
                          : "bg-[#FFFFFF] text-[#3D4654] border-[#E5DFD5] hover:border-[#D1C8BA]"
                      }`}
                    >
                      {hub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip Duration & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="days-input" className="block text-xs font-semibold text-[#12161E]">
                    Trip Duration (Days)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="days-input"
                      data-testid="days-input"
                      type="number"
                      min={1}
                      max={14}
                      value={days}
                      disabled={isLoading}
                      onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5DFD5] bg-[#FFFFFF] text-sm font-bold text-[#12161E] font-mono text-center focus:outline-none focus:border-[#B87B22]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="date-input" className="block text-xs font-semibold text-[#12161E]">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      id="date-input"
                      type="date"
                      value={dateInput}
                      disabled={isLoading}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5DFD5] bg-[#FFFFFF] text-xs font-medium text-[#12161E] focus:outline-none focus:border-[#B87B22]"
                    />
                    <CalendarDays size={13} className="absolute left-2.5 top-2.5 text-[#70798B]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#12161E]">
                    Travelers
                  </label>
                  <select
                    value={travelersCount}
                    onChange={(e) => setTravelersCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] bg-[#FFFFFF] text-xs font-medium text-[#12161E] focus:outline-none focus:border-[#B87B22] cursor-pointer"
                  >
                    <option value={1}>Solo (1 Traveler)</option>
                    <option value={2}>Couple (2 Travelers)</option>
                    <option value={4}>Family / Small Group (3-4)</option>
                    <option value={8}>Large Group (5+)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: THEMES & INTERESTS */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleSection(2)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-[#B87B22] flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                2
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#12161E] flex items-center gap-2">
                  <Sparkles size={15} className="text-[#B87B22]" />
                  <span>Interests / Themes &amp; Experiences</span>
                </h3>
                <span className="text-[11px] text-[#70798B]">Select travel interests or leave blank to surprise</span>
              </div>
            </div>
            {isSectionOpen(2) ? <ChevronUp size={16} className="text-[#70798B]" /> : <ChevronDown size={16} className="text-[#70798B]" />}
          </div>

          {isSectionOpen(2) && (
            <div className="pt-3 border-t border-[#E5DFD5] space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {CANONICAL_INTERESTS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedInterests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`interest-chip-${item.id}`}
                      onClick={() => toggleInterest(item.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected ? item.activeClass : item.unselectedClass
                      }`}
                    >
                      <Icon size={14} className={isSelected ? "text-white" : item.iconClass} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom interest tags input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom theme tag (e.g. photography)..."
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomInterest(e);
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] text-[#12161E] placeholder-[#70798B] focus:outline-none focus:border-[#B87B22]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomInterest}
                  disabled={isLoading || !customInterestInput.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: TRANSPORTATION & PACE */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleSection(3)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-[#1B5E6B] flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                3
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#12161E] flex items-center gap-2">
                  <Car size={15} className="text-[#1B5E6B]" />
                  <span>Transportation &amp; Pace Intelligence</span>
                </h3>
                <span className="text-[11px] text-[#70798B]">Transit modes, daily travel pace &amp; route optimization</span>
              </div>
            </div>
            {isSectionOpen(3) ? <ChevronUp size={16} className="text-[#70798B]" /> : <ChevronDown size={16} className="text-[#70798B]" />}
          </div>

          {isSectionOpen(3) && (
            <div className="pt-3 border-t border-[#E5DFD5] space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pace Preference */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#12161E]">
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
                        className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                          travelPace === p.id
                            ? "bg-[#12161E] text-white border-[#12161E] shadow-xs font-bold"
                            : "bg-[#FFFFFF] text-[#3D4654] border-[#E5DFD5] hover:border-[#D1C8BA]"
                        }`}
                      >
                        <div className="text-xs">{p.label}</div>
                        <div className="text-[10px] text-[#70798B]">{p.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transport Mode */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#12161E]">
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
                          className={`p-2.5 rounded-xl text-center border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            transportMode === m.id
                              ? "bg-[#1B5E6B] text-white border-[#1B5E6B] shadow-xs font-bold"
                              : "bg-[#FFFFFF] text-[#3D4654] border-[#E5DFD5] hover:border-[#D1C8BA]"
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
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] flex items-start gap-2.5 text-xs text-[#3D4654]">
                <ShieldCheck size={16} className="text-[#2F523E] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-[#12161E]">Automated Transit Hop Optimization</div>
                  <p className="text-[11px] text-[#70798B] leading-relaxed">
                    Our routing engine automatically sequences destinations in geographical order to minimize backtracking and road transit hours across Odisha.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Button Strip */}
      <div className="p-5 sm:p-6 bg-[#FAF7F2] border-t border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#70798B]">
          Ready to generate an optimized <span className="font-bold text-[#B87B22]">{days}-day</span> itinerary from{" "}
          <span className="font-bold text-[#12161E]">{startOrigin}</span>.
        </div>

        <div className="flex items-center gap-3">
          {onReset && (
            <button
              type="button"
              data-testid="reset-button"
              disabled={isLoading}
              onClick={onReset}
              className="px-4 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] hover:bg-[#F2EEE7] text-[#3D4654] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Reset
            </button>
          )}

          <button
            type="submit"
            data-testid="submit-plan-button"
            disabled={isLoading || days < 1}
            className="px-6 py-2.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
