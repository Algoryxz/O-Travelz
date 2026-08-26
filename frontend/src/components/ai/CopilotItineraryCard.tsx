import React from "react";
import type {
  ItineraryPlanResponse,
  ItineraryDay,
  ItineraryStop,
  TransportHop,
} from "../../types/api";
import {
  MapPin,
  Clock,
  Bus,
  Car,
  Footprints,
  Train,
  ArrowDown,
  ShieldCheck,
  Calendar,
  Compass,
  ArrowRight,
} from "lucide-react";

interface CopilotItineraryCardProps {
  itinerary: ItineraryPlanResponse;
  language?: string;
  onViewItineraryTab?: () => void;
}

const I18N = {
  en: {
    day: "Day",
    stops: "Stops",
    transitBridges: "Transit Bridges",
    groundedNotice: "Based on verified O-Travelz data",
    openInPlanner: "Open in Trip Planner",
    transitUnavailable: "Travel details unverified · Local ride / private cab recommended",
    transitMin: "min",
    arrival: "Arrival",
    departure: "Departure",
    duration: "Visit",
  },
  or: {
    day: "ଦିବସ",
    stops: "ସ୍ଥାନ",
    transitBridges: "ଯାତାୟାତ ସଂଯୋଗ",
    groundedNotice: "ଯାଞ୍ଚିତ O-Travelz ତଥ୍ୟ ଉପରେ ଆଧାରିତ",
    openInPlanner: "ଟ୍ରିପ୍ ପ୍ଲାନର୍‌ରେ ଦେଖନ୍ତୁ",
    transitUnavailable: "ଯାତାୟାତ ବିବରଣୀ ଅପ୍ରମାଣିତ · ସ୍ଥାନୀୟ ଯାନବାହାନ ସୁପାରିଶ",
    transitMin: "ମିନିଟ୍",
    arrival: "ପହଞ୍ଚିବା",
    departure: "ପ୍ରସ୍ଥାନ",
    duration: "ସମୟ",
  },
  hi: {
    day: "दिन",
    stops: "स्थान",
    transitBridges: "पारगमन संपर्क",
    groundedNotice: "सत्यापित O-Travelz डेटा पर आधारित",
    openInPlanner: "ट्रिप प्लानर में देखें",
    transitUnavailable: "यात्रा विवरण असत्यापित · स्थानीय परिवहन अनुशंसित",
    transitMin: "मिनट",
    arrival: "आगमन",
    departure: "प्रस्थान",
    duration: "अवधि",
  },
};

function formatLocalizedNumber(num: number, lang: string): string {
  if (lang === "or") {
    const odiaDigits = ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"];
    return String(num).replace(/\d/g, (d) => odiaDigits[parseInt(d, 10)]);
  }
  if (lang === "hi") {
    const hindiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).replace(/\d/g, (d) => hindiDigits[parseInt(d, 10)]);
  }
  return String(num);
}

function getModeIcon(mode: string) {
  const normalized = (mode || "").toLowerCase();
  if (normalized.includes("bus") || normalized.includes("mo bus")) {
    return <Bus size={13} className="shrink-0 text-[#2B72BA]" />;
  }
  if (normalized.includes("train") || normalized.includes("rail")) {
    return <Train size={13} className="shrink-0 text-[#1B5E6B]" />;
  }
  if (normalized.includes("walk") || normalized.includes("pedestrian")) {
    return <Footprints size={13} className="shrink-0 text-[#2F523E]" />;
  }
  return <Car size={13} className="shrink-0 text-[#B87B22]" />;
}

