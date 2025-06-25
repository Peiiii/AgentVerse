import { AI_PROVIDER_CONFIG, BasicAIConfig } from "@/config/ai";
import { SETTING_KYES } from "@/config/settings";
import { createResource } from "@/common/lib/resource";
import { aiService } from "@/services/ai.service";
import { settingsService } from "@/services/settings.service";
import { SupportedAIProvider } from "@/types/ai";
import { AIProviderSettingSchema, AutoFillStrategy, SettingItem } from "@/types/settings";

const getDefaultAiProviderConfig: () => AIProviderSettingSchema = () => {
  const providerName = BasicAIConfig.AI_PROVIDER_NAME;
  const provider = AI_PROVIDER_CONFIG[providerName];
  return {
    provider: providerName,
    apiUrl: provider.baseUrl,
    apiKey: "",
    model: provider.model,
  };
};

export const autoFillStrategies: AutoFillStrategy[] = Object.entries(AI_PROVIDER_CONFIG).map(([key, value]) => ({
  settingKey: SETTING_KYES.AI.PROVIDER.ID,
  whenValueSatisfies: key as SupportedAIProvider,
  fillItems: [
    { settingKey: SETTING_KYES.AI.PROVIDER.API_URL, value: value.baseUrl },
    { settingKey: SETTING_KYES.AI.PROVIDER.API_KEY, value: value.apiKey },
    { settingKey: SETTING_KYES.AI.PROVIDER.MODEL, value: value.model },
  ],
}));

// 默认设置
const defaultSettings: Omit<SettingItem, "id">[] = [
  // 全局 AI 设置
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
];



export const recoverDefaultSettings = async () => {
  const settings = await settingsService.listSettings();
  const existingSettings = settings.map((setting) => setting.key);
  const newSettings = defaultSettings.filter(
    (setting) => !existingSettings.includes(setting.key)
  );
  const overrideSettings = defaultSettings.filter((setting) =>
    existingSettings.includes(setting.key)
  );
  if (overrideSettings.length > 0) {
    await Promise.all(
      overrideSettings.map((setting) => {
        return settingsService.updateSetting(
          settings.find((s) => s.key === setting.key)!.id,
          setting
        );
      })
    );
  }
  if (newSettings.length > 0) {
    await settingsService.createMany(newSettings);
  }
};

const settingListResource = createResource<SettingItem[]>(
  async () => {
    const settings = await settingsService.listSettings();
    const existingSettings = settings.map((setting) => setting.key);
    const newSettings = defaultSettings.filter(
      (setting) => !existingSettings.includes(setting.key)
    );
    if (newSettings.length > 0) {
      await settingsService.createMany(newSettings);
      return await settingsService.listSettings();
    }
    return settings;
  },
  {
    onCreated: async (resource) => {
      resource.subscribe((state) => {
        if (
          !state.isLoading &&
          !state.isValidating &&
          !state.error &&
          state.data
        ) {
          const settings = state.data;
          const providerType = settings.find(
            (setting) => setting.key === SETTING_KYES.AI.PROVIDER.ID
          )!.value;
          const providerConfig = Object.entries(AI_PROVIDER_CONFIG).find(
            ([key]) => key === providerType
          )?.[1];
          aiService.configure({
            apiKey:
              (settings.find(
                (setting) => setting.key === SETTING_KYES.AI.PROVIDER.API_KEY
              )!.value as string) || providerConfig?.apiKey||"",
            model:
              (settings.find(
                (setting) => setting.key === SETTING_KYES.AI.PROVIDER.MODEL
              )!.value as string) || providerConfig?.model || "",
            baseUrl:
              (settings.find(
                (setting) => setting.key === SETTING_KYES.AI.PROVIDER.API_URL
              )!.value as string) || providerConfig?.baseUrl || "",
          });
        }
      });
    },
  }
);
// 设置资源
export const settingsResource = {
  // 所有设置列表
  list: settingListResource,

  // 按分类组织的设置
  byCategory: createResource(async () => {
    const settings = await settingListResource.whenReady();
    return settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, SettingItem[]>);
  }),
};
