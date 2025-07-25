import React from "react";

// 基础设置项接口
export interface BaseSettingItem {
  id: string;
  name: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<SettingItemComponent>;
  inline?: boolean; // 是否直接在设置面板中展开显示
}

// 设置项组件接口
export interface SettingItemComponent {
  item?: BaseSettingItem;
}

// 设置项注册表类型
export type SettingsRegistry = Record<string, BaseSettingItem>; 