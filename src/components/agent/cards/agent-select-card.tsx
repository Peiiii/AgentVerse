import React from "react";
import { cn } from "@/lib/utils";
import { Agent } from "@/types/agent";
import { Check } from "lucide-react";

export interface AgentSelectCardProps {
  // Agent数据
  agent: Agent;
  
  // 是否已选择
  selected?: boolean;
  
  // 是否禁用
  disabled?: boolean;
  
  // 选择回调
  onSelect?: (agent: Agent, selected: boolean) => void;
  
  // 描述文本
  description?: string;
  
  // 样式
  className?: string;
  
  // 渲染额外信息的函数
  renderExtraInfo?: (agent: Agent) => React.ReactNode;
}

export const AgentSelectCard: React.FC<AgentSelectCardProps> = ({
  agent,
  selected = false,
  disabled = false,
  onSelect,
  description,
  className,
  renderExtraInfo
}) => {
  // 处理点击事件
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect(agent, !selected);
    }
  };
  
  // 阻止额外信息区域的点击事件冒泡
  const handleExtraInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className={cn(
        "relative p-4 rounded-lg border transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
          <img 
            src={agent.avatar} 
            alt={agent.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/avatars/default.png";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm md:text-base truncate">
              {agent.name}
            </h3>
            <span className="text-xs text-muted-foreground capitalize whitespace-nowrap">
              {agent.role}
            </span>
          </div>
          {description && (
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
              {description}
            </p>
          )}
        </div>
        {selected && (
          <Check className="w-4 h-4 text-primary flex-shrink-0" />
        )}
      </div>
      
      {/* 渲染额外信息 - 添加点击事件阻止冒泡 */}
      {renderExtraInfo && (
        <div onClick={handleExtraInfoClick}>
          {renderExtraInfo(agent)}
        </div>
      )}
    </div>
  );
}; 