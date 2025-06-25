import { Button } from "@/components/ui/button";
import { AGENT_COMBINATIONS, AgentCombinationType } from "@/core/config/agents";
import { useAgents } from "@/core/hooks/useAgents";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { cn } from "@/common/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/core/hooks/use-toast";

interface QuickMemberSelectorProps {
  onSelect?: () => void;
  onMembersChange?: (members: string[]) => void;
}

export function QuickMemberSelector({ 
  onSelect,
  onMembersChange
}: QuickMemberSelectorProps) {
  const { agents } = useAgents();
  const { addMembers } = useDiscussionMembers();
  const { toast } = useToast();
  const [loading, setLoading] = useState<AgentCombinationType | null>(null);

  const handleSelect = async (type: AgentCombinationType) => {
    if (loading) return;
    setLoading(type);

    try {
      const combination = AGENT_COMBINATIONS[type];
      if (!combination) return;

      // 查找主持人和参与者
      const moderatorAgent = agents.find(
        a => a.role === "moderator" && a.name === combination.moderator.name
      );
      const participantAgents = combination.participants
        .map(p => agents.find(a => a.role === "participant" && a.name === p.name))
        .filter(Boolean);

      // 准备所有要添加的成员
      const membersToAdd = [];
      const newMemberIds = [];
      
      if (moderatorAgent) {
        membersToAdd.push({ agentId: moderatorAgent.id, isAutoReply: true });
        newMemberIds.push(moderatorAgent.id);
      }

      participantAgents.forEach(agent => {
        if (agent) {
          membersToAdd.push({ agentId: agent.id, isAutoReply: false });
          newMemberIds.push(agent.id);
        }
      });

      if (membersToAdd.length === 0) {
        throw new Error('没有找到可添加的成员');
      }

      // 如果提供了 onMembersChange，则调用它
      if (onMembersChange) {
        onMembersChange(newMemberIds);
      } else {
        // 否则使用原有的添加成员逻辑
        await addMembers(membersToAdd);
      }
      
      onSelect?.();
    } catch (error) {
      console.error('Error adding members:', error);
      toast?.({
        title: "添加成员失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2 px-4">
      {Object.entries(AGENT_COMBINATIONS).map(([type, { name, description }]) => {
        const isLoading = loading === type;
        return (
          <Button
            key={type}
            variant="outline"
            className={cn(
              "w-full h-auto py-3 px-4 flex flex-col items-start gap-1",
              "hover:bg-muted/50",
              isLoading && "pointer-events-none"
            )}
            onClick={() => handleSelect(type as AgentCombinationType)}
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <div className="font-medium">{name}</div>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            </div>
            <div className="text-xs text-muted-foreground text-left line-clamp-2 w-full">
              {description}
            </div>
          </Button>
        );
      })}
    </div>
  );
} 