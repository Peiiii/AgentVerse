import { DiscussionSettings } from "@/common/types/discussion";
import { SettingSelect } from "./setting-select";
import { SettingSlider } from "./setting-slider";
import { SettingSwitch } from "./setting-switch";

type ModerationStyle = "strict" | "relaxed";

const MODERATION_STYLE_OPTIONS: Array<{
  value: ModerationStyle;
  label: string;
}> = [
  { value: "strict", label: "严格" },
  { value: "relaxed", label: "宽松" },
];

export interface DiscussionSettingsPanelProps {
  settings: DiscussionSettings;
  onSettingsChange: (settings: DiscussionSettings) => void;
}

export function DiscussionSettingsPanel({ settings, onSettingsChange }: DiscussionSettingsPanelProps) {
  const updateSetting = <K extends keyof DiscussionSettings>(
    key: K,
    value: DiscussionSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card/50 p-4">
      <div className="text-sm font-medium text-muted-foreground">讨论设置</div>

      <SettingSlider
        label="回复间隔"
        description="每个Agent之间的回复间隔时间"
        value={settings.interval / 1000}
        onChange={(value) => updateSetting("interval", value * 1000)}
        min={1}
        max={30}
        step={1}
        unit="s"
      />

      <SettingSlider
        label="随机性"
        description="回复内容的创造性和多样性"
        value={settings.temperature}
        onChange={(value) => updateSetting("temperature", value)}
        min={0}
        max={1}
        step={0.1}
        formatValue={(v) => v.toFixed(1)}
      />

      <div className="grid grid-cols-2 gap-4">
        <SettingSelect<ModerationStyle>
          label="主持风格"
          description="主持人引导讨论的方式"
          value={settings.moderationStyle}
          onChange={(value) => updateSetting("moderationStyle", value)}
          options={MODERATION_STYLE_OPTIONS}
        />

        <SettingSwitch
          label="允许冲突"
          description="是否允许参与者之间产生分歧"
          checked={settings.allowConflict}
          onCheckedChange={(checked) => updateSetting("allowConflict", checked)}
        />
      </div>
    </div>
  );
} 