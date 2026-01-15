import { useResourceState } from "@/common/lib/resource";
import { settingsResource } from "@/core/resources/settings.resource";
import { useMemo } from "react";

export function useSettingCategories() {
  const { data: settingsByCategory } = useResourceState(
    settingsResource.byCategory
  );

  const categories = useMemo(() => {
    if (!settingsByCategory) return [];

    const labelMap = Object.fromEntries(
      settingsResource.categories.map((c) => [c.key, c.label])
    );

    return Object.keys(settingsByCategory)
      .map((key) => ({
        key,
        label: labelMap[key] || key,
        count: settingsByCategory[key].length,
      }))
      .sort(
        (a, b) =>
          (settingsResource.categories.find((c) => c.key === a.key)?.order ||
            Infinity) -
          (settingsResource.categories.find((c) => c.key === b.key)?.order ||
            Infinity)
      );
  }, [settingsByCategory]);

  return {
    categories,
    settingsByCategory
  };
} 
