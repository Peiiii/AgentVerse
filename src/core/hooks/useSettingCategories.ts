import { useMemo } from "react";
import { SETTINGS_CATEGORIES } from "@/core/config/settings-schema";
import { useSettingsStore } from "@/core/stores/settings.store";
import type { SettingItem } from "@/common/types/settings";

export function useSettingCategories() {
  const { data: settings } = useSettingsStore();

  const settingsByCategory = useMemo(() => {
    return settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, SettingItem[]>);
  }, [settings]);

  const categories = useMemo(() => {
    if (!settingsByCategory) return [];

    const labelMap = Object.fromEntries(
      SETTINGS_CATEGORIES.map((c) => [c.key, c.label])
    );

    return Object.keys(settingsByCategory)
      .map((key) => ({
        key,
        label: labelMap[key] || key,
        count: settingsByCategory[key].length,
      }))
      .sort(
        (a, b) =>
          (SETTINGS_CATEGORIES.find((c) => c.key === a.key)?.order ||
            Infinity) -
          (SETTINGS_CATEGORIES.find((c) => c.key === b.key)?.order ||
            Infinity)
      );
  }, [settingsByCategory]);

  return {
    categories,
    settingsByCategory,
  };
} 
