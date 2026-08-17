export function LiveBadge({ dark }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: dark ? "rgba(5,150,105,0.15)" : "rgba(255,255,255,0.92)", color: dark ? "#34d399" : "#059669" }}>
      <span className="live-dot h-1.5 w-1.5 rounded-full" style={{ background: dark ? "#34d399" : "#059669" }} />
      LIVE
    </span>
  );
}
