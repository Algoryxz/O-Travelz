import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Plus,
  Trash2,
  History,
  User,
  Compass,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { AIResponse, ItineraryPlanResponse } from "../../api/contracts";
import type { ConversationTurn } from "../../store/useAIConversation";
import type { SavedTripConversation } from "../../store/useConversationHistory";
import { ErrorAlert } from "../itinerary/ErrorAlert";
import { getRefinementSuggestions } from "../../utils/timelineService";

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error?: unknown | null;
  history: ConversationTurn[];
  aiResponse?: AIResponse | null;
  onSend?: (message: string) => void;
  onSendMessage?: (message: string) => void;
  onClearError?: () => void;
  hasItinerary?: boolean;
  activeItinerary?: ItineraryPlanResponse | null;
  conversations?: SavedTripConversation[];
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onNewTrip?: () => void;
  onDeleteConversation?: (id: string) => void;
  onViewItineraryTab?: () => void;
}

export const AISidebar: React.FC<AISidebarProps> = ({
  isOpen,
  onClose,
  isLoading,
  error = null,
  history = [],
  aiResponse = null,
  onSend,
  onSendMessage,
  onClearError,
  hasItinerary = false,
  activeItinerary = null,
  conversations = [],
  activeConversationId = null,
  onSelectConversation = () => {},
  onNewTrip = () => {},
  onDeleteConversation = () => {},
  onViewItineraryTab,
}) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const sendMessage = onSend || onSendMessage || (() => {});
  const [showHistoryList, setShowHistoryList] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refinementPrompts = getRefinementSuggestions(
    activeItinerary?.constraints,
    hasItinerary
  );

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, aiResponse, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleSuggestion = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  return (
    <div
      data-testid="ai-travel-sidebar"
      aria-label="AI Travel Planner Sidebar"
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#12161E]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className="relative w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col z-10 border-l border-[#E5DFD5] animate-in slide-in-from-right duration-300 text-[#12161E]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E5DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B87B22] text-white flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#12161E] tracking-tight">
                Travel Copilot
              </span>
              <p className="text-xs text-[#70798B] font-mono">Multilingual Odisha Copilot</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="sidebar-new-trip-btn"
              onClick={onNewTrip}
              className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2EEE7] text-[#3D4654] hover:text-[#12161E] border border-[#E5DFD5] transition-colors cursor-pointer"
              title="New Trip"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              data-testid="sidebar-history-toggle"
              onClick={() => setShowHistoryList(!showHistoryList)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                showHistoryList
                  ? "bg-[#B87B22] text-white border-[#B87B22]"
                  : "bg-[#FFFFFF] text-[#3D4654] border-[#E5DFD5] hover:bg-[#F2EEE7]"
              }`}
              title="Saved Trip Conversations"
            >
              <History size={16} />
            </button>
            <button
              type="button"
              data-testid="close-ai-sidebar-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2EEE7] text-[#3D4654] hover:text-[#12161E] border border-[#E5DFD5] transition-colors cursor-pointer"
              aria-label="Close copilot"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Saved Conversations Dropdown Accordion */}
        {showHistoryList && (
          <div className="p-3 bg-[#FAF7F2] border-b border-[#E5DFD5] max-h-48 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono px-2 py-1">
              Saved Trip Conversations
            </div>
            {conversations.length === 0 ? (
              <p className="text-xs text-[#70798B] px-2 py-1 italic">No saved conversations yet.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    activeConversationId === conv.id
                      ? "bg-[#FFFFFF] text-[#12161E] font-bold border border-[#E5DFD5]"
                      : "text-[#3D4654] hover:bg-[#F2EEE7]"
                  }`}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    setShowHistoryList(false);
                  }}
                >
                  <span className="truncate flex-1">{conv.title}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="text-[#70798B] hover:text-[#A84825] p-1 cursor-pointer"
                    title="Delete Conversation"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Message */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#B87B22] text-white flex items-center justify-center shrink-0">
              <Sparkles size={13} />
            </div>
            <div className="max-w-[85%] p-3 rounded-xl bg-[#FAF7F2] text-xs text-[#12161E] border border-[#E5DFD5] space-y-1">
              <div className="font-bold text-[10px] text-[#B87B22] uppercase tracking-wider font-mono">
                O-Travelz Assistant
              </div>
              <p className="leading-relaxed">
                Namaskar! I can help you plan, optimize, and discover destinations across Odisha. Where would you like to travel?
              </p>
            </div>
          </div>

          {/* Conversation Turns */}
          {history.map((turn, idx) => (
            <div key={idx} className="space-y-2">
              {turn.role === "user" ? (
                /* User Turn */
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="max-w-[85%] p-3 rounded-xl bg-[#F2EEE7] text-xs text-[#12161E] border border-[#E5DFD5]">
                    <div className="font-bold text-[10px] text-[#70798B] mb-0.5 uppercase tracking-wider font-mono">
                      You
                    </div>
                    <div>{turn.message}</div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#12161E] text-white flex items-center justify-center shrink-0">
                    <User size={13} />
                  </div>
                </div>
              ) : (
                /* Assistant Turn */
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#B87B22] text-white flex items-center justify-center shrink-0">
                    <Sparkles size={13} />
                  </div>
                  <div className="max-w-[85%] p-3 rounded-xl bg-[#FAF7F2] text-xs text-[#12161E] border border-[#E5DFD5] space-y-1">
                    <div className="font-bold text-[10px] text-[#B87B22] uppercase tracking-wider font-mono">
                      Travel Copilot
                    </div>
                    <p className="leading-relaxed">{turn.message || turn.response?.message}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {refinementPrompts.length > 0 && (
          <div className="p-3 bg-[#FAF7F2] border-t border-[#E5DFD5] space-y-1.5">
            <span className="text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono">
              Quick Suggestions
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {refinementPrompts.slice(0, 4).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  data-testid={`sidebar-suggestion-${idx}`}
                  onClick={() => handleSuggestion(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E5DFD5] text-[11px] text-[#3D4654] hover:text-[#12161E] hover:border-[#B87B22] whitespace-nowrap cursor-pointer disabled:opacity-40 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-[#E5DFD5] bg-[#FFFFFF]">
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus-within:border-[#B87B22] focus-within:bg-[#FFFFFF] transition-all">
            <input
              ref={inputRef}
              type="text"
              data-testid="sidebar-ai-input"
              value={inputMessage}
              disabled={isLoading}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about Odisha..."
              className="flex-1 bg-transparent border-0 outline-hidden text-xs text-[#12161E] placeholder-[#70798B] font-medium"
            />
            <button
              type="submit"
              data-testid="sidebar-ai-submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              aria-label="Send"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};
