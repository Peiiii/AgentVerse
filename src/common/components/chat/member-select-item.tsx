// Avatar primitives are not used directly here
import { SmartAvatar } from "@/common/components/ui/smart-avatar";
import { SelectItem } from "@/common/components/ui/select";
import { AgentDef } from "@/common/types/agent";
import { User } from "lucide-react";

interface MemberSelectItemProps {
  agentId: string;
  memberId: string;
  agents: AgentDef[];
  isSelf?: boolean;
}

export function MemberSelectItem({ agentId, memberId, agents, isSelf }: MemberSelectItemProps) {
  if (isSelf) {
    return (
      <SelectItem value={memberId} className="flex items-center">
        <div className="flex items-center gap-2">
          <SmartAvatar className="w-5 h-5" fallback={<User className="w-3 h-3" />} />
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
        <SmartAvatar
          src={agent.avatar}
          alt={agent.name}
          className="w-5 h-5"
          fallback={<span className="text-xs">{agent.name[0]}</span>}
        />
        <span className="text-sm">{agent.name}</span>
      </div>
    </SelectItem>
  );
} 
