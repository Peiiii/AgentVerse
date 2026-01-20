import { SettingItem } from "@/common/types/settings";
import { useMemoizedFn } from "ahooks";
import { useMemo } from "react";
import { useSettingsStore } from "@/core/stores/settings.store";
import { usePresenter } from "@/core/presenter";

interface UseSettingsProps {
  onChange?: (settings: SettingItem[]) => void;
}

export function useSettings({ onChange }: UseSettingsProps = {}) {
  const presenter = usePresenter();
  const { data: settings = [], isLoading, error } = useSettingsStore();

  const updateSetting = useMemoizedFn(
    async (id: string, data: Partial<SettingItem>) => {
      const result = await presenter.settings.update(id, data);
      onChange?.(presenter.settings.getAll());
      return result;
    }
  );

  const createSetting = useMemoizedFn(async () => {
    // 简化后不支持动态创建，直接返回当前设置列表
    return settings;
  });

  const deleteSetting = useMemoizedFn(async () => {
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
    isLoading,
    error,
    updateSetting,
    createSetting,
    deleteSetting,
    getSettingValue,
  };
}
