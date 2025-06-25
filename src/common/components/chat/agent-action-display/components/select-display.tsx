import { useEffect, useState } from "react";
import { Button } from "@/common/components/ui/button";
import { SelectDisplayProps } from "../types";
import { SelectOptionItem } from "./select-option";

export function SelectDisplay({
  options,
  multiple = false,
  defaultValue,
  onSelect,
  disabled
}: SelectDisplayProps) {
  const [selected, setSelected] = useState<string | string[]>(() => 
    defaultValue || (multiple ? [] : "")
  );

  // 只在组件初始化时设置默认值，而不是每次 defaultValue 变化都更新
  useEffect(() => {
    if (defaultValue !== undefined && !selected) {
      setSelected(defaultValue);
    }
  }, []); // 移除 defaultValue 依赖

  const handleSelect = (value: string) => {
    if (disabled) return;
    
    if (multiple) {
      setSelected(prev => {
        if (!Array.isArray(prev)) return [value];
        return prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value];
      });
    } else {
      setSelected(value);
      onSelect?.(value); // 单选时直接触发
    }
  };
  

  const handleConfirm = () => {
    if (disabled) return;
    if (!Array.isArray(selected) || selected.length === 0) return;
    onSelect?.(selected);
  };

  // 如果已经有选中值且组件被禁用，说明选择已经提交
  const isSubmitted = disabled && (
    (multiple && Array.isArray(selected) && selected.length > 0) ||
    (!multiple && selected)
  );

  return (
    <div className="space-y-2 mt-2">
      {options.map((option) => (
        <SelectOptionItem
          key={option.value}
          option={option}
          isSelected={
            Array.isArray(selected)
              ? selected.includes(option.value)
              : selected === option.value
          }
          isMultiple={multiple}
          disabled={disabled}
          onClick={() => handleSelect(option.value)}
        />
      ))}
      
      {multiple && !isSubmitted && (
        <Button 
          className="mt-2"
          onClick={handleConfirm}
          disabled={!Array.isArray(selected) || selected.length === 0}
        >
          确认选择 ({Array.isArray(selected) ? selected.length : 0})
        </Button>
      )}
    </div>
  );
} 