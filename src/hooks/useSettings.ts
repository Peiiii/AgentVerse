import { useResourceState } from "@/common/lib/resource";
import { settingsResource } from "@/core/resources/settings.resource";
import { settingsService } from "@/services/settings.service";
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
          settings.map((s) => (s.id === id ? { ...s, ...data } : s)),
        // API 调用
        () => settingsService.updateSetting(id, data)
      );
    }
  );

  const createSetting = useMemoizedFn(async (data: Omit<SettingItem, "id">) => {
    return withOptimisticUpdate(
      // 乐观更新
      (settings) => [...settings, { ...data, id: `temp-${Date.now()}` }],
      // API 调用
      () => settingsService.createSetting(data)
    );
  });

  const deleteSetting = useMemoizedFn(async (id: string) => {
    return withOptimisticUpdate(
      // 乐观更新
      (settings) => settings.filter((s) => s.id !== id),
      // API 调用
      () => settingsService.deleteSetting(id)
    );
  });

  const getSettingValue = useMemoizedFn(<T>(key: string): T | undefined => {
    const setting = settings.find((s) => s.key === key);
    return setting?.value as T;
  });

  const orderedSettings = useMemo(() => {
    return settings.sort(
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
