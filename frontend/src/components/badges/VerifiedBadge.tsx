export function VerifiedBadge({ small }: { small?: boolean; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium tracking-tight bg-[#2F523E]/10 text-[#2F523E] border border-[#2F523E]/20 ${
        small ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className="font-bold">✓</span> VERIFIED
    </span>
  );
}
