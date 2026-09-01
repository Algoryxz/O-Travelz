import React, { useEffect, useState } from 'react';
import type {
  ServingRouteSummary,
  NearbyStopResponse,
  CorridorFoodCandidate,
  CorridorFoodResponse,
  JourneyPlanResponse,
} from '../../types/api';
import { apiClient } from '../../api/client';

export interface StitchJourneyPreferences {
  includeFood: boolean;
  dietaryTag?: string;
  cuisine?: string;
  minimizeDetour: boolean;
}

export interface StitchJourneyCardProps {
  userLocationName: string;
  locationType?: 'LIVE_GPS' | 'MANUAL_LOCATION' | 'VERIFIED_DEFAULT_HUB' | 'UNRESOLVED';
  stop?: NearbyStopResponse | null;
  selectedRoute?: ServingRouteSummary | null;
  plannedJourney?: JourneyPlanResponse | null;
  preferences?: StitchJourneyPreferences;
  onUpdatePreferences?: (prefs: Partial<StitchJourneyPreferences>) => void;
  onSelectRoute?: (route: ServingRouteSummary) => void;
  onViewOnMap?: (stop: NearbyStopResponse, route?: ServingRouteSummary) => void;
  onAddToTrip?: (stop: NearbyStopResponse, route?: ServingRouteSummary) => void;
  onOpenRouteDetail?: (routeId: string) => void;
  onViewFoodOnMap?: (candidate: CorridorFoodCandidate) => void;
  onAddFoodToTrip?: (candidate: CorridorFoodCandidate) => void;
  onViewPlannedJourneyOnMap?: (journey: JourneyPlanResponse) => void;
  onAddPlannedJourneyToTrip?: (journey: JourneyPlanResponse) => void;
}

