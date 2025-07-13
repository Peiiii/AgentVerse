import { cn } from "@/common/lib/utils";
import type { Suggestion } from "./suggestion.types";
import { X } from "lucide-react";

interface SuggestionsProviderProps {
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: Suggestion, action: 'send' | 'edit') => void;
  onSendMessage?: (message: string) => void;
  onClose?: () => void;
  className?: string;
}

export function SuggestionsProvider({
  suggestions = [],
  onSuggestionClick,
  onSendMessage,
  onClose,
  className
}: SuggestionsProviderProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'action' && onSendMessage) {
      // action 类型直接发送消息
      const messageToSend = suggestion.actionName;
      onSendMessage(messageToSend);
    } else {
      // 其他类型填入输入框
      onSuggestionClick(suggestion, 'edit');
    }
  };

  return (
    <div className={cn('w-full px-4 py-2', className)}>
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-2 flex-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className="inline-flex items-center h-9 px-4 rounded-full bg-muted hover:bg-accent transition text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/30"
              onClick={() => handleSuggestionClick(suggestion)}
              type="button"
            >
              <span>{suggestion.actionName}</span>
            </button>
          ))}
        </div>
        {onClose && (
          <button
            className="ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-accent transition"
            onClick={onClose}
            aria-label="关闭建议区"
            type="button"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
} 