import { StatusBadge, VerifiedBadge } from "../badges";
import type { EssentialPlace } from "../../demo/types";

export function EssentialCard({ place, icon }: { place: EssentialPlace; icon: string }) {
  return (
    <article className="flex items-center gap-3 rounded-xl p-3" style={{ border: "1px solid #f3f4f6" }}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5"><p className="truncate text-xs font-bold text-gray-800">{place.name}</p>{place.verified && <VerifiedBadge small />}</div>
        <p className="truncate text-xs text-gray-400">{place.address} · {place.distanceKm} km</p>
        <div className="mt-1 flex items-center gap-2"><StatusBadge status={place.status} />{place.note && <span className="truncate text-xs text-gray-400">{place.note}</span>}</div>
        {place.contact && <p className="mt-1.5 text-xs font-semibold" style={{ color: "#059669" }}>☎ {place.contact}</p>}
      </div>
    </article>
  );
}
