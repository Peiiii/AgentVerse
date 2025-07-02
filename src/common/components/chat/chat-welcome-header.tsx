import { ReactNode } from "react";
import { cn } from "@/common/lib/utils";

export interface ChatWelcomeHeaderProps {
  // 标题配置
  title: string;
  description: string;
  
  // 中心图标配置
  centerIcon: ReactNode;
  centerIconClassName?: string;
  
  // 动画效果配置
  showMagicCircles?: boolean;
  showStarDecorations?: boolean;
  
  // 样式配置
  className?: string;
  containerSize?: "sm" | "md" | "lg";
  
  // 主题配置
  theme?: "magic" | "tech" | "minimal";
}

export function ChatWelcomeHeader({
  title,
  description,
  centerIcon,
  centerIconClassName,
  showMagicCircles = true,
  showStarDecorations = true,
  className,
  containerSize = "lg",
  theme = "magic",
}: ChatWelcomeHeaderProps) {
  // 容器尺寸映射
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-30 h-30", 
    lg: "w-36 h-36",
  };

  // 主题配置
  const themeConfig = {
    magic: {
      centerContainer: "bg-gradient-to-br from-violet-600 via-purple-600 via-fuchsia-600 to-pink-600",
      centerIconContainer: "bg-white/35 backdrop-blur-sm",
      titleGradient: "from-purple-600 via-blue-600 to-cyan-600",
      circles: {
        outer: "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400",
        middle: "border-purple-300/50",
        inner: "bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400",
      },
    },
    tech: {
      centerContainer: "bg-gradient-to-br from-emerald-500 via-teal-500 via-blue-500 to-indigo-500",
      centerIconContainer: "bg-white/25 backdrop-blur-sm",
      titleGradient: "from-emerald-600 via-teal-600 to-blue-600",
      circles: {
        outer: "bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400",
        middle: "border-teal-300/50",
        inner: "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400",
      },
    },
    minimal: {
      centerContainer: "bg-gradient-to-br from-gray-500 via-slate-500 to-zinc-500",
      centerIconContainer: "bg-white/20 backdrop-blur-sm",
      titleGradient: "from-gray-600 via-slate-600 to-zinc-600",
      circles: {
        outer: "bg-gradient-to-r from-gray-400 via-slate-400 to-zinc-400",
        middle: "border-slate-300/50",
        inner: "bg-gradient-to-r from-slate-400 via-gray-400 to-zinc-400",
      },
    },
  };

  const config = themeConfig[theme];

  return (
    <div className={cn("text-center py-8", className)}>
      <div className={cn("relative mx-auto mb-6", sizeClasses[containerSize])}>
        {/* 魔法圆阵效果 */}
        {showMagicCircles && (
          <>
            {/* 外层旋转圆 */}
            <div 
              className={cn("absolute inset-0 rounded-full animate-spin opacity-25", config.circles.outer)}
              style={{ animationDuration: "10s" }}
            />
            {/* 中层虚线圆 */}
            <div 
              className={cn("absolute inset-2 border-2 border-dashed rounded-full animate-spin", config.circles.middle)}
              style={{ animationDuration: "8s", animationDirection: "reverse" }}
            />
            {/* 内层脉冲圆 */}
            <div 
              className={cn("absolute inset-1 rounded-full animate-ping opacity-15", config.circles.inner)}
              style={{ animationDuration: "4s" }}
            />
          </>
        )}
        
        {/* 中心容器 */}
        <div className={cn(
          "absolute inset-4 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/40",
          config.centerContainer
        )}>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center animate-pulse",
            config.centerIconContainer
          )}>
            <div className={cn("text-white drop-shadow-lg", centerIconClassName)}>
              {centerIcon}
            </div>
          </div>
        </div>
        
        {/* 星星装饰 */}
        {showStarDecorations && (
          <>
            <div 
              className="absolute -top-2 left-1 w-5 h-5 bg-gradient-to-br from-yellow-300 to-amber-400 animate-bounce shadow-lg"
              style={{ 
                animationDelay: "0s", 
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" 
              }}
            />
            <div 
              className="absolute -bottom-2 right-1 w-4 h-4 bg-gradient-to-br from-pink-300 to-rose-400 animate-bounce shadow-lg"
              style={{ 
                animationDelay: "0.6s", 
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" 
              }}
            />
            <div 
              className="absolute top-2 -right-3 w-3 h-3 bg-gradient-to-br from-emerald-300 to-teal-400 animate-bounce shadow-lg"
              style={{ 
                animationDelay: "1.2s", 
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" 
              }}
            />
            <div 
              className="absolute bottom-6 -left-3 w-2 h-2 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "1.8s" }}
            />
            <div 
              className="absolute top-6 left-0 w-1.5 h-1.5 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "2.4s" }}
            />
          </>
        )}
      </div>
      
      {/* 标题 */}
      <h3 className={cn(
        "text-2xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent",
        `${config.titleGradient}`
      )}>
        {title}
      </h3>
      
      {/* 描述 */}
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
} 