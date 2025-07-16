import { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface CopyCodeButtonProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CopyCodeButton({ text, className, style }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      type="button"
      className={"copy-code-btn" + (className ? " " + className : "")}
      style={style}
      aria-label="复制代码"
      tabIndex={0}
      onClick={e => {
        e.stopPropagation();
        handleCopy();
      }}
    >
      {copied ? <Check size={18} color="#6366f1" /> : <Copy size={18} color="#64748b" />}
    </button>
  );
} 