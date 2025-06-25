// 设置项的基础类型
export interface SettingItem<T = unknown> {
  id: string;
  key: string;
  value: T;
  category: string;
  label: string;
  description?: string;
  type: "text" | "password" | "select" | "number" | "switch" | "group";
  options?: Array<{ label: string; value: unknown }>;
  order?: number;
  validation?: {
    required?: boolean;
    pattern?: RegExp;
    message?: string;
  };
}

// AI提供商配置模式
export interface AIProviderSettingSchema {
  provider: string;
  apiUrl: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// 设置分类定义
export interface SettingCategory {
  key: string;
  label: string;
  icon?: string;
  order?: number;
}

export interface AutoFillStrategy<TValue = unknown> {
  settingKey: string;
  whenValueSatisfies: TValue;
  fillItems: {
    settingKey: string;
    value: unknown;
  }[];
}
