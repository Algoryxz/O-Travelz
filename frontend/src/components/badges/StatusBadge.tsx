import type { DemoStatus } from "../../demo/types";

const COLORS: Record<DemoStatus, { light: string; dark: string }> = {
  "OPEN NOW": { light: "#059669", dark: "#34d399" },
  AVAILABLE: { light: "#059669", dark: "#34d399" },
  "CLOSING SOON": { light: "#d97706", dark: "#fbbf24" },
  CLOSED: { light: "#ef4444", dark: "#f87171" },
  "OUT OF SERVICE": { light: "#ef4444", dark: "#f87171" },
  "STATUS UNAVAILABLE": { light: "#9ca3af", dark: "#6b7280" },
};

export function StatusBadge({ status, until, dark }: { status?: DemoStatus; until?: string; dark?: boolean }) {
  if (!status) return null;
  const color = dark ? COLORS[status].dark : COLORS[status].light;
  const label = status === "OPEN NOW" && until ? `OPEN · ${until}` : status;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
