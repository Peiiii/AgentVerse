import { RxEvent } from "@/common/lib/rx-event";
import type { SettingItem } from "@/common/types/settings";
import { SETTING_KYES } from "@/core/config/settings";
import i18n from "@/core/config/i18n";
import { aiService } from "@/core/services/ai.service";
import { settingsService } from "@/core/services/settings.service";
import { useSettingsStore } from "@/core/stores/settings.store";

// Manager for Settings related UI actions.
// Exposes events and action functions (arrow functions only) to avoid `this` issues.
export class SettingsManager {
  readonly events = {
    open: new RxEvent<void>(),
  } as const;

  private applySettings = (settings: SettingItem[]) => {
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
    });

    const languageSetting = settings.find(
      (setting) => setting.key === "app.language"
    );
    if (languageSetting && languageSetting.value !== i18n.language) {
      i18n.changeLanguage(languageSetting.value as string);
    }
  };

  // Request opening the settings UI
  open = () => {
    this.events.open.next();
  };

  load = async () => {
    const store = useSettingsStore.getState();
    store.setLoading(true);
    try {
      const settings = await settingsService.listSettings();
      this.applySettings(settings);
      store.setData(settings);
      return settings;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "加载失败");
      return [];
    }
  };

  update = async (id: string, data: Partial<SettingItem>) => {
    const updated = await settingsService.updateSetting(id, data);
    const store = useSettingsStore.getState();
    const next = store.data.map((item) =>
      item.key === updated.key ? updated : item
    );
    this.applySettings(next);
    store.setData(next);
    return updated;
  };

  reset = async () => {
    const settings = await settingsService.resetToDefaults();
    this.applySettings(settings);
    useSettingsStore.getState().setData(settings);
    return settings;
  };

  getAll = () => useSettingsStore.getState().data;

  getValue = <T>(key: string): T | undefined => {
    const item = this.getAll().find((setting) => setting.key === key);
    return item?.value as T | undefined;
  };
}
