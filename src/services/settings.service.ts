import { STORAGE_CONFIG } from "@/config/storage";
import { DataProvider, MockHttpProvider } from "@/common/lib/storage";
import { SettingItem } from "@/common/types/settings";

export type SettingDataProvider = DataProvider<SettingItem>;

export class SettingsService {
  constructor(private readonly provider: SettingDataProvider) {}

  async listSettings(): Promise<SettingItem[]> {
    return this.provider.list();
  }

  async getSetting(id: string): Promise<SettingItem> {
    return this.provider.get(id);
  }

  async createSetting(data: Omit<SettingItem, "id">): Promise<SettingItem> {
    return this.provider.create(data);
  }

  async updateSetting(
    id: string,
    data: Partial<SettingItem>
  ): Promise<SettingItem> {
    return this.provider.update(id, data);
  }

  async deleteSetting(id: string): Promise<void> {
    return this.provider.delete(id);
  }

  // 批量创建
  async createMany(data: Omit<SettingItem, "id">[]): Promise<SettingItem[]> {
    return this.provider.createMany(data);
  }

  // 辅助方法：按分类获取
  async getSettingsByCategory(category: string): Promise<SettingItem[]> {
    const settings = await this.listSettings();
    return settings.filter((item) => item.category === category);
  }

  async listCategories(): Promise<string[]> {
    const settings = await this.listSettings();
    return [...new Set(settings.map((item) => item.category))];
  }

  // 辅助方法：按key获取
  async getSettingByKey(key: string): Promise<SettingItem | undefined> {
    const settings = await this.listSettings();
    return settings.find((item) => item.key === key);
  }

  // 验证
  public validateSetting(setting: SettingItem): boolean {
    if (!setting.validation) return true;

    if (setting.validation.required && !setting.value) {
      return false;
    }

    if (setting.validation.pattern && typeof setting.value === "string") {
      return setting.validation.pattern.test(setting.value);
    }

    return true;
  }
}

export const settingsService = new SettingsService(
  new MockHttpProvider<SettingItem>(STORAGE_CONFIG.KEYS.SETTINGS, { delay: STORAGE_CONFIG.MOCK_DELAY_MS })
);
