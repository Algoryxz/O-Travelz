import React, { useState } from "react";
import type { PlanningConstraints } from "../../api/contracts";

const POPULAR_INTERESTS = [
  "temple",
  "heritage",
  "food",
  "nature",
  "beach",
  "wildlife",
  "waterfall",
  "monument",
  "museum",
  "market",
  "lake",
  "park",
];

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
  const [days, setDays] = useState<number>(initialConstraints?.days ?? 1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialConstraints?.interests ?? []
  );
  const [customInterestInput, setCustomInterestInput] = useState<string>("");
  const [startOrigin, setStartOrigin] = useState<string>(initialConstraints?.start ?? "");
  const [dateInput, setDateInput] = useState<string>(
    initialConstraints?.dates?.[0] ?? ""
  );

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
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

  return (
    <form
      data-testid="constraint-form"
      onSubmit={handleSubmit}
      className="p-5 md:p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">
          {isReplanning ? "Modify Constraints & Re-plan" : "Trip Constraints"}
        </h3>
        <span className="text-xs text-emerald-700 font-medium">Customizable Plan</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Days input */}
        <div>
          <label htmlFor="days-input" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Trip Duration (Days) <span className="text-emerald-700">*</span>
          </label>
          <input
            id="days-input"
            data-testid="days-input"
            type="number"
            min={1}
            max={14}
            value={days}
            disabled={isLoading}
            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-gray-100"
            required
          />
        </div>

        {/* Start Origin input */}
        <div>
          <label htmlFor="start-input" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Start Location / Origin <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="start-input"
            data-testid="start-input"
            type="text"
            placeholder="e.g. Hotel, Station, or Landmark"
            value={startOrigin}
            disabled={isLoading}
            onChange={(e) => setStartOrigin(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Date input */}
      <div>
        <label htmlFor="date-input" className="block text-xs font-semibold text-gray-700 mb-1.5">
          Trip Date <span className="text-gray-400 font-normal">(optional, YYYY-MM-DD)</span>
        </label>
        <input
          id="date-input"
          data-testid="date-input"
          type="date"
          value={dateInput}
          disabled={isLoading}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-gray-100"
        />
      </div>

      {/* Interests Selection */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className="block text-xs font-semibold text-gray-700">
            Interests / Themes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          {selectedInterests.length === 0 && (
            <span className="text-[11px] text-gray-400 italic">
              Leave empty for a balanced surprise itinerary
            </span>
          )}
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {POPULAR_INTERESTS.map((interest) => {
            const active = selectedInterests.includes(interest);
            return (
              <button
                type="button"
                key={interest}
                disabled={isLoading}
                data-testid={`interest-chip-${interest}`}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                {interest}
              </button>
            );
          })}
        </div>

        {/* Selected chips summary & Custom input */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedInterests
            .filter((i) => !POPULAR_INTERESTS.includes(i))
            .map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-medium border border-emerald-300"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="text-emerald-700 hover:text-emerald-950 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Add custom interest..."
              value={customInterestInput}
              disabled={isLoading}
              onChange={(e) => setCustomInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomInterest(e);
                }
              }}
              className="px-3 py-1 text-xs rounded-xl border border-gray-300 text-gray-800 focus:outline-none focus:border-emerald-600 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={handleAddCustomInterest}
              disabled={isLoading || !customInterestInput.trim()}
              className="px-3 py-1 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          data-testid="submit-plan-button"
          disabled={isLoading || days < 1}
          className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && (
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {isReplanning
            ? "Re-plan Itinerary"
            : selectedInterests.length === 0
            ? "Plan Itinerary (Surprise Me)"
            : "Plan Itinerary"}
        </button>

        {onReset && (
          <button
            type="button"
            data-testid="reset-button"
            disabled={isLoading}
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
};
