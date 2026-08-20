import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Bot,
  Send,
  Sparkles,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  User,
  Compass,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { AIResponse, PlanningConstraints, ItineraryPlanResponse } from "../../api/contracts";
import type { ConversationTurn } from "../../store/useAIConversation";
import type { SavedTripConversation } from "../../store/useConversationHistory";
import { ErrorAlert } from "../itinerary/ErrorAlert";
import { getRefinementSuggestions } from "../../utils/timelineService";

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: unknown | null;
  history: ConversationTurn[];
  aiResponse: AIResponse | null;
  onSend: (message: string) => void;
  onClearError?: () => void;
  hasItinerary: boolean;
  activeItinerary?: ItineraryPlanResponse | null;
  conversations: SavedTripConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewTrip: () => void;
  onDeleteConversation: (id: string) => void;
  onViewItineraryTab?: () => void;
}

export const AISidebar: React.FC<AISidebarProps> = ({
  isOpen,
  onClose,
  isLoading,
  error,
  history,
  aiResponse,
  onSend,
  onClearError,
  hasItinerary,
  activeItinerary,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewTrip,
  onDeleteConversation,
  onViewItineraryTab,
}) => {
  const [inputMessage, setInputMessage] = useState<string>("");
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
    onSend(inputMessage);
    setInputMessage("");
  };

  const handleSuggestion = (prompt: string) => {
    if (isLoading) return;
    onSend(prompt);
  };

  return (
    <div
      data-testid="ai-travel-sidebar"
      aria-label="AI Travel Planner Sidebar"
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className="relative w-full max-w-[420px] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-gray-200 dark:border-emerald-900/40 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-emerald-900/30 bg-gray-50/70 dark:bg-slate-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="live-dot" />
                <h2 className="font-display font-extrabold text-sm text-gray-900 dark:text-white truncate">
                  AI Travel Planner
                </h2>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Transportation-aware trip copilot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* New Trip Button */}
            <button
              type="button"
              data-testid="sidebar-new-trip-btn"
              onClick={onNewTrip}
              title="Start a new trip"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              data-testid="sidebar-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Saved Trips Drawer Toggle Bar */}
        <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            data-testid="sidebar-toggle-history-btn"
            onClick={() => setShowHistoryList(!showHistoryList)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-700 transition-colors py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <History size={13} className="text-emerald-600" />
              <span>Your Saved Trips ({conversations.length})</span>
            </div>
            {showHistoryList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHistoryList && (
            <div
              data-testid="sidebar-trips-list"
              className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-in fade-in duration-150"
            >
              {conversations.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-gray-400">
                  No saved trips yet. Ask AI to plan one!
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = c.id === activeConversationId;
                  const dateStr = new Date(c.timestamp).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={c.id}
                      data-testid={`sidebar-trip-item-${c.id}`}
                      onClick={() => onSelectConversation(c.id)}
                      className={`w-full p-2.5 rounded-xl text-left flex items-start justify-between text-xs transition-all cursor-pointer border ${
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 font-semibold border-emerald-300 dark:border-emerald-700 shadow-2xs"
                          : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 border-transparent"
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="truncate font-bold text-gray-900 dark:text-white">
                          {c.title}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex flex-wrap items-center gap-1">
                          <span>{dateStr}</span>
                          {c.itinerary && <span>· {c.itinerary.days.length}d</span>}
                          {c.constraints?.start && (
                            <span className="text-emerald-700 dark:text-emerald-400">· {c.constraints.start}</span>
                          )}
                        </div>
                        {c.constraints?.interests && c.constraints.interests.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {c.constraints.interests.slice(0, 2).map((intId) => (
                              <span
                                key={intId}
                                className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold capitalize"
                              >
                                {intId}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label={`Delete trip ${c.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(c.id);
                        }}
                        className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0 mt-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Active Itinerary Banner if present */}
        {hasItinerary && activeItinerary && (
          <div className="p-3 mx-4 mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Active Itinerary</span>
              </div>
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {activeItinerary.days.length} Days · {activeItinerary.days.reduce((acc, d) => acc + d.stops.length, 0)} Places
              </div>
            </div>

            {onViewItineraryTab && (
              <button
                type="button"
                onClick={() => {
                  onViewItineraryTab();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
              >
                View Plan
              </button>
            )}
          </div>
        )}

        {/* Conversation Message Feed */}
        <div
          data-testid="sidebar-chat-feed"
          className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs"
        >
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-gray-400 dark:text-gray-500">
              <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                  Odisha Travel Assistant
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
                  Ask me to plan a custom trip, refine your route, or add specific attractions.
                </p>
              </div>
            </div>
          ) : (
            history.map((turn, index) => {
              const isUser = turn.role === "user";
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? "bg-emerald-700 text-white shadow-2xs font-medium"
                        : "bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 shadow-2xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{turn.message}</p>

                    {/* Clarification prompt banner */}
                    {!isUser && turn.response?.clarification && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200 space-y-1">
                        <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1 text-[11px]">
                          <HelpCircle size={12} className="text-blue-700 dark:text-blue-400" />
                          <span>Clarification Needed:</span>
                        </div>
                        <p className="text-blue-900 dark:text-blue-200 font-medium">
                          {turn.response.clarification.question}
                        </p>
                      </div>
                    )}

                    {/* Updated constraints summary */}
                    {!isUser && turn.response?.changed_constraints && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700 flex flex-wrap gap-1.5 text-[10px]">
                        {turn.response.changed_constraints.days != null && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                            Days: {turn.response.changed_constraints.days}
                          </span>
                        )}
                        {turn.response.changed_constraints.interests && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                            {turn.response.changed_constraints.interests.join(", ")}
                          </span>
                        )}
                        {turn.response.changed_constraints.start && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                            Start: {turn.response.changed_constraints.start}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                      <User size={14} />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 p-2">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-[11px] font-medium ml-1">AI is planning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert if any */}
        {error != null && (
          <div className="px-4">
            <ErrorAlert error={error} onDismiss={onClearError} />
          </div>
        )}

        {/* Suggested Refinements */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-emerald-900/30 bg-gray-50/50 dark:bg-slate-950">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Suggested Refinements
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {refinementPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                data-testid={`sidebar-suggestion-${idx}`}
                disabled={isLoading}
                onClick={() => handleSuggestion(prompt)}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 hover:text-emerald-900 dark:hover:text-emerald-200 border border-gray-200 dark:border-slate-700 text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-emerald-900/40"
        >
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              data-testid="sidebar-ai-input"
              type="text"
              placeholder={
                hasItinerary
                  ? "e.g. 'Add food stops', 'Make it 3 days'..."
                  : "e.g. 'Plan a 2-day nature trip in Koraput'..."
              }
              value={inputMessage}
              disabled={isLoading}
              onChange={(e) => setInputMessage(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 disabled:opacity-60"
            />
            <button
              type="submit"
              data-testid="sidebar-ai-submit"
              disabled={isLoading || !inputMessage.trim()}
              className="absolute right-2 w-8 h-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};
