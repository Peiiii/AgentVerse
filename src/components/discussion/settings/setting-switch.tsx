import { Switch } from "@/components/ui/switch";
import { SettingItem } from "./setting-item";
import { cn } from "@/common/lib/utils";

export interface SettingSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  switchClassName?: string;
  disabled?: boolean;
  required?: boolean;
}

export function SettingSwitch({
  label,
  description,
  checked,
  onCheckedChange,
  className,
  switchClassName,
  disabled,
  required
}: SettingSwitchProps) {
  return (
    <SettingItem 
      label={label} 
      description={description}
      className={className}
    >
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        className={cn(switchClassName)}
      />
    </SettingItem>
  );
} 