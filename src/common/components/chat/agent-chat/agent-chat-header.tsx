import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Zap } from "lucide-react";
import { AgentDef } from "@/common/types/agent";
import { FloatingAgentInfo } from "../../agent/floating-agent-info";

interface AgentChatHeaderProps {
  agent: AgentDef;
  showFloatingInfo?: boolean;
  isFloatingInfoVisible?: boolean;
  onFloatingInfoVisibilityChange?: (visible: boolean) => void;
}

export function AgentChatHeader({ 
  agent, 
  showFloatingInfo = false,
  isFloatingInfoVisible = false,
  onFloatingInfoVisibilityChange
}: AgentChatHeaderProps) {
  return (
    <div className="relative">
      <div className="p-6 border-b">
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
        </div>
      </div>
      
      {/* 悬浮层信息面板 */}
      {showFloatingInfo && onFloatingInfoVisibilityChange && (
        <FloatingAgentInfo
          agent={agent}
          isVisible={isFloatingInfoVisible}
          onVisibilityChange={onFloatingInfoVisibilityChange}
          autoHide={true}
        />
      )}
    </div>
  );
} 