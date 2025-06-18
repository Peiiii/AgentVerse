import { useSettingCategories } from "@/hooks/useSettingCategories";
import { useSettings } from "@/hooks/useSettings";
import { useEffect, useMemo, useState } from "react";
import { SettingsList } from "./settings-list";
import { CategoryList } from "./category-list";
import { autoFillStrategies } from "@/resources/settings.resource";

export const SettingsPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>();
  const { categories } = useSettingCategories();
  const { updateSetting, settings } = useSettings();

  const currentSettings = useMemo(() => {
    return settings.filter((s) => s.category === activeCategory);
  }, [activeCategory, settings]);

  useEffect(() => {
    if (
      categories.length > 0 &&
      (!activeCategory || !categories.find((c) => c.key === activeCategory))
    ) {
      setActiveCategory(categories[0].key);
    }
  }, [activeCategory, categories]);

  return (
    <div className="flex flex-1 overflow-hidden  mt-6">
      <div className="w-1/4 md:w-1/3 lg:w-1/4 sm:w-24 border-r border-border bg-muted/30">
        <CategoryList
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {activeCategory ? (
          <SettingsList
            settings={currentSettings}
            autoFillStrategies={autoFillStrategies}
            onUpdate={updateSetting}
          />
        ) : (
          <div className="text-center text-muted-foreground">
            请选择设置分类
          </div>
        )}
      </div>
    </div>
  );
};
