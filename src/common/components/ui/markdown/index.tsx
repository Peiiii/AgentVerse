import { cn } from "@/common/lib/utils";
import type { Root } from "mdast";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { Plugin } from "unified";
import type { Node } from "unist";
import { MarkdownErrorBoundary } from "./components/error-boundary";
import { MermaidChart } from "./components/mermaid";
import { MarkdownProps } from "./types";
import { CopyMessageButton } from "@/common/components/world-class-chat/copy-message-button";

/**
 * 基础 Markdown 组件
 * 提供基本的 Markdown 渲染功能，支持自定义插件
 */
export function Markdown({
  content,
  className,
  components,
  remarkPlugins = [remarkGfm as unknown as Plugin<[], Root>],
  rehypePlugins = [rehypeHighlight as unknown as Plugin<[], Node>],
}: MarkdownProps) {
  // 使用 useMemo 缓存组件配置，避免每次重新渲染
  const defaultComponents = useMemo(() => ({
    ...components,
    pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => {
      // 统一处理 children 可能为数组或单个元素
      let code = "";
      let language = undefined;
      if (Array.isArray(children)) {
        // 取第一个有效 code 元素
        const codeElem = children.find(child => React.isValidElement(child) && child.props && typeof (child.props as any).children === "string");
        if (codeElem && React.isValidElement(codeElem)) {
          const props = codeElem.props as { children: string; className?: string };
          code = props.children;
          language = props.className
            ?.split(" ")
            .find((l: string) => l.startsWith("language-"))
            ?.replace("language-", "");
        }
      } else if (React.isValidElement(children) && children.props) {
        code = children.props.children;
        language = children.props.className
          ?.split(" ")
          .find((l: string) => l.startsWith("language-"))
          ?.replace("language-", "");
      }
      if (language === "mermaid" && typeof code === "string") {
        return <MermaidChart chart={code} />;
      }
      if (typeof code === "string" && code.length > 0) {
        return (
          <pre {...props} style={{ position: "relative" }}>
            <CopyMessageButton text={code} />
            {children}
          </pre>
        );
      }
      return <pre {...props}>{children}</pre>;
    },
  }), [components]);

  return (
    <MarkdownErrorBoundary content={content}>
      <div className={cn("prose dark:prose-invert", className)}>
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={defaultComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </MarkdownErrorBoundary>
  );
}
