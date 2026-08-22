import { useState, useEffect, useCallback } from "react";
import type { ConversationTurn } from "./useAIConversation";
import type { ItineraryPlanResponse, PlanningConstraints } from "../api/contracts";

export interface SavedTripConversation {
  id: string;
  title: string;
  timestamp: number;
  history: ConversationTurn[];
  constraints: PlanningConstraints | null;
  itinerary: ItineraryPlanResponse | null;
}

const STORAGE_KEY = "o_travelz_conversations";

function loadConversationsFromStorage(): SavedTripConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversationsToStorage(items: SavedTripConversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

export function generateTripTitle(
  prompt?: string,
  constraints?: PlanningConstraints | null,
  itinerary?: ItineraryPlanResponse | null
): string {
  if (itinerary && itinerary.days.length > 0) {
    const days = itinerary.days.length;
    const dayLabel = days === 1 ? "1-Day" : `${days}-Day`;
    const interest = constraints?.interests?.[0];
    if (interest) {
      const capInterest = interest.charAt(0).toUpperCase() + interest.slice(1);
      return `${dayLabel} ${capInterest} Journey`;
    }
    const firstStopName = itinerary.days[0]?.stops[0]?.place?.name;
    if (firstStopName) {
      return `${dayLabel} Trip to ${firstStopName}`;
    }
    return `${dayLabel} Odisha Itinerary`;
  }

  if (constraints) {
    const days = constraints.days || 1;
    const dayLabel = days === 1 ? "1-Day" : `${days}-Day`;
    const interest = constraints.interests?.[0];
    if (interest) {
      const capInterest = interest.charAt(0).toUpperCase() + interest.slice(1);
      return `${dayLabel} ${capInterest} Trip`;
    }
    if (constraints.start) {
      return `${dayLabel} from ${constraints.start}`;
    }
    return `${dayLabel} Odisha Plan`;
  }

  if (prompt && prompt.trim().length > 0) {
    const clean = prompt.trim();
    if (clean.length <= 28) return clean;
    return clean.slice(0, 25) + "...";
  }

  return "New Odisha Journey";
}

export function useConversationHistory() {
  const [conversations, setConversations] = useState<SavedTripConversation[]>(() =>
    loadConversationsFromStorage()
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    const initial = loadConversationsFromStorage();
    return initial.length > 0 ? initial[0].id : null;
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setConversations(loadConversationsFromStorage());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const saveOrUpdateConversation = useCallback(
    (params: {
      id?: string;
      title?: string;
      history: ConversationTurn[];
      constraints: PlanningConstraints | null;
      itinerary: ItineraryPlanResponse | null;
      promptForTitle?: string;
    }): string => {
      const existingId = params.id || activeConversationId;
      const conversationId =
        existingId ||
        `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c.id === conversationId);
        const derivedTitle =
          params.title ||
          (existingIndex >= 0 && prev[existingIndex].title !== "New Odisha Journey"
            ? prev[existingIndex].title
            : generateTripTitle(params.promptForTitle, params.constraints, params.itinerary));

        const updatedConversation: SavedTripConversation = {
          id: conversationId,
          title: derivedTitle,
          timestamp: Date.now(),
          history: params.history,
          constraints: params.constraints,
          itinerary: params.itinerary,
        };

        let updatedList: SavedTripConversation[];
        if (existingIndex >= 0) {
          updatedList = [...prev];
          updatedList[existingIndex] = updatedConversation;
        } else {
          updatedList = [updatedConversation, ...prev];
        }

        saveConversationsToStorage(updatedList);
        return updatedList;
      });

      setActiveConversationId(conversationId);
      return conversationId;
    },
    [activeConversationId]
  );

  const deleteConversation = useCallback((id: string) => {
    // Record tombstone for cloud sync
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        const raw = localStorage.getItem("o_travelz_conversations_tombstones");
        const list = raw ? JSON.parse(raw) : [];
        list.push({ id, updatedAt: Date.now() });
        localStorage.setItem("o_travelz_conversations_tombstones", JSON.stringify(list));
      } catch {
        // ignore
      }
    }

    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveConversationsToStorage(updated);
      return updated;
    });
    setActiveConversationId((current) => {
      if (current === id) {
        const remaining = loadConversationsFromStorage().filter((c) => c.id !== id);
        return remaining.length > 0 ? remaining[0].id : null;
      }
      return current;
    });
  }, []);

  const startNewTrip = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  const getActiveConversation = useCallback((): SavedTripConversation | null => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) ?? null;
  }, [activeConversationId, conversations]);

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    getActiveConversation,
    saveOrUpdateConversation,
    deleteConversation,
    startNewTrip,
  };
}
