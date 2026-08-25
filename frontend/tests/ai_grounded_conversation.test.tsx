import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ApiClient, ApiError, NetworkError } from "../src/api/client";
import type {
  AIConverseRequest,
  ChatMessage,
  GroundedConversationResponse,
} from "../src/api/contracts";
import { AIConversationPanel } from "../src/components/ai/AIConversationPanel";
import type { ConversationTurn } from "../src/store/useAIConversation";

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, "");
}

describe("Phase 12 Step 7 — Frontend Grounded AI Conversation Integration", () => {
  // ============================================================================
  // 1. API CLIENT TESTS (/ai/converse)
  // ============================================================================
  describe("API Client converseWithAi Endpoint", () => {
    it("encodes AIConverseRequest properly and dispatches POST /ai/converse", async () => {
      const mockResponse: GroundedConversationResponse = {
        message: "Here is your grounded 2-day itinerary for Puri.",
        status: "success",
        language: "en",
        is_grounded: true,
        itinerary: {
          itinerary_id: "itin-123",
          explanation: "Verified Puri journey",
          days: [
            {
              day_number: 1,
              stops: [
                {
                  sequence: 1,
                  place: {
                    id: "p1",
                    name: "Jagannath Temple",
                    category: "temple",
                    district: "Puri",
                    region: "Coastal",
                    latitude: 19.8135,
                    longitude: 85.8312,
                    is_medical: false,
                    is_transit: false,
                  },
                },
              ],
              hops: [],
            },
          ],
          constraints: { days: 2, start: "Puri" },
        },
        tool_calls: [
          {
            id: "call_1",
            name: "build_itinerary",
            arguments: { constraints: { days: 2, start: "Puri" } },
          },
        ],
        tool_results: [
          {
            tool_call_id: "call_1",
            tool_name: "build_itinerary",
            status: "ok",
          },
        ],
        warnings: [],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      } as unknown as Response);

      const client = new ApiClient({ baseUrl: "http://127.0.0.1:8000", fetchFn: mockFetch });
      const requestPayload: AIConverseRequest = {
        messages: [{ role: "user", content: "Plan a 2 day trip to Puri" }],
        constraints: { days: 2 },
      };

      const result = await client.converseWithAi(requestPayload);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("http://127.0.0.1:8000/ai/converse");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({
        messages: [{ role: "user", content: "Plan a 2 day trip to Puri" }],
        constraints: { days: 2 },
      });

      expect(result.message).toBe("Here is your grounded 2-day itinerary for Puri.");
      expect(result.is_grounded).toBe(true);
      expect(result.status).toBe("success");
      expect(result.tool_calls).toHaveLength(1);
    });

    it("handles API errors from backend /ai/converse gracefully", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        text: () =>
          Promise.resolve(
            JSON.stringify({
              error: {
                message: "Provider unavailable",
                code: "provider_unavailable",
              },
            })
          ),
      } as unknown as Response);

      const client = new ApiClient({ baseUrl: "http://127.0.0.1:8000", fetchFn: mockFetch });
      const requestPayload: AIConverseRequest = {
        messages: [{ role: "user", content: "Plan a trip" }],
      };

      await expect(client.converseWithAi(requestPayload)).rejects.toThrow();
    });

  });

  // ============================================================================
  // 2. UI RENDERING & GROUNDED STATE
  // ============================================================================
  describe("AIConversationPanel Presentation", () => {
    it("renders user message and assistant message with grounded badge", () => {
      const history: ConversationTurn[] = [
        { role: "user", message: "Plan a 2 day trip in Puri" },
        {
          role: "assistant",
          message: "Here is your verified itinerary for Puri.",
          is_grounded: true,
          tool_calls: [{ name: "build_itinerary", arguments: {} }],
        },
      ];

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={true}
          isLoading={false}
          error={null}
          history={history}
          isGrounded={true}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Plan a 2 day trip in Puri");
      expect(html).toContain("Here is your verified itinerary for Puri.");
      expect(html).toContain("Grounded in verified O-Travelz data");
      expect(html).toContain("Tool: build_itinerary");
    });

    it("does NOT render grounded badge when is_grounded is false", () => {
      const history: ConversationTurn[] = [
        { role: "user", message: "Hello" },
        {
          role: "assistant",
          message: "How can I help you explore Odisha?",
          is_grounded: false,
        },
      ];

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={null}
          history={history}
          isGrounded={false}
          onSend={() => {}}
        />
      );

      expect(html).toContain("How can I help you explore Odisha?");
      expect(html).not.toContain("ai-turn-grounded-badge");
    });

    it("renders Odia (ଓଡ଼ିଆ) responses with proper typography", () => {
      const history: ConversationTurn[] = [
        { role: "user", message: "ପୁରୀ ପାଇଁ ୩ ଦିନର ଯାତ୍ରା ଯୋଜନା କର" },
        {
          role: "assistant",
          message: "ଏଠାରେ ଆପଣଙ୍କ ପୁରୀ ପାଇଁ ୩ ଦିନର ଯାଞ୍ଚିତ ଯାତ୍ରା ଯୋଜନା ରହିଛି।",
          is_grounded: true,
          language: "or",
        },
      ];

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={null}
          history={history}
          onSend={() => {}}
        />
      );

      expect(html).toContain("ପୁରୀ ପାଇଁ ୩ ଦିନର ଯାତ୍ରା ଯୋଜନା କର");
      expect(html).toContain("ଏଠାରେ ଆପଣଙ୍କ ପୁରୀ ପାଇଁ ୩ ଦିନର ଯାଞ୍ଚିତ ଯାତ୍ରା ଯୋଜନା ରହିଛି।");
      expect(html).toContain("Grounded in verified O-Travelz data");
    });

    it("renders Hindi (हिन्दी) responses with proper typography", () => {
      const history: ConversationTurn[] = [
        { role: "user", message: "पुरी के लिए 2 दिन का प्लान बनाओ" },
        {
          role: "assistant",
          message: "यहाँ पुरी के लिए 2 दिन का सत्यापित यात्रा कार्यक्रम है।",
          is_grounded: true,
          language: "hi",
        },
      ];

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={null}
          history={history}
          onSend={() => {}}
        />
      );

      expect(html).toContain("पुरी के लिए 2 दिन का प्लान बनाओ");
      expect(html).toContain("यहाँ पुरी के लिए 2 दिन का सत्यापित यात्रा कार्यक्रम है।");
      expect(html).toContain("Grounded in verified O-Travelz data");
    });

    it("renders clarification question clearly without hallucinating facts", () => {
      const history: ConversationTurn[] = [
        { role: "user", message: "Tell me about temples" },
        {
          role: "assistant",
          message: "Which district or city temples would you like to explore?",
          response: {
            message: "Which district or city temples would you like to explore?",
            status: "clarification",
            itinerary: null,
            clarification: {
              question: "Which district or city temples would you like to explore?",
              reason: "location_needed",
            },
          },
          is_grounded: true,
        },
      ];

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={null}
          history={history}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Clarification Needed:");
      expect(html).toContain("Which district or city temples would you like to explore?");
    });

    it("renders actionable error alert with retry button", () => {
      const apiError = new ApiError({
        message: "Failed to connect to AI service",
        status: 503,
        code: "provider_unavailable",
      });

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={apiError}
          history={[]}
          onRetry={() => {}}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Planning Failed (503)");
      expect(html).toContain("Failed to connect to AI service");
      expect(html).toContain("Retry Request");
    });

    it("renders refinement suggestions for grounded quick actions", () => {
      const html = renderClean(
        <AIConversationPanel
          hasItinerary={true}
          currentConstraints={{ days: 2, start: "Bhubaneswar", interests: ["heritage"] }}
          isLoading={false}
          error={null}
          history={[]}
          onSend={() => {}}
        />
      );

      expect(html).toContain("Suggested Prompts");
      expect(html).toContain("Extend trip to 3 days");
      expect(html).toContain("Start from Puri");
      expect(html).toContain("Add food and culinary stops");
    });
  });

  // ============================================================================
  // 3. SECURITY & INVARIANTS
  // ============================================================================
  describe("Security & Factuality Invariants", () => {
    it("escapes user-provided and model-provided HTML markup safely", () => {
      const history: ConversationTurn[] = [
        {
          role: "user",
          message: "<script>alert('xss')</script><b>Test</b>",
        },
        {
          role: "assistant",
          message: "<img src=x onerror=alert(1)> Safe text",
          is_grounded: true,
        },
      ];

      const html = renderClean(
        <AIConversationPanel
          hasItinerary={false}
          isLoading={false}
          error={null}
          history={history}
          onSend={() => {}}
        />
      );

      // React escape verification: markup is escaped, not raw executable HTML
      expect(html).toContain("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;");
      expect(html).toContain("&lt;img src=x onerror=alert(1)&gt; Safe text");
    });

    it("preserves backward-compatible single-turn planWithAi on ApiClient", async () => {
      const mockPlanResponse = {
        message: "Single turn plan",
        status: "success",
        itinerary: null,
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        text: () => Promise.resolve(JSON.stringify(mockPlanResponse)),
      } as unknown as Response);

      const client = new ApiClient({ baseUrl: "http://127.0.0.1:8000", fetchFn: mockFetch });
      const res = await client.planWithAi({ message: "Plan a trip" });

      expect(res.message).toBe("Single turn plan");
      expect(mockFetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/ai/plan",
        expect.objectEmpty ? expect.anything() : expect.any(Object)
      );
    });
  });
});

