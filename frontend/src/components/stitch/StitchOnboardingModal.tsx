import React, { useState } from 'react';

export interface TravelerPreferences {
  draws: string[];
  food: string[];
  pace: 'slow' | 'balanced' | 'fast';
  persona: string;
}

interface StitchOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreferences: (prefs: TravelerPreferences) => void;
  initialPreferences?: TravelerPreferences;
}

const DRAW_OPTIONS = [
  { id: 'heritage', label: 'Sacred Temples & Monuments', icon: 'account_balance' },
  { id: 'nature', label: 'Forests, Hills & Waterfalls', icon: 'forest' },
  { id: 'coast', label: 'Beaches & Chilika Lagoon', icon: 'waves' },
  { id: 'culture', label: 'Pattachitra Crafts & Handlooms', icon: 'brush' },
  { id: 'food', label: 'Authentic Odia Culinary Flavors', icon: 'restaurant' },
  { id: 'adventure', label: 'Highland Treks & Wildlife', icon: 'hiking' },
];

const FOOD_OPTIONS = [
  { id: 'odia_thali', label: 'Authentic Odia Thali (Dalma & Pakhala)', icon: 'dinner_dining' },
  { id: 'seafood', label: 'Chilika Prawns & Coastal Fish', icon: 'set_meal' },
  { id: 'sweets', label: 'Pahala Rasgulla & Chhena Poda', icon: 'bakery_dining' },
  { id: 'street_food', label: 'Cuttack Dahibara Aloodum & Gupchup', icon: 'fastfood' },
  { id: 'pure_veg', label: 'Pure Veg / Temple Mahaprasad', icon: 'spa' },
];

const PACE_OPTIONS = [
  { id: 'slow', label: 'Slow & Immersive', desc: '1–2 deep cultural landmarks per day, leisurely food stops.' },
  { id: 'balanced', label: 'Balanced Classic', desc: 'Optimal blend of temples, nature, and relaxed evenings.' },
  { id: 'fast', label: 'Fast-Paced Explorer', desc: 'Maximized circuit coverage across multiple districts.' },
];

const PERSONA_OPTIONS = [
  { id: 'heritage_buff', label: 'Heritage & Architecture Aficionado' },
  { id: 'spiritual', label: 'Spiritual Pilgrim & Temple Seeker' },
  { id: 'nature_lover', label: 'Wilderness & Coastal Explorer' },
  { id: 'foodie', label: 'Culinary & Street Food Trailblazer' },
  { id: 'family', label: 'Family Vacation & Gentle Touring' },
  { id: 'solo_photographer', label: 'Solo Visual & Landscape Storyteller' },
];

export const StitchOnboardingModal: React.FC<StitchOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSavePreferences,
  initialPreferences,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedDraws, setSelectedDraws] = useState<string[]>(initialPreferences?.draws || ['heritage', 'nature']);
  const [selectedFood, setSelectedFood] = useState<string[]>(initialPreferences?.food || ['odia_thali', 'sweets']);
  const [selectedPace, setSelectedPace] = useState<'slow' | 'balanced' | 'fast'>(initialPreferences?.pace || 'balanced');
  const [selectedPersona, setSelectedPersona] = useState<string>(initialPreferences?.persona || 'heritage_buff');

  if (!isOpen) return null;

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const handleFinish = () => {
    const prefs: TravelerPreferences = {
      draws: selectedDraws,
      food: selectedFood,
      pace: selectedPace,
      persona: selectedPersona,
    };
    try {
      localStorage.setItem('otravelz_traveler_preferences', JSON.stringify(prefs));
    } catch {
      // ignore
    }
    onSavePreferences(prefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-[#FBF9F5] border border-[#E5DFD5] rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5DFD5]">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-2xl font-bold text-[#12161E]">O-Travelz</span>
            <span className="text-xs bg-[#B87B22]/10 text-[#B87B22] px-2.5 py-0.5 rounded font-mono font-medium">
              Traveler Persona
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#70798B]">Step {step} of 4</span>
            <button onClick={onClose} className="p-1 text-[#70798B] hover:text-[#12161E]">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Step 1: What draws you to Odisha? */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-[#12161E]">
                What draws you to Odisha?
              </h3>
              <p className="font-body text-xs text-[#70798B] mt-1">
                Select the cultural and environmental landscapes that resonate with your spirit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DRAW_OPTIONS.map(opt => {
                const isSelected = selectedDraws.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleItem(selectedDraws, setSelectedDraws, opt.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#B87B22] shadow-xs ring-1 ring-[#B87B22]/20'
                        : 'bg-white/70 border-[#E5DFD5] hover:bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      isSelected ? 'bg-[#B87B22] text-white' : 'bg-[#F2EEE7] text-[#70798B]'
                    }`}>
                      <span className="material-symbols-outlined text-base">{opt.icon}</span>
                    </div>
                    <span className="font-body text-xs font-semibold text-[#12161E]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: What do you want to eat? */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-[#12161E]">
                What is your culinary appetite?
              </h3>
              <p className="font-body text-xs text-[#70798B] mt-1">
                We embed authentic regional meal stops directly into your multi-day itinerary.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FOOD_OPTIONS.map(opt => {
                const isSelected = selectedFood.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleItem(selectedFood, setSelectedFood, opt.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#B87B22] shadow-xs ring-1 ring-[#B87B22]/20'
                        : 'bg-white/70 border-[#E5DFD5] hover:bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      isSelected ? 'bg-[#B87B22] text-white' : 'bg-[#F2EEE7] text-[#70798B]'
                    }`}>
                      <span className="material-symbols-outlined text-base">{opt.icon}</span>
                    </div>
                    <span className="font-body text-xs font-semibold text-[#12161E]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Travel Pace */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-[#12161E]">
                What pace do you prefer?
              </h3>
              <p className="font-body text-xs text-[#70798B] mt-1">
                Controls travel duration, resting intervals, and waypoint density.
              </p>
            </div>

            <div className="space-y-3">
              {PACE_OPTIONS.map(opt => {
                const isSelected = selectedPace === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPace(opt.id as any)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#B87B22] shadow-xs ring-1 ring-[#B87B22]/20'
                        : 'bg-white/70 border-[#E5DFD5] hover:bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border ${
                      isSelected ? 'border-[#B87B22] bg-[#B87B22]' : 'border-[#70798B]'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </div>
                    <div>
                      <strong className="block font-display font-bold text-sm text-[#12161E]">{opt.label}</strong>
                      <span className="font-body text-xs text-[#70798B]">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Travel Persona */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-[#12161E]">
                What is your expedition identity?
              </h3>
              <p className="font-body text-xs text-[#70798B] mt-1">
                Refines AI copilot recommendations and curated sanctuary highlights.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERSONA_OPTIONS.map(opt => {
                const isSelected = selectedPersona === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPersona(opt.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#B87B22] shadow-xs ring-1 ring-[#B87B22]/20'
                        : 'bg-white/70 border-[#E5DFD5] hover:bg-white'
                    }`}
                  >
                    <strong className="block font-body text-xs font-semibold text-[#12161E]">{opt.label}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-[#E5DFD5] flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2 border border-[#E5DFD5] bg-white rounded-lg text-xs font-semibold text-[#3D4654] hover:bg-[#F2EEE7] cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="px-6 py-2.5 bg-[#12161E] hover:bg-[#B87B22] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Continue</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-8 py-2.5 bg-[#B87B22] hover:bg-[#A0691B] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-sm">check</span>
              <span>Save &amp; Tailor Experiences</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
