# O-TRAVELZ Mobile V4 — Travel Contexts & Behavioral Profiles

> **Authoritative Behavioral Specification**  
> Model: **Contextual & Situational Traveler Needs (Anti-Demographic)**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## Behavioral Philosophy

O-TRAVELZ does not design for static marketing archetypes (e.g. "Rahul, 28, tech worker"). Instead, we design for **dynamic situational travel contexts**. A single traveler can be a `FIRST_TIME_VISITOR` on Friday morning, an `OFFLINE_OR_LOW_CONNECTIVITY_TRAVELER` in Similipal on Saturday afternoon, and a `TRANSIT_DEPENDENT_TRAVELER` boarding Mo Bus Route 10 on Sunday.

---

## 1. LOCAL_EXPLORER

- **Principal Need**: Discover hidden architectural gems, seasonal temple festivals, and authentic rural artisan clusters within 50 km of their home base.
- **Common Failure**: Generic apps only show tourist clichés (e.g. only Puri Beach) while ignoring living heritage like Pipili applique or Barapali weavers.
- **Relevant Jobs**: Job 1 (Discover), Job 6 (Map), Job 8 (Save & Resume), Job 9 (Contribute).
- **Location Assumptions**: High location accuracy; familiar with district geography.
- **Mobility Assumptions**: Two-wheeler, private car, or familiar local bus.
- **Connectivity Assumptions**: Consistent 4G/5G mobile data.
- **Platform Implications**: High usage of district filter chips, spatial map layers, and community contributions.

---

## 2. FIRST_TIME_VISITOR

- **Principal Need**: Clear, trustworthy guidance on the essential "Golden Triangle" (Bhubaneswar, Puri, Konark) with reliable transit and zero tourist traps.
- **Common Failure**: Encountering deceptive auto-rickshaw touts, outdated temple opening hours, or fake reviews.
- **Relevant Jobs**: Job 1 (Discover), Job 2 (Understand), Job 3 (Plan), Job 5 (Transit), Job 7 (Essentials).
- **Location Assumptions**: Starting from Bhubaneswar Airport (BBI) or Master Canteen Railway Station.
- **Mobility Assumptions**: Public transit (Mo Bus), registered pre-paid taxis, and walking.
- **Connectivity Assumptions**: Roaming mobile data; occasionally unstable in dense temple alleys.
- **Platform Implications**: Heavy reliance on truth badges (Verified Official), clear IST timetable clocks, and zero-cost turn-by-turn navigation handoff.

---

## 3. FAMILY_GROUP

- **Principal Need**: Feasible, paced itineraries with verified rest windows, accessible facilities, clean sanitation, and minimal walking strain for elders and children.
- **Common Failure**: Over-packed itineraries with 2 km walking legs under 38°C midday heat without water points.
- **Relevant Jobs**: Job 2 (Understand), Job 3 (Plan), Job 4 (Execute), Job 7 (Essentials).
- **Location Assumptions**: Hub-and-spoke travel from comfortable hotel bases in Bhubaneswar or Puri.
- **Mobility Assumptions**: Hired air-conditioned cab or private vehicle.
- **Connectivity Assumptions**: Moderate connectivity; primary user navigates for the whole group.
- **Platform Implications**: FirstMileEngine warning banners when walking exceeds 800 m (`AUTO_OR_CAB_RECOMMENDED`), live heat index indicators, clear emergency hospital contacts.

---

## 4. SOLO_TRAVELER

- **Principal Need**: Safe, self-directed exploration, transparent public transit schedules, affordable cultural exploration, and reliable emergency contacts.
- **Common Failure**: Unclear evening bus timetables leaving traveler stranded at an out-of-town monument after sunset.
- **Relevant Jobs**: Job 4 (Execute), Job 5 (Transit), Job 6 (Map), Job 7 (Essentials), Job 11 (Offline).
- **Location Assumptions**: Moves frequently across urban, suburban, and rural stops.
- **Mobility Assumptions**: Public transit, walking, shared auto-rickshaws.
- **Connectivity Assumptions**: Variable cellular signal; needs battery conservation.
- **Platform Implications**: Battery-friendly Dark Atlas theme, offline saved itineraries, high-contrast typography readable under direct sunlight.

---

## 5. TRANSIT_DEPENDENT_TRAVELER

- **Principal Need**: Exact scheduled departure times, verified bus route numbers, stopping localities, and honest walking distances to the nearest stop.
- **Common Failure**: Apps displaying fake "live" bus tracking that leads to missed connections.
- **Relevant Jobs**: Job 5 (Transit), Job 4 (Execute), Job 6 (Map), Job 10 (Rider Verification).
- **Location Assumptions**: Within CRUT Mo Bus or OSRTC Ama Bus operating networks (5 operational regions).
- **Mobility Assumptions**: 100% public transit and walking.
- **Connectivity Assumptions**: Intermittent connectivity while moving on highway bus routes.
- **Platform Implications**: Strict `Scheduled · HH:MM IST` badge enforcement, tabular numbers to prevent layout jitter, FirstMileEngine walking distance gate.

---

## 6. CAR_OR_CAB_TRAVELER

