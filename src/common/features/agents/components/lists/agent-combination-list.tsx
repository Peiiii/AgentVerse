import React from "react";
import { cn } from "@/common/lib/utils";
import { AgentGroupCard, AgentGroupCardProps } from "../cards/agent-group-card";
import { AgentCombinationType } from "@/core/config/agents";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";

export interface AgentCombinationListProps {
  // 组合列表
  combinations: Array<{
    type: AgentCombinationType;
    name: string;
    description: string;
    moderator: AgentGroupCardProps["moderator"];
    participants: AgentGroupCardProps["participants"];
  }>;
  
  // 选择回调
  onSelect?: (type: AgentCombinationType) => void;
  
  // 样式
  className?: string;
  
  // 列布局
  columns?: 1 | 2 | 3 | 4;
  
  // 是否显示加载状态
  loading?: boolean;
}

export const AgentCombinationList: React.FC<AgentCombinationListProps> = ({
  combinations,
  onSelect,
  className,
  columns = 2,
  loading = false,
}) => {
  const { isMobile, isTablet } = useBreakpointContext();
  
  // 根据屏幕尺寸调整列数
  let responsiveColumns = columns;
  if (isMobile) {
    responsiveColumns = 1;
  } else if (isTablet && columns > 2) {
    responsiveColumns = 2;
  }
  
  // 根据列数确定网格类
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[responsiveColumns];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className={cn(
          "animate-spin border-4 border-primary border-t-transparent rounded-full",
          isMobile ? "w-6 h-6" : "w-8 h-8"
        )}></div>
      </div>
    );
  }
  
  if (combinations.length === 0) {
    return (
      <div className={cn(
        "text-center py-8 text-muted-foreground",
        isMobile ? "text-sm" : "text-base"
      )}>
        暂无可用的Agent组合
      </div>
    );
  }
  
  return (
    <div className={cn("grid gap-4", gridClass, className)}>
      {combinations.map((combination) => (
        <AgentGroupCard
          key={combination.type}
          name={combination.name}
          description={combination.description}
          moderator={combination.moderator}
          participants={combination.participants}
          onClick={() => onSelect?.(combination.type)}
        />
      ))}
    </div>
  );
}; 