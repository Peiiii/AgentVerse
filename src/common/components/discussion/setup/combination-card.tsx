import { Card } from "@/common/components/ui/card";
import { Agent } from "@/common/types/agent";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/common/lib/utils";

export interface AgentCombinationCardProps {
  name: string;
  description: string;
  moderator: Agent;
  participants: Agent[];
  isSelected: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export function AgentCombinationCard({
  name,
  description,
  moderator,
  participants,
  isSelected,
  onClick,
  isLoading
}: AgentCombinationCardProps) {
  return (
    <Card
      className={cn(
        "p-3 cursor-pointer hover:bg-muted/50 transition-all h-[120px] flex flex-col",
        "border-2",
        isSelected ? "border-primary" : "border-transparent"
      )}
      onClick={onClick}
    >
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-sm">{name}</div>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSelected && (
            <Check className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2 mt-1 border-t">
        <div className="flex -space-x-2">
          <img
            src={moderator.avatar}
            alt={moderator.name}
            className="w-6 h-6 rounded-full ring-2 ring-background"
            title={`主持人: ${moderator.name}`}
          />
          {participants.map((agent) => (
            <img
              key={agent.id}
              src={agent.avatar}
              alt={agent.name}
              className="w-6 h-6 rounded-full ring-2 ring-background"
              title={agent.name}
            />
          ))}
        </div>
      </div>
    </Card>
  );
} 