export const StitchJourneyCard: React.FC<StitchJourneyCardProps> = ({
  userLocationName,
  locationType = 'LIVE_GPS',
  stop,
  selectedRoute,
  plannedJourney,
  preferences = { includeFood: true, minimizeDetour: false },
  onUpdatePreferences,
  onSelectRoute,
  onViewOnMap,
  onAddToTrip,
  onOpenRouteDetail,
  onViewFoodOnMap,
  onAddFoodToTrip,
  onViewPlannedJourneyOnMap,
  onAddPlannedJourneyToTrip,
}) => {
  const routes = stop?.routes_serving_stop || [];
  const activeRoute = selectedRoute || (routes.length > 0 ? routes[0] : null);

  const [corridorFood, setCorridorFood] = useState<CorridorFoodCandidate[]>([]);
  const [loadingFood, setLoadingFood] = useState<boolean>(false);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    if (activeRoute?.route_id && !plannedJourney) {
      setLoadingFood(true);
      apiClient
        .getCorridorFood(activeRoute.route_id, {
          limit: 5,
          dietaryTag: preferences.dietaryTag,
          cuisine: preferences.cuisine,
          maxDistanceM: preferences.minimizeDetour ? 300 : 2500,
        })
        .then((res: CorridorFoodResponse) => {
          if (isMounted) {
            setCorridorFood(res.candidates || []);
            setSelectedFoodIndex(0);
          }
        })
        .catch(() => {
          if (isMounted) {
            setCorridorFood([]);
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoadingFood(false);
          }
        });
    } else {
      setCorridorFood([]);
    }
    return () => {
      isMounted = false;
    };
  }, [activeRoute?.route_id, plannedJourney, preferences.dietaryTag, preferences.cuisine, preferences.minimizeDetour]);

  // Mode 1: Planned Multimodal Journey Render
  if (plannedJourney) {
    // Handle Explicit Non-Success Statuses
    if (plannedJourney.status !== 'SUCCESS') {
      return (
        <div className="bg-white border border-[#E5DFD5] rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B87B22] font-semibold">
            <span className="material-symbols-outlined text-base">info</span>
            <span>Journey Notice • {plannedJourney.status}</span>
          </div>

          <h3 className="text-lg font-display font-bold text-[#12161E]">
            {plannedJourney.status === 'NO_VERIFIED_BOARDING_STOP'
              ? 'No Verified Transit Stop Within Walking Distance'
              : plannedJourney.status === 'DESTINATION_UNREACHABLE'
              ? 'Destination Not Reachable via Verified Transit'
              : plannedJourney.status === 'NO_TRANSIT_PATH'
              ? 'No Direct Transit Route Between Stops'
              : 'Transit Route Currently Unavailable'}
          </h3>

          <p className="text-xs text-[#70798B] font-body leading-relaxed">
            {plannedJourney.warnings && plannedJourney.warnings.length > 0
              ? plannedJourney.warnings.join(' ')
              : 'Please choose an alternate starting hub or nearby destination with verified transit coverage.'}
          </p>

          <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-between text-xs font-mono text-[#70798B]">
            <span>Origin: {plannedJourney.origin.resolved_name || userLocationName}</span>
          </div>
        </div>
      );
    }

    const tLeg = plannedJourney.transit_legs[0];
    const walk1 = plannedJourney.walking_legs[0];
    const walk2 = plannedJourney.walking_legs[1];
    const fw = plannedJourney.food_waypoint;

    return (
      <div className="bg-white border border-[#E5DFD5] rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300">
        {/* Header: Journey Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E5DFD5]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B87B22] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Planned Multimodal Journey</span>
              {plannedJourney.journey_type === '1_transfer' && (
                <span className="bg-[#B87B22]/15 text-[#B87B22] px-1.5 py-0.5 rounded text-[10px] font-bold">1 Transfer</span>
              )}
              <span className="text-[#70798B]">• {locationType.replace(/_/g, ' ')}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-bold text-[#12161E] mt-1">
              {plannedJourney.origin.resolved_name || 'Origin'} <span className="text-[#B87B22]">→</span> {plannedJourney.destination.resolved_name || 'Destination'}
            </h3>
            {plannedJourney.departure_time && plannedJourney.estimated_arrival_time && (
              <div className="text-xs font-mono text-[#B87B22] mt-1 font-semibold">
                Depart: {plannedJourney.departure_time} • Arrive: {plannedJourney.estimated_arrival_time}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#E5DFD5] px-3.5 py-1.5 rounded-full text-xs font-mono self-start sm:self-auto">
              <span className="material-symbols-outlined text-[#B87B22] text-sm">schedule</span>
              <span className="font-semibold text-[#12161E]">~{plannedJourney.total_estimated_duration_minutes} min total</span>
            </div>
            {plannedJourney.transfer_count === 1 && plannedJourney.transfer_hub && (
              <span className="text-[10px] font-mono text-[#70798B] self-start sm:self-auto">
                Via: {plannedJourney.transfer_hub} (~{plannedJourney.transfer_wait_minutes || 10}m transfer)
              </span>
            )}
          </div>
        </div>

        {/* Preference Filter Controls */}
        <div className="py-3 px-3.5 mt-4 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#70798B]">Preferences:</span>
            <button
              onClick={() => onUpdatePreferences?.({ includeFood: !preferences.includeFood })}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer text-[11px] ${
                preferences.includeFood
                  ? 'bg-[#B87B22] text-white border-[#B87B22]'
                  : 'bg-white text-[#70798B] border-[#E5DFD5]'
              }`}
            >
              {preferences.includeFood ? '🍴 Food Included' : '⏩ Skip Food'}
            </button>

            {preferences.includeFood && (
              <button
                onClick={() => onUpdatePreferences?.({ minimizeDetour: !preferences.minimizeDetour })}
                className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer text-[11px] ${
                  preferences.minimizeDetour
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-[#70798B] border-[#E5DFD5]'
                }`}
              >
                {preferences.minimizeDetour ? '⚡ Direct Only' : '↔ Detour OK'}
              </button>
            )}

            {preferences.dietaryTag && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-semibold">
                {preferences.dietaryTag === 'vegetarian' ? '🥦 Veg Only' : preferences.dietaryTag}
              </span>
            )}
          </div>
        </div>

        {/* Vertical Journey Timeline */}
        <div className="py-6 relative">
          <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#B87B22] via-[#12161E] to-[#B87B22]">
            {/* Step 1: Origin */}
            <div className="flex items-start gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-[#B87B22]/15 text-[#B87B22] border-2 border-[#B87B22] flex items-center justify-center shrink-0 z-10 bg-white">
                <span className="material-symbols-outlined text-sm">trip_origin</span>
              </div>
              <div className="flex-1 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#70798B]">Starting Point</div>
                <div className="text-sm font-semibold text-[#12161E]">{plannedJourney.origin.resolved_name || userLocationName}</div>
              </div>
            </div>

            {/* Step 2: Walking Leg 1 */}
            {walk1 && (
              <div className="flex items-start gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#70798B] border border-[#E5DFD5] flex items-center justify-center shrink-0 z-10 bg-white">
                  <span className="material-symbols-outlined text-sm">directions_walk</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-xs text-[#70798B] font-body">
                    Walk <span className="font-semibold text-[#12161E]">{walk1.distance_m}m</span> to <span className="font-medium text-[#12161E]">{walk1.to_name}</span> (~{walk1.estimated_duration_mins} min)
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Transit Leg(s) */}
            {plannedJourney.transit_legs.map((leg, lIdx) => (
              <div key={leg.route_id || lIdx} className="space-y-4">
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-[#12161E] text-white border-2 border-[#12161E] flex items-center justify-center shrink-0 z-10">
                    <span className="material-symbols-outlined text-sm">directions_bus</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl p-4 text-xs font-body">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#B87B22] font-semibold mb-1">
                        Board Transit • Mo Bus Route {leg.route_number}
                      </div>
                      <div className="flex items-center justify-between font-semibold text-[#12161E] mb-1">
                        <span className="font-mono text-sm text-[#12161E]">Route {leg.route_number}</span>
                        <span className="text-[11px] font-mono text-[#70798B]">
                          {(leg as any).stops_in_between ?? (leg as any).stop_count ?? 0} stops (~{(leg as any).estimated_duration_mins ?? (leg as any).estimated_transit_mins ?? 0} min)
                        </span>
                      </div>
                      <div className="text-xs text-[#12161E]">
                        Board at <span className="font-semibold">{leg.boarding_stop_name}</span> → Alight at <span className="font-semibold">{leg.alighting_stop_name}</span>
                      </div>
                      {(leg as any).scheduled_departures && (leg as any).scheduled_departures.length > 0 && (
                        <div className="mt-2 text-[11px] font-mono text-[#70798B] flex flex-wrap gap-1 items-center">
                          <span>Departures:</span>
                          {(leg as any).scheduled_departures.map((dep: string, di: number) => (
                            <span key={di} className="bg-white px-1.5 py-0.5 rounded border border-[#E5DFD5] text-[#12161E] font-semibold">
                              {dep}
                            </span>
                          ))}
                        </div>
                      )}
                      {leg.service_area && (
                        <div className="mt-1 text-[11px] font-mono text-[#70798B]">Region: {leg.service_area}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transfer Hub Indicator if multi-leg */}
                {plannedJourney.transfer_count === 1 && lIdx === 0 && (
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-[#B87B22]/20 text-[#B87B22] border-2 border-[#B87B22] flex items-center justify-center shrink-0 z-10 bg-white">
                      <span className="material-symbols-outlined text-sm">sync_alt</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-xs text-[#B87B22] font-mono font-semibold">
                        Transfer at {plannedJourney.transfer_hub} (~{plannedJourney.transfer_wait_minutes || 10} min buffer)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Optional Food Waypoint */}
            {fw && (
              <div className="flex items-start gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-[#B87B22]/15 text-[#B87B22] border-2 border-[#B87B22] flex items-center justify-center shrink-0 z-10 bg-white">
                  <span className="material-symbols-outlined text-sm">restaurant</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="bg-[#FAF7F2] border border-[#B87B22]/30 rounded-xl p-4 text-xs font-body">
                    <div className="flex items-center justify-between font-semibold text-[#12161E]">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#B87B22] font-bold">
                          Food Waypoint on Corridor
                        </div>
                        <span className="text-sm font-display font-bold">{fw.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        {fw.corridor_status === 'ON_ROUTE' ? 'On Route • 0 min detour' : fw.corridor_status}
                      </span>
                    </div>
                    <p className="text-[#70798B] mt-1">{fw.cuisine} {(fw as any).locality ? `• ${(fw as any).locality}` : ''}</p>
                    {fw.speciality_dishes && fw.speciality_dishes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {fw.speciality_dishes.map((dish, i) => (
                          <span key={i} className="bg-[#B87B22]/10 text-[#B87B22] px-2 py-0.5 rounded text-[11px]">
                            {dish}
                          </span>
                        ))}
                      </div>
                    )}
                    {fw.source && (
                      <div className="mt-2 pt-1.5 border-t border-[#E5DFD5] text-[10px] font-mono text-[#70798B]">
                        Source: {fw.source}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Final Walking Leg */}
            {walk2 && (
              <div className="flex items-start gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#70798B] border border-[#E5DFD5] flex items-center justify-center shrink-0 z-10 bg-white">
                  <span className="material-symbols-outlined text-sm">directions_walk</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-xs text-[#70798B] font-body">
                    Walk <span className="font-semibold text-[#12161E]">{walk2.distance_m}m</span> to <span className="font-medium text-[#12161E]">{walk2.to_name}</span> (~{walk2.estimated_duration_mins} min)
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Final Destination */}
            <div className="flex items-start gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-[#12161E] text-white border-2 border-[#12161E] flex items-center justify-center shrink-0 z-10">
                <span className="material-symbols-outlined text-sm">flag</span>
              </div>
              <div className="flex-1 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#70798B]">Destination</div>
                <div className="text-sm font-semibold text-[#12161E]">
                  {plannedJourney.destination.resolved_name || 'Destination Point'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {plannedJourney.warnings && plannedJourney.warnings.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-body">
            {plannedJourney.warnings.join(' ')}
          </div>
        )}

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#E5DFD5]">
          <button
            onClick={() => onViewPlannedJourneyOnMap?.(plannedJourney)}
            className="w-full sm:flex-1 bg-[#12161E] hover:bg-[#2A3447] text-white py-2.5 px-4 rounded-xl text-xs font-semibold font-body transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            <span>View Journey on Map</span>
          </button>

          <button
            onClick={() => onAddPlannedJourneyToTrip?.(plannedJourney)}
            className="w-full sm:w-auto bg-[#FAF7F2] hover:bg-[#E5DFD5] text-[#12161E] border border-[#E5DFD5] py-2.5 px-4 rounded-xl text-xs font-semibold font-body transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">bookmark_add</span>
            <span>Save Itinerary Leg</span>
          </button>
        </div>
      </div>
    );
  }

  // Mode 2: Stop & Route Exploration Render
  if (!stop) {
    return null;
  }

  const activeFood = corridorFood.length > 0 ? corridorFood[selectedFoodIndex] : null;

  return (
    <div className="bg-white border border-[#E5DFD5] rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300">
      {/* Header: Stop & Live Distance Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B87B22] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#B87B22]"></span>
            <span>Transit Stop</span>
            <span className="text-[#70798B]">• {stop.city || 'Odisha'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-[#12161E] mt-1">
            {stop.name}
          </h3>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#E5DFD5] px-3.5 py-1.5 rounded-full text-xs font-mono self-start sm:self-auto">
          {stop.distance_m > 1500 ? (
            <>
              <span className="material-symbols-outlined text-[#B87B22] text-sm">local_taxi</span>
              <span className="font-semibold text-[#12161E]">{(stop.distance_m / 1000).toFixed(1)} km</span>
              <span className="text-[#70798B]">(Auto / cab recommended)</span>
            </>
          ) : stop.distance_m > 800 ? (
            <>
              <span className="material-symbols-outlined text-[#B87B22] text-sm">directions_walk</span>
              <span className="font-semibold text-[#12161E]">{(stop.distance_m / 1000).toFixed(1)} km away</span>
              <span className="text-[#70798B]">· walk or short auto</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[#B87B22] text-sm">directions_walk</span>
              <span className="font-semibold text-[#12161E]">{stop.distance_m} m</span>
              <span className="text-[#70798B]">({stop.walking_estimate_mins} min walk)</span>
            </>
          )}
        </div>
      </div>

      {/* Editorial Vertical Journey Timeline */}
      <div className="py-6 relative">
        <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#B87B22] via-[#12161E] to-[#B87B22]">
          {/* Step 1: User GPS Location */}
          <div className="flex items-start gap-4 relative">
            <div className="w-8 h-8 rounded-full bg-[#B87B22]/15 text-[#B87B22] border-2 border-[#B87B22] flex items-center justify-center shrink-0 z-10 bg-white">
              <span className="material-symbols-outlined text-sm">my_location</span>
            </div>
            <div className="flex-1 pt-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#70798B]">Your Location</div>
              <div className="text-sm font-semibold text-[#12161E]">{userLocationName}</div>
            </div>
          </div>

          {/* Step 2: First-Mile Leg */}
          <div className="flex items-start gap-4 relative">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#70798B] border border-[#E5DFD5] flex items-center justify-center shrink-0 z-10 bg-white">
              <span className="material-symbols-outlined text-sm">
                {stop.distance_m > 1500 ? 'local_taxi' : 'directions_walk'}
              </span>
            </div>
            <div className="flex-1 pt-1">
              <div className="text-xs text-[#70798B] font-body">
                {stop.distance_m > 1500 ? (
                  <>First mile: <span className="font-semibold text-[#12161E]">Auto / cab recommended</span> · {(stop.distance_m / 1000).toFixed(1)} km to {stop.name}</>
                ) : stop.distance_m > 800 ? (
                  <><span className="font-semibold text-[#12161E]">{(stop.distance_m / 1000).toFixed(1)} km away</span> · walk or short auto to {stop.name}</>
                ) : (
                  <>Walk <span className="font-semibold text-[#12161E]">{stop.distance_m} m</span> to {stop.name} (~{stop.walking_estimate_mins} min)</>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Board Transit Leg */}
          <div className="flex items-start gap-4 relative">
            <div className="w-8 h-8 rounded-full bg-[#12161E] text-white border-2 border-[#12161E] flex items-center justify-center shrink-0 z-10">
              <span className="material-symbols-outlined text-sm">directions_bus</span>
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#B87B22] font-semibold">
                  Board Transit
                </div>
                <span className="text-[11px] font-mono text-[#70798B]">{`${routes.length} ${routes.length === 1 ? 'route' : 'routes'} serving this stop`}</span>
              </div>

              {routes.length === 0 ? (
                <div className="mt-2.5 p-3 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl text-xs text-[#70798B]">
                  No practical public-transit boarding option nearby. Auto/cab is recommended for this leg.
                </div>
              ) : (
                /* Route Selector Pills */
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {routes.map((r) => {
                    const isSelected = activeRoute?.route_id === r.route_id;
                    return (
                      <button
                        key={r.route_id}
                        onClick={() => onSelectRoute?.(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-[#12161E] text-white border-[#12161E] shadow-sm'
                            : 'bg-[#FAF7F2] text-[#12161E] border-[#E5DFD5] hover:border-[#B87B22]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">directions_bus</span>
                        <span>Route {r.route_number}</span>
                      </button>
                    );
                  })}
                </div>
              )}


              {/* Active Route Details Card */}
              {activeRoute && (
                <div className="mt-3.5 bg-[#FAF7F2] border border-[#E5DFD5] rounded-xl p-3.5 text-xs font-body">
                  <div className="flex items-center justify-between font-semibold text-[#12161E]">
                    <span className="font-mono text-[#B87B22]">Mo Bus {activeRoute.route_number}</span>
                    <span className="text-[11px] font-mono text-[#70798B]">Seq #{activeRoute.sequence_order}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#12161E]">
                    {activeRoute.origin || 'Origin'} <span className="text-[#B87B22]">→</span> {activeRoute.destination || 'Destination'}
                  </div>
                  {activeRoute.route_name && (
                    <div className="mt-1 text-xs text-[#70798B] truncate">
                      {activeRoute.route_name}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E5DFD5]">
                    <button
                      onClick={() => onOpenRouteDetail?.(activeRoute.route_id)}
                      className="text-[#B87B22] hover:underline font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full Timetable &amp; Stops</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Optional Corridor Food Waypoint */}
          {activeRoute && (
            <div className="flex items-start gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-[#B87B22]/15 text-[#B87B22] border-2 border-[#B87B22] flex items-center justify-center shrink-0 z-10 bg-white">
                <span className="material-symbols-outlined text-sm">restaurant</span>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#B87B22] font-semibold flex items-center gap-1.5">
                    <span>Corridor Food Discovery</span>
                    {loadingFood && <span className="w-1.5 h-1.5 rounded-full bg-[#B87B22] animate-ping" />}
                  </div>
                  {corridorFood.length > 1 && (
                    <span className="text-[11px] font-mono text-[#70798B]">
                      {selectedFoodIndex + 1} of {corridorFood.length} along corridor
                    </span>
                  )}
                </div>

                {activeFood ? (
                  <div className="mt-2.5 bg-[#FAF7F2] border border-[#B87B22]/30 rounded-xl p-3.5 text-xs font-body">
                    {/* Top Row: Name and Corridor Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-[#12161E]">
                        {activeFood.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {activeFood.corridor_status === 'ON_ROUTE'
                          ? 'On Route • 0 min detour'
                          : `${activeFood.corridor_status.replace('_', ' ')} • ~${activeFood.estimated_detour_minutes} min`}
                      </span>
                    </div>

                    {/* Cuisine & Locality */}
                    <div className="mt-1 text-xs text-[#70798B]">
                      {activeFood.cuisine || 'Authentic Regional Food'} {activeFood.locality ? `• ${activeFood.locality}` : ''}
                    </div>

                    {/* Speciality Dishes */}
                    {activeFood.speciality_dishes && activeFood.speciality_dishes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {activeFood.speciality_dishes.map((dish, i) => (
                          <span
                            key={i}
                            className="bg-[#B87B22]/10 text-[#B87B22] px-2 py-0.5 rounded-md text-[11px] font-medium"
                          >
                            {dish}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E5DFD5]">
                      <div className="flex items-center gap-2">
                        {corridorFood.length > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedFoodIndex((prev) => (prev > 0 ? prev - 1 : corridorFood.length - 1))}
                              className="px-1.5 py-0.5 rounded bg-white border border-[#E5DFD5] text-[#12161E] text-xs hover:bg-[#FAF7F2]"
                              title="Previous food candidate"
                            >
                              ‹
                            </button>
                            <button
                              onClick={() => setSelectedFoodIndex((prev) => (prev < corridorFood.length - 1 ? prev + 1 : 0))}
                              className="px-1.5 py-0.5 rounded bg-white border border-[#E5DFD5] text-[#12161E] text-xs hover:bg-[#FAF7F2]"
                              title="Next food candidate"
                            >
                              ›
                            </button>
                          </div>
                        )}
                        <span className="text-[10px] font-mono text-[#70798B] truncate max-w-[120px]">
                          {activeFood.source}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewFoodOnMap?.(activeFood)}
                          className="text-[#B87B22] hover:underline font-mono text-[11px] flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">pin_drop</span>
                          <span>View on Map</span>
                        </button>
                        <button
                          onClick={() => onAddFoodToTrip?.(activeFood)}
                          className="text-[#12161E] hover:underline font-mono text-[11px] flex items-center gap-0.5 cursor-pointer font-semibold"
                        >
                          <span className="material-symbols-outlined text-xs">bookmark_add</span>
                          <span>Add Stop</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-[#70798B] italic bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E5DFD5]">
                    {loadingFood ? 'Searching verified corridor culinary places...' : 'No verified food stop found along this corridor.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Final Destination */}
          {activeRoute && (
            <div className="flex items-start gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-[#12161E] text-white border-2 border-[#12161E] flex items-center justify-center shrink-0 z-10">
                <span className="material-symbols-outlined text-sm">flag</span>
              </div>
              <div className="flex-1 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#70798B]">Destination</div>
                <div className="text-sm font-semibold text-[#12161E]">
                  {activeRoute.destination || 'Terminus'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#E5DFD5]">
        <button
          onClick={() => onViewOnMap?.(stop, activeRoute || undefined)}
          className="w-full sm:flex-1 bg-[#12161E] hover:bg-[#2A3447] text-white py-2.5 px-4 rounded-xl text-xs font-semibold font-body transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-sm">map</span>
          <span>View on Map</span>
        </button>

        <button
          onClick={() => onAddToTrip?.(stop, activeRoute || undefined)}
          className="w-full sm:w-auto bg-[#FAF7F2] hover:bg-[#E5DFD5] text-[#12161E] border border-[#E5DFD5] py-2.5 px-4 rounded-xl text-xs font-semibold font-body transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">bookmark_add</span>
          <span>Add to Trip</span>
        </button>
      </div>
    </div>
  );
};
