import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type {
  AIResponse,
  AppContextPayload,
  GroundedConversationResponse,
  PlanningConstraints,
} from '../api/contracts';
import { useAIConversation, type ConversationTurn } from '../store/useAIConversation';
import { useConversationHistory, type SavedTripConversation } from '../store/useConversationHistory';

export interface AIContextValue {
  // Drawer visibility
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  openCopilot: () => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;

  // Active App Context (untrusted page hint)
  appContext: AppContextPayload | null;
  setAppContext: (ctx: AppContextPayload | null) => void;
  clearAppContext: () => void;
  activeContextLabel: string | null;
  contextualPrompts: string[];

  // Conversation state
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  error: unknown | null;
  aiResponse: AIResponse | null;
  groundedResponse: GroundedConversationResponse | null;
  history: ConversationTurn[];
  isGrounded: boolean;
  language: string;

  // Actions
  sendMessage: (message: string, constraints?: PlanningConstraints | null) => Promise<GroundedConversationResponse | null>;
  retryLast: (constraints?: PlanningConstraints | null) => Promise<GroundedConversationResponse | null>;
  clearError: () => void;
  resetConversation: () => void;

  // Multi-session History
  conversations: SavedTripConversation[];
  activeConversationId: string | null;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  startNewTrip: () => void;
}

const AIContext = createContext<AIContextValue | null>(null);

export interface AIProviderProps {
  children: React.ReactNode;
}

export function generateContextualPrompts(context: AppContextPayload | null): string[] {
  if (!context) {
    return [
      "Plan a 2-day Odisha trip",
      "Explore heritage temples and beaches",
      "Top nature circuits in Odisha",
      "What is near me?",
    ];
  }

  // 1. Destination / Place Detail Context
  if (context.destination && context.destination.name) {
    const name = context.destination.name;
    return [
      `Plan a trip around ${name}`,
      `What is nearby ${name}?`,
      `How do I get to ${name}?`,
      `Best authentic food near ${name}`,
    ];
  }

  // 2. Map Context
  if (context.page === 'map' || context.map) {
    const mode = context.map?.mode;
    if (mode === 'medical') {
      return [
        "Find nearest emergency hospital",
        "24/7 medical help in this district",
        "Ambulance & helpline numbers",
      ];
    }
    if (mode === 'atms' || mode === 'atm') {
      return [
        "Find closest 24/7 ATM",
        "Cash deposit machines nearby",
        "Bank branches in this area",
      ];
    }
    if (mode === 'transit') {
      const routeName = context.map?.selected_route_name || "Mo Bus";
      return [
        `Explain route ${routeName}`,
        "Where is the nearest bus stop?",
        "How do I reach my destination by bus?",
        "Mo Bus operational schedule",
      ];
    }
    if (context.map?.selected_place?.name) {
      return [
        `Tell me about ${context.map.selected_place.name}`,
        `How do I reach ${context.map.selected_place.name}?`,
        "Show nearby places on map",
      ];
    }
    return [
      "What is near my current location?",
      "Explore verified places on the map",
      "Find direct transit routes",
    ];
  }

  // 3. Planner Context
  if (context.page === 'planner' || context.planner) {
    const days = context.planner?.days || 2;
    return [
      "Optimize my current itinerary",
      `Make it a ${days + 1}-day journey`,
      "Add authentic regional food stops",
      "Suggest heritage and nature places",
    ];
  }

  // 4. Saved Places Context
  if (context.page === 'saved' || context.saved) {
    return [
      "Plan an itinerary from my saved places",
      "Which of my saved places are closest together?",
      "How do I travel between my saved destinations?",
    ];
  }

  // 5. Default Home Page Context
  return [
    "Plan a 2-day Odisha trip",
    "Explore temples and sacred heritage",
    "Find beach & lagoon getaways",
    "What is near me?",
  ];
}

