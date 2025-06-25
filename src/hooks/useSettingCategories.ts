import { useResourceState } from "@/common/lib/resource";
import { settingsResource } from "@/resources/settings.resource";
import { useMemo } from "react";

export function useSettingCategories() {
  const { data: settingsByCategory } = useResourceState(
    settingsResource.byCategory
  );

  const categories = useMemo(() => {
    if (!settingsByCategory) return [];
    
    return Object.keys(settingsByCategory).map(key => ({
      key,
      label: key, // 可以后续添加标签映射
      count: settingsByCategory[key].length
    }));
  }, [settingsByCategory]);

  return {
    categories,
    settingsByCategory
  };
} 