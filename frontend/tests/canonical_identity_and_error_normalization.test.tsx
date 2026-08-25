import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { normalizeError } from "../src/utils/errorNormalizer";
import { ErrorAlert } from "../src/components/itinerary/ErrorAlert";
import { ApiError, NetworkError, UnexpectedResponseError } from "../src/api/client";
import { isUUID } from "../src/store/useMapProjection";
import { getCanonicalPlaceUuid, CANONICAL_PLACE_UUIDS } from "../src/utils/canonicalPlaceIds";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Canonical Identity & Deterministic UUID Mapping", () => {
  it("resolves all 161 places to valid UUIDv5s deterministically", () => {
    const keys = Object.keys(CANONICAL_PLACE_UUIDS);
    expect(keys.length).toBe(161);

    for (const key of keys) {
      const canonicalUuid = getCanonicalPlaceUuid(key);
      expect(isUUID(canonicalUuid)).toBe(true);
    }
  });

  it("handles unknown or already-UUID inputs gracefully in getCanonicalPlaceUuid", () => {
    const testUuid = "12345678-1234-5678-1234-567812345678";
    expect(getCanonicalPlaceUuid(testUuid)).toBe(testUuid);
    expect(getCanonicalPlaceUuid("")).toBe("");
  });
});

describe("Error Normalization & Sensitive Diagnostics Shielding", () => {
  it("normalizes a 422 Pydantic validation error into friendly traveler copy", () => {
    const rawPydanticError = new ApiError({
      message: "Invalid map projection request",
      status: 422,
      code: "validation_error",
      details: [
        {
          field: "requested_features.0.id",
          message: "Input should be a valid UUID, invalid character: expected an optional prefix of 'urn:uuid:' followed by [0-9a-fA-F-], found 'p' at 1",
        },
      ],
    });

    const normalized = normalizeError(rawPydanticError);
    expect(normalized.title).toBe("Planning Failed (422)");
    expect(normalized.message).toContain("Some of the selected places could not be matched");
    // Ensure raw schema internal paths and Python details are NOT present
    expect(normalized.message).not.toContain("requested_features");
    expect(normalized.message).not.toContain("Input should be a valid UUID");
    expect(normalized.details).toBeUndefined();
  });

  it("ErrorAlert renders normalized copy and never exposes raw field details", () => {
    const rawError = new ApiError({
      message: "Unprocessable Entity",
      status: 422,
      code: "validation_error",
      details: [
        {
          field: "requested_features.12.id",
          message: "Input should be a valid UUID",
        },
      ],
    });

    const html = renderClean(<ErrorAlert error={rawError} onRetry={() => {}} onReset={() => {}} />);

    expect(html).toContain("Planning Failed (422)");
    expect(html).not.toContain("requested_features");
    expect(html).not.toContain("Input should be a valid UUID");
    expect(html).toContain("data-testid=\"error-retry-button\"");
    expect(html).toContain("data-testid=\"error-reset-button\"");
  });

  it("normalizes NetworkError and UnexpectedResponseError correctly", () => {
    const netErr = new NetworkError("Failed to fetch");
    const normNet = normalizeError(netErr);
    expect(normNet.title).toBe("Network Connection Error");
    expect(normNet.code).toBe("network_error");

    const respErr = new UnexpectedResponseError("Invalid structure", 500, {});
    const normResp = normalizeError(respErr);
    expect(normResp.title).toBe("Unexpected Server Response");
  });
});
