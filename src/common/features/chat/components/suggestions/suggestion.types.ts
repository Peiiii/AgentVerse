export interface Suggestion {
  id: string;
  type: 'question' | 'action' | 'link' | 'tool' | 'topic';
  actionName: string; // 显示名称，对于 action 类型也用作发送的指令名
  description?: string;
  content: string; // 编辑时填入输入框的内容
  icon?: string;
  metadata?: Record<string, unknown>;
} 