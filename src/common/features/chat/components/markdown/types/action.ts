/**
 * Action 的基础数据结构
 */
export interface ActionData {
  operationId: string;
  capability: string;
  description: string;
  params: Record<string, unknown>;
  await?: boolean;
  result?: {
    status: "success" | "error";
    result?: unknown;
    error?: string;
  };
}

/**
 * Action 组件的 Props 类型
 */
export interface ActionComponentProps {
  data: ActionData;
}

/**
 * Action 执行结果的映射
 */
export interface MarkdownActionResults {
  [operationId: string]: {
    status: "success" | "error";
    result?: unknown;
    error?: string;
  };
} 