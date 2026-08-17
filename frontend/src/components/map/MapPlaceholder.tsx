import type { ItineraryPlanResponse } from "../../api/contracts";

export function MapPlaceholder({ plan }: { plan?: ItineraryPlanResponse }) {
  const stopCount = plan?.days.reduce((count, day) => count + day.stops.length, 0) ?? 0;
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-3xl p-8 text-center" style={{ background: "#0f172a", border: "1px dashed rgba(52,211,153,0.45)" }}>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#34d399" }}>Map integration boundary</p>
        <h3 className="font-display text-xl font-bold text-white">Map view placeholder</h3>
        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "rgba(255,255,255,0.58)" }}>
          {stopCount ? `${stopCount} contract-shaped itinerary stops are ready for the map layer.` : "Contract-shaped itinerary data will be rendered here."}
        </p>
        <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>Geometry and route lines belong to Susmita's map subsystem.</p>
      </div>
    </div>
  );
}
