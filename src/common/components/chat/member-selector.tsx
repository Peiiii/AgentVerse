import { Badge } from "@/common/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Member } from "@/core/hooks/useMemberSelection";
import { AgentDef } from "@/common/types/agent";
import { MemberSelectItem } from "./member-select-item";

interface MemberSelectorProps {
  selectedMemberId: string;
  setSelectedMemberId: (id: string) => void;
  selectedAgent?: AgentDef;
  availableMembers: Member[];
  agents: AgentDef[];
  isLoading: boolean;
  isSelectDisabled: boolean;
}

export function MemberSelector({
  selectedMemberId,
  setSelectedMemberId,
  selectedAgent,
  availableMembers,
  agents,
  isLoading,
  isSelectDisabled,
}: MemberSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedMemberId}
        onValueChange={setSelectedMemberId}
        disabled={isLoading || isSelectDisabled}
      >
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="选择发送消息的成员" />
        </SelectTrigger>
        <SelectContent>
          {availableMembers.map((member: Member) => {
            if (member.isSelf) {
              return (
                <MemberSelectItem 
                  key={member.agentId}
                  agentId={member.agentId}
                  memberId={member.agentId}
                  agents={agents}
                  isSelf={true}
                />
              );
            }

            const agent = agents.find(a => a.id === member.agentId);
            if (!agent) return null;
            return (
              <MemberSelectItem 
                key={member.agentId}
                agentId={agent.id}
                memberId={member.agentId}
                agents={agents}
              />
            );
          })}
        </SelectContent>
      </Select>
      {selectedMemberId === 'self' ? (
        <Badge variant="outline" className="h-5 text-xs font-normal">
          我
        </Badge>
      ) : selectedAgent && (
        <Badge variant="outline" className="h-5 text-xs font-normal">
          {selectedAgent.role === "moderator" ? "主持人" : "参与者"}
        </Badge>
      )}
    </div>
  );
} 