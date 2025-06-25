import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { SelectItem } from "@/common/components/ui/select";
import { Agent } from "@/common/types/agent";
import { User } from "lucide-react";

interface MemberSelectItemProps {
  agentId: string;
  memberId: string;
  agents: Agent[];
  isSelf?: boolean;
}

export function MemberSelectItem({ agentId, memberId, agents, isSelf }: MemberSelectItemProps) {
  if (isSelf) {
    return (
      <SelectItem value={memberId} className="flex items-center">
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5">
            <AvatarFallback>
              <User className="w-3 h-3" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">我</span>
        </div>
      </SelectItem>
    );
  }

  const agent = agents.find(a => a.id === agentId);
  if (!agent) return null;
  
  return (
    <SelectItem value={memberId} className="flex items-center">
      <div className="flex items-center gap-2">
        <Avatar className="w-5 h-5">
          <AvatarImage src={agent.avatar} />
          <AvatarFallback className="text-xs">
            {agent.name[0]}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{agent.name}</span>
      </div>
    </SelectItem>
  );
} 