export function generateActiveContextLabel(context: AppContextPayload | null): string | null {
  if (!context) return null;

  if (context.destination?.name) {
    const dist = context.destination.district ? ` · ${context.destination.district}` : '';
    return `Viewing: ${context.destination.name}${dist}`;
  }

  if (context.map?.selected_route_name) {
    return `Map: ${context.map.selected_route_name}`;
  }

  if (context.map?.selected_place?.name) {
    return `Map: ${context.map.selected_place.name}`;
  }

  if (context.map?.mode === 'medical') {
    return 'Map: Medical & Emergency Facilities';
  }

  if (context.map?.mode === 'atms' || context.map?.mode === 'atm') {
    return 'Map: 24/7 ATMs & Cash Recyclers';
  }

  if (context.planner?.start || (context.planner?.days && context.planner.days > 0)) {
    const start = context.planner.start ? ` from ${context.planner.start}` : '';
    const days = context.planner.days ? `${context.planner.days}-Day Plan` : 'Planner';
    return `Planner: ${days}${start}`;
  }

  if (context.saved?.saved_count && context.saved.saved_count > 0) {
    return `Saved: ${context.saved.saved_count} Sanctuary Place${context.saved.saved_count > 1 ? 's' : ''}`;
  }

  return null;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [appContext, setAppContext] = useState<AppContextPayload | null>(null);

  const ai = useAIConversation();
  const historyStore = useConversationHistory();

  const openCopilot = useCallback(() => setIsCopilotOpen(true), []);
  const closeCopilot = useCallback(() => setIsCopilotOpen(false), []);
  const toggleCopilot = useCallback(() => setIsCopilotOpen((prev) => !prev), []);

  const clearAppContext = useCallback(() => {
    setAppContext(null);
  }, []);

  const activeContextLabel = useMemo(() => generateActiveContextLabel(appContext), [appContext]);
  const contextualPrompts = useMemo(() => generateContextualPrompts(appContext), [appContext]);

  const sendMessage = useCallback(
    async (message: string, constraints?: PlanningConstraints | null) => {
      const res = await ai.converse(message, constraints, undefined, appContext);
      if (res && (res.itinerary || res.message)) {
        historyStore.saveOrUpdateConversation({
          history: [...ai.history, { role: "assistant", message: res.message, response: res }],
          constraints: res.changed_constraints || constraints || null,
          itinerary: res.itinerary || null,
          promptForTitle: message,
        });
      }
      return res;
    },
    [ai, appContext, historyStore]
  );

  const retryLast = useCallback(
    async (constraints?: PlanningConstraints | null) => {
      return ai.retryLast(constraints, undefined, appContext);
    },
    [ai, appContext]
  );

  const selectConversation = useCallback(
    (id: string) => {
      historyStore.setActiveConversationId(id);
      const conv = historyStore.conversations.find((c) => c.id === id);
      if (conv) {
        ai.setHistory(conv.history);
        if (conv.itinerary) {
          ai.setAiResponse({
            message: conv.history[conv.history.length - 1]?.message || "Loaded saved itinerary",
            status: "success",
            itinerary: conv.itinerary,
            clarification: null,
            changed_constraints: conv.constraints,
          });
        }
      }
    },
    [ai, historyStore]
  );

  const startNewTrip = useCallback(() => {
    ai.reset();
    historyStore.startNewTrip();
  }, [ai, historyStore]);

  const value: AIContextValue = useMemo(
    () => ({
      isCopilotOpen,
      setIsCopilotOpen,
      openCopilot,
      closeCopilot,
      toggleCopilot,
      appContext,
      setAppContext,
      clearAppContext,
      activeContextLabel,
      contextualPrompts,
      inputMessage: ai.inputMessage,
      setInputMessage: ai.setInputMessage,
      isLoading: ai.isLoading,
      error: ai.error,
      aiResponse: ai.aiResponse,
      groundedResponse: ai.groundedResponse,
      history: ai.history,
      isGrounded: ai.isGrounded,
      language: ai.language,
      sendMessage,
      retryLast,
      clearError: ai.clearError,
      resetConversation: ai.reset,
      conversations: historyStore.conversations,
      activeConversationId: historyStore.activeConversationId,
      selectConversation,
      deleteConversation: historyStore.deleteConversation,
      startNewTrip,
    }),
    [
      isCopilotOpen,
      openCopilot,
      closeCopilot,
      toggleCopilot,
      appContext,
      clearAppContext,
      activeContextLabel,
      contextualPrompts,
      ai,
      sendMessage,
      retryLast,
      historyStore.conversations,
      historyStore.activeConversationId,
      historyStore.deleteConversation,
      selectConversation,
      startNewTrip,
    ]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export function useAI(): AIContextValue {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

/**
 * Hook for pages to register their active page context with the global AI Copilot.
 * Cleans up and clears context on unmount or tab switch.
 * Gracefully ignores if used outside AIProvider (e.g., isolated page unit tests).
 */
export function useRegisterAIContext(context: AppContextPayload | null) {
  const ai = useContext(AIContext);

  useEffect(() => {
    if (!ai) return;
    if (context) {
      ai.setAppContext(context);
    }
    return () => {
      ai.setAppContext(null);
    };
  }, [ai, context]);
}

