import type { MarkdownProps } from "@/common/components/ui/markdown/types";
import type { Node } from "unist";
import type { ActionComponentProps, ActionData, MarkdownActionResults } from "../agent-action-display/types";

/**
 * Action 节点的类型定义
 */
export interface ActionNode extends Node {
  type: "action";
  value: string;
  data: ActionData & {
    actionResults?: MarkdownActionResults;
    hName: string;
    hProperties: {
      value: string;
      data: ActionData;
    };
  };
}

/**
 * 讨论专用的 Markdown 组件的 Props
 * 继承基础 Markdown 组件的 Props，并添加 action 相关的功能
 */
export interface DiscussionMarkdownProps extends MarkdownProps {
  actionResults?: MarkdownActionResults;
  ActionComponent?: React.ComponentType<ActionComponentProps>;
}

// 重新导出需要的类型
export type { ActionComponentProps, ActionData, MarkdownActionResults }; 