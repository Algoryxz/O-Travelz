import React from "react";
import type { DataTier } from "../../api/contracts";

interface DataTierBadgeProps {
  tier: DataTier;
}

const TIER_STYLES: Record<DataTier, { bg: string; text: string; border: string; label: string }> = {
  live: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
    label: "Live Data",
  },
  scheduled: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
    label: "Scheduled",
  },
  static: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    label: "Static Fact",
  },
  unknown: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    label: "Unknown Tier",
  },
};

export const DataTierBadge: React.FC<DataTierBadgeProps> = ({ tier }) => {
  const style = TIER_STYLES[tier] ?? TIER_STYLES.unknown;

  return (
    <span
      data-testid="data-tier-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
      title={`Data freshness tier: ${tier}`}
    >
      {tier === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {style.label}
    </span>
  );
};
