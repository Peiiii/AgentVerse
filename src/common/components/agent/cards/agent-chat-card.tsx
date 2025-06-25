import React from "react";
import { cn } from "@/common/lib/utils";
import { Agent } from "@/common/types/agent";
import { Badge } from "@/common/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";

export interface AgentChatCardProps {
  // Agent数据
  agent: Agent | {
    id?: string;
    name: string;
    avatar: string;
    role?: string;
  };
  
  // 是否活跃
  isActive?: boolean;
  
  // 最后一条消息
  lastMessage?: string;
  
  // 未读消息数量
  unreadCount?: number;
  
  // 时间戳
  timestamp?: Date;
  
  // 点击回调
  onClick?: () => void;
  
  // 样式
  className?: string;
}

export const AgentChatCard: React.FC<AgentChatCardProps> = ({
  agent,
  isActive = false,
  lastMessage,
  unreadCount = 0,
  timestamp,
  onClick,
  className,
}) => {
  const { isMobile } = useBreakpointContext();
  
  // 格式化时间
  const formattedTime = timestamp 
    ? formatDistanceToNow(timestamp, { addSuffix: true, locale: zhCN })
    : "";
  
  return (
    <div 
      className={cn(
        "relative border rounded-lg overflow-hidden transition-colors cursor-pointer",
        isActive ? "border-primary bg-primary/5" : "border-border",
        "hover:border-primary/50 hover:bg-primary/5",
        className
      )}
      onClick={onClick}
    >
      <div className={cn("p-3", isMobile && "p-2")}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-full overflow-hidden bg-muted relative",
              isMobile ? "w-8 h-8" : "w-10 h-10"
            )}>
              <img 
                src={agent.avatar || "/avatars/default.png"} 
                alt={agent.name || "未命名"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avatars/default.png";
                }}
              />
              {isActive && (
                <div className={cn(
                  "absolute bottom-0 right-0 bg-green-500 rounded-full border-2 border-white",
                  isMobile ? "w-2 h-2" : "w-3 h-3"
                )} />
              )}
            </div>
            <div>
              <div className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>{agent.name || "未命名"}</div>
              {agent.role && (
                <div className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>
                  {agent.role === "moderator" ? "主持人" : "参与者"}
                </div>
              )}
            </div>
          </div>
          
          {timestamp && (
            <div className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>{formattedTime}</div>
          )}
        </div>
        
        {lastMessage && (
          <div className={cn(
            "text-muted-foreground line-clamp-1 mb-1",
            isMobile ? "text-xs" : "text-sm"
          )}>
            {lastMessage}
          </div>
        )}
        
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <Badge variant="default" className={cn(
              "px-2 py-0.5 rounded-full",
              isMobile ? "text-[10px]" : "text-xs"
            )}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}; 