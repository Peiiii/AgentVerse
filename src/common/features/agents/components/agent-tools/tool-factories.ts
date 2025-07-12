import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { getCurrentTimeTool } from './get-current-time-tool';
import { createAgentAnalysisTool } from './agent-analysis-tool';
import { fileSystemTool } from './file-system-tool';
import { networkTool } from './network-tool';
import { codeAnalysisTool } from './code-analysis-tool';

// 默认工具集合
export const getDefaultPreviewTools = (agentDef: AgentDef): AgentTool[] => [
  getCurrentTimeTool,
  createAgentAnalysisTool(agentDef),
  fileSystemTool,
  networkTool,
];

// 增强的工具集合（包含代码分析）
export const getEnhancedPreviewTools = (agentDef: AgentDef): AgentTool[] => [
  getCurrentTimeTool,
  createAgentAnalysisTool(agentDef),
  fileSystemTool,
  codeAnalysisTool,
  networkTool,
];

// 基础工具集合（仅包含核心工具）
export const getBasicPreviewTools = (agentDef: AgentDef): AgentTool[] => [
  getCurrentTimeTool,
  createAgentAnalysisTool(agentDef),
];

// 文件管理工具集合
export const getFileManagementTools = (): AgentTool[] => [
  fileSystemTool,
];

// 开发工具集合
export const getDevelopmentTools = (): AgentTool[] => [
  codeAnalysisTool,
  networkTool,
]; 