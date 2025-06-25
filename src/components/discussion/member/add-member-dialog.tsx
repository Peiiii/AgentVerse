import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAgents } from "@/core/hooks/useAgents";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { cn } from "@/common/lib/utils";
import { Agent } from "@/common/types/agent";
import { Check, Search } from "lucide-react";
import match from "pinyin-match";
import { useMemo, useState } from "react";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({ open, onOpenChange }: AddMemberDialogProps) {
  const { agents, getAgentName, getAgentAvatar } = useAgents();
  const { members, addMember } = useDiscussionMembers();
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // 过滤可用的 agents，支持名称和拼音搜索
  const availableAgents = useMemo(() => {
    const filtered = agents.filter(
      (agent) => !members.some((member) => member.agentId === agent.id)
    );

    if (!searchQuery.trim()) {
      return filtered;
    }

    return filtered.filter((agent) => {
      const name = getAgentName(agent.id);
      // 支持直接匹配和拼音匹配
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.match(name, searchQuery)
      );
    });
  }, [agents, members, searchQuery, getAgentName]);

  const handleAgentClick = (agent: Agent) => {
    const newSelected = new Set(selectedAgents);
    if (selectedAgents.has(agent.id)) {
      newSelected.delete(agent.id);
    } else {
      newSelected.add(agent.id);
    }
    setSelectedAgents(newSelected);
  };

  const handleConfirm = async () => {
    await Promise.all(
      Array.from(selectedAgents).map((agentId) =>
        addMember(agentId, true)
      )
    );
    onOpenChange(false);
    setSelectedAgents(new Set());
    setSearchQuery(""); // 重置搜索
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>添加讨论成员</DialogTitle>
        </DialogHeader>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索成员..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-auto-fill gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {availableAgents.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              {searchQuery ? "没有找到匹配的成员" : "没有可添加的成员"}
            </div>
          ) : (
            availableAgents.map((agent) => (
              <div
                key={agent.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  selectedAgents.has(agent.id)
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                )}
                onClick={() => handleAgentClick(agent)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getAgentAvatar(agent.id)}
                    alt={getAgentName(agent.id)}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {getAgentName(agent.id)}
                      </h3>
                      <span className="text-xs text-muted-foreground capitalize">
                        {agent.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {agent.personality}
                    </p>
                  </div>
                  {selectedAgents.has(agent.id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedAgents(new Set());
              setSearchQuery(""); // 重置搜索
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedAgents.size === 0}
          >
            添加
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 