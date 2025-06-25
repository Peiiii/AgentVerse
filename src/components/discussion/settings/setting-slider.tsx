import { Slider } from "@/components/ui/slider";
import { SettingItem } from "./setting-item";
import { cn } from "@/common/lib/utils";

export interface SettingSliderProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  formatValue?: (value: number) => string;
  className?: string;
  sliderClassName?: string;
  valueClassName?: string;
  disabled?: boolean;
  showValue?: boolean;
}

export function SettingSlider({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step,
  unit = "",
  formatValue = (v) => v.toString(),
  className,
  sliderClassName,
  valueClassName,
  disabled,
  showValue = true
}: SettingSliderProps) {
  const handleChange = (values: number[]) => {
    const newValue = values[0];
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <SettingItem 
      label={label} 
      description={description}
      className={className}
    >
      <Slider
        value={[value]}
        onValueChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn("flex-1", sliderClassName)}
      />
      {showValue && (
        <span className={cn("w-12 text-sm text-muted-foreground", valueClassName)}>
          {formatValue(value)}{unit}
        </span>
      )}
    </SettingItem>
  );
} 