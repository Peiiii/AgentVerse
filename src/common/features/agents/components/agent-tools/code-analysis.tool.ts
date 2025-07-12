import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";

// 代码分析工具
export const codeAnalysisTool: AgentTool = {
  name: "codeAnalysis",
  description: "代码分析工具，支持分析代码结构、复杂度、质量等",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["structure", "complexity", "quality", "summary"],
        description: "分析类型：structure（结构分析）、complexity（复杂度分析）、quality（质量分析）、summary（代码摘要）"
      },
      code: {
        type: "string",
        description: "要分析的代码内容"
      },
      language: {
        type: "string",
        description: "编程语言（可选，用于更准确的分析）"
      }
    },
    required: ["type", "code"],
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    
    try {
      const { type, code, language } = args;
      
      switch (type) {
        case "structure": {
          // 简单的代码结构分析
          const lines = code.split('\n');
          const functions = lines.filter((line: string) => 
            /function\s+\w+|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|var\s+\w+\s*=\s*\(|class\s+\w+/.test(line)
          ).length;
          const imports = lines.filter((line: string) => /import\s+/.test(line)).length;
          const comments = lines.filter((line: string) => /\/\/|\/\*|\*/.test(line)).length;
          
          return {
            toolCallId: toolCall.id,
            result: {
              type: "structure",
              analysis: {
                totalLines: lines.length,
                functions: functions,
                imports: imports,
                comments: comments,
                codeLines: lines.length - comments,
                structure: {
                  hasImports: imports > 0,
                  hasFunctions: functions > 0,
                  hasComments: comments > 0,
                }
              },
              message: `代码结构分析完成：${lines.length} 行代码，${functions} 个函数/类，${imports} 个导入，${comments} 行注释`,
            },
            status: "success" as const,
          };
        }
        
        case "complexity": {
          // 简单的复杂度分析
          const lines = code.split('\n');
          const cyclomaticComplexity = lines.reduce((complexity: number, line: string) => {
            if (/if\s*\(|else\s*if|for\s*\(|while\s*\(|switch\s*\(|case\s+|catch\s*\(|&&|\|\|/.test(line)) {
              return complexity + 1;
            }
            return complexity;
          }, 1);
          
          const nestingLevel = Math.max(...lines.map((line: string) => {
            const indent = line.match(/^\s*/)?.[0].length || 0;
            return Math.floor(indent / 2);
          }));
          
          return {
            toolCallId: toolCall.id,
            result: {
              type: "complexity",
              analysis: {
                cyclomaticComplexity,
                nestingLevel,
                complexity: cyclomaticComplexity <= 5 ? "低" : cyclomaticComplexity <= 10 ? "中" : "高",
                recommendations: cyclomaticComplexity > 10 ? "建议拆分复杂函数" : "复杂度适中",
              },
              message: `复杂度分析完成：圈复杂度 ${cyclomaticComplexity}，最大嵌套层级 ${nestingLevel}`,
            },
            status: "success" as const,
          };
        }
        
        case "quality": {
          // 简单的代码质量分析
          const lines = code.split('\n');
          const issues: string[] = [];
          
          // 检查长行
          const longLines = lines.filter((line: string) => line.length > 80).length;
          if (longLines > 0) {
            issues.push(`${longLines} 行代码超过80字符`);
          }
          
          // 检查空行
          const emptyLines = lines.filter((line: string) => line.trim() === '').length;
          const emptyLineRatio = emptyLines / lines.length;
          if (emptyLineRatio > 0.3) {
            issues.push("空行比例过高");
          }
          
          // 检查注释
          const comments = lines.filter((line: string) => /\/\/|\/\*|\*/.test(line)).length;
          const commentRatio = comments / lines.length;
          if (commentRatio < 0.1) {
            issues.push("注释比例较低");
          }
          
          return {
            toolCallId: toolCall.id,
            result: {
              type: "quality",
              analysis: {
                totalLines: lines.length,
                longLines,
                emptyLines,
                comments,
                issues: issues.length > 0 ? issues : ["代码质量良好"],
                quality: issues.length === 0 ? "良好" : "需要改进",
              },
              message: `质量分析完成：发现 ${issues.length} 个问题`,
            },
            status: "success" as const,
          };
        }
        
        case "summary": {
          // 代码摘要
          const lines = code.split('\n');
          const functions = lines.filter((line: string) => 
            /function\s+\w+|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|var\s+\w+\s*=\s*\(|class\s+\w+/.test(line)
          ).map((line: string) => {
            const match = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)|class\s+(\w+))/);
            return match ? (match[1] || match[2] || match[3]) : "匿名函数";
          });
          
          return {
            toolCallId: toolCall.id,
            result: {
              type: "summary",
              analysis: {
                totalLines: lines.length,
                functions: functions,
                functionCount: functions.length,
                language: language || "未知",
                summary: `这是一个包含 ${functions.length} 个函数/类的 ${language || ''} 代码文件，共 ${lines.length} 行代码`,
              },
              message: `代码摘要生成完成`,
            },
            status: "success" as const,
          };
        }
        
        default:
          return {
            toolCallId: toolCall.id,
            result: {
              error: `不支持的分析类型: ${type}`,
            },
            status: "error" as const,
          };
      }
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: {
          error: `代码分析失败: ${error instanceof Error ? error.message : "未知错误"}`,
        },
        status: "error" as const,
      };
    }
  },
}; 