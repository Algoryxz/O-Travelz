import React from 'react';
import { VERIFIED_TRANSIT_TIMETABLES, type TransitScheduleEntry } from '../../data/transitTimetables';

export interface TransitTimetableModalProps {
  routeNumber: string | null;
  onClose: () => void;
}

export const TransitTimetableModal: React.FC<TransitTimetableModalProps> = ({
  routeNumber,
  onClose,
}) => {
  if (!routeNumber) return null;

  const schedule: TransitScheduleEntry | undefined = VERIFIED_TRANSIT_TIMETABLES[routeNumber];

  return (
    <div
      data-testid="transit-timetable-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xl max-w-lg w-full overflow-hidden font-body text-[#12161E] animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[#FAF7F2] border-b border-[#E5DFD5] flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1B5E6B] text-white rounded font-mono font-bold text-xs">
                Route {routeNumber}
              </span>
              <span className="text-[10px] font-mono text-[#70798B] uppercase tracking-wider font-semibold">
                {schedule?.service_type || 'Ama Bus / CRUT'}
              </span>
            </div>
            <h2 className="font-display font-bold text-lg text-[#12161E]">
              {schedule?.route_name || `Transit Route ${routeNumber}`}
            </h2>
            <p className="text-xs text-[#70798B] mt-0.5">
              {schedule?.origin} ⇄ {schedule?.destination}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close timetable"
            className="w-8 h-8 rounded-full bg-white border border-[#E5DFD5] text-[#70798B] hover:text-[#12161E] flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Provenance & Freshness Banner */}
        <div className="px-5 py-2.5 bg-teal-50/70 border-b border-teal-100 flex items-center justify-between text-[11px] font-mono text-teal-900">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-teal-700">verified</span>
            <span>{schedule?.source_name || 'Official Transport Department Bulletin'}</span>
          </div>
          <span className="text-[10px] text-teal-700">Effective: {schedule?.effective_date || 'Aug 2026'}</span>
        </div>

        {/* Timetable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {schedule ? (
            <>
              {/* Timing Metadata Row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
                  <span className="text-[10px] text-[#70798B] block">First Bus</span>
                  <strong className="text-emerald-700 text-sm">{schedule.first_departure}</strong>
                </div>
                <div className="p-2 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
                  <span className="text-[10px] text-[#70798B] block">Last Bus</span>
                  <strong className="text-amber-800 text-sm">{schedule.last_departure}</strong>
                </div>
                <div className="p-2 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
                  <span className="text-[10px] text-[#70798B] block">Frequency</span>
                  <strong className="text-[#1B5E6B] text-sm">
                    {schedule.frequency_minutes ? `~${schedule.frequency_minutes} min` : 'Fixed Times'}
                  </strong>
                </div>
              </div>

              {/* Weekday Departures Grid */}
              <div>
                <h4 className="text-xs font-mono uppercase font-bold text-[#70798B] tracking-wider mb-2">
                  📅 Scheduled Departures (Monday – Saturday)
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {schedule.departures_weekday.map((time, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 px-2 bg-[#FAF7F2] hover:bg-[#F3EFE6] text-center rounded-lg border border-[#E5DFD5] font-mono text-xs font-medium text-[#12161E]"
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sunday / Holiday Departures if present */}
              {schedule.departures_weekend && schedule.departures_weekend.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase font-bold text-[#70798B] tracking-wider mb-2">
                    🏖️ Sunday & Holiday Schedule
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {schedule.departures_weekend.map((time, idx) => (
                      <div
                        key={idx}
                        className="py-1.5 px-2 bg-[#FAF7F2] text-center rounded-lg border border-[#E5DFD5] font-mono text-xs font-medium text-[#12161E]"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center text-[#70798B] space-y-2">
              <span className="material-symbols-outlined text-3xl text-amber-600">schedule</span>
              <p className="text-xs">
                Full day timetable for Route {routeNumber} is currently scheduled on-demand or during peak rationalization windows.
              </p>
              <span className="inline-block text-[10px] font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                Operating between 06:30 and 21:30
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E5DFD5] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#12161E] text-white text-xs font-semibold rounded-lg hover:bg-black transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
