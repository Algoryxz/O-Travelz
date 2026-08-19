import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <div
      data-testid="loading-state"
      className="p-8 md:p-12 text-center rounded-3xl bg-white border border-gray-200 shadow-sm"
    >
      <div className="w-10 h-10 mx-auto rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin mb-4" />
      <h3 className="text-base font-bold text-gray-900 mb-1">Planning Your Journey...</h3>
      <p className="text-xs text-gray-500 max-w-sm mx-auto">
        Finding the best places and connecting realistic travel routes across Odisha.
      </p>
    </div>
  );
};
