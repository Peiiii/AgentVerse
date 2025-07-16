import { Action } from "@/common/components/chat/agent-action-display";
import { Markdown } from "@/common/components/ui/markdown";
import type { Root } from "mdast";
import { useMemo } from "react";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { Plugin } from "unified";
import type { Node } from "unist";
import { remarkAction } from "./plugins/remark-action";
import { remarkMdastToHast } from "./plugins/remark-mdast-to-hast";
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
  remarkPlugins = [],
  rehypePlugins = [],
}: DiscussionMarkdownProps) {
  // 使用 useMemo 缓存插件配置
  const finalRemarkPlugins = useMemo(
    () => [
      remarkGfm as Plugin<[], Root>,
      [remarkAction, { actionResults }] as [
        Plugin<[], Root>,
        { actionResults: typeof actionResults }
      ],
      remarkMdastToHast as Plugin<[], Root>,
      ...((remarkPlugins ?? []) as any[]),
    ],
    [actionResults, remarkPlugins]
  );

  const finalRehypePlugins = useMemo(
    () =>
      [
        rehypeHighlight as unknown as Plugin<[], Node>,
        ...((rehypePlugins ?? []) as any[]),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any[],
    [rehypePlugins]
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
      remarkPlugins={finalRemarkPlugins}
      rehypePlugins={finalRehypePlugins}
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

