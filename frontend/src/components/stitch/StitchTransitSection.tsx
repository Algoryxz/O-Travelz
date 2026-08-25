import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from '../../context/LocationContext';
import { apiClient } from '../../api/client';
import type {
  NearbyStopResponse,
  RouteDetailResponse,
  JourneyPlanResponse,
} from '../../types/api';
import { StitchJourneyCard, type StitchJourneyPreferences } from './StitchJourneyCard';
import { convertPlannedJourneyToItinerary } from '../../utils/multimodalItinerary';

export interface StitchTransitSectionProps {
  onNavigateToMap?: (lat: number, lon: number, stopName?: string, journey?: JourneyPlanResponse) => void;
  onAddStopToTrip?: (stopName: string, routeNumber?: string, journey?: JourneyPlanResponse) => void;
}

const VERIFIED_ODISHA_HUBS = [
  { name: 'Master Canteen / BBSR Station', city: 'Bhubaneswar', lat: 20.2667, lon: 85.8436 },
  { name: 'Biju Patnaik Airport', city: 'Bhubaneswar', lat: 20.2520, lon: 85.8178 },
  { name: 'AIIMS Bhubaneswar', city: 'Bhubaneswar', lat: 20.2312, lon: 85.7891 },
  { name: 'Baramunda BSABT', city: 'Bhubaneswar', lat: 20.2731, lon: 85.7923 },
  { name: 'Nandankanan Zoological Park', city: 'Bhubaneswar', lat: 20.3956, lon: 85.8256 },
  { name: 'Lingaraj Temple', city: 'Bhubaneswar', lat: 20.2383, lon: 85.8336 },
  { name: 'Ainthapali Bus Terminal', city: 'Sambalpur', lat: 21.4954, lon: 83.9840 },
  { name: 'MKCG Medical College', city: 'Berhampur', lat: 19.3083, lon: 84.8083 },
  { name: 'Vedvyas', city: 'Rourkela', lat: 22.2375, lon: 84.7787 },
  { name: 'Sanaghagara Park', city: 'Keonjhar', lat: 21.6167, lon: 85.5500 },
];

