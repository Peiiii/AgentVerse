import { useRef, useEffect, useState } from "react";

export interface WorldClassChatInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function WorldClassChatInputBar({ value, onChange, onSend, disabled, placeholder }: WorldClassChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 自动调整高度
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  // 快捷键处理：Enter 发送，Shift+Enter 换行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      style={{
        width: "100%",
        background: "#f8fafc",
        borderRadius: 16,
        boxShadow: isFocused ? "0 0 0 2px #6366f1" : "0 1px 4px #a5b4fc22",
        border: isFocused ? "2px solid #6366f1" : "1px solid #e0e7ff",
        padding: "10px 16px",
        display: "flex",
        alignItems: "flex-end",
        transition: "box-shadow 0.2s, border 0.2s",
        marginBottom: 24, // 底部外边距
        // 移除左右外边距
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || "请输入内容..."}
        rows={1}
        style={{
          flex: 1,
          resize: "none",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 16,
          color: "#22223b",
          minHeight: 32,
          maxHeight: 120,
          lineHeight: 1.7,
          padding: 0,
        }}
        disabled={disabled}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        style={{
          marginLeft: 12,
          background: disabled || !value.trim() ? "#e0e7ff" : "linear-gradient(90deg,#6366f1 60%,#818cf8 100%)",
          color: disabled || !value.trim() ? "#a5b4fc" : "#fff",
          border: "none",
          borderRadius: 12,
          padding: "8px 18px",
          fontSize: 15,
          fontWeight: 500,
          cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
          boxShadow: "0 1px 4px #a5b4fc22",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        发送
      </button>
    </div>
  );
} 