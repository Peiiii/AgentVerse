import PasswordInput from "@/common/features/settings/components/password-input";
import { SettingItem } from "@/common/types/settings";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Switch } from "@/common/components/ui/switch";
import type { ChangeEvent } from "react";

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
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.value)
            }
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
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(Number(event.target.value))
            }
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
