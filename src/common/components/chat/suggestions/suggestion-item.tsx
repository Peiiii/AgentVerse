import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { 
  MessageSquare, 
  Play, 
  ExternalLink, 
  Wrench, 
  Hash,
  ChevronRight 
} from "lucide-react";
import type { Suggestion } from "./suggestion.types";

export interface SuggestionItem {
  id: string;
  type: 'question' | 'action' | 'link' | 'tool' | 'topic';
  title: string;
  description?: string;
  content: string; // 点击后要执行的内容
  icon?: string; // 自定义图标
  metadata?: Record<string, any>; // 额外数据
}

interface SuggestionItemProps {
  suggestion: Suggestion;
  onClick: (suggestion: SuggestionItem) => void;
  className?: string;
}

const typeConfig = {
  question: {
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200"
  },
  action: {
    icon: Play,
    color: "text-green-600", 
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200"
  },
  link: {
    icon: ExternalLink,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100", 
    borderColor: "border-purple-200"
  },
  tool: {
    icon: Wrench,
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200"
  },
  topic: {
    icon: Hash,
    color: "text-gray-600",
    bgColor: "bg-gray-50 hover:bg-gray-100",
    borderColor: "border-gray-200"
  }
};

export function SuggestionItem({ suggestion, onClick, className }: SuggestionItemProps) {
  const config = typeConfig[suggestion.type];
  const IconComponent = suggestion.icon ? () => <span>{suggestion.icon}</span> : config.icon;

  return (
    <Button
      variant="outline"
      className={cn(
        "w-full justify-start h-auto py-3 px-4 text-left transition-all duration-200",
        config.bgColor,
        config.borderColor,
        "hover:shadow-sm hover:scale-[1.02]",
        className
      )}
      onClick={() => onClick(suggestion)}
    >
      <div className="flex items-start gap-3 w-full">
        <div className={cn("flex-none mt-0.5", config.color)}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm truncate">{suggestion.title}</p>
            <ChevronRight className="w-3 h-3 text-muted-foreground flex-none ml-2" />
          </div>
          {suggestion.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {suggestion.description}
            </p>
          )}
        </div>
      </div>
    </Button>
  );
} 