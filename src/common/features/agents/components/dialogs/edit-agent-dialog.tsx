import { useModal } from "@/common/components/ui/modal";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";
import { usePresenter } from "@/core/presenter";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { useCallback } from "react";
import { AgentForm } from "@/common/features/agents/components/forms";

// 对话框内容组件
export interface EditAgentDialogContentProps {
  agent: AgentDef;
  onSubmit: (data: Partial<AgentDef>) => void;
  onClose: () => void;
}

export function EditAgentDialogContent({ 
  agent, 
  onSubmit, 
  onClose 
}: EditAgentDialogContentProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AgentForm
        open={true}
        onOpenChange={(open: boolean) => {
          if (!open) onClose();
        }}
        onSubmit={onSubmit}
        initialData={agent}
      />
    </div>
  );
}

// 钩子函数，用于打开对话框
export function useEditAgentDialog() {
  const modal = useModal();
  const presenter = usePresenter();
  const { isMobile } = useBreakpointContext();

  const openEditAgentDialog = useCallback((agent: AgentDef) => {
    modal.show({
      title: "编辑 Agent",
      content: (
        <EditAgentDialogContent 
          agent={agent} 
          onSubmit={(data) => {
            presenter.agents.update(agent.id, { ...agent, ...data });
            modal.close();
          }}
          onClose={() => modal.close()}
        />
      ),
      // 使用 className 来控制样式
      className: cn(
        "overflow-hidden",
        isMobile 
          ? "w-[95vw] max-h-[90vh]" 
          : "sm:max-w-xl sm:max-h-[85vh]"
      ),
      // 不需要底部按钮
      showFooter: false
    });
  }, [modal, presenter, isMobile]);

  return {
    openEditAgentDialog
  };
}

// 导出组件
export const EditAgentDialog = {
  Content: EditAgentDialogContent,
  useEditAgentDialog
}; 
