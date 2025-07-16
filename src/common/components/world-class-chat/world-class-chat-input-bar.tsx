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
      className="flex items-end mb-6 bg-slate-50 rounded-2xl mx-4"
      style={{
        boxShadow: isFocused ? "0 0 0 2px #6366f1" : "0 1px 4px #a5b4fc22",
        border: "2px solid",
        borderColor: isFocused ? "#6366f1" : "#e0e7ff",
        padding: "10px 16px"
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
        className="flex-1 resize-none border-none outline-none bg-transparent text-base text-neutral-900 min-h-[32px] max-h-[120px] leading-[1.7] p-0"
        style={{ fontSize: 16 }}
        disabled={disabled}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className={
          `ml-3 rounded-xl px-[18px] py-2 text-[15px] font-medium shadow-md transition-colors duration-200 ` +
          (disabled || !value.trim()
            ? 'bg-indigo-100 text-indigo-200 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-500 to-indigo-400 text-white cursor-pointer hover:from-indigo-600 hover:to-indigo-500')
        }
      >
        发送
      </button>
    </div>
  );
} 