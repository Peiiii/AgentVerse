// Avatar primitives are no longer used directly here
import { SmartAvatar } from "@/common/components/ui/smart-avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { AgentInfoCard } from "@/common/components/agent/cards/agent-info-card";
import { AgentDef } from "@/common/types/agent";
import { cn } from "@/common/lib/utils";

export interface ClickableAgentAvatarProps {
  agent: AgentDef | undefined;
  avatar: string;
  name: string;
  isUser?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onEdit?: (agent: AgentDef) => void;
  onEditWithAI?: (agent: AgentDef) => void;
  showEditActions?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-10 h-10",
};

export function ClickableAgentAvatar({
  agent,
  avatar,
  name,
  isUser = false,
  size = "md",
  className,
  onEdit,
  onEditWithAI,
  showEditActions = false,
}: ClickableAgentAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (isUser || !agent) {
    return (
      <SmartAvatar
        src={avatar}
        alt={name}
        className={cn(sizeClass, "shrink-0", className)}
        fallback={<span className="text-white text-xs">{name[0]}</span>}
      />
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="cursor-pointer hover:opacity-80 transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 active:scale-95"
          aria-label={`查看 ${name} 的详细信息`}
        >
          <SmartAvatar
            src={avatar}
            alt={name}
            className={cn(
              sizeClass,
              "shrink-0 ring-2 ring-transparent hover:ring-primary/40 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md",
              className
            )}
            fallback={<span className="text-white text-xs">{name[0]}</span>}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 border shadow-xl bg-popover/95 backdrop-blur-sm" 
        align="start"
        sideOffset={8}
        side="right"
      >
        <AgentInfoCard 
          agent={agent} 
          variant="compact"
          showPrompt={false}
          className="border-0 shadow-none"
          onEdit={onEdit}
          onEditWithAI={onEditWithAI}
          showEditActions={showEditActions}
        />
      </PopoverContent>
    </Popover>
  );
}
