import { CrowdPill, LiveBadge, StarRating, StatusBadge, VerifiedBadge } from "../badges";
import type { DemoPlace } from "../../demo/types";

export function PlaceCard({ place }: { place: DemoPlace }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-[#111827] border border-[#263244] transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 shadow-xl text-white">
      <div className="relative h-[185px] overflow-hidden bg-[#172235]">
        <img src={place.img} alt={place.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-95" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 55%)" }} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {place.verified && <VerifiedBadge small />}
          {place.liveData && <LiveBadge />}
        </div>
        <div className="absolute right-3 top-3"><CrowdPill level={place.crowd} /></div>
        {place.badge && <div className="absolute bottom-3 left-3"><span className="rounded-lg px-2 py-1 text-xs font-semibold text-white bg-teal-600/90 backdrop-blur-md">{place.badge}</span></div>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-0.5 text-xs font-semibold text-teal-400">{place.category}</p>
        <h3 className="mb-2 font-display font-bold leading-tight text-white" style={{ fontSize: "0.96rem", letterSpacing: "-0.01em" }}>{place.name}</h3>
        <div className="mb-2.5 flex flex-wrap items-center gap-3">
          <StarRating rating={place.rating} count={place.reviewCount} dark />
          <StatusBadge status={place.status} until={place.openUntil} />
          <span className="text-xs text-slate-400">📍 {place.distanceKm} km</span>
        </div>
        {place.meta && <div className="mb-3 flex flex-wrap gap-1.5">{place.meta.map((item) => <span key={item} className="rounded-full bg-[#172235] border border-[#263244] px-2 py-0.5 text-xs text-slate-300">{item}</span>)}</div>}
        {place.priceRange && <p className="mb-3 text-xs font-semibold text-slate-300">{place.priceRange}</p>}
        <div className="mt-auto flex gap-2">
          <button className="flex-1 rounded-xl py-2 text-xs font-bold text-white bg-[#14B8A6] hover:bg-[#0D9488] transition-colors">{place.variant === "attraction" ? "Explore" : "View details"}</button>
          <button className="rounded-xl bg-[#172235] hover:bg-slate-800 border border-[#263244] px-3 py-2 text-xs text-slate-300 hover:text-white" aria-label={`Show ${place.name} on map`}>🗺</button>
          <button className="rounded-xl bg-[#172235] hover:bg-slate-800 border border-[#263244] px-3 py-2 text-xs text-slate-300 hover:text-white" aria-label={`Save ${place.name}`} title="Save place">♡</button>
        </div>
      </div>
    </article>
  );
}
