import React from "react";
import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Search, Plus, Filter, Grid, List } from "lucide-react";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";

export interface PageContainerProps {
  // 页面标题
  title: string;
  
  // 页面描述
  description?: string;
  
  // 搜索相关
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // 操作按钮
  actions?: React.ReactNode;
  
  // 主要操作按钮
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };
  
  // 筛选器
  filters?: React.ReactNode;
  
  // 视图切换
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  
  // 侧边栏
  sidebar?: React.ReactNode;
  
  // 主内容
  children: React.ReactNode;
  
  // 样式
  className?: string;
  
  // 是否显示搜索栏
  showSearch?: boolean;
  
  // 是否显示筛选器
  showFilters?: boolean;
  
  // 是否显示视图切换
  showViewToggle?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  searchPlaceholder = "搜索...",
  searchValue = "",
  onSearchChange,
  actions,
  primaryAction,
  filters,
  viewMode = "grid",
  onViewModeChange,
  sidebar,
  children,
  className,
  showSearch = true,
  showFilters = false,
  showViewToggle = false,
}) => {
  const { isMobile } = useBreakpointContext();

  return (
    <div className={cn("h-full flex flex-col flex-grow-1", className)}>
      {/* 页面头部 */}
      <div className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="p-4 lg:p-6">
          {/* 标题区域 */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-sm lg:text-base text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            
            {/* 操作按钮区域 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className="gap-2"
                >
                  {primaryAction.icon || <Plus className="w-4 h-4" />}
                  {!isMobile && primaryAction.label}
                </Button>
              )}
            </div>
          </div>

          {/* 搜索和筛选区域 */}
          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            {showSearch && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-9 h-9 bg-muted/20 border-border/50 focus:bg-background/60"
                />
              </div>
            )}

            {/* 筛选器 */}
            {showFilters && (
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {!isMobile && "筛选"}
              </Button>
            )}

            {/* 视图切换 */}
            {showViewToggle && onViewModeChange && (
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* 筛选器内容 */}
          {filters && (
            <div className="mt-4 pt-4 border-t">
              {filters}
            </div>
          )}
        </div>
      </div>

      {/* 页面主体 */}
      <div className="flex-1 min-h-0 flex w-full">
        {/* 侧边栏 */}
        {sidebar && (
          <div className="w-80 flex-none border-r bg-muted/20">
            {sidebar}
          </div>
        )}
        
        {/* 主内容区域 */}
        <div className="flex-1 min-w-0 w-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}; 