export const CopilotItineraryCard: React.FC<CopilotItineraryCardProps> = ({
  itinerary,
  language = "en",
  onViewItineraryTab,
}) => {
  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return null;
  }

  const langKey = (language === "or" || language === "hi" ? language : "en") as "en" | "or" | "hi";
  const t = I18N[langKey];

  return (
    <div
      data-testid="copilot-itinerary-card"
      className="mt-3 rounded-xl border border-[#E5DFD5] bg-[#FFFFFF] overflow-hidden text-[#12161E] shadow-xs text-xs space-y-0"
    >
      {/* Header bar */}
      <div className="bg-[#FAF7F2] px-3.5 py-2.5 border-b border-[#E5DFD5] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-[#B87B22]">
          <Compass size={13} />
          <span>
            {formatLocalizedNumber(itinerary.days.length, langKey)} {t.day} ·{" "}
            {formatLocalizedNumber(
              itinerary.days.reduce((acc: number, d: ItineraryDay) => acc + (d.stops?.length || 0), 0),
              langKey
            )}{" "}
            {t.stops}
          </span>
        </div>
        {itinerary.itinerary_id && (
          <span className="text-[10px] text-[#70798B] font-mono truncate max-w-[120px]">
            {itinerary.itinerary_id}
          </span>
        )}
      </div>

      {/* Days List */}
      <div className="p-3 space-y-4">
        {itinerary.days.map((day: ItineraryDay) => {
          const dayNumberLocalized = formatLocalizedNumber(day.day_number, langKey);
          const stops: ItineraryStop[] = day.stops || [];
          const hops: TransportHop[] = day.hops || [];

          // Map hops by from_sequence
          const hopsMap = new Map<number, TransportHop>();
          for (const hop of hops) {
            hopsMap.set(hop.from_sequence, hop);
          }

          return (
            <div
              key={day.day_number}
              data-testid={`copilot-itinerary-day-${day.day_number}`}
              className="rounded-lg border border-[#E5DFD5] bg-[#FBF9F5] p-3 space-y-2.5"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between gap-2 border-b border-[#E5DFD5] pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#12161E] text-white font-mono font-bold text-[10px]">
                    {t.day} {dayNumberLocalized}
                  </span>
                  {day.theme && (
                    <span className="font-semibold text-[11px] text-[#12161E] truncate max-w-[200px]">
                      {day.theme}
                    </span>
                  )}
                </div>
                {day.date && (
                  <span className="text-[10px] text-[#70798B] font-mono flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{day.date}</span>
                  </span>
                )}
              </div>

              {/* Stop Sequence & Connecting Transport Hops */}
              <div className="space-y-1.5 pt-0.5">
                {stops.map((stop: ItineraryStop, sIdx: number) => {
                  const placeName =
                    stop.place?.name || (stop as any).place_name || `Stop ${stop.sequence}`;
                  const category = stop.place?.category || (stop as any).category;
                  const district = (stop.place as any)?.district || stop.place?.location || (stop as any).district;
                  const plannedArrival = stop.planned_arrival || (stop as any).arrival_time;
                  const plannedDeparture = stop.planned_departure || (stop as any).departure_time;
                  const correspondingHop = hopsMap.get(stop.sequence) || (hops[sIdx] && hops[sIdx].from_sequence === stop.sequence ? hops[sIdx] : null);

                  return (
                    <React.Fragment key={stop.sequence || sIdx}>
                      {/* Stop Item */}
                      <div
                        data-testid={`copilot-stop-${stop.sequence || sIdx}`}
                        className="rounded-md border border-[#E5DFD5] bg-[#FFFFFF] p-2.5 flex items-start justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-[#B87B22] text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                            {formatLocalizedNumber(stop.sequence || sIdx + 1, langKey)}
                          </span>
                          <div className="min-w-0 space-y-0.5">
                            <div className="font-bold text-xs text-[#12161E] leading-snug flex flex-wrap items-center gap-1.5">
                              <span className="truncate">{placeName}</span>
                              {category && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-[#F2EEE7] text-[#70798B]">
                                  {category}
                                </span>
                              )}
                              {district && (
                                <span className="text-[10px] text-[#70798B] font-mono flex items-center gap-0.5">
                                  <MapPin size={10} />
                                  <span>{district}</span>
                                </span>
                              )}
                            </div>
                            {stop.place?.description && (
                              <p className="text-[11px] text-[#3D4654] leading-tight line-clamp-2">
                                {stop.place.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Planned Time / Arrival badge */}
                        {(plannedArrival || plannedDeparture) && (
                          <div className="shrink-0 text-right font-mono text-[10px] text-[#B87B22] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E5DFD5]">
                            {plannedArrival && <div>{plannedArrival}</div>}
                            {plannedDeparture && (
                              <div className="text-[9px] text-[#70798B]">{plannedDeparture}</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Connecting Transport Connector (if not the last stop) */}
                      {sIdx < stops.length - 1 && (
                        <div
                          data-testid="copilot-transport-connector"
                          className="my-1 pl-4 flex items-center gap-2 text-[10px] text-[#70798B] font-mono"
                        >
                          <div className="w-0.5 h-4 bg-[#E5DFD5] flex items-center justify-center relative">
                            <ArrowDown size={10} className="absolute text-[#70798B]" />
                          </div>
                          {correspondingHop && correspondingHop.mode !== "unavailable" ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E5DFD5] text-[#3D4654]">
                              {getModeIcon(correspondingHop.mode)}
                              <span className="font-semibold">{correspondingHop.mode}</span>
                              {correspondingHop.estimated_minutes != null && (
                                <span>
                                  · ~{formatLocalizedNumber(correspondingHop.estimated_minutes, langKey)}{" "}
                                  {t.transitMin}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF7ED] border border-[#FDBA74]/60 text-[#C2410C] text-[9px]">
                              <span>{t.transitUnavailable}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Grounding Notice & CTA */}
      <div className="px-3.5 py-2.5 bg-[#FAF7F2] border-t border-[#E5DFD5] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] text-[#2F523E] font-medium font-mono">
          <ShieldCheck size={12} className="text-[#2F523E]" />
          <span>{t.groundedNotice}</span>
        </div>

        {onViewItineraryTab && (
          <button
            type="button"
            data-testid="copilot-open-planner-cta"
            onClick={onViewItineraryTab}
            className="px-3 py-1.5 rounded-lg bg-[#12161E] hover:bg-[#B87B22] text-white font-mono text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>{t.openInPlanner}</span>
            <ArrowRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
};
export default CopilotItineraryCard;
