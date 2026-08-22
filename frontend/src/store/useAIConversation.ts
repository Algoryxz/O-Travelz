import { useState, useCallback } from "react";
import { apiClient as defaultApiClient, ApiClient } from "../api/client";
import type {
  AIConverseRequest,
  AIPlanRequest,
  AIResponse,
  ChatMessage,
  ChatRole,
  GroundedConversationResponse,
  PlanningConstraints,
  ToolCall,
  ToolResult,
} from "../api/contracts";

export interface ConversationTurn {
  role: "user" | "assistant" | "system" | "tool";
  message: string;
  response?: AIResponse | GroundedConversationResponse;
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
  is_grounded?: boolean;
  language?: string;
}

export interface AIConversationHook {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  error: unknown | null;
  aiResponse: AIResponse | null;
  groundedResponse: GroundedConversationResponse | null;
  history: ConversationTurn[];
  isGrounded: boolean;
  language: string;
  setAiResponse: (res: AIResponse | null) => void;
  setGroundedResponse: (res: GroundedConversationResponse | null) => void;
  setHistory: (history: ConversationTurn[]) => void;
  converse: (
    userMessage: string,
    currentConstraints?: PlanningConstraints | null,
    customClient?: ApiClient
  ) => Promise<GroundedConversationResponse | null>;
  sendAiPlan: (
    userMessage: string,
    currentConstraints?: PlanningConstraints | null,
    customClient?: ApiClient
  ) => Promise<AIResponse | null>;
  retryLast: (
    currentConstraints?: PlanningConstraints | null,
    customClient?: ApiClient
  ) => Promise<GroundedConversationResponse | null>;
  clearError: () => void;
  reset: () => void;
}

export function useAIConversation(): AIConversationHook {
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [groundedResponse, setGroundedResponse] = useState<GroundedConversationResponse | null>(null);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [isGrounded, setIsGrounded] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("en");

  const converse = useCallback(
    async (
      userMessage: string,
      currentConstraints?: PlanningConstraints | null,
      customClient?: ApiClient
    ): Promise<GroundedConversationResponse | null> => {
      const trimmed = userMessage.trim();
      if (!trimmed) return null;

      const client = customClient ?? defaultApiClient;
      setIsLoading(true);
      setError(null);

      // Build previous turn history for multi-turn conversational context
      const previousMessages: ChatMessage[] = history.map((turn) => ({
        role: turn.role as ChatRole,
        content: turn.message,
        tool_calls: turn.tool_calls,
      }));

      const userChatMessage: ChatMessage = {
        role: "user",
        content: trimmed,
      };

      const messages: ChatMessage[] = [...previousMessages, userChatMessage];

      // Optimistically add user turn to conversation history
      setHistory((prev) => [...prev, { role: "user", message: trimmed }]);

      try {
        const payload: AIConverseRequest = {
          messages,
          constraints: currentConstraints ?? null,
        };

        const response = await client.converseWithAi(payload);
        setGroundedResponse(response);
        setIsGrounded(response.is_grounded);
        setLanguage(response.language || "en");

        // Maintain backward compatibility for consumers expecting aiResponse
        const compatibleAiResponse: AIResponse = {
          message: response.message,
          status: response.status,
          itinerary: response.itinerary,
          clarification: response.clarification,
          changed_constraints: response.changed_constraints,
          extracted_constraints: response.changed_constraints,
        };
        setAiResponse(compatibleAiResponse);

        setHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            message: response.message,
            response,
            tool_calls: response.tool_calls,
            tool_results: response.tool_results,
            is_grounded: response.is_grounded,
            language: response.language,
          },
        ]);

        setInputMessage("");
        setIsLoading(false);
        return response;
      } catch (err) {
        setError(err);
        setIsLoading(false);
        return null;
      }
    },
    [history]
  );

  const sendAiPlan = useCallback(
    async (
      userMessage: string,
      currentConstraints?: PlanningConstraints | null,
      customClient?: ApiClient
    ): Promise<AIResponse | null> => {
      const res = await converse(userMessage, currentConstraints, customClient);
      if (!res) return null;
      return {
        message: res.message,
        status: res.status,
        itinerary: res.itinerary,
        clarification: res.clarification,
        changed_constraints: res.changed_constraints,
        extracted_constraints: res.changed_constraints,
      };
    },
    [converse]
  );

  const retryLast = useCallback(
    async (
      currentConstraints?: PlanningConstraints | null,
      customClient?: ApiClient
    ): Promise<GroundedConversationResponse | null> => {
      const lastUserTurn = [...history].reverse().find((t) => t.role === "user");
      if (!lastUserTurn) return null;
      return converse(lastUserTurn.message, currentConstraints, customClient);
    },
    [converse, history]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setInputMessage("");
    setIsLoading(false);
    setError(null);
    setAiResponse(null);
    setGroundedResponse(null);
    setHistory([]);
    setIsGrounded(true);
    setLanguage("en");
  }, []);

  return {
    inputMessage,
    setInputMessage,
    isLoading,
    error,
    aiResponse,
    groundedResponse,
    history,
    isGrounded,
    language,
    setAiResponse,
    setGroundedResponse,
    setHistory,
    converse,
    sendAiPlan,
    retryLast,
    clearError,
    reset,
  };
}
