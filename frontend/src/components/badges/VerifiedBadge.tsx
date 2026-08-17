export function VerifiedBadge({ small, dark }: { small?: boolean; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${small ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"}`}
      style={{
        background: dark ? "rgba(5,150,105,0.15)" : "#ecfdf5",
        color: dark ? "#34d399" : "#047857",
        border: dark ? "1px solid rgba(52,211,153,0.25)" : "1px solid #a7f3d0",
      }}
    >
      ✓ VERIFIED
    </span>
  );
}
