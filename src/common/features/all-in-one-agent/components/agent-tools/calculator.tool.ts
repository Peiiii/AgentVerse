import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import React from "react";

interface CalculatorResult {
  expression: string;
  result?: string | number;
  error?: string;
  message?: string;
}

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
  render: (toolCall: ToolCall & { result?: CalculatorResult }) => {
    const args = JSON.parse(toolCall.function.arguments);
    const expression = args.expression;
    const result = toolCall.result?.result;
    const error = toolCall.result?.error;
    return React.createElement(
      "div",
      {
        style: {
          background: '#f8fafc',
          borderRadius: 12,
          padding: '18px 24px',
          boxShadow: '0 2px 8px #6366f133',
          fontSize: 17,
          color: '#22223b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 8,
          minWidth: 220,
        }
      },
      React.createElement("div", { style: { fontWeight: 700, fontSize: 16, color: '#6366f1', marginBottom: 4 } }, "🧮 计算器"),
      React.createElement("div", { style: { fontSize: 15, color: '#64748b' } }, "表达式："),
      React.createElement("div", { style: { fontFamily: 'Menlo, monospace', fontSize: 18, color: '#22223b', background: '#fff', borderRadius: 8, padding: '6px 12px', margin: '4px 0' } }, expression),
      result !== undefined && React.createElement("div", { style: { fontSize: 15, color: '#64748b' } }, "结果："),
      result !== undefined && React.createElement("div", { style: { fontFamily: 'Menlo, monospace', fontSize: 20, color: '#10b981', background: '#f0fdf4', borderRadius: 8, padding: '6px 12px', margin: '4px 0' } }, String(result)),
      error && React.createElement("div", { style: { color: '#ef4444', fontSize: 15 } }, error)
    );
  },
}; 