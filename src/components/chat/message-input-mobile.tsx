import { Button } from "@/components/ui/button";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { forwardRef } from "react";
import { useMessageInput, type MessageInputRef } from "@/hooks/useMessageInput";

/**
 * 微信移动端消息输入框设计（简化版）：
 * +-----------------------------------------------+
 * |                                               |
 * | +-------------------------------------------+ |
 * | | 在这里输入消息...                   [发送] | |
 * | +-------------------------------------------+ |
 * |                                               |
 * +-----------------------------------------------+
 */

interface MessageInputProps {
  onSendMessage: (content: string, agentId: string) => Promise<void>;
  className?: string;
  isFirstMessage?: boolean;
}

export const MessageInputMobile = forwardRef<MessageInputRef, MessageInputProps>(
  function MessageInputMobile({ onSendMessage, className }, ref) {
    const {
      input,
      setInput,
      isLoading,
      inputRef,
      canSubmit,
      handleSubmit,
      handleKeyDown
    } = useMessageInput({
      onSendMessage,
      forwardedRef: ref
    });

    return (
      <div className={cn("bg-gray-50 border-t border-gray-200 sticky bottom-0 z-10", className)}>
        <div className="px-3 py-2">
          <div className="flex items-center bg-white rounded-md border border-gray-200">
            <AutoResizeTextarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="在这里输入消息..."
              className="flex-1 resize-none text-sm outline-none border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none shadow-none bg-transparent px-3 py-2 min-h-[20px] leading-tight"
              disabled={isLoading}
              minRows={1}
              maxRows={4}
            />
            <Button
              type="button"
              onClick={(e) => handleSubmit(e as React.FormEvent)}
              disabled={!canSubmit || isLoading}
              size="icon"
              className={cn(
                "h-7 w-7 rounded-md mr-2 flex-shrink-0",
                canSubmit
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
); 