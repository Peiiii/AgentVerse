import React, { useState } from "react";
import { AgentDef } from "@/common/types/agent";
import { AgentSelectList } from "../lists/agent-select-list";
import { Button } from "@/common/components/ui/button";
import { Switch } from "@/common/components/ui/switch";
import { Label } from "@/common/components/ui/label";
import { useModal } from "@/common/components/ui/modal";

export interface CustomTeamMember {
  agentId: string;
  isAutoReply: boolean;
}

export interface CustomTeamDialogContentProps {
  agents: AgentDef[];
  initialSelected: CustomTeamMember[];
  onConfirm: (selected: CustomTeamMember[]) => void;
  onCancel?: () => void;
}

export const CustomTeamDialogContent: React.FC<CustomTeamDialogContentProps> = ({
  agents,
  initialSelected,
  onConfirm,
  onCancel
}) => {
  const [selectedMembers, setSelectedMembers] = useState<CustomTeamMember[]>(initialSelected);
  const modal = useModal();
  
  // 获取已选择的ID列表
  const selectedIds = selectedMembers.map(m => m.agentId);
  
  // 处理Agent选择
  const handleAgentSelect = (agent: AgentDef, selected: boolean) => {
    if (selected) {
      setSelectedMembers(prev => [...prev, { agentId: agent.id, isAutoReply: true }]);
    } else {
      setSelectedMembers(prev => prev.filter(m => m.agentId !== agent.id));
    }
  };
  
  // 切换自动回复状态
  const toggleAutoReply = (agentId: string) => {
    setSelectedMembers(prev => 
      prev.map(m => m.agentId === agentId ? {...m, isAutoReply: !m.isAutoReply} : m)
    );
  };
  
  // 渲染额外信息（自动回复开关）
  const renderExtraInfo = (agent: AgentDef) => {
    const isSelected = selectedMembers.some(m => m.agentId === agent.id);
    if (!isSelected) return null;
    
    const member = selectedMembers.find(m => m.agentId === agent.id);
    return (
      <div className="mt-2 flex items-center">
        <Switch 
          checked={member?.isAutoReply || false}
          onCheckedChange={() => toggleAutoReply(agent.id)}
          id={`auto-reply-${agent.id}`}
        />
        <Label htmlFor={`auto-reply-${agent.id}`} className="ml-2 text-xs">
          自动回复
        </Label>
      </div>
    );
  };
  
  // 处理取消
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      modal.close();
    }
  };
  
  return (
    <div className="space-y-4 flex flex-col max-h-[70vh]">
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <AgentSelectList
          agents={agents}
          selectedIds={selectedIds}
          onSelect={handleAgentSelect}
          showSearch={true}
          searchPlaceholder="搜索专家..."
          renderExtraInfo={renderExtraInfo}
          columns={2}
        />
      </div>
      
      <div className="flex justify-between gap-2 pt-2 mt-2 border-t border-border/50">
        <Button
          variant="outline"
          onClick={() => setSelectedMembers([])}
        >
          清空选择
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button
            onClick={() => onConfirm(selectedMembers)}
            disabled={selectedMembers.length === 0}
            className={selectedMembers.length > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            确认选择
          </Button>
        </div>
      </div>
    </div>
  );
};

// 自定义团队对话框钩子
export function useCustomTeamDialog() {
  const modal = useModal();
  
  const openCustomTeamDialog = (
    agents: AgentDef[],
    initialSelected: CustomTeamMember[] = [],
    onConfirm: (selected: CustomTeamMember[]) => void
  ) => {
    modal.show({
      title: "自定义专家团队",
      content: (
        <CustomTeamDialogContent
          agents={agents}
          initialSelected={initialSelected}
          onConfirm={(selected) => {
            onConfirm(selected);
            modal.close();
          }}
        />
      ),
      className: "max-w-4xl",
      showFooter: false,
    });
  };
  
  return { openCustomTeamDialog };
}

// 导出对象形式，方便使用
export const CustomTeamDialog = {
  useCustomTeamDialog
}; 