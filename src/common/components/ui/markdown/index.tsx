import { cn } from "@/common/lib/utils";
import type { Root } from "mdast";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { Plugin } from "unified";
import { MarkdownErrorBoundary } from "./components/error-boundary";
import { MarkdownProps } from "./types";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CodeBlockContainer } from "./code-block-container";
import { CodeBlock, CodeBlockAction } from "./code-block";

export type { CodeBlockAction } from "./code-block";

// Markdown 组件 props 扩展
export interface MarkdownWithActionsProps extends MarkdownProps {
  codeBlockActions?: CodeBlockAction[];
}

export function Markdown({
  content,
  className,
  components,
  extraRemarkPlugins = [remarkGfm as unknown as Plugin<[], Root>],
  extraRehypePlugins = [rehypeRaw as any],
  codeBlockActions = [],
}: MarkdownWithActionsProps) {
  const remarkPlugins = useMemo(() => [...(extraRemarkPlugins ?? []), remarkGfm as unknown as Plugin<[], Root>], [extraRemarkPlugins]);
  const rehypePlugins = useMemo(() => [...(extraRehypePlugins ?? []), rehypeRaw as any], [extraRehypePlugins]);
  // 组件配置，注入 codeBlockActions
  const defaultComponents: Partial<Components> = useMemo(() => ({
    ...(components as Partial<Components>),
    code: (props: any) => <CodeBlock {...props} codeBlockActions={codeBlockActions} />, // 注入 actions
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
      console.log("[Markdown] ", { code, language });
      // 生成 actions
      const actions = codeBlockActions?.filter(a => !a.show || a.show(code, language)).map(a => (
        <button
          key={a.key}
          className="code-block-action-btn"
          title={a.label}
          style={{ marginLeft: 4 }}
          onClick={e => {
            e.stopPropagation();
            a.onClick(code, language);
          }}
        >
          {a.icon || a.label}
        </button>
      ));
      console.log("[Markdown] actions", actions);
      if (language) {
        return (
          <CodeBlockContainer language={language} code={code} actions={actions}>
            <SyntaxHighlighter
              language={language}
              PreTag="pre"
              customStyle={{ margin: 0, background: "none", boxShadow: "none" }}
            >
              {code}
            </SyntaxHighlighter>
          </CodeBlockContainer>
        );
      }
      return <pre {...props}>{props.children}</pre>;
    },
  }), [components, codeBlockActions]);

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
