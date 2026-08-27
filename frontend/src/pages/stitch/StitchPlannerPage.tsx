import React, { useState, useEffect, useMemo } from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';
import { apiClient } from '../../api/client';
import { useRegisterAIContext } from '../../context/AIContext';
import type { ItineraryPlanResponse, PlaceDetail, GroundedConversationResponse } from '../../api/contracts';
import { CopilotItineraryCard } from '../../components/ai/CopilotItineraryCard';
import { getFoodExperiencesForRegion, ODISHA_EXPERIENCES, type OdishaExperience } from '../../data/odishaExperiences';
import { getCategoryFallbackSvg } from '../../utils/imageRegistry';
import { getPlaceImageUrl } from '../../utils/imageService';
import {
  isValidCoordinate,
  calculateHaversineDistanceKm,
  formatDistance,
  getNearbyPlacesWithExpansion,
} from '../../utils/geoUtils';
import { resolveCanonicalPlace } from '../../utils/placeIdentity';


export interface PlanningAnchor {
  placeId: string;
  placeName: string;
  category: string;
  district: string;
  region?: string;
  description?: string;
  lat: number | null;
  lon: number | null;
  imageUrl: string;
  hasValidCoordinates: boolean;
}

export type RouteCoverageTier = 'fully_routed' | 'partial_coverage' | 'nearby_exploration';

interface StitchPlannerPageProps {
  onNavigate: (tab: StitchTab, params?: Record<string, string>) => void;
  onOpenShare?: () => void;
  onOpenOnboarding?: () => void;
  initialPlaceId?: string;
}

const STARTING_HUBS = [
  {
    id: 'bhubaneswar',
    name: 'Bhubaneswar Hub',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe49mA0mm7Qpx5MT7y5Djc1elkDXFDsaNpmLpJ4PY6IgMjNj2zKrp8HaiUzLv0qaau1kssmLlGV_cMihm9Fe4_1yjjN3xBmz3ce-Qm4SC_oKAN8QUDWJ3fx_gXOc2oKzW-dxlJyIROyw2USQwWfx4-YboARQzxLieWAoRy__qL4Jnz968ztd8rV3fItXe9pUNk9oKT35gvx_wASv-SpZRJGWv-AEwHOUuaT67zAwPFqjxh8ed6Ckh-2jw7eySKtp1okPgYLyc5Kms',
    foodTip: 'Ekamra Haat Pakhala & Nimapada Chhena Jhili',
  },
  {
    id: 'puri',
    name: 'Puri Coastal Hub',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX9t5xDnxhIlK3OKNGhyuOS73-1dAaksAFQQG_pMNb3CeRJYrdIV52fSNjxCwpm5iWiVwMIOTQXgUtjezNwOEj-IS3ysi7TasX98BsKC3cBLZBa26cpCBbXhLn0mVFSKHaMjWGTA2cbE7ZJftd49rZYbyWgJllFl6Nf7-rTyfDWLBxdBSGqarYv0Ay8lJ_SUK8OthnJ8c2zJWsx_-ehHOJhObOwcEPlaj9AJMvLx_WHzbsY38-o3lG-mgsq7UIn-1EXddvACeNm0Q',
    foodTip: 'Ananda Bazaar Mahaprasad & Kakatpur Khaja',
  },
  {
    id: 'konark',
    name: 'Konark Heritage Hub',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqOOikBJZ-5aej8Mblj0xhbGmiY5GW8Kj_DZfPgIWPyUvZ5vc_sVEWY7JWPXCXQFb-2br6r-8CWlxMzqLYIwHeuqC4S-BO4olt2McZxM0XMwm60bFF5jTHCJ9RzglXhmXsGtAeSglMXMTLvTeF6ylfKJbb15-N2Q_MhYfOTwaeSmGiir3D4rZv5iaAKQdKSvnn6b27mSb6nL5tXkFAD46fn4NVUcipQQcUR9MuzEOiMzaGlkR4n4fVqdjyPmY_H0PQ4XiMl9yCMb0',
    foodTip: 'Chandrabhaga Fresh Seafood & Cashew Clusters',
  },
  {
    id: 'chilika',
    name: 'Chilika Marine Hub',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBncciVZ_jB169hv_MKF44YxFY_wzB-0nEJAi6vrAnpeouErvxxKFxom7VZ-7VH9-vNrDKxN8ByHJmV0fSwpDCvfWJimHI98mDrHhdQnuSK-QwL88IBCAMCSVoaVGRLgl5O7mtGsbvpmBuHP6F7yMkUsDNRu85F9aKH8KliiglC5e8ZyAzkBtt2vd3fxyF1_cC1PJSxaPskidx5Q5U3hRBdUeDZoLNEobb-CVjWhJsGiP4yU1xS39ATAVvK4PfVW7q626KW5dHZYu0',
    foodTip: 'Satapada Fresh Crab & Jumbo Tiger Prawns',
  }
];

