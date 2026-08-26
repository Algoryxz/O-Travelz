import React, { useState, useEffect } from 'react';
import type { ImageIdentifyResponse, PlaceMatchCandidate } from '../../types/api';
import { apiClient } from '../../api/client';
import { useLocation } from '../../context/LocationContext';
import { useSavedPlaces } from '../../store/useSavedPlaces';
import { calculateHaversineDistanceKm, formatDistance, isValidCoordinate } from '../../utils/geoUtils';
import type { StitchTab } from '../stitch/StitchNavbar';

interface ImageIdentifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string | null;
  fileName: string | null;
  onNavigate: (tab: StitchTab, params?: Record<string, string>) => void;
}

export const ImageIdentifyModal: React.FC<ImageIdentifyModalProps> = ({
  isOpen,
  onClose,
  imageData,
  fileName,
  onNavigate,
}) => {
  const { currentPosition } = useLocation();
  const { isSaved, toggleSave } = useSavedPlaces();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ImageIdentifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<PlaceMatchCandidate | null>(null);

  const refLat = currentPosition?.lat ?? 20.2667;
  const refLon = currentPosition?.lon ?? 85.8436;

  useEffect(() => {
    if (!isOpen || !imageData) {
      setResponse(null);
      setError(null);
      setSelectedCandidate(null);
      return;
    }

    let isMounted = true;
    const runIdentification = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiClient.identifyPlaceByImage(imageData, fileName || 'upload.jpg');
        if (isMounted) {
          setResponse(result);
          if (result.top_match) {
            setSelectedCandidate(result.top_match);
          } else if (result.candidates.length > 0) {
            setSelectedCandidate(result.candidates[0]);
          }
        }
      } catch (err: any) {
        console.warn('Image identification API error:', err);
        if (isMounted) {
          setError(err?.message || 'Could not analyze image. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    runIdentification();
    return () => {
      isMounted = false;
    };
  }, [isOpen, imageData, fileName]);

  if (!isOpen) return null;

  const activeMatch = selectedCandidate || response?.top_match;
  const matchDistance =
    activeMatch && isValidCoordinate(activeMatch.lat, activeMatch.lon)
      ? formatDistance(calculateHaversineDistanceKm(refLat, refLon, activeMatch.lat!, activeMatch.lon!))
      : null;

  const getTierBadge = (tier: string) => {
    if (tier === 'Likely Match') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#2F523E] bg-[#2F523E]/10 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F523E]"></span>
          <span>Likely Match</span>
        </span>
      );
    }
    if (tier === 'Possible Match') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#B87B22] bg-[#B87B22]/10 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B87B22]"></span>
          <span>Possible Match</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#70798B] bg-[#70798B]/10 px-2.5 py-0.5 rounded-full">
        <span>Uncertain Landmark</span>
      </span>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-identify-modal-title"
      data-testid="image-identify-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12161E]/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl border border-[#E5DFD5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DFD5] bg-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#B87B22]">photo_camera</span>
            <h3 id="image-identify-modal-title" className="font-display font-bold text-lg text-[#12161E]">
              Visual Landmark Identification
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-[#F2EEE7] hover:bg-[#E5DFD5] text-[#70798B] flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Image Preview & Scanner Laser Container */}
          <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-[#12161E] border border-[#E5DFD5] flex items-center justify-center">
            {imageData && (
              <img
                src={imageData}
                alt="Uploaded landmark"
                className="w-full h-full object-cover object-center opacity-90"
              />
            )}

            {/* Glowing Scan Beam Animation while loading */}
            {loading && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-center">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#B87B22] to-transparent shadow-[0_0_15px_#B87B22] animate-bounce"></div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#12161E]/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B87B22] animate-ping"></span>
                  <span>Analyzing Odisha architectural signatures...</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-[#9E2A2B]/30 text-[#9E2A2B] text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* Active Identified Place Match Card */}
          {activeMatch && !loading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getTierBadge(activeMatch.confidence_tier)}
                    {matchDistance && (
                      <span className="text-xs font-mono font-semibold text-[#70798B]">
                        • {matchDistance} away
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#B87B22]">
                    {Math.round(activeMatch.confidence * 100)}% Match
                  </span>
                </div>

                <div>
                  <h4 className="font-display font-bold text-xl sm:text-2xl text-[#12161E]">
                    {activeMatch.name}
                  </h4>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#70798B] mt-0.5">
                    {activeMatch.district} • {activeMatch.category}
                  </p>
                </div>

                <p className="text-xs sm:text-sm font-body text-[#3D4654] leading-relaxed bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DFD5]/60">
                  {activeMatch.reason}
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('map', { placeId: activeMatch.place_id });
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#12161E] hover:bg-[#2A3241] text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-sm">map</span>
                    <span>View on Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('plan', { placeId: activeMatch.place_id });
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>Plan Trip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleSave({
                        id: activeMatch.place_id,
                        name: activeMatch.name,
                        location: activeMatch.district,
                        category: activeMatch.category,
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      isSaved(activeMatch.place_id)
                        ? 'bg-[#2F523E] text-white border-[#2F523E]'
                        : 'bg-white hover:bg-[#FAF7F2] text-[#12161E] border-[#E5DFD5]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isSaved(activeMatch.place_id) ? 'bookmark_added' : 'bookmark_border'}
                    </span>
                    <span>{isSaved(activeMatch.place_id) ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Alternative Candidates */}
              {response?.candidates && response.candidates.length > 1 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#70798B]">
                    Alternative Candidates ({response.candidates.length - 1})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {response.candidates
                      .filter((c) => c.place_id !== activeMatch.place_id)
                      .map((cand) => (
                        <button
                          key={cand.place_id}
                          type="button"
                          onClick={() => setSelectedCandidate(cand)}
                          className="text-left p-3 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E5DFD5] hover:border-[#B87B22]/40 transition-colors cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-bold text-[#12161E]">{cand.district}</span>
                            <span className="text-[#B87B22] font-bold">
                              {Math.round(cand.confidence * 100)}%
                            </span>
                          </div>
                          <h5 className="font-display font-bold text-xs text-[#12161E] truncate">
                            {cand.name}
                          </h5>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
