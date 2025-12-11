import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import React from "react";
import { i18n } from "@/core/hooks/use-i18n";

interface WeatherResult {
  city: string;
  weather: string;
  message: string;
  error?: string;
}

export const weatherTool: AgentTool = {
  name: "weather",
  description: i18n.t("tool.weather.description"),
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: i18n.t("tool.weather.cityDescription")
      }
    },
    required: ["city"]
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    const city = args.city || i18n.t("tool.weather.defaultCity");
    
    const cityMap: Record<string, string> = {
      "北京": "beijing",
      "Beijing": "beijing",
      "beijing": "beijing",
      "上海": "shanghai",
      "Shanghai": "shanghai",
      "shanghai": "shanghai",
      "广州": "guangzhou",
      "Guangzhou": "guangzhou",
      "guangzhou": "guangzhou",
      "深圳": "shenzhen",
      "Shenzhen": "shenzhen",
      "shenzhen": "shenzhen",
      "杭州": "hangzhou",
      "Hangzhou": "hangzhou",
      "hangzhou": "hangzhou",
    };
    
    const cityKey = cityMap[city] || city.toLowerCase();
    const weatherMap: Record<string, string> = {
      beijing: i18n.t("tool.weather.beijingWeather"),
      shanghai: i18n.t("tool.weather.shanghaiWeather"),
      guangzhou: i18n.t("tool.weather.guangzhouWeather"),
      shenzhen: i18n.t("tool.weather.shenzhenWeather"),
      hangzhou: i18n.t("tool.weather.hangzhouWeather"),
    };
    
    const displayCity = cityMap[city] ? i18n.t(`tool.weather.${cityMap[city]}`) : city;
    const weather = weatherMap[cityKey] || i18n.t("tool.weather.defaultWeather", { city: displayCity });
    return {
      toolCallId: toolCall.id,
      result: {
        city: displayCity,
        weather,
        message: i18n.t("tool.weather.currentWeather", { city: displayCity, weather }),
      },
      status: "success" as const,
    };
  },
  render: (toolCall: ToolCall & { result?: WeatherResult }) => {
    const args = JSON.parse(toolCall.function.arguments);
    const city = args.city || i18n.t("tool.weather.defaultCity");
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
      React.createElement("div", { style: { fontWeight: 700, fontSize: 16, color: '#0ea5e9', marginBottom: 4 } }, `🌤️ ${i18n.t("tool.weather.title")}`),
      React.createElement("div", { style: { fontSize: 15, color: '#64748b' } }, `${i18n.t("tool.weather.city")}：`),
      React.createElement("div", { style: { fontFamily: 'Menlo, monospace', fontSize: 18, color: '#22223b', background: '#fff', borderRadius: 8, padding: '6px 12px', margin: '4px 0' } }, city),
      weather && React.createElement("div", { style: { fontSize: 15, color: '#64748b' } }, `${i18n.t("tool.weather.weather")}：`),
      weather && React.createElement("div", { style: { fontFamily: 'Menlo, monospace', fontSize: 20, color: '#0ea5e9', background: '#f0f9ff', borderRadius: 8, padding: '6px 12px', margin: '4px 0' } }, weather),
      error && React.createElement("div", { style: { color: '#ef4444', fontSize: 15 } }, error)
    );
  },
}; 