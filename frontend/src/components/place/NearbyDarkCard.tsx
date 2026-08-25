import { CrowdPill, StarRating, StatusBadge, VerifiedBadge } from "../badges";
import type { DemoPlace } from "../../demo/types";

export function NearbyDarkCard({ place }: { place: DemoPlace }) {
  return (
    <article className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.015]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-800"><img src={place.img} alt={place.alt} className="h-full w-full object-cover" /></div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2"><h3 className="truncate font-display font-bold text-white text-sm">{place.name}</h3>{place.verified && <VerifiedBadge small dark />}</div>
        <p className="mb-1 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>📍 {place.location} · {place.distanceKm} km</p>
        <div className="flex flex-wrap items-center gap-2"><StarRating rating={place.rating} count={place.reviewCount} dark /><StatusBadge status={place.status} until={place.openUntil} dark /><CrowdPill level={place.crowd} /></div>
      </div>
      <span className="text-white/30">›</span>
    </article>
  );
}
