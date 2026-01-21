import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { Bot, Brain, Sparkles, Target, User, Wand2 } from "lucide-react";

interface AgentInfoCardProps {
  agent: AgentDef;
  className?: string;
  variant?: "default" | "compact" | "minimal";
  showPrompt?: boolean;
  onEditWithAI?: (agent: AgentDef) => void;
  showEditActions?: boolean;
  /** 点击头像时的回调，用于跳转到详情页 */
  onViewDetail?: (agentId: string) => void;
}

export function AgentInfoCard({
  agent,
  className,
  variant = "default",
  showPrompt = true,
  onEditWithAI,
  showEditActions = false,
  onViewDetail,
}: AgentInfoCardProps) {
  const getRoleConfig = (role?: string) => {
    switch (role) {
      case "moderator":
        return {
          icon: Bot,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/50",
          borderColor: "border-amber-200 dark:border-amber-800",
          label: "主持人"
        };
      case "participant":
        return {
          icon: Bot,
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
          borderColor: "border-emerald-200 dark:border-emerald-800",
          label: "参与者"
        };
      default:
        return {
          icon: Sparkles,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/50",
          borderColor: "border-blue-200 dark:border-blue-800",
          label: "智能体"
        };
    }
  };

  const roleConfig = getRoleConfig(agent.role);

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="relative">
          <Avatar className="w-8 h-8 ring-1 ring-primary/20">
            <AvatarImage src={agent.avatar} alt={agent.name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-sm">
              {agent.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow border border-background",
            roleConfig.bgColor
          )}>
            <roleConfig.icon className={cn("w-2 h-2", roleConfig.color)} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{agent.name}</span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1.5 py-0.5",
                roleConfig.borderColor,
                roleConfig.bgColor,
                roleConfig.color
              )}
            >
              {roleConfig.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {agent.personality || "智能助手"}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    const hasEditActions = showEditActions && onEditWithAI;

    return (
      <div className={cn("bg-card border border-border rounded-lg p-4 shadow-sm", className)}>
        <div className="flex items-start gap-3">
          <button
            className={cn(
              "relative",
              onViewDetail && "cursor-pointer hover:opacity-80 transition-opacity"
            )}
            onClick={() => onViewDetail?.(agent.id)}
            disabled={!onViewDetail}
          >
            <Avatar className="w-12 h-12 ring-2 ring-primary/20 shadow">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-base font-semibold">
                {agent.name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow border-2 border-background",
              roleConfig.bgColor
            )}>
              <roleConfig.icon className={cn("w-2.5 h-2.5", roleConfig.color)} />
            </div>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-base text-foreground truncate flex-1 min-w-0">{agent.name}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-2 py-0.5 shrink-0",
                  roleConfig.borderColor,
                  roleConfig.bgColor,
                  roleConfig.color
                )}
              >
                {roleConfig.label}
              </Badge>
              {hasEditActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0 hover:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditWithAI?.(agent);
                  }}
                  aria-label="AI 编辑智能体"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span className="text-muted-foreground truncate">
                  {agent.personality || "暂无描述"}
                </span>
              </div>

              {agent.expertise && agent.expertise.length > 0 && (
                <div className="flex items-center gap-2">
                  <Brain className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {agent.expertise.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0">
                        {skill}
                      </Badge>
                    ))}
                    {agent.expertise.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{agent.expertise.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - 完整版本
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 shadow-sm", className)}>
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="w-16 h-16 ring-2 ring-primary/20 shadow-lg">
            <AvatarImage src={agent.avatar} alt={agent.name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-lg font-semibold">
              {agent.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-background",
            roleConfig.bgColor
          )}>
            <roleConfig.icon className={cn("w-3 h-3", roleConfig.color)} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-foreground">{agent.name}</h3>
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-2 py-1",
                roleConfig.borderColor,
                roleConfig.bgColor,
                roleConfig.color
              )}
            >
              {roleConfig.label}
            </Badge>
          </div>

          <div className="space-y-3 text-sm">
            {/* 性格特征 */}
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-foreground">性格特征：</span>
                <span className="text-muted-foreground ml-1">{agent.personality || "暂无描述"}</span>
              </div>
            </div>

            {/* 专业技能 */}
            {agent.expertise && agent.expertise.length > 0 && (
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">专业技能：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 回应风格 */}
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-foreground">回应风格：</span>
                <span className="text-muted-foreground ml-1">{agent.responseStyle || "友好专业"}</span>
              </div>
            </div>

            {/* 系统提示词预览 */}
            {showPrompt && agent.prompt && (
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground">系统提示：</span>
                  <p className="text-muted-foreground text-xs mt-1 break-all overflow-hidden max-h-12">
                    {agent.prompt}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 