const CATEGORIZED_PASSIONS: { category: string; icon: string; tags: { id: string; label: string }[] }[] = [
  {
    category: 'Nature & Wildlife',
    icon: 'forest',
    tags: [
      { id: 'wildlife', label: 'Wildlife & Tigers' },
      { id: 'nature', label: 'Forests & Sal Canopy' },
      { id: 'waterfall', label: 'Waterfalls' },
      { id: 'lakes', label: 'Lakes & Lagoons' },
      { id: 'birdwatching', label: 'Migratory Birdwatching' },
    ],
  },
  {
    category: 'Heritage & Sacred',
    icon: 'account_balance',
    tags: [
      { id: 'heritage', label: 'Temples & Kalinga Architecture' },
      { id: 'archaeology', label: 'Rock Edicts & Caves' },
      { id: 'history', label: 'Maritime History' },
      { id: 'museums', label: 'Heritage Museums' },
    ],
  },
  {
    category: 'Culture & Living Crafts',
    icon: 'brush',
    tags: [
      { id: 'crafts', label: 'Pattachitra & Raghurajpur Art' },
      { id: 'handlooms', label: 'Sambalpuri & Ikat Handloom' },
      { id: 'applique', label: 'Pipili Applique Lanterns' },
      { id: 'festivals', label: 'Tribal Traditions & Dance' },
    ],
  },
  {
    category: 'Authentic Culinary',
    icon: 'restaurant',
    tags: [
      { id: 'odia_thali', label: 'Odia Thali & Dalma' },
      { id: 'sweets', label: 'Pahala Rasgulla & Chhena Poda' },
      { id: 'seafood', label: 'Chilika Crab & Prawns' },
      { id: 'street_food', label: 'Cuttack Dahibara Aloodum' },
      { id: 'pure_veg', label: 'Temple Mahaprasad' },
    ],
  },
  {
    category: 'Beach & Marine Coast',
    icon: 'waves',
    tags: [
      { id: 'beach', label: 'Blue Flag Beaches' },
      { id: 'sunsets', label: 'Chandrabhaga Sunsets' },
      { id: 'marine', label: 'Irrawaddy Dolphins' },
    ],
  },
  {
    category: 'Adventure & Highlands',
    icon: 'hiking',
    tags: [
      { id: 'trekking', label: 'Deomali Peak Treks' },
      { id: 'coffee', label: 'Daringbadi Coffee Valleys' },
      { id: 'cycling', label: 'Marine Drive Cycling' },
    ],
  },
];

