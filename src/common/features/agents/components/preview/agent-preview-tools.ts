import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";

// 基础工具：获取当前时间
export const getCurrentTimeTool: AgentTool = {
  name: "getCurrentTime",
  description: "获取当前时间",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async (toolCall) => {
    return {
      toolCallId: toolCall.id,
      result: {
        currentTime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        message: "当前时间已获取",
      },
      status: "success" as const,
    };
  },
};

// 智能体分析工具：基于真实数据
export const createAgentAnalysisTool = (agentDef: AgentDef): AgentTool => ({
  name: "analyzeAgentCapability",
  description: "分析当前智能体的能力和配置",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async (toolCall) => {
    // 基于真实的 agent 数据进行分析
    const capabilities = [];
    
    if (agentDef.prompt) {
      capabilities.push("系统提示词配置");
    }
    if (agentDef.expertise && agentDef.expertise.length > 0) {
      capabilities.push(`${agentDef.expertise.length} 个专业领域`);
    }
    if (agentDef.personality) {
      capabilities.push("个性化性格特征");
    }
    if (agentDef.role) {
      capabilities.push(`${agentDef.role === 'moderator' ? '主持人' : '参与者'}角色`);
    }
    
    return {
      toolCallId: toolCall.id,
      result: {
        agentName: agentDef.name,
        role: agentDef.role,
        expertise: agentDef.expertise || [],
        personality: agentDef.personality,
        promptLength: agentDef.prompt?.length || 0,
        capabilities,
        message: `智能体 "${agentDef.name}" 具备 ${capabilities.length} 项能力`,
      },
      status: "success" as const,
    };
  },
});

// 文件系统工具：基于真实的浏览器 API
export const fileSystemTool: AgentTool = {
  name: "fileSystem",
  description: "文件系统操作（基于浏览器 API）",
  parameters: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["list", "read", "write", "delete"],
        description: "操作类型：list（列出）、read（读取）、write（写入）、delete（删除）"
      },
      path: {
        type: "string",
        description: "文件路径"
      },
      content: {
        type: "string",
        description: "文件内容（仅在 write 操作时需要）"
      }
    },
    required: ["operation", "path"],
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    
    try {
      switch (args.operation) {
        case "list":
          // 使用 File System Access API（如果支持）
          if ('showDirectoryPicker' in window) {
            const dirHandle = await (window as any).showDirectoryPicker();
            const files = [];
            for await (const entry of dirHandle.values()) {
              files.push({
                name: entry.name,
                kind: entry.kind,
                size: entry.kind === 'file' ? await entry.getFile().then((f: File) => f.size) : null
              });
            }
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "list",
                path: args.path,
                files,
                message: `成功列出 ${files.length} 个文件/文件夹`,
              },
              status: "success" as const,
            };
          } else {
            throw new Error("浏览器不支持 File System Access API");
          }
          
        case "read":
          // 使用 File API 读取文件
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '*/*';
          
          return new Promise((resolve) => {
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const content = await file.text();
                resolve({
                  toolCallId: toolCall.id,
                  result: {
                    operation: "read",
                    path: file.name,
                    content: content.substring(0, 1000) + (content.length > 1000 ? "..." : ""),
                    size: file.size,
                    message: `成功读取文件 ${file.name}`,
                  },
                  status: "success" as const,
                });
              } else {
                resolve({
                  toolCallId: toolCall.id,
                  result: {
                    operation: "read",
                    error: "未选择文件",
                  },
                  status: "error" as const,
                });
              }
            };
            input.click();
          });
          
        default:
          return {
            toolCallId: toolCall.id,
            result: {
              operation: args.operation,
              error: `不支持的操作: ${args.operation}`,
            },
            status: "error" as const,
          };
      }
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: {
          operation: args.operation,
          error: error instanceof Error ? error.message : "未知错误",
        },
        status: "error" as const,
      };
    }
  },
};

// 网络工具：基于真实的 fetch API
export const networkTool: AgentTool = {
  name: "network",
  description: "网络请求工具（基于 fetch API）",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "请求的 URL"
      },
      method: {
        type: "string",
        enum: ["GET", "POST", "PUT", "DELETE"],
        default: "GET",
        description: "HTTP 方法"
      },
      headers: {
        type: "object",
        description: "请求头（可选）"
      },
      body: {
        type: "string",
        description: "请求体（可选）"
      }
    },
    required: ["url"],
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    
    try {
      const response = await fetch(args.url, {
        method: args.method || "GET",
        headers: args.headers || {},
        body: args.body || undefined,
      });
      
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      return {
        toolCallId: toolCall.id,
        result: {
          url: args.url,
          method: args.method || "GET",
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: typeof data === "string" ? data.substring(0, 500) + (data.length > 500 ? "..." : "") : data,
          message: `请求成功，状态码: ${response.status}`,
        },
        status: "success" as const,
      };
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: {
          url: args.url,
          error: error instanceof Error ? error.message : "网络请求失败",
        },
        status: "error" as const,
      };
    }
  },
};

// 默认工具集合
export const getDefaultPreviewTools = (agentDef: AgentDef): AgentTool[] => [
  getCurrentTimeTool,
  createAgentAnalysisTool(agentDef),
  fileSystemTool,
  networkTool,
]; 