import { useSettingCategories } from "@/core/hooks/useSettingCategories";
import { useSettings } from "@/core/hooks/useSettings";
import { useEffect, useMemo, useState } from "react";
import { SettingsList } from "./settings-list";
import { CategoryList } from "./category-list";
import { AUTO_FILL_STRATEGIES } from "@/core/config/settings-schema";
import { useTranslation } from "@/core/hooks/use-i18n";

export const SettingsPanel: React.FC = () => {
  const { t } = useTranslation();
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
            autoFillStrategies={AUTO_FILL_STRATEGIES}
            onUpdate={updateSetting}
          />
        ) : (
          <div className="text-center text-muted-foreground">
            {t("settings.selectCategory")}
          </div>
        )}
      </div>
    </div>
  );
};
