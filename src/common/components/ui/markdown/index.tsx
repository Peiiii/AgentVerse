import { cn } from "@/common/lib/utils";
import type { Root } from "mdast";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { Plugin } from "unified";
import { MarkdownErrorBoundary } from "./components/error-boundary";
import { CopyCodeButton } from "./copy-code-button";
import { MarkdownProps } from "./types";
// 新增：引入 react-syntax-highlighter 及主题
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// 新增：自定义代码块组件，支持高亮
function CodeBlock({ className = "", children, ...props }: React.ComponentPropsWithoutRef<'code'>) {
  // 提取语言
  const match = /language-(\w+)/.exec(className);
  const language = match?.[1];
  // 只对有语言的块级代码高亮
  if (language) {
    const codeStr = typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children.join("")
        : "";
    // oneLight 主题类型声明兼容处理
    return (
      <SyntaxHighlighter
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, background: "none", boxShadow: "none" }}
      >
        {codeStr}
      </SyntaxHighlighter>
    );
  }
  // 行内代码或无语言
  return <code className={className} {...props}>{children}</code>;
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
  rehypePlugins = [rehypeRaw as any],
}: MarkdownProps) {
  // 使用 useMemo 缓存组件配置，避免每次重新渲染
  const defaultComponents: Partial<Components> = useMemo(() => ({
    ...(components as Partial<Components>),
    code: CodeBlock,
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
      const children: React.ReactElement<{ children: string | string[]; className?: string }> | undefined = props.children as React.ReactElement<{ children: string | string[]; className?: string }>;
      let code = "";
      if (children && typeof children.props?.children === 'string') {
        code = children.props.children;
      } else if (children && Array.isArray(children.props?.children)) {
        code = (children.props.children as string[]).join("");
      }
      const className = children?.props?.className ?? "";
      const language = /language-(\w+)/.exec(className)?.[1];
      if (language) {
        return (
          <div className="code-block-container">
            <div className="code-block-header">
              <span className="code-lang-tag">{language.charAt(0).toUpperCase() + language.slice(1)}</span>
              <span className="copy-btn-wrapper">
                <CopyCodeButton text={code} />
              </span>
            </div>
            <SyntaxHighlighter
              language={language}
              PreTag="pre"
              customStyle={{ margin: 0, background: "none", boxShadow: "none" }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <pre {...props}>{props.children}</pre>;
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
