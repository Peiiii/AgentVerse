import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import type { Suggestion } from "@/common/features/chat/components/suggestions/suggestion.types";

export interface RequestUserChoiceParams {
  title?: string;
  description?: string;
  options: Array<{
    id: string;
    content: string;
    type?: "question" | "action";
  }>;
}

export function createRequestUserChoiceTool(
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
    name: "request_user_choice",
    description: "当需要用户从多个选项中选择时使用。提供选项让用户选择，而不是替用户做决定。",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "选择标题，可选"
        },
        description: {
          type: "string", 
          description: "选择说明，可选"
        },
        options: {
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
          description: "选项列表，建议3-5个选项"
        }
      },
      required: ["options"]
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
        const params = args as RequestUserChoiceParams;
        const { title, description, options } = params;

        if (!options || options.length === 0) {
          return {
            toolCallId: toolCall.id,
            result: {
              success: false,
              error: "No options provided"
            },
            status: "error" as const,
          };
        }

        // 转换为 Suggestion 格式
        const suggestions: Suggestion[] = options.map(option => ({
          id: option.id,
          type: option.type || "action",
          actionName: option.content,
          content: option.content
        }));

        // 设置建议
        manager.setSuggestions(suggestions);

        return {
          toolCallId: toolCall.id,
          result: {
            success: true,
            message: `Successfully requested user choice with ${options.length} options`,
            title,
            description,
            options: suggestions,
            currentSuggestions: manager.suggestions
          },
          status: "success" as const,
        };
      } catch (error) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            error: `Failed to request user choice: ${error instanceof Error ? error.message : String(error)}`
          },
          status: "error" as const,
        };
      }
    }
  };
} 