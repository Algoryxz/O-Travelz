/**
 * Centralized error normalization service for O-Travelz.
 *
 * Ensures internal diagnostics, Pydantic validation internals, Python stack traces,
 * database details, and schema field paths (e.g. requested_features.0.id) are NEVER
 * exposed directly to travelers.
 *
 * Full diagnostic details are preserved in browser console logs for developer troubleshooting.
 */

import { ApiError, NetworkError, UnexpectedResponseError } from "../api/client";

export interface NormalizedUserError {
  title: string;
  message: string;
  code?: string;
  field?: string | null;
  details?: Array<{ field?: string; message: string }>;
  actionText?: string;
  actionType?: "retry" | "reset" | "signin" | "back";
}

const SENSITIVE_ERROR_PATTERNS = [
  /input should be a valid uuid/i,
  /requested_features/i,
  /validation_error/i,
  /syntaxerror/i,
  /traceback/i,
  /psycopg/i,
  /sqlalchemy/i,
  /internal server error/i,
  /fastapi/i,
  /failed to fetch/i,
];

export function isSensitiveDiagnostic(msg: string): boolean {
  return SENSITIVE_ERROR_PATTERNS.some((pattern) => pattern.test(msg));
}

export function normalizeError(error: unknown): NormalizedUserError {
  // Always log raw error diagnostics for developer console visibility
  if (typeof console !== "undefined" && console.warn) {
    console.warn("[O-Travelz Diagnostic]", error);
  }

  if (!error) {
    return {
      title: "An unexpected error occurred",
      message: "Please try again or check your parameters.",
      actionText: "Try again",
      actionType: "retry",
    };
  }

  if (error instanceof NetworkError) {
    return {
      title: "Network Connection Error",
      message:
        "Unable to connect to the O-Travelz backend service. Please check your internet connection or verify the backend server is running.",
      code: "network_error",
      actionText: "Try again",
      actionType: "retry",
    };
  }

  if (error instanceof UnexpectedResponseError) {
    return {
      title: "Unexpected Server Response",
      message:
        "The server returned a response that could not be parsed according to the verified itinerary contract.",
      code: "service_error",
      actionText: "Try again",
      actionType: "retry",
    };
  }

  if (error instanceof ApiError) {
    const status = error.status;
    const title = `Planning Failed (${status})`;
    const code = error.code;
    const field = error.field;

    const rawMsg = error.message || "";
    let safeMsg = rawMsg;

    if (isSensitiveDiagnostic(rawMsg) || (status === 422 && rawMsg.includes("Invalid map projection"))) {
      safeMsg = "We couldn't build this route. Some of the selected places could not be matched. Please review your selections and try again.";
    }

    // Filter and sanitize details list
    const sanitizedDetails: Array<{ field?: string; message: string }> = [];
    if (Array.isArray(error.details)) {
      for (const d of error.details) {
        const dMsg = String(d.message || JSON.stringify(d));
        if (isSensitiveDiagnostic(dMsg)) {
          // Exclude internal schema validation error paths
          continue;
        }
        sanitizedDetails.push({
          field: d.field ? String(d.field) : undefined,
          message: dMsg,
        });
      }
    }

    return {
      title,
      message: safeMsg,
      code,
      field,
      details: sanitizedDetails.length > 0 ? sanitizedDetails : undefined,
      actionText: status === 422 ? "Adjust and Retry" : "Retry Request",
      actionType: "retry",
    };
  }

  if (error instanceof Error) {
    const rawMsg = error.message || "";
    const safeMsg = isSensitiveDiagnostic(rawMsg)
      ? "An unexpected issue occurred while processing your trip. Please try again."
      : rawMsg;

    return {
      title: "An unexpected error occurred",
      message: safeMsg,
      actionText: "Try again",
      actionType: "retry",
    };
  }

  return {
    title: "An unexpected error occurred",
    message: "Please review your trip details or try again in a moment.",
    actionText: "Try again",
    actionType: "retry",
  };
}
