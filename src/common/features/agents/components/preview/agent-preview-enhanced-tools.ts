import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { defaultFileManager } from "@/common/lib/file-manager.service";

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

// 增强的文件系统工具：基于 LightningFS 的完整文件操作
export const enhancedFileSystemTool: AgentTool = {
  name: "fileSystem",
  description: "增强的文件系统操作（基于 LightningFS）",
  parameters: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["list", "read", "write", "create", "delete", "rename", "search", "info", "upload", "download", "navigate", "back"],
        description: "操作类型：list（列出）、read（读取）、write（写入）、create（创建）、delete（删除）、rename（重命名）、search（搜索）、info（信息）、upload（上传）、download（下载）、navigate（导航）、back（返回上级）"
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
          const searchResult = await defaultFileManager.searchFiles(args.pattern, args.path);
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
                error: "缺少路径参数",
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
          
        case "navigate": {
          if (!args.path) {
            return {
              toolCallId: toolCall.id,
              result: {
                operation: "navigate",
                error: "缺少路径参数",
              },
              status: "error" as const,
            };
          }
          defaultFileManager.setCurrentPath(args.path);
          const navigateResult = await defaultFileManager.listDirectory(args.path);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "navigate",
              success: navigateResult.success,
              data: navigateResult.data,
              message: `成功导航到 ${args.path}`,
              error: navigateResult.error,
            },
            status: navigateResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "back": {
          const currentPath = defaultFileManager.getCurrentPath();
          const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
          const targetPath = parentPath || '/';
          defaultFileManager.setCurrentPath(targetPath);
          const backResult = await defaultFileManager.listDirectory(targetPath);
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "back",
              success: backResult.success,
              data: backResult.data,
              message: `成功返回上级目录 ${targetPath}`,
              error: backResult.error,
            },
            status: backResult.success ? "success" as const : "error" as const,
          };
        }
          
        case "upload": {
          return {
            toolCallId: toolCall.id,
            result: {
              operation: "upload",
              message: "请使用文件管理器界面上传文件，或使用 uploadFile API",
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
          
        default: {
          return {
            toolCallId: toolCall.id,
            result: {
              operation: args.operation,
              error: `不支持的操作: ${args.operation}`,
            },
            status: "error" as const,
          };
        }
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

// 代码分析工具
export const codeAnalysisTool: AgentTool = {
  name: "analyzeCode",
  description: "分析代码文件的结构和内容",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "代码文件路径"
      },
      analysisType: {
        type: "string",
        enum: ["structure", "complexity", "quality", "summary"],
        description: "分析类型：structure（结构）、complexity（复杂度）、quality（质量）、summary（摘要）"
      }
    },
    required: ["path", "analysisType"],
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    
    try {
      const readResult = await defaultFileManager.readFile(args.path);
      if (!readResult.success || !readResult.data) {
        return {
          toolCallId: toolCall.id,
          result: {
            error: "无法读取文件",
          },
          status: "error" as const,
        };
      }

      const content = readResult.data.content;
      const lines = content.split('\n');
      const words = content.split(/\s+/);
      
      let analysis: Record<string, unknown> = {
        fileName: args.path.split('/').pop(),
        fileSize: readResult.data.size,
        lineCount: lines.length,
        wordCount: words.length,
        characterCount: content.length,
      };

      switch (args.analysisType) {
        case "structure": {
          const functions = content.match(/function\s+\w+\s*\(/g) || [];
          const classes = content.match(/class\s+\w+/g) || [];
          const imports = content.match(/import\s+.*from/g) || [];
          analysis = {
            ...analysis,
            functions: functions.length,
            classes: classes.length,
            imports: imports.length,
            structure: {
              functions: functions.map(f => f.replace(/function\s+(\w+)\s*\(/, '$1')),
              classes: classes.map(c => c.replace(/class\s+(\w+)/, '$1')),
              imports: imports.slice(0, 5), // 只显示前5个
            }
          };
          break;
        }
          
        case "complexity": {
          const complexity = {
            ...analysis,
            averageLineLength: Math.round(content.length / lines.length),
            emptyLines: lines.filter(line => line.trim() === '').length,
            commentLines: lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length,
          };
          analysis = complexity;
          break;
        }
          
        case "quality": {
          const quality = {
            ...analysis,
            hasComments: content.includes('//') || content.includes('/*'),
            hasErrorHandling: content.includes('try') || content.includes('catch'),
            hasLogging: content.includes('console.log') || content.includes('console.error'),
            hasTests: content.includes('test') || content.includes('spec'),
          };
          analysis = quality;
          break;
        }
          
        case "summary": {
          analysis = {
            ...analysis,
            summary: `文件 ${analysis.fileName} 包含 ${analysis.lineCount} 行代码，${analysis.wordCount} 个单词，文件大小 ${analysis.fileSize} 字节。`,
            language: args.path.endsWith('.ts') ? 'TypeScript' : 
                     args.path.endsWith('.js') ? 'JavaScript' :
                     args.path.endsWith('.tsx') ? 'TypeScript React' :
                     args.path.endsWith('.jsx') ? 'JavaScript React' :
                     args.path.endsWith('.json') ? 'JSON' :
                     args.path.endsWith('.md') ? 'Markdown' : 'Unknown'
          };
          break;
        }
      }

      return {
        toolCallId: toolCall.id,
        result: {
          analysisType: args.analysisType,
          data: analysis,
          message: `成功分析文件 ${args.path}`,
        },
        status: "success" as const,
      };
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: {
          error: error instanceof Error ? error.message : "分析失败",
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

// 增强的默认工具集合
export const getEnhancedPreviewTools = (agentDef: AgentDef): AgentTool[] => [
  getCurrentTimeTool,
  createAgentAnalysisTool(agentDef),
  enhancedFileSystemTool,
  codeAnalysisTool,
  networkTool,
]; 