import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ActivityItem {
  id: string;
  icon?: React.ReactNode;
  label: string;
  title?: string;
  group?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

export interface ActivityBarState {
  // 活动项列表
  items: ActivityItem[];
  // 当前激活的活动项ID
  activeId: string;
  // 是否展开
  expanded: boolean;
  // 添加活动项
  addItem: (item: ActivityItem) => void;
  // 移除活动项
  removeItem: (id: string) => void;
  // 更新活动项
  updateItem: (id: string, updates: Partial<ActivityItem>) => void;
  // 设置激活项
  setActiveId: (id: string) => void;
  // 切换展开状态
  toggleExpanded: () => void;
  // 设置展开状态
  setExpanded: (expanded: boolean) => void;
  // 重置状态
  reset: () => void;
}

const defaultItems: ActivityItem[] = [
  {
    id: 'chat',
    label: '聊天',
    group: '主要功能',
    isActive: true,
  },
  {
    id: 'agents',
    label: '智能体',
    group: '主要功能',
  },
  {
    id: 'settings',
    label: '设置',
    group: 'footer',
  },
  {
    id: 'github',
    label: 'GitHub',
    title: '访问 GitHub 仓库',
    group: 'footer',
  },
];

export const useActivityBarStore = create<ActivityBarState>()(
  persist(
    (set) => ({
      items: defaultItems,
      activeId: 'chat',
      expanded: false,

      addItem: (item: ActivityItem) => {
        set((state) => ({
          items: [...state.items, item],
        }));
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          // 如果删除的是当前激活项，则激活第一个可用项
          activeId: state.activeId === id 
            ? state.items.find(item => item.id !== id)?.id || 'chat'
            : state.activeId,
        }));
      },

      updateItem: (id: string, updates: Partial<ActivityItem>) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      setActiveId: (id: string) => {
        set((state) => {
          // 在一个set操作中同时更新activeId和items
          const updatedItems = state.items.map((item) => ({
            ...item,
            isActive: item.id === id,
          }));
          return {
            activeId: id,
            items: updatedItems,
          };
        });
      },

      toggleExpanded: () => {
        set((state) => ({ expanded: !state.expanded }));
      },

      setExpanded: (expanded: boolean) => {
        set({ expanded });
      },

      reset: () => {
        set({
          items: defaultItems,
          activeId: 'chat',
          expanded: false,
        });
      },
    }),
    {
      name: 'activity-bar-storage',
      version: 1,
    }
  )
);

// 选择器hooks
export const useActivityItems = () => useActivityBarStore((state) => state.items);
export const useActiveId = () => useActivityBarStore((state) => state.activeId);
export const useExpanded = () => useActivityBarStore((state) => state.expanded);

// 按组获取活动项
export const useActivityItemsByGroup = (group: string) => 
  useActivityBarStore((state) => state.items.filter(item => item.group === group));

// 获取主要功能组
export const useMainGroupItems = () => useActivityItemsByGroup('主要功能');
// 获取footer组
export const useFooterItems = () => useActivityItemsByGroup('footer'); 