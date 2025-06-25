import { Button } from "@/components/ui/button";
import { cn } from "@/common/lib/utils";
import { GuideScenario } from "@/common/types/guide";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface ChatEmptyGuideProps {
  scenarios: GuideScenario[];
  membersCount: number;
  onSuggestionClick: (template: string) => void;
  className?: string;
}

export function ChatEmptyGuide({
  scenarios,
  membersCount,
  onSuggestionClick,
  className
}: ChatEmptyGuideProps) {
  return (
    <div className={cn(
      "flex-1 min-h-0 overflow-y-auto", // 整体支持滚动
      className
    )}>
      <motion.div 
        className="px-4 py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 头部区域 */}
        <motion.div 
          className="text-center space-y-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-14 h-14 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-purple-500 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">开始你的多智能体对话</h2>
          <p className="text-sm text-muted-foreground">
            已选择 {membersCount} 个智能体，选择以下场景快速开始
          </p>
        </motion.div>

        {/* 场景列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario, index) => (
            <motion.div 
              key={scenario.id} 
              className="bg-card border rounded-lg p-4 space-y-4 hover:border-primary/50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              {/* 场景标题区域 */}
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-none">{scenario.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-lg font-medium truncate">{scenario.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {scenario.description}
                  </p>
                </div>
              </div>

              {/* 建议列表 */}
              <div className="space-y-3">
                {scenario.suggestions.map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4 text-left hover:bg-accent"
                    onClick={() => onSuggestionClick(suggestion.template)}
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium truncate">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {suggestion.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 