import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { Settings2 } from "lucide-react";

interface DiscussionSettingsButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function DiscussionSettingsButton({
  isOpen,
  onClick,
  className
}: DiscussionSettingsButtonProps) {
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={onClick}
      className={cn(
        "shrink-0 transition-all",
        isOpen && "bg-accent text-accent-foreground rotate-180",
        className
      )}
      title="设置"
    >
      <Settings2 className="w-5 h-5" />
    </Button>
  );
} 