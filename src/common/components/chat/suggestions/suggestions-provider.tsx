import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { Edit3, X } from "lucide-react";
import type { Suggestion } from "./suggestion.types";

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
            <div key={suggestion.id} className="relative group">
              <button
                className="inline-flex items-center h-9 px-4 rounded-full bg-muted hover:bg-accent transition text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/30"
                onClick={() => handleSuggestionClick(suggestion)}
                type="button"
              >
                <span>{suggestion.actionName}</span>
              </button>

              {/* 编辑图标 - hover 显示 */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-white/90 hover:bg-white shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onSuggestionClick(suggestion, 'edit');
                }}
                title="编辑"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            </div>
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