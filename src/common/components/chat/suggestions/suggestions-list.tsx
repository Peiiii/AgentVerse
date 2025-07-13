import { motion } from "framer-motion";
import { SuggestionItem, type SuggestionItem as SuggestionItemType } from "./suggestion-item";
import type { Suggestion } from "./suggestion.types";

interface SuggestionsListProps {
  suggestions: SuggestionItemType[];
  onSuggestionClick: (suggestion: SuggestionItemType, action: 'send' | 'edit') => void;
  onSendMessage?: (message: string) => void;
  layout?: 'grid' | 'list' | 'horizontal';
  maxItems?: number;
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export function SuggestionsList({
  suggestions,
  onSuggestionClick,
  onSendMessage,
  layout = 'list',
  maxItems = 4,
  className,
  showTitle = true,
  title = "建议"
}: SuggestionsListProps) {
  const displaySuggestions = suggestions.slice(0, maxItems);

  if (displaySuggestions.length === 0) {
    return null;
  }

  const containerClass = layout === 'grid' 
    ? "grid grid-cols-1 md:grid-cols-2 gap-3"
    : layout === 'horizontal'
    ? "flex gap-3 overflow-x-auto pb-2"
    : "space-y-3";

  const itemClass = layout === 'horizontal' ? "flex-none w-64" : "";

  const handleSuggestionClick = (suggestion: SuggestionItemType, action: 'send' | 'edit') => {
    if (action === 'send' && onSendMessage) {
      // 发送消息时使用 actionName
      const messageToSend = suggestion.actionName;
      onSendMessage(messageToSend);
    } else {
      // 编辑模式，调用原有的 onClick
      onSuggestionClick(suggestion, action);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {showTitle && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
        </div>
      )}
      
      <div className={containerClass}>
        {displaySuggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={itemClass}
          >
            <SuggestionItem
              suggestion={suggestion}
              onClick={handleSuggestionClick}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 