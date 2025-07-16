import React from "react";
import { CopyCodeButton } from "./copy-code-button";

export interface CodeBlockHeaderProps {
  language?: string;
  code: string;
  /**
   * 可插拔的自定义操作按钮（如预览、下载等）
   */
  actions?: React.ReactNode;
}

export function CodeBlockHeader({ language, code, actions }: CodeBlockHeaderProps) {
  return (
    <div className="code-block-header">
      <span className="code-lang-tag">{language ? language.charAt(0).toUpperCase() + language.slice(1) : ""}</span>
      <span className="copy-btn-wrapper">
        {/* 默认复制按钮，可插拔更多按钮 */}
        <CopyCodeButton text={code} />
        {actions}
      </span>
    </div>
  );
}

export interface CodeBlockContainerProps {
  language?: string;
  code: string;
  children: React.ReactNode;
  /**
   * 可插拔的自定义操作按钮（如预览、下载等）
   */
  actions?: React.ReactNode;
}

export function CodeBlockContainer({ language, code, children, actions }: CodeBlockContainerProps) {
  return (
    <div className="code-block-container">
      <CodeBlockHeader language={language} code={code} actions={actions} />
      {children}
    </div>
  );
} 