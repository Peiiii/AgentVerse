import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { ChevronDown, Info, Zap } from "lucide-react";
import { useState } from "react";
import { AgentInfoCard } from "@/common/features/agents/components/cards/agent-info-card";

interface AgentChatHeaderWithInfoProps {
  agent: AgentDef;
  showInfoPanel?: boolean;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export function AgentChatHeaderWithInfo({ 
  agent, 
  showInfoPanel = true,
  defaultExpanded = false,
  compact = false
}: AgentChatHeaderWithInfoProps) {
  const [isInfoExpanded, setIsInfoExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b">
      {/* 主要头部区域 */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20 shadow-lg">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                {agent.name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            {/* 在线状态指示器 */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse shadow-sm"></div>
          </div>
          
          <div className="flex-1">
            <h2 className="font-bold text-lg">
              与 {agent.name} 对话
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              实时体验智能体能力
            </p>
          </div>
          
          {/* 信息面板切换按钮 */}
          {showInfoPanel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsInfoExpanded(!isInfoExpanded)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">智能体信息</span>
              <ChevronDown 
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isInfoExpanded && "rotate-180"
                )} 
              />
            </Button>
          )}
        </div>
      </div>
      
      {/* 可折叠的信息面板 */}
      {showInfoPanel && (
        <div 
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isInfoExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-6 pb-6">
            <div className="border-t pt-4">
              <AgentInfoCard 
                agent={agent} 
                variant={compact ? "compact" : "default"}
                showPrompt={!compact}
                className="shadow-none border-0 bg-muted/30"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
