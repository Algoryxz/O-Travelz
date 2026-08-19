import { useState, useCallback } from "react";
import { apiClient as defaultApiClient, ApiClient } from "../api/client";
import type { AIPlanRequest, AIResponse, PlanningConstraints } from "../api/contracts";

export interface ConversationTurn {
  role: "user" | "assistant";
  message: string;
  response?: AIResponse;
}

export interface AIConversationHook {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  error: unknown | null;
  aiResponse: AIResponse | null;
  history: ConversationTurn[];
  setAiResponse: (res: AIResponse | null) => void;
  setHistory: (history: ConversationTurn[]) => void;
  sendAiPlan: (
    userMessage: string,
    currentConstraints?: PlanningConstraints | null,
    customClient?: ApiClient
  ) => Promise<AIResponse | null>;
  clearError: () => void;
  reset: () => void;
}

export function useAIConversation(): AIConversationHook {
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [history, setHistory] = useState<ConversationTurn[]>([]);

  const sendAiPlan = useCallback(
    async (
      userMessage: string,
      currentConstraints?: PlanningConstraints | null,
      customClient?: ApiClient
    ): Promise<AIResponse | null> => {
      const trimmed = userMessage.trim();
      if (!trimmed) return null;

      const client = customClient ?? defaultApiClient;
      setIsLoading(true);
      setError(null);

      // Add user turn to conversation history
      setHistory((prev) => [...prev, { role: "user", message: trimmed }]);

      try {
        const payload: AIPlanRequest = {
          message: trimmed,
          constraints: currentConstraints ?? null,
        };

        const response = await client.planWithAi(payload);
        setAiResponse(response);
        setHistory((prev) => [
          ...prev,
          { role: "assistant", message: response.message, response },
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
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setInputMessage("");
    setIsLoading(false);
    setError(null);
    setAiResponse(null);
    setHistory([]);
  }, []);

  return {
    inputMessage,
    setInputMessage,
    isLoading,
    error,
    aiResponse,
    history,
    setAiResponse,
    setHistory,
    sendAiPlan,
    clearError,
    reset,
  };
}
