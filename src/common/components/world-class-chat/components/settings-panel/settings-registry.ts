import { Sparkles, Brain } from "lucide-react";
import { PromptSetting } from "./prompt-setting";
import { MemorySetting } from "./memory-setting";
import type { BaseSettingItem } from "./types";

// 设置项注册表
export const settingsRegistry: BaseSettingItem[] = [
  {
    id: "prompt",
    name: "Prompt 设置",
    description: "自定义 AI 的思考方式和表达风格",
    icon: Sparkles,
    component: PromptSetting,
  },
  {
    id: "memory",
    name: "Memory 管理",
    description: "管理 AI 的记忆和知识库",
    icon: Brain,
    component: MemorySetting,
  },
];

// 根据 ID 获取设置项
export function getSettingById(id: string): BaseSettingItem | undefined {
  return settingsRegistry.find(setting => setting.id === id);
}

// 获取所有设置项
export function getAllSettings(): BaseSettingItem[] {
  return settingsRegistry;
}
