import { cn } from "@/common/lib/utils";
import { 
  Github,
  LayoutGrid,
  MessageSquare,
  Settings,
  Users
} from "lucide-react";

type Scene = "discussions" | "chat" | "agents" | "settings";

interface MobileBottomBarProps {
  className?: string;
  currentScene: Scene;
  onSceneChange: (scene: Scene) => void;
}

export function MobileBottomBar({
  className,
  currentScene,
  onSceneChange,
}: MobileBottomBarProps) {
  // 简化导航项配置，不再需要 activeIcon
  const navItems = [
    {
      scene: "discussions" as const,
      label: "会话",
      icon: LayoutGrid
    },
    {
      scene: "chat" as const,
      label: "讨论",
      icon: MessageSquare
    },
    {
      scene: "agents" as const,
      label: "智能体",
      icon: Users
    },
    {
      scene: "settings" as const,
      label: "设置",
      icon: Settings
    }
  ];

  const handleGithubClick = () => {
    window.open("https://github.com/Peiiii/AgentVerse", "_blank");
  };

  const NavButton = ({
    icon: Icon,
    label,
    scene,
  }: {
    icon: typeof MessageSquare;
    label: string;
    scene: Scene;
  }) => {
    const isActive = currentScene === scene;
    
    return (
      <button
        type="button"
        onClick={() => onSceneChange(scene)}
        className={cn(
          "flex-1 flex flex-col items-center justify-center",
          "transition-colors duration-200",
          "active:bg-black/5 dark:active:bg-white/5",
          "h-full"
        )}
      >
        <Icon 
          className={cn(
            "h-[24px] w-[24px] mb-0.5 transition-colors",
            isActive 
              ? "text-primary stroke-[1.5]"
              : "text-foreground/80 dark:text-foreground/70 stroke-[1.5]"
          )}
          fill={isActive ? "currentColor" : "none"}
        />
        <span 
          className={cn(
            "text-[10px] leading-[1.2]",
            isActive 
              ? "text-primary font-medium" 
              : "text-foreground/80 dark:text-foreground/70"
          )}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div
      className={cn(
        "lg:hidden flex-none h-[50px] border-t",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <nav className="flex h-full">
        {navItems.map(item => (
          <NavButton
            key={item.scene}
            {...item}
          />
        ))}
        
        {/* GitHub 链接按钮 */}
        <button
          type="button"
          onClick={handleGithubClick}
          className={cn(
            "flex-none w-[50px] flex flex-col items-center justify-center",
            "transition-colors duration-200",
            "active:bg-black/5 dark:active:bg-white/5",
            "h-full"
          )}
        >
          <Github 
            className={cn(
              "h-[24px] w-[24px] mb-0.5 transition-colors",
              "text-foreground/80 dark:text-foreground/70 stroke-[1.5]"
            )}
          />
          <span 
            className={cn(
              "text-[10px] leading-[1.2]",
              "text-foreground/80 dark:text-foreground/70"
            )}
          >
            GitHub
          </span>
        </button>
      </nav>
    </div>
  );
} 