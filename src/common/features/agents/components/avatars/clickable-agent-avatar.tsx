// Avatar primitives are no longer used directly here
import { SmartAvatar } from "@/common/components/ui/smart-avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { AgentInfoCard } from "@/common/features/agents/components/cards/agent-info-card";
import { AgentDef } from "@/common/types/agent";
import { cn } from "@/common/lib/utils";

export interface ClickableAgentAvatarProps {
  agent: AgentDef | undefined;
  avatar: string;
  name: string;
  isUser?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onEditWithAI?: (agent: AgentDef) => void;
  showEditActions?: boolean;
  isResponding?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-10 h-10",
};

// 计算圆形轨迹的半径（基于头像大小）
const getOrbitRadius = (size: "sm" | "md" | "lg") => {
  const sizeMap = { sm: 14, md: 16, lg: 18 };
  return sizeMap[size];
};

export function ClickableAgentAvatar({
  agent,
  avatar,
  name,
  isUser = false,
  size = "md",
  className,
  onEditWithAI,
  showEditActions = false,
  isResponding = false,
}: ClickableAgentAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (isUser || !agent) {
    // For user, always show text avatar (no image)
    return (
      <SmartAvatar
        src={avatar || undefined}
        alt={name}
        className={cn(
          sizeClass, 
          "shrink-0 bg-gradient-to-br from-primary/80 to-primary",
          className
        )}
        fallback={<span className="text-white text-xs font-medium">{name[0] || "我"}</span>}
      />
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="cursor-pointer hover:opacity-80 transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 active:scale-95 relative"
          aria-label={`查看 ${name} 的详细信息`}
        >
          {/* 响应时的圆形轨迹动画 - 优雅的光点沿着边框移动 */}
          {isResponding && (
            <div className="absolute inset-0 rounded-full overflow-visible pointer-events-none z-0">
              {/* 移动的光点 - 沿着圆形轨迹 */}
              <div 
                className="absolute w-2 h-2 rounded-full bg-primary animate-orbit"
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-4px',
                  marginLeft: '-4px',
                  '--radius': `${getOrbitRadius(size)}px`,
                  boxShadow: '0 0 6px 2px hsl(var(--primary) / 0.6), 0 0 12px 4px hsl(var(--primary) / 0.3)',
                } as React.CSSProperties}
              />
            </div>
          )}
          <SmartAvatar
            src={avatar}
            alt={name}
            className={cn(
              sizeClass,
              "shrink-0 relative z-10 transition-all duration-300",
              "ring-2 ring-transparent hover:ring-primary/40",
              isResponding 
                ? "ring-primary/40 shadow-md" 
                : "hover:scale-105 shadow-sm hover:shadow-md",
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
          onEditWithAI={onEditWithAI}
          showEditActions={showEditActions}
        />
      </PopoverContent>
    </Popover>
  );
}
