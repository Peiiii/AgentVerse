import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Agent } from "@/types/agent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useBreakpointContext } from "@/contexts/breakpoint-context";

// 定义卡片模式
export type AgentCardMode = "preview" | "detail" | "management";

// 统一的AgentCard组件属性
export interface AgentCardProps {
  // 基础数据
  agent: Agent | {
    name: string;
    avatar: string;
    role?: string;
    expertise?: string[];
    personality?: string;
    bias?: string;
    responseStyle?: string;
    prompt?: string;
  };
  
  // 模式控制
  mode?: AgentCardMode;
  
  // 交互回调
  onEdit?: (agent: Agent) => void;
  onDelete?: (agentId: string) => void;
  
  // 样式
  className?: string;
  
  // 描述（仅在preview模式使用）
  description?: string;
  
  // 是否默认展开（仅在detail和management模式使用）
  defaultExpanded?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  mode = "preview",
  onEdit,
  onDelete,
  className,
  description,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { isMobile } = useBreakpointContext();
  
  // 确保头像URL是有效的
  const safeAvatar = agent.avatar || "/avatars/default.png";
  
  // 确保name是有效的
  const safeName = agent.name || "未命名";
  const nameInitial = safeName.length > 0 ? safeName[0] : "?";
  
  // 预览模式 - 简单展示
  if (mode === "preview") {
    return (
      <div className={cn("p-3 space-y-3", className)}>
        <div className="flex items-center gap-3">
          <div className={cn("rounded-full overflow-hidden bg-muted", isMobile ? "w-10 h-10" : "w-12 h-12")}>
            <img 
              src={safeAvatar} 
              alt={safeName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avatars/default.png";
              }}
            />
          </div>
          <div>
            <h3 className="font-medium text-base">{safeName}</h3>
            {agent.role && <p className="text-sm text-muted-foreground">{agent.role === "moderator" ? "主持人" : "参与者"}</p>}
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {agent.expertise && agent.expertise.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-medium text-muted-foreground">专长领域</h4>
            <div className="flex flex-wrap gap-1">
              {agent.expertise.slice(0, isMobile ? 2 : 4).map((skill, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {skill}
                </span>
              ))}
              {agent.expertise.length > (isMobile ? 2 : 4) && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  +{agent.expertise.length - (isMobile ? 2 : 4)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // 详情模式和管理模式 - 使用Card组件
  return (
    <Card
      className={cn(
        "w-full hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors",
        className
      )}
    >
      <CardHeader className={cn("space-y-0", isMobile ? "p-3" : "p-4")}>
        {/* Agent基本信息 */}
        <div className="flex items-center space-x-3">
          <Avatar className={cn("border-2 border-purple-500/20", isMobile ? "w-9 h-9" : "w-10 h-10")}>
            <AvatarImage src={safeAvatar} alt={safeName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white">
              {nameInitial}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={cn("font-medium", isMobile ? "text-sm" : "text-base")}>{safeName}</span>
              {agent.role && (
                <Badge
                  variant={agent.role === "moderator" ? "default" : "secondary"}
                  className="text-xs px-1.5 py-0"
                >
                  {agent.role === "moderator" ? "主持人" : "参与者"}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>{agent.personality || "未设置性格"}</span>
              {!isExpanded && agent.expertise && agent.expertise.length > 0 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {agent.expertise[0]}
                  {agent.expertise.length > 1
                    ? ` +${agent.expertise.length - 1}`
                    : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* 管理模式才显示操作按钮 */}
        {mode === "management" && (
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(agent as Agent)}
                  className={cn(
                    "hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950 dark:hover:text-purple-400",
                    isMobile ? "h-7 px-1.5 text-xs" : "h-8 px-2"
                  )}
                >
                  编辑
                </Button>
              )}
              {onDelete && 'id' in agent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(agent.id)}
                  className={cn(
                    "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400",
                    isMobile ? "h-7 px-1.5 text-xs" : "h-8 px-2"
                  )}
                >
                  删除
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "p-0",
                  isMobile ? "h-7 w-7" : "h-8 w-8"
                )}
              >
                {isExpanded ? (
                  <ChevronUp className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                ) : (
                  <ChevronDown className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* 详情模式只有展开/折叠按钮 */}
        {mode === "detail" && (
          <div className="flex items-center justify-end mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "p-0",
                isMobile ? "h-7 w-7" : "h-8 w-8"
              )}
            >
              {isExpanded ? (
                <ChevronUp className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
              ) : (
                <ChevronDown className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
              )}
            </Button>
          </div>
        )}
        
        {/* 展开的详细信息 */}
        {isExpanded && (
          <div className="mt-3 pt-3 space-y-3 border-t dark:border-gray-700">
            {agent.expertise && agent.expertise.length > 0 && (
              <div>
                <Label className="text-sm mb-1.5 block">专业领域</Label>
                <div className="flex flex-wrap gap-1.5">
                  {agent.expertise.map((expertise, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-1.5 py-0"
                    >
                      {expertise}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {agent.bias && (
              <div>
                <Label className="text-sm mb-1 block">偏好倾向</Label>
                <p className="text-sm text-muted-foreground">{agent.bias}</p>
              </div>
            )}
            {agent.responseStyle && (
              <div>
                <Label className="text-sm mb-1 block">回复风格</Label>
                <p className="text-sm text-muted-foreground">{agent.responseStyle}</p>
              </div>
            )}
            {agent.prompt && (
              <div>
                <Label className="text-sm mb-1 block">Prompt</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {agent.prompt}
                </p>
              </div>
            )}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}; 