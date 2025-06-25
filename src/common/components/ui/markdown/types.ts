import type { Root } from "mdast";
import type { Components } from "react-markdown";
import type { Plugin, Settings } from "unified";
import type { Node } from "unist";

/**
 * 基础 Markdown 组件的 Props
 */
export interface MarkdownProps {
  content: string;
  className?: string;
  components?: Partial<Components>;
  remarkPlugins?: Array<Plugin<Settings[], Root> | [Plugin<Settings[], Root>, Record<string, unknown>]>;
  rehypePlugins?: Array<Plugin<Settings[], Node> | [Plugin<Settings[], Node>, Record<string, unknown>]>;
}
