import { cn } from "@/common/lib/utils";
import type { Suggestion } from "./suggestion.types";
import { X } from "lucide-react";

interface SuggestionsProviderProps {
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: Suggestion) => void;
  onClose?: () => void;
  className?: string;
}

export function SuggestionsProvider({
  suggestions = [],
  onSuggestionClick,
  onClose,
  className
}: SuggestionsProviderProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('w-full px-4 py-2', className)}>
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-2 flex-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className="inline-flex items-center h-9 px-4 rounded-full bg-muted hover:bg-accent transition text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/30"
              onClick={() => onSuggestionClick(suggestion)}
              type="button"
            >
              <span>{suggestion.title}</span>
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