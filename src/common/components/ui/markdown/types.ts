import { ComponentProps } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

/**
 * 基础 Markdown 组件的 Props
 */
export interface MarkdownProps {
  content: string;
  className?: string;
  components?: Partial<Components>;
  extraRemarkPlugins?: ComponentProps<typeof ReactMarkdown>["remarkPlugins"];
  extraRehypePlugins?: ComponentProps<typeof ReactMarkdown>["rehypePlugins"];
}
