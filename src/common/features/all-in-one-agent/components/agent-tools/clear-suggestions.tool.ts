import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import type { Suggestion } from "@/common/features/chat/components/suggestions/suggestion.types";
import { i18n } from "@/core/hooks/use-i18n";

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
    description: i18n.t("tool.clearSuggestions.description"),
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: i18n.t("tool.clearSuggestions.reasonDescription")
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