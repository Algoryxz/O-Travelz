export function StarRating({ rating, count, dark }: { rating: number; count: number; dark?: boolean }) {
  const label = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: dark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
      <span style={{ color: dark ? "#34d399" : "#059669", fontWeight: 600 }}>★ {rating.toFixed(1)}</span>
      <span>({label})</span>
    </span>
  );
}
