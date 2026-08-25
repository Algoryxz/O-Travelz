import React from "react";
import { CrowdPill, LiveBadge, StarRating, StatusBadge, VerifiedBadge } from "../badges";
import type { DemoPlace } from "../../demo/types";

export function PlaceCard({ place }: { place: DemoPlace }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] transition-all duration-300 hover:-translate-y-1 hover:border-[#D1C8BA] shadow-xs hover:shadow-md text-[#12161E]">
      <div className="relative h-[190px] overflow-hidden bg-[#F2EEE7]">
        <img
          src={place.img}
          alt={place.alt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {place.verified && <VerifiedBadge small />}
          {place.liveData && <LiveBadge />}
        </div>
        <div className="absolute right-3 top-3">
          <CrowdPill level={place.crowd} />
        </div>
        {place.badge && (
          <div className="absolute bottom-3 left-3">
            <span className="rounded-md px-2 py-0.5 text-xs font-semibold text-white bg-[#B87B22]/90 backdrop-blur-md">
              {place.badge}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-0.5 text-xs font-semibold text-[#B87B22] uppercase tracking-wider font-mono">
          {place.category}
        </p>
        <h3 className="mb-2 font-serif font-bold text-base text-[#12161E] leading-snug">
          {place.name}
        </h3>
        <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
          <StarRating rating={place.rating} count={place.reviewCount} />
          <StatusBadge status={place.status} until={place.openUntil} />
          <span className="text-xs text-[#70798B] font-mono">📍 {place.distanceKm} km</span>
        </div>
        {place.meta && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {place.meta.map((item) => (
              <span
                key={item}
                className="rounded-md bg-[#F2EEE7] border border-[#E5DFD5] px-2 py-0.5 text-[11px] text-[#3D4654] font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        )}
        {place.priceRange && (
          <p className="mb-3 text-xs font-semibold text-[#3D4654]">{place.priceRange}</p>
        )}
        <div className="mt-auto flex gap-2 pt-2 border-t border-[#E5DFD5]">
          <button
            type="button"
            className="flex-1 rounded-lg py-2 text-xs font-bold text-white bg-[#B87B22] hover:bg-[#A0691B] transition-colors cursor-pointer"
          >
            {place.variant === "attraction" ? "Explore" : "View details"}
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#F2EEE7] hover:bg-[#EAE4DA] border border-[#E5DFD5] px-3 py-2 text-xs text-[#3D4654] hover:text-[#12161E] transition-colors cursor-pointer"
            aria-label={`Show ${place.name} on map`}
          >
            🗺
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#F2EEE7] hover:bg-[#EAE4DA] border border-[#E5DFD5] px-3 py-2 text-xs text-[#3D4654] hover:text-[#12161E] transition-colors cursor-pointer"
            aria-label={`Save ${place.name}`}
            title="Save place"
          >
            ♡
          </button>
        </div>
      </div>
    </article>
  );
}
