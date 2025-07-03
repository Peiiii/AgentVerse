import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AgentInfoCard } from "./cards/agent-info-card";

interface FloatingAgentInfoProps {
  agent: AgentDef;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  autoHide?: boolean;
  className?: string;
}

export function FloatingAgentInfo({
  agent,
  isVisible,
  onVisibilityChange,
  autoHide = true,
  className
}: FloatingAgentInfoProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // 处理显示/隐藏动画
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleToggle = () => {
    onVisibilityChange(!isVisible);
  };

  const handleClose = () => {
    onVisibilityChange(false);
  };

  if (!isAnimating && !isVisible) {
    return null;
  }

  return (
    <>
      {/* 悬浮按钮 - 始终显示 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={cn(
          "fixed top-4 right-4 z-50 shadow-lg border-2 transition-all duration-200",
          "bg-background/80 backdrop-blur-sm hover:bg-background",
          isVisible 
            ? "border-primary text-primary hover:border-primary/80" 
            : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
          className
        )}
      >
        <Info className="w-4 h-4" />
        <span className="hidden sm:inline ml-2">
          {isVisible ? "隐藏信息" : "查看信息"}
        </span>
      </Button>

      {/* 悬浮信息卡片 */}
      <div
        className={cn(
          "fixed top-16 right-4 z-40 w-80 max-w-[calc(100vw-2rem)]",
          "transition-all duration-300 ease-in-out",
          isVisible 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        )}
      >
        <div className="relative bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl">
          {/* 关闭按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Agent信息卡片 */}
          <div className="p-4 pr-12">
            <AgentInfoCard 
              agent={agent} 
              variant="compact"
              showPrompt={false}
              className="border-0 shadow-none bg-transparent"
            />
          </div>

          {/* 自动隐藏提示 */}
          {autoHide && (
            <div className="px-4 pb-3">
              <div className="text-xs text-muted-foreground text-center bg-muted/50 rounded-md px-2 py-1">
                💡 开始对话时会自动隐藏
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 背景遮罩 - 点击关闭 */}
      {isVisible && (
        <div
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px]"
          onClick={handleClose}
        />
      )}
    </>
  );
} 