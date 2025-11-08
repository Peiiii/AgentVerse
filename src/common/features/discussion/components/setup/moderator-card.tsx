import { Card } from "@/common/components/ui/card";
import { AgentDef } from "@/common/types/agent";
import { Check } from "lucide-react";
import { cn } from "@/common/lib/utils";

export interface ModeratorCardProps {
  agent: AgentDef;
  isSelected: boolean;
  onClick: () => void;
}

export function ModeratorCard({ agent, isSelected, onClick }: ModeratorCardProps) {
  return (
    <Card
      className={cn(
        "p-3 cursor-pointer hover:bg-muted/50 transition-all",
        "border-2",
        isSelected ? "border-primary" : "border-transparent"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <img
          src={agent.avatar}
          alt={agent.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{agent.name}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {agent.expertise.join("、")}
          </div>
        </div>
        {isSelected && (
          <div className="text-primary">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>
    </Card>
  );
} 