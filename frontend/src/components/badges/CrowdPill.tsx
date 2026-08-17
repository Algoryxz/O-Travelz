import type { CrowdLevel } from "../../demo/types";

const STYLES: Record<CrowdLevel, { bg: string; text: string; dot: string; label: string }> = {
  low: { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Low crowd" },
  moderate: { bg: "#fef9c3", text: "#713f12", dot: "#eab308", label: "Moderate" },
  high: { bg: "#fee2e2", text: "#7f1d1d", dot: "#ef4444", label: "Busy" },
};

export function CrowdPill({ level }: { level: CrowdLevel }) {
  const style = STYLES[level];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: style.bg, color: style.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.dot }} />
      {style.label}
    </span>
  );
}
