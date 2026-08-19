import { useState } from "react";
import { CrowdPill, StatusBadge } from "../components/badges";
import { EssentialCard, NearbyDarkCard, PlaceCard } from "../components/place";
import { MapPlaceholder } from "../components/map/MapPlaceholder";
import {
  AI_PLAN,
  CATEGORIES_12,
  DEMO_ITINERARY_PLAN,
  INTEREST_CHIPS,
  ITINERARY,
  MAP_CAT_FILTERS,
  MAP_QUICK_FILTERS,
  NEARBY_PLACES,
  ODISHA_CITIES,
  ODISHA_DESTINATIONS,
  POPULAR_CATS,
  RESPONSIBLE_TOURISM,
  SAFETY_ATM,
  SAFETY_MEDICAL,
  SAFETY_TRANSPORT,
} from "../demo/mockData";
import type { DemoPlace, LocationMode, NearbyTab } from "../demo/types";

export default function DemoHome() {
  return <ApprovedDemoFlow />;
}

function ApprovedDemoFlow() {
  const [conversationText, setConversationText] = useState("");
  const plan = DEMO_ITINERARY_PLAN;
  const day = plan.days[0];

  return (
    <div className="min-h-screen font-body" style={{ color: "#111827" }}>
      <header
        className="fixed inset-x-0 top-0 z-50 px-6 py-3.5 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(229,231,235,0.80)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-white text-sm" style={{ background: "#059669" }}>O</div>
          <div>
            <span className="font-display font-bold text-sm" style={{ letterSpacing: "-0.02em", color: "#111827" }}>O-Travelz</span>
            <p className="text-xs leading-none" style={{ color: "#9ca3af", letterSpacing: "0.025em" }}>safe • secure • smart</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "#4b5563" }}>
          <a href="#itinerary" className="transition-colors hover:text-green-600">Itinerary</a>
          <a href="#map" className="transition-colors hover:text-green-600">Map</a>
          <a href="#conversation" className="transition-colors hover:text-green-600">Refinement</a>
        </nav>
        <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>
          Visual prototype · mock data
        </span>
      </header>

      <section className="relative" style={{ minHeight: "48vh", background: "#0f1a12" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.30) 100%)" }} />
        <div className="relative max-w-screen-xl mx-auto px-6 md:px-8 pt-36 pb-20">
          <p className="inline-flex items-center gap-2 mb-6 px-4 py-2.5 rounded-full text-xs font-semibold" style={{ background: "rgba(5,150,105,0.18)", border: "1px solid rgba(52,211,153,0.35)", color: "#6ee7b7" }}>
            DEMO FIXTURE · NO LIVE DATA
          </p>
          <h1 className="font-display font-extrabold text-white mb-5" style={{ fontSize: "clamp(2.8rem,5.2vw,4.6rem)", letterSpacing: "-0.035em", lineHeight: 1.02 }}>
            Contract-shaped<br /><span style={{ color: "#34d399" }}>travel planning.</span>
          </h1>
          <p className="max-w-xl text-sm font-light" style={{ color: "rgba(255,255,255,0.62)", lineHeight: 1.7 }}>
            A visual prototype for the approved itinerary, transport, map, and conversation surfaces. The values shown below are mock fixture data for UI review only.
          </p>
        </div>
      </section>

      <section id="itinerary" style={{ background: "#ffffff" }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "#059669" }}>Itinerary · demo fixture</p>
              <h2 className="font-display font-bold text-3xl" style={{ letterSpacing: "-0.025em", color: "#111827" }}>Shared plan response</h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>{plan.explanation}</p>
            </div>
            <span className="hidden sm:inline-flex text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" }}>
              MOCK DATA ONLY
            </span>
          </div>

          <div className="mb-6 rounded-2xl px-5 py-4" style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
            <p className="text-sm font-semibold">No verified or live travel facts are displayed.</p>
            <p className="text-xs mt-1">This section renders the shared `ItineraryPlanResponse` shape so the presentation can be reviewed before backend integration.</p>
          </div>

          {day ? (
            <>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(day.stops.length, 1)}, 1fr)` }}>
                {day.stops.map((stop, index) => (
                  <div key={stop.sequence} className="flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-display font-bold text-white shrink-0" style={{ background: index === 0 ? "#059669" : "#1f2937" }}>
                        {String(stop.sequence).padStart(2, "0")}
                      </div>
                      {index < day.stops.length - 1 && <div className="flex-1 h-px mx-2" style={{ background: "#e5e7eb" }} />}
                    </div>
                    <div className="rounded-2xl p-4 bg-white flex-1" style={{ border: "1px solid #f3f4f6" }}>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "#059669" }}>{stop.place.category}</p>
                      <h3 className="font-display font-bold text-sm leading-tight mb-3" style={{ color: "#111827" }}>{stop.place.name}</h3>
                      <p className="text-xs" style={{ color: "#6b7280" }}>Sequence {stop.sequence}</p>
                      {stop.planned_arrival && <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Arrival · {stop.planned_arrival}</p>}
                      {stop.planned_departure && <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Departure · {stop.planned_departure}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl p-6" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#059669" }}>Travel hops · preview</p>
                    <h3 className="font-display font-bold text-xl" style={{ color: "#111827" }}>Transit routes</h3>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "#047857" }}>Preview</span>
                </div>
                <div className="space-y-3">
                  {day.hops.length > 0 ? day.hops.map((hop) => {
                    const from = day.stops.find((stop) => stop.sequence === hop.from_sequence)?.place.name ?? `Stop ${hop.from_sequence}`;
                    const to = day.stops.find((stop) => stop.sequence === hop.to_sequence)?.place.name ?? `Stop ${hop.to_sequence}`;
                    return (
                      <div key={`${hop.from_sequence}-${hop.to_sequence}`} className="rounded-2xl p-4 bg-white" style={{ border: "1px solid #dcfce7" }}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <p className="text-sm font-bold" style={{ color: "#111827" }}>{from} <span style={{ color: "#059669" }}>→</span> {to}</p>
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#ecfdf5", color: "#047857" }}>Transit segment</span>
                        </div>
                        <ol className="space-y-1.5 text-xs" style={{ color: "#4b5563" }}>
                          {hop.legs.map((leg, index) => <li key={`${leg.mode}-${index}`}><span className="font-semibold" style={{ color: "#059669" }}>{index + 1}.</span> {leg.mode}{leg.provider ? ` · ${leg.provider}` : ""}{leg.route ? ` · route ${leg.route}` : ""} — {leg.detail}</li>)}
                        </ol>
                        <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: "#6b7280" }}>
                          {hop.estimated_minutes != null && <span>Estimate · {hop.estimated_minutes} min</span>}
                          {hop.estimated_cost != null && <span>Estimate · ₹{hop.estimated_cost}</span>}
                        </div>
                        {hop.reason && <p className="mt-3 text-xs font-semibold" style={{ color: "#b91c1c" }}>Unavailable · {hop.reason}</p>}
                      </div>
                    );
                  }) : <p className="text-sm" style={{ color: "#6b7280" }}>No transport hops are present in this fixture.</p>}
                </div>
              </div>
            </>
          ) : <p className="text-sm" style={{ color: "#6b7280" }}>This fixture contains no itinerary day.</p>}
        </div>
      </section>

      <section id="map" style={{ background: "#1e293b" }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "#34d399" }}>Map · preview</p>
          <h2 className="font-display font-bold text-white text-3xl mb-2" style={{ letterSpacing: "-0.025em" }}>Route map view</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>Interactive destinations and routes across Odisha.</p>
          <MapPlaceholder plan={plan} />
        </div>
      </section>

      <section id="conversation" style={{ background: "#0f172a" }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-7 pt-7 pb-5 flex items-center justify-between gap-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#34d399" }}>Conversation / refinement · demo</p>
                <h2 className="font-display font-bold text-white text-2xl" style={{ letterSpacing: "-0.02em" }}>Scripted interaction preview</h2>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>NO AI REQUEST</span>
            </div>
            <div className="p-7 space-y-5">
              <div className="rounded-2xl px-5 py-4 text-sm" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.08)" }}>
                This scripted conversation demonstrates the intended refinement surface. It does not call AI or recalculate an itinerary.
              </div>
              <div className="flex flex-wrap gap-2">
                {['Reduce walking', 'Lower transport cost', 'Change interests'].map((prompt) => <button type="button" key={prompt} disabled className="text-xs px-3 py-2 rounded-xl font-medium opacity-70" style={{ background: "rgba(5,150,105,0.18)", color: "#34d399", border: "1px solid rgba(52,211,153,0.20)" }}>{prompt}</button>)}
              </div>
              <div className="rounded-2xl px-5 py-4 text-sm text-white" style={{ background: "#059669" }}>Demo refinement text appears here; no backend recalculation is performed.</div>
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#fbbf24" }}>Mock fixture values</p>
                <div className="space-y-3">
                  {AI_PLAN.map((step, index) => <div key={`${step.place.id}-${index}`} className="flex items-center justify-between gap-4 text-sm">
                    <div><p className="text-xs" style={{ color: "#34d399" }}>{step.place.category}</p><p className="font-semibold text-white">{step.place.name}</p></div>
                    <span className="text-xs text-right" style={{ color: "rgba(255,255,255,0.55)" }}>{step.distance} · {step.travel_time} · {step.price}</span>
                  </div>)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <input type="text" placeholder="Demo-only input · no request is sent" value={conversationText} onChange={(event) => setConversationText(event.target.value)} className="flex-1 bg-transparent text-sm outline-none" style={{ color: "rgba(255,255,255,0.80)" }} />
                  <button type="button" disabled title="Demo-only control; no AI request is sent" className="w-9 h-9 rounded-xl flex items-center justify-center text-white opacity-60" style={{ background: "#059669" }} aria-label="Demo send button">
                    →
                  </button>
                </div>
                <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>Input is kept only for visual review. No refinement is submitted.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-10 flex items-center justify-between flex-wrap gap-4">
          <span className="font-display font-bold text-white text-sm">O-Travelz · visual prototype</span>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>Mock fixture data · no live, verified, AI, routing, or persistence behavior</p>
        </div>
      </footer>
    </div>
  );
}

// The original exploratory visual reference remains available in source for design review,
// but it is intentionally not rendered by the default application flow.
function LegacyVisualReference() {
  const [search, setSearch]               = useState('')
  const [locationMode, setLocationMode]   = useState<LocationMode>('live')
  const [selectedCity, setSelectedCity]   = useState('Bhubaneswar')
  const [showLocPicker, setShowLocPicker] = useState(false)
  const [activeCat, setActiveCat]         = useState<string | null>(null)
  const [nearbyTab, setNearbyTab]         = useState<NearbyTab>('all')
  const [mapCat, setMapCat]               = useState('All')
  const [mapFilters, setMapFilters]       = useState<string[]>([])
  const [activeDay, setActiveDay]         = useState(0)
  const [aiInput, setAiInput]             = useState('')
  const [interests, setInterests]         = useState(['☕ Cafés','🎮 Gaming','🌿 Nature','🍜 Food'])
  const [surprise, setSurprise]           = useState<DemoPlace | null>(null)
  const [activeQuick, setActiveQuick]     = useState<string | null>(null)

  const toggleMapFilter = (f: string) => setMapFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  const toggleInterest  = (i: string) => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  const handleSurprise = () => {
    setActiveQuick('surprise')
  }

  const nearbyFiltered = (() => {
    const all = [...NEARBY_PLACES]
    return all
  })()

  const currentLocation = locationMode === 'live' ? `${selectedCity} · Live` : `${selectedCity} · Exploring`
  // DEMO DATA - replace with live values: hero stats, scripted chat, statuses, and copy below.

  return (
    <div className="min-h-screen font-body" style={{ color:'#111827' }}>

      {showLocPicker && <div className="fixed inset-0 z-40" onClick={() => setShowLocPicker(false)} />}

      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-50 px-6 py-3.5 flex items-center justify-between"
        style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid rgba(229,231,235,0.80)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-white text-sm" style={{ background:'#059669' }}>O</div>
          <div>
            <span className="font-display font-bold text-sm" style={{ letterSpacing:'-0.02em', color:'#111827' }}>O-Travelz</span>
            <p className="text-xs leading-none" style={{ color:'#9ca3af', letterSpacing:'0.025em' }}>safe • secure • smart</p>
          </div>
        </div>

        <div className="relative hidden md:block">
          <button onClick={() => setShowLocPicker(!showLocPicker)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-gray-50"
            style={{ border:'1px solid #e5e7eb', color:'#374151' }}>
            <span style={{ color:'#059669' }}>📍</span>
            {selectedCity}
            {locationMode === 'live' && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background:'#ecfdf5', color:'#059669' }}>
                <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background:'#059669' }} />Live
              </span>
            )}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {showLocPicker && (
            <div className="absolute top-full left-0 mt-2 rounded-2xl bg-white shadow-2xl z-50 p-5 w-72" style={{ border:'1px solid #e5e7eb' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold" style={{ color:'#111827' }}>Live Location</p>
                  <p className="text-xs mt-0.5" style={{ color:'#9ca3af' }}>Auto-detect your position</p>
                </div>
                <button onClick={() => setLocationMode(prev => prev === 'live' ? 'manual' : 'live')}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200"
                  style={{ background: locationMode === 'live' ? '#059669' : '#d1d5db' }}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200"
                    style={{ left: locationMode === 'live' ? '22px' : '2px' }} />
                </button>
              </div>
              {locationMode === 'manual' ? (
                <div className="space-y-0.5 max-h-52 overflow-y-auto">
                  {ODISHA_CITIES.map(city => (
                    <button key={city} onClick={() => { setSelectedCity(city); setShowLocPicker(false) }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between hover:bg-gray-50"
                      style={{ fontWeight: selectedCity === city ? 700 : 500, color: selectedCity === city ? '#059669' : '#374151' }}>
                      {city}
                      {selectedCity === city && <span style={{ color:'#059669' }}>✓</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-3 text-center" style={{ background:'#ecfdf5' }}>
                  <p className="text-xs font-semibold" style={{ color:'#047857' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full live-dot mr-1.5" style={{ background:'#059669' }} />
                    Location active · {selectedCity}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color:'#4b5563' }}>
          {['Discover','Map','Plan Trip','Saved'].map(l => (
            <a key={l} href="#" className="transition-colors hover:text-green-600">{l}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ background:'#ecfdf5', color:'#047857', border:'1px solid #a7f3d0' }}>
            <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background:'#059669' }} />Live data
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background:'#059669' }}>A</div>
        </div>
      </header>

      {/* UNAPPROVED SCREEN - pending PRD OPEN DECISION, see docs/PRD.md. Included in demo branch for discussion only. */}
      {/* ═══ HERO - discovery homepage exploration ═══ */}
      <section className="relative" style={{ minHeight:'100vh', background:'#0f1a12' }}>
        <img
          src="https://images.unsplash.com/photo-1677211352662-30e7775c7ce8?w=1920&h=1080&fit=crop&auto=format"
          alt="Konark Sun Temple Odisha"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background:'linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 45%, rgba(0,0,0,0.22) 72%, rgba(0,0,0,0.05) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background:'linear-gradient(to top, #f9fafb, transparent)' }} />

        <div className="absolute inset-0 flex items-center" style={{ paddingTop:'64px' }}>
          <div className="max-w-screen-xl mx-auto px-6 md:px-8 w-full">
            <div className="grid gap-10 items-center" style={{ gridTemplateColumns:'1fr 340px' }}>

              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 mb-7 self-start px-4 py-2.5 rounded-full text-xs font-semibold"
                  style={{ background:'rgba(5,150,105,0.18)', border:'1px solid rgba(52,211,153,0.35)', color:'#6ee7b7', backdropFilter:'blur(12px)' }}>
                  <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background:'#10b981' }} />
                  📍 {currentLocation}
                </div>

                <h1 className="font-display font-extrabold text-white mb-5"
                  style={{ fontSize:'clamp(2.8rem,5.2vw,4.6rem)', letterSpacing:'-0.035em', lineHeight:1.02 }}>
                  Discover everything<br />
                  in <span style={{ color:'#34d399' }}>Odisha.</span>
                </h1>

                <p className="text-sm mb-1 font-light" style={{ color:'rgba(255,255,255,0.58)', lineHeight:1.7 }}>
                  Temples · Beaches · Cafés · Gaming · Shopping · Food · Activities · Events
                </p>
                <p className="text-sm mb-8 font-light" style={{ color:'rgba(255,255,255,0.36)' }}>
                  For tourists, locals, students and families alike.
                </p>

                <div className="flex items-center rounded-2xl overflow-hidden max-w-lg mb-5"
                  style={{ background:'#fff', boxShadow:'0 8px 40px rgba(0,0,0,0.35)' }}>
                  <div className="flex items-center gap-3 px-5 py-4 flex-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input type="text" placeholder={`Find places near ${selectedCity}…`}
                      value={search} onChange={e => setSearch(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm" style={{ color:'#111827' }} />
                  </div>
                  <button className="m-2 px-5 py-3 rounded-xl text-sm font-bold text-white" style={{ background:'#059669' }}>Search</button>
                </div>

                {/* ✨ SURPRISE ME — major feature */}
                <div className="flex items-center gap-4 flex-wrap">
                  <button onClick={handleSurprise}
                    className="surprise-glow flex items-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-bold text-white transition-all hover:-translate-y-1 hover:scale-105"
                    style={{ background:'linear-gradient(135deg,#059669 0%,#047857 100%)', border:'1px solid rgba(52,211,153,0.30)', letterSpacing:'-0.01em' }}>
                    <span style={{ fontSize:'1.15rem' }}>✨</span>
                    Surprise Me
                    <span className="text-xs opacity-50 ml-0.5">↗</span>
                  </button>
                  <p className="text-xs" style={{ color:'rgba(255,255,255,0.38)' }}>Location-aware · open places near you</p>
                </div>

                {surprise && activeQuick === 'surprise' && (
                  <div className="mt-5 rounded-2xl p-4 flex items-center gap-4 max-w-lg"
                    style={{ background:'rgba(5,150,105,0.18)', backdropFilter:'blur(12px)', border:'1px solid rgba(52,211,153,0.30)' }}>
                    <span style={{ fontSize:'1.6rem' }}>🎉</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold mb-0.5" style={{ color:'#6ee7b7' }}>We found something for you!</p>
                      <p className="font-display font-bold text-white text-base">{surprise.name}</p>
                      <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color:'rgba(255,255,255,0.55)' }}>
                        <span style={{ color:'#34d399' }}>● OPEN NOW</span>
                        <span>·</span>
                        <span>{surprise.distanceKm} km away</span>
                        {surprise.priceRange && <><span>·</span><span>{surprise.priceRange}</span></>}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background:'#059669' }}>Go →</button>
                      <button onClick={handleSurprise} className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ background:'rgba(255,255,255,0.12)', color:'#6ee7b7' }}>Again</button>
                      <button onClick={() => { setSurprise(null); setActiveQuick(null) }} className="px-2 py-2 text-sm" style={{ color:'rgba(255,255,255,0.40)' }}>✕</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: floating glass destination cards */}
              <div className="hidden lg:flex flex-col gap-3 justify-center">
                {[
                  { name:'Konark',       cat:'Heritage · UNESCO', status:'● OPEN NOW · 6:00 PM',  icon:'🏛', cls:'fc1' },
                  { name:'Puri',         cat:'Beach · Coastal',   status:'60 km · High season',   icon:'🏖', cls:'fc2' },
                  { name:'Chilika Lake', cat:'Wildlife · Nature', status:'Dolphins · Flamingos',  icon:'🌊', cls:'fc3' },
                  { name:'Daringbadi',   cat:'Hills · Nature',    status:'Cool climate · 280 km', icon:'🌿', cls:'fc4' },
                ].map(card => (
                  <div key={card.name} className={`${card.cls} flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all hover:scale-105`}
                    style={{ background:'rgba(255,255,255,0.11)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.18)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background:'rgba(5,150,105,0.25)' }}>{card.icon}</div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-white text-sm leading-tight">{card.name}</p>
                      <p className="text-xs" style={{ color:'rgba(255,255,255,0.58)' }}>{card.cat}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color:'#34d399' }}>{card.status}</p>
                    </div>
                    <div className="w-1.5 h-10 rounded-full" style={{ background:'rgba(52,211,153,0.40)' }} />
                  </div>
                ))}
                <div className="rounded-2xl p-4 mt-1" style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.14)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold tracking-wide uppercase" style={{ color:'#6ee7b7' }}>Live Location</p>
                    <span className="flex items-center gap-1 text-xs" style={{ color:'rgba(255,255,255,0.45)' }}>
                      <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background:'#10b981' }} />~12m accurate
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden mb-3" style={{ height:'80px', background:'rgba(5,150,105,0.12)' }}>
                    <svg width="100%" height="80" viewBox="0 0 280 80" preserveAspectRatio="xMidYMid slice">
                      <rect width="280" height="80" fill="rgba(5,150,105,0.08)"/>
                      <path d="M 0,40 Q 50,20 100,40 Q 150,60 200,35 Q 240,15 280,30" stroke="rgba(52,211,153,0.25)" strokeWidth="1.5" fill="none"/>
                      <circle cx="140" cy="40" r="12" fill="rgba(5,150,105,0.20)"/>
                      <circle cx="140" cy="40" r="6" fill="rgba(5,150,105,0.50)"/>
                      <circle cx="140" cy="40" r="3" fill="#34d399"/>
                    </svg>
                  </div>
                  <p className="font-display font-bold text-white text-sm">{selectedCity}, Odisha</p>
                  <p className="text-xs" style={{ color:'rgba(255,255,255,0.42)' }}>Location sharing active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* END UNAPPROVED SCREEN */}
      {/* UNAPPROVED SCREEN - pending PRD OPEN DECISION, see docs/PRD.md. Included in demo branch for discussion only. */}
      {/* ═══ STATS - emerald green ═══ */}
      <section style={{ background:'#059669' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between flex-wrap gap-4">
          {[{n:'4,200+',label:'Verified places in Odisha'},{n:'28',label:'Cities & Towns'},{n:'12',label:'Discovery categories'},{n:'24/7',label:'Medical support'},{n:'100%',label:'Safe & Secure'},{n:'< 2s',label:'AI response time'}].map(({ n, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-xl" style={{ letterSpacing:'-0.02em' }}>{n}</span>
              <span className="text-xs" style={{ color:'rgba(255,255,255,0.60)' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* END UNAPPROVED SCREEN */}
      {/* UNAPPROVED SCREEN - pending PRD OPEN DECISION, see docs/PRD.md. Included in demo branch for discussion only. */}
      {/* ═══ QUICK ACTIONS - white ═══ */}
      <section style={{ background:'#ffffff' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id:'nearby',   icon:'📍', label:'Nearby',         sub:'Places within 2 km',   dark:false },
              { id:'openNow',  icon:'🟢', label:'Open Now',        sub:'Currently available',  dark:false },
              { id:'surprise', icon:'✨', label:'Surprise Me',     sub:'Random open place',    dark:true  },
              { id:'explore',  icon:'🗺', label:'Explore Odisha',  sub:'Tourism destinations', dark:true  },
            ].map(action => {
              const active = activeQuick === action.id
              return (
                <button key={action.id}
                  onClick={() => { setActiveQuick(action.id); if (action.id === 'surprise') handleSurprise() }}
                  className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all hover:-translate-y-0.5 hover:shadow-xl ${action.id === 'surprise' ? 'surprise-glow' : ''}`}
                  style={active
                    ? { background:'#1f2937', color:'#fff', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }
                    : action.dark
                    ? { background:'linear-gradient(135deg,#059669,#047857)', color:'#fff' }
                    : { background:'#f9fafb', color:'#111827', border:'1px solid #e5e7eb' }}>
                  <span style={{ fontSize:'1.8rem', lineHeight:1 }}>{action.icon}</span>
                  <div>
                    <p className="font-display font-bold text-sm" style={{ letterSpacing:'-0.01em' }}>{action.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: active || action.dark ? 'rgba(255,255,255,0.65)' : '#9ca3af' }}>{action.sub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* END UNAPPROVED SCREEN */}
      {/* UNAPPROVED SCREEN - pending PRD OPEN DECISION, see docs/PRD.md. Included in demo branch for discussion only. */}
      {/* ═══ 12 CATEGORIES - pale slate ═══ */}
      <section style={{ background:'#f1f5f9' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color:'#059669' }}>What are you looking for?</p>
              <h2 className="font-display font-bold text-3xl" style={{ letterSpacing:'-0.025em', color:'#111827' }}>Discover Odisha</h2>
              <p className="text-sm mt-1" style={{ color:'#6b7280' }}>12 categories — from temples to ATMs.</p>
            </div>
            {activeCat && (
              <button onClick={() => setActiveCat(null)} className="text-sm font-medium px-3 py-1.5 rounded-xl"
                style={{ color:'#6b7280', border:'1px solid #e5e7eb' }}>Clear ✕</button>
            )}
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(138px, 1fr))' }}>
            {CATEGORIES_12.map(cat => (
              <button key={cat.id} onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={activeCat === cat.id
                  ? { background:'#059669', color:'#fff', boxShadow:'0 6px 24px rgba(5,150,105,0.30)' }
                  : { background:'#ffffff', color:'#374151', border:'1px solid #e5e7eb' }}>
                <span style={{ fontSize:'1.75rem', lineHeight:1 }}>{cat.icon}</span>
                <div>
                  <p className="text-xs font-bold leading-tight">{cat.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: activeCat === cat.id ? 'rgba(255,255,255,0.60)' : '#9ca3af' }}>{cat.sub.split(' · ')[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* END UNAPPROVED SCREEN */}
      {/* UNAPPROVED SCREEN - pending PRD OPEN DECISION, see docs/PRD.md. Included in demo branch for discussion only. */}
      {/* ═══ POPULAR CATEGORIES - white, photo cards ═══ */}
      <section style={{ background:'#ffffff' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color:'#059669' }}>Browse by category</p>
            <h2 className="font-display font-bold text-3xl" style={{ letterSpacing:'-0.025em', color:'#111827' }}>Popular Categories</h2>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns:'repeat(3, 1fr)' }}>
            {POPULAR_CATS.map(cat => (
              <div key={cat.label} className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-xl hover:-translate-y-1" style={{ height:'160px', background:'#1f2937' }}>
                <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0) 100%)' }} />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background:'rgba(5,150,105,0.88)', backdropFilter:'blur(8px)' }}>{cat.icon}</div>
                <div className="absolute bottom-3 left-3">
                  <p className="font-display font-bold text-white text-base leading-tight">{cat.label}</p>
                  <p className="text-xs font-medium" style={{ color:'#34d399' }}>{cat.sub}</p>
                </div>
                <span className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-lg font-semibold text-white" style={{ background:'rgba(5,150,105,0.80)' }}>Explore →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* END UNAPPROVED SCREEN */}
      {/* UNAPPROVED SCREEN - pending PRD OPEN DECISION, see docs/PRD.md. Included in demo branch for discussion only. */}
      {/* ═══ NEARBY & ACTIVE NOW - dark charcoal #111827 ═══ */}
      <section style={{ background:'#111827' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color:'#34d399' }}>Location-aware</p>
              <h2 className="font-display font-bold text-white text-3xl" style={{ letterSpacing:'-0.025em' }}>Nearby & Active Now</h2>
              <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color:'rgba(255,255,255,0.48)' }}>
                <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background:'#34d399' }} />
                Open, verified near <strong className="font-semibold ml-1" style={{ color:'rgba(255,255,255,0.75)' }}>{selectedCity}</strong>
              </p>
            </div>
            <button className="text-sm font-semibold" style={{ color:'#34d399' }}>View all →</button>
          </div>

          <div className="flex gap-2 mb-6">
            {([['all','All'],['open','Open Now'],['rated','Top Rated'],['nearest','Nearest']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setNearbyTab(id)}
                className="text-sm px-4 py-2 rounded-xl font-semibold transition-all"
                style={nearbyTab === id
                  ? { background:'#059669', color:'#fff' }
                  : { background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.60)', border:'1px solid rgba(255,255,255,0.10)' }}>
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns:'1fr 1fr' }}>
            {nearbyFiltered.map(place => <NearbyDarkCard key={place.id} place={place} />)}
          </div>
        </div>
      </section>

      {/* END UNAPPROVED SCREEN */}
      {/* UNAPPROVED SCREEN - pending PRD OPEN DECISION, see docs/PRD.md. Included in demo branch for discussion only. */}
      {/* ═══ PLACES TO VISIT - white ═══ */}
      <section style={{ background:'#ffffff' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color:'#059669' }}>Tourism</p>
              <h2 className="font-display font-bold text-3xl" style={{ letterSpacing:'-0.025em', color:'#111827' }}>Places to Visit</h2>
              <p className="text-sm mt-1" style={{ color:'#6b7280' }}>Verified destinations across Odisha.</p>
            </div>
            <button className="text-sm font-medium" style={{ color:'#6b7280' }}>View all →</button>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns:'repeat(4, 1fr)' }}>
            {ODISHA_DESTINATIONS.map(dest => <PlaceCard key={dest.id} place={dest} />)}
          </div>
        </div>
      </section>

      {/* END UNAPPROVED SCREEN */}
      {/* UNAPPROVED SCREEN - pending PRD OPEN DECISION, see docs/PRD.md. Included in demo branch for discussion only. */}
      {/* ═══ RESPONSIBLE TOURISM - soft green #f0fdf4 ═══ */}
      <section style={{ background:'#f0fdf4' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <div className="rounded-3xl overflow-hidden bg-white" style={{ border:'1px solid #bbf7d0', boxShadow:'0 4px 24px rgba(5,150,105,0.08)' }}>
            <div className="px-7 pt-7 pb-5 flex items-center justify-between" style={{ borderBottom:'1px solid #f0fdf4' }}>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color:'#059669' }}>Responsible Tourism</p>
                <h2 className="font-display font-bold text-2xl" style={{ letterSpacing:'-0.02em', color:'#111827' }}>Visitor pressure · Live conditions</h2>
              </div>
              {/* DEMO DATA - replace with live value */}
              <span className="text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5" style={{ background:'#ecfdf5', color:'#047857', border:'1px solid #a7f3d0' }}>
                <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background:'#059669' }} />Live data
              </span>
            </div>
            <div>
              {RESPONSIBLE_TOURISM.map((item, idx) => {
                const p = item.pressure
                const isHigh = p > 80; const isMid = p > 50
                const barColor = isHigh ? '#ef4444' : isMid ? '#eab308' : '#22c55e'
                const pressureLabel = isHigh ? 'High visitor pressure' : isMid ? 'Moderate' : 'Low — great time to visit'
                return (
                  <div key={item.destination.id} className="px-7 py-5" style={{ borderTop: idx > 0 ? '1px solid #f0fdf4' : 'none' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-display font-bold text-sm" style={{ color:'#111827' }}>{item.destination.name}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: isHigh ? '#fee2e2' : isMid ? '#fef9c3' : '#dcfce7', color: isHigh ? '#7f1d1d' : isMid ? '#713f12' : '#166534' }}>
                          {pressureLabel}
                        </span>
                      </div>
                      <span className="text-sm font-bold font-mono" style={{ color:barColor }}>{p}%</span>
                    </div>
                    <div className="rounded-full overflow-hidden mb-3" style={{ height:'6px', background:'#f3f4f6' }}>
                      <div className="fill-bar h-full rounded-full" style={{ width:`${p}%`, background:barColor }} />
                    </div>
                    {item.alternatives.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs" style={{ color:'#6b7280' }}>Consider instead:</span>
                        {item.alternatives.map(a => (
                          <button key={a.id} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background:'#ecfdf5', color:'#047857', border:'1px solid #a7f3d0' }}>{a.name}</button>
                        ))}
                        <span className="text-xs" style={{ color:'#9ca3af' }}>- {item.alternativeNote}</span>
                      </div>
                    ) : (
                      <p className="text-xs font-medium" style={{ color:'#059669' }}>✓ {item.alternativeNote}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* END UNAPPROVED SCREEN */}
      {/* ═══ MAP - approved PRD screen; geometry remains Susmita's boundary. ═══ */}
      <section style={{ background:'#1e293b' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color:'#34d399' }}>Map</p>
            <h2 className="font-display font-bold text-white text-3xl" style={{ letterSpacing:'-0.025em' }}>Discover on the map</h2>
          </div>
          <div className="cat-scroll flex gap-2 mb-4 pb-1">
            {MAP_CAT_FILTERS.map(f => (
              <button key={f} onClick={() => setMapCat(f)}
                className="text-xs px-3.5 py-2 rounded-full font-semibold whitespace-nowrap shrink-0 transition-all"
                style={mapCat === f ? { background:'#059669', color:'#fff' } : { background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.65)', border:'1px solid rgba(255,255,255,0.12)' }}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-5 flex-wrap">
            {MAP_QUICK_FILTERS.map(f => (
              <button key={f} onClick={() => toggleMapFilter(f)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={mapFilters.includes(f) ? { background:'#059669', color:'#fff' } : { background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.10)' }}>
                {f}
              </button>
            ))}
          </div>
          <MapPlaceholder plan={DEMO_ITINERARY_PLAN} />
        </div>
      </section>

      {/* ═══ AI COPILOT + PROFILE — very dark navy #0f172a ═══ */}
      <section style={{ background:'#0f172a' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14 grid gap-6" style={{ gridTemplateColumns:'1fr 320px' }}>

          <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-7 pt-7 pb-5 flex items-center justify-between" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color:'#34d399' }}>AI Copilot</p>
                <h2 className="font-display font-bold text-white text-2xl" style={{ letterSpacing:'-0.02em' }}>Your smart travel assistant</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background:'rgba(5,150,105,0.18)', color:'#34d399', border:'1px solid rgba(52,211,153,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background:'#34d399' }}/>AI active
              </div>
            </div>

            <div className="p-7 flex-1 space-y-5">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-sm" style={{ background:'#059669' }}>O</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-4 text-sm leading-relaxed" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.80)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  Hi! I&apos;m your O-Travelz Copilot. You&apos;re in <strong style={{ color:'#34d399' }}>{selectedCity}</strong> — how can I help you explore today?
                </div>
              </div>

              <div className="flex flex-wrap gap-2 ml-12">
                {['Plan a 2-day trip to Puri','Find cafés around me','What can I do nearby?','Show hidden gems','Surprise me'].map(s => (
                  <button key={s} className="text-xs px-3 py-2 rounded-xl font-medium" style={{ background:'rgba(5,150,105,0.18)', color:'#34d399', border:'1px solid rgba(52,211,153,0.20)' }}>{s}</button>
                ))}
              </div>

              <div className="flex justify-end">
                <div className="max-w-md rounded-2xl rounded-tr-sm px-5 py-4 text-sm text-white leading-relaxed" style={{ background:'#059669' }}>
                  I&apos;m in {selectedCity} with three friends. We have 4 hours and want food, gaming and somewhere to chill.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 font-bold text-white text-sm" style={{ background:'#059669' }}>O</div>
                <div className="flex-1">
                  <div className="rounded-2xl rounded-tl-sm px-5 py-4 text-sm leading-relaxed mb-4" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.78)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    Here&apos;s your <strong style={{ color:'#fff' }}>4-hour plan</strong> — all within 3 km, all verified open right now.
                  </div>
                  <div className="space-y-3">
                    {AI_PLAN.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background:'rgba(255,255,255,0.08)' }}>{step.icon}</div>
                          {i < AI_PLAN.length - 1 && <div className="w-px flex-1 mt-1" style={{ background:'rgba(255,255,255,0.10)', minHeight:'12px' }}/>}
                        </div>
                        <div className="flex-1 rounded-xl px-4 py-3 flex items-center justify-between" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color:'#34d399' }}>{step.place.category}</p>
                            <p className="font-display font-bold text-white text-sm">{step.place.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs" style={{ color:'rgba(255,255,255,0.42)' }}>
                              <span>📍 {step.distance}</span><span>🕐 {step.travel_time}</span>
                              <StatusBadge status={step.status} dark />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold" style={{ color:'rgba(255,255,255,0.75)' }}>{step.price}</p>
                            {step.verified
                              ? <span className="text-xs font-semibold" style={{ color:'#34d399' }}>✓ VERIFIED</span>
                              : <span className="text-xs font-semibold" style={{ color:'#fbbf24' }}>✦ AI pick</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-7 pb-7">
              <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)' }}>
                <input type="text" placeholder="Ask me anything…" value={aiInput} onChange={e => setAiInput(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none" style={{ color:'rgba(255,255,255,0.80)' }} />
                <button className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background:'#059669' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* UNAPPROVED SCREEN - profile/preferences is outside the approved PRD journey. Included for discussion only. */}
          <div className="rounded-3xl p-7 flex flex-col" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color:'#34d399' }}>Your Profile</p>
            <h3 className="font-display font-bold text-white text-xl mb-5" style={{ letterSpacing:'-0.02em' }}>Preferences</h3>
            <div className="space-y-3 flex-1">
              {[{label:'Location',val:currentLocation},{label:'Budget / outing',val:'₹200–600'},{label:'Preferred time',val:'Evenings & Weekends'},{label:'Transport',val:'Auto · Walking'},{label:'Crowd pref.',val:'Prefer quieter spots'}].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xs" style={{ color:'rgba(255,255,255,0.40)' }}>{label}</span>
                  <span className="text-xs font-semibold" style={{ color:'rgba(255,255,255,0.80)' }}>{val}</span>
                </div>
              ))}
              <div className="pt-1">
                <p className="text-xs mb-3" style={{ color:'rgba(255,255,255,0.38)' }}>Interests — tap to toggle</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_CHIPS.map(chip => (
                    <button key={chip} onClick={() => toggleInterest(chip)}
                      className="text-xs px-2.5 py-1.5 rounded-full font-medium transition-all"
                      style={interests.includes(chip) ? { background:'#059669', color:'#fff' } : { background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.10)' }}>
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* no-op - persistence not in approved PRD scope */}
            <button className="mt-6 w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background:'#059669' }}>Save preferences</button>
          </div>
          {/* END UNAPPROVED SCREEN */}
        </div>
      </section>

      {/* ═══ ITINERARY — white ═══ */}
      <section style={{ background:'#ffffff' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color:'#059669' }}>Plan Your Day</p>
              <h2 className="font-display font-bold text-3xl" style={{ letterSpacing:'-0.025em', color:'#111827' }}>Weekend in {selectedCity}</h2>
              <p className="text-sm mt-1" style={{ color:'#6b7280' }}>AI-generated · Heritage, food, shopping and entertainment.</p>
            </div>
            <div className="flex gap-2">
              {['Saturday','Sunday'].map((d, i) => (
                <button key={d} onClick={() => setActiveDay(i)}
                  className="text-sm px-5 py-2 rounded-xl font-semibold"
                  style={activeDay === i ? { background:'#059669', color:'#fff' } : { background:'#f3f4f6', color:'#374151', border:'1px solid #e5e7eb' }}>
                  {d}
                </button>
              ))}
              <button className="text-sm px-5 py-2 rounded-xl font-semibold text-white" style={{ background:'#1f2937' }}>Export</button>
            </div>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns:`repeat(${ITINERARY.length}, 1fr)` }}>
            {ITINERARY.map((item, i) => {
              const isLast = i === ITINERARY.length - 1
              return (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: i === 0 ? '#059669' : '#fff', border: i === 0 ? 'none' : '2px solid #e5e7eb' }}>
                      {item.icon}
                    </div>
                    {!isLast && <div className="flex-1 h-px mx-2" style={{ background:'#e5e7eb' }}/>}
                  </div>
                  <div className="rounded-2xl p-4 bg-white flex-1" style={{ border:'1px solid #f3f4f6' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs" style={{ color:'#9ca3af' }}>{item.time}</span>
                      {item.verified && <span className="text-xs font-bold" style={{ color:'#059669' }}>✓</span>}
                    </div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color:'#059669' }}>{item.place.category}</p>
                    <h4 className="font-display font-bold text-sm leading-tight mb-2" style={{ color:'#111827' }}>{item.place.name}</h4>
                    <p className="text-xs mb-2" style={{ color:'#9ca3af' }}>📍 {item.location}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold" style={{ color:'#1f2937' }}>{item.cost}</span>
                      <CrowdPill level={item.crowd}/>
                    </div>
                    <div className="flex gap-1">
                      {['Change','Alternatives'].map(btn => (
                        <button key={btn} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background:'#f3f4f6', color:'#4b5563', border:'1px solid #e5e7eb' }}>{btn}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-5 rounded-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-4" style={{ background:'#ecfdf5', border:'1px solid #a7f3d0' }}>
            {[{label:'Total cost',val:'₹790'},{label:'Activities',val:'5'},{label:'Verified',val:'5/5',green:true},{label:'Avg crowd',val:'Moderate'},{label:'Duration',val:'~11 hours'}].map(({ label, val, green }) => (
              <div key={label}>
                <p className="text-xs mb-0.5" style={{ color:'#047857' }}>{label}</p>
                <p className="font-bold text-sm" style={{ color: green ? '#059669' : '#111827' }}>{val}</p>
              </div>
            ))}
            {/* no-op - persistence not in approved PRD scope */}
            <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background:'#059669' }}>Add to trips</button>
          </div>
        </div>
      </section>

      {/* UNAPPROVED SCREEN - safety/essentials is exploratory and pending PRD scope approval. */}
      {/* ═══ SAFETY & ESSENTIALS - warm off-white #fafaf8 ═══ */}
      <section style={{ background:'#fafaf8' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-14">
            <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color:'#059669' }}>Always with you</p>
            <h2 className="font-display font-bold text-3xl mb-1" style={{ letterSpacing:'-0.025em', color:'#111827' }}>Safety & Essentials</h2>
            <p className="text-sm" style={{ color:'#6b7280' }}>Medical help, ATMs and transport — nearest first, live status.</p>
          </div>
          <div className="grid gap-6" style={{ gridTemplateColumns:'repeat(3, 1fr)' }}>
            {[
              { title:'Medical Help', sub:'Hospitals · Clinics · 24/7',    icon:'🏥', data:SAFETY_MEDICAL,   color:'#fee2e2', cta:'Emergency · Call 108', ctaColor:'#ef4444' },
              { title:'ATMs Nearby',  sub:'All banks · Live availability', icon:'🏧', data:SAFETY_ATM,       color:'#fef9c3', cta:'Show all ATMs →',    ctaColor:undefined },
              { title:'Transport',    sub:'Bus · Rail · Auto · Air',       icon:'🚌', data:SAFETY_TRANSPORT, color:'#dbeafe', cta:'Get directions →',  ctaColor:undefined },
            ].map(sec => (
              <div key={sec.title} className="rounded-3xl overflow-hidden bg-white" style={{ border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="px-5 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background:sec.color }}>{sec.icon}</div>
                  <div>
                    <p className="font-display font-bold text-sm" style={{ color:'#111827' }}>{sec.title}</p>
                    <p className="text-xs" style={{ color:'#9ca3af' }}>{sec.sub}</p>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {sec.data.map(p => <EssentialCard key={p.id} place={p} icon={sec.icon} />)}
                </div>
                <div className="px-4 pb-4">
                  <button className="w-full py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: sec.ctaColor ?? '#ecfdf5', color: sec.ctaColor ? '#fff' : '#047857', border: sec.ctaColor ? 'none' : '1px solid #a7f3d0' }}>
                    {sec.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* END UNAPPROVED SCREEN */}

      {/* ═══ FOOTER - dark ═══ */}
      <footer style={{ background:'#111827', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center font-display font-black text-white text-sm" style={{ background:'#059669' }}>O</div>
            <div>
              <span className="font-display font-bold text-white text-sm">O-Travelz</span>
              <p className="text-xs leading-none" style={{ color:'rgba(255,255,255,0.28)', letterSpacing:'0.04em' }}>safe • secure • smart</p>
            </div>
          </div>
          <p className="text-xs" style={{ color:'rgba(255,255,255,0.28)' }}>Smart India Hackathon 2025 · Intelligent discovery platform for Odisha</p>
          <div className="flex items-center gap-2 text-xs" style={{ color:'rgba(255,255,255,0.38)' }}>
            <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background:'#10b981' }}/>Live · Verified · Updated now
          </div>
        </div>
      </footer>

    </div>
  )
}
