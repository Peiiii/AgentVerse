import { SettingItem } from "@/common/types/settings";
import { DEFAULT_SETTINGS } from "@/core/config/settings-schema";
import { SettingsStore, settingsStore } from "@/core/repositories/data-providers";

export class SettingsRepository {
  constructor(
    private readonly store: SettingsStore,
    private readonly defaults: Omit<SettingItem, "id">[]
  ) {}

  private async normalizeSettings(): Promise<SettingItem[]> {
    const savedValues = await this.store.readAll();
    return this.defaults.map((item) => ({
      ...item,
      id: item.key,
      value:
        Object.prototype.hasOwnProperty.call(savedValues, item.key) &&
        savedValues[item.key] !== undefined
          ? savedValues[item.key]
          : item.value,
    }));
  }

  async listSettings(): Promise<SettingItem[]> {
    return this.normalizeSettings();
  }

  async updateSetting(
    key: string,
    data: Partial<SettingItem>
  ): Promise<SettingItem> {
    const settings = await this.normalizeSettings();
    const target = settings.find((s) => s.key === key || s.id === key);
    if (!target) {
      throw new Error(`Setting not found: ${key}`);
    }
    const next = { ...target, ...data, id: target.key };
    const savedValues = await this.store.readAll();
    savedValues[next.key] = next.value;
    await this.store.writeAll(savedValues);
    return next;
  }

  async updateMany(updates: Record<string, unknown>): Promise<SettingItem[]> {
    const savedValues = await this.store.readAll();
    Object.entries(updates).forEach(([key, value]) => {
      savedValues[key] = value;
    });
    await this.store.writeAll(savedValues);
    return this.normalizeSettings();
  }

  async resetToDefaults(): Promise<SettingItem[]> {
    await this.store.clear();
    return this.normalizeSettings();
  }
}

export const settingsRepository = new SettingsRepository(
  settingsStore,
  DEFAULT_SETTINGS
);
