import { useAddAgentDialog } from '@/components/agent/add-agent-dialog/use-add-agent-dialog';
import { useSettingsDialog } from '@/components/settings/settings-dialog';
import { useActivityBarStore } from '@/core/stores/activity-bar.store';
import { useCallback, useMemo } from 'react';

export class ActivityBarService {
  private static instance: ActivityBarService;

  static getInstance(): ActivityBarService {
    if (!ActivityBarService.instance) {
      ActivityBarService.instance = new ActivityBarService();
    }
    return ActivityBarService.instance;
  }

  // 处理活动项点击事件
  handleItemClick(activeId: string) {
    console.log("[ActivityBarService] handleItemClick", activeId);

    // 根据活动项执行相应操作
    switch (activeId) {
      case "agents":
        this.openAddAgentDialog();
        break;
      case "settings":
        this.openSettingsDialog();
        break;
      case "github":
        this.openGithub();
        break;
      case "chat":
        // 聊天是默认状态，不需要特殊处理
        break;
      default:
        console.warn(`[ActivityBarService] Unknown activity item: ${activeId}`);
        break;
    }
  }

  // 打开添加智能体对话框
  private openAddAgentDialog() {
    // 这里需要通过hook获取，所以需要在组件中使用
    console.log("[ActivityBarService] Opening add agent dialog");
  }

  // 打开设置对话框
  private openSettingsDialog() {
    console.log("[ActivityBarService] Opening settings dialog");
  }

  // 打开GitHub
  private openGithub() {
    window.open("https://github.com/Peiiii/AgentVerse", "_blank");
  }

}

// 导出单例实例
export const activityBarService = ActivityBarService.getInstance();

// Hook for using activity bar service in components
export function useActivityBarService() {
  const store = useActivityBarStore();
  const { openAddAgentDialog } = useAddAgentDialog();
  const { openSettingsDialog } = useSettingsDialog();

  // 使用useCallback避免重复创建函数
  const handleItemClick = useCallback((activeId: string) => {

    switch (activeId) {
      case "agents":
        openAddAgentDialog();
        break;
      case "settings":
        openSettingsDialog();
        break;
      case "github":
        window.open("https://github.com/Peiiii/AgentVerse", "_blank");
        break;
      case "chat":
        break;
      default:
        console.warn(`[useActivityBarService] Unknown activity item: ${activeId}`);
        break;
    }

    // 更新激活状态
    store.setActiveId(activeId);
  }, [openAddAgentDialog, openSettingsDialog, store]);

  const items = useMemo(() => {
    return store.items.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [store.items]);

  return {
    ...store,
    items,
    handleItemClick,
  };
}