import { CrowdPill, LiveBadge, StarRating, StatusBadge, VerifiedBadge } from "../badges";
import type { DemoPlace } from "../../demo/types";

export function PlaceCard({ place }: { place: DemoPlace }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl" style={{ border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      <div className="relative h-[185px] overflow-hidden bg-gray-100">
        <img src={place.img} alt={place.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.50) 0%, transparent 55%)" }} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {place.verified && <VerifiedBadge small />}
          {place.liveData && <LiveBadge />}
        </div>
        <div className="absolute right-3 top-3"><CrowdPill level={place.crowd} /></div>
        {place.badge && <div className="absolute bottom-3 left-3"><span className="rounded-lg px-2 py-1 text-xs font-semibold text-white" style={{ background: "rgba(5,150,105,0.92)" }}>{place.badge}</span></div>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-0.5 text-xs font-semibold" style={{ color: "#059669" }}>{place.category}</p>
        <h3 className="mb-2 font-display font-bold leading-tight" style={{ fontSize: "0.96rem", letterSpacing: "-0.01em", color: "#111827" }}>{place.name}</h3>
        <div className="mb-2.5 flex flex-wrap items-center gap-3">
          <StarRating rating={place.rating} count={place.reviewCount} />
          <StatusBadge status={place.status} until={place.openUntil} />
          <span className="text-xs text-gray-400">📍 {place.distanceKm} km</span>
        </div>
        {place.meta && <div className="mb-3 flex flex-wrap gap-1.5">{place.meta.map((item) => <span key={item} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{item}</span>)}</div>}
        {place.priceRange && <p className="mb-3 text-xs font-semibold text-gray-800">{place.priceRange}</p>}
        <div className="mt-auto flex gap-2">
          <button className="flex-1 rounded-xl py-2 text-xs font-bold text-white" style={{ background: "#059669" }}>{place.variant === "attraction" ? "Explore" : "View details"}</button>
          <button className="rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-700" aria-label={`Show ${place.name} on map`}>🗺</button>
          <button className="rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-700" aria-label={`Save ${place.name}`} title="No-op - persistence not in approved PRD scope">♡</button>
        </div>
      </div>
    </article>
  );
}
