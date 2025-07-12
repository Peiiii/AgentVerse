import type { Suggestion } from "@/common/components/chat/suggestions/suggestion.types";
import type { AgentTool } from "../preview";


/**
 * 创建 suggestions tool
 * @param onShowSuggestions 回调函数，参数为建议列表
 * @returns AgentTool
 */

export function createSuggestionsTool(onShowSuggestions: (suggestions: Suggestion[]) => void): AgentTool {
  return {
    name: 'showSuggestions',
    description: '展示推荐问题或操作建议',
    parameters: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              type: { type: 'string', enum: ['question', 'action', 'link', 'tool', 'topic'] },
              description: { type: 'string' },
              icon: { type: 'string' },
              metadata: { type: 'object' }
            },
            required: ['id', 'title', 'content', 'type']
          },
          description: '要展示的建议项列表'
        }
      },
      required: ['suggestions']
    },
    execute: async (toolCall) => {
      const args = JSON.parse(toolCall.function.arguments);
      onShowSuggestions(args.suggestions as Suggestion[]);
      return {
        toolCallId: toolCall.id,
        result: { shown: true },
        status: 'success' as const
      };
    }
  };
}
