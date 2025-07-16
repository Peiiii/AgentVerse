import { Button } from "@/common/components/ui/button";
import { useCopy } from "@/core/hooks/use-copy";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface CopyMessageButtonProps {
  text: string;
  className?: string;
}

export function CopyMessageButton({ text, className }: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false);
  const { copy } = useCopy({
    onSuccess: () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    },
  });

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label="复制消息"
      className={className}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 2,
        background: "rgba(244,246,251,0.9)", 
        boxShadow: "0 1px 4px #a5b4fc22",
        borderRadius: 8,
        width: 32,
        height: 32,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.18s, color 0.18s",
      }}
      onClick={e => {
        e.stopPropagation();
        copy(text);
      }}
      tabIndex={0}
    >
      {copied ? <Check size={18} color="#6366f1" /> : <Copy size={18} color="#64748b" />}
    </Button>
  );
} 