- **Principal Need**: Scenic highway corridor intelligence, parking availability cues, fuel/EV stations, and seamless external GPS voice navigation.
- **Common Failure**: Getting routed onto unpaved village pedestrian paths unsuitable for cars.
- **Relevant Jobs**: Job 1 (Discover), Job 4 (Execute), Job 6 (Map), Job 7 (Essentials).
- **Location Assumptions**: Moving between districts along NH-16, NH-316, and state highways.
- **Mobility Assumptions**: Private automobile or long-distance taxi.
- **Connectivity Assumptions**: Good on national highways; drops in ghat sections.
- **Platform Implications**: One-tap deep link to Google Maps / Apple Maps for turn-by-turn driving; corridor-filtered explore feed.

---

## 7. TIME_CONSTRAINED_VISITOR (e.g. 6-Hour Transit Layover)

- **Principal Need**: Strict time-budgeted itinerary fitting a tight 4-to-8-hour window between flights or trains at Bhubaneswar.
- **Common Failure**: Missing a return flight due to unforeseen traffic or unrealistic multi-stop plans.
- **Relevant Jobs**: Job 3 (Plan), Job 4 (Execute), Job 5 (Transit).
- **Location Assumptions**: Origin and strict terminus at BBI Airport or Master Canteen Railway Station.
- **Mobility Assumptions**: Direct pre-paid taxi or Mo Bus Route 10.
- **Connectivity Assumptions**: Reliable urban connectivity.
- **Platform Implications**: Golden Scenario J4 integration; strict transit buffer math; prioritized monument suggestions within 15 km of origin.

---

## 8. CULTURE_FOCUSED_TRAVELER

- **Principal Need**: Deep, respectful contextual knowledge about Kalinga temple architecture, Odia living craft traditions (Pattachitra, Dokra, Tarakasi), and artisan lineages.
- **Common Failure**: Shallow commercial travel apps treating UNESCO World Heritage sites as generic selfie backdrops.
- **Relevant Jobs**: Job 1 (Discover), Job 2 (Understand), Job 8 (Save & Resume).
- **Location Assumptions**: Concentrated in heritage zones (Old Town Bhubaneswar, Puri, Raghurajpur, Lalitgiri).
- **Mobility Assumptions**: Walking and slow exploration.
- **Connectivity Assumptions**: Standard mobile data.
- **Platform Implications**: Magazine-grade serif typography, high-res authentic WebP photo essays, Odia script rendering with system fonts (`Kalinga`, `Nirmala UI`).

---

## 9. NATURE_FOCUSED_TRAVELER

- **Principal Need**: Seasonal wildlife guidance (e.g. migratory birds at Mangalajodi/Chilika, waterfalls in Keonjhar, tigers in Similipal), entry gate locations, and sanctuary rules.
- **Common Failure**: Outdated sanctuary seasonal closure information (e.g. visiting Similipal during monsoon closure).
- **Relevant Jobs**: Job 1 (Discover), Job 2 (Understand), Job 6 (Map), Job 11 (Offline).
- **Location Assumptions**: Remote protected areas, coastal lagoons, and mountain reserves.
- **Mobility Assumptions**: Forest department safari jeeps, boats, private high-clearance vehicles.
- **Connectivity Assumptions**: Severe dead zones; zero connectivity for hours.
- **Platform Implications**: Strict seasonal closure notices; mandatory offline package pre-caching prompts before entering reserve boundaries.

---

## 10. ACCESSIBILITY_SENSITIVE_TRAVELER

- **Principal Need**: Legible high-contrast text, full screen-reader compatibility (VoiceOver / TalkBack), step-free access indicators, and large touch targets.
- **Common Failure**: Gray-on-gray low-contrast UI, unlabelled icon buttons, inaccessible maps with no text alternatives.
- **Relevant Jobs**: All Jobs (cross-cutting).
- **Location Assumptions**: Any location.
- **Mobility Assumptions**: Wheelchair, walking cane, or low-vision assistance.
- **Connectivity Assumptions**: Any.
- **Platform Implications**: Strict 44x44 pt minimum touch target enforcement, Dynamic Type support from XS to Accessibility XXXL, text-based list alternatives for every map view, WCAG AA contrast.

---

## 11. OFFLINE_OR_LOW_CONNECTIVITY_TRAVELER

- **Principal Need**: Uninterrupted functional utility of saved trips, destination facts, and emergency contacts when mobile data is dead.
- **Common Failure**: App freezing, crashing, or displaying blank screens with an infinite spinner when data is lost.
- **Relevant Jobs**: Job 4 (Execute), Job 8 (Save & Resume), Job 11 (Offline).
- **Location Assumptions**: Rural districts (Malkangiri, Koraput, interior Mayurbhanj), ghat roads, deep valleys.
- **Mobility Assumptions**: Any.
- **Connectivity Assumptions**: Zero reception (Airplane Mode or 0 bars).
- **Platform Implications**: Seamless offline transition without jarring popups; local database reads; cached timestamps on all dynamic feeds.

---

## 12. LOCAL_CONTRIBUTOR

- **Principal Need**: Streamlined, intuitive interface to record transit stop arrivals, submit photographic evidence, and correct erroneous timings.
- **Common Failure**: Complex bureaucratic forms requiring dozens of mandatory fields, causing contribution abandonment.
- **Relevant Jobs**: Job 9 (Contribute), Job 10 (Rider Verification).
- **Location Assumptions**: Physical presence at a transit stop or cultural monument.
- **Mobility Assumptions**: Active rider on transit.
- **Connectivity Assumptions**: Active or queued for background sync.
- **Platform Implications**: Single-tap check-in buttons; direct CameraX / AVCapture shutter; transparent consensus progress indicator.
