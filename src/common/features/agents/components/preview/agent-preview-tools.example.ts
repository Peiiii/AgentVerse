import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { getCurrentTimeTool, createAgentAnalysisTool } from "./agent-preview-tools";

// 示例：自定义工具集合
export const createCustomPreviewTools = (agentDef: AgentDef): AgentTool[] => {
  // 基础工具
  const baseTools = [
    getCurrentTimeTool,
    createAgentAnalysisTool(agentDef),
  ];

  // 自定义工具：计算器
  const calculatorTool: AgentTool = {
    name: "calculator",
    description: "简单计算器",
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
  };

  // 自定义工具：天气查询（模拟）
  const weatherTool: AgentTool = {
    name: "weather",
    description: "查询天气信息",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "城市名称"
        }
      },
      required: ["city"]
    },
    execute: async (toolCall) => {
      const args = JSON.parse(toolCall.function.arguments);
      // 模拟天气数据
      const weatherData = {
        "北京": { temperature: "22°C", condition: "晴天", humidity: "45%" },
        "上海": { temperature: "25°C", condition: "多云", humidity: "60%" },
        "广州": { temperature: "28°C", condition: "小雨", humidity: "75%" },
      };
      
      const cityWeather = weatherData[args.city as keyof typeof weatherData];
      
      if (cityWeather) {
        return {
          toolCallId: toolCall.id,
          result: {
            city: args.city,
            ...cityWeather,
            message: `${args.city}的天气：${cityWeather.temperature}，${cityWeather.condition}`,
          },
          status: "success" as const,
        };
      } else {
        return {
          toolCallId: toolCall.id,
          result: {
            city: args.city,
            error: "未找到该城市的天气信息",
          },
          status: "error" as const,
        };
      }
    },
  };

  return [...baseTools, calculatorTool, weatherTool];
};

// 示例：最小工具集合（仅包含基础工具）
export const createMinimalPreviewTools = (agentDef: AgentDef): AgentTool[] => [
  getCurrentTimeTool,
  createAgentAnalysisTool(agentDef),
];

// 示例：无工具集合
export const createNoToolsPreview = (): AgentTool[] => [];

// 使用示例：
/*
// 在 AgentPreviewChat 中使用自定义工具
<AgentPreviewChat
  agentDef={agent}
  tools={createCustomPreviewTools(agent)}
/>

// 使用最小工具集合
<AgentPreviewChat
  agentDef={agent}
  tools={createMinimalPreviewTools(agent)}
/>

// 不使用任何工具
<AgentPreviewChat
  agentDef={agent}
  tools={createNoToolsPreview()}
/>
*/ 