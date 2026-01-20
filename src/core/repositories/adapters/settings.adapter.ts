/**
 * SettingsRepository 的 LocalStorage Adapter
 * 包装现有 SettingsService 实现
 * @module core/repositories/adapters/settings.adapter
 */

import type { SettingItem, SettingsRepository } from '../settings.repository';
import { settingsService } from '@/core/services/settings.service';

type WatchCallback = (settings: SettingItem[]) => void;

/**
 * LocalStorage 适配器
 * 基于现有 SettingsService 实现 SettingsRepository 接口
 */
export class LocalStorageSettingsAdapter implements SettingsRepository {
    private listeners: Set<WatchCallback> = new Set();

    async list(): Promise<SettingItem[]> {
        return settingsService.listSettings();
    }

    async get<T>(key: string): Promise<T | undefined> {
        const settings = await settingsService.listSettings();
        const item = settings.find((s) => s.key === key);
        return item?.value as T | undefined;
    }

    async update(key: string, value: unknown): Promise<void> {
        await settingsService.updateSetting(key, { value });
        // 通知监听器
        this.notifyListeners();
    }

    async reset(): Promise<SettingItem[]> {
        const settings = await settingsService.resetToDefaults();
        this.notifyListeners();
        return settings;
    }

    watch(cb: WatchCallback): () => void {
        this.listeners.add(cb);
        return () => {
            this.listeners.delete(cb);
        };
    }

    private async notifyListeners(): Promise<void> {
        const settings = await settingsService.listSettings();
        this.listeners.forEach((cb) => cb(settings));
    }
}

/** 默认 SettingsRepository 实例 */
export const settingsRepository: SettingsRepository =
    new LocalStorageSettingsAdapter();
