import { useSettingsDialog } from "@/common/components/settings/settings-dialog";
import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useCallback, useMemo } from "react";

// Hook for using activity bar service in components
export function useActivityBarService() {
  const store = useActivityBarStore();
  const { openSettingsDialog } = useSettingsDialog();

  // 使用useCallback避免重复创建函数
  const handleItemClick = useCallback(
    (activeId: string) => {
      switch (activeId) {
        case "settings":
          openSettingsDialog();
          break;
        case "github":
          window.open("https://github.com/Peiiii/AgentVerse", "_blank");
          break;
        case "chat":
          break;
        default:
          console.warn(
            `[useActivityBarService] Unknown activity item: ${activeId}`
          );
          break;
      }

      // 更新激活状态
      store.setActiveId(activeId);
    },
    [openSettingsDialog, store]
  );

  const items = useMemo(() => {
    return store.items.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [store.items]);

  return {
    ...store,
    items,
    handleItemClick,
  };
}
