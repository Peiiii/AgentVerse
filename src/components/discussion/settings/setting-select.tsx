import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingItem } from "./setting-item";
import { cn } from "@/common/lib/utils";

export interface Option<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SettingSelectProps<T extends string = string> {
  label: string;
  description?: string;
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function SettingSelect<T extends string>({
  label,
  description,
  value,
  onChange,
  options,
  className,
  triggerClassName,
  disabled,
  placeholder
}: SettingSelectProps<T>) {
  return (
    <SettingItem 
      label={label} 
      description={description}
      className={className}
      controlClassName="min-w-[180px] w-[180px]"
    >
      <Select 
        value={value} 
        onValueChange={onChange as (value: string) => void}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-full", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingItem>
  );
} 