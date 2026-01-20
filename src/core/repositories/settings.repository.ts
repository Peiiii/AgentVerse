/**
 * SettingsRepository 接口定义
 * 设置存储抽象层
 * @module core/repositories/settings.repository
 */

/** 设置项 */
export interface SettingItem<T = unknown> {
    key: string;
    value: T;
    category: string;
    label: string;
    description?: string;
}

/**
 * 设置存储接口
 *
 * Adapters:
 * - LocalStorageAdapter: 使用 localStorage
 * - HttpAdapter: 通过后端 API（预留）
 * - SecureStorageAdapter: 安全存储（可选）
 */
export interface SettingsRepository {
    /** 获取所有设置 */
    list(): Promise<SettingItem[]>;

    /** 获取单个设置 */
    get<T>(key: string): Promise<T | undefined>;

    /** 更新设置 */
    update(key: string, value: unknown): Promise<void>;

    /** 重置为默认值 */
    reset(): Promise<SettingItem[]>;

    /** 监听设置变化 */
    watch(cb: (settings: SettingItem[]) => void): () => void;
}
