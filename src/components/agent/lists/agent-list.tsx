import { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { AgentCard } from "../cards";

export interface AgentListProps {
  agents: Agent[];
  loading?: boolean;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (id: string) => void;
  listClassName?: string;
  cardMode?: "detail" | "management";
}

export function AgentList({
  agents,
  loading,
  onEditAgent,
  onDeleteAgent,
  listClassName,
  cardMode = "management"
}: AgentListProps) {
  return (
    <div className={cn("space-y-3", listClassName)}>
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          mode={cardMode}
          onEdit={onEditAgent}
          onDelete={onDeleteAgent}
        />
      ))}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {!loading && agents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          暂无 Agent，点击上方按钮添加
        </div>
      )}
    </div>
  );
} 