import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <div
      data-testid="loading-state"
      className="p-8 md:p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs"
    >
      <div className="w-10 h-10 mx-auto rounded-full border-3 border-[#E5DFD5] border-t-[#B87B22] animate-spin mb-4" />
      <h3 className="text-base font-serif font-bold text-[#12161E] mb-1">Planning Your Journey...</h3>
      <p className="text-xs text-[#70798B] max-w-sm mx-auto">
        Finding the best places and connecting realistic travel routes across Odisha.
      </p>
    </div>
  );
};
