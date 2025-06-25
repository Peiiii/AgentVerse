import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { cn } from "@/common/lib/utils";
import { forwardRef } from "react";
import { useMessageInput, type MessageInputRef } from "@/hooks/useMessageInput";

/**
 * 微信PC端消息输入框设计：
 * +---------------------------------------------------------------+
 * |                                                               |
 * |  +---------------------------------------------------+        |
 * |  |                                                   |        |
 * |  |  在这里输入消息...                                |        |
 * |  |                                                   |        |
 * |  |                                                   |        |
 * |  |                                                   |        |
 * |  +---------------------------------------------------+        |
 * |                                                               |
 * +---------------------------------------------------------------+
 */

interface MessageInputProps {
  onSendMessage: (content: string, agentId: string) => Promise<void>;
  className?: string;
}

export const MessageInputDesktop = forwardRef<MessageInputRef, MessageInputProps>(
  function MessageInputDesktop({ onSendMessage, className }, ref) {
    const {
      input,
      setInput,
      isLoading,
      inputRef,
      handleKeyDown
    } = useMessageInput({
      onSendMessage,
      forwardedRef: ref
    });

    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-md", className)}>
        <div className="p-3">
          <AutoResizeTextarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在这里输入消息..."
            className="w-full resize-none text-sm outline-none border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none shadow-none bg-transparent text-gray-900 dark:text-gray-100"
            disabled={isLoading}
            minRows={2}
            maxRows={6}
          />
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">
            按 Enter 键发送，按 Shift+Enter 键换行
          </div>
        </div>
      </div>
    );
  }
); 