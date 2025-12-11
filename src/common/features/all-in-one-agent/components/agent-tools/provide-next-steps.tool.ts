import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import type { Suggestion } from "@/common/features/chat/components/suggestions/suggestion.types";
import { i18n } from "@/core/hooks/use-i18n";

export interface ProvideNextStepsParams {
  context: string;
  nextSteps: Array<{
    id: string;
    content: string;
    type?: "question" | "action";
  }>;
}

export function createProvideNextStepsTool(
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
    name: "provide_next_steps",
    description: i18n.t("tool.provideNextSteps.description"),
    parameters: {
      type: "object",
      properties: {
        context: {
          type: "string",
          description: i18n.t("tool.provideNextSteps.contextDescription")
        },
        nextSteps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              content: { type: "string" },
              type: { type: "string", enum: ["question", "action"] }
            },
            required: ["id", "content"]
          },
          description: i18n.t("tool.provideNextSteps.nextStepsDescription")
        }
      },
      required: ["context", "nextSteps"]
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
        const params = args as ProvideNextStepsParams;
        const { context, nextSteps } = params;

        if (!nextSteps || nextSteps.length === 0) {
          return {
            toolCallId: toolCall.id,
            result: {
              success: false,
              error: "No next steps provided"
            },
            status: "error" as const,
          };
        }

        // 转换为 Suggestion 格式
        const suggestions: Suggestion[] = nextSteps.map(step => ({
          id: step.id,
          type: step.type || "action",
          actionName: step.content,
          content: step.content
        }));

        // 设置建议
        manager.setSuggestions(suggestions);

        return {
          toolCallId: toolCall.id,
          result: {
            success: true,
            message: `Successfully provided ${nextSteps.length} next steps`,
            context,
            nextSteps: suggestions,
            currentSuggestions: manager.suggestions
          },
          status: "success" as const,
        };
      } catch (error) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            error: `Failed to provide next steps: ${error instanceof Error ? error.message : String(error)}`
          },
          status: "error" as const,
        };
      }
    }
  };
} 