import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ApiError, NetworkError } from "../src/api/client";
import type { AIResponse } from "../src/api/contracts";
import { AIConversationPanel } from "../src/components/ai/AIConversationPanel";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Phase 6B AI Conversation Components", () => {
  describe("AIConversationPanel Rendering", () => {
    it("renders initial prompt suggestions and input field", () => {
      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={null}
          aiResponse={null}
          onSend={() => {}}
        />
      );

      expect(html).toContain("AI Trip Assistant");
      expect(html).toContain("Suggested Prompts");
      expect(html).toContain("Make it more food focused");
      expect(html).toContain("Ask AI Assistant");
    });

    it("renders refinement heading and button when an itinerary is present", () => {
      const html = renderClean(
        <AIConversationPanel
          hasItinerary={true}
          isLoading={false}
          error={null}
          aiResponse={null}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Conversational Refinement");
      expect(html).toContain("Refine Itinerary");
    });

    it("renders assistant message and success status badge", () => {
      const aiResponse: AIResponse = {
        message: "Here is your 2-day heritage itinerary in Bhubaneswar.",
        status: "success",
        itinerary: null,
        clarification: null,
        changed_constraints: null,
      };

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={null}
          aiResponse={aiResponse}
          onSend={() => {}}
        />
      );

      expect(html).toContain("AI Trip Assistant");
      expect(html).toContain("Success");
      expect(html).toContain("Here is your 2-day heritage itinerary in Bhubaneswar.");
    });

    it("renders clarification question clearly without pretending an itinerary was produced", () => {
      const aiResponse: AIResponse = {
        message: "Which dates are you planning for?",
        status: "clarification",
        itinerary: null,
        clarification: {
          question: "Which dates are you planning for?",
          reason: "date_needed",
        },
      };

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={null}
          aiResponse={aiResponse}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Clarification Needed");
      expect(html).toContain("Clarification Question:");
      expect(html).toContain("Which dates are you planning for?");
      expect(html).toContain("Reason: date_needed");
    });

    it("renders note on request status", () => {
      const aiResponse: AIResponse = {
        message: "Pace preference is currently unsupported by the planner.",
        status: "unsupported",
        itinerary: null,
        clarification: null,
      };

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={true}
          isLoading={false}
          error={null}
          aiResponse={aiResponse}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Note on Request");
      expect(html).toContain("Pace preference is currently unsupported");
    });

    it("renders changed constraints honestly when returned by refinement", () => {
      const aiResponse: AIResponse = {
        message: "Updated the plan to focus on food.",
        status: "success",
        changed_constraints: {
          days: 2,
          interests: ["food", "market"],
          start: "Origin Hotel",
          dates: ["2026-09-10"],
        },
      };

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={true}
          isLoading={false}
          error={null}
          aiResponse={aiResponse}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Updated Constraints:");
      expect(html).toContain("Days: 2");
      expect(html).toContain("Interests: food, market");
      expect(html).toContain("Start: Origin Hotel");
      expect(html).toContain("Dates: 2026-09-10");
    });

    it("renders structured error alert within the AI panel when an error occurs", () => {
      const apiError = new ApiError({
        message: "Invalid message payload",
        status: 422,
        code: "validation_error",
        field: "message",
      });

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={apiError}
          aiResponse={null}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Planning Failed (422)");
      expect(html).toContain("validation_error");
      expect(html).toContain("Invalid message payload");
    });

    it("renders network error alert within the AI panel", () => {
      const netError = new NetworkError("Connection refused");

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={netError}
          aiResponse={null}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Network Connection Error");
      expect(html).toContain("Unable to connect to the O-Travelz backend service");
    });
  });
});
