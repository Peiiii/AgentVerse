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
  remarkPlugins?: ComponentProps<typeof ReactMarkdown>["remarkPlugins"];
  rehypePlugins?: ComponentProps<typeof ReactMarkdown>["rehypePlugins"];
}
