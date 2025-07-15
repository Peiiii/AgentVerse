import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";

export const calculatorTool: AgentTool = {
  name: "calculator",
  description: "简单计算器，支持基础四则运算表达式。",
  parameters: {
    type: "object",
    properties: {
      expression: {
        type: "string",
        description: "数学表达式，如 '2 + 3 * 4'"
      }
    },
    required: ["expression"]
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    try {
      // 安全地计算表达式
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${args.expression})`)();
      return {
        toolCallId: toolCall.id,
        result: {
          expression: args.expression,
          result,
          message: `${args.expression} = ${result}`,
        },
        status: "success" as const,
      };
    } catch {
      return {
        toolCallId: toolCall.id,
        result: {
          expression: args.expression,
          error: "计算表达式失败",
        },
        status: "error" as const,
      };
    }
  },
}; 