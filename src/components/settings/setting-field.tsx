import PasswordInput from "@/components/settings/password-input";
import { SettingItem } from "@/common/types/settings";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

interface SettingFieldProps {
  setting: SettingItem;
  onChange: (value: unknown) => Promise<void>;
}

export function SettingField({ setting, onChange }: SettingFieldProps) {
  const renderField = () => {
    switch (setting.type) {
      case "text":
        return (
          <Input
            type={setting.type}
            value={setting.value as string}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "password":
        return (
          <PasswordInput value={setting.value as string} onChange={onChange} />
        );

      case "switch":
        return (
          <Switch
            checked={setting.value as boolean}
            onCheckedChange={onChange}
          />
        );

      case "select":
        return (
          <Select value={setting.value as string} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "number":
        return (
          <Input
            type="number"
            value={setting.value as number}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{setting.label}</label>
      </div>
      {setting.description && (
        <p className="text-sm text-muted-foreground">{setting.description}</p>
      )}
      <div className="mt-2">{renderField()}</div>
    </div>
  );
}
