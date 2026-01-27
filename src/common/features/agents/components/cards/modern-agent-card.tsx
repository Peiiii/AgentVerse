import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import {
  Brain,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Sparkles,
  Star,
  Trash2,
  Zap
} from "lucide-react";
import React, { useState } from "react";

export interface ModernAgentCardProps {
  agent: AgentDef;
  variant?: "default" | "compact";
  onEditWithAI?: (agent: AgentDef) => void;
  onDelete?: (agentId: string) => void;
  onView?: (agentId: string) => void;
  showActions?: boolean;
  className?: string;
}

// 为每个agent生成独特的渐变色彩
const getAgentGradient = (agentId: string) => {
  const gradients = [
    "from-purple-500/10 via-pink-500/10 to-rose-500/10",
    "from-blue-500/10 via-cyan-500/10 to-teal-500/10",
    "from-emerald-500/10 via-green-500/10 to-lime-500/10",
    "from-orange-500/10 via-red-500/10 to-pink-500/10",
    "from-indigo-500/10 via-purple-500/10 to-violet-500/10",
    "from-yellow-500/10 via-orange-500/10 to-red-500/10",
    "from-teal-500/10 via-cyan-500/10 to-blue-500/10",
    "from-rose-500/10 via-pink-500/10 to-purple-500/10",
  ];

  const index = agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
};

// 获取角色图标和颜色
const getRoleConfig = (role?: string) => {
  switch (role) {
    case "moderator":
      return {
        icon: Brain,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        label: "主持人"
      };
    case "participant":
      return {
        icon: MessageCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
        label: "参与者"
      };
    default:
      return {
        icon: Sparkles,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        label: "智能体"
      };
  }
};

export const ModernAgentCard: React.FC<ModernAgentCardProps> = ({
  agent,
  variant = "default",
  onEditWithAI,
  onDelete,
  onView,
  showActions = false,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const safeAvatar = agent.avatar || "/avatars/default.png";
  const safeName = agent.name || "未命名";
  const nameInitial = safeName.length > 0 ? safeName[0] : "?";
  const roleConfig = getRoleConfig(agent.role);
  const gradientClass = getAgentGradient(agent.id);

  // 紧凑模式
  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
          "bg-gradient-to-br", gradientClass,
          "border-0 shadow-sm",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView?.(agent.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div className="relative">
              <Avatar className="w-12 h-12 ring-2 ring-white/20 shadow-lg">
                <AvatarImage src={safeAvatar} alt={safeName} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary-foreground font-semibold">
                  {nameInitial}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
                roleConfig.bgColor, roleConfig.borderColor, "border"
              )}>
                <roleConfig.icon className={cn("w-3 h-3", roleConfig.color)} />
              </div>
            </div>

            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate flex-1 min-w-0">{safeName}</h3>
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0 whitespace-nowrap flex-shrink-0"
                >
                  {roleConfig.label}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {agent.personality || "未设置性格"}
              </p>

              {agent.expertise && agent.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {agent.expertise.slice(0, 2).map((expertise, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/80 backdrop-blur-sm"
                    >
                      {expertise}
                    </span>
                  ))}
                  {agent.expertise.length > 2 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/80 backdrop-blur-sm">
                      +{agent.expertise.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 操作按钮 - 紧凑模式保持右侧 */}
            {showActions && (
              <div className={cn(
                "flex items-center gap-1 transition-all duration-300",
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
              )}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditWithAI?.(agent);
                  }}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white"
                  title="AI 编辑"
                >
                  <Zap className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(agent.id);
                  }}
                  className="h-8 w-8 p-0 hover:bg-red-500/20 text-white/80 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 默认模式
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02] cursor-pointer",
        "bg-gradient-to-br", gradientClass,
        "border border-border/50 shadow-sm backdrop-blur-sm",
        "hover:border-border hover:shadow-md",
        "flex flex-col h-full", // 确保卡片占满高度
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(agent.id)}
    >
      {/* 背景装饰 */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500",
        "bg-gradient-to-br from-white/5 to-transparent",
        isHovered && "opacity-100"
      )} />

      <CardContent className="p-6 relative flex flex-col h-full">
        {/* 头部区域 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* 头像 */}
            <div className="relative flex-shrink-0">
              <Avatar className={cn(
                "w-14 h-14 ring-2 ring-border shadow-md transition-all duration-300",
                isHovered && "ring-primary/30 scale-105"
              )}>
                <AvatarImage src={safeAvatar} alt={safeName} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/50 text-primary-foreground font-bold text-lg">
                  {nameInitial}
                </AvatarFallback>
              </Avatar>

              {/* 角色标识 */}
              <div className={cn(
                "absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center",
                "transition-all duration-300 shadow-lg",
                roleConfig.bgColor, roleConfig.borderColor, "border-2",
                isHovered && "scale-110"
              )}>
                <roleConfig.icon className={cn("w-4 h-4", roleConfig.color)} />
              </div>
            </div>

            {/* 基本信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-base font-bold truncate flex-1 min-w-0">{safeName}</h3>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-0.5 border whitespace-nowrap flex-shrink-0",
                    roleConfig.borderColor, roleConfig.bgColor
                  )}
                >
                  {roleConfig.label}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.personality || "未设置性格特征"}
              </p>
            </div>
          </div>
        </div>

        {/* 内容区域 - 使用flex-1确保占满剩余空间 */}
        <div className="flex-1">
          {/* 专长领域 */}
          {agent.expertise && agent.expertise.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">专长</h4>
              <div className="flex flex-wrap gap-1.5">
                {agent.expertise.slice(0, 4).map((expertise, index) => (
                  <span
                    key={index}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-md transition-all duration-200",
                      "bg-primary/10 text-primary border border-primary/20",
                      "hover:bg-primary/20"
                    )}
                  >
                    {expertise}
                  </span>
                ))}
                {agent.expertise.length > 4 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    +{agent.expertise.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 详细信息 */}
          <div className="space-y-1.5 text-xs">
            {agent.bias && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{agent.bias}</span>
              </div>
            )}
            {agent.responseStyle && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MessageCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{agent.responseStyle}</span>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作区域 - 固定贴底 */}
        <div className="mt-auto pt-3">
          {/* 分割线 */}
          <div className="border-t border-border/30 mb-3" />

          {/* 操作按钮和提示 */}
          <div className="flex items-center justify-between h-7">
            {/* 左侧：hover前显示详情提示，hover后隐藏 */}
            <div className={cn(
              "flex items-center gap-1.5 text-xs text-muted-foreground/50 transition-opacity duration-200",
              isHovered && showActions ? "opacity-0" : "opacity-100"
            )}>
              <Eye className="w-3.5 h-3.5" />
              <span>点击查看详情</span>
            </div>

            {/* 右侧：操作按钮组 - hover后从左侧滑入 */}
            {showActions && (
              <div className={cn(
                "absolute left-0 right-0 px-6 flex items-center justify-end gap-2 transition-all duration-300",
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              )}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditWithAI?.(agent);
                  }}
                  className="h-7 px-3 text-xs gap-1.5 bg-background/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  title="AI 编辑"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>AI编辑</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(agent.id);
                  }}
                  className="h-7 px-3 text-xs gap-1.5 bg-background/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 