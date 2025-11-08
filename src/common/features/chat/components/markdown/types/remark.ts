import type { Node } from "unist";
import type { MarkdownActionResults } from "./action";

/**
 * Action 节点的类型定义
 */
export interface ActionNode extends Node {
  type: "action";
  value: string;
  data: {
    operationId: string;
    capability: string;
    params: Record<string, unknown>;
    await?: boolean;
    actionResults?: MarkdownActionResults;
    hName: string;
    hProperties: {
      value: string;
      data: {
        operationId: string;
        capability: string;
        params: Record<string, unknown>;
        await?: boolean;
        actionResults?: MarkdownActionResults;
      };
    };
  };
}

/**
 * Action 节点的 Props 类型
 */
export interface ActionProps {
  node: {
    type: string;
    tagName: string;
    properties: {
      value: string;
      data: {
        capability: string;
        params: Record<string, unknown>;
        await?: boolean;
        actionResults?: MarkdownActionResults;
        operationId?: string;
      };
    };
    children?: Array<{ type: string; value?: string }>;
  };
} 