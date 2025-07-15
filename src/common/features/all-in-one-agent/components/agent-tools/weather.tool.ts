import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";

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
}; 