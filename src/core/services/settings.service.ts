import { SettingItem } from "@/common/types/settings";
import { DEFAULT_SETTINGS } from "@/core/config/settings-schema";
import { STORAGE_CONFIG } from "@/core/config/storage";

const hasWindow = typeof window !== "undefined";
const memoryStore: Record<string, unknown> = {};

function readStore(key: string) {
  if (hasWindow && window.localStorage) {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return memoryStore[key] && typeof memoryStore[key] === "object"
    ? (memoryStore[key] as Record<string, unknown>)
    : {};
}

function writeStore(key: string, value: Record<string, unknown>) {
  if (hasWindow && window.localStorage) {
    window.localStorage.setItem(key, JSON.stringify(value));
  } else {
    memoryStore[key] = value;
  }
}

export class SettingsService {
  constructor(
    private readonly storageKey: string,
    private readonly defaults: Omit<SettingItem, "id">[]
  ) {}

  private normalizeSettings(): SettingItem[] {
    const savedValues = readStore(this.storageKey);
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
    const settings = this.normalizeSettings();
    const target = settings.find((s) => s.key === key || s.id === key);
    if (!target) {
      throw new Error(`Setting not found: ${key}`);
    }
    const next = { ...target, ...data, id: target.key };
    const savedValues = readStore(this.storageKey);
    savedValues[next.key] = next.value;
    writeStore(this.storageKey, savedValues);
    return next;
  }

  async updateMany(
    updates: Record<string, unknown>
  ): Promise<SettingItem[]> {
    const savedValues = readStore(this.storageKey);
    Object.entries(updates).forEach(([key, value]) => {
      savedValues[key] = value;
    });
    writeStore(this.storageKey, savedValues);
    return this.normalizeSettings();
  }

  async resetToDefaults(): Promise<SettingItem[]> {
    writeStore(this.storageKey, {});
    return this.normalizeSettings();
  }
}

export const settingsService = new SettingsService(
  STORAGE_CONFIG.KEYS.SETTINGS,
  DEFAULT_SETTINGS
);
