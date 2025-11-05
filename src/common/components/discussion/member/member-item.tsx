import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Switch } from "@/common/components/ui/switch";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { DiscussionMember } from "@/common/types/discussion-member";
import { ChevronRight, UserX, Settings, Briefcase, Lightbulb, Target } from "lucide-react";
import { SmartAvatar } from "@/common/components/ui/smart-avatar";

interface MemberItemProps {
  member: DiscussionMember;
  agent: AgentDef;
  isExpanded: boolean;
  onExpand: () => void;
  onToggleAutoReply: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onEditAgent: () => void;
  className?: string;
}

function MemberExpandedContent({
  member,
  agent,
  onEditAgent,
  onRemove
}: Pick<MemberItemProps, 'member' | 'agent' | 'onEditAgent' | 'onRemove'>) {
  return (
    <div className="relative px-4 pb-4 border-t border-border/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent space-y-4 animate-in slide-in-from-top-2 duration-300">
      <div className="pt-3 space-y-1.5">
        <h4 className="text-sm font-medium text-foreground">个性描述</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {agent.personality}
        </p>
      </div>

      <div className="space-y-3.5">
        {agent.expertise && agent.expertise.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              <span>专业领域</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agent.expertise.map((item, index) => (
                <span 
                  key={index}
                  className="px-2.5 py-1 text-xs rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-muted-foreground border border-primary/20 backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {(agent.bias || agent.responseStyle) && (
          <div className="space-y-2.5">
            {agent.bias && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Target className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>偏好倾向</span>
                </div>
                <p className="text-sm text-muted-foreground pl-5">
                  {agent.bias}
                </p>
              </div>
            )}

            {agent.responseStyle && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>回复风格</span>
                </div>
                <p className="text-sm text-muted-foreground pl-5">
                  {agent.responseStyle}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <span className="text-xs text-muted-foreground/80">
          {new Date(member.joinedAt).toLocaleString('zh-CN', { 
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })} 加入
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditAgent();
            }}
            className="h-7 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">编辑</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 px-2.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          >
            <UserX className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">移除</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MemberItem({
  member,
  agent,
  isExpanded,
  onExpand,
  onToggleAutoReply,
  onRemove,
  onEditAgent,
  className,
  ...props
}: MemberItemProps) {
  // 基于agent ID生成独特的渐变色彩
  const getGradientColor = (id: string) => {
    const gradients = [
      "from-primary/8 via-primary/4 to-transparent",
      "from-blue-500/8 via-cyan-500/4 to-transparent",
      "from-purple-500/8 via-pink-500/4 to-transparent",
      "from-emerald-500/8 via-teal-500/4 to-transparent",
      "from-orange-500/8 via-amber-500/4 to-transparent",
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-300 cursor-pointer group overflow-hidden outline-none shadow-none",
        "bg-gradient-to-br from-background via-card to-background",
        "border border-border/70",
        isExpanded 
          ? "border-primary/40 bg-gradient-to-br from-primary/5 via-card/50 to-background" 
          : "hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/3 hover:via-card/50 hover:to-background",
        "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        "rounded-xl",
        className
      )}
      onClick={onExpand}
      {...props}
    >
      {/* 左侧装饰条 */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b transition-all duration-300",
          getGradientColor(agent.id),
          isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />
      
      {/* 微妙的背景光效 */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 pointer-events-none",
          getGradientColor(agent.id),
          isExpanded && "opacity-100"
        )}
      />

      <div className="relative p-4">
        <div className="flex gap-3.5">
          <div className="relative">
            <SmartAvatar
              src={agent.avatar}
              alt={agent.name}
              className="w-12 h-12 rounded-xl shrink-0 ring-2 ring-border/30 group-hover:ring-primary/20 transition-all duration-300 group-hover:scale-105"
              fallback={<span className="text-white text-xs font-medium">{agent.name[0]}</span>}
            />
            {/* 在线状态指示器 */}
            {member.isAutoReply && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary ring-2 ring-background border border-primary/20" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base truncate text-foreground group-hover:text-primary/80 transition-colors duration-200">
                    {agent.name}
                  </h3>
                </div>
                <ChevronRight 
                  className={cn(
                    "w-4 h-4 text-muted-foreground/40 transition-all duration-300 shrink-0",
                    isExpanded 
                      ? "rotate-90 text-primary/60" 
                      : "group-hover:text-primary/50 group-hover:translate-x-0.5"
                  )} 
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground/80 truncate">
                  {agent.role}
                </span>
                <div 
                  className="flex items-center gap-2 shrink-0" 
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-xs text-muted-foreground/70 whitespace-nowrap">自动回复</span>
                  <Switch
                    checked={member.isAutoReply}
                    onCheckedChange={onToggleAutoReply}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div 
        className={cn(
          "grid transition-all duration-300 ease-out relative",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <MemberExpandedContent
            member={member}
            agent={agent}
            onEditAgent={onEditAgent}
            onRemove={onRemove}
          />
        </div>
      </div>
    </Card>
  );
} 