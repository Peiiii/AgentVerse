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
      if (React.isValidElement(children) && children.props) {
        const code = children.props.children;
        const language = children.props.className
          ?.split(" ")
          .find((l: string) => l.startsWith("language-"))
          ?.replace("language-", "");

        if (language === "mermaid" && typeof code === "string") {
          return <MermaidChart chart={code} />;
        }

        // 代码块复制按钮，仅在 hover 时右上角浮现
        if (typeof code === "string") {
          return (
            <div style={{ position: "relative" }} className="world-class-code-block-wrapper">
              <pre {...props}>{children}</pre>
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  opacity: 0,
                  pointerEvents: "none",
                  transition: "opacity 0.18s",
                }}
                className="code-copy-btn-wrapper"
              >
                <CopyMessageButton text={code} />
              </span>
              <style>{`
                .world-class-code-block-wrapper:hover .code-copy-btn-wrapper {
                  opacity: 1 !important;
                  pointer-events: auto !important;
                }
              `}</style>
            </div>
          );
        }
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
