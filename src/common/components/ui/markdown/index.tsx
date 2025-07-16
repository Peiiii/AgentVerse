import { cn } from "@/common/lib/utils";
import type { Root } from "mdast";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { Plugin } from "unified";
import type { Node } from "unist";
import { MarkdownErrorBoundary } from "./components/error-boundary";
import { MermaidChart } from "./components/mermaid";
import { CopyCodeButton } from "./copy-code-button";
import { MarkdownProps } from "./types";

// 新增：自定义代码块组件
function CodeBlock({ className, children, ...props }: any) {
  const isBlock = typeof className === "string" && className.includes("language-");
  let code = "";
  if (Array.isArray(children)) {
    code = children.join("");
  } else if (typeof children === "string") {
    code = children;
  }
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1];
  if (language === "mermaid") {
    return <MermaidChart chart={code} />;
  }
  if (!isBlock) {
    return <code className={className} {...props}>{children}</code>;
  }
  // 块级代码：header+内容分离
  return (
    <div className="code-block-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="code-block-header">
        <span className="code-lang-tag">{language ? language.charAt(0).toUpperCase() + language.slice(1) : "Code"}</span>
        <span className="copy-btn-wrapper">
          <CopyCodeButton text={code} />
        </span>
      </div>
      <div className="code-block-content" style={{ flex: 1, minHeight: 0 }}>
        <code className={className} {...props}>{children}</code>
      </div>
    </div>
  );
}

/**
 * 基础 Markdown 组件
 * 提供基本的 Markdown 渲染功能，支持自定义插件
 */
export function Markdown({
  content,
  className,
  components,
  remarkPlugins = [remarkGfm as unknown as Plugin<[], Root>],
  rehypePlugins = [rehypeRaw as any, rehypeHighlight as unknown as Plugin<[], Node>],
}: MarkdownProps) {
  // 使用 useMemo 缓存组件配置，避免每次重新渲染
  const defaultComponents = useMemo(() => ({
    ...components,
    code: CodeBlock,
    // pre 只做包裹，交给 code 处理复制按钮
    pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => {
      return <pre {...props}>{children}</pre>;
    },
  }), [components]);

  return (
    <MarkdownErrorBoundary content={content}>
      <div className={cn("prose dark:prose-invert world-class-markdown", className)}>
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
