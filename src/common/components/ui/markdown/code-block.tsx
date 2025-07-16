import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CodeBlockContainer } from "./code-block-container";

export type CodeBlockAction = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (code: string, language?: string) => void;
  show?: (code: string, language?: string) => boolean;
};

export function CodeBlock({ className = "", children, codeBlockActions }: React.ComponentPropsWithoutRef<'code'> & { codeBlockActions?: CodeBlockAction[] }) {
  const match = /language-(\w+)/.exec(className);
  const language = match?.[1];
  if (language) {
    const codeStr = typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children.join("")
        : "";
    console.log("[CodeBlock] ", { codeStr, language });
    // 生成 actions
    const actions = codeBlockActions?.filter(a => !a.show || a.show(codeStr, language)).map(a => (
      <button
        key={a.key}
        className="code-block-action-btn"
        title={a.label}
        style={{ marginLeft: 4 }}
        onClick={e => {
          e.stopPropagation();
          a.onClick(codeStr, language);
        }}
      >
        {a.icon || a.label}
      </button>
    ));
    return (
      <CodeBlockContainer language={language} code={codeStr} actions={actions}>
        <SyntaxHighlighter
          language={language}
          PreTag="div"
          customStyle={{ margin: 0, background: "none", boxShadow: "none" }}
        >
          {codeStr}
        </SyntaxHighlighter>
      </CodeBlockContainer>
    );
  }
  return <code className={className}>{children}</code>;
} 