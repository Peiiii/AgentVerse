// UI 状态持久化的配置
export const UI_PERSIST_KEYS = {
  // 讨论相关
  DISCUSSION: {
    MEMBER_PANEL_VISIBLE: 'discussion:member_panel_visible',
    SETTINGS_PANEL_VISIBLE: 'discussion:settings_panel_visible',
  },
  // 活动栏相关
  ACTIVITY_BAR_EXPANDED: 'activity_bar:expanded',
  // 其他功能模块
  // CHAT: {
  //   SIDEBAR_VISIBLE: 'chat:sidebar_visible',
  // },
  // 可以继续添加其他模块...
} as const;

// 版本管理
export const UI_PERSIST_VERSIONS = {
  [UI_PERSIST_KEYS.DISCUSSION.MEMBER_PANEL_VISIBLE]: 1,
  [UI_PERSIST_KEYS.DISCUSSION.SETTINGS_PANEL_VISIBLE]: 1,
  [UI_PERSIST_KEYS.ACTIVITY_BAR_EXPANDED]: 1,
} as const;

/**
 * 创建UI持久化配置
 * @param key - 配置键名
 * @returns 持久化配置选项
 */
export function createUIPersistOptions(key: keyof typeof UI_PERSIST_VERSIONS) {
  return {
    key,
    version: UI_PERSIST_VERSIONS[key],
  };
} 