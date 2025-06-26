import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Switch } from "@/common/components/ui/switch";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { DiscussionMember } from "@/common/types/discussion-member";
import { ChevronRight, UserX, Settings, Briefcase, Lightbulb, Target } from "lucide-react";

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
    <div className="px-4 pb-4 border-t bg-muted/5 space-y-4">
      <div className="pt-3 space-y-1">
        <h4 className="text-sm font-medium">个性描述</h4>
        <p className="text-sm text-muted-foreground">
          {agent.personality}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            <span>专业领域</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agent.expertise?.map((item, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 text-xs rounded-md bg-muted/50 text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Target className="w-4 h-4" />
            <span>偏好倾向</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {agent.bias || '无特定偏好'}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Lightbulb className="w-4 h-4" />
            <span>回复风格</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {agent.responseStyle || '标准风格'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <span className="text-xs text-muted-foreground/70">
          {new Date(member.joinedAt).toLocaleString('zh-CN', { 
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })} 加入
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditAgent();
            }}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 px-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          >
            <UserX className="h-3.5 w-3.5" />
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
  return (
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer group overflow-hidden outline-none bg-background",
        isExpanded ? "shadow-sm" : "hover:shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "rounded-xl",
        className
      )}
      onClick={onExpand}
      {...props}
    >
      <div className="p-4">
        <div className="flex gap-4">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="w-10 h-10 rounded-xl bg-muted/30 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-medium text-base truncate">
                    {agent.name}
                  </h3>
                </div>
                <ChevronRight 
                  className={cn(
                    "w-4 h-4 text-muted-foreground/40 transition-transform duration-200 shrink-0",
                    isExpanded && "rotate-90"
                  )} 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {agent.role}
                </span>
                <div 
                  className="flex items-center gap-2" 
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-sm text-muted-foreground">自动回复</span>
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
          "grid transition-all duration-200",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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