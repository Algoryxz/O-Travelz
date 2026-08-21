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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className="relative w-full max-w-[420px] bg-[#111827] h-full shadow-2xl flex flex-col z-10 border-l border-[#263244] animate-in slide-in-from-right duration-300 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#263244] bg-[#0B1220] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="live-dot" />
                <h2 className="font-display font-extrabold text-sm text-white truncate">
                  AI Travel Planner
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
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
              className="px-2.5 py-1.5 rounded-xl bg-[#172235] hover:bg-[#1E2D44] text-teal-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-[#263244]"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              data-testid="sidebar-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#172235] hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-[#263244]"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Saved Trips Drawer Toggle Bar */}
        <div className="px-4 py-2 border-b border-[#263244] bg-[#0E1626]">
          <button
            type="button"
            data-testid="sidebar-toggle-history-btn"
            onClick={() => setShowHistoryList(!showHistoryList)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <History size={13} className="text-[#F59E0B]" />
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
                <div className="p-3 text-center text-[11px] text-slate-400">
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
                          ? "bg-[#172235] text-white font-semibold border-[#14B8A6] shadow-2xs"
                          : "hover:bg-[#172235]/60 text-slate-300 border-transparent"
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="truncate font-bold text-white">
                          {c.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1">
                          <span>{dateStr}</span>
                          {c.itinerary && <span>· {c.itinerary.days.length}d</span>}
                          {c.constraints?.start && (
                            <span className="text-teal-300">· {c.constraints.start}</span>
                          )}
                        </div>
                        {c.constraints?.interests && c.constraints.interests.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {c.constraints.interests.slice(0, 2).map((intId) => (
                              <span
                                key={intId}
                                className="text-[9px] px-1.5 py-0.2 rounded bg-[#111827] text-teal-300 border border-[#263244] font-semibold capitalize"
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
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0 mt-0.5"
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
          <div className="p-3 mx-4 mt-3 rounded-2xl bg-[#172235] border border-[#263244] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-300 font-mono flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Active Itinerary</span>
              </div>
              <div className="text-xs font-bold text-white truncate">
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
                className="px-3 py-1.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
              >
                View Plan
              </button>
            )}
          </div>
        )}

        {/* Conversation Message Feed */}
        <div
          data-testid="sidebar-chat-feed"
          className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#0B1220]"
        >
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
              <div className="w-14 h-14 rounded-3xl bg-[#172235] text-[#8B5CF6] flex items-center justify-center font-bold border border-[#263244]">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Odisha Travel Assistant
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
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
                    <div className="w-7 h-7 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? "bg-[#14B8A6] text-white shadow-2xs font-medium"
                        : "bg-[#172235] text-slate-200 border border-[#263244] shadow-2xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{turn.message}</p>

                    {/* Clarification prompt banner */}
                    {!isUser && turn.response?.clarification && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-blue-950/70 border border-blue-800 text-blue-200 space-y-1">
                        <div className="font-bold text-blue-300 flex items-center gap-1 text-[11px]">
                          <HelpCircle size={12} className="text-blue-400" />
                          <span>Clarification Needed:</span>
                        </div>
                        <p className="text-blue-200 font-medium">
                          {turn.response.clarification.question}
                        </p>
                      </div>
                    )}

                    {/* Updated constraints summary */}
                    {!isUser && turn.response?.changed_constraints && (
                      <div className="mt-2 pt-2 border-t border-[#263244] flex flex-wrap gap-1.5 text-[10px]">
                        {turn.response.changed_constraints.days != null && (
                          <span className="px-2 py-0.5 rounded-md bg-[#111827] text-teal-300 font-semibold border border-[#263244]">
                            Days: {turn.response.changed_constraints.days}
                          </span>
                        )}
                        {turn.response.changed_constraints.interests && (
                          <span className="px-2 py-0.5 rounded-md bg-[#111827] text-teal-300 font-semibold border border-[#263244]">
                            {turn.response.changed_constraints.interests.join(", ")}
                          </span>
                        )}
                        {turn.response.changed_constraints.start && (
                          <span className="px-2 py-0.5 rounded-md bg-[#111827] text-teal-300 font-semibold border border-[#263244]">
                            Start: {turn.response.changed_constraints.start}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-[#172235] text-slate-300 flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5 border border-[#263244]">
                      <User size={14} />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 p-2">
              <div className="w-7 h-7 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-[#172235] border border-[#263244] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-[11px] font-medium ml-1 text-slate-300">AI is planning...</span>
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
        <div className="px-4 py-2 border-t border-[#263244] bg-[#0E1626]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
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
                className="shrink-0 px-2.5 py-1 rounded-xl bg-[#172235] hover:bg-[#1E2D44] text-slate-300 hover:text-white border border-[#263244] text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-[#0B1220] border-t border-[#263244]"
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
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-[#111827] border border-[#334155] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
            />
            <button
              type="submit"
              data-testid="sidebar-ai-submit"
              disabled={isLoading || !inputMessage.trim()}
              className="absolute right-2 w-8 h-8 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
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
