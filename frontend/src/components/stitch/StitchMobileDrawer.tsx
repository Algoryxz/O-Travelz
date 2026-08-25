import React from 'react';
import type { StitchTab } from './StitchNavbar';
import { useLocation } from '../../context/LocationContext';
import { useSavedPlaces } from '../../store/useSavedPlaces';

interface StitchMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: StitchTab;
  onSelectTab: (tab: StitchTab) => void;
  onOpenAuth: () => void;
  onOpenPreferences: () => void;
}

export const StitchMobileDrawer: React.FC<StitchMobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenPreferences,
}) => {
  const { locationName, city, isLive } = useLocation();
  const { savedCount } = useSavedPlaces();

  if (!isOpen) return null;

  const currentCityLabel = locationName || city || 'Bhubaneswar';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="relative w-80 max-w-[85vw] flex flex-col h-full bg-[#FBF9F5] shadow-2xl z-10 animate-in slide-in-from-left duration-300 border-r border-[#E5DFD5]">
        {/* Header / Brand Section */}
        <div className="p-6 border-b border-[#E5DFD5] bg-[#F2EEE7]/50">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpeg"
                alt="O-Travelz Logo"
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#B87B22]/30 shadow-xs shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <div className="flex flex-col">
                <span className="font-display italic text-xl font-bold text-[#12161E] leading-none">O-Travelz</span>
                <span className="text-[10px] font-mono text-[#70798B] tracking-wide leading-none mt-1">safe • secure • smart</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1 text-[#70798B] hover:text-[#12161E] rounded-full focus:outline-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E5DFD5]">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isLive ? 'bg-[#2F523E]/10 text-[#2F523E]' : 'bg-[#B87B22]/10 text-[#B87B22]'
            }`}>
              <span className="material-symbols-outlined text-lg">
                {isLive ? 'my_location' : 'location_on'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-display text-xs font-bold text-[#12161E] truncate">{currentCityLabel}</p>
              <p className="font-mono text-[10px] text-[#70798B]">
                {isLive ? '🟢 Live GPS Active' : '📍 Manual Selection'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-2 divide-y divide-[#E5DFD5]/60 font-body">
          <button
            onClick={() => { onSelectTab('discover'); onClose(); }}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-colors text-left cursor-pointer ${
              currentTab === 'discover'
                ? 'text-[#B87B22] font-semibold bg-[#F2EEE7]'
                : 'text-[#3D4654] hover:bg-[#F2EEE7]/50'
            }`}
          >
            <span className="material-symbols-outlined text-xl">explore</span>
            <span>Discover</span>
          </button>

          <button
            onClick={() => { onSelectTab('destinations'); onClose(); }}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-colors text-left cursor-pointer ${
              currentTab === 'destinations'
                ? 'text-[#B87B22] font-semibold bg-[#F2EEE7]'
                : 'text-[#3D4654] hover:bg-[#F2EEE7]/50'
            }`}
          >
            <span className="material-symbols-outlined text-xl">temple_hindu</span>
            <span>Destinations</span>
          </button>

          <button
            onClick={() => { onSelectTab('map'); onClose(); }}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-colors text-left cursor-pointer ${
              currentTab === 'map'
                ? 'text-[#B87B22] font-semibold bg-[#F2EEE7]'
                : 'text-[#3D4654] hover:bg-[#F2EEE7]/50'
            }`}
          >
            <span className="material-symbols-outlined text-xl">map</span>
            <span>Map &amp; Routes</span>
          </button>

          <button
            onClick={() => { onSelectTab('plan'); onClose(); }}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-colors text-left cursor-pointer ${
              currentTab === 'plan'
                ? 'text-[#B87B22] font-semibold bg-[#F2EEE7]'
                : 'text-[#3D4654] hover:bg-[#F2EEE7]/50'
            }`}
          >
            <span className="material-symbols-outlined text-xl">route</span>
            <span>Plan Trip</span>
          </button>

          <button
            onClick={() => { onSelectTab('saved'); onClose(); }}
            className={`w-full flex items-center justify-between px-6 py-4 transition-colors text-left cursor-pointer ${
              currentTab === 'saved'
                ? 'text-[#B87B22] font-semibold bg-[#F2EEE7]'
                : 'text-[#3D4654] hover:bg-[#F2EEE7]/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-xl">bookmark</span>
              <span>Saved Places</span>
            </div>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#B87B22] text-white">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E5DFD5] bg-[#F2EEE7]/40 flex flex-col gap-3">
          <button
            onClick={() => { onOpenAuth(); onClose(); }}
            className="w-full py-2.5 px-4 bg-[#B87B22] hover:bg-[#A0691B] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">account_circle</span>
            <span>Account &amp; Sync</span>
          </button>

          <button
            onClick={() => { onOpenPreferences(); onClose(); }}
            className="w-full py-2.5 px-4 bg-white border border-[#E5DFD5] text-[#3D4654] hover:text-[#12161E] rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#F2EEE7] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span>Preferences</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
