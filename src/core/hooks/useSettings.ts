import { useResourceState } from "@/common/lib/resource";
import { settingsResource } from "@/core/resources/settings.resource";
import { settingsService } from "@/core/services/settings.service";
import { SettingItem } from "@/common/types/settings";
import { useMemoizedFn } from "ahooks";
import { useOptimisticUpdate } from "./useOptimisticUpdate";
import { useMemo } from "react";

interface UseSettingsProps {
  onChange?: (settings: SettingItem[]) => void;
}

export function useSettings({ onChange }: UseSettingsProps = {}) {
  const resource = useResourceState(settingsResource.list);
  const { data: settings = [] } = resource;

  const withOptimisticUpdate = useOptimisticUpdate(resource, { onChange });

  const updateSetting = useMemoizedFn(
    async (id: string, data: Partial<SettingItem>) => {
      return withOptimisticUpdate(
        // 乐观更新
        (settings) =>
          settings.map((s) =>
            s.id === id || s.key === id ? { ...s, ...data } : s
          ),
        // API 调用
        () => settingsService.updateSetting(id, data)
      );
    }
  );

  const createSetting = useMemoizedFn(async (data: Omit<SettingItem, "id">) => {
    // 简化后不支持动态创建，直接返回当前设置列表
    return settings;
  });

  const deleteSetting = useMemoizedFn(async (id: string) => {
    // 简化后不支持删除，直接返回当前设置列表
    return settings;
  });

  const getSettingValue = useMemoizedFn(<T>(key: string): T | undefined => {
    const setting = settings.find((s) => s.key === key);
    return setting?.value as T;
  });

  const orderedSettings = useMemo(() => {
    return settings.slice().sort(
      (a, b) => (a.order || Infinity) - (b.order || Infinity)
    );
  }, [settings]);
  return {
    settings: orderedSettings,
    isLoading: resource.isLoading,
    error: resource.error,
    updateSetting,
    createSetting,
    deleteSetting,
    getSettingValue,
  };
}
