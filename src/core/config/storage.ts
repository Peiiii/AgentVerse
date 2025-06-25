/** 存储相关配置 */
export const STORAGE_CONFIG = {
  /** Mock API 延迟时间（毫秒） */
  MOCK_DELAY_MS: 200,

  /** 存储 key 前缀 */
  KEY_PREFIX: 'my-app-2:',

  /** 各个资源的存储 key */
  KEYS: {
    AGENTS: 'agents',
    DISCUSSION_MEMBERS: 'discussion-members',
    MESSAGES: 'messages',
    DISCUSSIONS: 'discussions',
    SETTINGS: 'settings',
  }
} as const; 