import { SupportedAIProvider } from "@/common/types/ai";
import { SettingCategory, SettingItem, AutoFillStrategy } from "@/common/types/settings";
import { AI_PROVIDER_CONFIG, BasicAIConfig } from "@/core/config/ai";
import { SETTING_KYES } from "@/core/config/settings";
import i18n from "@/core/config/i18n";

const getDefaultAiProviderConfig = () => {
  const providerName =
    BasicAIConfig.AI_PROVIDER_NAME || SupportedAIProvider.OPENAI;
  const provider =
    AI_PROVIDER_CONFIG[providerName] || AI_PROVIDER_CONFIG[SupportedAIProvider.OPENAI];
  return {
    provider: providerName,
    apiUrl: provider.baseUrl,
    apiKey: provider.apiKey || "",
    model: provider.model,
  };
};

export const SETTINGS_CATEGORIES: SettingCategory[] = [
  { key: "ai.provider", label: "AI 提供商", order: 1 },
  { key: "app", label: "应用", order: 2 },
];

export const DEFAULT_SETTINGS: Omit<SettingItem, "id">[] = [
  {
    key: "ai.provider.id",
    category: "ai.provider",
    label: "AI 提供商",
    description: "选择要使用的 AI 服务提供商",
    type: "select",
    order: 1,
    value: getDefaultAiProviderConfig().provider,
    options: [
      { label: "阿里云 DashScope", value: SupportedAIProvider.DASHSCOPE },
      { label: "DeepSeek", value: SupportedAIProvider.DEEPSEEK },
      { label: "豆包", value: SupportedAIProvider.DOBRAIN },
      { label: "Moonshot", value: SupportedAIProvider.MOONSHOT },
      { label: "OpenAI", value: SupportedAIProvider.OPENAI },
      { label: "自定义", value: "custom" },
    ],
  },
  {
    key: SETTING_KYES.AI.PROVIDER.API_URL,
    category: "ai.provider",
    label: "API 地址",
    description: "服务接口地址",
    type: "text",
    order: 2,
    value: getDefaultAiProviderConfig().apiUrl,
    validation: {
      required: true,
      pattern: /^https?:\/\/.+/,
      message: "请输入有效的 API 地址",
    },
  },
  {
    key: SETTING_KYES.AI.PROVIDER.API_KEY,
    category: "ai.provider",
    label: "API Key",
    description: "服务访问密钥",
    type: "password",
    order: 3,
    value: getDefaultAiProviderConfig().apiKey,
    validation: {
      required: true,
      message: "API Key 不能为空",
    },
  },
  {
    key: SETTING_KYES.AI.PROVIDER.MODEL,
    category: "ai.provider",
    label: "模型",
    description: "使用的模型名称",
    type: "text",
    value: getDefaultAiProviderConfig().model,
    order: 4,
    validation: {
      required: true,
      message: "请输入模型名称",
    },
  },
  {
    key: "app.language",
    category: "app",
    label: "语言",
    description: "选择界面显示语言",
    type: "select",
    order: 1,
    value: i18n.language || "zh-CN",
    options: [
      { label: "简体中文", value: "zh-CN" },
      { label: "English", value: "en-US" },
    ],
  },
];

export const AUTO_FILL_STRATEGIES: AutoFillStrategy[] = Object.entries(
  AI_PROVIDER_CONFIG
).map(([key, value]) => ({
  settingKey: SETTING_KYES.AI.PROVIDER.ID,
  whenValueSatisfies: key as SupportedAIProvider,
  fillItems: [
    { settingKey: SETTING_KYES.AI.PROVIDER.API_URL, value: value.baseUrl },
    { settingKey: SETTING_KYES.AI.PROVIDER.API_KEY, value: value.apiKey },
    { settingKey: SETTING_KYES.AI.PROVIDER.MODEL, value: value.model },
  ],
}));
