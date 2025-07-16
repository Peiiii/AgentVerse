import React from "react";
import { CopyCodeButton } from "./copy-code-button";

export interface CodeBlockHeaderProps {
  language?: string;
  code: string;
}

export function CodeBlockHeader({ language, code }: CodeBlockHeaderProps) {
  return (
    <div className="code-block-header">
      <span className="code-lang-tag">{language ? language.charAt(0).toUpperCase() + language.slice(1) : ""}</span>
      <span className="copy-btn-wrapper">
        <CopyCodeButton text={code} />
      </span>
    </div>
  );
}

export interface CodeBlockContainerProps {
  language?: string;
  code: string;
  children: React.ReactNode;
}

export function CodeBlockContainer({ language, code, children }: CodeBlockContainerProps) {
  return (
    <div className="code-block-container">
      <CodeBlockHeader language={language} code={code} />
      {children}
    </div>
  );
} 