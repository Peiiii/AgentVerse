import { cn } from "@/common/lib/utils";
import { SelectOption } from "../types";

interface SelectOptionItemProps {
  option: SelectOption;
  isSelected: boolean;
  isMultiple: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function SelectOptionItem({
  option,
  isSelected,
  isMultiple,
  disabled = false,
  onClick,
}: SelectOptionItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border transition-colors cursor-pointer",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-4 h-4 border flex items-center justify-center",
            isMultiple ? "rounded-sm" : "rounded-full",
            isSelected
              ? "border-blue-500 bg-blue-500"
              : "border-gray-300 dark:border-gray-600"
          )}
        >
          {isSelected && (
            <span className="text-white text-xs">✓</span>
          )}
        </div>
        <span className="font-medium">{option.label}</span>
      </div>
      {option.description && (
        <p className="mt-1 ml-6 text-sm text-gray-500 dark:text-gray-400">
          {option.description}
        </p>
      )}
    </div>
  );
} 