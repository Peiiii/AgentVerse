import { useCallback } from "react";
import { useModal } from "@/common/components/ui/modal";
import { SettingsDialogContent } from "./settings-dialog-content";

export function useSettingsDialog() {
  const modal = useModal();

  const openSettingsDialog = useCallback(() => {
    modal.show({
      content: <SettingsDialogContent />,
      className: "max-w-4xl h-[80vh]",
      showFooter: false
    });
  }, [modal]);

  return {
    openSettingsDialog
  };
} 