import { useCallback } from "react";
import { useModal } from "@/common/components/ui/modal";
import { AddAgentDialogContent } from "./add-agent-dialog-content";

export function useAddAgentDialog() {
  const modal = useModal();

  const openAddAgentDialog = useCallback(() => {
    modal.show({
      title: "Agent 管理",
      content: <AddAgentDialogContent />,
      // 使用 className 来控制样式
      className: "sm:max-w-3xl sm:h-[85vh] overflow-hidden",
      // 不需要底部按钮
      showFooter: false
    });
  }, [modal]);

  return {
    openAddAgentDialog
  };
} 
