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
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Success
          </span>
        );
      case "clarification":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            Clarification Needed
          </span>
        );
      case "unsupported":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Note on Request
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      data-testid="ai-conversation-panel"
      className="p-5 md:p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-sm space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold font-display text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{hasItinerary ? "Conversational Refinement" : "AI Trip Assistant"}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {hasItinerary
              ? "Ask your assistant to adjust days, start location, or category interests."
              : "Describe your ideal journey in natural language, or ask follow-up questions to customize your trip."}
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
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
              className="text-xs px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-gray-700 dark:text-gray-300 hover:text-emerald-900 dark:hover:text-emerald-200 border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors disabled:opacity-50 text-left cursor-pointer"
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
          className="space-y-3.5 max-h-80 overflow-y-auto p-3 rounded-2xl bg-gray-50/70 border border-gray-100"
        >
          {history.map((turn, index) => {
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
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isUser
                      ? "bg-emerald-700 text-white shadow-2xs font-medium"
                      : "bg-white text-gray-800 border border-gray-200 shadow-2xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{turn.message}</p>

                  {/* Clarification prompt banner */}
                  {!isUser && turn.response?.clarification && (
                    <div
                      data-testid="ai-clarification-box"
                      className="mt-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1"
                    >
                      <div className="font-bold text-blue-900 flex items-center gap-1">
                        <HelpCircle size={12} className="text-blue-700" />
                        <span>Clarification Needed:</span>
                      </div>
                      <p className="text-blue-900 font-medium">{turn.response.clarification.question}</p>
                    </div>
                  )}

                  {/* Updated constraints summary */}
                  {!isUser && turn.response?.changed_constraints && (
                    <div
                      data-testid="ai-changed-constraints"
                      className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5 text-[10px]"
                    >
                      {turn.response.changed_constraints.days != null && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          Days: {turn.response.changed_constraints.days}
                        </span>
                      )}
                      {turn.response.changed_constraints.interests && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          {turn.response.changed_constraints.interests.join(", ")}
                        </span>
                      )}
                      {turn.response.changed_constraints.start && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          Start: {turn.response.changed_constraints.start}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
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
          <label htmlFor="ai-message-input" className="block text-xs font-semibold text-gray-700 mb-1.5">
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
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="submit"
            data-testid="ai-submit-button"
            disabled={isLoading || !message.trim()}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
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
          className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-gray-800 space-y-3"
        >
          <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <span>AI Trip Assistant</span>
            </span>
            {getStatusBadge(aiResponse.status)}
          </div>

          <p data-testid="ai-grounded-message" className="text-gray-900 leading-relaxed text-sm">
            {aiResponse.message}
          </p>

          {aiResponse.clarification && (
            <div
              data-testid="ai-clarification-box"
              className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1"
            >
              <div className="font-semibold text-blue-900">Clarification Question:</div>
              <p className="font-medium text-blue-900">{aiResponse.clarification.question}</p>
              {aiResponse.clarification.reason && (
                <p className="text-[11px] text-blue-700">
                  Reason: {aiResponse.clarification.reason}
                </p>
              )}
            </div>
          )}

          {aiResponse.changed_constraints && (
            <div
              data-testid="ai-changed-constraints"
              className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 space-y-1"
            >
              <div className="font-semibold text-gray-900">Updated Constraints:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {aiResponse.changed_constraints.days !== undefined &&
                  aiResponse.changed_constraints.days !== null && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-medium">
                      Days: {aiResponse.changed_constraints.days}
                    </span>
                  )}
                {aiResponse.changed_constraints.interests && (
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-medium">
                    Interests: {aiResponse.changed_constraints.interests.join(", ")}
                  </span>
                )}
                {aiResponse.changed_constraints.start && (
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-medium">
                    Start: {aiResponse.changed_constraints.start}
                  </span>
                )}
                {aiResponse.changed_constraints.dates && (
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-medium">
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
