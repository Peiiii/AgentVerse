import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import type { Suggestion } from "@/common/components/chat/suggestions/suggestion.types";

export interface RecommendTopicsParams {
  context?: "greeting" | "general" | "learning" | "health" | "work" | "shopping" | "travel";
  topics: Array<{
    id: string;
    content: string;
    type?: "question" | "action";
  }>;
}

export function createRecommendTopicsTool(
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
    name: "recommend_topics",
    description: "当用户打招呼或需要话题引导时使用。主动推荐相关服务话题让用户选择。",
    parameters: {
      type: "object",
      properties: {
        context: {
          type: "string",
          enum: ["greeting", "general", "learning", "health", "work", "shopping", "travel"],
          description: "推荐上下文，greeting=问候时，general=通用，其他为特定领域"
        },
        topics: {
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
          description: "推荐话题列表，建议3-5个话题"
        }
      },
      required: ["topics"]
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
        const params = args as RecommendTopicsParams;
        const { context, topics } = params;

        if (!topics || topics.length === 0) {
          return {
            toolCallId: toolCall.id,
            result: {
              success: false,
              error: "No topics provided"
            },
            status: "error" as const,
          };
        }

        // 转换为 Suggestion 格式
        const suggestions: Suggestion[] = topics.map(topic => ({
          id: topic.id,
          type: topic.type || "action",
          actionName: topic.content,
          content: topic.content
        }));

        // 设置建议
        manager.setSuggestions(suggestions);

        return {
          toolCallId: toolCall.id,
          result: {
            success: true,
            message: `Successfully recommended ${topics.length} topics`,
            context,
            topics: suggestions,
            currentSuggestions: manager.suggestions
          },
          status: "success" as const,
        };
      } catch (error) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            error: `Failed to recommend topics: ${error instanceof Error ? error.message : String(error)}`
          },
          status: "error" as const,
        };
      }
    }
  };
} 