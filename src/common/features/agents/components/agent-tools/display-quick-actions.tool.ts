import type { Suggestion } from "@/common/components/chat/suggestions/suggestion.types";
import type { AgentTool } from "../preview";

/**
 * 创建快速操作按钮工具
 * @param onShowQuickActions 回调函数，参数为建议列表
 * @returns AgentTool
 */

export function createDisplayQuickActionsTool(onShowQuickActions: (suggestions: Suggestion[]) => void): AgentTool {
  return {
    name: 'displayQuickActions',
    description: `
在聊天界面主动为用户展示一组可点击的快速操作按钮（如推荐问题、常用操作、相关话题、快捷链接等），
帮助用户快速选择下一步，无需手动输入。适用于任何需要引导、推荐、减少输入负担的场景。
AI 可在用户可能需要帮助、建议、决策、补全、探索更多内容时主动调用本工具，提升交互体验。
（Display a set of clickable quick action buttons in the chat UI, such as suggested questions, common actions, related topics, or quick links, to help users quickly choose the next step without typing. Use this tool whenever you want to guide, recommend, or reduce user input. AI should call this tool proactively whenever the user may need help, suggestions, decisions, completion, or further exploration, to enhance the user experience.）
`,
    parameters: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              actionName: { type: 'string' },
              content: { type: 'string' },
              type: { type: 'string', enum: ['question', 'action', 'link', 'tool', 'topic'] },
              description: { type: 'string' },
              icon: { type: 'string' },
              metadata: { type: 'object' }
            },
            required: ['id', 'actionName', 'content', 'type']
          },
          description: '要显示的操作按钮列表。actionName 用于显示名称，对于 action 类型也用作发送的指令名；content 用于编辑时填入输入框。'
        }
      },
      required: ['suggestions']
    },
    execute: async (toolCall) => {
      const args = JSON.parse(toolCall.function.arguments);
      onShowQuickActions(args.suggestions as Suggestion[]);
      return {
        toolCallId: toolCall.id,
        result: { shown: true },
        status: 'success' as const
      };
    }
  };
} 