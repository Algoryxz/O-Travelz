import React from "react";
import { normalizeError } from "../../utils/errorNormalizer";

interface ErrorAlertProps {
  error: unknown;
  onDismiss?: () => void;
  onRetry?: () => void;
  onReset?: () => void;
  onSignIn?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onDismiss,
  onRetry,
  onReset,
  onSignIn,
}) => {
  if (!error) return null;

  const normalized = normalizeError(error);

  return (
    <div
      data-testid="error-alert"
      role="alert"
      className="p-4 sm:p-5 rounded-xl bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] shadow-xs animate-in fade-in duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-xs font-bold shrink-0 font-mono">
              !
            </span>
            <h4 className="text-sm font-serif font-bold text-[#C2410C]">
              {normalized.title}
            </h4>
            {normalized.code && (
              <span className="px-2 py-0.5 rounded bg-[#FFEDD5] text-[#C2410C] font-mono text-[11px] font-medium border border-[#FDBA74]">
                {normalized.code}
              </span>
            )}
          </div>

          <p className="text-xs text-[#9A3412] leading-relaxed">
            {normalized.message}
          </p>

          {normalized.field && (
            <p className="text-xs text-[#9A3412] font-mono">
              Affected field: <span className="font-semibold">{normalized.field}</span>
            </p>
          )}

          {normalized.details && normalized.details.length > 0 && (
            <div className="pt-2 border-t border-[#FDBA74] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A3412] font-mono">
                Details
              </span>
              <ul className="list-disc list-inside text-xs text-[#9A3412] space-y-0.5">
                {normalized.details.map((detail, index) => (
                  <li key={index} className="leading-snug">
                    {detail.field ? (
                      <span className="font-semibold font-mono">{detail.field}: </span>
                    ) : null}
                    <span>{detail.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-1 flex items-center gap-2 flex-wrap">
            {onRetry && (
              <button
                type="button"
                data-testid="error-retry-button"
                onClick={onRetry}
                className="px-3.5 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {normalized.actionText || "Retry Request"}
              </button>
            )}

            {onReset && (
              <button
                type="button"
                data-testid="error-reset-button"
                onClick={onReset}
                className="px-3.5 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74] text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Trip
              </button>
            )}

            {normalized.actionType === "signin" && onSignIn && (
              <button
                type="button"
                data-testid="error-signin-button"
                onClick={onSignIn}
                className="px-3.5 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-[#C2410C] hover:text-[#7C2D12] text-lg leading-none p-1 rounded transition-colors cursor-pointer shrink-0"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
