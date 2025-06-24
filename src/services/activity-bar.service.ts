import { useActivityBarStore, ActivityItem, useMainGroupItems, useFooterItems } from '@/stores/activity-bar.store';
import { useAddAgentDialog } from '@/components/agent/add-agent-dialog/use-add-agent-dialog';
import { useSettingsDialog } from '@/components/settings/settings-dialog';
import { useCallback } from 'react';

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

  // 添加自定义活动项
  addCustomItem(item: Omit<ActivityItem, 'id'> & { id?: string }) {
    const id = item.id || `custom-${Date.now()}`;
    const newItem: ActivityItem = {
      ...item,
      id,
    };
    
    useActivityBarStore.getState().addItem(newItem);
    return id;
  }

  // 移除活动项
  removeItem(id: string) {
    useActivityBarStore.getState().removeItem(id);
  }

  // 更新活动项
  updateItem(id: string, updates: Partial<ActivityItem>) {
    useActivityBarStore.getState().updateItem(id, updates);
  }

  // 设置激活项
  setActiveItem(id: string) {
    useActivityBarStore.getState().setActiveId(id);
  }

  // 获取当前激活项
  getActiveItem() {
    const { activeId, items } = useActivityBarStore.getState();
    return items.find(item => item.id === activeId);
  }

  // 获取所有活动项
  getAllItems() {
    return useActivityBarStore.getState().items;
  }

  // 按组获取活动项
  getItemsByGroup(group: string) {
    const { items } = useActivityBarStore.getState();
    return items.filter(item => item.group === group);
  }

  // 重置到默认状态
  reset() {
    useActivityBarStore.getState().reset();
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
    console.log("[useActivityBarService] handleItemClick", activeId);
    
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

  return {
    ...store,
    handleItemClick,
  };
}

// 重新导出store中的hooks
export { useMainGroupItems, useFooterItems }; 