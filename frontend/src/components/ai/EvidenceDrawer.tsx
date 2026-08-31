import React, { useState } from "react";
import type { EvidenceItem } from "../../types/api";
import { ClaimBadge } from "../badges/ClaimBadge";
import { ChevronDown, ChevronUp, Sparkles, ShieldCheck } from "lucide-react";

interface EvidenceDrawerProps {
  evidenceItems?: EvidenceItem[];
  defaultExpanded?: boolean;
  title?: string;
  className?: string;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  evidenceItems = [],
  defaultExpanded = false,
  title = "Why O-TRAVELZ suggested this",
  className = "",
}) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  if (!evidenceItems || evidenceItems.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="evidence-drawer"
      className={`rounded-xl border border-[#E5DFD5] bg-[#FDFBF7] p-3 transition-all ${className}`}
    >
      {/* Toggle header */}
      <button
        type="button"
        data-testid="evidence-drawer-toggle"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 text-left font-sans text-xs font-semibold text-[#12161E] hover:text-[#B87B22] transition-colors focus:outline-hidden"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles size={13} className="text-[#B87B22] shrink-0" />
          <span className="truncate">{title}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#EFE9DF] text-[10px] text-[#70798B] font-mono shrink-0">
            {evidenceItems.length}
          </span>
        </div>
        <div className="shrink-0 text-[#70798B]">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expandable items list */}
      {expanded && (
        <div
          data-testid="evidence-drawer-content"
          className="mt-3 pt-2.5 border-t border-[#EFE9DF] space-y-2.5"
        >
          {evidenceItems.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              data-testid={`evidence-item-${idx}`}
              className="p-2 rounded-lg bg-[#FFFFFF] border border-[#EAE4D9] text-xs space-y-1 shadow-2xs"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <ClaimBadge claimType={item.claim_type} />
                <span className="font-semibold text-[#12161E]">{item.title}</span>
              </div>
              <p className="text-[11px] text-[#4F5B6E] leading-relaxed pl-0.5">
                {item.rationale}
              </p>
              {item.source && (
                <div className="text-[9px] text-[#8C96A5] font-mono pl-0.5 flex items-center gap-1">
                  <ShieldCheck size={9} className="text-[#1E7B34]" />
                  <span>Source: {item.source}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
