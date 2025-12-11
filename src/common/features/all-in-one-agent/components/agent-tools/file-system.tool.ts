import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { defaultFileManager } from "@/common/lib/file-manager.service";
import { i18n } from "@/core/hooks/use-i18n";

// 文件系统工具：基于 LightningFS 的完整文件操作
export const fileSystemTool: AgentTool = {
  name: "worldClassFileSystem",
  description: i18n.t("tool.fileSystem.description"),
  parameters: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["list", "read", "write", "create", "delete", "rename", "search", "info", "upload", "download"],
        description: i18n.t("tool.fileSystem.operationDescription")
      },
      path: {
        type: "string",
        description: i18n.t("tool.fileSystem.pathDescription")
      },
      content: {
        type: "string",
        description: i18n.t("tool.fileSystem.contentDescription")
      },
      newPath: {
        type: "string",
        description: i18n.t("tool.fileSystem.newPathDescription")
      },
      pattern: {
        type: "string",
        description: i18n.t("tool.fileSystem.patternDescription")
      },
      isDirectory: {
        type: "boolean",
        description: i18n.t("tool.fileSystem.isDirectoryDescription")
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
                error: i18n.t("tool.fileSystem.missingFilePathParam"),
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
                error: i18n.t("tool.fileSystem.missingPathOrContentParam"),
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
                error: i18n.t("tool.fileSystem.missingPathParam"),
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
                error: i18n.t("tool.fileSystem.missingPathParam"),
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
                error: i18n.t("tool.fileSystem.missingOldOrNewPathParam"),
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
                error: i18n.t("tool.fileSystem.missingPatternParam"),
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
                error: i18n.t("tool.fileSystem.missingFilePathParam"),
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
              message: i18n.t("tool.fileSystem.uploadRequiresUI"),
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
                error: i18n.t("tool.fileSystem.missingFilePathParam"),
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
              error: i18n.t("tool.fileSystem.unsupportedOperation", { operation: args.operation }),
            },
            status: "error" as const,
          };
      }
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: {
          operation: args.operation,
          error: i18n.t("tool.fileSystem.operationFailed", { 
            error: error instanceof Error ? error.message : i18n.t("tool.fileSystem.unknownError")
          }),
        },
        status: "error" as const,
      };
    }
  },
}; 