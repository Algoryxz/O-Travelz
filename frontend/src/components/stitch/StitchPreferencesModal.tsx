import React, { useState } from 'react';

interface StitchPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StitchPreferencesModal: React.FC<StitchPreferencesModalProps> = ({ isOpen, onClose }) => {
  const [currency, setCurrency] = useState('INR');
  const [units, setUnits] = useState('km');
  const [transit, setTransit] = useState('multimodal');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-[#FBF9F5] border border-[#E5DFD5] rounded-2xl shadow-2xl w-full max-w-md p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-2xl font-bold text-[#12161E]">Travel Preferences</span>
          </div>
          <button onClick={onClose} className="p-1 text-[#70798B] hover:text-[#12161E]">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-5 text-xs font-mono">
          <div>
            <label className="block text-[#3D4654] font-semibold mb-2">Currency Format</label>
            <div className="grid grid-cols-2 gap-2">
              {['INR (₹)', 'USD ($)'].map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c.startsWith('INR') ? 'INR' : 'USD')}
                  className={`py-2 px-3 rounded-lg border text-center transition-colors ${
                    currency === (c.startsWith('INR') ? 'INR' : 'USD')
                      ? 'bg-[#B87B22] text-white border-[#B87B22] font-bold'
                      : 'bg-white text-[#3D4654] border-[#E5DFD5] hover:bg-[#F2EEE7]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[#3D4654] font-semibold mb-2">Distance Units</label>
            <div className="grid grid-cols-2 gap-2">
              {['Kilometers (km)', 'Miles (mi)'].map(u => (
                <button
                  key={u}
                  onClick={() => setUnits(u.startsWith('Kilo') ? 'km' : 'mi')}
                  className={`py-2 px-3 rounded-lg border text-center transition-colors ${
                    units === (u.startsWith('Kilo') ? 'km' : 'mi')
                      ? 'bg-[#12161E] text-white border-[#12161E] font-bold'
                      : 'bg-white text-[#3D4654] border-[#E5DFD5] hover:bg-[#F2EEE7]'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5DFD5]">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#B87B22] text-white rounded-lg font-semibold hover:bg-[#A0691B] transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
