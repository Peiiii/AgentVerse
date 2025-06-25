import { Label } from "@/components/ui/label";
import { ReactNode } from "react";
import { cn } from "@/common/lib/utils";

interface SettingItemProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  controlClassName?: string;
}

export function SettingItem({
  label,
  description,
  children,
  className,
  labelClassName,
  controlClassName
}: SettingItemProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className={cn("flex flex-col gap-1", labelClassName)}>
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={cn("flex items-center gap-2 min-w-[240px]", controlClassName)}>
        {children}
      </div>
    </div>
  );
} 