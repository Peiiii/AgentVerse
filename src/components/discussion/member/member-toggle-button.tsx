import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { cn } from "@/common/lib/utils";

interface MemberToggleButtonProps {
  onClick?: () => void;
  className?: string;
  showMemberCount?: boolean;
  memberCount?: number;
}

export function MemberToggleButton({
  onClick,
  className,
  showMemberCount = true,
  memberCount = 0
}: MemberToggleButtonProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-9 gap-2",
        className
      )}
    >
      <Users className="h-4 w-4" />
      {showMemberCount && (
        <span className="text-xs text-muted-foreground">
          {memberCount}
        </span>
      )}
    </Button>
  );
} 