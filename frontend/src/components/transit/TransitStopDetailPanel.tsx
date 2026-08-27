import React, { useState, useMemo } from 'react';
import { useLocation } from '../../context/LocationContext';
import { calculateHaversineDistanceKm, formatDistance, calculateWalkTimeMinutes, formatDuration } from '../../utils/geoUtils';
import { ODISHA_ESSENTIALS, type EssentialPlace } from '../../data/odishaEssentials';
import { VERIFIED_TRANSIT_TIMETABLES } from '../../data/transitTimetables';
import type { VerifiedTransitStop } from '../../data/staticTransitStops';

export interface TransitStopDetailPanelProps {
  stop: VerifiedTransitStop;
  onClose: () => void;
  onSelectRoute?: (routeNumber: string) => void;
  onOpenTimetable?: (routeNumber: string) => void;
  onDrawRouteToStop?: (stop: VerifiedTransitStop) => void;
}

export const TransitStopDetailPanel: React.FC<TransitStopDetailPanelProps> = ({
  stop,
  onClose,
  onSelectRoute,
  onOpenTimetable,
  onDrawRouteToStop,
}) => {
  const { currentPosition } = useLocation();
  const [activeTab, setActiveTab] = useState<'routes' | 'food' | 'hotels' | 'medical' | 'atms'>('routes');

  // Walking distance from user position
  const distanceKm = useMemo(() => {
    if (currentPosition?.lat != null && currentPosition?.lon != null) {
      return calculateHaversineDistanceKm(currentPosition.lat, currentPosition.lon, stop.latitude, stop.longitude);
    }
    return null;
  }, [currentPosition, stop.latitude, stop.longitude]);

  const walkMins = distanceKm != null ? calculateWalkTimeMinutes(distanceKm) : null;

  // Nearby amenities around this stop
  const nearbyFood = useMemo(() => {
    return ODISHA_ESSENTIALS.filter((e) => e.category === 'restaurant')
      .map((item) => ({
        ...item,
        distFromStop: calculateHaversineDistanceKm(stop.latitude, stop.longitude, item.lat, item.lon),
      }))
      .sort((a, b) => a.distFromStop - b.distFromStop)
      .slice(0, 4);
  }, [stop.latitude, stop.longitude]);

  const nearbyHotels = useMemo(() => {
    return ODISHA_ESSENTIALS.filter((e) => e.category === 'hotel')
      .map((item) => ({
        ...item,
        distFromStop: calculateHaversineDistanceKm(stop.latitude, stop.longitude, item.lat, item.lon),
      }))
      .sort((a, b) => a.distFromStop - b.distFromStop)
      .slice(0, 4);
  }, [stop.latitude, stop.longitude]);

  const nearbyMedical = useMemo(() => {
    return ODISHA_ESSENTIALS.filter((e) => e.category === 'hospital' || e.category === 'pharmacy')
      .map((item) => ({
        ...item,
        distFromStop: calculateHaversineDistanceKm(stop.latitude, stop.longitude, item.lat, item.lon),
      }))
      .sort((a, b) => a.distFromStop - b.distFromStop)
      .slice(0, 3);
  }, [stop.latitude, stop.longitude]);

  const nearbyAtms = useMemo(() => {
    return ODISHA_ESSENTIALS.filter((e) => e.category === 'atm')
      .map((item) => ({
        ...item,
        distFromStop: calculateHaversineDistanceKm(stop.latitude, stop.longitude, item.lat, item.lon),
      }))
      .sort((a, b) => a.distFromStop - b.distFromStop)
      .slice(0, 3);
  }, [stop.latitude, stop.longitude]);

  return (
    <div
      data-testid="transit-stop-detail-panel"
      className="bg-white/95 backdrop-blur-md border border-[#E5DFD5] p-5 rounded-2xl shadow-xl max-w-sm w-full font-body text-[#12161E] animate-in slide-in-from-bottom duration-200"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1B5E6B] px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
              🚌 CRUT Ama Bus Stop
            </span>
          </div>
          <h3 className="font-display font-bold text-base text-[#12161E]">{stop.name}</h3>
          <p className="text-xs text-[#70798B] mt-0.5">{stop.locality}, {stop.city}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close stop details"
          className="text-[#70798B] hover:text-[#12161E] p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      {/* User Proximity Walking Banner */}
      {distanceKm != null && (
        <div className="my-2.5 p-2 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1 text-[#3D4654]">
            <span className="material-symbols-outlined text-sm text-[#1B5E6B]">directions_walk</span>
            <span>~{formatDistance(distanceKm)} away</span>
          </div>
          {walkMins != null && (
            <span className="font-bold text-[#1B5E6B]">~{formatDuration(walkMins)} walk</span>
          )}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#F0EBE1] gap-1 my-3 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => setActiveTab('routes')}
          className={`pb-1.5 px-2 font-medium cursor-pointer border-b-2 transition ${
            activeTab === 'routes' ? 'border-[#1B5E6B] text-[#1B5E6B] font-bold' : 'border-transparent text-[#70798B]'
          }`}
        >
          Routes ({stop.routes_serving_stop.length})
        </button>
        <button
          onClick={() => setActiveTab('food')}
          className={`pb-1.5 px-2 font-medium cursor-pointer border-b-2 transition ${
            activeTab === 'food' ? 'border-[#C05621] text-[#C05621] font-bold' : 'border-transparent text-[#70798B]'
          }`}
        >
          🍴 Food ({nearbyFood.length})
        </button>
        <button
          onClick={() => setActiveTab('hotels')}
          className={`pb-1.5 px-2 font-medium cursor-pointer border-b-2 transition ${
            activeTab === 'hotels' ? 'border-[#8C6239] text-[#8C6239] font-bold' : 'border-transparent text-[#70798B]'
          }`}
        >
          🏨 Hotels ({nearbyHotels.length})
        </button>
        <button
          onClick={() => setActiveTab('medical')}
          className={`pb-1.5 px-2 font-medium cursor-pointer border-b-2 transition ${
            activeTab === 'medical' ? 'border-[#9E2A2B] text-[#9E2A2B] font-bold' : 'border-transparent text-[#70798B]'
          }`}
        >
          🏥 Medical
        </button>
        <button
          onClick={() => setActiveTab('atms')}
          className={`pb-1.5 px-2 font-medium cursor-pointer border-b-2 transition ${
            activeTab === 'atms' ? 'border-[#B87B22] text-[#B87B22] font-bold' : 'border-transparent text-[#70798B]'
          }`}
        >
          🏧 ATMs
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[120px] max-h-[220px] overflow-y-auto space-y-2 text-xs">
        {activeTab === 'routes' && (
          <div className="space-y-2">
            {stop.routes_serving_stop.map((r) => {
              const schedule = VERIFIED_TRANSIT_TIMETABLES[r.route_number];
              return (
                <div
                  key={r.route_id}
                  className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-[#1B5E6B] text-white rounded font-mono font-bold text-[10px]">
                        Route {r.route_number}
                      </span>
                      <span className="font-medium text-[11px] truncate max-w-[150px]">
                        {r.origin} → {r.destination}
                      </span>
                    </div>
                    {schedule && (
                      <p className="text-[10px] text-[#70798B] font-mono mt-1">
                        First: {schedule.first_departure} · Last: {schedule.last_departure} ({schedule.frequency_minutes ? `Every ${schedule.frequency_minutes}m` : 'Scheduled'})
                      </p>
                    )}
                  </div>
                  {onOpenTimetable && (
                    <button
                      onClick={() => onOpenTimetable(r.route_number)}
                      className="px-2 py-1 bg-white border border-[#E5DFD5] rounded-lg text-[10px] font-semibold text-[#1B5E6B] hover:bg-teal-50 transition cursor-pointer"
                    >
                      Timetable
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'food' && (
          <div className="space-y-1.5">
            {nearbyFood.map((f) => (
              <div key={f.id} className="p-2 rounded-lg bg-[#FAF7F2] flex items-center justify-between">
                <div>
                  <span className="font-semibold">{f.name}</span>
                  <p className="text-[10px] text-[#70798B]">{f.cuisine || f.locality}</p>
                </div>
                <span className="font-mono text-[10px] text-[#C05621] font-bold">
                  {formatDistance(f.distFromStop)}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hotels' && (
          <div className="space-y-1.5">
            {nearbyHotels.map((h) => (
              <div key={h.id} className="p-2 rounded-lg bg-[#FAF7F2] flex items-center justify-between">
                <div>
                  <span className="font-semibold">{h.name}</span>
                  <p className="text-[10px] text-[#70798B]">{h.rating ? `★ ${h.rating.toFixed(1)} · ` : ''}{h.locality}</p>
                </div>
                <span className="font-mono text-[10px] text-[#8C6239] font-bold">
                  {formatDistance(h.distFromStop)}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-1.5">
            {nearbyMedical.map((m) => (
              <div key={m.id} className="p-2 rounded-lg bg-[#FAF7F2] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-red-700">{m.name}</span>
                  <p className="text-[10px] text-[#70798B]">{m.is24x7 ? '24/7 Service' : m.locality}</p>
                </div>
                <span className="font-mono text-[10px] text-[#9E2A2B] font-bold">
                  {formatDistance(m.distFromStop)}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'atms' && (
          <div className="space-y-1.5">
            {nearbyAtms.map((a) => (
              <div key={a.id} className="p-2 rounded-lg bg-[#FAF7F2] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-amber-800">{a.name}</span>
                  <p className="text-[10px] text-[#70798B]">{a.bankName || a.locality}</p>
                </div>
                <span className="font-mono text-[10px] text-[#B87B22] font-bold">
                  {formatDistance(a.distFromStop)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Action */}
      {onDrawRouteToStop && (
        <div className="mt-3 pt-2 border-t border-[#F0EBE1]">
          <button
            onClick={() => onDrawRouteToStop(stop)}
            className="w-full py-2 bg-[#1B5E6B] text-white rounded-lg text-xs font-semibold hover:bg-[#144752] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">directions_walk</span>
            <span>Directions to Bus Stop</span>
          </button>
        </div>
      )}
    </div>
  );
};
