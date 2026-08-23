import React from "react";
import { ApiError, NetworkError, UnexpectedResponseError } from "../../api/client";

interface ErrorAlertProps {
  error: unknown;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  let title = "An unexpected error occurred";
  let message = "Please try again or check your parameters.";
  let code: string | undefined;
  let field: string | null | undefined;
  let details: Array<Record<string, unknown>> = [];

  if (error instanceof ApiError) {
    title = `Planning Failed (${error.status})`;
    message = error.message;
    code = error.code;
    field = error.field;
    details = error.details;
  } else if (error instanceof NetworkError) {
    title = "Network Connection Error";
    message = "Unable to connect to the O-Travelz backend service. Please check your internet connection or verify the backend server is running.";
  } else if (error instanceof UnexpectedResponseError) {
    title = "Unexpected Server Response";
    message = "The server returned a response that could not be parsed according to the verified itinerary contract.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div
      data-testid="error-alert"
      role="alert"
      className="p-4 sm:p-5 rounded-xl bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-xs font-bold shrink-0 font-mono">
              !
            </span>
            <h4 className="text-sm font-serif font-bold text-[#C2410C]">{title}</h4>
            {code && (
              <span className="px-2 py-0.5 rounded bg-[#FFEDD5] text-[#C2410C] font-mono text-xs font-medium border border-[#FDBA74]">
                {code}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-[#9A3412] leading-relaxed">{message}</p>

          {field && (
            <p className="mt-1 text-xs text-[#9A3412] font-mono">
              Affected field: <span className="font-semibold">{field}</span>
            </p>
          )}

          {details && details.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[#FDBA74] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A3412] font-mono">
                Validation Details
              </span>
              <ul className="list-disc list-inside text-xs text-[#9A3412] space-y-0.5">
                {details.map((detail, index) => (
                  <li key={index} className="leading-snug">
                    {detail.field ? (
                      <span className="font-semibold font-mono">{String(detail.field)}: </span>
                    ) : null}
                    <span>{String(detail.message ?? JSON.stringify(detail))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="px-3.5 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-[#C2410C] hover:text-[#7C2D12] text-lg leading-none p-1 rounded transition-colors cursor-pointer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
