import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { defaultFileManager } from "@/common/lib/file-manager.service";

// 文件系统工具：基于 LightningFS 的完整文件操作
export const fileSystemTool: AgentTool = {
  name: "fileSystem",
  description: "文件系统操作（基于 LightningFS）",
  parameters: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["list", "read", "write", "create", "delete", "rename", "search", "info", "upload", "download"],
        description: "操作类型：list（列出）、read（读取）、write（写入）、create（创建）、delete（删除）、rename（重命名）、search（搜索）、info（信息）、upload（上传）、download（下载）"
      },
      path: {
        type: "string",
        description: "文件路径"
      },
      content: {
        type: "string",
        description: "文件内容（仅在 write 和 create 操作时需要）"
      },
      newPath: {
        type: "string",
        description: "新路径（仅在 rename 操作时需要）"
      },
      pattern: {
        type: "string",
        description: "搜索模式（仅在 search 操作时需要）"
      },
      isDirectory: {
        type: "boolean",
        description: "是否为目录（仅在 create 操作时需要）"
      }
    },
    required: ["operation"],
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    
    try {
      switch (args.operation) {
        case "list": {
          const listResult = await defaultFileManager.listDirectory(args.path);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "list",
              success: listResult.success,
              data: listResult.data,
              message: listResult.message,
              error: listResult.error,
            },
            status: listResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "read": {
          if (!args.path) {
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "read",
                error: "缺少文件路径参数",
              },
              status: "error" as const,
            };
          }
          const readResult = await defaultFileManager.readFile(args.path);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "read",
              success: readResult.success,
              data: readResult.data,
              message: readResult.message,
              error: readResult.error,
            },
            status: readResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "write": {
          if (!args.path || !args.content) {
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "write",
                error: "缺少文件路径或内容参数",
              },
              status: "error" as const,
            };
          }
          const writeResult = await defaultFileManager.writeFile(args.path, args.content);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "write",
              success: writeResult.success,
              data: writeResult.data,
              message: writeResult.message,
              error: writeResult.error,
            },
            status: writeResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "create": {
          if (!args.path) {
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "create",
                error: "缺少路径参数",
              },
              status: "error" as const,
            };
          }
          let createResult;
          if (args.isDirectory) {
            createResult = await defaultFileManager.createDirectory(args.path);
          } else {
            createResult = await defaultFileManager.writeFile(args.path, args.content || "");
          }
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "create",
              success: createResult.success,
              data: createResult.data,
              message: createResult.message,
              error: createResult.error,
            },
            status: createResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "delete": {
          if (!args.path) {
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "delete",
                error: "缺少路径参数",
              },
              status: "error" as const,
            };
          }
          const deleteResult = await defaultFileManager.deleteEntry(args.path);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "delete",
              success: deleteResult.success,
              message: deleteResult.message,
              error: deleteResult.error,
            },
            status: deleteResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "rename": {
          if (!args.path || !args.newPath) {
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "rename",
                error: "缺少原路径或新路径参数",
              },
              status: "error" as const,
            };
          }
          const renameResult = await defaultFileManager.renameEntry(args.path, args.newPath);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "rename",
              success: renameResult.success,
              message: renameResult.message,
              error: renameResult.error,
            },
            status: renameResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "search": {
          if (!args.pattern) {
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "search",
                error: "缺少搜索模式参数",
              },
              status: "error" as const,
            };
          }
          const searchResult = await defaultFileManager.searchFiles(args.pattern);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "search",
              success: searchResult.success,
              data: searchResult.data,
              message: searchResult.message,
              error: searchResult.error,
            },
            status: searchResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "info": {
          if (!args.path) {
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "info",
                error: "缺少文件路径参数",
              },
              status: "error" as const,
            };
          }
          const infoResult = await defaultFileManager.getFileInfo(args.path);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "info",
              success: infoResult.success,
              data: infoResult.data,
              message: infoResult.message,
              error: infoResult.error,
            },
            status: infoResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "upload": {
          // 上传功能需要特殊处理，这里返回提示信息
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "upload",
              message: "文件上传功能需要通过界面操作，请使用文件管理器界面",
            },
            status: "success" as const,
          };
        }
          
        case "download": {
          if (!args.path) {
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "download",
                error: "缺少文件路径参数",
              },
              status: "error" as const,
            };
          }
          const downloadResult = await defaultFileManager.downloadFile(args.path);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "download",
              success: downloadResult.success,
              message: downloadResult.message,
              error: downloadResult.error,
            },
            status: downloadResult.success ? "success" as const : "error" as const,
          };
        }
          
        default:
          return {
            toolCallId: toolCall.id,
            result: {
              operation: args.operation,
              error: `不支持的操作类型: ${args.operation}`,
            },
            status: "error" as const,
          };
      }
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: {
          operation: args.operation,
          error: `文件系统操作失败: ${error instanceof Error ? error.message : "未知错误"}`,
        },
        status: "error" as const,
      };
    }
  },
}; 