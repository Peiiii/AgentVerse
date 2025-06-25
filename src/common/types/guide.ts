export interface GuideScenario {
  id: string;
  icon: string;          // 可以是 emoji 或者图标名称
  title: string;         // 场景标题
  description: string;   // 场景描述
  suggestions: {
    id: string;
    title: string;      // 建议标题
    description: string; // 建议描述
    template: string;    // 点击后填充到输入框的模板内容
  }[];
} 