import React, { useMemo } from "react";
import { cn } from "@/common/lib/utils";
import { Agent } from "@/common/types/agent";
import { AgentSelectCard } from "../cards/agent-select-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useBreakpointContext } from "@/components/common/breakpoint-provider";

export interface AgentSelectListProps {
  // Agent列表
  agents: Agent[];
  
  // 已选择的Agent ID列表
  selectedIds?: string[];
  
  // 选择回调
  onSelect?: (agent: Agent, selected: boolean) => void;
  
  // 是否显示搜索框
  showSearch?: boolean;
  
  // 搜索占位符
  searchPlaceholder?: string;
  
  // 样式
  className?: string;
  
  // 列布局
  columns?: 1 | 2 | 3;
  
  // 是否显示加载状态
  loading?: boolean;
  
  // 禁用的Agent ID列表
  disabledIds?: string[];
  
  // Agent点击回调（可以覆盖默认的选择行为）
  onAgentClick?: (agent: Agent) => void;
  
  // 渲染额外信息的函数
  renderExtraInfo?: (agent: Agent) => React.ReactNode;
}

export const AgentSelectList: React.FC<AgentSelectListProps> = ({
  agents,
  selectedIds = [],
  onSelect,
  showSearch = true,
  searchPlaceholder = "搜索Agent...",
  className,
  columns = 2,
  loading = false,
  disabledIds = [],
  onAgentClick,
  renderExtraInfo
}) => {
  // 搜索状态
  const [searchQuery, setSearchQuery] = React.useState("");
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
  }[responsiveColumns];
  
  // 过滤Agent
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    
    const query = searchQuery.toLowerCase();
    return agents.filter(agent => {
      return (
        agent.name.toLowerCase().includes(query) ||
        agent.personality?.toLowerCase().includes(query) ||
        agent.expertise.some(exp => exp.toLowerCase().includes(query))
      );
    });
  }, [agents, searchQuery]);
  
  // 处理Agent选择
  const handleAgentSelect = (agent: Agent, selected: boolean) => {
    if (onAgentClick) {
      onAgentClick(agent);
    } else if (onSelect) {
      onSelect(agent, selected);
    }
  };
  
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
  
  return (
    <div className={className}>
      {showSearch && (
        <div className="relative mb-4">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
            isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
          )} />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-9",
              isMobile && "h-8 text-sm"
            )}
          />
        </div>
      )}
      
      {filteredAgents.length === 0 ? (
        <div className={cn(
          "text-center py-8 text-muted-foreground",
          isMobile ? "text-sm" : "text-base"
        )}>
          {searchQuery ? "没有找到匹配的Agent" : "暂无可用的Agent"}
        </div>
      ) : (
        <div className={cn("grid gap-3", gridClass)}>
          {filteredAgents.map((agent) => (
            <AgentSelectCard
              key={agent.id}
              agent={agent}
              selected={selectedIds.includes(agent.id)}
              disabled={disabledIds.includes(agent.id)}
              onSelect={handleAgentSelect}
              description={agent.personality}
              renderExtraInfo={renderExtraInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 