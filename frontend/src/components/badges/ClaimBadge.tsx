import React from "react";
import type { ClaimType } from "../../types/api";

interface ClaimBadgeProps {
  claimType: ClaimType | string;
  className?: string;
}

const BADGE_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  verified: {
    label: "Verified",
    bg: "bg-[#EBF7EE]",
    text: "text-[#1E7B34]",
    border: "border-[#C5E8CE]",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-[#EEF4FB]",
    text: "text-[#1D63A8]",
    border: "border-[#C7DDF5]",
  },
  live: {
    label: "Live",
    bg: "bg-[#FEF6E7]",
    text: "text-[#B87B22]",
    border: "border-[#F6DFB5]",
  },
  estimated: {
    label: "Estimated",
    bg: "bg-[#F3EBF7]",
    text: "text-[#7B2E8D]",
    border: "border-[#E1C8EA]",
  },
  researched: {
    label: "Researched",
    bg: "bg-[#F4F5F7]",
    text: "text-[#505D75]",
    border: "border-[#D7DBE2]",
  },
  unknown: {
    label: "Unverified",
    bg: "bg-[#F9F9F9]",
    text: "text-[#888888]",
    border: "border-[#E0E0E0]",
  },
};

export const ClaimBadge: React.FC<ClaimBadgeProps> = ({ claimType, className = "" }) => {
  const normType = String(claimType || "verified").toLowerCase();
  const conf = BADGE_STYLES[normType] || BADGE_STYLES.unknown;

  return (
    <span
      data-testid={`claim-badge-${normType}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono uppercase tracking-wider border ${conf.bg} ${conf.text} ${conf.border} ${className}`}
    >
      {conf.label}
    </span>
  );
};
