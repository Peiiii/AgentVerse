import { AutoFillStrategy, SettingItem } from "@/common/types/settings";
import { SettingField } from "./setting-field";

interface SettingsListProps {
  settings: SettingItem[];
  autoFillStrategies?: AutoFillStrategy[];
  onUpdate: (id: string, data: Partial<SettingItem>) => Promise<unknown>;
}

export function SettingsList({
  settings,
  autoFillStrategies,
  onUpdate,
}: SettingsListProps) {
  return (
    <div className="space-y-6">
      {/* <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          部分配置修改后需要刷新页面才能生效
        </AlertDescription>
      </Alert> */}

      {settings.map((setting) => (
        <SettingField
          key={setting.id}
          setting={setting}
          onChange={async (value) => {
            await onUpdate(setting.id, { value });
            const autoFillStrategy = autoFillStrategies?.find(
              (strategy) =>
                strategy.settingKey === setting.key &&
                strategy.whenValueSatisfies === value
            );
            if (autoFillStrategy) {
              await Promise.all(
                autoFillStrategy.fillItems.map((item) =>
                  onUpdate(
                    settings.find((s) => s.key === item.settingKey)!.id,
                    {
                      value: item.value,
                    }
                  )
                )
              );
            }
          }}
        />
      ))}
    </div>
  );
}
