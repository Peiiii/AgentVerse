import { createResource } from "@/common/lib/resource";
import { AUTO_FILL_STRATEGIES, DEFAULT_SETTINGS, SETTINGS_CATEGORIES } from "@/core/config/settings-schema";
import { aiService } from "@/core/services/ai.service";
import { settingsService } from "@/core/services/settings.service";
import { SETTING_KYES } from "@/core/config/settings";
import { SettingItem } from "@/common/types/settings";
import i18n from "@/core/config/i18n";

const applySettings = (settings: SettingItem[]) => {
  const providerType =
    settings.find((setting) => setting.key === SETTING_KYES.AI.PROVIDER.ID)
      ?.value || DEFAULT_SETTINGS[0].value;

  aiService.configure({
    apiKey:
      (settings.find(
        (setting) => setting.key === SETTING_KYES.AI.PROVIDER.API_KEY
      )?.value as string) || "",
    model:
      (settings.find(
        (setting) => setting.key === SETTING_KYES.AI.PROVIDER.MODEL
      )?.value as string) || "",
    baseUrl:
      (settings.find(
        (setting) => setting.key === SETTING_KYES.AI.PROVIDER.API_URL
      )?.value as string) || "",
    provider: String(providerType),
  });

  const languageSetting = settings.find(
    (setting) => setting.key === "app.language"
  );
  if (languageSetting && languageSetting.value !== i18n.language) {
    i18n.changeLanguage(languageSetting.value as string);
  }
};

export const autoFillStrategies = AUTO_FILL_STRATEGIES;

const settingListResource = createResource<SettingItem[]>(async () => {
  const settings = await settingsService.listSettings();
  applySettings(settings);
  return settings;
});

export const recoverDefaultSettings = async () => {
  const settings = await settingsService.resetToDefaults();
  applySettings(settings);
  settingListResource.mutate(settings);
  return settings;
};

export const settingsResource = {
  list: settingListResource,
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
  categories: SETTINGS_CATEGORIES,
};
