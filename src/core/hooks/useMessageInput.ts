import { ForwardedRef, useRef, useState } from "react";

export interface MessageInputRef {
  setValue: (value: string) => void;
  focus: () => void;
}

export interface MessageInputHookProps {
  onSendMessage: (content: string, agentId: string) => Promise<void>;
  forwardedRef?: ForwardedRef<MessageInputRef>;
}

export interface MessageInputHookResult {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  canSubmit: boolean;
  inputPlaceholder: string;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export function useMessageInput({
  onSendMessage,
  forwardedRef,
}: MessageInputHookProps): MessageInputHookResult {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageContent = input.trim();
    if (!messageContent || isLoading) return;

    // Clear input immediately for better UX. If sending fails, restore.
    setIsLoading(true);
    setInput("");
    try {
      await onSendMessage(messageContent, "user");
    } catch (err: unknown) {
      console.error("Failed to send message:", err);
      // Restore previous content on failure so the user doesn't lose text
      setInput(messageContent);
      // Swallow error here to avoid crashing event handlers; upstream can handle internally
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // IME 输入法合成中，忽略 Enter，避免误触发送
      if (e.nativeEvent.isComposing) return;
      // 如果按下了任何修饰键，允许换行
      if (e.shiftKey || e.metaKey || e.ctrlKey) return;
      // 单纯的 Enter 键，发送消息
      e.preventDefault();
      handleSubmit();
    }
  };

  // 暴露方法给父组件
  if (forwardedRef) {
    if (typeof forwardedRef === "function") {
      forwardedRef({
        setValue: (value: string) => {
          setInput(value);
          inputRef.current?.focus();
        },
        focus: () => {
          inputRef.current?.focus();
        },
      });
    } else {
      forwardedRef.current = {
        setValue: (value: string) => {
          setInput(value);
          inputRef.current?.focus();
        },
        focus: () => {
          inputRef.current?.focus();
        },
      };
    }
  }

  const canSubmit = Boolean(input.trim() && !isLoading);
  const inputPlaceholder =
    "输入消息... (Enter 发送，Shift/Cmd/Ctrl + Enter 换行)";

  return {
    input,
    setInput,
    isLoading,
    inputRef,
    canSubmit,
    inputPlaceholder,
    handleSubmit,
    handleKeyDown,
  };
}
