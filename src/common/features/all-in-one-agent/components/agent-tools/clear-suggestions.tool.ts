import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import type { Suggestion } from "@/common/components/chat/suggestions/suggestion.types";

export function createClearSuggestionsTool(
  getSuggestionsManager: () => {
    suggestions: Suggestion[];
    setSuggestions: (suggestions: Suggestion[]) => void;
    addSuggestions: (suggestions: Suggestion[]) => void;
    addSuggestion: (suggestion: Suggestion) => void;
    removeSuggestion: (id: string) => void;
    clearSuggestions: () => void;
  } | null
): AgentTool {
  return {
    name: "clear_suggestions",
    description: "当当前建议不再相关或需要清理界面时使用此工具。适用于：话题转换后清除旧建议；任务完成后清理界面；用户明确拒绝所有建议后清除等场景。",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "清除建议的原因，可选"
        }
      }
    },
    execute: async (toolCall: ToolCall) => {
      const manager = getSuggestionsManager();
      if (!manager) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            error: "Suggestions manager not available"
          },
          status: "error" as const,
        };
      }

      try {
        const args = JSON.parse(toolCall.function.arguments);
        const { reason } = args;

        // 清除建议
        manager.clearSuggestions();

        return {
          toolCallId: toolCall.id,
          result: {
            success: true,
            message: "Successfully cleared all suggestions",
            reason,
            currentSuggestions: manager.suggestions
          },
          status: "success" as const,
        };
      } catch (error) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            error: `Failed to clear suggestions: ${error instanceof Error ? error.message : String(error)}`
          },
          status: "error" as const,
        };
      }
    }
  };
} 