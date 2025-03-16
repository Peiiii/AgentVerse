import React from "react";
import { cn } from "@/lib/utils";
import { Agent } from "@/types/agent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useBreakpointContext } from "@/contexts/breakpoint-context";

export interface AgentGroupCardProps {
  // 组合名称
  name: string;
  
  // 组合描述
  description?: string;
  
  // 主持人
  moderator: Agent | {
    id?: string;
    name: string;
    avatar: string;
    role?: string;
  };
  
  // 参与者列表
  participants: Array<Agent | {
    id?: string;
    name: string;
    avatar: string;
    role?: string;
  }>;
  
  // 最大显示的参与者数量
  maxParticipants?: number;
  
  // 点击回调
  onClick?: () => void;
  
  // 样式
  className?: string;
}

export const AgentGroupCard: React.FC<AgentGroupCardProps> = ({
  name,
  description,
  moderator,
  participants,
  maxParticipants = 4,
  onClick,
  className,
}) => {
  const { isMobile } = useBreakpointContext();
  
  // 根据设备调整最大显示参与者数量
  const adjustedMaxParticipants = isMobile ? Math.min(3, maxParticipants) : maxParticipants;
  
  // 确保主持人名称有效
  const moderatorName = moderator.name || "未命名";
  const moderatorAvatar = moderator.avatar || "/avatars/default.png";
  
  // 显示的参与者（限制数量）
  const visibleParticipants = participants.slice(0, adjustedMaxParticipants);
  const hasMoreParticipants = participants.length > adjustedMaxParticipants;
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-colors cursor-pointer hover:border-primary/50 hover:bg-primary/5",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn("pb-2", isMobile && "p-3")}>
        <CardTitle className={cn(isMobile ? "text-base" : "text-lg")}>{name}</CardTitle>
        {description && <CardDescription className={cn(isMobile && "text-xs")}>{description}</CardDescription>}
      </CardHeader>
      
      <CardContent className={cn(isMobile && "p-3 pt-0")}>
        {/* 主持人 */}
        <div className="mb-4">
          <div className={cn("text-muted-foreground mb-2", isMobile ? "text-xs" : "text-sm")}>主持人</div>
          <div className="flex items-center gap-2">
            <Avatar className={cn(isMobile ? "w-6 h-6" : "w-8 h-8")}>
              <AvatarImage src={moderatorAvatar} alt={moderatorName} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {moderatorName[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <span className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>{moderatorName}</span>
          </div>
        </div>
        
        {/* 参与者 */}
        <div>
          <div className={cn("text-muted-foreground mb-2", isMobile ? "text-xs" : "text-sm")}>
            参与者 ({participants.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleParticipants.map((participant, index) => {
              const name = participant.name || "未命名";
              const avatar = participant.avatar || "/avatars/default.png";
              
              return (
                <Avatar key={index} className={cn(isMobile ? "w-6 h-6" : "w-8 h-8")}>
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="bg-secondary/20 text-secondary">
                    {name[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              );
            })}
            
            {hasMoreParticipants && (
              <div className={cn(
                "rounded-full bg-muted flex items-center justify-center text-muted-foreground",
                isMobile ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"
              )}>
                +{participants.length - adjustedMaxParticipants}
              </div>
            )}
          </div>
        </div>
        
        {/* 选择按钮 */}
        <div className="mt-4 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "gap-1",
              isMobile && "h-7 text-xs"
            )}
          >
            <span>选择</span>
            <ChevronRight className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 