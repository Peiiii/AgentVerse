import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import React from "react";

interface WeatherResult {
  city: string;
  weather: string;
  message: string;
  error?: string;
}

export const weatherTool: AgentTool = {
  name: "weather",
  description: "查询指定城市的天气（模拟数据）",
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "城市名称，如 '北京'"
      }
    },
    required: ["city"]
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    // 模拟天气数据
    const weatherMap: Record<string, string> = {
      北京: "晴 27°C 湿度 40% 西南风3级",
      上海: "多云 25°C 湿度 55% 东风2级",
      广州: "小雨 29°C 湿度 70% 南风1级",
      深圳: "阴 28°C 湿度 65% 东南风2级",
      杭州: "晴转多云 26°C 湿度 50% 西风2级",
    };
    const city = args.city || "北京";
    const weather = weatherMap[city] || `晴 25°C 湿度 50% 西风2级（${city}，模拟数据）`;
    return {
      toolCallId: toolCall.id,
      result: {
        city,
        weather,
        message: `${city} 当前天气：${weather}`,
      },
      status: "success" as const,
    };
  },
  render: (toolCall: ToolCall & { result?: WeatherResult }) => {
    const args = JSON.parse(toolCall.function.arguments);
    const city = args.city || "北京";
    const weather = toolCall.result?.weather || "-";
    const error = toolCall.result?.error;
    return React.createElement(
      "div",
      {
        style: {
          background: '#f0f9ff',
          borderRadius: 12,
          padding: '18px 24px',
          boxShadow: '0 2px 8px #38bdf833',
          fontSize: 17,
          color: '#22223b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 8,
          minWidth: 220,
        }
      },
      React.createElement("div", { style: { fontWeight: 700, fontSize: 16, color: '#0ea5e9', marginBottom: 4 } }, "🌤️ 天气查询"),
      React.createElement("div", { style: { fontSize: 15, color: '#64748b' } }, "城市："),
      React.createElement("div", { style: { fontFamily: 'Menlo, monospace', fontSize: 18, color: '#22223b', background: '#fff', borderRadius: 8, padding: '6px 12px', margin: '4px 0' } }, city),
      weather && React.createElement("div", { style: { fontSize: 15, color: '#64748b' } }, "天气："),
      weather && React.createElement("div", { style: { fontFamily: 'Menlo, monospace', fontSize: 20, color: '#0ea5e9', background: '#f0f9ff', borderRadius: 8, padding: '6px 12px', margin: '4px 0' } }, weather),
      error && React.createElement("div", { style: { color: '#ef4444', fontSize: 15 } }, error)
    );
  },
}; 