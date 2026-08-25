import React, { useState } from "react";
import type {
  AIResponse,
  GroundedConversationResponse,
  PlanningConstraints,
} from "../../api/contracts";
import { ErrorAlert } from "../itinerary/ErrorAlert";
import {
  Send,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";
import type { ConversationTurn } from "../../store/useAIConversation";
import { getRefinementSuggestions } from "../../utils/timelineService";

interface AIConversationPanelProps {
  currentConstraints?: PlanningConstraints | null;
  hasItinerary?: boolean;
  isLoading: boolean;
  error?: unknown | null;
  aiResponse?: AIResponse | GroundedConversationResponse | null;
  groundedResponse?: GroundedConversationResponse | null;
  history?: ConversationTurn[];
  isGrounded?: boolean;
  onSend?: (message: string) => void;
  onSendMessage?: (message: string) => void;
  onRetry?: () => void;
  onClearError?: () => void;
}

export const AIConversationPanel: React.FC<AIConversationPanelProps> = ({
  currentConstraints,
  hasItinerary = false,
  isLoading,
  error = null,
  aiResponse = null,
  groundedResponse = null,
  history = [],
  onSend,
  onSendMessage,
  onRetry,
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
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2F523E]/10 text-[#2F523E] border border-[#2F523E]/30 font-mono">
            Success
          </span>
        );
      case "clarification":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1B5E6B]/10 text-[#1B5E6B] border border-[#1B5E6B]/30 font-mono">
            Clarification Needed
          </span>
        );
      case "unsupported":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] font-mono">
            Note on Request
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF7F2] text-[#70798B] border border-[#E5DFD5] font-mono">
            {status}
          </span>
        );
    }
  };

  const activeResponse = groundedResponse || aiResponse;

  return (
    <div
      data-testid="ai-conversation-panel"
      className="p-5 md:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-5 text-[#12161E]"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5DFD5]">
        <div>
          <h3 className="text-base font-serif font-bold text-[#12161E] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B87B22] animate-pulse" />
            <span>{hasItinerary ? "Conversational Refinement" : "AI Trip Assistant"}</span>
          </h3>
          <p className="text-xs text-[#70798B] mt-0.5 leading-relaxed">
            {hasItinerary
              ? "Ask your travel copilot to adjust duration, origin hub, or travel themes in English, ଓଡ଼ିଆ, or हिन्दी."
              : "Describe your dream journey in natural language, or ask questions to tailor your Odisha experience."}
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono">
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
              className="text-xs px-3.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#3D4654] hover:text-[#12161E] border border-[#E5DFD5] hover:border-[#B87B22] transition-colors disabled:opacity-50 text-left cursor-pointer"
            >
              &ldquo;{suggestion}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Multi-turn History Stream */}
      {history.length > 0 && (
        <div data-testid="ai-history-stream ai-chat-history" className="space-y-3 pt-2 border-t border-[#E5DFD5]">
          <div className="text-[10px] font-bold text-[#70798B] uppercase tracking-wider font-mono">
            Conversation History
          </div>
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {history.map((turn, idx) => {
              const toolName =
                (turn as any).tool_calls?.[0]?.name ||
                (turn as any).tool_used ||
                (turn.response as any)?.tool_used ||
                (turn.response as any)?.tool;

              return (
                <div key={idx} className="space-y-2">
                  {turn.role === "user" ? (
                    /* User Turn */
                    <div className="flex items-start gap-2.5 justify-end">
                      <div className="max-w-md p-3 rounded-2xl rounded-tr-xs bg-[#F2EEE7] text-[#12161E] text-xs border border-[#E5DFD5]">
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
                      <div className="max-w-xl p-3.5 rounded-2xl rounded-tl-xs bg-[#FAF7F2] text-[#12161E] text-xs border border-[#E5DFD5] space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[10px] text-[#B87B22] uppercase tracking-wider font-mono">
                            Travel Copilot
                          </span>
                          <div className="flex items-center gap-2">
                            {toolName && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1B5E6B]/15 text-[#1B5E6B]">
                                Tool: {toolName}
                              </span>
                            )}
                            {((turn.response as any)?.status || (turn as any).status) &&
                              getStatusBadge((turn.response as any)?.status || (turn as any).status || "")}
                          </div>
                        </div>

                        {((turn.response as any)?.status === "clarification" || (turn as any).status === "clarification") && (
                          <div data-testid="ai-clarification-box" className="font-bold text-xs text-[#1B5E6B] font-mono">
                            Clarification Needed:
                          </div>
                        )}

                        <p className="leading-relaxed">{turn.response?.message || turn.message}</p>

                        {turn.response?.changed_constraints && (
                          <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-xs font-mono text-[#3D4654] space-y-0.5">
                            <div className="font-bold text-[#B87B22]">Updated Constraints:</div>
                            {turn.response.changed_constraints.days != null && (
                              <div>Days: {turn.response.changed_constraints.days}</div>
                            )}
                            {turn.response.changed_constraints.interests && (
                              <div>Interests: {turn.response.changed_constraints.interests.join(", ")}</div>
                            )}
                            {turn.response.changed_constraints.start && (
                              <div>Start: {turn.response.changed_constraints.start}</div>
                            )}
                            {turn.response.changed_constraints.dates && (
                              <div>Dates: {turn.response.changed_constraints.dates.join(", ")}</div>
                            )}
                          </div>
                        )}

                        {turn.is_grounded !== false && (
                          <div className="text-[10px] text-[#70798B] font-mono flex items-center gap-1 mt-1 pt-1 border-t border-[#E5DFD5]">
                            <ShieldCheck size={11} className="text-[#2F523E]" />
                            <span>Grounded in verified O-Travelz data</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Response Display */}
      {activeResponse && history.length === 0 && (
        <div data-testid="ai-active-response" className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B87B22] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Travel Copilot Response</span>
            </span>
            <div className="flex items-center gap-2">
              {((activeResponse as any).tool_used || (activeResponse as any).tool) && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1B5E6B]/15 text-[#1B5E6B]">
                  Tool: {(activeResponse as any).tool_used || (activeResponse as any).tool}
                </span>
              )}
              {activeResponse.status && getStatusBadge(activeResponse.status)}
            </div>
          </div>

          {activeResponse.status === "clarification" && activeResponse.clarification && (
            <div data-testid="ai-clarification-box" className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] space-y-1">
              <div className="font-bold text-xs text-[#1B5E6B] font-mono">
                Clarification Question:
              </div>
              <p className="text-xs text-[#12161E]">{activeResponse.clarification.question}</p>
              {activeResponse.clarification.reason && (
                <div className="text-[10px] text-[#70798B] font-mono">
                  Reason: {activeResponse.clarification.reason}
                </div>
              )}
            </div>
          )}

          <p className="text-xs sm:text-sm text-[#12161E] leading-relaxed">
            {activeResponse.message}
          </p>

          {activeResponse.changed_constraints && (
            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-xs font-mono text-[#3D4654] space-y-0.5">
              <div className="font-bold text-[#B87B22]">Updated Constraints:</div>
              {activeResponse.changed_constraints.days != null && (
                <div>Days: {activeResponse.changed_constraints.days}</div>
              )}
              {activeResponse.changed_constraints.interests && (
                <div>Interests: {activeResponse.changed_constraints.interests.join(", ")}</div>
              )}
              {activeResponse.changed_constraints.start && (
                <div>Start: {activeResponse.changed_constraints.start}</div>
              )}
              {activeResponse.changed_constraints.dates && (
                <div>Dates: {activeResponse.changed_constraints.dates.join(", ")}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error alert surface */}
      {error ? (
        <ErrorAlert
          error={error}
          onDismiss={onClearError}
          onRetry={onRetry}
        />
      ) : null}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="pt-2">
        <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus-within:border-[#B87B22] focus-within:bg-[#FFFFFF] transition-all">
          <input
            type="text"
            data-testid="ai-chat-input"
            value={message}
            disabled={isLoading}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask your travel copilot (e.g. 'Add more heritage temples in Puri')..."
            className="flex-1 bg-transparent border-0 outline-hidden text-xs text-[#12161E] placeholder-[#70798B] py-1 font-medium"
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            data-testid="ai-send-button"
            className="px-3 py-2 rounded-lg bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1.5"
            aria-label={hasItinerary ? "Refine Itinerary" : "Ask AI Assistant"}
            title={hasItinerary ? "Refine Itinerary" : "Ask AI Assistant"}
          >
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <>
                <Send size={13} />
                <span>{hasItinerary ? "Refine Itinerary" : "Ask AI Assistant"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
