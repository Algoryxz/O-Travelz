import React, { useState } from 'react';

interface StitchShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle?: string;
}

export const StitchShareModal: React.FC<StitchShareModalProps> = ({
  isOpen,
  onClose,
  tripTitle = 'The Golden Triangle Heritage Circuit',
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.origin + '/#shared-expedition-odisha-2026';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-[#FBF9F5] border border-[#E5DFD5] rounded-2xl shadow-2xl w-full max-w-lg p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-2xl font-bold text-[#12161E]">Share Expedition</span>
          </div>
          <button onClick={onClose} className="p-1 text-[#70798B] hover:text-[#12161E]">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#E5DFD5] p-4 rounded-xl">
            <h4 className="font-display font-bold text-base text-[#12161E] mb-1">{tripTitle}</h4>
            <p className="font-mono text-xs text-[#70798B]">3 Days · 8 Canonical Stops · Interactive GeoJSON Corridor</p>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#3D4654] mb-2 font-semibold">Public Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-white border border-[#E5DFD5] rounded-lg px-3 py-2 text-xs font-mono text-[#70798B] focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-[#B87B22] text-white rounded-lg text-xs font-medium hover:bg-[#A0691B] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
