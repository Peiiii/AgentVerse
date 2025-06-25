import { useBreakpointContext } from "@/components/common/breakpoint-provider";
import { cn } from "@/common/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children?: ReactNode;
  className?: string;
  sidebarContent?: ReactNode;
  mainContent: ReactNode;
  showMobileSidebar?: boolean;
  onMobileSidebarChange?: (show: boolean) => void;
}

export function ResponsiveContainer({
  className,
  sidebarContent,
  mainContent,
  showMobileSidebar = false,
  onMobileSidebarChange,
}: ResponsiveContainerProps) {
  const { isLessThan } = useBreakpointContext();

  return (
    <div className={cn("h-full w-full overflow-hidden flex", className)} data-component="responsive-container">
      {sidebarContent && (
        <>
          {/* 移动端遮罩 */}
          {isLessThan("lg") && showMobileSidebar && (
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => onMobileSidebarChange?.(false)}
            />
          )}
          
          {/* Sidebar */}
          <div
            data-component="sidebar-wrapper"
            className={cn(
              "w-[280px] h-full border-r border-border bg-card flex-shrink-0",
              "transition-transform duration-300 ease-in-out",
              // 移动端：隐藏或显示
              isLessThan("lg") && !showMobileSidebar ? "-translate-x-full" : "translate-x-0",
              // 桌面端：始终显示
              "lg:translate-x-0"
            )}
          >
            {sidebarContent}
          </div>
        </>
      )}
      
      {/* 主内容区域 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-auto">
        {mainContent}
      </div>
    </div>
  );
}
