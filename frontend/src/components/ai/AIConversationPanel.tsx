import React, { useState } from "react";
import type { AIResponse, PlanningConstraints } from "../../api/contracts";
import { ErrorAlert } from "../itinerary/ErrorAlert";
import { Bot, Send, Sparkles, User, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";
import type { ConversationTurn } from "../../store/useAIConversation";

import { getRefinementSuggestions } from "../../utils/timelineService";

interface AIConversationPanelProps {
  currentConstraints?: PlanningConstraints | null;
  hasItinerary?: boolean;
  isLoading: boolean;
  error?: unknown | null;
  aiResponse?: AIResponse | null;
  history?: ConversationTurn[];
  onSend?: (message: string) => void;
  onSendMessage?: (message: string) => void;
  onClearError?: () => void;
}

export const AIConversationPanel: React.FC<AIConversationPanelProps> = ({
  currentConstraints,
  hasItinerary = false,
  isLoading,
  error = null,
  aiResponse = null,
  history = [],
  onSend,
  onSendMessage,
  onClearError,
}) => {
  const [message, setMessage] = useState<string>("");
  const sendMessage = onSend || onSendMessage || (() => {});
  const refinementSuggestions = getRefinementSuggestions(currentConstraints, hasItinerary);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    sendMessage(message);
    setMessage("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    sendMessage(suggestion);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#14B8A6]/20 text-teal-300 border border-[#14B8A6]/40">
            Success
          </span>
        );
      case "clarification":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">
            Clarification Needed
          </span>
        );
      case "unsupported":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
            Note on Request
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#172235] text-slate-300 border border-[#263244]">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      data-testid="ai-conversation-panel"
      className="p-5 md:p-6 rounded-3xl bg-[#111827] border border-[#263244] shadow-sm space-y-5 text-white"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#263244]">
        <div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span>{hasItinerary ? "Conversational Refinement" : "AI Trip Assistant"}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {hasItinerary
              ? "Ask your assistant to adjust days, start location, or category interests."
              : "Describe your ideal journey in natural language, or ask follow-up questions to customize your trip."}
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          Suggested Prompts
        </span>
        <div className="flex flex-wrap gap-2">
          {refinementSuggestions.map((suggestion, index) => (
            <button
              type="button"
              key={index}
              disabled={isLoading}
              onClick={() => handleSuggestionClick(suggestion)}
              data-testid={`ai-suggestion-${index}`}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-[#172235] hover:bg-[#1E2D44] text-slate-300 hover:text-white border border-[#263244] hover:border-[#8B5CF6]/50 transition-colors disabled:opacity-50 text-left cursor-pointer"
            >
              &ldquo;{suggestion}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Chat History View */}
      {history.length > 0 && (
        <div
          data-testid="ai-chat-history"
          className="space-y-3.5 max-h-80 overflow-y-auto p-3 rounded-2xl bg-[#0B1220] border border-[#263244]"
        >
          {history.map((turn, index) => {
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
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isUser
                      ? "bg-[#14B8A6] text-white shadow-2xs font-medium"
                      : "bg-[#172235] text-slate-200 border border-[#263244] shadow-2xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{turn.message}</p>

                  {/* Clarification prompt banner */}
                  {!isUser && turn.response?.clarification && (
                    <div
                      data-testid="ai-clarification-box"
                      className="mt-2.5 p-2.5 rounded-xl bg-blue-950/70 border border-blue-800 text-blue-200 space-y-1"
                    >
                      <div className="font-bold text-blue-300 flex items-center gap-1">
                        <HelpCircle size={12} className="text-blue-400" />
                        <span>Clarification Needed:</span>
                      </div>
                      <p className="text-blue-200 font-medium">{turn.response.clarification.question}</p>
                    </div>
                  )}

                  {/* Updated constraints summary */}
                  {!isUser && turn.response?.changed_constraints && (
                    <div
                      data-testid="ai-changed-constraints"
                      className="mt-2 pt-2 border-t border-[#263244] flex flex-wrap gap-1.5 text-[10px]"
                    >
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
          })}
        </div>
      )}

      {/* Input Message Box */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="ai-message-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
            {hasItinerary ? "Refinement Request" : "Trip Request"}
          </label>
          <div className="relative">
            <input
              id="ai-message-input"
              data-testid="ai-message-input"
              type="text"
              placeholder={
                hasItinerary
                  ? "e.g. 'Add temples and make it 3 days' or 'Start from Daringbadi'"
                  : "e.g. 'I want a 2 day heritage and food trip in Bhubaneswar'"
              }
              value={message}
              disabled={isLoading}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#334155] bg-[#0B1220] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] disabled:bg-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="submit"
            data-testid="ai-submit-button"
            disabled={isLoading || !message.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {hasItinerary ? "Refine Itinerary" : "Ask AI Assistant"}
          </button>
        </div>
      </form>

      {/* Error alert */}
      {error != null && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Static Fallback card if aiResponse exists */}
      {aiResponse && (
        <div
          data-testid="ai-response-card"
          className="p-4 sm:p-5 rounded-2xl bg-[#172235] border border-[#263244] text-xs text-slate-200 space-y-3"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#263244] pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>AI Trip Assistant</span>
            </span>
            {getStatusBadge(aiResponse.status)}
          </div>

          <p data-testid="ai-grounded-message" className="text-white leading-relaxed text-sm">
            {aiResponse.message}
          </p>

          {aiResponse.clarification && (
            <div
              data-testid="ai-clarification-box"
              className="p-3.5 rounded-xl bg-blue-950/70 border border-blue-800 text-blue-200 space-y-1"
            >
              <div className="font-semibold text-blue-300">Clarification Question:</div>
              <p className="font-medium text-blue-200">{aiResponse.clarification.question}</p>
              {aiResponse.clarification.reason && (
                <p className="text-[11px] text-blue-400">
                  Reason: {aiResponse.clarification.reason}
                </p>
              )}
            </div>
          )}

          {aiResponse.changed_constraints && (
            <div
              data-testid="ai-changed-constraints"
              className="p-3.5 rounded-xl bg-[#0B1220] border border-[#263244] text-slate-300 space-y-1"
            >
              <div className="font-semibold text-white">Updated Constraints:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {aiResponse.changed_constraints.days !== undefined &&
                  aiResponse.changed_constraints.days !== null && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#172235] border border-[#263244] font-medium text-teal-300">
                      Days: {aiResponse.changed_constraints.days}
                    </span>
                  )}
                {aiResponse.changed_constraints.interests && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#172235] border border-[#263244] font-medium text-teal-300">
                    Interests: {aiResponse.changed_constraints.interests.join(", ")}
                  </span>
                )}
                {aiResponse.changed_constraints.start && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#172235] border border-[#263244] font-medium text-teal-300">
                    Start: {aiResponse.changed_constraints.start}
                  </span>
                )}
                {aiResponse.changed_constraints.dates && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#172235] border border-[#263244] font-medium text-teal-300">
                    Dates: {aiResponse.changed_constraints.dates.join(", ")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
