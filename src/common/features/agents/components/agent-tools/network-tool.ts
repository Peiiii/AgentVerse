import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";

// 网络工具：HTTP 请求
export const networkTool: AgentTool = {
  name: "network",
  description: "网络请求工具，支持 HTTP GET、POST 等操作",
  parameters: {
    type: "object",
    properties: {
      method: {
        type: "string",
        enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        description: "HTTP 请求方法"
      },
      url: {
        type: "string",
        description: "请求的 URL"
      },
      headers: {
        type: "object",
        description: "请求头（可选）"
      },
      body: {
        type: "string",
        description: "请求体（可选，用于 POST、PUT、PATCH 请求）"
      },
      timeout: {
        type: "number",
        description: "请求超时时间（毫秒，可选，默认 10000）"
      }
    },
    required: ["method", "url"],
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), args.timeout || 10000);
      
      const response = await fetch(args.url, {
        method: args.method,
        headers: args.headers || {
          'Content-Type': 'application/json',
        },
        body: args.body || undefined,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
      
      return {
        toolCallId: toolCall.id,
        result: {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData,
          message: response.ok ? "请求成功" : `请求失败: ${response.status} ${response.statusText}`,
        },
        status: response.ok ? "success" as const : "error" as const,
      };
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: {
          success: false,
          error: `网络请求失败: ${error instanceof Error ? error.message : "未知错误"}`,
          message: "网络请求执行失败",
        },
        status: "error" as const,
      };
    }
  },
}; 