export const StitchPlannerPage: React.FC<StitchPlannerPageProps> = ({
  onNavigate,
  onOpenShare,
  onOpenOnboarding,
  initialPlaceId,
}) => {
  const [places, setPlaces] = useState<PlaceDetail[]>([]);
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [planningAnchor, setPlanningAnchor] = useState<PlanningAnchor | null>(null);
  const [anchorStatusNotice, setAnchorStatusNotice] = useState<string | null>(null);
  const [selectedHub, setSelectedHub] = useState('bhubaneswar');
  const [days, setDays] = useState(3);
  const [selectedPassions, setSelectedPassions] = useState<string[]>(['heritage', 'nature', 'odia_thali']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryPlanResponse | null>(null);
  const [routeCoverage, setRouteCoverage] = useState<RouteCoverageTier>('fully_routed');
  const [plannerError, setPlannerError] = useState<string | null>(null);

  useRegisterAIContext(
    useMemo(
      () => ({
        page: 'planner',
        planner: {
          days,
          start: selectedHub,
          interests: selectedPassions,
          anchor_place: planningAnchor
            ? {
                id: planningAnchor.placeId,
                name: planningAnchor.placeName,
                category: planningAnchor.category,
                district: planningAnchor.district,
              }
            : null,
        },
      }),
      [days, selectedHub, selectedPassions, planningAnchor]
    )
  );

  // AI State

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiResponseData, setAiResponseData] = useState<GroundedConversationResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  // Load canonical places catalog
  useEffect(() => {
    let isMounted = true;
    apiClient
      .listPlaces({ limit: 161 })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPlaces(data);
          setPlacesLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('Planner canonical place list fetch error:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize initialPlaceId when places are available
  useEffect(() => {
    if (!initialPlaceId) {
      setPlanningAnchor(null);
      setAnchorStatusNotice(null);
      return;
    }

    if (placesLoaded && places.length > 0) {
      const match = resolveCanonicalPlace(places, initialPlaceId);

      if (match) {
        const hasValidCoords = isValidCoordinate(match.lat, match.lon);
        const resolvedAnchor: PlanningAnchor = {
          placeId: match.id,
          placeName: match.name,
          category: match.category,
          district: match.district || 'Odisha',
          region: match.region || 'Odisha',
          description: match.description || 'Verified Odisha destination.',
          lat: match.lat ?? null,
          lon: match.lon ?? null,
          imageUrl: (match as any).imageUrl || getPlaceImageUrl(match.name, match.category),
          hasValidCoordinates: hasValidCoords,
        };
        setPlanningAnchor(resolvedAnchor);
        setAnchorStatusNotice(null);

        // Harmonize starting hub to the nearest region if applicable
        const lowerDistrict = (match.district || '').toLowerCase();
        if (lowerDistrict.includes('puri')) {
          setSelectedHub('puri');
        } else if (lowerDistrict.includes('khordha') || lowerDistrict.includes('bhubaneswar') || lowerDistrict.includes('cuttack')) {
          setSelectedHub('bhubaneswar');
        } else if (lowerDistrict.includes('gop') || lowerDistrict.includes('konark')) {
          setSelectedHub('konark');
        }
      } else {
        setPlanningAnchor(null);
        setAnchorStatusNotice(`Specified landmark "${initialPlaceId}" could not be resolved from the verified directory. Exploring from standard starting hub.`);
      }
    }
  }, [initialPlaceId, places, placesLoaded]);

  const togglePassion = (id: string) => {
    setSelectedPassions((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    setPlannerError(null);

    // Case 1: Planning Anchor with Invalid/Missing Coordinates
    if (planningAnchor && !planningAnchor.hasValidCoordinates) {
      setPlannerError(
        `Routed itinerary generation is unavailable for "${planningAnchor.placeName}" because verified geographic coordinates are missing. Please choose another anchor or select a standard starting hub.`
      );
      setIsGenerating(false);
      return;
    }

    // Case 2: Planning Anchor with Valid Coordinates -> Anchor-Aware Geographical Routing
    if (planningAnchor && planningAnchor.hasValidCoordinates) {
      const anchorLat = planningAnchor.lat!;
      const anchorLon = planningAnchor.lon!;

      // Retrieve verified surrounding candidate destinations strictly nearest-first
      const nearbyResult = getNearbyPlacesWithExpansion(places, anchorLat, anchorLon, {
        minResults: Math.max(days * 2, 4),
        radii: [25, 50, 100, 200, 500],
      });

      // Filter other valid candidates excluding the anchor itself
      const viableCandidates = nearbyResult.places.filter(
        (p) => p.id !== planningAnchor.placeId && isValidCoordinate(p.lat, p.lon)
      );

      if (viableCandidates.length === 0 && !isValidCoordinate(planningAnchor.lat, planningAnchor.lon)) {
        setPlannerError(
          `No verified coordinate-bearing places are available within geographic radius of ${planningAnchor.placeName}.`
        );
        setIsGenerating(false);
        return;
      }

      try {
        const result = await apiClient.planItinerary({
          days,
          interests: selectedPassions.length > 0 ? selectedPassions : ['heritage'],
          start: planningAnchor.placeName,
        });

        // Ensure anchor is represented in the output
        if (result && result.days && result.days.length > 0) {
          const firstStop = result.days[0].stops[0];
          if (firstStop && firstStop.place.id !== planningAnchor.placeId) {
            // Prepend anchor to Day 1
            result.days[0].stops.unshift({
              sequence: 1,
              place: {
                id: planningAnchor.placeId,
                name: planningAnchor.placeName,
                category: planningAnchor.category,
                description: planningAnchor.description,
                lat: planningAnchor.lat,
                lon: planningAnchor.lon,
              },
              planned_arrival: '09:00 AM',
              planned_departure: '11:00 AM',
            });
            // Re-sequence Day 1 stops
            result.days[0].stops.forEach((s, idx) => {
              s.sequence = idx + 1;
            });
          }
          setRouteCoverage('fully_routed');
          setGeneratedItinerary(result);
          setIsGenerating(false);
          return;
        }
      } catch (apiErr) {
        console.warn('Direct itinerary API note, synthesizing deterministic anchor plan:', apiErr);
      }

      // Deterministic Client Synthesis fallback using verified coordinates
      const stopsPerDay = 2;
      const daysArray = [];

      for (let dayNum = 1; dayNum <= days; dayNum++) {
        const dayStops = [];
        if (dayNum === 1) {
          // Day 1 Stop 1 is always the selected planning anchor
          dayStops.push({
            sequence: 1,
            place: {
              id: planningAnchor.placeId,
              name: planningAnchor.placeName,
              category: planningAnchor.category,
              description: planningAnchor.description,
              lat: planningAnchor.lat,
              lon: planningAnchor.lon,
            },
            planned_arrival: '09:00 AM',
            planned_departure: '11:30 AM',
          });

          // Day 1 Stop 2 from nearest candidate
          if (viableCandidates.length > 0) {
            const nextPlace = viableCandidates[0];
            dayStops.push({
              sequence: 2,
              place: {
                id: nextPlace.id,
                name: nextPlace.name,
                category: nextPlace.category,
                description: nextPlace.description,
                lat: nextPlace.lat,
                lon: nextPlace.lon,
              },
              planned_arrival: '01:30 PM',
              planned_departure: '04:00 PM',
            });
          }
        } else {
          const startIndex = (dayNum - 1) * stopsPerDay - 1;
          const candidate1 = viableCandidates[startIndex] || viableCandidates[0] || planningAnchor;
          const candidate2 = viableCandidates[startIndex + 1] || viableCandidates[1] || viableCandidates[0];

          dayStops.push({
            sequence: 1,
            place: {
              id: candidate1.id || (candidate1 as any).placeId,
              name: candidate1.name || (candidate1 as any).placeName,
              category: candidate1.category,
              description: candidate1.description,
              lat: candidate1.lat ?? (candidate1 as any).lat ?? null,
              lon: candidate1.lon ?? (candidate1 as any).lon ?? null,
            },
            planned_arrival: '09:30 AM',
            planned_departure: '12:00 PM',
          });

          if (candidate2 && candidate2.name !== candidate1.name) {
            dayStops.push({
              sequence: 2,
              place: {
                id: candidate2.id || (candidate2 as any).placeId,
                name: candidate2.name || (candidate2 as any).placeName,
                category: candidate2.category,
                description: candidate2.description,
                lat: candidate2.lat ?? (candidate2 as any).lat ?? null,
                lon: candidate2.lon ?? (candidate2 as any).lon ?? null,
              },
              planned_arrival: '02:00 PM',
              planned_departure: '04:30 PM',
            });
          }
        }

        // Compute transit hops between stops with true Haversine distance
        const hops = [];
        for (let i = 0; i < dayStops.length - 1; i++) {
          const fromStop = dayStops[i];
          const toStop = dayStops[i + 1];
          const fromCoord = places.find((p) => p.id === fromStop.place.id) || planningAnchor;
          const toCoord = places.find((p) => p.id === toStop.place.id) || viableCandidates[0];

          let distKm = 10;
          if (fromCoord && toCoord && fromCoord.lat != null && fromCoord.lon != null && toCoord.lat != null && toCoord.lon != null) {
            distKm = calculateHaversineDistanceKm(fromCoord.lat, fromCoord.lon, toCoord.lat, toCoord.lon);
          }

          const isWalking = distKm <= 2.0;
          const isLongDistance = distKm > 100;
          const hopMode = isWalking ? 'WALK' : isLongDistance ? 'REGIONAL TRANSIT' : 'TRANSIT';
          const estMinutes = isWalking
            ? Math.round(distKm * 15)
            : isLongDistance
            ? Math.round((distKm / 45) * 60 + 20)
            : Math.round(distKm * 2 + 10);

          hops.push({
            mode: hopMode,
            estimated_minutes: estMinutes,
            from_sequence: fromStop.sequence,
            to_sequence: toStop.sequence,
            legs: [],
            data_tier: 'available' as any,
          });
        }

        daysArray.push({
          day_number: dayNum,
          theme: dayNum === 1 ? `Core Discovery around ${planningAnchor.placeName}` : `Circuit Extension`,
          stops: dayStops,
          hops,
        });
      }

      const synthesizedPlan: ItineraryPlanResponse = {
        itinerary_id: `plan-anchor-${planningAnchor.placeId}-${Date.now().toString(36)}`,
        constraints: {
          days,
          interests: selectedPassions,
          start: planningAnchor.placeName,
        },
        days: daysArray,
        explanation: `Custom multimodal circuit geographically anchored around ${planningAnchor.placeName} (${planningAnchor.district}). Destinations are prioritized nearest-first with genuine coordinate verification.`,
      };

      setRouteCoverage('nearby_exploration');
      setGeneratedItinerary(synthesizedPlan);
      setIsGenerating(false);
      return;
    }

    // Case 3: Generic Planner without planning anchor
    try {
      const result = await apiClient.planItinerary({
        days,
        interests: selectedPassions.length > 0 ? selectedPassions : ['heritage'],
        start: selectedHub,
      });
      setRouteCoverage('fully_routed');
      setGeneratedItinerary(result);
    } catch (err) {
      console.warn('Generic live planner API response note:', err);
      setPlannerError('Could not reach itinerary engine directly. Please verify connectivity or select another hub.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskAi = async (promptText?: string) => {
    const textToSend = promptText || aiPrompt;
    if (!textToSend.trim()) return;

    setAiLoading(true);
    setAiError(null);
    try {
      const contextPrefix = planningAnchor && planningAnchor.hasValidCoordinates
        ? `[Context: Planning around anchor landmark ${planningAnchor.placeName} in ${planningAnchor.district} (${planningAnchor.category}), coordinates: ${planningAnchor.lat}, ${planningAnchor.lon}. Constraints: Provide grounded travel guidance based strictly on verified Odisha locations. Do not invent unverified bus route numbers or unmapped coordinates.] `
        : '[Constraints: Provide grounded travel guidance based strictly on verified Odisha locations.] ';

      const res = await apiClient.converseWithAi({
        messages: [{ role: 'user', content: `${contextPrefix}${textToSend}` }],
        constraints: {
          days,
          interests: selectedPassions,
          start: planningAnchor ? planningAnchor.placeName : selectedHub,
        },
      });
      if (res && res.message) {
        setAiResponse(res.message);
        setAiResponseData(res);
        setLastFailedPrompt(null);
        if (res.itinerary && res.itinerary.days && res.itinerary.days.length > 0) {
          setGeneratedItinerary(res.itinerary);
          setRouteCoverage('fully_routed');
        }
      } else {
        throw new Error('Empty AI response received.');
      }
    } catch (err) {
      setAiError('AI Copilot service is temporarily unavailable. Please verify connectivity or retry your request.');
      setLastFailedPrompt(textToSend);
      setAiPrompt(textToSend); // preserve prompt
    } finally {
      setAiLoading(false);
    }
  };

  const currentHubData = STARTING_HUBS.find((h) => h.id === selectedHub) || STARTING_HUBS[0];
  const activeDistrict = planningAnchor?.district || (selectedHub === 'bhubaneswar' ? 'Bhubaneswar' : selectedHub === 'puri' ? 'Puri' : selectedHub === 'chilika' ? 'Chilika' : 'Odisha');
  const recommendedFoods = getFoodExperiencesForRegion(activeDistrict);

  return (
    <div className="w-full pt-28 pb-24 px-6 md:px-12 max-w-6xl mx-auto space-y-10">
      {/* Hero Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-full">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#B87B22]/10 text-[#B87B22] px-3 py-1 rounded-full text-xs font-mono font-medium mb-3">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span>Deterministic Itinerary Engine</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#12161E] leading-tight mb-3">
            Design Your Odisha Journey
          </h1>
          <p className="text-base md:text-lg text-[#3D4654] font-body leading-relaxed max-w-2xl">
            {planningAnchor
              ? `Centering your itinerary around verified anchor destination: ${planningAnchor.placeName}.`
              : 'Select your starting hub, trip duration, and categorized passions. Our spatial engine crafts the optimal multimodal circuit with integrated culinary stops.'}
          </p>
        </div>

        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className="px-5 py-2.5 bg-white border border-[#E5DFD5] hover:bg-[#F2EEE7] rounded-xl text-xs font-mono text-[#12161E] flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[#B87B22] text-sm">psychology</span>
            <span>Set Traveler Persona</span>
          </button>
        )}
      </header>

      {/* Non-Blocking Status Notice */}
      {anchorStatusNotice && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 font-body shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-700 text-base">info</span>
            <span>{anchorStatusNotice}</span>
          </div>
          <button
            onClick={() => setAnchorStatusNotice(null)}
            className="text-amber-800 hover:text-amber-950 font-mono text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Prominent Planning Around Context Card */}
      {planningAnchor && (
        <section className="bg-white border-2 border-[#B87B22] rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[#E5DFD5] shrink-0 bg-[#F2EEE7]">
                <img
                  src={planningAnchor.imageUrl}
                  alt={planningAnchor.placeName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).onerror = null;
                    (e.currentTarget as HTMLImageElement).src = getCategoryFallbackSvg('heritage', planningAnchor.placeName);
                  }}
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#B87B22] bg-[#B87B22]/10 px-2.5 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-xs">explore</span>
                    <span>Planning Around Selected Destination</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#70798B] bg-[#F2EEE7] px-2 py-0.5 rounded">
                    {planningAnchor.category}
                  </span>
                </div>

                <h2 className="font-display font-bold text-2xl md:text-3xl text-[#12161E] leading-tight truncate">
                  {planningAnchor.placeName}
                </h2>

                <p className="text-xs font-body text-[#3D4654] line-clamp-2 max-w-xl">
                  {planningAnchor.description || 'Verified Odisha destination.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                  <span className="text-[#12161E] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#B87B22]">location_on</span>
                    <span>{planningAnchor.district}</span>
                  </span>

                  {planningAnchor.hasValidCoordinates ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{planningAnchor.lat?.toFixed(3)}° N, {planningAnchor.lon?.toFixed(3)}° E (Geographic Anchor)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-xs text-amber-700">warning</span>
                      <span>Verified Coordinates Missing</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
              <button
                onClick={() => setPlanningAnchor(null)}
                className="px-4 py-2 border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#70798B] hover:text-[#12161E] rounded-xl text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                <span>Clear Anchor</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Planning Section (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Starting Hub or Active Anchor */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5DFD5] p-6 md:p-8 shadow-xs">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-display font-bold text-xl text-[#12161E]">
              {planningAnchor ? '1. Anchor Hub & Region' : '1. Select Starting Hub'}
            </h3>
            <span className="text-xs font-mono text-[#70798B] bg-[#F2EEE7] px-2.5 py-1 rounded">
              Culinary Highlight: {currentHubData.foodTip}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STARTING_HUBS.map((hub) => {
              const isSelected = selectedHub === hub.id;
              return (
                <button
                  key={hub.id}
                  onClick={() => setSelectedHub(hub.id)}
                  className={`relative rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-[#B87B22] shadow-md ring-2 ring-[#B87B22]/20'
                      : 'border-[#E5DFD5] hover:border-[#B87B22]/40'
                  }`}
                >
                  <img
                    alt={hub.name}
                    src={hub.image}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).onerror = null;
                      (e.currentTarget as HTMLImageElement).src = getCategoryFallbackSvg('heritage', hub.name);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                  <div className="absolute bottom-2 left-2.5 right-2 text-white">
                    <p className="font-body font-semibold text-xs leading-tight">{hub.name}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#B87B22] text-white rounded-full w-4 h-4 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Duration Slider */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] p-6 md:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-lg text-[#12161E]">2. Duration</h3>
              <span className="font-mono text-xs text-[#B87B22] font-bold bg-[#B87B22]/10 px-2.5 py-1 rounded">
                {days} {days === 1 ? 'Day' : 'Days'} Circuit
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-[#B87B22] cursor-pointer my-2"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#70798B]">
              <span>1 Day Quick</span>
              <span>3 Days Classic</span>
              <span>14 Days Grand</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5DFD5] text-xs font-body text-[#70798B]">
            {days <= 2
              ? '⚡ Focused express circuit around core heritage monuments.'
              : days <= 5
              ? '🌿 Balanced multimodal journey with coastal & culinary stops.'
              : '🗺️ Grand comprehensive Odisha expedition across multiple highland zones.'}
          </div>
        </div>
      </div>

      {/* Step 3: Categorized Rich Passions */}
      <div className="bg-white rounded-2xl border border-[#E5DFD5] p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b border-[#E5DFD5] pb-4">
          <div>
            <h3 className="font-display font-bold text-xl text-[#12161E]">
              3. Categorized Passions &amp; Culinary Appetites
            </h3>
            <p className="font-body text-xs text-[#70798B] mt-0.5">
              Select what you love to align destination ranking, timing, and authentic food recommendations.
            </p>
          </div>
          <span className="font-mono text-xs text-[#B87B22] font-semibold">
            {selectedPassions.length} Selected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIZED_PASSIONS.map((catGroup) => (
            <div key={catGroup.category} className="bg-[#FBF9F5] border border-[#E5DFD5] p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[#12161E] font-display font-bold text-sm">
                <span className="material-symbols-outlined text-[#B87B22] text-lg">{catGroup.icon}</span>
                <span>{catGroup.category}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {catGroup.tags.map((tag) => {
                  const isSelected = selectedPassions.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => togglePassion(tag.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#B87B22] bg-[#B87B22] text-white font-bold'
                          : 'border-[#E5DFD5] bg-white text-[#3D4654] hover:bg-[#F2EEE7]'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error / Feedback Banner */}
      {plannerError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-body flex items-start gap-2.5 shadow-xs">
          <span className="material-symbols-outlined text-rose-600 text-base shrink-0 mt-0.5">error</span>
          <div>
            <strong className="block font-semibold">Planning Notice</strong>
            <span>{plannerError}</span>
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleGenerateItinerary}
          disabled={isGenerating}
          className="bg-[#B87B22] hover:bg-[#A0691B] text-white font-body text-base font-semibold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
          <span>
            {isGenerating
              ? 'Synthesizing Multimodal Itinerary...'
              : planningAnchor
              ? `Generate Curated ${days}-Day Itinerary Around ${planningAnchor.placeName}`
              : `Generate Curated ${days}-Day Odisha Itinerary`}
          </span>
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </div>

      {/* Generated Itinerary Display */}
      {generatedItinerary && (
        <section className="bg-white border border-[#E5DFD5] rounded-2xl p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E5DFD5] pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-[#B87B22] bg-[#B87B22]/10 px-2.5 py-0.5 rounded font-bold">
                  Synthesized Multi-Day Plan
                </span>
                {routeCoverage === 'fully_routed' ? (
                  <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>Fully Routed Circuit</span>
                  </span>
                ) : routeCoverage === 'partial_coverage' ? (
                  <span className="text-xs font-mono text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    <span>Partial Route Coverage</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono text-sky-900 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                    <span>Nearby Anchor Exploration</span>
                  </span>
                )}
              </div>

              <h2 className="font-display font-bold text-2xl md:text-3xl text-[#12161E] mt-2">
                Your Curated {generatedItinerary.days.length}-Day Odisha Expedition
              </h2>
              <p className="text-xs font-mono text-[#70798B] mt-1">
                {planningAnchor
                  ? `Geographic Anchor: ${planningAnchor.placeName} (${planningAnchor.district}) · Itinerary ID: ${generatedItinerary.itinerary_id}`
                  : `Starting Hub: ${selectedHub.toUpperCase()} · Itinerary ID: ${generatedItinerary.itinerary_id}`}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onOpenShare}
                className="px-4 py-2 bg-white border border-[#E5DFD5] text-[#12161E] rounded-lg text-xs font-semibold hover:bg-[#F2EEE7] flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                <span>Share Itinerary</span>
              </button>
              <button
                onClick={() => onNavigate('map', planningAnchor ? { placeId: planningAnchor.placeId } : undefined)}
                className="px-4 py-2 bg-[#12161E] text-white rounded-lg text-xs font-semibold hover:bg-[#B87B22] flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">map</span>
                <span>View Route on Map</span>
              </button>
            </div>
          </div>

          {/* Explanation */}
          {generatedItinerary.explanation && (
            <div className="bg-[#F2EEE7]/50 border-l-4 border-[#B87B22] p-4 rounded-r-lg text-xs text-[#3D4654] font-body leading-relaxed">
              {generatedItinerary.explanation}
            </div>
          )}

          {/* Days Breakdown */}
          <div className="space-y-8">
            {generatedItinerary.days.map((day, dayIndex) => (
              <div key={day.day_number} className="border border-[#E5DFD5] rounded-xl p-6 bg-[#FBF9F5]/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#B87B22] text-white flex items-center justify-center font-mono font-bold text-xs">
                    {day.day_number}
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#12161E]">
                    Day {day.day_number} {day.theme ? `· ${day.theme}` : ''}
                  </h3>
                </div>

                <div className="space-y-4 pl-4 border-l-2 border-[#E5DFD5] ml-3">
                  {day.stops.map((stop) => (
                    <div key={stop.sequence} className="bg-white border border-[#E5DFD5] p-4 rounded-lg shadow-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="font-display text-base text-[#12161E]">{stop.place.name}</strong>
                          <span className="ml-2 text-[11px] font-mono text-[#70798B] bg-[#F2EEE7] px-2 py-0.5 rounded">
                            {stop.place.category}
                          </span>
                        </div>
                        {stop.planned_arrival && (
                          <span className="font-mono text-xs text-[#B87B22] font-semibold">{stop.planned_arrival}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#3D4654] mt-1">{stop.place.description}</p>
                    </div>
                  ))}

                  {/* Integrated Authentic Local Food Stop Recommendation */}
                  {recommendedFoods.length > 0 && (
                    <div className="bg-white border border-[#1B5E6B]/30 p-3.5 rounded-lg shadow-xs flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1B5E6B]/10 text-[#1B5E6B] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-base">restaurant</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#1B5E6B] font-bold">
                          Recommended Culinary Experience · Day {day.day_number}
                        </span>
                        <h4 className="font-display font-bold text-sm text-[#12161E]">
                          {recommendedFoods[dayIndex % recommendedFoods.length]?.name}
                        </h4>
                        <p className="text-xs font-body text-[#3D4654] mt-0.5">
                          {recommendedFoods[dayIndex % recommendedFoods.length]?.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Transport legs */}
                  {day.hops && day.hops.map((hop, hidx) => {
                    const isHopUnavailable = hop.mode === 'unavailable';
                    return (
                      <div
                        key={hidx}
                        className={`inline-flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-mono ${
                          isHopUnavailable
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-white border-[#E5DFD5] text-[#70798B]'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${
                            isHopUnavailable ? 'text-amber-700' : 'text-[#1B5E6B]'
                          }`}
                        >
                          {isHopUnavailable ? 'info' : 'directions_transit'}
                        </span>
                        <span>
                          {isHopUnavailable
                            ? 'Transit Notice: Direct public transit corridor unverified · Private cab / walking recommended'
                            : `Transit: ${hop.mode}`}
                        </span>
                        {hop.estimated_minutes && <span>· {hop.estimated_minutes} min</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contextual AI Travel Copilot */}
      <section className="mt-16 border-t border-[#E5DFD5] pt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#B87B22]/10 flex items-center justify-center text-[#B87B22] border border-[#B87B22]/20">
            <span className="material-symbols-outlined">psychiatry</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-[#12161E] flex items-center gap-3">
              <span>Odisha Travel Copilot</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2F523E]/10 text-[#2F523E] text-xs font-mono font-medium border border-[#2F523E]/20">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                <span>Live Grounded AI (/ai/converse)</span>
              </span>
            </h3>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 shadow-xs mb-6">
          {aiError ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-body flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700 text-sm">cloud_off</span>
                <span>{aiError}</span>
              </div>
              {lastFailedPrompt && (
                <button
                  onClick={() => handleAskAi(lastFailedPrompt)}
                  className="px-2.5 py-1 bg-amber-800 text-white rounded text-[11px] font-mono font-semibold hover:bg-amber-900 cursor-pointer"
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="font-body text-[#3D4654] text-base leading-relaxed border-l-2 border-[#B87B22] pl-4 py-1">
                {aiResponse ||
                  (planningAnchor
                    ? `"I have structured a ${days}-day circuit anchored around ${planningAnchor.placeName} in ${planningAnchor.district}. Nearby verified highlights, scenic roads, and authentic culinary stops have been integrated."`
                    : `"I have aligned a ${days}-day circuit starting from ${selectedHub} tailored around ${selectedPassions.join(', ')}. Key recommendations: Start early for Lingaraj to beat temple queues, stop at Pahala for fresh hot Rasgulla on the Cuttack-Bhubaneswar corridor, and explore local Odia delicacies in Pipili."`)}
              </p>
              {aiResponseData?.itinerary && aiResponseData.itinerary.days && aiResponseData.itinerary.days.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#E5DFD5]">
                  <CopilotItineraryCard
                    itinerary={aiResponseData.itinerary}
                    language={aiResponseData.language || "en"}
                    onViewItineraryTab={() => {
                      if (aiResponseData.itinerary) {
                        setGeneratedItinerary(aiResponseData.itinerary);
                      }
                      const el = document.getElementById('itinerary-timeline-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Prompt input */}
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              placeholder={
                planningAnchor
                  ? `Ask AI Copilot about places near ${planningAnchor.placeName}...`
                  : 'Ask AI Copilot (e.g. recommend a food stop in Pipili or best sunrise at Chandrabhaga)...'
              }
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
              className="flex-1 bg-[#FBF9F5] border border-[#E5DFD5] rounded-lg px-4 py-2.5 text-sm text-[#12161E] focus:outline-none focus:border-[#B87B22]"
            />
            <button
              onClick={() => handleAskAi()}
              disabled={aiLoading}
              className="px-5 py-2.5 bg-[#12161E] text-white hover:bg-[#B87B22] text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              <span>{aiLoading ? 'Thinking...' : 'Ask Copilot'}</span>
            </button>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleAskAi(planningAnchor ? `What are the best food experiences near ${planningAnchor.placeName}?` : 'Where can I try authentic Pahala Rasgulla on this route?')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#3D4654] font-body text-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-[#B87B22]">restaurant</span>
            <span>{planningAnchor ? `Food near ${planningAnchor.placeName}` : 'Where to get Pahala Rasgulla'}</span>
          </button>
          <button
            onClick={() => handleAskAi('Prioritize public transit and Mo Bus corridors')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#3D4654] font-body text-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-[#B87B22]">directions_bus</span>
            <span>Prioritize Mo Bus routes</span>
          </button>
          <button
            onClick={() => handleAskAi('Avoid midday heat and optimize for early morning visits')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#3D4654] font-body text-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-[#B87B22]">wb_twilight</span>
            <span>Early morning schedule</span>
          </button>
        </div>
      </section>
    </div>
  );
};
