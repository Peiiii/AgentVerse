import { cn } from "@/common/lib/utils";

export type RoleType = "moderator" | "participant";

interface RoleBadgeProps {
  role?: RoleType | string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function RoleBadge({
  role,
  size = "sm",
  className,
  showLabel = true,
}: RoleBadgeProps) {
  const getRoleConfig = (role?: string) => {
    switch (role) {
      case "moderator":
        return {
          label: "主持人",
        };
      case "participant":
        return {
          label: "参与者",
        };
      default:
        return {
          label: "智能体",
        };
    }
  };

  const roleConfig = getRoleConfig(role);

  const sizeClasses = {
    sm: {
      text: "text-xs",
    },
    md: {
      text: "text-sm",
    },
    lg: {
      text: "text-base",
    },
  };

  const sizeClass = sizeClasses[size];

  // 默认只显示纯文字，非常低调
  if (!showLabel || !role) {
    return null;
  }

  return (
    <span className={cn(
      sizeClass.text,
      "text-muted-foreground/60 font-normal",
      className
    )}>
      {roleConfig.label}
    </span>
  );
}

