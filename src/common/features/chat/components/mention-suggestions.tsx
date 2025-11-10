// Avatar primitives are not used directly here
import { SmartAvatar } from "@/common/components/ui/smart-avatar";
import { AgentDef } from "@/common/types/agent";
import { cn } from "@/common/lib/utils";
import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface MentionSuggestionsProps {
  agents: AgentDef[];
  selectedIndex: number;
  onSelect: (agent: AgentDef) => void;
  getAgentName: (agentId: string) => string;
  getAgentAvatar: (agentId: string) => string;
  position: { top: number; left: number } | null;
  placement?: "top" | "bottom"; // where to render relative to caret
  className?: string;
}

export function MentionSuggestions({
  agents,
  selectedIndex,
  onSelect,
  getAgentName,
  getAgentAvatar,
  position,
  placement = "bottom",
  className,
}: MentionSuggestionsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedItemRef.current && listRef.current) {
      const item = selectedItemRef.current;
      const list = listRef.current;
      const itemTop = item.offsetTop;
      const itemHeight = item.offsetHeight;
      const listHeight = list.clientHeight;
      const scrollTop = list.scrollTop;

      if (itemTop < scrollTop) {
        list.scrollTop = itemTop;
      } else if (itemTop + itemHeight > scrollTop + listHeight) {
        list.scrollTop = itemTop + itemHeight - listHeight;
      }
    }
  }, [selectedIndex]);

  if (!position || agents.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed z-50 w-64 bg-popover border border-border rounded-lg shadow-xl max-h-64 overflow-hidden",
        "backdrop-blur-sm bg-popover/95",
        className
      )}
      style={{
        // Anchor to caret; for bottom we push down a bit, for top we translate up by 100% + gap
        top: `${placement === "top" ? position.top : position.top + 8}px`,
        left: `${position.left}px`,
        transform: placement === "top" ? "translateY(-8px) translateY(-100%)" : undefined,
      }}
    >
      <div className="p-1 max-h-64 overflow-y-auto" ref={listRef}>
        {agents.map((agent, index) => {
          const agentName = getAgentName(agent.id);
          const agentAvatar = getAgentAvatar(agent.id);
          const isSelected = index === selectedIndex;

          return (
            <div
              key={agent.id}
              ref={isSelected ? selectedItemRef : null}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors",
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
              onClick={() => onSelect(agent)}
            >
              <SmartAvatar
                src={agentAvatar}
                alt={agentName}
                className="w-8 h-8 shrink-0"
                fallback={<span className="text-xs">{agentName[0]}</span>}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate flex items-center gap-2">
                  <span className="truncate">{agentName}</span>
                  {agent.slug && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">
                      @{agent.slug}{agent.version ? ` v${agent.version}` : ""}
                    </span>
                  )}
                </div>
                {agent.personality && (
                  <div className="text-xs text-muted-foreground truncate">
                    {agent.personality}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
}