export const StitchTransitSection: React.FC<StitchTransitSectionProps> = ({
  onNavigateToMap,
  onAddStopToTrip,
}) => {
  const { currentPosition, locationName, isLive, locationType, locateUser, setManualLocation, permissionState, isLoading: isLocating } = useLocation();

  const [mode, setMode] = useState<'stops' | 'journey'>('stops');
  const [selectedHub, setSelectedHub] = useState<typeof VERIFIED_ODISHA_HUBS[0] | null>(null);
  const [nearbyStops, setNearbyStops] = useState<NearbyStopResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multimodal Journey Planning State
  const [selectedDestHub, setSelectedDestHub] = useState<typeof VERIFIED_ODISHA_HUBS[0]>(VERIFIED_ODISHA_HUBS[1]); // Airport default
  const [plannedJourney, setPlannedJourney] = useState<JourneyPlanResponse | null>(null);
  const [planningJourney, setPlanningJourney] = useState<boolean>(false);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  const [journeyPreferences, setJourneyPreferences] = useState<StitchJourneyPreferences>({
    includeFood: true,
    minimizeDetour: false,
  });

  // Route Detail Modal State
  const [activeRouteDetail, setActiveRouteDetail] = useState<RouteDetailResponse | null>(null);
  const [loadingRouteDetail, setLoadingRouteDetail] = useState(false);

  // Effective coordinates
  const activeLat = currentPosition?.lat ?? (selectedHub?.lat || VERIFIED_ODISHA_HUBS[0].lat);
  const activeLon = currentPosition?.lon ?? (selectedHub?.lon || VERIFIED_ODISHA_HUBS[0].lon);
  const activeLocationLabel = locationName || (selectedHub?.name || VERIFIED_ODISHA_HUBS[0].name);

  // Fetch nearby transit stops with guaranteed verified fallback
  const fetchNearby = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stops = await apiClient.getNearbyStops(activeLat, activeLon, 25000, 4);
      if (Array.isArray(stops) && stops.length > 0) {
        setNearbyStops(stops);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Nearby stops fetch API note:', err);
    }

    // Authoritative verified Odisha static stops fallback
    try {
      const { getVerifiedStaticNearbyStops } = await import('../../data/staticTransitStops');
      const staticStops = getVerifiedStaticNearbyStops(activeLat, activeLon, 35000, 4);
      setNearbyStops(staticStops);
    } catch (fallbackErr) {
      console.warn('Static stop resolution error:', fallbackErr);
      setError("Transit information couldn't be loaded right now.");
    } finally {
      setLoading(false);
    }
  }, [activeLat, activeLon]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  // Plan Multimodal Journey Action
  const handlePlanJourney = useCallback(async () => {
    setPlanningJourney(true);
    setJourneyError(null);
    try {
      const res = await apiClient.planMultimodalJourney({
        origin_lat: activeLat,
        origin_lon: activeLon,
        destination_lat: selectedDestHub.lat,
        destination_lon: selectedDestHub.lon,
        max_walking_distance_m: 3000,
        include_food: journeyPreferences.includeFood,
        dietary_tag: journeyPreferences.dietaryTag,
        cuisine: journeyPreferences.cuisine,
        max_food_detour_m: journeyPreferences.minimizeDetour ? 300 : 2500,
      });
      setPlannedJourney(res);
    } catch (err) {
      console.warn('Multimodal journey plan note:', err);
      setJourneyError('No direct scheduled transit corridor connects these two points directly. We recommend walking to a nearby major hub or hailing a local ride.');
    } finally {
      setPlanningJourney(false);
    }
  }, [activeLat, activeLon, selectedDestHub, journeyPreferences]);

  // Re-plan journey when preferences change if in journey mode
  useEffect(() => {
    if (mode === 'journey') {
      handlePlanJourney();
    }
  }, [mode, journeyPreferences, selectedDestHub, handlePlanJourney]);

  // Handle Route Detail View
  const handleOpenRouteDetail = async (routeId: string) => {
    setLoadingRouteDetail(true);
    try {
      const detail = await apiClient.getRouteDetail(routeId);
      setActiveRouteDetail(detail);
    } catch (err) {
      console.warn('Failed to load route detail:', err);
    } finally {
      setLoadingRouteDetail(false);
    }
  };

  return (
    <section className="w-full bg-[#FAF7F2] py-16 px-6 md:px-12 border-t border-b border-[#E5DFD5]">
      <div className="max-w-6xl mx-auto">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#E5DFD5]">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#B87B22]/10 text-[#B87B22] px-3.5 py-1 rounded-full text-xs font-mono font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-[#B87B22]"></span>
              <span>Intelligent Transit &amp; Spatial Corridors</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#12161E] tracking-tight">
              Mo Bus &amp; Transit Near You
            </h2>
            <p className="text-sm sm:text-base text-[#70798B] font-body mt-2 max-w-xl leading-relaxed">
              Official CRUT Mo Bus routes, nearest verified stops, walking estimates, and schedule-aware multimodal journey planning.
            </p>
          </div>

          {/* Mode Tabs & Origin Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-white p-1 rounded-xl border border-[#E5DFD5] flex items-center shadow-xs">
              <button
                onClick={() => setMode('stops')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  mode === 'stops'
                    ? 'bg-[#12161E] text-white shadow-xs'
                    : 'text-[#70798B] hover:text-[#12161E]'
                }`}
              >
                Nearby Stops
              </button>
              <button
                onClick={() => setMode('journey')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  mode === 'journey'
                    ? 'bg-[#12161E] text-white shadow-xs'
                    : 'text-[#70798B] hover:text-[#12161E]'
                }`}
              >
                Plan Multimodal Trip
              </button>
            </div>

            {permissionState !== 'granted' && (
              <button
                onClick={() => locateUser(false)}
                disabled={isLocating}
                className="bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-[#B87B22]">my_location</span>
                <span>{isLocating ? 'Locating...' : 'Use Live GPS'}</span>
              </button>
            )}

            {/* Manual Location Fallback Picker */}
            <div className="relative">
              <select
                value={selectedHub ? `${selectedHub.lat},${selectedHub.lon}` : `${VERIFIED_ODISHA_HUBS[0].lat},${VERIFIED_ODISHA_HUBS[0].lon}`}
                onChange={(e) => {
                  const [lat, lon] = e.target.value.split(',').map(Number);
                  const hub = VERIFIED_ODISHA_HUBS.find((h) => h.lat === lat && h.lon === lon);
                  if (hub) {
                    setSelectedHub(hub);
                    setManualLocation({ lat: hub.lat, lon: hub.lon }, hub.name, hub.city);
                  }
                }}
                className="bg-white text-[#12161E] border border-[#E5DFD5] px-3.5 py-2 rounded-xl text-xs font-body focus:outline-none focus:border-[#B87B22] cursor-pointer shadow-xs"
              >
                <optgroup label="Choose Starting Location">
                  {VERIFIED_ODISHA_HUBS.map((hub) => (
                    <option key={hub.name} value={`${hub.lat},${hub.lon}`}>
                      📍 {hub.name} ({hub.city})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#70798B] mb-6">
          <span>Active Origin:</span>
          <span className="font-semibold text-[#12161E]">{activeLocationLabel}</span>
          <span className="inline-flex items-center gap-1 bg-[#B87B22]/10 text-[#B87B22] px-2 py-0.5 rounded-full text-[10px] font-semibold">
            {locationType === 'LIVE_GPS' ? '🟢 Live GPS' : locationType === 'MANUAL_LOCATION' ? '📌 Selected Hub' : '🏢 Verified Default Hub'}
          </span>
        </div>

        {/* Mode 1: Multimodal Journey Planning */}
        {mode === 'journey' ? (
          <div className="space-y-6">
            {/* Destination Selection Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DFD5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">flag</span>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#70798B]">Choose Destination Hub</div>
                  <select
                    value={`${selectedDestHub.lat},${selectedDestHub.lon}`}
                    onChange={(e) => {
                      const [lat, lon] = e.target.value.split(',').map(Number);
                      const hub = VERIFIED_ODISHA_HUBS.find((h) => h.lat === lat && h.lon === lon);
                      if (hub) setSelectedDestHub(hub);
                    }}
                    className="font-display font-bold text-sm text-[#12161E] bg-transparent border-0 focus:outline-none cursor-pointer"
                  >
                    {VERIFIED_ODISHA_HUBS.map((hub) => (
                      <option key={hub.name} value={`${hub.lat},${hub.lon}`} className="text-[#12161E]">
                        {hub.name} ({hub.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handlePlanJourney}
                disabled={planningJourney}
                className="bg-[#B87B22] hover:bg-[#A0691B] text-white px-5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">route</span>
                <span>{planningJourney ? 'Synthesizing...' : 'Calculate Journey'}</span>
              </button>
            </div>

            {/* Planned Journey Result Card */}
            {planningJourney ? (
              <div className="bg-white border border-[#E5DFD5] p-10 rounded-2xl text-center space-y-3 shadow-xs">
                <div className="w-8 h-8 border-2 border-[#B87B22] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-mono text-[#70798B]">Computing schedule-aware transit path across 154 routes...</p>
              </div>
            ) : journeyError ? (
              <div className="bg-white border border-[#E5DFD5] p-8 rounded-2xl text-center shadow-xs space-y-3">
                <span className="material-symbols-outlined text-amber-700 text-3xl">route</span>
                <h4 className="text-base font-display font-bold text-[#12161E]">Direct Transit Path Unavailable</h4>
                <p className="text-xs text-[#70798B] max-w-md mx-auto font-body">
                  {journeyError}
                </p>
                <button
                  onClick={handlePlanJourney}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#12161E] hover:bg-[#2A3447] text-white rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Retry Calculation</span>
                </button>
              </div>
            ) : plannedJourney ? (
              <StitchJourneyCard
                userLocationName={activeLocationLabel}
                locationType={locationType}
                plannedJourney={plannedJourney}
                preferences={journeyPreferences}
                onUpdatePreferences={(newPrefs) => setJourneyPreferences((prev) => ({ ...prev, ...newPrefs }))}
                onViewPlannedJourneyOnMap={(j) => {
                  onNavigateToMap?.(j.origin.latitude, j.origin.longitude, j.origin.resolved_name, j);
                }}
                onAddPlannedJourneyToTrip={(j) => {
                  const itinerary = convertPlannedJourneyToItinerary(j);
                  onAddStopToTrip?.(j.destination.resolved_name || 'Destination', undefined, j);
                }}
              />
            ) : (
              <div className="bg-white border border-[#E5DFD5] p-8 rounded-2xl text-center shadow-xs">
                <span className="material-symbols-outlined text-[#B87B22] text-3xl mb-2">directions_bus</span>
                <h4 className="text-base font-display font-bold text-[#12161E]">Ready to Plan Route</h4>
                <p className="text-xs text-[#70798B] mt-1 max-w-md mx-auto font-body">
                  Select your destination above to synthesize a schedule-aware multimodal journey with optional corridor food waypoints.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Mode 2: Nearby Stops List */
          loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#70798B] py-2">
                <div className="w-3.5 h-3.5 border-2 border-[#B87B22] border-t-transparent rounded-full animate-spin"></div>
                <span>Finding nearby Mo Bus stops…</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 bg-white rounded-2xl border border-[#E5DFD5]"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-white border border-[#E5DFD5] p-8 rounded-2xl text-center shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">sensors_off</span>
              </div>
              <div>
                <h4 className="text-base font-display font-bold text-[#12161E]">Transit information couldn't be reached right now.</h4>
                <p className="text-xs text-[#70798B] mt-1 max-w-md mx-auto font-body">
                  Please check connection or retry below. You can also pick a verified transit hub from the dropdown above.
                </p>
              </div>
              <button
                onClick={fetchNearby}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#12161E] hover:bg-[#2A3447] text-white rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Retry Connection</span>
              </button>
            </div>
          ) : nearbyStops.length === 0 ? (
            <div className="bg-white border border-[#E5DFD5] p-8 rounded-2xl text-center shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">location_off</span>
              </div>
              <div>
                <h4 className="text-base font-display font-bold text-[#12161E]">No mapped Mo Bus stops found nearby.</h4>
                <p className="text-xs text-[#70798B] mt-1 max-w-md mx-auto font-body">
                  Official Mo Bus spatial stops are currently concentrated in the Capital Region. Explore key Bhubaneswar transit hubs to see route connections and schedules.
                </p>
              </div>
              <button
                onClick={() => {
                  const hub = VERIFIED_ODISHA_HUBS[0]; // Master Canteen
                  setSelectedHub(hub);
                  setManualLocation({ lat: hub.lat, lon: hub.lon }, hub.name, hub.city);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B87B22] hover:bg-[#A0691B] text-white rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">directions_bus</span>
                <span>Explore Bhubaneswar transit hubs</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {nearbyStops.map((stop) => (
                <StitchJourneyCard
                  key={stop.stop_id}
                  userLocationName={activeLocationLabel}
                  locationType={locationType}
                  stop={stop}
                  onViewOnMap={(st) => {
                    onNavigateToMap?.(st.latitude, st.longitude, st.name);
                  }}
                  onAddToTrip={(st, rt) => {
                    onAddStopToTrip?.(st.name, rt?.route_number);
                  }}
                  onOpenRouteDetail={handleOpenRouteDetail}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Route Detail Modal */}
      {activeRouteDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] border border-[#E5DFD5] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E5DFD5] bg-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#B87B22]">
                  <span className="material-symbols-outlined text-sm">directions_bus</span>
                  <span>Mo Bus Route {activeRouteDetail.route_number}</span>
                  <span className="text-[#70798B]">• {activeRouteDetail.service_area || 'Odisha'}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-[#12161E] mt-1">
                  {activeRouteDetail.origin || 'Origin'} → {activeRouteDetail.destination || 'Destination'}
                </h3>
                {activeRouteDetail.route_name && (
                  <p className="text-xs text-[#70798B] mt-0.5">{activeRouteDetail.route_name}</p>
                )}
              </div>
              <button
                onClick={() => setActiveRouteDetail(null)}
                className="p-2 rounded-lg text-[#70798B] hover:text-[#12161E] hover:bg-[#FAF7F2] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Schedules Section */}
              {activeRouteDetail.schedules && activeRouteDetail.schedules.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#70798B] font-semibold mb-3">
                    Scheduled Departure Timings
                  </h4>
                  <div className="space-y-3">
                    {activeRouteDetail.schedules.map((grp) => (
                      <div key={grp.group_id} className="bg-white p-3 rounded-xl border border-[#E5DFD5] text-xs">
                        <div className="font-semibold text-[#12161E] mb-2 flex items-center justify-between">
                          <span>{grp.direction || 'Standard Route'}</span>
                          <span className="text-[11px] font-mono text-[#70798B]">{grp.trips_count} trips daily</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {grp.departure_times.map((dep, idx) => (
                            <span key={idx} className="bg-[#FAF7F2] px-2 py-0.5 rounded font-mono text-[11px] text-[#12161E] border border-[#E5DFD5] font-semibold">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stop Sequence */}
              {activeRouteDetail.stops && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#70798B] font-semibold mb-3">
                    Ordered Route Stops ({activeRouteDetail.stops.length})
                  </h4>
                  <div className="bg-white rounded-xl border border-[#E5DFD5] divide-y divide-[#E5DFD5]">
                    {activeRouteDetail.stops.map((st) => (
                      <div key={st.stop_id} className="p-3 flex items-center justify-between text-xs font-body">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#FAF7F2] text-[#70798B] flex items-center justify-center font-mono text-[10px] font-bold">
                            {st.sequence_order}
                          </span>
                          <span className="font-medium text-[#12161E]">{st.stop_name}</span>
                        </div>
                        {st.coordinate_status === 'geocoded' ? (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                            GPS Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#70798B] bg-[#FAF7F2] px-2 py-0.5 rounded-full">
                            Sequence Only
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
