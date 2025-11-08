import { Action } from "@/common/features/chat/components/agent-action-display";
import { Markdown } from "@/common/components/ui/markdown";
import type { Root } from "mdast";
import { useMemo } from "react";
import type { Plugin } from "unified";
import { remarkAction } from "./plugins/remark-action";
import {
  ActionComponentProps,
  ActionData,
  ActionNode,
  DiscussionMarkdownProps,
  MarkdownActionResults,
} from "./types";

/**
 * 讨论专用的 Markdown 组件
 * 在基础 Markdown 组件的基础上添加了 action 支持
 */
export function DiscussionMarkdown({
  content,
  className,
  components,
  actionResults,
  ActionComponent = Action,
}: DiscussionMarkdownProps) {
  // 使用 useMemo 缓存插件配置
  const extraRemarkPlugins = useMemo(
    () => [
      [remarkAction, { actionResults }] as [
        Plugin<[], Root>,
        { actionResults: typeof actionResults }
      ],
    ],
    [actionResults]
  );

  // 使用 useMemo 缓存组件映射
  const finalComponents = useMemo(
    () => ({
      ...components,
      action: ({ node }: { node: { properties: { value: string } } }) => {
        if (!ActionComponent) return null;
        try {
          const data = JSON.parse(node.properties.value);
          // 使用 key 来帮助 React 识别和复用组件实例
          const actionKey = `action-${JSON.stringify(data)}`;
          return <ActionComponent key={actionKey} data={data} />;
        } catch (error) {
          console.error("Failed to parse action data:", error);
          return null;
        }
      },
    }),
    [components, ActionComponent]
  );

  return (
    <Markdown
      content={content}
      className={className}
      components={finalComponents}
      extraRemarkPlugins={extraRemarkPlugins}
      extraRehypePlugins={[]}
    />
  );
}
export type {
  ActionComponentProps,
  ActionData,
  ActionNode,
  DiscussionMarkdownProps,
  MarkdownActionResults
};

