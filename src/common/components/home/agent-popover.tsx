import React from "react";
import { cn } from "@/common/lib/utils";
import { AgentCard } from "@/common/components/agent/cards";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";

interface AgentPopoverProps {
  name: string;
  avatar: string;
  role?: string;
  expertise?: string[];
  description?: string;
  className?: string;
  triggerClassName?: string;
  children?: React.ReactNode;
}

export const AgentPopover: React.FC<AgentPopoverProps> = ({
  name,
  avatar,
  role,
  expertise = [],
  description,
  className,
  triggerClassName,
  children,
}) => {
  // 确保头像URL是有效的
  const safeAvatar = avatar || "/avatars/default.png";
  
  return (
    <Popover>
      <PopoverTrigger>
        {children || (
          <button 
            className={cn(
              "flex items-center gap-2 p-2 rounded-md transition-colors text-left w-full",
              "bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10",
              triggerClassName
            )}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
              <img 
                src={safeAvatar} 
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avatars/default.png";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {name}
              </div>
              {role && (
                <div className="text-xs text-muted-foreground truncate">
                  {role}
                </div>
              )}
            </div>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className={cn("w-80 p-0", className)} align="start">
        <AgentCard
          agent={{
            name,
            avatar: safeAvatar,
            role,
            expertise
          }}
          mode="preview"
          description={description}
        />
      </PopoverContent>
    </Popover>
  );
}; 