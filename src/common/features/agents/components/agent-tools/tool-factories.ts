import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { codeAnalysisTool } from './code-analysis.tool';
import { fileSystemTool } from './file-system.tool';
import { networkTool } from './network.tool';

// 文件管理工具集合
export const getFileManagementTools = (): AgentTool[] => [
  fileSystemTool,
];

// 开发工具集合
export const getDevelopmentTools = (): AgentTool[] => [
  codeAnalysisTool,
  networkTool,
]; 